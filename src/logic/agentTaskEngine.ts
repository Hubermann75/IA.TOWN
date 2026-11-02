/**
 * Local, auditable lifecycle for IA TOWN agent proposals.
 * This engine does not execute external tools or financial actions.
 */

import type { AgentRecord } from '../types/town';
import type { AgentTaskProposal } from './agentRuntimeClient';
import type { AgentDeterministicResult } from './agentDeterministicExecutors';
import { isAgentPublicOpportunityResult, type AgentPublicOpportunityResult } from './agentPublicOpportunity';
import { getAgentEnforcedCapabilities, getAgentExecutionMode, getAgentTools } from './agentToolRegistry';
import { parseCEOExecutiveObjective } from './ceoExecutivePlanner';

export const MAX_AGENT_MISSION_LENGTH = 2_000;
export const MAX_AGENT_TASKS = 200;
export const MAX_AGENT_TASK_EVENTS = 100;
export const MAX_AGENT_TASK_ATTEMPTS = 5;
export const MAX_AGENT_TASK_ERROR_LENGTH = 1_000;

export type AgentTaskPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type AgentTaskStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'WAITING_REVIEW'
  | 'REVIEWED'
  | 'DISMISSED'
  | 'FAILED'
  | 'CANCELLED';

export type AgentVisualState =
  | 'INACTIVE'
  | 'QUEUED'
  | 'WORKING'
  | 'WAITING_REVIEW'
  | 'ERROR';
export type AgentExecutionMode = 'DETERMINISTIC' | 'REMOTE_READ_ONLY' | 'PROPOSAL_ONLY' | 'UNAVAILABLE';
export type AgentTaskResult = AgentTaskProposal | AgentDeterministicResult | AgentPublicOpportunityResult;

export interface AgentRuntimeDefinition {
  id: string;
  name: string;
  buildingId: string;
  building: string;
  description: string;
  objective: string;
  type: AgentRecord['type'];
  executionMode: AgentExecutionMode;
  skills: string[];
  toolsAvailable: Array<{ name: string; connected: boolean; toolId?: string }>;
  permissions: { declared: string[]; enforced: string[] };
  model?: { provider: 'gemini'; mode: 'PROPOSAL_ONLY' };
  acceptedMissions: Array<'TEXT_PROPOSAL' | 'MARGIN_ANALYSIS' | 'DEMAND_EVIDENCE_ANALYSIS' | 'COMPETITOR_DATA_ANALYSIS' | 'VALIDATION_PLAN' | 'PORTFOLIO_RANKING' | 'MINE_RISK_SCREENING' | 'PUBLIC_OPPORTUNITY_SEARCH' | 'GOLD_OPPORTUNITY_ANALYSIS' | 'EXECUTIVE_MISSION_PLANNING'>;
  dependencies: string[];
  dependenciesVerified: false;
  budgetMaxEur: number | null;
  budgetState: 'CONFIGURED_LOCAL_ONLY' | 'CONFIGURED_FREE_PUBLIC_SOURCE' | 'UNCONFIGURED';
  definitionState: 'LEGACY_CATALOG_ADAPTER';
  executionState: 'IDLE';
  history: Array<{ timestamp: string; event: string }>;
  results: AgentTaskResult[];
  errorHandling: string;
  visualState: AgentVisualState;
  associatedTests: string[];
}

export interface AgentTaskEvent {
  timestamp: string;
  actor: 'SYSTEM' | 'PROVIDER' | 'USER';
  from?: AgentTaskStatus;
  to: AgentTaskStatus;
  message: string;
}

export interface AgentTask {
  id: string;
  parentTaskId?: string;
  agentId: string;
  agentName: string;
  building: string;
  agentType: AgentRecord['type'];
  executionMode: AgentExecutionMode;
  mission: string;
  priority: AgentTaskPriority;
  status: AgentTaskStatus;
  createdAt: string;
  updatedAt: string;
  deadlineAt?: string;
  attempts: number;
  budgetMaxEur: number | null;
  providerCostEur: number | null;
  declaredTools: string[];
  declaredPermissions: string[];
  connectedTools: string[];
  result?: AgentTaskResult;
  error?: string;
  history: AgentTaskEvent[];
}

export interface CreateAgentTaskOptions {
  id?: string;
  parentTaskId?: string;
  now?: string;
  priority?: AgentTaskPriority;
  deadlineAt?: string;
  executionModeOverride?: 'PROPOSAL_ONLY';
}

const PRIORITY_RANK: Record<AgentTaskPriority, number> = {
  LOW: 0,
  NORMAL: 1,
  HIGH: 2,
  URGENT: 3,
};

