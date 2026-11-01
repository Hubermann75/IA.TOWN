/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IA TOWN — VUE COUPE BÂTIMENTS ARCHITECTURE (Image 4)
 * Écorché architectural haute-définition des 4 bâtiments majeurs et de la mine souterraine
 * avec immersion visuelle totale (Image 4), zones interactives et fiches des étages/robots.
 */

import React, { useState } from 'react';
import { BuildingInfo, BuildingType } from '../types/town';
import { soundEngine } from '../utils/soundEngine';
import { RobotAvatar, RobotRoleDesign } from './RobotAvatar';
import { 
  Building2, 
  Layers, 
  Cpu, 
  Users, 
  Activity, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  Info,
  Maximize2,
  Flame,
  ArrowDownCircle
} from 'lucide-react';

interface Props {
  buildings: BuildingInfo[];
  selectedBuildingId: BuildingType | null;
  onSelectBuilding: (id: BuildingType) => void;
  onInspectAgent?: (agentId: string) => void;
  onOpenShelter?: () => void;
}

interface CutawayFloor {
  name: string;
  role: string;
  roleType: RobotRoleDesign;
  status: 'OPTIMAL' | 'ACTIVE' | 'PROCESSING';
  metric: string;
  agentsCount: number;
  highlightColor: string;
}

