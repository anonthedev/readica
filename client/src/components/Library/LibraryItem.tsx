"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import MultiInput from "@/components/ui/multi-input"
import { toast } from "sonner"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import type { LibraryItemType } from "@/types/PaperTypes"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { EllipsisVertical, X, FileText, Users, Calendar, Tag } from "lucide-react"
import { useUpdateLibraryItem, useDeleteFromLibrary } from "@/hooks/use-library"

export default function LibraryItem({ item }: { item: LibraryItemType }) {
  const [tags, setTags] = useState<Set<string>>(new Set())
  const [currentTag, setCurrentTag] = useState("")
  const [title, setTitle] = useState(item.title)
  const [description, setDescription] = useState(item.description || "")
  const [authors, setAuthors] = useState<Set<string>>(new Set(item.authors))
  const [currentAuthor, setCurrentAuthor] = useState("")
  const [pdfLink, setPdfLink] = useState(item.pdf_link || "")

  const { data: session } = useSession()
  const { mutate: updateItem, isPending: isUpdating } = useUpdateLibraryItem()
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteFromLibrary()

  useEffect(() => {
    if (item.tags) {
      setTags(new Set(item.tags))
    }
  }, [item.tags])

  const updateTags = () => {
    if (tags.size > 5) {
      toast.error("You can only have up to 5 tags.")
      return
    }

    updateItem(
      { uuid: item.uuid, tags: Array.from(tags) },
      {
        onSuccess: () => {
          toast.success("Tags updated successfully.")
        },
        onError: (error) => {
          toast.error("Failed to update tags. Please try again.")
        },
      },
    )
  }

  const deletePaper = () => {
    deleteItem(item.uuid, {
      onSuccess: () => {
        toast.success("Paper deleted successfully")
      },
      onError: () => {
        toast.error("Failed to delete paper")
      },
    })
  }

  const updatePaperDetails = () => {
    updateItem(
      {
        uuid: item.uuid,
        title,
        description,
        authors: Array.from(authors),
        pdf_link: pdfLink,
      },
      {
        onSuccess: () => {
          toast.success("Paper details updated successfully")
        },
        onError: () => {
          toast.error("Failed to update paper details")
        },
      },
    )
  }

  // Format the upload date
  const formattedDate = item.upload_date
    ? new Date(item.upload_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null

  return (
    <div
      key={item.uuid}
      className="group flex flex-col justify-between bg-background text-foreground rounded-lg p-5 border border-border shadow-sm hover:shadow-md transition-all duration-200 hover:border-purple/30"
    >
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <Link href={`/reader/${item.uuid}`} target="_blank" className="flex-1">
            <h2
              className="font-semibold text-lg line-clamp-2 group-hover:text-purple transition-colors duration-200"
              title={item.title}
            >
              {item.title}
            </h2>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-70 hover:opacity-100">
                <EllipsisVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <Dialog>
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                    <Tag className="mr-2 h-4 w-4" />
                    Edit Tags
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent onKeyDown={(e) => e.stopPropagation()}>
                  <DialogHeader className="flex flex-col gap-2">
                    <DialogTitle>Edit tags</DialogTitle>
                    <DialogDescription className="flex flex-col gap-2">
                      <span>Maximum of 5 tags can be set to a paper.</span>
                      <span className="flex flex-row gap-2 flex-wrap">
                        {tags &&
                          tags.size > 0 &&
                          Array.from(tags).map((tag) => (
                            <Badge key={tag} className="flex items-center gap-1 bg-purple text-white px-2 py-1">
                              {tag}
                              <X
                                size={14}
                                className="cursor-pointer hover:text-white/80"
                                onClick={() => {
                                  setTags((prevTags) => {
                                    const newTags = new Set(prevTags)
                                    newTags.delete(tag)
                                    return newTags
                                  })
                                }}
                              />
                            </Badge>
                          ))}
                      </span>
                      <MultiInput
                        inputs={tags}
                        setCurrentInput={setCurrentTag}
                        currentInput={currentTag}
                        setInputs={setTags}
                        maxInputs={5}
                        placeholder="Press Enter after typing a tag"
                      />
                      <Button
                        className="w-full mt-2"
                        disabled={isUpdating}
                        onClick={() => {
                          updateTags()
                        }}
                      >
                        {isUpdating ? "Updating..." : "Save Tags"}
                      </Button>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                    <FileText className="mr-2 h-4 w-4" />
                    Edit Paper Details
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent onKeyDown={(e) => e.stopPropagation()}>
                  <DialogHeader>
                    <DialogTitle>Edit Paper Details</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-4 py-4">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="title" className="text-sm font-medium">
                        Title
                      </label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Paper title"
                        className="border-border/50"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Authors</label>
                      <MultiInput
                        inputs={authors}
                        setCurrentInput={setCurrentAuthor}
                        currentInput={currentAuthor}
                        setInputs={setAuthors}
                        placeholder="Press Enter after typing each author"
                      />
                      <div className="flex flex-row gap-2 flex-wrap my-2 max-h-[100px] overflow-y-auto">
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
                    <div className="flex flex-col gap-2">
                      <label htmlFor="description" className="text-sm font-medium">
                        Description
                      </label>
                      <Textarea
                        className="max-h-[100px] border-border/50"
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Paper description"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="pdfLink" className="text-sm font-medium">
                        PDF Link
                      </label>
                      <Input
                        id="pdfLink"
                        value={pdfLink}
                        onChange={(e) => setPdfLink(e.target.value)}
                        placeholder="Link to PDF"
                        className="border-border/50"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button disabled={isUpdating || !title} onClick={updatePaperDetails}>
                      {isUpdating ? "Updating..." : "Save Changes"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <DropdownMenuItem
                className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/50"
                onClick={deletePaper}
              >
                <X className="mr-2 h-4 w-4" />
                Delete paper
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-2" title={item.description}>
            {item.description}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span className="truncate">
              {item.authors.length > 2
                ? item.authors.slice(0, 2).join(", ") + `, +${item.authors.length - 2}`
                : item.authors.join(", ")}
            </span>
          </div>

          {formattedDate && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formattedDate}</span>
            </div>
          )}
        </div>
      </div>

      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {item.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs bg-transparent hover:bg-purple/5">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <Link
        href={`/reader/${item.uuid}`}
        target="_blank"
        className="mt-4 pt-4 border-t border-border text-sm font-medium text-purple hover:text-dark-purple transition-colors flex items-center justify-center w-full"
      >
        Open Paper
      </Link>
    </div>
  )
}
