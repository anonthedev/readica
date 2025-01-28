'use client';
import { useEffect, useRef, useState } from 'react';
import { MinusCircle, PlusCircle, RotateCcw } from 'lucide-react';

interface PDFViewerProps {
    url: string;
}

type RenderTask = {
    promise: Promise<void>;
    cancel: () => void;
};

export default function PDFViewer2({ url }: PDFViewerProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [scale, setScale] = useState<number>(0.5);
    const renderTasks = useRef<RenderTask[]>([]);

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.25));
    const handleResetZoom = () => setScale(0.5);

    useEffect(() => {
        let isCancelled = false;

        async function renderPages() {
            const pdfJS = await import('pdfjs-dist/build/pdf');
            pdfJS.GlobalWorkerOptions.workerSrc =
                window.location.origin + '/pdf.worker.min.mjs';

            try {
                const pdf = await pdfJS.getDocument(url).promise;
                if (isCancelled) return;

                setNumPages(pdf.numPages);
                const container = containerRef.current;
                if (!container) return;

                while (container.firstChild) {
                    container.removeChild(container.firstChild);
                }

                renderTasks.current.forEach(task => task?.cancel());
                renderTasks.current = [];

                const devicePixelRatio = window.devicePixelRatio || 1;
                const screenDPI = 96 * devicePixelRatio;

                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    if (isCancelled) return;

                    const page = await pdf.getPage(pageNum);
                    
                    const desiredDPI = 300;
                    const dpiScale = (desiredDPI / screenDPI);
                    const finalScale = scale * dpiScale;
                    
                    const viewport = page.getViewport({ scale: finalScale });

                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    if (!context) continue;

                    const outputScale = devicePixelRatio;
                    canvas.width = Math.floor(viewport.width * outputScale);
                    canvas.height = Math.floor(viewport.height * outputScale);
                    
                    canvas.style.width = Math.floor(viewport.width) + 'px';
                    canvas.style.height = Math.floor(viewport.height) + 'px';
                    canvas.className = 'mb-4';
                    canvas.setAttribute('data-page', pageNum.toString());

                    context.scale(outputScale, outputScale);

                    const observer = new IntersectionObserver(
                        (entries) => {
                            entries.forEach(entry => {
                                if (entry.isIntersecting) {
                                    setCurrentPage(parseInt(entry.target.getAttribute('data-page') || '1'));
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
                        renderInteractiveForms: true
                    };

                    const renderTask = page.render(renderContext);
                    renderTasks.current.push(renderTask);

                    try {
                        await renderTask.promise;
                        if (!isCancelled) {
                            console.log(`Page ${pageNum} rendered at ${desiredDPI} DPI`);
                        }
                    } catch (error: any) {
                        if (error.name === 'RenderingCancelledException') {
                            console.log(`Page ${pageNum} rendering cancelled`);
                        } else {
                            console.error(`Error rendering page ${pageNum}:`, error);
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading PDF:', error);
            }
        }

        renderPages();

        return () => {
            isCancelled = true;
            renderTasks.current.forEach(task => task?.cancel());
        };
    }, [url, scale]);

    const scrollToPage = (pageNum: number) => {
        const canvas = containerRef.current?.querySelector(`[data-page="${pageNum}"]`);
        canvas?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="flex flex-col h-full w-1/2">
            <div className="flex items-center justify-between bg-gray-100 p-4 rounded-t-lg">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleZoomOut}
                        className="p-2 hover:bg-gray-200 rounded-full"
                        aria-label="Zoom out"
                    >
                        <MinusCircle className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleResetZoom}
                        className="p-2 hover:bg-gray-200 rounded-full"
                        aria-label="Reset zoom"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleZoomIn}
                        className="p-2 hover:bg-gray-200 rounded-full"
                        aria-label="Zoom in"
                    >
                        <PlusCircle className="w-5 h-5" />
                    </button>
                    <span className="text-sm">
                        {Math.round(scale * 100)}%
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    <select
                        value={currentPage}
                        onChange={(e) => {
                            const page = parseInt(e.target.value);
                            setCurrentPage(page);
                            scrollToPage(page);
                        }}
                        className="p-1 border rounded"
                    >
                        {[...Array(numPages)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                                Page {i + 1}
                            </option>
                        ))}
                    </select>
                    <span className="text-sm text-gray-600">
                        of {numPages}
                    </span>
                </div>
            </div>

            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto p-4 bg-gray-50"
                style={{
                    WebkitFontSmoothing: 'subpixel-antialiased',
                    textRendering: 'optimizeLegibility'
                }}
            />
        </div>
    );
}