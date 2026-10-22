import fs from "fs";
import path from "path";
import crypto from "crypto";
import { execSync } from "child_process";

// 1. Canonical Jurisdiction Information
export const JURISDICTION_META = {
  "All India Quota": { canonical: "AllIndia", displayName: "All India Quota", type: "All India", slug: "all-india" },
  "Andaman and Nicobar Islands": { canonical: "AndamanNicobar", displayName: "Andaman and Nicobar Islands", type: "Union Territory", slug: "andaman-and-nicobar" },
  "AndhraPradesh": { canonical: "AndhraPradesh", displayName: "Andhra Pradesh", type: "State", slug: "andhra-pradesh" },
  "Arunachal Pradesh": { canonical: "ArunachalPradesh", displayName: "Arunachal Pradesh", type: "State", slug: "arunachal-pradesh" },
  "Assam": { canonical: "Assam", displayName: "Assam", type: "State", slug: "assam" },
  "Bihar": { canonical: "Bihar", displayName: "Bihar", type: "State", slug: "bihar" },
  "Chandigarh": { canonical: "Chandigarh", displayName: "Chandigarh", type: "Union Territory", slug: "chandigarh" },
  "Chhattisgarh": { canonical: "Chhattisgarh", displayName: "Chhattisgarh", type: "State", slug: "chhattisgarh" },
  "Dadra and Nagar Haveli and Daman and Diu": { canonical: "DadraNagarHaveliDamanDiu", displayName: "Dadra and Nagar Haveli and Daman and Diu", type: "Union Territory", slug: "dadra-and-nagar-haveli-and-daman-and-diu" },
  "Delhi": { canonical: "Delhi", displayName: "Delhi", type: "Union Territory", slug: "delhi" },
  "Goa": { canonical: "Goa", displayName: "Goa", type: "State", slug: "goa" },
  "Gujarat": { canonical: "Gujarat", displayName: "Gujarat", type: "State", slug: "gujarat" },
  "Haryana": { canonical: "Haryana", displayName: "Haryana", type: "State", slug: "haryana" },
  "Himachal Pradesh": { canonical: "HimachalPradesh", displayName: "Himachal Pradesh", type: "State", slug: "himachal-pradesh" },
  "Jammu": { canonical: "JammuKashmir", displayName: "Jammu and Kashmir", type: "Union Territory", slug: "jammu-and-kashmir" },
  "Jharkhand": { canonical: "Jharkhand", displayName: "Jharkhand", type: "State", slug: "jharkhand" },
  "Karnataka": { canonical: "Karnataka", displayName: "Karnataka", type: "State", slug: "karnataka" },
  "Kerala": { canonical: "Kerala", displayName: "Kerala", type: "State", slug: "kerala" },
  "Lakshadweep": { canonical: "Lakshadweep", displayName: "Lakshadweep", type: "Union Territory", slug: "lakshadweep" },
  "Madhya Pradesh": { canonical: "MadhyaPradesh", displayName: "Madhya Pradesh", type: "State", slug: "madhya-pradesh" },
  "Maharashtra": { canonical: "Maharashtra", displayName: "Maharashtra", type: "State", slug: "maharashtra" },
  "Manipur": { canonical: "Manipur", displayName: "Manipur", type: "State", slug: "manipur" },
  "Meghalaya": { canonical: "Meghalaya", displayName: "Meghalaya", type: "State", slug: "meghalaya" },
  "Mizoram": { canonical: "Mizoram", displayName: "Mizoram", type: "State", slug: "mizoram" },
  "Nagaland": { canonical: "Nagaland", displayName: "Nagaland", type: "State", slug: "nagaland" },
  "Odisha": { canonical: "Odisha", displayName: "Odisha", type: "State", slug: "odisha" },
  "Puducherry": { canonical: "Puducherry", displayName: "Puducherry", type: "Union Territory", slug: "puducherry" },
  "Punjab": { canonical: "Punjab", displayName: "Punjab", type: "State", slug: "punjab" },
  "Rajasthan": { canonical: "Rajasthan", displayName: "Rajasthan", type: "State", slug: "rajasthan" },
  "Sikkim": { canonical: "Sikkim", displayName: "Sikkim", type: "State", slug: "sikkim" },
  "Tamilnadu": { canonical: "TamilNadu", displayName: "Tamil Nadu", type: "State", slug: "tamil-nadu" },
  "Telangana": { canonical: "Telangana", displayName: "Telangana", type: "State", slug: "telangana" },
  "Tripura": { canonical: "Tripura", displayName: "Tripura", type: "State", slug: "tripura" },
  "Uttar Pradesh": { canonical: "UttarPradesh", displayName: "Uttar Pradesh", type: "State", slug: "uttar-pradesh" },
  "Uttarakhand": { canonical: "Uttarakhand", displayName: "Uttarakhand", type: "State", slug: "uttarakhand" },
  "West Bengal": { canonical: "WestBengal", displayName: "West Bengal", type: "State", slug: "west-bengal" }
};

