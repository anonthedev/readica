import React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Plus, RefreshCcw } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";

interface LibraryHeaderProps {
  // onRefresh: () => void;
  onOpenUploadDialog: () => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  searchField: "title" | "author";
  setSearchField: (val: "title" | "author") => void;
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
    <div className="flex items-center gap-2 mb-4">
      <Input
        placeholder={`Search by ${searchField}...`}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-1/3"
      />
      <Select value={searchField} onValueChange={setSearchField}>
        <SelectTrigger className="w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="title">Title</SelectItem>
          <SelectItem value="author">Author</SelectItem>
        </SelectContent>
      </Select>
      <Button
        onClick={onOpenUploadDialog}
        className="flex flex-row items-center gap-2 py-1.5 px-3 bg-purple hover:cursor-pointer hover:bg-dark-purple text-white rounded-lg duration-200"
      >
        <Plus size={18} />
        Add Papers
      </Button>
      {/* <Button onClick={onRefresh} variant="outline" size="icon">
        <RefreshCcw size={18} />
      </Button> */}
    </div>
  );
};

export default LibraryHeader;
