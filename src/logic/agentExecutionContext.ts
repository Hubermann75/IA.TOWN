import { AGENT_REGISTRY } from '../data/agentRegistry';
import { INITIAL_BUILDINGS } from '../data/seedData';
import { getAgentVisualState, type AgentTask } from './agentTaskEngine';
import { getAgentExecutionMode, getAgentTools } from './agentToolRegistry';

export type AgentContextExecutionMode = 'DETERMINISTIC' | 'REMOTE_READ_ONLY' | 'PROPOSAL_ONLY' | 'UNAVAILABLE';
export type AgentContextVisualState = 'INACTIVE' | 'QUEUED' | 'WORKING' | 'WAITING_REVIEW' | 'ERROR';
export type AgentContextTaskStatus = 'QUEUED' | 'RUNNING' | 'WAITING_REVIEW' | 'REVIEWED' | 'DISMISSED' | 'FAILED' | 'CANCELLED';

export interface AgentExecutionAgentSnapshot {
  id: string;
  name: string;
  buildingId: string;
  buildingName: string;
  type: 'TYPE_A_IA' | 'TYPE_B_SERVICE' | 'TYPE_C_HYBRID';
  executionMode: AgentContextExecutionMode;
  visualState: AgentContextVisualState;
  connectedToolIds: string[];
}

export interface AgentExecutionBuildingSnapshot {
  id: string;
  name: string;
  agentCount: number;
}

export interface AgentExecutionTaskSnapshot {
  id: string;
  agentId: string;
  agentName: string;
  status: AgentContextTaskStatus;
  updatedAt: string;
  resultKind?: 'PROPOSAL' | 'DETERMINISTIC_RESULT' | 'REMOTE_READ_ONLY_RESULT';
  resultDataKind?: string;
}

/** Read-only snapshot built from the local agent registry and browser task history. */
export interface AgentExecutionContext {
  source: 'LOCAL_AGENT_REGISTRY_AND_BROWSER_TASK_QUEUE';
  agents: AgentExecutionAgentSnapshot[];
  buildings: AgentExecutionBuildingSnapshot[];
  tasks: AgentExecutionTaskSnapshot[];
}

/** Build a read-only snapshot from the actual local catalog and persisted browser queue. */
export function buildLocalAgentExecutionContext(tasks: AgentTask[]): AgentExecutionContext {
  const buildingCounts = new Map<string, number>();
  for (const agent of AGENT_REGISTRY) {
    buildingCounts.set(agent.buildingId, (buildingCounts.get(agent.buildingId) ?? 0) + 1);
  }

  return {
    source: 'LOCAL_AGENT_REGISTRY_AND_BROWSER_TASK_QUEUE',
    agents: AGENT_REGISTRY.map(agent => ({
      id: agent.id,
      name: agent.name,
      buildingId: agent.buildingId,
      buildingName: agent.buildingName,
      type: agent.type,
      executionMode: getAgentExecutionMode(agent),
      visualState: getAgentVisualState(tasks, agent.id),
      connectedToolIds: getAgentTools(agent).map(tool => tool.id),
    })),
    buildings: INITIAL_BUILDINGS.map(building => ({
      id: building.id,
      name: building.name,
      agentCount: buildingCounts.get(building.id) ?? 0,
    })),
    tasks: tasks.map(task => ({
      id: task.id,
      agentId: task.agentId,
      agentName: task.agentName,
      status: task.status,
      updatedAt: task.updatedAt,
      ...(task.result ? { resultKind: task.result.resultKind } : {}),
      ...(task.result?.resultKind === 'DETERMINISTIC_RESULT' || task.result?.resultKind === 'REMOTE_READ_ONLY_RESULT'
        ? { resultDataKind: task.result.data.dataKind }
        : {}),
    })),
  };
}
