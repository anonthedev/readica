import type { Metadata } from "next";
import Home from "@/components/Home";

export const metadata: Metadata = {
  title: "Readica | Research Papers, Organized",
  description:
    "Readica helps students and researchers organize academic PDFs, discover related papers, read with context, and keep notes close to the source.",
  keywords: [
    "Readica",
    "academic papers",
    "research library",
    "PDF reader",
    "paper organizer",
    "research notes",
    "paper discovery",
  ],
  authors: [{ name: "anonthedev" }],
  openGraph: {
    title: "Readica | Research Papers, Organized",
    description:
      "Turn scattered research PDFs into a working reading system with library organization, paper discovery, and notes.",
    type: "website",
  },
};

export default function Page() {
  return <Home />;
}
