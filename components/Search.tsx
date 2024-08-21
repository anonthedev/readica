"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Ellipsis, ChevronDown, File } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  useSearchParams,
  useRouter,
  usePathname,
  useParams,
} from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
  useContext,
  useRef,
  useCallback,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { useToast } from "@/components/ui/use-toast";
import { LibraryItemType, SearchedPaperDetails } from "@/utils/types";
import { arxivSearch } from "@/utils/paperSearchFuntions";
import { addToLib, getLib } from "@/utils/supabaseFunctions";
import { libraryContext } from "@/components/Dashboard/Dashboard";
import axios from "axios";
import { useDebounce } from "@/hooks/useDebounce";
import { User } from "@clerk/nextjs/server";
import Link from "next/link";

export default function Search() {
  const [results, setResults] = useState<{
    papers: SearchedPaperDetails[];
    users: User[];
  } | null>(null);
  const [tempSearchQuery, setTempSearchQuery] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [searchDomain, setSearchDomain] = useState<"library" | "global">(
    "library"
  );
  const [searching, setSearching] = useState(false);

  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  const { getToken, userId } = useAuth();
  const { toast } = useToast();
  const debouncedSearchQuery = useDebounce(tempSearchQuery, 300);
  const abortControllerRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  // const { setLibrary } = useContext(libraryContext);

  useEffect(() => {
    const query = searchParams.get("q") || "";
    if (query.length > 0) {
      setTempSearchQuery(query);
    }
  }, [searchParams]);

  useEffect(() => {
    if (debouncedSearchQuery.length > 2) {
      router.push(`?q=${encodeURIComponent(debouncedSearchQuery)}`);
    } else if (debouncedSearchQuery.length === 0) {
      router.push(pathname);
      setResults(null);
    }
  }, [debouncedSearchQuery]);

  useEffect(() => {
    handleSearch();

    return () => {
      // Cancel any ongoing search when component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [searchParams]);

  async function handleLibSearch() {
    const query = searchParams.get("q") || "";
    if (query.length > 2) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      try {
        const lib = await getLibrary();
        if (lib) {
        }
      } catch {}
    }
  }

  async function handleSearch() {
    setSearching(true);
    setResults(null);
    const query = searchParams.get("q") || "";
    if (query.length > 2) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      setLoading(true);
      try {
        const usersResult = await axios.get(`/api/users/search?query=${query}`);
        let users;
        if (usersResult.data.success) {
          users = usersResult.data.users;
        }
        const paperResults = await arxivSearch(
          query,
          abortControllerRef.current.signal
        );
        setResults({ papers: paperResults.data, users: users });
        console.log({ papers: paperResults.data, users: users });
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
        setSearching(false);
      }
    }
  }

  async function getLibrary() {
    const token = await getToken({ template: "supabase" });

    const resp = await axios.get(`/api/library?userId=${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (resp.data.success) {
      console.log(resp.data);
      const sortedArr = resp.data.library.sort(
        (a: LibraryItemType, b: LibraryItemType) => {
          const dateA = new Date(a.upload_date);
          const dateB = new Date(b.upload_date);

          return dateB.getTime() - dateA.getTime();
        }
      );

      return sortedArr;
      // setLibrary(sortedArr);
    } else {
      toast({
        title: "Couldn't fetch library",
        description: resp.data.message,
      });

      return null;
    }
  }

  const handleInputFocus = useCallback(() => {
    setIsInputFocused(true);
  }, []);

  const handleInputBlur = useCallback((e: React.FocusEvent) => {
    // Check if the click happened inside the results div
    if (
      resultsRef.current &&
      !resultsRef.current.contains(e.relatedTarget as Node)
    ) {
      setIsInputFocused(false);
    }
  }, []);

  const handleLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsInputFocused(true);
  };

  return (
    <section className="flex flex-col relative">
      <div className="flex flex-row gap-0">
        <Input
          className="w-[300px] rounded-r-none md:w-1/2"
          placeholder="Search Research Papers & Users"
          value={tempSearchQuery}
          onChange={(e) => {
            setTempSearchQuery(e.target.value);
          }}
          ref={inputRef}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />
        <Select
          defaultValue="library"
          onValueChange={(e) => {
            setSearchDomain(e as "library" | "global");
          }}
        >
          <SelectTrigger className="w-[125px] rounded-l-none">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="library">Your Library</SelectItem>
            <SelectItem value="global">Global</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {results && !searching ? (
        <div
        ref={resultsRef}
          className={`${
            isInputFocused ? "absolute" : "hidden"
          } top-10 w-full bg-white rounded-md shadow-[0px_4px_20px_0px_#00000033] p-6 flex flex-col gap-8`}
        >
          {results.papers && results.papers.length !== 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-[#525252]">Papers</span>
              {results.papers.slice(0, 3).map((paper) => (
                <>
                  <Link
                    href={paper.pdf_link}
                    target="_blank"
                    className="flex flex-row gap-2 items-center"
                    onMouseDown={handleLinkClick}
                  >
                    <File strokeWidth={1} size={20} />
                    <span className="w-full text-ellipsis">
                      {paper.title.length > 40
                        ? paper.title.slice(0, 40) + "..."
                        : paper.title}
                    </span>
                  </Link>
                  <hr />
                </>
              ))}
            </div>
          )}

          {results.users && results.users.length !== 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-[#525252]">Users</span>
              {results.users.map((user) => {
                const lastName = user.lastName ? user.lastName : "";
                const displayName = user.firstName + " " + lastName;
                return (
                  <>
                    <Link
                      href={`/p/${user.username}`}
                      target="_blank"
                      className="flex flex-row gap-2 items-center w-full"
                      onMouseDown={handleLinkClick}
                    >
                      <img
                        src={user.imageUrl}
                        className="w-5 h-5 rounded-full"
                      />
                      {displayName}
                    </Link>
                    <hr />
                  </>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        searching &&
        searchParams.get("q") && (
          <div
            className={`${
              isInputFocused ? "absolute" : "hidden"
            } top-10 w-full bg-white rounded-md shadow-[0px_4px_20px_0px_#00000033] p-6 flex flex-col gap-8`}
          >
            Loading...
          </div>
        )
      )}
      {/* </div> */}
    </section>
  );
}
