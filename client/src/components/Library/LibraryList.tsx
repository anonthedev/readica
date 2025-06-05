import type React from "react"
import LibraryItem from "@/components/Library/LibraryItem"
import LibraryLoading from "@/components/Library/LibraryLoading"
import type { LibraryItemType } from "@/types/PaperTypes"
import { useLibrary } from "@/hooks/use-library"
import { FileX } from "lucide-react"

interface LibraryListProps {
  filter: (item: LibraryItemType) => boolean
}

const LibraryList: React.FC<LibraryListProps> = ({ filter }) => {
  const { library, isLoading } = useLibrary()

  if (isLoading) {
    return <LibraryLoading />
  }

  if (!library || library.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileX size={48} className="text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">No papers found</h3>
        <p className="text-muted-foreground">Your library is empty. Add papers to get started.</p>
      </div>
    )
  }

  const filteredLibrary = library.filter(filter)

  if (filteredLibrary.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileX size={48} className="text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">No matching papers</h3>
        <p className="text-muted-foreground">No papers match your current search or filter criteria.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredLibrary.map((item: LibraryItemType) => (
        <LibraryItem key={item.uuid} item={item} />
      ))}
    </div>
  )
}

export default LibraryList
