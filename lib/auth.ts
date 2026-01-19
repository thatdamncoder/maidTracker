import { auth } from "@/auth";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function getAuthContext() {
  const session = await auth();

  // Logged-in Google user
  if (session?.user) {
    return {
      role: "verified" as const,
      user: session.user,
    };
  }

  // Guest user
  const guestToken = (await cookies()).get("guest-token")?.value;
  if (!guestToken) return null;

  try {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    const { payload } = await jwtVerify(guestToken, secret);

    return {
      role: payload.role as "guest",
    };
  } catch {
    return null;
  }
}
