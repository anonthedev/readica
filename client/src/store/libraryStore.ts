import { create } from 'zustand';
import { LibraryItemType } from '@/types/PaperTypes';

interface LibraryState {
  library: LibraryItemType[];
  setLibrary: (library: LibraryItemType[]) => void;
  loadingPapers: boolean;
  setLoadingPapers: (loading: boolean) => void;
  selectedTags: Set<string>;
  setSelectedTags: (tags: Set<string>) => void;
  selectedStatuses: Set<string>;
  setSelectedStatuses: (statuses: Set<string>) => void;
  uploadPaperDialogOpen: boolean;
  setUploadPaperDialogOpen: (open: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortOption: string;
  setSortOption: (option: string) => void;
}

export const useLibraryStore = create<LibraryState>((set) => ({
  library: [],
  setLibrary: (library) => set({ library }),
  loadingPapers: true,
  setLoadingPapers: (loading) => set({ loadingPapers: loading }),
  selectedTags: new Set(),
  setSelectedTags: (tags) => set({ selectedTags: tags }),
  selectedStatuses: new Set(),
  setSelectedStatuses: (statuses) => set({ selectedStatuses: statuses }),
  uploadPaperDialogOpen: false,
  setUploadPaperDialogOpen: (open) => set({ uploadPaperDialogOpen: open }),
  searchTerm: "",
  setSearchTerm: (term) => set({ searchTerm: term }),
  sortOption: "upload_date-desc", // Default sort option
  setSortOption: (option) => set({ sortOption: option }),
}));
