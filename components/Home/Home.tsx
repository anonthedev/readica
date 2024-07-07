"use client";

import { buttonVariants } from "@/components/ui/button";
import leftBg from "@/resources/images/left-bg.png";
import rightBg from "@/resources/images/right-bg.png";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <main
      className={`w-screen min-h-[calc(100vh-80px)] flex flex-row items-center justify-between`}
    >
      <img src={leftBg.src} alt="" className="h-full w-fit" />
      <section className="flex flex-col items-center justify-center gap-10 w-full">
        <div className="flex flex-col gap-4 max-w-prose text-center items-center justify-center">
          <h1 className="text-3xl font-bold">
            Organise your research papers with Readica
          </h1>
          <p className="font-medium">
            Readica lets you access research papers, save them to your library
            and even take notes, all at your fingertips!
          </p>
          {isLoaded && isSignedIn && (
            <Link
              className={buttonVariants({ variant: "default" })}
              href="/dashboard"
            >
              Dashboard
            </Link>
          )}
          {isLoaded && !isSignedIn && (
            <Link
              className={buttonVariants({ variant: "default" })}
              href="/sign-in"
            >
              Sign In
            </Link>
          )}
        </div>
      </section>
      <img src={rightBg.src} alt="" className="h-full w-fit" />
    </main>
  );
}
