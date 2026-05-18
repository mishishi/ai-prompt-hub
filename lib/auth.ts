import { createClerkClient } from "@clerk/backend";

const clerkSecretKey = process.env.CLERK_SECRET_KEY;
const clerk = clerkSecretKey ? createClerkClient({ secretKey: clerkSecretKey }) : null;

export async function verifyAuth(request: Request): Promise<{ userId: string } | null> {
  if (!clerk) return null; // No key configured — allow through for dev

  const sessionToken = request.headers.get("authorization")?.replace("Bearer ", "")
    || null;

  if (!sessionToken) return null;

  try {
    const token = await clerk.verifyToken(sessionToken);
    return { userId: token.sub };
  } catch {
    return null;
  }
}