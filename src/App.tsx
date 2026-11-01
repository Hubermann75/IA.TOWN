/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IA TOWN — REVENUE ENGINE V3.0 & CCC.CONNECT HUB
 * Master Controller & Navigation Shell with Official Cyberpunk Skin
 * Supports 4 Display Modes (Image 3) & 4 Visual Themes
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  BuildingType, 
  BuildingInfo,
  ActivityItem, 
  CommercialCycleTrack, 
  CostGuardConfig, 
  CCCDevice, 
  RemoteCommand, 
  DevicePlatform,
  BankLedger,
  StructuredAgentEvent
} from './types/town';
import { 
  INITIAL_BUILDINGS, 
  INITIAL_ACTIVITIES, 
  INITIAL_BANK_LEDGER, 
  INITIAL_COST_GUARD, 
  INITIAL_COMMERCIAL_TRACKS, 
  INITIAL_CCC_DEVICES, 
  CCC_APPS, 
  HUB_FLOORS 
} from './data/seedData';
import { consolidateBankLedger, evaluateCostGuard } from './logic/revenueEngine';
import { processRemoteCommand } from './logic/cccConnect';
import { executeSimulationTick } from './logic/simulationTick';
import { soundEngine } from './utils/soundEngine';
import { 
  saveTownState, 
  loadTownState, 
  clearTownState, 
  exportTownStateJSON, 
  validateAndImportTownStateJSON 
} from './logic/persistence';

// Themed Views
import { TopStatusBar, DisplayMode, AppTheme } from './components/TopStatusBar';
import { BottomHudBar } from './components/BottomHudBar';
import { TownPanoramaView } from './components/TownPanoramaView';
import { BuildingCutawayView } from './components/BuildingCutawayView';
import { CentmineShelterView } from './components/CentmineShelterView';
import { AgentFileView } from './components/AgentFileView';
import { RobotAvatar } from './components/RobotAvatar';

// Sub-Workspaces & Modals
import { CCCConnectHubView } from './components/CCCConnectHubView';
import { RevenueControlDashboard } from './components/RevenueControlDashboard';
import { ActivityPortfolioView } from './components/ActivityPortfolioView';
import { BankAndCostGuardView } from './components/BankAndCostGuardView';
import { QRPairingAndRemoteView } from './components/QRPairingAndRemoteView';
import { PhasesExecutionRoadmap } from './components/PhasesExecutionRoadmap';
import { WindowsAndroidSyncView } from './components/WindowsAndroidSyncView';
import { CommercialCycleSimulator } from './components/CommercialCycleSimulator';
import { CCCDeviceEmulators } from './components/CCCDeviceEmulators';
import { EventBusStream } from './components/EventBusStream';
import { FactoryMarketWorkspace } from './components/FactoryMarketWorkspace';
import { ComplianceValidationSuite } from './components/ComplianceValidationSuite';
import { BuildingInspectorModal } from './components/BuildingInspectorModal';
import { PWAOfflineIndicator } from './components/PWAOfflineIndicator';
import { ZoomPanCanvas } from './components/ZoomPanCanvas';
import { BetaAuditorAndReleaseModal } from './components/BetaAuditorAndReleaseModal';

import { 
  Globe, 
  Building2, 
  Layers, 
  Bot, 
  Coins, 
  Gem, 
  Package, 
  ShieldCheck, 
  Cpu, 
  Flame, 
  Radio, 
  Tv, 
  Server, 
  Boxes, 
  Scale, 
  Repeat, 
  FlaskConical, 
  Network,
  Compass,
  FileText,
  BarChart3,
  Settings,
  X,
  Sparkles
} from 'lucide-react';

