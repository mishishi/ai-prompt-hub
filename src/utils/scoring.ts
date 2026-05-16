import type { AnalyticsEvent } from './analytics';

const LIKE_WEIGHT = 3;
const COPY_WEIGHT = 5;
const VIEW_WEIGHT = 1;
const RECENCY_DAYS = 14;
const RECENCY_BOOST = 1.2;
const MAX_SCORE = 100;

interface ScoreInput {
  views: number;
  copies: number;
  likes: number;
  lastActivity?: number; // timestamp
}

/** Calculate effect score (0-100) for a template */
export function calcScore(input: ScoreInput): number {
  const raw = input.views * VIEW_WEIGHT + input.copies * COPY_WEIGHT + input.likes * LIKE_WEIGHT;
  if (raw === 0) return 0;

  const now = Date.now();
  const recencyBoost =
    input.lastActivity && now - input.lastActivity < RECENCY_DAYS * 86400000
      ? RECENCY_BOOST
      : 1.0;

  return Math.min(Math.round(raw * recencyBoost), MAX_SCORE);
}

/** Aggregate analytics events into ScoreInput for a template */
export function aggregateEvents(events: AnalyticsEvent[], templateId: string): ScoreInput {
  let views = 0, copies = 0, likes = 0, lastActivity = 0;
  for (const e of events) {
    if (e.templateId !== templateId) continue;
    if (e.type === 'template_view') views++;
    if (e.type === 'template_copy') copies++;
    if (e.type === 'ai_feedback') likes++;
    if (e.timestamp > lastActivity) lastActivity = e.timestamp;
  }
  return { views, copies, likes, lastActivity: lastActivity || undefined };
}

/** Get score display string */
export function scoreDisplay(score: number, lang: string): string {
  if (score === 0) return '';
  return lang === 'zh-CN' ? `${score}分` : `${score}pts`;
}

/** Score color class based on score range */
export function scoreColor(score: number): string {
  if (score >= 60) return 'text-[var(--color-bench-success)]';
  if (score >= 30) return 'text-[var(--color-bench-warn)]';
  return 'text-[var(--color-bench-muted)]';
}