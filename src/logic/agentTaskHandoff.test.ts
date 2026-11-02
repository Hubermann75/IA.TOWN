import assert from 'node:assert/strict';
import test from 'node:test';
import { AGENT_REGISTRY } from '../data/agentRegistry';
import {
  createAgentTask,
  claimNextAgentTask,
  recordAgentPublicOpportunityResult,
  reviewAgentResult,
} from './agentTaskEngine';
import { buildBoampNoticeUrl } from './agentPublicOpportunity';
import { createGoldAnalystHandoffDraft } from './agentTaskHandoff';
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
