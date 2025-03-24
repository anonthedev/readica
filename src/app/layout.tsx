import SessionProvider from "@/components/SessionProvider";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { Inter } from "next/font/google";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import "./globals.css";

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
      <body className={`${inter.variable} `}>
        <SessionProvider session={session}>
          <SidebarProvider>
            <AppSidebar />
            <main>
              <SidebarTrigger className="my-2 cursor-pointer" />
              {children}
            </main>
          </SidebarProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
