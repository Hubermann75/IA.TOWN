import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, ShieldAlert } from 'lucide-react';

export const PWAOfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div 
      role="status"
      className="fixed bottom-14 right-4 z-50 flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-[#0E162E]/95 border-2 border-amber-500/80 text-amber-300 font-mono text-xs shadow-[0_0_20px_rgba(245,158,11,0.35)] backdrop-blur-md animate-bounce"
    >
      <div className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
      </div>
      <WifiOff className="w-4 h-4 text-amber-400" />
      <div className="flex flex-col">
        <span className="font-orbitron font-bold text-[11px] text-white">MODE HORS-LIGNE ACTIF</span>
        <span className="text-[10px] text-amber-200/80">Données en cache local — Mises à jour en file d'attente</span>
      </div>
    </div>
  );
};
