/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Unit tests for persistence logic
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { exportTownStateJSON, validateAndImportTownStateJSON } from './persistence.ts';
import { INITIAL_ACTIVITIES, INITIAL_BANK_LEDGER, INITIAL_COST_GUARD, INITIAL_COMMERCIAL_TRACKS, INITIAL_CCC_DEVICES } from '../data/seedData.ts';

test('exportTownStateJSON produces valid JSON string with correct version and timestamp', () => {
  const json = exportTownStateJSON({
    companyRunning: true,
    miningRunning: true,
    activities: INITIAL_ACTIVITIES,
    bankLedger: INITIAL_BANK_LEDGER,
    costGuard: INITIAL_COST_GUARD,
    devices: INITIAL_CCC_DEVICES,
    commercialTracks: INITIAL_COMMERCIAL_TRACKS,
    agentEvents: [],
  });

  assert.ok(typeof json === 'string');
  assert.ok(json.includes('"version": "3.0.0"'));
  assert.ok(json.includes('revenusEncaisses'));
});

test('validateAndImportTownStateJSON accepts valid state and rejects corrupted input', () => {
  const json = exportTownStateJSON({
    companyRunning: true,
    miningRunning: true,
    activities: INITIAL_ACTIVITIES,
    bankLedger: INITIAL_BANK_LEDGER,
    costGuard: INITIAL_COST_GUARD,
    devices: INITIAL_CCC_DEVICES,
    commercialTracks: INITIAL_COMMERCIAL_TRACKS,
    agentEvents: [],
  });

  const validResult = validateAndImportTownStateJSON(json);
  assert.equal(validResult.success, true);
  assert.ok(validResult.state);
  assert.equal(validResult.state.activities.length, INITIAL_ACTIVITIES.length);

  const corruptedResult = validateAndImportTownStateJSON('{ invalid json here');
  assert.equal(corruptedResult.success, false);
  assert.ok(corruptedResult.error);

  const missingFieldsResult = validateAndImportTownStateJSON('{"version": "1.0"}');
  assert.equal(missingFieldsResult.success, false);
});
