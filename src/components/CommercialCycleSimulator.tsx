/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IA TOWN — Parcours Commercial Complet (Premier Objectif Mesurable)
 * Démonstration d'un cycle commercial fonctionnel de bout en bout (Étapes 1 à 10)
 */

import React, { useState } from 'react';
import { 
  TEN_STEPS, 
  createInitialCommercialState, 
  advanceTenStepCycle 
} from '../logic/commercialRunner';
import { TenStepExecutionState, StructuredAgentEvent } from '../types/town';
import { 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  FileCode, 
  DollarSign, 
  Key, 
  Download, 
  ExternalLink, 
  Euro, 
  TrendingUp, 
  Cpu, 
  Building2,
  Check,
  Copy
} from 'lucide-react';

interface Props {
  onBankCredit: (netAmount: number, grossAmount: number, costsAmount: number) => void;
  onEmitEvent: (event: StructuredAgentEvent) => void;
}

export const CommercialCycleSimulator: React.FC<Props> = ({
  onBankCredit,
  onEmitEvent,
}) => {
  const [cycleState, setCycleState] = useState<TenStepExecutionState>(createInitialCommercialState);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  const currentStepDef = TEN_STEPS[cycleState.currentStepIndex];

  const handleNextStep = () => {
    if (cycleState.currentStepIndex >= TEN_STEPS.length) return;

    const { newState, event } = advanceTenStepCycle(cycleState);
    setCycleState(newState);
    onEmitEvent(event);

    // If completed final step 10, credit the bank ledger!
    if (newState.isCompleted) {
      onBankCredit(
        newState.netBankedCash,
        newState.paymentConfirmedAmount,
        newState.calculatedExpenses.total
      );
    }
  };

  const handleAutoRun = async () => {
    setIsAutoPlaying(true);
    let current = { ...cycleState };

    const runNext = (s: TenStepExecutionState) => {
      if (s.currentStepIndex >= TEN_STEPS.length) {
        setIsAutoPlaying(false);
        return;
      }
      const { newState, event } = advanceTenStepCycle(s);
      setCycleState(newState);
      onEmitEvent(event);

      if (newState.isCompleted) {
        onBankCredit(
          newState.netBankedCash,
          newState.paymentConfirmedAmount,
          newState.calculatedExpenses.total
        );
        setIsAutoPlaying(false);
        return;
      }

      setTimeout(() => runNext(newState), 800);
    };

    runNext(current);
  };

  const handleReset = () => {
    setCycleState(createInitialCommercialState());
    setIsAutoPlaying(false);
    setCopiedKey(false);
  };

  const copyLicense = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-800/50 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                PREMIER OBJECTIF MESURABLE V3.0
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-cyan-400 font-mono-code flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Démonstration d'un cycle commercial complet
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-100 font-cyber">
              CHAÎNE OPÉRATIONNELLE : DE L'IDÉE À L'ENCAISSEMENT RÉEL
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl mt-1">
              Parcours commercial complet en 10 étapes vérifiables. Pas de gains théoriques : calcul des coûts réels et crédit net sur compte bancaire audité.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!cycleState.isCompleted ? (
              <>
                <button
                  onClick={handleNextStep}
                  disabled={isAutoPlaying}
                  className="btn-town-primary text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Étape Suivante ({cycleState.currentStepIndex + 1}/10)</span>
                </button>
                <button
                  onClick={handleAutoRun}
                  disabled={isAutoPlaying}
                  className="btn-town-secondary text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isAutoPlaying ? 'Exécution...' : 'Lancer le cycle automatique'}</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleReset}
                className="btn-town-primary text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Recommencer un cycle</span>
              </button>
            )}
          </div>
        </div>

        {/* 10-Step Progress Grid Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 mt-5 pt-5 border-t border-slate-800/80 font-mono-code text-[11px]">
          {TEN_STEPS.map((step, idx) => {
            const isDone = cycleState.currentStepIndex > idx;
            const isCurrent = cycleState.currentStepIndex === idx;

            return (
              <div
                key={step.id}
                className={`p-2 rounded-lg border text-center transition-all ${
                  isDone
                    ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                    : isCurrent
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/20 font-bold animate-pulse'
                    : 'bg-slate-950/60 border-slate-800 text-slate-500'
                }`}
              >
                <div className="text-[10px] uppercase truncate">Étape {step.stepNumber}</div>
                <div className="font-semibold text-xs truncate mt-0.5">{step.title.split('. ')[1]}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Current Step Details Left / Financial Audit & Deliverables Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Current Active Step Card (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wide font-cyber">
                {cycleState.isCompleted ? 'CYCLE COMMERCIAL ACCOMPLI AVEC SUCCÈS' : 'ÉTAPE EN COURS D’EXÉCUTION'}
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono-code">
              Progression : {cycleState.currentStepIndex} / 10
            </span>
          </div>

          {!cycleState.isCompleted && currentStepDef ? (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono-code text-xs">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-cyan-300 font-cyber">
                  {currentStepDef.title}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                  Bâtiment : {currentStepDef.buildingId}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] text-slate-500 block mb-1">Rôle & Mission :</span>
                <p className="text-slate-300 leading-relaxed">{currentStepDef.description}</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">Agent Responsable :</span>
                  <span className="text-slate-200 font-semibold">{currentStepDef.responsibleAgent}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">Livrable généré :</span>
                  <span className="text-emerald-400 font-semibold">{currentStepDef.deliverableName}</span>
                </div>
              </div>

              <button
                onClick={handleNextStep}
                className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer text-xs"
              >
                <span>Valider et passer à l'étape suivante</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-5 rounded-xl bg-emerald-950/40 border border-emerald-600 space-y-3 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-emerald-300 font-cyber">
                TRANSACTION COMMERCIALE 100% AUDITÉE & ENCAISSÉE
              </h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Le produit "DockerScan Sentinel CLI v1.0" a été conçu, audité, publié, commandé, livré, et son paiement de 29.00 € a été encaissé avec déduction des coûts réels de 1.52 €.
              </p>
              <div className="text-lg font-bold text-emerald-400 font-mono-code">
                Bénéfice Net Réel Encaissé : +{cycleState.netBankedCash.toFixed(2)} €
              </div>
            </div>
          )}

          {/* Audit trail journal */}
          <div>
            <span className="text-xs font-semibold text-slate-400 font-mono-code block mb-2">
              Journal d'audit de la chaîne commerciale :
            </span>
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              {cycleState.auditTrail.length === 0 ? (
                <div className="text-xs text-slate-500 italic p-3 bg-slate-950 rounded-lg text-center">
                  Aucune étape encore exécutée. Cliquez sur "Étape Suivante" pour démarrer.
                </div>
              ) : (
                cycleState.auditTrail.map((entry, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono-code flex items-start justify-between gap-3"
                  >
                    <div>
                      <span className="font-semibold text-cyan-300">{entry.title}</span>
                      <p className="text-slate-400 mt-0.5">{entry.details}</p>
                    </div>
                    <span className="text-slate-500 text-[10px] shrink-0">{entry.agent}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Deliverable & Real Financial Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Deliverable Preview Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-200 uppercase font-cyber flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-cyan-400" />
                LIVRABLE DU PRODUIT NUMÉRIQUE
              </span>
              <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                PRODUIT RÉUTILISABLE (95%)
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono-code space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Produit :</span>
                <span className="text-slate-200 font-semibold">{cycleState.productTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tarif catalogue :</span>
                <span className="text-emerald-400 font-bold">{cycleState.priceTag.toFixed(2)} € TTC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Client Acheteur :</span>
                <span className="text-slate-300">{cycleState.customerOrderEmail}</span>
              </div>

              {cycleState.licenseKeyGenerated && (
                <div className="pt-2 border-t border-slate-900">
                  <span className="text-slate-500 block mb-1">Clé de Licence Numérique délivrée :</span>
                  <div className="flex items-center justify-between bg-slate-900 p-2 rounded border border-cyan-800 text-cyan-300 text-[11px]">
                    <span>{cycleState.licenseKeyGenerated}</span>
                    <button
                      onClick={() => copyLicense(cycleState.licenseKeyGenerated!)}
                      className="text-slate-400 hover:text-slate-200 cursor-pointer"
                      title="Copier la clé"
                    >
                      {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Real Expenses Calculation (Step 9 & 10) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 font-mono-code text-xs">
            <span className="text-xs font-bold text-slate-200 uppercase font-cyber block pb-2 border-b border-slate-800">
              DÉCOMPOSITION STRICTE DES COÛTS & RÉSULTAT NET
            </span>

            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>Paiement Brut Reçu (Stripe/SEPA) :</span>
                <span className="font-bold text-emerald-400">+{cycleState.paymentConfirmedAmount.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>- Frais d'inférence API :</span>
                <span>-{cycleState.calculatedExpenses.apiInference.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>- Frais d'hébergement & CDN :</span>
                <span>-{cycleState.calculatedExpenses.hostingDelivery.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>- Commission passerelle de paiement :</span>
                <span>-{cycleState.calculatedExpenses.paymentFee.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-rose-400 pt-1 border-t border-slate-800">
                <span>Total des dépenses réelles imputées :</span>
                <span>-{cycleState.calculatedExpenses.total.toFixed(2)} €</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/70 flex items-center justify-between text-emerald-300">
              <span className="font-bold font-cyber">RÉSULTAT NET RÉEL BANCAIRE :</span>
              <span className="text-base font-bold">+{cycleState.netBankedCash.toFixed(2)} €</span>
            </div>

            <p className="text-[10px] text-slate-500 leading-tight">
              * Conformément à la règle d'or REVENUE.ENGINE : aucun centime n'est crédité à la trésorerie sans encaissement bancaire effectif et déduction de l'intégralité des coûts réels.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
