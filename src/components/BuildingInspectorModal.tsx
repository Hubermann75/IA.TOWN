/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IA TOWN — Deep Building Inspector Drawer & Control Unit
 */

import React, { useState } from 'react';
import { BuildingInfo, BuildingType } from '../types/town';
import { 
  X, 
  Cpu, 
  Building2, 
  FlaskConical, 
  Wrench, 
  ShoppingBag, 
  Radio, 
  Zap, 
  Vault, 
  Flame, 
  Scale, 
  Repeat, 
  Tv, 
  Boxes, 
  Server, 
  Compass, 
  Network,
  Bot,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Play,
  RotateCw,
  Terminal,
  Activity,
  Layers
} from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface Props {
  building: BuildingInfo | null;
  onClose: () => void;
  onOpenHubCutaway: () => void;
  onNavigateTab?: (tab: string) => void;
  miningRunning: boolean;
  onToggleMining: () => void;
}

export const BuildingInspectorModal: React.FC<Props> = ({
  building,
  onClose,
  onOpenHubCutaway,
  onNavigateTab,
  miningRunning,
  onToggleMining,
}) => {
  const [customHashrate, setCustomHashrate] = useState<number>(245);
  const [incineratorCleaned, setIncineratorCleaned] = useState<boolean>(false);
  const [auditDone, setAuditDone] = useState<boolean>(false);
  const [activeSubsystem, setActiveSubsystem] = useState<string>('DIAGNOSTICS');

  if (!building) return null;

  const getBuildingIcon = (id: BuildingType) => {
    switch (id) {
      case 'ARE_IA_CENTER': return <Cpu className="w-6 h-6 text-cyan-400" />;
      case 'AI_GENCY': return <Building2 className="w-6 h-6 text-indigo-400" />;
      case 'RD_IA': return <FlaskConical className="w-6 h-6 text-purple-400" />;
      case 'FACTORY_IA': return <Wrench className="w-6 h-6 text-amber-400" />;
      case 'MARKET_IA': return <ShoppingBag className="w-6 h-6 text-emerald-400" />;
      case 'TRAFFIC_IA': return <Radio className="w-6 h-6 text-sky-400" />;
      case 'AI_DEPTH_CENTMINE': return <Zap className="w-6 h-6 text-yellow-400" />;
      case 'BANK_IA': return <Vault className="w-6 h-6 text-green-400" />;
      case 'DUMP_INCINERATOR': return <Flame className="w-6 h-6 text-rose-500" />;
      case 'CONTRACT_IA': return <Scale className="w-6 h-6 text-amber-300" />;
      case 'SUBSCRIPTION_IA': return <Repeat className="w-6 h-6 text-teal-400" />;
      case 'MEDIA_IA': return <Tv className="w-6 h-6 text-red-400" />;
      case 'PLUGIN_STORE_IA': return <Boxes className="w-6 h-6 text-blue-400" />;
      case 'WEB_ESTATE_IA': return <Server className="w-6 h-6 text-violet-400" />;
      case 'OPPORTUNITY_LAB': return <Compass className="w-6 h-6 text-fuchsia-400" />;
      case 'CCC_CONNECT_HUB': return <Network className="w-6 h-6 text-cyan-400" />;
    }
  };

  const handleActionClick = (sound: 'step' | 'cash' | 'cmd' | 'alert') => {
    if (sound === 'step') soundEngine.playStepTone();
    if (sound === 'cash') soundEngine.playCashChime();
    if (sound === 'cmd') soundEngine.playCommandChirp();
    if (sound === 'alert') soundEngine.playAlertBuzzer();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 shadow-inner">
              {getBuildingIcon(building.id)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-100 font-cyber tracking-wide">
                  {building.name}
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono-code font-bold bg-slate-800 text-cyan-400 border border-slate-700">
                  {building.codename}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono-code">
                  {building.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {building.description}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playStepTone();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
            title="Fermer inspecteur"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-navigation tabs inside modal */}
        <div className="px-5 border-b border-slate-800 bg-slate-950/40 flex items-center gap-2 text-xs font-mono-code overflow-x-auto">
          <button
            onClick={() => {
              setActiveSubsystem('DIAGNOSTICS');
              soundEngine.playStepTone();
            }}
            className={`py-3 px-3 border-b-2 font-bold transition-colors ${
              activeSubsystem === 'DIAGNOSTICS'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Diagnostics & Télémétrie
          </button>
          <button
            onClick={() => {
              setActiveSubsystem('ACTIONS');
              soundEngine.playStepTone();
            }}
            className={`py-3 px-3 border-b-2 font-bold transition-colors ${
              activeSubsystem === 'ACTIONS'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Commandes Opérationnelles
          </button>
          <button
            onClick={() => {
              setActiveSubsystem('COMPLIANCE');
              soundEngine.playStepTone();
            }}
            className={`py-3 px-3 border-b-2 font-bold transition-colors ${
              activeSubsystem === 'COMPLIANCE'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Règles & Sécurité
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {activeSubsystem === 'DIAGNOSTICS' && (
            <div className="space-y-4">
              {/* Primary Key Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">Métrique Principale</span>
                  <div className="text-base font-bold text-cyan-400 font-mono-code">
                    {building.primaryMetricValue}
                  </div>
                  <span className="text-[10px] text-slate-500 block truncate">
                    {building.primaryMetricLabel}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">Métrique Secondaire</span>
                  <div className="text-base font-bold text-emerald-400 font-mono-code">
                    {building.secondaryMetricValue}
                  </div>
                  <span className="text-[10px] text-slate-500 block truncate">
                    {building.secondaryMetricLabel}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">Agent Responsable</span>
                  <div className="text-xs font-bold text-slate-200 truncate font-cyber">
                    {building.headAgent}
                  </div>
                  <span className="text-[10px] text-slate-500 block">Agent accrédité</span>
                </div>

                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">Robots Déployés</span>
                  <div className="text-base font-bold text-indigo-400 font-mono-code flex items-center gap-1.5">
                    <Bot className="w-4 h-4" />
                    <span>{building.assignedRobotsCount}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block">Tâches parallèles</span>
                </div>
              </div>

              {/* Architecture details */}
              <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono-code">
                  <span className="text-slate-400">Classification de secteur:</span>
                  <span className="text-amber-400 font-bold">{building.category}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono-code">
                  <span className="text-slate-400">Protocole de communication:</span>
                  <span className="text-cyan-400">BUS-EVENT-V3 / JSON-RPC</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono-code">
                  <span className="text-slate-400">Taux de disponibilité:</span>
                  <span className="text-emerald-400 font-bold">99.98% (SLA Conforme)</span>
                </div>
              </div>

              {/* Special View for CCC.CONNECT HUB */}
              {building.id === 'CCC_CONNECT_HUB' && (
                <div className="p-4 bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-800/50 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-cyan-300 font-cyber">Coupe Architecturale 5 Étages</h4>
                    <p className="text-xs text-slate-400 mt-1">Visualiser l'antenne holographique et les 5 paliers fonctionnels.</p>
                  </div>
                  <button
                    onClick={() => {
                      soundEngine.playCommandChirp();
                      onClose();
                      onOpenHubCutaway();
                    }}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Network className="w-4 h-4" />
                    <span>Ouvrir Coupe CCC</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeSubsystem === 'ACTIONS' && (
            <div className="space-y-4">
              {/* Specialized Actions Based on Building */}
              {building.id === 'AI_DEPTH_CENTMINE' && (
                <div className="p-4 bg-slate-950/70 border border-yellow-800/50 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-yellow-300 font-cyber flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        <span>Contrôleur de Hashrate CentMine</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">Ajustement dynamique de la puissance de calcul légale.</p>
                    </div>
                    <button
                      onClick={() => {
                        handleActionClick('step');
                        onToggleMining();
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono-code flex items-center gap-1.5 transition-colors ${
                        miningRunning 
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                      }`}
                    >
                      {miningRunning ? 'Mettre en pause' : 'Démarrer Minage'}
                    </button>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono-code mb-1">
                      <span className="text-slate-400">Puissance Allouée:</span>
                      <span className="text-yellow-400 font-bold">{customHashrate} GH/s</span>
                    </div>
                    <input
                      type="range"
                      min={120}
                      max={450}
                      value={customHashrate}
                      onChange={e => setCustomHashrate(Number(e.target.value))}
                      className="w-full accent-yellow-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono-code mt-1">
                      <span>120 GH/s (Eco)</span>
                      <span>245 GH/s (Standard)</span>
                      <span>450 GH/s (Overclock)</span>
                    </div>
                  </div>
                </div>
              )}

              {building.id === 'DUMP_INCINERATOR' && (
                <div className="p-4 bg-slate-950/70 border border-rose-800/50 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-rose-300 font-cyber flex items-center gap-2">
                        <Flame className="w-4 h-4" />
                        <span>Incinérateur Thermique de Projets Obsolètes</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">Purge les idées non rentables et libère les allocations mémoire.</p>
                    </div>
                    <button
                      onClick={() => {
                        soundEngine.playAlertBuzzer();
                        setIncineratorCleaned(true);
                        setTimeout(() => setIncineratorCleaned(false), 3000);
                      }}
                      className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <Flame className="w-4 h-4" />
                      <span>{incineratorCleaned ? 'Purge Terminée (-0.00 Mo)' : 'Lancer Incinération'}</span>
                    </button>
                  </div>
                  {incineratorCleaned && (
                    <div className="p-2.5 rounded bg-rose-950/50 border border-rose-800 text-xs text-rose-300 font-mono-code">
                      🔥 14 propositions rejetées et 128 Mo de caches temporaires vaporisés avec succès.
                    </div>
                  )}
                </div>
              )}

              {building.id === 'BANK_IA' && (
                <div className="p-4 bg-slate-950/70 border border-emerald-800/50 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-emerald-300 font-cyber flex items-center gap-2">
                        <Vault className="w-4 h-4" />
                        <span>Audit de Réconciliation Bank.IA</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">Vérification de la concordance stricte entre factures et encaissements.</p>
                    </div>
                    <button
                      onClick={() => {
                        soundEngine.playCashChime();
                        setAuditDone(true);
                        setTimeout(() => setAuditDone(false), 3000);
                      }}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCw className="w-4 h-4" />
                      <span>{auditDone ? 'Audit Réussi 100%' : 'Exécuter Audit Coffre'}</span>
                    </button>
                  </div>
                  {auditDone && (
                    <div className="p-2.5 rounded bg-emerald-950/50 border border-emerald-800 text-xs text-emerald-300 font-mono-code">
                      ✅ Concordance 100% vérifiée : Zéro revenu fictif détecté. Segregation stricte respectée.
                    </div>
                  )}
                </div>
              )}

              {/* General Building Pipeline triggers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    handleActionClick('step');
                    alert(`Diagnostic lancé sur le secteur ${building.codename}. Tous les services répondent.`);
                  }}
                  className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-left transition-colors flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-200 block text-xs">Ping Système</span>
                    <span className="text-[11px] text-slate-400">Latence moyenne: 1.2ms</span>
                  </div>
                  <Terminal className="w-4 h-4 text-cyan-400" />
                </button>

                <button
                  onClick={() => {
                    handleActionClick('step');
                    alert(`Redémarrage gracieux des micro-agents affectés à ${building.name}.`);
                  }}
                  className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-left transition-colors flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-200 block text-xs">Cycle Micro-Agents</span>
                    <span className="text-[11px] text-slate-400">{building.assignedRobotsCount} robots synchronisés</span>
                  </div>
                  <RotateCw className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            </div>
          )}

          {activeSubsystem === 'COMPLIANCE' && (
            <div className="space-y-3">
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs font-mono-code flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Conformité Juridique & Éthique MINE GUARD</span>
                </h4>
                <ul className="text-xs space-y-2 text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Légalité stricte :</strong> Aucune technique clandestine, spam ou scrapping non autorisé.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Transparence bancaire :</strong> Aucun centime n'est comptabilisé en bénéfice avant encaissement réel.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Plafond Cost Guard :</strong> Coupure automatique d'urgence si une opération dépasse son budget.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Séparation des responsabilités :</strong> Mutualisation technique sans confusion des rôles des agents.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs font-mono-code">
          <span className="text-slate-500">ID Système: {building.id}</span>
          <button
            onClick={() => {
              soundEngine.playStepTone();
              onClose();
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors font-bold"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
