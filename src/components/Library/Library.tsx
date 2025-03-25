"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase";
import axios, { AxiosError } from "axios";
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
import { Plus, X } from "lucide-react";
import { Input } from "../ui/input";
import { arxivSearch } from "@/lib/searchFunctions";
import { SearchedPaperDetails } from "@/types/PaperTypes";
import MultiInput from "../ui/multi-input";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";

export default function Library() {
  const [library, setLibrary] = useState<any[]>([]);
  const [paperDetails, setPaperDetails] =
    useState<SearchedPaperDetails | null>();
  const [authors, setAuthors] = useState<Set<string>>(new Set());
  const [title, setTitle] = useState<string>();
  const [description, setDescription] = useState<string>("");
  const [currentAuthor, setCurrentAuthor] = useState("");
  const [pdfLink, setPdfLink] = useState("");
  const [paperURL, setPaperURL] = useState("");

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
    const resp = await arxivSearch(paperURL);
    console.log(resp);
    if (resp.data) {
      setTitle(resp.data[0].title);
      setDescription(resp.data[0].description);
      const authors = new Set(resp.data[0].authors);
      setAuthors(authors as Set<string>);
      setPdfLink(resp.data[0].pdf_link);
    }
  }

  useEffect(() => {
    if (paperURL) {
      getPaperDetails();
    }
  }, [paperURL]);

  async function postLib() {
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
      toast("Paper Added Successfully");
    } catch (error: unknown) {
      console.log(error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          console.log("Paper already present in your library");
          toast("Paper already present in your library");
        } else {
          toast("Something went wrong");
        }
      } else {
        toast("Something went wrong");
      }
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
        <Dialog>
          <DialogTrigger className="flex flex-row items-center gap-2 py-1 px-3  bg-purple hover:cursor-pointer hover:bg-dark-purple text-white rounded-lg duration-200">
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
                      currentInput={currentAuthor}
                      setCurrentInput={setCurrentAuthor}
                      placeholder={"Press Enter after typing an Author's Name"}
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
              <Button onClick={postLib}>Upload Paper</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {!loadingPapers ? (
        <div>
          {library.length > 0 ? (
            library.map((libItem) => (
              <div key={libItem.uuid}>{libItem.title}</div>
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
