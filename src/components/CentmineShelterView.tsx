/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IA TOWN — AMBIANCE FALLOUT SHELTER : CCC CENTMINE (Image 1)
 * Vue en coupe souterraine haute-définition du bunker / abri avec mineurs robots,
 * ascenseur central illuminé, cavernes de cristaux, salle des coffres et commandes tactiques.
 */

import React, { useState } from 'react';
import { soundEngine } from '../utils/soundEngine';
import { RobotAvatar } from './RobotAvatar';
import { 
  Home, 
  Bot, 
  ClipboardList, 
  Gem, 
  Globe, 
  Coins, 
  BarChart3, 
  Settings, 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX, 
  FileText, 
  Eye, 
  Maximize2,
  CheckCircle2,
  Zap,
  Sparkles,
  ShieldCheck,
  Flame,
  Lock,
  Layers,
  Activity,
  ArrowRight
} from 'lucide-react';

interface Props {
  miningRunning: boolean;
  onToggleMining: (start: boolean) => void;
  onOpenTownView: () => void;
  onThemeSelect?: (theme: string) => void;
}

interface ShelterRoom {
  id: string;
  name: string;
  sub: string;
  roleType: string;
  iconColor: string;
  tagColor: string;
  revenue: number;
  status: 'ACTIVE' | 'OPTIMAL' | 'SYNCING';
  description: string;
  // Position percentage on the cross-section image (Image 1)
  topPercent: number;
  leftPercent: number;
  widthPercent: number;
  heightPercent: number;
}

