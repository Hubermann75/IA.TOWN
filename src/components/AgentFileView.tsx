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
import type { AgentRuntimeStatus } from '../logic/agentRuntimeClient';
import {
  claimNextAgentTask,
  createAgentTask,
  cancelQueuedAgentTask,
  enqueueAgentTask,
  failAgentTask,
  getAgentVisualState,
  recordAgentDeterministicResult,
  recordAgentProposal,
  recoverInterruptedAgentTasks,
  reviewAgentResult,
  retryFailedAgentTask,
  selectNextRunnableAgentTask,
  type AgentTask,
  type AgentTaskPriority,
} from '../logic/agentTaskEngine';
import { readAgentTaskStore, saveAgentTasks } from '../logic/agentTaskStorage';
import { executeRegisteredAgentTool, getAgentExecutionMode, getAgentTools } from '../logic/agentToolRegistry';
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

const MAX_VISIBLE_AGENT_TASKS = 5;
const TASK_STATUS_LABELS: Record<AgentTask['status'], string> = {
  QUEUED: 'EN FILE',
  RUNNING: 'EN COURS',
  WAITING_REVIEW: 'À RELIRE',
  REVIEWED: 'RELUE',
  DISMISSED: 'ÉCARTÉE',
  FAILED: 'ÉCHEC',
  CANCELLED: 'ANNULÉE',
};

