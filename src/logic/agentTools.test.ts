import assert from 'node:assert/strict';
import test from 'node:test';
import { AGENT_REGISTRY } from '../data/agentRegistry';
import {
  calculateMarginScenario,
  parseMarginCalculationInput,
  runMarginCalculator,
} from './agentDeterministicExecutors';
import { authorizeAgentCapability } from './agentPermissionEngine';
import { executeRegisteredAgentTool, getAgentExecutionMode, getAgentTools } from './agentToolRegistry';

const marginAgent = AGENT_REGISTRY.find(agent => agent.name === 'MARGIN.PREDICTOR')!;
const mission = JSON.stringify({
  unitPriceEur: 29,
  variableCostPerUnitEur: 4.75,
  fixedCostsEur: 100,
  plannedUnits: 10,
});

test('margin role has exactly one local deterministic tool behind an explicit runtime grant', () => {
  assert.equal(getAgentExecutionMode(marginAgent), 'DETERMINISTIC');
  assert.equal(getAgentTools(marginAgent).length, 1);
  assert.equal(getAgentTools(marginAgent)[0].sideEffects, false);
  assert.equal(getAgentTools(marginAgent)[0].costEur, 0);
  assert.deepEqual(getAgentTools(marginAgent)[0].targetV6Role, { id: '82', name: 'MARGIN.CALCULATOR', building: 'OPPORTUNITY.LAB' });
  assert.equal(authorizeAgentCapability(marginAgent, 'LOCAL_MARGIN_CALCULATION'), true);

  const copiedProfile = { ...marginAgent, name: 'UNREGISTERED.AGENT' };
  assert.equal(authorizeAgentCapability(copiedProfile, 'LOCAL_MARGIN_CALCULATION'), false);
  assert.equal(getAgentTools(copiedProfile).length, 0);
});

test('margin input is strict JSON with bounded finite values', () => {
  assert.deepEqual(parseMarginCalculationInput(mission), {
    unitPriceEur: 29,
    variableCostPerUnitEur: 4.75,
    fixedCostsEur: 100,
    plannedUnits: 10,
  });
  assert.throws(() => parseMarginCalculationInput('not json'));
  assert.throws(() => parseMarginCalculationInput(JSON.stringify({ ...JSON.parse(mission), execute: 'rm -rf' })));
  assert.throws(() => parseMarginCalculationInput(JSON.stringify({ ...JSON.parse(mission), plannedUnits: 1.5 })));
  assert.throws(() => parseMarginCalculationInput(JSON.stringify({ ...JSON.parse(mission), unitPriceEur: Number.POSITIVE_INFINITY })));
  assert.throws(() => parseMarginCalculationInput(JSON.stringify({ ...JSON.parse(mission), unitPriceEur: 0.001 })), /0,01/);
});

test('margin calculator returns reproducible scenario values and zero confirmed revenue', () => {
  const data = calculateMarginScenario(parseMarginCalculationInput(mission));
  assert.equal(data.contributionPerUnitEur, 24.25);
  assert.equal(data.breakEvenUnits, 5);
  assert.equal(data.projectedRevenueEur, 290);
  assert.equal(data.projectedTotalCostsEur, 147.5);
  assert.equal(data.projectedOperatingResultEur, 142.5);
  assert.equal(data.confirmedRevenueEur, 0);

  const result = runMarginCalculator(marginAgent, 'task-margin-1', mission, '2026-11-02T12:00:00.000Z');
  assert.equal(result.resultKind, 'DETERMINISTIC_RESULT');
  assert.equal(result.externalActionExecuted, false);
  assert.match(result.output, /ne prouvent aucune vente ni aucun encaissement/);
});

test('registered tool cannot be invoked under another profile or tool identifier', () => {
  assert.throws(() => executeRegisteredAgentTool(marginAgent, 'unknown.tool', 'task-x', mission));
  assert.throws(() => executeRegisteredAgentTool({ ...marginAgent, name: 'OTHER' }, 'opportunity.margin-calculator.v1', 'task-x', mission));
});
