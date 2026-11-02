import {
  MAX_AGENT_MISSION_LENGTH,
  MAX_AGENT_TASK_ATTEMPTS,
  MAX_AGENT_TASK_EVENTS,
  MAX_AGENT_TASKS,
  type AgentTask,
  type AgentTaskEvent,
  type AgentTaskPriority,
  type AgentTaskResult,
  type AgentTaskStatus,
} from './agentTaskEngine';
import type { AgentTaskProposal } from './agentRuntimeClient';

const STORAGE_KEY = 'IA_TOWN_AGENT_TASKS_V1';
const MAX_STORE_JSON_LENGTH = 3_000_000;
const PRIORITIES = new Set<AgentTaskPriority>(['LOW', 'NORMAL', 'HIGH', 'URGENT']);
const STATUSES = new Set<AgentTaskStatus>([
  'QUEUED', 'RUNNING', 'WAITING_REVIEW', 'REVIEWED', 'DISMISSED', 'FAILED', 'CANCELLED',
]);

export interface AgentTaskStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface AgentTaskStoreReadResult {
  tasks: AgentTask[];
  writable: boolean;
  warning?: string;
}

function resolveStorage(storage?: AgentTaskStorage): AgentTaskStorage | undefined {
  if (storage) return storage;
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

function isEvent(value: unknown): value is AgentTaskEvent {
  if (!value || typeof value !== 'object') return false;
  const event = value as Partial<AgentTaskEvent>;
  return typeof event.timestamp === 'string'
    && Number.isFinite(Date.parse(event.timestamp))
    && (event.actor === 'SYSTEM' || event.actor === 'PROVIDER' || event.actor === 'USER')
    && typeof event.to === 'string'
    && STATUSES.has(event.to as AgentTaskStatus)
    && (event.from === undefined || (typeof event.from === 'string' && STATUSES.has(event.from as AgentTaskStatus)))
    && typeof event.message === 'string';
}

function isProposal(value: unknown): value is AgentTaskProposal {
  if (!value || typeof value !== 'object') return false;
  const proposal = value as Partial<AgentTaskProposal>;
  return typeof proposal.requestId === 'string'
    && typeof proposal.agentId === 'string'
    && typeof proposal.agentName === 'string'
    && proposal.provider === 'gemini'
    && typeof proposal.model === 'string'
    && typeof proposal.createdAt === 'string'
    && Number.isFinite(Date.parse(proposal.createdAt))
    && typeof proposal.durationMs === 'number'
    && Number.isFinite(proposal.durationMs)
    && typeof proposal.output === 'string'
    && proposal.output.length <= 12_000
    && proposal.resultKind === 'PROPOSAL'
    && proposal.externalActionExecuted === false;
}

function isDeterministicResult(value: unknown): value is Extract<AgentTaskResult, { resultKind: 'DETERMINISTIC_RESULT' }> {
  if (!value || typeof value !== 'object') return false;
  const result = value as Partial<Extract<AgentTaskResult, { resultKind: 'DETERMINISTIC_RESULT' }>>;
  const data = result.data;
  return typeof result.requestId === 'string'
    && typeof result.agentId === 'string'
    && typeof result.agentName === 'string'
    && typeof result.toolId === 'string'
    && typeof result.createdAt === 'string'
    && Number.isFinite(Date.parse(result.createdAt))
    && result.durationMs === 0
    && typeof result.output === 'string'
    && result.output.length <= 12_000
    && result.resultKind === 'DETERMINISTIC_RESULT'
    && result.externalActionExecuted === false
    && !!data
    && [
      data.unitPriceEur,
      data.variableCostPerUnitEur,
      data.fixedCostsEur,
      data.plannedUnits,
      data.contributionPerUnitEur,
      data.projectedRevenueEur,
      data.projectedVariableCostsEur,
      data.projectedTotalCostsEur,
      data.projectedOperatingResultEur,
      data.projectedMarginPercent,
    ].every(number => typeof number === 'number' && Number.isFinite(number))
    && (data.breakEvenUnits === null || (typeof data.breakEvenUnits === 'number' && Number.isInteger(data.breakEvenUnits)))
    && data.revenueKind === 'PROJECTION_FROM_USER_INPUT'
    && data.confirmedRevenueEur === 0
    && Array.isArray(data.warnings)
    && data.warnings.every(warning => typeof warning === 'string');
}

function isAgentTaskResult(value: unknown): value is AgentTaskResult {
  return isProposal(value) || isDeterministicResult(value);
}

export function isAgentTask(value: unknown): value is AgentTask {
  if (!value || typeof value !== 'object') return false;
  const task = value as Partial<AgentTask>;
  return typeof task.id === 'string' && task.id.length > 0
    && typeof task.agentId === 'string' && /^\d{2}$/.test(task.agentId)
    && typeof task.agentName === 'string'
    && typeof task.building === 'string'
    && (task.agentType === 'TYPE_A_IA' || task.agentType === 'TYPE_B_SERVICE' || task.agentType === 'TYPE_C_HYBRID')
    && (task.executionMode === 'DETERMINISTIC' || task.executionMode === 'PROPOSAL_ONLY' || task.executionMode === 'UNAVAILABLE')
    && (task.agentType === 'TYPE_B_SERVICE'
      ? (task.executionMode === 'DETERMINISTIC' || task.executionMode === 'UNAVAILABLE')
      : task.executionMode === 'PROPOSAL_ONLY')
    && typeof task.mission === 'string' && task.mission.trim().length > 0 && task.mission.length <= MAX_AGENT_MISSION_LENGTH
    && typeof task.priority === 'string' && PRIORITIES.has(task.priority as AgentTaskPriority)
    && typeof task.status === 'string' && STATUSES.has(task.status as AgentTaskStatus)
    && typeof task.createdAt === 'string' && Number.isFinite(Date.parse(task.createdAt))
    && typeof task.updatedAt === 'string' && Number.isFinite(Date.parse(task.updatedAt))
    && (task.deadlineAt === undefined || (typeof task.deadlineAt === 'string' && Number.isFinite(Date.parse(task.deadlineAt))))
    && typeof task.attempts === 'number' && Number.isInteger(task.attempts) && task.attempts >= 0 && task.attempts <= MAX_AGENT_TASK_ATTEMPTS
    && (task.executionMode === 'DETERMINISTIC' ? task.budgetMaxEur === 0 : task.budgetMaxEur === null)
    && task.providerCostEur === null
    && isStringArray(task.declaredTools)
    && isStringArray(task.declaredPermissions)
    && Array.isArray(task.connectedTools) && task.connectedTools.every(toolId => typeof toolId === 'string')
    && (task.executionMode === 'DETERMINISTIC' ? task.connectedTools.length > 0 : task.connectedTools.length === 0)
    && (task.result === undefined || (isAgentTaskResult(task.result) && task.result.agentId === task.agentId))
    && (task.error === undefined || typeof task.error === 'string')
    && Array.isArray(task.history) && task.history.length > 0 && task.history.length <= MAX_AGENT_TASK_EVENTS && task.history.every(isEvent)
    && ((task.status === 'WAITING_REVIEW' || task.status === 'REVIEWED' || task.status === 'DISMISSED')
      ? task.result !== undefined
      : task.result === undefined);
}

export function readAgentTaskStore(storage?: AgentTaskStorage): AgentTaskStoreReadResult {
  const target = resolveStorage(storage);
  if (!target) return { tasks: [], writable: false, warning: 'Stockage navigateur indisponible.' };
  try {
    const raw = target.getItem(STORAGE_KEY);
    if (!raw) return { tasks: [], writable: true };
    if (raw.length > MAX_STORE_JSON_LENGTH) {
      return { tasks: [], writable: false, warning: 'Historique trop volumineux; stockage laissé intact.' };
    }
    const document: unknown = JSON.parse(raw);
    if (!document || typeof document !== 'object') {
      return { tasks: [], writable: false, warning: 'Historique invalide; stockage laissé intact.' };
    }
    const parsed = document as { version?: unknown; tasks?: unknown };
    if (parsed.version !== 1 || !Array.isArray(parsed.tasks)) {
      return { tasks: [], writable: false, warning: 'Version d’historique inconnue; stockage laissé intact.' };
    }
    const tasks = parsed.tasks.filter(isAgentTask);
    if (tasks.length !== parsed.tasks.length) {
      return { tasks, writable: false, warning: 'Certaines missions sont invalides; stockage laissé intact pour éviter leur perte.' };
    }
    if (tasks.length > MAX_AGENT_TASKS) {
      return { tasks, writable: false, warning: `Historique supérieur à la limite de ${MAX_AGENT_TASKS}; stockage laissé intact.` };
    }
    if (new Set(tasks.map(task => task.id)).size !== tasks.length) {
      return { tasks, writable: false, warning: 'Identifiants de mission dupliqués; stockage laissé intact.' };
    }
    return { tasks, writable: true };
  } catch {
    return { tasks: [], writable: false, warning: 'Historique illisible; stockage laissé intact.' };
  }
}

export function loadAgentTasks(storage?: AgentTaskStorage): AgentTask[] {
  return readAgentTaskStore(storage).tasks;
}

export function saveAgentTasks(tasks: AgentTask[], storage?: AgentTaskStorage): boolean {
  const target = resolveStorage(storage);
  if (!target || tasks.length > MAX_AGENT_TASKS || !tasks.every(isAgentTask)
    || new Set(tasks.map(task => task.id)).size !== tasks.length) return false;
  try {
    target.setItem(STORAGE_KEY, JSON.stringify({ version: 1, tasks }));
    return true;
  } catch {
    return false;
  }
}
