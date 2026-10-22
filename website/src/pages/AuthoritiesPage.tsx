import React, { useState } from 'react';
import { Landmark, Search, ExternalLink, Globe, ArrowRight } from 'lucide-react';
import { CatalogData } from '../types';

interface AuthoritiesPageProps {
  catalog: CatalogData;
  navigate: (route: string) => void;
}

export const AuthoritiesPage: React.FC<AuthoritiesPageProps> = ({ catalog, navigate }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = catalog.jurisdictions.filter(j => {
    return searchTerm.trim() === '' ? true :
      j.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.authorityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.canonical.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="bg-white dark:bg-[#201c2c] border border-[#e2dde8] dark:border-[#38314a] rounded-lg p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 font-brand-serif">
              <Landmark className="w-5 h-5 text-[#4c3f6b] dark:text-[#a99ac7]" />
              Official Counselling Authorities Directory
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Verified official websites, online counselling portals, and admission committees across MCC and all 36 Indian States &amp; Union Territories.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <label htmlFor="authority-search-input" className="sr-only">
              Search authority or state
            </label>
            <input
              id="authority-search-input"
              type="text"
              placeholder="Search authority or state..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#161320] border border-[#e2dde8] dark:border-[#38314a] rounded text-xs pl-8 pr-3 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#4c3f6b]"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Authorities Directory Table */}
      <div className="bg-white dark:bg-[#201c2c] border border-[#e2dde8] dark:border-[#38314a] rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <caption className="sr-only">Directory of official medical counselling authorities by state and union territory</caption>
            <thead>
              <tr className="bg-[#322e45] text-white border-b border-[#272336]">
                <th scope="col" className="py-2.5 px-4 font-semibold w-12 text-center">#</th>
                <th scope="col" className="py-2.5 px-4 font-semibold w-48">Jurisdiction</th>
                <th scope="col" className="py-2.5 px-4 font-semibold">Counselling Authority / Board</th>
                <th scope="col" className="py-2.5 px-4 font-semibold w-64">Official Web Portal</th>
                <th scope="col" className="py-2.5 px-4 font-semibold w-28 text-center">Documents</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((j, index) => (
                <tr key={j.slug} className="hover:bg-purple-50/30 dark:hover:bg-[#2b263b]/50 transition-colors">
                  <td className="py-2.5 px-4 text-center font-mono text-slate-400 text-[11px]">
                    {index + 1}
                  </td>

                  <td className="py-2.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{j.name}</div>
                    <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded inline-block mt-0.5 ${
                      j.type === 'All India' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                      j.type === 'Union Territory' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' :
                      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {j.type}
                    </span>
                  </td>

                  <td className="py-2.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                    {j.authorities && j.authorities.length > 1 ? (
                      <div className="space-y-2.5 py-1">
                        {j.authorities.map((a, i) => (
                          <div key={i} className="border-l-2 border-[#4c3f6b] dark:border-[#8e7bb5] pl-2">
                            <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs">{a.name}</div>
                            {a.role && (
                              <div className="text-[10px] text-[#4c3f6b] dark:text-[#a99ac7] font-medium">
                                {a.role}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="max-w-md">{j.authorityName}</div>
                    )}
                  </td>

                  <td className="py-2.5 px-4">
                    {j.authorities && j.authorities.length > 1 ? (
                      <div className="space-y-2.5 py-1">
                        {j.authorities.map((a, i) => (
                          <div key={i} className="flex items-center">
                            <a
                              href={a.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#4c3f6b] dark:text-[#a99ac7] hover:underline font-medium text-[11px] truncate max-w-[220px]"
                              title={a.url}
                            >
                              <Globe className="w-3 h-3 shrink-0" aria-hidden="true" />
                              <span className="truncate">{a.url.replace(/^https?:\/\//, '')}</span>
                              <ExternalLink className="w-2.5 h-2.5 shrink-0" aria-hidden="true" />
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : j.officialWebsiteUrl ? (
                      <div className="space-y-1">
                        <a
                          href={j.officialWebsiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#4c3f6b] dark:text-[#a99ac7] hover:underline font-medium text-[11px] truncate max-w-[220px]"
                          title={j.officialWebsiteUrl}
                        >
                          <Globe className="w-3 h-3 shrink-0" aria-hidden="true" />
                          <span className="truncate">{j.officialWebsiteUrl.replace(/^https?:\/\//, '')}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" aria-hidden="true" />
                        </a>

                        {j.allOfficialLinks && j.allOfficialLinks.length > 1 && (
                          <div className="text-[10px] text-slate-400">
                            +{j.allOfficialLinks.length - 1} secondary portal{j.allOfficialLinks.length > 2 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">N/A (Central Pool)</span>
                    )}
                  </td>

                  <td className="py-2.5 px-4 text-center">
                    <button
                      onClick={() => navigate(`jurisdiction/${j.slug}`)}
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded transition-colors ${
                        j.documentCount > 0
                          ? 'bg-[#f0ecf6] dark:bg-[#2b253c] text-[#322e45] dark:text-[#dcd4ec] hover:bg-[#e4deee]'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {j.documentCount} docs
                      <ArrowRight className="w-3 h-3" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
