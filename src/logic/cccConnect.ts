/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * CCC.CONNECT HUB — Core Protocols & Device Sync Logic
 * Codex Collection Connect Rules:
 * - Temporary tokens with TTL expiration
 * - Never store raw private credentials in QR codes
 * - Commands must be authenticated & logged
 * - Sending a command != execution proof (explicit state transitions)
 */

import { CCCDevice, DevicePlatform, QRPairingSession, RemoteCommand } from '../types/town';

export const QR_SESSION_TTL_MS = 120 * 1000; // 120 seconds TTL

/**
 * Generates a temporary pairing session for CCC devices
 */
export function createQRPairingSession(targetPlatform?: DevicePlatform): QRPairingSession {
  const sessionId = `ccc-sess-${Math.random().toString(36).substring(2, 9)}`;
  const token = `ccc-token-${Math.random().toString(36).substring(2, 11)}-${Date.now()}`;
  const pairingCodeShort = Math.floor(100000 + Math.random() * 900000).toString();
  const now = Date.now();

  const qrPayload = JSON.stringify({
    hub: 'CCC.CONNECT.HUB.IA.TOWN',
    protocol: 'CCC_V2.1',
    sid: sessionId,
    token,
    code: pairingCodeShort,
    exp: now + QR_SESSION_TTL_MS,
    target: targetPlatform ?? 'ALL',
  });

  return {
    sessionId,
    token,
    qrPayload,
    createdAt: now,
    expiresAt: now + QR_SESSION_TTL_MS,
    targetPlatform,
    status: 'ACTIVE',
    pairingCodeShort,
  };
}

/**
 * Checks if a pairing session is expired
 */
export function isQRSessionExpired(session: QRPairingSession): boolean {
  if (session.status === 'EXPIRED' || session.status === 'REVOKED') return true;
  return Date.now() > session.expiresAt;
}

/**
 * Validates and pairs a device through the session
 */
export function completeQRPairing(
  session: QRPairingSession,
  deviceMeta: {
    name: string;
    platform: DevicePlatform;
    ipAddress: string;
  }
): {
  success: boolean;
  pairedSession: QRPairingSession;
  device?: CCCDevice;
  error?: string;
} {
  if (isQRSessionExpired(session)) {
    return {
      success: false,
      pairedSession: { ...session, status: 'EXPIRED' },
      error: 'La session QR a expiré (délai de 120s dépassé). Veuillez régénérer un code.',
    };
  }

  if (session.status !== 'ACTIVE') {
    return {
      success: false,
      pairedSession: session,
      error: `La session n'est plus active (statut: ${session.status})`,
    };
  }

  const newDeviceId = `dev-${deviceMeta.platform.toLowerCase()}-${Date.now().toString().slice(-4)}`;
  
  // Assign appropriate bridge agent based on platform
  let bridgeAgent = '94. CONNECTION.GUARD';
  switch (deviceMeta.platform) {
    case 'WINDOWS':
      bridgeAgent = '89. WINDOWS.BRIDGE';
      break;
    case 'ANDROID_PHONE':
    case 'ANDROID_TABLET':
      bridgeAgent = '90. ANDROID.BRIDGE';
      break;
    case 'WEAR_OS':
      bridgeAgent = '91. WEAR.BRIDGE';
      break;
    case 'GOOGLE_TV':
      bridgeAgent = '92. TV.BRIDGE';
      break;
  }

  const newDevice: CCCDevice = {
    id: newDeviceId,
    name: deviceMeta.name,
    platform: deviceMeta.platform,
    bridgeAgent,
    status: 'ONLINE',
    ipAddress: deviceMeta.ipAddress,
    batteryLevel: deviceMeta.platform.includes('ANDROID') || deviceMeta.platform === 'WEAR_OS' ? 88 : undefined,
    lastSeen: new Date().toISOString(),
    firmwareVersion: 'CCC-OS-3.4.1',
    permissions: {
      canControlCompany: true,
      canControlMining: deviceMeta.platform !== 'WEAR_OS', // Watches have limited admin
      canViewFinances: deviceMeta.platform !== 'GOOGLE_TV', // TVs avoid showing private finances
      canDispatchMissions: true,
    },
  };

  const updatedSession: QRPairingSession = {
    ...session,
    status: 'PAIRED',
    pairedDeviceId: newDeviceId,
  };

  return {
    success: true,
    pairedSession: updatedSession,
    device: newDevice,
  };
}

