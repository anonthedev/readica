"use client";

import { turnacateString } from "@/lib/utils";
import axios from "axios";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import ReactMarkdown from "react-markdown";

interface SearchResults {
  citations: {
    id: string;
    title: string;
    url: string;
    author: string;
    publishedDate: string;
    image: string;
    favicon?: string;
  }[];
  content: string;
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
      console.log(err)
    } finally {
      setLoading(false);
    }
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
              {results.citations.map((item) => (
                <div
                  key={item.url}
                  className="flex flex-row justify-between items-start bg-background text-foreground rounded-md p-4 border-[1px] border-[#E2E8F0]/200 w-fit"
                >
                  <Link href={item.url} target="_blank">
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex flex-row gap-2 items-center">
                          {item.favicon && (
                            <img
                              src={item.favicon}
                              alt=""
                              className="h-fit aspect-square rounded-full w-[25px]"
                            />
                          )}
                          <h2
                            className="font-medium text-lg max-w-[25ch]"
                            title={item.title ? item.title : item.url}
                          >
                            {turnacateString(item.title, 45)}
                          </h2>
                        </div>
                        <p className="max-w-prose text-ellipsis text-gray-400 text-sm">
                          {item.author}
                        </p>
                      </div>
                      {/* {item.description && (
                        <p
                          className="font-[400] text-xs max-w-[40ch] text-ellipsis"
                          title={item.description}
                        >
                          {turnacateString(item.description, 65)}
                        </p>
                      )} */}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
            <div className="p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Summary</h2>
              <ReactMarkdown
                components={{
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#7732E8",
                        textDecoration: "underline",
                        fontWeight: "bold",
                      }}
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {results.content}
              </ReactMarkdown>
              <div className="mt-4 flex flex-wrap gap-2">
                {/* {results.keyTopics.map((topic: string) => (
                  <span
                    key={topic}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {topic}
                  </span>
                ))} */}
              </div>
            </div>
          </div>
        )}

        {!results && (
          <div className="w-full flex-col flex text-center h-full items-center justify-center">
            <h1 className="text-3xl font-bold mb-4">
              Research Paper Discovery
            </h1>
            <p className="text-gray-600">
              Enter your research topic below to find relevant papers
            </p>
          </div>
        )}
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
            <Button type="submit" className="px-6 py-3" disabled={loading}>
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
