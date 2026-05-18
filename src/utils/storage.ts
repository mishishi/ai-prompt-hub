import type { Prompt } from '../types';
import { STORAGE_KEYS } from './constants';

const STORAGE_KEY = STORAGE_KEYS.savedPrompts;

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
  try { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts)); } catch { /* quota exceeded */ } } catch { console.warn('localStorage quota exceeded'); }
}

export function deletePrompt(id: string): void {
  const prompts = getSavedPrompts().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
}

export function generateId(): string {
  return 'prompt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}


const FAVORITES_KEY = STORAGE_KEYS.favorites;

export function getFavorites(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function toggleFavorite(id: string): boolean {
  const favs = getFavorites();
  const idx = favs.indexOf(id);
  if (idx >= 0) {
    favs.splice(idx, 1);
    try { try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs)); } catch { /* quota exceeded */ } } catch { /* quota exceeded */ }
    return false;
  } else {
    favs.push(id);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
    return true;
  }
}

export function isFavorite(id: string): boolean {
  return getFavorites().includes(id);
}


const RECENT_KEY = STORAGE_KEYS.recent;

export function addRecentView(id: string): void {
  const recents = getRecentViews();
  const filtered = recents.filter(r => r !== id);
  filtered.unshift(id);
  localStorage.setItem(RECENT_KEY, JSON.stringify(filtered.slice(0, 5)));
}

export function getRecentViews(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
