import type { FastifyInstance } from 'fastify';
import { kv } from '@vercel/kv';

const EVENTS_KEY = 'pb:events';

export async function statsRoutes(app: FastifyInstance) {
  app.get('/', async (request) => {
    try {
      const { days: daysStr, today } = request.query as Record<string, string>;
      const days = parseInt(daysStr || '7');

      const rawEvents = await kv.lrange(EVENTS_KEY, 0, 100);
      const events = rawEvents.map((e: any) => {
        try { return typeof e === 'string' ? JSON.parse(e) : e; }
        catch { return null; }
      }).filter(Boolean);

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const filtered = today === '1'
        ? events.filter((e: any) => e.timestamp >= todayStart.getTime())
        : events;

      const trend: any[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const dayStr = d.toISOString().slice(0, 10);
        const dayKey = `pb:day:${dayStr}`;
        const dayData = await kv.hgetall(dayKey) as Record<string, string> | null;
        trend.push({
          date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          views: parseInt(dayData?.views || '0'),
          copies: parseInt(dayData?.copies || '0'),
          gens: parseInt(dayData?.gens || '0'),
        });
      }

      const tplStats: Record<string, { views: number; copies: number }> = {};
      for (const e of filtered as any[]) {
        if (!e.templateId) continue;
        if (!tplStats[e.templateId]) tplStats[e.templateId] = { views: 0, copies: 0 };
        if (e.type === 'template_view') tplStats[e.templateId].views++;
        if (e.type === 'template_copy') tplStats[e.templateId].copies++;
      }

      return {
        events: filtered.slice(0, 100),
        trend,
        tplStats,
        total: events.length,
        todayTotal: today === '1' ? filtered.length : events.filter((e: any) => e.timestamp >= todayStart.getTime()).length,
      };
    } catch (e: any) {
      return { error: e.message };
    }
  });
}
