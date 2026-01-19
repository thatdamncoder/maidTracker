// import { NextRequest } from "next/server";
// import { getAuthContext } from "@/lib/auth";

// export async function requireAuth(req: NextRequest) {
//   const auth = await getAuthContext();
//   if (!auth) throw new Error("UNAUTHORIZED");
//   return auth;
// }
import { auth } from "@/auth";
import { NextRequest } from "next/server";

export async function requireAuth(_req: NextRequest) {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  return {
    user: {
      id: session.user.id!,
      email: session.user.email!,
      name: session.user.name,
    },
  };
}
