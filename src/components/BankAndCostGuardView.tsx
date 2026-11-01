/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BANK.IA & COST.GUARD — Sovereign Financial Vault & Anti-Risk Guard
 */

import React, { useState } from 'react';
import { BankLedger, CostGuardConfig } from '../types/town';
import { 
  Vault, 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Euro, 
  TrendingDown, 
  AlertTriangle, 
  Cpu, 
  Sliders, 
  CheckCircle,
  FileCheck,
  Ban
} from 'lucide-react';

interface Props {
  bankLedger: BankLedger;
  costGuard: CostGuardConfig;
  onUpdateCostGuard: (updated: CostGuardConfig) => void;
}

export const BankAndCostGuardView: React.FC<Props> = ({
  bankLedger,
  costGuard,
  onUpdateCostGuard,
}) => {
  const [maxApiInput, setMaxApiInput] = useState<number>(costGuard.maxDailyApiBudget);
  const [maxHostingInput, setMaxHostingInput] = useState<number>(costGuard.maxMonthlyHostingSpend);
  const [autoSuspension, setAutoSuspension] = useState<boolean>(costGuard.autoSuspensionEnabled);
  const [savedMessage, setSavedMessage] = useState<string>('');

  const handleSaveBudgetLimits = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCostGuard({
      ...costGuard,
      maxDailyApiBudget: maxApiInput,
      maxMonthlyHostingSpend: maxHostingInput,
      autoSuspensionEnabled: autoSuspension,
    });
    setSavedMessage('Plafonds budgétaires mis à jour avec succès');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const riskRules = [
    { title: 'Fraude Publicitaire', status: 'BLOQUÉ', desc: 'Détection et refus automatique des fermes de clics et faux trafics.' },
    { title: 'Faux Comptes & Faux Avis', status: 'BLOQUÉ', desc: 'Interdiction formelle de génération de faux témoignages ou bots d’avis.' },
    { title: 'Spam & Scraping Abusif', status: 'BLOQUÉ', desc: 'Respect strict des robots.txt, quotas API et conditions d’utilisation.' },
    { title: 'Contournement de CAPTCHA', status: 'BLOQUÉ', desc: 'Aucun solver non autorisé. Respect de l’intégrité des plateformes hôtes.' },
    { title: 'Dépenses Financières Non Validées', status: 'VERROUILLÉ', desc: 'Seul l’opérateur humain peut autoriser un décaissement bancaire réel.' },
    { title: 'Identifiants Bancaires', status: 'SÉCURISÉ', desc: 'Aucun stockage en clair. Hachage salé et HSM chiffré opérationnel.' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800/80 text-emerald-400">
            <Vault className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-100 font-cyber">
                BANK.IA & COST.GUARD — TRÉSORERIE SOUVERAINE
              </h1>
              <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                MODE {bankLedger.bankSecurityMode}
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Contrôle strict des dépenses, plafonnement des budgets API par agent, et audit de trésorerie réel sans hallucination de gains.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono-code">
          <span className="text-slate-400">Devise de tenue :</span>
          <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-cyan-300 font-bold">
            {bankLedger.currency} (€)
          </span>
        </div>
      </div>

      {/* Financial Vault 4-Stage Reconciliation */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wide font-cyber mb-4 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-cyan-400" />
          <span>RECONCILIATION BANCAIRE EN 4 NIVEAUX (BANK.IA)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono-code">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">1. Potentiel Prévu</span>
            <span className="text-xl font-bold text-slate-300 mt-1 block">
              {bankLedger.revenusPotentiels.toFixed(2)} €
            </span>
            <p className="text-[10px] text-slate-500 mt-2">
              Estimations ou propositions préliminaires non contractées.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">2. Déclaré sur Facture</span>
            <span className="text-xl font-bold text-slate-300 mt-1 block">
              {bankLedger.revenusDeclares.toFixed(2)} €
            </span>
            <p className="text-[10px] text-slate-500 mt-2">
              Factures émises ou commandes enregistrées en attente de validation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">3. Confirmé Passerelle</span>
            <span className="text-xl font-bold text-emerald-400 mt-1 block">
              {bankLedger.revenusConfirmes.toFixed(2)} €
            </span>
            <p className="text-[10px] text-slate-500 mt-2">
              Paiement vérifié par le processeur marchand officiel.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/70 shadow-lg shadow-emerald-500/10">
            <span className="text-[10px] text-emerald-400 uppercase block font-bold">4. Réellement Encaissé</span>
            <span className="text-xl font-bold text-emerald-300 mt-1 block">
              {bankLedger.revenusEncaisses.toFixed(2)} €
            </span>
            <p className="text-[10px] text-emerald-500 mt-2">
              Fonds crédités et auditables au crédit du compte bancaire.
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Grid: COST.GUARD Controls (Left) vs MINE GUARD Compliance (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: COST.GUARD Budget Controls Form (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide font-cyber">
                PARAMÈTRES COST.GUARD
              </h3>
            </div>
            {savedMessage && (
              <span className="text-xs text-emerald-400 font-mono-code animate-fade-in">
                {savedMessage}
              </span>
            )}
          </div>

          <form onSubmit={handleSaveBudgetLimits} className="space-y-4 text-xs font-mono-code">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-slate-300">Plafond API Journalier Maximal (€ / j)</label>
                <span className="text-cyan-400">Actuel : {costGuard.currentDailyApiSpend} €</span>
              </div>
              <input
                type="number"
                min="10"
                max="500"
                value={maxApiInput}
                onChange={e => setMaxApiInput(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-1.5 border border-slate-800">
                <div
                  className="bg-cyan-500 h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (costGuard.currentDailyApiSpend / maxApiInput) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-slate-300">Plafond Hébergement Serveurs Mensuel (€ / m)</label>
                <span className="text-cyan-400">Actuel : {costGuard.currentHostingSpend} €</span>
              </div>
              <input
                type="number"
                min="50"
                max="1000"
                value={maxHostingInput}
                onChange={e => setMaxHostingInput(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-1.5 border border-slate-800">
                <div
                  className="bg-purple-500 h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (costGuard.currentHostingSpend / maxHostingInput) * 100)}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200 block">Suspension Automatique d'Urgence</span>
                <span className="text-[10px] text-slate-500">
                  Suspend automatiquement les opérations dépassant leur budget alloué.
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoSuspension}
                onChange={e => setAutoSuspension(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer"
            >
              Enregistrer les Plafonds COST.GUARD
            </button>
          </form>
        </div>

        {/* Right: MINE GUARD Anti-Risk Protocol Matrix (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide font-cyber">
                MINE GUARD & SECURITY.CORE CONFORMITÉ
              </h3>
            </div>
            <span className="text-xs text-emerald-400 font-mono-code">
              100% CONFORME
            </span>
          </div>

          <div className="space-y-2.5">
            {riskRules.map((rule, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-semibold text-slate-200 font-cyber">{rule.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {rule.desc}
                  </p>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-mono-code bg-emerald-950/80 text-emerald-300 border border-emerald-800 shrink-0">
                  {rule.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
