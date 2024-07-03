"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

import { LibraryItem } from "@/utils/types";
import { useToast } from "@/components/ui/use-toast";
import Search from "../Search";
import { getLib } from "@/utils/supabaseFunctions";
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

export default function Dashboard() {
  const [library, setLibrary] = useState<LibraryItem[]>();

  const { getToken, userId } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    getLibrary();
  }, []);

  async function getLibrary() {
    const token = await getToken({ template: "supabase" });
    const resp = await getLib(token!, userId!);
    if (resp.success) {
      console.log(resp.data);
      setLibrary(resp.data);
    } else {
      toast({ title: "Couldn't fetch library", description: resp.message });
    }
  }

  return (
    <main className="mx-20 my-10">
      <Search />
      <section className="mt-8 w-full">
        <article className="flex flex-col gap-5">
          <h1 className="text-3xl font-bold">My Library</h1>
          <div className="w-full grid grid-cols-2 items-start justify-between gap-8">
            {library &&
              library.length > 0 &&
              library.map((item) => (
                <div className="flex flex-row gap-2 items-start">
                  <a
                    target="_blank"
                    href={item.pdf_link}
                    key={item.pdf_link}
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
                  </a>
                  {/* <DropdownMenu>
                    <DropdownMenuTrigger className="w-fit">
                      <Ellipsis />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Options</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Dialog>
                          <DialogTrigger>Set Status</DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Are you absolutely sure?
                              </DialogTitle>
                              <DialogDescription>
                                This action cannot be undone. This will
                                permanently delete your account and remove your
                                data from our servers.
                              </DialogDescription>
                            </DialogHeader>
                          </DialogContent>
                        </Dialog>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Dialog>
                          <DialogTrigger>Edit Tags</DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Are you absolutely sure?
                              </DialogTitle>
                              <DialogDescription>
                                This action cannot be undone. This will
                                permanently delete your account and remove your
                                data from our servers.
                              </DialogDescription>
                            </DialogHeader>
                          </DialogContent>
                        </Dialog>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={async () => {
                          // handleAddToLib(entry);
                        }}
                        className="text-red-500"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu> */}
                </div>
              ))}
          </div>
        </article>
        {/* <UserInfo  /> */}
      </section>
    </main>
  );
}
