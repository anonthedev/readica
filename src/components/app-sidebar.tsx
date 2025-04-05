"use client";

import {
  Library,
  Moon,
  NotebookPen,
  SearchIcon,
  Sun,
  User2,
} from "lucide-react";
import { useTheme } from "next-themes";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "./ui/button";

const items = [
  {
    title: "Discover",
    url: "/discover",
    icon: SearchIcon,
  },
  {
    title: "Library",
    url: "/dashboard",
    icon: Library,
  },
  {
    title: "Notes",
    url: "/reader",
    icon: NotebookPen,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User2,
  },
];

export function AppSidebar() {
  const { data: session } = useSession();
  const { setTheme, theme } = useTheme();
  console.log(theme);
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Readica</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname == item.url}
                    className="data-[active=true]:bg-[#7732E8] data-[active=true]:text-white"
                  >
                    <Link href={item.url} prefetch={true}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu className="space-y-2">
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  {session?.user?.image ? (
                    <div className="flex flex-row gap-2 items-center w-full cursor-pointer">
                      <img
                        className="rounded-full w-[30px]"
                        src={session?.user?.image}
                        alt={session?.user?.name ? session?.user?.name : "user"}
                      />
                      <div className="flex flex-col">
                        <p className="">{session.user.name}</p>
                        <span className="text-xs">{session.user.email}</span>
                      </div>
                    </div>
                  ) : (
                    <User2 />
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-full h-auto">
                <DropdownMenuItem className="cursor-pointer w-full">
                  <span
                    onClick={() => {
                      signOut({ callbackUrl: "/login" });
                    }}
                  >
                    Sign out
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
