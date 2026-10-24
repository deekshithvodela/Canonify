import { useState, useEffect } from 'react';
import { CatalogData, DocumentItem } from './types';
import catalogJson from './data/catalog.json';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { JurisdictionDirectoryPage } from './pages/JurisdictionDirectoryPage';
import { JurisdictionProfilePage } from './pages/JurisdictionProfilePage';
import { AuthoritiesPage } from './pages/AuthoritiesPage';
import { SitemapPage } from './pages/SitemapPage';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import { LegalModal, LegalModalType } from './components/LegalModal';

const catalog = catalogJson as unknown as CatalogData;

export function App() {
  const [currentRoute, setCurrentRoute] = useState<string>('');
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [legalModal, setLegalModal] = useState<LegalModalType>(null);

  // Sync route with URL hash on load and hashchange
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
      // Ignore pure in-page anchor jumps like "main-content"
      if (rawHash === 'main-content') return;

      // Isolate the route path before any secondary anchor fragments
      const [routePath] = rawHash.split('#');
      setCurrentRoute(routePath);
      window.scrollTo(0, 0);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Dynamic SEO metadata updates based on current route
  useEffect(() => {
    let title = 'Canonify — NEET Counselling Files Directory';
    let description = 'An archival and discovery index of official seat allotment results, state merit lists, vacancy seat matrices, and counselling schedules collected directly from MCC and state/UT admissions authorities across India.';

    if (currentRoute === 'jurisdictions') {
      title = 'Counselling Jurisdictions Directory — Canonify';
      description = 'Complete directory of NEET UG counselling documents across All India Quota and 36 Indian States and Union Territories.';
    } else if (currentRoute === 'authorities') {
      title = 'Official Admissions Authorities Directory — Canonify';
      description = 'Verified official portals and admissions directorates for MCC and all 36 Indian State and Union Territory counselling committees.';
    } else if (currentRoute === 'sitemap') {
      title = 'Repository Sitemap & Document Index — Canonify';
      description = `Hierarchical sitemap indexing all ${catalog.metadata.totalDocuments} official NEET UG counselling files grouped by state, category, and round.`;
    } else if (currentRoute.startsWith('jurisdiction/')) {
      const slug = currentRoute.replace('jurisdiction/', '').split('/')[0];
      const jur = catalog.jurisdictions.find(j => j.slug === slug);
      if (jur) {
        title = `${jur.name} NEET UG Counselling Documents & Allotments — Canonify`;
        description = `Official seat allotment results, state rank lists, and seat matrices for ${jur.name} (${jur.authorityName}).`;
      }
    }

    document.title = title;

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', description);

    // Update OpenGraph & Twitter
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', window.location.href);

    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute('content', title);
    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute('content', description);

    // Track SPA pageview in GoatCounter
    const gc = (window as unknown as { goatcounter?: { count: (vars: { path: string; title: string }) => void } }).goatcounter;
    if (gc && typeof gc.count === 'function') {
      gc.count({
        path: window.location.pathname + window.location.search + window.location.hash,
        title,
      });
    }
  }, [currentRoute]);

  const navigate = (route: string) => {
    const clean = route.replace(/^\//, '');
    window.location.hash = clean ? `#/${clean}` : '#/';
  };

  // Route resolver
  const renderPage = () => {
    if (currentRoute === '' || currentRoute === 'home') {
      return (
        <HomePage
          catalog={catalog}
          navigate={navigate}
          onPreview={(doc) => setPreviewDoc(doc)}
        />
      );
    }

    if (currentRoute === 'jurisdictions') {
      return (
        <JurisdictionDirectoryPage
          catalog={catalog}
          navigate={navigate}
        />
      );
    }

    if (currentRoute === 'authorities') {
      return (
        <AuthoritiesPage
          catalog={catalog}
          navigate={navigate}
        />
      );
    }

    if (currentRoute === 'sitemap') {
      return (
        <SitemapPage
          catalog={catalog}
          navigate={navigate}
          onPreview={(doc) => setPreviewDoc(doc)}
        />
      );
    }

    if (currentRoute.startsWith('jurisdiction/')) {
      const slug = currentRoute.replace('jurisdiction/', '').split('/')[0];
      return (
        <JurisdictionProfilePage
          slug={slug}
          catalog={catalog}
          navigate={navigate}
          onPreview={(doc) => setPreviewDoc(doc)}
        />
      );
    }

    // Default fallback
    return (
      <HomePage
        catalog={catalog}
        navigate={navigate}
        onPreview={(doc) => setPreviewDoc(doc)}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col theme-bg text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Keyboard Accessibility Skip Link */}
      <a
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          const main = document.getElementById('main-content');
          if (main) {
            main.focus();
            main.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#4c3f6b] focus:text-white focus:font-bold focus:rounded focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>

      <Navbar
        catalog={catalog}
        currentRoute={currentRoute}
        navigate={navigate}
      />

      <main id="main-content" role="main" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 focus:outline-none">
        {renderPage()}
      </main>

      <Footer onOpenLegalModal={(type) => setLegalModal(type)} />

      {/* In-Browser PDF Preview Modal */}
      <PdfPreviewModal
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
      />

      {/* Legal & Policy Modals */}
      <LegalModal
        type={legalModal}
        onClose={() => setLegalModal(null)}
      />
    </div>
  );
}

export default App;
