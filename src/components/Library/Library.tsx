"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
// import { supabaseClient } from "@/lib/supabase";
import axios from "axios";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { FilterIcon, Plus, RefreshCcw, X } from "lucide-react";
import { Input } from "../ui/input";
import { arxivSearch } from "@/lib/searchFunctions";
import { extractPDFMetadata } from "@/lib/utils";

import MultiInput from "../ui/multi-input";
import { Textarea } from "../ui/textarea";
import { useRef } from "react";
import { toast } from "sonner";
import LibraryItem from "@/components/Library/LibraryItem";
import LibraryLoading from "@/components/Library/LibraryLoading";
import { LibraryItemType } from "@/types/PaperTypes";

export default function Library() {
  const [library, setLibrary] = useState<LibraryItemType[]>([]);
  const [authors, setAuthors] = useState<Set<string>>(new Set());
  const [currentAuthor, setCurrentAuthor] = useState("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [pdfLink, setPdfLink] = useState("");
  const [paperURL, setPaperURL] = useState("");
  const [allTags, setAllTags] = useState<Set<string>>(new Set());
  const [uploadPaperDialogOpen, setUploadPaperDialogOpen] = useState(false);

  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  const [uploadPaperBtnDisabled, setUploadPaperBtnDisabled] =
    useState<boolean>(true);

  const [loadingPapers, setLoadingPapers] = useState<boolean>(true);
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // const supabase = supabaseClient(session?.supabaseAccessToken);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status == "authenticated" && session) {
      getLib();
    }
  }, []);

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
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    if (window.location.search !== `?${params.toString()}`) {
      router.replace(newUrl);
    }
  }, [selectedTags, router]);

  useEffect(() => {
    const tagsParam = searchParams.get("tags");
    if (tagsParam) {
      setSelectedTags(new Set(tagsParam.split(",")));
    } else {
      setSelectedTags(new Set());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("tags")]);

  async function getLib() {
    setLoadingPapers(true);
    try {
      const resp = await axios.get(
        `/api/library?userId=${encodeURI(session?.user.id as string)}`,
        {
          headers: {
            Authorization: "Bearer " + session?.supabaseAccessToken,
          },
        }
      );
      if (resp.status === 200) {
        setLibrary(resp.data);
        resp.data.map((item: LibraryItemType) => {
          if (item.tags && item.tags.length > 0) {
            item.tags.forEach((tag) => {
              setAllTags((prevTags) => new Set(prevTags).add(tag));
            });
          }
        });
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoadingPapers(false);
    }
  }

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

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      toast.error("No file selected");
      return;
    }
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are supported");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error("File size should be less than 15MB");
      return;
    }
    setIsUploading(true);
    try {
      const metadata = await extractPDFMetadata(file);
      const extractedTitle = metadata.title || "";
      const extractedAuthors = metadata.authors && metadata.authors.length > 0 ? new Set<string>(metadata.authors) : new Set<string>();
      const extractedDescription = metadata.subject || "";
      setTitle(extractedTitle);
      setAuthors(extractedAuthors);
      setDescription(extractedDescription);
      setSelectedFile(file);
    } catch (error: any) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.error(
        error?.response?.data?.error || error.message || "Failed to extract metadata"
      );
    } finally {
      setIsUploading(false);
    }
  }

  function handleRemoveFile() {
    setSelectedFile(null);
    setTitle("");
    setDescription("");
    setAuthors(new Set());
    setPdfLink("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const [usingLink, setUsingLink] = useState(false);

  async function handleConfirmUpload() {
    if (!selectedFile && !paperURL) {
      toast.error("No file or link provided");
      return;
    }
    setIsUploading(true);
    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadResp = await axios.post("https://readica-backend-production.up.railway.app/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const fileId = uploadResp.data.fileId;
        const paperDetails = {
          title,
          description,
          authors: Array.from(authors),
          file_id: fileId,
          email: session?.user.email,
        };
        await axios.post(
          "/api/library",
          paperDetails,
          {
            headers: {
              Authorization: "Bearer " + session?.supabaseAccessToken,
            },
          }
        );
      } else if (paperURL) {
        const paperDetails = {
          title,
          description,
          authors: Array.from(authors),
          pdf_link: paperURL,
          email: session?.user.email,
        };
        await axios.post(
          "/api/library",
          paperDetails,
          {
            headers: {
              Authorization: "Bearer " + session?.supabaseAccessToken,
            },
          }
        );
      }
      toast.success("Paper uploaded and added to library");
      getLib();
      setUploadPaperDialogOpen(false);
      handleRemoveFile();
      setPaperURL("");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error || error.message || "Upload failed"
      );
    } finally {
      setIsUploading(false);
    }
  }

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session) {
    return <p>Redirecting to sign in...</p>;
  }

  function filterItemsByTags(
    items: LibraryItemType[],
    selectedTags: Set<string>
  ) {
    if (selectedTags.size === 0) return items;

    return items.filter((item) =>
      Array.from(selectedTags).every((tag) => item.tags?.includes(tag))
    );
  }

  return (
    <div className="py-20 w-full flex flex-col gap-10">
      <div className="flex flex-row justify-between w-full items-center">
        <h1 className="text-3xl font-bold">Library</h1>
        <div className="flex flex-row gap-4 items-center">
          <div
            className="cursor-pointer hover:bg-accent p-1.5 rounded-md duration-200"
            onClick={() => {
              getLib();
            }}
          >
            <RefreshCcw
              size={20}
              className={`${
                loadingPapers ? "animate-custom-spin" : ""
              } text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 duration-200`}
            />
          </div>
          <Dialog
            open={uploadPaperDialogOpen}
            onOpenChange={setUploadPaperDialogOpen}
          >
            <DialogTrigger className="flex flex-row items-center gap-2 py-1.5 px-3 bg-purple hover:cursor-pointer hover:bg-dark-purple text-white rounded-lg duration-200">
              <Plus size={20} />
              Add Papers
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Paper</DialogTitle>
                <div className="my-2 flex flex-col gap-2">
                  <div>
                    <Input
                      value={paperURL}
                      onChange={(e) => {
                        setPaperURL(e.target.value);
                        setUsingLink(e.target.value !== "");
                        if (e.target.value !== "") {
                          setSelectedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }
                      }}
                      placeholder="Enter Paper URL"
                      disabled={selectedFile !== null}
                    />
                    {paperURL && (
                      <Button type="button" variant="outline" size="sm" onClick={() => { setPaperURL(""); setUsingLink(false); }}>
                        Clear Link
                      </Button>
                    )}
                  </div>

                  <div className="flex flex-col gap-3">
                    <h2 className="font-semibold text-md">Paper Details:</h2>
                    <div className="flex flex-col gap-2 w-full md:flex-row">
                      <div className="w-full md:w-1/2">
                        <label htmlFor="input">Title <span style={{color: 'red'}}>*</span></label>
                        <Input
                          placeholder="Title"
                          value={title}
                          onChange={(e) => {
                            setTitle(e.target.value);
                          }}
                          required
                          className={title === "" ? "border-red-500" : ""}
                        />
                        {title === "" && (
                          <span className="text-xs text-red-500">Title is required</span>
                        )}
                      </div>
                      <div className="w-full md:w-1/2">
                        <label htmlFor="input">Authors</label>
                        <MultiInput
                          inputs={authors}
                          setInputs={setAuthors}
                          currentInput={currentAuthor}
                          setCurrentInput={setCurrentAuthor}
                          placeholder="Add author(s)"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="input">Description</label>
                      <Textarea
                      className="max-h-[100px]"
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label>Upload PDF File</label>
                    {selectedFile ? (
                      <div className="flex flex-row items-center gap-2">
                        <span className="truncate max-w-xs">{selectedFile.name}</span>
                        <Button type="button" variant="outline" size="sm" onClick={handleRemoveFile}>
                          Remove File
                        </Button>
                      </div>
                    ) : (
                      <Input
                        type="file"
                        accept="application/pdf"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        disabled={usingLink}
                      />
                    )}
                  </div>

                  <DialogFooter>
                    <Button
                      onClick={handleConfirmUpload}
                      disabled={isUploading || (!selectedFile && !paperURL) || title === ""}
                      className="bg-purple text-white hover:bg-dark-purple"
                    >
                      {isUploading ? "Uploading..." : "Confirm & Upload"}
                    </Button>
                  </DialogFooter>
                </div>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {!loadingPapers ? (
        <section className="flex flex-col gap-4">
          <div>
            {allTags && (
              <div className="flex flex-row flex-wrap items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex">
                      <FilterIcon />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent className="">
                    {Array.from(allTags).length > 0 ? (
                      Array.from(allTags).map((tag) => (
                        <DropdownMenuItem
                          key={tag}
                          onClick={() => {
                            setSelectedTags((prevTags) =>
                              new Set(prevTags).add(tag)
                            );
                          }}
                        >
                          {tag}
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <DropdownMenuItem disabled>
                        No tags available
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {selectedTags &&
                  Array.from(selectedTags).map((tag) => (
                    <span
                      key={tag}
                      className="flex flex-row gap-1 items-center justify-center w-fit bg-purple text-xs rounded-md p-2 text-white text-center"
                    >
                      <span>{tag}</span>

                      <X
                        size={12}
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedTags((prevTags) => {
                            const newTags = new Set(prevTags);
                            newTags.delete(tag);
                            return newTags;
                          });
                        }}
                      />
                    </span>
                  ))}
              </div>
            )}
          </div>
          <Suspense fallback={<LibraryLoading />}>
            <div className="w-full flex flex-row flex-wrap gap-6 flex-grow overflow-y-auto">
              {library.length > 0 ? (
                filterItemsByTags(library, selectedTags).map((item) => (
                  <LibraryItem key={item.uuid} item={item} />
                ))
              ) : (
                <div>No items in your library</div>
              )}
            </div>
          </Suspense>
        </section>
      ) : (
        <div>Loading....</div>
      )}
    </div>
  );
}
