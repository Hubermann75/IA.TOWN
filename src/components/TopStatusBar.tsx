/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IA TOWN — Top Status Bar & Sub-Action Bar (Image 2 & 4)
 * Themed Navigation, 4 Display Modes, 4 Themes, Global Stats & Action Controls
 */

import React, { useState, useEffect } from 'react';
import { soundEngine } from '../utils/soundEngine';
import { PWAInstallButton } from './PWAInstallButton';
import { downloadCompleteBetaZipClientSide } from '../utils/clientZipBuilder';
import { 
  Building2, 
  Layers, 
  Bot, 
  Flame,
  Coins, 
  Gem, 
  Package, 
  Globe, 
  Users, 
  ClipboardList, 
  Settings, 
  Play, 
  Pause, 
  Square, 
  Sliders, 
  Wrench,
  Sparkles,
  Zap,
  Activity,
  Maximize2,
  Volume2,
  VolumeX,
  Keyboard,
  HelpCircle,
  Download,
  X
} from 'lucide-react';

export type DisplayMode = 'VUE_VILLE' | 'VUE_BATIMENT' | 'VUE_ETAGE' | 'VUE_AGENT';
export type AppTheme = 'CYBERPUNK_NUIT' | 'JOUR_NEON' | 'SOMBRE_PRO' | 'RETRO_FUTUR';

interface Props {
  activeMode: DisplayMode;
  onSelectMode: (mode: DisplayMode) => void;
  activeTheme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
  companyRunning: boolean;
  miningRunning: boolean;
  onToggleCompany: (start: boolean) => void;
  onToggleMining: (start: boolean) => void;
  onStartAll: () => void;
  onPauseAll: () => void;
  onStopAll: () => void;
  autoMode: boolean;
  onToggleAutoMode: () => void;
  onOpenSettings?: () => void;
  onOpenPortfolio?: () => void;
  onOpenHub?: () => void;
  zenMode?: boolean;
  onToggleZenMode?: () => void;
  onOpenBetaAuditor?: () => void;
}

