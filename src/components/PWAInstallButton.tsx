import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, CheckCircle2, Smartphone, Monitor, Info, X, Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isWindows, isAndroid, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [justInstalled, setJustInstalled] = useState<boolean>(false);

  // If already running inside an installed PWA container, show a badge or collapse
  if (isInstalled || justInstalled) {
    return (
      <div 
        title="Application installée en mode autonome PWA"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#00EDFF]/10 border border-[#00EDFF]/40 text-[#00EDFF] text-[10px] font-mono tracking-wider shadow-[0_0_10px_rgba(0,237,255,0.2)]"
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-[#00EDFF]" />
        <span className="hidden sm:inline font-bold">PWA ACTIVE</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    soundEngine.playClick();
    if (isInstallable) {
      const success = await install();
      if (success) {
        soundEngine.playSuccess();
        setJustInstalled(true);
      }
    } else {
      // If prompt is not directly available (e.g. desktop Chrome already showed it, or iOS), open guide
      setShowGuideModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        title={isAndroid ? "Installer sur Android 15" : isWindows ? "Installer sur Windows 11" : "Installer l'application PWA"}
        className="group relative flex items-center gap-2 px-3 py-1.5 rounded bg-gradient-to-r from-[#00EDFF]/20 to-[#8A2BFF]/20 border border-[#00EDFF]/50 hover:border-[#00EDFF] text-[#00EDFF] hover:text-white text-xs font-mono font-bold tracking-wide transition-all shadow-[0_0_12px_rgba(0,237,255,0.25)] hover:shadow-[0_0_18px_rgba(0,237,255,0.5)] active:scale-95"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00EDFF] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00EDFF]"></span>
        </span>
        <Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
        <span className="hidden md:inline font-orbitron">
          {isAndroid ? 'INSTALLER ANDROID' : isWindows ? 'INSTALLER WINDOWS' : 'INSTALLER L\'APP'}
        </span>
        <span className="md:hidden">INSTALLER</span>
      </button>

      {/* Guide Modal for Desktop/Android/iOS manual installation */}
      {showGuideModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-xl bg-[#0E162E] border-2 border-[#00EDFF] p-6 shadow-[0_0_40px_rgba(0,237,255,0.35)] text-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#1A2744]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded bg-[#00EDFF]/10 text-[#00EDFF]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-orbitron font-bold text-base text-white tracking-wide">
                    INSTALLATION PWA — IA TOWN
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Mode autonome hors-ligne & intégration système
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowGuideModal(false);
                }}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Platform Instructions */}
            <div className="my-5 space-y-3.5 text-xs">
              {isWindows && (
                <div className="p-3 rounded-lg bg-[#0A0F1E] border border-[#00EDFF]/30">
                  <div className="flex items-center gap-2 text-[#00EDFF] font-bold font-mono mb-1.5">
                    <Monitor className="w-4 h-4" /> Windows 11 (Edge / Chrome)
                  </div>
                  <p className="text-slate-300 leading-relaxed font-sans text-[11px]">
                    1. Cliquez sur l'icône <strong className="text-white">Installer l'application</strong> dans la barre d'adresse de votre navigateur (en haut à droite).<br />
                    2. Confirmez pour ajouter <strong className="text-[#00EDFF]">IA TOWN</strong> au menu Démarrer et à la barre des tâches.
                  </p>
                </div>
              )}

              {isAndroid && (
                <div className="p-3 rounded-lg bg-[#0A0F1E] border border-[#00EDFF]/30">
                  <div className="flex items-center gap-2 text-[#00EDFF] font-bold font-mono mb-1.5">
                    <Smartphone className="w-4 h-4" /> Android 15 (Chrome)
                  </div>
                  <p className="text-slate-300 leading-relaxed font-sans text-[11px]">
                    1. Appuyez sur le menu <strong className="text-white">⋮ (Trois points)</strong> en haut à droite.<br />
                    2. Sélectionnez <strong className="text-[#00EDFF]">Ajouter à l'écran d'accueil</strong> ou <strong className="text-[#00EDFF]">Installer l'application</strong>.<br />
                    3. L'application fonctionnera en plein écran même sans connexion.
                  </p>
                </div>
              )}

              {isIOS && (
                <div className="p-3 rounded-lg bg-[#0A0F1E] border border-[#8A2BFF]/40">
                  <div className="flex items-center gap-2 text-[#8A2BFF] font-bold font-mono mb-1.5">
                    <Smartphone className="w-4 h-4" /> iOS Safari (iPhone / iPad)
                  </div>
                  <p className="text-slate-300 leading-relaxed font-sans text-[11px]">
                    1. Touchez le bouton <strong className="text-white">Partager (carré avec flèche)</strong> dans la barre Safari.<br />
                    2. Faites défiler vers le bas et touchez <strong className="text-[#00EDFF]">Sur l'écran d'accueil</strong>.<br />
                    3. Validez en haut à droite.
                  </p>
                </div>
              )}

              {/* General features recap */}
              <div className="p-3 rounded-lg bg-[#141C35] border border-slate-700/60">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold font-mono text-[11px] mb-1">
                  <Info className="w-3.5 h-3.5" /> Avantages PWA
                </div>
                <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-1">
                  <li>Lancement instantané en fenêtre dédiée sans barre d'URL</li>
                  <li>Fonctionnement hors-ligne et préservation locale des données</li>
                  <li>Synchronisation CCC.CONNECT en tâche d'arrière-plan</li>
                </ul>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1A2744]">
              {isInstallable && (
                <button
                  onClick={async () => {
                    await install();
                    setShowGuideModal(false);
                  }}
                  className="px-4 py-2 rounded bg-gradient-to-r from-[#00EDFF] to-[#8A2BFF] text-black font-bold font-orbitron text-xs hover:brightness-110 transition shadow-[0_0_15px_rgba(0,237,255,0.4)]"
                >
                  LANCER LE PROMPT
                </button>
              )}
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowGuideModal(false);
                }}
                className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
