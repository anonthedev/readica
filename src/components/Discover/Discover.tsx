"use client";

import { turnacateString } from "@/lib/utils";
import axios from "axios";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface Paper {
  title: string;
  url: string;
  description: string;
  authors: string[];
}

interface SearchResults {
  papers: Paper[];
  summary: string;
  keyTopics: string[];
}

export default function PaperSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const resp = await axios.get(`/api/recommendation?q=${query}`);
      console.log(resp.data);
      setResults(resp.data);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const dummyData: SearchResults = {
    papers: [
      {
        title: "Piko: A Design Framework for Programmable Graphics Pipelines",
        url: "https://arxiv.org/pdf/1404.6293v2.pdf",
        description:
          "This paper presents Piko, a framework for designing and implementing programmable graphics pipelines that can be easily retargeted to different application configurations and architectural targets. Piko's input is a functional and structural description of the desired graphics pipeline, augmented with a per-stage grouping of computation into spatial bins (or tiles), and a scheduling preference for these.",
        authors: [
          "Anjul Patney",
          "Stanley Tzeng",
          "Kerry A Seitz Jr",
          "John D Owens",
        ],
      },
      {
        title:
          "A Comparison of Rendering Techniques for 3D Line Sets With Transparency",
        url: "https://arxiv.org/pdf/1912.08485v1.pdf",
        description:
          "This paper presents a comprehensive study of interactive rendering techniques for large 3D line sets with transparency. The rendering of transparent lines is widely used for visualizing trajectories of tracer particles in flow fields. Transparency is then used to fade out lines deemed unimportant, based on, for instance, geometric properties or attributes defined along them. Since accurate blending of transparent lines requires rendering the lines in back-to-front or front-to-back order, enforcing this order for 3D line sets with tens or even hundreds of thousands of elements becomes challenging.",
        authors: [
          "Michael Kern",
          "Christoph Neuhauser",
          "Torben Maack",
          "Mengjiao Han",
          "Will Usher",
          "Rüdiger Westermann",
        ],
      },
      {
        title:
          "Modular primitives for high-performance differentiable rendering",
        url: "https://arxiv.org/pdf/2011.03277v1.pdf",
        description:
          "This paper presents a modular differentiable renderer design that yields performance superior to previous methods. Differentiable rendering is a technique that allows for the generation of realistic images and their derivatives with respect to the underlying scene parameters.",
        authors: [
          "Samuli Laine",
          "Janne Hellsten",
          "Tero Karras",
          "Yeongho Seol",
          "Jaakko Lehtinen",
          "Timo Aila",
        ],
      },
      {
        title:
          "A Practical Style Transfer Pipeline for 3D Animation: Insights from Production R&D",
        url: "https://arxiv.org/abs/2410.24123",
        description:
          "This paper presents the insights from the development process of a practical style transfer pipeline for creating stylized 3D animation. The paper discusses various options to balance quality, artist control, and workload, leading to several key decisions regarding patch-based texture synthesis, management of multiple colors within a scene, control of outlines and shadows, and reduction of temporal noise.",
        authors: [
          "Todo",
          "Hideki",
          "Koyama",
          "Yuki",
          "Sakai",
          "Kunihiro",
          "Komiya",
          "Akihiro",
          "Kato",
          "Jun",
        ],
      },
    ],
    summary:
      "These papers by Sankeerth Durvasula focus on 3D visualization techniques, including Gaussian Splatting and 3D Reconstruction. These documents explore both the optimization and acceleration of these techniques, as well as their applications in larger scales.",
    keyTopics: [
      "3D Visualization",
      "Gaussian Splatting",
      "3D Reconstruction",
      "Optimization",
      "Implicit Neural Representations",
    ],
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-6">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
        )}

        {results && (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex flex-row flex-wrap gap-3">
              {results.papers.map((item: Paper, index: number) => (
                <div
                  key={item.url}
                  className="flex flex-row justify-between items-start bg-background text-foreground rounded-md p-4 border-[1px] border-[#E2E8F0]/200 w-fit"
                >
                  <Link href={item.url} target="_blank">
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <h2
                          className="font-medium text-lg max-w-[25ch]"
                          title={item.title}
                        >
                          {turnacateString(item.title, 45)}
                        </h2>
                        <p className="max-w-prose text-ellipsis text-gray-400 text-sm">
                          {item.authors.length > 2
                            ? item.authors.slice(0, 2).join(", ") +
                              `, +${item.authors.length - 2}`
                            : item.authors.join(", ")}
                        </p>
                      </div>
                      {item.description && (
                        <p
                          className="font-[400] text-xs max-w-[40ch] text-ellipsis"
                          title={item.description}
                        >
                          {turnacateString(item.description, 65)}
                        </p>
                      )}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
            <div className="p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Summary</h2>
              <p className="">{results.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {results.keyTopics.map((topic: string) => (
                  <span
                    key={topic}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* {!results && !error && (
          <div className="max-w-2xl mx-auto text-center mt-20">
            <h1 className="text-3xl font-bold mb-4">
              Research Paper Discovery
            </h1>
            <p className="text-gray-600">
              Enter your research topic below to find relevant papers
            </p>
          </div>
        )} */}
      </div>

      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex gap-3">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What research papers are you looking for?"
              className="flex-1 p-3 border rounded-lg"
              required
            />
            <Button
              type="submit"
              className="px-6 py-3"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Searching...</span>
                </div>
              ) : (
                "Search"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