export default function App() {
  // 4 Display Modes (Image 3)
  const [displayMode, setDisplayMode] = useState<DisplayMode>('VUE_VILLE');
  
  // 4 Themes (Image 3)
  const [activeTheme, setActiveTheme] = useState<AppTheme>('CYBERPUNK_NUIT');

  // Sub-modal or full-screen tools
  const [activeSubModal, setActiveSubModal] = useState<string | null>(null);
  const [showBetaModal, setShowBetaModal] = useState<boolean>(false);
  const [zenMode, setZenMode] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Selected entities
  const [selectedBuildingId, setSelectedBuildingId] = useState<BuildingType | null>('AI_GENCY');
  const [inspectingBuilding, setInspectingBuilding] = useState<BuildingInfo | null>(null);
  const [qrTargetPlatform, setQrTargetPlatform] = useState<DevicePlatform>('ANDROID_PHONE');

  // Operational State
  const [companyRunning, setCompanyRunning] = useState<boolean>(true);
  const [miningRunning, setMiningRunning] = useState<boolean>(true);
  const [simulationPaused, setSimulationPaused] = useState<boolean>(false);
  const [autoMode, setAutoMode] = useState<boolean>(true);

  // Entities Data State
  const [buildings] = useState(INITIAL_BUILDINGS);
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);
  const [commercialTracks, setCommercialTracks] = useState<CommercialCycleTrack[]>(INITIAL_COMMERCIAL_TRACKS);
  const [bankLedger, setBankLedger] = useState<BankLedger>(INITIAL_BANK_LEDGER);
  const [costGuard, setCostGuard] = useState<CostGuardConfig>(INITIAL_COST_GUARD);
  const [devices, setDevices] = useState<CCCDevice[]>(INITIAL_CCC_DEVICES);
  const [recentCommands, setRecentCommands] = useState<RemoteCommand[]>([]);

  // Apply Theme class to document body
  useEffect(() => {
    document.body.classList.remove('theme-cyberpunk', 'theme-jour-neon', 'theme-sombre-pro', 'theme-retro-futur');
    if (activeTheme === 'JOUR_NEON') document.body.classList.add('theme-jour-neon');
    else if (activeTheme === 'SOMBRE_PRO') document.body.classList.add('theme-sombre-pro');
    else if (activeTheme === 'RETRO_FUTUR') document.body.classList.add('theme-retro-futur');
    else document.body.classList.add('theme-cyberpunk');
  }, [activeTheme]);

  // Load saved state from localStorage on first mount
  useEffect(() => {
    const saved = loadTownState();
    if (saved) {
      if (typeof saved.companyRunning === 'boolean') setCompanyRunning(saved.companyRunning);
      if (typeof saved.miningRunning === 'boolean') setMiningRunning(saved.miningRunning);
      if (Array.isArray(saved.activities) && saved.activities.length > 0) setActivities(saved.activities);
      if (saved.bankLedger) setBankLedger(saved.bankLedger);
      if (saved.costGuard) setCostGuard(saved.costGuard);
      if (Array.isArray(saved.devices) && saved.devices.length > 0) setDevices(saved.devices);
      if (Array.isArray(saved.commercialTracks) && saved.commercialTracks.length > 0) setCommercialTracks(saved.commercialTracks);
    }
  }, []);

  // Auto-save changes to localStorage
  useEffect(() => {
    saveTownState({
      companyRunning,
      miningRunning,
      activities,
      bankLedger,
      costGuard,
      devices,
      commercialTracks,
      agentEvents: [],
    });
  }, [companyRunning, miningRunning, activities, bankLedger, costGuard, devices, commercialTracks]);

  // Global Keyboard Shortcuts (1-4 views, Space start/pause, M mute, Escape close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (e.key === '1') {
        setDisplayMode('VUE_VILLE');
        setActiveSubModal(null);
        soundEngine.playTick();
      } else if (e.key === '2') {
        setDisplayMode('VUE_BATIMENT');
        setActiveSubModal(null);
        soundEngine.playTick();
      } else if (e.key === '3') {
        setDisplayMode('VUE_ETAGE');
        setActiveSubModal(null);
        soundEngine.playTick();
      } else if (e.key === '4') {
        setDisplayMode('VUE_AGENT');
        setActiveSubModal(null);
        soundEngine.playTick();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setCompanyRunning(prev => {
          const next = !prev;
          if (next) soundEngine.playSuccess();
          else soundEngine.playAlert();
          return next;
        });
      } else if (e.key === 'm' || e.key === 'M') {
        const isMuted = soundEngine.toggleMute();
        if (!isMuted) soundEngine.playCashChime();
      } else if (e.key === 'Escape') {
        if (inspectingBuilding) {
          setInspectingBuilding(null);
        } else if (activeSubModal) {
          setActiveSubModal(null);
        }
        soundEngine.playClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inspectingBuilding, activeSubModal]);

  // Structured events stream
  const [agentEvents, setAgentEvents] = useState<StructuredAgentEvent[]>([
    {
      id: 'evt-init-1',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      emitterAgent: '85. CONNECT.MASTER',
      targetBuilding: 'CCC_CONNECT_HUB',
      eventType: 'DEVICE_HANDSHAKE',
      payload: { platform: 'WINDOWS', device: 'Workstation Studio', status: 'ONLINE', latencyMs: 1.4 },
      status: 'SUCCESS',
    },
    {
      id: 'evt-init-2',
      timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
      emitterAgent: '88. SYNC.MASTER',
      targetBuilding: 'CCC_CONNECT_HUB',
      eventType: 'SYNC_DELTA',
      payload: { devicesSyncCount: 5, conflictsResolved: 0, deltaBytes: 1048 },
      status: 'SUCCESS',
    },
    {
      id: 'evt-init-3',
      timestamp: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
      emitterAgent: '07. VAULT.GUARD',
      targetBuilding: 'BANK_IA',
      eventType: 'BANK_SETTLED',
      payload: { amount: 290.0, method: 'MERCHANT_CHECKOUT', verified: true },
      status: 'SUCCESS',
    },
  ]);

  // Synchronize bank ledger whenever activities update
  useEffect(() => {
    const updated = consolidateBankLedger(activities, bankLedger);
    setBankLedger(updated);

    const { updatedConfig } = evaluateCostGuard(activities, costGuard);
    setCostGuard(updatedConfig);
  }, [activities]);

  // Real-time autonomous simulation pulse (runs every 4s when company is active)
  useEffect(() => {
    if (!companyRunning || simulationPaused) return;

    const timer = setInterval(() => {
      const result = executeSimulationTick(
        activities,
        bankLedger,
        costGuard,
        companyRunning,
        miningRunning
      );

      setActivities(result.updatedActivities);
      setBankLedger(result.updatedBankLedger);
      setCostGuard(result.updatedCostGuard);

      if (result.emittedEvents.length > 0) {
        setAgentEvents(prev => [...result.emittedEvents, ...prev.slice(0, 40)]);
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [activities, bankLedger, costGuard, companyRunning, miningRunning, simulationPaused]);

  // Command dispatcher
  const handleDispatchCommand = (
    commandType: RemoteCommand['commandType'],
    deviceIdOrPlatform?: string | DevicePlatform
  ) => {
    let emittingDevice = devices[0];
    if (typeof deviceIdOrPlatform === 'string') {
      const match = devices.find(
        d => d.id === deviceIdOrPlatform || d.platform === (deviceIdOrPlatform as DevicePlatform)
      );
      if (match) emittingDevice = match;
    }

    const { command, newTownState } = processRemoteCommand(
      emittingDevice,
      commandType,
      {
        companyRunning,
        miningRunning,
        simulationPaused,
      }
    );

    setRecentCommands(prev => [command, ...prev.slice(0, 19)]);
    setCompanyRunning(newTownState.companyRunning);
    setMiningRunning(newTownState.miningRunning);
    setSimulationPaused(newTownState.simulationPaused);

    // Audio feedback
    if (command.executionStatus === 'EXECUTED_SUCCESS') {
      soundEngine.playSuccess();
    } else {
      soundEngine.playAlert();
    }
  };

  const handleUpdateActivity = (updated: ActivityItem) => {
    setActivities(prev => prev.map(a => (a.id === updated.id ? updated : a)));
  };

  const handleCreateActivity = (newAct: ActivityItem) => {
    setActivities(prev => [newAct, ...prev]);
  };

  const handleUpdateTrack = (updated: CommercialCycleTrack) => {
    setCommercialTracks(prev => prev.map(t => (t.id === updated.id ? updated : t)));
  };

  const handleBankCredit = (netAmount: number, grossAmount: number, costsAmount: number) => {
    setBankLedger(prev => ({
      ...prev,
      revenusEncaisses: Number((prev.revenusEncaisses + grossAmount).toFixed(2)),
      depensesReellesTotales: Number((prev.depensesReellesTotales + costsAmount).toFixed(2)),
      resultatNetReel: Number((prev.resultatNetReel + netAmount).toFixed(2)),
      lastAuditTimestamp: new Date().toISOString(),
    }));
  };

  const handleAddDevice = (device: CCCDevice) => {
    setDevices(prev => [device, ...prev]);
  };

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-[#0A0F1E] text-slate-100 select-none">
      {/* 1. Master Top Status Bar & Action Controls (Image 2, 3, 4) */}
      <TopStatusBar
        activeMode={displayMode}
        onSelectMode={(mode) => {
          setDisplayMode(mode);
          setActiveSubModal(null);
        }}
        activeTheme={activeTheme}
        onSelectTheme={setActiveTheme}
        companyRunning={companyRunning}
        miningRunning={miningRunning}
        onToggleCompany={(start) => handleDispatchCommand(start ? 'START_COMPANY' : 'STOP_COMPANY')}
        onToggleMining={(start) => handleDispatchCommand(start ? 'START_MINING' : 'STOP_MINING')}
        onStartAll={() => {
          setCompanyRunning(true);
          setMiningRunning(true);
          setSimulationPaused(false);
          soundEngine.playSuccess();
        }}
        onPauseAll={() => {
          setSimulationPaused(prev => !prev);
          soundEngine.playClick();
        }}
        onStopAll={() => {
          setCompanyRunning(false);
          setMiningRunning(false);
          soundEngine.playAlert();
        }}
        autoMode={autoMode}
        onToggleAutoMode={() => setAutoMode(prev => !prev)}
        onOpenSettings={() => setActiveSubModal('ROADMAP')}
        onOpenPortfolio={() => setActiveSubModal('PORTFOLIO')}
        onOpenHub={() => setActiveSubModal('CCC_HUB')}
        zenMode={zenMode}
        onToggleZenMode={() => setZenMode(prev => !prev)}
        onOpenBetaAuditor={() => setShowBetaModal(true)}
      />

      {/* 2. Main Stage: Left Sidebar Navigation + Active Display View */}
      <div className="flex-1 w-full flex overflow-hidden">
        {/* Left Sidebar Navigation matching Image 2 & 3 */}
        {!zenMode && (
          <div className="w-56 bg-[#111522] border-r border-[#1B1F2A] flex flex-col justify-between shrink-0 overflow-y-auto z-20">
          <div>
            {/* VUE GLOBALE Master Button */}
            <div className="p-3 pb-2 border-b border-[#1B1F2A]">
              <button
                onClick={() => {
                  setDisplayMode('VUE_VILLE');
                  setActiveSubModal(null);
                  soundEngine.playTick();
                }}
                className={`w-full py-2.5 px-3 rounded-xl font-orbitron font-extrabold text-xs tracking-wider transition-all flex items-center justify-center gap-2 ${
                  displayMode === 'VUE_VILLE' && !activeSubModal
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-[#0A0F1E] glow-gold shadow-lg font-black'
                    : 'bg-[#1B1F2A] hover:bg-slate-800 text-amber-300 border border-amber-500/30'
                }`}
              >
                <Globe className="w-4 h-4 fill-current" />
                <span>VUE GLOBALE</span>
              </button>
            </div>

            {/* Buildings Navigation List matching Image 2 & 3 */}
            <div className="px-2 py-2 space-y-0.5">
              <span className="text-[9.5px] font-mono-code uppercase text-slate-500 px-2 block mb-1">
                BÂTIMENTS DE LA VILLE
              </span>
              {[
                { id: 'AI_GENCY' as BuildingType, name: 'AI.GENCY', color: '#3498DB' },
                { id: 'MARKET_IA' as BuildingType, name: 'MARKET.IA', color: '#FF007F' },
                { id: 'FACTORY_IA' as BuildingType, name: 'FACTORY.IA', color: '#FFB800' },
                { id: 'TRAFFIC_IA' as BuildingType, name: 'TRAFFIC.IA', color: '#FF8A3D' },
                { id: 'WEB_ESTATE_IA' as BuildingType, name: 'WEB.ESTATE.IA', color: '#00EDFF' },
                { id: 'MEDIA_IA' as BuildingType, name: 'MEDIA.IA', color: '#E74C3C' },
                { id: 'CONTRACT_IA' as BuildingType, name: 'CONTRACT.IA', color: '#FFB800' },
                { id: 'SUBSCRIPTION_IA' as BuildingType, name: 'SUBSCRIPTION.IA', color: '#8A2BFF' },
                { id: 'PLUGIN_STORE_IA' as BuildingType, name: 'PLUGIN.STORE.IA', color: '#00EDFF' },
                { id: 'RD_IA' as BuildingType, name: 'R&D.IA', color: '#21EC71' },
                { id: 'AI_DEPTH_CENTMINE' as BuildingType, name: 'AI.DEPTH.CENTMINE', color: '#FFB800', isMine: true },
                { id: 'BANK_IA' as BuildingType, name: 'BANK.IA', color: '#FFB800' },
                { id: 'DUMP_INCINERATOR' as BuildingType, name: 'DUMP & INCINERATOR', color: '#21EC71' },
                { id: 'ARE_IA_CENTER' as BuildingType, name: 'ARE.IA.CENTER', color: '#00EDFF' },
                { id: 'OPPORTUNITY_LAB' as BuildingType, name: 'OPPORTUNITY.LAB', color: '#FF8A3D' },
                { id: 'CCC_CONNECT_HUB' as BuildingType, name: 'CCC.CONNECT HUB', color: '#00EDFF', isHub: true },
              ].map((item) => {
                const isSelected = selectedBuildingId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedBuildingId(item.id);
                      soundEngine.playTick();
                      if (item.isMine) {
                        setDisplayMode('VUE_ETAGE');
                        setActiveSubModal(null);
                      } else {
                        setDisplayMode('VUE_BATIMENT');
                        setActiveSubModal(null);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs font-orbitron transition-all ${
                      isSelected && displayMode === 'VUE_BATIMENT'
                        ? 'bg-cyan-500/20 text-cyan-300 border-l-2 border-cyan-400 font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="truncate">{item.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Secondary Modules Navigation */}
            <div className="px-2 py-2 border-t border-[#1B1F2A] space-y-0.5">
              <span className="text-[9.5px] font-mono-code uppercase text-slate-500 px-2 block mb-1">
                MODULES & SERVICES
              </span>
              {[
                { id: 'AGENTS', label: 'AGENTS (94)', icon: Bot, action: () => setDisplayMode('VUE_AGENT') },
                { id: 'PORTFOLIO', label: 'PORTEFEUILLE', icon: Package, action: () => setActiveSubModal('PORTFOLIO') },
                { id: 'COMMERCIAL', label: 'CYCLE COMMERCIAL', icon: Repeat, action: () => setActiveSubModal('COMMERCIAL') },
                { id: 'BANK', label: 'BANQUE & AUDIT', icon: Coins, action: () => setActiveSubModal('BANK') },
                { id: 'CCC_HUB', label: 'CCC.CONNECT HUB', icon: Network, action: () => setActiveSubModal('CCC_HUB') },
                { id: 'ROADMAP', label: 'ROADMAP 9 PHASES', icon: BarChart3, action: () => setActiveSubModal('ROADMAP') },
                { id: 'BETA_AUDITOR', label: 'BETA.AUDITOR IA & .EXE', icon: Sparkles, action: () => setShowBetaModal(true) },
              ].map((sub) => {
                const Icon = sub.icon;
                const isSubActive = activeSubModal === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => {
                      sub.action();
                      soundEngine.playTick();
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-orbitron transition-all ${
                      isSubActive
                        ? 'bg-[#00EDFF]/20 text-[#00EDFF] border border-[#00EDFF]/50'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sub.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cute Robot Profile Avatar Card matching Image 2 */}
          <div className="p-3 border-t border-[#1B1F2A] bg-[#0A0F1E]/90 flex items-center gap-2.5">
            <RobotAvatar role="TECHNICIEN" size="md" glow={true} />
            <div className="leading-tight">
              <span className="font-orbitron font-extrabold text-xs text-white block">
                IA TOWN
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] font-mono-code text-emerald-400">En ligne</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Central Display Workspace */}
        <div className="flex-1 h-full overflow-hidden relative">
          {/* Active Primary View */}
          {!activeSubModal && (
            <>
              {displayMode === 'VUE_VILLE' && (
                <ZoomPanCanvas>
                  <TownPanoramaView
                    buildings={buildings}
                    selectedBuildingId={selectedBuildingId}
                    onSelectBuilding={setSelectedBuildingId}
                    onOpenCutaway={(id) => {
                      if (id) setSelectedBuildingId(id);
                      setDisplayMode('VUE_BATIMENT');
                    }}
                    onOpenShelter={() => setDisplayMode('VUE_ETAGE')}
                    onInspectBuilding={setInspectingBuilding}
                  />
                </ZoomPanCanvas>
              )}

              {displayMode === 'VUE_BATIMENT' && (
                <ZoomPanCanvas>
                  <BuildingCutawayView
                    buildings={buildings}
                    selectedBuildingId={selectedBuildingId}
                    onSelectBuilding={setSelectedBuildingId}
                    onOpenShelter={() => setDisplayMode('VUE_ETAGE')}
                  />
                </ZoomPanCanvas>
              )}

              {displayMode === 'VUE_ETAGE' && (
                <ZoomPanCanvas>
                  <CentmineShelterView
                    miningRunning={miningRunning}
                    onToggleMining={(start) => handleDispatchCommand(start ? 'START_MINING' : 'STOP_MINING')}
                    onOpenTownView={() => setDisplayMode('VUE_VILLE')}
                    onThemeSelect={(t) => {
                      if (t === 'CYBERPUNK') setActiveTheme('CYBERPUNK_NUIT');
                      else if (t === 'NUCLEAR') setActiveTheme('JOUR_NEON');
                      else if (t === 'MINIMAL') setActiveTheme('SOMBRE_PRO');
                      else setActiveTheme('RETRO_FUTUR');
                    }}
                  />
                </ZoomPanCanvas>
              )}

              {displayMode === 'VUE_AGENT' && (
                <AgentFileView />
              )}
            </>
          )}

          {/* Sub-Workspaces (When clicked from left menu or bottom bar) */}
          {activeSubModal && (
            <div className="relative w-full h-full flex flex-col bg-[#0A0F1E] overflow-hidden">
              {/* Modal Top Close Bar */}
              <div className="px-4 py-2 bg-[#111522] border-b border-[#1B1F2A] flex items-center justify-between z-20">
                <span className="font-orbitron font-bold text-xs text-cyan-400">
                  ESPACE DÉDIÉ : {activeSubModal}
                </span>
                <button
                  onClick={() => {
                    setActiveSubModal(null);
                    soundEngine.playClick();
                  }}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-orbitron flex items-center gap-1 text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Fermer vers la Vue</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {activeSubModal === 'CCC_HUB' && (
                  <CCCConnectHubView
                    devices={devices}
                    apps={CCC_APPS}
                    floors={HUB_FLOORS}
                    onOpenQRPairing={(plat) => {
                      if (plat) setQrTargetPlatform(plat);
                      setActiveSubModal('QR_REMOTE');
                    }}
                    onSendCommand={handleDispatchCommand}
                    companyRunning={companyRunning}
                    miningRunning={miningRunning}
                    simulationPaused={simulationPaused}
                    onUpdateDevices={setDevices}
                  />
                )}

                {activeSubModal === 'PORTFOLIO' && (
                  <ActivityPortfolioView
                    activities={activities}
                    commercialTracks={commercialTracks}
                    onUpdateActivity={handleUpdateActivity}
                    onUpdateTrack={handleUpdateTrack}
                    onCreateActivity={handleCreateActivity}
                  />
                )}

                {activeSubModal === 'COMMERCIAL' && (
                  <CommercialCycleSimulator
                    onBankCredit={handleBankCredit}
                    onEmitEvent={(evt) => setAgentEvents(prev => [evt, ...prev.slice(0, 40)])}
                  />
                )}

                {activeSubModal === 'BANK' && (
                  <BankAndCostGuardView
                    bankLedger={bankLedger}
                    costGuard={costGuard}
                    onUpdateCostGuard={setCostGuard}
                  />
                )}

                {activeSubModal === 'ROADMAP' && (
                  <PhasesExecutionRoadmap />
                )}

                {activeSubModal === 'QR_REMOTE' && (
                  <QRPairingAndRemoteView
                    devices={devices}
                    onAddDevice={handleAddDevice}
                    onSendCommand={handleDispatchCommand}
                    recentCommands={recentCommands}
                    companyRunning={companyRunning}
                    miningRunning={miningRunning}
                    simulationPaused={simulationPaused}
                    initialTargetPlatform={qrTargetPlatform}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Bottom HUD Status & Telemetry Bar (Image 2 & 4) */}
      {!zenMode && (
        <BottomHudBar
          onOpenAgents={() => {
            setDisplayMode('VUE_AGENT');
            setActiveSubModal(null);
          }}
          onOpenPortfolio={() => setActiveSubModal('PORTFOLIO')}
          onOpenAlerts={() => setActiveSubModal('BANK')}
          onOpenRoadmap={() => setActiveSubModal('ROADMAP')}
        />
      )}

      {/* Building Inspector Modal */}
      {inspectingBuilding && (
        <BuildingInspectorModal
          building={inspectingBuilding}
          onClose={() => setInspectingBuilding(null)}
          onOpenHubCutaway={() => {
            setInspectingBuilding(null);
            setSelectedBuildingId(inspectingBuilding.id);
            setDisplayMode('VUE_BATIMENT');
          }}
          miningRunning={miningRunning}
          onToggleMining={() => setMiningRunning(prev => !prev)}
        />
      )}

      {/* Agent IA Beta Auditor & Release Packaging Modal (Beta v1.0, .exe Desktop, Google Drive & GitHub) */}
      {showBetaModal && (
        <BetaAuditorAndReleaseModal
          onClose={() => setShowBetaModal(false)}
          activeAgentsCount={94}
        />
      )}

      {/* PWA Offline Connectivity Indicator */}
      <PWAOfflineIndicator />
    </div>
  );
}
