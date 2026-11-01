/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IA TOWN V3.0 & CCC.CONNECT HUB Type Definitions
 */

export type ActivityLifecycleState = 
  | 'IDEE'
  | 'ETUDE'
  | 'VALIDATION'
  | 'PRODUCTION'
  | 'PUBLICATION'
  | 'EXPLOITATION'
  | 'OPTIMISATION'
  | 'SUSPENSION';

export type RevenueCategory =
  | 'PRODUIT_NUMERIQUE'   // Logiciels, templates, licences, guides
  | 'ABONNEMENT'          // SaaS, services premium, accès récurrent
  | 'AFFILIATION'         // Programmes partenaires vérifiés
  | 'EDITION_NUMERIQUE'   // Newsletters, publications spécialisées
  | 'SITE_WEB'            // Sites web à forte valeur d'audience
  | 'PRESTATION'          // Services numériques assistés par IA
  | 'EXTENSION'           // Plugins, widgets, modules logiciels
  | 'MICROREVENU';        // Micro-missions automatisées autorisées

export interface ActivityCosts {
  apiCosts: number;
  hostingCosts: number;
  advertisingCosts: number;
  commissions: number;
  maintenanceHours: number;
  hourlyRate: number; // For human intervention calculation
}

export interface ActivityFinancials {
  revenuPotentiel: number;
  revenuDeclare: number;
  revenuConfirme: number;
  revenuEncaisse: number; // Real banked cash only
  costs: ActivityCosts;
  totalExpenses: number;
  netProfit: number;
  roiPercentage: number;
  repeatabilityScore: number; // 0 to 100 (100 = 100% digital reusable asset like software/templates)
  riskLevel: 'FAIBLE' | 'MOYEN' | 'ELEVE';
  humanInterventionRequired: 'NULLE' | 'MINIME' | 'MODEREE' | 'INTENSE';
  dataPointsCount: number; // Minimum data requirement for profitability validation
}

export interface ActivityItem {
  id: string;
  name: string;
  category: RevenueCategory;
  responsibleAgent: string;
  buildingId: string;
  state: ActivityLifecycleState;
  maxBudget: number;
  financials: ActivityFinancials;
  description: string;
  complianceChecked: boolean;
  authorized: boolean;
  kpis: {
    activeUsersOrDownloads: number;
    churnRatePercentage?: number;
    conversionRate: number;
    mrr?: number;
  };
  historyEvents: {
    timestamp: string;
    description: string;
    type: 'MILESTONE' | 'REVENUE' | 'COST' | 'ALERT' | 'AUDIT';
  }[];
}

export type CommercialCycleStep =
  | 'DETECTION'
  | 'ANALYSE'
  | 'VALIDATION'
  | 'PRODUCTION'
  | 'CONTROLE_QUALITE'
  | 'PUBLICATION'
  | 'ACQUISITION'
  | 'VENTE'
  | 'LIVRAISON'
  | 'ENCAISSEMENT'
  | 'MAINTENANCE';

export interface CommercialCycleTrack {
  id: string;
  activityId: string;
  productName: string;
  currentStep: CommercialCycleStep;
  stepsCompleted: CommercialCycleStep[];
  status: 'IN_PROGRESS' | 'COMPLETED' | 'HALTED_QUALITY_FAIL' | 'BLOCKED_COMPLIANCE';
  auditLog: {
    step: CommercialCycleStep;
    timestamp: string;
    agent: string;
    details: string;
    passed: boolean;
  }[];
}

export interface BankLedger {
  revenusPotentiels: number;
  revenusDeclares: number;
  revenusConfirmes: number;
  revenusEncaisses: number;
  depensesReellesTotales: number;
  resultatNetReel: number;
  currency: string;
  lastAuditTimestamp: string;
  unconfirmedPendingCount: number;
  bankAccountLinked: boolean;
  bankSecurityMode: 'STRICT_COLD_VAULT' | 'AIR_GAPPED' | 'ENCRYPTED_OPERATIONAL';
}

export interface CostGuardConfig {
  maxDailyApiBudget: number;
  currentDailyApiSpend: number;
  maxMonthlyHostingSpend: number;
  currentHostingSpend: number;
  agentSpendLimits: Record<string, number>;
  activeAlerts: {
    id: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    message: string;
    timestamp: string;
    autoSuspendedActivityId?: string;
  }[];
  autoSuspensionEnabled: boolean;
}

export type BuildingType =
  | 'AI_GENCY'
  | 'ARE_IA_CENTER'
  | 'AI_DEPTH_CENTMINE'
  | 'BANK_IA'
  | 'DUMP_INCINERATOR'
  | 'MARKET_IA'
  | 'FACTORY_IA'
  | 'TRAFFIC_IA'
  | 'CONTRACT_IA'
  | 'SUBSCRIPTION_IA'
  | 'RD_IA'
  | 'MEDIA_IA'
  | 'PLUGIN_STORE_IA'
  | 'WEB_ESTATE_IA'
  | 'OPPORTUNITY_LAB'
  | 'CCC_CONNECT_HUB';

export interface BuildingInfo {
  id: BuildingType;
  name: string;
  codename: string;
  category: 'INFRASTRUCTURE_EXISTANTE' | 'EXTENSION_REVENUE' | 'CONNECTIVITE_CCC';
  description: string;
  status: 'OPTIMAL' | 'ACTIVE' | 'HIGH_LOAD' | 'STANDBY';
  headAgent: string;
  assignedRobotsCount: number;
  primaryMetricLabel: string;
  primaryMetricValue: string;
  secondaryMetricLabel: string;
  secondaryMetricValue: string;
  coordinates: { x: number; y: number; width: number; height: number };
  accentColor: string;
}

