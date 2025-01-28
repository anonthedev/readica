"use client";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "./ui/button";
import NavSearch from "@/components/NavSearch";
import axios from "axios";
import { useRef, useState } from "react";
import { useToast } from "./ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { extractPDFMetadata } from "@/utils/utilFunctions";
import { LibraryItemType, PDFMetadata, UploadItem } from "@/utils/types";
import { addToLib } from "@/utils/supabaseFunctions";
import { useAuth } from "@clerk/nextjs";
import { CloudUpload } from "lucide-react";

export default function Navbar() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [autoMeta, setAutoMeta] = useState(true);
  const [metadata, setMetadata] = useState<PDFMetadata | null>(null);
  const { toast } = useToast();
  const { getToken, userId } = useAuth();

  async function handleAddToLib(paperDetails: UploadItem) {
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
        file_id: paperDetails.pdf_link,
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
    } else {
      if (result.data.code === "23505") {
        toast({
          title: "Paper is already in your library",
          variant: "destructive",
        });
      } else {
        await axios
          .delete(`/api/backblaze?fileId=${paperDetails.file_id}`)
          .then((resp) => {
            toast({
              title: "Something went wrong",
              // description: "result.data.message || result.data.error",
              variant: "destructive",
            });
          });
      }
    }
  }

  async function handlePaperUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) {
      toast({ title: "No Title Selected", variant: "destructive" });
      return;
    }

    if (file.type !== "application/pdf") {
      toast({ title: "Only PDF files are supported", variant: "destructive" });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File size should be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    const pdfMetadata = await extractPDFMetadata(file);
    console.log(pdfMetadata);

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);

    try {
      await axios
        .post("/api/backblaze", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            console.log(`Upload Progress: ${percentCompleted}%`);
          },
        })
        .then((resp) => {
          console.log("Upload Response:", resp.data);
          // toast({ title: "Paper uploaded successfully", variant: "success" });

          const paperDetails = { ...pdfMetadata, file_id: resp.data.fileId };

          console.log(paperDetails);
          //@ts-expect-error
          handleAddToLib(paperDetails);
        });

      // handleAddToLib(metadata!)

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error("Upload Error:", error);
      console.error("Error Response:", error.response?.data);

      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to upload paper";

      toast({ title: errorMessage, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  }

  function openFileInput() {
    fileInputRef.current?.click();
  }

  const { isSignedIn } = useUser();

  return (
    <nav className="py-12 px-8 flex flex-row items-center justify-between bg-transparent w-full">
      <Link
        href={isSignedIn ? "/dashboard" : "/"}
        className="text-4xl font-bold"
      >
        read<span className="text-purple">ica.</span>
      </Link>
      <div className="flex flex-row items-center justify-center gap-12">
        <div className="flex flex-row gap-8">
          <NavSearch />
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="application/pdf"
            onChange={handlePaperUpload}
          />
          <Dialog>
            <DialogTrigger asChild>
              <Button
                disabled={isUploading}
                className="bg-purple hover:bg-dark-purple"
              >
                {isUploading ? "Uploading..." : "Upload Paper"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-lg">
              <DialogHeader>
                <DialogTitle className="mb-4">Upload Paper</DialogTitle>
                <DialogDescription className="flex flex-col gap-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="application/pdf"
                    onChange={handlePaperUpload}
                  />
                  <div
                    className="flex flex-col items-center justify-center gap-4 border-dotted border-2 border-purple rounded-lg p-8 cursor-pointer bg-purple/10 text-dark-purple"
                    onClick={openFileInput}
                  >
                    <CloudUpload />
                    <p>Click to upload a file from your computer.</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="auto-meta"
                      disabled={isUploading}
                      checked={autoMeta}
                      onCheckedChange={() => {
                        setAutoMeta(!autoMeta);
                      }}
                    />
                    <label
                      htmlFor="auto-meta"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Get Title, Authors, etc. from the paper automatically.
                    </label>
                  </div>

                  {/* <div>
                    <Input placeholder="Title" />
                  </div> */}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button type="submit" className="bg-purple hover:bg-dark-purple">Upload</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <Button variant={"secondary"} asChild>
            <Link className="font-semibold" href={"/sign-in"}>
              Sign In
            </Link>
          </Button>
        </SignedOut>
      </div>
    </nav>
  );
}
