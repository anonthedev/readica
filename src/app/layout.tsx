import SessionProvider from "@/components/SessionProvider";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { Inter } from "next/font/google";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({
  variable: "--var-inter",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={`${inter.variable} overflow-x-hidden`}>
        <SessionProvider session={session}>
          <SidebarProvider>
            <AppSidebar />
            <main className="w-screen flex">
              <SidebarTrigger className="my-2 cursor-pointer w-auto" />
              <section className="flex-grow">
              {children}
              </section>
            </main>
            <Toaster />
          </SidebarProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