/**
 * Revokes a session or device pairing
 */
export function revokePairingSession(session: QRPairingSession): QRPairingSession {
  return {
    ...session,
    status: 'REVOKED',
  };
}

/**
 * Validates and executes a remote command from a paired device
 */
export function processRemoteCommand(
  device: CCCDevice,
  commandType: RemoteCommand['commandType'],
  currentTownState: {
    companyRunning: boolean;
    miningRunning: boolean;
    simulationPaused: boolean;
  }
): {
  command: RemoteCommand;
  newTownState: {
    companyRunning: boolean;
    miningRunning: boolean;
    simulationPaused: boolean;
  };
} {
  const commandId = `cmd-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const nowIso = new Date().toISOString();

  // Permission checks
  if (
    (commandType === 'START_COMPANY' || commandType === 'STOP_COMPANY') &&
    !device.permissions.canControlCompany
  ) {
    return {
      command: {
        id: commandId,
        commandType,
        issuedByDevice: device.id,
        issuedAt: nowIso,
        executed: false,
        executionStatus: 'REJECTED_PERMISSION',
        responsePayload: `Refusé: l'appareil ${device.name} n'a pas la permission de contrôle d'entreprise.`,
      },
      newTownState: currentTownState,
    };
  }

  if (
    (commandType === 'START_MINING' || commandType === 'STOP_MINING') &&
    !device.permissions.canControlMining
  ) {
    return {
      command: {
        id: commandId,
        commandType,
        issuedByDevice: device.id,
        issuedAt: nowIso,
        executed: false,
        executionStatus: 'REJECTED_PERMISSION',
        responsePayload: `Refusé: l'appareil ${device.name} (${device.platform}) n'a pas la permission de minage.`,
      },
      newTownState: currentTownState,
    };
  }

  // Execute state update
  const newTownState = { ...currentTownState };
  let payloadMsg = '';

  switch (commandType) {
    case 'START_COMPANY':
      newTownState.companyRunning = true;
      payloadMsg = 'Entreprise IA TOWN démarrée avec succès';
      break;
    case 'STOP_COMPANY':
      newTownState.companyRunning = false;
      payloadMsg = 'Entreprise IA TOWN stoppée en mode sécurisé';
      break;
    case 'START_MINING':
      newTownState.miningRunning = true;
      payloadMsg = 'Minage CentMine activé sur le cluster';
      break;
    case 'STOP_MINING':
      newTownState.miningRunning = false;
      payloadMsg = 'Minage CentMine suspendu';
      break;
    case 'PAUSE_ALL':
      newTownState.simulationPaused = true;
      payloadMsg = 'Toutes les opérations IA TOWN sont en pause';
      break;
    case 'RESUME_ALL':
      newTownState.simulationPaused = false;
      payloadMsg = 'Opérations IA TOWN reprises';
      break;
    case 'EMERGENCY_FREEZE':
      newTownState.companyRunning = false;
      newTownState.miningRunning = false;
      newTownState.simulationPaused = true;
      payloadMsg = 'GEL D’URGENCE DÉCLENCHÉ PAR SECURITY.CORE & CONNECTION.GUARD';
      break;
    default:
      payloadMsg = `Commande ${commandType} exécutée`;
  }

  return {
    command: {
      id: commandId,
      commandType,
      issuedByDevice: device.id,
      issuedAt: nowIso,
      executed: true,
      executionStatus: 'EXECUTED_SUCCESS',
      responsePayload: payloadMsg,
    },
    newTownState,
  };
}