function createId(): string {
  if (!globalThis.crypto?.randomUUID) {
    throw new Error('La génération d’identifiant sécurisé n’est pas disponible.');
  }
  return globalThis.crypto.randomUUID();
}

function isValidTimestamp(value: string): boolean {
  return Number.isFinite(Date.parse(value));
}

export function buildAgentRuntimeDefinition(agent: AgentRecord): AgentRuntimeDefinition {
  const executionMode = getAgentExecutionMode(agent);
  const connectedTools = getAgentTools(agent);
  const acceptedMissions: AgentRuntimeDefinition['acceptedMissions'] = [
    ...(executionMode === 'PROPOSAL_ONLY' || agent.id === '06' ? ['TEXT_PROPOSAL' as const] : []),
    ...connectedTools.map(tool => tool.missionType),
  ];
  return {
    id: agent.id,
    name: agent.name,
    buildingId: agent.buildingId,
    building: agent.buildingName,
    description: agent.description,
    objective: agent.currentMission,
    type: agent.type,
    executionMode,
    skills: [agent.profession],
    toolsAvailable: [
      ...agent.tools.map(name => ({ name, connected: false })),
      ...connectedTools.map(tool => ({ name: tool.name, toolId: tool.id, connected: true })),
    ],
    permissions: {
      declared: [...agent.permissions],
      enforced: getAgentEnforcedCapabilities(agent),
    },
    ...(executionMode === 'PROPOSAL_ONLY' || agent.id === '06' ? { model: { provider: 'gemini' as const, mode: 'PROPOSAL_ONLY' as const } } : {}),
    acceptedMissions,
    dependencies: [],
    dependenciesVerified: false,
    budgetMaxEur: executionMode === 'DETERMINISTIC' || executionMode === 'REMOTE_READ_ONLY' ? 0 : null,
    budgetState: executionMode === 'DETERMINISTIC'
      ? 'CONFIGURED_LOCAL_ONLY'
      : executionMode === 'REMOTE_READ_ONLY'
        ? 'CONFIGURED_FREE_PUBLIC_SOURCE'
        : 'UNCONFIGURED',
    definitionState: 'LEGACY_CATALOG_ADAPTER',
    executionState: 'IDLE',
    history: [],
    results: [],
    errorHandling: 'Les erreurs restent attachées à la mission; aucune relance ou action externe automatique.',
    visualState: 'INACTIVE',
    associatedTests: connectedTools.map(tool => tool.associatedTest),
  };
}

export function createAgentTask(
  agent: AgentRecord,
  missionInput: string,
  options: CreateAgentTaskOptions = {},
): AgentTask {
  const mission = missionInput.trim();
  if (!mission || mission.length > MAX_AGENT_MISSION_LENGTH) {
    throw new Error(`La mission doit contenir entre 1 et ${MAX_AGENT_MISSION_LENGTH} caractères.`);
  }
  const now = options.now ?? new Date().toISOString();
  if (!isValidTimestamp(now)) throw new Error('Horodatage de création invalide.');
  if (options.deadlineAt && !isValidTimestamp(options.deadlineAt)) {
    throw new Error('Échéance invalide.');
  }

  const id = options.id ?? createId();
  if (!id.trim()) throw new Error('Identifiant de mission invalide.');
  if (options.parentTaskId !== undefined && (!options.parentTaskId.trim() || options.parentTaskId.length > 100)) {
    throw new Error('Identifiant de mission source invalide.');
  }
  const priority = options.priority ?? 'NORMAL';
  if (!Object.hasOwn(PRIORITY_RANK, priority)) throw new Error('Priorité de mission invalide.');

  const ceoTool = getAgentTools(agent).find(tool => tool.targetV6Role.id === '01' && tool.targetV6Role.name === 'CEO.AGENT');
  if (options.executionModeOverride === 'PROPOSAL_ONLY'
    && (agent.id !== '06' || agent.name !== 'DIRECTOR.GENCY' || !ceoTool)) {
    throw new Error('La proposition Gemini optionnelle est réservée au profil historique CEO.AGENT.');
  }
  const executionMode = options.executionModeOverride ?? getAgentExecutionMode(agent);
  if (agent.id === '06' && executionMode === 'DETERMINISTIC') parseCEOExecutiveObjective(mission);
  const connectedTools = executionMode === 'PROPOSAL_ONLY' ? [] : getAgentTools(agent);
  return {
    id,
    ...(options.parentTaskId ? { parentTaskId: options.parentTaskId } : {}),
    agentId: agent.id,
    agentName: agent.name,
    building: agent.buildingName,
    agentType: agent.type,
    executionMode,
    mission,
    priority,
    status: 'QUEUED',
    createdAt: now,
    updatedAt: now,
    ...(options.deadlineAt ? { deadlineAt: options.deadlineAt } : {}),
    attempts: 0,
    budgetMaxEur: executionMode === 'DETERMINISTIC' || executionMode === 'REMOTE_READ_ONLY' ? 0 : null,
    providerCostEur: null,
    declaredTools: [...agent.tools],
    declaredPermissions: [...agent.permissions],
    connectedTools: connectedTools.map(tool => tool.id),
    history: [{ timestamp: now, actor: 'USER', to: 'QUEUED', message: 'Mission enregistrée; aucune action n’a été exécutée.' }],
  };
}

