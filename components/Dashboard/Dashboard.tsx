"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useAuth } from "@clerk/nextjs";

import { LibraryItemType } from "@/utils/types";
import { useToast } from "@/components/ui/use-toast";
import Search from "../Search";
import { deleteFromLib, getLib, updateLib } from "@/utils/supabaseFunctions";
import { Ellipsis, X } from "lucide-react";
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
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export const libraryContext = createContext<any>(null);

export default function Dashboard() {
  const [library, setLibrary] = useState<LibraryItemType[] | null>(null);
  const [loading, setLoading] = useState(false);

  const { getToken, userId } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    getLibrary();
  }, []);

  async function getLibrary() {
    setLoading(true);
    const token = await getToken({ template: "supabase" });
    if (!token || !userId) {
      toast({ title: "Please login/signup first" });
      setLoading(false);
    } else {
      const resp = await getLib(token, userId);
      if (resp.success) {
        console.log(resp.data);
        setLibrary(resp.data);
        setLoading(false);
      } else {
        toast({ title: "Couldn't fetch library", description: resp.message });
        setLoading(false);
      }
    }
  }

  return (
    <libraryContext.Provider value={{ library, setLibrary, getLibrary }}>
      <main className="mx-20 my-10 md:mx-8">
        <Search />
        {!loading ? (
          <section className="mt-8 w-full">
            <article className="flex flex-col gap-5">
              <h1 className="text-3xl font-bold">My Library</h1>
              <div className="w-full grid grid-cols-2 items-start justify-between gap-8 lg:grid-cols-1">
                {library &&
                  library.length > 0 &&
                  library.map((item) => (
                    <LibraryItem item={item} key={item.uuid} />
                  ))}
              </div>
            </article>
          </section>
        ) : (
          <div className="w-full flex items-center justify-center h-[calc(100vh-80px)]">
            <p>Loading...</p>
          </div>
        )}
      </main>
    </libraryContext.Provider>
  );
}

