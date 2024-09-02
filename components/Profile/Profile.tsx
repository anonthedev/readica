"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useToast } from "../ui/use-toast";
import { useAuth } from "@clerk/nextjs";
import { LibraryItemType } from "@/utils/types";
import axios from "axios";
import { LibraryItem } from "../Dashboard/Dashboard";

export default function Profile() {
  const [library, setLibrary] = useState<LibraryItemType[]>([]);
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
      const resp = await axios.get(`/api/library?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (resp.data.success) {
        const sortedArr = resp.data.library.sort(
          (a: LibraryItemType, b: LibraryItemType) => {
            const dateA = new Date(a.upload_date);
            const dateB = new Date(b.upload_date);

            return dateB.getTime() - dateA.getTime();
          }
        );
        setLibrary(sortedArr);
        setLoading(false);
        // return sortedArr
      } else {
        toast({
          title: "Couldn't fetch library",
          description: resp.data.message,
          variant: "destructive",
        });
        setLoading(false);
      }
    }
  }
  const { user } = useUser();
  return (
    <section className="my-8 w-full">
      <article className="flex flex-col gap-24">
        {user && (
          <div className="flex flex-row items-center gap-8">
            <img
              className="w-[120px] rounded-full"
              src={user.imageUrl}
              alt={`profile picture of ${user.fullName}`}
            />
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-semibold">{user.fullName}</h1>
              <span className="font-normal text-[#71717A]">
                @{user.username}
              </span>
            </div>
          </div>
        )}
        <div className="w-full flex flex-row flex-wrap gap-6">
          {library.map((item) => (
            <LibraryItem key={item.uuid} item={item} getLibrary={getLibrary}></LibraryItem>
          ))}
        </div>
      </article>
    </section>
  );
}