const BUILDING_FLOOR_DATA: Record<string, CutawayFloor[]> = {
  AI_GENCY: [
    { name: 'DIRECTION', role: 'Stratégie générale & arbitrage investissements', roleType: 'DIRECTEUR', status: 'OPTIMAL', metric: 'ROI 142%', agentsCount: 2, highlightColor: '#FFB800' },
    { name: 'MARKETING', role: 'Campagnes d\'acquisition & positionnement', roleType: 'COMMUNICANT', status: 'ACTIVE', metric: '+18% CTR', agentsCount: 3, highlightColor: '#00EDFF' },
    { name: 'COMMERCIAL', role: 'Négociation partenariats & closing contrats', roleType: 'VENDEUR', status: 'ACTIVE', metric: '27 leads', agentsCount: 4, highlightColor: '#FF8A3D' },
    { name: 'FINANCE', role: 'Audit rentabilité & consolidation bilans', roleType: 'ANALYSTE', status: 'OPTIMAL', metric: '2 846,50 €', agentsCount: 2, highlightColor: '#21EC71' },
    { name: 'PRODUCTION', role: 'Supervision création de produits numériques', roleType: 'DEVELOPPEUR', status: 'PROCESSING', metric: '42 items', agentsCount: 5, highlightColor: '#8A2BFF' },
    { name: 'ADMINISTRATION', role: 'Conformité légale, RGPD & registres', roleType: 'TECHNICIEN', status: 'OPTIMAL', metric: '100% légal', agentsCount: 2, highlightColor: '#3498DB' },
  ],
  ARE_IA_CENTER: [
    { name: 'GESTIONNAIRE D\'AGENTS', role: 'Orchestration globale des 94 agents IA', roleType: 'TECHNICIEN', status: 'OPTIMAL', metric: '94/94 prêts', agentsCount: 4, highlightColor: '#00EDFF' },
    { name: 'PLANIFICATEUR DE MISSIONS', role: 'Allocation dynamique de ressources & files', roleType: 'TECHNICIEN', status: 'ACTIVE', metric: '27 actives', agentsCount: 3, highlightColor: '#00EDFF' },
    { name: 'CONNECTEURS IA', role: 'Passerelles LLM, Gemini & modèles spécialisés', roleType: 'DEVELOPPEUR', status: 'OPTIMAL', metric: 'Latence 18ms', agentsCount: 3, highlightColor: '#21EC71' },
    { name: 'NAVIGATEUR INTÉGRÉ', role: 'Veille web temps réel & scraping légal', roleType: 'EXPLORATEUR', status: 'PROCESSING', metric: '128 sources', agentsCount: 2, highlightColor: '#FFB800' },
    { name: 'GESTION DES RESSOURCES', role: 'Optimisation GPU, RAM & compute nodes', roleType: 'TECHNICIEN', status: 'OPTIMAL', metric: 'CPU 28%', agentsCount: 2, highlightColor: '#3498DB' },
    { name: 'SÉCURITÉ ET AUTORISATIONS', role: 'Tokens chiffrés & pare-feu biométrique', roleType: 'SECURITE', status: 'OPTIMAL', metric: 'Zéro brèche', agentsCount: 3, highlightColor: '#E74C3C' },
  ],
  BANK_IA: [
    { name: 'VAULT KEEPER', role: 'Chambre forte & conservation des encaisses réelles', roleType: 'BANQUIER', status: 'OPTIMAL', metric: '2 846,50 €', agentsCount: 2, highlightColor: '#FFB800' },
    { name: 'BANK CONNECT', role: 'Rapprochement bancaire & APIs financières réelles', roleType: 'BANQUIER', status: 'OPTIMAL', metric: 'Sync 30s', agentsCount: 2, highlightColor: '#21EC71' },
    { name: 'RIB MANAGER', role: 'Gestion sécurisée des comptes de virement', roleType: 'BANQUIER', status: 'OPTIMAL', metric: 'Chiffré AES', agentsCount: 1, highlightColor: '#3498DB' },
    { name: 'TRANSACTION AUDITOR', role: 'Contrôle anti-gains fictifs & traçabilité stricte', roleType: 'ANALYSTE', status: 'OPTIMAL', metric: 'Vérifié 100%', agentsCount: 3, highlightColor: '#00EDFF' },
    { name: 'LEDGER AGENT', role: 'Journal comptable immuable à double entrée', roleType: 'ANALYSTE', status: 'ACTIVE', metric: '1 428 tx', agentsCount: 2, highlightColor: '#FFB800' },
    { name: 'FRAUD GUARD', role: 'Détection d\'anomalies et blocage automatique', roleType: 'SECURITE', status: 'OPTIMAL', metric: '0 alerte', agentsCount: 2, highlightColor: '#E74C3C' },
    { name: 'PAYOUT MANAGER', role: 'Paiement fournisseurs, API & commissions', roleType: 'BANQUIER', status: 'PROCESSING', metric: '324,75 €', agentsCount: 2, highlightColor: '#FF8A3D' },
  ],
  DUMP_INCINERATOR: [
    { name: 'DUMP COLLECTOR', role: 'Collecte des données obsolètes & logs expirés', roleType: 'EBOUER', status: 'ACTIVE', metric: '4.2 Go/j', agentsCount: 2, highlightColor: '#21EC71' },
    { name: 'WASTE SORTER', role: 'Tri sélectif numérique & recyclage vectoriel', roleType: 'EBOUER', status: 'ACTIVE', metric: '98% recyclé', agentsCount: 2, highlightColor: '#21EC71' },
    { name: 'ARCHIVE KEEPER', role: 'Compression à froid & stockage longue durée', roleType: 'TECHNICIEN', status: 'OPTIMAL', metric: 'Ratio 1:8', agentsCount: 2, highlightColor: '#3498DB' },
    { name: 'INCINERATOR AGENT', role: 'Destruction irréversible certifiée DOD 5220.22', roleType: 'EBOUER', status: 'PROCESSING', metric: 'Four actif', agentsCount: 2, highlightColor: '#FF8A3D' },
    { name: 'CACHE CLEANER', role: 'Purge des caches mémoire & sessions temporaires', roleType: 'EBOUER', status: 'OPTIMAL', metric: 'Libéré 2.1G', agentsCount: 1, highlightColor: '#00EDFF' },
    { name: 'DATA GUARD', role: 'Nettoyage des résidus personnels & conformité RGPD', roleType: 'SECURITE', status: 'OPTIMAL', metric: '100% conforme', agentsCount: 2, highlightColor: '#21EC71' },
    { name: 'ECO MONITOR', role: 'Empreinte carbone & efficacité énergétique CPU', roleType: 'TECHNICIEN', status: 'OPTIMAL', metric: 'A++ Green', agentsCount: 1, highlightColor: '#21EC71' },
  ],
  AI_DEPTH_CENTMINE: [
    { name: 'OVERMINE', role: 'Coordination générale de l\'abri et des robots mineurs', roleType: 'DIRECTEUR', status: 'OPTIMAL', metric: 'Niveau 1', agentsCount: 1, highlightColor: '#FFB800' },
    { name: 'PROSPECTOR & CRISTAUX', role: 'Exploration des filons et microtâches numériques', roleType: 'MINEUR', status: 'ACTIVE', metric: 'Niveau 2', agentsCount: 2, highlightColor: '#00EDFF' },
    { name: 'SALLE DES COFFRES', role: 'Conservation des réserves métalliques et fonds réels', roleType: 'BANQUIER', status: 'OPTIMAL', metric: 'Niveau 4', agentsCount: 2, highlightColor: '#FFB800' },
    { name: 'MINE GUARD & LABO', role: 'Sécurité et analyse R&D en cuve cryogénique', roleType: 'SECURITE', status: 'OPTIMAL', metric: 'Niveau 4', agentsCount: 2, highlightColor: '#E74C3C' },
  ]
};

