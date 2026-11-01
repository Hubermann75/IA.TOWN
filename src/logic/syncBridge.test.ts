import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialBridgeState,
  propagateBridgeState,
  reconnectAndDrainQueue,
} from './syncBridge';

test('createInitialBridgeState sets up Windows 11 and Android 15 bridge with assigned agents', () => {
  const bridge = createInitialBridgeState();
  assert.equal(bridge.isConnected, true);
  assert.equal(bridge.windowsNode.bridgeAgent, '89. WINDOWS.BRIDGE');
  assert.equal(bridge.androidNode.bridgeAgent, '90. ANDROID.BRIDGE');
  assert.equal(bridge.sharedTownState.companyRunning, true);
  assert.equal(bridge.offlineQueue.length, 0);
});

test('propagateBridgeState updates shared town state and records sync event with low latency', () => {
  const bridge = createInitialBridgeState();
  const updated = propagateBridgeState(bridge, 'ANDROID', { companyRunning: false });

  assert.equal(updated.sharedTownState.companyRunning, false);
  assert.equal(updated.sharedTownState.lastModifiedBy, 'ANDROID');
  assert.equal(updated.syncHistory[0].direction, 'ANDROID_TO_WINDOWS');
  assert.ok(updated.syncHistory[0].latencyMs > 0);
  assert.equal(updated.syncHistory[0].status, 'SUCCESS');
});

test('propagateBridgeState queues offline updates when disconnected and reconnectAndDrainQueue reconciles them', () => {
  let bridge = createInitialBridgeState();
  bridge.isConnected = false; // Disconnect simulated network

  // Try updating state from Windows while offline
  bridge = propagateBridgeState(bridge, 'WINDOWS', { miningRunning: false });
  assert.equal(bridge.offlineQueue.length, 1);
  assert.equal(bridge.syncHistory[0].status, 'QUEUED_OFFLINE');

  // Now reconnect and drain
  const reconnected = reconnectAndDrainQueue(bridge);
  assert.equal(reconnected.isConnected, true);
  assert.equal(reconnected.offlineQueue.length, 0);
  assert.equal(reconnected.sharedTownState.miningRunning, false);
  assert.equal(reconnected.syncHistory[0].status, 'CONFLICT_RESOLVED');
});
