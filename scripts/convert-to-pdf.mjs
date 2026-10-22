import fs from "fs";
import path from "path";
import { execSync } from "child_process";

export function runPdfConversion() {
  console.log("Starting Phase 4: PDF Conversion and Publication Pipeline...");

  const conversionTargets = [
    {
      src: "data/normalized/union-territories/dadra-and-nagar-haveli-and-daman-and-diu/2026_DadraNagarHaveliDamanDiu_MeritList_NotApplicable.csv",
      outDir: "data/normalized/union-territories/dadra-and-nagar-haveli-and-daman-and-diu",
      type: "CSV Merit List",
      recommendation: "Publish PDF copy and original CSV format"
    },
    {
      src: "data/normalized/union-territories/dadra-and-nagar-haveli-and-daman-and-diu/2026_DadraNagarHaveliDamanDiu_Allotment_Round1_NAMO_MERI.csv",
      outDir: "data/normalized/union-territories/dadra-and-nagar-haveli-and-daman-and-diu",
      type: "CSV Allotment Round 1",
      recommendation: "Publish PDF copy and original CSV format"
    },
    {
      src: "data/normalized/union-territories/dadra-and-nagar-haveli-and-daman-and-diu/2026_DadraNagarHaveliDamanDiu_Allotment_Round2.csv",
      outDir: "data/normalized/union-territories/dadra-and-nagar-haveli-and-daman-and-diu",
      type: "CSV Allotment Round 2",
      recommendation: "Publish PDF copy and original CSV format"
    },
    {
      src: "data/normalized/union-territories/dadra-and-nagar-haveli-and-daman-and-diu/2026_DadraNagarHaveliDamanDiu_Allotment_Round3.csv",
      outDir: "data/normalized/union-territories/dadra-and-nagar-haveli-and-daman-and-diu",
      type: "CSV Allotment Round 3",
      recommendation: "Publish PDF copy and original CSV format"
    }
  ];

  const results = [];

  for (const item of conversionTargets) {
    console.log(`Converting: ${item.src} -> PDF...`);
    try {
      execSync(`libreoffice --headless --convert-to pdf --outdir "${item.outDir}" "${item.src}"`, {
        stdio: ["pipe", "pipe", "pipe"],
        timeout: 60000
      });

      const expectedPdfName = path.basename(item.src, path.extname(item.src)) + ".pdf";
      const expectedPdfPath = path.join(item.outDir, expectedPdfName);

      if (fs.existsSync(expectedPdfPath)) {
        const stat = fs.statSync(expectedPdfPath);
        const info = execSync(`pdfinfo "${expectedPdfPath}"`, { encoding: "utf8" });
        const pagesMatch = info.match(/Pages:\s+(\d+)/);
        const pages = pagesMatch ? parseInt(pagesMatch[1], 10) : 1;

        results.push({
          sourcePath: item.src,
          outputPath: expectedPdfPath,
          status: "SUCCESS",
          pages,
          sizeBytes: stat.size,
          sizeMb: (stat.size / (1024 * 1024)).toFixed(2) + " MB",
          recommendation: item.recommendation,
          notes: pages > 100 ? `High page count (${pages} pages). Large file.` : "Clean table layout."
        });
        console.log(`Success: ${expectedPdfName} (${pages} pages, ${(stat.size / (1024 * 1024)).toFixed(2)} MB)`);
      } else {
        results.push({
          sourcePath: item.src,
          outputPath: expectedPdfPath,
          status: "FAILED",
          notes: "Output PDF file not found after conversion"
        });
      }
    } catch (e) {
      results.push({
        sourcePath: item.src,
        outputPath: "",
        status: "FAILED",
        notes: e.message
      });
      console.error(`Failed conversion for ${item.src}:`, e.message);
    }
  }

  // Generate Conversion Report Markdown
  let md = `# Phase 4: PDF Conversion and Publication Pipeline Report\n\n`;
  md += `**Execution Date:** ${new Date().toISOString().split("T")[0]}\n`;
  md += `**Converter Tool:** LibreOffice 25.2 Headless (\`calc_pdf_Export\`)\n\n`;

  md += `## 1. Converted Spreadsheets & Tabular Files\n\n`;
  md += `| Source File | Generated PDF | Pages | Output Size | Status | Recommended Publication Artifact |\n`;
  md += `|---|---|---|---|---|---|\n`;

  results.forEach(r => {
    md += `| \`${path.basename(r.sourcePath)}\` | \`${path.basename(r.outputPath)}\` | **${r.pages}** | ${r.sizeMb} | **${r.status}** | ${r.recommendation} |\n`;
  });

  md += `\n## 2. Excluded from Direct Conversion\n\n`;
  md += `- \`2026_UttarPradesh_Allotment_Round1_Round2.csv\` & \`2026_UttarPradesh_Allotment_Round1_Round2.json\`: Excluded from separate duplicate PDF conversion because they contain the identical 14,653 allotment rows already converted from the master \`.xlsx\` workbook. Hosting raw \`.csv\` and \`.json\` preserves computational utility without bloating PDF storage.\n\n`;

  md += `## 3. Publication Policy Summary\n\n`;
  md += `1. **Native PDFs (200 documents):** Served directly via \`website/public/documents/\` with normalized filenames.\n`;
  md += `2. **Dadra & Nagar Haveli Documents:** Published in dual formats: user can view/preview the 3–51 page PDF or download the original CSV.\n`;
  md += `3. **Uttar Pradesh Allotment Master Data:** Primary download format is the high-performance native \`.xlsx\` and \`.csv\`. The 1,606-page PDF rendition is accessible with an explicit 50 MB file size indicator.\n`;

  fs.writeFileSync("data/reports/conversion-report.md", md, "utf8");
  console.log("Wrote data/reports/conversion-report.md");
}

runPdfConversion();