const SHELTER_ROOMS: ShelterRoom[] = [
  { 
    id: 'OVERMINE', 
    name: 'OVERMINE', 
    sub: 'COORDINATION GÉNÉRALE', 
    roleType: 'DIRECTEUR', 
    iconColor: '#FFB800', 
    tagColor: '#FFB800', 
    revenue: 0, 
    status: 'OPTIMAL', 
    description: 'Poste de commandement central sous la voûte rocheuse avec globe holographique et supervision de l\'extraction.',
    topPercent: 12,
    leftPercent: 32,
    widthPercent: 18,
    heightPercent: 14
  },
  { 
    id: 'CENTMINE_BROWSER', 
    name: 'CENTMINE BROWSER', 
    sub: 'NAVIGATION INTÉGRÉE', 
    roleType: 'TECHNICIEN', 
    iconColor: '#00EDFF', 
    tagColor: '#00EDFF', 
    revenue: 0, 
    status: 'ACTIVE', 
    description: 'Exploration automatisée et sécurisée du web pour détecter des micro-opportunités numériques et gisements légaux.',
    topPercent: 24,
    leftPercent: 67,
    widthPercent: 16,
    heightPercent: 12
  },
  { 
    id: 'PROSPECTOR', 
    name: 'PROSPECTOR', 
    sub: 'RECHERCHE D\'OPPORTUNITÉS', 
    roleType: 'MINEUR', 
    iconColor: '#00EDFF', 
    tagColor: '#00EDFF', 
    revenue: 14.20, 
    status: 'ACTIVE', 
    description: 'Caverne de cristaux bleus luminescents où le robot prospecteur pioche des gisements vérifiés.',
    topPercent: 35,
    leftPercent: 17,
    widthPercent: 17,
    heightPercent: 15
  },
  { 
    id: 'TASK_MINER', 
    name: 'TASK MINER', 
    sub: 'MICROTÂCHES NUMÉRIQUES', 
    roleType: 'DEVELOPPEUR', 
    iconColor: '#FFB800', 
    tagColor: '#FFB800', 
    revenue: 8.50, 
    status: 'ACTIVE', 
    description: 'Poste d\'exécution automatisée des microtâches vérifiées sans intervention humaine.',
    topPercent: 35,
    leftPercent: 44,
    widthPercent: 16,
    heightPercent: 15
  },
  { 
    id: 'AD_MINER', 
    name: 'AD MINER', 
    sub: 'OPPORTUNITÉS PUBLICITAIRES', 
    roleType: 'VENDEUR', 
    iconColor: '#FF007F', 
    tagColor: '#FF007F', 
    revenue: 6.40, 
    status: 'ACTIVE', 
    description: 'Salle à enseigne néon ADS avec robot au mégaphone optimisant les revenus programmatiques.',
    topPercent: 39,
    leftPercent: 71,
    widthPercent: 15,
    heightPercent: 14
  },
  { 
    id: 'AFFILIATE_MINER', 
    name: 'AFFILIATE MINER', 
    sub: 'PROGRAMMES D\'AFFILIATION', 
    roleType: 'COMMUNICANT', 
    iconColor: '#3498DB', 
    tagColor: '#3498DB', 
    revenue: 12.80, 
    status: 'OPTIMAL', 
    description: 'Salle des maillons et passerelles réseau gérant les partenariats d\'affiliation récurrente.',
    topPercent: 54,
    leftPercent: 17,
    widthPercent: 16,
    heightPercent: 15
  },
  { 
    id: 'DIGITAL_MINER', 
    name: 'DIGITAL MINER', 
    sub: 'PRODUITS NUMÉRIQUES', 
    roleType: 'DEVELOPPEUR', 
    iconColor: '#8A2BFF', 
    tagColor: '#8A2BFF', 
    revenue: 24.50, 
    status: 'OPTIMAL', 
    description: 'Studio violet avec notes de musique et flux vidéo distribuant des micro-assets numériques réutilisables.',
    topPercent: 54,
    leftPercent: 43,
    widthPercent: 17,
    heightPercent: 15
  },
  { 
    id: 'GOLD_ANALYST', 
    name: 'GOLD ANALYST', 
    sub: 'ANALYSE FINANCIÈRE', 
    roleType: 'ANALYSTE', 
    iconColor: '#21EC71', 
    tagColor: '#21EC71', 
    revenue: 0, 
    status: 'OPTIMAL', 
    description: 'Salle d\'analyse financière aux écrans verts vérifiant les flux de trésorerie avant encaissement réel.',
    topPercent: 54,
    leftPercent: 71,
    widthPercent: 15,
    heightPercent: 15
  },
  { 
    id: 'MINE_GUARD', 
    name: 'MINE GUARD', 
    sub: 'SÉCURITÉ ET CONFORMITÉ', 
    roleType: 'SECURITE', 
    iconColor: '#E74C3C', 
    tagColor: '#E74C3C', 
    revenue: 0, 
    status: 'OPTIMAL', 
    description: 'Poste blindé de surveillance avec gyrophares et triangles d\'alerte rouges bloquant toute dérive.',
    topPercent: 70,
    leftPercent: 17,
    widthPercent: 16,
    heightPercent: 16
  },
  { 
    id: 'SALLE_DES_COFFRES', 
    name: 'SALLE DES COFFRES', 
    sub: 'REVENUS CONFIRMÉS', 
    roleType: 'BANQUIER', 
    iconColor: '#FFB800', 
    tagColor: '#FFB800', 
    revenue: 24.50, 
    status: 'OPTIMAL', 
    description: 'Chambre forte impénétrable au niveau rocheux le plus profond, remplie de lingots et wagonnet d\'or.',
    topPercent: 70,
    leftPercent: 41,
    widthPercent: 21,
    heightPercent: 16
  },
  { 
    id: 'ATELIER', 
    name: 'ATELIER', 
    sub: 'PERSONNALISATION', 
    roleType: 'DESIGNER', 
    iconColor: '#FF8A3D', 
    tagColor: '#FF8A3D', 
    revenue: 0, 
    status: 'ACTIVE', 
    description: 'Atelier de forge numérique et maintenance des pioches et foreuses virtuelles.',
    topPercent: 70,
    leftPercent: 68,
    widthPercent: 14,
    heightPercent: 16
  },
  { 
    id: 'LABORATOIRE', 
    name: 'LABORATOIRE', 
    sub: 'ANALYSE ET R&D', 
    roleType: 'SCIENTIFIQUE', 
    iconColor: '#00EDFF', 
    tagColor: '#00EDFF', 
    revenue: 0, 
    status: 'OPTIMAL', 
    description: 'Laboratoire cybernétique avec cuve cryogénique bleutée maintenant un agent en stase d\'optimisation.',
    topPercent: 70,
    leftPercent: 83,
    widthPercent: 14,
    heightPercent: 16
  },
];

