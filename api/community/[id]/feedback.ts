import { verifyAuth } from '../../../lib/auth.js';
﻿import { db } from '../../../lib/db/index.js';
import { communityTemplates, templateFeedback } from '../../../lib/db/schema.js';
import { eq, and, sql } from 'drizzle-orm';

// POST /api/community/[id]/feedback
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) return Response.json({ error: 'Authentication required' }, { status: 401 });

    const body = await request.json();
    const { userId, value } = body;
    if (!userId || !value || !['up', 'down'].includes(value)) {
      return Response.json({ error: 'Missing userId or invalid value' }, { status: 400 });
    }
    const templateId = params.id;
    const existing = await db.select()
      .from(templateFeedback)
      .where(and(eq(templateFeedback.templateId, templateId), eq(templateFeedback.userId, userId)))
      .limit(1);

    let likeDelta = 0;
    if (existing.length > 0) {
      const oldValue = existing[0].value;
      if (oldValue === value) {
        await db.delete(templateFeedback)
          .where(and(eq(templateFeedback.templateId, templateId), eq(templateFeedback.userId, userId)));
        likeDelta = value === 'up' ? -1 : 1;
      } else {
        await db.update(templateFeedback)
          .set({ value, createdAt: new Date() })
          .where(and(eq(templateFeedback.templateId, templateId), eq(templateFeedback.userId, userId)));
        likeDelta = value === 'up' ? 2 : -2;
      }
    } else {
      await db.insert(templateFeedback).values({ templateId, userId, value });
      likeDelta = value === 'up' ? 1 : -1;
    }
    if (likeDelta !== 0) {
      await db.update(communityTemplates)
        .set({ likes: sql`GREATEST(0, likes + ${likeDelta})` })
        .where(eq(communityTemplates.id, templateId));
    }
    const updated = await db.select().from(communityTemplates).where(eq(communityTemplates.id, templateId)).limit(1);
    return Response.json({ ok: true, likes: updated[0]?.likes ?? 0, userVote: value });
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}