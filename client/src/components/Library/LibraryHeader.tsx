"use client"

import type React from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Plus, Search } from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select"

interface LibraryHeaderProps {
  // onRefresh: () => void;
  onOpenUploadDialog: () => void
  searchQuery: string
  setSearchQuery: (val: string) => void
  searchField: "title" | "author"
  setSearchField: (val: "title" | "author") => void
}

const LibraryHeader: React.FC<LibraryHeaderProps> = ({
  // onRefresh,
  onOpenUploadDialog,
  searchQuery,
  setSearchQuery,
  searchField,
  setSearchField,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3">
      <div className="flex-1 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Input
            placeholder={`Search by ${searchField}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-12 bg-background border-border/50 focus-visible:ring-purple/30"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            <Search size={18} />
          </div>
        </div>
        <Select value={searchField} onValueChange={setSearchField}>
          <SelectTrigger className="w-[120px] bg-background border-border/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="author">Author</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        onClick={onOpenUploadDialog}
        className="flex flex-row items-center gap-2 py-2 px-4 bg-purple hover:bg-dark-purple text-white rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
      >
        <Plus size={18} />
        Add Papers
      </Button>
    </div>
  )
}

export default LibraryHeader
