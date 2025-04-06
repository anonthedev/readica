"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Library from "@/components/Library/Library";
import { Skeleton } from "@/components/ui/skeleton"; 
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axios from "axios";
import { User } from "@/types/types";

export default function Profile() {
  const { data: session, status } = useSession(); 
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated" && session?.user) {
      setUsername((session.user as User).username || ""); 
    }
  }, [status, router, session]);

  const handleSaveUsername = async () => {
    if (!username || username.trim().length < 3) {
      toast.error("Username must be at least 3 characters long.");
      return;
    }
    if (username.trim() === (session?.user as User)?.username) {
      toast.info("Username is the same.");
      setIsDialogOpen(false);
      return;
    }

    setIsSaving(true);
    try {
      const response = await axios.put(
        "/api/user/username",
        { username: username.trim() },
        {
          headers: {
            Authorization: `Bearer ${session?.supabaseAccessToken}`, 
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        toast.success("Username updated successfully!");
        router.refresh(); 
        setIsDialogOpen(false); 
      } else {
        toast.error("Failed to update username. Unexpected status code.");
      }
    } catch (error) {
      console.error("Error updating username:", error);
      let errorMessage = "An error occurred while updating the username.";
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.error || errorMessage;
      }
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <section className="my-8 w-full px-4 md:px-10 py-5">
        <article className="flex flex-col gap-12 md:gap-16">
          <div className="flex flex-row items-center gap-4 md:gap-8">
            <Skeleton className="w-16 h-16 md:w-[120px] md:h-[120px] rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-32 md:w-48" />
              <Skeleton className="h-4 w-40 md:w-64" />
            </div>
          </div>
          <div className="w-full">
            <Skeleton className="h-64 w-full" />
          </div>
        </article>
      </section>
    );
  }

  if (status === "authenticated" && !session?.user) {
    console.error("Authenticated session but no user data found.");
    return <p>Error loading profile information.</p>;
  }

  if (status === "authenticated" && session?.user) {
    return (
      <section className="my-8 w-full px-4 md:pr-10 py-5">
        <article className="flex flex-col gap-12 md:gap-16">
          <div className="flex flex-row items-center gap-4 md:gap-8">
            {session.user.image ? (
              <img
                className="w-16 h-16 md:w-[120px] md:h-[120px] rounded-full object-cover"
                src={session.user.image}
                alt={`Profile picture of ${session.user.name}`}
                width={120}
                height={120}
              />
            ) : (
              <div className="w-16 h-16 md:w-[120px] md:h-[120px] rounded-full bg-gray-700 flex items-center justify-center text-white text-2xl md:text-4xl">
                {session.user.name || "U"}
              </div>
            )}
            <div className="flex flex-col gap-1">
              <h1 className="text-lg md:text-xl font-semibold">{session.user.name || "User Name"}</h1>
              <div className="flex flex-col items-start gap-1">
                <span className="font-normal text-xs md:text-sm text-gray-400">
                  @{(session.user as User).username} 
                </span>
                <span className="font-normal text-xs md:text-xs text-gray-400">
                  {session.user.email}
                </span>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant={"secondary"} className="py-1 px-3.5 text-gray-400 hover:text-gray-200">
                      Edit Username
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-fit">
                    <DialogHeader>
                      <DialogTitle>{(session.user as User).username ? 'Edit Username' : 'Add Username'}</DialogTitle>
                      <DialogDescription>
                        Choose a unique username. Minimum 3 characters.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Input
                          id="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Enter username"
                          className="col-span-4"
                          disabled={isSaving}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        onClick={handleSaveUsername} 
                        disabled={isSaving || !username || username.trim().length < 3 || username.trim() === (session.user as User).username}
                      >
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          <div className="w-full">
            <Library />
          </div>
        </article>
      </section>
    );
  }

  return null; 
}