export const TopStatusBar: React.FC<Props> = ({
  activeMode,
  onSelectMode,
  activeTheme,
  onSelectTheme,
  companyRunning,
  miningRunning,
  onToggleCompany,
  onToggleMining,
  onStartAll,
  onPauseAll,
  onStopAll,
  autoMode,
  onToggleAutoMode,
  onOpenSettings,
  onOpenPortfolio,
  onOpenHub,
  zenMode = false,
  onToggleZenMode,
  onOpenBetaAuditor,
}) => {
  const [soundMuted, setSoundMuted] = useState<boolean>(() => soundEngine.isMuted());
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);
  const [liveTime, setLiveTime] = useState<string>(() => new Date().toLocaleTimeString('fr-FR'));

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date().toLocaleTimeString('fr-FR'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleSound = () => {
    const isNowMuted = soundEngine.toggleMute();
    setSoundMuted(isNowMuted);
    if (!isNowMuted) {
      soundEngine.playCashChime();
    }
  };

  return (
    <div className="w-full flex flex-col bg-[#111522] border-b border-[#1B1F2A] shrink-0 z-30 select-none">
      {/* Tier 1: Main Header Ribbon matching Image 2 & 3 */}
      <div className="flex items-center justify-between px-3.5 py-2 overflow-x-auto gap-3">
        {/* Left: Brand Identity Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFB800] via-[#FF8A3D] to-[#8A2BFF] p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(255,184,0,0.4)]">
            <div className="w-full h-full bg-[#0A0F1E] rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#FFB800]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-orbitron font-extrabold text-base tracking-wider text-white">
                IA <span className="text-[#00EDFF]">TOWN</span>
              </span>
              <span className="text-[9px] font-mono-code px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
                v3.0
              </span>
            </div>
            <span className="text-[9px] font-inter text-slate-400 block -mt-0.5 tracking-tight">
              CODEX COLLECTION CONNECT
            </span>
          </div>
        </div>

        {/* 4 Display Modes Selector (Image 3) */}
        <div className="flex items-center p-1 rounded-xl bg-[#0A0F1E] border border-slate-800 shrink-0">
          {[
            { id: 'VUE_VILLE' as DisplayMode, label: 'VUE VILLE', icon: Globe },
            { id: 'VUE_BATIMENT' as DisplayMode, label: 'COUPE BÂTIMENTS', icon: Building2 },
            { id: 'VUE_ETAGE' as DisplayMode, label: '☢️ ABRI FALLOUT', icon: Flame },
            { id: 'VUE_AGENT' as DisplayMode, label: 'FICHE AGENT', icon: Bot },
          ].map((mode) => {
            const Icon = mode.icon;
            const isActive = activeMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => {
                  onSelectMode(mode.id);
                  soundEngine.playTick();
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-orbitron font-bold text-[11px] transition-all ${
                  isActive
                    ? 'bg-[#00EDFF]/20 text-[#00EDFF] border border-[#00EDFF] glow-cyan-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#00EDFF]' : 'text-slate-500'}`} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* 4 Themes Selector (Image 3) */}
        <div className="hidden xl:flex items-center gap-1 shrink-0 bg-[#0A0F1E] p-1 rounded-xl border border-slate-800">
          {[
            { id: 'CYBERPUNK_NUIT' as AppTheme, label: 'CYBERPUNK NUIT', dot: '#00EDFF' },
            { id: 'JOUR_NEON' as AppTheme, label: 'JOUR NÉON', dot: '#FFB800' },
            { id: 'SOMBRE_PRO' as AppTheme, label: 'SOMBRE PRO', dot: '#38bdf8' },
            { id: 'RETRO_FUTUR' as AppTheme, label: 'RETRO FUTUR', dot: '#ff007f' },
          ].map((theme) => {
            const isThemeActive = activeTheme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => {
                  onSelectTheme(theme.id);
                  soundEngine.playClick();
                }}
                className={`px-2 py-1 rounded-lg text-[10px] font-orbitron font-semibold transition-all flex items-center gap-1.5 ${
                  isThemeActive
                    ? 'bg-white/10 text-white border border-white/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.dot }} />
                <span>{theme.label}</span>
              </button>
            );
          })}
        </div>

        {/* Global Stat Pills (Image 2) */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          {/* Agents */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#1B1F2A]/80 border border-slate-700/60">
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            <div className="leading-tight">
              <span className="text-[8.5px] font-mono-code text-slate-400 block">Agents</span>
              <span className="font-orbitron font-bold text-xs text-white">128 / 128</span>
            </div>
          </div>

          {/* Revenus encaissés */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#1B1F2A]/80 border border-slate-700/60">
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
            <div className="leading-tight">
              <span className="text-[8.5px] font-mono-code text-slate-400 block">Encaissés</span>
              <span className="font-orbitron font-bold text-xs text-[#21EC71]">2 846,50 €</span>
            </div>
          </div>

          {/* Revenus récurrents */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#1B1F2A]/80 border border-slate-700/60">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <div className="leading-tight">
              <span className="text-[8.5px] font-mono-code text-slate-400 block">Récurrents</span>
              <span className="font-orbitron font-bold text-xs text-[#00EDFF]">1 245,30 €/m</span>
            </div>
          </div>

          {/* Opportunités */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#1B1F2A]/80 border border-slate-700/60">
            <Gem className="w-3.5 h-3.5 text-amber-400" />
            <div className="leading-tight">
              <span className="text-[8.5px] font-mono-code text-slate-400 block">Opportunités</span>
              <span className="font-orbitron font-bold text-xs text-amber-300">56</span>
            </div>
          </div>
        </div>

        {/* Right: Clock, Beta Auditor, Direct ZIP Download, PWA Install & Quick Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* ULTRA-PROMINENT DIRECT ZIP DOWNLOAD BUTTON WITH .EXE */}
          <button
            onClick={() => {
              soundEngine.playSuccess();
              downloadCompleteBetaZipClientSide();
            }}
            title="Télécharger immédiatement le fichier .ZIP complet (avec IA_TOWN_Beta_v1.0.exe, scripts silencieux et tout le bundle)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#FFB800] via-[#FF8A3D] to-[#21EC71] text-black font-orbitron font-black text-xs hover:brightness-110 shadow-[0_0_18px_rgba(255,184,0,0.6)] transition active:scale-95 animate-pulse cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 fill-black stroke-black" />
            <span className="hidden sm:inline">TÉLÉCHARGER .ZIP (.EXE INCLUS)</span>
            <span className="sm:hidden">.ZIP (.EXE)</span>
          </button>

          {/* Agent IA Beta Auditor & Release Button */}
          {onOpenBetaAuditor && (
            <button
              onClick={() => {
                onOpenBetaAuditor();
                soundEngine.playSuccess();
              }}
              title="Agent IA BETA.AUDITOR & Centre de packaging .exe / Drive / GitHub"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-[#00EDFF]/20 to-[#8A2BFF]/20 border border-[#00EDFF] text-[#00EDFF] hover:text-white text-xs font-orbitron font-bold tracking-wide transition shadow-[0_0_12px_rgba(0,237,255,0.3)] hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00EDFF]" />
              <span className="hidden sm:inline">BETA v1.0 & .EXE</span>
              <span className="sm:hidden">BETA</span>
            </button>
          )}

          {/* Zen / Mode Épuré Toggle */}
          {onToggleZenMode && (
            <button
              onClick={() => {
                onToggleZenMode();
                soundEngine.playClick();
              }}
              title={zenMode ? "Désactiver le mode épuré (réafficher les panneaux)" : "Activer le mode épuré (fluidifier l'interface)"}
              className={`px-2 py-1.5 rounded-lg text-xs font-mono font-bold border transition ${
                zenMode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                  : 'bg-[#1B1F2A] text-slate-400 hover:text-slate-200 border-slate-700'
              }`}
            >
              {zenMode ? 'ZEN ON' : 'ÉPURÉ'}
            </button>
          )}

          <PWAInstallButton />
          <div className="text-right">
            <span className="font-orbitron font-bold text-xs text-cyan-400 block leading-tight">{liveTime}</span>
            <span className="text-[9px] font-mono-code text-slate-400 block">30/10/2026</span>
          </div>

          {/* Sound Toggle Button */}
          <button
            onClick={handleToggleSound}
            title={soundMuted ? 'Activer les sons de synthèse (M)' : 'Couper le son (M)'}
            className={`p-1.5 rounded-lg border transition-all ${
              soundMuted
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20'
            }`}
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Keyboard Shortcuts Dialog Button */}
          <button
            onClick={() => {
              setShowShortcutsModal(true);
              soundEngine.playClick();
            }}
            title="Raccourcis clavier (?)"
            className="p-1.5 rounded-lg bg-[#1B1F2A] hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* Settings / Roadmap Button */}
          <button
            onClick={() => {
              if (onOpenSettings) onOpenSettings();
              soundEngine.playClick();
            }}
            title="Paramètres & Roadmap"
            className="p-1.5 rounded-lg bg-[#1B1F2A] hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tier 2: Sub-Action Control Bar matching Image 2 & 4 */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#0A0F1E] border-t border-[#1B1F2A] overflow-x-auto gap-3">
        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Entreprise Group */}
          <div className="flex items-center gap-1 bg-[#111522] p-1 rounded-xl border border-emerald-500/30">
            <button
              onClick={() => {
                onToggleCompany(!companyRunning);
                soundEngine.playSuccess();
              }}
              className={`px-3 py-1.5 rounded-lg font-orbitron font-bold text-xs transition-all flex items-center gap-1.5 ${
                companyRunning
                  ? 'bg-emerald-600 text-white glow-green'
                  : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
              }`}
            >
              <Play className="w-3 h-3 fill-current" />
              <span>DÉMARRER L'ENTREPRISE</span>
            </button>
            <button
              onClick={() => {
                onToggleCompany(false);
                soundEngine.playClick();
              }}
              className="px-2 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs font-orbitron flex items-center gap-1"
            >
              <Pause className="w-3 h-3" />
              <span>PAUSE</span>
            </button>
            <button
              onClick={() => {
                onToggleCompany(false);
                soundEngine.playAlert();
              }}
              className="px-2 py-1.5 rounded-lg text-red-400 hover:text-red-300 text-xs font-orbitron flex items-center gap-1"
            >
              <Square className="w-3 h-3" />
              <span>ARRÊTER</span>
            </button>
          </div>

          {/* Minage Group */}
          <div className="flex items-center gap-1 bg-[#111522] p-1 rounded-xl border border-amber-500/30">
            <button
              onClick={() => {
                onToggleMining(!miningRunning);
                soundEngine.playSuccess();
              }}
              className={`px-3 py-1.5 rounded-lg font-orbitron font-bold text-xs transition-all flex items-center gap-1.5 ${
                miningRunning
                  ? 'bg-amber-600 text-white glow-gold'
                  : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
              }`}
            >
              <Play className="w-3 h-3 fill-current" />
              <span>DÉMARRER LE MINAGE</span>
            </button>
            <button
              onClick={() => {
                onToggleMining(false);
                soundEngine.playClick();
              }}
              className="px-2 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs font-orbitron flex items-center gap-1"
            >
              <Pause className="w-3 h-3" />
              <span>PAUSE</span>
            </button>
            <button
              onClick={() => {
                onToggleMining(false);
                soundEngine.playAlert();
              }}
              className="px-2 py-1.5 rounded-lg text-red-400 hover:text-red-300 text-xs font-orbitron flex items-center gap-1"
            >
              <Square className="w-3 h-3" />
              <span>ARRÊTER</span>
            </button>
          </div>

          {/* DÉMARRER TOUT (Cyan) */}
          <button
            onClick={() => {
              onStartAll();
              soundEngine.playSuccess();
            }}
            className="btn-town-primary text-xs"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>DÉMARRER TOUT (Entreprise + Minage)</span>
          </button>
        </div>

        {/* Right Controls: Auto Mode Toggle + Animated Supervision IA Waveform */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Mode Automatique Toggle */}
          <div className="flex items-center gap-2 bg-[#111522] px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-[11px] font-orbitron font-semibold text-slate-300">
              Mode automatique
            </span>
            <button
              onClick={() => {
                onToggleAutoMode();
                soundEngine.playClick();
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-orbitron font-bold transition-all ${
                autoMode
                  ? 'bg-cyan-500 text-[#0A0F1E]'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {autoMode ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Animated Waveform "Supervision IA" (Image 2) */}
          <div className="flex items-center gap-2 bg-[#111522] px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-[11px] font-orbitron text-cyan-300 hidden sm:inline">
              Supervision IA
            </span>
            <div className="flex items-center gap-0.5 h-4">
              <span className="w-1 bg-cyan-400 rounded-full animate-waveform-1" />
              <span className="w-1 bg-cyan-400 rounded-full animate-waveform-2" />
              <span className="w-1 bg-cyan-400 rounded-full animate-waveform-3" />
              <span className="w-1 bg-cyan-400 rounded-full animate-waveform-4" />
              <span className="w-1 bg-cyan-400 rounded-full animate-waveform-5" />
              <span className="w-1 bg-cyan-400 rounded-full animate-waveform-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowShortcutsModal(false)}
        >
          <div 
            className="panel-town-standard max-w-lg w-full p-6 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#1B1F2A]">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-[#00EDFF]" />
                <h3 className="font-orbitron font-bold text-base text-white">
                  RACCOURCIS CLAVIER IA TOWN
                </h3>
              </div>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 font-mono-code text-xs">
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800 flex items-center justify-between">
                  <span>Vue Globale (Skyline)</span>
                  <kbd className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">1</kbd>
                </div>
                <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800 flex items-center justify-between">
                  <span>Coupe Bâtiment</span>
                  <kbd className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">2</kbd>
                </div>
                <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800 flex items-center justify-between">
                  <span>Abri Centmine</span>
                  <kbd className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">3</kbd>
                </div>
                <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800 flex items-center justify-between">
                  <span>Fiche 94 Agents</span>
                  <kbd className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">4</kbd>
                </div>
                <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800 flex items-center justify-between">
                  <span>Démarrer / Pause</span>
                  <kbd className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">Espace</kbd>
                </div>
                <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800 flex items-center justify-between">
                  <span>Couper / Activer le Son</span>
                  <kbd className="px-2 py-0.5 rounded bg-slate-700 text-white border border-slate-600 font-bold">M</kbd>
                </div>
                <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800 flex items-center justify-between">
                  <span>Fermer Modale</span>
                  <kbd className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">Échap</kbd>
                </div>
                <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800 flex items-center justify-between">
                  <span>Guide Raccourcis</span>
                  <kbd className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">?</kbd>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#1B1F2A] flex justify-end">
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="btn-town-primary text-xs"
              >
                Compris
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
