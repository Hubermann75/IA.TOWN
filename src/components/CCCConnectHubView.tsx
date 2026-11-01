/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * CCC.CONNECT HUB — 5-Floor Cutaway Architectural View
 * Codex Collection Connect Rules & Multi-Device Bridges
 */

import React, { useState } from 'react';
import { CCCApp, CCCDevice, DevicePlatform, HubFloorInfo } from '../types/town';
import { 
  Network, 
  ShieldCheck, 
  Radio, 
  RefreshCw, 
  Layers, 
  Smartphone, 
  Monitor, 
  Watch, 
  Tv, 
  Tablet, 
  QrCode, 
  Wifi, 
  Lock, 
  Zap, 
  Bot, 
  CheckCircle2, 
  AlertCircle,
  Play,
  Pause,
  SlidersHorizontal
} from 'lucide-react';

import { DeviceLatencyStabilityChart } from './DeviceLatencyStabilityChart';

interface Props {
  devices: CCCDevice[];
  apps: CCCApp[];
  floors: HubFloorInfo[];
  onOpenQRPairing: (platform?: DevicePlatform) => void;
  onSendCommand: (commandType: any, deviceId?: string) => void;
  companyRunning: boolean;
  miningRunning: boolean;
  simulationPaused: boolean;
  onUpdateDevices?: (devices: CCCDevice[]) => void;
}

