import type { AgentRecord } from '../types/town';
import { authorizeAgentCapability } from './agentPermissionEngine';

export interface MarginCalculationInput {
  unitPriceEur: number;
  variableCostPerUnitEur: number;
  fixedCostsEur: number;
  plannedUnits: number;
}

export interface MarginCalculationData {
  unitPriceEur: number;
  variableCostPerUnitEur: number;
  fixedCostsEur: number;
  plannedUnits: number;
  contributionPerUnitEur: number;
  breakEvenUnits: number | null;
  projectedRevenueEur: number;
  projectedVariableCostsEur: number;
  projectedTotalCostsEur: number;
  projectedOperatingResultEur: number;
  projectedMarginPercent: number;
  revenueKind: 'PROJECTION_FROM_USER_INPUT';
  confirmedRevenueEur: 0;
  warnings: string[];
}

export interface AgentDeterministicResult {
  requestId: string;
  agentId: string;
  agentName: string;
  toolId: string;
  createdAt: string;
  durationMs: 0;
  output: string;
  resultKind: 'DETERMINISTIC_RESULT';
  externalActionExecuted: false;
  data: MarginCalculationData;
}

const MAX_EUR = 1_000_000;
const MAX_UNITS = 1_000_000;
const INPUT_KEYS = new Set([
  'unitPriceEur',
  'variableCostPerUnitEur',
  'fixedCostsEur',
  'plannedUnits',
]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function parseNonNegativeEur(value: unknown, field: string, allowZero: boolean): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value > MAX_EUR || value < 0 || (!allowZero && value === 0)) {
    throw new Error(`${field} doit être un nombre ${allowZero ? 'positif ou nul' : 'strictement positif'}, inférieur ou égal à ${MAX_EUR} €.`);
  }
  const rounded = Number(value.toFixed(2));
  if (!allowZero && rounded === 0) throw new Error(`${field} doit être d’au moins 0,01 €.`);
  return rounded;
}

export function parseMarginCalculationInput(raw: string): MarginCalculationInput {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Entrée invalide : fournissez un objet JSON avec les quatre champs du calculateur.');
  }
  if (!isPlainObject(parsed)) throw new Error('L’entrée doit être un objet JSON.');
  if (Object.keys(parsed).some(key => !INPUT_KEYS.has(key)) || Object.keys(parsed).length !== INPUT_KEYS.size) {
    throw new Error('L’objet doit contenir uniquement unitPriceEur, variableCostPerUnitEur, fixedCostsEur et plannedUnits.');
  }
  if (typeof parsed.plannedUnits !== 'number' || !Number.isInteger(parsed.plannedUnits) || parsed.plannedUnits < 1 || parsed.plannedUnits > MAX_UNITS) {
    throw new Error(`plannedUnits doit être un entier entre 1 et ${MAX_UNITS}.`);
  }

  return {
    unitPriceEur: parseNonNegativeEur(parsed.unitPriceEur, 'unitPriceEur', false),
    variableCostPerUnitEur: parseNonNegativeEur(parsed.variableCostPerUnitEur, 'variableCostPerUnitEur', true),
    fixedCostsEur: parseNonNegativeEur(parsed.fixedCostsEur, 'fixedCostsEur', true),
    plannedUnits: parsed.plannedUnits,
  };
}

function roundMoney(value: number): number {
  return Number(value.toFixed(2));
}

function formatEur(value: number): string {
  return `${value.toFixed(2).replace('.', ',')} €`;
}

export function calculateMarginScenario(input: MarginCalculationInput): MarginCalculationData {
  const contributionPerUnitEur = roundMoney(input.unitPriceEur - input.variableCostPerUnitEur);
  const projectedRevenueEur = roundMoney(input.unitPriceEur * input.plannedUnits);
  const projectedVariableCostsEur = roundMoney(input.variableCostPerUnitEur * input.plannedUnits);
  const projectedTotalCostsEur = roundMoney(input.fixedCostsEur + projectedVariableCostsEur);
  const projectedOperatingResultEur = roundMoney(projectedRevenueEur - projectedTotalCostsEur);
  const projectedMarginPercent = roundMoney((projectedOperatingResultEur / projectedRevenueEur) * 100);
  const warnings: string[] = [];

  if (contributionPerUnitEur <= 0) warnings.push('Le prix ne couvre pas le coût variable unitaire; aucun seuil de rentabilité fini.');
  if (projectedOperatingResultEur < 0) warnings.push('Le scénario produit un résultat négatif avec les hypothèses saisies.');

  return {
    ...input,
    contributionPerUnitEur,
    breakEvenUnits: contributionPerUnitEur > 0 ? Math.ceil(input.fixedCostsEur / contributionPerUnitEur) : null,
    projectedRevenueEur,
    projectedVariableCostsEur,
    projectedTotalCostsEur,
    projectedOperatingResultEur,
    projectedMarginPercent,
    revenueKind: 'PROJECTION_FROM_USER_INPUT',
    confirmedRevenueEur: 0,
    warnings,
  };
}

export function runMarginCalculator(
  agent: AgentRecord,
  taskId: string,
  mission: string,
  now = new Date().toISOString(),
): AgentDeterministicResult {
  if (agent.name !== 'MARGIN.PREDICTOR' || !authorizeAgentCapability(agent, 'LOCAL_MARGIN_CALCULATION')) {
    throw new Error('Permission refusée : ce profil n’est pas autorisé à utiliser le calculateur local.');
  }
  if (!Number.isFinite(Date.parse(now))) throw new Error('Horodatage de résultat invalide.');
  const data = calculateMarginScenario(parseMarginCalculationInput(mission));
  const breakEven = data.breakEvenUnits === null
    ? 'non atteint avec un coût variable supérieur ou égal au prix'
    : `${data.breakEvenUnits} unité(s)`;
  const output = [
    `Contribution unitaire : ${formatEur(data.contributionPerUnitEur)}`,
    `Seuil de rentabilité : ${breakEven}`,
    `Chiffre d’affaires projeté : ${formatEur(data.projectedRevenueEur)}`,
    `Coûts totaux projetés : ${formatEur(data.projectedTotalCostsEur)}`,
    `Résultat opérationnel projeté : ${formatEur(data.projectedOperatingResultEur)} (${data.projectedMarginPercent.toFixed(2)} %)`,
    'Ces valeurs sont une projection calculée à partir des données saisies; elles ne prouvent aucune vente ni aucun encaissement.',
    ...data.warnings.map(warning => `Alerte : ${warning}`),
  ].join('\n');

  return {
    requestId: `local-${taskId}`,
    agentId: agent.id,
    agentName: agent.name,
    toolId: 'opportunity.margin-calculator.v1',
    createdAt: now,
    durationMs: 0,
    output,
    resultKind: 'DETERMINISTIC_RESULT',
    externalActionExecuted: false,
    data,
  };
}
