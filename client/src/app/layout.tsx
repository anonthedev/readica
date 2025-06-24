import SessionProvider from "@/components/SessionProvider";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Inter } from "next/font/google";

import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { Session } from "next-auth";
import { Analytics } from "@vercel/analytics/react";
import QueryProvider from "@/lib/providers/queryProvider";
import { ReactScan } from "@/components/ReactScan";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <QueryProvider>
      {/* <ReactScan /> */}
      <html lang="en" suppressHydrationWarning className={inter.variable}>
        <body className="font-inter overflow-x-hidden">
          <SessionProvider session={session as Session}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              {children}
            </ThemeProvider>
          </SessionProvider>
          <Toaster />
        </body>
        <Analytics />
      </html>
    </QueryProvider>
  );
}