// CCC.CONNECT HUB Specific Types
export type DevicePlatform = 
  | 'WINDOWS'
  | 'ANDROID_PHONE'
  | 'ANDROID_TABLET'
  | 'WEAR_OS'
  | 'GOOGLE_TV';

export interface CCCDevice {
  id: string;
  name: string;
  platform: DevicePlatform;
  bridgeAgent: string;
  status: 'ONLINE' | 'STANDBY' | 'SYNCING' | 'OFFLINE';
  ipAddress: string;
  batteryLevel?: number;
  lastSeen: string;
  firmwareVersion: string;
  latencyMs?: number;
  stabilityScore?: number;
  packetLoss?: number;
  jitterMs?: number;
  permissions: {
    canControlCompany: boolean;
    canControlMining: boolean;
    canViewFinances: boolean;
    canDispatchMissions: boolean;
  };
}

export interface CCCApp {
  id: string;
  name: string;
  version: string;
  platformSupport: DevicePlatform[];
  status: 'RUNNING' | 'IDLE' | 'BACKGROUND';
  memoryMb: number;
  activeSessions: number;
}

export interface QRPairingSession {
  sessionId: string;
  token: string;
  qrPayload: string;
  createdAt: number;
  expiresAt: number;
  targetPlatform?: DevicePlatform;
  status: 'ACTIVE' | 'PAIRED' | 'EXPIRED' | 'REVOKED';
  pairedDeviceId?: string;
  pairingCodeShort: string;
}

export interface RemoteCommand {
  id: string;
  commandType: 
    | 'START_COMPANY'
    | 'STOP_COMPANY'
    | 'START_MINING'
    | 'STOP_MINING'
    | 'PAUSE_ALL'
    | 'RESUME_ALL'
    | 'DISPATCH_MISSION'
    | 'EMERGENCY_FREEZE';
  issuedByDevice: string;
  issuedAt: string;
  executed: boolean;
  executionStatus: 'PENDING' | 'EXECUTED_SUCCESS' | 'REJECTED_PERMISSION' | 'TIMEOUT';
  responsePayload?: string;
}

export interface HubFloorInfo {
  floorNumber: number;
  name: string;
  frenchTitle: string;
  role: string;
  agents: string[];
  robotTypes: string;
  status: 'OPERATIONAL' | 'BUSY' | 'SYNCING';
  metric: string;
}

export interface StructuredAgentEvent {
  id: string;
  timestamp: string;
  emitterAgent: string;
  targetAgent?: string;
  targetBuilding: BuildingType;
  eventType: 
    | 'NEED_IDENTIFIED'
    | 'PRODUCT_SYNTHESIZED'
    | 'QA_AUDITED'
    | 'COMMERCIAL_LISTED'
    | 'ORDER_PLACED'
    | 'INSTANT_DELIVERED'
    | 'BANK_SETTLED'
    | 'COST_DEDUCTED'
    | 'NET_CONFIRMED'
    | 'DEVICE_HANDSHAKE'
    | 'SYNC_DELTA'
    | 'COMMAND_DISPATCHED'
    | 'ALERT_TRIGGERED';
  payload: Record<string, any>;
  status: 'SUCCESS' | 'WARNING' | 'CRITICAL';
}

export type TenStepId =
  | '1_BESOIN'
  | '2_PRODUIT'
  | '3_QUALITE'
  | '4_COMMERCIALISATION'
  | '5_PUBLICATION'
  | '6_COMMANDE'
  | '7_LIVRAISON'
  | '8_PAIEMENT'
  | '9_COUTS'
  | '10_RESULTAT_NET';

export interface TenStepDefinition {
  stepNumber: number;
  id: TenStepId;
  title: string;
  responsibleAgent: string;
  buildingId: BuildingType;
  description: string;
  deliverableName: string;
}

export interface TenStepExecutionState {
  currentStepIndex: number; // 0 to 9 (or 10 when completed)
  isCompleted: boolean;
  productTitle: string;
  priceTag: number;
  customerOrderEmail: string;
  licenseKeyGenerated?: string;
  paymentConfirmedAmount: number;
  calculatedExpenses: {
    apiInference: number;
    hostingDelivery: number;
    paymentFee: number;
    total: number;
  };
  netBankedCash: number;
  auditTrail: {
    stepIndex: number;
    title: string;
    agent: string;
    timestamp: string;
    details: string;
  }[];
}

export type AgentRoleType = 
  | 'TYPE_A_IA'       // Agent IA - Modèle LLM / Raisonnement cognitif
  | 'TYPE_B_SERVICE'  // Service Automatisé - Algorithme TypeScript déterministe / Service backend
  | 'TYPE_C_HYBRID';  // Agent Hybride - Déterministe + IA

export interface AgentRecord {
  id: string; // "01" à "94"
  numericId: number; // 1 to 94
  name: string;
  buildingId: BuildingType;
  buildingName: string;
  profession: string;
  type: AgentRoleType;
  tools: string[];
  permissions: string[];
  status: 'ACTIF' | 'EN_MISSION' | 'EN_ATTENTE' | 'PAUSE' | 'MAINTENANCE';
  currentMission: string;
  completedMissionsCount: number;
  metrics: {
    requestsHandled: number;
    successRate: number; // percentage, e.g. 99.4
    totalCostEur: number;
    avgExecutionTimeMs: number;
  };
  avatarColor: string;
  description: string;
  history: {
    timestamp: string;
    action: string;
    result: string;
  }[];
}
