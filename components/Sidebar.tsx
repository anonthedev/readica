"use client";
import { SignedIn } from "@clerk/nextjs";
import {
  Menu,
  Telescope,
  Library,
  BookOpen,
  User,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const { user } = useUser();
  const [showFullSidebar, setShowFullSidebar] = useState(false);
  const pathname = usePathname()

  return (
    <SignedIn>
      <section
        className={`min-h-screen bg-white flex flex-col py-12 px-4 gap-20 items-start transition-all duration-300 ease-in-out ${
          showFullSidebar ? 'w-56' : 'w-24'
        }`}
      >
        <span className="p-3">
          <Menu
            size={32}
            color="black"
            strokeWidth={1.5}
            onClick={() => setShowFullSidebar(!showFullSidebar)}
            className="cursor-pointer"
          />
        </span>
        <div className="flex flex-col gap-2 w-full">
          <Link
            href={"/discover"}
            className={`w-fit flex flex-row ${showFullSidebar ? "gap-2" : "gap-0"} items-center text-[16px] p-4 rounded-lg duration-300 transition-all text-[#A1A1AA] hover:bg-purple hover:text-white ${pathname.slice(1) === "discover" && !pathname.includes("/p") ? "bg-purple text-white" : "text-[#A1A1AA] bg-transparent" }`}
          >
            <Telescope size={24} className="min-w-[24px]" />
            <span className={`overflow-hidden transition-all duration-300 ${showFullSidebar ? 'w-full opacity-100' : 'w-0 opacity-0'}`}>
              Discover
            </span>
          </Link>
          <Link
            href={"/dashboard"}
            className={`w-fit flex flex-row ${showFullSidebar ? "gap-2" : "gap-0"} items-center text-[16px] p-4 rounded-lg duration-300 transition-all text-[#A1A1AA] hover:bg-purple hover:text-white ${pathname.slice(1) === "dashboard" && !pathname.includes("/p") ? "bg-purple text-white" : "text-[#A1A1AA] bg-transparent" }`}
          >
            <Library size={24} className="min-w-[24px]" />
            <span className={`overflow-hidden transition-all duration-300 ${showFullSidebar ? 'w-full opacity-100' : 'w-0 opacity-0'}`}>
              Library
            </span>
          </Link>
          <Link
            href={"#"}
            className={`w-fit flex flex-row ${showFullSidebar ? "gap-2" : "gap-0"} items-center text-[16px] p-4 rounded-lg duration-300 transition-all text-[#A1A1AA] hover:bg-purple hover:text-white`}
          >
            <BookOpen size={24} className="min-w-[24px]" />
            <span className={`overflow-hidden transition-all duration-300 ${showFullSidebar ? 'w-full opacity-100' : 'w-0 opacity-0'}`}>
              Books
            </span>
          </Link>
          <Link
            href={`/profile`}
            className={`w-fit flex flex-row ${showFullSidebar ? "gap-2" : "gap-0"} items-center text-[16px] p-4 rounded-lg duration-300 transition-all text-[#A1A1AA] hover:bg-purple hover:text-white ${pathname.slice(1) === "profile" && !pathname.includes("/p") ? "bg-purple text-white" : "text-[#A1A1AA] bg-transparent" }`}
          >
            <User size={24} className="min-w-[24px]" />
            <span className={`overflow-hidden transition-all duration-300 ${showFullSidebar ? 'w-full opacity-100' : 'w-0 opacity-0'}`}>
              Profile
            </span>
          </Link>
        </div>
      </section>
    </SignedIn>
  );
}