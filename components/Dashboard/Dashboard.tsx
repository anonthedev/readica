"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useAuth } from "@clerk/nextjs";

import { LibraryItem } from "@/utils/types";
import { useToast } from "@/components/ui/use-toast";
import Search from "../Search";
import { deleteFromLib, getLib, updateLib } from "@/utils/supabaseFunctions";
import { Ellipsis } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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

export const libraryContext = createContext<any>(null);

export default function Dashboard() {
  const [library, setLibrary] = useState<LibraryItem[] | null>(null);
  const [readingStatus, setReadingStatus] = useState<
    "Currently Reading" | "Finished Reading" | "Read Later" | null
  >(null);
  const [updatingItem, setUpdatingItem] = useState(false);

  const { getToken, userId } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    getLibrary();
  }, []);

  async function getLibrary() {
    const token = await getToken({ template: "supabase" });
    if (!token || !userId) {
      toast({ title: "Please login/signup first" });
      return;
    } else {
      const resp = await getLib(token, userId);
      if (resp.success) {
        console.log(resp.data);
        setLibrary(resp.data);
      } else {
        toast({ title: "Couldn't fetch library", description: resp.message });
      }
    }
  }

  return (
    <libraryContext.Provider value={{ library, setLibrary }}>
      <main className="mx-20 my-10 md:mx-10">
        <Search />
        <section className="mt-8 w-full">
          <article className="flex flex-col gap-5">
            <h1 className="text-3xl font-bold">My Library</h1>
            <div className="w-full grid grid-cols-2 items-start justify-between gap-8 lg:grid-cols-1">
              {library &&
                library.length > 0 &&
                library.map((item) => (
                  <div className="flex flex-row gap-2 items-start">
                    <a
                      target="_blank"
                      href={item.pdf_link}
                      key={item.uuid}
                      className="flex flex-col gap-2 w-fit"
                    >
                      <h2 className="font-semibold text-lg max-w-[50ch]">
                        {item.title}
                      </h2>
                      <p
                        className="font-medium text-sm max-w-prose text-ellipsis"
                        title={item.description}
                      >
                        {item.description?.length! < 220
                          ? item.description
                          : item.description?.slice(0, 220) + "..."}
                      </p>
                      <p className="max-w-prose text-ellipsis text-gray-400">
                        {item.authors.join(", ")}
                      </p>
                      {item.status && (
                        <p className="text-sm">
                          Status:{" "}
                          <span className="text-gray-400">{item.status}</span>
                        </p>
                      )}
                    </a>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="w-fit">
                        <Ellipsis />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onSelect={(event) => event.preventDefault()}
                        >
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
                                <DialogTitle
                                  title={`Set reading status of ${item.title}`}
                                >
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
                                          readingStatus ===
                                            "Currently Reading" &&
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
                                          readingStatus ===
                                            "Finished Reading" &&
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
                                      onClick={async () => {
                                        setUpdatingItem(true);
                                        toast({
                                          title: "Updating status...",
                                        });
                                        const token = await getToken({
                                          template: "supabase",
                                        });
                                        if (readingStatus) {
                                          updateLib(
                                            token!,
                                            userId!,
                                            item.uuid,
                                            {
                                              status: readingStatus,
                                            }
                                          )
                                            .then((resp) => {
                                              if (resp.success) {
                                                toast({
                                                  title:
                                                    "✅ Status updated successfully",
                                                });
                                              } else {
                                                toast({
                                                  title:
                                                    "❌ Something went wrong",
                                                });
                                              }
                                            })
                                            .catch((err) => {
                                              console.log(err);
                                              toast({
                                                title:
                                                  "❌ Something went wrong",
                                              });
                                            })
                                            .finally(() => {
                                              setUpdatingItem(false);
                                            });
                                        } else {
                                          toast({
                                            title: "Please select a status",
                                          });
                                        }
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
                        <DropdownMenuItem
                          onSelect={(event) => event.preventDefault()}
                        >
                          <Dialog>
                            <DialogTrigger asChild>
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="w-full text-left"
                              >
                                Edit Tags
                              </button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  Are you absolutely sure?
                                </DialogTitle>
                                <DialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete your account and remove
                                  your data from our servers.
                                </DialogDescription>
                              </DialogHeader>
                            </DialogContent>
                          </Dialog>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={async () => {
                            toast({ title: "Deleting..." });
                            const token = await getToken({
                              template: "supabase",
                            });
                            deleteFromLib(token!, userId!, item.uuid).then(
                              (resp) => {
                                if (resp.success) {
                                  toast({
                                    title: "✅ Paper deleted successfully",
                                  });
                                  getLibrary();
                                } else {
                                  toast({ title: "❌ Something went wrong" });
                                }
                              }
                            );
                          }}
                          className="text-red-500"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
            </div>
          </article>
          {/* <UserInfo  /> */}
        </section>
      </main>
    </libraryContext.Provider>
  );
}
