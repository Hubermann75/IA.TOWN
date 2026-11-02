import type { AgentRecord } from '../types/town';

export type AgentCapability = 'LOCAL_MARGIN_CALCULATION';

/** Runtime grants are separate from the descriptive permissions in AGENT_REGISTRY. */
const RUNTIME_GRANTS: Record<string, AgentCapability[]> = {
  'MARGIN.PREDICTOR': ['LOCAL_MARGIN_CALCULATION'],
};

export function authorizeAgentCapability(agent: AgentRecord, capability: AgentCapability): boolean {
  return agent.type === 'TYPE_B_SERVICE'
    && (RUNTIME_GRANTS[agent.name] ?? []).includes(capability);
}

export function getEnforcedCapabilities(agent: AgentRecord): AgentCapability[] {
  return (RUNTIME_GRANTS[agent.name] ?? []).filter(capability => authorizeAgentCapability(agent, capability));
}
