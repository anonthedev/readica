'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAuth();

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-screen flex">
        <SidebarTrigger className="my-2 mx-2 absolute md:hidden" />
        <section className="flex-grow">{children}</section>
      </main>
    </SidebarProvider>
  );
}
