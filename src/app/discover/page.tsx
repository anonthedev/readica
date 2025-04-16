import type { Metadata } from "next";
import Discover from "@/components/Discover/Discover";

export const metadata: Metadata = {
  title: "Discover | Readica",
  description: "Discover new academic papers and research with Readica's discovery tools.",
  keywords: ["Readica", "discover", "academic papers", "research", "find papers"],
  authors: [{ name: "anonthedev" }],
  openGraph: {
    title: "Discover | Readica",
    description: "Discover new academic papers and research with Readica's discovery tools.",
    type: "website",
  },
};

export default function Page() {
  return (
      <div className="h-screen">
        <Discover />
      </div>
  );
}
