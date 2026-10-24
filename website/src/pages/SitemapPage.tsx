import React, { useState, useMemo } from 'react';
import { ListTree, Search, Eye, Download, ExternalLink, Globe, MapPin, Building2 } from 'lucide-react';
import { CatalogData, DocumentItem, DocumentCategory } from '../types';

interface SitemapPageProps {
  catalog: CatalogData;
  navigate: (route: string) => void;
  onPreview: (doc: DocumentItem) => void;
}

export const SitemapPage: React.FC<SitemapPageProps> = ({ catalog, navigate, onPreview }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'All' | 'All India' | 'State' | 'Union Territory'>('All');

  const getCategoryBadgeClass = (category: DocumentCategory) => {
    switch (category) {
      case 'Allotment':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'MeritList':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'SeatMatrix':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'Analysis':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      case 'CounsellingNotice':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800';
      case 'Info':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 border-sky-300 dark:border-sky-800';
      case 'InformationBulletin':
        return 'bg-violet-100 text-violet-800 dark:bg-violet-950/70 dark:text-violet-300 border-violet-300 dark:border-violet-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  // Grouped jurisdictions
  const groupedData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return catalog.jurisdictions
      .filter(j => selectedType === 'All' ? true : j.type === selectedType)
      .map(j => {
        const docs = catalog.documents.filter(d => d.jurisdictionSlug === j.slug);
        const filteredDocs = q === '' ? docs : docs.filter(d =>
          d.title.toLowerCase().includes(q) ||
          d.filename.toLowerCase().includes(q) ||
          d.documentCategory.toLowerCase().includes(q) ||
          (d.quotaCategory && d.quotaCategory.toLowerCase().includes(q)) ||
          (d.qualifier && d.qualifier.toLowerCase().includes(q))
        );

        const matchesJurisdiction = q === '' ? true :
          j.name.toLowerCase().includes(q) ||
          j.authorityName.toLowerCase().includes(q) ||
          filteredDocs.length > 0;

        return {
          jurisdiction: j,
          docs: filteredDocs,
          totalDocsCount: docs.length,
          matches: matchesJurisdiction
        };
      })
      .filter(item => item.matches);
  }, [catalog, searchQuery, selectedType]);

  const allIndiaGroup = groupedData.filter(g => g.jurisdiction.type === 'All India');
  const statesGroup = groupedData.filter(g => g.jurisdiction.type === 'State');
  const utsGroup = groupedData.filter(g => g.jurisdiction.type === 'Union Territory');

  const renderJurisdictionSection = (item: typeof groupedData[0]) => {
    const { jurisdiction: j, docs } = item;

    return (
      <div key={j.slug} id={`sitemap-${j.slug}`} className="bg-white dark:bg-[#201c2c] border border-[#dbe0ea] dark:border-[#38314a] rounded shadow-sm overflow-hidden mb-4">
        {/* Jurisdiction Header Bar */}
        <div className="bg-[#f0ecf6] dark:bg-[#201c2c] border-b border-slate-200 dark:border-[#38314a] px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
              j.type === 'All India' ? 'bg-[#322e45] text-white' :
              j.type === 'Union Territory' ? 'bg-[#4c3f6b] text-white' :
              'bg-[#5e4d84] text-white'
            }`}>
              {j.type}
            </span>
            <button
              onClick={() => navigate(`jurisdiction/${j.slug}`)}
              className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-[#4c3f6b] dark:hover:text-[#bcaee0] transition-colors flex items-center gap-1.5 focus-visible:ring-1 focus-visible:ring-[#4c3f6b]"
            >
              <span>{j.name}</span>
            </button>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ({docs.length} file{docs.length === 1 ? '' : 's'})
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {j.officialWebsiteUrl && (
              <a
                href={j.officialWebsiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 dark:text-slate-400 hover:text-[#4c3f6b] dark:hover:text-[#bcaee0] flex items-center gap-1 text-[11px]"
                title={j.authorityName}
              >
                <Globe className="w-3 h-3 shrink-0" aria-hidden="true" />
                <span className="truncate max-w-[200px]">{j.authorityName}</span>
                <ExternalLink className="w-2.5 h-2.5 shrink-0" aria-hidden="true" />
              </a>
            )}
            <button
              onClick={() => navigate(`jurisdiction/${j.slug}`)}
              className="text-[#4c3f6b] dark:text-[#bcaee0] font-semibold hover:underline text-[11px]"
            >
              Open Profile &rarr;
            </button>
          </div>
        </div>

        {/* Documents Table */}
        {docs.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400 italic">
            {j.documentCount === 0
              ? 'No official documents collected for this jurisdiction yet. See profile page for official authority links.'
              : 'No documents match the current search filter.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <caption className="sr-only">
                {`List of NEET UG counselling documents for ${j.name}`}
              </caption>
              <thead>
                <tr className="bg-slate-50/70 dark:bg-[#1a1726] text-slate-600 dark:text-slate-400 text-[11px] border-b border-slate-200 dark:border-[#38314a]">
                  <th scope="col" className="py-2 px-3 font-semibold w-24">Category</th>
                  <th scope="col" className="py-2 px-3 font-semibold w-24">Round</th>
                  <th scope="col" className="py-2 px-3 font-semibold">Document Title &amp; Filename</th>
                  <th scope="col" className="py-2 px-3 font-semibold w-20 text-center">Format</th>
                  <th scope="col" className="py-2 px-3 font-semibold w-24 text-right">Size</th>
                  <th scope="col" className="py-2 px-3 font-semibold w-36 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#2e283d]">
                {docs.map(doc => (
                  <tr key={doc.id} className="hover:bg-[#f0ecf6]/30 dark:hover:bg-[#2e283d]/50 transition-colors">
                    {/* Category */}
                    <td className="py-2 px-3 align-top">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border inline-block ${getCategoryBadgeClass(doc.documentCategory)}`}>
                        {doc.documentCategory}
                      </span>
                    </td>

                    {/* Round */}
                    <td className="py-2 px-3 align-top">
                      <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                        {doc.counsellingRound === 'NotApplicable' ? '—' : doc.counsellingRound.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* Title & Filename */}
                    <td className="py-2 px-3 align-top">
                      <div className="font-medium text-slate-900 dark:text-slate-100 leading-snug">
                        {doc.title}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400 truncate max-w-lg mt-0.5" title={doc.filename}>
                        {doc.filename}
                      </div>
                    </td>

                    {/* Format */}
                    <td className="py-2 px-3 text-center align-top">
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                        doc.format === 'xlsx' ? 'bg-green-700 text-white' :
                        doc.format === 'csv' ? 'bg-teal-700 text-white' :
                        doc.format === 'json' ? 'bg-yellow-600 text-white' :
                        'bg-red-700 text-white'
                      }`}>
                        {doc.format}
                      </span>
                    </td>

                    {/* Size */}
                    <td className="py-2 px-3 text-right text-slate-600 dark:text-slate-400 font-medium align-top whitespace-nowrap">
                      {doc.fileSizeHuman}
                    </td>

                    {/* Actions */}
                    <td className="py-2 px-3 text-center align-top whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {doc.previewable && (
                          <button
                            onClick={() => onPreview(doc)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#322e45] dark:text-[#d3c8e8] bg-[#f0ecf6] dark:bg-[#2b253c] hover:bg-[#e4ddf0] border border-[#d5cee2] dark:border-[#42395d] px-2 py-0.5 rounded transition-colors focus-visible:ring-1 focus-visible:ring-[#4c3f6b]"
                            title="Preview document in browser"
                            aria-label={`Preview ${doc.title}`}
                          >
                            <Eye className="w-3 h-3" aria-hidden="true" />
                            Preview
                          </button>
                        )}
                        <a
                          href={doc.publicUrl}
                          download={doc.filename}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-[#4c3f6b] hover:bg-[#322e45] dark:bg-[#5e4d84] dark:hover:bg-[#4c3f6b] px-2.5 py-0.5 rounded shadow-sm transition-colors focus-visible:ring-1 focus-visible:ring-white"
                          title={`Download ${doc.filename}`}
                          aria-label={`Download ${doc.filename}`}
                        >
                          <Download className="w-3 h-3" aria-hidden="true" />
                          Download
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="bg-white dark:bg-[#201c2c] border border-[#dbe0ea] dark:border-[#38314a] rounded p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 font-brand-serif">
              <ListTree className="w-5 h-5 text-[#4c3f6b] dark:text-[#bcaee0]" aria-hidden="true" />
              Repository Sitemap &amp; Document Index
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Hierarchical directory of all {catalog.metadata.totalDocuments} official NEET UG counselling files grouped by jurisdiction.
            </p>
          </div>

          {/* Type Filter Buttons */}
          <div role="tablist" aria-label="Sitemap Jurisdiction Types" className="flex items-center space-x-1 text-xs self-start sm:self-center">
            {(['All', 'All India', 'State', 'Union Territory'] as const).map(type => (
              <button
                key={type}
                role="tab"
                aria-selected={selectedType === type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#4c3f6b] ${
                  selectedType === type
                    ? 'bg-[#4c3f6b] text-white font-bold shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-[#201c2c] dark:text-slate-300'
                }`}
              >
                {type === 'All' ? 'All (36)' : type === 'All India' ? 'All India (1)' : type === 'State' ? 'States (28)' : 'UTs (8)'}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <label htmlFor="sitemap-search" className="sr-only">
            Search document title, filename, category, or state in sitemap
          </label>
          <input
            id="sitemap-search"
            name="sitemap-search"
            type="text"
            placeholder="Search document title, filename, category, or state in sitemap..."
            value={searchQuery}
            autoComplete="off"
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#1a1726] border border-slate-200 dark:border-[#38314a] rounded text-xs pl-9 pr-4 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#4c3f6b] focus:bg-white dark:focus:bg-[#161320]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" aria-hidden="true" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Clear sitemap search query"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {groupedData.length} jurisdictions matching current filter
      </div>

      {/* Quick Jump Bar */}
      <nav aria-label="Sitemap Quick Navigation" className="bg-[#f0ecf6]/60 dark:bg-[#201c2c] border border-slate-200 dark:border-[#38314a] rounded px-3 py-2 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
        <span className="font-semibold text-slate-800 dark:text-slate-200">Quick Links:</span>
        {allIndiaGroup.length > 0 && (
          <a
            href={`#/jurisdiction/${allIndiaGroup[0].jurisdiction.slug}`}
            onClick={(e) => {
              e.preventDefault();
              navigate(`jurisdiction/${allIndiaGroup[0].jurisdiction.slug}`);
            }}
            className="hover:text-[#4c3f6b] dark:hover:text-[#bcaee0] underline font-medium"
            title="Open All India profile page"
          >
            All India ({allIndiaGroup[0].docs.length})
          </a>
        )}
        <span>&bull;</span>
        <span className="font-medium">States:</span>
        <div className="flex flex-wrap gap-1.5">
          {statesGroup.map(s => (
            <a
              key={s.jurisdiction.slug}
              href={`#/jurisdiction/${s.jurisdiction.slug}`}
              onClick={(e) => {
                e.preventDefault();
                navigate(`jurisdiction/${s.jurisdiction.slug}`);
              }}
              className="hover:text-[#4c3f6b] dark:hover:text-[#bcaee0] text-[11px] underline"
              title={`Open ${s.jurisdiction.name} profile page`}
            >
              {s.jurisdiction.name}
            </a>
          ))}
        </div>
        <span>&bull;</span>
        <span className="font-medium">UTs:</span>
        <div className="flex flex-wrap gap-1.5">
          {utsGroup.map(u => (
            <a
              key={u.jurisdiction.slug}
              href={`#/jurisdiction/${u.jurisdiction.slug}`}
              onClick={(e) => {
                e.preventDefault();
                navigate(`jurisdiction/${u.jurisdiction.slug}`);
              }}
              className="hover:text-[#4c3f6b] dark:hover:text-[#bcaee0] text-[11px] underline"
              title={`Open ${u.jurisdiction.name} profile page`}
            >
              {u.jurisdiction.name}
            </a>
          ))}
        </div>
      </nav>

      {/* Hierarchical Document Groups */}
      {allIndiaGroup.length > 0 && (
        <section aria-label="All India Quota Documents">
          <h2 className="flex items-center gap-2 mb-3 text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-brand-serif">
            <Globe className="w-4 h-4 text-[#4c3f6b] dark:text-[#bcaee0]" aria-hidden="true" />
            All India Quota (MCC)
          </h2>
          {allIndiaGroup.map(renderJurisdictionSection)}
        </section>
      )}

      {statesGroup.length > 0 && (
        <section aria-label="State Counselling Authority Documents" className="pt-2">
          <h2 className="flex items-center gap-2 mb-3 text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-brand-serif">
            <Building2 className="w-4 h-4 text-[#4c3f6b] dark:text-[#bcaee0]" aria-hidden="true" />
            State Admissions Authorities (28 States)
          </h2>
          {statesGroup.map(renderJurisdictionSection)}
        </section>
      )}

      {utsGroup.length > 0 && (
        <section aria-label="Union Territory Counselling Authority Documents" className="pt-2">
          <h2 className="flex items-center gap-2 mb-3 text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-brand-serif">
            <MapPin className="w-4 h-4 text-[#4c3f6b] dark:text-[#bcaee0]" aria-hidden="true" />
            Union Territories (8 UTs)
          </h2>
          {utsGroup.map(renderJurisdictionSection)}
        </section>
      )}

      {groupedData.length === 0 && (
        <div className="bg-white dark:bg-[#201c2c] border border-[#dbe0ea] dark:border-[#38314a] rounded p-8 text-center text-xs text-slate-500 dark:text-slate-400">
          No jurisdictions or documents match your search query "{searchQuery}".
        </div>
      )}
    </div>
  );
};
