import type { Prompt } from '../types';

const STORAGE_KEY = 'promptbench-saved';

export function getSavedPrompts(): Prompt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function savePrompt(prompt: Prompt): void {
  const prompts = getSavedPrompts();
  const idx = prompts.findIndex(p => p.id === prompt.id);
  if (idx >= 0) {
    prompts[idx] = { ...prompt, updatedAt: Date.now() };
  } else {
    prompts.unshift({ ...prompt, createdAt: Date.now(), updatedAt: Date.now() });
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
}

export function deletePrompt(id: string): void {
  const prompts = getSavedPrompts().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
}

export function generateId(): string {
  return 'prompt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}
