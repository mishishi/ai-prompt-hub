import { create } from 'zustand';
import type { Template, Platform } from '../types';

interface AppState {
  selectedTemplate: Template | null;
  platform: Platform;
  variableValues: Record<string, string | boolean | string[]>;
  setSelectedTemplate: (t: Template | null) => void;
  setPlatform: (p: Platform) => void;
  setVariableValue: (name: string, value: string | boolean | string[]) => void;
  resetVariables: (vars: Template['variables']) => void;
}

export const useStore = create<AppState>((set) => ({
  selectedTemplate: null,
  platform: 'codex-cli',
  variableValues: {},
  setSelectedTemplate: (t) => set({ selectedTemplate: t }),
  setPlatform: (p) => set({ platform: p }),
  setVariableValue: (name, value) =>
    set((s) => ({ variableValues: { ...s.variableValues, [name]: value } })),
  resetVariables: (vars) => {
    const defaults: Record<string, string | boolean | string[]> = {};
    vars.forEach((v) => {
      if (v.default !== undefined) defaults[v.name] = v.default;
    });
    set({ variableValues: defaults });
  },
}));
