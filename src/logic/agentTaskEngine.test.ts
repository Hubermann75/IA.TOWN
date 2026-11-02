import assert from 'node:assert/strict';
import test from 'node:test';
import type { AgentRecord } from '../types/town';
import type { AgentTaskProposal } from './agentRuntimeClient';
import { AGENT_REGISTRY } from '../data/agentRegistry';
import { AGENT_RUNTIME_REGISTRY, validateAgentRuntimeRegistry } from '../data/agentRuntimeRegistry';
import { runMarginCalculator } from './agentDeterministicExecutors';
import {
  buildAgentRuntimeDefinition,
  cancelQueuedAgentTask,
  claimNextAgentTask,
  createAgentTask,
  enqueueAgentTask,
  failAgentTask,
  recordAgentDeterministicResult,
  recordAgentProposal,
  recoverInterruptedAgentTasks,
  retryFailedAgentTask,
  reviewAgentResult,
} from './agentTaskEngine';
import { loadAgentTasks, readAgentTaskStore, saveAgentTasks, type AgentTaskStorage } from './agentTaskStorage';

const FIXED_NOW = '2026-11-02T10:00:00.000Z';

function makeAgent(id = '02', type: AgentRecord['type'] = 'TYPE_A_IA'): AgentRecord {
  return {
    id,
    numericId: Number(id),
    name: `TEST.AGENT.${id}`,
    buildingId: 'ARE_IA_CENTER',
    buildingName: 'ARE.IA.CENTER',
    profession: 'Agent de test',
    type,
    tools: ['Recherche déclarée'],
    permissions: ['READ_PUBLIC_DATA'],
    status: 'ACTIF',
    currentMission: 'Réaliser une proposition de test',
    completedMissionsCount: 0,
    metrics: { requestsHandled: 0, successRate: 0, totalCostEur: 0, avgExecutionTimeMs: 0 },
    avatarColor: '#ffffff',
    description: 'Profil synthétique de test.',
    history: [],
  };
}

function proposal(agentId = '02'): AgentTaskProposal {
  return {
    requestId: 'request-1',
    agentId,
    agentName: `TEST.AGENT.${agentId}`,
    provider: 'gemini',
    model: 'test-model',
    createdAt: FIXED_NOW,
    durationMs: 12,
    output: 'Proposition de test, à vérifier par une personne.',
    resultKind: 'PROPOSAL',
    externalActionExecuted: false,
  };
}

function memoryStorage(): AgentTaskStorage {
  const values = new Map<string, string>();
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
  };
}

test('runtime profile separates declared tools and permissions from connected capabilities', () => {
  const profile = buildAgentRuntimeDefinition(makeAgent());
  assert.deepEqual(profile.toolsAvailable, [{ name: 'Recherche déclarée', connected: false }]);
  assert.deepEqual(profile.permissions, { declared: ['READ_PUBLIC_DATA'], enforced: [] });
  assert.equal(profile.budgetMaxEur, null);
  assert.deepEqual(profile.acceptedMissions, ['TEXT_PROPOSAL']);
  assert.deepEqual(profile.associatedTests, []);
  assert.equal(profile.dependenciesVerified, false);
  assert.equal(profile.budgetState, 'UNCONFIGURED');
});

test('normalized runtime registry covers 94 unique legacy profiles and only lists registered capabilities', () => {
  assert.equal(AGENT_RUNTIME_REGISTRY.length, 94);
  assert.equal(new Set(AGENT_RUNTIME_REGISTRY.map(agent => agent.id)).size, 94);
  assert.deepEqual(validateAgentRuntimeRegistry(), { valid: true, issues: [] });
  assert.equal(AGENT_RUNTIME_REGISTRY.filter(agent => agent.executionMode === 'PROPOSAL_ONLY').length, 36);
  assert.equal(AGENT_RUNTIME_REGISTRY.filter(agent => agent.executionMode === 'DETERMINISTIC').length, 6);
  assert.equal(AGENT_RUNTIME_REGISTRY.filter(agent => agent.executionMode === 'UNAVAILABLE').length, 52);
});

test('task creation rejects empty missions and queues unsupported service roles without claiming them', () => {
  assert.throws(() => createAgentTask(makeAgent(), '   ', { id: 'task-1', now: FIXED_NOW }));
  const unsupported = createAgentTask(makeAgent('08', 'TYPE_B_SERVICE'), 'Mission à traiter plus tard', { id: 'task-2', now: FIXED_NOW });
  assert.equal(unsupported.executionMode, 'UNAVAILABLE');
  assert.equal(claimNextAgentTask([unsupported], FIXED_NOW).claimedTask, null);
});

test('queue claims the highest priority task first and tracks attempts', () => {
  const low = createAgentTask(makeAgent('02'), 'Priorité basse', { id: 'low', now: FIXED_NOW, priority: 'LOW' });
  const urgent = createAgentTask(makeAgent('03', 'TYPE_C_HYBRID'), 'Priorité haute', { id: 'urgent', now: FIXED_NOW, priority: 'URGENT' });
  const unsupported = createAgentTask(makeAgent('08', 'TYPE_B_SERVICE'), 'Pas d’exécuteur', { id: 'service', now: FIXED_NOW, priority: 'URGENT' });
  const queued = enqueueAgentTask(enqueueAgentTask(enqueueAgentTask([], low), urgent), unsupported);
  const claimed = claimNextAgentTask(queued, FIXED_NOW);
  assert.equal(claimed.claimedTask?.id, 'urgent');
  assert.equal(claimed.claimedTask?.status, 'RUNNING');
  assert.equal(claimed.claimedTask?.attempts, 1);
  assert.equal(claimed.tasks.find(task => task.id === 'low')?.status, 'QUEUED');
});

