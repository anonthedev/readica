"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { parseXml } from "@/utils/xmlParser";
import { Entry } from "@/utils/types";
import axios from "axios";

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Entry[]>([]);

  async function getPapers() {
    setLoading(true);
    axios
      .get(`https://export.arxiv.org/api/query?search_query=all:${query}`)
      .then((resp) => {
        console.log(resp.data);
        setResults(parseXml(resp.data));
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }

  return (
    <main className="w-screen min-h-screen flex flex-col gap-5 items-center mt-64 md:">
      <h1 className="text-3xl font-bold">Search research papers</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          getPapers();
        }}
        className="w-full flex flex-row gap-2 items-center justify-center md:flex-col"
      >
        <Input
          className="w-1/4 md:w-2/3"
          placeholder="Search for research papers"
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button variant="default" type="submit" disabled={loading}>
          {loading ? "Loading..." : "Search"}
        </Button>
      </form>
      <div className="max-w-prose flex flex-col gap-4 px-5">
        {results.map((entry, index) => (
          <div key={index}>
            <h2 className="font-bold">{entry.title}</h2>
            <p className="text-sm">{entry.summary.length > 120 ? entry.summary.slice(0, 120) + "..." : entry.summary}</p>
            <p>
              <strong>Authors:</strong> {entry.authors.join(", ")}
            </p>
            <p>
              <strong>Published:</strong> {entry.published}
            </p>
            <p>
              <strong>Updated:</strong> {entry.updated}
            </p>
            <p>
              <a className="text-blue-500 underline" href={entry.id} target="_blank" rel="noopener noreferrer">
                Link
              </a>
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
