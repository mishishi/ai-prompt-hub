import type { Prompt, PromptVersion } from '../types';
import { promptToYaml, yamlToPrompt, renderPrompt } from '../utils/yaml';

const STORE_KEY = 'promptbench-prompts';

export function getAllPrompts(): Prompt[] {
  try { const raw = localStorage.getItem(STORE_KEY); return raw ? JSON.parse(raw) : []; }
  catch { return []; }
}

export function getPrompt(id: string): Prompt | undefined {
  return getAllPrompts().find(p => p.id === id);
}

export function savePrompt(p: Prompt): void {
  const list = getAllPrompts().filter(x => x.id !== p.id);
  list.unshift({ ...p, updatedAt: Date.now() });
  localStorage.setItem(STORE_KEY, JSON.stringify(list));
}

export function deletePrompt(id: string): void {
  const list = getAllPrompts().filter(p => p.id !== id);
  localStorage.setItem(STORE_KEY, JSON.stringify(list));
}

export function createPrompt(overrides: Partial<Prompt> & { meta: Prompt['meta']; system: Prompt['system']; user: string }): Prompt {
  const now = Date.now();
  const prompt: Prompt = {
    id: `p_${now}`,
    yaml: '',
    variables: [],
    source: 'generated',
    createdAt: now,
    updatedAt: now,
    version: 1,
    versions: [],
    ...overrides,
  };
  prompt.yaml = promptToYaml(prompt);
  prompt.versions = [{ version: 1, yaml: prompt.yaml, rendered: renderPrompt(prompt, {}), timestamp: now }];
  savePrompt(prompt);
  return prompt;
}

export function forkLibraryTemplate(libraryPrompt: Prompt & { category?: string[]; difficulty?: string }, forkedFromId: string): Prompt {
  const now = Date.now();
  const prompt: Prompt = {
    id: `p_${now}`,
    yaml: '',
    meta: { ...libraryPrompt.meta },
    variables: libraryPrompt.variables.map(v => ({ ...v })),
    system: { ...libraryPrompt.system, rules: libraryPrompt.system.rules ? [...libraryPrompt.system.rules] : undefined },
    user: libraryPrompt.user,
    output_schema: libraryPrompt.output_schema ? { ...libraryPrompt.output_schema } : undefined,
    source: 'forked',
    forkedFrom: forkedFromId,
    createdAt: now,
    updatedAt: now,
    version: 1,
    versions: [],
  };
  prompt.yaml = promptToYaml(prompt);
  prompt.versions = [{ version: 1, yaml: prompt.yaml, rendered: renderPrompt(prompt, {}), timestamp: now }];
  savePrompt(prompt);
  return prompt;
}

export function createVersion(id: string, yaml: string): PromptVersion | null {
  const prompt = getPrompt(id);
  if (!prompt) return null;
  if (prompt.yaml === yaml) return null;
  const nextVersion = prompt.version + 1;
  const v: PromptVersion = {
    version: nextVersion,
    yaml,
    rendered: '',
    timestamp: Date.now(),
  };
  const parsed = yamlToPrompt(yaml, id, prompt.source, prompt.forkedFrom);
  if (parsed) v.rendered = renderPrompt(parsed, {});
  prompt.version = nextVersion;
  prompt.versions.push(v);
  prompt.yaml = yaml;
  savePrompt(prompt);
  return v;
}

export function rollbackToVersion(id: string, version: number): boolean {
  const prompt = getPrompt(id);
  if (!prompt) return false;
  const target = prompt.versions.find(v => v.version === version);
  if (!target) return false;
  prompt.yaml = target.yaml;
  prompt.version = version;
  savePrompt(prompt);
  return true;
}

// Compat aliases
export const forkTemplate = forkLibraryTemplate;
export const getMyTemplates = getAllPrompts;
export const getMyTemplate = getPrompt;
export const saveMyTemplate = (id: string, yaml: string) => { createVersion(id, yaml); };
export const deleteMyTemplate = deletePrompt;