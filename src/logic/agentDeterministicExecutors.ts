import type { AgentRecord } from '../types/town';
import { authorizeAgentCapability } from './agentPermissionEngine';
import { buildBoampNoticeUrl } from './agentPublicOpportunity';
import type { AgentExecutionContext } from './agentExecutionContext';
import { isCEOExecutivePlanData, parseCEOExecutiveObjective, prepareCEOExecutivePlan, type CEOExecutivePlanData } from './ceoExecutivePlanner';

export interface MarginCalculationInput {
  unitPriceEur: number;
  variableCostPerUnitEur: number;
  fixedCostsEur: number;
  plannedUnits: number;
}

export interface MarginCalculationData {
  dataKind?: 'MARGIN_CALCULATION';
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

export interface DemandEvidenceData {
  dataKind: 'DEMAND_EVIDENCE';
  verificationState: 'USER_SUPPLIED_NOT_VERIFIED';
  sourceCount: number;
  averageUserSignalStrength: number;
  evidence: Array<{ sourceName: string; url: string; observedAt: string; signal: string; userRatedStrength: number }>;
}

export interface CompetitorAnalysisData {
  dataKind: 'COMPETITOR_COMPARISON';
  verificationState: 'USER_SUPPLIED_NOT_VERIFIED';
  competitorCount: number;
  competitors: Array<{ name: string; sourceUrl: string; observedAt: string; priceEur: number | null; listedFeatures: string[] }>;
  featureCoverage: Array<{ feature: string; competitorsListingCount: number }>;
  potentialListingGaps: string[];
  priceRangeEur: { min: number; max: number } | null;
}

export interface ValidationPlanData {
  dataKind: 'VALIDATION_PLAN';
  executionState: 'PLAN_ONLY_NOT_EXECUTED';
  hypothesis: string;
  targetAudience: string;
  method: 'INTERVIEWS' | 'LANDING_PAGE' | 'PROTOTYPE';
  maxBudgetEur: number;
  timeboxDays: number;
  minimumResponses: number;
  steps: string[];
  stopConditions: string[];
}

export interface PortfolioRankingData {
  dataKind: 'PORTFOLIO_RANKING';
  verificationState: 'USER_SUPPLIED_NOT_VERIFIED';
  scoreFormula: string;
  confirmedRevenueEur: 0;
  ranking: Array<{
    rank: number;
    id: string;
    name: string;
    priorityScore: number;
    evidencePoints: number;
    readinessPoints: number;
    economicsPoints: number;
    riskPenalty: number;
    projectedOperatingResultEur: number;
  }>;
}

export interface MineRiskScreeningData {
  dataKind: 'MINE_RISK_SCREENING';
  screeningStatus: 'BLOCKED' | 'REVIEW_REQUIRED' | 'NO_RED_FLAGS_RESEARCH_ONLY';
  evidenceState: 'USER_SUPPLIED_UNVERIFIED';
  opportunityName: string;
  sourceName: string;
  sourceUrl: string;
  observedAt: string;
  activityType: 'FREELANCE' | 'MICROTASK' | 'ADVERTISING' | 'AFFILIATE' | 'DIGITAL_PRODUCT' | 'OTHER';
  redFlags: string[];
  reviewItems: string[];
  platformActionExecuted: false;
  financialActionExecuted: false;
}

export interface GoldOpportunityAnalysisInput {
  opportunityName: string;
  boampNoticeId: string;
  estimatedContractRevenueEur: number;
  estimatedDeliveryCostEur: number;
  estimatedBidPreparationCostEur: number;
  estimatedOtherFeesEur: number;
  riskReservePercent: number;
}

export interface GoldOpportunityAnalysisData extends GoldOpportunityAnalysisInput {
  dataKind: 'GOLD_OPPORTUNITY_ANALYSIS';
  sourceUrl: string;
  sourceVerificationState: 'NOTICE_LINK_NOT_RECHECKED';
  riskReserveEur: number;
  totalEstimatedCostEur: number;
  projectedOperatingResultEur: number;
  projectedMarginPercent: number;
  breakEvenContractValueEur: number;
  revenueKind: 'USER_ESTIMATED_TENDER_VALUE';
  confirmedRevenueEur: 0;
  warnings: string[];
}

export type { CEOExecutivePlanData } from './ceoExecutivePlanner';

export type AgentDeterministicResultData =
  | MarginCalculationData
  | DemandEvidenceData
  | CompetitorAnalysisData
  | ValidationPlanData
  | PortfolioRankingData
  | MineRiskScreeningData
  | GoldOpportunityAnalysisData
  | CEOExecutivePlanData;

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
  data: AgentDeterministicResultData;
}

const MAX_EUR = 1_000_000;
const MAX_UNITS = 1_000_000;
const INPUT_KEYS = new Set([
  'unitPriceEur',
  'variableCostPerUnitEur',
  'fixedCostsEur',
  'plannedUnits',
]);
const DEMAND_TOOL_ID = 'opportunity.demand-evidence.v1';
const COMPETITOR_TOOL_ID = 'opportunity.competitor-comparison.v1';
const VALIDATION_TOOL_ID = 'opportunity.validation-plan.v1';
const PORTFOLIO_TOOL_ID = 'opportunity.portfolio-ranking.v1';
const MINE_GUARD_TOOL_ID = 'centmine.mine-guard-screening.v1';
const GOLD_ANALYST_TOOL_ID = 'centmine.gold-analyst-economic-screening.v1';
const GOLD_ANALYST_AGENT_ID = '41';
const GOLD_ANALYST_AGENT_NAME = 'ORE.REFINER';
const MAX_GOLD_ANALYSIS_EUR = 50_000_000;
const CEO_PLANNING_TOOL_ID = 'ai-gency.ceo-executive-planning.v1';
const CEO_PLANNING_AGENT_ID = '06';
const CEO_PLANNING_AGENT_NAME = 'DIRECTOR.GENCY';

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
    dataKind: 'MARGIN_CALCULATION',
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

const GOLD_ANALYSIS_FIELDS = [
  'opportunityName',
  'boampNoticeId',
  'estimatedContractRevenueEur',
  'estimatedDeliveryCostEur',
  'estimatedBidPreparationCostEur',
  'estimatedOtherFeesEur',
  'riskReservePercent',
];

