import React, { useState } from 'react';
import { Globe, MapPin, Landmark, ArrowRight, CheckCircle2, Search, FileCheck, ListTree } from 'lucide-react';
import { CatalogData, DocumentItem } from '../types';
import { DocumentCard } from '../components/DocumentCard';

interface HomePageProps {
  catalog: CatalogData;
  navigate: (route: string) => void;
  onPreview: (doc: DocumentItem) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ catalog, navigate, onPreview }) => {
  const [filterType, setFilterType] = useState<'All' | 'State' | 'Union Territory'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter jurisdictions for quick grid
  const filteredJurisdictions = catalog.jurisdictions.filter(j => {
    const matchesType = filterType === 'All' ? true : j.type === filterType;
    const matchesSearch = searchQuery.trim() === '' ? true :
      j.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.authorityName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Spotlight AIQ documents
  const aiqDocs = catalog.documents.filter(d => d.canonicalJurisdiction === 'AllIndia');

  // Spotlight sample allotment documents
  const spotlightAllotments = catalog.documents
    .filter(d => d.documentCategory === 'Allotment' && d.counsellingRound === 'Round1')
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Hero Banner (Medical Scholar Plum & Amethyst Palette) */}
      <section aria-labelledby="hero-title" className="bg-gradient-to-r from-[#322e45] via-[#3c3453] to-[#4c3f6b] text-white rounded-lg p-5 sm:p-7 shadow-md border-b-2 border-[#8e7bb5]">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 text-xs bg-[#f0ecf6] text-[#322e45] font-bold px-2.5 py-0.5 rounded-full mb-3 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#4c3f6b]" aria-hidden="true" /> Official Document Archive • NEET UG {catalog.academicYear}
          </div>
          <h1 id="hero-title" className="text-xl sm:text-2xl font-bold tracking-tight mb-2 font-brand-serif">
            Canonify — NEET UG Counselling Document Archive
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-5">
            An archival and discovery index of official seat allotment results, state merit lists, vacancy seat matrices, and counselling schedules collected directly from the Medical Counselling Committee (MCC) and state/UT admissions authorities across India.
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => navigate('jurisdiction/all-india')}
              className="inline-flex items-center gap-1.5 bg-[#f0ecf6] hover:bg-white text-[#322e45] font-semibold text-xs px-4 py-2 rounded shadow transition-all focus-visible:ring-2 focus-visible:ring-white"
            >
              <Globe className="w-4 h-4 text-[#4c3f6b]" aria-hidden="true" />
              All India Quota (MCC)
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              onClick={() => navigate('jurisdictions')}
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-medium text-xs px-3.5 py-2 rounded border border-white/20 transition-all focus-visible:ring-2 focus-visible:ring-white"
            >
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
              36 States &amp; UTs
            </button>
            <button
              onClick={() => navigate('authorities')}
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-medium text-xs px-3.5 py-2 rounded border border-white/20 transition-all focus-visible:ring-2 focus-visible:ring-white"
            >
              <Landmark className="w-3.5 h-3.5" aria-hidden="true" />
              Authorities Directory
            </button>
            <button
              onClick={() => navigate('sitemap')}
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-medium text-xs px-3.5 py-2 rounded border border-white/20 transition-all focus-visible:ring-2 focus-visible:ring-white"
            >
              <ListTree className="w-3.5 h-3.5" aria-hidden="true" />
              Complete Sitemap
            </button>
          </div>
        </div>
      </section>

      {/* All India Quota Spotlight Panel */}
      <section aria-labelledby="aiq-spotlight-heading" className="bg-white border border-[#dbe0ea] rounded shadow-sm overflow-hidden">
        <div className="mal-header flex items-center justify-between">
          <h2 id="aiq-spotlight-heading" className="flex items-center gap-2 text-sm font-semibold">
            <Globe className="w-4 h-4 text-violet-200" aria-hidden="true" />
            All India Quota — Medical Counselling Committee (MCC)
          </h2>
          <button
            onClick={() => navigate('jurisdiction/all-india')}
            className="text-xs text-slate-200 hover:text-white flex items-center gap-1 font-normal focus-visible:ring-1 focus-visible:ring-white"
          >
            View All ({aiqDocs.length}) <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </button>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {aiqDocs.slice(0, 4).map(doc => (
            <DocumentCard key={doc.id} document={doc} onPreview={onPreview} />
          ))}
        </div>
      </section>

      {/* Quick Jurisdiction Navigator */}
      <section aria-labelledby="states-directory-heading" className="bg-white border border-[#dbe0ea] rounded shadow-sm overflow-hidden">
        <div className="mal-header flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 id="states-directory-heading" className="flex items-center gap-2 text-sm font-semibold">
            <MapPin className="w-4 h-4 text-violet-200" aria-hidden="true" />
            State &amp; Union Territory Directory
          </h2>

          {/* Type Filter Buttons */}
          <div role="tablist" aria-label="Jurisdiction Type Filters" className="flex items-center space-x-1 text-xs">
            {(['All', 'State', 'Union Territory'] as const).map(type => (
              <button
                key={type}
                role="tab"
                aria-selected={filterType === type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 rounded text-xs transition-colors focus-visible:ring-1 focus-visible:ring-white ${
                  filterType === type
                    ? 'bg-[#f0ecf6] text-[#322e45] font-bold shadow-sm'
                    : 'bg-[#201c2c] hover:bg-[#38314a] text-slate-200 font-medium'
                }`}
              >
                {type === 'All' ? 'All (36)' : type === 'State' ? 'States (28)' : 'UTs (8)'}
              </button>
            ))}
          </div>
        </div>

        {/* Search within grid */}
        <div className="p-3 border-b border-slate-100 dark:border-[#2d263d] bg-slate-50 dark:bg-[#1a1726] flex items-center gap-2">
          <label htmlFor="home-jurisdiction-search" className="sr-only">
            Filter states by name or admissions authority
          </label>
          <Search className="w-4 h-4 text-slate-400 ml-1" aria-hidden="true" />
          <input
            id="home-jurisdiction-search"
            name="home-jurisdiction-search"
            type="text"
            placeholder="Filter states by name or counselling authority..."
            value={searchQuery}
            autoComplete="off"
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-1"
              aria-label="Clear filter query"
            >
              Clear
            </button>
          )}
        </div>

        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {filteredJurisdictions.length} jurisdictions shown
        </div>

        {/* Jurisdictions Grid */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {filteredJurisdictions.map(j => (
            <div
              key={j.slug}
              onClick={() => navigate(`jurisdiction/${j.slug}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`jurisdiction/${j.slug}`); } }}
              aria-label={`View ${j.name} (${j.documentCount} documents)`}
              className="border border-slate-200 dark:border-[#38314a] hover:border-[#4c3f6b] hover:bg-[#f0ecf6]/40 dark:hover:bg-[#2b253c]/50 rounded p-2.5 transition-all cursor-pointer flex items-center justify-between group focus-visible:ring-2 focus-visible:ring-[#4c3f6b]"
            >
              <div className="truncate pr-2">
                <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 group-hover:text-[#4c3f6b] dark:group-hover:text-[#bcaee0] truncate">
                  {j.name}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate" title={j.authorityName}>
                  {j.authorities && j.authorities.length > 1 ? j.authorities.map(a => a.name).join(" • ") : j.authorityName}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                  j.documentCount > 0 ? 'bg-[#f0ecf6] dark:bg-[#2b253c] text-[#322e45] dark:text-[#d3c8e8]' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  {j.documentCount} docs
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#4c3f6b] transition-colors" aria-hidden="true" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Spotlight Allotments Section */}
      <section aria-labelledby="key-allotments-heading" className="bg-white border border-[#dbe0ea] rounded shadow-sm overflow-hidden">
        <div className="mal-header flex items-center justify-between">
          <h2 id="key-allotments-heading" className="flex items-center gap-2 text-sm font-semibold">
            <FileCheck className="w-4 h-4 text-emerald-300" aria-hidden="true" />
            Key Round 1 Seat Allotments
          </h2>
          <button
            onClick={() => navigate('jurisdictions')}
            className="text-xs text-slate-200 hover:text-white flex items-center gap-1 font-normal focus-visible:ring-1 focus-visible:ring-white"
          >
            Explore All Documents <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </button>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {spotlightAllotments.map(doc => (
            <DocumentCard key={doc.id} document={doc} onPreview={onPreview} />
          ))}
        </div>
      </section>
    </div>
  );
};
