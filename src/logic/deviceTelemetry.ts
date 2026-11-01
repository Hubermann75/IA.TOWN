/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Pure logic module for CCC Device Telemetry & Network Health Analytics.
 */

import { CCCDevice } from '../types/town';

export interface DeviceTelemetryGrade {
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface FleetTelemetryStats {
  totalDevices: number;
  onlineDevices: number;
  avgLatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  avgStabilityScore: number;
  healthyCount: number; // Grade A+ or A
  degradedCount: number; // Grade B, C, or D
  slaCompliancePercent: number; // Devices with latency < 50ms and stability >= 90%
}

/**
 * Calculates a normalized connection stability score (0 to 100%)
 * based on latency, jitter, and packet loss.
 */
export function calculateStabilityScore(
  latencyMs: number,
  jitterMs: number = 0,
  packetLossPercent: number = 0
): number {
  if (latencyMs < 0) return 0;
  
  // Penalties
  const packetLossPenalty = Math.max(0, packetLossPercent) * 18;
  const latencyPenalty = Math.max(0, latencyMs - 20) * 0.18;
  const jitterPenalty = Math.max(0, jitterMs) * 0.9;

  const rawScore = 100 - packetLossPenalty - latencyPenalty - jitterPenalty;
  const clamped = Math.max(0, Math.min(100, rawScore));
  return Math.round(clamped * 10) / 10;
}

/**
 * Assigns a network health grade based on latency and stability score.
 */
export function gradeDeviceConnection(
  latencyMs: number,
  stabilityScore: number
): DeviceTelemetryGrade {
  if (stabilityScore >= 98 && latencyMs <= 25) {
    return {
      grade: 'A+',
      label: 'Ultra Rapide',
      color: '#10b981', // Emerald
      bgColor: 'rgba(16, 185, 129, 0.15)',
      borderColor: 'rgba(16, 185, 129, 0.4)',
    };
  }

  if (stabilityScore >= 92 && latencyMs <= 50) {
    return {
      grade: 'A',
      label: 'Nominal',
      color: '#00f3ff', // Cyan
      bgColor: 'rgba(0, 243, 255, 0.15)',
      borderColor: 'rgba(0, 243, 255, 0.4)',
    };
  }

  if (stabilityScore >= 80 && latencyMs <= 100) {
    return {
      grade: 'B',
      label: 'Acceptable',
      color: '#f59e0b', // Amber
      bgColor: 'rgba(245, 158, 11, 0.15)',
      borderColor: 'rgba(245, 158, 11, 0.4)',
    };
  }

  if (stabilityScore >= 65) {
    return {
      grade: 'C',
      label: 'Dégradé',
      color: '#f97316', // Orange
      bgColor: 'rgba(249, 115, 22, 0.15)',
      borderColor: 'rgba(249, 115, 22, 0.4)',
    };
  }

  return {
    grade: 'D',
    label: 'Critique',
    color: '#ef4444', // Red
    bgColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  };
}

/**
 * Computes aggregate fleet statistics across all active devices.
 */
export function getFleetTelemetryStats(devices: CCCDevice[]): FleetTelemetryStats {
  if (!devices || devices.length === 0) {
    return {
      totalDevices: 0,
      onlineDevices: 0,
      avgLatencyMs: 0,
      minLatencyMs: 0,
      maxLatencyMs: 0,
      avgStabilityScore: 0,
      healthyCount: 0,
      degradedCount: 0,
      slaCompliancePercent: 100,
    };
  }

  const online = devices.filter(d => d.status === 'ONLINE' || d.status === 'SYNCING');
  const validDevices = devices.filter(d => typeof d.latencyMs === 'number' && typeof d.stabilityScore === 'number');

  if (validDevices.length === 0) {
    return {
      totalDevices: devices.length,
      onlineDevices: online.length,
      avgLatencyMs: 0,
      minLatencyMs: 0,
      maxLatencyMs: 0,
      avgStabilityScore: 0,
      healthyCount: 0,
      degradedCount: 0,
      slaCompliancePercent: 100,
    };
  }

  const latencies = validDevices.map(d => d.latencyMs || 0);
  const stabilities = validDevices.map(d => d.stabilityScore || 0);

  const sumLatency = latencies.reduce((acc, v) => acc + v, 0);
  const sumStability = stabilities.reduce((acc, v) => acc + v, 0);

  let healthy = 0;
  let degraded = 0;
  let slaCompliant = 0;

  validDevices.forEach(d => {
    const lat = d.latencyMs || 0;
    const stab = d.stabilityScore || 0;
    const gradeInfo = gradeDeviceConnection(lat, stab);
    if (gradeInfo.grade === 'A+' || gradeInfo.grade === 'A') {
      healthy++;
    } else {
      degraded++;
    }

    if (lat <= 50 && stab >= 90) {
      slaCompliant++;
    }
  });

  return {
    totalDevices: devices.length,
    onlineDevices: online.length,
    avgLatencyMs: Math.round((sumLatency / validDevices.length) * 10) / 10,
    minLatencyMs: Math.round(Math.min(...latencies) * 10) / 10,
    maxLatencyMs: Math.round(Math.max(...latencies) * 10) / 10,
    avgStabilityScore: Math.round((sumStability / validDevices.length) * 10) / 10,
    healthyCount: healthy,
    degradedCount: degraded,
    slaCompliancePercent: Math.round((slaCompliant / validDevices.length) * 100),
  };
}

/**
 * Simulates an active ping probe across devices with realistic hardware micro-jitter.
 */
export function simulateProbePing(devices: CCCDevice[]): CCCDevice[] {
  return devices.map(device => {
    if (device.status === 'OFFLINE') {
      return device;
    }

    const currentLat = device.latencyMs ?? 20;
    // Micro-jitter: +/- 10%
    const jitterFactor = (Math.random() - 0.48) * 0.2;
    let nextLat = Math.max(1.0, currentLat * (1 + jitterFactor));
    
    // Platform typical constraints
    if (device.platform === 'WINDOWS') {
      nextLat = Math.min(6.0, Math.max(1.1, nextLat));
    } else if (device.platform === 'ANDROID_PHONE') {
      nextLat = Math.min(30.0, Math.max(8.0, nextLat));
    } else if (device.platform === 'WEAR_OS') {
      nextLat = Math.min(65.0, Math.max(30.0, nextLat));
    }

    const jitterMs = Math.round((Math.random() * 2.0 + 0.1) * 10) / 10;
    const packetLoss = device.status === 'STANDBY' ? 0.3 : Math.random() < 0.8 ? 0.0 : 0.1;
    const stabilityScore = calculateStabilityScore(nextLat, jitterMs, packetLoss);

    return {
      ...device,
      latencyMs: Math.round(nextLat * 10) / 10,
      jitterMs,
      packetLoss,
      stabilityScore,
      lastSeen: 'À l’instant',
    };
  });
}