// Image 4 cutaway building hotspots
const CUTAWAY_HOTSPOTS = [
  { id: 'AI_GENCY', name: 'AI.GENCY', sub: 'Création • Marketing • Commercial', top: 18, left: 18, width: 20, height: 62, color: '#00EDFF' },
  { id: 'ARE_IA_CENTER', name: 'ARE.IA.CENTER', sub: 'Supervision • IA • Ressources', top: 22, left: 40, width: 20, height: 58, color: '#00EDFF' },
  { id: 'BANK_IA', name: 'BANK.IA', sub: 'Sécurisation • Comptes • Transactions', top: 20, left: 61, width: 18, height: 60, color: '#FFB800' },
  { id: 'DUMP_INCINERATOR', name: 'DUMP & INCINERATOR', sub: 'Nettoyage • Tri • Recyclage • Sécurité', top: 16, left: 80, width: 18, height: 64, color: '#21EC71' },
  { id: 'AI_DEPTH_CENTMINE', name: 'AI.DEPTH.CENTMINE', sub: 'Recherche d\'opportunités • Microrevenus • Abri', top: 80, left: 16, width: 82, height: 16, color: '#FFB800' },
];

export const BuildingCutawayView: React.FC<Props> = ({
  buildings,
  selectedBuildingId,
  onSelectBuilding,
  onInspectAgent,
  onOpenShelter,
}) => {
  const [activeBuildingTab, setActiveBuildingTab] = useState<string>(
    selectedBuildingId && BUILDING_FLOOR_DATA[selectedBuildingId] ? selectedBuildingId : 'AI_GENCY'
  );
  const [selectedFloorIndex, setSelectedFloorIndex] = useState<number | null>(0);
  const [viewMode, setViewMode] = useState<'IMMERSION_IMAGE' | 'DETAIL_ETAGES'>('IMMERSION_IMAGE');

  const currentFloors = BUILDING_FLOOR_DATA[activeBuildingTab] || BUILDING_FLOOR_DATA['AI_GENCY'];
  const activeBuilding = buildings.find(b => b.id === activeBuildingTab);
  const currentFloor = selectedFloorIndex !== null ? currentFloors[selectedFloorIndex] : null;

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-[#0A0F1E] text-slate-100 select-none">
      {/* Top Building Switcher Tabs */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#111522] border-b border-[#1B1F2A] z-20 overflow-x-auto gap-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="font-orbitron font-bold text-xs text-cyan-400 mr-2 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" />
            COUPE ARCHITECTURALE (IMAGE 4) :
          </span>
          {Object.keys(BUILDING_FLOOR_DATA).map((key) => {
            const isTabActive = activeBuildingTab === key;
            const b = buildings.find(item => item.id === key);
            return (
              <button
                key={key}
                onClick={() => {
                  setActiveBuildingTab(key);
                  onSelectBuilding(key as BuildingType);
                  setSelectedFloorIndex(0);
                  soundEngine.playTick();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-orbitron font-semibold transition-all flex items-center gap-1.5 ${
                  isTabActive
                    ? 'bg-gradient-to-r from-[#00EDFF]/30 to-[#8A2BFF]/30 border border-[#00EDFF] text-white shadow-[0_0_12px_rgba(0,237,255,0.4)]'
                    : 'bg-[#1B1F2A]/60 text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                <span>{b?.name || key}</span>
                <span className="text-[10px] px-1 rounded bg-black/40 text-slate-300">
                  {BUILDING_FLOOR_DATA[key].length} ét.
                </span>
              </button>
            );
          })}
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 rounded-lg bg-black/50 border border-slate-700 text-xs">
            <button
              onClick={() => {
                setViewMode('IMMERSION_IMAGE');
                soundEngine.playClick();
              }}
              className={`px-2.5 py-1 rounded font-mono font-bold transition ${
                viewMode === 'IMMERSION_IMAGE'
                  ? 'bg-[#00EDFF] text-black shadow-[0_0_10px_rgba(0,237,255,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              VUE COUPE IMAGE
            </button>
            <button
              onClick={() => {
                setViewMode('DETAIL_ETAGES');
                soundEngine.playClick();
              }}
              className={`px-2.5 py-1 rounded font-mono font-bold transition ${
                viewMode === 'DETAIL_ETAGES'
                  ? 'bg-[#00EDFF] text-black shadow-[0_0_10px_rgba(0,237,255,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              LISTE ÉTAGES
            </button>
          </div>
        </div>
      </div>

      {/* Main Cutaway Stage */}
      <div className="relative flex-1 w-full grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left / Center Area */}
        <div className="relative lg:col-span-8 flex flex-col justify-between overflow-hidden bg-[#070B16]">
          {viewMode === 'IMMERSION_IMAGE' ? (
            /* Full-fidelity Architectural Cutaway Image (Image 4) with interactive hotspots */
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#0A0F1E]">
              <img 
                src="/skins/buildings_cutaway.png" 
                alt="Coupe Bâtiments IA TOWN" 
                className="w-full h-full object-cover object-center select-none"
              />

              {/* Clickable Building Hotspots */}
              <div className="absolute inset-0 z-10">
                {CUTAWAY_HOTSPOTS.map((spot) => {
                  const isSelected = activeBuildingTab === spot.id;
                  return (
                    <button
                      key={spot.id}
                      onClick={() => {
                        setActiveBuildingTab(spot.id);
                        onSelectBuilding(spot.id as BuildingType);
                        setSelectedFloorIndex(0);
                        soundEngine.playClick();
                      }}
                      style={{
                        top: `${spot.top}%`,
                        left: `${spot.left}%`,
                        width: `${spot.width}%`,
                        height: `${spot.height}%`,
                      }}
                      className={`group absolute rounded-xl border-2 transition-all p-2 flex flex-col justify-between text-left ${
                        isSelected
                          ? 'border-[#00EDFF] bg-[#00EDFF]/20 shadow-[0_0_30px_rgba(0,237,255,0.5)] ring-2 ring-[#00EDFF]'
                          : 'border-transparent hover:border-[#00EDFF]/50 hover:bg-[#00EDFF]/10'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-orbitron font-extrabold text-[11px] sm:text-xs text-white bg-black/80 px-2 py-0.5 rounded border border-white/20 shadow">
                          {spot.name}
                        </span>
                        {spot.id === 'AI_DEPTH_CENTMINE' && onOpenShelter && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenShelter();
                              soundEngine.playSuccess();
                            }}
                            className="px-2 py-0.5 rounded bg-amber-500 text-black font-bold font-orbitron text-[10px] hover:scale-105 shadow flex items-center gap-1"
                          >
                            <span>☢️ OUVRIR L'ABRI</span>
                          </button>
                        )}
                      </div>
                      <div className="text-[9px] font-mono-code text-cyan-300 bg-black/70 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition truncate max-w-full">
                        {spot.sub}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Bottom quick banner for underground mine */}
              <div className="absolute bottom-2 left-4 right-4 z-20 flex items-center justify-between p-2 rounded-lg bg-[#0E162E]/90 border border-[#FFB800]/50 backdrop-blur-md text-xs font-mono">
                <span className="text-[#FFB800] flex items-center gap-1.5 font-bold">
                  <Flame className="w-4 h-4" /> BÂTIMENT SÉLECTIONNÉ : {activeBuilding?.name || activeBuildingTab}
                </span>
                {onOpenShelter && (
                  <button
                    onClick={onOpenShelter}
                    className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black font-orbitron font-bold text-[11px] transition flex items-center gap-1"
                  >
                    <span>PLONGER DANS L'ABRI CENTMINE</span>
                    <ArrowDownCircle className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Detailed Floors Stack View */
            <div className="p-4 overflow-y-auto flex flex-col justify-between h-full">
              {/* Building Title Header */}
              <div className="flex items-center justify-between mb-3 bg-[#111522]/90 border border-cyan-500/30 rounded-xl p-3 backdrop-blur-md">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-orbitron font-extrabold text-lg text-white">
                      {activeBuilding?.name || activeBuildingTab}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono-code">
                      {activeBuilding?.codename || 'CODE.CORE'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-inter mt-0.5">
                    {activeBuilding?.description}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono-code text-slate-400 block">Agent Responsable</span>
                  <span className="text-xs font-orbitron font-bold text-amber-400">{activeBuilding?.headAgent || 'DIRECTEUR.IA'}</span>
                </div>
              </div>

              {/* Floors Stack */}
              <div className="flex flex-col gap-2.5 my-auto">
                {currentFloors.map((floor, idx) => {
                  const isSelected = selectedFloorIndex === idx;
                  return (
                    <div
                      key={floor.name}
                      onClick={() => {
                        setSelectedFloorIndex(idx);
                        soundEngine.playSuccess();
                      }}
                      className={`group relative flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer backdrop-blur-md ${
                        isSelected
                          ? 'bg-[#111522]/95 border-[#00EDFF] shadow-[0_0_15px_rgba(0,237,255,0.3)] scale-[1.01]'
                          : 'bg-[#111522]/75 border-[#1B1F2A] hover:border-slate-500 hover:bg-[#111522]/90'
                      }`}
                      style={{
                        borderLeftWidth: '5px',
                        borderLeftColor: floor.highlightColor,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-black/50 border border-slate-700 flex items-center justify-center font-orbitron font-bold text-xs text-slate-300">
                          E{currentFloors.length - idx}
                        </div>
                        <RobotAvatar role={floor.roleType} size="sm" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-orbitron font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                              {floor.name}
                            </span>
                            <span className="text-[10px] font-mono-code px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-slate-300">
                              {floor.metric}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 font-inter line-clamp-1">
                            {floor.role}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                          <span className="text-[10px] font-mono-code text-slate-400 block">Robots au poste</span>
                          <span className="text-xs font-orbitron font-semibold text-emerald-400">
                            {floor.agentsCount} agents actifs
                          </span>
                        </div>
                        <div
                          className="w-2.5 h-2.5 rounded-full animate-pulse"
                          style={{ backgroundColor: floor.highlightColor }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 p-2 bg-[#1B1F2A]/60 border border-slate-700/60 rounded-lg flex items-center justify-between text-xs text-slate-400 font-mono-code">
                <span>SOUS-SOL CONNECTÉ : AI.DEPTH.CENTMINE (MINAGE & MICROREVENUS)</span>
                <span className="text-amber-400">GALERIES 1 À 8 PRÊTES</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Detailed Room Inspector */}
        <div className="relative lg:col-span-4 bg-[#111522]/95 border-l border-[#1B1F2A] p-4 flex flex-col justify-between overflow-y-auto">
          {currentFloor ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <RobotAvatar role={currentFloor.roleType} size="md" />
                  <div>
                    <h3 className="font-orbitron font-bold text-sm text-white">
                      {currentFloor.name}
                    </h3>
                    <span className="text-[11px] text-cyan-400 font-mono-code">
                      POSTE DE TRAVAIL SPÉCIALISÉ
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono-code">
                  {currentFloor.status}
                </span>
              </div>

              {/* Floor Role Description */}
              <div className="bg-[#0A0F1E] border border-slate-800 p-3 rounded-xl">
                <span className="text-[10px] uppercase font-mono-code text-slate-400 block mb-1">
                  Mission de l'étage
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-inter">
                  {currentFloor.role}
                </p>
              </div>

              {/* Real-time Telemetry Gauges */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#0A0F1E] border border-slate-800 p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-mono-code">DÉBIT OPÉRATIONNEL</span>
                  <span className="font-orbitron font-bold text-base text-cyan-400 mt-1 block">
                    {currentFloor.metric}
                  </span>
                </div>
                <div className="bg-[#0A0F1E] border border-slate-800 p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-mono-code">ROBOTS POSTÉS</span>
                  <span className="font-orbitron font-bold text-base text-emerald-400 mt-1 block">
                    {currentFloor.agentsCount} Unités
                  </span>
                </div>
                <div className="bg-[#0A0F1E] border border-slate-800 p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-mono-code">CHARGE CPU MOY.</span>
                  <span className="font-orbitron font-bold text-base text-amber-400 mt-1 block">
                    28 %
                  </span>
                </div>
                <div className="bg-[#0A0F1E] border border-slate-800 p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-mono-code">CONFORMITÉ RGPD</span>
                  <span className="font-orbitron font-bold text-base text-emerald-400 mt-1 block">
                    100 %
                  </span>
                </div>
              </div>

              {/* Assigned Agents */}
              <div className="bg-[#0A0F1E] border border-slate-800 p-3 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-mono-code text-slate-400">
                    Agents Spécialisés Postés
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono-code">ADN V3.0</span>
                </div>
                <div className="space-y-2">
                  {Array.from({ length: currentFloor.agentsCount }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-lg bg-[#111522] border border-slate-800/80 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <RobotAvatar role={currentFloor.roleType} size="sm" />
                        <div>
                          <div className="font-orbitron font-semibold text-white text-[11px]">
                            {`${currentFloor.name.replace(/[^a-zA-Z]/g, '')}.AGENT_0${i + 1}`}
                          </div>
                          <div className="text-[9.5px] text-slate-400 font-mono-code">
                            Type B • 100% Autonome
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono-code">EN LIGNE</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 font-inter text-xs">
              Sélectionnez un étage ou cliquez sur un bâtiment sur la coupe pour l'inspecter.
            </div>
          )}

          {/* Quick Action Floor Control */}
          <div className="pt-4 border-t border-slate-800 flex gap-2">
            <button
              onClick={() => soundEngine.playSuccess()}
              className="flex-1 py-2 rounded-lg bg-[#00EDFF]/20 border border-[#00EDFF] text-[#00EDFF] font-orbitron font-bold text-xs hover:bg-[#00EDFF]/30 transition-all flex items-center justify-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5" />
              Lancer Auto-Test
            </button>
            <button
              onClick={() => soundEngine.playClick()}
              className="py-2 px-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-orbitron text-xs flex items-center justify-center"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
