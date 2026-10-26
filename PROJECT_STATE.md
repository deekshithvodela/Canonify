# Project State: Canonify — NEET Counselling Files Directory

## Project Identity
- **Project Name:** Canonify
- **Subtitle:** NEET counselling files directory
- **Purpose:** Host and organize NEET UG counselling documents collected directly from the Medical Counselling Committee (MCC) and state/UT admissions authorities across India, presented via a clean, navigable static website inspired by MyAnimeList's information architecture, with an antique/scholar reading palette, dark mode support, and hierarchical sitemap discovery.
- **Current Phase:** All Phases (Phase 0 through Phase 20) Fully Executed, Tested, and Verified
- **Repository Location:** `./` (Root Workspace)
- **Technology Stack:**
  - Frontend: React 18, Vite 5, TypeScript, Tailwind CSS, Lucide Icons, Georgia & Helvetica typography
  - Branding: C-shaped Stethoscope vector logo, Medical Plum (#322e45) & Violet (#4c3f6b) palette
  - Automation & Pipelines: Node.js 20 (ESM), headless LibreOffice, Poppler (`pdfinfo`, `pdftotext`)
  - SEO & A11y: WCAG 2.2 Level AA compliant, Schema.org JSON-LD, OpenGraph, Twitter Cards, dynamic meta tags, sitemap.xml, robots.txt
  - Deployment: Static web hosting / GitHub Pages compatible
- **Deployment Output:** `website/dist/` (self-contained with all 206 published documents and companion PDFs)

## Project Goal
Create a production-grade, reproducible document discovery and hosting platform for NEET UG counselling documents across All India and 36 States/UTs, with original file preservation, deterministic naming normalization, metadata traceability, and zero data loss.

## Current State
- All 211 candidate counselling documents organized and preserved in `data/raw/` and `./NEET UG 2026/`.
- All 211 documents normalized under deterministic names in `data/normalized/` with 100% SHA-256 match and 0 collisions.
- Official authority reference table preserved in `data/reference/NEET UG Counselling authority table.xlsx` and exported to `data/metadata/authorities.json` (36 canonical authorities).
- Complete machine-readable metadata generated:
  - `data/metadata/document-inventory.json`
  - `data/metadata/document-inventory.csv`
  - `data/metadata/authorities.json`
  - `data/metadata/jurisdictions.json`
  - `data/metadata/file-mapping.json`
  - `website/src/data/catalog.json`
- Comprehensive audit, classification, conversion, and QA reports in `data/reports/`.
- Production static website built in `website/dist/` with relative base path (`./`) and URL hash routing.
- End-to-end repeatable automation pipeline operational (`npm run pipeline`).

## Architecture
- **Raw Store:** `data/raw/` (immutable source files preserved by jurisdiction)
- **Reference Store:** `data/reference/` (`NEET UG Counselling authority table.xlsx`)
- **Normalized Store:** `data/normalized/` (standardized filenames: `<Year>_<Region>_<DocType>_<Round>...`)
- **Metadata Store:** `data/metadata/` (`document-inventory.json`, `jurisdictions.json`, `authorities.json`, `file-mapping.json`)
- **Reports Store:** `data/reports/` (`audit-report.md`, `classification-report.md`, `conflicts-report.md`, `conversion-report.md`, `qa-report.md`)
- **Automation Scripts:** `scripts/` (`classify-files.mjs`, `normalize-filenames.mjs`, `convert-to-pdf.mjs`, `generate-catalog.mjs`, `validate-links.mjs`)
- **Website Source:** `website/` (React + Vite + TypeScript + Tailwind CSS application)

## Core Decisions
- **Decision:** Original source files are strictly immutable and never converted or overwritten in-place.
  - **Reason:** Maintain permanent audit traceability and eliminate risk of data loss.
  - **Status:** Active
  - **Affected Area:** `data/raw/`, `NEET UG 2026/`
- **Decision:** Use URL hash routing (`#/`, `#/jurisdiction/:slug`, `#/authorities`, `#/sitemap`) on the frontend.
  - **Reason:** Guarantees 100% deep-link bookmarking and refresh reliability under GitHub Pages static hosting without server rewrite dependencies.
  - **Status:** Active
  - **Affected Area:** `website/src/App.tsx`
- **Decision:** Direct native PDF integration for Uttar Pradesh master allotment (`2026_UttarPradesh_Allotment_Round1_Round2.pdf`).
  - **Reason:** Replaces previous `.xlsx` presentation on the website with user-provided 146-page PDF (50 MB); excludes raw `.xlsx`, `.csv`, `.json` from website catalog while preserving all 4 source files in `data/raw/` and `data/normalized/`.
  - **Status:** Active
  - **Affected Area:** `scripts/classify-files.mjs`, `website/src/components/DocumentCard.tsx`
- **Decision:** Reclassify Andhra Pradesh NCC Quota document under `Allotment`.
  - **Reason:** User confirmed `NEET UG 2026/AndhraPradesh/AndhraPradesh round  NCC quota.pdf` is an allotment file under NCC quota; classified as `Allotment`, `Quota: NCCQuota`, titled `Andhra Pradesh NCC Quota Seat Allotment Result`.
  - **Status:** Active
  - **Affected Area:** `scripts/classify-files.mjs`, `website/src/data/catalog.json`
- **Decision:** Image-derived medical scholar palette (`#322e45` & `#4c3f6b`) with simple typography (Georgia & Helvetica).
  - **Reason:** Pixel-sampled from user-provided image; replaces generic colors with rich plum and violet tones across light and dark modes, paired with clean native typography.
  - **Status:** Active
  - **Affected Area:** `website/src/index.css`, `website/tailwind.config.js`
- **Decision:** C-shaped Stethoscope bespoke vector logo mark.
  - **Reason:** Custom medical branding curling binaural headset and acoustic tubing into a distinctive "C" terminating in a circular chestpiece.
  - **Status:** Active
  - **Affected Area:** `website/src/components/StethoscopeLogo.tsx`, `website/index.html`
- **Decision:** Zero collision naming schema using domain qualifiers (`QuotaCategory`, `Qualifier`).
  - **Reason:** Eliminates arbitrary `_v1`/`_v2` numeric suffixes while ensuring 100% uniqueness.
  - **Status:** Active
  - **Affected Area:** `scripts/classify-files.mjs`

## Constraints
- Stay inside workspace root directory.
- No mutating Git commands without explicit per-prompt user authorization.
- Never delete or alter raw input files.
- Website scope strictly restricted to document discovery and downloads; no predictive or student rank analysis features.

## Preserve / Do Not Touch
- All raw documents in `data/raw/` and `NEET UG 2026/`.
- `data/reference/NEET UG Counselling authority table.xlsx`.

## Completed
- Phase 0: Workspace Discovery & Safety Audit (PASS)
- Phase 1: Document Inventory & Content Classification (PASS)
- Phase 2: Deterministic Naming Convention & Collision Audit (PASS, 0 collisions)
- Phase 3: Repository & Folder Architecture Reorganization (PASS)
- Phase 4: PDF Conversion & Publication Pipeline (PASS)
- Phase 5: Website Development with MyAnimeList Layout & Styling (PASS)
- Phase 6: Web Catalog Generation & Static Asset Linking (PASS)
- Phase 7: Automated QA, Link Verification & Build Audit (PASS: 8/8 checks)
- Phase 8: Comprehensive Documentation & Maintenance Handover (PASS)
- Phase 9: Classification Refinements, Lakshadweep Integration & Pipeline Re-synchronization (PASS: 8/8 checks, 210 documents, 0 collisions)
- Phase 10: Andhra Pradesh Quota Normalization, Hierarchical Sorting & Repository-Wide Defect Rectification (PASS: 8/8 checks, 0 collisions, Allotment & Round-wise hierarchical sorting active)
- Phase 11: Document Reclassification (Analysis, Info, Seat Additions), Website Catalog Display Filtering, and XLSX Interactive Preview Integration (PASS: 8/8 checks, 206 website documents, 0 collisions, 100% source file preservation)
- Phase 12: Multi-Authority Entity Modeling & URL Disambiguation (PASS: discrete authority arrays for Delhi, Meghalaya, Sikkim, Uttarakhand, Kerala, Manipur; XML entities decoded)
- Phase 13: Canonify Rebranding, Antique/Scholar Palette, Hierarchical Sitemap, NexDoc Minimalist Footer & Legal Modals (PASS: 8/8 QA checks, dark theme toggle, sitemap page, MIT license file, zero-tracking privacy policy, official public domain disclosure)
- Phase 14: UP Native Allotment PDF Integration, AP NCC Quota Allotment Reclassification, Image Color Palette (`#322e45` / `#4c3f6b`), C-Stethoscope Logo, Clean Typography (Georgia & Helvetica), and WCAG 2.2 AA / SEO Optimization (PASS: 8/8 QA checks, 211 total source files preserved, 206 published documents, 0 collisions, 0 TypeScript errors)
- Phase 16: Mobile Viewport Optimization (Hamburger Menu & Expandable Search) and Government-Style Accessibility Font Scaler (`A- / A / A+`) (PASS: 8/8 QA checks, 0 build errors)
- Phase 17: Mobile Layout Reordering — State Info on Top, Files Second, and "Filter By Category" Section Hidden on Mobile (PASS: 8/8 QA checks, automated Playwright responsive verification on 360px and 1280px viewports, desktop 100% preserved)
- Phase 18: Default Light Mode, Horizontal Overflow Elimination, and Multi-Row Mobile Header (PASS: 8/8 QA checks, 0 build errors)
- Phase 19: Desktop Header Layout Restoration — Restored previous compact 2-row desktop header (Font adjuster, Star, and Theme in Row 1) while 100% preserving mobile multi-row layout (PASS: 8/8 QA checks, automated Playwright responsive verification on 1280px desktop and 360px mobile)
- Phase 20: Repository Size Audit, Gitignore Optimization & Non-Official/Non-Impersonation Legal Disclosure (PASS: 8/8 QA checks, repository size cut from 1.65 GB to 820.31 MB (<1 GB GitHub recommendation), zero files over 100 MB hard limit, non-impersonation notice active in legal modal, footer, and README)
- Phase 21: Final Pre-Release Production-Grade Audit & Zero-Touch Deployment Workflow (PASS: 0 secrets, 0 machine paths, 0 broken links, 0 TypeScript errors, official GitHub Pages CI/CD workflow created in `.github/workflows/deploy.yml`, 100% production ready for initial push)
- Phase 22: Google Search Console Verification File Integration (PASS: `googleb30f9215a6887c17.html` added to `website/public/` and served at root `/googleb30f9215a6887c17.html` with HTTP 200)
- Phase 23: GoatCounter Analytics Integration & Multi-Format Open Graph Social Preview Images (PASS: GoatCounter script integrated in `index.html` + dynamic SPA hash route tracking in `App.tsx`; Privacy Policy updated; 4 high-res social preview cards generated without domain watermark: `og-image.png` 1200x630, `og-square.png` 600x600, `og-banner-wide.png` 1200x400, `og-mobile.png` 1080x1920)
- Phase 24: Initial Repository Push & Local Dev Branch Setup (PASS: `main` branch committed and pushed to `git@github.com:deekshithvodela/Canonify.git`; local-only branch `antigravity-dev` initialized and checked out; strict boundary maintained: `antigravity-dev` is never pushed to remote)
- Phase 25: OpenGraph WhatsApp Optimization, Repository-Wide Domain Clean-up, 404 Route Interceptor & Footer LinkedIn Link (PASS: 8/8 checks, 0 errors; all `canonify.org` instances replaced with `https://deekshithvodela.github.io/Canonify/` across `index.html`, `sitemap.xml`, and `robots.txt`; OpenGraph preview images compressed: `og-image.png` 98 KB & `og-image.jpg` 59 KB, safely below WhatsApp 300 KB limit; `website/public/404.html` deployed with branded UI and auto-redirect to hash route; footer copyright `Deekshith Vodela` linked to LinkedIn)
- Phase 26: Google-Compliant Favicon Suite, Site-Name Optimization & Line-by-Line Code Review (PASS: 8/8 checks, 0 errors; generated multi-resolution crawlable favicon suite `favicon.ico`, `favicon-48x48.png`, `favicon.svg`, `apple-touch-icon.png` in `website/public/`; updated `index.html` with physical links, `application-name`, and `WebSite` JSON-LD `alternateName`; line-by-line review resolved `LegalModal.tsx` localStorage documentation, container dark theme contrast across `HomePage.tsx`, `JurisdictionProfilePage.tsx`, `SitemapPage.tsx`, `PdfPreviewModal.tsx`, and dynamic sitemap metadata interpolation; removed unreferenced `react.svg` and `vite.svg`)
- Phase 27: Industry-Standard Production Engineering Baseline (PASS: 8/8 checks, 0 errors; PWA `site.webmanifest` and 192x192 & 512x512 app icons deployed; React global `ErrorBoundary.tsx` wrapping `<App />`; security headers `Referrer-Policy: strict-origin-when-cross-origin` and `X-Content-Type-Options: nosniff`; GoatCounter preconnect/dns-prefetch; print media stylesheet `@media print` with clean paper/PDF layout; Schema.org `Organization` entity; open-source community guidelines `CONTRIBUTING.md`, `SECURITY.md`, and GitHub issue forms in `.github/ISSUE_TEMPLATE/`; automated QA gate integrated in `.github/workflows/deploy.yml`)
- Phase 33: PDF Preview Modal HTML5 Canvas (PDF.js) Rendering & Click/Scroll Isolation (PASS: replaced native iframe with Mozilla PDF.js `pdfjs-dist@4.10.38` HTML5 canvas rendering, eliminating mobile "Open" button placeholder; fixed title flexbox overflow with guaranteed controls margin; added backdrop dismissal and multi-layer scroll lock)
- Phase 34: Multi-Page Continuous Scroll, Full 2D Panning, Dynamic Viewport Zoom Lock & Native Pinch Zoom (PASS: implemented continuous vertical multi-page scroll with on-demand `IntersectionObserver` canvas rendering and bidirectional page navigation synchronization; enabled full 2D panning with `min-w-fit`, `overflow-x-auto overflow-y-auto`, and `touch-action: pan-x pan-y`; dynamic mobile viewport zoom lock dynamically injects `user-scalable=no, maximum-scale=1.0` during modal view and restores original viewport on close; native 2-touch pinch-to-zoom scaling; verified via Playwright mobile 375x667 and desktop 1280x800 tests)
- Phase 36: Modal History State Isolation & Back Swipe Navigation Interception (PASS: implemented history `pushState` and `popstate` trapping across `PdfPreviewModal.tsx`, `LegalModal.tsx`, and `Navbar.tsx` mobile drawers; back swipe gesture and browser back button close the open modal and are strictly isolated to modal dismissal, preserving the active page URL and scroll position; UI dismissal synchronizes history stack via `history.back()`; overscroll containment prevents gesture bleed; verified via Playwright across 4 test scenarios)
- Phase 37: Fix PDF Modal Immediate Self-Closure on Load & PDF.js Worker Transport Destruction (PASS: decoupled `numPages` and `scrollToPage` from history push/popstate `useEffect` dependency array using refs; locked effect dependencies strictly to `[document, onClose]`, eliminating premature `history.back()` self-closure on first click; added cancellation guards and suppressed expected worker transport destruction errors in `PdfPageItem`; verified via Playwright mobile 360x800 tests with 0 console errors, stable canvas rendering, and zero route drift)
- Phase 38: Comprehensive SEO Audit, Pre-Render Semantic Fallback & Organic Visibility Optimization for "Canonify" (PASS: diagnosed 6 root-cause ranking factors; injected rich static semantic HTML fallback inside `<div id="root">` with `<h1>`, brand positioning, and 50 Canonify keyword occurrences in raw HTML; eliminated `#` fragments from `sitemap.xml` generating clean 207-URL sitemap; updated default and dynamic meta descriptions to lead with "Canonify"; enhanced Schema.org JSON-LD structured data; added high-visibility Live Platform follow badge in `README.md`; verified via Playwright with 100% test pass)

## Verification Status
- Workspace inspection: PASS
- File validity audit: PASS (204/204 PDFs valid, 7/7 data files valid)
- Classification pipeline: PASS (211/211 documents classified, 100% confidence)
- Naming collisions: PASS (0 collisions across all 211 documents, zero `_vN` suffixes)
- Website display filtering: PASS (206 curated documents displayed; UP XLSX/CSV/JSON and Puducherry notice files hidden from catalog but 100% preserved in raw/normalized archive)
- Production build: PASS (0 TypeScript errors, bundle built into `website/dist/` in 3.38s with 21.45 KB pre-rendered HTML)
- Test suite: PASS (8/8 checks passed in `validate-links.mjs`)
- 7-Vector Privacy & Leak Audit: PASS (0 secrets, 0 machine paths, 0 private IPs, 0 unstripped source maps, 0 unredacted PII in code/manifests)
- Dependency Vulnerabilities: PASS (0 production runtime vulnerabilities via `npm audit --omit=dev`)
- PWA & Mobile Installability: PASS (`site.webmanifest` returns HTTP 200 `application/manifest+json`; `icon-192x192.png` [15.7 KB] & `icon-512x512.png` [113 KB] verified)
- React Runtime Resilience: PASS (`ErrorBoundary.tsx` wraps `<App />` with styled fallback UI, "Reload Page", and "Return to Home")
- Security & Network Headers: PASS (`Referrer-Policy`, `X-Content-Type-Options: nosniff`, and analytics preconnect/dns-prefetch declared in `index.html`)
- Print Media Stylesheet: PASS (`@media print` hides navigation chrome, theme toggles, search inputs, and download buttons; verified via Playwright)
- Schema.org Knowledge Graph: PASS (`WebSite`, `Organization`, and `DataCatalog` entities in JSON-LD `@graph`)
- Community Health Standards: PASS (`CONTRIBUTING.md`, `SECURITY.md`, and issue templates for missing documents & data corrections)
- Automated CI/CD Quality Gate: PASS (`node scripts/validate-links.mjs` runs prior to build & deployment in `.github/workflows/deploy.yml`)
- Dynamic Mobile Viewport Lock: PASS (`meta[name="viewport"]` set to `user-scalable=no, maximum-scale=1.0` during modal preview, restored to `width=device-width, initial-scale=1.0` on close)
- Continuous Multi-Page Scroll: PASS (Continuous vertical column with lazy rendering and synchronized step navigation)
- 2D Touch Panning & Zoom: PASS (Horizontal panning enabled at zoomed scale; pinch-to-zoom gesture scaling between 0.5x and 3.0x)
- Modal History State Isolation: PASS (Mobile back swipe and browser back navigation dismiss active modal overlays with 0 route drift)
- PDF Modal First-Click Opening & Transport Stability: PASS (Modal opens stably on the very first click, persists through document load, renders HTML5 canvas, and produces 0 `sendWithPromise` console errors)
- SEO Pre-Render & Protocol Compliance: PASS (Raw HTML serves 50 "Canonify" keyword mentions with `<h1>` and directory links; XML sitemap contains 207 valid canonical URLs with 0 fragments)

## Next Direction
- Phase 38 is COMPLETE and verified with 100% test pass.
- Dev server is running live on port **4157** (`task-3433`).
- Provide user with Google Search Console re-indexing and inspection instructions.
- Standing by on local `antigravity-dev` branch awaiting user instructions. Zero unrequested Git commands executed.


