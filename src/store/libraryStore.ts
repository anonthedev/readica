import { create } from 'zustand';
import { LibraryItemType } from '@/types/PaperTypes';

interface LibraryState {
  library: LibraryItemType[];
  setLibrary: (library: LibraryItemType[]) => void;
  loadingPapers: boolean;
  setLoadingPapers: (loading: boolean) => void;
  selectedTags: Set<string>;
  setSelectedTags: (tags: Set<string>) => void;
  uploadPaperDialogOpen: boolean;
  setUploadPaperDialogOpen: (open: boolean) => void;
}

export const useLibraryStore = create<LibraryState>((set) => ({
  library: [],
  setLibrary: (library) => set({ library }),
  loadingPapers: true,
  setLoadingPapers: (loading) => set({ loadingPapers: loading }),
  selectedTags: new Set(),
  setSelectedTags: (tags) => set({ selectedTags: new Set(tags) }),
  uploadPaperDialogOpen: false,
  setUploadPaperDialogOpen: (open) => set({ uploadPaperDialogOpen: open }),
}));
