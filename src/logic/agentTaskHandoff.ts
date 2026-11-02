import type { AgentTask } from './agentTaskEngine';
import { isAgentPublicOpportunityResult, type PublicTenderNotice } from './agentPublicOpportunity';

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
