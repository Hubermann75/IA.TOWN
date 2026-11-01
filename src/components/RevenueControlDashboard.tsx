/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IA TOWN — REVENUE CONTROL DASHBOARD
 * Central Profitability Engine & Bank Reconciliation
 */

import React, { useState } from 'react';
import { ActivityItem, BankLedger, CostGuardConfig, RevenueCategory } from '../types/town';
import { isProfitabilityAudited } from '../logic/revenueEngine';
import { 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  ShieldCheck, 
  Layers, 
  Euro, 
  Clock, 
  AlertTriangle,
  ArrowUpRight,
  Filter,
  CheckCircle,
  HelpCircle,
  Zap,
  Server,
  DollarSign
} from 'lucide-react';

interface Props {
  activities: ActivityItem[];
  bankLedger: BankLedger;
  costGuard: CostGuardConfig;
  onSelectActivity: (id: string) => void;
  onNavigateToPortfolio: () => void;
}

export const RevenueControlDashboard: React.FC<Props> = ({
  activities,
  bankLedger,
  costGuard,
  onSelectActivity,
  onNavigateToPortfolio,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [sortMode, setSortMode] = useState<'NET_PROFIT' | 'ROI' | 'REPEATABILITY'>('NET_PROFIT');

  // Segregate activities into audited profitable vs deficit/unverified
  const sortedActivities = [...activities].sort((a, b) => {
    if (sortMode === 'NET_PROFIT') {
      return b.financials.netProfit - a.financials.netProfit;
    }
    if (sortMode === 'ROI') {
      return b.financials.roiPercentage - a.financials.roiPercentage;
    }
    return b.financials.repeatabilityScore - a.financials.repeatabilityScore;
  });

  const filteredActivities = sortedActivities.filter(a => {
    if (filterCategory === 'ALL') return true;
    return a.category === filterCategory;
  });

  const profitableCount = activities.filter(a => isProfitabilityAudited(a.financials).audited).length;
  const deficitCount = activities.filter(a => a.financials.netProfit < 0).length;

  return (
    <div className="space-y-6">
      {/* Principle & Anti-Hallucination Oath Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-cyber">
              CHARTE REVENUE.ENGINE V3.0 — VÉRITÉ FINANCIÈRE ABSOLUE
            </h2>
            <p className="text-xs text-slate-400">
              Ne jamais promettre de gains · Ne jamais inventer de revenus · Rentabilité calculée sur encaissements bancaires effectifs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono-code">
            Dernier Audit : {new Date(bankLedger.lastAuditTimestamp).toLocaleTimeString('fr-FR')}
          </span>
          <span className="text-xs px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono-code">
            Compte Bancaire Lié & Audité
          </span>
        </div>
      </div>

      {/* Primary Financial Ledger: Strict Separation of States */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Banked Cash (Encaissé) */}
        <div className="bg-slate-900 border border-emerald-600/50 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-400 font-cyber">
              REVENUS ENCAISSÉS (RÉEL)
            </span>
            <Euro className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono-code">
            {bankLedger.revenusEncaisses.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Fonds effectivement crédités sur le compte bancaire IA TOWN.
          </p>
        </div>

        {/* Real Expenses (Dépenses) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-rose-400 font-cyber">
              DÉPENSES RÉELLES AUDITÉES
            </span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono-code">
            {bankLedger.depensesReellesTotales.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            API, hébergement cloud, publicités, commissions et maintenance.
          </p>
        </div>

        {/* Real Net Profit (Résultat Net Réel) */}
        <div className={`border rounded-2xl p-5 shadow-lg ${
          bankLedger.resultatNetReel >= 0
            ? 'bg-slate-900 border-cyan-500/60 shadow-cyan-500/10'
            : 'bg-slate-900 border-rose-500/60'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-cyan-300 font-cyber">
              RÉSULTAT NET RÉEL (BÉNÉFICE)
            </span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className={`text-2xl font-bold font-mono-code ${
            bankLedger.resultatNetReel >= 0 ? 'text-cyan-300' : 'text-rose-400'
          }`}>
            {bankLedger.resultatNetReel > 0 ? '+' : ''}{bankLedger.resultatNetReel.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Strictement égal à : Encaissé − Total des dépenses réelles.
          </p>
        </div>

        {/* Unconfirmed / Potentiel vs Encaissé */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-400 font-cyber">
              POTENTIEL VS ENCAISSÉ
            </span>
            <HelpCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-slate-300 font-mono-code">
            {bankLedger.revenusPotentiels.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Montants prévisionnels déclarés non encaissés (écart : {(bankLedger.revenusPotentiels - bankLedger.revenusEncaisses).toFixed(2)} €).
          </p>
        </div>
      </div>

      {/* Cost Guard & Spending Alerter */}
      {costGuard.activeAlerts.length > 0 && (
        <div className="bg-amber-950/30 border border-amber-800/80 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <span className="font-bold text-amber-300 uppercase tracking-wide font-cyber">
              SURVEILLANCE COST.GUARD ACTIVE ({costGuard.activeAlerts.length} ALERTE)
            </span>
            {costGuard.activeAlerts.map(alert => (
              <p key={alert.id} className="text-slate-300">
                • {alert.message}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Main Ranking Table: Activities Evaluation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-100 font-cyber flex items-center gap-2">
              CLASSEMENT DES ACTIVITÉS DU PORTEFEUILLE
            </h3>
            <p className="text-xs text-slate-400">
              {profitableCount} activités auditées rentables · {deficitCount} activités déficitaires à optimiser ou suspendre
            </p>
          </div>

          {/* Controls: Sorting & Category */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-500 px-2">Trier par :</span>
              <button
                onClick={() => setSortMode('NET_PROFIT')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  sortMode === 'NET_PROFIT' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400'
                }`}
              >
                Bénéfice Net
              </button>
              <button
                onClick={() => setSortMode('ROI')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  sortMode === 'ROI' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400'
                }`}
              >
                ROI %
              </button>
              <button
                onClick={() => setSortMode('REPEATABILITY')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  sortMode === 'REPEATABILITY' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400'
                }`}
              >
                Répétabilité
              </button>
            </div>
          </div>
        </div>

        {/* Table of Activities */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs font-mono-code">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 text-[11px]">
                <th className="pb-3 font-medium">ACTIVITÉ & MODÈLE</th>
                <th className="pb-3 font-medium">ÉTAT</th>
                <th className="pb-3 font-medium text-right">ENCAISSÉ</th>
                <th className="pb-3 font-medium text-right">DÉPENSES</th>
                <th className="pb-3 font-medium text-right">RÉSULTAT NET</th>
                <th className="pb-3 font-medium text-right">ROI %</th>
                <th className="pb-3 font-medium text-center">RÉPÉTABILITÉ</th>
                <th className="pb-3 font-medium text-center">STATUT AUDIT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredActivities.map((act) => {
                const audit = isProfitabilityAudited(act.financials);

                return (
                  <tr
                    key={act.id}
                    onClick={() => onSelectActivity(act.id)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 pr-2">
                      <div className="font-semibold text-slate-200 text-xs font-cyber">
                        {act.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono-code">
                        {act.category} · {act.responsibleAgent}
                      </div>
                    </td>

                    <td className="py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono-code ${
                        act.state === 'EXPLOITATION' ? 'text-cyan-300 bg-cyan-950 border border-cyan-800' :
                        act.state === 'OPTIMISATION' ? 'text-amber-300 bg-amber-950 border border-amber-800' :
                        act.state === 'SUSPENSION' ? 'text-rose-300 bg-rose-950 border border-rose-800' :
                        'text-slate-400 bg-slate-800'
                      }`}>
                        {act.state}
                      </span>
                    </td>

                    <td className="py-3 text-right text-emerald-400 font-semibold">
                      {act.financials.revenuEncaisse.toFixed(2)} €
                    </td>

                    <td className="py-3 text-right text-slate-400">
                      {act.financials.totalExpenses.toFixed(2)} €
                    </td>

                    <td className="py-3 text-right font-bold">
                      <span className={act.financials.netProfit >= 0 ? 'text-cyan-300' : 'text-rose-400'}>
                        {act.financials.netProfit > 0 ? '+' : ''}{act.financials.netProfit.toFixed(2)} €
                      </span>
                    </td>

                    <td className="py-3 text-right">
                      <span className={act.financials.roiPercentage >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {act.financials.roiPercentage > 0 ? '+' : ''}{act.financials.roiPercentage}%
                      </span>
                    </td>

                    <td className="py-3 text-center">
                      <div className="inline-flex items-center gap-1 text-[11px]">
                        <span className={act.financials.repeatabilityScore >= 80 ? 'text-cyan-400 font-bold' : 'text-slate-400'}>
                          {act.financials.repeatabilityScore}%
                        </span>
                        {act.financials.repeatabilityScore >= 80 && (
                          <span className="text-[9px] text-cyan-500 font-mono-code">MULTI-VENTE</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 text-center">
                      {audit.audited ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded text-[10px]">
                          <CheckCircle className="w-3 h-3" />
                          <span>Rentable Audité</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded text-[10px]" title={audit.reason}>
                          <AlertTriangle className="w-3 h-3" />
                          <span>{audit.reason?.slice(0, 18)}...</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
