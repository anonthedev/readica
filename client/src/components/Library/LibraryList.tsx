import React from "react";
import LibraryItem from "@/components/Library/LibraryItem";
import LibraryLoading from "@/components/Library/LibraryLoading";
import { LibraryItemType } from "@/types/PaperTypes";
import { useLibrary } from "@/hooks/use-library";

interface LibraryListProps {
  filter: (item: LibraryItemType) => boolean;
}

const LibraryList: React.FC<LibraryListProps> = ({ filter }) => {
  const { library, isLoading } = useLibrary();

  if (isLoading) {
    return <LibraryLoading />;
  }

  if (!library) {
    return <div>No papers found in your library.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {library.filter(filter).map((item: LibraryItemType) => (
        <LibraryItem key={item.uuid} item={item} />
      ))}
    </div>
  );
};

export default LibraryList;
