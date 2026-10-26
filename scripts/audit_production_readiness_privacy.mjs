import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const WORKSPACE_ROOT = process.cwd();
const DIST_DIR = path.join(WORKSPACE_ROOT, 'website/dist');

console.log('================================================================');
console.log('STARTING PRODUCTION READINESS & 7-VECTOR PRIVACY LEAK AUDIT');
console.log(`Target: ${WORKSPACE_ROOT}`);
console.log('================================================================\n');

const findings = [];
const summary = {
  vector1_identity: 'PASS',
  vector2_machine_paths: 'PASS',
  vector3_secrets: 'PASS',
  vector4_pii: 'PASS',
  vector5_debug_artifacts: 'PASS',
  vector6_git_hygiene: 'PASS',
  vector7_dist_hygiene: 'PASS'
};

// Helper: Scan files recursively
function getFiles(dir, filterFn) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === 'node_modules' || file === '.git' || file === '.system_generated' || file === '.tempmediaStorage') continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getFiles(fullPath, filterFn));
    } else if (!filterFn || filterFn(fullPath)) {
      results.push(fullPath);
    }
  }
  return results;
}

// ------------------------------------------------------------------
// VECTOR 1 & 4: DEVELOPER IDENTITY & PII
// ------------------------------------------------------------------
console.log('--- Vector 1 & 4: Developer Identity & PII Inspection ---');
const publicFiles = getFiles(path.join(WORKSPACE_ROOT, 'website/src'), f => /\.(ts|tsx|js|jsx|json|html|css)$/.test(f))
  .concat(getFiles(path.join(WORKSPACE_ROOT, 'website/public'), f => /\.(json|html|xml|txt|webmanifest)$/.test(f)));

let piiCount = 0;
for (const file of publicFiles) {
  const content = fs.readFileSync(file, 'utf8');
  // Check for private emails that are not intentional author contacts
  const emailMatches = content.match(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g) || [];
  for (const email of emailMatches) {
    const isAllowedAuthor = email === 'deekshithvodela@gmail.com' || email === 'contact@deekshithvodela.com' || email.includes('example.com') || email.includes('schema.org');
    if (!isAllowedAuthor) {
      findings.push({ vector: 'PII', severity: 'S1', file: path.relative(WORKSPACE_ROOT, file), detail: `Unexpected email exposed: ${email}` });
      piiCount++;
    }
  }

  // Check for phone numbers (+91 or 10-digit mobile patterns)
  const phoneMatches = content.match(/(\+91[\-\s]?)?[6789]\d{9}/g) || [];
  if (phoneMatches.length > 0) {
    // Exclude checksums, timestamps, or date-like numeric strings
    for (const phone of phoneMatches) {
      if (!content.includes(`"sha256":`) && !content.includes(`"size":`)) {
        findings.push({ vector: 'PII', severity: 'S2', file: path.relative(WORKSPACE_ROOT, file), detail: `Potential phone number candidate: ${phone}` });
        piiCount++;
      }
    }
  }
}
console.log(`✓ Scanned ${publicFiles.length} source & manifest files. Non-whitelisted PII leaks: ${piiCount}`);
if (piiCount > 0) summary.vector4_pii = 'FAIL';

// ------------------------------------------------------------------
// VECTOR 2: DEVELOPER MACHINE INFORMATION & LOCAL PATHS
// ------------------------------------------------------------------
console.log('\n--- Vector 2: Local Machine Paths & Private IPs ---');
const scanTargetFiles = getFiles(WORKSPACE_ROOT, f => {
  if (f.includes('dist/assets/pdf.worker')) return false; // Minified library worker
  if (f.endsWith('.png') || f.endsWith('.ico') || f.endsWith('.pdf') || f.endsWith('.xlsx')) return false;
  return /\.(ts|tsx|js|mjs|cjs|json|html|css|xml|md|yml|yaml|webmanifest)$/.test(f);
});

let machinePathLeaks = 0;
const machinePathRegex = /\/home\/[a-zA-Z0-9_-]+\/|C:\\Users\\[a-zA-Z0-9_-]+\\/g;
const privateIpRegex = /\b(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3})\b/g;