function decodeXml(str) {
  if (!str) return "";
  return str
    .replace(/&#10;/g, "\n")
    .replace(/&#xA;/gi, "\n")
    .replace(/&#13;/g, "\r")
    .replace(/&#xD;/gi, "\r")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

// 2. Extract Authority Table from XLSX
export function extractAuthorityTable(xlsxPath) {
  const sXml = execSync(`unzip -p "${xlsxPath.replace(/"/g, '\\"')}" xl/sharedStrings.xml`, { encoding: "utf8" });
  const strings = [...sXml.matchAll(/<si>(?:(?!<\/si>).)*?<\/si>/gs)].map(si => {
    const parts = [...si[0].matchAll(/<t[^>]*>([^<]*)<\/t>/g)].map(m => m[1]);
    return decodeXml(parts.join(""));
  });

  const sheetXml = execSync(`unzip -p "${xlsxPath.replace(/"/g, '\\"')}" xl/worksheets/sheet1.xml`, { encoding: "utf8" });
  const rows = [...sheetXml.matchAll(/<row[^>]*>(.*?)<\/row>/gs)];

  const authoritiesByRegion = {};
  const authoritiesList = [];

  rows.slice(1).forEach(r => {
    const cells = [...r[1].matchAll(/<c\s+([^>]+)>(?:<v>([^<]+)<\/v>)?<\/c>/gs)];
    const rowObj = {};
    cells.forEach(c => {
      const attrs = c[1];
      const val = c[2];
      const rMatch = attrs.match(/r="([A-Z]+)\d+"/);
      const tMatch = attrs.match(/t="([^"]+)"/);
      if (!rMatch) return;
      const col = rMatch[1];
      const type = tMatch ? tMatch[1] : null;
      let resolved = val;
      if (type === "s" && val !== undefined) {
        resolved = strings[parseInt(val, 10)];
      }
      rowObj[col] = (resolved || "").trim();
    });

    if (rowObj.A) {
      const regionName = rowObj.A.trim();
      const rawLinkStr = decodeXml(rowObj.B || "");
      const rawAuthStr = decodeXml(rowObj.C || "");

      // Split raw links by newlines or commas
      const cleanLinks = rawLinkStr
        .split(/[\r\n,]+/)
        .map(s => s.trim().replace(/[);]+$/, ""))
        .filter(s => s.startsWith("http"));

      let authorityName = rawAuthStr.replace(/[\r\n]+/g, " & ").trim();
      let primaryLink = cleanLinks[0] || "";
      let authorities = [];

      // Jurisdiction-specific multi-authority entity modeling
      const regLower = regionName.toLowerCase();
      if (regLower.includes("delhi")) {
        authorityName = "Medical Counselling Committee (MCC) & Guru Gobind Singh Indraprastha University (GGSIPU)";
        primaryLink = "https://mcc.nic.in/ug-medical-counselling/";
        authorities = [
          { name: "Medical Counselling Committee (MCC)", url: "https://mcc.nic.in/ug-medical-counselling/", role: "Central Universities (LHMC, MAMC, UCMS, ABVIMS)" },
          { name: "Guru Gobind Singh Indraprastha University (GGSIPU)", url: "https://www.ipu.ac.in/adm2026/adm2026main.php", role: "State Quota & IPU Affiliated Colleges" }
        ];
      } else if (regLower.includes("meghalaya")) {
        authorityName = "Department of Health & Family Welfare (Meghalaya) & NEIGRIHMS";
        primaryLink = "https://meghealth.gov.in/dhs_mi_director.html";
        authorities = [
          { name: "Department of Health and Family Welfare, Government of Meghalaya", url: "https://meghealth.gov.in/dhs_mi_director.html", role: "State Quota & PA Sangma Medical College" },
          { name: "North Eastern Indira Gandhi Regional Institute of Health & Medical Sciences (NEIGRIHMS)", url: "https://neigrihms.gov.in/#", role: "Autonomous Institute Seats" }
        ];
      } else if (regLower.includes("sikkim")) {
        authorityName = "Directorate of Technical Education (Sikkim) & Sikkim Manipal University (SMU)";
        primaryLink = "https://education.sikkim.gov.in/GeneralSection/StateQuotaSeatsForCounsellingDetails.aspx";
        authorities = [
          { name: "Directorate of Technical Education, Education Department, Sikkim", url: "https://education.sikkim.gov.in/GeneralSection/StateQuotaSeatsForCounsellingDetails.aspx", role: "State Quota Counselling" },
          { name: "Sikkim Manipal University (SMU) / SMIMS", url: "https://www.smu.edu.in/", role: "Management Quota & University Admissions" }
        ];
      } else if (regLower.includes("uttarakhand")) {
        authorityName = "Hemwati Nandan Bahuguna Uttarakhand Medical Education University (HNBUMU)";
        primaryLink = "https://www.hnbumu.ac.in/#";
        authorities = [
          { name: "Hemwati Nandan Bahuguna Uttarakhand Medical Education University (HNBUMU)", url: "https://www.hnbumu.ac.in/#", role: "Official University Website" },
          { name: "HNBUMU NEET UG Candidate Counselling Portal", url: "https://meta-secure.com/HNBUMU_NEETUG", role: "Online Allotment System" }
        ];
      } else if (regLower.includes("kerala")) {
        authorityName = "Office of the Commissioner for Entrance Examinations (CEE), Kerala";
        primaryLink = "https://cee.kerala.gov.in/keam2026/allotlist";
        authorities = [
          { name: "Office of the Commissioner for Entrance Examinations (CEE), Kerala", url: "https://cee.kerala.gov.in/keam2026/allotlist", role: "State Medical Counselling (KEAM)" }
        ];
      } else if (regLower.includes("manipur")) {
        authorityName = "Directorate of Health Services / Directorate of Medical Education (Manipur Medical e-Counselling)";
        primaryLink = "https://manipurmc.mn.gov.in/";
        authorities = [
          { name: "Directorate of Health Services / Directorate of Medical Education, Manipur", url: "https://manipurmc.mn.gov.in/", role: "Manipur Medical e-Counselling" }
        ];
      } else {
        authorities = cleanLinks.map((url, i) => ({
          name: i === 0 ? authorityName : `${authorityName} (Alternative Portal)`,
          url
        }));
        if (authorities.length === 0 && primaryLink) {
          authorities = [{ name: authorityName, url: primaryLink }];
        }
      }

      const item = {
        region: regionName,
        authorityName,
        primaryLink,
        allLinks: authorities.map(a => a.url),
        authorities,
        rawLink: rowObj.B || ""
      };
      authoritiesByRegion[regionName.toLowerCase()] = item;
      authoritiesList.push(item);
    }
  });

  return { authoritiesByRegion, authoritiesList };
}

// 3. File Discovery & Inspection Helpers
function walkSync(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(walkSync(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function inspectPdf(filePath) {
  let pages = null;
  let metadata = {};
  let text = "";

  try {
    const infoOut = execSync(`pdfinfo "${filePath.replace(/"/g, '\\"')}"`, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"]
    });
    const pageMatch = infoOut.match(/Pages:\s+(\d+)/i);
    if (pageMatch) pages = parseInt(pageMatch[1], 10);
    const titleMatch = infoOut.match(/Title:\s+(.+)/i);
    if (titleMatch) metadata.title = titleMatch[1].trim();
  } catch (e) {}

  try {
    text = execSync(`pdftotext -f 1 -l 2 "${filePath.replace(/"/g, '\\"')}" -`, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
      maxBuffer: 10 * 1024 * 1024,
      timeout: 10000
    });
  } catch (e) {}

  return { pages, metadata, text };
}

function inspectCsv(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.trim().split("\n");
    return {
      rowCount: lines.length - 1,
      header: lines[0],
      sample: lines.slice(1, 4).join("\n")
    };
  } catch (e) {
    return { rowCount: null, header: "", sample: "" };
  }
}

function inspectJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return {
        recordCount: parsed.length,
        sampleKeys: Object.keys(parsed[0] || {})
      };
    }
    return { recordCount: 1, sampleKeys: Object.keys(parsed) };
  } catch (e) {
    return { recordCount: null, sampleKeys: [] };
  }
}

