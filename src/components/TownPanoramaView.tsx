/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IA TOWN — VUE VILLE (Panoramic City View - Image 2 & 3)
 * High-definition neon cyberpunk skyline with 16 clickable buildings and subterranean mine
 */

import React, { useState } from 'react';
import { BuildingInfo, BuildingType } from '../types/town';
import { soundEngine } from '../utils/soundEngine';
import { 
  Building2, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Cpu, 
  Compass, 
  Flame, 
  ShoppingBag, 
  Wrench, 
  Radio, 
  Tv, 
  Server, 
  Boxes, 
  Scale, 
  Repeat, 
  FlaskConical, 
  Network,
  ChevronRight,
  Maximize2,
  Eye,
  Search,
  SlidersHorizontal
} from 'lucide-react';

interface Props {
  buildings: BuildingInfo[];
  selectedBuildingId: BuildingType | null;
  onSelectBuilding: (id: BuildingType) => void;
  onOpenCutaway: (id?: BuildingType) => void;
  onOpenShelter: () => void;
  onInspectBuilding: (building: BuildingInfo) => void;
}

interface BuildingHotspot {
  id: BuildingType;
  label: string;
  sub: string;
  tagColor: string;
  glowClass: string;
  leftPercent: number;
  topPercent: number;
  widthPercent: number;
  heightPercent: number;
}

const HOTSPOTS: BuildingHotspot[] = [
  { id: 'MEDIA_IA', label: 'MEDIA.IA', sub: 'Contenus • Vidéos • Édition', tagColor: '#E74C3C', glowClass: 'glow-red', leftPercent: 12.5, topPercent: 27, widthPercent: 6, heightPercent: 14 },
  { id: 'WEB_ESTATE_IA', label: 'WEB.ESTATE.IA', sub: 'Sites • SEO • Monétisation', tagColor: '#00EDFF', glowClass: 'glow-cyan', leftPercent: 19.5, topPercent: 28, widthPercent: 7.5, heightPercent: 14 },
  { id: 'MARKET_IA', label: 'MARKET.IA', sub: 'Boutiques • Ventes • Livraison', tagColor: '#FF007F', glowClass: 'glow-purple', leftPercent: 28.5, topPercent: 28, widthPercent: 7, heightPercent: 14 },
  { id: 'AI_GENCY', label: 'AI.GENCY', sub: 'Direction • Marketing • Commercial', tagColor: '#3498DB', glowClass: 'glow-cyan', leftPercent: 38, topPercent: 24, widthPercent: 7.5, heightPercent: 16 },
  { id: 'ARE_IA_CENTER', label: 'ARE.IA.CENTER', sub: 'Supervision • IA • Ressources', tagColor: '#00EDFF', glowClass: 'glow-cyan', leftPercent: 47, topPercent: 21, widthPercent: 8.5, heightPercent: 20 },
  { id: 'RD_IA', label: 'R&D.IA', sub: 'Recherche • Tests • Innovation', tagColor: '#21EC71', glowClass: 'glow-green', leftPercent: 57, topPercent: 28, widthPercent: 6.5, heightPercent: 14 },
  { id: 'CONTRACT_IA', label: 'CONTRACT.IA', sub: 'Missions • Prestations • Clients', tagColor: '#FFB800', glowClass: 'glow-gold', leftPercent: 64.5, topPercent: 28, widthPercent: 6.5, heightPercent: 14 },
  { id: 'SUBSCRIPTION_IA', label: 'SUBSCRIPTION.IA', sub: 'Services • SaaS • Revenus récurrents', tagColor: '#8A2BFF', glowClass: 'glow-purple', leftPercent: 72, topPercent: 28, widthPercent: 7, heightPercent: 14 },
  { id: 'PLUGIN_STORE_IA', label: 'PLUGIN.STORE.IA', sub: 'Extensions • Widgets • Modules', tagColor: '#00EDFF', glowClass: 'glow-cyan', leftPercent: 80, topPercent: 28, widthPercent: 6.5, heightPercent: 14 },
  { id: 'TRAFFIC_IA', label: 'TRAFFIC.IA', sub: 'Acquisition • SEO • Publicité', tagColor: '#FF8A3D', glowClass: 'glow-gold', leftPercent: 88, topPercent: 27, widthPercent: 6, heightPercent: 15 },
  { id: 'BANK_IA', label: 'BANK.IA', sub: 'Sécurisation • Comptes • Transactions', tagColor: '#FFB800', glowClass: 'glow-gold', leftPercent: 24, topPercent: 48, widthPercent: 13, heightPercent: 12 },
  { id: 'DUMP_INCINERATOR', label: 'DUMP & INCINERATOR', sub: 'Nettoyage • Tri • Recyclage • Sécurité', tagColor: '#21EC71', glowClass: 'glow-green', leftPercent: 66, topPercent: 48, widthPercent: 14, heightPercent: 12 },
  { id: 'CCC_CONNECT_HUB', label: 'CCC.CONNECT HUB', sub: '5 Étages • Ponts Multi-Appareils', tagColor: '#00EDFF', glowClass: 'glow-cyan', leftPercent: 46, topPercent: 45, widthPercent: 10, heightPercent: 14 },
  { id: 'FACTORY_IA', label: 'FACTORY.IA', sub: 'Développement • Logiciels • Templates', tagColor: '#FFB800', glowClass: 'glow-gold', leftPercent: 24, topPercent: 39, widthPercent: 6, heightPercent: 9 },
  { id: 'OPPORTUNITY_LAB', label: 'OPPORTUNITY.LAB', sub: 'Détection d\'opportunités • Veille IA', tagColor: '#FF8A3D', glowClass: 'glow-gold', leftPercent: 88, topPercent: 39, widthPercent: 6, heightPercent: 9 },
];