export const CCCConnectHubView: React.FC<Props> = ({
  devices,
  apps,
  floors,
  onOpenQRPairing,
  onSendCommand,
  companyRunning,
  miningRunning,
  simulationPaused,
  onUpdateDevices,
}) => {
  const [selectedFloorNum, setSelectedFloorNum] = useState<number>(1);
  const [activePlatformFilter, setActivePlatformFilter] = useState<string>('ALL');

  const selectedFloor = floors.find(f => f.floorNumber === selectedFloorNum) || floors[0];

  const getPlatformIcon = (platform: DevicePlatform) => {
    switch (platform) {
      case 'WINDOWS': return <Monitor className="w-4 h-4 text-sky-400" />;
      case 'ANDROID_PHONE': return <Smartphone className="w-4 h-4 text-emerald-400" />;
      case 'ANDROID_TABLET': return <Tablet className="w-4 h-4 text-teal-400" />;
      case 'WEAR_OS': return <Watch className="w-4 h-4 text-purple-400" />;
      case 'GOOGLE_TV': return <Tv className="w-4 h-4 text-amber-400" />;
    }
  };

  const filteredDevices = devices.filter(d => {
    if (activePlatformFilter === 'ALL') return true;
    return d.platform === activePlatformFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-800/50 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono-code bg-cyan-950 text-cyan-300 border border-cyan-700/60">
                NEXUS-85 · ARCHITECTURE OFFICIELLE CCC
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-mono-code">
                <ShieldCheck className="w-3.5 h-3.5" />
                Codex Collection Connect v2.1
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100 font-cyber flex items-center gap-2">
              CCC.CONNECT HUB — BÂTIMENT EN COUPE 5 ÉTAGES
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl mt-1">
              Centre de supervision intelligent et ponts d'interconnexion entre IA TOWN, les applications Codex Collection Connect et la flotte d'appareils compatibles (Windows, Android, Wear OS, Google TV).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenQRPairing()}
              className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Générer Appairage QR Sécurisé</span>
            </button>
          </div>
        </div>

        {/* Global Live Remote Telemetry Bars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-800/80 font-mono-code text-xs">
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">État Entreprise IA TOWN</span>
            <span className={`font-semibold flex items-center gap-1.5 ${companyRunning ? 'text-emerald-400' : 'text-slate-400'}`}>
              <span className={`w-2 h-2 rounded-full ${companyRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
              {companyRunning ? 'EN SERVICE (Actif)' : 'ARRÊTÉ (Veille)'}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Calcul & Minage CentMine</span>
            <span className={`font-semibold flex items-center gap-1.5 ${miningRunning ? 'text-yellow-400' : 'text-slate-400'}`}>
              <Zap className="w-3.5 h-3.5" />
              {miningRunning ? '840 GH/s (En cours)' : 'MINAGE EN PAUSE'}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Appareils Flotte En Ligne</span>
            <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5" />
              {devices.filter(d => d.status === 'ONLINE').length} / {devices.length} Appareils
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Réseau d'Agents CCC</span>
            <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5" />
              Agents #85 à #94 Opérationnels
            </span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Cutaway Building Left / Floor Telemetry Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 5-Floor Cutaway Visual Diagram (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wide font-cyber">
                COUPE ARCHITECTURALE CCC.CONNECT HUB
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-mono-code">Cliquez sur un étage</span>
          </div>

          {/* Roof: Holographic Antenna */}
          <div className="relative mb-2 rounded-t-xl bg-gradient-to-b from-cyan-950/40 to-slate-900 border-x border-t border-cyan-500/40 p-4 text-center overflow-hidden">
            <div className="absolute inset-0 cyber-grid-dense opacity-30 pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center animate-pulse mb-1">
                <Radio className="w-6 h-6 text-cyan-300" />
              </div>
              <span className="text-xs font-bold text-cyan-200 font-cyber">
                TOIT : ANTENNE DE COMMUNICATION HOLOGRAPHIQUE
              </span>
              <p className="text-[11px] text-cyan-400/80 font-mono-code mt-0.5">
                Diffusion mDNS / WebSockets · Synchronisation temps réel globale
              </p>
            </div>
          </div>

          {/* Floors 5 to 1 (Descending) */}
          <div className="space-y-2 border-x border-b border-slate-800 p-2 rounded-b-xl bg-slate-900/40">
            {floors
              .slice()
              .sort((a, b) => b.floorNumber - a.floorNumber)
              .map((floor) => {
                const isSelected = selectedFloorNum === floor.floorNumber;

                return (
                  <div
                    key={floor.floorNumber}
                    onClick={() => setSelectedFloorNum(floor.floorNumber)}
                    className={`cursor-pointer rounded-xl p-3.5 transition-all duration-150 border ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-400 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-500/50'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs font-mono-code ${
                          isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {floor.floorNumber}
                        </span>
                        <div>
                          <h3 className="text-xs font-bold text-slate-100 font-cyber flex items-center gap-2">
                            {floor.frenchTitle}
                          </h3>
                          <p className="text-[11px] text-slate-400 line-clamp-1">
                            {floor.role}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-cyan-400 font-mono-code block">
                          {floor.metric}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {floor.agents.length} agents · {floor.robotTypes}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Quick Remote Action Trigger Bar at Base of Building */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-slate-400 font-mono-code">Commandes Distantes Authentifiées :</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSendCommand(companyRunning ? 'STOP_COMPANY' : 'START_COMPANY')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  companyRunning
                    ? 'bg-red-950 text-red-300 border border-red-800 hover:bg-red-900'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900'
                }`}
              >
                {companyRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{companyRunning ? 'Stopper Entreprise' : 'Démarrer Entreprise'}</span>
              </button>

              <button
                onClick={() => onSendCommand(miningRunning ? 'STOP_MINING' : 'START_MINING')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  miningRunning
                    ? 'bg-amber-950 text-amber-300 border border-amber-800 hover:bg-amber-900'
                    : 'bg-yellow-950 text-yellow-300 border border-yellow-800 hover:bg-yellow-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{miningRunning ? 'Pause Minage' : 'Démarrer Minage'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Selected Floor Detail & Devices Registry (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Floor Detail Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <span className="text-[10px] text-cyan-400 font-mono-code uppercase tracking-wider block">
                  DÉTAILS OPÉRATIONNELS DU NIVEAU
                </span>
                <h3 className="text-base font-bold text-slate-100 font-cyber">
                  {selectedFloor.frenchTitle}
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-md text-xs font-mono-code bg-emerald-950 text-emerald-400 border border-emerald-800">
                {selectedFloor.status}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-500 block mb-1">Rôle Fondamental & Missions</span>
                <p className="text-slate-300 leading-relaxed">{selectedFloor.role}</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-500 block mb-1.5">Agents Assignés à l'Étage</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedFloor.agents.map((agent, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[11px] font-mono-code bg-slate-800/80 text-cyan-300 border border-slate-700"
                    >
                      {agent}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">Unités Robotiques Déployées</span>
                  <span className="text-slate-200 font-medium">{selectedFloor.robotTypes}</span>
                </div>
                <Bot className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
          </div>

          {/* Connected Devices Fleet Filtered List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide font-cyber">
                  REGISTRE DES APPAREILS APPÉRÉS
                </h3>
              </div>
              <button
                onClick={() => onOpenQRPairing()}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono-code"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>+ Appairer</span>
              </button>
            </div>

            {/* Platform pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-2 text-[11px]">
              {['ALL', 'WINDOWS', 'ANDROID_PHONE', 'WEAR_OS', 'GOOGLE_TV'].map(p => (
                <button
                  key={p}
                  onClick={() => setActivePlatformFilter(p)}
                  className={`px-2 py-0.5 rounded transition-colors whitespace-nowrap ${
                    activePlatformFilter === p
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Devices list */}
            <div className="space-y-2.5 mt-2 max-h-[300px] overflow-y-auto pr-1">
              {filteredDevices.map(device => (
                <div
                  key={device.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-slate-900 border border-slate-800">
                        {getPlatformIcon(device.platform)}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-200 block truncate max-w-[160px]">
                          {device.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono-code">
                          {device.ipAddress} · {device.bridgeAgent}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono-code ${
                      device.status === 'ONLINE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {device.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-900">
                    <div className="flex items-center gap-1.5">
                      <span>{device.firmwareVersion}</span>
                      {typeof device.latencyMs === 'number' && (
                        <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono-code">
                          {device.latencyMs}ms
                        </span>
                      )}
                      {typeof device.stabilityScore === 'number' && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono-code">
                          {device.stabilityScore}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {device.batteryLevel && (
                        <span className="text-slate-400">{device.batteryLevel}% batterie</span>
                      )}
                      <span className="text-cyan-500 font-mono-code">{device.lastSeen}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* D3 Real-Time Fleet Latency & Stability Chart */}
      <DeviceLatencyStabilityChart
        devices={devices}
        onUpdateDevices={onUpdateDevices}
      />
    </div>
  );
};