function parseGoldEur(value: unknown, field: string, allowZero: boolean): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > MAX_GOLD_ANALYSIS_EUR
    || (!allowZero && value === 0)) {
    throw new Error(`${field} doit être un montant ${allowZero ? 'positif ou nul' : 'strictement positif'} inférieur ou égal à ${MAX_GOLD_ANALYSIS_EUR} €.`);
  }
  const rounded = roundMoney(value);
  if (!allowZero && rounded === 0) throw new Error(`${field} doit être d’au moins 0,01 €.`);
  return rounded;
}

export function parseGoldOpportunityAnalysisInput(raw: string): GoldOpportunityAnalysisInput {
  const parsed = parseExactJsonObject(raw, GOLD_ANALYSIS_FIELDS);
  const opportunityName = parseBoundedText(parsed.opportunityName, 'opportunityName', 120);
  const boampNoticeId = parseBoundedText(parsed.boampNoticeId, 'boampNoticeId', 50);
  buildBoampNoticeUrl(boampNoticeId);
  if (typeof parsed.riskReservePercent !== 'number' || !Number.isFinite(parsed.riskReservePercent)
    || parsed.riskReservePercent < 0 || parsed.riskReservePercent > 100) {
    throw new Error('riskReservePercent doit être compris entre 0 et 100.');
  }
  return {
    opportunityName,
    boampNoticeId,
    estimatedContractRevenueEur: parseGoldEur(parsed.estimatedContractRevenueEur, 'estimatedContractRevenueEur', false),
    estimatedDeliveryCostEur: parseGoldEur(parsed.estimatedDeliveryCostEur, 'estimatedDeliveryCostEur', true),
    estimatedBidPreparationCostEur: parseGoldEur(parsed.estimatedBidPreparationCostEur, 'estimatedBidPreparationCostEur', true),
    estimatedOtherFeesEur: parseGoldEur(parsed.estimatedOtherFeesEur, 'estimatedOtherFeesEur', true),
    riskReservePercent: Number(parsed.riskReservePercent.toFixed(2)),
  };
}

function calculateGoldOpportunityScenario(input: GoldOpportunityAnalysisInput): GoldOpportunityAnalysisData {
  const riskReserveEur = roundMoney(input.estimatedContractRevenueEur * input.riskReservePercent / 100);
  const totalEstimatedCostEur = roundMoney(input.estimatedDeliveryCostEur
    + input.estimatedBidPreparationCostEur
    + input.estimatedOtherFeesEur
    + riskReserveEur);
  const projectedOperatingResultEur = roundMoney(input.estimatedContractRevenueEur - totalEstimatedCostEur);
  const projectedMarginPercent = roundMoney(projectedOperatingResultEur / input.estimatedContractRevenueEur * 100);
  const warnings = [
    'La valeur du marché et les coûts sont des estimations saisies; ils n’ont pas été extraits ni vérifiés dans l’avis BOAMP.',
    'L’avis BOAMP est lié par son identifiant, mais son contenu, son échéance et l’admissibilité du candidat ne sont pas revérifiés par cet outil.',
    'Le résultat projeté ne prouve ni attribution, ni commande, ni encaissement; le revenu confirmé reste à zéro.',
  ];
  if (projectedOperatingResultEur < 0) {
    warnings.push('Le scénario produit une perte estimée selon les montants fournis; revoir les hypothèses avant toute décision.');
  }
  return {
    dataKind: 'GOLD_OPPORTUNITY_ANALYSIS',
    ...input,
    sourceUrl: buildBoampNoticeUrl(input.boampNoticeId),
    sourceVerificationState: 'NOTICE_LINK_NOT_RECHECKED',
    riskReserveEur,
    totalEstimatedCostEur,
    projectedOperatingResultEur,
    projectedMarginPercent,
    breakEvenContractValueEur: totalEstimatedCostEur,
    revenueKind: 'USER_ESTIMATED_TENDER_VALUE',
    confirmedRevenueEur: 0,
    warnings,
  };
}

export function runGoldOpportunityAnalysis(
  agent: AgentRecord,
  taskId: string,
  mission: string,
  now = new Date().toISOString(),
): AgentDeterministicResult {
  if (agent.id !== GOLD_ANALYST_AGENT_ID || agent.name !== GOLD_ANALYST_AGENT_NAME
    || !authorizeAgentCapability(agent, 'LOCAL_GOLD_OPPORTUNITY_ANALYSIS')) {
    throw new Error('Permission refusée : ce profil n’est pas autorisé à analyser ce scénario économique.');
  }
  const input = parseGoldOpportunityAnalysisInput(mission);
  const data = calculateGoldOpportunityScenario(input);
  const output = [
    `Dossier : ${data.opportunityName} · avis BOAMP ${data.boampNoticeId}`,
    `Valeur contractuelle estimée saisie : ${formatEur(data.estimatedContractRevenueEur)}`,
    `Coûts estimés totaux, réserve incluse : ${formatEur(data.totalEstimatedCostEur)} (réserve ${data.riskReservePercent.toFixed(2)} % = ${formatEur(data.riskReserveEur)})`,
    `Résultat opérationnel projeté : ${formatEur(data.projectedOperatingResultEur)} (${data.projectedMarginPercent.toFixed(2)} %)`,
    `Seuil estimé de valeur contractuelle : ${formatEur(data.breakEvenContractValueEur)}`,
    'Calcul déterministe de scénario; l’avis source n’a pas été revérifié et aucun revenu n’est confirmé ou encaissé.',
    ...data.warnings.map(warning => `Limite : ${warning}`),
  ].join('\n');
  return createResult(agent, taskId, GOLD_ANALYST_TOOL_ID, output, data, now);
}

