"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useToast } from "../ui/use-toast";
import { addToLib, getLib } from "@/utils/supabaseFunctions";
import { useAuth } from "@clerk/nextjs";
import { LibraryItemType } from "@/utils/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ellipsis } from "lucide-react";

export default function User({ username }: { username: string }) {
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [library, setLibrary] = useState<LibraryItemType[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { getToken, userId } = useAuth();

  useEffect(() => {
    setLoading(true);
    axios
      .get(`/api/users/get-user-id-by-username?username=${username}`)
      .then((resp) => {
        if (resp.data.success) {
          setProfileUserId(resp.data.user.id);
          setUserDetails(resp.data.user);
        } else {
          toast({ title: resp.data.message });
          setProfileUserId(null);
        }
      })
      .catch((err) => {
        console.error(err);
        toast({ title: "Error fetching user, please try again." });
      });
  }, [username]);

  async function getLibrary() {
    const token = await getToken({ template: "supabase" });
    if (!token) {
      toast({ title: "Please login/signup first" });
      setLoading(false);
      return;
    } else {
      const resp = await getLib(token, profileUserId!);
      if (resp.success) {
        setLibrary(resp.data);
        setLoading(false);
      } else {
        toast({ title: "Couldn't fetch library", variant: "destructive" });
        setLoading(false);
      }
    }
  }

  async function handleAddToLib(paperDetails: LibraryItemType) {
    toast({ title: "🔘 Adding..." });
    const token = await getToken({ template: "supabase" });
    if (!token || !userId) {
      toast({ title: "Please login/signup first", variant: "destructive" });
      return;
    }

    const result = await axios.post(
      `/api/library?userId=${userId}`,
      {
        title: paperDetails.title,
        description: paperDetails.description,
        authors: paperDetails.authors,
        pdf_link: paperDetails.pdf_link,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (result.data.success) {
      toast({ title: "✅ Paper added to library successfully" });
      getLibrary();
    } else {
      if (result.data.code === "23505") {
        toast({
          title: "Paper is already in your library",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Something went wrong",
          description: result.data.message || result.data.error,
        });
      }
    }
  }

  useEffect(() => {
    if (profileUserId) {
      getLibrary();
    }
  }, [profileUserId]);
  return (
    <>
      {!loading ? (
        <section className="mt-8 w-full mx-20 md:mx-8">
          <article className="flex flex-col gap-5">
            {userDetails && (
              <h1 className="text-3xl font-bold">
                {userDetails.firstName}&apos;s Library
              </h1>
            )}
            <div className="w-full grid grid-cols-2 items-start justify-between gap-8 lg:grid-cols-1">
              {library &&
                library.length > 0 &&
                library.map((item) => (
                  <div
                    className="flex flex-row gap-2 items-start"
                    key={item.uuid}
                  >
                    <a
                      target="_blank"
                      href={item.pdf_link}
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
                          className="cursor-pointer"
                          onSelect={(event) => {
                            handleAddToLib(item);
                          }}
                        >
                          Add to my library
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <a href={item.pdf_link} target="_blank">
                            Go to original source
                          </a>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
            </div>
          </article>
        </section>
      ) : (
        <div className="w-full flex items-center justify-center h-[calc(100vh-80px)]">
          <p>Loading...</p>
        </div>
      )}
    </>
  );
}
