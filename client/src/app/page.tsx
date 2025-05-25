import type { Metadata } from "next";
import Home from "@/components/Home";

export const metadata: Metadata = {
  title: 'Home | Readica', 
  description: 'Readica: Your personal academic paper library and reader. Organize, discover, and read research papers online.',
  keywords: ['Readica', 'academic papers', 'research library', 'PDF reader', 'paper organizer', 'discover papers', 'online reader'],
  authors: [{ name: 'anonthedev' }],
  openGraph: {
    title: 'Home | Readica',
    description: 'Readica is your platform to organize, discover, and read academic research papers online.',
    type: 'website',
  },
};

export default function Page() {
  return <Home />;
}