export function runCEOExecutivePlanner(
  agent: AgentRecord,
  taskId: string,
  mission: string,
  now = new Date().toISOString(),
  context?: AgentExecutionContext,
): AgentDeterministicResult {
  if (agent.id !== CEO_PLANNING_AGENT_ID || agent.name !== CEO_PLANNING_AGENT_NAME
    || !authorizeAgentCapability(agent, 'LOCAL_EXECUTIVE_MISSION_PLANNING')) {
    throw new Error('Permission refusée : ce profil n’est pas autorisé à préparer un plan de direction.');
  }
  if (!context) throw new Error('Le plan CEO exige un snapshot du registre et de la file locale.');
  const objective = parseCEOExecutiveObjective(mission);
  const data = prepareCEOExecutivePlan(objective, context, taskId);
  const inputNeeded = data.assignments.filter(assignment => assignment.dispatchState === 'WAITING_FOR_USER_INPUT').length;
  const unavailable = data.assignments.filter(assignment => assignment.dispatchState === 'NO_EXECUTOR').length;
  const output = [
    `RAPPORT CEO.AGENT · objectif : ${data.objective}`,
    `Snapshot local : ${data.agentCount} profils et ${data.buildingCount} bâtiments consultés; files observées : ${data.observedTasks.length} missions (hors mission CEO en cours).`,
    `Priorités préparées : ${data.assignments.length}; envoi au planificateur : 0; entrées utilisateur requises : ${inputNeeded}; rôles sans exécuteur : ${unavailable}.`,
    ...data.assignments.map(assignment => `${assignment.order}. ${assignment.targetV6RoleName} / ${assignment.agentName} · priorité ${assignment.priority} · ${assignment.dispatchState} · dépend de ${assignment.dependsOn.length ? assignment.dependsOn.join(', ') : 'aucune'}.`),
    'Aucune opportunité ni aucun revenu n’a été inventé : aucune piste économique n’est encore identifiée et le revenu confirmé reste à 0 €.',
    'Le planificateur local existe, mais aucune sous-mission n’est transmise avant réception des sources et hypothèses exigées par chaque outil.',
  ].join('\n');
  return createResult(agent, taskId, CEO_PLANNING_TOOL_ID, output, data, now);
}

function parseExactJsonObject(raw: string, fields: string[]): Record<string, unknown> {
  if (raw.length > 2_000) throw new Error('La mission JSON dépasse la limite de 2 000 caractères.');
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Entrée invalide : fournissez un objet JSON conforme au modèle de cet outil.');
  }
  if (!isPlainObject(parsed)) throw new Error('L’entrée doit être un objet JSON.');
  if (Object.keys(parsed).length !== fields.length || Object.keys(parsed).some(key => !fields.includes(key))) {
    throw new Error(`L’objet doit contenir uniquement ces champs : ${fields.join(', ')}.`);
  }
  return parsed;
}

function parseBoundedText(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > maxLength || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) {
    throw new Error(`${field} doit être un texte de 1 à ${maxLength} caractères.`);
  }
  return value.trim();
}

function isSafePublicSourceUrl(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 500) return false;
  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, '');
    const isPrivateIpv4 = /^(10\.|127\.|192\.168\.|169\.254\.|0\.)/.test(host)
      || /^172\.(1[6-9]|2\d|3[01])\./.test(host)
      || /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(host)
      || /^192\.0\.0\./.test(host)
      || /^198\.(18|19)\./.test(host)
      || /^(198\.51\.100|203\.0\.113)\./.test(host)
      || /^(22[4-9]|23\d|24\d|25[0-5])\./.test(host);
    const isLocalIpv6 = host === '::1' || host.startsWith('fc') || host.startsWith('fd') || host.startsWith('fe80:') || host.startsWith('::ffff:');
    return ['http:', 'https:'].includes(parsed.protocol)
      && !parsed.username && !parsed.password
      && host !== 'localhost' && !host.endsWith('.local')
      && !isPrivateIpv4 && !isLocalIpv6;
  } catch {
    return false;
  }
}

function parsePublicSourceUrl(value: unknown, field: string): string {
  const raw = parseBoundedText(value, field, 500);
  if (!isSafePublicSourceUrl(raw)) {
    throw new Error(`${field} doit être une source web publique sans identifiant intégré.`);
  }
  return new URL(raw).toString();
}

function parseObservedAt(value: unknown, field: string): string {
  const timestamp = parseBoundedText(value, field, 40);
  if (!Number.isFinite(Date.parse(timestamp))) throw new Error(`${field} doit contenir une date vérifiable.`);
  return timestamp;
}

