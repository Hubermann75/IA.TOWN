/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IA TOWN — Persistence & State Management Layer
 */

import { 
  ActivityItem, 
  BankLedger, 
  CostGuardConfig, 
  CCCDevice, 
  CommercialCycleTrack, 
  StructuredAgentEvent 
} from '../types/town';

export interface PersistentTownState {
  version: string;
  savedAt: string;
  companyRunning: boolean;
  miningRunning: boolean;
  activities: ActivityItem[];
  bankLedger: BankLedger;
  costGuard: CostGuardConfig;
  devices: CCCDevice[];
  commercialTracks: CommercialCycleTrack[];
  agentEvents: StructuredAgentEvent[];
}

const STORAGE_KEY = 'IA_TOWN_V3_STATE';

/**
 * Serializes and saves state to localStorage
 */
export function saveTownState(state: Omit<PersistentTownState, 'version' | 'savedAt'>): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const payload: PersistentTownState = {
      ...state,
      version: '3.0.0',
      savedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.warn('Failed to save IA TOWN state to localStorage:', err);
    return false;
  }
}

/**
 * Loads state from localStorage
 */
export function loadTownState(): PersistentTownState | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistentTownState;
    if (!parsed || !parsed.version || !parsed.bankLedger) return null;
    return parsed;
  } catch (err) {
    console.warn('Failed to parse IA TOWN state from localStorage:', err);
    return null;
  }
}

/**
 * Clears local storage state
 */
export function clearTownState(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    window.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

/**
 * Exports state to a formatted JSON string for backup/download
 */
export function exportTownStateJSON(state: Omit<PersistentTownState, 'version' | 'savedAt'>): string {
  const payload: PersistentTownState = {
    ...state,
    version: '3.0.0',
    savedAt: new Date().toISOString(),
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Validates and imports a JSON string
 */
export function validateAndImportTownStateJSON(jsonStr: string): { success: boolean; state?: PersistentTownState; error?: string } {
  try {
    const parsed = JSON.parse(jsonStr) as PersistentTownState;
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'Format JSON invalide.' };
    }
    if (!Array.isArray(parsed.activities)) {
      return { success: false, error: 'Propriété activities manquante ou invalide.' };
    }
    if (!parsed.bankLedger || typeof parsed.bankLedger.revenusEncaisses !== 'number') {
      return { success: false, error: 'Registre Bank.IA invalide.' };
    }
    return { success: true, state: parsed };
  } catch {
    return { success: false, error: 'Erreur de syntaxe JSON lors du parsing.' };
  }
}
