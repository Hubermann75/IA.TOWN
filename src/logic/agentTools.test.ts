import assert from 'node:assert/strict';
import test from 'node:test';
import { AGENT_REGISTRY } from '../data/agentRegistry';
import {
  calculateMarginScenario,
  parseMarginCalculationInput,
  runCompetitorComparison,
  runDemandEvidenceAnalyzer,
  runMarginCalculator,
  runMineGuardScreening,
  runPortfolioRanking,
  runValidationPlan,
} from './agentDeterministicExecutors';
import { authorizeAgentCapability } from './agentPermissionEngine';
import { executeRegisteredAgentTool, getAgentExecutionMode, getAgentTools, AGENT_TOOL_REGISTRY } from './agentToolRegistry';
import { createAgentTask, claimNextAgentTask, recordAgentDeterministicResult, buildAgentRuntimeDefinition } from './agentTaskEngine';
import { loadAgentTasks, saveAgentTasks, type AgentTaskStorage } from './agentTaskStorage';

const marginAgent = AGENT_REGISTRY.find(agent => agent.name === 'MARGIN.PREDICTOR')!;
const mission = JSON.stringify({
  unitPriceEur: 29,
  variableCostPerUnitEur: 4.75,
  fixedCostsEur: 100,
  plannedUnits: 10,
});

test('margin role has exactly one local deterministic tool behind an explicit runtime grant', () => {
  assert.equal(getAgentExecutionMode(marginAgent), 'DETERMINISTIC');
  assert.equal(getAgentTools(marginAgent).length, 1);
  assert.equal(getAgentTools(marginAgent)[0].sideEffects, false);
  assert.equal(getAgentTools(marginAgent)[0].costEur, 0);
  assert.deepEqual(getAgentTools(marginAgent)[0].targetV6Role, { id: '82', name: 'MARGIN.CALCULATOR', building: 'OPPORTUNITY.LAB' });
  assert.equal(authorizeAgentCapability(marginAgent, 'LOCAL_MARGIN_CALCULATION'), true);

  const copiedProfile = { ...marginAgent, name: 'UNREGISTERED.AGENT' };
  assert.equal(authorizeAgentCapability(copiedProfile, 'LOCAL_MARGIN_CALCULATION'), false);
  assert.equal(getAgentTools(copiedProfile).length, 0);
  assert.equal(getAgentTools({ ...marginAgent, id: '71' }).length, 0);
});

test('margin input is strict JSON with bounded finite values', () => {
  assert.deepEqual(parseMarginCalculationInput(mission), {
    unitPriceEur: 29,
    variableCostPerUnitEur: 4.75,
    fixedCostsEur: 100,
    plannedUnits: 10,
  });
  assert.throws(() => parseMarginCalculationInput('not json'));
  assert.throws(() => parseMarginCalculationInput(JSON.stringify({ ...JSON.parse(mission), execute: 'rm -rf' })));
  assert.throws(() => parseMarginCalculationInput(JSON.stringify({ ...JSON.parse(mission), plannedUnits: 1.5 })));
  assert.throws(() => parseMarginCalculationInput(JSON.stringify({ ...JSON.parse(mission), unitPriceEur: Number.POSITIVE_INFINITY })));
  assert.throws(() => parseMarginCalculationInput(JSON.stringify({ ...JSON.parse(mission), unitPriceEur: 0.001 })), /0,01/);
});

test('margin calculator returns reproducible scenario values and zero confirmed revenue', () => {
  const data = calculateMarginScenario(parseMarginCalculationInput(mission));
  assert.equal(data.contributionPerUnitEur, 24.25);
  assert.equal(data.breakEvenUnits, 5);
  assert.equal(data.projectedRevenueEur, 290);
  assert.equal(data.projectedTotalCostsEur, 147.5);
  assert.equal(data.projectedOperatingResultEur, 142.5);
  assert.equal(data.confirmedRevenueEur, 0);

  const result = runMarginCalculator(marginAgent, 'task-margin-1', mission, '2026-11-02T12:00:00.000Z');
  assert.equal(result.resultKind, 'DETERMINISTIC_RESULT');
  assert.equal(result.externalActionExecuted, false);
  assert.match(result.output, /ne prouvent aucune vente ni aucun encaissement/);
});

test('registered tool cannot be invoked under another profile or tool identifier', () => {
  assert.throws(() => executeRegisteredAgentTool(marginAgent, 'unknown.tool', 'task-x', mission));
  assert.throws(() => executeRegisteredAgentTool({ ...marginAgent, name: 'OTHER' }, 'opportunity.margin-calculator.v1', 'task-x', mission));
});

