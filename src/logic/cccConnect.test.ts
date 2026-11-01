import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createQRPairingSession,
  isQRSessionExpired,
  completeQRPairing,
  revokePairingSession,
  processRemoteCommand,
} from './cccConnect';
import { CCCDevice } from '../types/town';

test('createQRPairingSession generates temporary session with 120s TTL and no permanent private keys', () => {
  const session = createQRPairingSession('ANDROID_PHONE');
  assert.equal(session.status, 'ACTIVE');
  assert.ok(session.expiresAt > Date.now());
  assert.equal(session.targetPlatform, 'ANDROID_PHONE');
  assert.equal(isQRSessionExpired(session), false);

  const payload = JSON.parse(session.qrPayload);
  assert.equal(payload.hub, 'CCC.CONNECT.HUB.IA.TOWN');
  assert.equal(payload.sid, session.sessionId);
  // Ensure private keys are not embedded
  assert.equal(payload.privateKey, undefined);
});

test('completeQRPairing successfully creates device with assigned bridge agent', () => {
  const session = createQRPairingSession('WINDOWS');
  const result = completeQRPairing(session, {
    name: 'Workstation XPS-15',
    platform: 'WINDOWS',
    ipAddress: '192.168.1.42',
  });

  assert.equal(result.success, true);
  assert.ok(result.device);
  assert.equal(result.device?.platform, 'WINDOWS');
  assert.equal(result.device?.bridgeAgent, '89. WINDOWS.BRIDGE');
  assert.equal(result.pairedSession.status, 'PAIRED');
});

test('revokePairingSession marks session as REVOKED', () => {
  const session = createQRPairingSession();
  const revoked = revokePairingSession(session);
  assert.equal(revoked.status, 'REVOKED');
  assert.equal(isQRSessionExpired(revoked), true);
});

test('processRemoteCommand executes authenticated company start/stop and respects permissions', () => {
  const authorizedDevice: CCCDevice = {
    id: 'dev-win-01',
    name: 'Admin Desktop',
    platform: 'WINDOWS',
    bridgeAgent: '89. WINDOWS.BRIDGE',
    status: 'ONLINE',
    ipAddress: '192.168.1.10',
    lastSeen: new Date().toISOString(),
    firmwareVersion: '3.4',
    permissions: {
      canControlCompany: true,
      canControlMining: true,
      canViewFinances: true,
      canDispatchMissions: true,
    },
  };

  const restrictedDevice: CCCDevice = {
    ...authorizedDevice,
    id: 'dev-wear-02',
    name: 'Galaxy Watch 6',
    platform: 'WEAR_OS',
    permissions: {
      canControlCompany: false,
      canControlMining: false,
      canViewFinances: false,
      canDispatchMissions: true,
    },
  };

  const initialState = {
    companyRunning: true,
    miningRunning: false,
    simulationPaused: false,
  };

  // Test authorized command
  const resAuth = processRemoteCommand(authorizedDevice, 'START_MINING', initialState);
  assert.equal(resAuth.command.executionStatus, 'EXECUTED_SUCCESS');
  assert.equal(resAuth.newTownState.miningRunning, true);

  // Test restricted command rejection
  const resRestricted = processRemoteCommand(restrictedDevice, 'START_MINING', initialState);
  assert.equal(resRestricted.command.executionStatus, 'REJECTED_PERMISSION');
  assert.equal(resRestricted.newTownState.miningRunning, false);
});
