"use client"

import React, { useState, useRef } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import MultiInput from "../ui/multi-input"
import { Textarea } from "../ui/textarea"
import { useLibraryStore } from "@/store/libraryStore"
import { toast } from "sonner"
import { arxivSearch } from "@/lib/searchFunctions"
import { extractPDFMetadata } from "@/lib/utils"
import { useAddToLibrary } from "@/hooks/use-library"
import { FileIcon, Loader2, X } from "lucide-react"
import { Badge } from "../ui/badge"

interface LibraryUploadDialogProps {
  session: any
}

export default function LibraryUploadDialog({ session }: LibraryUploadDialogProps) {
  const uploadPaperDialogOpen = useLibraryStore((state) => state.uploadPaperDialogOpen)
  const setUploadPaperDialogOpen = useLibraryStore((state) => state.setUploadPaperDialogOpen)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [authors, setAuthors] = useState<Set<string>>(new Set())
  const [currentAuthor, setCurrentAuthor] = useState("")
  const [pdfLink, setPdfLink] = useState("")
  const [paperURL, setPaperURL] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [usingLink, setUsingLink] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    addFileToLibrary,
    addUrlToLibrary,
    extractFileMetadata,
    isFileUploading,
    isUrlUploading,
    isExtractingMetadata,
  } = useAddToLibrary()

  async function getPaperDetails() {
    try {
      const resp = await arxivSearch(paperURL)
      if (resp.data) {
        const data = resp.data as {
          title: string
          description: string
          authors: string[]
          pdf_link: string
        }[]
        setTitle(data[0].title)
        setDescription(data[0].description)
        const authors = new Set(data[0].authors)
        setAuthors(authors as Set<string>)
        setPdfLink(data[0].pdf_link)
      }
    } catch (e) {
      console.log(e)
    }
  }

  React.useEffect(() => {
    setTitle("")
    setDescription("")
    setAuthors(new Set())
    setPdfLink("")
    if (paperURL.includes("arxiv.org")) {
      getPaperDetails()
    }
  }, [paperURL])

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) {
      toast.error("No file selected")
      return
    }
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are supported")
      return
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error("File size should be less than 15MB")
      return
    }

    // Show the file in the UI immediately
    setSelectedFile(file)

    // Try the client-side extraction first for immediate feedback
    try {
      const clientMetadata = await extractPDFMetadata(file)
      const extractedTitle = clientMetadata.title || ""
      const extractedAuthors =
        clientMetadata.authors && clientMetadata.authors.length > 0
          ? new Set<string>(clientMetadata.authors)
          : new Set<string>()
      const extractedDescription = clientMetadata.subject || ""
      setTitle(extractedTitle)
      setAuthors(extractedAuthors)
      setDescription(extractedDescription)
    } catch (error: any) {
      console.error("Client-side metadata extraction failed:", error)
      // Continue with server-side extraction even if client-side fails
    }

    // Now try the server-side extraction for more accurate results
    extractFileMetadata(file, {
      onSuccess: (metadata) => {
        if (metadata) {
          if (metadata.title) {
            setTitle(metadata.title)
          }

          if (metadata.authors && metadata.authors.length > 0) {
            setAuthors(new Set<string>(metadata.authors))
          }

          if (metadata.subject) {
            setDescription(metadata.subject)
          }
        }
      },
      onError: (error: any) => {
        console.error("Server-side metadata extraction failed:", error)
        // No need to show error toast since we already have client-side extraction
      },
    })
  }

  function handleRemoveFile() {
    setSelectedFile(null)
    setTitle("")
    setDescription("")
    setAuthors(new Set())
    setPdfLink("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function handleConfirmUpload() {
    if (!selectedFile && !paperURL) {
      toast.error("No file or link provided")
      return
    }

    if (!title) {
      toast.error("Title is required")
      return
    }

    const commonData = {
      title,
      description,
      authors: Array.from(authors),
      paper_url: paperURL,
      email: session?.user.email,
    }

    try {
      if (selectedFile) {
        addFileToLibrary(
          {
            ...commonData,
            file: selectedFile,
          },
          {
            onSuccess: (data: any) => {
              // Use server-side metadata if available and if any fields are empty
              if (data.metadata) {
                if (!title && data.metadata.title) {
                  setTitle(data.metadata.title)
                }

                if (authors.size === 0 && data.metadata.authors && data.metadata.authors.length > 0) {
                  setAuthors(new Set<string>(data.metadata.authors))
                }

                if (!description && data.metadata.subject) {
                  setDescription(data.metadata.subject)
                }
              }

              toast.success("Paper uploaded and added to library")
              setUploadPaperDialogOpen(false)
              handleRemoveFile()
              setPaperURL("")
            },
            onError: (error: any) => {
              toast.error(error?.message || "Upload failed")
            },
          },
        )
      } else if (paperURL) {
        addUrlToLibrary(
          {
            ...commonData,
            pdf_link: pdfLink || paperURL,
          },
          {
            onSuccess: () => {
              toast.success("Paper added to library")
              setUploadPaperDialogOpen(false)
              handleRemoveFile()
              setPaperURL("")
            },
            onError: (error: any) => {
              toast.error(error?.message || "Failed to add paper")
            },
          },
        )
      }
    } catch (error: any) {
      toast.error(error?.message || "Upload failed")
    }
  }

  return (
    <Dialog open={uploadPaperDialogOpen} onOpenChange={setUploadPaperDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Add Paper</DialogTitle>
        </DialogHeader>

        <div className="my-4 flex flex-col gap-4">
          <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
            <h3 className="text-sm font-medium mb-2">Paper Source</h3>
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Input
                  value={paperURL}
                  onChange={(e) => {
                    setPaperURL(e.target.value)
                    setUsingLink(e.target.value !== "")
                    if (e.target.value !== "") {
                      setSelectedFile(null)
                      if (fileInputRef.current) fileInputRef.current.value = ""
                    }
                  }}
                  placeholder="Enter Paper URL (e.g., arXiv link)"
                  disabled={selectedFile !== null}
                  className="pr-24 border-border/50"
                />
                {paperURL && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPaperURL("")
                      setUsingLink(false)
                    }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 text-xs"
                  >
                    Clear
                  </Button>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Or Upload PDF File</label>
                {selectedFile ? (
                  <div className="flex items-center gap-2 p-2 bg-background rounded border border-border/50">
                    <FileIcon className="h-5 w-5 text-purple" />
                    <span className="truncate flex-1 text-sm">{selectedFile.name}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={handleRemoveFile} className="h-7 text-xs">
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <div className="relative">
                      <Input
                        type="file"
                        accept="application/pdf"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        disabled={usingLink || isExtractingMetadata}
                        className="border-border/50"
                      />
                      {isExtractingMetadata && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-purple" />
                          <span className="text-xs text-muted-foreground">Extracting...</span>
                        </div>
                      )}
                    </div>
                    {isExtractingMetadata && (
                      <p className="text-xs text-muted-foreground mt-1">Extracting metadata from PDF...</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
            <h3 className="text-sm font-medium mb-3">Paper Details</h3>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="title" className="text-sm font-medium flex items-center gap-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="title"
                    placeholder="Paper title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className={`border-border/50 ${title === "" ? "border-red-500" : ""}`}
                  />
                  {title === "" && <span className="text-xs text-red-500">Title is required</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="authors" className="text-sm font-medium">
                    Authors
                  </label>
                  <MultiInput
                    inputs={authors}
                    setInputs={setAuthors}
                    currentInput={currentAuthor}
                    setCurrentInput={setCurrentAuthor}
                    placeholder="Add author(s)"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-1 max-h-[80px] overflow-y-auto">
                    {authors &&
                      authors.size > 0 &&
                      Array.from(authors).map((author) => (
                        <Badge key={author} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                          {author}
                          <X
                            size={14}
                            className="cursor-pointer hover:text-foreground/80"
                            onClick={() => {
                              setAuthors((prevauthors) => {
                                const newauthors = new Set(prevauthors)
                                newauthors.delete(author)
                                return newauthors
                              })
                            }}
                          />
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  className="max-h-[120px] min-h-[80px] border-border/50"
                  placeholder="Paper description or abstract"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleConfirmUpload}
            disabled={isFileUploading || isUrlUploading || (!selectedFile && !paperURL) || title === ""}
            className="bg-purple text-white hover:bg-dark-purple"
          >
            {isFileUploading || isUrlUploading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Uploading...</span>
              </div>
            ) : (
              "Add to Library"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
