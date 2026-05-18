import { db } from '../../../lib/db/index';
import { templateComments } from '../../../lib/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET /api/community/[id]/comments
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const comments = await db.select()
      .from(templateComments)
      .where(eq(templateComments.templateId, params.id))
      .orderBy(desc(templateComments.createdAt))
      .limit(100);
    return Response.json({ ok: true, comments });
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}

// POST /api/community/[id]/comments
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { userId, userName, content } = body;
    if (!userId || !content || !content.trim()) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const result = await db.insert(templateComments).values({
      templateId: params.id,
      userId,
      userName: userName || userId,
      content: content.trim().slice(0, 1000),
    }).returning();
    return Response.json({ ok: true, comment: result[0] });
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}