/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IA TOWN V3.0 & CCC.CONNECT HUB — Registre des 94 Agents & Superviseur d'Assignation
 */

import React, { useEffect, useState } from 'react';
import { AGENT_REGISTRY } from '../data/agentRegistry';
import { AgentRecord, AgentRoleType } from '../types/town';
import {
  createAgentTask,
  enqueueAgentTask,
  getAgentVisualState,
  recoverInterruptedAgentTasks,
  type AgentTask,
} from '../logic/agentTaskEngine';
import { readAgentTaskStore, saveAgentTasks } from '../logic/agentTaskStorage';
import {
  Bot,
  Search,
  ShieldCheck,
  Cpu,
  Terminal,
  Radio,
  SlidersHorizontal,
  Activity,
  Zap,
  Clock,
  DollarSign,
  CheckCircle2,
  XCircle,
  PauseCircle,
  Wrench,
  Send,
  Building2,
  Lock,
  Layers,
  Sparkles,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

export const AgentDirectoryView: React.FC = () => {
  const [agents, setAgents] = useState<AgentRecord[]>(AGENT_REGISTRY);
  const [initialTaskStore] = useState(() => readAgentTaskStore());
  const [agentTasks, setAgentTasks] = useState<AgentTask[]>(() => recoverInterruptedAgentTasks(initialTaskStore.tasks));
  const [taskStorageAvailable, setTaskStorageAvailable] = useState(initialTaskStore.writable);
  const [taskStorageWarning, setTaskStorageWarning] = useState<string | null>(initialTaskStore.warning ?? null);
  const [filterType, setFilterType] = useState<'ALL' | AgentRoleType | 'CCC_BRIDGES'>('ALL');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [inspectedAgentId, setInspectedAgentId] = useState<string | null>(null);
  const [newMissionInput, setNewMissionInput] = useState('');
  const [missionFeedback, setMissionFeedback] = useState<string | null>(null);

  const inspectedAgent = agents.find(a => a.id === inspectedAgentId) || null;

  useEffect(() => {
    if (!taskStorageAvailable) return;
    if (!saveAgentTasks(agentTasks)) {
      setTaskStorageAvailable(false);
      setTaskStorageWarning('Écriture impossible; l’historique existant est conservé.');
    }
  }, [agentTasks, taskStorageAvailable]);

  const inspectedAgentVisualState = inspectedAgent
    ? getAgentVisualState(agentTasks, inspectedAgent.id)
    : 'INACTIVE';

  // Filter logic
  const filteredAgents = agents.filter(agent => {
    if (filterType === 'CCC_BRIDGES') {
      if (agent.numericId < 85 || agent.numericId > 94) return false;
    } else if (filterType !== 'ALL') {
      if (agent.type !== filterType) return false;
    }

    if (selectedBuilding !== 'ALL' && agent.buildingName !== selectedBuilding) {
      return false;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = agent.name.toLowerCase().includes(q);
      const matchRole = agent.profession.toLowerCase().includes(q);
      const matchBuilding = agent.buildingName.toLowerCase().includes(q);
      const matchTools = agent.tools.some(t => t.toLowerCase().includes(q));
      const matchId = agent.id.includes(q) || String(agent.numericId).includes(q);
      return matchName || matchRole || matchBuilding || matchTools || matchId;
    }

    return true;
  });

  // Assign mission handler
  const handleAssignMission = () => {
    if (!inspectedAgent || !newMissionInput.trim()) return;
    try {
      const task = createAgentTask(inspectedAgent, newMissionInput, { priority: 'NORMAL' });
      const nextTasks = enqueueAgentTask(agentTasks, task);
      if (!saveAgentTasks(nextTasks)) {
        setTaskStorageAvailable(false);
        const errorMessage = 'Le stockage local est indisponible; la mission n’a pas été ajoutée.';
        setTaskStorageWarning(errorMessage);
        throw new Error(errorMessage);
      }
      setAgentTasks(nextTasks);
      setMissionFeedback(`Mission enregistrée en file pour ${inspectedAgent.name}; elle n’a pas été exécutée.`);
      setNewMissionInput('');
    } catch (error) {
      setMissionFeedback(error instanceof Error ? error.message : 'La mission n’a pas pu être enregistrée.');
    }
    setTimeout(() => setMissionFeedback(null), 5000);
  };

  // Status toggle handler
  const handleToggleStatus = (newStatus: AgentRecord['status']) => {
    if (!inspectedAgent) return;

    const updatedAgents = agents.map(a => {
      if (a.id === inspectedAgent.id) {
        return {
          ...a,
          status: newStatus,
          history: [
            {
              timestamp: new Date().toISOString(),
              action: `Changement de statut opérateur vers ${newStatus}`,
              result: 'Matrice de disponibilité mise à jour',
            },
            ...a.history,
          ],
        };
      }
      return a;
    });

    setAgents(updatedAgents);
  };

  // Distinct buildings for filter dropdown
  const uniqueBuildings = Array.from(new Set(agents.map(a => a.buildingName))).sort();

  const getTypeBadge = (type: AgentRoleType) => {
    switch (type) {
      case 'TYPE_A_IA':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono-code px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
            <Sparkles className="w-3 h-3 text-purple-400" />
            TYPE A (IA / Raisonnement)
          </span>
        );
      case 'TYPE_B_SERVICE':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono-code px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
            <Cpu className="w-3 h-3 text-emerald-400" />
            TYPE B (Service Déterministe)
          </span>
        );
      case 'TYPE_C_HYBRID':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono-code px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
            <Zap className="w-3 h-3 text-amber-400" />
            TYPE C (Hybride IA + Règle)
          </span>
        );
    }
  };

  const getStatusBadge = (status: AgentRecord['status']) => {
    switch (status) {
      case 'ACTIF':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono-code px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            ACTIF
          </span>
        );
      case 'EN_MISSION':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono-code px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 animate-pulse">
            <Activity className="w-3 h-3 text-cyan-400" />
            EN MISSION
          </span>
        );
      case 'EN_ATTENTE':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono-code px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
            <PauseCircle className="w-3 h-3 text-amber-400" />
            STANDBY
          </span>
        );
      case 'PAUSE':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono-code px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            PAUSE
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono-code px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800">
            <Wrench className="w-3 h-3 text-rose-400" />
            MAINTENANCE
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              REGISTRE OFFICIEL V5.0 — 94 AGENTS IA & SERVICES
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-emerald-400 font-mono-code flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              16 Bâtiments Couverts · 100% Opérationnels
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 font-cyber">
            ANNUAIRE EXHAUSTIF DES 94 RÔLES D'AGENTS & PASSERELLES
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Chaque agent dispose d'une stricte ségrégation : Type A (Modèles IA), Type B (Services Déterministes TypeScript), et Type C (Hybrides). Rôles #85 à #94 dédiés aux ponts Codex Collection Connect.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Building filter */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
            <Building2 className="w-4 h-4 text-slate-500" />
            <select
              value={selectedBuilding}
              onChange={e => setSelectedBuilding(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none font-mono-code cursor-pointer"
            >
              <option value="ALL">Tous les 16 Bâtiments</option>
              {uniqueBuildings.map(b => (
                <option key={b} value={b} className="bg-slate-900 text-slate-200">
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Nom, rôle, outil, #ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono-code w-64"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-mono-code">
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filterType === 'ALL'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800/60'
          }`}
        >
          Tous les agents (94)
        </button>
        <button
          onClick={() => setFilterType('TYPE_A_IA')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            filterType === 'TYPE_A_IA'
              ? 'bg-purple-950 text-purple-300 border border-purple-700 shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Type A : IA & Raisonnement (18)</span>
        </button>
        <button
          onClick={() => setFilterType('TYPE_B_SERVICE')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            filterType === 'TYPE_B_SERVICE'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800/60'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>Type B : Services Déterministes (58)</span>
        </button>
        <button
          onClick={() => setFilterType('TYPE_C_HYBRID')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            filterType === 'TYPE_C_HYBRID'
              ? 'bg-amber-950 text-amber-300 border border-amber-700 shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800/60'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Type C : Hybrides (18)</span>
        </button>
        <button
          onClick={() => setFilterType('CCC_BRIDGES')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            filterType === 'CCC_BRIDGES'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-500 shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800/60'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
          <span>Passerelles CCC (#85 à #94)</span>
        </button>
      </div>

      {/* Counter summary */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono-code px-1">
        <span>Affichage : {filteredAgents.length} / 94 agents trouvés</span>
        <span>Tri par ID ascendant</span>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgents.map(agent => {
          const isCCC = agent.numericId >= 85 && agent.numericId <= 94;

          return (
            <div
              key={agent.id}
              onClick={() => setInspectedAgentId(agent.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer group flex flex-col justify-between ${
                isCCC
                  ? 'bg-slate-900/90 border-cyan-500/40 hover:border-cyan-400 shadow-md shadow-cyan-500/5 hover:bg-slate-900'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs font-mono-code border shadow-sm"
                      style={{
                        backgroundColor: `${agent.avatarColor}15`,
                        borderColor: `${agent.avatarColor}40`,
                        color: agent.avatarColor,
                      }}
                    >
                      {agent.id}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-100 font-cyber group-hover:text-cyan-300 transition-colors">
                        {agent.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono-code">
                        <Building2 className="w-3 h-3 text-slate-500" />
                        <span>{agent.buildingName}</span>
                      </div>
                    </div>
                  </div>

                  <div>{getStatusBadge(agent.status)}</div>
                </div>

                {/* Profession / Role */}
                <p className="text-xs text-slate-300 font-medium leading-snug mt-1 mb-2">
                  {agent.profession}
                </p>

                {/* Type badge */}
                <div className="mb-3">{getTypeBadge(agent.type)}</div>

                {/* Current mission */}
                <div className="bg-slate-950/80 rounded-lg p-2.5 border border-slate-800/80 mb-3 text-[11px]">
                  <span className="text-[10px] text-slate-500 font-mono-code block mb-0.5">
                    MISSION ACTUELLE :
                  </span>
                  <p className="text-slate-300 line-clamp-2 leading-relaxed">
                    {agent.currentMission}
                  </p>
                </div>

                {/* Tools snippet */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {agent.tools.slice(0, 3).map((tool, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] font-mono-code px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/60"
                    >
                      {tool}
                    </span>
                  ))}
                  {agent.tools.length > 3 && (
                    <span className="text-[9px] font-mono-code px-1.5 py-0.5 rounded bg-slate-800/40 text-slate-500">
                      +{agent.tools.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Telemetry Bar */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono-code text-slate-400">
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-cyan-400" />
                  {agent.metrics.requestsHandled.toLocaleString()} ops
                </span>
                <span className="flex items-center gap-1 text-slate-400 group-hover:text-cyan-400 transition-colors">
                  Dossier complet <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* AGENT DOSSIER INSPECTOR MODAL */}
      {/* ============================================================ */}
      {inspectedAgent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-start justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base font-mono-code border shadow-lg"
                  style={{
                    backgroundColor: `${inspectedAgent.avatarColor}20`,
                    borderColor: `${inspectedAgent.avatarColor}60`,
                    color: inspectedAgent.avatarColor,
                  }}
                >
                  {inspectedAgent.id}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono-code text-slate-400">
                      AGENT #{inspectedAgent.id}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs text-slate-300 font-mono-code flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                      {inspectedAgent.buildingName}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-100 font-cyber">
                    {inspectedAgent.name}
                  </h2>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">
                    {inspectedAgent.profession}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInspectedAgentId(null)}
                className="text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5 overflow-y-auto flex-1 text-xs">
              {/* Type and Status Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono-code block mb-1">
                    TYPOLOGIE FONCTIONNELLE
                  </span>
                  {getTypeBadge(inspectedAgent.type)}
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-mono-code block mb-1">
                    STATUT OPÉRATIONNEL
                  </span>
                  {getStatusBadge(inspectedAgent.status)}
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-mono-code block mb-1">
                    ACTIONS STATUT
                  </span>
                  <div className="flex items-center gap-1 font-mono-code text-[10px]">
                    <button
                      onClick={() => handleToggleStatus('ACTIF')}
                      className={`px-2 py-1 rounded transition-colors ${
                        inspectedAgent.status === 'ACTIF'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Actif
                    </button>
                    <button
                      onClick={() => handleToggleStatus('PAUSE')}
                      className={`px-2 py-1 rounded transition-colors ${
                        inspectedAgent.status === 'PAUSE'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Pause
                    </button>
                    <button
                      onClick={() => handleToggleStatus('MAINTENANCE')}
                      className={`px-2 py-1 rounded transition-colors ${
                        inspectedAgent.status === 'MAINTENANCE'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Maint.
                    </button>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <span className="text-[10px] text-slate-500 font-mono-code block mb-1 uppercase">
                  Description & Spécification
                </span>
                <p className="text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                  {inspectedAgent.description}
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 font-mono-code">
                  <span className="text-[10px] text-slate-500 block mb-0.5">OPS EXÉCUTÉES</span>
                  <span className="text-sm font-bold text-slate-200">
                    {inspectedAgent.metrics.requestsHandled.toLocaleString()}
                  </span>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 font-mono-code">
                  <span className="text-[10px] text-slate-500 block mb-0.5">TAUX SUCCÈS</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {inspectedAgent.metrics.successRate}%
                  </span>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 font-mono-code">
                  <span className="text-[10px] text-slate-500 block mb-0.5">COÛT CUMULÉ</span>
                  <span className="text-sm font-bold text-amber-400">
                    {inspectedAgent.metrics.totalCostEur.toFixed(2)} €
                  </span>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 font-mono-code">
                  <span className="text-[10px] text-slate-500 block mb-0.5">LATENCE MOY.</span>
                  <span className="text-sm font-bold text-cyan-400">
                    {inspectedAgent.metrics.avgExecutionTimeMs} ms
                  </span>
                </div>
              </div>

              {/* Tools & Permissions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono-code block mb-1 uppercase flex items-center gap-1">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    Outils Assignés ({inspectedAgent.tools.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-950/40 rounded-xl border border-slate-800/80 min-h-[60px]">
                    {inspectedAgent.tools.map((tool, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/60"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-mono-code block mb-1 uppercase flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    Permissions Accordées ({inspectedAgent.permissions.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-950/40 rounded-xl border border-slate-800/80 min-h-[60px]">
                    {inspectedAgent.permissions.map((perm, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60"
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Assign New Mission Interactive Box */}
              <div className="bg-slate-950 p-4 rounded-xl border border-cyan-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-cyan-300 font-mono-code flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-cyan-400" />
                    CONFIER UNE NOUVELLE MISSION
                  </span>
                  {missionFeedback && (
                    <span className="text-[11px] text-amber-300 font-mono-code animate-in fade-in">
                      {missionFeedback}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono-code text-slate-400">
                  <span>
                    État de mission : {inspectedAgentVisualState === 'QUEUED' ? 'EN FILE' : inspectedAgentVisualState === 'WORKING' ? 'TRAVAIL' : inspectedAgentVisualState === 'WAITING_REVIEW' ? 'À RELIRE' : inspectedAgentVisualState === 'ERROR' ? 'ERREUR' : 'INACTIF'}
                  </span>
                  <span>{agentTasks.filter(task => task.status === 'QUEUED').length} mission(s) en attente · {agentTasks.length}/200 enregistrées</span>
                </div>
                <p className="text-[10px] leading-relaxed text-slate-500">
                  Cette commande enregistre une mission dans le navigateur. Elle ne démarre pas l’agent et ne confirme pas qu’un travail a été effectué.
                </p>
                {!taskStorageAvailable && (
                  <p role="alert" className="text-[10px] text-rose-300">
                    {taskStorageWarning ?? 'La sauvegarde locale est indisponible; une nouvelle mission ne peut pas être conservée.'}
                  </p>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMissionInput}
                    onChange={e => setNewMissionInput(e.target.value)}
                    maxLength={2000}
                    placeholder={`Ex: Optimiser le cache, générer le build, vérifier les transactions...`}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono-code"
                  />
                  <button
                    onClick={handleAssignMission}
                    disabled={!newMissionInput.trim() || !taskStorageAvailable || agentTasks.length >= 200}
                    className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 text-white font-bold px-4 py-2 rounded-lg transition-colors font-mono-code flex items-center gap-1.5"
                  >
                    <span>Mettre en file</span>
                  </button>
                </div>
              </div>

              {/* History / Audit Log */}
              <div>
                <span className="text-[10px] text-slate-500 font-mono-code block mb-1 uppercase flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Journal d’Audit Récent ({inspectedAgent.history.length})
                </span>
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {inspectedAgent.history.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 font-mono-code text-[11px]"
                    >
                      <div className="flex items-center justify-between text-slate-400 mb-0.5">
                        <span className="text-cyan-400 font-semibold">{item.action}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[10px]">{item.result}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs font-mono-code">
              <span className="text-slate-400">
                Agent enregistré au registre officiel Codex Collection Connect
              </span>
              <button
                onClick={() => setInspectedAgentId(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
              >
                Fermer Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
