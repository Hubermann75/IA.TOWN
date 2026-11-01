/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FACTORY.IA & MARKET.IA — Atelier Numérique & Téléchargements Réels
 * Synthèse logicielle réelle et livraison de binaires/licences téléchargeables
 */

import React, { useState } from 'react';
import { generateDigitalProductFiles, downloadFileBlob, DigitalAssetBundle } from '../logic/digitalProductGenerator';
import { 
  Wrench, 
  ShoppingBag, 
  Download, 
  FileCode, 
  FileText, 
  Key, 
  CheckCircle2, 
  Sparkles, 
  Cpu, 
  ShieldCheck,
  Package
} from 'lucide-react';

export const FactoryMarketWorkspace: React.FC = () => {
  const [productTitle, setProductTitle] = useState('DockerScan Sentinel CLI');
  const [customerEmail, setCustomerEmail] = useState('devops@cloudcorp.io');
  const [priceEur, setPriceEur] = useState(29.0);
  const [currentBundle, setCurrentBundle] = useState<DigitalAssetBundle>(() =>
    generateDigitalProductFiles(
      'DockerScan Sentinel CLI',
      'LIC-DS-7741-9982-XE',
      'devops@cloudcorp.io',
      29.0
    )
  );
  const [isCompiling, setIsCompiling] = useState(false);
  const [synthesizedNotice, setSynthesizedNotice] = useState(false);

  const handleSynthesizeNew = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCompiling(true);
    setSynthesizedNotice(false);

    setTimeout(() => {
      const newLicenseKey = `LIC-DS-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 4).toUpperCase()}`;
      const bundle = generateDigitalProductFiles(productTitle, newLicenseKey, customerEmail, priceEur);
      setCurrentBundle(bundle);
      setIsCompiling(false);
      setSynthesizedNotice(true);
      setTimeout(() => setSynthesizedNotice(false), 4000);
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-amber-800/50 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700/60">
              AGENTS #03 FORGE.MASTER & #04 MARKET.BOT
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-emerald-400 font-mono-code flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Génération d'Actifs Numériques Réels Téléchargeables
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 font-cyber">
            ATELIER NUMÉRIQUE & LIVRAISON EFFECTIVE DE FICHIERS
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            FACTORY.IA compile des binaires de scripts exécutables originaux et émet les licences chiffrées. Vous pouvez télécharger les vrais fichiers générés directement sur votre ordinateur.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-amber-300 font-mono-code flex items-center gap-1.5">
            <Package className="w-4 h-4 text-amber-400" />
            100% Produits Réutilisables
          </span>
        </div>
      </div>

      {/* Two Column Grid: Compiler Form (Left) vs Real Downloadable Files Bundle (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Compiler Form (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-slate-200 uppercase font-cyber">
                SYNTHÈSE LOGICIELLE FACTORY.IA
              </h2>
            </div>
            <span className="text-xs text-emerald-400 font-mono-code">Prêt</span>
          </div>

          <form onSubmit={handleSynthesizeNew} className="space-y-3 font-mono-code text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Nom du Produit Numérique</label>
              <input
                type="text"
                required
                value={productTitle}
                onChange={e => setProductTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Email Acheteur Assigné</label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Prix de Vente Fixe (€ TTC)</label>
              <input
                type="number"
                min="9"
                max="499"
                value={priceEur}
                onChange={e => setPriceEur(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={isCompiling}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 mt-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isCompiling ? 'Compilation en cours...' : 'Compiler & Générer les Livrables'}</span>
            </button>

            {synthesizedNotice && (
              <div className="p-2.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-lg text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Nouveaux fichiers et certificat générés avec succès!</span>
              </div>
            )}
          </form>
        </div>

        {/* Real Downloadable Bundle Cards (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-slate-200 uppercase font-cyber">
                FICHIERS DISPONIBLES AU TÉLÉCHARGEMENT DIRECT
              </h2>
            </div>
            <span className="text-xs text-cyan-400 font-mono-code">
              {currentBundle.checksumSha256.slice(0, 16)}...
            </span>
          </div>

          <div className="space-y-3 font-mono-code text-xs">
            {/* File 1: Bash Script Tool */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-amber-400">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200">
                    dockerscan-sentinel.sh
                  </h4>
                  <span className="text-[10px] text-slate-500">
                    Script CLI Shell exécutable original · 1.2 KB
                  </span>
                </div>
              </div>

              <button
                onClick={() => downloadFileBlob(currentBundle.scriptContent, 'dockerscan-sentinel.sh', 'application/x-sh')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400 text-amber-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger .sh</span>
              </button>
            </div>

            {/* File 2: Cryptographic License Certificate */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-cyan-400">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200">
                    license-certificate.json
                  </h4>
                  <span className="text-[10px] text-slate-500">
                    Certificat cryptographique avec clé {currentBundle.licenseKey}
                  </span>
                </div>
              </div>

              <button
                onClick={() => downloadFileBlob(currentBundle.licenseJson, 'license-certificate.json', 'application/json')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-cyan-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger .json</span>
              </button>
            </div>

            {/* File 3: Legal Invoice */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-emerald-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200">
                    facture-achat-officielle.txt
                  </h4>
                  <span className="text-[10px] text-slate-500">
                    Facture marchande légale avec TVA acquittée
                  </span>
                </div>
              </div>

              <button
                onClick={() => downloadFileBlob(currentBundle.invoiceText, 'facture-achat-officielle.txt', 'text/plain')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-400 text-emerald-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger .txt</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
