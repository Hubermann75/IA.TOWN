import type { AgentRecord } from '../types/town';

export type AgentCapability =
  | 'LOCAL_MARGIN_CALCULATION'
  | 'LOCAL_DEMAND_EVIDENCE_ANALYSIS'
  | 'LOCAL_COMPETITOR_DATA_ANALYSIS'
  | 'LOCAL_VALIDATION_PLANNING'
  | 'LOCAL_PORTFOLIO_RANKING';

/** Runtime grants are separate from the descriptive permissions in AGENT_REGISTRY. */
const RUNTIME_GRANTS: Record<string, { id: string; name: string; type: 'TYPE_A_IA' | 'TYPE_B_SERVICE' | 'TYPE_C_HYBRID'; capabilities: AgentCapability[] }> = {
  '71': { id: '71', name: 'SCOUT.AI', type: 'TYPE_A_IA', capabilities: ['LOCAL_DEMAND_EVIDENCE_ANALYSIS'] },
  '73': { id: '73', name: 'MARGIN.PREDICTOR', type: 'TYPE_B_SERVICE', capabilities: ['LOCAL_MARGIN_CALCULATION'] },
  '74': { id: '74', name: 'REVENUE.ENGINE', type: 'TYPE_B_SERVICE', capabilities: ['LOCAL_PORTFOLIO_RANKING'] },
  '75': { id: '75', name: 'NICHE.DRILLER', type: 'TYPE_A_IA', capabilities: ['LOCAL_COMPETITOR_DATA_ANALYSIS'] },
  '76': { id: '76', name: 'PROTOTYPE.TRIGGER', type: 'TYPE_C_HYBRID', capabilities: ['LOCAL_VALIDATION_PLANNING'] },
};

export function authorizeAgentCapability(agent: AgentRecord, capability: AgentCapability): boolean {
  const grant = RUNTIME_GRANTS[agent.id];
  return !!grant
    && grant.id === agent.id
    && grant.name === agent.name
    && grant.type === agent.type
    && grant.capabilities.includes(capability);
}

export function getEnforcedCapabilities(agent: AgentRecord): AgentCapability[] {
  const grant = RUNTIME_GRANTS[agent.id];
  return grant?.capabilities.filter(capability => authorizeAgentCapability(agent, capability)) ?? [];
}
