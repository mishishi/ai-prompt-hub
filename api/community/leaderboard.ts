import { db } from '../../lib/db/index.js';
import { communityTemplates } from '../../lib/db/schema.js';
import { desc, sql, gte } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'week';
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50);

    let query = db.select().from(communityTemplates);

    if (period === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      query = query.where(gte(communityTemplates.createdAt, weekAgo));
    } else if (period === 'month') {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      query = query.where(gte(communityTemplates.createdAt, monthAgo));
    }

    query = query.orderBy(desc(communityTemplates.copies)).limit(limit);
    const results = await query;

    return Response.json({ ok: true, leaderboard: results, period });
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}