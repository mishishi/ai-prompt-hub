import type { FastifyInstance } from 'fastify';
import { db } from '../../lib/db';
import { communityTemplates } from '../../lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

interface PublishBody {
  authorId: string;
  authorName: string;
  name: string;
  description?: string;
  tags?: string[];
  category?: string;
  difficulty?: string;
  prompt: string;
}

export async function communityRoutes(app: FastifyInstance) {
  // POST /api/community — publish
  app.post<{ Body: PublishBody }>('/', async (request, reply) => {
    const { authorId, authorName, name, description, tags, category, difficulty, prompt } = request.body;

    if (!authorId || !authorName || !name || !prompt) {
      return reply.status(400).send({ error: 'Missing required fields: authorId, authorName, name, prompt' });
    }

    const result = await db.insert(communityTemplates).values({
      authorId,
      authorName,
      name: name.slice(0, 100),
      description: (description || '').slice(0, 300),
      tags: tags || [],
      category: category || 'backend',
      difficulty: difficulty || 'Beginner',
      prompt,
      likes: 0,
      copies: 0,
    }).returning();

    return { ok: true, template: result[0] };
  });

  // GET /api/community — list
  app.get('/', async (request) => {
    const { category, search, sort, limit: limitStr } = request.query as Record<string, string>;
    const limit = Math.min(parseInt(limitStr || '50'), 100);

    let query = db.select().from(communityTemplates);

    if (category) query = query.where(eq(communityTemplates.category, category));
    if (sort === 'popular') query = query.orderBy(desc(communityTemplates.likes));
    else if (sort === 'copied') query = query.orderBy(desc(communityTemplates.copies));
    else query = query.orderBy(desc(communityTemplates.createdAt));
    query = query.limit(limit);

    let results = await query;
    if (search) {
      const s = search.toLowerCase();
      results = results.filter(t =>
        t.name.toLowerCase().includes(s) ||
        t.description.toLowerCase().includes(s) ||
        t.tags.some(tag => tag.toLowerCase().includes(s))
      );
    }

    return { ok: true, templates: results };
  });

  // GET /api/community/:id — single
  app.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const rows = await db.select().from(communityTemplates).where(eq(communityTemplates.id, request.params.id)).limit(1);
    if (!rows.length) return reply.status(404).send({ error: 'Not found' });
    return { ok: true, template: rows[0] };
  });

  // PATCH /api/community/:id — like / copy
  app.patch<{ Params: { id: string }; Body: { action: string } }>('/:id', async (request, reply) => {
    const { action } = request.body;
    if (action === 'like') {
      const rows = await db.update(communityTemplates)
        .set({ likes: sql`likes + 1` })
        .where(eq(communityTemplates.id, request.params.id))
        .returning();
      if (!rows.length) return reply.status(404).send({ error: 'Not found' });
      return { ok: true, template: rows[0] };
    }
    if (action === 'copy') {
      const rows = await db.update(communityTemplates)
        .set({ copies: sql`copies + 1` })
        .where(eq(communityTemplates.id, request.params.id))
        .returning();
      if (!rows.length) return reply.status(404).send({ error: 'Not found' });
      return { ok: true, template: rows[0] };
    }
    return reply.status(400).send({ error: 'Invalid action' });
  });

  // DELETE /api/community/:id
  app.delete<{ Params: { id: string }; Body: { authorId: string } }>('/:id', async (request, reply) => {
    const { authorId } = request.body;
    const rows = await db.select().from(communityTemplates).where(eq(communityTemplates.id, request.params.id)).limit(1);
    if (!rows.length) return reply.status(404).send({ error: 'Not found' });
    if (rows[0].authorId !== authorId) return reply.status(403).send({ error: 'Forbidden' });
    await db.delete(communityTemplates).where(eq(communityTemplates.id, request.params.id));
    return { ok: true };
  });
}