import { GlobalWorkerOptions } from "pdfjs-dist";
import {
  Root,
  Pages,
  Page,
  CanvasLayer,
  TextLayer,
  HighlightLayer,
  useSelectionDimensions,
  usePdf,
  calculateHighlightRects,
  SearchResult,
  usePdfJump,
  useSearch,
  Search,
  ZoomOut,
  CurrentZoom,
  ZoomIn,
  CustomLayer,
} from "@anaralabs/lector";
import { SelectionTooltip } from "@anaralabs/lector";
import "pdfjs-dist/web/pdf_viewer.css";
import { Button } from "../ui/button";

import { useDebounce } from "use-debounce";
import { useEffect, useState, useRef } from "react";
import { Input } from "../ui/input";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
  ZoomInIcon,
  ZoomOutIcon,
  PencilIcon,
  EraserIcon,
  HighlighterIcon,
} from "lucide-react";
import { useAnnotationState } from "./annotationStore";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

export default function PDFViewer({ url }: { url: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <Root
      source={url}
      className="w-1/2 h-[calc(100vh-40px)]"
      loader={<div className="p-4">Loading...</div>}
      zoomOptions={{
        minZoom: 0.5,
        maxZoom: 5,
      }}
    >
      <div
        className={`absolute top-[40px] h-[calc(100vh-40px)] bg-background z-10 p-2 transition-all duration-300 ease-in-out transform ${
          sidebarOpen
            ? "opacity-100 translate-x-0 visible"
            : "opacity-0 -translate-x-full invisible"
        } flex flex-col`}
      >
        <Search>
          <SearchUI />
        </Search>
      </div>

      <div className=" border-b p-1 flex items-center justify-center text-sm gap-1 h-[40px]">
        {/* <AnnotationToolbar /> */}
        <Button
          className=""
          variant={"ghost"}
          onClick={() => {
            setSidebarOpen(!sidebarOpen);
          }}
        >
          <SearchIcon size={16} />
        </Button>
        <div className="flex flex-row gap-0.5 items-center justify-center">
          <ZoomOut className="px-3 py-1 cursor-pointer ">
            <ZoomOutIcon size={15} />
          </ZoomOut>
          <CurrentZoom className=" rounded-full px-3 py-1 border text-center w-16" />
          <ZoomIn className="px-3 py-1 cursor-pointer">
            <ZoomInIcon size={15} />
          </ZoomIn>
          <PageNavigationButtons />
        </div>
      </div>
      <HighlightLayerContent />
    </Root>
  );
}

