import test from 'node:test';
import assert from 'node:assert/strict';
import { executeSimulationTick } from './simulationTick';
import { generateDigitalProductFiles } from './digitalProductGenerator';
import { INITIAL_ACTIVITIES, INITIAL_BANK_LEDGER, INITIAL_COST_GUARD } from '../data/seedData';

test('executeSimulationTick pauses all financial increments when companyRunning is false', () => {
  const result = executeSimulationTick(
    INITIAL_ACTIVITIES,
    INITIAL_BANK_LEDGER,
    INITIAL_COST_GUARD,
    false, // companyRunning = false
    false
  );

  assert.equal(result.newHashrate, 0);
  assert.equal(result.emittedEvents.length, 0);
  assert.equal(result.updatedBankLedger.revenusEncaisses, INITIAL_BANK_LEDGER.revenusEncaisses);
});

test('executeSimulationTick generates mining hashrate and updates metrics when companyRunning is true', () => {
  const result = executeSimulationTick(
    INITIAL_ACTIVITIES,
    INITIAL_BANK_LEDGER,
    INITIAL_COST_GUARD,
    true,
    true // miningRunning = true
  );

  assert.ok(result.newHashrate > 800, 'Hashrate should be around 840 GH/s');
});

test('generateDigitalProductFiles synthesizes valid executable script, license json and legal invoice', () => {
  const bundle = generateDigitalProductFiles(
    'DockerScan Sentinel CLI',
    'LIC-DS-1234-5678-XX',
    'lead@enterprise.com',
    29.0
  );

  assert.equal(bundle.productName, 'DockerScan Sentinel CLI');
  assert.ok(bundle.scriptContent.includes('#!/bin/bash'));
  assert.ok(bundle.scriptContent.includes('DockerScan Sentinel CLI'));

  const parsedJson = JSON.parse(bundle.licenseJson);
  assert.equal(parsedJson.licenseKey, 'LIC-DS-1234-5678-XX');
  assert.equal(parsedJson.customerEmail, 'lead@enterprise.com');
  assert.equal(parsedJson.pricePaidEur, 29.0);

  assert.ok(bundle.invoiceText.includes('FACTURE OFFICIELLE — IA TOWN'));
  assert.ok(bundle.invoiceText.includes('29.00 €'));
});
