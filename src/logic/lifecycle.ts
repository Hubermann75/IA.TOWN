/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Activity Lifecycle & Commercial Cycle Traceability
 */

import { ActivityItem, ActivityLifecycleState, CommercialCycleStep, CommercialCycleTrack } from '../types/town';

export const LIFECYCLE_ORDER: ActivityLifecycleState[] = [
  'IDEE',
  'ETUDE',
  'VALIDATION',
  'PRODUCTION',
  'PUBLICATION',
  'EXPLOITATION',
  'OPTIMISATION',
  'SUSPENSION',
];

export const COMMERCIAL_STEPS_ORDER: CommercialCycleStep[] = [
  'DETECTION',
  'ANALYSE',
  'VALIDATION',
  'PRODUCTION',
  'CONTROLE_QUALITE',
  'PUBLICATION',
  'ACQUISITION',
  'VENTE',
  'LIVRAISON',
  'ENCAISSEMENT',
  'MAINTENANCE',
];

/**
 * Validates state transition according to business rules
 */
export function transitionActivityState(
  activity: ActivityItem,
  nextState: ActivityLifecycleState,
  notes?: string
): {
  success: boolean;
  activity: ActivityItem;
  error?: string;
} {
  // Suspension can be done anytime
  if (nextState === 'SUSPENSION') {
    const updated = {
      ...activity,
      state: nextState,
      historyEvents: [
        ...activity.historyEvents,
        {
          timestamp: new Date().toISOString(),
          description: `Activité suspendue: ${notes || 'Arrêt manuel ou garde des coûts'}`,
          type: 'ALERT' as const,
        },
      ],
    };
    return { success: true, activity: updated };
  }

  // To reach EXPLOITATION, must have been authorized & compliance checked
  if (nextState === 'EXPLOITATION' && !activity.authorized) {
    return {
      success: false,
      activity,
      error: 'Impossible de passer en exploitation sans autorisation explicite préalable.',
    };
  }

  if (nextState === 'EXPLOITATION' && !activity.complianceChecked) {
    return {
      success: false,
      activity,
      error: 'Contrôle de conformité juridique (CONTRACT.IA / MINE GUARD) obligatoire avant exploitation.',
    };
  }

  const updated: ActivityItem = {
    ...activity,
    state: nextState,
    historyEvents: [
      ...activity.historyEvents,
      {
        timestamp: new Date().toISOString(),
        description: `Transition d'état vers ${nextState}. ${notes || ''}`,
        type: 'MILESTONE',
      },
    ],
  };

  return { success: true, activity: updated };
}

/**
 * Progresses the commercial cycle one step forward with quality verification
 */
export function progressCommercialCycle(
  track: CommercialCycleTrack,
  responsibleAgent: string,
  details: string,
  passed: boolean = true
): CommercialCycleTrack {
  const currentIndex = COMMERCIAL_STEPS_ORDER.indexOf(track.currentStep);
  const now = new Date().toISOString();

  if (!passed) {
    return {
      ...track,
      status: track.currentStep === 'CONTROLE_QUALITE' ? 'HALTED_QUALITY_FAIL' : 'BLOCKED_COMPLIANCE',
      auditLog: [
        ...track.auditLog,
        {
          step: track.currentStep,
          timestamp: now,
          agent: responsibleAgent,
          details: `ÉCHEC: ${details}`,
          passed: false,
        },
      ],
    };
  }

  const nextIndex = currentIndex + 1;
  const nextStep = nextIndex < COMMERCIAL_STEPS_ORDER.length ? COMMERCIAL_STEPS_ORDER[nextIndex] : track.currentStep;
  const isComplete = nextIndex >= COMMERCIAL_STEPS_ORDER.length;

  return {
    ...track,
    currentStep: nextStep,
    stepsCompleted: Array.from(new Set([...track.stepsCompleted, track.currentStep])),
    status: isComplete ? 'COMPLETED' : 'IN_PROGRESS',
    auditLog: [
      ...track.auditLog,
      {
        step: track.currentStep,
        timestamp: now,
        agent: responsibleAgent,
        details,
        passed: true,
      },
    ],
  };
}
