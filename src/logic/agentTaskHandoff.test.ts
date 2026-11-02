import assert from 'node:assert/strict';
import test from 'node:test';
import { AGENT_REGISTRY } from '../data/agentRegistry';
import { buildLocalAgentExecutionContext } from './agentExecutionContext';
import {
  createAgentTask,
  claimNextAgentTask,
  recordAgentDeterministicResult,
  recordAgentPublicOpportunityResult,
  reviewAgentResult,
} from './agentTaskEngine';
import { executeRegisteredAgentTool, getAgentTools } from './agentToolRegistry';
import { buildBoampNoticeUrl } from './agentPublicOpportunity';
import { createCEOAssignmentHandoffDraft, createGoldAnalystHandoffDraft, requireCEOAssignmentInputs } from './agentTaskHandoff';
import { isAgentTask, loadAgentTasks, saveAgentTasks, type AgentTaskStorage } from './agentTaskStorage';

const FIXED_NOW = '2026-11-02T12:00:00.000Z';

function reviewedProspectorTask() {
  const agent = AGENT_REGISTRY.find(candidate => candidate.id === '39')!;
  const queued = createAgentTask(agent, JSON.stringify({ keywords: 'services numériques' }), { id: 'prospector-source', now: FIXED_NOW });
  const running = claimNextAgentTask([queued], FIXED_NOW, false).claimedTask!;
  const received = recordAgentPublicOpportunityResult(running, {
    requestId: 'boamp-request-1',
    agentId: '39',
    agentName: 'MINER.PRIME',
    toolId: 'centmine.prospector-boamp-search.v1',
    createdAt: FIXED_NOW,
    durationMs: 12,
    output: 'Une piste publique a été trouvée; aucune candidature envoyée.',
    resultKind: 'REMOTE_READ_ONLY_RESULT',
    externalActionExecuted: false,
    data: {
      dataKind: 'BOAMP_PUBLIC_TENDER_SEARCH',
      sourceName: 'BOAMP',
      sourceUrl: 'https://www.boamp.fr/explore/dataset/boamp/',
      verificationState: 'SOURCE_FETCHED_ELIGIBILITY_UNVERIFIED',
      apiAccessChargeEur: 0,
      hostingAndBandwidthCostMeasured: false,
      keywords: 'services numériques',
      fetchedAt: FIXED_NOW,
      totalMatchedCount: 1,
      recordsInspected: 1,
      excludedNotOpenOrInvalid: 0,
      omittedInspectedBeyondDisplayLimit: 0,
      opportunities: [{
        noticeId: '26-12345',
        title: 'Création et maintenance d’un outil numérique',
        publishedAt: '2026-11-01T00:00:00.000Z',
        deadlineAt: '2026-12-01T12:00:00.000Z',
        contractType: 'Services',
        sourceUrl: buildBoampNoticeUrl('26-12345'),
      }],
    },
  }, FIXED_NOW);
  return reviewAgentResult(received, 'REVIEWED', '', FIXED_NOW);
}

function reviewedCEOTask() {
  const agent = AGENT_REGISTRY.find(candidate => candidate.id === '06')!;
  const tool = getAgentTools(agent)[0];
  const mission = tool.exampleMission;
  const queued = createAgentTask(agent, mission, { id: 'ceo-source', now: FIXED_NOW });
  const running = claimNextAgentTask([queued], FIXED_NOW, false).claimedTask!;
  const result = executeRegisteredAgentTool(agent, tool.id, running.id, running.mission, FIXED_NOW, buildLocalAgentExecutionContext([running]));
  const received = recordAgentDeterministicResult(running, result, FIXED_NOW);
  return reviewAgentResult(received, 'REVIEWED', '', FIXED_NOW);
}

