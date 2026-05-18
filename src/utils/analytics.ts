import { STORAGE_KEYS } from './constants';
export interface AnalyticsEvent {
  type: 'template_view' | 'template_copy' | 'ai_generate' | 'ai_copy' | 'ai_feedback' | 'ai_save' | 'template_save';
  templateId?: string;
  timestamp: number;
  lang?: string;
  userId?: string;
  userName?: string;
  provider?: string;
}

const KEY = STORAGE_KEYS.analytics;
const MAX = 2000;

function load(): AnalyticsEvent[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function save(events: AnalyticsEvent[]) {
  localStorage.setItem(KEY, JSON.stringify(events.slice(-MAX)));
}


/** Extract a short display name from a Clerk-like user object */
export function getDisplayName(user?: { fullName?: string | null; username?: string | null; firstName?: string | null; primaryEmailAddress?: { emailAddress: string } | null } | null): string {
  if (!user) return 'Unknown';
  if (user.fullName && !user.fullName.includes('@')) return user.fullName;
  if (user.username) return user.username;
  if (user.firstName) return user.firstName;
  const email = user.primaryEmailAddress?.emailAddress;
  if (email) return email.split('@')[0];
  return 'Unknown';
}

export function track(event: Omit<AnalyticsEvent, 'timestamp'>) {
  const fullEvent = { ...event, timestamp: Date.now() };

  // Local storage (always works)
  const events = load();
  events.push(fullEvent);
  save(events);

  // Sync to Vercel KV (fire-and-forget)
  fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fullEvent),
  }).catch(() => {});
}

export function getStats() {
  const events = load();
  const views: Record<string, number> = {};
  const copies: Record<string, number> = {};
  let aiGen = 0;
  let aiCopy = 0;

  for (const e of events) {
    if (e.type === 'template_view' && e.templateId) views[e.templateId] = (views[e.templateId] || 0) + 1;
    if (e.type === 'template_copy' && e.templateId) copies[e.templateId] = (copies[e.templateId] || 0) + 1;
    if (e.type === 'ai_generate') aiGen++;
    if (e.type === 'ai_copy') aiCopy++;
    if (e.type === 'ai_feedback') {
      // stored in separate localStorage key
    }
  }

  const conversion: Record<string, string> = {};
  for (const id in views) {
    const v = views[id] || 0;
    const c = copies[id] || 0;
    conversion[id] = v > 0 ? ((c / v) * 100).toFixed(1) + '%' : '0%';
  }

  return { views, copies, conversion, aiGen, aiCopy, total: events.length };
}

export function getEvents(): AnalyticsEvent[] {
  return load();
}

export function clearEvents() {
  localStorage.removeItem(KEY);
}

if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__pb_stats = getStats;
  (window as unknown as Record<string, unknown>).__pb_events = getEvents;
  (window as unknown as Record<string, unknown>).__pb_clear = clearEvents;
}