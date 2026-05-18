import { db } from '../../lib/db.js';
import { communityTemplates } from '../../../lib/db/schema.js';
import { eq, sql } from 'drizzle-orm';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const template = await db.select().from(communityTemplates).where(eq(communityTemplates.id, params.id)).limit(1);
    if (!template.length) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ ok: true, template: template[0] });
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { action } = body;
    if (action === "like") {
      const result = await db.update(communityTemplates)
        .set({ likes: sql`likes + 1` })
        .where(eq(communityTemplates.id, params.id))
        .returning();
      if (!result.length) return Response.json({ error: "Not found" }, { status: 404 });
      return Response.json({ ok: true, template: result[0] });
    }
    if (action === "copy") {
      const result = await db.update(communityTemplates)
        .set({ copies: sql`copies + 1` })
        .where(eq(communityTemplates.id, params.id))
        .returning();
      if (!result.length) return Response.json({ error: "Not found" }, { status: 404 });
      return Response.json({ ok: true, template: result[0] });
    }
    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { authorId } = await request.json();
    const tmpl = await db.select().from(communityTemplates).where(eq(communityTemplates.id, params.id)).limit(1);
    if (!tmpl.length) return Response.json({ error: "Not found" }, { status: 404 });
    if (tmpl[0].authorId !== authorId) return Response.json({ error: "Forbidden" }, { status: 403 });
    await db.delete(communityTemplates).where(eq(communityTemplates.id, params.id));
    return Response.json({ ok: true });
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}