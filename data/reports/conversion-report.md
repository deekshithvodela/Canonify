# Phase 4: PDF Conversion and Publication Pipeline Report

**Execution Date:** 2026-10-22
**Converter Tool:** LibreOffice 25.2 Headless (`calc_pdf_Export`)

## 1. Converted Spreadsheets & Tabular Files

| Source File | Generated PDF | Pages | Output Size | Status | Recommended Publication Artifact |
|---|---|---|---|---|---|
| `2026_DadraNagarHaveliDamanDiu_MeritList_NotApplicable.csv` | `2026_DadraNagarHaveliDamanDiu_MeritList_NotApplicable.pdf` | **51** | 1.91 MB | **SUCCESS** | Publish PDF copy and original CSV format |
| `2026_DadraNagarHaveliDamanDiu_Allotment_Round1_NAMO_MERI.csv` | `2026_DadraNagarHaveliDamanDiu_Allotment_Round1_NAMO_MERI.pdf` | **9** | 0.29 MB | **SUCCESS** | Publish PDF copy and original CSV format |
| `2026_DadraNagarHaveliDamanDiu_Allotment_Round2.csv` | `2026_DadraNagarHaveliDamanDiu_Allotment_Round2.pdf` | **3** | 0.05 MB | **SUCCESS** | Publish PDF copy and original CSV format |
| `2026_DadraNagarHaveliDamanDiu_Allotment_Round3.csv` | `2026_DadraNagarHaveliDamanDiu_Allotment_Round3.pdf` | **3** | 0.12 MB | **SUCCESS** | Publish PDF copy and original CSV format |

## 2. Excluded from Direct Conversion

- `2026_UttarPradesh_Allotment_Round1_Round2.csv` & `2026_UttarPradesh_Allotment_Round1_Round2.json`: Excluded from separate duplicate PDF conversion because they contain the identical 14,653 allotment rows already converted from the master `.xlsx` workbook. Hosting raw `.csv` and `.json` preserves computational utility without bloating PDF storage.

## 3. Publication Policy Summary

1. **Native PDFs (200 documents):** Served directly via `website/public/documents/` with normalized filenames.
2. **Dadra & Nagar Haveli Documents:** Published in dual formats: user can view/preview the 3–51 page PDF or download the original CSV.
3. **Uttar Pradesh Allotment Master Data:** Primary download format is the high-performance native `.xlsx` and `.csv`. The 1,606-page PDF rendition is accessible with an explicit 50 MB file size indicator.