export const TownPanoramaView: React.FC<Props> = ({
  buildings,
  selectedBuildingId,
  onSelectBuilding,
  onOpenCutaway,
  onOpenShelter,
  onInspectBuilding,
}) => {
  const [hoveredHotspot, setHoveredHotspot] = useState<BuildingHotspot | null>(null);
  const [enableScanlines, setEnableScanlines] = useState<boolean>(true);
  const [searchFilter, setSearchFilter] = useState<string>('');

  const getBuildingData = (id: BuildingType) => buildings.find(b => b.id === id);

  const filteredHotspots = HOTSPOTS.filter(h => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return h.label.toLowerCase().includes(q) || h.sub.toLowerCase().includes(q);
  });

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-[#0A0F1E] select-none">
      {/* City Panorama Canvas / Background Container */}
      <div className="relative flex-1 w-full overflow-hidden">
        {/* Background Skyline Image Layer */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{ backgroundImage: `url('/skins/skyline_panorama.png')` }}
        />

        {/* Ambient Atmosphere Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-transparent to-transparent opacity-80 pointer-events-none" />
        {enableScanlines && (
          <>
            <div className="absolute inset-0 cyber-grid opacity-25 pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40" />
          </>
        )}

        {/* Animated Flying Speeder Drone (Left to Right) */}
        <div className="absolute top-12 left-0 w-8 h-2 bg-cyan-400 rounded-full blur-[1px] opacity-75 animate-[pulse_2s_infinite] shadow-[0_0_12px_#00EDFF] pointer-events-none transform -rotate-3" />

        {/* Top Floating Mini-Toolbar (Search & Atmosphere controls) */}
        <div className="absolute top-3 right-4 z-20 flex items-center gap-2">
          {/* Quick Search Building */}
          <div className="flex items-center gap-1.5 bg-[#0A0F1E]/90 border border-slate-700/80 px-2.5 py-1 rounded-xl backdrop-blur-md shadow-lg">
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Rechercher bâtiment..."
              className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-32 sm:w-44 font-mono-code"
            />
            {searchFilter && (
              <button 
                onClick={() => setSearchFilter('')}
                className="text-[10px] text-slate-400 hover:text-white px-1 font-mono-code"
              >
                ✕
              </button>
            )}
          </div>

          {/* Atmospheric Hologram Scanlines Toggle */}
          <button
            onClick={() => {
              setEnableScanlines(prev => !prev);
              soundEngine.playClick();
            }}
            title="Activer / Désactiver la grille holographique et scanlines"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-orbitron border backdrop-blur-md transition-all ${
              enableScanlines
                ? 'bg-cyan-500/15 border-cyan-400/50 text-cyan-300 shadow-[0_0_10px_rgba(0,237,255,0.2)]'
                : 'bg-[#0A0F1E]/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Holo-Grid</span>
          </button>
        </div>

        {/* Interactive Building Hotspot Badges on Buildings */}
        {filteredHotspots.map((hotspot) => {
          const building = getBuildingData(hotspot.id);
          const isSelected = selectedBuildingId === hotspot.id;
          const isHovered = hoveredHotspot?.id === hotspot.id;

          return (
            <div
              key={hotspot.id}
              className={`absolute cursor-pointer transition-all duration-300 z-10 group ${
                isSelected ? 'scale-105 z-20' : 'hover:scale-105'
              }`}
              style={{
                left: `${hotspot.leftPercent}%`,
                top: `${hotspot.topPercent}%`,
              }}
              onMouseEnter={() => {
                setHoveredHotspot(hotspot);
                soundEngine.playTick();
              }}
              onMouseLeave={() => setHoveredHotspot(null)}
              onClick={() => {
                onSelectBuilding(hotspot.id);
                soundEngine.playSuccess();
                if (building) onInspectBuilding(building);
              }}
            >
              {/* Neon Glow Label Box matching Image 2 & 3 */}
              <div
                className={`flex flex-col items-center px-2.5 py-1 rounded-md backdrop-blur-md transition-all duration-300 shadow-lg ${
                  isSelected
                    ? 'bg-[#111522]/95 border-2 border-[#00EDFF] glow-cyan'
                    : isHovered
                    ? 'bg-[#111522]/90 border border-white/60 glow-cyan-sm'
                    : 'bg-[#111522]/80 border border-white/20'
                }`}
                style={{
                  boxShadow: isSelected || isHovered ? `0 0 15px ${hotspot.tagColor}80` : undefined,
                  borderColor: isSelected ? '#00EDFF' : isHovered ? hotspot.tagColor : undefined,
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full animate-ping"
                    style={{ backgroundColor: hotspot.tagColor }}
                  />
                  <span className="font-orbitron font-bold text-[11px] tracking-wider text-white">
                    {hotspot.label}
                  </span>
                </div>
                <span className="text-[9px] font-inter text-slate-300 whitespace-nowrap hidden sm:inline">
                  {hotspot.sub}
                </span>

                {/* Agent Count Badge */}
                {building && (
                  <div className="mt-0.5 flex items-center gap-1 text-[8.5px] font-mono-code text-cyan-300">
                    <span>{building.assignedRobotsCount} robots</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-emerald-400">{building.primaryMetricValue}</span>
                  </div>
                )}
              </div>

              {/* Quick Cutaway Button */}
              {isHovered && (
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[#0A0F1E]/95 border border-cyan-400 px-2 py-0.5 rounded shadow-xl whitespace-nowrap z-30">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenCutaway(hotspot.id);
                    }}
                    className="btn-town-ghost-primary text-[10px] py-0.5 px-2 flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3 text-cyan-400" />
                    Coupe Étages
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Subterranean CENTMINE Gallery Strip at bottom of skyline view (as in Image 2) */}
        <div 
          onClick={onOpenShelter}
          className="absolute bottom-2.5 left-4 right-4 panel-town-interactive p-3 backdrop-blur-md cursor-pointer border border-amber-500/40 hover:border-amber-400 group z-20 shadow-[0_0_20px_rgba(255,184,0,0.2)]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/50 shadow-[0_0_12px_rgba(255,184,0,0.3)]">
                <Zap className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-orbitron font-extrabold text-sm tracking-wider text-amber-400">
                    AI.DEPTH.CENTMINE
                  </span>
                  <span className="badge-town-gold">
                    Sous-sol Minier & Microrevenus
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 font-inter mt-0.5">
                  12 Salles minières actives • Gisement de micro-revenus • Salle des coffres sécurisée
                </div>
              </div>
            </div>

            {/* Gallery Room Tags */}
            <div className="hidden lg:flex items-center gap-1.5 text-[10px] font-mono-code">
              {['OVERMINE', 'PROSPECTOR', 'GOLD ANALYST', 'MINE GUARD', 'TASK MINER', 'AD MINER', 'AFFILIATE MINER', 'DIGITAL MINER'].map((room) => (
                <span
                  key={room}
                  className="px-2 py-0.5 rounded bg-black/50 border border-slate-700/80 text-slate-300 group-hover:border-amber-500/50 transition-colors"
                >
                  {room}
                </span>
              ))}
            </div>

            <button className="btn-town-gold text-xs flex items-center gap-1.5">
              <span>EXPLORER LE SHELTER</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
