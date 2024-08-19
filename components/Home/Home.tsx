"use client";

import { buttonVariants } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <main
      className={`relative w-screen min-h-[calc(100vh-80px)] flex flex-row items-center justify-between md:px-8  bg-center bg-cover bg-no-repeat`}
    >
      {/* <div className="absolute top-20 -left-4 w-[680px] h-[477px] bg-[#53FFB7] rounded-full filter blur-[138px] opacity-100 rotate-[26deg]"></div> */}
      {/* <div className="absolute -bottom-8 left-1/3 w-[580px] h-[300px] bg-[#24FFF2] rounded-full filter blur-[138px] opacity-100"></div> */}
      <section className="relative flex flex-col items-center justify-center gap-10 w-full">
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
    </main>
  );
}
