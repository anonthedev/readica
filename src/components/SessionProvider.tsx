"use client";

import { SessionProvider as Provider } from "next-auth/react";
import { ReactNode } from "react";

interface SessionProviderProps {
  children: ReactNode;
  //@ts-ignore
  session?: any;
}

export default function SessionProvider({
  children,
  session,
}: SessionProviderProps) {
  return <Provider session={session}>{children}</Provider>;
}
