import React, { useState, useEffect, useRef } from 'react';
import { Search, Landmark, MapPin, Globe, Sun, Moon, ListTree, Menu, X, Home } from 'lucide-react';
import { CatalogData } from '../types';
import { StethoscopeLogo } from './StethoscopeLogo';

interface NavbarProps {
  catalog: CatalogData;
  currentRoute: string;
  navigate: (route: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ catalog, currentRoute, navigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [fontScale, setFontScale] = useState<'decrease' | 'normal' | 'increase'>('normal');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
                     document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');

      const savedScale = localStorage.getItem('canonify-font-scale') as 'decrease' | 'normal' | 'increase' | null;
      if (savedScale && ['decrease', 'normal', 'increase'].includes(savedScale)) {
        setFontScale(savedScale);
        document.documentElement.setAttribute('data-font-scale', savedScale);
      }
    } catch {
      // Storage unavailable or disabled
    }
  }, []);

  // Close menus on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsMobileSearchOpen(false);
        setShowResults(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // History back-swipe trapping for mobile menu and search drawers
  const isPopstateNavClosingRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isMobileMenuOpen && !isMobileSearchOpen) return;

    isPopstateNavClosingRef.current = false;
    const historyState = {
      navDrawer: isMobileMenuOpen ? 'menu' : 'search',
      timestamp: Date.now(),
    };
    window.history.pushState(historyState, '', window.location.href);

    const handlePopState = () => {
      isPopstateNavClosingRef.current = true;
      setIsMobileMenuOpen(false);
      setIsMobileSearchOpen(false);
      setShowResults(false);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (!isPopstateNavClosingRef.current && window.history.state?.navDrawer) {
        window.history.back();
      }
    };
  }, [isMobileMenuOpen, isMobileSearchOpen]);

  // Autofocus mobile search input when opened
  useEffect(() => {
    if (isMobileSearchOpen && mobileSearchInputRef.current) {
      setTimeout(() => mobileSearchInputRef.current?.focus(), 50);
    }
  }, [isMobileSearchOpen]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    try {
      if (nextTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.classList.add('dark');
        localStorage.setItem('canonify-theme', 'dark');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        document.documentElement.classList.remove('dark');
        localStorage.setItem('canonify-theme', 'light');
      }
    } catch {
      // Storage unavailable or disabled
    }
  };

  const handleFontScaleChange = (scale: 'decrease' | 'normal' | 'increase') => {
    setFontScale(scale);
    try {
      document.documentElement.setAttribute('data-font-scale', scale);
      localStorage.setItem('canonify-font-scale', scale);
    } catch {
      // Storage unavailable or disabled
    }
  };

  const handleNav = (route: string) => {
    navigate(route);
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
  };

  // Filter jurisdictions based on search term
  const searchResults = searchTerm.trim()
    ? catalog.jurisdictions.filter(j =>
        j.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.canonical.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.authorityName.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 6)
    : [];

  const handleSelectJurisdiction = (slug: string) => {
    navigate(`jurisdiction/${slug}`);
    setSearchTerm('');
    setShowResults(false);
    setIsMobileSearchOpen(false);
  };

  return (
    <header role="banner" className="sticky top-0 z-40 bg-[#322e45] text-white shadow-md border-b border-[#4c3f6b]/40">
      {/* Top Brand & Utility Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-2 sm:gap-3">
          {/* Logo / Canonify Brand with C-shaped Stethoscope */}
          <div
            className="flex items-center space-x-2 sm:space-x-2.5 cursor-pointer shrink-0 select-none group focus-visible:ring-2 focus-visible:ring-[#bcaee0] rounded p-1"
            onClick={() => handleNav('')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNav(''); } }}
            aria-label="Canonify Home"
          >
            <div className="w-8 h-8 rounded bg-[#4c3f6b] text-white flex items-center justify-center shadow-sm group-hover:bg-[#5e4d84] transition-colors shrink-0">
              <StethoscopeLogo className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-brand-serif font-bold text-base sm:text-lg tracking-wide text-white group-hover:text-[#d3c8e8] transition-colors">
                  Canonify
                </span>
                <span className="text-[10px] bg-[#4c3f6b]/70 text-[#e4ddf0] border border-[#6b5894] font-semibold px-1.5 py-0.2 rounded font-mono">
                  {catalog.academicYear}
                </span>
              </div>
              <div className="text-[10px] text-slate-300 hidden sm:block tracking-tight font-medium">
                NEET counselling files directory
              </div>
            </div>
          </div>

          {/* Quick Search (Desktop View only) */}
          <div className="hidden md:block relative flex-1 max-w-xs lg:max-w-md mx-3">
            <div className="relative">
              <label htmlFor="navbar-search" className="sr-only">
                Search state, union territory, or counselling authority
              </label>
              <input
                id="navbar-search"
                name="navbar-search"
                type="text"
                placeholder="Search state, UT, or authority..."
                value={searchTerm}
                autoComplete="off"
                aria-label="Search states, UTs, or counselling authorities"
                aria-expanded={showResults && searchResults.length > 0}
                aria-haspopup="listbox"
                aria-controls="navbar-search-results"
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                className="w-full bg-[#221e30] text-white placeholder-slate-400 text-xs rounded pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#8e7bb5] border border-[#42395d]"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" aria-hidden="true" />
            </div>

            {/* Desktop Autocomplete Dropdown */}
            {showResults && searchResults.length > 0 && (
              <div
                id="navbar-search-results"
                role="listbox"
                aria-label="Search suggestions"
                className="absolute right-0 left-0 mt-1 bg-white dark:bg-[#201c2c] text-slate-800 dark:text-slate-100 rounded shadow-xl border border-slate-200 dark:border-[#38314a] py-1 text-xs z-50 overflow-hidden"
                onMouseLeave={() => setShowResults(false)}
              >
                {searchResults.map(j => (
                  <div
                    key={j.slug}
                    role="option"
                    aria-selected={false}
                    onClick={() => handleSelectJurisdiction(j.slug)}
                    className="px-3 py-2 hover:bg-[#f0ecf6] dark:hover:bg-[#2e273e] cursor-pointer flex justify-between items-center border-b border-slate-100 dark:border-[#2d263d] last:border-b-0"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{j.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[220px]">{j.authorityName}</div>
                    </div>
                    <span className="text-[10px] bg-slate-100 dark:bg-[#2b253c] text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-medium">
                      {j.documentCount} docs
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-1.5 shrink-0">
            {/* Desktop Controls (hidden on mobile, visible on desktop) */}
            <div className="hidden md:flex items-center space-x-2">
              {/* Accessibility Font Size Adjuster (A- / A / A+) */}
              <div
                className="flex items-center border border-white/20 rounded bg-white/10 text-xs overflow-hidden"
                role="group"
                aria-label="Desktop font size adjustment"
              >
                <button
                  onClick={() => handleFontScaleChange('decrease')}
                  className={`px-2 py-0.5 hover:bg-white/20 transition-colors text-xs font-semibold ${
                    fontScale === 'decrease' ? 'bg-[#4c3f6b] text-white' : 'text-slate-300'
                  }`}
                  title="Decrease font size (A-)"
                  aria-label="Decrease font size"
                  aria-pressed={fontScale === 'decrease'}
                >
                  A-
                </button>
                <button
                  onClick={() => handleFontScaleChange('normal')}
                  className={`px-2 py-0.5 border-x border-white/20 hover:bg-white/20 transition-colors text-xs font-semibold ${
                    fontScale === 'normal' ? 'bg-[#4c3f6b] text-white' : 'text-slate-300'
                  }`}
                  title="Default font size (A)"
                  aria-label="Default font size"
                  aria-pressed={fontScale === 'normal'}
                >
                  A
                </button>
                <button
                  onClick={() => handleFontScaleChange('increase')}
                  className={`px-2 py-0.5 hover:bg-white/20 transition-colors text-xs font-semibold ${
                    fontScale === 'increase' ? 'bg-[#4c3f6b] text-white' : 'text-slate-300'
                  }`}
                  title="Increase font size (A+)"
                  aria-label="Increase font size"
                  aria-pressed={fontScale === 'increase'}
                >
                  A+
                </button>
              </div>

              {/* GitHub Star Badge (Desktop) */}
              <a
                href="https://github.com/deekshithvodela/Canonify"
                target="_blank"
                rel="noopener noreferrer"
                className="github-badge text-xs px-2 py-1"
                title="Star Canonify on GitHub"
                aria-label="Star Canonify repository on GitHub"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
                <span>★ Star</span>
              </a>

              {/* Theme Toggle (Desktop) */}
              <button
                onClick={toggleTheme}
                className="theme-toggle-btn px-2 py-1"
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                aria-label={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                aria-pressed={theme === 'dark'}
              >
                {theme === 'light' ? (
                  <Moon className="w-3.5 h-3.5 text-violet-200" aria-hidden="true" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
                )}
              </button>
            </div>

            {/* Mobile Controls (hidden on desktop, visible on mobile) */}
            {/* Mobile Search Icon Button (Toggles Mobile Search Bar) */}
            <button
              onClick={() => {
                setIsMobileSearchOpen(!isMobileSearchOpen);
                if (isMobileMenuOpen) setIsMobileMenuOpen(false);
              }}
              className="md:hidden p-2 rounded hover:bg-white/10 text-slate-200 hover:text-white transition-colors"
              title="Search admissions documents"
              aria-label="Toggle search input"
              aria-expanded={isMobileSearchOpen}
            >
              <Search className="w-5 h-5" aria-hidden="true" />
            </button>

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
                if (isMobileSearchOpen) setIsMobileSearchOpen(false);
              }}
              className="md:hidden p-2 rounded hover:bg-white/10 text-slate-200 hover:text-white transition-colors"
              title="Navigation menu"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-white" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5 text-white" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Secondary Utility Row (Mobile only: md:hidden) */}
      <div className="md:hidden bg-[#272336] border-t border-[#38314a]/70 text-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between gap-2">
          {/* Left: Accessibility Font Size Buttons (A- / A / A+) */}
          <div
            className="flex items-center space-x-1.5 shrink-0"
            role="group"
            aria-label="Font size adjustment"
          >
            <span className="text-[11px] font-medium text-slate-400 hidden xs:inline">Text Size:</span>
            <div className="inline-flex items-center border border-white/20 rounded bg-white/10 text-xs overflow-hidden">
              <button
                onClick={() => handleFontScaleChange('decrease')}
                className={`px-2 py-0.5 hover:bg-white/20 transition-colors text-xs font-semibold ${
                  fontScale === 'decrease' ? 'bg-[#4c3f6b] text-white' : 'text-slate-300'
                }`}
                title="Decrease font size (A-)"
                aria-label="Decrease font size"
                aria-pressed={fontScale === 'decrease'}
              >
                A-
              </button>
              <button
                onClick={() => handleFontScaleChange('normal')}
                className={`px-2 py-0.5 border-x border-white/20 hover:bg-white/20 transition-colors text-xs font-semibold ${
                  fontScale === 'normal' ? 'bg-[#4c3f6b] text-white' : 'text-slate-300'
                }`}
                title="Default font size (A)"
                aria-label="Default font size"
                aria-pressed={fontScale === 'normal'}
              >
                A
              </button>
              <button
                onClick={() => handleFontScaleChange('increase')}
                className={`px-2 py-0.5 hover:bg-white/20 transition-colors text-xs font-semibold ${
                  fontScale === 'increase' ? 'bg-[#4c3f6b] text-white' : 'text-slate-300'
                }`}
                title="Increase font size (A+)"
                aria-label="Increase font size"
                aria-pressed={fontScale === 'increase'}
              >
                A+
              </button>
            </div>
          </div>

          {/* Right: GitHub Star Badge & Light/Dark Theme Toggle */}
          <div className="flex items-center space-x-2 shrink-0">
            <a
              href="https://github.com/deekshithvodela/Canonify"
              target="_blank"
              rel="noopener noreferrer"
              className="github-badge text-xs px-2 py-1"
              title="Star Canonify on GitHub"
              aria-label="Star Canonify repository on GitHub"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              <span>★ Star</span>
            </a>

            <button
              onClick={toggleTheme}
              className="theme-toggle-btn px-2 py-1"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              aria-label={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              aria-pressed={theme === 'dark'}
            >
              {theme === 'light' ? (
                <Moon className="w-3.5 h-3.5 text-violet-200" aria-hidden="true" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Full-Width Mobile Search Bar (Mobile View only) */}
      {isMobileSearchOpen && (
        <div className="md:hidden bg-[#272336] border-t border-[#38314a] p-3 animate-in fade-in duration-150">
          <div className="relative">
            <label htmlFor="mobile-navbar-search" className="sr-only">
              Search state, union territory, or counselling authority
            </label>
            <input
              ref={mobileSearchInputRef}
              id="mobile-navbar-search"
              type="text"
              placeholder="Search state, UT, or authority..."
              value={searchTerm}
              autoComplete="off"
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              className="w-full bg-[#1b1726] text-white placeholder-slate-400 text-xs rounded pl-8 pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-[#8e7bb5] border border-[#42395d]"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" aria-hidden="true" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-white"
                aria-label="Clear search input"
              >
                &times;
              </button>
            )}
          </div>

          {/* Mobile Autocomplete Results */}
          {showResults && searchResults.length > 0 && (
            <div className="mt-2 bg-white dark:bg-[#201c2c] text-slate-800 dark:text-slate-100 rounded shadow-xl border border-slate-200 dark:border-[#38314a] py-1 text-xs overflow-hidden">
              {searchResults.map(j => (
                <div
                  key={j.slug}
                  onClick={() => handleSelectJurisdiction(j.slug)}
                  className="px-3 py-2.5 hover:bg-[#f0ecf6] dark:hover:bg-[#2e273e] cursor-pointer flex justify-between items-center border-b border-slate-100 dark:border-[#2d263d] last:border-b-0"
                >
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{j.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{j.authorityName}</div>
                  </div>
                  <span className="text-[10px] bg-slate-100 dark:bg-[#2b253c] text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-medium">
                    {j.documentCount} docs
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Desktop Horizontal Sub-Nav Bar (Hidden on Mobile) */}
      <nav aria-label="Counselling Categories Navigation" className="hidden md:block bg-[#272336] border-t border-[#38314a] text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-3 overflow-x-auto py-1">
          <button
            onClick={() => handleNav('')}
            className={`px-3 py-1.5 rounded font-medium transition-colors whitespace-nowrap ${
              currentRoute === '' || currentRoute === 'home'
                ? 'bg-[#4c3f6b] text-white border-b-2 border-[#d3c8e8] font-semibold'
                : 'text-slate-300 hover:bg-[#352f47] hover:text-white'
            }`}
          >
            Home Overview
          </button>
          <button
            onClick={() => handleNav('jurisdiction/all-india')}
            className={`px-3 py-1.5 rounded font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              currentRoute === 'jurisdiction/all-india'
                ? 'bg-[#4c3f6b] text-white border-b-2 border-[#d3c8e8] font-semibold'
                : 'text-slate-300 hover:bg-[#352f47] hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" aria-hidden="true" />
            All India Quota (MCC)
          </button>
          <button
            onClick={() => handleNav('jurisdictions')}
            className={`px-3 py-1.5 rounded font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              currentRoute === 'jurisdictions'
                ? 'bg-[#4c3f6b] text-white border-b-2 border-[#d3c8e8] font-semibold'
                : 'text-slate-300 hover:bg-[#352f47] hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
            States &amp; UTs Directory
          </button>
          <button
            onClick={() => handleNav('authorities')}
            className={`px-3 py-1.5 rounded font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              currentRoute === 'authorities'
                ? 'bg-[#4c3f6b] text-white border-b-2 border-[#d3c8e8] font-semibold'
                : 'text-slate-300 hover:bg-[#352f47] hover:text-white'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" aria-hidden="true" />
            Counselling Authorities
          </button>
          <button
            onClick={() => handleNav('sitemap')}
            className={`px-3 py-1.5 rounded font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              currentRoute === 'sitemap'
                ? 'bg-[#4c3f6b] text-white border-b-2 border-[#d3c8e8] font-semibold'
                : 'text-slate-300 hover:bg-[#352f47] hover:text-white'
            }`}
          >
            <ListTree className="w-3.5 h-3.5" aria-hidden="true" />
            Sitemap
          </button>
        </div>
      </nav>

      {/* Mobile Slide-Down Navigation Drawer (Hamburger Menu) */}
      {isMobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          role="navigation"
          aria-label="Mobile Navigation"
          className="md:hidden bg-[#272336] border-t border-[#38314a] px-4 py-3 space-y-1 text-sm shadow-2xl animate-in slide-in-from-top duration-200"
        >
          <button
            onClick={() => handleNav('')}
            className={`w-full text-left px-3 py-2.5 rounded font-medium flex items-center gap-2.5 transition-colors ${
              currentRoute === '' || currentRoute === 'home'
                ? 'bg-[#4c3f6b] text-white font-semibold shadow-sm'
                : 'text-slate-200 hover:bg-[#352f47]'
            }`}
          >
            <Home className="w-4 h-4 text-[#d3c8e8]" aria-hidden="true" />
            Home Overview
          </button>
          <button
            onClick={() => handleNav('jurisdiction/all-india')}
            className={`w-full text-left px-3 py-2.5 rounded font-medium flex items-center gap-2.5 transition-colors ${
              currentRoute === 'jurisdiction/all-india'
                ? 'bg-[#4c3f6b] text-white font-semibold shadow-sm'
                : 'text-slate-200 hover:bg-[#352f47]'
            }`}
          >
            <Globe className="w-4 h-4 text-[#d3c8e8]" aria-hidden="true" />
            All India Quota (MCC)
          </button>
          <button
            onClick={() => handleNav('jurisdictions')}
            className={`w-full text-left px-3 py-2.5 rounded font-medium flex items-center gap-2.5 transition-colors ${
              currentRoute === 'jurisdictions'
                ? 'bg-[#4c3f6b] text-white font-semibold shadow-sm'
                : 'text-slate-200 hover:bg-[#352f47]'
            }`}
          >
            <MapPin className="w-4 h-4 text-[#d3c8e8]" aria-hidden="true" />
            States &amp; UTs Directory
          </button>
          <button
            onClick={() => handleNav('authorities')}
            className={`w-full text-left px-3 py-2.5 rounded font-medium flex items-center gap-2.5 transition-colors ${
              currentRoute === 'authorities'
                ? 'bg-[#4c3f6b] text-white font-semibold shadow-sm'
                : 'text-slate-200 hover:bg-[#352f47]'
            }`}
          >
            <Landmark className="w-4 h-4 text-[#d3c8e8]" aria-hidden="true" />
            Counselling Authorities Directory
          </button>
          <button
            onClick={() => handleNav('sitemap')}
            className={`w-full text-left px-3 py-2.5 rounded font-medium flex items-center gap-2.5 transition-colors ${
              currentRoute === 'sitemap'
                ? 'bg-[#4c3f6b] text-white font-semibold shadow-sm'
                : 'text-slate-200 hover:bg-[#352f47]'
            }`}
          >
            <ListTree className="w-4 h-4 text-[#d3c8e8]" aria-hidden="true" />
            Complete Sitemap
          </button>
        </div>
      )}
    </header>
  );
};
