import React, { useState } from 'react';
import { MapPin, Search, ArrowRight } from 'lucide-react';
import { CatalogData } from '../types';

interface JurisdictionDirectoryPageProps {
  catalog: CatalogData;
  navigate: (route: string) => void;
}

export const JurisdictionDirectoryPage: React.FC<JurisdictionDirectoryPageProps> = ({ catalog, navigate }) => {
  const [filterType, setFilterType] = useState<'All' | 'State' | 'Union Territory'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredJurisdictions = catalog.jurisdictions.filter(j => {
    const matchesType = filterType === 'All' ? true : j.type === filterType;
    const matchesSearch = searchQuery.trim() === '' ? true :
      j.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.canonical.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.authorityName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="bg-white dark:bg-[#201c2c] border border-[#e2dde8] dark:border-[#38314a] rounded-lg p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 font-brand-serif">
              <MapPin className="w-5 h-5 text-[#4c3f6b] dark:text-[#a99ac7]" />
              Counselling Jurisdictions Directory
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Explore NEET UG {catalog.academicYear} admissions across All India Quota and 36 States and Union Territories.
            </p>
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center space-x-1 text-xs self-start sm:self-center" role="tablist" aria-label="Jurisdiction Type Filters">
            {(['All', 'State', 'Union Territory'] as const).map(type => (
              <button
                key={type}
                role="tab"
                aria-selected={filterType === type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded font-medium transition-colors ${
                  filterType === type
                    ? 'bg-[#4c3f6b] text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {type === 'All' ? 'All (36)' : type === 'State' ? 'States (28)' : 'Union Territories (8)'}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <label htmlFor="jurisdiction-search-input" className="sr-only">
            Search jurisdiction or admissions board
          </label>
          <input
            id="jurisdiction-search-input"
            type="text"
            placeholder="Search jurisdiction or admissions board..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#161320] border border-[#e2dde8] dark:border-[#38314a] rounded text-xs pl-9 pr-4 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#4c3f6b] focus:bg-white dark:focus:bg-[#161320]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" aria-hidden="true" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Clear search input"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Directory Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredJurisdictions.map(j => (
          <div
            key={j.slug}
            onClick={() => navigate(`jurisdiction/${j.slug}`)}
            className="bg-white dark:bg-[#201c2c] border border-[#e2dde8] dark:border-[#38314a] hover:border-[#4c3f6b] dark:hover:border-[#8e7bb5] rounded-lg p-4 shadow-sm hover:shadow transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-[#4c3f6b] dark:group-hover:text-[#a99ac7] transition-colors font-brand-serif">
                  {j.name}
                </h3>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                  j.type === 'All India'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                    : j.type === 'Union Territory'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
                    : 'bg-[#f0ecf6] text-[#322e45] dark:bg-[#2b253c] dark:text-[#dcd4ec]'
                }`}>
                  {j.type}
                </span>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-2 mb-3 min-h-[32px]" title={j.authorityName}>
                {j.authorities && j.authorities.length > 1
                  ? j.authorities.map(a => a.name).join(" • ")
                  : j.authorityName}
              </div>

              {/* Category Indicators */}
              <div className="flex flex-wrap gap-1 mb-3">
                {j.availableCategories.map(cat => (
                  <span
                    key={cat}
                    className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded font-medium border border-slate-200 dark:border-slate-700"
                  >
                    {cat}
                  </span>
                ))}
                {j.availableCategories.length === 0 && (
                  <span className="text-[10px] text-slate-400 italic">No state documents published</span>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>
                <strong className="text-slate-800 dark:text-slate-200">{j.documentCount}</strong> documents
              </span>

              <div className="flex items-center gap-1 font-semibold text-[#4c3f6b] dark:text-[#a99ac7] group-hover:translate-x-0.5 transition-transform">
                View Archive <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredJurisdictions.length === 0 && (
        <div className="bg-white dark:bg-[#201c2c] border border-slate-200 dark:border-slate-800 rounded p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
          No jurisdictions match your filter "{searchQuery}".
        </div>
      )}
    </div>
  );
};