test('the five V6 OPPORTUNITY.LAB targets have one role-bound local tool each', () => {
  const opportunityTools = AGENT_TOOL_REGISTRY.filter(tool => tool.targetV6Role.building === 'OPPORTUNITY.LAB');
  assert.deepEqual(opportunityTools.map(tool => tool.targetV6Role).sort((a, b) => a.id.localeCompare(b.id)), [
    { id: '80', name: 'DEMAND.SCOUT', building: 'OPPORTUNITY.LAB' },
    { id: '81', name: 'COMPETITOR.ANALYST', building: 'OPPORTUNITY.LAB' },
    { id: '82', name: 'MARGIN.CALCULATOR', building: 'OPPORTUNITY.LAB' },
    { id: '83', name: 'VALIDATION.AGENT', building: 'OPPORTUNITY.LAB' },
    { id: '84', name: 'PORTFOLIO.MANAGER', building: 'OPPORTUNITY.LAB' },
  ]);
  assert.equal(opportunityTools.length, 5);
  assert.equal(new Set(AGENT_TOOL_REGISTRY.map(tool => tool.allowedAgentId)).size, AGENT_TOOL_REGISTRY.length);
  for (const tool of AGENT_TOOL_REGISTRY) {
    const agent = AGENT_REGISTRY.find(candidate => candidate.id === tool.allowedAgentId)!;
    assert.equal(getAgentExecutionMode(agent), 'DETERMINISTIC');
    assert.equal(getAgentTools(agent).length, 1);
    assert.deepEqual(buildAgentRuntimeDefinition(agent).associatedTests, [tool.associatedTest]);
    assert.equal(tool.sideEffects, false);
    assert.equal(tool.costEur, 0);
  }
});

test('demand evidence tool preserves provenance and never claims live verification', () => {
  const agent = AGENT_REGISTRY.find(candidate => candidate.id === '71')!;
  const result = runDemandEvidenceAnalyzer(agent, 'demand-1', JSON.stringify({ sources: [
    { sourceName: 'Forum public', url: 'https://example.org/post', observedAt: '2026-11-01', signal: 'Plusieurs personnes demandent cette fonction', strength: 4 },
    { sourceName: 'Étude publique', url: 'https://example.net/study', observedAt: '2026-10-30', signal: 'Besoin mentionné dans les réponses', strength: 3 },
  ] }), '2026-11-02T12:00:00.000Z');
  assert.equal(result.toolId, 'opportunity.demand-evidence.v1');
  assert.equal(result.data.dataKind, 'DEMAND_EVIDENCE');
  assert.equal(result.data.verificationState, 'USER_SUPPLIED_NOT_VERIFIED');
  assert.equal(result.data.averageUserSignalStrength, 3.5);
  assert.match(result.output, /n’ont pas été vérifiés en ligne/);
  assert.equal(result.externalActionExecuted, false);
  assert.throws(() => runDemandEvidenceAnalyzer(agent, 'bad', JSON.stringify({ sources: [
    { sourceName: 'Local', url: 'http://127.0.0.1/admin', observedAt: '2026-11-01', signal: 'x', strength: 4 },
  ] })));
});

test('competitor comparison calls omissions potential listing gaps, not confirmed feature absence', () => {
  const agent = AGENT_REGISTRY.find(candidate => candidate.id === '75')!;
  const result = runCompetitorComparison(agent, 'competitors-1', JSON.stringify({ competitors: [
    { name: 'Concurrent A', sourceUrl: 'https://example.org/a', observedAt: '2026-11-01', priceEur: 19, features: ['Export CSV', 'Mode équipe'] },
    { name: 'Concurrent B', sourceUrl: 'https://example.org/b', observedAt: '2026-11-01', priceEur: 25, features: ['Export CSV'] },
  ] }), '2026-11-02T12:00:00.000Z');
  assert.equal(result.data.dataKind, 'COMPETITOR_COMPARISON');
  assert.deepEqual(result.data.potentialListingGaps, ['Mode équipe']);
  assert.deepEqual(result.data.priceRangeEur, { min: 19, max: 25 });
  assert.match(result.output, /une absence de mention ne prouve pas une absence de fonction/);
});

test('validation planner creates a plan without executing tests, spending or contacting people', () => {
  const agent = AGENT_REGISTRY.find(candidate => candidate.id === '76')!;
  const result = runValidationPlan(agent, 'validation-1', JSON.stringify({
    hypothesis: 'Les petites équipes veulent automatiser leurs exports',
    targetAudience: 'Équipes de 2 à 10 personnes',
    method: 'INTERVIEWS',
    maxBudgetEur: 0,
    timeboxDays: 7,
    minimumResponses: 5,
  }), '2026-11-02T12:00:00.000Z');
  assert.equal(result.data.dataKind, 'VALIDATION_PLAN');
  assert.equal(result.data.executionState, 'PLAN_ONLY_NOT_EXECUTED');
  assert.equal(result.externalActionExecuted, false);
  assert.match(result.output, /aucun test, achat, campagne ou contact n’a été exécuté/);
});

