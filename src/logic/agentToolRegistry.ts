import type { AgentRecord } from '../types/town';
import { runMarginCalculator, type AgentDeterministicResult } from './agentDeterministicExecutors';
import { authorizeAgentCapability, getEnforcedCapabilities, type AgentCapability } from './agentPermissionEngine';

export interface AgentToolDefinition {
  id: string;
  name: string;
  targetV6Role: { id: string; name: string; building: string };
  allowedAgentName: string;
  requiredCapability: AgentCapability;
  sideEffects: false;
  costEur: 0;
  execute: (agent: AgentRecord, taskId: string, mission: string, now?: string) => AgentDeterministicResult;
}

export const AGENT_TOOL_REGISTRY: AgentToolDefinition[] = [
  {
    id: 'opportunity.margin-calculator.v1',
    name: 'Calculateur de marge déterministe local',
    targetV6Role: { id: '82', name: 'MARGIN.CALCULATOR', building: 'OPPORTUNITY.LAB' },
    allowedAgentName: 'MARGIN.PREDICTOR',
    requiredCapability: 'LOCAL_MARGIN_CALCULATION',
    sideEffects: false,
    costEur: 0,
    execute: runMarginCalculator,
  },
];

export function getAgentTools(agent: AgentRecord): AgentToolDefinition[] {
  return AGENT_TOOL_REGISTRY.filter(tool =>
    tool.allowedAgentName === agent.name
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
