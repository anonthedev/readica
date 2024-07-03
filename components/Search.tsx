import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Ellipsis, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useToast } from "@/components/ui/use-toast";
import { SearchedPaperDetails } from "@/utils/types";
import { arxivSearch } from "@/utils/paperSearchFuntions";
import { addToLib } from "@/utils/supabaseFunctions";

export default function Search() {
  const [results, setResults] = useState<SearchedPaperDetails[]>([]);
  const [tempSearchQuery, setTempSearchQuery] = useState("");
  const [collapseSearchResults, setCollapseSearchResults] = useState(false);
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { getToken, userId } = useAuth();
  const { toast } = useToast();

  useMemo(() => {
    handleSearch();
  }, [query]);

  async function handleSearch() {
    if (query.length > 2) {
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

  async function handleAddToLib(paperDetails: SearchedPaperDetails) {
    const token = await getToken({ template: "supabase" });
    if (!token || !userId) {
      toast({ title: "Please login/signup first" });
      return;
    }

    const result = await addToLib(paperDetails, token, userId);

    if (result.success) {
      toast({ title: "Paper added to library successfully" });
    } else {
      if (result.code === "23505") {
        toast({ title: "Paper is already in your library" });
      } else {
        toast({
          title: "Something went wrong",
          description: result.message || result.error,
        });
      }
    }
  }

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
        className="w-full flex flex-row gap-2 items-center justify-center md:flex-col"
      >
        <Input
          className="w-1/2 md:w-2/3"
          placeholder="Search for research papers (type atleast 3 letters)"
          value={tempSearchQuery}
          onChange={(e) => {
            setTempSearchQuery(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (tempSearchQuery !== "") {
                router.push(`?q=${tempSearchQuery}`);
              }
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
      <div className="mt-8 flex flex-col gap-4">
        {results.length > 0 && (
          <div
            className={`w-fit text-gray-500 cursor-pointer`}
            onClick={() => {
              setCollapseSearchResults(!collapseSearchResults);
            }}
          >
            <span className="flex flex-row gap-2">
              <ChevronDown
                className={`${
                  collapseSearchResults ? "-rotate-90" : "rotate-0"
                }`}
              />
              {collapseSearchResults
                ? "Show Search Results"
                : "Collapse Search Results"}
            </span>
          </div>
        )}
        <div
          className={`w-full grid-cols-2 gap-5 items-center justify-center ${
            collapseSearchResults ? "hidden" : "grid"
          }`}
        >
          {results.length !== 0 &&
            results.map((entry, index) => (
              <div className="flex flex-row gap-2 items-start max-w-prose">
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
                      onClick={async () => {
                        handleAddToLib(entry)
                      }}
                    >
                      Add to my library
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
