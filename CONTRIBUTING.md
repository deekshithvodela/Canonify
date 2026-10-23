# Contributing to Canonify

Thank you for your interest in contributing to **Canonify**! This project is an open-access, public-interest archival index preserving official NEET UG counselling documents across MCC and all 36 Indian States and Union Territories.

---

## 🎯 How You Can Contribute

### 1. Reporting Missing Counselling Documents
State admissions authorities frequently update websites, publish spot counselling rounds, or release revised merit lists. If you find an official notification, merit list, seat matrix, or allotment PDF that is not yet archived in Canonify:
- Open a GitHub Issue using our **[Missing Document Template](https://github.com/deekshithvodela/Canonify/issues/new?template=missing_document.yml)**.
- Include:
  - State / Union Territory name
  - Counselling Round (e.g. Round 1, Round 2, Mop-Up, Stray Vacancy)
  - Document Category (Seat Allotment, Merit List, Seat Matrix, or Notice)
  - Direct link to the issuing state authority website

### 2. Reporting Data / Classification Corrections
If you notice:
- An incorrect round classification (e.g. Round 1 misclassified as Round 2)
- An incorrect quota tag (e.g. Management Quota tagged as Government Quota)
- An outdated official website URL for an admissions authority
- Please submit a report using our **[Data Correction Template](https://github.com/deekshithvodela/Canonify/issues/new?template=data_correction.yml)**.

### 3. Improving Code & Documentation
- Fix bugs in the React/TypeScript frontend.
- Optimize metadata parsing and classification scripts in `scripts/`.
- Enhance accessibility (WCAG 2.2 AA) or mobile responsiveness.

---

## 📋 Guidelines for Code and Document Contributions

1. **Original Public Domain Files Only:**
   - We only archive authentic, unedited public records issued directly by official government portals (MCC, DGHS, State Admissions Directorates).
   - Commercial watermarked PDFs, coaching institute scans, and unverified leaks are strictly excluded.
2. **Preserve Raw Integrity:**
   - Original source files are strictly immutable and preserved with their authentic SHA-256 hashes.
3. **Deterministic Filename Schema:**
   - `<Year>_<Region>_<DocumentType>_<Round>_<Qualifier>.<ext>`
4. **Automated QA Validation:**
   - Always run `npm run validate` and `npm run build:web` before opening a pull request to ensure 100% of links and catalog hashes pass.

---

## ⚖️ Code of Conduct
Please communicate respectfully and constructively. Canonify is built to help medical aspirants, parents, and researchers access verified admissions information without commercial exploitation.