const PageNavigationButtons = () => {
  const pages = usePdf((state) => state.pdfDocumentProxy?.numPages);
  const currentPage = usePdf((state) => state.currentPage);
  const [pageNumber, setPageNumber] = useState<string | number>(currentPage);
  const { jumpToPage } = usePdfJump();

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      jumpToPage(currentPage - 1, { behavior: "auto" });
    }
  };

  const handleNextPage = () => {
    if (currentPage < pages) {
      jumpToPage(currentPage + 1, { behavior: "auto" });
    }
  };

  useEffect(() => {
    setPageNumber(currentPage);
  }, [currentPage]);

  return (
    <div className="flex items-center gap-1">
      <Button
        onClick={handlePreviousPage}
        disabled={currentPage <= 1}
        className="rounded-full disabled:opacity-40"
        aria-label="Previous page"
        size={"icon"}
        variant={"ghost"}
      >
        <ChevronLeftIcon />
      </Button>

      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={pageNumber}
          onChange={(e) => setPageNumber(e.target.value)}
          onBlur={(e) => {
            const value = Number(e.target.value);
            if (value >= 1 && value <= pages && currentPage !== value) {
              jumpToPage(value, { behavior: "auto" });
            } else {
              setPageNumber(currentPage);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
          className="w-12 h-7 text-center border rounded-md text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none "
        />
        <span className="text-sm text-gray-500 font-medium">
          / {pages || 1}
        </span>
      </div>

      <Button
        onClick={handleNextPage}
        disabled={currentPage >= pages}
        className="rounded-full disabled:opacity-40"
        aria-label="Next page"
        size={"icon"}
        variant={"ghost"}
      >
        <ChevronRightIcon />
      </Button>
    </div>
  );
};

//Highligt

const HighlightLayerContent = () => {
  const selectionDimensions = useSelectionDimensions();
  const setHighlights = usePdf((state) => state.setHighlight);

  const handleHighlight = () => {
    const dimension = selectionDimensions.getDimension();
    // console.log(dimension.highlights)
    if (dimension && !dimension.isCollapsed) {
      setHighlights(dimension.highlights);
    }
  };

  return (
    <Pages className="w-full max-w-full dark:invert-[94%] dark:hue-rotate-180 dark:brightness-[80%] dark:contrast-[228%] overflow-auto">
      <Page>
        {/* {selectionDimensions && <CustomSelect onHighlight={handleHighlight} />} */}
        <CanvasLayer />
        <TextLayer />
        {/* <HighlightLayer className="bg-yellow-200/70" /> */}

        {/* <CustomLayer>
          {(pageNumber) => (
            <>
              <AnnotationLayer pageNumber={pageNumber} />
            </>
          )}
        </CustomLayer> */}
      </Page>
    </Pages>
  );
};

function CustomSelect({ onHighlight }: { onHighlight: () => void }){
  return (
    <SelectionTooltip>
      <Button
        className="w-fit rounded-md px-3 py-1"
        onClick={onHighlight}
      >
        Highlight
      </Button>
    </SelectionTooltip>
  );
};

interface ResultItemProps {
  result: SearchResult;
}

//Search

function ResultItem({ result }: ResultItemProps){
  const { jumpToHighlightRects } = usePdfJump();
  const getPdfPageProxy = usePdf((state) => state.getPdfPageProxy);

  const onClick = async () => {
    const pageProxy = getPdfPageProxy(result.pageNumber);
    const rects = await calculateHighlightRects(pageProxy, {
      pageNumber: result.pageNumber,
      text: result.text,
      matchIndex: result.matchIndex,
    });
    jumpToHighlightRects(rects, "pixels");
  };

  return (
    <div
      className="flex px-3 py-2 rounded-md flex-col cursor-pointer hover:bg-accent"
      onClick={onClick}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm text-ellipsis text-wrap">{result.text}</p>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span className="ml-auto">Page {result.pageNumber}</span>
      </div>
    </div>
  );
};

interface ResultGroupProps {
  title: string;
  results: SearchResult[];
  displayCount?: number;
}

function ResultGroup ({ title, results, displayCount }: ResultGroupProps) {
  if (!results.length) return null;

  const displayResults = displayCount
    ? results.slice(0, displayCount)
    : results;

  console.log(results);

  return (
    <div className="space-y-2">
      {displayResults.map((result) => (
        <ResultItem
          key={`${result.pageNumber}-${result.matchIndex}`}
          result={result}
        />
      ))}
    </div>
  );
};

export function SearchUI() {
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText] = useDebounce(searchText, 500);
  const [limit, setLimit] = useState(15);
  const { searchResults: results, search } = useSearch();

  useEffect(() => {
    setLimit(5);
    search(debouncedSearchText, { limit: 15 });
  }, [debouncedSearchText]);

  const handleLoadMore = async () => {
    const newLimit = limit + 15;
    await search(debouncedSearchText, { limit: newLimit });
    setLimit(newLimit);
  };

  console.log(results);

  return (
    <div className="flex flex-col w-[25ch] max-w-[25ch] text-wrap h-full">
      <Input
        type="text"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder="Search in document..."
        className="px-4 py-2 border rounded-lg"
      />
      <div className="flex-1 overflow-y-auto">
        <div className="py-2">
          <ResultGroup title={searchText} results={[...results.exactMatches]} />
          {results.hasMoreResults && (
            <div className="flex justify-center mt-4">
              <Button onClick={handleLoadMore}>Load More</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AnnotationToolbar() {
  const {
    tool,
    setTool,
    strokeWidth,
    setStrokeWidth,
    strokeColor,
    setStrokeColor,
  } = useAnnotationState();

  return (
    <>
      <Button
        variant={tool === "pen" ? "default" : "ghost"}
        onClick={() => setTool(tool === "pen" ? "none" : "pen")}
        size="icon"
        className="w-8 h-8"
      >
        <PencilIcon size={16} />
      </Button>
      {tool === "pen" ||
        (tool === "highlight" && (
          <div className="absolute top-[40px] z-10 flex flex-row bg-accent px-4 py-2 rounded-lg">
            <Input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="w-8 h-8 p-1"
              title="Pen Color"
            />

            <div className="flex items-center gap-1">
              <Input
                type="range"
                min="1"
                max="20"
                step="1"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="w-16 h-6 accent-primary"
                title="Pen Width"
              />
              <span className="text-xs w-4 text-center">{strokeWidth}</span>
            </div>
          </div>
        ))}
      <Button
        variant={tool === "eraser" ? "default" : "ghost"}
        onClick={() => setTool(tool === "eraser" ? "none" : "eraser")}
        size="icon"
        className="w-8 h-8"
      >
        <EraserIcon size={16} />
      </Button>
      <Button
        variant={tool === "highlight" ? "default" : "ghost"}
        onClick={() => setTool(tool === "highlight" ? "none" : "highlight")}
        size="icon"
        className="w-8 h-8"
      >
        <HighlighterIcon size={16} />
      </Button>
    </>
  );
}

function AnnotationLayer({ pageNumber }: { pageNumber: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    tool,
    strokeWidth,
    strokeColor /* pushUndo,  popUndo, pushRedo, popRedo, clearRedo */,
  } = useAnnotationState();

  function hexToRGBA(hex: string, alpha: number) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const resizeCanvas = () => {
      const dataUrl = canvas.toDataURL();
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = dataUrl;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let annotating = false;

    const start = (e: MouseEvent) => {
      if (tool === "none") return;
      annotating = true;
      ctx.beginPath();
      ctx.moveTo(e.offsetX, e.offsetY);
      ctx.globalCompositeOperation =
        tool === "highlight" ? "multiply" : "source-over";
    };

    const draw = (e: MouseEvent) => {
      if (!annotating) return;
      ctx.globalCompositeOperation =
        tool === "highlight" ? "multiply" : "source-over";
      if (tool === "eraser") {
        ctx.clearRect(e.offsetX - 10, e.offsetY - 10, 20, 20);
      } else if (tool === "pen" || tool === "highlight") {
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.strokeStyle =
          tool === "highlight" ? hexToRGBA(strokeColor, 0.6) : strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = tool === "highlight" ? "butt" : "round";
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
      }
    };

    const stop = () => {
      if (annotating) {
        annotating = false;
        ctx.closePath();
        ctx.globalCompositeOperation = "source-over";
      }
    };

    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stop);
    canvas.addEventListener("mouseleave", stop);

    return () => {
      canvas.removeEventListener("mousedown", start);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stop);
      canvas.removeEventListener("mouseleave", stop);
    };
  }, [tool, strokeWidth, strokeColor]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full z-50 pointer-events-auto cursor-crosshair"
    />
  );
}
