"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "./ui/button";
import NavSearch from "@/components/NavSearch";

export default function Navbar() {
  const { isSignedIn } = useUser();
  return (
    <nav className="py-12 px-8 flex flex-row items-center justify-between bg-transparent w-full">
      <Link
        href={isSignedIn ? "/dashboard" : "/"}
        className="text-4xl font-bold"
      >
        read<span className="text-purple">ica.</span>
      </Link>
      <div className="flex flex-row items-center justify-center gap-12">
        <div className="flex flex-row gap-8">
          <NavSearch />
          <Button className="bg-purple">Upload Paper</Button>
        </div>
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <Button variant={"secondary"} asChild>
            <Link className="font-semibold" href={"/sign-in"}>
              Sign In
            </Link>
          </Button>
        </SignedOut>
      </div>
    </nav>
  );
}
