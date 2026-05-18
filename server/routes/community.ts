import type { FastifyInstance } from 'fastify';
import { db } from '../../lib/db/index.js';
import { communityTemplates, templateFeedback, templateComments } from '../../lib/db/schema.js';
import { eq, desc, sql, and, gte } from 'drizzle-orm';

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
    const { category, search, author, sort, limit: limitStr, offset: offsetStr } = request.query as Record<string, string>;
    const limit = Math.min(parseInt(limitStr || '50'), 100);
    const offset = Math.max(parseInt(offsetStr || '0'), 0);

    let query = db.select().from(communityTemplates);

    if (category) query = query.where(eq(communityTemplates.category, category));
    if (author) query = query.where(eq(communityTemplates.authorId, author));
    if (sort === 'popular') query = query.orderBy(desc(communityTemplates.likes));
    else if (sort === 'copied') query = query.orderBy(desc(communityTemplates.copies));
    else query = query.orderBy(desc(communityTemplates.createdAt));
    query = query.limit(limit).offset(offset);

    const countResult = await db.select({ count: sql`count(*)` }).from(communityTemplates);
    const total = Number(countResult[0]?.count ?? 0);

    let results = await query;
    if (search) {
      const s = search.toLowerCase();
      results = results.filter(t =>
        t.name.toLowerCase().includes(s) ||
        t.description.toLowerCase().includes(s) ||
        t.tags.some(tag => tag.toLowerCase().includes(s))
      );
    }

    return { ok: true, templates: results, total, offset, limit };
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


  // POST /api/community/:id/feedback
  app.post('/:id/feedback', async (request, reply) => {
    await db.transaction(async (tx) => {
    try {
      const { userId, value } = request.body as any;
      if (!userId || !value || !['up', 'down'].includes(value)) {
        return reply.status(400).send({ error: 'Missing userId or invalid value' });
      }
      const templateId = request.params.id;
      const existing = await tx.select().from(templateFeedback)
        .where(and(eq(templateFeedback.templateId, templateId), eq(templateFeedback.userId, userId)))
        .limit(1);
      let likeDelta = 0;
      if (existing.length > 0) {
        const oldValue = existing[0].value;
        if (oldValue === value) {
          await tx.delete(templateFeedback)
            .where(and(eq(templateFeedback.templateId, templateId), eq(templateFeedback.userId, userId)));
          likeDelta = value === 'up' ? -1 : 1;
        } else {
          await tx.update(templateFeedback)
            .set({ value, createdAt: new Date() })
            .where(and(eq(templateFeedback.templateId, templateId), eq(templateFeedback.userId, userId)));
          likeDelta = value === 'up' ? 2 : -2;
        }
      } else {
        await tx.insert(templateFeedback).values({ templateId, userId, value });
        likeDelta = value === 'up' ? 1 : -1;
      }
      if (likeDelta !== 0) {
        await tx.update(communityTemplates)
          .set({ likes: sql`GREATEST(0, likes + ${likeDelta})` })
          .where(eq(communityTemplates.id, templateId));
      }
      const updated = await tx.select().from(communityTemplates).where(eq(communityTemplates.id, templateId)).limit(1);
      return { ok: true, likes: updated[0]?.likes ?? 0, userVote: value };
    } catch (e: any) {
      return reply.status(500).send({ ok: false, error: e.message });
    }
  });

  // GET /api/community/:id/comments
  app.get('/:id/comments', async (request) => {
    try {
      const comments = await db.select().from(templateComments)
        .where(eq(templateComments.templateId, request.params.id))
        .orderBy(desc(templateComments.createdAt))
        .limit(100);
      return { ok: true, comments };
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  });

  // POST /api/community/:id/comments
  app.post('/:id/comments', async (request, reply) => {
    try {
      const { userId, userName, content } = request.body as any;
      if (!userId || !content?.trim()) {
        return reply.status(400).send({ error: 'Missing required fields' });
      }
      const result = await db.insert(templateComments).values({
        templateId: request.params.id,
        userId,
        userName: userName || userId,
        content: content.trim().slice(0, 1000),
      }).returning();
      return { ok: true, comment: result[0] };
    } catch (e: any) {
      return reply.status(500).send({ ok: false, error: e.message });
    }
  });

  // GET /api/community/leaderboard
  app.get('/leaderboard', async (request) => {
    try {
      const query = request.query as any;
      const period = query.period || 'week';
      const limit = Math.min(parseInt(query.limit || '10'), 50);
      let dbQuery = db.select().from(communityTemplates);
      if (period === 'week') {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        dbQuery = dbQuery.where(gte(communityTemplates.createdAt, weekAgo));
      } else if (period === 'month') {
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        dbQuery = dbQuery.where(gte(communityTemplates.createdAt, monthAgo));
      }
      dbQuery = dbQuery.orderBy(desc(communityTemplates.copies)).limit(limit);
      const results = await dbQuery;
      return { ok: true, leaderboard: results, period };
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
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