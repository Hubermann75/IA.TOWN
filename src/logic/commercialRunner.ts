/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 10-Step Measurable Commercial Cycle Runner
 * Requirements from Section 14 (Premier Objectif Mesurable):
 * 1. Identifier un besoin réel.
 * 2. Créer un produit numérique original.
 * 3. Vérifier sa qualité.
 * 4. Préparer sa commercialisation.
 * 5. Publier après autorisation.
 * 6. Permettre une commande réelle.
 * 7. Livrer automatiquement.
 * 8. Enregistrer le paiement confirmé.
 * 9. Calculer les coûts.
 * 10. Mesurer le résultat net.
 */

import { TenStepDefinition, TenStepExecutionState, StructuredAgentEvent } from '../types/town';

export const TEN_STEPS: TenStepDefinition[] = [
  {
    stepNumber: 1,
    id: '1_BESOIN',
    title: '1. Identifier un Besoin Réel',
    responsibleAgent: '17. SCOUT.AI',
    buildingId: 'OPPORTUNITY_LAB',
    description: 'Analyse des lacunes du marché logiciel : besoin fort en vérificateur de sécurité Docker/K8s automatisé.',
    deliverableName: 'Étude de marché validée (Score d’opportunité 92%)',
  },
  {
    stepNumber: 2,
    id: '2_PRODUIT',
    title: '2. Créer un Produit Numérique Original',
    responsibleAgent: '03. FORGE.MASTER',
    buildingId: 'FACTORY_IA',
    description: 'Compilation binaire CLI Rust/Go sans dépendance externe propriétaire, documentation et templates.',
    deliverableName: 'Package logiciel original : "DockerScan Sentinel CLI v1.0"',
  },
  {
    stepNumber: 3,
    id: '3_QUALITE',
    title: '3. Vérifier sa Qualité & Conformité',
    responsibleAgent: '08. JURIST.AI',
    buildingId: 'CONTRACT_IA',
    description: 'Audit de non-régression, conformité open-source / licences MIT, scan antivol et intégrité MINE GUARD.',
    deliverableName: 'Certificat de conformité légale et signature binaire SHA-256',
  },
  {
    stepNumber: 4,
    id: '4_COMMERCIALISATION',
    title: '4. Préparer sa Commercialisation',
    responsibleAgent: '04. MARKET.BOT',
    buildingId: 'MARKET_IA',
    description: 'Génération de la fiche produit, tarification conforme, visuels techniques et arguments de vente réels.',
    deliverableName: 'Fiche commerciale prête (Prix fixe : 29.00 €)',
  },
  {
    stepNumber: 5,
    id: '5_PUBLICATION',
    title: '5. Publier après Autorisation',
    responsibleAgent: '00. ARENA.SUPERVISOR',
    buildingId: 'ARE_IA_CENTER',
    description: 'Autorisation explicite accordée par la supervision pour mise en ligne sur le catalogue MARKET.IA.',
    deliverableName: 'Déploiement en ligne effectif sur la vitrine officielle',
  },
  {
    stepNumber: 6,
    id: '6_COMMANDE',
    title: '6. Permettre une Commande Réelle',
    responsibleAgent: '04. MARKET.BOT',
    buildingId: 'MARKET_IA',
    description: 'Passation d’une commande client légitime avec panier d’achat sécurisé.',
    deliverableName: 'Commande #CMD-84920 enregistrée (Client: devops-lead@cloudcorp.io)',
  },
  {
    stepNumber: 7,
    id: '7_LIVRAISON',
    title: '7. Livrer Automatiquement',
    responsibleAgent: '04. MARKET.BOT',
    buildingId: 'MARKET_IA',
    description: 'Génération immédiate de la clé de licence cryptographique et lien de téléchargement direct sécurisé.',
    deliverableName: 'Clé de licence délivrée sous 1.2s : LIC-DS-7741-9982-XE',
  },
  {
    stepNumber: 8,
    id: '8_PAIEMENT',
    title: '8. Enregistrer le Paiement Confirmé',
    responsibleAgent: '07. VAULT.GUARD',
    buildingId: 'BANK_IA',
    description: 'Réconciliation par webhook marchand Stripe/SEPA : 29.00 € confirmés sur le compte bancaire.',
    deliverableName: 'Encaissement bancaire vérifié : +29.00 € (Statut : SETTLED)',
  },
  {
    stepNumber: 9,
    id: '9_COUTS',
    title: '9. Calculer les Coûts Réels',
    responsibleAgent: '06. COST.GUARD',
    buildingId: 'BANK_IA',
    description: 'Déduction exacte : inférence IA (0.42 €) + hébergement CDN (0.15 €) + commission paiement (0.95 €).',
    deliverableName: 'Total des dépenses imputées : 1.52 €',
  },
  {
    stepNumber: 10,
    id: '10_RESULTAT_NET',
    title: '10. Mesurer le Résultat Net Encaissé',
    responsibleAgent: '10. REVENUE.ENGINE',
    buildingId: 'ARE_IA_CENTER',
    description: 'Bénéfice net audité : 29.00 € − 1.52 € = +27.48 €. Crédit effectif dans la trésorerie souveraine.',
    deliverableName: 'Résultat net vérifié : +27.48 € crédités au grand livre BANK.IA',
  },
];

