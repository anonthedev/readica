import { PanelResizeHandle } from "react-resizable-panels";

export default function ResizeHandle({ className = "" }: { className?: string }) {
  return (
    <PanelResizeHandle 
      className={`w-1.5 mx-0.5 hover:w-2 transition-all duration-150 ease-in-out 
                 flex items-center justify-center bg-gray-200 hover:bg-gray-400 
                 cursor-col-resize active:bg-gray-500 ${className}`}
    >
      <div className="w-0.5 h-8 bg-gray-400 rounded-full" />
    </PanelResizeHandle>
  );
}