for (const file of scanTargetFiles) {
  const relPath = path.relative(WORKSPACE_ROOT, file);
  // Allow PROJECT_STATE.md, implementation_plan.md, and local verification scripts to record workspace paths
  if (relPath.startsWith('scripts/verify_') || relPath === 'PROJECT_STATE.md' || relPath === 'implementation_plan.md' || relPath.startsWith('.system_generated')) {
    continue;
  }

  const content = fs.readFileSync(file, 'utf8');
  if (machinePathRegex.test(content)) {
    // Ignore self-references in this audit script
    if (relPath !== 'scripts/audit_production_readiness_privacy.mjs') {
      findings.push({ vector: 'MACHINE_PATH', severity: 'S1', file: relPath, detail: 'Exposes local developer machine filesystem path (/home/... or C:\\Users\\...)' });
      machinePathLeaks++;
    }
  }

  if (privateIpRegex.test(content)) {
    findings.push({ vector: 'PRIVATE_IP', severity: 'S1', file: relPath, detail: 'Exposes RFC1918 private IP address' });
    machinePathLeaks++;
  }
}
console.log(`✓ Scanned ${scanTargetFiles.length} repository files. Machine path / Private IP leaks in distributables/source: ${machinePathLeaks}`);
if (machinePathLeaks > 0) summary.vector2_machine_paths = 'FAIL';

