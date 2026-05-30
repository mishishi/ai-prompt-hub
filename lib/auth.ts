/// <reference types="node" />
import { createClerkClient } from "@clerk/backend";

const clerkSecretKey = process.env.CLERK_SECRET_KEY;
const clerk = clerkSecretKey
  ? createClerkClient({ secretKey: clerkSecretKey })
  : null;
const isDev = process.env.NODE_ENV === "development" || !process.env.NODE_ENV;

export async function verifyAuth(request: Request): Promise<{ userId: string } | null> {
  if (!clerk) {
    if (isDev) return { userId: "dev" };
    throw new Error("CLERK_SECRET_KEY not configured");
  }

  const sessionToken = request.headers.get("authorization")?.replace("Bearer ", "")
    || null;

  if (!sessionToken) return null;

  try {
    const token = await (clerk as any).verifyToken(sessionToken);
    return { userId: token.sub };
  } catch {
    return null;
  }
}