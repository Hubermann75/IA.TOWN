/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * CCC.CONNECT HUB — Appairage QR Sécurisé & Dispatcher de Commandes Distantes
 */

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { CCCDevice, DevicePlatform, QRPairingSession, RemoteCommand } from '../types/town';
import { 
  createQRPairingSession, 
  completeQRPairing, 
  revokePairingSession, 
  isQRSessionExpired 
} from '../logic/cccConnect';
import { 
  QrCode, 
  Smartphone, 
  Monitor, 
  Watch, 
  Tv, 
  Tablet, 
  RotateCw, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Send, 
  Radio, 
  Play, 
  Pause, 
  Zap, 
  ShieldAlert,
  Wifi
} from 'lucide-react';

interface Props {
  devices: CCCDevice[];
  onAddDevice: (device: CCCDevice) => void;
  onSendCommand: (commandType: RemoteCommand['commandType'], deviceId: string) => void;
  recentCommands: RemoteCommand[];
  companyRunning: boolean;
  miningRunning: boolean;
  simulationPaused: boolean;
  initialTargetPlatform?: DevicePlatform;
}

export const QRPairingAndRemoteView: React.FC<Props> = ({
  devices,
  onAddDevice,
  onSendCommand,
  recentCommands,
  companyRunning,
  miningRunning,
  simulationPaused,
  initialTargetPlatform = 'ANDROID_PHONE',
}) => {
  const [targetPlatform, setTargetPlatform] = useState<DevicePlatform>(initialTargetPlatform);
  const [currentSession, setCurrentSession] = useState<QRPairingSession>(() => createQRPairingSession(initialTargetPlatform));
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(120);
  const [selectedDeviceForCommand, setSelectedDeviceForCommand] = useState<string>(devices[0]?.id || '');
  const [customDeviceName, setCustomDeviceName] = useState<string>('Nouveau Terminal CCC');
  const [pairingNotice, setPairingNotice] = useState<{ type: 'SUCCESS' | 'ERROR'; msg: string } | null>(null);

  // Generate QR Code image data URL on session change
  useEffect(() => {
    QRCode.toDataURL(currentSession.qrPayload, {
      width: 256,
      margin: 1.5,
      color: {
        dark: '#00f0ff',
        light: '#030712',
      },
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('QR code generation error:', err));
  }, [currentSession]);

  // Countdown timer for 120s TTL
  useEffect(() => {
    const timer = setInterval(() => {
      const remainingMs = currentSession.expiresAt - Date.now();
      const sec = Math.max(0, Math.floor(remainingMs / 1000));
      setSecondsRemaining(sec);

      if (sec <= 0 && currentSession.status === 'ACTIVE') {
        setCurrentSession(prev => ({ ...prev, status: 'EXPIRED' }));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentSession]);

  const handleRegenerateQR = (plat?: DevicePlatform) => {
    const chosen = plat || targetPlatform;
    const newSess = createQRPairingSession(chosen);
    setCurrentSession(newSess);
    setPairingNotice(null);
  };

  const handleRevoke = () => {
    const revoked = revokePairingSession(currentSession);
    setCurrentSession(revoked);
    setPairingNotice({ type: 'ERROR', msg: 'Session d’appairage révoquée immédiatement.' });
  };

  // Simulate remote device scanning and completing pairing
  const handleSimulateDevicePairing = () => {
    if (isQRSessionExpired(currentSession)) {
      setPairingNotice({ type: 'ERROR', msg: 'Impossible: la session QR a expiré. Veuillez régénérer un code.' });
      return;
    }

    const res = completeQRPairing(currentSession, {
      name: customDeviceName || `${targetPlatform} Companion`,
      platform: targetPlatform,
      ipAddress: `192.168.1.${Math.floor(100 + Math.random() * 150)}`,
    });

    if (res.success && res.device) {
      setCurrentSession(res.pairedSession);
      onAddDevice(res.device);
      setSelectedDeviceForCommand(res.device.id);
      setPairingNotice({
        type: 'SUCCESS',
        msg: `Appareil "${res.device.name}" appairé avec succès via ${res.device.bridgeAgent}!`,
      });
    } else {
      setPairingNotice({ type: 'ERROR', msg: res.error || 'Échec d’appairage' });
    }
  };

  const getPlatformIcon = (platform: DevicePlatform) => {
    switch (platform) {
      case 'WINDOWS': return <Monitor className="w-4 h-4 text-sky-400" />;
      case 'ANDROID_PHONE': return <Smartphone className="w-4 h-4 text-emerald-400" />;
      case 'ANDROID_TABLET': return <Tablet className="w-4 h-4 text-teal-400" />;
      case 'WEAR_OS': return <Watch className="w-4 h-4 text-purple-400" />;
      case 'GOOGLE_TV': return <Tv className="w-4 h-4 text-amber-400" />;
    }
  };

  const activeDevice = devices.find(d => d.id === selectedDeviceForCommand) || devices[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              AGENT #87 QR.LINK & #94 CONNECTION.GUARD
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-emerald-400 font-mono-code flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Zéro Clé Privée Permanente Exposée
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 font-cyber">
            APPAIRAGE QR ÉPHÉMÈRE & COMMANDES DISTANTES
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Protocole sécurisé Codex Collection Connect. Les QR codes expirent après 120 secondes et ne contiennent aucune clé statique.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono-code flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            TTL 120s par session
          </span>
        </div>
      </div>

      {/* Two Column Layout: QR Generator Left / Remote Dispatcher Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: QR Pairing Generator & Device Emulator (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wide font-cyber">
                GÉNÉRATEUR DE JETON D'APPAIRAGE QR
              </h2>
            </div>

            <button
              onClick={() => handleRegenerateQR()}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono-code cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Régénérer</span>
            </button>
          </div>

          {/* Platform Selector Buttons */}
          <div>
            <label className="text-[11px] text-slate-400 font-mono-code block mb-1.5">
              Sélectionnez la plateforme cible :
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {(['WINDOWS', 'ANDROID_PHONE', 'ANDROID_TABLET', 'WEAR_OS', 'GOOGLE_TV'] as DevicePlatform[]).map(plat => (
                <button
                  key={plat}
                  onClick={() => {
                    setTargetPlatform(plat);
                    handleRegenerateQR(plat);
                  }}
                  className={`p-2 rounded-lg text-xs font-mono-code flex items-center gap-2 transition-all cursor-pointer ${
                    targetPlatform === plat
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500 shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {getPlatformIcon(plat)}
                  <span className="truncate">{plat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* QR Display Card */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center relative overflow-hidden">
            {qrDataUrl ? (
              <div className="p-3 bg-slate-950 rounded-xl border border-cyan-500/40 shadow-lg shadow-cyan-500/10 mb-3 relative">
                <img
                  src={qrDataUrl}
                  alt="QR Code d'appairage sécurisé CCC"
                  className="w-48 h-48 rounded object-contain"
                />
                {currentSession.status !== 'ACTIVE' && (
                  <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-2 rounded">
                    <AlertCircle className="w-8 h-8 text-rose-400 mb-1" />
                    <span className="text-xs font-bold text-rose-300 font-mono-code">
                      {currentSession.status === 'PAIRED' ? 'APPAIRÉ AVEC SUCCÈS' : 'SESSION EXPIRÉE / RÉVOQUÉE'}
                    </span>
                    <button
                      onClick={() => handleRegenerateQR()}
                      className="mt-2 px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded"
                    >
                      Nouveau QR
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-48 h-48 bg-slate-900 animate-pulse rounded-xl mb-3 flex items-center justify-center text-xs text-slate-500">
                Génération...
              </div>
            )}

            <div className="w-full space-y-1 font-mono-code text-xs">
              <div className="flex items-center justify-between text-slate-400 px-4">
                <span>Code d'autorisation rapide :</span>
                <span className="text-cyan-300 font-bold text-sm tracking-widest">{currentSession.pairingCodeShort}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 px-4">
                <span>Délai d'expiration TTL :</span>
                <span className={`font-bold ${secondsRemaining < 20 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {secondsRemaining} secondes
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={handleRevoke}
                disabled={currentSession.status !== 'ACTIVE'}
                className="px-3 py-1.5 rounded-lg text-xs bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 transition-colors disabled:opacity-40"
              >
                Révoquer Immédiatement
              </button>
            </div>
          </div>

          {/* Interactive Emulator: Test Pairing Button */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-200 uppercase font-cyber block">
              Émulateur de Connexion Matérielle (Test d'Appairage)
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={customDeviceName}
                onChange={e => setCustomDeviceName(e.target.value)}
                placeholder="Nom de l'appareil à connecter..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono-code"
              />
              <button
                onClick={handleSimulateDevicePairing}
                disabled={currentSession.status !== 'ACTIVE'}
                className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
              >
                Scanner & Appairer
              </button>
            </div>

            {pairingNotice && (
              <div className={`p-2.5 rounded-lg text-xs font-mono-code flex items-center gap-2 ${
                pairingNotice.type === 'SUCCESS' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}>
                {pairingNotice.type === 'SUCCESS' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{pairingNotice.msg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Remote Command Dispatcher (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wide font-cyber">
                DISPATCHER DE COMMANDES DISTANTES SÉCURISÉES
              </h2>
            </div>
            <span className="text-xs text-emerald-400 font-mono-code">
              Contrôleur Authentifié
            </span>
          </div>

          {/* Select emitting device */}
          <div>
            <label className="text-[11px] text-slate-400 font-mono-code block mb-1.5">
              Émettre les ordres depuis l'appareil appairé :
            </label>
            <select
              value={selectedDeviceForCommand}
              onChange={e => setSelectedDeviceForCommand(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono-code"
            >
              {devices.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.platform}) · {d.ipAddress}
                </option>
              ))}
            </select>
          </div>

          {/* Active device permissions card */}
          {activeDevice && (
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono-code space-y-1.5">
              <span className="text-[10px] text-slate-500 uppercase block">Permissions accordées :</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <span className={activeDevice.permissions.canControlCompany ? 'text-emerald-400' : 'text-slate-500'}>
                  • Contrôle Entreprise : {activeDevice.permissions.canControlCompany ? 'OUI' : 'NON'}
                </span>
                <span className={activeDevice.permissions.canControlMining ? 'text-emerald-400' : 'text-slate-500'}>
                  • Contrôle Minage : {activeDevice.permissions.canControlMining ? 'OUI' : 'NON'}
                </span>
                <span className={activeDevice.permissions.canViewFinances ? 'text-emerald-400' : 'text-slate-500'}>
                  • Consultation Trésorerie : {activeDevice.permissions.canViewFinances ? 'OUI' : 'NON'}
                </span>
                <span className={activeDevice.permissions.canDispatchMissions ? 'text-emerald-400' : 'text-slate-500'}>
                  • Dispatcher Missions : {activeDevice.permissions.canDispatchMissions ? 'OUI' : 'NON'}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons Matrix */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 font-cyber block">
              Commandes Opérationnelles Directes :
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono-code">
              <button
                onClick={() => onSendCommand('START_COMPANY', activeDevice.id)}
                disabled={companyRunning}
                className="p-3 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded-xl flex items-center justify-between transition-colors disabled:opacity-40 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-400" />
                  <span>Démarrer l'Entreprise</span>
                </div>
                <Send className="w-3.5 h-3.5 text-emerald-400" />
              </button>

              <button
                onClick={() => onSendCommand('STOP_COMPANY', activeDevice.id)}
                disabled={!companyRunning}
                className="p-3 bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-xl flex items-center justify-between transition-colors disabled:opacity-40 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Pause className="w-4 h-4 text-rose-400" />
                  <span>Arrêter l'Entreprise</span>
                </div>
                <Send className="w-3.5 h-3.5 text-rose-400" />
              </button>

              <button
                onClick={() => onSendCommand('START_MINING', activeDevice.id)}
                disabled={miningRunning}
                className="p-3 bg-yellow-950/70 hover:bg-yellow-900 border border-yellow-800 text-yellow-300 rounded-xl flex items-center justify-between transition-colors disabled:opacity-40 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span>Démarrer Minage</span>
                </div>
                <Send className="w-3.5 h-3.5 text-yellow-400" />
              </button>

              <button
                onClick={() => onSendCommand('STOP_MINING', activeDevice.id)}
                disabled={!miningRunning}
                className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 rounded-xl flex items-center justify-between transition-colors disabled:opacity-40 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Pause className="w-4 h-4 text-slate-400" />
                  <span>Arrêter Minage</span>
                </div>
                <Send className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onSendCommand(simulationPaused ? 'RESUME_ALL' : 'PAUSE_ALL', activeDevice.id)}
                className="p-3 bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 rounded-xl flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <RotateCw className="w-4 h-4 text-cyan-400" />
                  <span>{simulationPaused ? 'Reprendre Tout' : 'Mettre en Pause Tout'}</span>
                </div>
                <Send className="w-3.5 h-3.5 text-cyan-400" />
              </button>

              <button
                onClick={() => onSendCommand('EMERGENCY_FREEZE', activeDevice.id)}
                className="p-3 bg-red-950 border border-red-600 text-red-200 rounded-xl flex items-center justify-between hover:bg-red-900 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span>Gel d'Urgence Total</span>
                </div>
                <Send className="w-3.5 h-3.5 text-red-400" />
              </button>
            </div>
          </div>

          {/* Recent Commands Execution Stream */}
          <div>
            <span className="text-[11px] text-slate-400 font-mono-code block mb-2">
              Journal des commandes authentifiées (Traçabilité CCC) :
            </span>
            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
              {recentCommands.length === 0 ? (
                <div className="text-xs text-slate-500 italic p-3 bg-slate-950 rounded-lg text-center">
                  Aucune commande récente émise.
                </div>
              ) : (
                recentCommands.map(cmd => (
                  <div
                    key={cmd.id}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono-code flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-slate-200">{cmd.commandType}</span>
                      <p className="text-[10px] text-slate-400">{cmd.responsePayload}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${
                      cmd.executionStatus === 'EXECUTED_SUCCESS' ? 'text-emerald-400 bg-emerald-950 border border-emerald-800' : 'text-rose-400 bg-rose-950 border border-rose-800'
                    }`}>
                      {cmd.executionStatus}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
