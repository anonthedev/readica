import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import MultiInput from "../ui/multi-input";
import { Textarea } from "../ui/textarea";
import { useLibraryStore } from "@/store/libraryStore";
import { toast } from "sonner";
import axios from "axios";
import { arxivSearch } from "@/lib/searchFunctions";
import { extractPDFMetadata } from "@/lib/utils";

interface LibraryUploadDialogProps {
  getLib: () => void;
  session: any;
}

export default function LibraryUploadDialog({ getLib, session }: LibraryUploadDialogProps){
  const uploadPaperDialogOpen = useLibraryStore((state) => state.uploadPaperDialogOpen);
  const setUploadPaperDialogOpen = useLibraryStore((state) => state.setUploadPaperDialogOpen);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [authors, setAuthors] = useState<Set<string>>(new Set());
  const [currentAuthor, setCurrentAuthor] = useState("");
  const [pdfLink, setPdfLink] = useState("");
  const [paperURL, setPaperURL] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [usingLink, setUsingLink] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function getPaperDetails() {
    try {
      const resp = await arxivSearch(paperURL);
      if (resp.data) {
        const data = resp.data as {
          title: string;
          description: string;
          authors: string[];
          pdf_link: string;
        }[];
        setTitle(data[0].title);
        setDescription(data[0].description);
        const authors = new Set(data[0].authors);
        setAuthors(authors as Set<string>);
        setPdfLink(data[0].pdf_link);
      }
    } catch (e) {
      console.log(e);
    }
  }

  React.useEffect(() => {
    setTitle("");
    setDescription("");
    setAuthors(new Set());
    setPdfLink("");
    if (paperURL.includes("arxiv.org")) {
      getPaperDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paperURL]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      toast.error("No file selected");
      return;
    }
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are supported");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error("File size should be less than 15MB");
      return;
    }
    setIsUploading(true);
    try {
      const metadata = await extractPDFMetadata(file);
      const extractedTitle = metadata.title || "";
      const extractedAuthors = metadata.authors && metadata.authors.length > 0 ? new Set<string>(metadata.authors) : new Set<string>();
      const extractedDescription = metadata.subject || "";
      setTitle(extractedTitle);
      setAuthors(extractedAuthors);
      setDescription(extractedDescription);
      setSelectedFile(file);
    } catch (error: any) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.error(
        error?.response?.data?.error || error.message || "Failed to extract metadata"
      );
    } finally {
      setIsUploading(false);
    }
  }

  function handleRemoveFile() {
    setSelectedFile(null);
    setTitle("");
    setDescription("");
    setAuthors(new Set());
    setPdfLink("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleConfirmUpload() {
    if (!selectedFile && !paperURL) {
      toast.error("No file or link provided");
      return;
    }
    setIsUploading(true);
    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadResp = await axios.post("https://readica-backend-production.up.railway.app/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const fileId = uploadResp.data.fileId;
        const paperDetails = {
          title,
          description,
          authors: Array.from(authors),
          file_id: fileId,
          email: session?.user.email,
        };
        await axios.post(
          "/api/library",
          paperDetails,
          {
            headers: {
              Authorization: "Bearer " + session?.supabaseAccessToken,
            },
          }
        );
      } else if (paperURL) {
        const paperDetails = {
          title,
          description,
          authors: Array.from(authors),
          pdf_link: paperURL,
          email: session?.user.email,
        };
        await axios.post(
          "/api/library",
          paperDetails,
          {
            headers: {
              Authorization: "Bearer " + session?.supabaseAccessToken,
            },
          }
        );
      }
      toast.success("Paper uploaded and added to library");
      getLib();
      setUploadPaperDialogOpen(false);
      handleRemoveFile();
      setPaperURL("");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error || error.message || "Upload failed"
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Dialog open={uploadPaperDialogOpen} onOpenChange={setUploadPaperDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Paper</DialogTitle>
          <div className="my-2 flex flex-col gap-2">
            <div>
              <Input
                value={paperURL}
                onChange={(e) => {
                  setPaperURL(e.target.value);
                  setUsingLink(e.target.value !== "");
                  if (e.target.value !== "") {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }
                }}
                placeholder="Enter Paper URL"
                disabled={selectedFile !== null}
              />
              {paperURL && (
                <Button type="button" variant="outline" size="sm" onClick={() => { setPaperURL(""); setUsingLink(false); }}>
                  Clear Link
                </Button>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-semibold text-md">Paper Details:</h2>
              <div className="flex flex-col gap-2 w-full md:flex-row">
                <div className="w-full md:w-1/2">
                  <label htmlFor="input">Title <span style={{color: 'red'}}>*</span></label>
                  <Input
                    placeholder="Title"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                    }}
                    required
                    className={title === "" ? "border-red-500" : ""}
                  />
                  {title === "" && (
                    <span className="text-xs text-red-500">Title is required</span>
                  )}
                </div>
                <div className="w-full md:w-1/2">
                  <label htmlFor="input">Authors</label>
                  <MultiInput
                    inputs={authors}
                    setInputs={setAuthors}
                    currentInput={currentAuthor}
                    setCurrentInput={setCurrentAuthor}
                    placeholder="Add author(s)"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="input">Description</label>
                <Textarea
                  className="max-h-[100px]"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label>Upload PDF File</label>
              {selectedFile ? (
                <div className="flex flex-row items-center gap-2">
                  <span className="truncate max-w-xs">{selectedFile.name}</span>
                  <Button type="button" variant="outline" size="sm" onClick={handleRemoveFile}>
                    Remove File
                  </Button>
                </div>
              ) : (
                <Input
                  type="file"
                  accept="application/pdf"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  disabled={usingLink}
                />
              )}
            </div>

            <DialogFooter>
              <Button
                onClick={handleConfirmUpload}
                disabled={isUploading || (!selectedFile && !paperURL) || title === ""}
                className="bg-purple text-white hover:bg-dark-purple"
              >
                {isUploading ? "Uploading..." : "Confirm & Upload"}
              </Button>
            </DialogFooter>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};