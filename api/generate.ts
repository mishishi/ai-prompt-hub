import { generateSchema } from "../lib/validation.js";
import { verifyAuth } from "../lib/auth.js";
import { checkRateLimit, rateLimitKey } from "../lib/rate-limit.js";

const MINIMAX_URL = "https://api.minimax.chat/v1/text/chatcompletion_v2";

export async function POST(request: Request) {
  const auth = await verifyAuth(request);
  if (!auth) return Response.json({ error: "Authentication required" }, { status: 401 });

  const rl = await checkRateLimit(rateLimitKey(request) + ":generate", 10);
  if (!rl.allowed) return Response.json({ error: "Rate limit exceeded" }, { status: 429 });

  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "MINIMAX_API_KEY not configured" }, { status: 500 });
  }

  try {
    const body = generateSchema.parse(await request.json());
    const upstream = await fetch(MINIMAX_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!upstream.ok) {
      console.error("Minimax upstream error:", upstream.status);
      return Response.json({ error: "Upstream AI service error" }, { status: 502 });
    }

    if (!upstream.body) {
      return Response.json({ error: "No response body from Minimax" }, { status: 500 });
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstream.body!.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        } catch (e: any) {
          controller.error(e);
        } finally {
          controller.close();
          reader.releaseLock();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e: any) {
    return Response.json({ error: e.message || "Internal error" }, { status: 500 });
  }
}
