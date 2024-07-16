"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function Navbar() {
  const { isSignedIn } = useUser();
  return (
    <nav className="py-4 px-20 flex flex-row items-center justify-between bg-transparent md:px-8">
      <Link
        href={isSignedIn ? "/dashboard" : "/"}
        className="text-4xl font-bold"
      >
        read<span className="text-yellow-500">ica.</span>
      </Link>
      <div className="">
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton />
        </SignedOut>
      </div>
    </nav>
  );
}
