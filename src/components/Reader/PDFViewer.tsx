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
  AnnotationLayer,
} from "@anaralabs/lector";
import { SelectionTooltip } from "@anaralabs/lector";
import "pdfjs-dist/web/pdf_viewer.css";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

import { useDebounce } from "use-debounce";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
  Sidebar,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

export default function PDFViewer({ url }: { url: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <Root
      source={url}
      className="w-1/2 max-h-screen"
      loader={<div className="p-4">Loading...</div>}
      zoomOptions={{
        minZoom: 0.5,
        maxZoom: 10,
      }}
    >
      <div
        className={`${
          sidebarOpen ? "absolute" : "hidden"
        } flex flex-col h-full bg-background z-10 p-2 duration-150 transition-all`}
      >
        <Button
          variant={"ghost"}
          size={"icon"}
          className="self-end p-1"
          onClick={() => {
            setSidebarOpen(false);
          }}
        >
          <Sidebar size={16} />
        </Button>
        <Search>
          <SearchUI />
        </Search>
      </div>
      <div className=" border-b p-1 flex items-center justify-center text-sm gap-1">
        <Button
          className=""
          variant={"ghost"}
          onClick={() => {
            setSidebarOpen(true);
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
    if (dimension && !dimension.isCollapsed) {
      setHighlights(dimension.highlights);
    }
  };

  return (
    <Pages className="p-4 w-full">
      <Page>
        {selectionDimensions && <CustomSelect onHighlight={handleHighlight} />}
        <CanvasLayer />
        <TextLayer />
        <AnnotationLayer />
        <HighlightLayer className="bg-yellow-200/70" />
      </Page>
    </Pages>
  );
};

export const CustomSelect = ({ onHighlight }: { onHighlight: () => void }) => {
  return (
    <SelectionTooltip>
      <div className="flex flex-col bg-white p-2">
        <Textarea placeholder="Enter comment" cols={30} />
        <Button
          className="w-fit shadow-lg rounded-md px-3 py-1"
          onClick={onHighlight}
        >
          Highlight
        </Button>
      </div>
    </SelectionTooltip>
  );
};

interface ResultItemProps {
  result: SearchResult;
}

//Search

const ResultItem = ({ result }: ResultItemProps) => {
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
    <div className="flex py-2 flex-col cursor-pointer" onClick={onClick}>
      <div className="flex-1 min-w-0">
        <p className="text-sm ">{result.text}</p>
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

const ResultGroup = ({ title, results, displayCount }: ResultGroupProps) => {
  if (!results.length) return null;

  const displayResults = displayCount
    ? results.slice(0, displayCount)
    : results;

  console.log(results);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium ">{title}</h3>
      <div className="divide-y divide-gray-100">
        {displayResults.map((result) => (
          <ResultItem
            key={`${result.pageNumber}-${result.matchIndex}`}
            result={result}
          />
        ))}
      </div>
    </div>
  );
};

export function SearchUI() {
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText] = useDebounce(searchText, 500);
  const [limit, setLimit] = useState(5);
  const { searchResults: results, search } = useSearch();

  useEffect(() => {
    setLimit(5);
    search(debouncedSearchText, { limit: 5 });
  }, [debouncedSearchText]);

  const handleLoadMore = async () => {
    const newLimit = limit + 5;
    await search(debouncedSearchText, { limit: newLimit });
    setLimit(newLimit);
  };

  console.log(results);

  return (
    <div className="flex flex-col max-w-[30ch] text-wrap h-full">
      <div className="gap-3 px-4 py-4 border-b border-gray-200 ">
        <Input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search in document..."
          className="px-4 py-2 border rounded-lg"
        />
      </div>
      <div className="flex-1 overflow-y-auto px-4">
        <div className="py-4">
          <ResultGroup
            title={searchText}
            results={[...results.exactMatches, ...results.fuzzyMatches]}
          />
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
