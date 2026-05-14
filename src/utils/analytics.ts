export interface AnalyticsEvent {
  type: 'template_view' | 'template_copy' | 'ai_generate' | 'ai_copy' | 'ai_feedback' | 'ai_save';
  templateId?: string;
  timestamp: number;
  lang?: string;
}

const KEY = 'pb_analytics';
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

export function track(event: Omit<AnalyticsEvent, 'timestamp'>) {
  const events = load();
  events.push({ ...event, timestamp: Date.now() });
  save(events);
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
  (window as any).__pb_stats = getStats;
  (window as any).__pb_events = getEvents;
  (window as any).__pb_clear = clearEvents;
}