"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense, useRef } from "react";
import axios from "axios";
import LibraryHeader from "./LibraryHeader";
import TagFilter from "./TagFilter";
import LibraryList from "./LibraryList";
import LibraryUploadDialog from "./LibraryUploadDialog";
import { useLibraryStore } from "@/store/libraryStore";
import { arxivSearch } from "@/lib/searchFunctions";
import { LibraryItemType } from "@/types/PaperTypes";
import { useLibrary } from "@/hooks/use-library";

export default function Library() {
  const [authors, setAuthors] = useState<Set<string>>(new Set());
  const [currentAuthor, setCurrentAuthor] = useState("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [pdfLink, setPdfLink] = useState("");
  const [paperURL, setPaperURL] = useState("");
  const [allTags, setAllTags] = useState<Set<string>>(new Set());
  const [uploadPaperBtnDisabled, setUploadPaperBtnDisabled] =
    useState<boolean>(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [usingLink, setUsingLink] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { library, isError, isLoading } = useLibrary();
  const setLibrary = useLibraryStore((state) => state.setLibrary);
  const loadingPapers = useLibraryStore((state) => state.loadingPapers);
  const setLoadingPapers = useLibraryStore((state) => state.setLoadingPapers);
  const selectedTags = useLibraryStore((state) => state.selectedTags);
  const setSelectedTags = useLibraryStore((state) => state.setSelectedTags);
  const uploadPaperDialogOpen = useLibraryStore(
    (state) => state.uploadPaperDialogOpen
  );
  const setUploadPaperDialogOpen = useLibraryStore(
    (state) => state.setUploadPaperDialogOpen
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState<"title" | "author">("title");

  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (library) {
      setLibrary(library);
    }
  }, [library, setLibrary]);

  useEffect(() => {
    if (paperURL == "" || title == "" || pdfLink == "") {
      setUploadPaperBtnDisabled(true);
    } else {
      setUploadPaperBtnDisabled(false);
    }
  }, [title, authors, pdfLink, paperURL]);

  useEffect(() => {
    const tagsArr = Array.from(selectedTags);
    const params = new URLSearchParams(window.location.search);
    if (tagsArr.length > 0) {
      params.set("tags", tagsArr.join(","));
    } else {
      params.delete("tags");
    }
    if (searchQuery.trim() !== "") {
      params.set("search", searchQuery);
    } else {
      params.delete("search");
    }
    if (searchField !== "title") {
      params.set("field", searchField);
    } else {
      params.delete("field");
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    if (window.location.search !== `?${params.toString()}`) {
      router.replace(newUrl);
    }
  }, [selectedTags, searchQuery, searchField, router]);

  useEffect(() => {
    const tagsParam = searchParams.get("tags");
    if (tagsParam) {
      setSelectedTags(new Set(tagsParam.split(",")));
    } else {
      setSelectedTags(new Set());
    }
    const urlSearch = searchParams.get("search") || "";
    setSearchQuery(urlSearch);
    const urlField = searchParams.get("field") as "title" | "author";
    setSearchField(urlField === "author" ? "author" : "title");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("tags"), searchParams.get("search"), searchParams.get("field")]);

  async function getPaperDetails() {
    try {
      const resp = await arxivSearch(paperURL);
      if (resp.data) {
        const data = resp.data as {
          title: string;
          description: string;
          authors: string[];
          pdf_link: string;
        }[];
        setTitle(data[0].title);
        setDescription(data[0].description);
        const authors = new Set(data[0].authors);
        setAuthors(authors as Set<string>);
        setPdfLink(data[0].pdf_link);
      }
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    setTitle("");
    setDescription("");
    setAuthors(new Set());
    setPdfLink("");
    if (paperURL.includes("arxiv.org")) {
      getPaperDetails();
    }
  }, [paperURL]);

  return (
    <div className="py-20 w-full flex flex-col gap-2">
      <LibraryHeader
        onOpenUploadDialog={() => setUploadPaperDialogOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchField={searchField}
        setSearchField={setSearchField}
        // onRefresh={() => queryClient.invalidateQueries({ queryKey: ["library"] })}
      />
      <LibraryUploadDialog session={session} />
      <TagFilter allTags={allTags} />
      <LibraryList
        filter={(item) =>
          Array.from(selectedTags).every((tag) => item.tags?.includes(tag)) &&
          (searchQuery.trim() === "" ||
            (searchField === "title"
              ? item.title?.toLowerCase().includes(searchQuery.toLowerCase())
              : item.authors && item.authors.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()))
            )
          )
        }
      />
    </div>
  );
}
