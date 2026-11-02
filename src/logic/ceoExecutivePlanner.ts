import type {
  AgentExecutionAgentSnapshot,
  AgentExecutionContext,
  AgentExecutionTaskSnapshot,
} from './agentExecutionContext';

export interface CEOExecutiveAssignment {
  order: number;
  targetV6RoleId: string;
  targetV6RoleName: string;
  agentId: string;
  agentName: string;
  buildingId: string;
  buildingName: string;
  missionType: string;
  priority: 'HIGH' | 'NORMAL';
  dependsOn: string[];
  purpose: string;
  requiredInputs: string[];
  currentVisualState: AgentExecutionAgentSnapshot['visualState'];
  executionMode: AgentExecutionAgentSnapshot['executionMode'];
  connectedToolIds: string[];
  dispatchState: 'WAITING_FOR_USER_INPUT' | 'AGENT_BUSY' | 'AGENT_ERROR' | 'NO_EXECUTOR';
  dispatchedTaskId: null;
}

export interface CEOExecutivePlanData {
  dataKind: 'CEO_EXECUTIVE_PLAN';
  targetV6Role: { id: '01'; name: 'CEO.AGENT'; building: 'AI.GENCY' };
  legacyProfile: { id: '06'; name: 'DIRECTOR.GENCY' };
  objective: string;
  maximumSpendEur: number;
  providerUsed: 'LOCAL_DETERMINISTIC';
  aiProviderCalled: false;
  snapshotSource: 'LOCAL_AGENT_REGISTRY_AND_BROWSER_TASK_QUEUE';
  agentCount: 94;
  buildingCount: 16;
  agentSnapshot: AgentExecutionAgentSnapshot[];
  buildingSnapshot: AgentExecutionContext['buildings'];
  observedTasks: AgentExecutionTaskSnapshot[];
  monitoringSummary: {
    queued: number;
    running: number;
    awaitingReview: number;
    failed: number;
    reviewedResults: number;
  };
  assignments: CEOExecutiveAssignment[];
  dispatchedTaskIds: [];
  identifiedOpportunityCount: 0;
  confirmedRevenueEur: 0;
  warnings: string[];
}

export interface CEOExecutiveObjectiveInput {
  objective: string;
  maximumSpendEur: number;
}

const TARGET_ASSIGNMENTS = [
  {
    targetV6RoleId: '80', targetV6RoleName: 'DEMAND.SCOUT', agentId: '71', agentName: 'SCOUT.AI',
    missionType: 'DEMAND_EVIDENCE_ANALYSIS', priority: 'HIGH' as const, dependsOn: [],
    purpose: 'Examiner les signaux documentés de demande du public visé.',
    requiredInputs: ['1 à 10 sources publiques avec URL', 'Date d’observation de chaque source', 'Signal observé et force évaluée par la personne'],
  },
  {
    targetV6RoleId: '81', targetV6RoleName: 'COMPETITOR.ANALYST', agentId: '75', agentName: 'NICHE.DRILLER',
    missionType: 'COMPETITOR_DATA_ANALYSIS', priority: 'NORMAL' as const, dependsOn: ['80'],
    purpose: 'Comparer les offres concurrentes documentées sans assimiler une absence de mention à une absence de fonction.',
    requiredInputs: ['1 à 10 fiches concurrentes observées', 'URL et date d’observation par fiche', 'Prix et fonctions listées lorsqu’ils sont connus'],
  },
  {
    targetV6RoleId: '83', targetV6RoleName: 'VALIDATION.AGENT', agentId: '76', agentName: 'PROTOTYPE.TRIGGER',
    missionType: 'VALIDATION_PLAN', priority: 'HIGH' as const, dependsOn: ['80'],
    purpose: 'Préparer une validation de la demande, sans lancer de campagne ni contacter de personne.',
    requiredInputs: ['Hypothèse de besoin', 'Public visé', 'Méthode et durée', 'Plafond de dépenses proposé (0 € pour la mission sans dépense)'],
  },
  {
    targetV6RoleId: '82', targetV6RoleName: 'MARGIN.CALCULATOR', agentId: '73', agentName: 'MARGIN.PREDICTOR',
    missionType: 'MARGIN_ANALYSIS', priority: 'HIGH' as const, dependsOn: ['80'],
    purpose: 'Calculer un scénario de prix, coûts, seuil de rentabilité et marge à partir d’hypothèses saisies.',
    requiredInputs: ['Prix unitaire proposé', 'Coût variable unitaire', 'Coûts fixes', 'Volume envisagé'],
  },
  {
    targetV6RoleId: '84', targetV6RoleName: 'PORTFOLIO.MANAGER', agentId: '74', agentName: 'REVENUE.ENGINE',
    missionType: 'PORTFOLIO_RANKING', priority: 'NORMAL' as const, dependsOn: ['80', '81', '82', '83'],
    purpose: 'Classer les hypothèses de produit selon les données fournies; le score ne prédit pas le succès.',
    requiredInputs: ['Au moins une piste nommée', 'Nombre et provenance des signaux', 'Maturité de livraison', 'Risque et hypothèses de prix/coûts'],
  },
];

