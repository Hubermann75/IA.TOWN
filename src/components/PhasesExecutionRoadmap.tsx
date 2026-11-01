/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IA TOWN V3.0 — 12 Development Phases Execution Roadmap
 * Section 13 : DÉVELOPPEMENT PAR PRIORITÉS
 */

import React, { useState } from 'react';
import { DEVELOPMENT_PHASES, DevelopmentPhase, getDevelopmentProgress } from '../logic/phasesManager';
import { 
  CheckCircle2, 
  Clock, 
  Layers, 
  ShieldCheck, 
  ArrowRight, 
  ChevronRight, 
  FileText, 
  Terminal,
  Activity,
  Cpu
} from 'lucide-react';

export const PhasesExecutionRoadmap: React.FC = () => {
  const [phases, setPhases] = useState<DevelopmentPhase[]>(DEVELOPMENT_PHASES);
  const [selectedPhaseNum, setSelectedPhaseNum] = useState<number>(1);
  const [filterMode, setFilterMode] = useState<'ALL' | 'VALIDATED' | 'IN_PROGRESS'>('ALL');

  const progress = getDevelopmentProgress(phases);
  const activePhase = phases.find(p => p.phaseNumber === selectedPhaseNum) || phases[0];

  const filteredPhases = phases.filter(p => {
    if (filterMode === 'VALIDATED') return p.status === 'VALIDATED';
    if (filterMode === 'IN_PROGRESS') return p.status === 'IN_PROGRESS';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              SECTION 13 : ROADMAP DE DÉVELOPPEMENT OFFICIELLE
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-emerald-400 font-mono-code flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              11/12 Phases Validées ({progress.percentage}%)
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 font-cyber">
            DÉVELOPPEMENT PAR PRIORITÉS (PHASES 1 À 12)
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Suivi rigoureux et traçabilité de chaque jalon d'ingénierie d'IA TOWN : de l'audit initial à la rentabilité éprouvée et la synchronisation multi-appareils CCC.
          </p>
        </div>

        {/* Global Progress Bar */}
        <div className="flex flex-col items-end gap-1.5 font-mono-code text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Avancement Global :</span>
            <span className="text-cyan-400 font-bold text-sm">{progress.percentage}%</span>
          </div>
          <div className="w-48 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-500"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Two Column Layout: Phases Stepper List Left / Detailed Phase Audit Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 12 Phases Stepper (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wide font-cyber">
                JALONS D'INGÉNIERIE SÉQUENTIELS
              </h2>
            </div>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-mono-code">
              <button
                onClick={() => setFilterMode('ALL')}
                className={`px-2 py-0.5 rounded transition-colors ${filterMode === 'ALL' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-500'}`}
              >
                Tous (12)
              </button>
              <button
                onClick={() => setFilterMode('VALIDATED')}
                className={`px-2 py-0.5 rounded transition-colors ${filterMode === 'VALIDATED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'text-slate-500'}`}
              >
                Validés (11)
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {filteredPhases.map(phase => {
              const isSelected = selectedPhaseNum === phase.phaseNumber;

              return (
                <div
                  key={phase.id}
                  onClick={() => setSelectedPhaseNum(phase.phaseNumber)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer font-mono-code text-xs ${
                    isSelected
                      ? 'bg-slate-950 border-cyan-400 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/40'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] ${
                        phase.status === 'VALIDATED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-cyan-950 text-cyan-400 border border-cyan-800 animate-pulse'
                      }`}>
                        {phase.phaseNumber}
                      </span>
                      <div>
                        <h3 className="text-xs font-semibold text-slate-200 font-cyber">
                          {phase.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {phase.description}
                        </p>
                      </div>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded shrink-0 ${
                      phase.status === 'VALIDATED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {phase.status === 'VALIDATED' ? 'VALIDÉ' : 'EN COURS'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Phase Audit Evidence Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] text-cyan-400 font-mono-code uppercase block">
                  DÉTAILS D'AUDIT JALON
                </span>
                <h3 className="text-sm font-bold text-slate-100 font-cyber">
                  {activePhase.name}
                </h3>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono-code ${
                activePhase.status === 'VALIDATED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}>
                {activePhase.status}
              </span>
            </div>

            <div className="space-y-3 font-mono-code text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase block">Objectif Spécifié</span>
                <p className="text-slate-300 leading-relaxed">{activePhase.description}</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase block">Agents Dépositaires</span>
                <div className="flex flex-wrap gap-1.5">
                  {activePhase.responsibleAgents.map((ag, i) => (
                    <span key={i} className="px-2 py-0.5 rounded text-[11px] bg-slate-900 text-cyan-300 border border-slate-700">
                      {ag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase block">Livrables Conformes</span>
                <div className="space-y-1">
                  {activePhase.deliverables.map((deliv, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-300 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{deliv}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-700/60 text-emerald-300 text-[11px] space-y-1">
                <span className="font-bold flex items-center gap-1 font-cyber">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  PREUVE D'AUDIT TECHNIQUE
                </span>
                <p className="text-slate-300 leading-relaxed">{activePhase.auditEvidence}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