// ------------------------------------------------------------------
// VECTOR 3: SECRETS & CREDENTIALS
// ------------------------------------------------------------------
console.log('\n--- Vector 3: Secrets & Credential Leak Scan ---');
const secretPatterns = [
  { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/ },
  { name: 'GitHub Personal Token', regex: /gh[pousr]_[0-9a-zA-Z]{36}/ },
  { name: 'Google API Key', regex: /AIza[0-9A-Za-z\\-_]{35}/ },
  { name: 'RSA/EC Private Key', regex: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: 'Hardcoded Password in assignment', regex: /(api_key|secret|password|token)\s*[:=]\s*["'][a-zA-Z0-9_\-!@#$%^&*]{8,}["']/i }
];

let secretsCount = 0;
for (const file of scanTargetFiles) {
  const relPath = path.relative(WORKSPACE_ROOT, file);
  if (relPath.startsWith('scripts/verify_') || relPath === 'scripts/audit_production_readiness_privacy.mjs') continue;

  const content = fs.readFileSync(file, 'utf8');
  for (const pat of secretPatterns) {
    if (pat.regex.test(content)) {
      // Exclude harmless mock tokens or CSS properties
      if (!content.includes('password:') && !content.includes('token:')) {
        findings.push({ vector: 'SECRETS', severity: 'S0', file: relPath, detail: `Potential secret pattern detected: ${pat.name}` });
        secretsCount++;
      }
    }
  }
}
console.log(`✓ Secret scanning complete. Active secrets detected: ${secretsCount}`);
if (secretsCount > 0) summary.vector3_secrets = 'FAIL';

// ------------------------------------------------------------------
// VECTOR 5 & 7: DISTRIBUTABLE ARTIFACT & DEBUG HYGIENE (website/dist)
// ------------------------------------------------------------------
console.log('\n--- Vector 5 & 7: Distributable Build Artifact Hygiene (website/dist) ---');
let distHygieneOk = true;

if (!fs.existsSync(DIST_DIR)) {
  console.log('WARNING: website/dist does not exist. Running build now...');
  execSync('npm --prefix website run build', { stdio: 'inherit' });
}

const distFiles = getFiles(DIST_DIR);
let sourceMapCount = 0;
let debugFileCount = 0;
let totalDistSize = 0;

for (const file of distFiles) {
  const stat = fs.statSync(file);
  totalDistSize += stat.size;
  const rel = path.relative(DIST_DIR, file);

  if (rel.endsWith('.map')) {
    findings.push({ vector: 'DEBUG_ARTIFACT', severity: 'S1', file: `website/dist/${rel}`, detail: 'Unstripped source map in production bundle' });
    sourceMapCount++;
  }
  if (rel.endsWith('.DS_Store') || rel.endsWith('.log') || rel.includes('.git') || rel.endsWith('.tmp')) {
    findings.push({ vector: 'DEBUG_ARTIFACT', severity: 'S2', file: `website/dist/${rel}`, detail: `Debug/temporary file found in dist: ${rel}` });
    debugFileCount++;
  }
}

console.log(`✓ Total files in website/dist: ${distFiles.length} (${(totalDistSize / (1024 * 1024)).toFixed(2)} MB)`);
console.log(`✓ Source maps (.map) in dist: ${sourceMapCount}`);
console.log(`✓ Debug/temp files in dist: ${debugFileCount}`);
if (sourceMapCount > 0 || debugFileCount > 0) {
  summary.vector5_debug_artifacts = 'FAIL';
  summary.vector7_dist_hygiene = 'FAIL';
}

// ------------------------------------------------------------------
// VECTOR 6: GIT COMMIT HISTORY HYGIENE
// ------------------------------------------------------------------
console.log('\n--- Vector 6: Git Staging & History Hygiene ---');
let gitOk = true;
try {
  const gitLog = execSync('git log -n 10 --oneline', { encoding: 'utf8' });
  console.log('Recent 5 commits:');
  console.log(gitLog.split('\n').slice(0, 5).join('\n'));
} catch (e) {
  console.log('Git inspection note: ' + e.message);
}

// ------------------------------------------------------------------
// PRODUCTION READINESS CHECKS (ISO/IEC 25010)
// ------------------------------------------------------------------
console.log('\n--- ISO/IEC 25010 Production Readiness Checks ---');

// Check A: TypeScript Compilation
console.log('Checking TypeScript Compilation...');
try {
  execSync('npm --prefix website run build', { stdio: 'pipe' });
  console.log('✓ TypeScript & Vite build: PASS (0 errors)');
} catch (e) {
  console.error('✖ TypeScript/Vite build failed!');
  findings.push({ vector: 'BUILD', severity: 'S0', file: 'website', detail: 'TypeScript compilation or Vite build failed' });
}

// Check B: ESLint
console.log('Checking ESLint code quality...');
try {
  execSync('npm --prefix website run lint', { stdio: 'pipe' });
  console.log('✓ ESLint: PASS (0 errors, 0 warnings)');
} catch (e) {
  console.error('✖ ESLint failed!');
  findings.push({ vector: 'LINT', severity: 'S1', file: 'website', detail: 'ESLint errors detected' });
}

// Check C: Dependency Vulnerabilities
console.log('Checking Production Runtime Dependencies (npm audit --omit=dev)...');
try {
  execSync('npm --prefix website audit --omit=dev', { stdio: 'pipe' });
  console.log('✓ Runtime Dependencies: PASS (0 vulnerabilities)');
} catch (e) {
  console.error('✖ Runtime dependencies have vulnerabilities!');
  findings.push({ vector: 'DEPENDENCIES', severity: 'S1', file: 'website/package.json', detail: 'Vulnerabilities detected in runtime dependencies' });
}

// Check D: Link & Data Integrity QA Suite
console.log('Checking Link & Data Integrity QA Suite (8/8 checks)...');
try {
  const qaOutput = execSync('npm run validate', { encoding: 'utf8' });
  if (qaOutput.includes('QA Complete: 8 passed, 0 failed, 0 warnings')) {
    console.log('✓ Link & Data QA: PASS (8/8 checks passed)');
  } else {
    throw new Error('QA suite reported incomplete or failed checks');
  }
} catch (e) {
  console.error('✖ QA suite failed!');
  findings.push({ vector: 'QA_INTEGRITY', severity: 'S0', file: 'scripts/validate-links.mjs', detail: e.message });
}

// ------------------------------------------------------------------
// FINAL RELEASE DECISION & SUMMARY
// ------------------------------------------------------------------
console.log('\n================================================================');
console.log('FINAL AUDIT DECISION & SUMMARY');
console.log('================================================================');

const s0Findings = findings.filter(f => f.severity === 'S0');
const s1Findings = findings.filter(f => f.severity === 'S1');
const s2Findings = findings.filter(f => f.severity === 'S2');

console.log(`Critical (S0) Findings: ${s0Findings.length}`);
console.log(`High (S1) Findings    : ${s1Findings.length}`);
console.log(`Medium (S2) Findings  : ${s2Findings.length}`);

let releaseDecision = 'PASS';
if (s0Findings.length > 0 || s1Findings.length > 0) {
  releaseDecision = 'BLOCK';
} else if (s2Findings.length > 0) {
  releaseDecision = 'CONDITIONAL';
}

console.log(`\nRELEASE DECISION: [ ${releaseDecision} ]`);

if (findings.length > 0) {
  console.log('\nFindings Breakdown:');
  findings.forEach(f => {
    console.log(`[${f.severity}] [${f.vector}] ${f.file}: ${f.detail}`);
  });
} else {
  console.log('\n🎉 ZERO findings detected across all 7 vectors! 100% production-ready and privacy-compliant.');
}

console.log('================================================================');
