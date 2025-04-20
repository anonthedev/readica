import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import MultiInput from "@/components/ui/multi-input";
import { toast } from "sonner";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { turnacateString } from "@/lib/utils";
import { LibraryItemType } from "@/types/PaperTypes";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { EllipsisVertical, X } from "lucide-react";

export default function LibraryItem({ item }: { item: LibraryItemType }) {
  const [tags, setTags] = useState<Set<string>>(new Set());
  const [currentTag, setCurrentTag] = useState("");
  const [updatingItem, setUpdatingItem] = useState<boolean>(false);
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description || "");
  const [authors, setAuthors] = useState<Set<string>>(new Set(item.authors));
  const [currentAuthor, setCurrentAuthor] = useState("");
  const [pdfLink, setPdfLink] = useState(item.pdf_link || "");

  const { data: session } = useSession();

  useEffect(() => {
    if (item.tags) {
      setTags(new Set(item.tags));
    }
  }, []);

  async function updateTags() {
    setUpdatingItem(true);
    if (tags.size > 5) {
      toast.error("You can only have up to 5 tags.");
      setUpdatingItem(false);
      return;
    }
    try {
      await axios.put(
        `/api/library?uuid=${encodeURIComponent(item.uuid)}`,
        { tags: Array.from(tags) },
        {
          headers: {
            Authorization: "Bearer " + session?.supabaseAccessToken,
          },
        }
      );
      toast.success("Tags updated successfully.");
    } catch (e) {
      if (axios.isAxiosError(e)) {
        toast.error(
          e?.response?.data?.message ||
            "Failed to update tags. Please try again."
        );
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setUpdatingItem(false);
    }
  }

  async function deletePaper() {
    try {
      const resp = await axios.delete(`/api/library?uuid=${item.uuid}`, {
        headers: {
          Authorization: "Bearer " + session?.supabaseAccessToken,
        },
      });
      console.log(resp);
      toast.success("Paper deleted successfully");
    } catch (e) {
      if (axios.isAxiosError(e)) {
        console.log(e.response?.data);
        toast.error("Something went wrong");
      } else {
        toast.error("Something went wrong");
      }
    }
  }

  async function updatePaperDetails() {
    setUpdatingItem(true);
    try {
      await axios.put(
        `/api/library?uuid=${encodeURIComponent(item.uuid)}`,
        {
          title,
          description,
          authors: Array.from(authors),
          pdf_link: pdfLink,
        },
        {
          headers: {
            Authorization: "Bearer " + session?.supabaseAccessToken,
          },
        }
      );
      toast.success("Paper details updated successfully");
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
      className="flex flex-row justify-between items-start bg-background text-foreground rounded-md p-4 border-[1px] border-slate-800"
    >
      <Link href={`reader/${item.uuid}`} target="_blank">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="font-medium text-lg max-w-[25ch]" title={item.title}>
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
          <EllipsisVertical className="cursor-pointer" />
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
                        updateTags();
                      }}
                    >
                      {updatingItem ? "Updating..." : "Save"}
                    </Button>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
            <Dialog>
              <DialogTrigger asChild>
                <button className="w-full text-left">Edit Paper Details</button>
              </DialogTrigger>
              <DialogContent onKeyDown={(e) => e.stopPropagation()}>
                <DialogHeader>
                  <DialogTitle>Edit Paper Details</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="title">Title</label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Paper title"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label>Authors</label>
                    <MultiInput
                      inputs={authors}
                      setCurrentInput={setCurrentAuthor}
                      currentInput={currentAuthor}
                      setInputs={setAuthors}
                      placeholder="Press Enter after typing each author"
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
                  <div className="flex flex-col gap-2">
                    <label htmlFor="description">Description</label>
                    <Textarea
                      className="max-h-[100px]"
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Paper description"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="pdfLink">PDF Link</label>
                    <Input
                      id="pdfLink"
                      value={pdfLink}
                      onChange={(e) => setPdfLink(e.target.value)}
                      placeholder="Link to PDF"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    disabled={updatingItem || !title}
                    onClick={updatePaperDetails}
                  >
                    {updatingItem ? "Updating..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-500 cursor-pointer hover:text-red-700"
            onClick={deletePaper}
          >
            Delete paper
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