test('proposal lifecycle requires review and never records an external action', () => {
  const created = createAgentTask(makeAgent(), 'Analyser un besoin documenté', { id: 'task-3', now: FIXED_NOW });
  const running = claimNextAgentTask([created], FIXED_NOW).claimedTask!;
  const waiting = recordAgentProposal(running, proposal(), FIXED_NOW);
  assert.equal(waiting.status, 'WAITING_REVIEW');
  assert.equal(waiting.result?.externalActionExecuted, false);
  const reviewed = reviewAgentResult(waiting, 'REVIEWED', 'Vérification manuelle', FIXED_NOW);
  assert.equal(reviewed.status, 'REVIEWED');
  assert.match(reviewed.history.at(-1)?.message ?? '', /Aucune action autorisée ou exécutée/);
  assert.throws(() => recordAgentProposal(
    waiting,
    { ...proposal(), externalActionExecuted: true } as unknown as AgentTaskProposal,
    FIXED_NOW,
  ));
});

test('deterministic margin task executes locally and persists a result awaiting review', () => {
  const agent = AGENT_REGISTRY.find(candidate => candidate.name === 'MARGIN.PREDICTOR')!;
  const mission = JSON.stringify({ unitPriceEur: 29, variableCostPerUnitEur: 4.75, fixedCostsEur: 100, plannedUnits: 10 });
  const queued = createAgentTask(agent, mission, { id: 'task-margin', now: FIXED_NOW });
  assert.equal(queued.executionMode, 'DETERMINISTIC');
  assert.deepEqual(queued.connectedTools, ['opportunity.margin-calculator.v1']);
  const running = claimNextAgentTask([queued], FIXED_NOW).claimedTask!;
  const result = runMarginCalculator(agent, running.id, running.mission, FIXED_NOW);
  const waiting = recordAgentDeterministicResult(running, result, FIXED_NOW);
  assert.equal(waiting.status, 'WAITING_REVIEW');
  assert.equal(waiting.result?.resultKind, 'DETERMINISTIC_RESULT');
  assert.equal(waiting.result?.externalActionExecuted, false);
});

test('failed tasks can be retried and queued tasks can be cancelled', () => {
  const created = createAgentTask(makeAgent(), 'Mission réessayable', { id: 'task-4', now: FIXED_NOW });
  const running = claimNextAgentTask([created], FIXED_NOW).claimedTask!;
  const failed = failAgentTask(running, 'Fournisseur indisponible', FIXED_NOW);
  const queuedAgain = retryFailedAgentTask(failed, FIXED_NOW);
  assert.equal(queuedAgain.status, 'QUEUED');
  const cancelled = cancelQueuedAgentTask(queuedAgain, FIXED_NOW);
  assert.equal(cancelled.status, 'CANCELLED');
});

test('manual retries stop at the configured attempt ceiling', () => {
  let task = createAgentTask(makeAgent(), 'Mission avec limite', { id: 'task-retry-limit', now: FIXED_NOW });
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const running = claimNextAgentTask([task], FIXED_NOW).claimedTask!;
    task = failAgentTask(running, `Échec ${attempt}`, FIXED_NOW);
    if (attempt < 5) task = retryFailedAgentTask(task, FIXED_NOW);
  }
  assert.equal(task.attempts, 5);
  assert.throws(() => retryFailedAgentTask(task, FIXED_NOW), /Limite de 5 tentatives/);
});

test('an interrupted running task is recorded as failed without an automatic retry', () => {
  const created = createAgentTask(makeAgent(), 'Mission interrompue', { id: 'task-6', now: FIXED_NOW });
  const running = claimNextAgentTask([created], FIXED_NOW).claimedTask!;
  const recovered = recoverInterruptedAgentTasks([running], FIXED_NOW)[0];
  assert.equal(recovered.status, 'FAILED');
  assert.equal(recovered.attempts, 1);
  assert.match(recovered.error ?? '', /Aucune relance automatique/);
});

test('task history round-trips and rejects invalid or over-capacity state', () => {
  const storage = memoryStorage();
  const task = createAgentTask(makeAgent(), 'Mission conservée', { id: 'task-5', now: FIXED_NOW });
  assert.equal(saveAgentTasks([task], storage), true);
  assert.deepEqual(loadAgentTasks(storage), [task]);
  assert.equal(saveAgentTasks([{ ...task, connectedTools: ['unexpected'] }], storage), false);
  assert.equal(saveAgentTasks([task, task], storage), false);

  const brokenStorage: AgentTaskStorage = {
    getItem: () => '{broken',
    setItem: () => { throw new Error('quota'); },
  };
  assert.deepEqual(loadAgentTasks(brokenStorage), []);
  assert.equal(readAgentTaskStore(brokenStorage).writable, false);
  assert.match(readAgentTaskStore(brokenStorage).warning ?? '', /laissé intact/);
  assert.equal(saveAgentTasks([task], brokenStorage), false);
});
