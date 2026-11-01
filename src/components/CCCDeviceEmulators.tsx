/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * CCC.CONNECT HUB — Émulateurs Multi-Plateformes (Windows, Android, Wear OS, Google TV)
 * Supervision et contrôle distant depuis tous les appareils de l'écosystème Codex Collection Connect
 */

import React, { useState } from 'react';
import { CCCDevice, DevicePlatform, RemoteCommand } from '../types/town';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Watch, 
  Tv, 
  Play, 
  Pause, 
  Zap, 
  Wifi, 
  WifiOff, 
  ShieldAlert, 
  RefreshCw, 
  Battery, 
  Activity, 
  Send,
  CheckCircle2,
  Bell
} from 'lucide-react';

interface Props {
  devices: CCCDevice[];
  onSendCommand: (commandType: RemoteCommand['commandType'], deviceId: string) => void;
  companyRunning: boolean;
  miningRunning: boolean;
  simulationPaused: boolean;
  netBankedProfit: number;
}

export const CCCDeviceEmulators: React.FC<Props> = ({
  devices,
  onSendCommand,
  companyRunning,
  miningRunning,
  simulationPaused,
  netBankedProfit,
}) => {
  const [activePlatform, setActivePlatform] = useState<DevicePlatform>('ANDROID_PHONE');
  const [networkInterrupted, setNetworkInterrupted] = useState<boolean>(false);
  const [simulatedLatencyMs, setSimulatedLatencyMs] = useState<number>(14);

  // Find or default device matching the platform
  const currentDevice = devices.find(d => d.platform === activePlatform) || devices[0];

  const handleToggleNetwork = () => {
    setNetworkInterrupted(prev => !prev);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              CODEX COLLECTION CONNECT (CCC) MULTI-DEVICE
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-emerald-400 font-mono-code">
              5 Plateformes Cibles Déployées
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 font-cyber">
            ÉMULATEUR MULTI-APPAREILS : CONTRÔLE ET SUPERVISION DISTANTE
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Supervisez et contrôlez IA TOWN depuis Windows, Android Smartphone, Android Tablette, Wear OS ou Google TV. Testez les déconnexions, reconnexions automatiques et synchronisations d'état.
          </p>
        </div>

        {/* Network disruption simulator */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleNetwork}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono-code flex items-center gap-1.5 transition-colors cursor-pointer ${
              networkInterrupted
                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            {networkInterrupted ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{networkInterrupted ? 'Réseau Interrompu (Hors-Ligne)' : 'Réseau Connecté (14ms)'}</span>
          </button>
        </div>
      </div>

      {/* Platform Switcher Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono-code">
        <button
          onClick={() => setActivePlatform('ANDROID_PHONE')}
          className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activePlatform === 'ANDROID_PHONE'
              ? 'bg-emerald-950 text-emerald-300 border-emerald-500 shadow-md shadow-emerald-500/10 font-bold'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Android Smartphone</span>
        </button>

        <button
          onClick={() => setActivePlatform('WEAR_OS')}
          className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activePlatform === 'WEAR_OS'
              ? 'bg-purple-950 text-purple-300 border-purple-500 shadow-md shadow-purple-500/10 font-bold'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
          }`}
        >
          <Watch className="w-4 h-4" />
          <span>Wear OS (Montre)</span>
        </button>

        <button
          onClick={() => setActivePlatform('WINDOWS')}
          className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activePlatform === 'WINDOWS'
              ? 'bg-sky-950 text-sky-300 border-sky-500 shadow-md shadow-sky-500/10 font-bold'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
          }`}
        >
          <Monitor className="w-4 h-4" />
          <span>Windows Desktop</span>
        </button>

        <button
          onClick={() => setActivePlatform('ANDROID_TABLET')}
          className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activePlatform === 'ANDROID_TABLET'
              ? 'bg-teal-950 text-teal-300 border-teal-500 shadow-md shadow-teal-500/10 font-bold'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
          }`}
        >
          <Tablet className="w-4 h-4" />
          <span>Android Tablette</span>
        </button>

        <button
          onClick={() => setActivePlatform('GOOGLE_TV')}
          className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activePlatform === 'GOOGLE_TV'
              ? 'bg-amber-950 text-amber-300 border-amber-500 shadow-md shadow-amber-500/10 font-bold'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
          }`}
        >
          <Tv className="w-4 h-4" />
          <span>Google TV</span>
        </button>
      </div>

      {/* Interactive Device Shell Presentation */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden">
        {/* Device metadata tag */}
        <div className="absolute top-4 left-6 flex items-center gap-2 text-xs font-mono-code">
          <span className="text-slate-500">Appareil actif :</span>
          <span className="text-slate-200 font-semibold">{currentDevice?.name}</span>
          <span className="text-slate-500">·</span>
          <span className="text-cyan-400">{currentDevice?.bridgeAgent}</span>
          {networkInterrupted && (
            <span className="text-rose-400 font-bold animate-pulse">
              [FILE D'ATTENTE HORS-LIGNE ACTIVE]
            </span>
          )}
        </div>

        {/* 1. WEAR OS EMULATOR (Circular Watch Dial) */}
        {activePlatform === 'WEAR_OS' && (
          <div className="w-72 h-72 rounded-full bg-slate-900 border-4 border-slate-700 shadow-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden ring-4 ring-purple-900/40">
            <div className="absolute top-4 text-[10px] font-mono-code text-purple-400 flex items-center gap-1">
              <Watch className="w-3 h-3" />
              <span>CCC WEAR OS</span>
            </div>

            <div className="my-auto space-y-2 font-mono-code">
              <div className="text-lg font-bold text-slate-100 font-cyber">
                {companyRunning ? 'ENTREPRISE ON' : 'ENTREPRISE OFF'}
              </div>

              <div className="text-xs text-amber-400 flex items-center justify-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                <span>{miningRunning ? '840 GH/s' : '0 GH/s'}</span>
              </div>

              <div className="text-[11px] text-cyan-300">
                Net : +{netBankedProfit.toFixed(0)} €
              </div>

              <div className="flex gap-2 justify-center pt-1">
                <button
                  onClick={() => onSendCommand(companyRunning ? 'STOP_COMPANY' : 'START_COMPANY', currentDevice.id)}
                  disabled={networkInterrupted}
                  className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs cursor-pointer disabled:opacity-40"
                  title="Basculer Entreprise"
                >
                  {companyRunning ? <Pause className="w-4 h-4 text-rose-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
                </button>

                <button
                  onClick={() => onSendCommand('EMERGENCY_FREEZE', currentDevice.id)}
                  disabled={networkInterrupted}
                  className="p-2.5 rounded-full bg-red-950 hover:bg-red-900 border border-red-700 text-red-200 text-xs cursor-pointer disabled:opacity-40"
                  title="Gel d'Urgence"
                >
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>

            <div className="absolute bottom-4 text-[9px] text-slate-500 font-mono-code">
              {networkInterrupted ? 'HORS LIGNE' : 'SYNC BLE · 100%'}
            </div>
          </div>
        )}

        {/* 2. ANDROID SMARTPHONE EMULATOR (Phone Screen) */}
        {activePlatform === 'ANDROID_PHONE' && (
          <div className="w-80 rounded-3xl bg-slate-900 border-4 border-slate-700 shadow-2xl p-4 flex flex-col font-mono-code text-xs relative overflow-hidden ring-4 ring-emerald-950/40">
            {/* Phone notch bar */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 pb-3 border-b border-slate-800">
              <span>09:41</span>
              <div className="w-16 h-3.5 bg-slate-950 rounded-full mx-auto" />
              <div className="flex items-center gap-1">
                {networkInterrupted ? <WifiOff className="w-3 h-3 text-rose-400" /> : <Wifi className="w-3 h-3 text-emerald-400" />}
                <Battery className="w-3 h-3 text-slate-300" />
              </div>
            </div>

            {/* App UI */}
            <div className="py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100 font-cyber">CCC MOBILE COMPANION</span>
                <span className="text-[10px] text-emerald-400">v2.9.1</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500">Trésorerie Réelle Encaissée</span>
                <div className="text-xl font-bold text-emerald-400 font-mono-code">
                  +{netBankedProfit.toFixed(2)} €
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <button
                  onClick={() => onSendCommand(companyRunning ? 'STOP_COMPANY' : 'START_COMPANY', currentDevice.id)}
                  disabled={networkInterrupted}
                  className={`p-2.5 rounded-lg border flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 ${
                    companyRunning
                      ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                      : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                  }`}
                >
                  {companyRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{companyRunning ? 'Stop Ville' : 'Start Ville'}</span>
                </button>

                <button
                  onClick={() => onSendCommand(miningRunning ? 'STOP_MINING' : 'START_MINING', currentDevice.id)}
                  disabled={networkInterrupted}
                  className={`p-2.5 rounded-lg border flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 ${
                    miningRunning
                      ? 'bg-yellow-950/80 text-yellow-300 border-yellow-800'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{miningRunning ? 'Stop Minage' : 'Start Minage'}</span>
                </button>
              </div>

              {/* Push alert simulation box */}
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-[10px] text-slate-400 flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Notification push : Delta-sync d'état vérifié avec succès.</span>
              </div>
            </div>

            <div className="pt-2 text-center text-[10px] text-slate-500 border-t border-slate-800">
              Android Bridge socket actif · {networkInterrupted ? 'En attente réseau' : 'Connecté'}
            </div>
          </div>
        )}

        {/* 3. GOOGLE TV EMULATOR (16:9 Big Screen Display) */}
        {activePlatform === 'GOOGLE_TV' && (
          <div className="w-full max-w-2xl aspect-video bg-slate-900 border-4 border-slate-700 shadow-2xl p-6 rounded-2xl flex flex-col justify-between font-mono-code relative overflow-hidden ring-4 ring-amber-950/40">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Tv className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-slate-100 font-cyber tracking-wider">
                  CODEX COLLECTION CONNECT — AFFICHAGE MURAL GRAND ÉCRAN (GOOGLE TV)
                </span>
              </div>
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5" />
                <span>FLUX 4K 60FPS</span>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 my-auto">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-xs text-slate-500 uppercase block">ENTREPRISE IA TOWN</span>
                <span className={`text-2xl font-bold font-cyber mt-1 block ${companyRunning ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {companyRunning ? 'EN SERVICE' : 'ARRÊTÉE'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-xs text-slate-500 uppercase block">MINAGE CENTMINE</span>
                <span className={`text-2xl font-bold font-cyber mt-1 block ${miningRunning ? 'text-yellow-400' : 'text-slate-500'}`}>
                  {miningRunning ? '840 GH/s' : 'PAUSE'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-xs text-slate-500 uppercase block">APPAREILS CONNECTÉS</span>
                <span className="text-2xl font-bold font-cyber mt-1 text-cyan-300 block">
                  {devices.length} TERMINAUX
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
              <span>Agent Télécommande : 92. TV.BRIDGE</span>
              <div className="flex gap-2">
                <button
                  onClick={() => onSendCommand('EMERGENCY_FREEZE', currentDevice.id)}
                  className="px-3 py-1 bg-red-950 hover:bg-red-900 border border-red-700 text-red-200 text-xs rounded-lg cursor-pointer"
                >
                  Télécommande : Gel Immédiat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. WINDOWS DESKTOP & ANDROID TABLET EMULATORS */}
        {(activePlatform === 'WINDOWS' || activePlatform === 'ANDROID_TABLET') && (
          <div className="w-full max-w-xl bg-slate-900 border-2 border-slate-700 rounded-xl p-5 shadow-2xl font-mono-code text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                {activePlatform === 'WINDOWS' ? <Monitor className="w-4 h-4 text-sky-400" /> : <Tablet className="w-4 h-4 text-teal-400" />}
                <span className="font-bold text-slate-100 font-cyber">
                  {activePlatform === 'WINDOWS' ? 'Codex Collection Connect Desktop (Windows 11)' : 'CCC Tablet Dashboard (Galaxy Tab)'}
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                {currentDevice?.ipAddress}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500">Statut de la passerelle OS</span>
                <div className="text-sm font-semibold text-slate-200">
                  {currentDevice?.bridgeAgent}
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500">Chiffrement & Sécurité</span>
                <div className="text-sm font-semibold text-emerald-400">
                  AES-256-GCM Handshake
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-400">Actions autorisées :</span>
              <div className="flex gap-2">
                <button
                  onClick={() => onSendCommand(companyRunning ? 'STOP_COMPANY' : 'START_COMPANY', currentDevice.id)}
                  className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 rounded-lg text-xs cursor-pointer"
                >
                  {companyRunning ? 'Stopper Ville' : 'Démarrer Ville'}
                </button>
                <button
                  onClick={() => onSendCommand(miningRunning ? 'STOP_MINING' : 'START_MINING', currentDevice.id)}
                  className="px-3 py-1.5 bg-yellow-950 hover:bg-yellow-900 border border-yellow-800 text-yellow-300 rounded-lg text-xs cursor-pointer"
                >
                  {miningRunning ? 'Pause Minage' : 'Démarrer Minage'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