function LibraryItem({ item }: { item: LibraryItemType }) {
  const [readingStatus, setReadingStatus] = useState<
    "Currently Reading" | "Finished Reading" | "Read Later" | null
  >(null);
  const [updatingItem, setUpdatingItem] = useState(false);
  const [tags, setTags] = useState<Set<string>>(new Set([]));
  const [currentTag, setCurrentTag] = useState("");

  const { getLibrary } = useContext(libraryContext);

  const { toast } = useToast();
  const { getToken, userId } = useAuth();

  async function updateItemStatus(item: LibraryItemType) {
    setUpdatingItem(true);
    toast({
      title: "Updating status...",
    });
    const token = await getToken({
      template: "supabase",
    });
    if (readingStatus) {
      updateLib(token!, userId!, item.uuid, {
        status: readingStatus,
      })
        .then((resp) => {
          if (resp.success) {
            toast({
              title: "✅ Status updated successfully",
            });
          } else {
            toast({
              title: "Something went wrong",
              variant: "destructive",
            });
          }
        })
        .catch((err) => {
          console.log(err);
          toast({
            title: "Something went wrong",
            variant: "destructive",
          });
        })
        .finally(() => {
          setUpdatingItem(false);
          getLibrary();
        });
    } else {
      toast({
        title: "Please select a status",
        variant: "destructive",
      });
    }
  }

  async function updateItemTags(item: LibraryItemType) {
    setUpdatingItem(true);
    toast({
      title: "Updating tags...",
    });
    const token = await getToken({
      template: "supabase",
    });
    if (tags.size !== 0) {
      updateLib(token!, userId!, item.uuid, {
        tags: Array.from(tags),
      })
        .then((resp) => {
          if (resp.success) {
            toast({
              title: "✅ Tags updated successfully",
            });
          } else {
            toast({
              title: "Something went wrong",
              variant: "destructive",
            });
          }
        })
        .catch((err) => {
          console.log(err);
          toast({
            title: "Something went wrong",
            variant: "destructive",
          });
        })
        .finally(() => {
          setUpdatingItem(false);
          getLibrary();
        });
    } else {
      toast({
        title: "Please select a status",
        variant: "destructive",
      });
    }
  }
  return (
    <div className="flex flex-row gap-2 items-start" key={item.uuid}>
      <a
        target="_blank"
        href={item.pdf_link}
        className="flex flex-col gap-2 w-fit"
      >
        <h2 className="font-semibold text-lg max-w-[50ch]">{item.title}</h2>
        <p
          className="font-medium text-sm max-w-prose text-ellipsis"
          title={item.description}
        >
          {item.description?.length! < 220
            ? item.description
            : item.description?.slice(0, 220) + "..."}
        </p>
        <p className="max-w-prose text-ellipsis text-gray-400 text-sm">
          {item.authors.join(", ")}
        </p>
        {item.status && (
          <p className="text-xs">
            Status: <span className="text-gray-400">{item.status}</span>
          </p>
        )}
        <p className="flex flex-row gap-1">
          {item.tags &&
            item.tags.length !== 0 &&
            item.tags.map((tag) => (
              <span className=" text-xs bg-gray-800 rounded-md py-1 px-2 text-gray-300 text-center">
                {tag}
              </span>
            ))}
        </p>
      </a>
      <DropdownMenu>
        <DropdownMenuTrigger className="w-fit">
          <Ellipsis />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
            <Dialog>
              <DialogTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="w-full text-left"
                >
                  Set Status
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle title={`Set reading status of ${item.title}`}>
                    Set reading status of{" "}
                    {item.title.length > 20
                      ? item.title.slice(0, 20) + "..."
                      : item.title}
                  </DialogTitle>
                  <DialogDescription>
                    <span className="flex flex-col gap-2 items-center justify-center">
                      <span className="flex flex-row gap-2 items-center justify-center">
                        <Button
                          variant={"outline"}
                          className={`${
                            readingStatus === "Currently Reading" &&
                            "outline-1 outline outline-white"
                          }`}
                          onClick={() => {
                            setReadingStatus("Currently Reading");
                          }}
                        >
                          Currently Reading
                        </Button>
                        <Button
                          className={`${
                            readingStatus === "Finished Reading" &&
                            "outline-1 outline outline-white"
                          }`}
                          variant={"outline"}
                          onClick={() => {
                            setReadingStatus("Finished Reading");
                          }}
                        >
                          Finished Reading
                        </Button>
                        <Button
                          className={`${
                            readingStatus === "Read Later" &&
                            "outline-1 outline outline-white"
                          }`}
                          variant={"outline"}
                          onClick={() => {
                            setReadingStatus("Read Later");
                          }}
                        >
                          Read Later
                        </Button>
                      </span>
                      <Button
                        className="w-fit"
                        disabled={updatingItem}
                        onClick={() => {
                          updateItemStatus(item);
                        }}
                      >
                        {updatingItem ? "Updating..." : "Save"}
                      </Button>
                    </span>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </DropdownMenuItem>
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
              <DialogContent className="">
                <DialogHeader className="flex flex-col gap-2">
                  <DialogTitle title={`Set reading status of ${item.title}`}>
                    Set reading status of{" "}
                    {item.title.length > 20
                      ? item.title.slice(0, 20) + "..."
                      : item.title}
                  </DialogTitle>
                  <DialogDescription className="flex flex-col gap-2">
                    <span className="flex flex-row gap-2 flex-wrap">
                      {tags &&
                        tags.size > 0 &&
                        Array.from(tags).map((tag) => (
                          <span
                            key={tag}
                            className="flex flex-row gap-1 items-center justify-center w-fit bg-gray-800 text-xs rounded-md p-2 text-white text-center"
                          >
                            <p>{tag}</p>

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
                    <Input
                      type="text"
                      placeholder="Press Enter after typing a tag"
                      value={currentTag}
                      onChange={(e) => {
                        if (e.target.value.length > 0) {
                          setCurrentTag(e.target.value);
                        }
                      }}
                      onKeyDownCapture={(e) => {
                        if (e.key === "Enter") {
                          setTags((prevTags) =>
                            new Set(prevTags).add(currentTag)
                          );
                          setCurrentTag("");
                        }
                      }}
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
          <DropdownMenuItem>
            <a href={item.pdf_link} target="_blank">
              Go to original source
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async () => {
              toast({ title: "Deleting..." });
              const token = await getToken({
                template: "supabase",
              });
              deleteFromLib(token!, userId!, item.uuid).then((resp) => {
                if (resp.success) {
                  toast({
                    title: "✅ Paper deleted successfully",
                  });
                  getLibrary();
                } else {
                  toast({ title: "❌ Something went wrong" });
                }
              });
            }}
            className="text-red-500 cursor-pointer"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