export const CentmineShelterView: React.FC<Props> = ({
  miningRunning,
  onToggleMining,
  onOpenTownView,
  onThemeSelect,
}) => {
  const [activeSideTab, setActiveSideTab] = useState('ACCUEIL');
  const [selectedTheme, setSelectedTheme] = useState('CYBERPUNK');
  const [activeRoomId, setActiveRoomId] = useState<string | null>('SALLE_DES_COFFRES');
  const [showRoomInspector, setShowRoomInspector] = useState<boolean>(true);
  const [showHotspots, setShowHotspots] = useState<boolean>(true);
  const [soundMuted, setSoundMuted] = useState(soundEngine.isMuted());

  const activeRoom = SHELTER_ROOMS.find(r => r.id === activeRoomId) || SHELTER_ROOMS[0];

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-[#0A0F1E] text-slate-100 select-none">
      {/* 1. Top Bar matching Image 1 */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#111522]/95 border-b border-[#1B1F2A] z-20 shrink-0">
        {/* Left: Gold Hexagon Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFB800] via-[#FF8A3D] to-[#8A2BFF] p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(255,184,0,0.5)]">
            <div className="w-full h-full bg-[#0A0F1E] rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#FFB800]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-orbitron font-extrabold text-base sm:text-lg tracking-wider text-white">
                CCC <span className="text-[#FFB800]">CENTMINE</span>
              </span>
              <span className="text-[10px] font-mono-code px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
                v1.0
              </span>
              <span className="hidden lg:inline text-[9px] font-mono-code px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-400/40">
                ☢️ ABRI FALLOUT SOUTERRAIN
              </span>
            </div>
            <span className="text-[10px] font-inter text-slate-400 block -mt-0.5">
              CODEX COLLECTION CONNECT
            </span>
          </div>
        </div>

        {/* Center: Stat Capsules matching Image 1 */}
        <div className="hidden md:flex items-center gap-2">
          {/* Revenus confirmés */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#1B1F2A]/80 border border-slate-700/80">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Coins className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <span className="text-[9.5px] font-mono-code text-slate-400 block">Revenus confirmés</span>
              <span className="font-orbitron font-bold text-sm text-[#21EC71]">24,50 €</span>
            </div>
          </div>

          {/* Opportunités trouvées */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#1B1F2A]/80 border border-slate-700/80">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <Gem className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <span className="text-[9.5px] font-mono-code text-slate-400 block">Opportunités trouvées</span>
              <span className="font-orbitron font-bold text-sm text-[#00EDFF]">12</span>
            </div>
          </div>

          {/* Missions en cours */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#1B1F2A]/80 border border-slate-700/80">
            <div className="w-7 h-7 rounded-lg bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-yellow-400" />
            </div>
            <div>
              <span className="text-[9.5px] font-mono-code text-slate-400 block">Missions en cours</span>
              <span className="font-orbitron font-bold text-sm text-yellow-300">6</span>
            </div>
          </div>

          {/* Agents actifs */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#1B1F2A]/80 border border-slate-700/80">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <Bot className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <span className="text-[9.5px] font-mono-code text-slate-400 block">Agents actifs</span>
              <span className="font-orbitron font-bold text-sm text-cyan-300">8 / 8</span>
            </div>
          </div>
        </div>

        {/* Right: Clock & Settings */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setShowHotspots(prev => !prev);
              soundEngine.playClick();
            }}
            title="Activer/désactiver les balises de salles"
            className={`px-2.5 py-1 rounded text-xs font-mono font-bold border transition ${
              showHotspots
                ? 'bg-[#FFB800]/20 text-[#FFB800] border-[#FFB800]'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            BALISES {showHotspots ? 'ON' : 'OFF'}
          </button>
          <div className="text-right">
            <span className="font-orbitron font-bold text-sm text-cyan-400 block leading-tight">14:27</span>
            <span className="text-[10px] font-mono-code text-slate-400 block">30/10/2026</span>
          </div>
          <button 
            onClick={() => soundEngine.playClick()}
            className="p-2 rounded-lg bg-[#1B1F2A] hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Main Body: Left Sidebar + Central Full Shelter Canvas */}
      <div className="flex-1 w-full flex overflow-hidden relative">
        {/* Left Sidebar matching Image 1 */}
        <div className="w-44 lg:w-48 bg-[#111522] border-r border-[#1B1F2A] flex flex-col justify-between p-3 shrink-0 overflow-y-auto z-10">
          {/* Main Navigation links */}
          <div className="space-y-1.5">
            {[
              { id: 'ACCUEIL', label: 'ACCUEIL', icon: Home, active: true },
              { id: 'MINEURS', label: 'MINEURS', icon: Bot },
              { id: 'MISSIONS', label: 'MISSIONS', icon: ClipboardList, badge: true },
              { id: 'GISEMENTS', label: 'GISEMENTS', icon: Gem },
              { id: 'NAVIGATEUR', label: 'NAVIGATEUR', icon: Globe },
              { id: 'FINANCES', label: 'FINANCES', icon: Coins },
              { id: 'STATISTIQUES', label: 'STATISTIQUES', icon: BarChart3 },
              { id: 'PARAMETRES', label: 'PARAMÈTRES', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeSideTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSideTab(item.id);
                    soundEngine.playTick();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-orbitron font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/25 to-transparent border border-amber-500/70 text-amber-300 shadow-[0_0_12px_rgba(255,184,0,0.3)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Lower Theme Selector matching Image 1 */}
          <div className="pt-3 border-t border-slate-800">
            <span className="text-[10px] font-mono-code uppercase text-slate-400 block mb-2">
              THÈME
            </span>
            <div className="space-y-1.5">
              {['CLASSIQUE', 'CYBERPUNK', 'NUCLEAR', 'MINIMAL'].map((theme) => (
                <label
                  key={theme}
                  onClick={() => {
                    setSelectedTheme(theme);
                    soundEngine.playClick();
                    if (onThemeSelect) onThemeSelect(theme);
                  }}
                  className="flex items-center gap-2 text-xs font-orbitron cursor-pointer text-slate-300 hover:text-white"
                >
                  <input
                    type="radio"
                    name="shelterTheme"
                    checked={selectedTheme === theme}
                    onChange={() => {}}
                    className="accent-amber-400"
                  />
                  <span className={selectedTheme === theme ? 'text-amber-300 font-bold' : ''}>
                    {theme}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Central Cross-Section Fallout Shelter Cutaway Canvas (Image 1 in FULL GLORY) */}
        <div className="relative flex-1 h-full overflow-hidden flex flex-col justify-between bg-[#050811]">
          {/* Pristine Full-Fidelity Fallout Shelter Cutaway Illustration */}
          <div className="absolute inset-0 overflow-hidden flex items-center justify-center pointer-events-none">
            <img 
              src="/skins/centmine_shelter.png" 
              alt="CCC Centmine Fallout Shelter"
              className="w-full h-full object-cover object-center select-none"
            />
          </div>

          {/* Interactive Room Hotspots Overlay on top of the Shelter image */}
          {showHotspots && (
            <div className="absolute inset-0 z-10 pointer-events-auto">
              {SHELTER_ROOMS.map((room) => {
                const isSelected = activeRoomId === room.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => {
                      setActiveRoomId(room.id);
                      setShowRoomInspector(true);
                      soundEngine.playClick();
                    }}
                    style={{
                      top: `${room.topPercent}%`,
                      left: `${room.leftPercent}%`,
                      width: `${room.widthPercent}%`,
                      height: `${room.heightPercent}%`,
                    }}
                    className={`group absolute rounded-lg border-2 transition-all flex flex-col justify-between p-1.5 sm:p-2 text-left backdrop-blur-[2px] ${
                      isSelected
                        ? 'border-[#FFB800] bg-[#FFB800]/25 shadow-[0_0_25px_rgba(255,184,0,0.6)] scale-[1.03] z-20 ring-2 ring-[#FFB800]'
                        : 'border-[#00EDFF]/40 bg-[#0A0F1E]/30 hover:border-[#FFB800] hover:bg-[#FFB800]/20 hover:scale-[1.02]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span 
                        className="font-orbitron font-extrabold text-[10px] sm:text-xs tracking-wider px-1.5 py-0.5 rounded shadow text-white"
                        style={{ backgroundColor: `${room.tagColor}CC` }}
                      >
                        {room.name}
                      </span>
                      {room.revenue > 0 && (
                        <span className="font-orbitron font-bold text-[9px] sm:text-[10px] text-[#21EC71] bg-black/70 px-1 rounded border border-emerald-500/40">
                          {room.revenue.toFixed(1)}€
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between w-full text-[9px] font-mono-code text-white bg-black/60 px-1 py-0.5 rounded mt-auto">
                      <span className="truncate max-w-[80px]">{room.sub}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Floating Room Tactical HUD Inspector (bottom overlay) */}
          {showRoomInspector && activeRoom && (
            <div className="relative z-20 mt-auto m-3 p-3.5 rounded-xl bg-[#0E162E]/95 border-2 border-[#FFB800] shadow-[0_0_30px_rgba(255,184,0,0.4)] backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-3.5 w-full md:w-auto">
                <RobotAvatar role={activeRoom.roleType} size="md" glow={true} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-orbitron font-extrabold text-sm sm:text-base text-white tracking-wide">
                      {activeRoom.name}
                    </span>
                    <span 
                      className="text-[10px] px-2 py-0.5 rounded font-mono font-bold"
                      style={{ backgroundColor: `${activeRoom.tagColor}33`, color: activeRoom.tagColor, border: `1px solid ${activeRoom.tagColor}88` }}
                    >
                      {activeRoom.sub}
                    </span>
                    <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      RÉSERVE : {activeRoom.revenue > 0 ? `${activeRoom.revenue.toFixed(2)} €` : 'Extraction active'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans mt-1 max-w-2xl leading-snug">
                    {activeRoom.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto justify-end">
                <button
                  onClick={() => {
                    soundEngine.playSuccess();
                  }}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FFB800] to-[#FF8A3D] text-black font-orbitron font-bold text-xs hover:brightness-110 shadow-[0_0_15px_rgba(255,184,0,0.4)] transition flex items-center gap-1.5"
                >
                  <Zap className="w-4 h-4 fill-black" />
                  EXTRAIRE & CONSOLIDER
                </button>
                <button
                  onClick={() => setShowRoomInspector(false)}
                  className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Bottom Controls Bar matching Image 1 */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#111522] border-t border-[#1B1F2A] z-20 shrink-0">
        {/* Left: Cycle Progress Radial Dial */}
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 flex items-center justify-center">
            <svg viewBox="0 0 44 44" className="w-full h-full -rotate-90">
              <circle cx="22" cy="22" r="18" fill="none" stroke="#1B1F2A" strokeWidth="4" />
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                stroke="#00EDFF"
                strokeWidth="4"
                strokeDasharray="113"
                strokeDashoffset={miningRunning ? "35" : "113"}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <Zap className="absolute w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <span className="text-[10px] font-mono-code uppercase text-slate-400 block">
              Cycle actuel
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-orbitron font-semibold text-xs text-white">
                {miningRunning ? 'Minage automatique' : 'Minage suspendu'}
              </span>
              <span className="text-xs font-mono-code text-cyan-400">01:24:15</span>
            </div>
          </div>
        </div>

        {/* Center: Three Giant Action Buttons matching Image 1 */}
        <div className="flex items-center gap-3">
          {/* DÉMARRER (Green) */}
          <button
            onClick={() => {
              onToggleMining(true);
              soundEngine.playSuccess();
            }}
            className={`px-4 sm:px-5 py-2.5 rounded-xl border font-orbitron font-bold text-xs transition-all flex items-center gap-2.5 sm:gap-3 ${
              miningRunning
                ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 shadow-[0_0_15px_rgba(33,236,113,0.3)]'
                : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400 text-white'
            }`}
          >
            <div className="p-1 rounded bg-black/30">
              <Play className="w-4 h-4 fill-white text-white" />
            </div>
            <div className="text-left">
              <span className="block text-xs sm:text-sm leading-tight">DÉMARRER</span>
              <span className="text-[9px] opacity-80 font-normal font-inter hidden sm:block">Le minage commence</span>
            </div>
          </button>

          {/* PAUSE (Amber) */}
          <button
            onClick={() => {
              onToggleMining(false);
              soundEngine.playClick();
            }}
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 font-orbitron font-bold text-xs transition-all flex items-center gap-2.5 sm:gap-3"
          >
            <div className="p-1 rounded bg-black/30">
              <Pause className="w-4 h-4 fill-amber-300 text-amber-300" />
            </div>
            <div className="text-left">
              <span className="block text-xs sm:text-sm leading-tight">PAUSE</span>
              <span className="text-[9px] opacity-80 font-normal font-inter hidden sm:block">Mettre en pause</span>
            </div>
          </button>

          {/* ARRÊTER (Red) */}
          <button
            onClick={() => {
              onToggleMining(false);
              soundEngine.playAlert();
            }}
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/60 text-red-400 font-orbitron font-bold text-xs transition-all flex items-center gap-2.5 sm:gap-3"
          >
            <div className="p-1 rounded bg-black/30">
              <Square className="w-4 h-4 fill-red-400 text-red-400" />
            </div>
            <div className="text-left">
              <span className="block text-xs sm:text-sm leading-tight">ARRÊTER</span>
              <span className="text-[9px] opacity-80 font-normal font-inter hidden sm:block">Arrêt d'urgence</span>
            </div>
          </button>
        </div>

        {/* Right: Notes, Sons, Vue, Plein écran matching Image 1 */}
        <div className="hidden lg:flex items-center gap-1.5">
          <button
            onClick={() => soundEngine.playClick()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1B1F2A] hover:bg-slate-700 text-xs font-orbitron text-slate-300"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Notes</span>
          </button>
          <button
            onClick={() => {
              soundEngine.toggleMute();
              setSoundMuted(soundEngine.isMuted());
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1B1F2A] hover:bg-slate-700 text-xs font-orbitron text-slate-300"
          >
            {soundMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
            <span>Sons</span>
          </button>
          <button
            onClick={onOpenTownView}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400 text-cyan-300 hover:bg-cyan-500/30 text-xs font-orbitron"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Vue Ville</span>
          </button>
          <button
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen?.();
              } else {
                document.exitFullscreen?.();
              }
            }}
            className="p-2 rounded-lg bg-[#1B1F2A] hover:bg-slate-700 text-slate-300"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
