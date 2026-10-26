import fs from 'fs';
import path from 'path';

const catalog = JSON.parse(fs.readFileSync('website/src/data/catalog.json', 'utf8'));

const BASE_URL = 'https://deekshithvodela.github.io/Canonify';
const TODAY = '2026-10-26';

let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

// Main entrypoint
xml += `  <url>\n    <loc>${BASE_URL}/</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

// All 206 static document files (clean, directly accessible, indexable PDFs)
for (const doc of catalog.documents) {
  const docUrl = `${BASE_URL}/${doc.publicUrl}`;
  xml += `  <url>\n    <loc>${docUrl}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
}

xml += `</urlset>\n`;

fs.writeFileSync('website/public/sitemap.xml', xml, 'utf8');
console.log(`Successfully generated website/public/sitemap.xml with 1 root page and ${catalog.documents.length} clean document URLs (Total: ${catalog.documents.length + 1} URLs).`);
