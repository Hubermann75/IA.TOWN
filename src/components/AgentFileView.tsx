/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IA TOWN — VUE AGENT (Fiches Détaillées des Agents & Spécialisations Visuelles - Image 3)
 * Showcases the 16 universal DNA robot models and the complete roster of 94 agents
 */

import React, { useEffect, useRef, useState } from 'react';
import { AGENT_REGISTRY } from '../data/agentRegistry';
import type { AgentRecord } from '../types/town';
import { getAgentRuntimeStatus, requestAgentProposal } from '../logic/agentRuntimeClient';
import type { AgentRuntimeStatus, AgentTaskProposal } from '../logic/agentRuntimeClient';
import { RobotAvatar, RobotRoleDesign } from './RobotAvatar';
import { soundEngine } from '../utils/soundEngine';
import { 
  Bot, 
  Search, 
  ShieldCheck, 
  Cpu, 
  Terminal, 
  Sparkles, 
  Activity, 
  DollarSign,
  Zap,
  Lock,
  Building2,
  Layers,
  Send,
} from 'lucide-react';

const VISUAL_ROLES_CATALOG: { role: RobotRoleDesign; title: string; building: string; desc: string }[] = [
  { role: 'DIRECTEUR', title: 'Directeur', building: 'AI.GENCY', desc: 'Arbitrage stratégique, allocations et direction générale' },
  { role: 'MINEUR', title: 'Mineur', building: 'CENTMINE', desc: 'Extraction de microrevenus et sondage des gisements' },
  { role: 'BANQUIER', title: 'Banquier', building: 'BANK.IA', desc: 'Gestion des comptes, trésorerie et rapprochement bancaire' },
  { role: 'DEVELOPPEUR', title: 'Développeur', building: 'FACTORY.IA', desc: 'Architecture code, génération logicielle et templates' },
  { role: 'VENDEUR', title: 'Vendeur', building: 'MARKET.IA', desc: 'Closing commercial, boutiques en ligne et tunnels de vente' },
  { role: 'TECHNICIEN', title: 'Technicien', building: 'ARE.IA.CENTER', desc: 'Supervision des flux IA, serveurs et infrastructure' },
  { role: 'SCIENTIFIQUE', title: 'Scientifique', building: 'R&D.IA', desc: 'Recherche appliquée, tests d\'algorithmes et benchmarks' },
  { role: 'COMMUNICANT', title: 'Communicant', building: 'TRAFFIC.IA', desc: 'Acquisition d\'audience, campagnes SEO et réseaux' },
  { role: 'LIVREUR', title: 'Livreur', building: 'MARKET.IA', desc: 'Dispatch instantané de commandes et distribution d\'assets' },
  { role: 'DESIGNER', title: 'Designer', building: 'FACTORY.IA', desc: 'Création d\'interfaces, design system et identité visuelle' },
  { role: 'ANALYSTE', title: 'Analyste', building: 'FINANCE', desc: 'Audit des coûts réels, rentabilité nette et métriques ROI' },
  { role: 'SECURITE', title: 'Sécurité', building: 'SECURITY.CORE', desc: 'Contrôles d\'accès biométriques, pare-feu et conformité' },
  { role: 'EBOUER', title: 'Éboueur', building: 'DUMP & INCI.', desc: 'Nettoyage des résidus, recyclage et destruction certifiée' },
  { role: 'SUPPORT', title: 'Support', building: 'SUBSCRIPTION.IA', desc: 'Assistance client réactive, rétention et support SaaS' },
  { role: 'EDITEUR', title: 'Éditeur', building: 'MEDIA.IA', desc: 'Production de contenus éditoriaux, newsletters et médias' },
  { role: 'EXPLORATEUR', title: 'Explorateur', building: 'OPPORTUNITY.LAB', desc: 'Veille marché temps réel et détection de niches rentables' },
];

const MAX_SESSION_PROPOSALS_PER_AGENT = 5;

interface SessionProposalEntry {
  mission: string;
  proposal: AgentTaskProposal;
}

