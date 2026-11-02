import { isAgentPublicOpportunityResult, type AgentPublicOpportunityResult } from './agentPublicOpportunity';

export interface AgentRuntimeStatus {
  available: boolean;
  provider: 'gemini';
  model: string;
  reason?: 'DISABLED' | 'KEY_MISSING';
}

export interface AgentTaskProposal {
  requestId: string;
  agentId: string;
  agentName: string;
  provider: 'gemini';
  model: string;
  createdAt: string;
  durationMs: number;
  output: string;
  resultKind: 'PROPOSAL';
  externalActionExecuted: false;
}

async function readJson<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({})) as { error?: string };
  if (!response.ok) {
    throw new Error(body.error || `Erreur du moteur IA (${response.status}).`);
  }
  return body as T;
}

export async function getAgentRuntimeStatus(): Promise<AgentRuntimeStatus> {
  const response = await fetch('/api/agents/status', {
    method: 'GET',
    headers: { Accept: 'application/json' },
    credentials: 'same-origin',
  });
  return readJson<AgentRuntimeStatus>(response);
}

export async function requestAgentProposal(agentId: string, mission: string): Promise<AgentTaskProposal> {
  const response = await fetch('/api/agents/propose', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    body: JSON.stringify({ agentId, mission }),
  });
  return readJson<AgentTaskProposal>(response);
}

export async function requestAgentPublicSearch(agentId: string, mission: string): Promise<AgentPublicOpportunityResult> {
  const response = await fetch('/api/agents/prospect', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    body: JSON.stringify({ agentId, mission }),
  });
  const result = await readJson<unknown>(response);
  if (!isAgentPublicOpportunityResult(result)) {
    throw new Error('Le connecteur public a renvoyé un résultat invalide; la mission reste sans résultat exploitable.');
  }
  return result;
}
