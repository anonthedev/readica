"use client";
import { useEffect, useRef, useState } from "react";
import { MinusCircle, PlusCircle, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface PDFViewerProps {
  url: string;
}

type RenderTask = {
  promise: Promise<void>;
  cancel: () => void;
};

export default function PDFViewer({ url }: PDFViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(0.5);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState<{
    loaded: number;
    total: number;
  }>({ loaded: 0, total: 0 });
  const renderTasks = useRef<RenderTask[]>([]);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.1, 0.25));
  const handleResetZoom = () => setScale(0.5);

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setLoadingProgress({ loaded: 0, total: 0 });

    async function renderPages() {
      const pdfJS = await import("pdfjs-dist/build/pdf");
      pdfJS.GlobalWorkerOptions.workerSrc =
        window.location.origin + "/pdf.worker.min.mjs";

      try {
        const loadingTask = pdfJS.getDocument(url);
        //@ts-expect-error
        loadingTask.onProgress = (progress) => {
          setLoadingProgress({
            loaded: progress.loaded,
            total: progress.total,
          });
        };

        const pdf = await loadingTask.promise;
        if (isCancelled) return;

        setNumPages(pdf.numPages);
        const container = containerRef.current;
        if (!container) return;

        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }

        renderTasks.current.forEach((task) => task?.cancel());
        renderTasks.current = [];

        const devicePixelRatio = window.devicePixelRatio || 1;
        const screenDPI = 96 * devicePixelRatio;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          if (isCancelled) return;

          const page = await pdf.getPage(pageNum);

          const desiredDPI = 300;
          const dpiScale = desiredDPI / screenDPI;
          const finalScale = scale * dpiScale;

          const viewport = page.getViewport({ scale: finalScale });

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) continue;

          const outputScale = devicePixelRatio;
          canvas.width = Math.floor(viewport.width * outputScale);
          canvas.height = Math.floor(viewport.height * outputScale);

          canvas.style.width = Math.floor(viewport.width) + "px";
          canvas.style.height = Math.floor(viewport.height) + "px";
          canvas.className = "mb-4";
          canvas.setAttribute("data-page", pageNum.toString());

          context.scale(outputScale, outputScale);

          const observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  setCurrentPage(
                    parseInt(entry.target.getAttribute("data-page") || "1")
                  );
                }
              });
            },
            { threshold: 0.5 }
          );
          observer.observe(canvas);

          container.appendChild(canvas);

          const renderContext = {
            canvasContext: context,
            viewport: viewport,
            enableWebGL: true,
            renderInteractiveForms: true,
          };

          const renderTask = page.render(renderContext);
          renderTasks.current.push(renderTask);

          try {
            await renderTask.promise;
            if (!isCancelled) {
              setLoadingProgress((prev) => ({
                ...prev,
                loaded: pageNum,
              }));
            }
          } catch (error: any) {
            if (error.name === "RenderingCancelledException") {
              console.log(`Page ${pageNum} rendering cancelled`);
            } else {
              console.error(`Error rendering page ${pageNum}:`, error);
            }
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading PDF:", error);
        setIsLoading(false);
      }
    }

    renderPages();

    return () => {
      isCancelled = true;
      renderTasks.current.forEach((task) => task?.cancel());
    };
  }, [url, scale]);

  const scrollToPage = (pageNum: number) => {
    const canvas = containerRef.current?.querySelector(
      `[data-page="${pageNum}"]`
    );
    canvas?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col h-full w-1/2">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleZoomOut}
            variant={"ghost"}
            size={"icon"}
            className="p-2 rounded-full"
            aria-label="Zoom out"
            disabled={isLoading}
          >
            <MinusCircle className="w-5 h-5" />
          </Button>
          <Button
            variant={"ghost"}
            size={"icon"}
            onClick={handleResetZoom}
            className="p-2 rounded-full"
            aria-label="Reset zoom"
            disabled={isLoading}
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
          <Button
            variant={"ghost"}
            size={"icon"}
            onClick={handleZoomIn}
            className="p-2 rounded-full"
            aria-label="Zoom in"
            disabled={isLoading}
          >
            <PlusCircle className="w-5 h-5" />
          </Button>
          <span className="text-sm">{Math.round(scale * 100)}%</span>
        </div>
        <div className="flex items-center space-x-2">
          <Input
            className="w-[50px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            type="number"
            value={currentPage}
            // min={1}
            max={numPages}
            onChange={(e) => {
                if (!isNaN(parseInt(e.target.value))) {
                    setCurrentPage(parseInt(e.target.value));
                    scrollToPage(parseInt(e.target.value));
                }
            }}
          />
          <span className="text-sm text-gray-600">of {numPages}</span>
        </div>
      </div>

      <div className="relative flex-1 h-full">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 z-50">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-2" />
            <div className="text-sm text-gray-600">
              {loadingProgress.total
                ? `Loading ${Math.round(
                    (loadingProgress.loaded / loadingProgress.total) * 100
                  )}%`
                : "Loading PDF..."}
            </div>
          </div>
        )}
        <div
          ref={containerRef}
          className="h-full overflow-y-auto bg-gray-50"
          style={{
            WebkitFontSmoothing: "subpixel-antialiased",
            textRendering: "optimizeLegibility",
          }}
        />
      </div>
    </div>
  );
}
