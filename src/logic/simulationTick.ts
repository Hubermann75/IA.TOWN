/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IA TOWN V3.0 — Moteur de Simulation & Tick Autonome
 * Génère des flux opérationnels réalistes, met à jour la trésorerie et émet des événements
 */

import { ActivityItem, BankLedger, CostGuardConfig, StructuredAgentEvent } from '../types/town';
import { calculateNetProfit } from './revenueEngine';

export interface SimulationTickResult {
  updatedActivities: ActivityItem[];
  updatedBankLedger: BankLedger;
  updatedCostGuard: CostGuardConfig;
  emittedEvents: StructuredAgentEvent[];
  newHashrate: number;
}

export function executeSimulationTick(
  activities: ActivityItem[],
  bankLedger: BankLedger,
  costGuard: CostGuardConfig,
  companyRunning: boolean,
  miningRunning: boolean
): SimulationTickResult {
  const emittedEvents: StructuredAgentEvent[] = [];
  const nowIso = new Date().toISOString();

  // If company is stopped, no transactions occur, but baseline hosting costs accrue slowly
  if (!companyRunning) {
    return {
      updatedActivities: activities,
      updatedBankLedger: bankLedger,
      updatedCostGuard: costGuard,
      emittedEvents,
      newHashrate: 0,
    };
  }

  let incrementalGrossRevenue = 0;
  let incrementalExpenses = 0;
  let activeHashrate = miningRunning ? 840 + Math.floor(Math.random() * 20 - 10) : 0;

  // Update active exploitation activities with micro-progress
  const updatedActivities = activities.map(act => {
    if (act.state !== 'EXPLOITATION' && act.state !== 'OPTIMISATION') {
      return act;
    }

    // Small probabilistic sales or renewals
    const hasSale = Math.random() < 0.35;
    let saleAmount = 0;
    let apiCostDelta = 0.05;
    let hostingCostDelta = 0.02;

    if (hasSale) {
      if (act.category === 'PRODUIT_NUMERIQUE') {
        saleAmount = 29.0;
        emittedEvents.push({
          id: `evt-sale-${Date.now()}-${act.id}`,
          timestamp: nowIso,
          emitterAgent: act.responsibleAgent,
          targetBuilding: 'MARKET_IA',
          eventType: 'ORDER_PLACED',
          payload: { activityId: act.id, activityName: act.name, amount: saleAmount },
          status: 'SUCCESS',
        });
      } else if (act.category === 'ABONNEMENT') {
        saleAmount = 15.0; // Micro-renewal
        emittedEvents.push({
          id: `evt-recur-${Date.now()}-${act.id}`,
          timestamp: nowIso,
          emitterAgent: '09. RECUR.MANAGER',
          targetBuilding: 'SUBSCRIPTION_IA',
          eventType: 'BANK_SETTLED',
          payload: { activityId: act.id, activityName: act.name, mrrRenewed: saleAmount },
          status: 'SUCCESS',
        });
      } else if (act.category === 'EXTENSION') {
        saleAmount = 19.0;
      }
    }

    const newCosts = {
      ...act.financials.costs,
      apiCosts: Number((act.financials.costs.apiCosts + apiCostDelta).toFixed(2)),
      hostingCosts: Number((act.financials.costs.hostingCosts + hostingCostDelta).toFixed(2)),
    };
    const totalExp = Number((act.financials.totalExpenses + apiCostDelta + hostingCostDelta).toFixed(2));
    const newEncaisse = Number((act.financials.revenuEncaisse + saleAmount).toFixed(2));
    const newNet = calculateNetProfit(newEncaisse, totalExp);

    incrementalGrossRevenue += saleAmount;
    incrementalExpenses += (apiCostDelta + hostingCostDelta);

    return {
      ...act,
      financials: {
        ...act.financials,
        costs: newCosts,
        totalExpenses: totalExp,
        revenuEncaisse: newEncaisse,
        revenuConfirme: Number((act.financials.revenuConfirme + saleAmount).toFixed(2)),
        revenuDeclare: Number((act.financials.revenuDeclare + saleAmount).toFixed(2)),
        netProfit: newNet,
        dataPointsCount: hasSale ? act.financials.dataPointsCount + 1 : act.financials.dataPointsCount,
      },
      kpis: {
        ...act.kpis,
        activeUsersOrDownloads: hasSale ? act.kpis.activeUsersOrDownloads + 1 : act.kpis.activeUsersOrDownloads,
      },
    };
  });

  // Consolidate bank ledger
  const updatedBankLedger: BankLedger = {
    ...bankLedger,
    revenusEncaisses: Number((bankLedger.revenusEncaisses + incrementalGrossRevenue).toFixed(2)),
    revenusConfirmes: Number((bankLedger.revenusConfirmes + incrementalGrossRevenue).toFixed(2)),
    depensesReellesTotales: Number((bankLedger.depensesReellesTotales + incrementalExpenses).toFixed(2)),
    resultatNetReel: Number((bankLedger.resultatNetReel + incrementalGrossRevenue - incrementalExpenses).toFixed(2)),
    lastAuditTimestamp: nowIso,
  };

  // Update Cost Guard metrics
  const updatedCostGuard: CostGuardConfig = {
    ...costGuard,
    currentDailyApiSpend: Number((costGuard.currentDailyApiSpend + incrementalExpenses * 0.7).toFixed(2)),
  };

  return {
    updatedActivities,
    updatedBankLedger,
    updatedCostGuard,
    emittedEvents,
    newHashrate: activeHashrate,
  };
}
