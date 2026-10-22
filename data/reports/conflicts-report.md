# Phase 2 & 3: Normalization & Architecture Conflicts Report

**Execution Date:** 2026-10-22
**Total Source Documents Handled:** 211
**Integrity Verification:** 100% SHA-256 match confirmed across all copied files

## 1. Naming Collision Audit

**Collisions Encountered:** **0**

Every single document in the repository maps to a uniquely deterministic filename following the scheme:
`<Year>_<Region>_<DocumentType>_<Round>[_<QuotaCategory>][_<Qualifier>].<ext>`

## 2. Resolved Filename Anomalies

| Anomaly Category | Count | Resolution Strategy |
|---|---|---|
| **Missing File Extensions** | 11 | Appended canonical `.pdf` extension after verifying PDF 1.4-1.7 validity |
| **Embedded Newline Characters** | 3 | Sanitized in Tamil Nadu vacancy PDFs by replacing newlines with spaces and extracting clean publication dates |
| **Leading Whitespace Characters** | 5 | Trimmed leading and trailing spaces in Meghalaya allotment filenames |
| **Multi-Format Datasets** | 3 | Uttar Pradesh Round 1 & 2 allotment data retained in CSV, JSON, and XLSX with unified naming |

## 3. Empty Jurisdictions

- **Lakshadweep:** 0 medical colleges located in the UT; counselling documents handled via Central Pool / AIQ. Represented in `jurisdictions.json` with `hasDocuments: false` and `documentCount: 0`.

## 4. Verification Check

- `data/raw/`: 211 files copied with original filenames intact.
- `data/normalized/`: 211 files created with canonical normalized filenames.
- `data/reference/`: Authority table spreadsheet preserved.
- Zero original files in `./NEET UG 2026/` were deleted or altered.