export const AgentFileView: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [selectedAgentId, setSelectedAgentId] = useState<string>(AGENT_REGISTRY[0].id);
  const [newMissionText, setNewMissionText] = useState('');
  const [runtimeStatus, setRuntimeStatus] = useState<AgentRuntimeStatus | null>(null);
  const [runtimeCheckFailed, setRuntimeCheckFailed] = useState(false);
  const [proposalHistoryByAgent, setProposalHistoryByAgent] = useState<Record<string, SessionProposalEntry[]>>({});
  const [missionError, setMissionError] = useState<string | null>(null);
  const [isSubmittingMission, setIsSubmittingMission] = useState(false);
  const missionRequestVersion = useRef(0);

  useEffect(() => {
    let mounted = true;
    getAgentRuntimeStatus()
      .then(status => {
        if (mounted) setRuntimeStatus(status);
      })
      .catch(() => {
        if (mounted) setRuntimeCheckFailed(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    missionRequestVersion.current += 1;
    setMissionError(null);
    setIsSubmittingMission(false);
  }, [selectedAgentId]);

  const selectedAgent: AgentRecord = AGENT_REGISTRY.find(a => a.id === selectedAgentId) || AGENT_REGISTRY[0];
  const selectedAgentProposals = proposalHistoryByAgent[selectedAgentId] ?? [];

  const filteredAgents = AGENT_REGISTRY.filter(agent => {
    const matchesSearch = 
      agent.name.toLowerCase().includes(search.toLowerCase()) ||
      agent.buildingName.toLowerCase().includes(search.toLowerCase()) ||
      agent.profession.toLowerCase().includes(search.toLowerCase()) ||
      agent.description.toLowerCase().includes(search.toLowerCase());
    
    if (selectedTypeFilter !== 'ALL') {
      return matchesSearch && agent.type === selectedTypeFilter;
    }
    return matchesSearch;
  });

  const handleSendMission = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const mission = newMissionText.trim();
    if (!mission || isSubmittingMission || selectedAgent.type === 'TYPE_B_SERVICE' || !runtimeStatus?.available) return;

    const requestVersion = ++missionRequestVersion.current;
    setIsSubmittingMission(true);
    setMissionError(null);
    try {
      const proposal = await requestAgentProposal(selectedAgent.id, mission);
      if (missionRequestVersion.current !== requestVersion) return;
      setProposalHistoryByAgent(current => ({
        ...current,
        [selectedAgent.id]: [
          { mission, proposal },
          ...(current[selectedAgent.id] ?? []),
        ].slice(0, MAX_SESSION_PROPOSALS_PER_AGENT),
      }));
      setNewMissionText('');
      soundEngine.playSuccess();
    } catch (error) {
      if (missionRequestVersion.current === requestVersion) {
        setMissionError(error instanceof Error ? error.message : 'La demande IA a échoué. Aucune action externe n’a été lancée.');
        soundEngine.playAlert();
      }
    } finally {
      if (missionRequestVersion.current === requestVersion) setIsSubmittingMission(false);
    }
  };

  const missionRuntimeMessage = selectedAgent.type === 'TYPE_B_SERVICE'
    ? 'Ce profil demande un exécuteur déterministe dédié, qui n’est pas encore implémenté.'
    : runtimeCheckFailed
      ? 'Serveur IA inaccessible dans ce mode de lancement.'
      : !runtimeStatus
        ? 'Vérification de la disponibilité du moteur IA…'
        : runtimeStatus.available
          ? selectedAgent.type === 'TYPE_C_HYBRID'
            ? `Gemini disponible (${runtimeStatus.model}). Le profil hybride n’a pas encore son exécuteur déterministe; seule une proposition textuelle sera produite.`
            : `Gemini disponible côté serveur (${runtimeStatus.model}). La réponse sera une proposition; aucun outil externe n’est autorisé.`
          : runtimeStatus.reason === 'KEY_MISSING'
            ? 'Clé Gemini absente de la configuration serveur.'
            : 'Moteur Gemini désactivé côté serveur.';

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-[#0A0F1E] text-slate-100 select-none">
      {/* 16 Visual Robot Styles Showcase Ribbon from Image 3 */}
      <div className="px-4 py-2.5 bg-[#111522] border-b border-[#1B1F2A] z-10 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-orbitron font-extrabold text-xs text-[#00EDFF] tracking-wider uppercase">
              DESIGN DES ROBOTS AGENTS
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono-code">
              STYLE UNIVERSEL — MÊME ADN, SPÉCIALISATIONS PAR BÂTIMENT
            </span>
          </div>
          <span className="text-[11px] font-mono-code text-slate-400">
            16 Rôles Visuels Distincts • 94 Agents Modélisés
          </span>
        </div>

        {/* 16 Avatars Horizontal Scroll Row */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1.5 scrollbar-thin">
          {VISUAL_ROLES_CATALOG.map((cat) => (
            <div
              key={cat.role}
              onClick={() => {
                soundEngine.playTick();
                const match = AGENT_REGISTRY.find(a => 
                  a.profession.toLowerCase().includes(cat.title.toLowerCase()) ||
                  a.buildingName.toLowerCase().includes(cat.building.toLowerCase())
                );
                if (match) setSelectedAgentId(match.id);
              }}
              className="flex flex-col items-center p-1.5 rounded-xl bg-[#1B1F2A]/60 hover:bg-[#1B1F2A] border border-slate-700/60 hover:border-cyan-400/80 transition-all cursor-pointer shrink-0 w-20 group"
            >
              <RobotAvatar role={cat.role} size="md" />
              <span className="font-orbitron font-bold text-[10px] text-white group-hover:text-cyan-300 transition-colors mt-1 text-center truncate w-full">
                {cat.title}
              </span>
              <span className="text-[8.5px] font-mono-code text-slate-400 truncate w-full text-center">
                {cat.building}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Area: Roster List on Left, Comprehensive File on Right */}
      <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Column: Agents Directory & Filter */}
        <div className="lg:col-span-5 bg-[#111522]/90 border-r border-[#1B1F2A] flex flex-col overflow-hidden">
          {/* Search & Filter Header */}
          <div className="p-3 border-b border-[#1B1F2A] space-y-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par nom, profession, bâtiment..."
                className="w-full bg-[#0A0F1E] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 font-inter focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Role Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-orbitron">
              {[
                { id: 'ALL', label: 'Tous (94)' },
                { id: 'TYPE_A_IA', label: 'Type A (IA)' },
                { id: 'TYPE_B_SERVICE', label: 'Type B (Service)' },
                { id: 'TYPE_C_HYBRID', label: 'Type C (Hybride)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSelectedTypeFilter(tab.id);
                    soundEngine.playClick();
                  }}
                  className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
                    selectedTypeFilter === tab.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                      : 'text-slate-400 hover:text-white bg-slate-800/40'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Agents List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#1B1F2A]/60">
            {filteredAgents.map((agent) => {
              const isSelected = agent.id === selectedAgentId;
              return (
                <div
                  key={agent.id}
                  onClick={() => {
                    setSelectedAgentId(agent.id);
                    soundEngine.playTick();
                  }}
                  className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#00EDFF]/10 border-l-4 border-[#00EDFF]'
                      : 'hover:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <RobotAvatar role={agent.profession} size="sm" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-orbitron font-bold text-xs text-white">
                          {agent.name}
                        </span>
                        <span className="text-[10px] font-mono-code text-cyan-400">
                          #{agent.numericId}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-inter">
                        {agent.buildingName} • {agent.profession}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono-code block">
                      {agent.status}
                    </span>
                    <span className="text-[9.5px] text-slate-500 font-mono-code mt-0.5 block">
                      {agent.metrics.requestsHandled} req. · démo
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Agent Dossier */}
        <div className="lg:col-span-7 bg-[#0A0F1E] p-4 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            {/* Top Identity Header Card */}
            <div className="p-4 rounded-xl bg-[#111522] border border-cyan-500/30 flex items-start justify-between backdrop-blur-md">
              <div className="flex items-center gap-4">
                <RobotAvatar role={selectedAgent.profession} size="xl" />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-orbitron font-extrabold text-xl text-white">
                      {selectedAgent.name}
                    </h2>
                    <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-mono-code">
                      AGENT #{selectedAgent.numericId}
                    </span>
                  </div>
                  <div className="text-xs font-mono-code text-amber-400 mt-1">
                    FONCTION: {selectedAgent.profession}
                  </div>
                  <div className="text-xs text-slate-400 font-inter mt-0.5 flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Bâtiment assigné : <strong className="text-slate-200">{selectedAgent.buildingName}</strong></span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="px-3 py-1 rounded-full bg-slate-700/40 border border-slate-600/60 text-slate-300 text-xs font-orbitron font-bold">
                  PROFIL PRÉCHARGÉ
                </span>
                <span className="text-[10px] text-slate-400 font-mono-code block mt-1">
                  Statut catalogue : {selectedAgent.status} · Type : {selectedAgent.type}
                </span>
              </div>
            </div>

            {/* Telemetry & Specifications Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl panel-town-standard">
                  <span className="text-[10px] uppercase font-mono-code text-slate-400 block">REQUÊTES DU PROFIL · DÉMO</span>
                <span className="font-orbitron font-bold text-base text-amber-400 mt-1 block">
                  {selectedAgent.metrics.requestsHandled} ops
                </span>
              </div>
              <div className="p-3 rounded-xl panel-town-standard">
                  <span className="text-[10px] uppercase font-mono-code text-slate-400 block">TAUX HISTORIQUE · DÉMO</span>
                <span className="font-orbitron font-bold text-base text-emerald-400 mt-1 block">
                  {selectedAgent.metrics.successRate} %
                </span>
              </div>
              <div className="p-3 rounded-xl panel-town-standard">
                  <span className="text-[10px] uppercase font-mono-code text-slate-400 block">COMPTEUR HISTORIQUE · DÉMO</span>
                <span className="font-orbitron font-bold text-base text-cyan-400 mt-1 block">
                  {selectedAgent.completedMissionsCount}
                </span>
              </div>
              <div className="p-3 rounded-xl panel-town-standard">
                  <span className="text-[10px] uppercase font-mono-code text-slate-400 block">LATENCE HISTORIQUE · DÉMO</span>
                <span className="font-orbitron font-bold text-base text-purple-400 mt-1 block">
                  {selectedAgent.metrics.avgExecutionTimeMs} ms
                </span>
              </div>
            </div>

            {/* Mission & Functional Description */}
            <div className="p-3.5 rounded-xl panel-town-standard space-y-2">
              <span className="text-[10px] uppercase font-mono-code text-slate-400 block">
                Mission du Profil Préchargé & Rôle Déclaré
              </span>
              <p className="text-xs text-white font-mono-code font-semibold">
                &gt; {selectedAgent.currentMission}
              </p>
              <p className="text-xs text-slate-300 font-inter leading-relaxed">
                {selectedAgent.description}
              </p>
            </div>

            {/* Tools and Security Permissions */}
            <div className="p-3.5 rounded-xl panel-town-standard space-y-2">
              <span className="text-[10px] uppercase font-mono-code text-slate-400 block">
                Outils Déclarés & Permissions du Profil
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedAgent.tools.map((tool) => (
                  <span
                    key={tool}
                    className="badge-town-primary"
                  >
                    ⚡ {tool}
                  </span>
                ))}
                {selectedAgent.permissions.map((perm) => (
                  <span
                    key={perm}
                    className="badge-town-secondary"
                  >
                    <Lock className="w-2.5 h-2.5 text-slate-400" />
                    {perm}
                  </span>
                ))}
              </div>
            </div>

            {/* Mission Dispatch Console */}
            <form onSubmit={handleSendMission} className="p-3.5 rounded-xl panel-town-standard space-y-2">
              <span className="text-[10px] uppercase font-mono-code text-slate-400 block">
                Demander une Proposition à l’Agent IA
              </span>
              <div className={`rounded-lg border px-3 py-2 text-[11px] font-mono-code ${runtimeStatus?.available && selectedAgent.type !== 'TYPE_B_SERVICE' ? 'border-emerald-800 bg-emerald-950/30 text-emerald-300' : 'border-amber-800 bg-amber-950/20 text-amber-300'}`}>
                {missionRuntimeMessage}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMissionText}
                  onChange={(e) => setNewMissionText(e.target.value)}
                  maxLength={2000}
                  disabled={isSubmittingMission}
                  placeholder={`Décrire une demande pour ${selectedAgent.name}...`}
                  className="flex-1 bg-[#0A0F1E] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 font-inter focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  disabled={!newMissionText.trim() || isSubmittingMission || selectedAgent.type === 'TYPE_B_SERVICE' || !runtimeStatus?.available}
                  className="btn-town-primary text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmittingMission ? 'Analyse…' : 'Demander'}
                </button>
              </div>
              {missionError && (
                <div role="alert" className="text-xs font-mono-code text-rose-300 pt-1">
                  {missionError}
                </div>
              )}
              {selectedAgentProposals.length > 0 && (
                <section aria-label="Historique des propositions de cette session" className="rounded-xl border border-cyan-900/70 bg-cyan-950/10 p-3 space-y-2">
                  <header className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-[10px] font-mono-code text-cyan-200">
                        PROPOSITIONS DE CETTE SESSION · {selectedAgentProposals.length}/{MAX_SESSION_PROPOSALS_PER_AGENT}
                      </h3>
                      <p className="text-[9px] text-slate-500">En mémoire jusqu’à la fermeture de cette page.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProposalHistoryByAgent(current => {
                        const next = { ...current };
                        delete next[selectedAgent.id];
                        return next;
                      })}
                      className="text-[10px] font-mono-code text-slate-400 hover:text-white underline underline-offset-2"
                    >
                      Effacer pour cet agent
                    </button>
                  </header>
                  <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                    {selectedAgentProposals.map(({ mission, proposal }, index) => (
                      <details
                        key={proposal.requestId}
                        open={index === 0}
                        className="rounded-lg border border-slate-800 bg-[#0A0F1E]/80 p-2"
                      >
                        <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 text-[10px] font-mono-code text-cyan-200">
                          <span>{proposal.agentName} · {proposal.model}</span>
                          <span>{new Date(proposal.createdAt).toLocaleString('fr-FR')} · {proposal.durationMs} ms</span>
                        </summary>
                        <p className="mt-2 text-[10px] text-slate-400">Mission : {mission}</p>
                        <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-100">{proposal.output}</p>
                        <p className="mt-2 text-[10px] font-mono-code text-amber-300">
                          Proposition à valider. Aucune action externe n’a été exécutée.
                        </p>
                      </details>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 font-mono-code">
            <span>CATALOGUE DE 94 PROFILS PRÉCHARGÉS</span>
            <span className="text-amber-300">MÉTRIQUES DU PROFIL · DÉMO</span>
          </div>
        </div>
      </div>
    </div>
  );
};