export const AgentFileView: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [selectedAgentId, setSelectedAgentId] = useState<string>(AGENT_REGISTRY[0].id);
  const [newMissionText, setNewMissionText] = useState('');
  const [taskPriority, setTaskPriority] = useState<AgentTaskPriority>('NORMAL');
  const [runtimeStatus, setRuntimeStatus] = useState<AgentRuntimeStatus | null>(null);
  const [runtimeCheckFailed, setRuntimeCheckFailed] = useState(false);
  const [initialTaskStore] = useState(() => readAgentTaskStore());
  const [agentTasks, setAgentTasks] = useState<AgentTask[]>(() => recoverInterruptedAgentTasks(initialTaskStore.tasks));
  const [taskStorageAvailable, setTaskStorageAvailable] = useState(initialTaskStore.writable);
  const [taskStorageWarning, setTaskStorageWarning] = useState<string | null>(initialTaskStore.warning ?? null);
  const [missionError, setMissionError] = useState<string | null>(null);
  const [isSubmittingMission, setIsSubmittingMission] = useState(false);
  const missionRequestVersion = useRef(0);

  useEffect(() => {
    if (!taskStorageAvailable) return;
    if (!saveAgentTasks(agentTasks)) {
      setTaskStorageAvailable(false);
      setTaskStorageWarning('Écriture impossible; l’historique existant est conservé et aucune mission ne sera ajoutée.');
    }
  }, [agentTasks, taskStorageAvailable]);

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
  }, [selectedAgentId]);

  const selectedAgent: AgentRecord = AGENT_REGISTRY.find(a => a.id === selectedAgentId) || AGENT_REGISTRY[0];
  const selectedAgentTasks = agentTasks
    .filter(task => task.agentId === selectedAgentId)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, MAX_VISIBLE_AGENT_TASKS);
  const selectedAgentVisualState = getAgentVisualState(agentTasks, selectedAgentId);
  const queuedProposalTaskCount = agentTasks.filter(task => task.status === 'QUEUED' && task.executionMode === 'PROPOSAL_ONLY').length;
  const queuedDeterministicTaskCount = agentTasks.filter(task => task.status === 'QUEUED' && task.executionMode === 'DETERMINISTIC').length;
  const queuedUnavailableTaskCount = agentTasks.filter(task => task.status === 'QUEUED' && task.executionMode === 'UNAVAILABLE').length;
  const nextRunnableTask = selectNextRunnableAgentTask(agentTasks, runtimeStatus?.available === true);
  const selectedAgentExecutionMode = getAgentExecutionMode(selectedAgent);
  const selectedAgentTools = getAgentTools(selectedAgent);

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

  const handleQueueMission = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const mission = newMissionText.trim();
    if (!mission || isSubmittingMission || !taskStorageAvailable || agentTasks.length >= 200) return;
    setMissionError(null);
    try {
      const createdTask = createAgentTask(selectedAgent, mission, { priority: taskPriority });
      const queuedTasks = enqueueAgentTask(agentTasks, createdTask);
      if (!saveAgentTasks(queuedTasks)) throw new Error('Le stockage local n’a pas accepté la mission.');
      setAgentTasks(queuedTasks);
      setNewMissionText('');
      soundEngine.playSuccess();
    } catch (error) {
      if (error instanceof Error && error.message.includes('stockage')) {
        setTaskStorageAvailable(false);
        setTaskStorageWarning(error.message);
      }
      setMissionError(error instanceof Error ? error.message : 'La mission n’a pas pu être enregistrée.');
      soundEngine.playAlert();
    }
  };

  const handleRunNextTask = async () => {
    if (isSubmittingMission || !nextRunnableTask) return;
    const requestVersion = ++missionRequestVersion.current;
    setIsSubmittingMission(true);
    setMissionError(null);

    let runningTask: AgentTask | undefined;
    try {
      const claim = claimNextAgentTask(agentTasks, new Date().toISOString(), runtimeStatus?.available === true);
      if (!claim.claimedTask) throw new Error('Aucune mission en file ne dispose actuellement d’un exécuteur disponible.');
      runningTask = claim.claimedTask;
      if (!saveAgentTasks(claim.tasks)) {
        setTaskStorageAvailable(false);
        setTaskStorageWarning('Écriture impossible; la mission a été bloquée avant son exécution.');
        throw new Error('Impossible de sauvegarder l’état avant l’exécution.');
      }
      setAgentTasks(claim.tasks);

      const canonicalAgent = AGENT_REGISTRY.find(agent => agent.id === runningTask?.agentId);
      if (!canonicalAgent || getAgentExecutionMode(canonicalAgent) !== runningTask.executionMode) {
        throw new Error('Le profil enregistré ne correspond plus au registre d’exécution; mission bloquée.');
      }

      const completedTask = runningTask.executionMode === 'DETERMINISTIC'
        ? recordAgentDeterministicResult(
          runningTask,
          executeRegisteredAgentTool(
            canonicalAgent,
            runningTask.connectedTools[0] ?? '',
            runningTask.id,
            runningTask.mission,
          ),
        )
        : recordAgentProposal(runningTask, await requestAgentProposal(runningTask.agentId, runningTask.mission));
      setAgentTasks(current => current.map(task =>
        task.id === completedTask.id && task.status === 'RUNNING' ? completedTask : task,
      ));
      if (missionRequestVersion.current === requestVersion) soundEngine.playSuccess();
    } catch (error) {
      if (runningTask) {
        const failedTask = failAgentTask(
          runningTask,
          error instanceof Error ? error.message : 'La demande IA a échoué.',
        );
        setAgentTasks(current => current.map(task =>
          task.id === failedTask.id && task.status === 'RUNNING' ? failedTask : task,
        ));
      }
      if (missionRequestVersion.current === requestVersion) {
        setMissionError(error instanceof Error ? error.message : 'La mission a échoué. Aucune action externe n’a été lancée.');
        soundEngine.playAlert();
      }
    } finally {
      setIsSubmittingMission(false);
    }
  };

  const handleReviewTaskResult = (taskId: string, decision: 'REVIEWED' | 'DISMISSED') => {
    setAgentTasks(current => current.map(task => {
      if (task.id !== taskId) return task;
      try {
        return reviewAgentResult(task, decision);
      } catch {
        return task;
      }
    }));
  };

  const handleRetryTask = (taskId: string) => {
    setAgentTasks(current => current.map(task => {
      if (task.id !== taskId) return task;
      try {
        return retryFailedAgentTask(task);
      } catch {
        return task;
      }
    }));
  };

  const handleCancelTask = (taskId: string) => {
    setAgentTasks(current => current.map(task => {
      if (task.id !== taskId) return task;
      try {
        return cancelQueuedAgentTask(task);
      } catch {
        return task;
      }
    }));
  };

  const missionRuntimeMessage = selectedAgent.type === 'TYPE_B_SERVICE'
    ? selectedAgentExecutionMode === 'DETERMINISTIC'
      ? 'Calculateur local disponible. Utilisez le JSON indiqué; le résultat reste une projection et ne modifie aucun registre financier.'
      : 'Aucun exécuteur déterministe n’est branché. Vous pouvez conserver la mission en file; elle ne sera pas exécutée.'
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
            <form onSubmit={handleQueueMission} className="p-3.5 rounded-xl panel-town-standard space-y-2">
              <span className="text-[10px] uppercase font-mono-code text-slate-400 block">
                Créer une mission
              </span>
              <div className="flex items-center justify-between gap-2 text-[10px] font-mono-code">
                <span className="text-slate-400">État d’exécution enregistré</span>
                <span className={selectedAgentVisualState === 'ERROR' ? 'text-rose-300' : selectedAgentVisualState === 'WAITING_REVIEW' ? 'text-amber-300' : selectedAgentVisualState === 'WORKING' ? 'text-cyan-300' : 'text-slate-300'}>
                  {selectedAgentVisualState === 'INACTIVE' ? 'INACTIF' : selectedAgentVisualState === 'QUEUED' ? 'EN FILE' : selectedAgentVisualState === 'WORKING' ? 'TRAVAIL' : selectedAgentVisualState === 'WAITING_REVIEW' ? 'ATTENTE DE REVUE' : 'ERREUR'}
                </span>
              </div>
              <div className={`rounded-lg border px-3 py-2 text-[11px] font-mono-code ${runtimeStatus?.available && selectedAgent.type !== 'TYPE_B_SERVICE' ? 'border-emerald-800 bg-emerald-950/30 text-emerald-300' : 'border-amber-800 bg-amber-950/20 text-amber-300'}`}>
                {missionRuntimeMessage}
              </div>
              <div className="flex gap-2">
                <textarea
                  rows={selectedAgentExecutionMode === 'DETERMINISTIC' ? 4 : 2}
                  value={newMissionText}
                  onChange={(e) => setNewMissionText(e.target.value)}
                  maxLength={2000}
                  disabled={isSubmittingMission}
                  placeholder={selectedAgentExecutionMode === 'DETERMINISTIC'
                    ? '{"unitPriceEur":29,"variableCostPerUnitEur":4.75,"fixedCostsEur":100,"plannedUnits":10}'
                    : `Décrire une mission pour ${selectedAgent.name}...`}
                  className="flex-1 resize-y bg-[#0A0F1E] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 font-inter focus:outline-none focus:border-cyan-400"
                />
                <select
                  aria-label="Priorité de la mission"
                  value={taskPriority}
                  onChange={event => setTaskPriority(event.target.value as AgentTaskPriority)}
                  className="bg-[#0A0F1E] border border-slate-800 rounded-lg px-2 py-2 text-[10px] text-slate-200 font-mono-code"
                  disabled={isSubmittingMission}
                >
                  <option value="LOW">BASSE</option>
                  <option value="NORMAL">NORMALE</option>
                  <option value="HIGH">HAUTE</option>
                  <option value="URGENT">URGENTE</option>
                </select>
                <button
                  type="submit"
                  disabled={!newMissionText.trim() || isSubmittingMission || !taskStorageAvailable || agentTasks.length >= 200}
                  className="btn-town-primary text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" />
                  Mettre en file
                </button>
              </div>
              {selectedAgentExecutionMode === 'DETERMINISTIC' && selectedAgentTools[0] && (
                <button
                  type="button"
                  onClick={() => setNewMissionText(selectedAgentTools[0].exampleMission)}
                  className="text-[9px] font-mono-code text-cyan-300 underline underline-offset-2"
                >
                  Insérer le modèle JSON · {selectedAgentTools[0].name}
                </button>
              )}
              <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-2 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono-code text-slate-400">
                  <span>{queuedDeterministicTaskCount} exécution(s) locale(s) · {queuedProposalTaskCount} proposition(s) Gemini · {queuedUnavailableTaskCount} sans exécuteur</span>
                  <span>{runtimeStatus?.available ? 'Coût Gemini non mesuré' : 'Gemini indisponible'}</span>
                </div>
                <button
                  type="button"
                  onClick={handleRunNextTask}
                  disabled={!nextRunnableTask || isSubmittingMission || !taskStorageAvailable}
                  className="w-full rounded-lg border border-cyan-800 bg-cyan-950/50 px-3 py-2 text-[10px] font-mono-code text-cyan-200 hover:bg-cyan-900/50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isSubmittingMission
                    ? 'Mission en cours…'
                    : nextRunnableTask?.executionMode === 'DETERMINISTIC'
                      ? `Exécuter la prochaine mission locale (${queuedDeterministicTaskCount})`
                      : `Demander la prochaine proposition Gemini (${queuedProposalTaskCount})`}
                </button>
                {queuedProposalTaskCount > 0 && !runtimeStatus?.available && (
                  <p className="text-[9px] text-amber-300">Les missions restent en file jusqu’à la disponibilité du fournisseur. L’appel peut être facturé par Google et son coût n’est pas mesuré par IA TOWN.</p>
                )}
                {runtimeStatus?.available && queuedProposalTaskCount > 0 && (
                  <p className="text-[9px] text-amber-300">Le lancement envoie la mission à Gemini et peut entraîner un coût sur la clé configurée. IA TOWN ne mesure pas encore ce coût.</p>
                )}
              </div>
              {missionError && (
                <div role="alert" className="text-xs font-mono-code text-rose-300 pt-1">
                  {missionError}
                </div>
              )}
              <section aria-label="Historique persistant des missions" className="rounded-xl border border-cyan-900/70 bg-cyan-950/10 p-3 space-y-2">
                <header className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-[10px] font-mono-code text-cyan-200">
                      MISSIONS DE CET AGENT · {selectedAgentTasks.length}/{MAX_VISIBLE_AGENT_TASKS} AFFICHÉES
                    </h3>
                    <p className="text-[9px] text-slate-500">Historique local au navigateur. N’y saisissez aucune clé ni aucun mot de passe.</p>
                  </div>
                  <span className="text-[9px] font-mono-code text-slate-400">{agentTasks.length}/{200} missions conservées</span>
                </header>
                {!taskStorageAvailable && (
                  <p role="alert" className="text-[10px] text-rose-300">
                    {taskStorageWarning ?? 'Le stockage local est en lecture seule; l’historique existant n’a pas été remplacé.'}
                  </p>
                )}
                {selectedAgentTasks.length === 0 ? (
                  <p className="text-[10px] text-slate-500">Aucune mission enregistrée pour ce profil.</p>
                ) : (
                  <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                    {selectedAgentTasks.map(task => (
                      <details
                        key={task.id}
                        className="rounded-lg border border-slate-800 bg-[#0A0F1E]/80 p-2"
                      >
                        <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 text-[10px] font-mono-code text-cyan-200">
                          <span>{task.agentName} · {TASK_STATUS_LABELS[task.status]}</span>
                          <span>{new Date(task.updatedAt).toLocaleString('fr-FR')} · tentative {task.attempts}</span>
                        </summary>
                        <p className="mt-2 text-[10px] text-slate-400">Mission : {task.mission}</p>
                        {task.result?.resultKind === 'PROPOSAL' && (
                          <>
                            <p className="mt-2 text-[9px] text-slate-500">{task.result.model} · {task.result.durationMs} ms</p>
                            <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-100">{task.result.output}</p>
                            <p className="mt-2 text-[10px] font-mono-code text-amber-300">
                              Proposition seulement. Aucune action externe n’a été exécutée.
                            </p>
                          </>
                        )}
                        {task.result?.resultKind === 'DETERMINISTIC_RESULT' && (
                          <>
                            <p className="mt-2 text-[9px] text-slate-500">Outil local : {task.result.toolId} · données de la mission</p>
                            <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-100">{task.result.output}</p>
                            <p className="mt-2 text-[10px] font-mono-code text-amber-300">
                              Résultat local issu des données fournies. Aucune recherche web, publication, dépense, vente ni écriture bancaire n’a été exécutée.
                            </p>
                          </>
                        )}
                        {task.error && <p className="mt-2 text-[10px] text-rose-300">{task.error}</p>}
                        {task.status === 'WAITING_REVIEW' && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            <button type="button" onClick={() => handleReviewTaskResult(task.id, 'REVIEWED')} className="text-[10px] font-mono-code text-emerald-300 underline underline-offset-2">
                              Marquer le résultat comme relu
                            </button>
                            <button type="button" onClick={() => handleReviewTaskResult(task.id, 'DISMISSED')} className="text-[10px] font-mono-code text-slate-400 underline underline-offset-2">
                              Écarter le résultat
                            </button>
                          </div>
                        )}
                        {(task.status === 'QUEUED' || task.status === 'FAILED') && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {task.status === 'QUEUED' && (
                              <button type="button" onClick={() => handleCancelTask(task.id)} className="text-[10px] font-mono-code text-slate-400 underline underline-offset-2">
                                Annuler la mission en attente
                              </button>
                            )}
                            {task.status === 'FAILED' && (
                              <button type="button" onClick={() => handleRetryTask(task.id)} className="text-[10px] font-mono-code text-cyan-300 underline underline-offset-2">
                                Remettre en file
                              </button>
                            )}
                          </div>
                        )}
                      </details>
                    ))}
                  </div>
                )}
              </section>
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
