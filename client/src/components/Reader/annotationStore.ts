import { create } from "zustand";

type ToolType = "pen" | "eraser" | "highlight" | "none";

interface AnnotationState {
  tool: ToolType;
  strokeWidth: number;
  strokeColor: string;
  undoStack: string[];
  redoStack: string[];
  setTool: (tool: ToolType) => void;
  setStrokeWidth: (width: number) => void;
  setStrokeColor: (color: string) => void;
  pushUndo: (dataUrl: string) => void;
  popUndo: () => string | undefined;
  pushRedo: (dataUrl: string) => void;
  popRedo: () => string | undefined;
  clearRedo: () => void;
}

export const useAnnotationState = create<AnnotationState>((set, get) => ({
  tool: "none",
  strokeWidth: 2,
  strokeColor: "#000000",
  undoStack: [],
  redoStack: [],
  setTool: (tool) => set({ tool }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),
  setStrokeColor: (color) => set({ strokeColor: color }),
  pushUndo: (dataUrl) => {
    set((state) => ({
      undoStack: [...state.undoStack, dataUrl],
      redoStack: [],
    }));
  },
  popUndo: () => {
    const stack = [...get().undoStack];
    const popped = stack.pop();
    set({ undoStack: stack });
    return popped;
  },
  pushRedo: (dataUrl) => set((state) => ({ redoStack: [...state.redoStack, dataUrl] })),
  popRedo: () => {
    const stack = [...get().redoStack];
    const popped = stack.pop();
    set({ redoStack: stack });
    return popped;
  },
  clearRedo: () => set({ redoStack: [] }),
}));