export function parseCEOExecutiveObjective(raw: string): CEOExecutiveObjectiveInput {
  if (raw.length > 2_000) throw new Error('La mission CEO dépasse la limite de 2 000 caractères.');
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('La mission CEO doit être un JSON avec objective et maximumSpendEur.');
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('La mission CEO doit être un objet JSON.');
  }
  const record = parsed as Record<string, unknown>;
  if (Object.keys(record).length !== 2 || !Object.hasOwn(record, 'objective') || !Object.hasOwn(record, 'maximumSpendEur')) {
    throw new Error('La mission CEO accepte uniquement objective et maximumSpendEur.');
  }
  if (typeof record.objective !== 'string' || record.objective.trim().length < 8 || record.objective.trim().length > 500) {
    throw new Error('objective doit contenir entre 8 et 500 caractères.');
  }
  if (typeof record.maximumSpendEur !== 'number' || !Number.isFinite(record.maximumSpendEur)
    || record.maximumSpendEur < 0 || record.maximumSpendEur > 100_000) {
    throw new Error('maximumSpendEur doit être compris entre 0 et 100 000 €.');
  }
  return {
    objective: record.objective.trim().replace(/\s+/g, ' '),
    maximumSpendEur: Number(record.maximumSpendEur.toFixed(2)),
  };
}

function validateRuntimeContext(context: AgentExecutionContext): void {
  if (context.source !== 'LOCAL_AGENT_REGISTRY_AND_BROWSER_TASK_QUEUE'
    || context.agents.length !== 94 || new Set(context.agents.map(agent => agent.id)).size !== 94
    || context.buildings.length !== 16 || new Set(context.buildings.map(building => building.id)).size !== 16
    || context.tasks.length > 200) {
    throw new Error('Le snapshot du registre local ou de la file de missions est incomplet.');
  }
  if (context.agents.some(agent => !/^\d{2}$/.test(agent.id) || !agent.name || !agent.buildingName
    || !Array.isArray(agent.connectedToolIds) || !agent.connectedToolIds.every(toolId => typeof toolId === 'string'))) {
    throw new Error('Le snapshot contient un profil agent invalide.');
  }
}

function getDispatchState(agent: AgentExecutionAgentSnapshot): CEOExecutiveAssignment['dispatchState'] {
  if (agent.executionMode === 'UNAVAILABLE' || agent.connectedToolIds.length === 0) return 'NO_EXECUTOR';
  if (agent.visualState === 'ERROR') return 'AGENT_ERROR';
  if (agent.visualState === 'WORKING' || agent.visualState === 'QUEUED') return 'AGENT_BUSY';
  return 'WAITING_FOR_USER_INPUT';
}

