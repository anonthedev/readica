import type { Metadata } from "next";

import Login from "@/components/Onboarding/Login";

export const metadata: Metadata = {
  title: "Login | Readica",
  description:
    "Login to your Readica account to access your academic paper library and personalized recommendations.",
  keywords: ["Readica", "login", "sign in", "academic papers", "account"],
  authors: [{ name: "anonthedev" }],
  openGraph: {
    title: "Login | Readica",
    description:
      "Login to your Readica account to access your academic paper library and personalized recommendations.",
    type: "website",
  },
};

export default function page() {
  return (
    <main className="h-screen">
      <Login />
    </main>
  );
}
