import { kv } from "@vercel/kv";

const EVENTS_KEY = "pb:events";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get("days") || "7");
    const today = url.searchParams.get("today") === "1";

    // Get recent events
    const rawEvents = await kv.lrange(EVENTS_KEY, 0, 100);
    const events = rawEvents.map((e: any) => {
      try { return typeof e === "string" ? JSON.parse(e) : e; }
      catch { return null; }
    }).filter(Boolean);

    // Filter by today if requested
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const filtered = today
      ? events.filter((e: any) => e.timestamp >= todayStart.getTime())
      : events;

    // Compute daily trend
    const trend: { date: string; views: number; copies: number; gens: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const dayStr = d.toISOString().slice(0, 10);
      const dayKey = `pb:day:${dayStr}`;
      const dayData = await kv.hgetall(dayKey) as Record<string, string> | null;
      trend.push({
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        views: parseInt(dayData?.views || "0"),
        copies: parseInt(dayData?.copies || "0"),
        gens: parseInt(dayData?.gens || "0"),
      });
    }

    // Compute template stats from filtered events
    const tplStats: Record<string, { views: number; copies: number }> = {};
    for (const e of filtered) {
      if (!e.templateId) continue;
      if (!tplStats[e.templateId]) tplStats[e.templateId] = { views: 0, copies: 0 };
      if (e.type === "template_view") tplStats[e.templateId].views++;
      if (e.type === "template_copy") tplStats[e.templateId].copies++;
    }

    return Response.json({
      events: filtered.slice(0, 100),
      trend,
      tplStats,
      total: events.length,
      todayTotal: today ? filtered.length : events.filter((e: any) => e.timestamp >= todayStart.getTime()).length,
    });
  } catch (e: any) {
    console.error("KV stats error:", e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
