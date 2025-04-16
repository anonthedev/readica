import type { Metadata } from "next";
import Library from "@/components/Library/Library"

export const metadata: Metadata = {
  title: "Dashboard | Readica",
  description: "View and manage your academic paper library on Readica.",
  keywords: ["Readica", "dashboard", "library", "manage papers", "academic papers"],
  authors: [{ name: "anonthedev" }],
  openGraph: {
    title: "Dashboard | Readica",
    description: "View and manage your academic paper library on Readica.",
    type: "website",
  },
};

export default function page() {
  return (
  <>
    <main className='w-full'>
        <Library/>
      </main>
  </>
  )
}