function inspectXlsx(filePath) {
  try {
    const xml = execSync(`unzip -p "${filePath.replace(/"/g, '\\"')}" xl/workbook.xml`, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"]
    });
    const sheetMatches = [...xml.matchAll(/<sheet\s+name="([^"]+)"/g)].map(m => m[1]);
    return { sheets: sheetMatches };
  } catch (e) {
    return { sheets: [] };
  }
}

// 4. Document Classifier
export function classifyDocument(filePath, originalName, parentDir, authoritiesByRegion) {
  const stat = fs.statSync(filePath);
  const fileBytes = stat.size;
  const hash = crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");

  const relPath = path.relative(".", filePath);
  const pathParts = relPath.split(path.sep);
  const topDir = pathParts[1]; // Subdirectory under NEET UG 2026/

  const jurInfo = JURISDICTION_META[topDir] || {
    canonical: (topDir || "Unknown").replace(/[^a-zA-Z0-9]/g, ""),
    displayName: topDir || "Unknown",
    type: "State",
    slug: (topDir || "unknown").toLowerCase().replace(/[^a-z0-9]+/g, "-")
  };

  // Find authority info from reference table
  let authEntry = null;
  for (const [k, v] of Object.entries(authoritiesByRegion)) {
    if (k.includes(jurInfo.displayName.toLowerCase()) || jurInfo.displayName.toLowerCase().includes(k)) {
      authEntry = v;
      break;
    }
  }

  const ext = path.extname(originalName).toLowerCase();
  let detectedType = "pdf";
  let pdfDetails = null;
  let csvDetails = null;
  let jsonDetails = null;
  let xlsxDetails = null;

  if (ext === ".csv") {
    detectedType = "csv";
    csvDetails = inspectCsv(filePath);
  } else if (ext === ".json") {
    detectedType = "json";
    jsonDetails = inspectJson(filePath);
  } else if (ext === ".xlsx") {
    detectedType = "xlsx";
    xlsxDetails = inspectXlsx(filePath);
  } else {
    detectedType = "pdf";
    pdfDetails = inspectPdf(filePath);
  }

  const cleanName = originalName.replace(/\n/g, " ").trim();
  const sampleText = pdfDetails ? pdfDetails.text : (csvDetails ? csvDetails.header + " " + csvDetails.sample : "");

  // Institutional authority override for discrete authorities
  if (/ggsipu|indraprastha/i.test(cleanName)) {
    authEntry = { authorityName: "Guru Gobind Singh Indraprastha University (GGSIPU)", primaryLink: "https://www.ipu.ac.in/adm2026/adm2026main.php" };
  } else if (/neigrihms/i.test(cleanName)) {
    authEntry = { authorityName: "North Eastern Indira Gandhi Regional Institute of Health & Medical Sciences (NEIGRIHMS)", primaryLink: "https://neigrihms.gov.in/#" };
  } else if (/smu|manipal/i.test(cleanName)) {
    authEntry = { authorityName: "Sikkim Manipal University (SMU)", primaryLink: "https://www.smu.edu.in/" };
  }

  // Category determination
  let category = "Other";
  let confidence = "High";

  // Check if text has candidate allotment table/result headers
  const hasAllotmentBody = /seat\s*allotment\s*result|allotment\s*result|provisional\s*allotment\s*list|seats\s*allotment\s*result|selection\s*list\s*for|provisional\s*selection\s*list|merit\s*list\s*cum\s*allotment/i.test(sampleText);

  // Analysis Category: Opening & Closing Ranks, Cutoffs, and Consolidated Multi-Round Tables
  // Note: UP Complete Analysis stays strictly in Allotment as requested
  const isAnalysis = (
    (/opening\s*closing|orcr|\bcutoffs?\b/i.test(cleanName) || /consolidated\s*all\s*rounds/i.test(cleanName)) &&
    !(/uttar\s*pradesh/i.test(topDir) && /complete\s*analysis/i.test(cleanName))
  );

  // Info Category: College directories, participating institutes lists, and contact information
  const isInfo = /colleges\s*list|contact\s*info|all\s*medical\s*colleges\s*contact/i.test(cleanName);

  // Seat Matrix determination:
  // - Exclude files where cleanName explicitly says allotment or merit list
  // - Exclude "stray vacancy" (which is an allotment round, not a seat matrix)
  // - If matching sampleText, ensure it is not just a legal preamble in an allotment result or merit list
  const isSeatMatrix = !/allotment/i.test(cleanName) && !/merit\s*list|rank\s*list/i.test(cleanName) && !isAnalysis && (
    /seat\s*matrix|vacant\s*seats|tentative\s*vacancy|seats\s*matrix/i.test(cleanName) ||
    (!/stray/i.test(cleanName) && /\bvacancy\b/i.test(cleanName)) ||
    (/seat\s*matrix|matrix\s*for\s*academic|distribution\s*of.*seats/i.test(sampleText) &&
     !hasAllotmentBody &&
     !/round\s*[1-4]|stray|merit/i.test(cleanName))
  );

  const isNotice = !isAnalysis && !isInfo && (
    (/additional.*seats/i.test(cleanName) && /urgent\s*notification|notification\s*no/i.test(sampleText)) ||
    (!/selection\s*list|allotment/i.test(cleanName) && !/round\s*[1-4]/i.test(cleanName) && (
      /\b(notice|notification|schedule|eligibility\s*criteria|guidelines|reservation\s*calculation)\b/i.test(cleanName) ||
      (/offline\s*applications\s*are\s*invited|notification\s*no/i.test(sampleText) && !/merit\s*list/i.test(cleanName))
    ))
  );

  const isBulletin = /bulletin|prospectus|brochure|information\s*handbook/i.test(cleanName);

  // Merit List determination:
  // - Exclude files that are actually allotment lists (like Assam or Haryana)
  // - Include CENTAC merit list PDFs
  const isMerit = !isAnalysis && !isInfo && !isSeatMatrix && !isNotice && !isBulletin && (
    /centac_merit/i.test(filePath) ||
    /final\s*merit\s*list\s*for\s*ug\s*neet/i.test(sampleText) ||
    (/merit\s*list|rank\s*list|eligible\s*candidates|eligible\s*participants|state\s*merit|dual_nativity_removed/i.test(cleanName) &&
     !/allotment|selection\s*list/i.test(cleanName)) ||
    (/merit\s*list|list of eligible candidates|provisional\s*merit/i.test(sampleText) &&
     !hasAllotmentBody &&
     !/allotment|admitted list|selection list/i.test(cleanName) &&
     !/round\s*[1-4]|stray/i.test(cleanName))
  );

  const isAllotment = (!isAnalysis && !isInfo && !isMerit && !isSeatMatrix && !isNotice && !isBulletin) && (
    /allotment|allotted|selection\s*list|admitted\s*list|round\s*[1-4]|1st\s*round|2nd\s*round|3rd\s*round|mop\s*up|mopup|stray|spot\s*counselling|namo_m_b_b_s|complete\s*analysis|domicile|round.*ncc/i.test(cleanName) ||
    hasAllotmentBody
  );

  if (isAnalysis) {
    category = "Analysis";
  } else if (isAllotment) {
    category = "Allotment";
  } else if (isMerit) {
    category = "MeritList";
  } else if (isSeatMatrix) {
    category = "SeatMatrix";
  } else if (isNotice) {
    category = "CounsellingNotice";
  } else if (isInfo) {
    category = "Info";
  } else if (isBulletin) {
    category = "InformationBulletin";
  } else {
    category = "Other";
  }

  // 1. DETERMINISTIC ROUND IDENTIFICATION (FILENAME STRICTLY PRIORITIZED)
  let round = "NotApplicable";

  // Check filename first!
  if (/consolidated|all\s*rounds/i.test(cleanName)) {
    round = "Combined";
  } else if (/special\s*stray/i.test(cleanName)) {
    round = "SpecialStray";
  } else if (/stray/i.test(cleanName)) {
    round = "StrayVacancy";
  } else if (/mop\s*up|mopup/i.test(cleanName)) {
    round = "MopUp";
  } else if (/spot/i.test(cleanName)) {
    round = "SpotCounselling";
  } else if (/round\s*4|4th\s*round/i.test(cleanName)) {
    round = "Round4";
  } else if (/round\s*3|3rd\s*round|phase\s*3|round_3/i.test(cleanName)) {
    round = "Round3";
  } else if (/round\s*2|2nd\s*round|phase\s*2|round_2/i.test(cleanName)) {
    round = "Round2";
  } else if (/round\s*1|1st\s*round|phase\s*1|round_1/i.test(cleanName)) {
    round = "Round1";
  } else {
    // If filename has NO round indication, check sampleText
    if (/special\s*stray/i.test(sampleText)) round = "SpecialStray";
    else if (/stray\s*vacancy/i.test(sampleText)) round = "StrayVacancy";
    else if (/mop\s*up/i.test(sampleText)) round = "MopUp";
    else if (/first\s*round|round[- ]*\s*1|1st\s*round/i.test(sampleText)) round = "Round1";
    else if (/second\s*round|round[- ]*\s*2|2nd\s*round/i.test(sampleText)) round = "Round2";
    else if (/third\s*round|round[- ]*\s*3|3rd\s*round/i.test(sampleText)) round = "Round3";
    else if (/fourth\s*round|round[- ]*\s*4|4th\s*round/i.test(sampleText)) round = "Round4";
    else round = "NotApplicable";
  }

  // Handle Round 1 & Round 2 combined datasets (e.g. UP Allotment)
  if (/round\s*1\s*and\s*round\s*2/i.test(cleanName)) {
    round = "Round1_Round2";
  }

  // 2. DETERMINISTIC QUOTA / STREAM IDENTIFICATION (FILENAME PRIORITIZED)
  let quota = null;
  if (/\bnri\b/i.test(cleanName)) quota = "NRIQuota";
  else if (/management\s*(quota|q\b)|\bmq\b/i.test(cleanName)) quota = "ManagementQuota";
  else if (/general\s*(quota|q\b)/i.test(cleanName)) quota = "GeneralQuota";
  else if (/competent\s*authority|\bcaq\b/i.test(cleanName)) quota = "CompetentAuthorityQuota";
  else if (/government\s*quota|\bgq\b/i.test(cleanName)) quota = "GovernmentQuota";
  else if (/7\.5/i.test(cleanName)) quota = "GovtSchool7.5Quota";
  else if (/ex[- ]servicemen|\besm\b/i.test(cleanName)) quota = "ExServicemenQuota";
  else if (/sports|\bmsp\b/i.test(cleanName)) quota = "SportsQuota";
  else if (/pwd/i.test(cleanName)) quota = "PWDQuota";
  else if (/minority/i.test(cleanName)) quota = "MinorityQuota";
  else if (/central\s*pool/i.test(cleanName)) quota = "CentralPool";
  else if (/kerala\s*origin/i.test(cleanName)) quota = "KeralaOriginQuota";
  else if (/ncc/i.test(cleanName)) quota = "NCCQuota";
  else if (/north\s*east|\bne\b/i.test(cleanName)) quota = "NorthEastQuota";
  else if (/\bau\b|andhra\s*university/i.test(cleanName)) quota = "AUArea";
  else if (/\bsvu\b|sri\s*venkateswara/i.test(cleanName)) quota = "SVUArea";
  else if (/\bswi\b|state\s*wide/i.test(cleanName)) quota = "StateWide";

  // If Puducherry root general allotment file, clear NRIQuota tag (it covers all categories)
  if (/puducherry/i.test(topDir) && !/centac_merit/i.test(filePath) && /provisional\s*allotment\s*list/i.test(cleanName)) {
    quota = null;
  }

  // Fallback to sampleText for quota if not found in cleanName (e.g. Dadra Stray Vacancy MQ)
  if (!quota) {
    if (/institute\s*-\s*management\s*quota|management\s*quota/i.test(sampleText)) {
      quota = "ManagementQuota";
    }
  }

  // 3. DETERMINISTIC QUALIFIER IDENTIFICATION
  let qualifier = null;

  // Check Puducherry category code prefixes
  if (/puducherry\s*centac_merit/i.test(filePath) || /centac/i.test(filePath)) {
    const codeMatch = originalName.match(/^(\d{2})_([A-Za-z0-9_]+)/);
    if (codeMatch) {
      const code = codeMatch[2].toUpperCase();
      if (code.startsWith("GQ")) quota = "GovernmentQuota";
      else if (code.startsWith("MQ") && !code.startsWith("MQT")) quota = "ManagementQuota";
      else if (code.startsWith("MQT")) quota = "TeluguMinorityQuota";
      else if (code.startsWith("NRI")) {
        quota = "NRIQuota";
        if (code.includes("BVSC")) qualifier = "BVSc_AH";
      }
      else if (code.startsWith("SC")) quota = "SCQuota";
      else if (code.startsWith("BT")) quota = "BTQuota";
      else if (code.startsWith("EWS")) quota = "EWSQuota";
      else if (code.startsWith("OBC")) quota = "OBCQuota";
      else if (code.startsWith("MBC")) quota = "MBCQuota";
      else if (code.startsWith("BCM")) quota = "BCMQuota";
      else if (code.startsWith("EBC")) quota = "EBCQuota";
      else if (code.startsWith("ESM")) quota = "ExServicemenQuota";
      else if (code.startsWith("FF")) quota = "FreedomFighterQuota";
      else if (code.startsWith("MSP")) {
        quota = "SportsQuota";
        if (code.includes("NON_ELIGIBLE")) qualifier = "NonEligible";
        else qualifier = "Eligible";
      }
      else if (code.startsWith("GOVT")) quota = "GovtSchoolQuota";
      else if (code.includes("DUAL_NATIVITY")) quota = "DualNativityRemoved";
      else quota = codeMatch[2].replace(/_/g, "");
    }
  }

  // Website display filtering flag (per user request)
  let excludeFromWebsite = false;
  if (/puducherry/i.test(topDir)) {
    if (/dual_nativity_removed|msp_non_eligible/i.test(cleanName)) {
      excludeFromWebsite = true;
    }
  }
  if (/uttar\s*pradesh/i.test(topDir)) {
    if (ext === ".csv" || ext === ".json" || ext === ".xlsx") {
      excludeFromWebsite = true;
    }
  }

  // Kerala Phase Disambiguation
  if (/kerala/i.test(topDir)) {
    if (/phase\s*2-1/i.test(cleanName)) qualifier = "Phase2_Part1";
    else if (/phase\s*2-2/i.test(cleanName)) qualifier = "Phase2_Part2";
    else if (/phase\s*2/i.test(cleanName)) qualifier = "Phase2";
    else if (/phase\s*\./i.test(cleanName)) qualifier = "Phase1";
  }

  if (/after\s*changes/i.test(cleanName)) qualifier = qualifier ? `${qualifier}_AfterChanges` : "AfterChanges";
  if (/provisional/i.test(cleanName)) qualifier = qualifier ? `${qualifier}_Provisional` : "Provisional";
  if (/final/i.test(cleanName)) qualifier = qualifier ? `${qualifier}_Final` : "Final";
  if (/revised/i.test(cleanName)) qualifier = qualifier ? `${qualifier}_Revised` : "Revised";
  if (/complete\s*analysis/i.test(cleanName)) qualifier = qualifier ? `${qualifier}_CompleteAnalysis` : "CompleteAnalysis";
  if (/additional.*seats/i.test(cleanName)) qualifier = qualifier ? `${qualifier}_AdditionalSeats` : "AdditionalSeats";

  // Specific institutional qualifiers
  if (/pa\s*sangma/i.test(cleanName)) qualifier = qualifier ? `${qualifier}_PaSangma` : "PaSangma";
  if (/neigrihms/i.test(cleanName)) qualifier = qualifier ? `${qualifier}_NEIGRIHMS` : "NEIGRIHMS";
  if (/pacific\s*medical/i.test(cleanName)) qualifier = qualifier ? `${qualifier}_AdditionalSeats_PacificMed` : "AdditionalSeats_PacificMed";
  if (/ggsipu|indraprastha/i.test(cleanName)) qualifier = qualifier ? `${qualifier}_GGSIPU` : "GGSIPU";
  if (/cutoffs|opening\s*closing|orcr/i.test(cleanName)) qualifier = qualifier ? `${qualifier}_Cutoffs` : "Cutoffs";
  if (/colleges\s*list/i.test(cleanName)) qualifier = qualifier ? `${qualifier}_CollegesList` : "CollegesList";
  if (/contact\s*info/i.test(cleanName)) qualifier = qualifier ? `${qualifier}_ContactInfo` : "ContactInfo";
  if (/reservation\s*calculation/i.test(cleanName)) qualifier = qualifier ? `${qualifier}_ReservationCalc` : "ReservationCalc";
  if (/eligibility\s*criteria/i.test(cleanName)) qualifier = qualifier ? `${qualifier}_EligibilityCriteria` : "EligibilityCriteria";
  if (/dual_nativity_removed/i.test(cleanName) && quota !== "DualNativityRemoved") qualifier = qualifier ? `${qualifier}_DualNativityRemoved` : "DualNativityRemoved";
  if (/consolidated/i.test(cleanName)) qualifier = qualifier ? `${qualifier}_Consolidated` : "Consolidated";
  if (/namo_m_b_b_s/i.test(cleanName)) qualifier = qualifier ? `${qualifier}_NAMO_MERI` : "NAMO_MERI";
  if (/domicile/i.test(cleanName)) qualifier = qualifier ? `${qualifier}_Domicile` : "Domicile";

  // Check specific dates in filename e.g. 13-08-2026, 24-08-2026, 08.09.2026
  const dateMatch = cleanName.match(/(\d{2}[-.]\d{2}[-.]\d{4})/);
  if (dateMatch) {
    const formattedDate = dateMatch[1].replace(/\./g, "-");
    qualifier = qualifier ? `${qualifier}_${formattedDate}` : formattedDate;
  }

  // Academic year
  let academicYear = "2026";
  const yearMatch = (cleanName + " " + sampleText).match(/202[4-7]/);
  if (yearMatch) academicYear = yearMatch[0];

  // Proposed Normalized Filename: <Year>_<Region>_<DocumentType>_<Round>_<Quota>_<Qualifier>.<ext>
  const targetExt = detectedType === "pdf" ? ".pdf" : (ext || ".pdf");
  const parts = [academicYear, jurInfo.canonical, category, round];
  if (quota) parts.push(quota);
  if (qualifier) parts.push(qualifier);
  const proposedFilename = parts.join("_") + targetExt;

  let jurFolder = "states";
  if (jurInfo.type === "All India") jurFolder = "all-india";
  else if (jurInfo.type === "Union Territory") jurFolder = "union-territories";

  const proposedDestPath = path.join("data", "normalized", jurFolder, jurInfo.slug, proposedFilename);

  let notes = [];
  if (!ext) notes.push("Original file lacked .pdf extension (resolved to .pdf)");
  if (originalName.includes("\n")) notes.push("Original filename contained raw newline character (sanitized)");
  if (/^\s+|\s+$/.test(originalName)) notes.push("Original filename contained leading/trailing whitespace (sanitized)");

  return {
    id: `${academicYear}-${jurInfo.slug}-${path.basename(proposedFilename, targetExt).toLowerCase()}`,
    academicYear,
    jurisdictionType: jurInfo.type,
    canonicalJurisdiction: jurInfo.canonical,
    jurisdictionDisplayName: jurInfo.displayName,
    jurisdictionSlug: jurInfo.slug,
    originalFilename: originalName,
    originalRelativePath: relPath,
    originalExtension: ext || "(none)",
    detectedType,
    mimeType: detectedType === "pdf" ? "application/pdf" : (detectedType === "csv" ? "text/csv" : (detectedType === "xlsx" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "application/json")),
    fileSizeBytes: fileBytes,
    fileSizeHuman: formatBytes(fileBytes),
    sha256: hash,
    pageCount: pdfDetails ? pdfDetails.pages : null,
    sheetInfo: xlsxDetails ? xlsxDetails.sheets : null,
    rowCount: csvDetails ? csvDetails.rowCount : (jsonDetails ? jsonDetails.recordCount : null),
    documentCategory: category,
    counsellingRound: round,
    quotaCategory: quota,
    qualifier,
    excludeFromWebsite: excludeFromWebsite || false,
    counsellingAuthority: authEntry ? authEntry.authorityName : "State Counselling Authority",
    officialSourceUrl: authEntry ? authEntry.primaryLink : "",
    proposedNormalizedFilename: proposedFilename,
    proposedDestinationPath: proposedDestPath,
    classificationConfidence: confidence,
    textSnippet: sampleText.slice(0, 200).replace(/\s+/g, " ").trim(),
    notes: notes.join("; ")
  };
}