export function enqueueAgentTask(tasks: AgentTask[], task: AgentTask): AgentTask[] {
  if (tasks.some(existing => existing.id === task.id)) {
    throw new Error('Une mission avec cet identifiant existe déjà.');
  }
  if (tasks.length >= MAX_AGENT_TASKS) {
    throw new Error(`Historique plein (${MAX_AGENT_TASKS} missions). Exportez ou effacez des missions avant d’en créer une autre.`);
  }
  return [...tasks, task];
}

function transition(
  task: AgentTask,
  to: AgentTaskStatus,
  actor: AgentTaskEvent['actor'],
  message: string,
  now: string,
  extra: Partial<AgentTask> = {},
): AgentTask {
  if (!isValidTimestamp(now)) throw new Error('Horodatage de transition invalide.');
  return {
    ...task,
    ...extra,
    status: to,
    updatedAt: now,
    history: [
      ...task.history,
      { timestamp: now, actor, from: task.status, to, message },
    ].slice(-MAX_AGENT_TASK_EVENTS),
  };
}

export function selectNextRunnableAgentTask(
  tasks: AgentTask[],
  providerAvailable = true,
): AgentTask | null {
  return tasks
    .filter(task => task.status === 'QUEUED'
      && (task.executionMode === 'DETERMINISTIC'
        || task.executionMode === 'REMOTE_READ_ONLY'
        || (providerAvailable && task.executionMode === 'PROPOSAL_ONLY')))
    .slice()
    .sort((left, right) =>
      PRIORITY_RANK[right.priority] - PRIORITY_RANK[left.priority]
      || left.createdAt.localeCompare(right.createdAt)
      || left.id.localeCompare(right.id),
    )[0] ?? null;
}

export function claimNextAgentTask(tasks: AgentTask[], now = new Date().toISOString(), providerAvailable = true): {
  tasks: AgentTask[];
  claimedTask: AgentTask | null;
} {
  const next = selectNextRunnableAgentTask(tasks, providerAvailable);

  if (!next) return { tasks, claimedTask: null };
  const claimedMessage = next.executionMode === 'DETERMINISTIC'
    ? 'Exécuteur local réclamé par le moteur de missions.'
    : next.executionMode === 'REMOTE_READ_ONLY'
      ? 'Recherche publique en lecture seule réclamée par le moteur de missions.'
      : 'Proposition demandée au fournisseur configuré.';
  const claimedTask = transition(next, 'RUNNING', 'SYSTEM', claimedMessage, now, {
    attempts: next.attempts + 1,
    error: undefined,
  });
  return {
    tasks: tasks.map(task => task.id === claimedTask.id ? claimedTask : task),
    claimedTask,
  };
}

export function recordAgentProposal(task: AgentTask, proposal: AgentTaskProposal, now = new Date().toISOString()): AgentTask {
  if (task.status !== 'RUNNING') throw new Error('Seule une mission en cours peut recevoir une proposition.');
  if (task.executionMode !== 'PROPOSAL_ONLY') throw new Error('Cette mission ne relève pas du fournisseur IA.');
  if (proposal.agentId !== task.agentId || proposal.resultKind !== 'PROPOSAL' || proposal.externalActionExecuted !== false) {
    throw new Error('La réponse ne correspond pas à une proposition sûre pour cette mission.');
  }
  if (!proposal.output.trim() || proposal.output.length > 12_000) {
    throw new Error('La proposition est vide ou dépasse la limite de stockage.');
  }
  return transition(task, 'WAITING_REVIEW', 'PROVIDER', 'Proposition reçue; aucune action externe exécutée.', now, {
    result: proposal,
    error: undefined,
  });
}

