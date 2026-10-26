import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Download,
  ExternalLink,
  FileText,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { DocumentItem } from '../types';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PdfPreviewModalProps {
  document: DocumentItem | null;
  onClose: () => void;
}

interface PdfPageItemProps {
  pageNumber: number;
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  scale: number;
  baseWidth: number;
  baseHeight: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  setPageRef: (pageNumber: number, el: HTMLDivElement | null) => void;
}

const PdfPageItem: React.FC<PdfPageItemProps> = ({
  pageNumber,
  pdfDoc,
  scale,
  baseWidth,
  baseHeight,
  containerRef,
  setPageRef,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);

  // Pre-render pages 1 and 2 immediately; observe others on scroll
  const [shouldRender, setShouldRender] = useState<boolean>(pageNumber <= 2);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [isRendered, setIsRendered] = useState<boolean>(false);
  const [pageSize, setPageSize] = useState<{ width: number; height: number }>({
    width: Math.floor(baseWidth * scale),
    height: Math.floor(baseHeight * scale),
  });

  // Register page DOM element for programmatic smooth scrolling & scroll tracking
  useEffect(() => {
    setPageRef(pageNumber, cardRef.current);
    return () => setPageRef(pageNumber, null);
  }, [pageNumber, setPageRef]);

  // Update estimated page size when scale changes
  useEffect(() => {
    setPageSize((prev) => {
      const ratio = prev.height / (prev.width || 1);
      const w = Math.floor(baseWidth * scale);
      return { width: w, height: Math.floor(w * ratio) };
    });
  }, [scale, baseWidth]);

  // Lazy render observer: start rendering 600px before scrolling into view
  useEffect(() => {
    const el = cardRef.current;
    const rootEl = containerRef.current;
    if (!el || !rootEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldRender(true);
          }
        });
      },
      {
        root: rootEl,
        rootMargin: '600px 0px 600px 0px',
        threshold: 0.01,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef]);

  // Render to canvas whenever shouldRender becomes true or scale changes
  useEffect(() => {
    if (!shouldRender || !pdfDoc) return;

    let isCancelled = false;

    const render = async () => {
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // Render task cancelled
        }
      }

      setIsRendering(true);

      try {
        if (!pdfDoc || isCancelled) return;
        const page = await pdfDoc.getPage(pageNumber);
        if (isCancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        const viewport = page.getViewport({ scale });
        const pixelRatio = window.devicePixelRatio || 1;

        const actualWidth = Math.floor(viewport.width);
        const actualHeight = Math.floor(viewport.height);

        setPageSize({ width: actualWidth, height: actualHeight });

        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);
        canvas.style.width = `${actualWidth}px`;
        canvas.style.height = `${actualHeight}px`;

        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
        if (!isCancelled) {
          setIsRendering(false);
          setIsRendered(true);
        }
      } catch (err: unknown) {
        if (isCancelled) return;
        const errMessage = (err as Error)?.message || '';
        const errName = (err as { name?: string })?.name || '';
        if (
          errName !== 'RenderingCancelledException' &&
          !errMessage.includes('sendWithPromise') &&
          !errMessage.includes('destroyed') &&
          !errMessage.includes('Worker was destroyed')
        ) {
          console.error(`Error rendering page ${pageNumber}:`, err);
        }
        if (!isCancelled) {
          setIsRendering(false);
        }
      }
    };

    render();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // Render task cancelled
        }
      }
    };
  }, [shouldRender, pdfDoc, pageNumber, scale]);

  return (
    <div
      ref={cardRef}
      id={`pdf-page-${pageNumber}`}
      className="relative bg-white shadow-xl rounded overflow-hidden select-none shrink-0 border border-slate-300 dark:border-slate-700/60 transition-transform duration-100"
      style={{
        width: `${pageSize.width}px`,
        minHeight: `${pageSize.height}px`,
      }}
    >
      {/* Page indicator pill */}
      <div className="absolute top-2 left-2 bg-slate-900/65 text-white text-[10px] px-2 py-0.5 rounded-full z-10 backdrop-blur-xs font-mono select-none pointer-events-none">
        Page {pageNumber}
      </div>

      {isRendering && !isRendered && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 dark:bg-slate-900/80 z-10">
          <Loader2 className="w-6 h-6 text-[#4c3f6b] dark:text-[#bcaee0] animate-spin mb-1.5" />
          <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
            Rendering page {pageNumber}...
          </span>
        </div>
      )}

      <canvas ref={canvasRef} className="block" />
    </div>
  );
};

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({ document, onClose }) => {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.1);
  const [baseDimensions, setBaseDimensions] = useState<{ width: number; height: number }>({
    width: 595,
    height: 842,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const setPageRef = useCallback((pageNum: number, el: HTMLDivElement | null) => {
    pageRefs.current[pageNum] = el;
  }, []);

  // Pinch-to-zoom touch tracking
  const touchStateRef = useRef<{
    initialDistance: number;
    initialScale: number;
    isPinching: boolean;
  }>({
    initialDistance: 0,
    initialScale: scale,
    isPinching: false,
  });

  // Track if modal is closing because of a browser back swipe (popstate)
  const isPopstateClosingRef = useRef<boolean>(false);

  // Synchronize smooth jump to page
  const scrollToPage = useCallback((targetPage: number) => {
    const el = pageRefs.current[targetPage];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setCurrentPage(targetPage);
    }
  }, []);

  // Maintain refs so keyboard shortcuts stay up to date without re-running the history effect
  const numPagesRef = useRef<number>(numPages);
  useEffect(() => {
    numPagesRef.current = numPages;
  }, [numPages]);

  const scrollToPageRef = useRef(scrollToPage);
  useEffect(() => {
    scrollToPageRef.current = scrollToPage;
  }, [scrollToPage]);

  // Dynamic Viewport Lock, History Back-Swipe Trapping & Scroll/Keyboard Isolation
  // Strictly runs on modal open and close ([document, onClose])
  useEffect(() => {
    if (!document) return;

    // Reset popstate closing ref on open
    isPopstateClosingRef.current = false;

    // 1. Push a history entry for the modal so back swipe closes the modal instead of navigating away
    const historyState = { modal: 'pdf-preview', timestamp: Date.now() };
    window.history.pushState(historyState, '', window.location.href);

    const handlePopState = () => {
      // User performed a back swipe gesture or clicked browser back button
      isPopstateClosingRef.current = true;
      onClose();
    };

    window.addEventListener('popstate', handlePopState);

    // 2. Dynamically lock mobile webpage viewport zoom while modal is active
    const viewportMeta = window.document.querySelector('meta[name="viewport"]');
    const originalViewportContent = viewportMeta ? viewportMeta.getAttribute('content') : null;

    if (viewportMeta) {
      viewportMeta.setAttribute(
        'content',
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      );
    }

    // 3. Multi-layer background scroll lock on both documentElement and body
    const originalBodyOverflow = window.document.body.style.overflow;
    const originalHtmlOverflow = window.document.documentElement.style.overflow;
    window.document.body.style.overflow = 'hidden';
    window.document.documentElement.style.overflow = 'hidden';

    // 4. Keyboard shortcuts (Escape, PageUp/PageDown, Left/Right arrows)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        setCurrentPage((prev) => {
          const next = Math.min(prev + 1, numPagesRef.current || 1);
          scrollToPageRef.current(next);
          return next;
        });
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setCurrentPage((prev) => {
          const prevPage = Math.max(prev - 1, 1);
          scrollToPageRef.current(prevPage);
          return prevPage;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
      window.document.body.style.overflow = originalBodyOverflow;
      window.document.documentElement.style.overflow = originalHtmlOverflow;

      // Restore original mobile viewport zoom behavior when modal closes
      if (viewportMeta) {
        if (originalViewportContent) {
          viewportMeta.setAttribute('content', originalViewportContent);
        } else {
          viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0');
        }
      }

      // If closed via UI (X button, backdrop tap, Escape) rather than back swipe,
      // pop the modal history entry to keep history clean and avoid orphan states
      if (!isPopstateClosingRef.current && window.history.state?.modal === 'pdf-preview') {
        window.history.back();
      }
    };
  }, [document, onClose]);

  const isExcel = document?.format === 'xlsx';
  const previewUrl = document
    ? (isExcel && document.companionPdfUrl ? document.companionPdfUrl : document.publicUrl)
    : '';

  // Load PDF Document & determine natural dimensions
  useEffect(() => {
    if (!document || !previewUrl) return;

    let isMounted = true;
    setLoading(true);
    setError(null);
    setCurrentPage(1);

    const loadingTask = pdfjsLib.getDocument(previewUrl);

    loadingTask.promise
      .then(async (loadedPdf) => {
        if (!isMounted) return;
        setPdfDoc(loadedPdf);
        setNumPages(loadedPdf.numPages);

        try {
          const page1 = await loadedPdf.getPage(1);
          const unscaledViewport = page1.getViewport({ scale: 1 });
          const naturalWidth = unscaledViewport.width;
          const naturalHeight = unscaledViewport.height;

          if (isMounted) {
            setBaseDimensions({ width: naturalWidth, height: naturalHeight });

            // Calculate comfortable initial fit scale for current viewport
            const containerWidth = containerRef.current?.clientWidth || window.innerWidth;
            const isMobile = window.innerWidth < 640;
            const padding = isMobile ? 24 : 48;
            const availableWidth = Math.max(containerWidth - padding, 240);
            const initialFit = Math.min(Math.max(availableWidth / naturalWidth, 0.65), 1.25);
            setScale(Math.round(initialFit * 10) / 10);
          }
        } catch (e) {
          console.error('Error fetching page 1 metadata:', e);
        }

        if (isMounted) {
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('PDF.js loading error:', err);
        setError('Failed to load document preview inline. Please open or download the document directly.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
      loadingTask.destroy();
    };
  }, [document, previewUrl]);

  // Fit to Width calculation
  const handleFitWidth = () => {
    if (!containerRef.current || !baseDimensions.width) return;
    const isMobile = window.innerWidth < 640;
    const padding = isMobile ? 24 : 48;
    const availableWidth = Math.max(containerRef.current.clientWidth - padding, 240);
    const newScale = Math.min(Math.max(availableWidth / baseDimensions.width, 0.5), 3.0);
    setScale(Math.round(newScale * 100) / 100);
  };

  // Continuous Scroll listener: tracks active page in viewport
  const handleScroll = useCallback(() => {
    if (!containerRef.current || numPages === 0) return;
    const container = containerRef.current;
    const targetOffset = container.scrollTop + 140;

    for (let i = 1; i <= numPages; i++) {
      const pageEl = pageRefs.current[i];
      if (pageEl) {
        const top = pageEl.offsetTop;
        const bottom = top + pageEl.offsetHeight;
        if (targetOffset >= top && targetOffset < bottom) {
          setCurrentPage(i);
          break;
        }
      }
    }
  }, [numPages]);

  // Touch handlers for native pinch-to-zoom
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStateRef.current = {
        initialDistance: dist,
        initialScale: scale,
        isPinching: true,
      };
    } else {
      touchStateRef.current.isPinching = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && touchStateRef.current.isPinching) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (touchStateRef.current.initialDistance > 10) {
        const ratio = dist / touchStateRef.current.initialDistance;
        const targetScale = Math.min(Math.max(touchStateRef.current.initialScale * ratio, 0.5), 3.0);
        setScale(Math.round(targetScale * 100) / 100);
      }
    }
  };

  const handleTouchEnd = () => {
    touchStateRef.current.isPinching = false;
  };

  if (!document) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-sm animate-fade-in overscroll-contain select-none"
      style={{ overscrollBehavior: 'contain', overscrollBehaviorX: 'contain' }}
      onClick={onClose}
      onTouchMove={(e) => {
        if (e.target === e.currentTarget) e.preventDefault();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#201c2c] rounded-lg shadow-2xl flex flex-col w-full max-w-5xl h-[92vh] max-h-[92vh] overflow-hidden border border-slate-300 dark:border-[#38314a] select-text"
        style={{ overscrollBehavior: 'contain', overscrollBehaviorX: 'contain' }}
      >
        {/* Modal Header */}
        <div className="bg-[#322e45] text-white px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3 shrink-0 border-b border-[#433b5c]">
          {/* Document Title & Metadata with robust flexbox truncation */}
          <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
            {isExcel ? (
              <FileSpreadsheet className="w-5 h-5 text-emerald-300 shrink-0" aria-hidden="true" />
            ) : (
              <FileText className="w-5 h-5 text-[#dcd4ec] shrink-0" aria-hidden="true" />
            )}
            <div className="min-w-0 flex-1 truncate">
              <h2
                id="pdf-modal-title"
                className="text-xs sm:text-sm font-semibold truncate leading-tight font-brand-serif"
                title={document.title}
              >
                {document.title}
              </h2>
              <div className="text-[10px] sm:text-[11px] text-[#dcd4ec] flex items-center gap-1.5 font-sans-clean truncate">
                <span className="truncate">{document.jurisdictionName}</span>
                <span>&bull;</span>
                <span className="shrink-0">{isExcel ? `Excel (${document.fileSizeHuman})` : document.fileSizeHuman}</span>
                {numPages > 0 && <span className="shrink-0">&bull; {numPages} page{numPages === 1 ? '' : 's'}</span>}
                {isExcel && document.companionPdfSize && (
                  <span className="shrink-0 hidden md:inline">&bull; PDF Rendition ({document.companionPdfSize})</span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons with guaranteed shrink-0 */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs bg-[#4c3f6b] hover:bg-[#5e4d84] text-white px-2 sm:px-2.5 py-1.5 rounded transition-colors focus-visible:ring-1 focus-visible:ring-white"
              title="Open preview in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">New Tab</span>
            </a>

            {isExcel && document.companionPdfUrl && (
              <a
                href={document.companionPdfUrl}
                download={document.filename.replace(/\.xlsx$/, '.pdf')}
                className="inline-flex items-center gap-1 text-[11px] sm:text-xs bg-[#4c3f6b] hover:bg-[#5e4d84] text-white px-2 sm:px-2.5 py-1.5 rounded transition-colors focus-visible:ring-1 focus-visible:ring-white"
                title="Download PDF Rendition"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">PDF</span>
              </a>
            )}

            <a
              href={document.publicUrl}
              download={document.filename}
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs bg-[#4c3f6b] hover:bg-[#5e4d84] text-white font-semibold px-2 sm:px-2.5 py-1.5 rounded transition-colors shadow-sm focus-visible:ring-1 focus-visible:ring-white"
              title={isExcel ? "Download native Excel workbook" : "Download file"}
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{isExcel ? "Excel" : "Download"}</span>
            </a>

            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-[#4c3f6b] text-[#dcd4ec] hover:text-white transition-colors ml-0.5"
              aria-label="Close Preview"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Excel Banner if applicable */}
        {isExcel && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800/60 px-3 sm:px-4 py-1.5 sm:py-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-emerald-900 dark:text-emerald-200 gap-1 shrink-0">
            <span className="flex items-center gap-1.5 font-medium">
              <span>📊</span>
              <span>
                <strong>Excel Workbook Preview Mode:</strong> Viewing high-fidelity PDF rendition.
              </span>
            </span>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-300">
              Download the native <strong>.xlsx</strong> file above for interactive formulas and sorting.
            </span>
          </div>
        )}

        {/* Controls Toolbar: Continuous Navigation & Zoom */}
        <div className="bg-slate-100 dark:bg-[#1a1726] border-b border-slate-200 dark:border-[#38314a] px-3 sm:px-4 py-1.5 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 shrink-0 select-none">
          {/* Page-by-Page Jump Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => scrollToPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage <= 1 || loading}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-[#2e283d] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Previous Page (Left Arrow or PageUp)"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[11px] sm:text-xs font-medium whitespace-nowrap font-mono">
              Page <span className="font-bold text-slate-900 dark:text-slate-100">{currentPage}</span> of{' '}
              <span className="font-bold text-slate-900 dark:text-slate-100">{numPages || '...'}</span>
            </span>
            <button
              onClick={() => scrollToPage(Math.min(currentPage + 1, numPages))}
              disabled={currentPage >= numPages || loading}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-[#2e283d] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Next Page (Right Arrow or PageDown)"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => setScale((s) => Math.max(Math.round((s - 0.2) * 10) / 10, 0.5))}
              disabled={scale <= 0.5 || loading}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-[#2e283d] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono w-11 text-center font-medium">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale((s) => Math.min(Math.round((s + 0.2) * 10) / 10, 3.0))}
              disabled={scale >= 3.0 || loading}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-[#2e283d] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Zoom In"
              aria-label="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleFitWidth}
              disabled={loading}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-[#2e283d] disabled:opacity-30 transition-colors ml-1"
              title="Fit to Width"
              aria-label="Fit to Width"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Continuous Multi-Page Viewer Viewport with Full 2D Panning */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex-1 bg-slate-200 dark:bg-[#12101a] overflow-x-auto overflow-y-auto p-3 sm:p-6 relative overscroll-contain"
          style={{ touchAction: 'pan-x pan-y' }}
        >
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/80 dark:bg-[#1a1726]/80 backdrop-blur-xs z-20">
              <Loader2 className="w-8 h-8 text-[#4c3f6b] dark:text-[#bcaee0] animate-spin mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Loading official document preview...
              </p>
            </div>
          )}

          {error ? (
            <div className="my-auto max-w-md mx-auto bg-white dark:bg-[#201c2c] p-6 rounded-lg shadow-md border border-slate-300 dark:border-[#38314a] text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {error}
              </p>
              <div className="flex items-center justify-center gap-2 pt-1">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs bg-[#4c3f6b] text-white px-3 py-1.5 rounded font-medium shadow-sm hover:bg-[#322e45]"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open in New Tab
                </a>
                <a
                  href={document.publicUrl}
                  download={document.filename}
                  className="inline-flex items-center gap-1.5 text-xs bg-slate-200 dark:bg-[#38314a] text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded font-medium hover:bg-slate-300"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download File
                </a>
              </div>
            </div>
          ) : (
            <div className="min-w-fit w-full flex flex-col items-center gap-4 sm:gap-6 py-2">
              {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
                <PdfPageItem
                  key={pageNum}
                  pageNumber={pageNum}
                  pdfDoc={pdfDoc!}
                  scale={scale}
                  baseWidth={baseDimensions.width}
                  baseHeight={baseDimensions.height}
                  containerRef={containerRef}
                  setPageRef={setPageRef}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
