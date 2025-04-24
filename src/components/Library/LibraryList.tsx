import React from "react";
import LibraryItem from "@/components/Library/LibraryItem";
import LibraryLoading from "@/components/Library/LibraryLoading";
import { useLibraryStore } from "@/store/libraryStore";
import { LibraryItemType } from "@/types/PaperTypes";

interface LibraryListProps {
  filter: (item: LibraryItemType) => boolean;
}

const LibraryList: React.FC<LibraryListProps> = ({ filter }) => {
  const library = useLibraryStore((state) => state.library);
  const loadingPapers = useLibraryStore((state) => state.loadingPapers);

  if (loadingPapers) {
    return <LibraryLoading />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {library.filter(filter).map((item) => (
        <LibraryItem key={item.uuid} item={item} />
      ))}
    </div>
  );
};

export default LibraryList;
