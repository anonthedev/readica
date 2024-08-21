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
import { turnacateString } from "@/utils/utilFunctions";
import Link from "next/link";

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
          console.log(resp.data.user);
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
      if (resp.data.success) {
        // console.log(resp.data)
        setLibrary(resp.data.library);
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
      toast({
        title: "Paper added to library successfully",
        variant: "success",
      });
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
          variant: "destructive",
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
          <article className="flex flex-col gap-24">
            {userDetails && (
              <div className="flex flex-row items-center gap-8">
                <img
                  className="w-[120px] rounded-full"
                  src={userDetails.imageUrl}
                  alt={`profile picture of ${userDetails.firstName}`}
                />
                <div className="flex flex-col gap-1">
                  <h1 className="text-xl font-semibold">
                    {userDetails.firstName}
                  </h1>
                  <span className="font-normal text-[#71717A]">@{userDetails.username}</span>
                </div>
              </div>
            )}
            <div className="w-full flex flex-row flex-wrap gap-6">
              {library &&
                library.length > 0 &&
                library.map((item) => (
                  <div
                    className="flex flex-row justify-between items-start bg-white rounded-md p-4 border-[1px] border-[#F5F5F5]"
                    key={item.uuid}
                  >
                    <Link
                      href={`/reader/${item.uuid}`}
                      className="flex flex-col gap-6 justify-between w-fit items-start h-full"
                    >
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
                        <p
                          className="font-[400] text-xs max-w-[40ch] text-ellipsis"
                          title={item.description}
                        >
                          {turnacateString(item.description, 65)}
                        </p>
                      </div>
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
                    </Link>
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
