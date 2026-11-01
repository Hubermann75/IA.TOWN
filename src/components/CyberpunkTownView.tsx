/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Cyberpunk Town View — Isometric Interactive City Map
 */

import React, { useState } from 'react';
import { BuildingInfo, BuildingType } from '../types/town';
import { 
  Building2, 
  Cpu, 
  Flame, 
  Radio, 
  ShoppingBag, 
  Wrench, 
  Vault, 
  Scale, 
  Repeat, 
  FlaskConical, 
  Tv, 
  Boxes, 
  Server, 
  Compass, 
  Network,
  Users,
  Activity,
  Zap,
  ChevronRight,
  ShieldCheck,
  Sliders
} from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface Props {
  buildings: BuildingInfo[];
  selectedBuildingId: BuildingType | null;
  onSelectBuilding: (id: BuildingType) => void;
  companyRunning: boolean;
  miningRunning: boolean;
  onOpenHubCutaway: () => void;
  onInspectBuilding?: (building: BuildingInfo) => void;
}

export const CyberpunkTownView: React.FC<Props> = ({
  buildings,
  selectedBuildingId,
  onSelectBuilding,
  companyRunning,
  miningRunning,
  onOpenHubCutaway,
  onInspectBuilding,
}) => {
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'INFRASTRUCTURE' | 'V3_EXTENSIONS' | 'CCC'>('ALL');

  const getBuildingIcon = (id: BuildingType) => {
    switch (id) {
      case 'ARE_IA_CENTER': return <Cpu className="w-5 h-5 text-cyan-400" />;
      case 'AI_GENCY': return <Building2 className="w-5 h-5 text-indigo-400" />;
      case 'RD_IA': return <FlaskConical className="w-5 h-5 text-purple-400" />;
      case 'FACTORY_IA': return <Wrench className="w-5 h-5 text-amber-400" />;
      case 'MARKET_IA': return <ShoppingBag className="w-5 h-5 text-emerald-400" />;
      case 'TRAFFIC_IA': return <Radio className="w-5 h-5 text-sky-400" />;
      case 'AI_DEPTH_CENTMINE': return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'BANK_IA': return <Vault className="w-5 h-5 text-green-400" />;
      case 'CONTRACT_IA': return <Scale className="w-5 h-5 text-slate-400" />;
      case 'SUBSCRIPTION_IA': return <Repeat className="w-5 h-5 text-pink-400" />;
      case 'DUMP_INCINERATOR': return <Flame className="w-5 h-5 text-red-400" />;
      case 'MEDIA_IA': return <Tv className="w-5 h-5 text-fuchsia-400" />;
      case 'PLUGIN_STORE_IA': return <Boxes className="w-5 h-5 text-blue-400" />;
      case 'WEB_ESTATE_IA': return <Server className="w-5 h-5 text-teal-400" />;
      case 'OPPORTUNITY_LAB': return <Compass className="w-5 h-5 text-orange-400" />;
      case 'CCC_CONNECT_HUB': return <Network className="w-5 h-5 text-cyan-300 animate-pulse" />;
      default: return <Building2 className="w-5 h-5 text-slate-400" />;
    }
  };

  const selectedBuilding = buildings.find(b => b.id === selectedBuildingId);

  const filteredBuildings = buildings.filter(b => {
    if (filterCategory === 'INFRASTRUCTURE') return b.category === 'INFRASTRUCTURE_EXISTANTE';
    if (filterCategory === 'V3_EXTENSIONS') return b.category === 'EXTENSION_REVENUE';
    if (filterCategory === 'CCC') return b.category === 'CONNECTIVITE_CCC';
    return true;
  });

  const [atmosphere, setAtmosphere] = useState<'NEON' | 'RAIN' | 'ALERT'>('NEON');
  const [audioFeedbackEnabled, setAudioFeedbackEnabled] = useState<boolean>(false);

  const playSynthesizedChime = () => {
    if (!audioFeedbackEnabled || typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      // AudioContext unavailable
    }
  };

  return (
    <div className={`space-y-6 ${atmosphere === 'ALERT' ? 'ring-1 ring-red-500/30 rounded-2xl' : ''}`}>
      {/* City Status Bar & District Navigation */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
          <div>
            <h2 className="text-sm font-semibold tracking-wide uppercase text-cyan-300 font-cyber">
              IA TOWN — VILLE CYBERPUNK OPÉRATIONNELLE
            </h2>
            <p className="text-xs text-slate-400">
              16 bâtiments interconnectés · Grille d'agents autonomes · Événements en direct
            </p>
          </div>
        </div>

        {/* Dynamic event ticker & Atmosphere */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/80 rounded-lg border border-slate-800/80 text-xs text-slate-300">
            <span className="text-amber-400 font-medium font-cyber">FLUX LOGISTIQUE :</span>
            {companyRunning ? (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Bots livreurs actifs : FACTORY.IA ⇄ MARKET.IA
              </span>
            ) : (
              <span className="text-slate-500">Activités en pause de sécurité</span>
            )}
          </div>

          {/* Atmosphere controls */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-mono-code">
            <button
              onClick={() => { setAtmosphere('NEON'); playSynthesizedChime(); }}
              className={`px-2 py-0.5 rounded transition-colors ${atmosphere === 'NEON' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Néon
            </button>
            <button
              onClick={() => { setAtmosphere('RAIN'); playSynthesizedChime(); }}
              className={`px-2 py-0.5 rounded transition-colors ${atmosphere === 'RAIN' ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Pluie
            </button>
            <button
              onClick={() => { setAtmosphere('ALERT'); playSynthesizedChime(); }}
              className={`px-2 py-0.5 rounded transition-colors ${atmosphere === 'ALERT' ? 'bg-red-950 text-red-300 border border-red-800' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Alerte
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setFilterCategory('ALL')}
            className={`px-3 py-1 rounded transition-colors ${filterCategory === 'ALL' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Tous (16)
          </button>
          <button
            onClick={() => setFilterCategory('INFRASTRUCTURE')}
            className={`px-3 py-1 rounded transition-colors ${filterCategory === 'INFRASTRUCTURE' ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Infrastructures (11)
          </button>
          <button
            onClick={() => setFilterCategory('V3_EXTENSIONS')}
            className={`px-3 py-1 rounded transition-colors ${filterCategory === 'V3_EXTENSIONS' ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Extensions V3.0 (4)
          </button>
          <button
            onClick={() => setFilterCategory('CCC')}
            className={`px-3 py-1 rounded transition-colors ${filterCategory === 'CCC' ? 'bg-teal-950 text-teal-300 border border-teal-800' : 'text-slate-400 hover:text-slate-200'}`}
          >
            CCC Hub (1)
          </button>
        </div>
      </div>

      {/* Cyberpunk Animated Delivery & Mining Corridor */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 px-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono-code overflow-hidden relative">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="font-bold">FACTORY.IA</span>
          </div>
          
          {/* Animated moving bot conveyor */}
          <div className="hidden sm:flex items-center gap-2 text-slate-500">
            <span className="h-0.5 w-12 bg-gradient-to-r from-amber-500 to-emerald-500" />
            <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-cyan-300 animate-pulse">
              🤖 Bot-Courrier #04 [Colis DockerScan CLI] ➔
            </span>
            <span className="h-0.5 w-12 bg-gradient-to-r from-cyan-500 to-emerald-500" />
          </div>

          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold">MARKET.IA</span>
          </div>
        </div>

        {/* CentMine cluster live status */}
        <div className="flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1.5 text-yellow-400">
            <Zap className="w-3.5 h-3.5" />
            <span>CENTMINE : {miningRunning ? 'Cluster 840 GH/s Actif' : 'En veille'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>CCC HUB : Hologramme Actif</span>
          </div>
        </div>
      </div>

      {/* Cyberpunk Grid Map */}
      <div className={`relative bg-slate-950 border border-slate-800 rounded-2xl p-6 overflow-hidden cyber-grid min-h-[580px] shadow-2xl ${
        atmosphere === 'RAIN' ? 'scanlines' : ''
      }`}>
        {/* Ambient neon radial glows */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Active Animated Traffic Lines */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Animated data transport particle beam */}
          <div className="absolute top-1/3 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent animate-pulse" />
          <div className="absolute top-2/3 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500/40 to-transparent animate-pulse" />
        </div>

        {/* Buildings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 relative z-10">
          {filteredBuildings.map((building) => {
            const isSelected = selectedBuildingId === building.id;
            const isCCCHub = building.id === 'CCC_CONNECT_HUB';

            return (
              <div
                key={building.id}
                onClick={() => onSelectBuilding(building.id)}
                className={`group cursor-pointer rounded-xl p-4 transition-all duration-200 relative overflow-hidden border ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-400 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400'
                    : isCCCHub
                    ? 'bg-slate-900/90 border-cyan-500/50 hover:border-cyan-400 hover:bg-slate-900'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                }`}
              >
                {/* Top building badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 group-hover:border-slate-700">
                      {getBuildingIcon(building.id)}
                    </div>
                    <div>
                      <span className="text-[10px] tracking-wider text-slate-500 font-mono-code">
                        {building.codename}
                      </span>
                      <h3 className="text-sm font-semibold text-slate-100 group-hover:text-cyan-300 font-cyber flex items-center gap-1.5">
                        {building.name}
                        {isCCCHub && (
                          <span className="text-[10px] font-mono-code text-cyan-400 font-normal">
                            NEW
                          </span>
                        )}
                      </h3>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono-code ${
                    building.status === 'OPTIMAL' ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/60' :
                    building.status === 'HIGH_LOAD' ? 'text-amber-400 bg-amber-950/60 border border-amber-800/60' :
                    building.status === 'ACTIVE' ? 'text-cyan-400 bg-cyan-950/60 border border-cyan-800/60' :
                    'text-slate-400 bg-slate-800/60'
                  }`}>
                    {building.status}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 mb-3 min-h-[32px]">
                  {building.description}
                </p>

                {/* Primary & Secondary Metrics */}
                <div className="grid grid-cols-2 gap-2 p-2 bg-slate-950/70 rounded-lg border border-slate-800/80 text-xs mb-3 font-mono-code">
                  <div>
                    <span className="text-[10px] text-slate-500 block truncate">{building.primaryMetricLabel}</span>
                    <span className="font-semibold text-slate-200">{building.primaryMetricValue}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block truncate">{building.secondaryMetricLabel}</span>
                    <span className="font-semibold text-cyan-400">{building.secondaryMetricValue}</span>
                  </div>
                </div>

                {/* Footer Agent & Robots Info */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                  <div className="flex items-center gap-1.5 truncate">
                    <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{building.headAgent}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 shrink-0 font-mono-code text-[10px]">
                    <Activity className="w-3 h-3 text-cyan-400" />
                    <span>{building.assignedRobotsCount} bots</span>
                  </div>
                </div>

                {isCCCHub && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenHubCutaway();
                    }}
                    className="w-full mt-3 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-600/50 hover:border-cyan-400 text-cyan-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all"
                  >
                    <span>Explorer la coupe 5 étages</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Building Detail Drawer / Modal */}
      {selectedBuilding && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                {getBuildingIcon(selectedBuilding.id)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-100 font-cyber">
                    {selectedBuilding.name}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono-code">
                    {selectedBuilding.codename}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {selectedBuilding.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundEngine.playStepTone();
                  if (onInspectBuilding) onInspectBuilding(selectedBuilding);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 border border-slate-700 rounded-lg text-xs font-mono-code font-bold flex items-center gap-1.5 transition-colors"
                title="Ouvrir panneau de contrôle et télémétrie approfondie"
              >
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Inspecter & Contrôler</span>
              </button>

              {selectedBuilding.id === 'CCC_CONNECT_HUB' ? (
                <button
                  onClick={onOpenHubCutaway}
                  className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Network className="w-4 h-4" />
                  <span>Coupe CCC HUB</span>
                </button>
              ) : (
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-800/80 px-3 py-1.5 rounded-lg">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Conforme</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Agent Responsable</span>
              <span className="text-sm font-semibold text-slate-200 font-cyber">{selectedBuilding.headAgent}</span>
              <p className="text-[11px] text-slate-500 mt-1">Supervise les processus autonomes de ce secteur</p>
            </div>
            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Automatisation & Bots</span>
              <span className="text-sm font-semibold text-cyan-400 font-mono-code">{selectedBuilding.assignedRobotsCount} Unités Robotiques</span>
              <p className="text-[11px] text-slate-500 mt-1">Maintenance, fabrication et transmission</p>
            </div>
            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Règles de conformité</span>
              <span className="text-sm font-semibold text-emerald-400">Audit Zéro-Spam MINE GUARD</span>
              <p className="text-[11px] text-slate-500 mt-1">Aucune opération non autorisée engagée</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
