import fs from "fs";
import path from "path";

function copyFileSafe(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function generateHumanTitle(doc) {
  const parts = [];

  // Round label
  if (doc.counsellingRound && doc.counsellingRound !== "NotApplicable" && doc.counsellingRound !== "Unknown") {
    const roundLabels = {
      "Round1": "Round 1",
      "Round2": "Round 2",
      "Round3": "Round 3",
      "Round4": "Round 4",
      "Round1_Round2": "Round 1 & 2 Combined",
      "Combined": "Combined All Rounds",
      "MopUp": "Mop-Up Round",
      "StrayVacancy": "Stray Vacancy Round",
      "SpecialStray": "Special Stray Round",
      "SpotCounselling": "Spot Counselling"
    };
    parts.push(roundLabels[doc.counsellingRound] || doc.counsellingRound);
  }

  // Quota label
  if (doc.quotaCategory) {
    const quotaLabels = {
      "ManagementQuota": "Management Quota (MQ)",
      "TeluguMinorityQuota": "Telugu Minority Quota (MQT)",
      "CompetentAuthorityQuota": "Competent Authority Quota (CQ)",
      "GovernmentQuota": "Government Quota",
      "NRIQuota": "NRI Quota",
      "GovtSchool7.5Quota": "Govt School 7.5% Quota",
      "ExServicemenQuota": "Ex-Servicemen Quota",
      "SportsQuota": "Sports Quota",
      "PWDQuota": "PWD Quota",
      "MinorityQuota": "Minority Quota",
      "CentralPool": "Central Pool",
      "KeralaOriginQuota": "Kerala Origin Quota",
      "NCCQuota": "NCC Quota",
      "NorthEastQuota": "North East Quota",
      "AUArea": "Andhra University (AU) Area",
      "SVUArea": "SV University (SVU) Area",
      "StateWide": "State-Wide Institutions (SWI)",
      "GeneralQuota": "General Quota",
      "SCQuota": "SC Quota",
      "BTQuota": "Backward Tribe (BT) Quota",
      "EWSQuota": "EWS Quota",
      "OBCQuota": "OBC Quota",
      "MBCQuota": "MBC Quota",
      "BCMQuota": "BC Muslim Quota",
      "EBCQuota": "EBC Quota",
      "FreedomFighterQuota": "Freedom Fighter Quota",
      "GovtSchoolQuota": "Govt School Students Quota",
      "ManagementTransferQuota": "Management Quota Transfer (MQT)",
      "DualNativityRemoved": "Dual Nativity Removed Candidates"
    };
    parts.push(quotaLabels[doc.quotaCategory] || doc.quotaCategory);
  }

  // Category name
  const catLabels = {
    "Allotment": "Seat Allotment Result",
    "MeritList": "Merit List",
    "SeatMatrix": "Seat Matrix",
    "Analysis": "Cutoffs & Allotment Analysis",
    "CounsellingNotice": "Official Notice",
    "Info": "Colleges Directory / Info",
    "InformationBulletin": "Information Bulletin",
    "Other": "Reference Directory"
  };
  parts.push(catLabels[doc.documentCategory] || doc.documentCategory);

  // Qualifier
  if (doc.qualifier) {
    const qualLabels = {
      "Provisional": "(Provisional)",
      "Final": "(Final)",
      "Revised": "(Revised)",
      "AfterChanges": "(After Changes)",
      "OpeningClosingRanks": "Cutoffs (Opening & Closing Ranks)",
      "PaSangma": "- PA Sangma Medical College",
      "NEIGRIHMS": "- NEIGRIHMS",
      "PacificMed": "- Pacific Medical College",
      "AdditionalSeats_PacificMed_08-09-2026": "(Pacific Medical College - Additional Seats, 08-09-2026)",
      "GGSIPU": "- IP University",
      "Cutoffs": "(Opening & Closing Ranks)",
      "GGSIPU_Cutoffs": "- IP University (Cutoffs)",
      "CollegesList": "(Participating Colleges List)",
      "ContactInfo": "(Colleges Contact Directory)",
      "ReservationCalc": "Reservation Calculation",
      "DualNativityRemoved": "Dual Nativity Removed List",
      "Final_Consolidated": "(Final Consolidated All Rounds)",
      "Consolidated": "(Consolidated All Rounds)",
      "Phase1": "(Phase 1)",
      "Phase2": "(Phase 2)",
      "Phase2_Part1": "(Phase 2 - Part 1)",
      "Phase2_Part2": "(Phase 2 - Part 2)",
      "NAMO_MERI": "- NAMO MERI",
      "CompleteAnalysis": "(Complete Analysis & Cutoffs)",
      "Domicile": "(Domicile Selection List)",
      "EligibilityCriteria": "- Eligibility Criteria",
      "AdditionalSeats": "Additional MBBS Seats Notice",
      "Eligible": "(Eligible Candidates)",
      "NonEligible": "(Non-Eligible Candidates)",
      "BVSc_AH": "(BVSc & AH)"
    };
    parts.push(qualLabels[doc.qualifier] || `(${doc.qualifier.replace(/_/g, " ")})`);
  }

  return `${doc.jurisdictionDisplayName} ${parts.join(" ")}`.trim();
}

export function compareDocuments(a, b) {
  // 1. Primary Sort: Document Category
  // Allotments first, Merit Lists next, Seat Matrices third, Analysis fourth, Notices fifth, Info sixth, Bulletins seventh, Other last
  const categoryRank = {
    "Allotment": 1,
    "MeritList": 2,
    "SeatMatrix": 3,
    "Analysis": 4,
    "CounsellingNotice": 5,
    "Info": 6,
    "InformationBulletin": 7,
    "Other": 8
  };
  const catA = categoryRank[a.documentCategory] || 99;
  const catB = categoryRank[b.documentCategory] || 99;
  if (catA !== catB) return catA - catB;

  // 2. Secondary Sort: Counselling Round
  // Round 1, Round 2, Round 3, Round 4, Round 1 & 2 Combined, Combined All Rounds, Mop-Up, Stray, Special Stray, Spot, NotApplicable
  const roundRank = {
    "Round1": 1,
    "Round2": 2,
    "Round3": 3,
    "Round4": 4,
    "Round1_Round2": 5,
    "Combined": 6,
    "MopUp": 7,
    "StrayVacancy": 8,
    "SpecialStray": 9,
    "SpotCounselling": 10,
    "NotApplicable": 11
  };
  const roundA = roundRank[a.counsellingRound] || 99;
  const roundB = roundRank[b.counsellingRound] || 99;
  if (roundA !== roundB) return roundA - roundB;

  // 3. Tertiary Sort: Quota Preference (State/CQ/Govt first, Management second, NRI third, then Special Categories)
  const quotaRank = (q) => {
    if (!q) return 1;
    if (/CompetentAuthority|Government|General|AUArea|SVUArea|StateWide/i.test(q)) return 2;
    if (/Management/i.test(q)) return 3;
    if (/NRI/i.test(q)) return 4;
    return 5;
  };
  const qA = quotaRank(a.quotaCategory);
  const qB = quotaRank(b.quotaCategory);
  if (qA !== qB) return qA - qB;

  // 4. Alphabetical title / filename tie-break
  return (a.title || a.filename).localeCompare(b.title || b.filename);
}

export function runGenerateCatalog() {
  console.log("Starting Phase 6: Catalog Generation and Document Asset Sync...");

  // Load Inventory & Jurisdictions
  const inventory = JSON.parse(fs.readFileSync("data/metadata/document-inventory.json", "utf8"));
  const jurisdictions = JSON.parse(fs.readFileSync("data/metadata/jurisdictions.json", "utf8"));
  const authorities = JSON.parse(fs.readFileSync("data/metadata/authorities.json", "utf8"));

  const authBySlug = {};
  authorities.forEach(a => authBySlug[a.slug] = a);

  // Destination folders - clean old webDocRoot to prevent stale files
  const webDocRoot = "website/public/documents";
  if (fs.existsSync(webDocRoot)) {
    fs.rmSync(webDocRoot, { recursive: true, force: true });
  }
  fs.mkdirSync(webDocRoot, { recursive: true });

  const catalogDocs = [];
  let copiedCount = 0;

  // Display filtering: exclude raw CSV/JSON or removed notice files per user instructions
  const displayInventory = inventory.filter(doc => !doc.excludeFromWebsite);
  console.log(`Filtering for website catalog: ${displayInventory.length} of ${inventory.length} documents will be displayed.`);

  for (const doc of displayInventory) {
    let folderType = "states";
    if (doc.jurisdictionType === "All India") folderType = "all-india";
    else if (doc.jurisdictionType === "Union Territory") folderType = "union-territories";

    const normalizedPath = doc.proposedDestinationPath;
    const publicRelativeUrl = `documents/${folderType}/${doc.jurisdictionSlug}/${path.basename(normalizedPath)}`;
    const publicDestPath = path.join("website/public", publicRelativeUrl);

    if (fs.existsSync(normalizedPath)) {
      copyFileSafe(normalizedPath, publicDestPath);
      copiedCount++;
    }

    // Check if a companion converted PDF exists for tabular datasets
    let companionPdfUrl = null;
    let companionPdfSize = null;
    if (doc.detectedType !== "pdf") {
      const companionPdfPath = path.join(path.dirname(normalizedPath), path.basename(normalizedPath, path.extname(normalizedPath)) + ".pdf");
      if (fs.existsSync(companionPdfPath)) {
        const companionPublicUrl = `documents/${folderType}/${doc.jurisdictionSlug}/${path.basename(companionPdfPath)}`;
        const companionDestPath = path.join("website/public", companionPublicUrl);
        copyFileSafe(companionPdfPath, companionDestPath);
        companionPdfUrl = companionPublicUrl;
        const compStat = fs.statSync(companionPdfPath);
        companionPdfSize = (compStat.size / (1024 * 1024)).toFixed(2) + " MB";
      }
    }

    const auth = authBySlug[doc.jurisdictionSlug] || {};

    catalogDocs.push({
      id: doc.id,
      title: generateHumanTitle(doc),
      academicYear: doc.academicYear,
      canonicalJurisdiction: doc.canonicalJurisdiction,
      jurisdictionName: doc.jurisdictionDisplayName,
      jurisdictionSlug: doc.jurisdictionSlug,
      jurisdictionType: doc.jurisdictionType,
      documentCategory: doc.documentCategory,
      counsellingRound: doc.counsellingRound,
      quotaCategory: doc.quotaCategory,
      qualifier: doc.qualifier,
      filename: path.basename(normalizedPath),
      publicUrl: publicRelativeUrl,
      format: doc.detectedType,
      fileSizeHuman: doc.fileSizeHuman,
      fileSizeBytes: doc.fileSizeBytes,
      pageCount: doc.pageCount,
      rowCount: doc.rowCount,
      sha256: doc.sha256,
      previewable: doc.detectedType === "pdf" || companionPdfUrl !== null,
      companionPdfUrl,
      companionPdfSize,
      counsellingAuthority: doc.counsellingAuthority || auth.authorityName || "State Counselling Authority",
      officialWebsiteUrl: doc.officialSourceUrl || auth.officialWebsiteUrl || "",
      allOfficialLinks: auth.allOfficialLinks || [],
      authorities: auth.authorities || []
    });
  }

  // Pre-sort all documents using the canonical hierarchical comparator
  catalogDocs.sort(compareDocuments);

  // Sync jurisdiction stats to exact website display counts
  const catalogJurisdictions = jurisdictions.map(j => {
    const docs = catalogDocs.filter(d => d.jurisdictionSlug === j.slug);
    const availableCategories = Array.from(new Set(docs.map(d => d.documentCategory))).sort();
    const roundsAvailable = Array.from(new Set(docs.map(d => d.counsellingRound))).sort();
    const totalSizeBytes = docs.reduce((acc, d) => acc + (d.fileSizeBytes || 0), 0);
    return {
      ...j,
      documentCount: docs.length,
      totalSizeBytes,
      availableCategories,
      roundsAvailable,
      hasDocuments: docs.length > 0
    };
  });

  // Build the complete catalogue JSON
  const catalog = {
    academicYear: "2026",
    metadata: {
      title: "NEET UG Counselling Document Repository",
      description: "Static discovery and hosting platform for NEET UG counselling documents across MCC and 36 States/UTs.",
      generatedAt: new Date().toISOString(),
      totalDocuments: catalogDocs.length,
      totalJurisdictions: catalogJurisdictions.length
    },
    jurisdictions: catalogJurisdictions,
    documents: catalogDocs
  };

  // Write catalog to website/src/data/catalog.json
  fs.mkdirSync("website/src/data", { recursive: true });
  fs.writeFileSync("website/src/data/catalog.json", JSON.stringify(catalog, null, 2), "utf8");
  console.log(`Wrote website/src/data/catalog.json with ${catalogDocs.length} sorted documents.`);
  console.log(`Synced ${copiedCount} publication documents into website/public/documents/`);
}

runGenerateCatalog();
