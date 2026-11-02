import { AGENT_REGISTRY } from './agentRegistry';
import { buildAgentRuntimeDefinition, type AgentRuntimeDefinition } from '../logic/agentTaskEngine';
import { AGENT_TOOL_REGISTRY } from '../logic/agentToolRegistry';

/**
 * Normalized execution metadata for each existing catalog profile.
 * This adapter makes missing capabilities explicit; it does not create tools.
 */
export const AGENT_RUNTIME_REGISTRY: AgentRuntimeDefinition[] = AGENT_REGISTRY.map(
  buildAgentRuntimeDefinition,
);

export function getAgentRuntimeDefinition(agentId: string): AgentRuntimeDefinition | undefined {
  return AGENT_RUNTIME_REGISTRY.find(agent => agent.id === agentId);
}

export function validateAgentRuntimeRegistry(): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  const ids = AGENT_RUNTIME_REGISTRY.map(agent => agent.id);
  if (AGENT_RUNTIME_REGISTRY.length !== 94) {
    issues.push(`Le catalogue contient ${AGENT_RUNTIME_REGISTRY.length} rôles au lieu de 94.`);
  }
  if (new Set(ids).size !== ids.length) issues.push('Les identifiants de rôle ne sont pas uniques.');
  const registeredToolIds = new Set(AGENT_TOOL_REGISTRY.map(tool => tool.id));
  if (AGENT_RUNTIME_REGISTRY.some(agent => agent.toolsAvailable.some(tool =>
    tool.connected && (!tool.toolId || !registeredToolIds.has(tool.toolId)),
  ))) {
    issues.push('Un outil est marqué connecté sans définition dans le registre des outils.');
  }
  if (AGENT_RUNTIME_REGISTRY.some(agent => agent.permissions.enforced.some(capability =>
    !AGENT_TOOL_REGISTRY.some(tool => tool.allowedAgentId === agent.id
      && tool.allowedAgentName === agent.name && tool.requiredCapability === capability),
  ))) {
    issues.push('Une permission est appliquée sans outil et grant correspondants.');
  }
  return { valid: issues.length === 0, issues };
}
