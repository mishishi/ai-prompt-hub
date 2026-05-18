import { kv } from "@vercel/kv";

const WINDOW_MS = 60_000; // 1 minute
const DEFAULT_LIMIT = 100;

export async function checkRateLimit(
  key: string,
  limit: number = DEFAULT_LIMIT
): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now();
  const windowKey = `rl:${key}:${Math.floor(now / WINDOW_MS)}`;

  const count = await kv.incr(windowKey);
  if (count === 1) await kv.expire(windowKey, 120); // 2 min TTL

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
  };
}

export function rateLimitKey(request: Request): string {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
  const url = new URL(request.url);
  return `${ip}:${url.pathname}`;
}