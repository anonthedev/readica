"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowRight,
  BookOpenCheck,
  FileSearch,
  LibraryBig,
  MessageSquareText,
  Search,
  ShieldCheck,
  Sparkles,
  Tags,
  UploadCloud,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const proofPoints = [
  "Personal PDF library",
  "AI-assisted paper discovery",
  "Notes and threaded comments",
  "Google sign-in",
];

const workflowSteps = [
  {
    icon: UploadCloud,
    title: "Save the paper",
    description:
      "Upload PDFs or keep source links, authors, abstracts, and tags attached to the work.",
  },
  {
    icon: Search,
    title: "Find what matters",
    description:
      "Filter by title, author, tags, and reading status when your folder stops being enough.",
  },
  {
    icon: BookOpenCheck,
    title: "Read with context",
    description:
      "Open the paper, capture notes, and keep discussion close to the text instead of scattered across apps.",
  },
];

const featureCards = [
  {
    icon: LibraryBig,
    title: "A library built for research papers",
    description:
      "Readica stores the details researchers actually revisit: authors, summaries, PDF links, tags, and reading state.",
  },
  {
    icon: FileSearch,
    title: "Discovery that feeds your queue",
    description:
      "Search for papers from inside the app, review candidate results, and add the useful ones to your library.",
  },
  {
    icon: MessageSquareText,
    title: "Notes stay attached to the reading",
    description:
      "Keep observations, questions, and follow-up thoughts connected to the paper they came from.",
  },
];

const objections = [
  {
    title: "Will setup take long?",
    description:
      "Sign in with Google, add your first paper, and start organizing before the next tab distracts you.",
  },
  {
    title: "Can I keep my own structure?",
    description:
      "Use tags and statuses for the systems you already trust: thesis chapters, reading groups, lit reviews, or courses.",
  },
  {
    title: "What replaces my PDF folder?",
    description:
      "Not the files themselves, but the missing layer around them: context, search, notes, and a readable workflow.",
  },
];

