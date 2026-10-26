# Canonify — NEET Counselling Files Directory (2026)

[![Official Live Platform](https://img.shields.io/badge/Live_Platform-Canonify-4c3f6b?style=for-the-badge&logo=googlechrome&logoColor=white)](https://deekshithvodela.github.io/Canonify/)
[![GitHub License](https://img.shields.io/badge/License-MIT-322e45?style=for-the-badge)](LICENSE)
[![Documents Archived](https://img.shields.io/badge/Documents-206%20Verified-5e4d84?style=for-the-badge)](https://deekshithvodela.github.io/Canonify/)

> **Official Live Web Platform:** [**https://deekshithvodela.github.io/Canonify/**](https://deekshithvodela.github.io/Canonify/) — Explore official NEET UG counselling documents, seat allotments, and merit lists across MCC and 36 States/UTs.

Canonify is an archival and discovery index of official seat allotment results, state merit lists, vacancy seat matrices, and counselling schedules collected directly from the Medical Counselling Committee (MCC) and state/UT admissions authorities across India.

The platform provides a clean, navigable directory of official counselling documents, inspired by the information architecture and profile layout of MyAnimeList, with an antique/scholar reading palette, dark mode support, and hierarchical sitemap discovery.

---

## 1. Repository Architecture & Layout

The project follows a strict separation of concerns among raw source data, normalized assets, metadata catalogues, automation pipelines, and website code:

```text
neet-ug-counselling/
├── README.md                      # Complete project documentation and maintenance guide
├── PROJECT_STATE.md               # Persistent project context, milestones, and semantic state
├── package.json                   # Root orchestrator scripts (classify, normalize, build, validate)
├── .gitignore                     # Git ignore rules for node_modules, logs, and scratch caches
│
├── data/
│   ├── raw/                       # Immutable store of original source files (never modified)
│   │   ├── all-india/
│   │   ├── states/
│   │   └── union-territories/
│   │
│   ├── reference/                 # Baseline authority lookup table
│   │   └── NEET UG Counselling authority table.xlsx
│   │
│   ├── normalized/                # Normalized files adhering to canonical naming convention
│   │   ├── all-india/
│   │   ├── states/
│   │   └── union-territories/
│   │
│   ├── metadata/                  # Machine-readable inventories and registries
│   │   ├── document-inventory.json # Master JSON inventory (207 documents with full metadata)
│   │   ├── document-inventory.csv  # Flat tabular CSV export of master inventory
│   │   ├── authorities.json        # 36 official counselling authorities with portal links
│   │   ├── jurisdictions.json      # 36 canonical jurisdictions with category indicators
│   │   └── file-mapping.json       # Exact mapping of original paths to normalized paths
│   │
│   └── reports/                   # Human-readable audit, classification, and QA reports
│       ├── audit-report.md         # Phase 0 workspace discovery and safety audit
│       ├── classification-report.md # Phase 1 classification and inventory report
│       ├── conflicts-report.md     # Phase 2 normalization & collision resolution report
│       ├── conversion-report.md    # Phase 4 PDF conversion and publication report
│       └── qa-report.md            # Phase 7 link integrity and data validation report
│
├── scripts/                       # Reusable Node.js ESM automation pipelines
│   ├── classify-files.mjs         # Extracts text/metadata, categorizes files, audits collisions
│   ├── normalize-filenames.mjs    # Populates data/raw and data/normalized, builds file-mapping
│   ├── convert-to-pdf.mjs         # Headless LibreOffice spreadsheet to PDF converter
│   ├── generate-catalog.mjs       # Populates website/src/data/catalog.json and public assets
│   └── validate-links.mjs         # Comprehensive 8-point QA and link verification suite
│
└── website/                       # Static React + Vite + TypeScript + Tailwind CSS web app
    ├── package.json               # Frontend dependencies and build config
    ├── vite.config.ts             # Relative base configuration for GitHub Pages
    ├── tailwind.config.js         # MAL-inspired color tokens and design rules
    ├── index.html                 # HTML shell with SEO meta tags and Inter typography
    ├── public/
    │   └── documents/             # Production static assets served to users
    │       ├── all-india/
    │       ├── states/
    │       └── union-territories/
    └── src/
        ├── types.ts               # TypeScript data models and interfaces
        ├── main.tsx               # React application entrypoint
        ├── App.tsx                # Hash-router and layout controller
        ├── index.css              # Global styles and MAL UI tokens
        ├── components/            # Reusable Navbar, Footer, DocumentCard, PdfPreviewModal
        ├── pages/                 # HomePage, JurisdictionDirectoryPage, JurisdictionProfilePage, AuthoritiesPage
        └── data/
            └── catalog.json       # Production web catalog generated from metadata
```

---

## 2. Document Naming Convention

All normalized documents conform to the following deterministic format:

```text
<AcademicYear>_<CanonicalRegion>_<DocumentType>_<Round>[_<QuotaCategory>][_<Qualifier>].<ext>
```

### Examples
- `2026_AllIndia_Allotment_Round1.pdf`
- `2026_AllIndia_Allotment_StrayVacancy.pdf`
- `2026_AndhraPradesh_Allotment_Round1_CompetentAuthorityQuota.pdf`
- `2026_AndhraPradesh_Allotment_Round1_NRIQuota.pdf`
- `2026_Assam_Allotment_Round1.pdf`
- `2026_Kerala_Allotment_SpecialStray_Phase2_Part1.pdf`
- `2026_TamilNadu_SeatMatrix_NotApplicable_GovernmentQuota_13-08-2026.pdf`
- `2026_UttarPradesh_Allotment_Round1_Round2_CompleteAnalysis.xlsx`

### Vocabulary & Fields
- **`AcademicYear`**: 4-digit intake year (e.g. `2026`).
- **`CanonicalRegion`**: CamelCase jurisdiction identifier (e.g. `AllIndia`, `AndhraPradesh`, `TamilNadu`).
- **`DocumentType`**: `Allotment` | `MeritList` | `SeatMatrix` | `CounsellingNotice` | `InformationBulletin` | `Other`.
- **`Round`**: `Round1` | `Round2` | `Round3` | `Round4` | `Round1_Round2` | `MopUp` | `StrayVacancy` | `SpecialStray` | `SpotCounselling` | `NotApplicable`.
- **`QuotaCategory`**: Optional stream indicator (e.g. `ManagementQuota`, `NRIQuota`, `GovtSchool7.5Quota`, `NCCQuota`, `CentralPool`, `AUArea`, `SVUArea`).
- **`Qualifier`**: Optional version/date identifier (e.g. `Provisional`, `Final`, `AfterChanges`, `OpeningClosingRanks`, `13-08-2026`).

---

## 3. Metadata Schema

Every document in `data/metadata/document-inventory.json` contains:

```json
{
  "id": "2026-all-india-2026_allindia_allotment_round1",
  "academicYear": "2026",
  "jurisdictionType": "All India",
  "canonicalJurisdiction": "AllIndia",
  "jurisdictionDisplayName": "All India Quota",
  "jurisdictionSlug": "all-india",
  "originalFilename": "All India Quota Round 1.pdf",
  "originalRelativePath": "NEET UG 2026/All India Quota/All India Quota Round 1.pdf",
  "originalExtension": ".pdf",
  "detectedType": "pdf",
  "mimeType": "application/pdf",
  "fileSizeBytes": 9122340,
  "fileSizeHuman": "8.70 MB",
  "sha256": "4b68ba2f58e4e94e5058a8f152d512a208c9096773df4d2ec8a7e025f190e241",
  "pageCount": 115,
  "sheetInfo": null,
  "rowCount": null,
  "documentCategory": "Allotment",
  "counsellingRound": "Round1",
  "quotaCategory": null,
  "qualifier": null,
  "counsellingAuthority": "Medical Counselling Committee (MCC), DGHS",
  "officialSourceUrl": "https://mcc.nic.in/ug-medical-counselling/",
  "proposedNormalizedFilename": "2026_AllIndia_Allotment_Round1.pdf",
  "proposedDestinationPath": "data/normalized/all-india/all-india/2026_AllIndia_Allotment_Round1.pdf",
  "classificationConfidence": "High",
  "textSnippet": "NEET-UG Counselling Seats Allotment -2026 Round- 1...",
  "notes": ""
}
```

---

## 4. Automation Commands & Workflows

All commands can be executed from the repository root via npm:

| Command | Description |
|---|---|
| `npm run classify` | Scans raw folders, extracts PDF/table metadata, and updates `document-inventory.json` |
| `npm run normalize` | Safely populates `data/raw/` and `data/normalized/`, generating `file-mapping.json` |
| `npm run convert` | Converts spreadsheets and CSVs to PDFs via headless LibreOffice |
| `npm run catalog` | Syncs assets to `website/public/documents/` and generates `website/src/data/catalog.json` |
| `npm run build:web` | Builds the optimized production static bundle in `website/dist/` |
| `npm run dev:web` | Starts the local Vite development server for live preview |
| `npm run validate` | Runs the full 8-point link integrity and SHA-256 data verification test suite |
| `npm run pipeline` | Executes the entire pipeline end-to-end idempotently |

---

## 5. Adding New Documents

To add new documents (e.g. Round 4 Stray vacancy results or next year's notices):

1. **Place raw source files** in the corresponding state/UT folder in `data/raw/` (or `./NEET UG 2026/`).
2. **Run classification:**
   ```bash
   npm run classify
   ```
3. **Review classification report:**
   Inspect `data/reports/classification-report.md` to ensure category and round were accurately assigned. If any file is flagged with medium confidence, review the qualifier or round in `scripts/classify-files.mjs`.
4. **Run the pipeline:**
   ```bash
   npm run pipeline
   ```
5. **Verify:**
   `npm run validate` will confirm 100% link resolution and zero collisions.

---

## 6. GitHub Pages Deployment

The website is configured specifically for static web hosting platforms such as GitHub Pages:

- **Relative Asset Base:** `vite.config.ts` uses `base: './'` so that all assets, icons, and documents work regardless of repository name or domain subpath.
- **Hash-Based Deep Linking:** Uses URL hashes (e.g. `#/jurisdiction/telangana`, `#/authorities`) so that reloading pages or sharing direct links does not cause HTTP 404 errors on static hosts.
- **Self-Contained Build:** Running `npm run build:web` produces `website/dist/` containing `index.html`, all JavaScript and CSS assets, and all 212 published documents in `website/dist/documents/`.

### Deployment Steps
1. Build the production site:
   ```bash
   npm run build:web
   ```
2. Deploy the contents of `website/dist/` to the `gh-pages` branch or configure GitHub Actions to deploy from the `website/dist` directory.

---

## 7. Current Scope & Known Characteristics

- **Scope:** Document discovery, search, profile viewing, and direct downloads. College prediction, personal allotment analysis, and student rank lookups are deliberately excluded in accordance with the project specification.
- **Lakshadweep:** Lakshadweep has 0 medical colleges within the island territory. Candidates receive seat allocations through Central Pool reservation seats, Domicile quota lists, and seats reserved for candidates of Kerala origin.
- **Uttar Pradesh Allotment Table:** The comprehensive Uttar Pradesh Round 1 & 2 combined allotment dataset is provided in its native `.xlsx` workbook for fast analysis and filtering, along with a converted PDF rendition.

---

## 8. License & Public Records Notice

- **Software & Architecture:** The software code, pipelines, and website UI of Canonify are licensed under the [MIT License](LICENSE) &copy; 2026 Deekshith Vodela.
- **Documents & Public Records:** All admissions records, seat matrices, allotment lists, and notifications are public domain records issued by the respective statutory admissions authorities (MCC, DGHS, State/UT Medical Counselling Directorates).
- **Non-Official & Non-Impersonation Notice:** Canonify is an independent non-commercial informational document archive. Canonify is NOT an official government website, authority, or counselling body, and does NOT represent, impersonate, or act on behalf of the Medical Counselling Committee (MCC), DGHS, MoHFW, NMC, or any State/UT Medical Counselling & Admissions Authority. Canonify does not conduct seat allotments, registrations, fee collections, document verifications, or counselling operations.

