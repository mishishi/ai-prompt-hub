import { useState, useCallback, useMemo } from 'react';

export interface GenHistoryEntry {
  id: string;
  intent: string;
  result: string;
  timestamp: number;
}

const HISTORY_KEY = 'promptbench-gen-history';
const MAX_ENTRIES = 20;

function loadHistory(): GenHistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveHistory(entries: GenHistoryEntry[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
}

export function useGenerationHistory() {
  const [entries, setEntries] = useState<GenHistoryEntry[]>(() => loadHistory());

  const addEntry = useCallback((intent: string, result: string) => {
    const entry: GenHistoryEntry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      intent: intent.trim().slice(0, 100),
      result,
      timestamp: Date.now(),
    };
    setEntries(prev => {
      const next = [entry, ...prev].slice(0, MAX_ENTRIES);
      saveHistory(next);
      return next;
    });
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries(prev => {
      const next = prev.filter(e => e.id !== id);
      saveHistory(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    saveHistory([]);
    setEntries([]);
  }, []);

  const latest = useMemo(() => entries[0] || null, [entries]);

  return { entries, addEntry, removeEntry, clearAll, latest };
}