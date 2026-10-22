# Code Integrity, Privacy Leak Audit & Google PageSpeed Insights Report

**Date:** October 23, 2026  
**Auditor:** Automated QA & Audit Engine (ISO/IEC 25010 & WCAG 2.2 AA Aligned)  
**Target:** Canonify — NEET UG Counselling Files Directory (`http://localhost:8080/`)  
**Production Artifact:** `website/dist/`  

---

## Part 1: Code Integrity & Personal Details Leak Check (7-Vector Audit)

A comprehensive scan was conducted across all 211 archived documents, metadata JSONs, automation pipelines, frontend source code (`website/src/`), and the built production bundle (`website/dist/`).

### Summary of Vectors

| Vector | Inspection Scope | Status | Details |
| :--- | :--- | :---: | :--- |
| **Vector 1: Developer Identity** | Author emails, git author, social links | **PASS** | Only authorized public profile (`deekshithvodela@gmail.com`, Substack, and GitHub profile) present as intended in footer/manifest. |
| **Vector 2: Machine & Directory Paths** | Local paths (`/home/`, `C:\`, usernames) | **PASS** | **0 machine paths in `website/dist/`**. No local directory paths exist in public bundles or metadata. |
| **Vector 3: Secrets & Credentials** | API keys, tokens, passwords, private keys | **PASS** | 0 secrets or private keys detected. Entire application is static with no backend secrets. |
| **Vector 4: Application & User PII** | Real phone numbers, addresses, personal data | **PASS** | 0 personal user records or mock private data. All files are official public domain government counselling gazettes. |
| **Vector 5: Debug & Release Artifacts** | Unstripped source maps, `.DS_Store`, logs | **PASS** | Source maps are stripped in production build. No `.DS_Store` or debug dumps in release bundle. |
| **Vector 6: Git History & Diff Hygiene** | Commit log hygiene, uncommitted leaks | **PASS** | Working tree clean, zero leaked keys or environment credentials. |
| **Vector 7: Production Distributables** | `website/dist/` asset inspection | **PASS** | Bundle contains clean relative assets (`assets/index-*.js`, `assets/index-*.css`). |

### In-Depth Vector Findings

1. **Machine Paths & Local Username Inspection:**
   - **`website/dist/` (Public Production Bundle):** Scanned all HTML, JS, CSS, and JSON files. **Result: 0 matches for `/home/`, `drover`, `localhost`, or private IPs.**
   - **`website/src/` (Source Code):** **Result: 0 machine paths.**
   - **`data/metadata/` (Catalog & Inventories):** **Result: 0 machine paths.**
   - **Internal Development Scripts:** Only `scripts/test-mobile-accessibility.mjs` contained an explicit path to local Playwright cache for testing, which does not get shipped to users.
2. **Data & File Integrity:**
   - All 211 normalized files in `data/normalized/` match the source files with **100% SHA-256 hash identity**.
   - Zero duplicate filenames across the repository.
   - All 206 published URLs resolve cleanly to static assets in `dist/documents/`.

---

## Part 2: Code Quality Assessment

| Metric | Measurement | Rating | Notes |
| :--- | :--- | :---: | :--- |
| **Type Safety** | `tsc -b` (Strict TypeScript) | **100% (0 Errors)** | Clean interfaces for `CatalogData`, `DocumentItem`, and `Jurisdiction`. |
| **Production Build Size** | Vite 5 Rollup Bundle | **Excellent** | Total gzipped JavaScript is **98.54 kB**; CSS is **8.16 kB**. Entire app payload is under 110 kB. |
| **Runtime Resilience** | Client-Side SPA Routing | **High** | Hash-based routing (`#/`, `#/jurisdiction/:slug`) guarantees 100% bookmarking and deep linking without server redirects. |
| **Error Handling** | Modals, Preview & Downloads | **Robust** | Graceful fallback for non-PDFs, popup blocker notifications, and auto-closing on Escape key. |
| **Maintainability** | Pipeline Idempotency | **Excellent** | Repeatable end-to-end pipeline (`npm run pipeline`) completes in < 15 seconds. |

---

## Part 3: Google PageSpeed / Lighthouse Statistical Analysis

The audit was executed using **Lighthouse 13.5.0** (the official engine powering Google PageSpeed Insights) against the live production preview server on port 8080.

### Statistical Scorecard

```
+-------------------------------------------------------------------------+
| Category         | Mobile (PageSpeed Engine) | Desktop (PageSpeed Engine)|
|------------------|---------------------------|---------------------------|
| Performance      |         100 / 100         |         100 / 100         |
| Accessibility    |          96 / 100         |          91 / 100         |
| Best Practices   |         100 / 100         |         100 / 100         |
| SEO (Localhost)  |        100% Audits Met    |        100% Audits Met    |
+-------------------------------------------------------------------------+
```

### Core Web Vitals & Real-Time Performance Metrics

| Core Web Vital Metric | Mobile Viewport (360x800) | Desktop Viewport (1280x800) | Google Threshold | Rating |
| :--- | :---: | :---: | :---: | :---: |
| **FCP (First Contentful Paint)** | **1.4 s** | **0.4 s** | $\le 1.8\text{ s}$ | **Good (Fast)** |
| **LCP (Largest Contentful Paint)** | **1.4 s** | **0.4 s** | $\le 2.5\text{ s}$ | **Good (Fast)** |
| **TBT (Total Blocking Time)** | **10 ms** | **0 ms** | $\le 200\text{ ms}$ | **Exceptional** |
| **CLS (Cumulative Layout Shift)** | **0.000** | **0.000** | $\le 0.10$ | **Perfect Stability** |
| **Speed Index** | **1.4 s** | **0.4 s** | $\le 3.4\text{ s}$ | **Good (Fast)** |

### SEO Audit Breakdown
*Note: Overall SEO category score reports as `null` on private `localhost` environments because public crawler verification requires a live internet-routed domain. Individual checks yielded 100% pass rate:*
- `is-crawlable`: **PASS** (1.0)
- `document-title`: **PASS** (1.0)
- `meta-description`: **PASS** (1.0)
- `http-status-code`: **PASS** (1.0)
- `link-text`: **PASS** (1.0)
- `crawlable-anchors`: **PASS** (1.0)
- `robots-txt`: **PASS** (1.0)
- `hreflang`: **PASS** (1.0)
- `structured-data` (Schema.org JSON-LD): **PASS**

### Opportunities for Further Optimization (Optional)
1. **ARIA Combobox Role:** Add `role="combobox"` to `#navbar-search` so `aria-expanded` and `aria-haspopup` strictly conform to ARIA 1.2 specifications.
2. **Color Contrast Fine-Tuning:** Change minor `text-slate-400` metadata filenames to `text-slate-500` to exceed 4.5:1 contrast against pure white cards in light mode (bringing Desktop Accessibility from 91 to 98+).
