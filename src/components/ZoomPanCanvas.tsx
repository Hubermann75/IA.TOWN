/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IA TOWN — Interactive Zoom & Pan Canvas Container
 * Enables smooth zooming (50% to 250%), panning with mouse drag,
 * mouse wheel zoom, and quick zoom preset buttons without interface clutter.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Move, Maximize } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface Props {
  children: React.ReactNode;
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  className?: string;
  showControls?: boolean;
}

export const ZoomPanCanvas: React.FC<Props> = ({
  children,
  initialZoom = 1,
  minZoom = 0.6,
  maxZoom = 2.5,
  className = '',
  showControls = true,
}) => {
  const [zoom, setZoom] = useState<number>(initialZoom);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => {
    soundEngine.playClick();
    setZoom(prev => Math.min(maxZoom, Number((prev + 0.15).toFixed(2))));
  };

  const handleZoomOut = () => {
    soundEngine.playClick();
    setZoom(prev => Math.max(minZoom, Number((prev - 0.15).toFixed(2))));
  };

  const handleReset = () => {
    soundEngine.playClick();
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(prev => Math.max(minZoom, Math.min(maxZoom, Number((prev + delta).toFixed(2)))));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag with left click if not clicking on an interactive button or input
    if ((e.target as HTMLElement).closest('button, input, select, a, textarea')) {
      return;
    }
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div 
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      className={`relative w-full h-full overflow-hidden select-none cursor-${isDragging ? 'grabbing' : 'default'} ${className}`}
    >
      {/* Zoomable & Pannable Viewport Stage */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.15s ease-out',
        }}
        className="w-full h-full will-change-transform"
      >
        {children}
      </div>

      {/* Sleek Floating Zoom & Pan HUD Toolbar (Minimal, Non-obtrusive) */}
      {showControls && (
        <div className="absolute bottom-4 right-4 z-40 flex items-center gap-1.5 p-1.5 rounded-xl bg-[#0E162E]/90 border border-[#00EDFF]/40 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.6)]">
          <button
            onClick={handleZoomOut}
            title="Dézoomer (-)"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition active:scale-95"
          >
            <ZoomOut className="w-4 h-4 text-cyan-400" />
          </button>

          <span 
            onClick={handleReset}
            title="Cliquer pour réinitialiser à 100%"
            className="px-2 py-0.5 rounded text-[11px] font-mono-code font-bold text-[#00EDFF] hover:bg-cyan-500/10 cursor-pointer min-w-[50px] text-center"
          >
            {Math.round(zoom * 100)}%
          </span>

          <button
            onClick={handleZoomIn}
            title="Zoomer (+)"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition active:scale-95"
          >
            <ZoomIn className="w-4 h-4 text-cyan-400" />
          </button>

          <div className="w-[1px] h-4 bg-slate-700 mx-0.5" />

          <button
            onClick={handleReset}
            title="Recentrer & Réinitialiser la vue"
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
