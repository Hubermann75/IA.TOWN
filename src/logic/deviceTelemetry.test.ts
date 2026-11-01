import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateStabilityScore,
  gradeDeviceConnection,
  getFleetTelemetryStats,
  simulateProbePing,
} from './deviceTelemetry';
import { CCCDevice } from '../types/town';

test('calculateStabilityScore - returns 100 for zero latency, zero loss, zero jitter', () => {
  const score = calculateStabilityScore(0, 0, 0);
  assert.equal(score, 100);
});

test('calculateStabilityScore - penalizes packet loss heavily and latency progressively', () => {
  const cleanScore = calculateStabilityScore(10, 0.5, 0);
  assert.ok(cleanScore > 98);

  const lossScore = calculateStabilityScore(10, 0.5, 2.0); // 2% loss
  assert.ok(lossScore < cleanScore);

  const highLatScore = calculateStabilityScore(120, 2, 0);
  assert.ok(highLatScore < 85);
});

test('gradeDeviceConnection - correctly grades various network conditions', () => {
  const gradeOptimal = gradeDeviceConnection(1.5, 99.8);
  assert.equal(gradeOptimal.grade, 'A+');
  assert.equal(gradeOptimal.label, 'Ultra Rapide');

  const gradeNominal = gradeDeviceConnection(35, 93);
  assert.equal(gradeNominal.grade, 'A');

  const gradeAcceptable = gradeDeviceConnection(85, 82);
  assert.equal(gradeAcceptable.grade, 'B');

  const gradeDegraded = gradeDeviceConnection(140, 68);
  assert.equal(gradeDegraded.grade, 'C');

  const gradeCritical = gradeDeviceConnection(250, 40);
  assert.equal(gradeCritical.grade, 'D');
});

test('getFleetTelemetryStats - calculates correct aggregate statistics', () => {
  const mockDevices: CCCDevice[] = [
    {
      id: 'd1',
      name: 'Win11 Master',
      platform: 'WINDOWS',
      bridgeAgent: 'agent-1',
      status: 'ONLINE',
      ipAddress: '192.168.1.10',
      lastSeen: 'now',
      firmwareVersion: 'v1',
      latencyMs: 2.0,
      stabilityScore: 99.5,
      permissions: { canControlCompany: true, canControlMining: true, canViewFinances: true, canDispatchMissions: true },
    },
    {
      id: 'd2',
      name: 'Android Edge',
      platform: 'ANDROID_PHONE',
      bridgeAgent: 'agent-2',
      status: 'ONLINE',
      ipAddress: '192.168.1.11',
      lastSeen: 'now',
      firmwareVersion: 'v1',
      latencyMs: 18.0,
      stabilityScore: 98.0,
      permissions: { canControlCompany: true, canControlMining: true, canViewFinances: true, canDispatchMissions: true },
    },
  ];

  const stats = getFleetTelemetryStats(mockDevices);
  assert.equal(stats.totalDevices, 2);
  assert.equal(stats.onlineDevices, 2);
  assert.equal(stats.avgLatencyMs, 10.0);
  assert.equal(stats.minLatencyMs, 2.0);
  assert.equal(stats.maxLatencyMs, 18.0);
  assert.equal(stats.avgStabilityScore, 98.8);
  assert.equal(stats.healthyCount, 2);
  assert.equal(stats.degradedCount, 0);
  assert.equal(stats.slaCompliancePercent, 100);
});

test('simulateProbePing - applies realistic jitter without crashing', () => {
  const mockDevices: CCCDevice[] = [
    {
      id: 'd1',
      name: 'Win11',
      platform: 'WINDOWS',
      bridgeAgent: 'agent-1',
      status: 'ONLINE',
      ipAddress: '192.168.1.10',
      lastSeen: 'now',
      firmwareVersion: 'v1',
      latencyMs: 2.5,
      stabilityScore: 99.0,
      permissions: { canControlCompany: true, canControlMining: true, canViewFinances: true, canDispatchMissions: true },
    },
  ];

  const updated = simulateProbePing(mockDevices);
  assert.equal(updated.length, 1);
  assert.ok(updated[0].latencyMs! > 0);
  assert.ok(updated[0].stabilityScore! > 90);
  assert.equal(updated[0].lastSeen, 'À l’instant');
});
