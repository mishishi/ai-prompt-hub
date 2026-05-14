import type { Platform } from '../types';

export const PLATFORMS: { id: Platform; label: string; color: string }[] = [
  { id: 'codex', label: 'Codex', color: 'var(--color-bench-accent)' },
  { id: 'claude', label: 'Claude Code', color: '#d29922' },
  { id: 'gpt', label: 'ChatGPT', color: '#3fb950' },
];

const ZH_LABELS: Record<Platform, string> = {
  codex: 'Codex 通用',
  claude: 'Claude Code',
  gpt: 'ChatGPT',
};

export function getPlatformLabel(p: Platform, lang?: string): string {
  if (lang === 'zh-CN') return ZH_LABELS[p] || p;
  return PLATFORMS.find((x) => x.id === p)?.label ?? p;
}

export function getPlatformColor(p: Platform): string {
  return PLATFORMS.find((x) => x.id === p)?.color ?? 'var(--color-bench-accent)';
}