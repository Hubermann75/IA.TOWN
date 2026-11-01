/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * CCC.CONNECT HUB — Passerelle Fonctionnelle Windows ⇄ Android
 * Spécification CCC : Synchronisation bidirectionnelle, résolution de conflits, file hors-ligne
 */

export interface SyncParameters {
  theme: 'cyber-dark' | 'high-contrast-neon';
  alertThresholdEur: number;
  autoPauseOnDisconnect: boolean;
  maxHashrateGh: number;
  authorizedMissionsCount: number;
}

export interface SyncRecord {
  id: string;
  timestamp: string;
  direction: 'WINDOWS_TO_ANDROID' | 'ANDROID_TO_WINDOWS';
  initiatorAgent: string;
  payloadType: 'STATE_DELTA' | 'PARAMS_UPDATE' | 'COMMAND_PROPAGATION' | 'QUEUE_DRAIN';
  deltaSummary: string;
  latencyMs: number;
  status: 'SUCCESS' | 'CONFLICT_RESOLVED' | 'QUEUED_OFFLINE';
}

export interface WindowsAndroidBridgeState {
  isConnected: boolean;
  windowsNode: {
    deviceId: string;
    deviceName: string;
    ipAddress: string;
    bridgeAgent: string;
    version: string;
    lastSeen: string;
  };
  androidNode: {
    deviceId: string;
    deviceName: string;
    ipAddress: string;
    bridgeAgent: string;
    version: string;
    batteryLevel: number;
    lastSeen: string;
  };
  parameters: SyncParameters;
  sharedTownState: {
    companyRunning: boolean;
    miningRunning: boolean;
    simulationPaused: boolean;
    lastModifiedBy: 'WINDOWS' | 'ANDROID';
    lastModifiedAt: string;
  };
  offlineQueue: {
    id: string;
    timestamp: string;
    emitter: 'WINDOWS' | 'ANDROID';
    action: string;
    payload: any;
  }[];
  syncHistory: SyncRecord[];
}

export function createInitialBridgeState(): WindowsAndroidBridgeState {
  const now = new Date().toISOString();

  return {
    isConnected: true,
    windowsNode: {
      deviceId: 'dev-win-01',
      deviceName: 'Workstation Studio (Windows 11 Pro)',
      ipAddress: '192.168.1.42',
      bridgeAgent: '89. WINDOWS.BRIDGE',
      version: 'CCC-DESKTOP-v3.4.2',
      lastSeen: now,
    },
    androidNode: {
      deviceId: 'dev-and-phone-02',
      deviceName: 'Pixel 9 Pro (Android 15)',
      ipAddress: '192.168.1.78',
      bridgeAgent: '90. ANDROID.BRIDGE',
      version: 'CCC-MOBILE-v2.9.1',
      batteryLevel: 92,
      lastSeen: now,
    },
    parameters: {
      theme: 'cyber-dark',
      alertThresholdEur: 50,
      autoPauseOnDisconnect: false,
      maxHashrateGh: 840,
      authorizedMissionsCount: 12,
    },
    sharedTownState: {
      companyRunning: true,
      miningRunning: true,
      simulationPaused: false,
      lastModifiedBy: 'WINDOWS',
      lastModifiedAt: now,
    },
    offlineQueue: [],
    syncHistory: [
      {
        id: 'sync-init-1',
        timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        direction: 'WINDOWS_TO_ANDROID',
        initiatorAgent: '89. WINDOWS.BRIDGE',
        payloadType: 'STATE_DELTA',
        deltaSummary: 'Handshake initial établi. Appairage Windows ⇄ Android validé.',
        latencyMs: 1.8,
        status: 'SUCCESS',
      },
    ],
  };
}

/**
 * Propagates a state change between Windows and Android with conflict resolution
 */
