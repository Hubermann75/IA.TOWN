/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * REVENUE.ENGINE & COST.GUARD Core Logic
 * 
 * Rules:
 * 1. Ne jamais promettre de gains.
 * 2. Ne jamais inventer de revenus.
 * 3. Ne jamais privilégier le CA au détriment de la rentabilité réelle.
 * 4. Ne pas attribuer une rentabilité positive à une activité sans données suffisantes (>= 3 data points).
 * 5. Favoriser les activités réutilisables (software, templates, extensions, SaaS).
 */

import { ActivityCosts, ActivityFinancials, ActivityItem, BankLedger, CostGuardConfig, RevenueCategory } from '../types/town';

export const MIN_DATA_POINTS_FOR_PROFITABILITY = 3;

/**
 * Calculates total expenses for an activity
 */
export function calculateActivityExpenses(costs: ActivityCosts): number {
  const laborCost = costs.maintenanceHours * costs.hourlyRate;
  const directCosts = costs.apiCosts + costs.hostingCosts + costs.advertisingCosts + costs.commissions;
  return Number((directCosts + laborCost).toFixed(2));
}

/**
 * Evaluates real net profit based strictly on banked cash (revenuEncaisse)
 */
export function calculateNetProfit(revenuEncaisse: number, totalExpenses: number): number {
  return Number((revenuEncaisse - totalExpenses).toFixed(2));
}

/**
 * Calculates ROI percentage strictly on banked income
 */
export function calculateROI(revenuEncaisse: number, totalExpenses: number): number {
  if (totalExpenses <= 0) {
    return revenuEncaisse > 0 ? 100 : 0;
  }
  return Number((((revenuEncaisse - totalExpenses) / totalExpenses) * 100).toFixed(1));
}

/**
 * Validates whether an activity can be claimed as profitable
 */
export function isProfitabilityAudited(financials: ActivityFinancials): {
  audited: boolean;
  reason?: string;
} {
  if (financials.dataPointsCount < MIN_DATA_POINTS_FOR_PROFITABILITY) {
    return {
      audited: false,
      reason: `Données insuffisantes (${financials.dataPointsCount}/${MIN_DATA_POINTS_FOR_PROFITABILITY} points de données requis)`,
    };
  }

  if (financials.revenuEncaisse <= 0) {
    return {
      audited: false,
      reason: 'Aucun revenu réel encaissé sur compte bancaire',
    };
  }

  const net = calculateNetProfit(financials.revenuEncaisse, financials.totalExpenses);
  if (net <= 0) {
    return {
      audited: false,
      reason: `Résultat net non positif (${net.toFixed(2)} €)`,
    };
  }

  return { audited: true };
}

/**
 * Returns repeatability score weight based on business model
 */
export function getRepeatabilityScore(category: RevenueCategory): number {
  switch (category) {
    case 'PRODUIT_NUMERIQUE': // Logiciels, templates, guides
      return 95;
    case 'EXTENSION': // Plugins, widgets
      return 90;
    case 'ABONNEMENT': // SaaS récurrent
      return 85;
    case 'SITE_WEB': // Niche sites
      return 75;
    case 'EDITION_NUMERIQUE': // Newsletters
      return 70;
    case 'AFFILIATION':
      return 60;
    case 'MICROREVENU': // Automated digital micro-missions
      return 35;
    case 'PRESTATION': // Service numérique assisté
      return 20; // High human intervention required
    default:
      return 50;
  }
}

/**
 * Consolidates total finances into BANK.IA ledger
 */
export function consolidateBankLedger(activities: ActivityItem[], existingLedger?: Partial<BankLedger>): BankLedger {
  let potentiel = 0;
  let declare = 0;
  let confirme = 0;
  let encaisse = 0;
  let depenses = 0;
  let pendingCount = 0;

  for (const act of activities) {
    potentiel += act.financials.revenuPotentiel;
    declare += act.financials.revenuDeclare;
    confirme += act.financials.revenuConfirme;
    encaisse += act.financials.revenuEncaisse;
    depenses += act.financials.totalExpenses;

    if (act.financials.revenuPotentiel > act.financials.revenuEncaisse) {
      pendingCount++;
    }
  }

  const net = Number((encaisse - depenses).toFixed(2));

  return {
    revenusPotentiels: Number(potentiel.toFixed(2)),
    revenusDeclares: Number(declare.toFixed(2)),
    revenusConfirmes: Number(confirme.toFixed(2)),
    revenusEncaisses: Number(encaisse.toFixed(2)),
    depensesReellesTotales: Number(depenses.toFixed(2)),
    resultatNetReel: net,
    currency: 'EUR',
    lastAuditTimestamp: new Date().toISOString(),
    unconfirmedPendingCount: pendingCount,
    bankAccountLinked: existingLedger?.bankAccountLinked ?? true,
    bankSecurityMode: existingLedger?.bankSecurityMode ?? 'ENCRYPTED_OPERATIONAL',
  };
}

/**
 * COST.GUARD: Checks budgets and generates alerts
 */
export function evaluateCostGuard(
  activities: ActivityItem[],
  config: CostGuardConfig
): {
  updatedConfig: CostGuardConfig;
  suspensionRecommendations: string[];
} {
  const alerts: CostGuardConfig['activeAlerts'] = [];
  const suspensionRecommendations: string[] = [];

  // Check Daily API Limit
  if (config.currentDailyApiSpend >= config.maxDailyApiBudget * 0.9) {
    alerts.push({
      id: `alert-api-${Date.now()}`,
      severity: config.currentDailyApiSpend >= config.maxDailyApiBudget ? 'CRITICAL' : 'WARNING',
      message: `Plafond API journalier atteint à ${((config.currentDailyApiSpend / config.maxDailyApiBudget) * 100).toFixed(0)}% (${config.currentDailyApiSpend}€ / ${config.maxDailyApiBudget}€)`,
      timestamp: new Date().toISOString(),
    });
  }

  // Check each activity expenses against budget
  for (const act of activities) {
    if (act.financials.totalExpenses > act.maxBudget) {
      alerts.push({
        id: `alert-budget-${act.id}`,
        severity: 'CRITICAL',
        message: `Activité "${act.name}" dépasse son budget maximal alloué (${act.financials.totalExpenses}€ > ${act.maxBudget}€)`,
        timestamp: new Date().toISOString(),
        autoSuspendedActivityId: act.id,
      });
      suspensionRecommendations.push(act.id);
    } else if (act.financials.totalExpenses > act.maxBudget * 0.85) {
      alerts.push({
        id: `alert-warn-${act.id}`,
        severity: 'WARNING',
        message: `Activité "${act.name}" approche de sa limite budgétaire (${act.financials.totalExpenses}€ / ${act.maxBudget}€)`,
        timestamp: new Date().toISOString(),
      });
    }

    // Flag activities with high negative ROI after multiple data points
    if (
      act.financials.dataPointsCount >= MIN_DATA_POINTS_FOR_PROFITABILITY &&
      act.financials.netProfit < -50 &&
      act.state === 'EXPLOITATION'
    ) {
      alerts.push({
        id: `alert-deficit-${act.id}`,
        severity: 'WARNING',
        message: `Activité déficitaire détectée: "${act.name}" (Net: ${act.financials.netProfit}€). Optimisation ou suspension requise.`,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return {
    updatedConfig: {
      ...config,
      activeAlerts: alerts,
    },
    suspensionRecommendations,
  };
}
