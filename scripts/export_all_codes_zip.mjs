import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

const rootDir = process.cwd();
const outputDirDist = path.join(rootDir, 'dist', 'download');
const outputDirPublic = path.join(rootDir, 'public', 'download');

fs.mkdirSync(outputDirDist, { recursive: true });
fs.mkdirSync(outputDirPublic, { recursive: true });

// Ignored folders and files
const IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  '.cache',
  '.npm',
  '.next',
  '.DS_Store',
  'tamify.exe',
  'Tamify-Desktop-x64.exe',
  'Tamify_Windows_Desktop_x64.zip',
  'tamify-windows-x64.zip',
  'tamify-all-codes.zip',
  'Tamify_Complete_Source_Code.zip'
];

function shouldInclude(relPath) {
  const parts = relPath.split(path.sep);
  for (const part of parts) {
    if (IGNORE_PATTERNS.includes(part)) return false;
  }
  // Exclude large binary stubs if any
  if (relPath.includes('stub--win32--x64')) return false;
  return true;
}

function getAllFiles(dir, baseDir = dir) {
  let results = [];
  const list = fs.readdirSync(dir);

  for (const file of list) {
    const fullPath = path.join(dir, file);
    const relPath = path.relative(baseDir, fullPath);

    if (!shouldInclude(relPath)) continue;

    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, baseDir));
    } else {
      results.push({ fullPath, relPath, size: stat.size });
    }
  }

  return results;
}

export async function createAllCodesZip() {
  console.log('📦 Collecting all source code files from Tamify project...');
  const zip = new JSZip();
  const files = getAllFiles(rootDir);

  console.log(`Found ${files.length} code and configuration files to package.`);

  for (const { fullPath, relPath } of files) {
    // Normalise zip path to forward slashes
    const zipPath = relPath.split(path.sep).join('/');
    const content = fs.readFileSync(fullPath);
    zip.file(zipPath, content);
  }

  // Generate a dedicated README.md if not present or as a guide inside zip
  const readmeContent = `# Tamify • தமிழ் ஆவண அரங்கம் (Complete Source Code)
# Indian Languages & Document Conversion Studio

This archive contains the **complete, full source code** of Tamify.

## 🚀 Quick Start Instructions

### 1. Prerequisites
- **Node.js**: Version 18.0.0 or later (Recommended: v20 or v22 LTS)
- **npm** or **bun** or **yarn**

### 2. Installation
Open a terminal in this extracted directory and run:

\`\`\`bash
npm install
\`\`\`

### 3. Running in Development Mode
Start the local full-stack server (Vite + Express):

\`\`\`bash
npm run dev
\`\`\`

Once started, open your browser at:
👉 **http://localhost:3000**

---

## 🛠️ Project Structure

- \`src/\`
  - \`components/\`: UI components (PDF to Excel, PDF to Word, Official Reply Letter, PDF Editor, Multi-language Studio, Typewriter, etc.)
  - \`lib/\`: Core conversion engines, Tamil morphology, Word & Excel generators, OCR fallbacks, and font conversion algorithms
  - \`types.ts\`: Shared TypeScript interfaces and language definitions
  - \`App.tsx\`: Main single-page application orchestrator
- \`server.ts\`: Express backend providing Cloud AI Vision ensemble, document parsers, and local API endpoints
- \`scripts/\`: Build tools, Windows executable packager (\`build_windows_suite.mjs\`), and export utilities
- \`python_offline_suite/\`: Fully standalone offline Python scripts and OCR tools
- \`public/\`: Fonts, SVG logos, sample Tamil test documents, and assets

---

## 📦 Building for Production

\`\`\`bash
npm run build
\`\`\`

To build the standalone Windows portable executable (\`tamify.exe\`):
\`\`\`bash
npm run build:exe
\`\`\`

---
*Created with Tamify Document Studio*
`;

  zip.file('README.md', readmeContent);

  console.log('🗜️ Compressing project zip archive...');
  const zipBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });

  const targetDist1 = path.join(outputDirDist, 'tamify-all-codes.zip');
  const targetDist2 = path.join(outputDirDist, 'Tamify_Complete_Source_Code.zip');
  const targetPub1 = path.join(outputDirPublic, 'tamify-all-codes.zip');
  const targetPub2 = path.join(outputDirPublic, 'Tamify_Complete_Source_Code.zip');

  fs.writeFileSync(targetDist1, zipBuffer);
  fs.writeFileSync(targetDist2, zipBuffer);
  fs.writeFileSync(targetPub1, zipBuffer);
  fs.writeFileSync(targetPub2, zipBuffer);

  const mb = (zipBuffer.length / (1024 * 1024)).toFixed(2);
  console.log(`✅ Success! Created all-codes zip: ${zipBuffer.length} bytes (${mb} MB) with ${files.length + 1} files.`);
  return {
    size: zipBuffer.length,
    sizeFormatted: `${mb} MB`,
    fileCount: files.length + 1,
    distPath: targetDist1,
    publicPath: targetPub1
  };
}

// Auto-run if executed directly
if (process.argv[1] && process.argv[1].endsWith('export_all_codes_zip.mjs')) {
  createAllCodesZip().catch(err => {
    console.error('Error creating all codes zip:', err);
    process.exit(1);
  });
}
