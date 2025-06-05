"use client";

import type React from "react";
import { useLibraryStore } from "@/store/libraryStore";
import { Badge } from "@/components/ui/badge";

interface TagFilterProps {
  allTags: Set<string>;
}

const TagFilter: React.FC<TagFilterProps> = ({ allTags }) => {
  const selectedTags = useLibraryStore((state) => state.selectedTags);
  const setSelectedTags = useLibraryStore((state) => state.setSelectedTags);

  const handleTagClick = (tag: string) => {
    const newTags = new Set(selectedTags);
    if (newTags.has(tag)) {
      newTags.delete(tag);
    } else {
      newTags.add(tag);
    }
    setSelectedTags(newTags);
  };

  if (allTags.size === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {[...allTags].map((tag) => (
        <Badge
          key={tag}
          variant={selectedTags.has(tag) ? "default" : "outline"}
          className={`px-3 py-1 cursor-pointer transition-all ${
            selectedTags.has(tag)
              ? "bg-purple text-white hover:bg-dark-purple"
              : "hover:border-purple/50 hover:text-purple"
          }`}
          onClick={() => handleTagClick(tag)}
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
};

export default TagFilter;
