import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only
);

export const { handlers, auth, signIn, signOut} = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    /**
     * Runs on every sign-in
     */
    async signIn({ user }) {
      const email = user.email!;
      const name = user.name;

      // 1. Check if user exists
      const { data: existingUser, error } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

      // 2. Insert if not exists
      if (!existingUser) {
        const { error: insertError } = await supabase
          .from("users")
          .insert({ email, name });

        if (insertError) {
          console.error("User insert failed", insertError);
          return false;
        }
      }

      return true;
    },

    /**
     * Attach DB user_id to JWT
     */
    async jwt({ token }) {
      if (!token.email) return token;

      const { data } = await supabase
        .from("users")
        .select("id")
        .eq("email", token.email)
        .single();

      if (data) {
        token.userId = data.id;
      }

      return token;
    },

    /**
     * Expose user_id to frontend
     */
    async session({ session, token }) {
      session.user.id = token.userId as string;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
});


