import { db } from '../../lib/db.js';
import { communityTemplates } from '../../lib/db/schema.js';
import { eq, desc } from 'drizzle-orm';

// POST /api/community — publish
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { authorId, authorName, name, description, tags, category, difficulty, prompt } = body;

    if (!authorId || !authorName || !name || !prompt) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await db.insert(communityTemplates).values({
      authorId, authorName,
      name: name.slice(0, 100),
      description: (description || '').slice(0, 300),
      tags: tags || [],
      category: category || 'backend',
      difficulty: difficulty || 'Beginner',
      prompt, likes: 0, copies: 0,
    }).returning();

    return Response.json({ ok: true, template: result[0] });
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}

// GET /api/community — list
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const author = url.searchParams.get('author');
    const search = url.searchParams.get('search');
    const sort = url.searchParams.get('sort') || 'recent';
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);

    let query = db.select().from(communityTemplates);

    if (category) query = query.where(eq(communityTemplates.category, category));
    if (author) query = query.where(eq(communityTemplates.authorId, author));
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

    return Response.json({ ok: true, templates: results });
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}
