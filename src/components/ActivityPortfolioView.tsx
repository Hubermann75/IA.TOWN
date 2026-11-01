/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IA TOWN — Portefeuille d'Activités & Cycle Commercial
 */

import React, { useState } from 'react';
import { 
  ActivityItem, 
  ActivityLifecycleState, 
  CommercialCycleTrack, 
  RevenueCategory 
} from '../types/town';
import { transitionActivityState, progressCommercialCycle, COMMERCIAL_STEPS_ORDER } from '../logic/lifecycle';
import { 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  TrendingUp, 
  Euro, 
  ArrowRight, 
  Layers, 
  Clock, 
  FileText,
  PauseCircle,
  PlayCircle
} from 'lucide-react';

interface Props {
  activities: ActivityItem[];
  commercialTracks: CommercialCycleTrack[];
  onUpdateActivity: (updated: ActivityItem) => void;
  onUpdateTrack: (updated: CommercialCycleTrack) => void;
  onCreateActivity: (newAct: ActivityItem) => void;
}

export const ActivityPortfolioView: React.FC<Props> = ({
  activities,
  commercialTracks,
  onUpdateActivity,
  onUpdateTrack,
  onCreateActivity,
}) => {
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeActivityModal, setActiveActivityModal] = useState<ActivityItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // New activity form state
  const [newActName, setNewActName] = useState('');
  const [newActCategory, setNewActCategory] = useState<RevenueCategory>('PRODUIT_NUMERIQUE');
  const [newActBudget, setNewActBudget] = useState(150);
  const [newActDesc, setNewActDesc] = useState('');
  const [newActAgent, setNewActAgent] = useState('03. FORGE.MASTER');

  const filteredActivities = activities.filter(act => {
    if (selectedStateFilter !== 'ALL' && act.state !== selectedStateFilter) return false;
    if (selectedCategoryFilter !== 'ALL' && act.category !== selectedCategoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return act.name.toLowerCase().includes(q) || act.description.toLowerCase().includes(q);
    }
    return true;
  });

  const handleStateChange = (activity: ActivityItem, nextState: ActivityLifecycleState) => {
    const res = transitionActivityState(activity, nextState, 'Transition manuelle depuis le portefeuille');
    if (!res.success) {
      alert(`Erreur de transition: ${res.error}`);
      return;
    }
    onUpdateActivity(res.activity);
    if (activeActivityModal?.id === activity.id) {
      setActiveActivityModal(res.activity);
    }
  };

  const handleProgressTrack = (track: CommercialCycleTrack) => {
    const updated = progressCommercialCycle(
      track,
      '00. ARENA.SUPERVISOR',
      'Étape validée avec succès selon les critères de qualité',
      true
    );
    onUpdateTrack(updated);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActName.trim()) return;

    let buildingId = 'FACTORY_IA';
    if (newActCategory === 'ABONNEMENT') buildingId = 'SUBSCRIPTION_IA';
    if (newActCategory === 'EXTENSION') buildingId = 'PLUGIN_STORE_IA';
    if (newActCategory === 'SITE_WEB') buildingId = 'WEB_ESTATE_IA';
    if (newActCategory === 'EDITION_NUMERIQUE') buildingId = 'MEDIA_IA';

    const newActivity: ActivityItem = {
      id: `act-${Date.now().toString().slice(-5)}`,
      name: newActName,
      category: newActCategory,
      responsibleAgent: newActAgent,
      buildingId,
      state: 'IDEE',
      maxBudget: newActBudget,
      financials: {
        revenuPotentiel: 0,
        revenuDeclare: 0,
        revenuConfirme: 0,
        revenuEncaisse: 0,
        costs: { apiCosts: 0, hostingCosts: 0, advertisingCosts: 0, commissions: 0, maintenanceHours: 0, hourlyRate: 0 },
        totalExpenses: 0,
        netProfit: 0,
        roiPercentage: 0,
        repeatabilityScore: newActCategory === 'PRODUIT_NUMERIQUE' ? 95 : 80,
        riskLevel: 'FAIBLE',
        humanInterventionRequired: 'NULLE',
        dataPointsCount: 0,
      },
      description: newActDesc || 'Nouvelle activité numérique créée par IA TOWN.',
      complianceChecked: true,
      authorized: false,
      kpis: { activeUsersOrDownloads: 0, conversionRate: 0 },
      historyEvents: [
        { timestamp: new Date().toISOString(), description: 'Création de l’idée dans le portefeuille', type: 'MILESTONE' },
      ],
    };

    onCreateActivity(newActivity);
    setShowCreateModal(false);
    setNewActName('');
    setNewActDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 font-cyber">
            PORTEFEUILLE D'ACTIVITÉS NUMÉRIQUES (8 MODÈLES)
          </h2>
          <p className="text-xs text-slate-400">
            Cycle de vie strict : IDÉE → ÉTUDE → VALIDATION → PRODUCTION → PUBLICATION → EXPLOITATION → OPTIMISATION → SUSPENSION.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher une activité..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-56 font-mono-code"
            />
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Activité</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs: Lifecycle States */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] text-slate-500 mr-2 shrink-0 font-mono-code">États :</span>
        {['ALL', 'IDEE', 'ETUDE', 'VALIDATION', 'PRODUCTION', 'PUBLICATION', 'EXPLOITATION', 'OPTIMISATION', 'SUSPENSION'].map(st => (
          <button
            key={st}
            onClick={() => setSelectedStateFilter(st)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-mono-code ${
              selectedStateFilter === st
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredActivities.map(act => {
          const matchingTrack = commercialTracks.find(t => t.activityId === act.id);

          return (
            <div
              key={act.id}
              onClick={() => setActiveActivityModal(act)}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono-code text-cyan-400 bg-cyan-950/80 border border-cyan-900 px-2 py-0.5 rounded">
                    {act.category}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono-code ${
                    act.state === 'EXPLOITATION' ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800' :
                    act.state === 'SUSPENSION' ? 'text-rose-400 bg-rose-950/60 border border-rose-800' :
                    'text-amber-400 bg-amber-950/60 border border-amber-800'
                  }`}>
                    {act.state}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-100 font-cyber mb-1">
                  {act.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                  {act.description}
                </p>

                {/* Financial Summary */}
                <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80 text-xs font-mono-code mb-3">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Encaissé</span>
                    <span className="font-semibold text-emerald-400">{act.financials.revenuEncaisse.toFixed(0)} €</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Dépenses</span>
                    <span className="font-semibold text-slate-400">{act.financials.totalExpenses.toFixed(0)} €</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Résultat Net</span>
                    <span className={`font-semibold ${act.financials.netProfit >= 0 ? 'text-cyan-300' : 'text-rose-400'}`}>
                      {act.financials.netProfit > 0 ? '+' : ''}{act.financials.netProfit.toFixed(0)} €
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer info: Responsible agent & Commercial Track progress */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate max-w-[150px]">{act.responsibleAgent}</span>
                {matchingTrack ? (
                  <span className="text-cyan-400 font-mono-code text-[10px]">
                    Cycle: {matchingTrack.currentStep}
                  </span>
                ) : (
                  <span className="text-slate-500 text-[10px]">Non engagé</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Commercial Cycle Traceability Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 font-cyber flex items-center gap-2">
              CHAÎNE OPÉRATIONNELLE COMMERCIALE (TRAÇABILITÉ V3.0)
            </h3>
            <p className="text-xs text-slate-400">
              DÉTECTION → ANALYSE → VALIDATION → PRODUCTION → CONTRÔLE QUALITÉ → PUBLICATION → ACQUISITION → VENTE → LIVRAISON → ENCAISSEMENT → MAINTENANCE.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {commercialTracks.map(track => {
            const currentIdx = COMMERCIAL_STEPS_ORDER.indexOf(track.currentStep);

            return (
              <div key={track.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-200 font-cyber">
                      {track.productName}
                    </span>
                    <span className="text-[11px] text-slate-500 block font-mono-code">
                      Étape courante : <span className="text-cyan-400 font-bold">{track.currentStep}</span> ({currentIdx + 1}/{COMMERCIAL_STEPS_ORDER.length})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {track.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleProgressTrack(track)}
                        className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Avancer étape suivante</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <span className={`text-[10px] px-2 py-1 rounded font-mono-code ${
                      track.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    }`}>
                      {track.status}
                    </span>
                  </div>
                </div>

                {/* Stepper Visualization */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-1 text-[10px] font-mono-code">
                  {COMMERCIAL_STEPS_ORDER.map((step, idx) => {
                    const isPassed = track.stepsCompleted.includes(step);
                    const isCurrent = track.currentStep === step;

                    return (
                      <div
                        key={step}
                        className={`p-1.5 rounded text-center truncate ${
                          isPassed
                            ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800'
                            : isCurrent
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-500 font-bold animate-pulse'
                            : 'bg-slate-900 text-slate-600'
                        }`}
                        title={step}
                      >
                        {step.slice(0, 7)}
                      </div>
                    );
                  })}
                </div>

                {/* Audit trail */}
                <div className="mt-3 pt-2 border-t border-slate-900 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-400">Dernier journal d'audit : </span>
                  {track.auditLog[track.auditLog.length - 1]?.details || 'Aucun log'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Detail Modal */}
      {activeActivityModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] text-cyan-400 font-mono-code uppercase">
                  FICHE ACTIVITÉ DÉTAILLÉE
                </span>
                <h3 className="text-lg font-bold text-slate-100 font-cyber">
                  {activeActivityModal.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveActivityModal(null)}
                className="text-slate-400 hover:text-slate-200 text-sm font-mono-code px-2 py-1 rounded"
              >
                ✕ Fermer
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {activeActivityModal.description}
            </p>

            {/* Lifecycle Transition Buttons */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 block mb-2 font-mono-code">
                Modifier l'état opérationnel :
              </span>
              <div className="flex flex-wrap gap-1.5 text-xs">
                {(['IDEE', 'ETUDE', 'VALIDATION', 'PRODUCTION', 'PUBLICATION', 'EXPLOITATION', 'OPTIMISATION', 'SUSPENSION'] as ActivityLifecycleState[]).map(st => (
                  <button
                    key={st}
                    onClick={() => handleStateChange(activeActivityModal, st)}
                    className={`px-3 py-1 rounded transition-colors font-mono-code text-[11px] ${
                      activeActivityModal.state === st
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Detailed Financials */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono-code">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Encaissé Réel</span>
                <span className="text-sm font-bold text-emerald-400">{activeActivityModal.financials.revenuEncaisse.toFixed(2)} €</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Total Dépenses</span>
                <span className="text-sm font-bold text-slate-300">{activeActivityModal.financials.totalExpenses.toFixed(2)} €</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Résultat Net</span>
                <span className={`text-sm font-bold ${activeActivityModal.financials.netProfit >= 0 ? 'text-cyan-300' : 'text-rose-400'}`}>
                  {activeActivityModal.financials.netProfit.toFixed(2)} €
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Répétabilité</span>
                <span className="text-sm font-bold text-cyan-400">{activeActivityModal.financials.repeatabilityScore}%</span>
              </div>
            </div>

            {/* Audit History */}
            <div className="space-y-1.5 pt-2">
              <span className="text-xs font-semibold text-slate-400 font-mono-code">Historique d'événements :</span>
              <div className="space-y-1 text-xs">
                {activeActivityModal.historyEvents.map((evt, idx) => (
                  <div key={idx} className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>{evt.description}</span>
                    <span className="text-[10px] text-slate-500 font-mono-code">
                      {new Date(evt.timestamp).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Activity Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 font-cyber">
              Créer une Nouvelle Activité Numérique
            </h3>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Nom de l'activité</label>
              <input
                type="text"
                required
                value={newActName}
                onChange={e => setNewActName(e.target.value)}
                placeholder="Ex: SaaS Micro-API de validation"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono-code"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Modèle Économique</label>
              <select
                value={newActCategory}
                onChange={e => setNewActCategory(e.target.value as RevenueCategory)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono-code"
              >
                <option value="PRODUIT_NUMERIQUE">Produit Numérique (Logiciel, Template)</option>
                <option value="ABONNEMENT">Abonnement SaaS Récurrent</option>
                <option value="EXTENSION">Extension / Plugin logiciel</option>
                <option value="SITE_WEB">Site Web spécialisé</option>
                <option value="EDITION_NUMERIQUE">Édition Numérique / Newsletter</option>
                <option value="AFFILIATION">Affiliation Conforme</option>
                <option value="MICROREVENU">Micro-revenu automatisé</option>
                <option value="PRESTATION">Prestation assistée par IA</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Budget Maximal Autorisé (€)</label>
              <input
                type="number"
                min="20"
                max="500"
                value={newActBudget}
                onChange={e => setNewActBudget(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono-code"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Description courte</label>
              <textarea
                value={newActDesc}
                onChange={e => setNewActDesc(e.target.value)}
                placeholder="Description du produit ou service..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono-code h-20"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg cursor-pointer"
              >
                Enregistrer au Registre
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
