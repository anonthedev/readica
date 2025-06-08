"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import LibraryHeader from "./LibraryHeader";
import TagFilter from "./TagFilter";
import StatusFilter from "./StatusFilter";
import LibraryList from "./LibraryList";
import LibraryUploadDialog from "./LibraryUploadDialog";
import { useLibraryStore } from "@/store/libraryStore";
import { useLibrary } from "@/hooks/use-library";
import { LibraryItemType } from "@/types/PaperTypes";

export default function Library() {
  const [allTags, setAllTags] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState<"title" | "author">("title");

  const { library } = useLibrary();
  const setLibraryState = useLibraryStore((state) => state.setLibrary);
  const selectedTags = useLibraryStore((state) => state.selectedTags);
  const setSelectedTags = useLibraryStore((state) => state.setSelectedTags);
  const selectedStatuses = useLibraryStore((state) => state.selectedStatuses);
  const setSelectedStatuses = useLibraryStore((state) => state.setSelectedStatuses);
  const setUploadPaperDialogOpen = useLibraryStore(
    (state) => state.setUploadPaperDialogOpen
  );

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
      setLibraryState(library);
      const uniqueTags = new Set<string>();
      library.forEach((item: LibraryItemType) => {
        item.tags?.forEach((tag: string) => uniqueTags.add(tag));
      });
      setAllTags(uniqueTags);
    }
  }, [library, setLibraryState]);

  useEffect(() => {
    const tagsArr = Array.from(selectedTags);
    const params = new URLSearchParams(window.location.search);
    if (tagsArr.length > 0) {
      params.set("tags", tagsArr.join(","));
    } else {
      params.delete("tags");
    }
    const statusesArr = Array.from(selectedStatuses);
    if (statusesArr.length > 0) {
      params.set("statuses", statusesArr.join(","));
    } else {
      params.delete("statuses");
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
  }, [selectedTags, selectedStatuses, searchQuery, searchField, router]);

  useEffect(() => {
    const tagsParam = searchParams.get("tags");
    if (tagsParam) {
      setSelectedTags(new Set(tagsParam.split(",")));
    } else {
      setSelectedTags(new Set());
    }
    const statusesParam = searchParams.get("statuses");
    if (statusesParam) {
      setSelectedStatuses(new Set(statusesParam.split(",")));
    } else {
      setSelectedStatuses(new Set());
    }
    const urlSearch = searchParams.get("search") || "";
    setSearchQuery(urlSearch);
    const urlField = searchParams.get("field") as "title" | "author";
    setSearchField(urlField === "author" ? "author" : "title");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchParams.get("tags"),
    searchParams.get("statuses"),
    searchParams.get("search"),
    searchParams.get("field"),
  ]);

  return (
    <div className="py-12 w-full flex flex-col gap-4 max-w-7xl mx-auto px-4 md:px-6">
      <LibraryHeader
        onOpenUploadDialog={() => setUploadPaperDialogOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchField={searchField}
        setSearchField={setSearchField}
      />
      <LibraryUploadDialog session={session} />
      <TagFilter allTags={allTags} />
      <StatusFilter/>
      <LibraryList
        filter={(item) => {
          const matchesTags = selectedTags.size === 0 || Array.from(selectedTags).every((tag) => item.tags?.includes(tag));
          const matchesSearch = searchQuery.trim() === "" ||
            (searchField === "title"
              ? item.title?.toLowerCase().includes(searchQuery.toLowerCase())
              : item.authors &&
                item.authors.some((a) =>
                  a.toLowerCase().includes(searchQuery.toLowerCase())
                ));
          const matchesStatus = selectedStatuses.size === 0 || (item.status ? selectedStatuses.has(item.status) : selectedStatuses.has("none")); // Assuming 'none' or similar if item.status is null/undefined and user wants to filter by 'no status'
          return matchesTags && matchesSearch && matchesStatus;
        }}
      />
    </div>
  );
}
