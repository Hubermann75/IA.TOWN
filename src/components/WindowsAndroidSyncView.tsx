/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * CCC.CONNECT HUB — Connexion Fonctionnelle Windows ⇄ Android
 * Passerelle de synchronisation bidirectionnelle officielle Codex Collection Connect
 */

import React, { useState } from 'react';
import { 
  createInitialBridgeState, 
  propagateBridgeState, 
  reconnectAndDrainQueue, 
  WindowsAndroidBridgeState 
} from '../logic/syncBridge';
import { 
  Monitor, 
  Smartphone, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Zap, 
  Play, 
  Pause, 
  ShieldCheck, 
  ArrowLeftRight, 
  Sliders, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Database
} from 'lucide-react';

interface Props {
  onSyncStateToGlobal: (newState: { companyRunning: boolean; miningRunning: boolean }) => void;
}

export const WindowsAndroidSyncView: React.FC<Props> = ({ onSyncStateToGlobal }) => {
  const [bridge, setBridge] = useState<WindowsAndroidBridgeState>(createInitialBridgeState);

  const handleUpdateFromWindows = (field: 'companyRunning' | 'miningRunning') => {
    const currentVal = bridge.sharedTownState[field];
    const updated = propagateBridgeState(bridge, 'WINDOWS', { [field]: !currentVal });
    setBridge(updated);
    onSyncStateToGlobal({
      companyRunning: updated.sharedTownState.companyRunning,
      miningRunning: updated.sharedTownState.miningRunning,
    });
  };

  const handleUpdateFromAndroid = (field: 'companyRunning' | 'miningRunning') => {
    const currentVal = bridge.sharedTownState[field];
    const updated = propagateBridgeState(bridge, 'ANDROID', { [field]: !currentVal });
    setBridge(updated);
    onSyncStateToGlobal({
      companyRunning: updated.sharedTownState.companyRunning,
      miningRunning: updated.sharedTownState.miningRunning,
    });
  };

  const handleToggleConnection = () => {
    if (bridge.isConnected) {
      setBridge(prev => ({ ...prev, isConnected: false }));
    } else {
      const reconnected = reconnectAndDrainQueue(bridge);
      setBridge(reconnected);
      onSyncStateToGlobal({
        companyRunning: reconnected.sharedTownState.companyRunning,
        miningRunning: reconnected.sharedTownState.miningRunning,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border border-sky-800/50 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
              AGENTS #89 WINDOWS.BRIDGE & #90 ANDROID.BRIDGE
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-emerald-400 font-mono-code flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Lien IPC & Sockets Chiffré Actif
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 font-cyber">
            PASSERELLE FONCTIONNELLE WINDOWS ⇄ ANDROID
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Communication bi-directionnelle temps réel, synchronisation d'état décentralisée, résolution automatique de conflits et gestion de file hors-ligne.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleConnection}
            className={`px-4 py-2 rounded-xl text-xs font-mono-code flex items-center gap-1.5 transition-colors cursor-pointer ${
              bridge.isConnected
                ? 'bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900'
                : 'bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900'
            }`}
          >
            {bridge.isConnected ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            <span>{bridge.isConnected ? 'Simuler Déconnexion Réseau' : 'Rétablir Lien & Vider File'}</span>
          </button>
        </div>
      </div>

      {/* Main Visual Bridge: Windows Node (Left) ⇄ Sync Channel (Center) ⇄ Android Node (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Windows Node (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-sky-500/50 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-sky-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-cyber">
                  NOEUD WINDOWS DESKTOP
                </h3>
                <span className="text-[10px] text-slate-400 font-mono-code">
                  {bridge.windowsNode.deviceName}
                </span>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono-code bg-sky-950 text-sky-300 border border-sky-800">
              {bridge.windowsNode.bridgeAgent}
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono-code">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between">
              <span className="text-slate-400">Adresse IP :</span>
              <span className="text-slate-200">{bridge.windowsNode.ipAddress}</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between">
              <span className="text-slate-400">Version CCC :</span>
              <span className="text-cyan-400">{bridge.windowsNode.version}</span>
            </div>

            {/* Local Windows Controls to propagate */}
            <div className="pt-2 space-y-2">
              <span className="text-[11px] text-slate-400 block font-cyber">Actions Émises depuis Windows :</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleUpdateFromWindows('companyRunning')}
                  className="p-2.5 rounded-lg bg-sky-950/70 hover:bg-sky-900 border border-sky-800 text-sky-300 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {bridge.sharedTownState.companyRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{bridge.sharedTownState.companyRunning ? 'Arrêter Ville' : 'Démarrer Ville'}</span>
                </button>
                <button
                  onClick={() => handleUpdateFromWindows('miningRunning')}
                  className="p-2.5 rounded-lg bg-yellow-950/70 hover:bg-yellow-900 border border-yellow-800 text-yellow-300 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{bridge.sharedTownState.miningRunning ? 'Stop Minage' : 'Start Minage'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Central Sync Transmission Channel (2 cols) */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center p-3 text-center space-y-2 font-mono-code">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${
            bridge.isConnected
              ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/20 animate-pulse'
              : 'bg-rose-950/80 border-rose-600 text-rose-300'
          }`}>
            <ArrowLeftRight className="w-5 h-5" />
          </div>

          <span className={`text-[11px] font-bold ${bridge.isConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
            {bridge.isConnected ? 'CANAL ÉTABLI' : 'RUPTURE LIEN'}
          </span>

          <span className="text-[10px] text-slate-500">
            {bridge.isConnected ? 'Latence : 1.8 ms' : 'En attente socket'}
          </span>

          {bridge.offlineQueue.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
              {bridge.offlineQueue.length} delta(s) en file
            </span>
          )}
        </div>

        {/* Android Node (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-emerald-500/50 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-cyber">
                  NOEUD ANDROID COMPANION
                </h3>
                <span className="text-[10px] text-slate-400 font-mono-code">
                  {bridge.androidNode.deviceName}
                </span>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono-code bg-emerald-950 text-emerald-400 border border-emerald-800">
              {bridge.androidNode.bridgeAgent}
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono-code">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between">
              <span className="text-slate-400">Adresse IP :</span>
              <span className="text-slate-200">{bridge.androidNode.ipAddress}</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between">
              <span className="text-slate-400">Batterie Mobile :</span>
              <span className="text-emerald-400">{bridge.androidNode.batteryLevel}%</span>
            </div>

            {/* Local Android Controls to propagate */}
            <div className="pt-2 space-y-2">
              <span className="text-[11px] text-slate-400 block font-cyber">Actions Émises depuis Android :</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleUpdateFromAndroid('companyRunning')}
                  className="p-2.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {bridge.sharedTownState.companyRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{bridge.sharedTownState.companyRunning ? 'Arrêter Ville' : 'Démarrer Ville'}</span>
                </button>
                <button
                  onClick={() => handleUpdateFromAndroid('miningRunning')}
                  className="p-2.5 rounded-lg bg-yellow-950/70 hover:bg-yellow-900 border border-yellow-800 text-yellow-300 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{bridge.sharedTownState.miningRunning ? 'Stop Minage' : 'Start Minage'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shared State Synchronization Result Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase font-cyber">
              ÉTAT DU REGISTRE SYNCHRONISÉ (DÉTERMINISME CCC)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono-code">
            Dernière mise à jour par : <span className="text-cyan-300 font-bold">{bridge.sharedTownState.lastModifiedBy}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono-code text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">État Entreprise</span>
            <span className={`text-base font-bold ${bridge.sharedTownState.companyRunning ? 'text-emerald-400' : 'text-slate-500'}`}>
              {bridge.sharedTownState.companyRunning ? 'EN SERVICE (Actif)' : 'ARRÊTÉE (Veille)'}
            </span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Calcul CentMine</span>
            <span className={`text-base font-bold ${bridge.sharedTownState.miningRunning ? 'text-yellow-400' : 'text-slate-500'}`}>
              {bridge.sharedTownState.miningRunning ? '840 GH/s (En cours)' : 'MINAGE PAUSE'}
            </span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Résolution Conflit</span>
            <span className="text-base font-bold text-cyan-300">
              Last-Write-Wins (LWW)
            </span>
          </div>
        </div>

        {/* Sync History Stream */}
        <div>
          <span className="text-xs font-semibold text-slate-400 font-mono-code block mb-2">
            Journal des échanges de paquets delta Windows ⇄ Android :
          </span>
          <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
            {bridge.syncHistory.map(rec => (
              <div
                key={rec.id}
                className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono-code flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-slate-200">{rec.deltaSummary}</span>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {rec.direction} · Latence : {rec.latencyMs}ms · {rec.initiatorAgent}
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded ${
                  rec.status === 'SUCCESS' ? 'text-emerald-400 bg-emerald-950 border border-emerald-800' :
                  rec.status === 'CONFLICT_RESOLVED' ? 'text-cyan-400 bg-cyan-950 border border-cyan-800' :
                  'text-amber-400 bg-amber-950 border border-amber-800'
                }`}>
                  {rec.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
