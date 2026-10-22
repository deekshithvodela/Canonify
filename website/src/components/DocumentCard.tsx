import React from 'react';
import { Download, Eye } from 'lucide-react';
import { DocumentItem } from '../types';

interface DocumentCardProps {
  document: DocumentItem;
  onPreview: (doc: DocumentItem) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document, onPreview }) => {
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Allotment':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'MeritList':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'SeatMatrix':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Analysis':
        return 'bg-violet-100 text-violet-800 border-violet-300';
      case 'CounsellingNotice':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Info':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'InformationBulletin':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getFormatBadge = (format: string) => {
    switch (format) {
      case 'xlsx':
        return <span className="bg-green-700 text-white font-mono text-[10px] font-bold px-1.5 py-0.5 rounded">XLSX</span>;
      case 'csv':
        return <span className="bg-teal-700 text-white font-mono text-[10px] font-bold px-1.5 py-0.5 rounded">CSV</span>;
      case 'json':
        return <span className="bg-yellow-600 text-white font-mono text-[10px] font-bold px-1.5 py-0.5 rounded">JSON</span>;
      default:
        return <span className="bg-red-700 text-white font-mono text-[10px] font-bold px-1.5 py-0.5 rounded">PDF</span>;
    }
  };

  return (
    <div className="bg-white border border-[#dbe0ea] rounded hover:border-[#4c3f6b] transition-all p-3 sm:p-4 shadow-sm hover:shadow">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        {/* Left Info Section */}
        <div className="flex-1">
          {/* Badges line */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            {getFormatBadge(document.format)}

            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${getCategoryBadgeClass(document.documentCategory)}`}>
              {document.documentCategory}
            </span>

            {document.counsellingRound && document.counsellingRound !== 'NotApplicable' && (
              <span className="text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded">
                {document.counsellingRound.replace(/_/g, ' ')}
              </span>
            )}

            {document.quotaCategory && (
              <span className="text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded">
                {document.quotaCategory.replace(/Quota/g, ' Quota')}
              </span>
            )}

            {document.qualifier && (
              <span className="text-[10px] text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                {document.qualifier.replace(/_/g, ' ')}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-slate-900 leading-snug mb-1">
            {document.title}
          </h3>

          {/* Metadata Subtitle */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span>Size: <strong className="text-slate-700 font-medium">{document.fileSizeHuman}</strong></span>
            {document.pageCount && (
              <span>Pages: <strong className="text-slate-700 font-medium">{document.pageCount}</strong></span>
            )}
            {document.rowCount && (
              <span>Records: <strong className="text-slate-700 font-medium">{document.rowCount.toLocaleString()}</strong></span>
            )}
            <span className="font-mono text-[11px] text-slate-400 truncate max-w-[220px]" title={document.filename}>
              {document.filename}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0 mt-2 sm:mt-0">
          {document.previewable && (
            <button
              onClick={() => onPreview(document)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#322e45] dark:text-[#d3c8e8] bg-[#f0ecf6] dark:bg-[#2b253c] hover:bg-[#e4ddf0] dark:hover:bg-[#38304e] border border-[#d5cee2] dark:border-[#42395d] px-3 py-1.5 rounded transition-colors focus-visible:ring-2 focus-visible:ring-[#4c3f6b]"
              title="Preview document in browser"
              aria-label={`Preview ${document.title}`}
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
          )}

          <a
            href={document.publicUrl}
            download={document.filename}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#4c3f6b] hover:bg-[#322e45] dark:bg-[#5e4d84] dark:hover:bg-[#4c3f6b] px-3.5 py-1.5 rounded shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-[#4c3f6b]"
            title={`Download ${document.filename}`}
            aria-label={`Download ${document.filename}`}
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </a>
        </div>
      </div>
    </div>
  );
};
