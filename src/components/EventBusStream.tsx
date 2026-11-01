/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IA TOWN — Bus d'Événements Structurés des Agents IA
 * Communication par événements structurés avec traçabilité et horodatage
 */

import React, { useState } from 'react';
import { StructuredAgentEvent } from '../types/town';
import { Terminal, Filter, CheckCircle2, AlertTriangle, AlertCircle, Radio, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  events: StructuredAgentEvent[];
  onClearEvents?: () => void;
}

export const EventBusStream: React.FC<Props> = ({ events, onClearEvents }) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const filteredEvents = events.filter(e => {
    if (filterType === 'ALL') return true;
    return e.eventType === filterType;
  });

  const toggleExpand = (id: string) => {
    setExpandedEventId(prev => (prev === id ? null : id));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-cyber">
              BUS DE MESSAGERIE D'ÉVÉNEMENTS STRUCTURÉS (INTER-AGENTS)
            </h2>
            <p className="text-xs text-slate-400">
              Traçabilité formelle des échanges entre les 28 agents d'IA TOWN et les passerelles CCC.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 font-mono-code focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">Tous les types d'événements ({events.length})</option>
            <option value="COMMAND_DISPATCHED">Commandes Distantes</option>
            <option value="BANK_SETTLED">Règlements Bancaires</option>
            <option value="PRODUCT_SYNTHESIZED">Synthèse de Produits</option>
            <option value="QA_AUDITED">Audits Qualité</option>
            <option value="ORDER_PLACED">Commandes Clients</option>
            <option value="SYNC_DELTA">Synchronisation CCC</option>
          </select>
        </div>
      </div>

      {/* Stream list */}
      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
        {filteredEvents.length === 0 ? (
          <div className="text-xs text-slate-500 italic p-6 bg-slate-950 rounded-xl text-center font-mono-code">
            Aucun événement structuré enregistré pour ce filtre.
          </div>
        ) : (
          filteredEvents.map(evt => {
            const isExpanded = expandedEventId === evt.id;

            return (
              <div
                key={evt.id}
                onClick={() => toggleExpand(evt.id)}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all font-mono-code text-xs cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="font-bold text-cyan-300">{evt.eventType}</span>
                    <span className="text-slate-500 text-[11px]">
                      Émis par <span className="text-slate-300 font-semibold">{evt.emitterAgent}</span> → {evt.targetBuilding}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">
                      {new Date(evt.timestamp).toLocaleTimeString('fr-FR')}
                    </span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] space-y-1">
                    <span className="text-slate-500 block">Payload JSON structuré :</span>
                    <pre className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300 overflow-x-auto">
                      {JSON.stringify(evt.payload, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
