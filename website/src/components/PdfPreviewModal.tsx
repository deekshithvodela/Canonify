import React, { useEffect } from 'react';
import { X, Download, ExternalLink, FileText, FileSpreadsheet } from 'lucide-react';
import { DocumentItem } from '../types';

interface PdfPreviewModalProps {
  document: DocumentItem | null;
  onClose: () => void;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({ document, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    if (document) {
      window.document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.document.body.style.overflow = '';
    };
  }, [document, onClose]);

  if (!document) return null;

  const isExcel = document.format === 'xlsx';
  const previewUrl = isExcel && document.companionPdfUrl ? document.companionPdfUrl : document.publicUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#201c2c] rounded-lg shadow-2xl flex flex-col w-full max-w-5xl h-[90vh] overflow-hidden border border-slate-300 dark:border-[#38314a]">
        {/* Modal Header */}
        <div className="bg-[#322e45] text-white px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {isExcel ? (
              <FileSpreadsheet className="w-5 h-5 text-emerald-300 shrink-0" aria-hidden="true" />
            ) : (
              <FileText className="w-5 h-5 text-[#dcd4ec] shrink-0" aria-hidden="true" />
            )}
            <div className="truncate">
              <h2 className="text-sm font-semibold truncate leading-tight font-brand-serif">
                {document.title}
              </h2>
              <div className="text-[11px] text-[#dcd4ec] flex items-center gap-2 font-sans-clean">
                <span>{document.jurisdictionName}</span>
                <span>&bull;</span>
                <span>{isExcel ? `Excel Workbook (${document.fileSizeHuman})` : document.fileSizeHuman}</span>
                {document.pageCount && <span>&bull; {document.pageCount} pages</span>}
                {isExcel && document.companionPdfSize && (
                  <span>&bull; PDF Rendition ({document.companionPdfSize})</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs bg-[#4c3f6b] hover:bg-[#5e4d84] text-white px-2.5 py-1.5 rounded transition-colors"
              title="Open preview in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">New Tab</span>
            </a>

            {isExcel && document.companionPdfUrl && (
              <a
                href={document.companionPdfUrl}
                download={document.filename.replace(/\.xlsx$/, '.pdf')}
                className="inline-flex items-center gap-1 text-xs bg-[#4c3f6b] hover:bg-[#5e4d84] text-white px-2.5 py-1.5 rounded transition-colors"
                title="Download PDF Rendition"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">PDF</span>
              </a>
            )}

            <a
              href={document.publicUrl}
              download={document.filename}
              className="inline-flex items-center gap-1 text-xs bg-[#4c3f6b] hover:bg-[#5e4d84] text-white font-semibold px-2.5 py-1.5 rounded transition-colors shadow-sm"
              title={isExcel ? "Download native Excel workbook" : "Download file"}
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{isExcel ? "Excel (.xlsx)" : "Download"}</span>
            </a>

            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-[#4c3f6b] text-[#dcd4ec] hover:text-white transition-colors ml-1"
              aria-label="Close Preview"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Excel Banner if applicable */}
        {isExcel && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800/60 px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-emerald-900 dark:text-emerald-200 gap-1 shrink-0">
            <span className="flex items-center gap-1.5 font-medium">
              <span>📊</span>
              <span>
                <strong>Excel Workbook Preview Mode:</strong> Viewing high-fidelity PDF rendition (3 sheets &bull; 14,653 rows).
              </span>
            </span>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-300">
              Download the native <strong>.xlsx</strong> file above for interactive formulas and sorting.
            </span>
          </div>
        )}

        {/* Modal Iframe Content */}
        <div className="flex-1 bg-slate-100 dark:bg-[#161320] relative">
          <iframe
            src={previewUrl}
            title={document.title}
            className="w-full h-full border-none"
          />
        </div>
      </div>
    </div>
  );
};
