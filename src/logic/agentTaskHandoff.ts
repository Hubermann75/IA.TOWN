import type { AgentTask } from './agentTaskEngine';
import { isAgentPublicOpportunityResult, type PublicTenderNotice } from './agentPublicOpportunity';
import { AGENT_REGISTRY } from '../data/agentRegistry';
import { getAgentTools } from './agentToolRegistry';
import { isCEOExecutivePlanData } from './ceoExecutivePlanner';

export interface GoldAnalystHandoffDraft {
  sourceTaskId: string;
  sourceAgentId: '39';
  sourceAgentName: 'MINER.PRIME';
  targetAgentId: '41';
  targetAgentName: 'ORE.REFINER';
  notice: PublicTenderNotice;
  fetchedAt: string;
  mission: string;
}

export interface CEOAssignmentHandoffDraft {
  sourceTaskId: string;
  sourceAgentId: '06';
  sourceAgentName: 'DIRECTOR.GENCY';
  targetAgentId: string;
  targetAgentName: string;
  targetV6RoleId: string;
  targetV6RoleName: string;
  missionType: string;
  toolId: string;
  requiredInputs: string[];
  priority: 'HIGH' | 'NORMAL';
}

export function createGoldAnalystHandoffDraft(sourceTask: AgentTask, noticeId: string): GoldAnalystHandoffDraft {
  if (sourceTask.agentId !== '39' || sourceTask.agentName !== 'MINER.PRIME'
    || sourceTask.executionMode !== 'REMOTE_READ_ONLY' || sourceTask.status !== 'REVIEWED'
    || !sourceTask.result || !isAgentPublicOpportunityResult(sourceTask.result)) {
    throw new Error('La transmission exige une recherche PROSPECTOR valide déjà relue dans l’interface.');
  }
  const notice = sourceTask.result.data.opportunities.find(candidate => candidate.noticeId === noticeId);
  if (!notice) throw new Error('L’avis sélectionné ne fait pas partie du résultat PROSPECTOR source.');

  return {
    sourceTaskId: sourceTask.id,
    sourceAgentId: '39',
    sourceAgentName: 'MINER.PRIME',
    targetAgentId: '41',
    targetAgentName: 'ORE.REFINER',
    notice,
    fetchedAt: sourceTask.result.data.fetchedAt,
    mission: JSON.stringify({
      opportunityName: notice.title,
      boampNoticeId: notice.noticeId,
      estimatedContractRevenueEur: null,
      estimatedDeliveryCostEur: null,
      estimatedBidPreparationCostEur: null,
      estimatedOtherFeesEur: null,
      riskReservePercent: null,
    }, null, 2),
  };
}

export function createCEOAssignmentHandoffDraft(sourceTask: AgentTask, targetAgentId: string): CEOAssignmentHandoffDraft {
  if (sourceTask.agentId !== '06' || sourceTask.agentName !== 'DIRECTOR.GENCY'
    || sourceTask.executionMode !== 'DETERMINISTIC' || sourceTask.status !== 'REVIEWED'
    || sourceTask.result?.resultKind !== 'DETERMINISTIC_RESULT'
    || !isCEOExecutivePlanData(sourceTask.result.data)) {
    throw new Error('La transmission CEO exige un plan local valide déjà relu dans l’interface.');
  }
  const assignment = sourceTask.result.data.assignments.find(candidate => candidate.agentId === targetAgentId);
  if (!assignment || assignment.dispatchState !== 'WAITING_FOR_USER_INPUT') {
    throw new Error('Cette mission n’est pas ouverte à une transmission, ou ses données utilisateur manquent encore.');
  }
  const target = AGENT_REGISTRY.find(agent => agent.id === assignment.agentId && agent.name === assignment.agentName);
  const tool = target && getAgentTools(target).find(candidate => candidate.missionType === assignment.missionType
    && candidate.targetV6Role.id === assignment.targetV6RoleId
    && candidate.targetV6Role.name === assignment.targetV6RoleName);
  if (!target || !tool || assignment.executionMode !== 'DETERMINISTIC') {
    throw new Error('Le profil ou son exécuteur local ne correspond plus au plan CEO.');
  }
  return {
    sourceTaskId: sourceTask.id,
    sourceAgentId: '06',
    sourceAgentName: 'DIRECTOR.GENCY',
    targetAgentId: target.id,
    targetAgentName: target.name,
    targetV6RoleId: assignment.targetV6RoleId,
    targetV6RoleName: assignment.targetV6RoleName,
    missionType: assignment.missionType,
    toolId: tool.id,
    requiredInputs: [...assignment.requiredInputs],
    priority: assignment.priority,
  };
}

/** Rejects empty handoffs before they enter the queue; the target executor still validates full schemas. */
export function requireCEOAssignmentInputs(draft: CEOAssignmentHandoffDraft, rawMission: string): void {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawMission);
  } catch {
    throw new Error('Les données de mission doivent être fournies au format JSON demandé par l’agent cible.');
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Les données de mission doivent former un objet JSON.');
  }
  const value = parsed as Record<string, unknown>;
  const isProvided = (field: unknown): boolean => typeof field === 'string'
    ? field.trim().length > 0
    : typeof field === 'number'
      ? Number.isFinite(field)
      : Array.isArray(field)
        ? true
      : typeof field === 'boolean';
  const hasFields = (record: unknown, fields: string[]): boolean => !!record && typeof record === 'object'
    && !Array.isArray(record) && fields.every(field => Object.hasOwn(record, field)
      && isProvided((record as Record<string, unknown>)[field]));

  const valid = draft.missionType === 'DEMAND_EVIDENCE_ANALYSIS'
    ? Array.isArray(value.sources) && value.sources.length > 0
      && value.sources.every(source => hasFields(source, ['sourceName', 'url', 'observedAt', 'signal', 'strength']))
    : draft.missionType === 'COMPETITOR_DATA_ANALYSIS'
      ? Array.isArray(value.competitors) && value.competitors.length > 0
        && value.competitors.every(competitor => hasFields(competitor, ['name', 'sourceUrl', 'observedAt', 'features'])
          && Array.isArray((competitor as { features?: unknown }).features)
          && !!competitor && typeof competitor === 'object'
          && Object.hasOwn(competitor, 'priceEur')
          && ((competitor as { priceEur?: unknown }).priceEur === null || isProvided((competitor as { priceEur?: unknown }).priceEur)))
      : draft.missionType === 'VALIDATION_PLAN'
        ? hasFields(value, ['hypothesis', 'targetAudience', 'method', 'maxBudgetEur', 'timeboxDays', 'minimumResponses'])
        : draft.missionType === 'MARGIN_ANALYSIS'
          ? hasFields(value, ['unitPriceEur', 'variableCostPerUnitEur', 'fixedCostsEur', 'plannedUnits'])
          : draft.missionType === 'PORTFOLIO_RANKING'
            ? Array.isArray(value.opportunities) && value.opportunities.length > 0
              && value.opportunities.every(opportunity => hasFields(opportunity, [
                'id', 'name', 'sourceCount', 'deliveryReadinessPercent', 'riskLevel', 'unitPriceEur',
                'variableCostPerUnitEur', 'fixedCostsEur', 'plannedUnits',
              ]))
            : false;
  if (!valid) {
    throw new Error(`Les champs requis pour ${draft.targetV6RoleName} sont manquants ou vides. Complétez les données utilisateur avant la mise en file.`);
  }
}
