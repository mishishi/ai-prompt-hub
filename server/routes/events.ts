import type { FastifyInstance } from 'fastify';
import { kv } from '@vercel/kv';

const EVENTS_KEY = 'pb:events';
const MAX_EVENTS = 5000;

export async function eventsRoutes(app: FastifyInstance) {
  app.post('/', async (request) => {
    try {
      const event: any = request.body;
      event.timestamp = event.timestamp || Date.now();

      await kv.lpush(EVENTS_KEY, JSON.stringify(event));
      await kv.ltrim(EVENTS_KEY, 0, MAX_EVENTS - 1);
      await kv.expire(EVENTS_KEY, 30 * 86400);

      const day = new Date(event.timestamp).toISOString().slice(0, 10);
      const dayKey = `pb:day:${day}`;
      const field = event.type === 'template_view' ? 'views'
        : event.type === 'template_copy' ? 'copies'
        : event.type === 'ai_generate' ? 'gens'
        : event.type === 'ai_copy' ? 'copies'
        : 'other';
      await kv.hincrby(dayKey, field, 1);
      await kv.hincrby(dayKey, 'total', 1);
      await kv.expire(dayKey, 60 * 86400);

      if (event.templateId) {
        const tplKey = `pb:tpl:${event.templateId}`;
        const tplField = event.type === 'template_view' ? 'views' : event.type === 'template_copy' ? 'copies' : '';
        if (tplField) await kv.hincrby(tplKey, tplField, 1);
        await kv.hincrby(tplKey, 'total', 1);
        await kv.expire(tplKey, 90 * 86400);
      }

      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  });
}
