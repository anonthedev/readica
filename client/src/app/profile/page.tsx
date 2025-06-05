import type { Metadata } from "next";
import Profile from "@/components/Profile/Profile";
import Head from "next/head";

export const metadata: Metadata = {
  title: "Profile | Readica",
  description:
    "View and edit your profile on Readica. Manage your account and personal information.",
  keywords: ["Readica", "profile", "account", "user", "edit profile"],
  authors: [{ name: "anonthedev" }],
  openGraph: {
    title: "Profile | Readica",
    description:
      "View and edit your profile on Readica. Manage your account and personal information.",
    type: "website",
  },
};

export default function page() {
  return <Profile />;
}
