"use client";

import {
  Library,
  NotebookPen,
  SearchIcon,
  User2,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

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
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Readica</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title} >
                  <SidebarMenuButton asChild isActive={pathname == item.url} className="data-[active=true]:bg-[#7732E8] data-[active=true]:text-white" >
                    <Link href={item.url}>
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
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <div className="flex flex-row gap-2 items-center ">
                    {session?.user?.image ? (
                      <img
                        className="rounded-full w-[30px]"
                        src={session?.user?.image}
                        alt={session?.user?.name ? session?.user?.name : "user"}
                      />
                    ) : (
                      <User2 />
                    )}
                    {/* <p>{session?.user?.name}</p> */}
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width] h-auto"
              >
                <DropdownMenuItem>
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
