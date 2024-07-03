"use client";

import { arxivSearch } from "@/utils/paperSearchFuntions";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { SearchedPaperDetails, LibraryItem } from "@/utils/types";
import { Ellipsis } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";

export default function Dashboard() {
  // const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchedPaperDetails[]>([]);
  const [library, setLibrary] = useState<LibraryItem[]>();

  const searchParams = useSearchParams();
  const router = useRouter();

  const { getToken, userId } = useAuth();

  const query = searchParams.get("q") || "";

  useEffect(() => {
    getLib();
  }, []);

  async function handleSearch(e: React.FormEvent) {
    if (query.length > 2) {
      e.preventDefault();
      setLoading(true);
      try {
        const result = await arxivSearch(query);
        setResults(result.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }
  }

  async function getLib() {
    const token = await getToken({ template: "supabase" });
    await axios
      .get(`/api/library?userId=${userId}&token=${token}`)
      .then((resp) => {
        console.log(resp.data);
        setLibrary(resp.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async function addToLib(paperDetails: SearchedPaperDetails) {
    const token = await getToken({ template: "supabase" });
    await axios.post(`/api/library?userId=${userId}`, {
      token: token,
      title: paperDetails.title,
      description: paperDetails.summary,
      authors: paperDetails.authors,
      pdf_link: paperDetails.pdfLink,
    });
  }

  return (
    <div>
      <form
        onSubmit={handleSearch}
        className="w-full flex flex-row gap-2 items-center justify-center md:flex-col"
      >
        <Input
          className="w-1/2 md:w-2/3"
          placeholder="Search for research papers (type atleast 3 letters)"
          value={query}
          onChange={(e) => {
            if (e.target.value.length > 0) {
              router.push(`?q=${encodeURIComponent(e.target.value)}`);
            }
          }}
        />
        <Button
          variant="default"
          type="submit"
          disabled={loading}
          className="bg-gradient-to-b from-[#F8FAFC] to-[#949596]"
        >
          Search
        </Button>
      </form>
      <div className="max-w-prose flex flex-col gap-4 px-5">
        {results.length !== 0 &&
          results.map((entry, index) => (
            <div className="flex flex-row gap-2 items-start">
              <a href={entry.pdfLink} target="_blank" key={index}>
                <h2 className="font-bold">{entry.title}</h2>
                <p className="text-sm">
                  {entry.summary.length > 120
                    ? entry.summary.slice(0, 120) + "..."
                    : entry.summary}
                </p>
                <p>
                  <strong>Authors:</strong> {entry.authors.join(", ")}
                </p>
                <p>
                  <strong>Published:</strong> {entry.published}
                </p>
                <p>
                  <strong>Updated:</strong> {entry.updated}
                </p>
              </a>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Ellipsis />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      addToLib(entry);
                    }}
                  >
                    Add to my library
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
      </div>

      <div>
        {library &&
          library.length > 0 &&
          library.map((item) => (
            <div key={item.pdf_link}>
              <h2>{item.title}</h2>
              <p>{item.authors.join(", ")}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
