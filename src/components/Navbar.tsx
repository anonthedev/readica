"use client";

import { signOut, useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { data: session } = useSession();
  // console.log(session);
  return (
    <nav className="px-10 h-[80px] flex flex-row justify-between items-center">
      <div className="text-xl">readica</div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div>
            {session?.user?.image ? (
              <img
                className="rounded-full w-[40px]"
                src={session?.user?.image}
                // alt={session?.user?.name}
              />
            ) : (
              <p>{session?.user?.name}</p>
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