// 5. Runner
export function runClassification() {
  console.log("Starting Phase 1 Document Inventory and Classification Pipeline...");

  const authorityFilePath = "NEET UG 2026/NEET UG Counselling authority table.xlsx";
  console.log(`Parsing reference authority table from: ${authorityFilePath}`);
  const { authoritiesByRegion, authoritiesList } = extractAuthorityTable(authorityFilePath);

  fs.mkdirSync("data/metadata", { recursive: true });
  fs.mkdirSync("data/reports", { recursive: true });

  const canonicalAuthorities = Object.values(JURISDICTION_META).map(j => {
    let matched = null;
    for (const [k, v] of Object.entries(authoritiesByRegion)) {
      if (k.includes(j.displayName.toLowerCase()) || j.displayName.toLowerCase().includes(k)) {
        matched = v;
        break;
      }
    }
    return {
      canonicalJurisdiction: j.canonical,
      displayName: j.displayName,
      jurisdictionType: j.type,
      slug: j.slug,
      authorityName: matched ? matched.authorityName : "Official State Counselling Authority",
      officialWebsiteUrl: matched ? matched.primaryLink : "",
      allOfficialLinks: matched ? matched.allLinks : [],
      authorities: matched && matched.authorities ? matched.authorities : (matched?.primaryLink ? [{ name: matched.authorityName, url: matched.primaryLink }] : []),
      notes: matched ? "" : "Authority information pending verification"
    };
  });

  fs.writeFileSync("data/metadata/authorities.json", JSON.stringify(canonicalAuthorities, null, 2), "utf8");
  console.log("Wrote data/metadata/authorities.json (36 canonical authorities).");

  const allFiles = walkSync("./NEET UG 2026");
  const candidateFiles = allFiles.filter(f => !f.endsWith("NEET UG Counselling authority table.xlsx"));
  console.log(`Discovered ${candidateFiles.length} candidate counselling documents.`);

  const inventory = [];
  const filenameUsage = {};

  for (const f of candidateFiles) {
    const origName = path.basename(f);
    const parent = path.dirname(f);
    const item = classifyDocument(f, origName, parent, authoritiesByRegion);

    let proposed = item.proposedNormalizedFilename;
    if (filenameUsage[proposed]) {
      filenameUsage[proposed]++;
      const base = path.basename(proposed, path.extname(proposed));
      const disambiguated = `${base}_v${filenameUsage[proposed]}${path.extname(proposed)}`;
      item.notes += (item.notes ? "; " : "") + `Collision resolved from ${proposed} to ${disambiguated}`;
      item.proposedNormalizedFilename = disambiguated;
      item.proposedDestinationPath = path.join(path.dirname(item.proposedDestinationPath), disambiguated);
    } else {
      filenameUsage[proposed] = 1;
    }

    inventory.push(item);
  }

  fs.writeFileSync("data/metadata/document-inventory.json", JSON.stringify(inventory, null, 2), "utf8");
  console.log("Wrote data/metadata/document-inventory.json");

  const byCategory = {};
  const byRound = {};
  const byConfidence = {};
  const collisions = [];
  const otherFiles = [];

  inventory.forEach(i => {
    byCategory[i.documentCategory] = (byCategory[i.documentCategory] || 0) + 1;
    byRound[i.counsellingRound] = (byRound[i.counsellingRound] || 0) + 1;
    byConfidence[i.classificationConfidence] = (byConfidence[i.classificationConfidence] || 0) + 1;
    if (i.notes.includes("Collision")) {
      collisions.push(i);
    }
    if (i.documentCategory === "Other") {
      otherFiles.push(i);
    }
  });

  let md = `# Phase 1: Document Classification & Inventory Report\n\n`;
  md += `**Date:** ${new Date().toISOString().split("T")[0]}\n`;
  md += `**Total Candidate Documents Inventoried:** ${inventory.length}\n`;
  md += `**Official Authority Reference Table:** Extracted and linked (${canonicalAuthorities.length} jurisdictions)\n\n`;

  md += `## 1. Classification Breakdown\n\n`;
  md += `### By Document Category\n`;
  md += `| Category | Description | Count | Percentage |\n|---|---|---|---|\n`;
  md += `| **Allotment** | Round-wise seat allotment results or lists | ${byCategory["Allotment"] || 0} | ${(((byCategory["Allotment"] || 0) / inventory.length) * 100).toFixed(1)}% |\n`;
  md += `| **MeritList** | State or national merit lists and rank lists | ${byCategory["MeritList"] || 0} | ${(((byCategory["MeritList"] || 0) / inventory.length) * 100).toFixed(1)}% |\n`;
  md += `| **SeatMatrix** | Available seats, seat distribution, or vacancy matrices | ${byCategory["SeatMatrix"] || 0} | ${(((byCategory["SeatMatrix"] || 0) / inventory.length) * 100).toFixed(1)}% |\n`;
  md += `| **CounsellingNotice** | Official notifications, schedules, and eligibility criteria | ${byCategory["CounsellingNotice"] || 0} | ${(((byCategory["CounsellingNotice"] || 0) / inventory.length) * 100).toFixed(1)}% |\n`;
  md += `| **InformationBulletin** | Information booklets or prospectuses | ${byCategory["InformationBulletin"] || 0} | ${(((byCategory["InformationBulletin"] || 0) / inventory.length) * 100).toFixed(1)}% |\n`;
  md += `| **Other** | College directories, cutoffs summary, contact lists | ${byCategory["Other"] || 0} | ${(((byCategory["Other"] || 0) / inventory.length) * 100).toFixed(1)}% |\n`;

  md += `\n### By Counselling Round\n`;
  md += `| Round | Count | Percentage |\n|---|---|---|\n`;
  for (const [k, v] of Object.entries(byRound)) {
    md += `| **${k}** | ${v} | ${((v / inventory.length) * 100).toFixed(1)}% |\n`;
  }

  md += `\n### By Classification Confidence\n`;
  md += `| Confidence | Count | Percentage |\n|---|---|---|\n`;
  for (const [k, v] of Object.entries(byConfidence)) {
    md += `| **${k}** | ${v} | ${((v / inventory.length) * 100).toFixed(1)}% |\n`;
  }

  md += `\n---\n\n## 2. Review Checkpoint: Documents Classified as 'Other' (${otherFiles.length} files)\n\n`;
  md += `These files are non-allotment directory/reference materials:\n\n`;
  md += `| Jurisdiction | Original File | Assigned Qualifier | Description |\n`;
  md += `|---|---|---|---|\n`;
  otherFiles.forEach(o => {
    md += `| ${o.jurisdictionDisplayName} | \`${o.originalFilename}\` | \`${o.qualifier || "-"}\` | ${o.textSnippet ? o.textSnippet.slice(0, 80) + "..." : "Scanned document"} |\n`;
  });

  md += `\n---\n\n## 3. Filename Collision Audit (${collisions.length} collisions detected)\n\n`;
  if (collisions.length === 0) {
    md += `*Zero filename collisions detected across all ${inventory.length} files! Every proposed normalized filename is uniquely deterministic.*\n`;
  } else {
    md += `| Original Path | Collision Details |\n|---|---|\n`;
    collisions.forEach(c => {
      md += `| \`${c.originalRelativePath}\` | ${c.notes} |\n`;
    });
  }

  md += `\n---\n\n## 4. Full Document Inventory Table (All ${inventory.length} Documents)\n\n`;
  md += `| # | Jurisdiction | Category | Round | Quota / Qualifier | Original Filename | Proposed Normalized Filename |\n`;
  md += `|---|---|---|---|---|---|---|\n`;
  inventory.forEach((i, idx) => {
    const q = [i.quotaCategory, i.qualifier].filter(Boolean).join(", ") || "-";
    md += `| ${idx + 1} | ${i.canonicalJurisdiction} | ${i.documentCategory} | ${i.counsellingRound} | ${q} | \`${path.basename(i.originalFilename)}\` | \`${i.proposedNormalizedFilename}\` |\n`;
  });

  fs.writeFileSync("data/reports/classification-report.md", md, "utf8");
  console.log("Wrote data/reports/classification-report.md");
  console.log("Phase 1 pipeline completed successfully.");
}

runClassification();
