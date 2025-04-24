import React from "react";
import { useLibraryStore } from "@/store/libraryStore";

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

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {[...allTags].map((tag) => (
        <button
          key={tag}
          className={`px-2 py-1 rounded-md border cursor-pointer ${selectedTags.has(tag) ? "bg-purple text-white" : "bg-muted"}`}
          onClick={() => handleTagClick(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
};

export default TagFilter;