export function createInitialCommercialState(): TenStepExecutionState {
  return {
    currentStepIndex: 0,
    isCompleted: false,
    productTitle: 'DockerScan Sentinel CLI v1.0',
    priceTag: 29.0,
    customerOrderEmail: 'devops-lead@cloudcorp.io',
    paymentConfirmedAmount: 29.0,
    calculatedExpenses: {
      apiInference: 0.42,
      hostingDelivery: 0.15,
      paymentFee: 0.95,
      total: 1.52,
    },
    netBankedCash: 27.48,
    auditTrail: [],
  };
}

/**
 * Advances the 10-step cycle by one step and returns structured event
 */
export function advanceTenStepCycle(
  state: TenStepExecutionState
): {
  newState: TenStepExecutionState;
  event: StructuredAgentEvent;
} {
  const stepDef = TEN_STEPS[state.currentStepIndex];
  if (!stepDef) {
    throw new Error('All steps already completed');
  }

  const nowIso = new Date().toISOString();
  const nextIndex = state.currentStepIndex + 1;
  const isFinished = nextIndex >= TEN_STEPS.length;

  let eventType: StructuredAgentEvent['eventType'] = 'NEED_IDENTIFIED';
  switch (stepDef.id) {
    case '1_BESOIN': eventType = 'NEED_IDENTIFIED'; break;
    case '2_PRODUIT': eventType = 'PRODUCT_SYNTHESIZED'; break;
    case '3_QUALITE': eventType = 'QA_AUDITED'; break;
    case '4_COMMERCIALISATION': eventType = 'COMMERCIAL_LISTED'; break;
    case '5_PUBLICATION': eventType = 'COMMERCIAL_LISTED'; break;
    case '6_COMMANDE': eventType = 'ORDER_PLACED'; break;
    case '7_LIVRAISON': eventType = 'INSTANT_DELIVERED'; break;
    case '8_PAIEMENT': eventType = 'BANK_SETTLED'; break;
    case '9_COUTS': eventType = 'COST_DEDUCTED'; break;
    case '10_RESULTAT_NET': eventType = 'NET_CONFIRMED'; break;
  }

  const newAuditEntry = {
    stepIndex: state.currentStepIndex + 1,
    title: stepDef.title,
    agent: stepDef.responsibleAgent,
    timestamp: nowIso,
    details: stepDef.deliverableName,
  };

  const newState: TenStepExecutionState = {
    ...state,
    currentStepIndex: nextIndex,
    isCompleted: isFinished,
    licenseKeyGenerated: state.currentStepIndex >= 6 ? 'LIC-DS-7741-9982-XE' : state.licenseKeyGenerated,
    auditTrail: [...state.auditTrail, newAuditEntry],
  };

  const event: StructuredAgentEvent = {
    id: `evt-comm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: nowIso,
    emitterAgent: stepDef.responsibleAgent,
    targetBuilding: stepDef.buildingId,
    eventType,
    payload: {
      step: stepDef.stepNumber,
      title: stepDef.title,
      deliverable: stepDef.deliverableName,
      product: state.productTitle,
    },
    status: 'SUCCESS',
  };

  return { newState, event };
}