export default function Home() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const primaryHref = isAuthenticated ? "/dashboard" : "/login";
  const primaryLabel = isAuthenticated ? "Open dashboard" : "Start with Google";

  return (
    <main className="min-h-screen overflow-hidden bg-[#fbfaf7] text-[#17130f] dark:bg-[#09090b] dark:text-white">
      <section className="relative isolate border-b border-black/10 dark:border-white/10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(119,50,232,0.18),transparent_34%),radial-gradient(circle_at_82%_8%,rgba(244,163,52,0.16),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.8),rgba(251,250,247,0.96))] dark:bg-[radial-gradient(circle_at_18%_18%,rgba(119,50,232,0.28),transparent_34%),radial-gradient(circle_at_82%_8%,rgba(244,163,52,0.14),transparent_28%),linear-gradient(180deg,rgba(9,9,11,0.4),rgba(9,9,11,1))]" />
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8">
          <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight">
            <span className="flex size-9 items-center justify-center rounded-2xl bg-purple text-sm font-bold text-white shadow-lg shadow-purple/25">
              R
            </span>
            <span>readica</span>
          </Link>
          <div className="flex items-center gap-3">
            
            <Button asChild size="sm" className="rounded-full px-4">
              <Link href={primaryHref}>{primaryLabel}</Link>
            </Button>
          </div>
        </nav>

        <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-12 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:pb-28 lg:pt-20">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple/20 bg-white/70 px-3 py-1 text-sm font-medium text-purple shadow-sm shadow-black/5 backdrop-blur dark:border-purple/40 dark:bg-white/10 dark:text-purple-200">
              <Sparkles className="size-4" />
              For students, researchers, and paper-heavy teams
            </div>
            <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-balance sm:text-6xl lg:text-7xl">
              Turn scattered research PDFs into a working reading system.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-black/65 dark:text-white/68">
              Readica gives academic papers a home: upload and tag your library,
              discover related work, read PDFs, and keep notes close to the source.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 rounded-full px-6 text-base">
                <Link href={primaryHref}>
                  {primaryLabel}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-black/15 bg-white/60 px-6 text-base hover:bg-white dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
              >
                <Link href="#workflow">See the workflow</Link>
              </Button>
            </div>
            <div className="mt-8 grid gap-3 text-sm text-black/60 dark:text-white/58 sm:grid-cols-2">
              {proofPoints.map((point) => (
                <div key={point} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-purple" />
                  {point}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-purple/10 blur-3xl" />
            <div className="rounded-[2rem] border border-black/10 bg-white/80 p-3 shadow-2xl shadow-black/10 backdrop-blur dark:border-white/10 dark:bg-white/10 dark:shadow-black/40">
              <div className="rounded-[1.45rem] border border-black/10 bg-[#111111] p-4 text-white dark:border-white/10">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/70">Today&apos;s library</p>
                    <h2 className="text-xl font-semibold">12 papers to review</h2>
                  </div>
                  <div className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                    Lit review
                  </div>
                </div>
                <div className="grid gap-3">
                  {[
                    ["Attention Is All You Need", "Vaswani et al.", "Reading", "Transformers"],
                    ["Chain-of-Thought Prompting", "Wei et al.", "Queued", "Reasoning"],
                    ["Retrieval-Augmented Generation", "Lewis et al.", "Annotated", "Search"],
                  ].map(([title, author, statusLabel, tag]) => (
                    <div
                      key={title}
                      className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 transition hover:bg-white/[0.09]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-medium leading-tight">{title}</h3>
                          <p className="mt-1 text-sm text-white/50">{author}</p>
                        </div>
                        <span className="rounded-full bg-purple/20 px-2.5 py-1 text-xs text-purple-100">
                          {statusLabel}
                        </span>
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-xs text-white/50">
                        <Tags className="size-3.5" />
                        {tag}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
                  <p className="text-sm font-medium text-amber-100">Reader note</p>
                  <p className="mt-1 text-sm leading-6 text-white/62">
                    Compare the retrieval setup with last week&apos;s semantic search paper.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="workflow" className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-purple">
            Product workflow
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
            The route from &quot;I should read this&quot; to &quot;I can use this.&quot;
          </h2>
        </div>
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {workflowSteps.map((step, index) => {
            const Icon = step.icon;

            return (
              <article
                key={step.title}
                className="rounded-[1.75rem] border border-black/10 bg-white p-6 shadow-sm shadow-black/5 dark:border-white/10 dark:bg-white/[0.04]"
              >
                <div className="mb-8 flex items-center justify-between">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-purple/10 text-purple dark:bg-purple/20 dark:text-purple-100">
                    <Icon className="size-5" />
                  </span>
                  <span className="text-sm font-medium text-black/35 dark:text-white/35">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 leading-7 text-black/60 dark:text-white/58">
                  {step.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-[#17130f] py-20 text-white dark:bg-black">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-purple-200">
              Why Readica
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
              Less tab archaeology. More usable reading memory.
            </h2>
            <p className="mt-5 leading-8 text-white/62">
              Browser bookmarks, drive folders, and notes apps all hold pieces of
              your research. Readica brings the pieces together around the paper.
            </p>
          </div>
          <div className="grid gap-4">
            {featureCards.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="group rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-6 transition hover:bg-white/[0.09]"
                >
                  <div className="flex flex-col gap-5 sm:flex-row">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-purple-100">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <h3 className="text-xl font-semibold">{feature.title}</h3>
                      <p className="mt-3 leading-7 text-white/58">{feature.description}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_0.95fr] lg:items-center">
        <div className="rounded-[2rem] border border-black/10 bg-white p-4 shadow-xl shadow-black/5 dark:border-white/10 dark:bg-white/[0.04]">
          <div className="rounded-[1.5rem] bg-[#f4f0e8] p-5 dark:bg-white/[0.05]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-black/50 dark:text-white/45">Discovery prompt</p>
                <p className="font-medium">Find papers about PDF annotation UX</p>
              </div>
              <FileSearch className="size-5 text-purple" />
            </div>
            <div className="space-y-3">
              {[
                "Reading behavior in digital academic libraries",
                "Annotation practices among graduate researchers",
                "Designing interfaces for scholarly PDF reading",
              ].map((paper) => (
                <div
                  key={paper}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 dark:bg-black/25"
                >
                  <div>
                    <h3 className="font-medium">{paper}</h3>
                    <p className="mt-1 text-sm text-black/50 dark:text-white/45">
                      Candidate paper with editable metadata
                    </p>
                  </div>
                  <span className="hidden rounded-full border border-black/10 px-3 py-1 text-xs text-black/55 dark:border-white/10 dark:text-white/50 sm:block">
                    Add
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-purple">
            Discovery
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
            Build a reading queue without losing the trail.
          </h2>
          <p className="mt-5 leading-8 text-black/60 dark:text-white/58">
            Readica is designed for the moment after a useful citation appears.
            Search, inspect the result, save it with useful metadata, and keep moving.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm shadow-black/5 dark:border-white/10 dark:bg-white/[0.04] sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-purple/10 text-purple dark:bg-purple/20 dark:text-purple-100">
                <ShieldCheck className="size-5" />
              </div>
              <h2 className="text-3xl font-semibold tracking-tight">
                The questions people ask before changing their reading setup.
              </h2>
            </div>
            <div className="grid gap-4">
              {objections.map((item) => (
                <article key={item.title} className="rounded-2xl bg-black/[0.03] p-5 dark:bg-white/[0.05]">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-2 leading-7 text-black/60 dark:text-white/58">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-10 sm:px-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-purple px-6 py-12 text-center text-white shadow-2xl shadow-purple/25 sm:px-10">
          <h2 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">
            Give your next paper a place to become useful.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl leading-8 text-white/72">
            Start with one upload, one tag, and one note. Readica grows from there.
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="mt-8 h-12 rounded-full bg-white px-6 text-base text-[#17130f] hover:bg-white/90"
          >
            <Link href={primaryHref}>
              {primaryLabel}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
