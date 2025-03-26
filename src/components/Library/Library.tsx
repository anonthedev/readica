"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase";
import axios from "axios";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  // DropdownMenuLabel,
  // DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { EllipsisVertical, Plus, RefreshCcw, X } from "lucide-react";
import { Input } from "../ui/input";
import { arxivSearch } from "@/lib/searchFunctions";
import { LibraryItemType, SearchedPaperDetails } from "@/types/PaperTypes";
import MultiInput from "../ui/multi-input";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { turnacateString } from "@/lib/utils";
import Link from "next/link";

export default function Library() {
  const [library, setLibrary] = useState<any[]>([]);
  // const [paperDetails, setPaperDetails] =
  //   useState<SearchedPaperDetails | null>();
  const [authors, setAuthors] = useState<Set<string>>(new Set());
  const [currentAuthor, setCurrentAuthor] = useState("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [pdfLink, setPdfLink] = useState("");
  const [paperURL, setPaperURL] = useState("");
  // const [isRotating, setIsRotating] = useState(false);

  const [uploadPaperBtnDisabled, setUploadPaperBtnDisabled] =
    useState<Boolean>(true);

  const [loadingPapers, setLoadingPapers] = useState<Boolean>(true);
  const { data: session, status } = useSession();
  const router = useRouter();

  const supabase = supabaseClient(session?.supabaseAccessToken);

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

  async function getLib() {
    setLoadingPapers(true);
    try {
      const resp = await axios.get(
        `/api/library?userId=${encodeURI(session?.user.id)}`,
        {
          headers: {
            Authorization: "Bearer " + session?.supabaseAccessToken,
          },
        }
      );
      if (resp.status === 200) {
        setLibrary(resp.data);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoadingPapers(false);
    }
  }

  async function getPaperDetails() {
    // setLoadingDetails(true);
    try {
      const resp = await arxivSearch(paperURL);
      if (resp.data) {
        setTitle(resp.data[0].title);
        setDescription(resp.data[0].description);
        const authors = new Set(resp.data[0].authors);
        setAuthors(authors as Set<string>);
        setPdfLink(resp.data[0].pdf_link);
      }
      // setLoadingDetails(false);
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    if (paperURL) {
      getPaperDetails();
    }
  }, [paperURL]);

  async function postLib() {
    setUploadPaperBtnDisabled(true);
    try {
      const resp = await axios.post(
        `/api/library?userId=${encodeURI(session?.user.id)}`,
        {
          title: title,
          email: session?.user.email,
          authors: Array.from(authors),
          description: description,
          pdf_link: pdfLink,
        },
        {
          headers: {
            Authorization: "Bearer " + session?.supabaseAccessToken,
          },
        }
      );
      console.log("Paper Added Successfully");
      toast.success("Paper Added Successfully");
    } catch (error: unknown) {
      console.log(error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          console.log("Paper already present in your library");
          toast.error("Paper already present in your library");
        } else {
          toast.error("Something went wrong");
        }
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setUploadPaperBtnDisabled(true);
    }
  }

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session) {
    return <p>Redirecting to sign in...</p>;
  }

  return (
    <div className="pr-10 py-20 w-full flex flex-col gap-10">
      <div className="flex flex-row justify-between w-full">
        <h1 className="text-3xl font-bold">Library</h1>
        <div className="flex flex-row gap-4 items-center">
          <div
            className="cursor-pointer hover:bg-accent p-1.5 rounded-md duration-300"
            onClick={() => {
              getLib();
            }}
          >
            <RefreshCcw
              size={20}
              className={`${loadingPapers ? "animate-custom-spin" : ""}`}
            />
          </div>
          <Dialog>
            <DialogTrigger className="flex flex-row items-center gap-2 py-2 px-3 bg-purple hover:cursor-pointer hover:bg-dark-purple text-white rounded-lg duration-200">
              <Plus size={20} />
              Add Papers
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Paper</DialogTitle>
                <DialogDescription className="my-2 flex flex-col gap-2">
                  <div>
                    <Input
                      value={paperURL}
                      onChange={(e) => {
                        setPaperURL(e.target.value);
                      }}
                      placeholder="Enter Paper URL"
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <h2 className="font-semibold text-md">Paper Details:</h2>
                    <div className="flex flex-row gap-2 w-full">
                      <div className="w-1/2">
                        <label htmlFor="input">Title</label>
                        <Input
                          placeholder="Title"
                          value={title}
                          onChange={(e) => {
                            setTitle(e.target.value);
                          }}
                        />
                      </div>
                      <div className="w-1/2">
                        <label htmlFor="input">PDF Link of the Paper</label>
                        <Input
                          placeholder="PDF Link"
                          value={pdfLink}
                          onChange={(e) => {
                            setPdfLink(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="Input">Authors</label>
                      <MultiInput
                        setInputs={setAuthors}
                        inputs={authors}
                        currentInput={currentAuthor}
                        setCurrentInput={setCurrentAuthor}
                        placeholder={
                          "Press Enter after typing an Author's Name"
                        }
                      />
                      <div className="flex flex-row gap-2 flex-wrap my-2 max-h-[100px] overflow-y-auto">
                        {authors &&
                          authors.size > 0 &&
                          Array.from(authors).map((author) => (
                            <span
                              key={author}
                              className="flex flex-row gap-1 items-center justify-center w-fit bg-gray-800 text-xs rounded-md p-2 text-white text-center"
                            >
                              <p>{author}</p>

                              <X
                                size={12}
                                className="cursor-pointer"
                                onClick={() => {
                                  setAuthors((prevauthors) => {
                                    const newauthors = new Set(prevauthors);
                                    newauthors.delete(author);
                                    return newauthors;
                                  });
                                }}
                              />
                            </span>
                          ))}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="textarea">Description</label>
                      <Textarea
                        className="max-h-[100px] "
                        placeholder="description"
                        value={description}
                        onChange={(e) => {
                          setDescription(e.target.value);
                        }}
                      />
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button disabled={uploadPaperBtnDisabled} onClick={postLib}>
                  Upload Paper
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {!loadingPapers ? (
        <div className="w-full flex flex-row flex-wrap gap-6">
          {library.length > 0 ? (
            library.map((libItem) => (
              <LibraryItem item={libItem} key={libItem.uuid} />
            ))
          ) : (
            <div>No items in your library</div>
          )}
        </div>
      ) : (
        <div>Loading....</div>
      )}
    </div>
  );
}

function LibraryItem({ item }: { item: LibraryItemType }) {
  const [tags, setTags] = useState<Set<string>>(new Set());
  const [currentTag, setCurrentTag] = useState("");
  const [updatingItem, setUpdatingItem] = useState<Boolean>(false);

  const { data: session } = useSession();

  useEffect(() => {
    if (item.tags) {
      setTags(new Set(item.tags));
      console.log(item.tags);
    }
  }, []);

  async function updateItemTags(item: LibraryItemType) {
    setUpdatingItem(true);
    try {
      const resp = await axios.put(
        `/api/library?uuid=${encodeURIComponent(item.uuid)}&userId=${
          session?.user.id
        }`,

        { tags: Array.from(tags) },
        {
          headers: {
            Authorization: "Bearer " + session?.supabaseAccessToken,
          },
        }
      );
      toast.success("Tags Updated");
    } catch (e) {
      if (axios.isAxiosError(e)) {
        console.log(e.response?.data);
        toast.error("Something went wrong");
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setUpdatingItem(false);
    }
  }

  return (
    <div
      key={item.uuid}
      className="flex flex-row justify-between items-start bg-white rounded-md p-4 border-[1px] border-[#E2E8F0]/200"
    >
      <Link href={"#"}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="font-medium text-lg max-w-[25ch]">
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
          <p className="flex flex-row gap-1">
            {item.tags &&
              item.tags.length !== 0 &&
              item.tags.map((tag) => (
                <span
                  key={tag}
                  className=" text-xs bg-[#78787814] rounded-md py-1 px-2 text-[#646464] text-center"
                >
                  {tag}
                </span>
              ))}
          </p>
        </div>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <EllipsisVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
            <Dialog>
              <DialogTrigger asChild onClick={() => {}}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTags(new Set(item.tags));
                  }}
                  className="w-full text-left"
                >
                  Edit Tags
                </button>
              </DialogTrigger>
              <DialogContent onKeyDown={(e) => e.stopPropagation()}>
                <DialogHeader className="flex flex-col gap-2">
                  <DialogTitle title={`Set reading status of ${item.title}`}>
                    Set tags for {turnacateString(item.title, 30)}
                  </DialogTitle>
                  <DialogDescription className="flex flex-col gap-2">
                    <span>Maximum of 5 tags can be set to a paper.</span>
                    <span className="flex flex-row gap-2 flex-wrap">
                      {tags &&
                        tags.size > 0 &&
                        Array.from(tags).map((tag) => (
                          <span
                            key={tag}
                            className="flex flex-row gap-1 items-center justify-center w-fit bg-gray-800 text-xs rounded-md p-2 text-white text-center"
                          >
                            <span>{tag}</span>

                            <X
                              size={12}
                              className="cursor-pointer"
                              onClick={() => {
                                setTags((prevTags) => {
                                  const newTags = new Set(prevTags);
                                  newTags.delete(tag);
                                  return newTags;
                                });
                              }}
                            />
                          </span>
                        ))}
                    </span>
                    <MultiInput
                      inputs={tags}
                      setCurrentInput={setCurrentTag}
                      currentInput={currentTag}
                      setInputs={setTags}
                      maxInputs={5}
                      placeholder="Press Enter after typing a tag"
                    />
                    <Button
                      className="w-fit self-center"
                      disabled={updatingItem}
                      onClick={() => {
                        updateItemTags(item);
                      }}
                    >
                      {updatingItem ? "Updating..." : "Save"}
                    </Button>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