function parseInteger(value: unknown, field: string, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${field} doit être un entier entre ${min} et ${max}.`);
  }
  return value;
}

function assertAuthorizedRole(agent: AgentRecord, id: string, name: string, capability: Parameters<typeof authorizeAgentCapability>[1]): void {
  if (agent.id !== id || agent.name !== name || !authorizeAgentCapability(agent, capability)) {
    throw new Error('Permission refusée : ce profil ne possède pas le grant local requis.');
  }
}

function createResult(
  agent: AgentRecord,
  taskId: string,
  toolId: string,
  output: string,
  data: AgentDeterministicResultData,
  now: string,
): AgentDeterministicResult {
  if (!Number.isFinite(Date.parse(now))) throw new Error('Horodatage de résultat invalide.');
  if (!output.trim() || output.length > 12_000) throw new Error('Le résultat est vide ou trop volumineux.');
  return {
    requestId: `local-${taskId}`,
    agentId: agent.id,
    agentName: agent.name,
    toolId,
    createdAt: now,
    durationMs: 0,
    output,
    resultKind: 'DETERMINISTIC_RESULT',
    externalActionExecuted: false,
    data,
  };
}

export function runDemandEvidenceAnalyzer(
  agent: AgentRecord,
  taskId: string,
  mission: string,
  now = new Date().toISOString(),
): AgentDeterministicResult {
  assertAuthorizedRole(agent, '71', 'SCOUT.AI', 'LOCAL_DEMAND_EVIDENCE_ANALYSIS');
  const input = parseExactJsonObject(mission, ['sources']);
  if (!Array.isArray(input.sources) || input.sources.length < 1 || input.sources.length > 10) {
    throw new Error('sources doit contenir entre 1 et 10 éléments.');
  }
  const evidence = input.sources.map((value, index) => {
    if (!isPlainObject(value) || Object.keys(value).length !== 5
      || Object.keys(value).some(key => !['sourceName', 'url', 'observedAt', 'signal', 'strength'].includes(key))) {
      throw new Error(`sources[${index}] doit contenir sourceName, url, observedAt, signal et strength.`);
    }
    return {
      sourceName: parseBoundedText(value.sourceName, `sources[${index}].sourceName`, 100),
      url: parsePublicSourceUrl(value.url, `sources[${index}].url`),
      observedAt: parseObservedAt(value.observedAt, `sources[${index}].observedAt`),
      signal: parseBoundedText(value.signal, `sources[${index}].signal`, 240),
      userRatedStrength: parseInteger(value.strength, `sources[${index}].strength`, 1, 5),
    };
  });
  const averageUserSignalStrength = Number((evidence.reduce((sum, item) => sum + item.userRatedStrength, 0) / evidence.length).toFixed(2));
  const data: DemandEvidenceData = {
    dataKind: 'DEMAND_EVIDENCE',
    verificationState: 'USER_SUPPLIED_NOT_VERIFIED',
    sourceCount: evidence.length,
    averageUserSignalStrength,
    evidence,
  };
  const output = [
    `Dossier structuré : ${evidence.length} signal(aux) fourni(s).`,
    `Force moyenne attribuée par la personne : ${averageUserSignalStrength.toFixed(2)}/5.`,
    ...evidence.map((item, index) => `${index + 1}. ${item.sourceName} (${item.observedAt}) — ${item.signal} [force saisie ${item.userRatedStrength}/5] — ${item.url}`),
    'Les sources et signaux sont fournis par l’utilisateur et n’ont pas été vérifiés en ligne.',
  ].join('\n');
  return createResult(agent, taskId, DEMAND_TOOL_ID, output, data, now);
}

export function runCompetitorComparison(
  agent: AgentRecord,
  taskId: string,
  mission: string,
  now = new Date().toISOString(),
): AgentDeterministicResult {
  assertAuthorizedRole(agent, '75', 'NICHE.DRILLER', 'LOCAL_COMPETITOR_DATA_ANALYSIS');
  const input = parseExactJsonObject(mission, ['competitors']);
  if (!Array.isArray(input.competitors) || input.competitors.length < 1 || input.competitors.length > 10) {
    throw new Error('competitors doit contenir entre 1 et 10 éléments.');
  }
  const competitors = input.competitors.map((value, index) => {
    if (!isPlainObject(value) || Object.keys(value).length !== 5
      || Object.keys(value).some(key => !['name', 'sourceUrl', 'observedAt', 'priceEur', 'features'].includes(key))) {
      throw new Error(`competitors[${index}] doit contenir name, sourceUrl, observedAt, priceEur et features.`);
    }
    if (!Array.isArray(value.features) || value.features.length > 12) {
      throw new Error(`competitors[${index}].features doit contenir au plus 12 éléments.`);
    }
    const features = value.features.map((feature, featureIndex) =>
      parseBoundedText(feature, `competitors[${index}].features[${featureIndex}]`, 80),
    );
    if (new Set(features.map(feature => feature.toLocaleLowerCase('fr-FR'))).size !== features.length) {
      throw new Error(`competitors[${index}].features contient un doublon.`);
    }
    const priceEur = value.priceEur === null
      ? null
      : parseNonNegativeEur(value.priceEur, `competitors[${index}].priceEur`, true);
    return {
      name: parseBoundedText(value.name, `competitors[${index}].name`, 100),
      sourceUrl: parsePublicSourceUrl(value.sourceUrl, `competitors[${index}].sourceUrl`),
      observedAt: parseObservedAt(value.observedAt, `competitors[${index}].observedAt`),
      priceEur,
      listedFeatures: features,
    };
  });
  if (new Set(competitors.map(item => item.name.toLocaleLowerCase('fr-FR'))).size !== competitors.length) {
    throw new Error('Les noms des concurrents doivent être uniques.');
  }
  const featureNames = [...new Set(competitors.flatMap(item => item.listedFeatures))]
    .sort((left, right) => left.localeCompare(right, 'fr-FR'));
  const featureCoverage = featureNames.map(feature => ({
    feature,
    competitorsListingCount: competitors.filter(item => item.listedFeatures.some(candidate => candidate.toLocaleLowerCase('fr-FR') === feature.toLocaleLowerCase('fr-FR'))).length,
  }));
  const potentialListingGaps = featureCoverage
    .filter(item => item.competitorsListingCount < competitors.length)
    .map(item => item.feature);
  const prices = competitors.flatMap(item => item.priceEur === null ? [] : [item.priceEur]);
  const data: CompetitorAnalysisData = {
    dataKind: 'COMPETITOR_COMPARISON',
    verificationState: 'USER_SUPPLIED_NOT_VERIFIED',
    competitorCount: competitors.length,
    competitors,
    featureCoverage,
    potentialListingGaps,
    priceRangeEur: prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : null,
  };
  const output = [
    `Comparaison structurée de ${competitors.length} concurrent(s), sur les données saisies.`,
    ...featureCoverage.map(item => `• ${item.feature} : mentionné chez ${item.competitorsListingCount}/${competitors.length}`),
    potentialListingGaps.length
      ? `Éléments potentiellement absents des fiches fournies : ${potentialListingGaps.join(', ')}. À vérifier; une absence de mention ne prouve pas une absence de fonction.`
      : 'Aucun écart de mention n’a été trouvé dans les listes fournies.',
    data.priceRangeEur ? `Fourchette de prix saisie : ${formatEur(data.priceRangeEur.min)} à ${formatEur(data.priceRangeEur.max)}.` : 'Aucun prix comparable fourni.',
    'Les sources et informations concurrentielles n’ont pas été vérifiées en ligne.',
  ].join('\n');
  return createResult(agent, taskId, COMPETITOR_TOOL_ID, output, data, now);
}

export function runValidationPlan(
  agent: AgentRecord,
  taskId: string,
  mission: string,
  now = new Date().toISOString(),
): AgentDeterministicResult {
  assertAuthorizedRole(agent, '76', 'PROTOTYPE.TRIGGER', 'LOCAL_VALIDATION_PLANNING');
  const input = parseExactJsonObject(mission, ['hypothesis', 'targetAudience', 'method', 'maxBudgetEur', 'timeboxDays', 'minimumResponses']);
  if (!['INTERVIEWS', 'LANDING_PAGE', 'PROTOTYPE'].includes(String(input.method))) {
    throw new Error('method doit être INTERVIEWS, LANDING_PAGE ou PROTOTYPE.');
  }
  const data: ValidationPlanData = {
    dataKind: 'VALIDATION_PLAN',
    executionState: 'PLAN_ONLY_NOT_EXECUTED',
    hypothesis: parseBoundedText(input.hypothesis, 'hypothesis', 300),
    targetAudience: parseBoundedText(input.targetAudience, 'targetAudience', 200),
    method: input.method as ValidationPlanData['method'],
    maxBudgetEur: parseNonNegativeEur(input.maxBudgetEur, 'maxBudgetEur', true),
    timeboxDays: parseInteger(input.timeboxDays, 'timeboxDays', 1, 90),
    minimumResponses: parseInteger(input.minimumResponses, 'minimumResponses', 1, 1_000),
    steps: [],
    stopConditions: [],
  };
  if (data.maxBudgetEur > 10_000) throw new Error('maxBudgetEur ne peut pas dépasser 10 000 €.');
  const methodSteps: Record<ValidationPlanData['method'], string[]> = {
    INTERVIEWS: [
      `Définir un guide d’entretien neutre pour le public cible : ${data.targetAudience}.`,
      `Recueillir au moins ${data.minimumResponses} réponses et noter les éléments observables sans les reformuler comme des achats.`,
      'Classer les réponses par problème, fréquence et solution actuelle; conserver les verbatims avec leur provenance.',
      'Comparer les observations à l’hypothèse et consigner les résultats avant toute décision de production.',
    ],
    LANDING_PAGE: [
      `Rédiger une page décrivant l’hypothèse sans promesse non vérifiée pour ${data.targetAudience}.`,
      `Définir à l’avance une mesure de réponse et un seuil minimum de ${data.minimumResponses}; aucune campagne n’est lancée par cet outil.`,
      'Enregistrer les visites et réponses depuis une source de mesure choisie par l’utilisateur.',
      'Comparer le résultat au seuil après la période d’observation et documenter les limites de l’échantillon.',
    ],
    PROTOTYPE: [
      `Limiter le prototype à une seule fonction qui teste l’hypothèse auprès de ${data.targetAudience}.`,
      'Définir les critères de réussite et d’échec avant le test, puis inviter des testeurs avec leur accord.',
      `Recueillir au moins ${data.minimumResponses} retours et distinguer les avis des paiements confirmés.`,
      'Documenter les défauts, coûts et retours observés avant de décider de poursuivre ou d’arrêter.',
    ],
  };
  data.steps = methodSteps[data.method];
  data.stopConditions = [
    `Arrêter à la fin de ${data.timeboxDays} jour(s), au plafond budgétaire prévu (${formatEur(data.maxBudgetEur)}) ou si une règle de plateforme/droit n’est pas claire.`,
    'Ne pas engager de dépense, publier de campagne, contacter de personne ni créer de compte sans autorisation distincte.',
    'Si les réponses sont insuffisantes ou non traçables, classer le résultat comme non concluant.',
  ];
  const output = [
    'Plan de validation seulement; aucun test, achat, campagne ou contact n’a été exécuté.',
    `Hypothèse : ${data.hypothesis}`,
    `Public cible : ${data.targetAudience} · méthode : ${data.method} · durée : ${data.timeboxDays} jour(s) · plafond prévu : ${formatEur(data.maxBudgetEur)} · réponses minimales : ${data.minimumResponses}.`,
    'Étapes :', ...data.steps.map((step, index) => `${index + 1}. ${step}`),
    'Conditions d’arrêt :', ...data.stopConditions.map(condition => `• ${condition}`),
  ].join('\n');
  return createResult(agent, taskId, VALIDATION_TOOL_ID, output, data, now);
}

interface PortfolioInput {
  opportunities: Array<{
    id: string;
    name: string;
    sourceCount: number;
    deliveryReadinessPercent: number;
    riskLevel: number;
    unitPriceEur: number;
    variableCostPerUnitEur: number;
    fixedCostsEur: number;
    plannedUnits: number;
  }>;
}

export function runPortfolioRanking(
  agent: AgentRecord,
  taskId: string,
  mission: string,
  now = new Date().toISOString(),
): AgentDeterministicResult {
  assertAuthorizedRole(agent, '74', 'REVENUE.ENGINE', 'LOCAL_PORTFOLIO_RANKING');
  const input = parseExactJsonObject(mission, ['opportunities']);
  if (!Array.isArray(input.opportunities) || input.opportunities.length < 1 || input.opportunities.length > 10) {
    throw new Error('opportunities doit contenir entre 1 et 10 éléments.');
  }
  const requiredFields = ['id', 'name', 'sourceCount', 'deliveryReadinessPercent', 'riskLevel', 'unitPriceEur', 'variableCostPerUnitEur', 'fixedCostsEur', 'plannedUnits'];
  const parsed: PortfolioInput['opportunities'] = input.opportunities.map((value, index) => {
    if (!isPlainObject(value) || Object.keys(value).length !== requiredFields.length
      || Object.keys(value).some(key => !requiredFields.includes(key))) {
      throw new Error(`opportunities[${index}] doit contenir uniquement : ${requiredFields.join(', ')}.`);
    }
    return {
      id: parseBoundedText(value.id, `opportunities[${index}].id`, 40),
      name: parseBoundedText(value.name, `opportunities[${index}].name`, 100),
      sourceCount: parseInteger(value.sourceCount, `opportunities[${index}].sourceCount`, 0, 10_000),
      deliveryReadinessPercent: parseInteger(value.deliveryReadinessPercent, `opportunities[${index}].deliveryReadinessPercent`, 0, 100),
      riskLevel: parseInteger(value.riskLevel, `opportunities[${index}].riskLevel`, 1, 5),
      unitPriceEur: parseNonNegativeEur(value.unitPriceEur, `opportunities[${index}].unitPriceEur`, false),
      variableCostPerUnitEur: parseNonNegativeEur(value.variableCostPerUnitEur, `opportunities[${index}].variableCostPerUnitEur`, true),
      fixedCostsEur: parseNonNegativeEur(value.fixedCostsEur, `opportunities[${index}].fixedCostsEur`, true),
      plannedUnits: parseInteger(value.plannedUnits, `opportunities[${index}].plannedUnits`, 1, MAX_UNITS),
    };
  });
  if (new Set(parsed.map(item => item.id)).size !== parsed.length) throw new Error('Les identifiants d’opportunité doivent être uniques.');

  const scored = parsed.map(item => {
    const scenario = calculateMarginScenario({
      unitPriceEur: item.unitPriceEur,
      variableCostPerUnitEur: item.variableCostPerUnitEur,
      fixedCostsEur: item.fixedCostsEur,
      plannedUnits: item.plannedUnits,
    });
    const evidencePoints = Math.min(item.sourceCount, 10) * 5;
    const readinessPoints = Number((item.deliveryReadinessPercent * 0.3).toFixed(2));
    const economicsPoints = Number(Math.max(0, Math.min(20, (scenario.projectedOperatingResultEur / Math.max(scenario.projectedTotalCostsEur, 1)) * 20)).toFixed(2));
    const riskPenalty = item.riskLevel * 2;
    const priorityScore = Number(Math.max(0, Math.min(100, evidencePoints + readinessPoints + economicsPoints - riskPenalty)).toFixed(2));
    return { ...item, priorityScore, evidencePoints, readinessPoints, economicsPoints, riskPenalty, projectedOperatingResultEur: scenario.projectedOperatingResultEur };
  }).sort((left, right) => right.priorityScore - left.priorityScore || left.id.localeCompare(right.id));

  const data: PortfolioRankingData = {
    dataKind: 'PORTFOLIO_RANKING',
    verificationState: 'USER_SUPPLIED_NOT_VERIFIED',
    scoreFormula: 'max(0,min(100,min(sourceCount,10)*5 + readinessPercent*0.3 + clamp(projectedOperatingResult/max(projectedCosts,1)*20,0,20) - riskLevel*2)); score de priorité, pas probabilité de succès.',
    confirmedRevenueEur: 0,
    ranking: scored.map((item, index) => ({
      rank: index + 1,
      id: item.id,
      name: item.name,
      priorityScore: item.priorityScore,
      evidencePoints: item.evidencePoints,
      readinessPoints: item.readinessPoints,
      economicsPoints: item.economicsPoints,
      riskPenalty: item.riskPenalty,
      projectedOperatingResultEur: item.projectedOperatingResultEur,
    })),
  };
  const output = [
    'Classement de priorité à partir d’hypothèses saisies; les données et sources ne sont pas vérifiées.',
    data.scoreFormula,
    ...data.ranking.map(item => `${item.rank}. ${item.name} — indice ${item.priorityScore}/100; résultat opérationnel projeté ${formatEur(item.projectedOperatingResultEur)}.`),
    'Revenu confirmé enregistré : 0 €. Aucune vente, dépense ou écriture bancaire n’a été réalisée.',
  ].join('\n');
  return createResult(agent, taskId, PORTFOLIO_TOOL_ID, output, data, now);
}

export function runMineGuardScreening(
  agent: AgentRecord,
  taskId: string,
  mission: string,
  now = new Date().toISOString(),
): AgentDeterministicResult {
  assertAuthorizedRole(agent, '38', 'MINE.GUARD', 'LOCAL_CENTMINE_RISK_SCREENING');
  const fields = [
    'opportunityName', 'sourceName', 'sourceUrl', 'observedAt', 'activityType',
    'payoutTermsProvided', 'platformRulesReviewed', 'accountCredentialsRequested',
    'upfrontFeeRequired', 'guaranteedIncomeClaim', 'sensitiveDataRequested',
    'prohibitedAutomationRequired', 'dataRightsClear',
  ];
  const input = parseExactJsonObject(mission, fields);
  const activityTypes: MineRiskScreeningData['activityType'][] = [
    'FREELANCE', 'MICROTASK', 'ADVERTISING', 'AFFILIATE', 'DIGITAL_PRODUCT', 'OTHER',
  ];
  if (!activityTypes.includes(input.activityType as MineRiskScreeningData['activityType'])) {
    throw new Error(`activityType doit être l’une de ces valeurs : ${activityTypes.join(', ')}.`);
  }
  const booleanFields = [
    'payoutTermsProvided', 'platformRulesReviewed', 'accountCredentialsRequested',
    'upfrontFeeRequired', 'guaranteedIncomeClaim', 'sensitiveDataRequested',
    'prohibitedAutomationRequired', 'dataRightsClear',
  ];
  for (const field of booleanFields) {
    if (typeof input[field] !== 'boolean') throw new Error(`${field} doit être true ou false.`);
  }

  const redFlags: string[] = [];
  if (input.accountCredentialsRequested) redFlags.push('L’offre demande des identifiants de compte.');
  if (input.upfrontFeeRequired) redFlags.push('Un paiement initial est exigé pour accéder à l’opportunité.');
  if (input.guaranteedIncomeClaim) redFlags.push('Un revenu garanti est annoncé.');
  if (input.sensitiveDataRequested) redFlags.push('Des données sensibles sont demandées.');
  if (input.prohibitedAutomationRequired) redFlags.push('Le scénario requiert une automatisation indiquée comme interdite par la plateforme.');

  const reviewItems: string[] = [];
  if (!input.payoutTermsProvided) reviewItems.push('Les conditions et seuils de paiement ne sont pas documentés.');
  if (!input.platformRulesReviewed) reviewItems.push('Les règles actuelles de la plateforme restent à vérifier.');
  if (!input.dataRightsClear) reviewItems.push('Les droits d’utilisation des données ou contenus restent à clarifier.');
  const screeningStatus: MineRiskScreeningData['screeningStatus'] = redFlags.length
    ? 'BLOCKED'
    : reviewItems.length
      ? 'REVIEW_REQUIRED'
      : 'NO_RED_FLAGS_RESEARCH_ONLY';

  const data: MineRiskScreeningData = {
    dataKind: 'MINE_RISK_SCREENING',
    screeningStatus,
    evidenceState: 'USER_SUPPLIED_UNVERIFIED',
    opportunityName: parseBoundedText(input.opportunityName, 'opportunityName', 120),
    sourceName: parseBoundedText(input.sourceName, 'sourceName', 100),
    sourceUrl: parsePublicSourceUrl(input.sourceUrl, 'sourceUrl'),
    observedAt: parseObservedAt(input.observedAt, 'observedAt'),
    activityType: input.activityType as MineRiskScreeningData['activityType'],
    redFlags,
    reviewItems,
    platformActionExecuted: false,
    financialActionExecuted: false,
  };
  const statusText: Record<MineRiskScreeningData['screeningStatus'], string> = {
    BLOCKED: 'BLOQUÉ : un signal de risque explicite a été fourni.',
    REVIEW_REQUIRED: 'REVUE HUMAINE REQUISE : des informations essentielles manquent.',
    NO_RED_FLAGS_RESEARCH_ONLY: 'AUCUN SIGNAL BLOQUANT DANS LES CHAMPS SAISIS : recherche documentaire seulement.',
  };
  const output = [
    statusText[screeningStatus],
    `Opportunité : ${data.opportunityName} · type : ${data.activityType}.`,
    `Source déclarée : ${data.sourceName} · observée le ${data.observedAt} · ${data.sourceUrl}`,
    ...(redFlags.length ? ['Signaux de risque :', ...redFlags.map(flag => `• ${flag}`)] : []),
    ...(reviewItems.length ? ['Points à vérifier :', ...reviewItems.map(item => `• ${item}`)] : []),
    'Les données et déclarations ne sont pas vérifiées par cet outil. Ce résultat n’est ni un avis juridique, ni une autorisation d’exploitation ou d’automatisation.',
    'Aucun compte, site, plateforme ou service financier n’a été contacté; aucune action externe n’a été exécutée.',
  ].join('\n');
  return createResult(agent, taskId, MINE_GUARD_TOOL_ID, output, data, now);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isDemandEvidenceData(value: unknown): value is DemandEvidenceData {
  if (!isPlainObject(value) || value.dataKind !== 'DEMAND_EVIDENCE'
    || value.verificationState !== 'USER_SUPPLIED_NOT_VERIFIED'
    || !Number.isInteger(value.sourceCount) || !isFiniteNumber(value.averageUserSignalStrength)
    || !Array.isArray(value.evidence) || value.evidence.length !== value.sourceCount) return false;
  return value.evidence.every(item => isPlainObject(item)
    && isString(item.sourceName) && item.sourceName.length > 0 && item.sourceName.length <= 100
    && isSafePublicSourceUrl(item.url) && isString(item.observedAt) && Number.isFinite(Date.parse(item.observedAt))
    && isString(item.signal) && item.signal.length > 0 && item.signal.length <= 240
    && Number.isInteger(item.userRatedStrength) && isFiniteNumber(item.userRatedStrength)
    && item.userRatedStrength >= 1 && item.userRatedStrength <= 5);
}

function isCompetitorAnalysisData(value: unknown): value is CompetitorAnalysisData {
  if (!isPlainObject(value) || value.dataKind !== 'COMPETITOR_COMPARISON'
    || value.verificationState !== 'USER_SUPPLIED_NOT_VERIFIED'
    || !isFiniteNumber(value.competitorCount) || !Number.isInteger(value.competitorCount) || !Array.isArray(value.competitors)
    || value.competitors.length !== value.competitorCount || !Array.isArray(value.featureCoverage)
    || !Array.isArray(value.potentialListingGaps)) return false;
  const competitorCount = value.competitorCount as number;
  const competitorsValid = value.competitors.every(item => isPlainObject(item)
    && isString(item.name) && isSafePublicSourceUrl(item.sourceUrl)
    && isString(item.observedAt) && Number.isFinite(Date.parse(item.observedAt))
    && (item.priceEur === null || isFiniteNumber(item.priceEur))
    && Array.isArray(item.listedFeatures) && item.listedFeatures.every(isString));
  const coverageValid = value.featureCoverage.every(item => isPlainObject(item)
    && isString(item.feature) && Number.isInteger(item.competitorsListingCount)
    && isFiniteNumber(item.competitorsListingCount) && item.competitorsListingCount >= 0
    && item.competitorsListingCount <= competitorCount);
  const gapsValid = value.potentialListingGaps.every(isString);
  const price = value.priceRangeEur;
  const priceValid = price === null || (isPlainObject(price) && isFiniteNumber(price.min)
    && isFiniteNumber(price.max) && price.min >= 0 && price.max >= price.min);
  return competitorsValid && coverageValid && gapsValid && priceValid;
}

function isValidationPlanData(value: unknown): value is ValidationPlanData {
  return isPlainObject(value) && value.dataKind === 'VALIDATION_PLAN'
    && value.executionState === 'PLAN_ONLY_NOT_EXECUTED'
    && isString(value.hypothesis) && isString(value.targetAudience)
    && ['INTERVIEWS', 'LANDING_PAGE', 'PROTOTYPE'].includes(String(value.method))
    && isFiniteNumber(value.maxBudgetEur) && value.maxBudgetEur >= 0 && value.maxBudgetEur <= 10_000
    && Number.isInteger(value.timeboxDays) && isFiniteNumber(value.timeboxDays) && value.timeboxDays >= 1 && value.timeboxDays <= 90
    && Number.isInteger(value.minimumResponses) && isFiniteNumber(value.minimumResponses) && value.minimumResponses >= 1 && value.minimumResponses <= 1_000
    && Array.isArray(value.steps) && value.steps.length > 0 && value.steps.every(isString)
    && Array.isArray(value.stopConditions) && value.stopConditions.length > 0 && value.stopConditions.every(isString);
}

function isPortfolioRankingData(value: unknown): value is PortfolioRankingData {
  return isPlainObject(value) && value.dataKind === 'PORTFOLIO_RANKING'
    && value.verificationState === 'USER_SUPPLIED_NOT_VERIFIED'
    && isString(value.scoreFormula) && value.confirmedRevenueEur === 0
    && Array.isArray(value.ranking) && value.ranking.length <= 10
    && value.ranking.every((item, index) => isPlainObject(item)
      && item.rank === index + 1 && isString(item.id) && isString(item.name)
      && ['priorityScore', 'evidencePoints', 'readinessPoints', 'economicsPoints', 'riskPenalty', 'projectedOperatingResultEur'].every(key => isFiniteNumber(item[key]))
      && isFiniteNumber(item.priorityScore) && item.priorityScore >= 0 && item.priorityScore <= 100);
}

function isMineRiskScreeningData(value: unknown): value is MineRiskScreeningData {
  return isPlainObject(value) && value.dataKind === 'MINE_RISK_SCREENING'
    && ['BLOCKED', 'REVIEW_REQUIRED', 'NO_RED_FLAGS_RESEARCH_ONLY'].includes(String(value.screeningStatus))
    && value.evidenceState === 'USER_SUPPLIED_UNVERIFIED'
    && isString(value.opportunityName) && value.opportunityName.length > 0 && value.opportunityName.length <= 120
    && isString(value.sourceName) && value.sourceName.length > 0 && value.sourceName.length <= 100
    && isSafePublicSourceUrl(value.sourceUrl) && isString(value.observedAt) && Number.isFinite(Date.parse(value.observedAt))
    && ['FREELANCE', 'MICROTASK', 'ADVERTISING', 'AFFILIATE', 'DIGITAL_PRODUCT', 'OTHER'].includes(String(value.activityType))
    && Array.isArray(value.redFlags) && value.redFlags.every(isString)
    && Array.isArray(value.reviewItems) && value.reviewItems.every(isString)
    && (value.screeningStatus === 'BLOCKED' ? value.redFlags.length > 0
      : value.screeningStatus === 'REVIEW_REQUIRED'
        ? value.redFlags.length === 0 && value.reviewItems.length > 0
        : value.redFlags.length === 0 && value.reviewItems.length === 0)
    && value.platformActionExecuted === false && value.financialActionExecuted === false;
}

function isGoldOpportunityAnalysisData(value: unknown): value is GoldOpportunityAnalysisData {
  if (!isPlainObject(value) || value.dataKind !== 'GOLD_OPPORTUNITY_ANALYSIS'
    || value.sourceVerificationState !== 'NOTICE_LINK_NOT_RECHECKED'
    || value.revenueKind !== 'USER_ESTIMATED_TENDER_VALUE' || value.confirmedRevenueEur !== 0) return false;
  if (!isString(value.opportunityName) || value.opportunityName.length < 1 || value.opportunityName.length > 120
    || !isString(value.boampNoticeId) || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,49}$/.test(value.boampNoticeId)) return false;
  const expectedSourceUrl = buildBoampNoticeUrl(value.boampNoticeId);
  const monetaryInputs = [
    value.estimatedContractRevenueEur,
    value.estimatedDeliveryCostEur,
    value.estimatedBidPreparationCostEur,
    value.estimatedOtherFeesEur,
  ];
  if (!monetaryInputs.every(item => isFiniteNumber(item) && item >= 0 && item <= MAX_GOLD_ANALYSIS_EUR)
    || !isFiniteNumber(value.estimatedContractRevenueEur) || value.estimatedContractRevenueEur <= 0
    || !isFiniteNumber(value.riskReservePercent) || value.riskReservePercent < 0 || value.riskReservePercent > 100
    || !isFiniteNumber(value.riskReserveEur) || !isFiniteNumber(value.totalEstimatedCostEur)
    || !isFiniteNumber(value.projectedOperatingResultEur) || !isFiniteNumber(value.projectedMarginPercent)
    || !isFiniteNumber(value.breakEvenContractValueEur)) return false;
  const expectedReserve = roundMoney(value.estimatedContractRevenueEur * value.riskReservePercent / 100);
  const deliveryCost = value.estimatedDeliveryCostEur as number;
  const bidPreparationCost = value.estimatedBidPreparationCostEur as number;
  const otherFees = value.estimatedOtherFeesEur as number;
  const expectedTotalCost = roundMoney(deliveryCost + bidPreparationCost + otherFees + expectedReserve);
  const expectedResult = roundMoney(value.estimatedContractRevenueEur - expectedTotalCost);
  const expectedMargin = roundMoney(expectedResult / value.estimatedContractRevenueEur * 100);
  return value.sourceUrl === expectedSourceUrl
    && value.riskReserveEur === expectedReserve
    && value.totalEstimatedCostEur === expectedTotalCost
    && value.projectedOperatingResultEur === expectedResult
    && value.projectedMarginPercent === expectedMargin
    && value.breakEvenContractValueEur === expectedTotalCost
    && Array.isArray(value.warnings) && value.warnings.length >= 3 && value.warnings.every(isString);
}

function isMarginCalculationData(value: unknown): value is MarginCalculationData {
  if (!isPlainObject(value)) return false;
  return [
    value.unitPriceEur,
    value.variableCostPerUnitEur,
    value.fixedCostsEur,
    value.plannedUnits,
    value.contributionPerUnitEur,
    value.projectedRevenueEur,
    value.projectedVariableCostsEur,
    value.projectedTotalCostsEur,
    value.projectedOperatingResultEur,
    value.projectedMarginPercent,
  ].every(isFiniteNumber)
    && (value.dataKind === undefined || value.dataKind === 'MARGIN_CALCULATION')
    && (value.breakEvenUnits === null || (Number.isInteger(value.breakEvenUnits) && isFiniteNumber(value.breakEvenUnits)))
    && value.revenueKind === 'PROJECTION_FROM_USER_INPUT'
    && value.confirmedRevenueEur === 0
    && Array.isArray(value.warnings) && value.warnings.every(isString);
}

export function isAgentDeterministicResultData(toolId: string, value: unknown): value is AgentDeterministicResultData {
  switch (toolId) {
    case CEO_PLANNING_TOOL_ID: return isCEOExecutivePlanData(value);
    case 'opportunity.margin-calculator.v1': return isMarginCalculationData(value);
    case DEMAND_TOOL_ID: return isDemandEvidenceData(value);
    case COMPETITOR_TOOL_ID: return isCompetitorAnalysisData(value);
    case VALIDATION_TOOL_ID: return isValidationPlanData(value);
    case PORTFOLIO_TOOL_ID: return isPortfolioRankingData(value);
    case MINE_GUARD_TOOL_ID: return isMineRiskScreeningData(value);
    case GOLD_ANALYST_TOOL_ID: return isGoldOpportunityAnalysisData(value);
    default: return false;
  }
}
