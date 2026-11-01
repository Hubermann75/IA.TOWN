import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateActivityExpenses,
  calculateNetProfit,
  calculateROI,
  isProfitabilityAudited,
  getRepeatabilityScore,
  consolidateBankLedger,
  evaluateCostGuard,
} from './revenueEngine';
import { ActivityItem, CostGuardConfig } from '../types/town';

test('calculateActivityExpenses accurately sums API, hosting, ads, commissions, and human labor', () => {
  const costs = {
    apiCosts: 12.5,
    hostingCosts: 5.0,
    advertisingCosts: 20.0,
    commissions: 2.5,
    maintenanceHours: 2,
    hourlyRate: 30, // 60
  };
  const total = calculateActivityExpenses(costs);
  assert.equal(total, 100);
});

test('calculateNetProfit is strictly based on real banked cash (revenuEncaisse)', () => {
  assert.equal(calculateNetProfit(250, 100), 150);
  assert.equal(calculateNetProfit(50, 100), -50);
});

test('calculateROI calculates real percentage return', () => {
  assert.equal(calculateROI(200, 100), 100);
  assert.equal(calculateROI(50, 100), -50);
});

test('isProfitabilityAudited rejects activities without sufficient verified data points', () => {
  const financialsInsufficient = {
    revenuPotentiel: 1000,
    revenuDeclare: 800,
    revenuConfirme: 500,
    revenuEncaisse: 500,
    costs: { apiCosts: 10, hostingCosts: 5, advertisingCosts: 0, commissions: 5, maintenanceHours: 0, hourlyRate: 0 },
    totalExpenses: 20,
    netProfit: 480,
    roiPercentage: 2400,
    repeatabilityScore: 90,
    riskLevel: 'FAIBLE' as const,
    humanInterventionRequired: 'NULLE' as const,
    dataPointsCount: 2, // Less than required 3
  };

  const check = isProfitabilityAudited(financialsInsufficient);
  assert.equal(check.audited, false);
  assert.match(check.reason!, /Données insuffisantes/);
});

test('isProfitabilityAudited accepts profitable activity with >=3 data points and banked cash', () => {
  const financialsSufficient = {
    revenuPotentiel: 350,
    revenuDeclare: 350,
    revenuConfirme: 350,
    revenuEncaisse: 350,
    costs: { apiCosts: 10, hostingCosts: 10, advertisingCosts: 0, commissions: 10, maintenanceHours: 0, hourlyRate: 0 },
    totalExpenses: 30,
    netProfit: 320,
    roiPercentage: 966.7,
    repeatabilityScore: 95,
    riskLevel: 'FAIBLE' as const,
    humanInterventionRequired: 'NULLE' as const,
    dataPointsCount: 5,
  };

  const check = isProfitabilityAudited(financialsSufficient);
  assert.equal(check.audited, true);
});

test('getRepeatabilityScore prioritizes reusable digital products over manual services', () => {
  const digitalProductScore = getRepeatabilityScore('PRODUIT_NUMERIQUE');
  const serviceScore = getRepeatabilityScore('PRESTATION');
  assert.ok(digitalProductScore > 80, 'Digital products must have high score');
  assert.ok(serviceScore < 40, 'Manual services must have low score');
  assert.ok(digitalProductScore > serviceScore, 'Reusable products must be favored');
});

test('evaluateCostGuard trips alert when activity exceeds max budget', () => {
  const mockActivity: ActivityItem = {
    id: 'act-1',
    name: 'Auto-Template Generator',
    category: 'PRODUIT_NUMERIQUE',
    responsibleAgent: 'FACTORY.IA',
    buildingId: 'FACTORY_IA',
    state: 'EXPLOITATION',
    maxBudget: 100,
    financials: {
      revenuPotentiel: 200,
      revenuDeclare: 150,
      revenuConfirme: 120,
      revenuEncaisse: 120,
      costs: { apiCosts: 80, hostingCosts: 25, advertisingCosts: 20, commissions: 5, maintenanceHours: 0, hourlyRate: 0 },
      totalExpenses: 130, // Exceeds 100 max budget
      netProfit: -10,
      roiPercentage: -7.7,
      repeatabilityScore: 95,
      riskLevel: 'FAIBLE',
      humanInterventionRequired: 'NULLE',
      dataPointsCount: 4,
    },
    description: 'Generateur de templates',
    complianceChecked: true,
    authorized: true,
    kpis: { activeUsersOrDownloads: 140, conversionRate: 4.2 },
    historyEvents: [],
  };

  const config: CostGuardConfig = {
    maxDailyApiBudget: 50,
    currentDailyApiSpend: 15,
    maxMonthlyHostingSpend: 200,
    currentHostingSpend: 40,
    agentSpendLimits: {},
    activeAlerts: [],
    autoSuspensionEnabled: true,
  };

  const { updatedConfig, suspensionRecommendations } = evaluateCostGuard([mockActivity], config);
  assert.equal(suspensionRecommendations.length, 1);
  assert.equal(suspensionRecommendations[0], 'act-1');
  assert.ok(updatedConfig.activeAlerts.some(a => a.severity === 'CRITICAL'));
});
