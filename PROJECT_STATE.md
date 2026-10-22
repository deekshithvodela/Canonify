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

## Verification Status
- Workspace inspection: PASS
- File validity audit: PASS (204/204 PDFs valid, 7/7 data files valid)
- Classification pipeline: PASS (211/211 documents classified, 100% confidence)
- Naming collisions: PASS (0 collisions across all 211 documents, zero `_vN` suffixes)
- Website display filtering: PASS (206 curated documents displayed; UP XLSX/CSV/JSON and Puducherry notice files hidden from catalog but 100% preserved in raw/normalized archive)
- Production build: PASS (0 TypeScript errors, bundle built into `website/dist/` in 2.61s)
- Test suite: PASS (8/8 checks passed in `validate-links.mjs`)
- GitHub File Limits Compliance: PASS (100% of files under 100 MB hard limit; single largest file is 47.77 MB, below 50 MB soft threshold)
- Repository Size Optimization: PASS (Website public documents in `website/public/documents/` are 100% tracked in Git so no links break; raw unorganized duplicates `NEET UG 2026/` and `data/raw/` are ignored in `.gitignore`, reducing tracked push size from 1.65 GB to 820.31 MB, comfortably under GitHub's 1 GB recommendation)
- Non-Official & Non-Impersonation Disclosure: PASS (Explicitly stated in `LegalModal.tsx`, `Footer.tsx`, and `README.md` that Canonify is NOT an official government website and does not represent or impersonate MCC, DGHS, or state authorities)
- Display sorting: PASS (Allotment -> MeritList -> SeatMatrix -> Analysis -> CounsellingNotice -> Info -> InformationBulletin -> Other)
- UP Allotment Native PDF: PASS (`2026_UttarPradesh_Allotment_Round1_Round2.pdf` served with modified 50,091,472 bytes / 127 pages, SHA-256 verified)
- AP NCC Quota Allotment: PASS (`2026_AndhraPradesh_Allotment_NotApplicable_NCCQuota.pdf` titled `Andhra Pradesh NCC Quota Seat Allotment Result` sorted under Allotment)
- Substack Newsletter Link: PASS (Footer button links directly to `https://deekshithvodela.substack.com/` with accessible label)
- Feedback Mailto: PASS (Configured with `mailto:deekshithvodela@gmail.com?subject=Canonify%20Feedback`)
- Image Color Palette: PASS (`#322e45` Midnight Plum Slate & `#4c3f6b` Amethyst Violet applied across light and dark themes)
- Default Theme: PASS (Default is unconditionally Light Mode on fresh load, dark mode only when explicitly saved in localStorage)
- C-Shaped Stethoscope Logo: PASS (Vector SVG rendered in Navbar, Footer, Modals, and Favicon)
- Typography: PASS (Georgia for headings, Helvetica/Arial for body text, system font stack with 0 external font latency)
- SEO & Accessibility: PASS (OpenGraph, Twitter cards, Schema.org JSON-LD, sitemap.xml, robots.txt, skip link, WCAG 2.2 AA contrast & focus visible)
- Desktop Header Layout: PASS (Row 1: Brand on left, Search bar in center, A- / A / A+ font adjuster, Star badge, Theme toggle on right; Row 2: Categories Sub-nav bar; 0 empty space, perfectly balanced)
- Mobile Header Layout: PASS (Row 1: Brand on left, Search icon beside Hamburger button on right; Row 2: A- / A / A+ text size adjuster on left, GitHub Star and Theme toggle on right; 0 horizontal overflow at 360px)
- Mobile Profile Ordering: PASS (State Info Box on top, followed by Search and Category/Round dropdowns, followed by Document Cards; vertical "Filter By Category" block hidden on mobile, visible on desktop)
- Accessibility Font Scaling: PASS (`A- / A / A+` government standard font scaling toggles root font size 90% / 100% / 112.5% with localStorage persistence and anti-flash support with strictly 360px width maintained)
- Modal Popups: PASS (PDF preview and legal modals lock body scroll, eliminating mobile background scroll shifts)

## Next Direction
- Repository and website are in production-ready state with live preview running on port 8080 (`http://localhost:8080/`). Ready for further user instructions or deployment.

