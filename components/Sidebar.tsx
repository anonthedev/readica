"use client";

import { SignedIn } from "@clerk/nextjs";
import {
  Menu,
  Telescope,
  Library,
  BookOpen,
  User,
  LucideProps,
} from "lucide-react";
import Link from "next/link";
import { ForwardRefExoticComponent, RefAttributes, useState } from "react";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const [showFullSidebar, setShowFullSidebar] = useState(false);
  const pathname = usePathname();

  return (
    <SignedIn>
      <section
        className={`min-h-screen bg-white flex flex-col py-12 px-4 gap-20 items-start transition-all duration-300 ${
          showFullSidebar ? "w-56" : "w-24"
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
          <SidebarItem
            path="discover"
            pathname={pathname}
            showFullSidebar={showFullSidebar}
            Icon={Telescope}
            label="Discover"
          />
          <SidebarItem
            path="dashboard"
            pathname={pathname}
            showFullSidebar={showFullSidebar}
            Icon={Library}
            label="Library"
          />
          <SidebarItem
            path="reader"
            pathname={pathname}
            showFullSidebar={showFullSidebar}
            Icon={BookOpen}
            label="Read"
          />
          <SidebarItem
            path="profile"
            pathname={pathname}
            showFullSidebar={showFullSidebar}
            Icon={User}
            label="Profile"
          />
        </div>
      </section>
    </SignedIn>
  );
}

function SidebarItem({
  showFullSidebar,
  pathname,
  path,
  Icon,
  label,
}: {
  showFullSidebar: boolean;
  pathname: string;
  path: string;
  Icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  label: string;
}) {
  return (
    <Link
      href={`/${path}`}
      className={`group flex items-center text-[16px] p-4 rounded-lg duration-300 transition-all text-[#A1A1AA] hover:bg-purple hover:text-white ${
        pathname.slice(1) === path && !pathname.includes("/p/")
          ? "bg-purple text-white"
          : "text-[#A1A1AA] bg-transparent"
      }`}
    >
      <Icon className="min-w-[24px]" />
      <span
        className={`overflow-hidden transition-all duration-300 ${
          showFullSidebar ? "w-full ml-2 opacity-100" : "w-0 opacity-0"
        }`}
      >
        {label}
      </span>
      <span className={`absolute left-0 w-full h-full bg-purple opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 ${
        showFullSidebar ? "" : "w-16"
      }`}></span>
    </Link>
  );
}