test('portfolio ranking uses a disclosed hypothesis score and zero confirmed revenue', () => {
  const agent = AGENT_REGISTRY.find(candidate => candidate.id === '74')!;
  const base = { deliveryReadinessPercent: 50, riskLevel: 2, unitPriceEur: 29, variableCostPerUnitEur: 5, fixedCostsEur: 100, plannedUnits: 10 };
  const result = runPortfolioRanking(agent, 'portfolio-1', JSON.stringify({ opportunities: [
    { ...base, id: 'low-evidence', name: 'Piste A', sourceCount: 1 },
    { ...base, id: 'high-evidence', name: 'Piste B', sourceCount: 5 },
  ] }), '2026-11-02T12:00:00.000Z');
  assert.equal(result.data.dataKind, 'PORTFOLIO_RANKING');
  assert.equal(result.data.ranking[0].id, 'high-evidence');
  assert.equal(result.data.confirmedRevenueEur, 0);
  assert.match(result.data.scoreFormula, /pas probabilité de succès/);
  assert.match(result.output, /Aucune vente, dépense ou écriture bancaire n’a été réalisée/);
});

test('mine guard blocks red flags and never declares legal approval', () => {
  const agent = AGENT_REGISTRY.find(candidate => candidate.id === '38')!;
  const base = {
    opportunityName: 'Mission distante',
    sourceName: 'Page de conditions',
    sourceUrl: 'https://example.org/terms',
    observedAt: '2026-11-02',
    activityType: 'FREELANCE',
    payoutTermsProvided: true,
    platformRulesReviewed: true,
    accountCredentialsRequested: false,
    upfrontFeeRequired: false,
    guaranteedIncomeClaim: false,
    sensitiveDataRequested: false,
    prohibitedAutomationRequired: false,
    dataRightsClear: true,
  };
  const clear = runMineGuardScreening(agent, 'guard-clear', JSON.stringify(base), '2026-11-02T12:00:00.000Z');
  assert.equal(clear.data.dataKind, 'MINE_RISK_SCREENING');
  assert.equal(clear.data.screeningStatus, 'NO_RED_FLAGS_RESEARCH_ONLY');
  assert.equal(clear.data.evidenceState, 'USER_SUPPLIED_UNVERIFIED');
  assert.match(clear.output, /ni un avis juridique, ni une autorisation/);

  const blocked = runMineGuardScreening(agent, 'guard-block', JSON.stringify({ ...base, accountCredentialsRequested: true, upfrontFeeRequired: true }), '2026-11-02T12:00:00.000Z');
  assert.equal(blocked.data.dataKind, 'MINE_RISK_SCREENING');
  assert.equal(blocked.data.screeningStatus, 'BLOCKED');
  assert.equal(blocked.data.redFlags.length, 2);
  assert.equal(blocked.data.platformActionExecuted, false);
  assert.equal(blocked.data.financialActionExecuted, false);

  const review = runMineGuardScreening(agent, 'guard-review', JSON.stringify({ ...base, platformRulesReviewed: false, dataRightsClear: false }), '2026-11-02T12:00:00.000Z');
  assert.equal(review.data.dataKind, 'MINE_RISK_SCREENING');
  assert.equal(review.data.screeningStatus, 'REVIEW_REQUIRED');
  assert.equal(review.data.reviewItems.length, 2);
  assert.throws(() => runMineGuardScreening({ ...agent, id: '39' }, 'guard-forged', JSON.stringify(base)));
  assert.throws(() => runMineGuardScreening(agent, 'guard-invalid', JSON.stringify({ ...base, automated: 'yes' })));
});

test('all registered local tools execute through the queue and their results survive storage validation', () => {
  const values = new Map<string, string>();
  const storage: AgentTaskStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
  };
  for (const [index, tool] of AGENT_TOOL_REGISTRY.entries()) {
    const agent = AGENT_REGISTRY.find(candidate => candidate.id === tool.allowedAgentId)!;
    const task = createAgentTask(agent, tool.exampleMission, { id: `opportunity-task-${index}`, now: '2026-11-02T12:00:00.000Z' });
    const running = claimNextAgentTask([task], '2026-11-02T12:00:01.000Z').claimedTask!;
    const result = executeRegisteredAgentTool(agent, tool.id, running.id, running.mission, '2026-11-02T12:00:02.000Z');
    const waitingReview = recordAgentDeterministicResult(running, result, '2026-11-02T12:00:02.000Z');
    assert.equal(saveAgentTasks([waitingReview], storage), true, tool.id);
    assert.equal(loadAgentTasks(storage)[0].result?.resultKind, 'DETERMINISTIC_RESULT', tool.id);
  }
});
