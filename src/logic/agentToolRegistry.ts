import type { AgentRecord } from '../types/town';
import {
  runCompetitorComparison,
  runDemandEvidenceAnalyzer,
  runMarginCalculator,
  runMineGuardScreening,
  runPortfolioRanking,
  runValidationPlan,
  type AgentDeterministicResult,
} from './agentDeterministicExecutors';
import { authorizeAgentCapability, getEnforcedCapabilities, type AgentCapability } from './agentPermissionEngine';

export interface AgentToolDefinition {
  id: string;
  name: string;
  targetV6Role: { id: string; name: string; building: string };
  allowedAgentId: string;
  allowedAgentName: string;
  requiredCapability: AgentCapability;
  missionType: 'MARGIN_ANALYSIS' | 'DEMAND_EVIDENCE_ANALYSIS' | 'COMPETITOR_DATA_ANALYSIS' | 'VALIDATION_PLAN' | 'PORTFOLIO_RANKING' | 'MINE_RISK_SCREENING';
  exampleMission: string;
  associatedTest: string;
  sideEffects: false;
  costEur: 0;
  execute: (agent: AgentRecord, taskId: string, mission: string, now?: string) => AgentDeterministicResult;
}

export const AGENT_TOOL_REGISTRY: AgentToolDefinition[] = [
  {
    id: 'centmine.mine-guard-screening.v1',
    name: 'Filtre de risques local MINE.GUARD',
    targetV6Role: { id: '16', name: 'MINE GUARD', building: 'AI.DEPTH.CENTMINE' },
    allowedAgentId: '38',
    allowedAgentName: 'MINE.GUARD',
    requiredCapability: 'LOCAL_CENTMINE_RISK_SCREENING',
    missionType: 'MINE_RISK_SCREENING',
    exampleMission: JSON.stringify({ opportunityName: 'Mission de test', sourceName: 'Page publique', sourceUrl: 'https://example.org/terms', observedAt: '2026-11-02', activityType: 'FREELANCE', payoutTermsProvided: true, platformRulesReviewed: true, accountCredentialsRequested: false, upfrontFeeRequired: false, guaranteedIncomeClaim: false, sensitiveDataRequested: false, prohibitedAutomationRequired: false, dataRightsClear: true }, null, 2),
    associatedTest: 'agentTools.test.ts::mine guard blocks red flags and never declares legal approval',
    sideEffects: false,
    costEur: 0,
    execute: runMineGuardScreening,
  },
  {
    id: 'opportunity.demand-evidence.v1',
    name: 'Analyse locale de signaux de demande fournis',
    targetV6Role: { id: '80', name: 'DEMAND.SCOUT', building: 'OPPORTUNITY.LAB' },
    allowedAgentId: '71',
    allowedAgentName: 'SCOUT.AI',
    requiredCapability: 'LOCAL_DEMAND_EVIDENCE_ANALYSIS',
    missionType: 'DEMAND_EVIDENCE_ANALYSIS',
    exampleMission: JSON.stringify({ sources: [{ sourceName: 'Source publique', url: 'https://example.org/rapport', observedAt: '2026-11-02', signal: 'Exemple de signal documenté à remplacer par vos données', strength: 3 }] }, null, 2),
    associatedTest: 'agentTools.test.ts::demand evidence tool preserves provenance and never claims live verification',
    sideEffects: false,
    costEur: 0,
    execute: runDemandEvidenceAnalyzer,
  },
  {
    id: 'opportunity.competitor-comparison.v1',
    name: 'Comparaison locale de concurrents fournis',
    targetV6Role: { id: '81', name: 'COMPETITOR.ANALYST', building: 'OPPORTUNITY.LAB' },
    allowedAgentId: '75',
    allowedAgentName: 'NICHE.DRILLER',
    requiredCapability: 'LOCAL_COMPETITOR_DATA_ANALYSIS',
    missionType: 'COMPETITOR_DATA_ANALYSIS',
    exampleMission: JSON.stringify({ competitors: [{ name: 'Concurrent A', sourceUrl: 'https://example.org/offre-a', observedAt: '2026-11-02', priceEur: 19, features: ['Export CSV', 'Mode équipe'] }, { name: 'Concurrent B', sourceUrl: 'https://example.org/offre-b', observedAt: '2026-11-02', priceEur: 25, features: ['Export CSV'] }] }, null, 2),
    associatedTest: 'agentTools.test.ts::competitor comparison calls omissions potential listing gaps, not confirmed feature absence',
    sideEffects: false,
    costEur: 0,
    execute: runCompetitorComparison,
  },
  {
    id: 'opportunity.margin-calculator.v1',
    name: 'Calculateur de marge déterministe local',
    targetV6Role: { id: '82', name: 'MARGIN.CALCULATOR', building: 'OPPORTUNITY.LAB' },
    allowedAgentId: '73',
    allowedAgentName: 'MARGIN.PREDICTOR',
    requiredCapability: 'LOCAL_MARGIN_CALCULATION',
    missionType: 'MARGIN_ANALYSIS',
    exampleMission: JSON.stringify({ unitPriceEur: 29, variableCostPerUnitEur: 4.75, fixedCostsEur: 100, plannedUnits: 10 }, null, 2),
    associatedTest: 'agentTools.test.ts::margin calculator returns reproducible scenario values and zero confirmed revenue',
    sideEffects: false,
    costEur: 0,
    execute: runMarginCalculator,
  },
  {
    id: 'opportunity.validation-plan.v1',
    name: 'Préparation locale de plan de validation',
    targetV6Role: { id: '83', name: 'VALIDATION.AGENT', building: 'OPPORTUNITY.LAB' },
    allowedAgentId: '76',
    allowedAgentName: 'PROTOTYPE.TRIGGER',
    requiredCapability: 'LOCAL_VALIDATION_PLANNING',
    missionType: 'VALIDATION_PLAN',
    exampleMission: JSON.stringify({ hypothesis: 'Des indépendants paieraient pour automatiser cette tâche', targetAudience: 'Indépendants francophones', method: 'INTERVIEWS', maxBudgetEur: 0, timeboxDays: 7, minimumResponses: 8 }, null, 2),
    associatedTest: 'agentTools.test.ts::validation planner creates a plan without executing tests, spending or contacting people',
    sideEffects: false,
    costEur: 0,
    execute: runValidationPlan,
  },
  {
    id: 'opportunity.portfolio-ranking.v1',
    name: 'Classement local des opportunités saisies',
    targetV6Role: { id: '84', name: 'PORTFOLIO.MANAGER', building: 'OPPORTUNITY.LAB' },
    allowedAgentId: '74',
    allowedAgentName: 'REVENUE.ENGINE',
    requiredCapability: 'LOCAL_PORTFOLIO_RANKING',
    missionType: 'PORTFOLIO_RANKING',
    exampleMission: JSON.stringify({ opportunities: [{ id: 'idee-1', name: 'Outil numérique', sourceCount: 3, deliveryReadinessPercent: 60, riskLevel: 2, unitPriceEur: 29, variableCostPerUnitEur: 5, fixedCostsEur: 100, plannedUnits: 10 }] }, null, 2),
    associatedTest: 'agentTools.test.ts::portfolio ranking uses a disclosed hypothesis score and zero confirmed revenue',
    sideEffects: false,
    costEur: 0,
    execute: runPortfolioRanking,
  },
];

export function getAgentTools(agent: AgentRecord): AgentToolDefinition[] {
  return AGENT_TOOL_REGISTRY.filter(tool =>
    tool.allowedAgentId === agent.id
    && tool.allowedAgentName === agent.name
    && authorizeAgentCapability(agent, tool.requiredCapability),
  );
}

export function getAgentExecutionMode(agent: AgentRecord): 'DETERMINISTIC' | 'PROPOSAL_ONLY' | 'UNAVAILABLE' {
  if (getAgentTools(agent).length > 0) return 'DETERMINISTIC';
  return agent.type === 'TYPE_B_SERVICE' ? 'UNAVAILABLE' : 'PROPOSAL_ONLY';
}

export function getAgentEnforcedCapabilities(agent: AgentRecord): AgentCapability[] {
  return getEnforcedCapabilities(agent);
}

export function executeRegisteredAgentTool(
  agent: AgentRecord,
  toolId: string,
  taskId: string,
  mission: string,
  now?: string,
): AgentDeterministicResult {
  const tool = getAgentTools(agent).find(candidate => candidate.id === toolId);
  if (!tool) throw new Error('Aucun outil autorisé n’est enregistré pour ce profil.');
  return tool.execute(agent, taskId, mission, now);
}
