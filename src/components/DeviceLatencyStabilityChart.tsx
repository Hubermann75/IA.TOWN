/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * CCC.CONNECT HUB — Device Latency & Connection Stability Visualization
 * Interactive D3 Bar Chart with Real-time Telemetry, Thresholds & Cyberpunk HUD Styling
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { CCCDevice, DevicePlatform } from '../types/town';
import { 
  gradeDeviceConnection, 
  getFleetTelemetryStats, 
  simulateProbePing 
} from '../logic/deviceTelemetry';
import { 
  Activity, 
  Radio, 
  Zap, 
  ShieldCheck, 
  RotateCw, 
  BarChart2, 
  ArrowUpDown, 
  Sparkles, 
  Layers, 
  Wifi,
  Smartphone,
  Monitor,
  Watch,
  Tv,
  Tablet,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface Props {
  devices: CCCDevice[];
  onUpdateDevices?: (updated: CCCDevice[]) => void;
  className?: string;
}

type ChartMetricMode = 'DUAL' | 'LATENCY_ONLY' | 'STABILITY_ONLY';
type SortMode = 'DEFAULT' | 'LATENCY_ASC' | 'STABILITY_DESC';

export const DeviceLatencyStabilityChart: React.FC<Props> = ({
  devices: initialDevices,
  onUpdateDevices,
  className = '',
}) => {
  const [metricMode, setMetricMode] = useState<ChartMetricMode>('DUAL');
  const [sortMode, setSortMode] = useState<SortMode>('DEFAULT');
  const [isAutoProbing, setIsAutoProbing] = useState<boolean>(true);
  const [isProbingNow, setIsProbingNow] = useState<boolean>(false);
  const [localDevices, setLocalDevices] = useState<CCCDevice[]>(initialDevices);
  const [hoveredData, setHoveredData] = useState<{
    device: CCCDevice;
    x: number;
    y: number;
    metricType: 'latency' | 'stability';
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Sync with prop when parent updates
  useEffect(() => {
    if (initialDevices && initialDevices.length > 0) {
      setLocalDevices(initialDevices);
    }
  }, [initialDevices]);

  // Periodic auto-ping probe if enabled
  useEffect(() => {
    if (!isAutoProbing) return;

    const interval = setInterval(() => {
      setLocalDevices(prev => {
        const probed = simulateProbePing(prev);
        if (onUpdateDevices) {
          onUpdateDevices(probed);
        }
        return probed;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [isAutoProbing, onUpdateDevices]);

  // Manual Ping Probe Sweep
  const handleTriggerProbe = () => {
    setIsProbingNow(true);
    setTimeout(() => {
      setLocalDevices(prev => {
        const probed = simulateProbePing(prev);
        if (onUpdateDevices) {
          onUpdateDevices(probed);
        }
        return probed;
      });
      setIsProbingNow(false);
    }, 600);
  };

  // Sort devices based on active sortMode
  const sortedDevices = useMemo(() => {
    const list = [...localDevices];
    if (sortMode === 'LATENCY_ASC') {
      return list.sort((a, b) => (a.latencyMs ?? 999) - (b.latencyMs ?? 999));
    }
    if (sortMode === 'STABILITY_DESC') {
      return list.sort((a, b) => (b.stabilityScore ?? 0) - (a.stabilityScore ?? 0));
    }
    return list;
  }, [localDevices, sortMode]);

  // Aggregate stats
  const stats = useMemo(() => getFleetTelemetryStats(localDevices), [localDevices]);

  // D3 Chart rendering
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || sortedDevices.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const containerWidth = containerRef.current.clientWidth || 700;
    const height = 340;
    const margin = { top: 35, right: 55, bottom: 65, left: 55 };
    const width = containerWidth - margin.left - margin.right;

    svg.attr('width', containerWidth).attr('height', height);

    // Defs for gradients & filters
    const defs = svg.append('defs');

    // Glow filter
    const filter = defs.append('filter')
      .attr('id', 'neon-glow')
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '140%')
      .attr('height', '140%');
    filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'blur');
    filter.append('feMerge')
      .selectAll('feMergeNode')
      .data(['blur', 'SourceGraphic'])
      .enter()
      .append('feMergeNode')
      .attr('in', d => d);

    // Gradients
    const latencyGradient = defs.append('linearGradient')
      .attr('id', 'lat-grad')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    latencyGradient.append('stop').attr('offset', '0%').attr('stop-color', '#00f3ff').attr('stop-opacity', 0.95);
    latencyGradient.append('stop').attr('offset', '100%').attr('stop-color', '#0284c7').attr('stop-opacity', 0.45);

    const stabilityGradient = defs.append('linearGradient')
      .attr('id', 'stab-grad')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    stabilityGradient.append('stop').attr('offset', '0%').attr('stop-color', '#10b981').attr('stop-opacity', 0.95);
    stabilityGradient.append('stop').attr('offset', '100%').attr('stop-color', '#047857').attr('stop-opacity', 0.45);

    const mainG = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X0 Scale (Devices)
    const x0 = d3.scaleBand()
      .domain(sortedDevices.map(d => d.name))
      .rangeRound([0, width])
      .paddingInner(0.28)
      .paddingOuter(0.15);

    // X1 Scale (Metrics within each device band)
    const metrics: ('latency' | 'stability')[] = 
      metricMode === 'DUAL' 
        ? ['latency', 'stability'] 
        : metricMode === 'LATENCY_ONLY' 
          ? ['latency'] 
          : ['stability'];

    const x1 = d3.scaleBand<'latency' | 'stability'>()
      .domain(metrics)
      .rangeRound([0, x0.bandwidth()])
      .padding(0.12);

    // Y Scales
    const maxLat = d3.max(sortedDevices, d => d.latencyMs ?? 20) || 60;
    const yLatency = d3.scaleLinear()
      .domain([0, Math.max(60, Math.ceil(maxLat * 1.25))])
      .nice()
      .range([height - margin.top - margin.bottom, 0]);

    const yStability = d3.scaleLinear()
      .domain([0, 100])
      .range([height - margin.top - margin.bottom, 0]);

    const chartHeight = height - margin.top - margin.bottom;

    // Horizontal Grid Lines (based on latency or stability)
    const yGridScale = metricMode === 'STABILITY_ONLY' ? yStability : yLatency;
    mainG.append('g')
      .attr('class', 'grid')
      .call(
        d3.axisLeft(yGridScale)
          .ticks(5)
          .tickSize(-width)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', '#1e293b')
      .attr('stroke-dasharray', '2,3')
      .attr('stroke-opacity', 0.7);

    mainG.select('.grid .domain').remove();

    // Reference Threshold Lines
    if (metricMode !== 'STABILITY_ONLY') {
      const slaLatencyY = yLatency(30);
      if (slaLatencyY >= 0 && slaLatencyY <= chartHeight) {
        const thresholdG = mainG.append('g').attr('class', 'sla-latency-threshold');
        thresholdG.append('line')
          .attr('x1', 0)
          .attr('x2', width)
          .attr('y1', slaLatencyY)
          .attr('y2', slaLatencyY)
          .attr('stroke', '#f59e0b')
          .attr('stroke-dasharray', '4,4')
          .attr('stroke-width', 1.2)
          .attr('stroke-opacity', 0.7);

        thresholdG.append('text')
          .attr('x', width - 6)
          .attr('y', slaLatencyY - 4)
          .attr('text-anchor', 'end')
          .attr('fill', '#f59e0b')
          .attr('font-size', '9px')
          .attr('font-family', 'ui-monospace, monospace')
          .text('Objectif SLA: <30 ms');
      }
    }

    if (metricMode !== 'LATENCY_ONLY') {
      const slaStabilityY = yStability(95);
      if (slaStabilityY >= 0 && slaStabilityY <= chartHeight) {
        const thresholdStabG = mainG.append('g').attr('class', 'sla-stability-threshold');
        thresholdStabG.append('line')
          .attr('x1', 0)
          .attr('x2', width)
          .attr('y1', slaStabilityY)
          .attr('y2', slaStabilityY)
          .attr('stroke', '#10b981')
          .attr('stroke-dasharray', '4,4')
          .attr('stroke-width', 1.2)
          .attr('stroke-opacity', 0.7);

        thresholdStabG.append('text')
          .attr('x', 6)
          .attr('y', slaStabilityY - 4)
          .attr('text-anchor', 'start')
          .attr('fill', '#10b981')
          .attr('font-size', '9px')
          .attr('font-family', 'ui-monospace, monospace')
          .text('Stabilité Cible: >95%');
      }
    }

    // Device Groups (X0)
    const deviceGroups = mainG.selectAll('.device-group')
      .data(sortedDevices)
      .enter()
      .append('g')
      .attr('class', 'device-group')
      .attr('transform', d => `translate(${x0(d.name) || 0},0)`);

    // Latency Bars
    if (metrics.includes('latency')) {
      const latX = x1('latency') || 0;
      const barW = x1.bandwidth();

      deviceGroups.append('rect')
        .attr('class', 'latency-bar cursor-pointer')
        .attr('x', latX)
        .attr('y', chartHeight)
        .attr('width', barW)
        .attr('height', 0)
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('fill', d => {
          const lat = d.latencyMs ?? 20;
          if (lat < 15) return 'url(#lat-grad)';
          if (lat < 40) return '#00f3ff';
          if (lat < 80) return '#f59e0b';
          return '#ef4444';
        })
        .attr('stroke', d => (d.latencyMs ?? 20) < 15 ? '#38bdf8' : '#00f3ff')
        .attr('stroke-width', 1)
        .attr('stroke-opacity', 0.8)
        .on('mouseenter', (event, d) => {
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            setHoveredData({
              device: d,
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
              metricType: 'latency',
            });
          }
        })
        .on('mousemove', (event, d) => {
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            setHoveredData({
              device: d,
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
              metricType: 'latency',
            });
          }
        })
        .on('mouseleave', () => setHoveredData(null))
        .transition()
        .duration(650)
        .ease(d3.easeCubicOut)
        .attr('y', d => yLatency(d.latencyMs ?? 0))
        .attr('height', d => Math.max(3, chartHeight - yLatency(d.latencyMs ?? 0)));

      // Value label on top of latency bar
      deviceGroups.append('text')
        .attr('class', 'latency-val-label')
        .attr('x', latX + barW / 2)
        .attr('y', d => Math.max(12, yLatency(d.latencyMs ?? 0) - 5))
        .attr('text-anchor', 'middle')
        .attr('fill', '#38bdf8')
        .attr('font-size', '9px')
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-weight', '600')
        .attr('opacity', 0)
        .text(d => `${d.latencyMs ?? 0}ms`)
        .transition()
        .delay(350)
        .duration(300)
        .attr('opacity', 1);
    }

    // Stability Bars
    if (metrics.includes('stability')) {
      const stabX = x1('stability') || 0;
      const barW = x1.bandwidth();

      deviceGroups.append('rect')
        .attr('class', 'stability-bar cursor-pointer')
        .attr('x', stabX)
        .attr('y', chartHeight)
        .attr('width', barW)
        .attr('height', 0)
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('fill', d => {
          const stab = d.stabilityScore ?? 95;
          if (stab >= 98) return 'url(#stab-grad)';
          if (stab >= 90) return '#10b981';
          if (stab >= 80) return '#f59e0b';
          return '#ef4444';
        })
        .attr('stroke', d => (d.stabilityScore ?? 95) >= 95 ? '#34d399' : '#10b981')
        .attr('stroke-width', 1)
        .attr('stroke-opacity', 0.8)
        .on('mouseenter', (event, d) => {
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            setHoveredData({
              device: d,
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
              metricType: 'stability',
            });
          }
        })
        .on('mousemove', (event, d) => {
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            setHoveredData({
              device: d,
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
              metricType: 'stability',
            });
          }
        })
        .on('mouseleave', () => setHoveredData(null))
        .transition()
        .duration(650)
        .ease(d3.easeCubicOut)
        .attr('y', d => yStability(d.stabilityScore ?? 0))
        .attr('height', d => Math.max(3, chartHeight - yStability(d.stabilityScore ?? 0)));

      // Value label on top of stability bar
      deviceGroups.append('text')
        .attr('class', 'stability-val-label')
        .attr('x', stabX + barW / 2)
        .attr('y', d => Math.max(12, yStability(d.stabilityScore ?? 0) - 5))
        .attr('text-anchor', 'middle')
        .attr('fill', '#34d399')
        .attr('font-size', '9px')
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-weight', '600')
        .attr('opacity', 0)
        .text(d => `${d.stabilityScore ?? 0}%`)
        .transition()
        .delay(350)
        .duration(300)
        .attr('opacity', 1);
    }

    // X Axis (Device Names & Short Labels)
    const xAxis = d3.axisBottom(x0)
      .tickFormat(d => {
        // Shorten long device names for tidy responsive labels
        if (d.includes('Windows')) return 'Win 11 Master';
        if (d.includes('Pixel')) return 'Pixel 9 Pro';
        if (d.includes('Galaxy Tab')) return 'Tab S9';
        if (d.includes('Watch')) return 'Watch 6';
        if (d.includes('Bravia') || d.includes('TV')) return 'Bravia 4K';
        return d.length > 12 ? d.slice(0, 10) + '…' : d;
      });

    const xAxisG = mainG.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis);

    xAxisG.selectAll('text')
      .attr('fill', '#cbd5e1')
      .attr('font-size', '10px')
      .attr('font-family', 'ui-monospace, monospace')
      .attr('font-weight', '500')
      .attr('dy', '1.1em');

    xAxisG.select('.domain').attr('stroke', '#334155');
    xAxisG.selectAll('line').attr('stroke', '#334155');

    // Left Y Axis (Latency in ms)
    if (metricMode !== 'STABILITY_ONLY') {
      const yAxisLeft = d3.axisLeft(yLatency)
        .ticks(5)
        .tickFormat(d => `${d}ms`);

      const yAxisLeftG = mainG.append('g')
        .attr('class', 'y-axis-left')
        .call(yAxisLeft);

      yAxisLeftG.selectAll('text')
        .attr('fill', '#38bdf8')
        .attr('font-size', '9px')
        .attr('font-family', 'ui-monospace, monospace');

      yAxisLeftG.select('.domain').attr('stroke', '#1e293b');
      yAxisLeftG.selectAll('line').attr('stroke', '#334155');

      // Axis label
      mainG.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -38)
        .attr('x', -chartHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#38bdf8')
        .attr('font-size', '10px')
        .attr('font-family', 'ui-monospace, monospace')
        .text('← Latence (ms)');
    }

    // Right Y Axis (Stability in %)
    if (metricMode !== 'LATENCY_ONLY') {
      const yAxisRight = d3.axisRight(yStability)
        .ticks(5)
        .tickFormat(d => `${d}%`);

      const yAxisRightG = mainG.append('g')
        .attr('class', 'y-axis-right')
        .attr('transform', `translate(${width}, 0)`)
        .call(yAxisRight);

      yAxisRightG.selectAll('text')
        .attr('fill', '#34d399')
        .attr('font-size', '9px')
        .attr('font-family', 'ui-monospace, monospace');

      yAxisRightG.select('.domain').attr('stroke', '#1e293b');
      yAxisRightG.selectAll('line').attr('stroke', '#334155');

      // Axis label
      mainG.append('text')
        .attr('transform', 'rotate(90)')
        .attr('y', -width - 42)
        .attr('x', chartHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#34d399')
        .attr('font-size', '10px')
        .attr('font-family', 'ui-monospace, monospace')
        .text('Stabilité (%) →');
    }

  }, [sortedDevices, metricMode]);

  // Platform icon helper
  const renderPlatformIcon = (platform: DevicePlatform) => {
    switch (platform) {
      case 'WINDOWS': return <Monitor className="w-4 h-4 text-sky-400" />;
      case 'ANDROID_PHONE': return <Smartphone className="w-4 h-4 text-emerald-400" />;
      case 'ANDROID_TABLET': return <Tablet className="w-4 h-4 text-teal-400" />;
      case 'WEAR_OS': return <Watch className="w-4 h-4 text-purple-400" />;
      case 'GOOGLE_TV': return <Tv className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className={`bg-slate-950/90 border border-cyan-800/40 rounded-2xl p-5 shadow-2xl relative overflow-hidden backdrop-blur-md ${className}`}>
      {/* Background Cyber Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-40 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header & Telemetry Badges */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-md shadow-cyan-500/20">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                D3 TELEMETRY ENGINE
              </span>
              <span className="text-[10px] font-mono-code text-slate-400 flex items-center gap-1">
                <Radio className={`w-3 h-3 ${isAutoProbing ? 'text-emerald-400 animate-spin' : 'text-slate-500'}`} />
                {isAutoProbing ? 'Sonde temps réel active' : 'Sonde manuelle'}
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-100 font-cyber tracking-wide uppercase mt-0.5">
              LATENCE & STABILITÉ DE CONNEXION DE LA FLOTTE
            </h3>
          </div>
        </div>

        {/* Action Controls & Metric Mode Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px] font-mono-code">
            <button
              onClick={() => setMetricMode('DUAL')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                metricMode === 'DUAL'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Jumelé
            </button>
            <button
              onClick={() => setMetricMode('LATENCY_ONLY')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                metricMode === 'LATENCY_ONLY'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Latence (ms)
            </button>
            <button
              onClick={() => setMetricMode('STABILITY_ONLY')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                metricMode === 'STABILITY_ONLY'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Stabilité (%)
            </button>
          </div>

          {/* Sort Selector */}
          <button
            onClick={() => {
              if (sortMode === 'DEFAULT') setSortMode('LATENCY_ASC');
              else if (sortMode === 'LATENCY_ASC') setSortMode('STABILITY_DESC');
              else setSortMode('DEFAULT');
            }}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono-code text-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Changer l'ordre de tri"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {sortMode === 'DEFAULT' && 'Tri: Défaut'}
              {sortMode === 'LATENCY_ASC' && 'Tri: Ping ↑'}
              {sortMode === 'STABILITY_DESC' && 'Tri: Stabilité ↓'}
            </span>
          </button>

          {/* Manual Ping Sweep Trigger */}
          <button
            onClick={handleTriggerProbe}
            disabled={isProbingNow}
            className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/80 text-xs font-mono-code text-cyan-300 flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isProbingNow ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{isProbingNow ? 'Sondage...' : 'Sonder Flotte'}</span>
          </button>

          {/* Auto Probe Toggle */}
          <button
            onClick={() => setIsAutoProbing(!isAutoProbing)}
            className={`px-2 py-1.5 rounded-lg border text-xs font-mono-code flex items-center gap-1 cursor-pointer transition-colors ${
              isAutoProbing
                ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title="Activer/Désactiver le sondage automatique"
          >
            <Zap className="w-3 h-3" />
            <span>{isAutoProbing ? 'Auto ON' : 'Auto OFF'}</span>
          </button>
        </div>
      </div>

      {/* Fleet KPI Quick Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 my-4 font-mono-code">
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
          <span className="text-[10px] text-slate-500 block">Flotte Analysée</span>
          <span className="text-sm font-bold text-slate-200 flex items-center gap-1">
            <Wifi className="w-3.5 h-3.5 text-cyan-400" />
            {stats.onlineDevices} / {stats.totalDevices} Nœuds
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
          <span className="text-[10px] text-slate-500 block">Latence Moyenne</span>
          <span className={`text-sm font-bold flex items-center gap-1 ${
            stats.avgLatencyMs < 30 ? 'text-emerald-400' : stats.avgLatencyMs < 60 ? 'text-cyan-400' : 'text-amber-400'
          }`}>
            <Activity className="w-3.5 h-3.5" />
            {stats.avgLatencyMs} ms
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
          <span className="text-[10px] text-slate-500 block">Stabilité Globale</span>
          <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            {stats.avgStabilityScore}%
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
          <span className="text-[10px] text-slate-500 block">Conformité SLA (&lt;50ms)</span>
          <span className="text-sm font-bold text-sky-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {stats.slaCompliancePercent}%
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
          <span className="text-[10px] text-slate-500 block">Qualité Flotte</span>
          <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            {stats.healthyCount} Optimal / {stats.degradedCount} Deg
          </span>
        </div>
      </div>

      {/* D3 SVG Container */}
      <div ref={containerRef} className="relative w-full overflow-x-auto">
        <svg ref={svgRef} className="w-full select-none" />

        {/* Floating Custom HUD Tooltip */}
        {hoveredData && (
          <div
            className="absolute pointer-events-none z-30 transform -translate-x-1/2 -translate-y-full mb-3 px-3.5 py-2.5 rounded-xl bg-slate-950/95 border border-cyan-400 shadow-2xl backdrop-blur-md font-mono-code text-xs min-w-[210px]"
            style={{
              left: `${hoveredData.x}px`,
              top: `${hoveredData.y}px`,
            }}
          >
            <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-800 mb-1.5">
              <div className="flex items-center gap-1.5">
                {renderPlatformIcon(hoveredData.device.platform)}
                <span className="font-bold text-slate-100 truncate max-w-[120px]">
                  {hoveredData.device.name}
                </span>
              </div>
              {(() => {
                const grade = gradeDeviceConnection(
                  hoveredData.device.latencyMs ?? 20,
                  hoveredData.device.stabilityScore ?? 95
                );
                return (
                  <span
                    className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                    style={{
                      color: grade.color,
                      backgroundColor: grade.bgColor,
                      border: `1px solid ${grade.borderColor}`,
                    }}
                  >
                    Grade {grade.grade}
                  </span>
                );
              })()}
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>Latence Ping :</span>
                <span className="text-cyan-400 font-bold">{hoveredData.device.latencyMs ?? 0} ms</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Stabilité Signal :</span>
                <span className="text-emerald-400 font-bold">{hoveredData.device.stabilityScore ?? 0} %</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Gigue (Jitter) :</span>
                <span className="text-slate-200">{hoveredData.device.jitterMs ?? 0.4} ms</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Perte de Paquets :</span>
                <span className="text-slate-200">{hoveredData.device.packetLoss ?? 0}%</span>
              </div>
              <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-900">
                <span>Agent Passerelle :</span>
                <span className="text-indigo-300 truncate max-w-[110px]">{hoveredData.device.bridgeAgent}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Adresse IP :</span>
                <span className="text-slate-300">{hoveredData.device.ipAddress}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend & SLA Indicators Footer */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono-code text-slate-400">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-gradient-to-t from-cyan-600 to-cyan-400 border border-cyan-300" />
            <span>Latence (ms, plus bas = meilleur)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-gradient-to-t from-emerald-600 to-emerald-400 border border-emerald-300" />
            <span>Stabilité (%, plus haut = meilleur)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 border-t border-dashed border-amber-400" />
            <span>SLA 30ms</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 border-t border-dashed border-emerald-400" />
            <span>Cible 95%</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span>Cadence mDNS / WebSockets · 100% Hors-ligne / Local</span>
        </div>
      </div>
    </div>
  );
};