test('Gold Analyst handoff requires a reviewed public result and leaves every financial assumption blank', () => {
  const source = reviewedProspectorTask();
  const draft = createGoldAnalystHandoffDraft(source, '26-12345');
  const mission = JSON.parse(draft.mission);
  assert.equal(draft.sourceTaskId, source.id);
  assert.equal(draft.sourceAgentName, 'MINER.PRIME');
  assert.equal(draft.targetAgentName, 'ORE.REFINER');
  assert.equal(draft.notice.sourceUrl, buildBoampNoticeUrl('26-12345'));
  assert.equal(mission.opportunityName, draft.notice.title);
  assert.equal(mission.boampNoticeId, draft.notice.noticeId);
  assert.equal(mission.estimatedContractRevenueEur, null);
  assert.equal(mission.estimatedDeliveryCostEur, null);
  assert.equal(mission.estimatedBidPreparationCostEur, null);
  assert.equal(mission.estimatedOtherFeesEur, null);
  assert.equal(mission.riskReservePercent, null);
  assert.throws(() => createGoldAnalystHandoffDraft({ ...source, status: 'WAITING_REVIEW' }, '26-12345'), /déjà relue/);
  assert.throws(() => createGoldAnalystHandoffDraft(source, '26-99999'), /ne fait pas partie/);
  assert.throws(() => createGoldAnalystHandoffDraft({ ...source, agentId: '38' }, '26-12345'), /déjà relue/);
});

test('CEO handoff requires a reviewed local plan and preserves user-input gates and target-tool binding', () => {
  const source = reviewedCEOTask();
  const draft = createCEOAssignmentHandoffDraft(source, '71');
  assert.equal(draft.sourceTaskId, source.id);
  assert.equal(draft.sourceAgentName, 'DIRECTOR.GENCY');
  assert.equal(draft.targetAgentName, 'SCOUT.AI');
  assert.equal(draft.targetV6RoleName, 'DEMAND.SCOUT');
  assert.equal(draft.missionType, 'DEMAND_EVIDENCE_ANALYSIS');
  assert.equal(draft.toolId, 'opportunity.demand-evidence.v1');
  assert.ok(draft.requiredInputs.some(input => input.includes('sources publiques')));
  assert.throws(() => requireCEOAssignmentInputs(draft, JSON.stringify({ sources: [] })), /manquants ou vides/);
  const suppliedMission = JSON.stringify({ sources: [{
    sourceName: 'Source fournie par la personne', url: 'https://example.org/demande',
    observedAt: '2026-11-02', signal: 'Signal fourni pour le dossier de test', strength: 3,
  }] });
  assert.doesNotThrow(() => requireCEOAssignmentInputs(draft, suppliedMission));
  assert.throws(() => createCEOAssignmentHandoffDraft({ ...source, status: 'WAITING_REVIEW' }, '71'), /déjà relu/);
  assert.throws(() => createCEOAssignmentHandoffDraft(source, '72'), /n’est pas ouverte/);

  const target = AGENT_REGISTRY.find(candidate => candidate.id === draft.targetAgentId)!;
  const child = createAgentTask(target, suppliedMission, {
    id: 'ceo-child', parentTaskId: draft.sourceTaskId, now: FIXED_NOW, priority: draft.priority,
  });
  assert.equal(child.parentTaskId, source.id);
  assert.equal(child.connectedTools[0], draft.toolId);
  const values = new Map<string, string>();
  const storage: AgentTaskStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); } };
  assert.equal(saveAgentTasks([source, child], storage), true);
});

test('agent tasks persist a bounded parentTaskId to retain a human-mediated handoff link', () => {
  const agent = AGENT_REGISTRY.find(candidate => candidate.id === '41')!;
  const source = reviewedProspectorTask();
  const draft = createGoldAnalystHandoffDraft(source, '26-12345');
  const task = createAgentTask(agent, draft.mission, { id: 'gold-child', parentTaskId: draft.sourceTaskId, now: FIXED_NOW });
  assert.equal(task.parentTaskId, source.id);
  assert.equal(isAgentTask(task), true);
  assert.equal(isAgentTask({ ...task, parentTaskId: 'x'.repeat(101) }), false);
  assert.throws(() => createAgentTask(agent, draft.mission, { id: 'gold-invalid-link', parentTaskId: 'x'.repeat(101), now: FIXED_NOW }), /source invalide/);

  const values = new Map<string, string>();
  const storage: AgentTaskStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); } };
  assert.equal(saveAgentTasks([source, task], storage), true);
  assert.equal(loadAgentTasks(storage)[1].parentTaskId, source.id);
});
