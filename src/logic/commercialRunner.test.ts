import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TEN_STEPS,
  createInitialCommercialState,
  advanceTenStepCycle,
} from './commercialRunner';

test('TEN_STEPS defines all 10 measurable commercial steps in exact order', () => {
  assert.equal(TEN_STEPS.length, 10);
  assert.equal(TEN_STEPS[0].id, '1_BESOIN');
  assert.equal(TEN_STEPS[1].id, '2_PRODUIT');
  assert.equal(TEN_STEPS[2].id, '3_QUALITE');
  assert.equal(TEN_STEPS[3].id, '4_COMMERCIALISATION');
  assert.equal(TEN_STEPS[4].id, '5_PUBLICATION');
  assert.equal(TEN_STEPS[5].id, '6_COMMANDE');
  assert.equal(TEN_STEPS[6].id, '7_LIVRAISON');
  assert.equal(TEN_STEPS[7].id, '8_PAIEMENT');
  assert.equal(TEN_STEPS[8].id, '9_COUTS');
  assert.equal(TEN_STEPS[9].id, '10_RESULTAT_NET');
});

test('advanceTenStepCycle executes sequential progression and computes net banked cash correctly', () => {
  let state = createInitialCommercialState();
  assert.equal(state.currentStepIndex, 0);
  assert.equal(state.isCompleted, false);

  // Step 1: Besoin
  const step1 = advanceTenStepCycle(state);
  state = step1.newState;
  assert.equal(state.currentStepIndex, 1);
  assert.equal(step1.event.eventType, 'NEED_IDENTIFIED');

  // Advance all remaining 9 steps
  for (let i = 1; i < 10; i++) {
    const res = advanceTenStepCycle(state);
    state = res.newState;
  }

  assert.equal(state.currentStepIndex, 10);
  assert.equal(state.isCompleted, true);
  assert.equal(state.auditTrail.length, 10);
  assert.equal(state.netBankedCash, 27.48);
  assert.equal(state.paymentConfirmedAmount - state.calculatedExpenses.total, 27.48);
  assert.ok(state.licenseKeyGenerated);
});
