import SessionProvider from "@/components/SessionProvider";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Inter } from "next/font/google";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { Session } from "next-auth";
import { Analytics } from "@vercel/analytics/react"

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
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="font-inter overflow-x-hidden">
        <SessionProvider session={session as Session}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SidebarProvider>
              <AppSidebar />
              <main className="w-screen flex">
                <SidebarTrigger className="my-2 mx-2 absolute md:hidden" />
                <section className="flex-grow">{children}</section>
              </main>
            </SidebarProvider>
          </ThemeProvider>
        </SessionProvider>
        <Toaster />
      </body>
      <Analytics/>
    </html>
  );
}