export function propagateBridgeState(
  state: WindowsAndroidBridgeState,
  source: 'WINDOWS' | 'ANDROID',
  partialState: Partial<WindowsAndroidBridgeState['sharedTownState']>
): WindowsAndroidBridgeState {
  const now = new Date().toISOString();
  const latency = Number((1.2 + Math.random() * 2.8).toFixed(1));
  const recordId = `sync-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  // If disconnected, queue the action in the offline queue
  if (!state.isConnected) {
    const queuedItem = {
      id: `queue-${Date.now()}`,
      timestamp: now,
      emitter: source,
      action: 'UPDATE_TOWN_STATE',
      payload: partialState,
    };

    return {
      ...state,
      offlineQueue: [...state.offlineQueue, queuedItem],
      syncHistory: [
        {
          id: recordId,
          timestamp: now,
          direction: source === 'WINDOWS' ? 'WINDOWS_TO_ANDROID' : 'ANDROID_TO_WINDOWS',
          initiatorAgent: source === 'WINDOWS' ? state.windowsNode.bridgeAgent : state.androidNode.bridgeAgent,
          payloadType: 'STATE_DELTA',
          deltaSummary: `Réseau indisponible : modification mise en file d'attente hors-ligne (${Object.keys(partialState).join(', ')})`,
          latencyMs: 0,
          status: 'QUEUED_OFFLINE',
        },
        ...state.syncHistory.slice(0, 19),
      ],
    };
  }

  // Conflict resolution: Last Write Wins
  const updatedShared = {
    ...state.sharedTownState,
    ...partialState,
    lastModifiedBy: source,
    lastModifiedAt: now,
  };

  const syncRecord: SyncRecord = {
    id: recordId,
    timestamp: now,
    direction: source === 'WINDOWS' ? 'WINDOWS_TO_ANDROID' : 'ANDROID_TO_WINDOWS',
    initiatorAgent: source === 'WINDOWS' ? state.windowsNode.bridgeAgent : state.androidNode.bridgeAgent,
    payloadType: 'STATE_DELTA',
    deltaSummary: `Delta d'état synchronisé depuis ${source} (${Object.keys(partialState).join(', ')})`,
    latencyMs: latency,
    status: 'SUCCESS',
  };

  return {
    ...state,
    sharedTownState: updatedShared,
    windowsNode: { ...state.windowsNode, lastSeen: now },
    androidNode: { ...state.androidNode, lastSeen: now },
    syncHistory: [syncRecord, ...state.syncHistory.slice(0, 19)],
  };
}

/**
 * Reconnects the bridge and drains the offline queue automatically
 */
export function reconnectAndDrainQueue(state: WindowsAndroidBridgeState): WindowsAndroidBridgeState {
  const now = new Date().toISOString();
  let updatedShared = { ...state.sharedTownState };

  // Drain queued modifications sequentially
  for (const item of state.offlineQueue) {
    if (item.action === 'UPDATE_TOWN_STATE') {
      updatedShared = {
        ...updatedShared,
        ...item.payload,
        lastModifiedBy: item.emitter,
        lastModifiedAt: item.timestamp,
      };
    }
  }

  const drainRecord: SyncRecord = {
    id: `sync-drain-${Date.now()}`,
    timestamp: now,
    direction: 'WINDOWS_TO_ANDROID',
    initiatorAgent: '88. SYNC.MASTER',
    payloadType: 'QUEUE_DRAIN',
    deltaSummary: `Reconnexion établie : ${state.offlineQueue.length} opérations en attente réconciliées avec succès.`,
    latencyMs: 2.4,
    status: 'CONFLICT_RESOLVED',
  };

  return {
    ...state,
    isConnected: true,
    offlineQueue: [],
    sharedTownState: updatedShared,
    windowsNode: { ...state.windowsNode, lastSeen: now },
    androidNode: { ...state.androidNode, lastSeen: now },
    syncHistory: [drainRecord, ...state.syncHistory.slice(0, 19)],
  };
}
