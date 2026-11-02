import assert from 'node:assert/strict';
import test from 'node:test';
import { AGENT_REGISTRY } from '../data/agentRegistry';
import { runCEOExecutivePlanner } from './agentDeterministicExecutors';
import { buildLocalAgentExecutionContext, type AgentExecutionContext } from './agentExecutionContext';
import { getEnforcedCapabilities } from './agentPermissionEngine';
import { isCEOExecutivePlanData, parseCEOExecutiveObjective } from './ceoExecutivePlanner';

const FIXED_NOW = '2026-11-02T12:00:00.000Z';
const mission = JSON.stringify({
  objective: 'Organiser une mission pour identifier une opportunité de produit numérique rentable, sans engager de dépenses.',
  maximumSpendEur: 0,
});

test('CEO objective parser accepts bounded JSON and rejects extra or spending-control fields', () => {
  assert.deepEqual(parseCEOExecutiveObjective(mission), {
    objective: 'Organiser une mission pour identifier une opportunité de produit numérique rentable, sans engager de dépenses.',
    maximumSpendEur: 0,
  });
  assert.throws(() => parseCEOExecutiveObjective('objectif texte libre'), /JSON/);
  assert.throws(() => parseCEOExecutiveObjective(JSON.stringify({ objective: 'objectif suffisamment long', maximumSpendEur: 0, approvePayment: true })), /uniquement/);
  assert.throws(() => parseCEOExecutiveObjective(JSON.stringify({ objective: 'objectif suffisamment long', maximumSpendEur: -1 })), /compris/);
});

test('CEO plan inspects the live registry and prepares only input-blocked, non-spending missions', () => {
  const director = AGENT_REGISTRY.find(agent => agent.id === '06')!;
  const result = runCEOExecutivePlanner(director, 'ceo-plan-1', mission, FIXED_NOW, buildLocalAgentExecutionContext([]));
  assert.equal(result.agentName, 'DIRECTOR.GENCY');
  assert.equal(result.toolId, 'ai-gency.ceo-executive-planning.v1');
  assert.equal(result.data.dataKind, 'CEO_EXECUTIVE_PLAN');
  if (result.data.dataKind !== 'CEO_EXECUTIVE_PLAN') throw new Error('CEO plan result type expected.');
  assert.deepEqual(result.data.targetV6Role, { id: '01', name: 'CEO.AGENT', building: 'AI.GENCY' });
  assert.equal(result.data.agentCount, 94);
  assert.equal(result.data.buildingCount, 16);
  assert.equal(result.data.assignments.length, 5);
  assert.ok(result.data.assignments.every(assignment => assignment.dispatchState === 'WAITING_FOR_USER_INPUT'));
  assert.deepEqual(result.data.dispatchedTaskIds, []);
  assert.equal(result.data.identifiedOpportunityCount, 0);
  assert.equal(result.data.confirmedRevenueEur, 0);
  assert.equal(result.data.aiProviderCalled, false);
  assert.match(result.output, /envoi au planificateur : 0/);
  assert.match(result.output, /aucune piste économique n’est encore identifiée/);
  assert.equal(result.externalActionExecuted, false);
  assert.equal(isCEOExecutivePlanData(result.data), true);
  const enforced = getEnforcedCapabilities(director);
  assert.deepEqual(enforced, ['LOCAL_EXECUTIVE_MISSION_PLANNING']);
  assert.equal(enforced.some(capability => String(capability) === 'APPROVE_BUDGET'), false);
  assert.equal(enforced.some(capability => String(capability) === 'SIGN_PROPOSALS'), false);
});

test('CEO planner reports queued and failed agent states and refuses incomplete snapshots or forged profiles', () => {
  const director = AGENT_REGISTRY.find(agent => agent.id === '06')!;
  const context: AgentExecutionContext = buildLocalAgentExecutionContext([]);
  context.agents = context.agents.map(agent => agent.id === '71'
    ? { ...agent, visualState: 'WORKING' }
    : agent.id === '75'
      ? { ...agent, executionMode: 'UNAVAILABLE', connectedToolIds: [] }
      : agent);
  context.tasks = [
    { id: 'task-q', agentId: '71', agentName: 'SCOUT.AI', status: 'QUEUED', updatedAt: FIXED_NOW },
    { id: 'task-f', agentId: '75', agentName: 'NICHE.DRILLER', status: 'FAILED', updatedAt: FIXED_NOW },
  ];
  const result = runCEOExecutivePlanner(director, 'ceo-plan-2', mission, FIXED_NOW, context);
  assert.equal(result.data.dataKind, 'CEO_EXECUTIVE_PLAN');
  if (result.data.dataKind !== 'CEO_EXECUTIVE_PLAN') throw new Error('CEO plan result type expected.');
  assert.equal(result.data.assignments[0].dispatchState, 'AGENT_BUSY');
  assert.equal(result.data.assignments[1].dispatchState, 'NO_EXECUTOR');
  assert.deepEqual(result.data.monitoringSummary, { queued: 1, running: 0, awaitingReview: 0, failed: 1, reviewedResults: 0 });
  assert.throws(() => runCEOExecutivePlanner({ ...director, id: '07' }, 'ceo-forged', mission, FIXED_NOW, context), /Permission refusée/);
  assert.throws(() => runCEOExecutivePlanner(director, 'ceo-no-snapshot', mission, FIXED_NOW), /snapshot/);
  assert.throws(() => runCEOExecutivePlanner(director, 'ceo-short-snapshot', mission, FIXED_NOW, { ...context, agents: context.agents.slice(1) }), /incomplet/);
});
