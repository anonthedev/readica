// import GoogleProvider from "next-auth/providers/google";

// export const authOptions: NextAuthOptions = {
  //   providers: [
    //     GoogleProvider({
      //       clientId: process.env.GOOGLE_CLIENT_ID!,
      //       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      //     }),
      //   ],
      
      // };
import { NextAuthOptions } from "next-auth";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SECRET_KEY!
  }),
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    signOut: "/login",
  },
};