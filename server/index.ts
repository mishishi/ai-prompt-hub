import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env') });
config({ path: resolve(__dirname, '../.env.local'), override: true });

import Fastify from 'fastify';
import cors from '@fastify/cors';

const { communityRoutes } = await import('./routes/community');
const { eventsRoutes } = await import('./routes/events');
const { statsRoutes } = await import('./routes/stats');

const app = Fastify({ logger: true });

await app.register(cors, { origin: process.env.CORS_ORIGIN || "https://ai-propmpt-hub.vercel.app" });

app.get('/api/health', async () => ({ ok: true, ts: Date.now() }));

await app.register(eventsRoutes, { prefix: '/api/events' });
await app.register(statsRoutes, { prefix: '/api/stats' });
await app.register(communityRoutes, { prefix: '/api/community' });

const port = parseInt(process.env.PORT || '3007');
await app.listen({ port });
console.log(`Fastify running on http://localhost:${port}`);
