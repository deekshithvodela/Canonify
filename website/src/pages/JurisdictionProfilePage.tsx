import React, { useState, useMemo } from 'react';
import { ExternalLink, Filter, AlertCircle, Info } from 'lucide-react';
import { CatalogData, DocumentItem, DocumentCategory } from '../types';
import { DocumentCard } from '../components/DocumentCard';
import { compareDocuments } from '../utils/sorting';

interface JurisdictionProfilePageProps {
  slug: string;
  catalog: CatalogData;
  navigate: (route: string) => void;
  onPreview: (doc: DocumentItem) => void;
}

const CATEGORY_KEYS: DocumentCategory[] = [
  'Allotment',
  'MeritList',
  'SeatMatrix',
  'Analysis',
  'CounsellingNotice',
  'Info',
  'InformationBulletin',
  'Other'
];

const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  Allotment: 'Seat Allotments',
  MeritList: 'Merit Lists',
  SeatMatrix: 'Seat Matrices',
  Analysis: 'Cutoffs & Analysis',
  CounsellingNotice: 'Notices & Rules',
  Info: 'Colleges & Info',
  InformationBulletin: 'Bulletins',
  Other: 'Directory / Other'
};

export const JurisdictionProfilePage: React.FC<JurisdictionProfilePageProps> = ({
  slug,
  catalog,
  navigate,
  onPreview
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedRound, setSelectedRound] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState('');

  // Find jurisdiction
  const jurisdiction = catalog.jurisdictions.find(j => j.slug === slug);

  // Find all documents for this jurisdiction
  const jurisdictionDocs = useMemo(() => {
    return catalog.documents.filter(d => d.jurisdictionSlug === slug);
  }, [catalog.documents, slug]);

  // Distinct rounds available in this jurisdiction (ordered chronologically)
  const availableRounds = useMemo(() => {
    const roundOrder: Record<string, number> = {
      Round1: 1,
      Round2: 2,
      Round3: 3,
      Round4: 4,
      Round1_Round2: 5,
      MopUp: 6,
      StrayVacancy: 7,
      SpecialStray: 8,
      SpotCounselling: 9,
      NotApplicable: 10
    };
    const rounds = new Set<string>();
    jurisdictionDocs.forEach(d => {
      if (d.counsellingRound && d.counsellingRound !== 'NotApplicable') {
        rounds.add(d.counsellingRound);
      }
    });
    return Array.from(rounds).sort((a, b) => (roundOrder[a] || 99) - (roundOrder[b] || 99));
  }, [jurisdictionDocs]);

  // Filtered documents - sorted by canonical hierarchy (Allotments first, Merit Lists second, Seat Matrices last)
  const filteredDocs = useMemo(() => {
    const list = jurisdictionDocs.filter(d => {
      const matchCat = selectedCategory === 'ALL' ? true : d.documentCategory === selectedCategory;
      const matchRound = selectedRound === 'ALL' ? true : d.counsellingRound === selectedRound;
      const matchText = searchFilter.trim() === '' ? true :
        d.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        d.filename.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (d.quotaCategory && d.quotaCategory.toLowerCase().includes(searchFilter.toLowerCase())) ||
        (d.qualifier && d.qualifier.toLowerCase().includes(searchFilter.toLowerCase()));
      return matchCat && matchRound && matchText;
    });
    return list.slice().sort(compareDocuments);
  }, [jurisdictionDocs, selectedCategory, selectedRound, searchFilter]);

  if (!jurisdiction) {
    return (
      <div className="bg-white dark:bg-[#201c2c] border border-[#dbe0ea] dark:border-[#38314a] rounded p-8 text-center">
        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">Jurisdiction Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">No matching records found for "{slug}".</p>
        <button
          onClick={() => navigate('jurisdictions')}
          className="text-xs bg-[#4c3f6b] hover:bg-[#5e4d84] text-white px-4 py-1.5 rounded font-medium"
        >
          Return to Jurisdictions Directory
        </button>
      </div>
    );
  }

  // Category counts typed across all DocumentCategory values
  const categoryCounts: Record<DocumentCategory, number> = {
    Allotment: jurisdictionDocs.filter(d => d.documentCategory === 'Allotment').length,
    MeritList: jurisdictionDocs.filter(d => d.documentCategory === 'MeritList').length,
    SeatMatrix: jurisdictionDocs.filter(d => d.documentCategory === 'SeatMatrix').length,
    Analysis: jurisdictionDocs.filter(d => d.documentCategory === 'Analysis').length,
    CounsellingNotice: jurisdictionDocs.filter(d => d.documentCategory === 'CounsellingNotice').length,
    Info: jurisdictionDocs.filter(d => d.documentCategory === 'Info').length,
    InformationBulletin: jurisdictionDocs.filter(d => d.documentCategory === 'InformationBulletin').length,
    Other: jurisdictionDocs.filter(d => d.documentCategory === 'Other').length
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <button onClick={() => navigate('')} className="hover:text-[#4c3f6b] dark:hover:text-[#a99ac7] hover:underline">
          Home
        </button>
        <span>&rsaquo;</span>
        <button onClick={() => navigate('jurisdictions')} className="hover:text-[#4c3f6b] dark:hover:text-[#a99ac7] hover:underline">
          Jurisdictions
        </button>
        <span>&rsaquo;</span>
        <span className="font-semibold text-slate-800 dark:text-slate-200">{jurisdiction.name}</span>
      </div>

      {/* Main MAL-Style Profile Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
        {/* Left Sidebar (MAL Profile Column) - Displays first on mobile (State Info) and left column on desktop */}
        <div className="order-1 md:order-1 md:col-span-1 space-y-3">
          {/* Main Info Box */}
          <div className="bg-white dark:bg-[#201c2c] border border-[#dbe0ea] dark:border-[#38314a] rounded overflow-hidden shadow-sm">
            <div className="bg-[#322e45] text-white p-3.5 text-center border-b-2 border-[#4c3f6b]">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#4c3f6b] rounded">
                {jurisdiction.type}
              </span>
              <h1 className="text-base font-bold mt-1.5 leading-snug font-brand-serif">
                {jurisdiction.name}
              </h1>
            </div>

            <div className="p-3.5 space-y-3 text-xs">
              {jurisdiction.authorities && jurisdiction.authorities.length > 0 ? (
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1.5">
                    {jurisdiction.authorities.length > 1 ? 'Admissions Authorities' : 'Admissions Authority'}
                  </span>
                  <div className="space-y-2">
                    {jurisdiction.authorities.map((auth, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded border border-slate-200/80 dark:border-slate-700/80 space-y-1"
                      >
                        <div className="font-semibold text-slate-900 dark:text-slate-100 leading-snug text-xs">
                          {auth.name}
                        </div>
                        {auth.role && (
                          <div className="text-[10px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/70 dark:border-amber-800/70 px-1.5 py-0.5 rounded font-medium inline-block">
                            {auth.role}
                          </div>
                        )}
                        <div className="pt-0.5">
                          <a
                            href={auth.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#4c3f6b] dark:text-[#a99ac7] hover:underline font-semibold text-[11px]"
                          >
                            <span>Official Portal</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" aria-hidden="true" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">Admissions Authority</span>
                    <p className="font-medium text-slate-800 dark:text-slate-200 leading-snug">
                      {jurisdiction.authorityName}
                    </p>
                  </div>

                  {jurisdiction.officialWebsiteUrl && (
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Official Portal</span>
                      <a
                        href={jurisdiction.officialWebsiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#4c3f6b] dark:text-[#a99ac7] hover:underline font-semibold break-all text-[11px]"
                      >
                        <span>Visit Authority Website</span>
                        <ExternalLink className="w-3 h-3 shrink-0" aria-hidden="true" />
                      </a>
                    </div>
                  )}
                </>
              )}

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 block mb-1">Archive Summary</span>
                <div className="space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                  <div className="flex justify-between">
                    <span>Academic Year:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{catalog.academicYear}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Documents:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{jurisdiction.documentCount}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Size:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{(jurisdiction.totalSizeBytes / (1024 * 1024)).toFixed(2)} MB</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Category Filter (MAL Sidebar Navigation) - Hidden on mobile, visible on desktop */}
          <div className="hidden md:block bg-white dark:bg-[#201c2c] border border-[#dbe0ea] dark:border-[#38314a] rounded overflow-hidden shadow-sm">
            <div className="bg-slate-100 dark:bg-[#272336] border-b border-[#dbe0ea] dark:border-[#38314a] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              Filter By Category
            </div>
            <div className="p-1 space-y-0.5 text-xs">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`w-full text-left px-2.5 py-1.5 rounded flex justify-between items-center transition-colors ${
                  selectedCategory === 'ALL' ? 'bg-[#4c3f6b] text-white font-medium' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>All Documents</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded ${selectedCategory === 'ALL' ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {jurisdictionDocs.length}
                </span>
              </button>

              {CATEGORY_KEYS.map(cat => {
                const count = categoryCounts[cat];
                if (count === 0 && selectedCategory !== cat) return null;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-2.5 py-1.5 rounded flex justify-between items-center transition-colors ${
                      selectedCategory === cat ? 'bg-[#4c3f6b] text-white font-medium' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{CATEGORY_LABELS[cat]}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded ${selectedCategory === cat ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Main Content Area (Documents & Files) - Displays second on mobile, right column on desktop */}
        <div className="order-2 md:order-2 md:col-span-3 space-y-3">
          {/* Controls Bar: Search, Category Filter (Mobile), & Round Filter */}
          <div className="bg-white dark:bg-[#201c2c] border border-[#dbe0ea] dark:border-[#38314a] rounded p-3 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <label htmlFor="jurisdiction-doc-search" className="sr-only">
                Search documents in {jurisdiction.name}
              </label>
              <input
                id="jurisdiction-doc-search"
                type="text"
                placeholder={`Search within ${jurisdiction.name} documents...`}
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#161320] border border-[#e2dde8] dark:border-[#38314a] rounded text-xs pl-8 pr-3 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#4c3f6b] focus:bg-white dark:focus:bg-[#161320]"
              />
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" aria-hidden="true" />
              {searchFilter && (
                <button
                  onClick={() => setSearchFilter('')}
                  className="absolute right-2.5 top-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label="Clear filter"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Mobile Category Dropdown (sm:hidden) */}
            <div className="flex items-center gap-2 sm:hidden text-xs text-slate-600 dark:text-slate-400">
              <div className="flex-1 flex items-center gap-1.5">
                <label htmlFor="mobile-category-select" className="text-[11px] font-medium text-slate-500 dark:text-slate-400 shrink-0">Category:</label>
                <select
                  id="mobile-category-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#161320] border border-[#e2dde8] dark:border-[#38314a] rounded text-xs px-2 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#4c3f6b]"
                >
                  <option value="ALL">All Categories ({jurisdictionDocs.length})</option>
                  {CATEGORY_KEYS.map(cat => (
                    <option key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]} ({categoryCounts[cat] || 0})
                    </option>
                  ))}
                </select>
              </div>

              {availableRounds.length > 0 && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <label htmlFor="mobile-round-select" className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Round:</label>
                  <select
                    id="mobile-round-select"
                    value={selectedRound}
                    onChange={(e) => setSelectedRound(e.target.value)}
                    className="bg-slate-50 dark:bg-[#161320] border border-[#e2dde8] dark:border-[#38314a] rounded text-xs px-2 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#4c3f6b]"
                  >
                    <option value="ALL">All ({jurisdictionDocs.length})</option>
                    {availableRounds.map(r => (
                      <option key={r} value={r}>
                        {r.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Desktop Round Filter Dropdown (hidden sm:flex) */}
            {availableRounds.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 shrink-0 text-xs text-slate-600 dark:text-slate-400">
                <label htmlFor="round-select" className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Round:</label>
                <select
                  id="round-select"
                  value={selectedRound}
                  onChange={(e) => setSelectedRound(e.target.value)}
                  className="bg-slate-50 dark:bg-[#161320] border border-[#e2dde8] dark:border-[#38314a] rounded text-xs px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#4c3f6b]"
                >
                  <option value="ALL">All Rounds ({jurisdictionDocs.length})</option>
                  {availableRounds.map(r => (
                    <option key={r} value={r}>
                      {r.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Active Filters Bar if any */}
          {(selectedCategory !== 'ALL' || selectedRound !== 'ALL' || searchFilter) && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs bg-[#f0ecf6] dark:bg-[#2b253c] border border-[#e2dde8] dark:border-[#38314a] text-[#322e45] dark:text-[#dcd4ec] px-3 py-1.5 rounded">
              <span className="font-medium text-[11px]">Active Filters:</span>
              {selectedCategory !== 'ALL' && (
                <span className="bg-white dark:bg-[#201c2c] border border-[#e2dde8] dark:border-[#38314a] px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                  Category: {selectedCategory}
                  <button onClick={() => setSelectedCategory('ALL')} className="hover:text-red-500 font-bold" aria-label="Remove category filter">&times;</button>
                </span>
              )}
              {selectedRound !== 'ALL' && (
                <span className="bg-white dark:bg-[#201c2c] border border-[#e2dde8] dark:border-[#38314a] px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                  Round: {selectedRound}
                  <button onClick={() => setSelectedRound('ALL')} className="hover:text-red-500 font-bold" aria-label="Remove round filter">&times;</button>
                </span>
              )}
              {searchFilter && (
                <span className="bg-white dark:bg-[#201c2c] border border-[#e2dde8] dark:border-[#38314a] px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                  Query: "{searchFilter}"
                  <button onClick={() => setSearchFilter('')} className="hover:text-red-500 font-bold" aria-label="Remove search query filter">&times;</button>
                </span>
              )}
              <button
                onClick={() => { setSelectedCategory('ALL'); setSelectedRound('ALL'); setSearchFilter(''); }}
                className="text-[11px] text-[#4c3f6b] dark:text-[#a99ac7] hover:underline font-semibold ml-auto"
              >
                Reset All
              </button>
            </div>
          )}

          {/* Special Empty Case for Lakshadweep */}
          {jurisdiction.documentCount === 0 && (
            <div className="bg-white dark:bg-[#201c2c] border border-[#e2dde8] dark:border-[#38314a] rounded p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-[#4c3f6b] dark:text-[#a99ac7] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1 font-brand-serif">
                    No Medical Colleges Located in Lakshadweep
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    The Union Territory of Lakshadweep does not have any medical or dental colleges situated on its islands. Candidates hailing from Lakshadweep are allotted MBBS/BDS seats under the Central Pool quota allocated to Union Territories without medical colleges and through the All India Quota (MCC) counselling.
                  </p>
                  <button
                    onClick={() => navigate('jurisdiction/all-india')}
                    className="inline-flex items-center gap-1 text-xs text-[#4c3f6b] dark:text-[#a99ac7] hover:underline font-semibold"
                  >
                    View All India Quota (MCC) Documents &rarr;
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Document Cards List */}
          {filteredDocs.length > 0 && (
            <div className="space-y-2.5">
              {filteredDocs.map(doc => (
                <DocumentCard key={doc.id} document={doc} onPreview={onPreview} />
              ))}
            </div>
          )}

          {/* Empty Filter Results */}
          {jurisdiction.documentCount > 0 && filteredDocs.length === 0 && (
            <div className="bg-white dark:bg-[#201c2c] border border-[#dbe0ea] dark:border-[#38314a] rounded p-8 text-center text-slate-500 dark:text-slate-400 text-xs shadow-sm">
              <p className="mb-2">No documents match the active filter criteria.</p>
              <button
                onClick={() => { setSelectedCategory('ALL'); setSelectedRound('ALL'); setSearchFilter(''); }}
                className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium px-3 py-1.5 rounded transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