export function recordAgentDeterministicResult(
  task: AgentTask,
  result: AgentDeterministicResult,
  now = new Date().toISOString(),
): AgentTask {
  if (task.status !== 'RUNNING' || task.executionMode !== 'DETERMINISTIC') {
    throw new Error('Cette tâche n’est pas en cours dans un exécuteur déterministe.');
  }
  if (result.agentId !== task.agentId || !task.connectedTools.includes(result.toolId)
    || result.resultKind !== 'DETERMINISTIC_RESULT' || result.externalActionExecuted !== false) {
    throw new Error('Le résultat déterministe ne correspond pas à cette mission.');
  }
  if (!result.output.trim() || result.output.length > 12_000) {
    throw new Error('Le résultat est vide ou dépasse la limite de stockage.');
  }
  return transition(task, 'WAITING_REVIEW', 'SYSTEM', `Outil local ${result.toolId} exécuté; aucune action externe.`, now, {
    result,
    error: undefined,
  });
}

export function recordAgentPublicOpportunityResult(
  task: AgentTask,
  result: AgentPublicOpportunityResult,
  now = new Date().toISOString(),
): AgentTask {
  if (task.status !== 'RUNNING' || task.executionMode !== 'REMOTE_READ_ONLY') {
    throw new Error('Cette mission n’est pas en cours dans un connecteur public en lecture seule.');
  }
  if (result.agentId !== task.agentId || !task.connectedTools.includes(result.toolId)
    || result.resultKind !== 'REMOTE_READ_ONLY_RESULT' || result.externalActionExecuted !== false
    || !isAgentPublicOpportunityResult(result)) {
    throw new Error('Le résultat public ne correspond pas au profil ou au connecteur autorisé.');
  }
  return transition(task, 'WAITING_REVIEW', 'SYSTEM', `Connecteur public en lecture seule ${result.toolId} terminé; aucune action externe effectuée.`, now, {
    result,
    error: undefined,
  });
}

export function failAgentTask(task: AgentTask, error: string, now = new Date().toISOString()): AgentTask {
  if (task.status !== 'RUNNING') throw new Error('Seule une mission en cours peut échouer.');
  const safeError = error.trim().slice(0, MAX_AGENT_TASK_ERROR_LENGTH) || 'Erreur non détaillée.';
  return transition(task, 'FAILED', 'SYSTEM', safeError, now, { error: safeError });
}

export function recoverInterruptedAgentTasks(tasks: AgentTask[], now = new Date().toISOString()): AgentTask[] {
  return tasks.map(task => task.status === 'RUNNING'
    ? failAgentTask(task, 'Interruption détectée au redémarrage; résultat fournisseur inconnu. Aucune relance automatique.', now)
    : task,
  );
}

export function retryFailedAgentTask(task: AgentTask, now = new Date().toISOString()): AgentTask {
  if (task.status !== 'FAILED') throw new Error('Seule une mission en échec peut être remise en file.');
  if (task.attempts >= MAX_AGENT_TASK_ATTEMPTS) throw new Error(`Limite de ${MAX_AGENT_TASK_ATTEMPTS} tentatives atteinte.`);
  return transition(task, 'QUEUED', 'USER', 'Mission remise en file par l’utilisateur.', now, { error: undefined });
}

export function reviewAgentResult(
  task: AgentTask,
  decision: 'REVIEWED' | 'DISMISSED',
  note = '',
  now = new Date().toISOString(),
): AgentTask {
  if (task.status !== 'WAITING_REVIEW' || !task.result) {
    throw new Error('La mission ne contient aucune proposition en attente de revue.');
  }
  const message = decision === 'REVIEWED'
    ? `Résultat examiné par l’utilisateur. Aucune action autorisée ou exécutée.${note ? ` Note: ${note.trim()}` : ''}`
    : `Résultat écarté par l’utilisateur.${note ? ` Note: ${note.trim()}` : ''}`;
  return transition(task, decision, 'USER', message.slice(0, MAX_AGENT_TASK_ERROR_LENGTH), now);
}

export function cancelQueuedAgentTask(task: AgentTask, now = new Date().toISOString()): AgentTask {
  if (task.status !== 'QUEUED') throw new Error('Seule une mission en attente peut être annulée.');
  return transition(task, 'CANCELLED', 'USER', 'Mission annulée avant son exécution.', now);
}

export function getAgentVisualState(tasks: AgentTask[], agentId: string): AgentVisualState {
  const agentTasks = tasks
    .filter(task => task.agentId === agentId)
    .slice();
  if (agentTasks.some(task => task.status === 'RUNNING')) return 'WORKING';
  if (agentTasks.some(task => task.status === 'WAITING_REVIEW')) return 'WAITING_REVIEW';
  if (agentTasks.some(task => task.status === 'QUEUED')) return 'QUEUED';
  const latest = agentTasks.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0];
  if (!latest) return 'INACTIVE';
  if (latest.status === 'FAILED') return 'ERROR';
  return 'INACTIVE';
}
