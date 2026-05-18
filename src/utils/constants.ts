export const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: 'bg-[var(--color-bench-success)]/15 text-[var(--color-bench-success)]',
  Intermediate: 'bg-[var(--color-bench-warn)]/15 text-[var(--color-bench-warn)]',
  Advanced: 'bg-[var(--color-bench-error)]/15 text-[var(--color-bench-error)]',
};


export const STORAGE_KEYS = {
  analytics: 'pb_analytics',
  aiQuota: 'promptbench-quota',
  savedPrompts: 'promptbench-saved',
  favorites: 'promptbench-favorites',
  recent: 'promptbench-recent',
  templateFeedback: 'promptbench-tpl-feedback',
  lang: 'promptbench-lang',
  theme: 'bench-theme',
  aiFeedback: 'promptbench-feedback',
  savedTemplates: 'promptbench-saved-templates',
  onboarding: 'promptbench-onboarding',
} as const;