export function prepareCEOExecutivePlan(
  input: CEOExecutiveObjectiveInput,
  context: AgentExecutionContext,
  currentTaskId: string,
): CEOExecutivePlanData {
  validateRuntimeContext(context);
  const assignments = TARGET_ASSIGNMENTS.map((target, index): CEOExecutiveAssignment => {
    const agent = context.agents.find(candidate => candidate.id === target.agentId && candidate.name === target.agentName);
    if (!agent) throw new Error(`Le profil requis ${target.agentName} est absent du registre.`);
    return {
      order: index + 1,
      targetV6RoleId: target.targetV6RoleId,
      targetV6RoleName: target.targetV6RoleName,
      agentId: agent.id,
      agentName: agent.name,
      buildingId: agent.buildingId,
      buildingName: agent.buildingName,
      missionType: target.missionType,
      priority: target.priority,
      dependsOn: [...target.dependsOn],
      purpose: target.purpose,
      requiredInputs: [...target.requiredInputs],
      currentVisualState: agent.visualState,
      executionMode: agent.executionMode,
      connectedToolIds: [...agent.connectedToolIds],
      dispatchState: getDispatchState(agent),
      dispatchedTaskId: null,
    };
  });
  const observedTasks = context.tasks.filter(task => task.id !== currentTaskId);
  const monitoringSummary = {
    queued: observedTasks.filter(task => task.status === 'QUEUED').length,
    running: observedTasks.filter(task => task.status === 'RUNNING').length,
    awaitingReview: observedTasks.filter(task => task.status === 'WAITING_REVIEW').length,
    failed: observedTasks.filter(task => task.status === 'FAILED').length,
    reviewedResults: observedTasks.filter(task => task.status === 'REVIEWED' && !!task.resultKind).length,
  };
  return {
    dataKind: 'CEO_EXECUTIVE_PLAN',
    targetV6Role: { id: '01', name: 'CEO.AGENT', building: 'AI.GENCY' },
    legacyProfile: { id: '06', name: 'DIRECTOR.GENCY' },
    objective: input.objective,
    maximumSpendEur: input.maximumSpendEur,
    providerUsed: 'LOCAL_DETERMINISTIC',
    aiProviderCalled: false,
    snapshotSource: context.source,
    agentCount: 94,
    buildingCount: 16,
    agentSnapshot: context.agents.map(agent => ({ ...agent, connectedToolIds: [...agent.connectedToolIds] })),
    buildingSnapshot: context.buildings.map(building => ({ ...building })),
    observedTasks,
    monitoringSummary,
    assignments,
    dispatchedTaskIds: [],
    identifiedOpportunityCount: 0,
    confirmedRevenueEur: 0,
    warnings: [
      'Les états reflètent uniquement le registre local et l’historique de file du navigateur; aucun processus agent distant n’est sondé.',
      'Les cinq missions sont des plans préparatoires. Aucune n’a été envoyée à un agent tant que ses données sources et hypothèses ne sont pas fournies.',
      'Aucune opportunité rentable n’a été confirmée et le revenu encaissé demeure à 0 €.',
      'Le plan local n’a consommé aucun fournisseur IA. Gemini ne sera sollicité que sur demande explicite; son coût en euros n’est pas mesuré par IA TOWN.',
    ],
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

const VISUAL_STATES = new Set(['INACTIVE', 'QUEUED', 'WORKING', 'WAITING_REVIEW', 'ERROR']);
const EXECUTION_MODES = new Set(['DETERMINISTIC', 'REMOTE_READ_ONLY', 'PROPOSAL_ONLY', 'UNAVAILABLE']);
const TASK_STATUSES = new Set(['QUEUED', 'RUNNING', 'WAITING_REVIEW', 'REVIEWED', 'DISMISSED', 'FAILED', 'CANCELLED']);

export function isCEOExecutivePlanData(value: unknown): value is CEOExecutivePlanData {
  if (!isPlainObject(value) || value.dataKind !== 'CEO_EXECUTIVE_PLAN'
    || !isPlainObject(value.targetV6Role) || value.targetV6Role.id !== '01' || value.targetV6Role.name !== 'CEO.AGENT' || value.targetV6Role.building !== 'AI.GENCY'
    || !isPlainObject(value.legacyProfile) || value.legacyProfile.id !== '06' || value.legacyProfile.name !== 'DIRECTOR.GENCY'
    || typeof value.objective !== 'string' || value.objective.length < 8 || value.objective.length > 500
    || typeof value.maximumSpendEur !== 'number' || !Number.isFinite(value.maximumSpendEur) || value.maximumSpendEur < 0 || value.maximumSpendEur > 100_000
    || value.providerUsed !== 'LOCAL_DETERMINISTIC' || value.aiProviderCalled !== false
    || value.snapshotSource !== 'LOCAL_AGENT_REGISTRY_AND_BROWSER_TASK_QUEUE'
    || value.agentCount !== 94 || value.buildingCount !== 16
    || !Array.isArray(value.agentSnapshot) || value.agentSnapshot.length !== 94
    || !Array.isArray(value.buildingSnapshot) || value.buildingSnapshot.length !== 16
    || !Array.isArray(value.observedTasks) || value.observedTasks.length > 200
    || !isPlainObject(value.monitoringSummary) || !Array.isArray(value.assignments) || value.assignments.length !== 5
    || !Array.isArray(value.dispatchedTaskIds) || value.dispatchedTaskIds.length !== 0
    || value.identifiedOpportunityCount !== 0 || value.confirmedRevenueEur !== 0
    || !Array.isArray(value.warnings) || value.warnings.length < 3 || !value.warnings.every(item => typeof item === 'string')) return false;
  const agents = value.agentSnapshot;
  if (!agents.every(agent => isPlainObject(agent) && typeof agent.id === 'string' && /^\d{2}$/.test(agent.id)
    && typeof agent.name === 'string' && typeof agent.buildingId === 'string' && typeof agent.buildingName === 'string'
    && ['TYPE_A_IA', 'TYPE_B_SERVICE', 'TYPE_C_HYBRID'].includes(String(agent.type))
    && EXECUTION_MODES.has(String(agent.executionMode)) && VISUAL_STATES.has(String(agent.visualState))
    && Array.isArray(agent.connectedToolIds) && agent.connectedToolIds.every(toolId => typeof toolId === 'string'))
    || new Set(agents.map(agent => isPlainObject(agent) ? agent.id : '')).size !== 94) return false;
  const buildings = value.buildingSnapshot;
  if (!buildings.every(building => isPlainObject(building) && typeof building.id === 'string' && typeof building.name === 'string'
    && Number.isInteger(building.agentCount) && Number(building.agentCount) >= 0)
    || new Set(buildings.map(building => isPlainObject(building) ? building.id : '')).size !== 16) return false;
  if (!value.observedTasks.every(task => isPlainObject(task) && typeof task.id === 'string' && typeof task.agentId === 'string'
    && typeof task.agentName === 'string' && TASK_STATUSES.has(String(task.status)) && typeof task.updatedAt === 'string'
    && Number.isFinite(Date.parse(String(task.updatedAt)))
    && (task.resultKind === undefined || ['PROPOSAL', 'DETERMINISTIC_RESULT', 'REMOTE_READ_ONLY_RESULT'].includes(String(task.resultKind)))
    && (task.resultDataKind === undefined || typeof task.resultDataKind === 'string'))) return false;
  const summary = value.monitoringSummary;
  if (!['queued', 'running', 'awaitingReview', 'failed', 'reviewedResults'].every(key => Number.isInteger(summary[key]) && Number(summary[key]) >= 0)) return false;
  return value.assignments.every((assignment, index) => isPlainObject(assignment)
    && assignment.order === index + 1 && typeof assignment.targetV6RoleId === 'string' && typeof assignment.targetV6RoleName === 'string'
    && typeof assignment.agentId === 'string' && typeof assignment.agentName === 'string'
    && typeof assignment.buildingId === 'string' && typeof assignment.buildingName === 'string' && typeof assignment.missionType === 'string'
    && ['HIGH', 'NORMAL'].includes(String(assignment.priority)) && Array.isArray(assignment.dependsOn) && assignment.dependsOn.every(item => typeof item === 'string')
    && typeof assignment.purpose === 'string' && Array.isArray(assignment.requiredInputs) && assignment.requiredInputs.length > 0 && assignment.requiredInputs.every(item => typeof item === 'string')
    && VISUAL_STATES.has(String(assignment.currentVisualState)) && EXECUTION_MODES.has(String(assignment.executionMode))
    && Array.isArray(assignment.connectedToolIds) && assignment.connectedToolIds.every(item => typeof item === 'string')
    && ['WAITING_FOR_USER_INPUT', 'AGENT_BUSY', 'AGENT_ERROR', 'NO_EXECUTOR'].includes(String(assignment.dispatchState))
    && assignment.dispatchedTaskId === null);
}
