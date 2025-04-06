import { NextAuthOptions } from "next-auth";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import GoogleProvider from "next-auth/providers/google";
import jwt from "jsonwebtoken";
import { supabaseClient } from "@/lib/supabase";
import { User } from "@/types/types";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SECRET_KEY!,
  }),
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    signOut: "/login",
  },
  callbacks: {
    async session({ session, user }) {
      const signingSecret = process.env.SUPABASE_JWT_SECRET;
      if (signingSecret) {
        const payload = {
          aud: "authenticated",
          exp: Math.floor(new Date(session.expires).getTime() / 1000),
          sub: user.id,
          email: user.email,
          role: "authenticated",
        };
        session.supabaseAccessToken = jwt.sign(payload, signingSecret);
        session.user.id = user.id;
      }
      if (!session.supabaseAccessToken) {
        return session;
      }
      const supabase = supabaseClient(session.supabaseAccessToken);

      if (user?.id) {
        try {
          const { data: userData, error } = await supabase
            .from("users")
            .select("username")
            .eq("id", user.id)
            .single();

          if (error) {
            console.error("Error fetching username for session:", error);
          } else if (userData) {
            (session.user as User).username = userData.username;
          }
        } catch (dbError) {
          console.error("Database error fetching username:", dbError);
        }
      }

      return session;
    },
  },
};
