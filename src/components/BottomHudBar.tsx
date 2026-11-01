/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IA TOWN — Bottom HUD Bar (Image 2 & 4)
 * System telemetry dials, financial chart synthesis, activity bars, agent donut, missions & alerts
 */

import React, { useState } from 'react';
import { soundEngine } from '../utils/soundEngine';
import { 
  TrendingUp, 
  Activity, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Layers, 
  AlertTriangle, 
  ChevronRight, 
  ChevronUp, 
  ChevronDown,
  Bot,
  ClipboardList,
  Coins,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';

interface Props {
  onOpenAgents: () => void;
  onOpenPortfolio: () => void;
  onOpenAlerts?: () => void;
  onOpenRoadmap?: () => void;
}

export const BottomHudBar: React.FC<Props> = ({
  onOpenAgents,
  onOpenPortfolio,
  onOpenAlerts,
  onOpenRoadmap,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'FINANCE' | 'ACTIVITIES' | 'AGENTS' | 'MISSIONS' | 'ALERTES'>('FINANCE');

  return (
    <div className="w-full flex flex-col bg-[#111522] border-t border-[#1B1F2A] shrink-0 z-30 select-none">
      {/* Collapsible toggle bar */}
      <div className="flex items-center justify-between px-4 py-1 bg-[#0A0F1E] border-b border-[#1B1F2A] text-xs font-orbitron">
        <div className="flex items-center gap-3">
          <span className="text-cyan-400 font-bold flex items-center gap-1.5 text-[11px]">
            <Activity className="w-3.5 h-3.5" />
            TABLEAU DE BORD TÉLÉMÉTRIE TEMPS RÉEL
          </span>
          <span className="text-[10px] text-slate-500 hidden sm:inline font-mono-code">
            REVENUE.ENGINE V3.0 • BANK.IA • COST.GUARD
          </span>
        </div>

        <button
          onClick={() => {
            setIsExpanded(!isExpanded);
            soundEngine.playClick();
          }}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300 font-orbitron transition-colors"
        >
          <span>{isExpanded ? 'Réduire' : 'Déplier Télémétrie'}</span>
          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-6 gap-3 overflow-x-auto">
          {/* 1. ÉTAT DES SYSTÈMES (Radial circular gauges - Image 4) */}
          <div className="panel-town-standard rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-wider block mb-2">
              ÉTAT DES SYSTÈMES
            </span>
            <div className="grid grid-cols-4 gap-1 text-center">
              {/* CPU */}
              <div className="flex flex-col items-center">
                <div className="relative w-9 h-9 flex items-center justify-center">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#1B1F2A" strokeWidth="3" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#00EDFF" strokeWidth="3" strokeDasharray="88" strokeDashoffset="63" strokeLinecap="round" />
                  </svg>
                  <span className="absolute text-[8.5px] font-orbitron font-bold text-cyan-300">28%</span>
                </div>
                <span className="text-[8.5px] font-mono-code text-slate-400 mt-1">CPU</span>
              </div>

              {/* RAM */}
              <div className="flex flex-col items-center">
                <div className="relative w-9 h-9 flex items-center justify-center">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#1B1F2A" strokeWidth="3" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#8A2BFF" strokeWidth="3" strokeDasharray="88" strokeDashoffset="47" strokeLinecap="round" />
                  </svg>
                  <span className="absolute text-[8.5px] font-orbitron font-bold text-purple-300">46%</span>
                </div>
                <span className="text-[8.5px] font-mono-code text-slate-400 mt-1">RAM</span>
              </div>

              {/* RÉSEAU */}
              <div className="flex flex-col items-center">
                <div className="relative w-9 h-9 flex items-center justify-center">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#1B1F2A" strokeWidth="3" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#21EC71" strokeWidth="3" strokeDasharray="88" strokeDashoffset="77" strokeLinecap="round" />
                  </svg>
                  <span className="absolute text-[8.5px] font-orbitron font-bold text-emerald-300">12%</span>
                </div>
                <span className="text-[8.5px] font-mono-code text-slate-400 mt-1">RÉSEAU</span>
              </div>

              {/* STOCKAGE */}
              <div className="flex flex-col items-center">
                <div className="relative w-9 h-9 flex items-center justify-center">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#1B1F2A" strokeWidth="3" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#FFB800" strokeWidth="3" strokeDasharray="88" strokeDashoffset="51" strokeLinecap="round" />
                  </svg>
                  <span className="absolute text-[8.5px] font-orbitron font-bold text-amber-300">42%</span>
                </div>
                <span className="text-[8.5px] font-mono-code text-slate-400 mt-1">STOCKAGE</span>
              </div>
            </div>
          </div>

          {/* 2. SYNTHÈSE FINANCIÈRE (Area Curve + Net Result - Image 2) */}
          <div className="panel-town-standard rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-wider">
                SYNTHÈSE FINANCIÈRE
              </span>
              <span className="text-[10px] font-mono-code text-emerald-400">+18.4% ce mois</span>
            </div>

            {/* Mini Area Chart SVG */}
            <div className="h-10 w-full mb-1">
              <svg viewBox="0 0 200 40" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="finGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00EDFF" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#00EDFF" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <polygon points="0,38 25,32 50,34 75,22 100,28 125,18 150,14 175,9 200,4 200,40 0,40" fill="url(#finGrad)" />
                <polyline points="0,38 25,32 50,34 75,22 100,28 125,18 150,14 175,9 200,4" fill="none" stroke="#00EDFF" strokeWidth="2" />
                <circle cx="200" cy="4" r="3" fill="#00EDFF" />
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-1 text-[10px] font-mono-code">
              <div>
                <span className="text-slate-500 block">Encaissé</span>
                <span className="text-emerald-400 font-orbitron font-bold">2 846,50 €</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Résultat net</span>
                <span className="text-[#21EC71] font-orbitron font-bold">2 521,75 €</span>
              </div>
            </div>
          </div>

          {/* 3. ACTIVITÉS PRINCIPALES (Progress Bars - Image 2) */}
          <div className="panel-town-standard rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-wider">
                ACTIVITÉS PRINCIPALES
              </span>
              <button 
                onClick={onOpenPortfolio}
                className="btn-town-ghost-primary text-[9.5px] px-2 py-0.5"
              >
                Portefeuille
              </button>
            </div>

            <div className="space-y-1.5 text-[9.5px] font-inter">
              {[
                { name: 'Produits numériques', amount: '1 245,30 €', pct: 85, color: '#00EDFF' },
                { name: 'Abonnements SaaS', amount: '682,40 €', pct: 60, color: '#8A2BFF' },
                { name: 'Affiliation vérifiée', amount: '356,20 €', pct: 45, color: '#FFB800' },
                { name: 'Prestations & Micro', amount: '462,60 €', pct: 35, color: '#21EC71' },
              ].map((act) => (
                <div key={act.name} className="flex flex-col">
                  <div className="flex items-center justify-between font-mono-code text-slate-300">
                    <span className="truncate">{act.name}</span>
                    <span className="text-white font-semibold">{act.amount}</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${act.pct}%`, backgroundColor: act.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. AGENTS GAUGE DONUT (128 / 128 - Image 2) */}
          <div className="panel-town-standard rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-wider block mb-1">
              AGENTS
            </span>

            <div className="flex items-center gap-3">
              {/* Donut Gauge */}
              <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#1B1F2A" strokeWidth="4" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#21EC71" strokeWidth="4" strokeDasharray="88" strokeDashoffset="22" strokeLinecap="round" />
                </svg>
                <div className="absolute text-center leading-none">
                  <span className="font-orbitron font-bold text-xs text-white block">128</span>
                  <span className="text-[7px] text-slate-500 font-mono-code">/128</span>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-0.5 text-[9px] font-mono-code flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400">En activité</span>
                  <span className="font-bold text-white">96</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-amber-400">En pause</span>
                  <span className="font-bold text-white">18</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-400">Maintenance</span>
                  <span className="font-bold text-white">6</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Hors ligne</span>
                  <span className="font-bold text-white">8</span>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenAgents}
              className="btn-town-ghost-secondary w-full py-1 mt-1 text-center font-orbitron text-[10px]"
            >
              Voir tous les agents
            </button>
          </div>

          {/* 5. MISSIONS EN COURS (Image 2) */}
          <div className="panel-town-standard rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-wider block mb-1">
              MISSIONS
            </span>

            <div className="space-y-1 text-[9.5px] font-mono-code">
              <div className="flex items-center justify-between p-1 rounded bg-slate-900/60">
                <span className="text-cyan-400">En cours</span>
                <span className="font-orbitron font-bold text-white">27</span>
              </div>
              <div className="flex items-center justify-between p-1 rounded bg-slate-900/60">
                <span className="text-amber-400">En attente</span>
                <span className="font-orbitron font-bold text-white">15</span>
              </div>
              <div className="flex items-center justify-between p-1 rounded bg-slate-900/60">
                <span className="text-emerald-400">Réussies (24h)</span>
                <span className="font-orbitron font-bold text-white">124</span>
              </div>
              <div className="flex items-center justify-between p-1 rounded bg-slate-900/60">
                <span className="text-red-400">Échouées</span>
                <span className="font-orbitron font-bold text-white">8</span>
              </div>
            </div>

            <button
              onClick={onOpenRoadmap}
              className="btn-town-ghost-primary w-full py-1 mt-1 text-center font-orbitron text-[10px]"
            >
              Centre de missions
            </button>
          </div>

          {/* 6. ALERTES EN COURS (Image 2) */}
          <div className="panel-town-standard rounded-xl p-3 flex flex-col justify-between hidden xl:flex">
            <span className="text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-wider block mb-1">
              ALERTES SYSTÈME
            </span>

            <div className="space-y-1 text-[9.5px] font-mono-code">
              <div className="flex items-center gap-1.5 text-red-400 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                <span className="truncate">3 opportunités à valider</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-400 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="truncate">1 mise à jour de plugin</span>
              </div>
              <div className="flex items-center gap-1.5 text-cyan-400 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span className="truncate">Stockage à 42% nominal</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                <span className="truncate">1 site en optimisation</span>
              </div>
            </div>

            <button
              onClick={onOpenAlerts}
              className="btn-town-ghost-secondary w-full py-1 mt-1 text-center font-orbitron text-[10px]"
            >
              Voir les alertes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
