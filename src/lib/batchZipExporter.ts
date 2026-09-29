/**
 * Batch ZIP Exporter for Unicode DOCX files
 * Bundles multiple generated Tamil Word (.docx) documents with TAU-Marutham font into a single ZIP archive.
 */
import JSZip from 'jszip';
import { BatchQueueItem, BatchZipExportConfig } from '../types';
import { generateTamilDocxBlob } from './docxGenerator';

export async function exportBatchToZip(
  items: BatchQueueItem[],
  config: BatchZipExportConfig,
  onProgress?: (percent: number, currentItemName: string) => void
): Promise<{ blob: Blob; filename: string; totalExported: number }> {
  const zip = new JSZip();
  const eligibleItems = items.filter(
    (item) => item.status === 'COMPLETED' && item.result && item.selectedForExport !== false
  );

  if (eligibleItems.length === 0) {
    throw new Error('No completed documents available to export.');
  }

  const docxFolder = zip.folder('DOCX_Files') || zip;
  let textFolder: JSZip | null = null;
  let jsonFolder: JSZip | null = null;

  if (config.includeTextFiles) {
    textFolder = zip.folder('Plain_Text_UTF8');
  }
  if (config.includeJsonReports) {
    jsonFolder = zip.folder('Metadata_JSON');
  }

  const manifestEntries: Array<{
    index: number;
    name: string;
    title: string;
    confidence: number;
    lines: number;
    encoding: string;
    docxName: string;
  }> = [];

  let totalWordsAcrossAll = 0;
  let totalConfidenceSum = 0;

  for (let i = 0; i < eligibleItems.length; i++) {
    const item = eligibleItems[i];
    const result = item.result!;
    const safeBaseName = sanitizeFilename(
      item.name.replace(/\.[^/.]+$/, '') || `Tamil_Doc_${i + 1}`
    );

    const docxFileName = `${String(i + 1).padStart(2, '0')}_${safeBaseName}_Tau-marutham.docx`;

    if (onProgress) {
      const stepPercent = Math.round(((i + 0.5) / eligibleItems.length) * 80);
      onProgress(stepPercent, `Generating DOCX for: ${item.name}`);
    }

    // Generate individual genuine DOCX blob with TAU-Marutham font
    const docxBlob = await generateTamilDocxBlob(result, {
      documentTitle: result.metadata?.documentTitle || item.name,
      fontFamily: config.fontFamily || 'TAU-Marutham',
      fontSize: config.fontSize || 12,
      includeHeaderLetterhead: config.includeLetterhead,
      letterheadText: 'தமிழ்நாடு அரசு / GOVERNMENT OF TAMIL NADU',
      subLetterheadText: result.metadata?.department || 'தலைமைச் செயலகம், சென்னை',
      includeDocumentMetadata: config.includeMetadataBox,
      tableBorderColor: 'CBD5E0',
      lineSpacing: 1.25,
      pageOrientation: 'portrait',
      includePronunciationAppendix: config.includeAppendix,
      includeConfidenceSummary: false
    });

    docxFolder.file(docxFileName, docxBlob);

    // Optional plain text file
    if (config.includeTextFiles && textFolder) {
      const txtContent = result.lines.map((l) => l.tamilText).join('\n');
      textFolder.file(`${String(i + 1).padStart(2, '0')}_${safeBaseName}.txt`, txtContent);
    }

    // Optional JSON report
    if (config.includeJsonReports && jsonFolder) {
      const jsonContent = JSON.stringify(
        {
          sourceFileName: item.name,
          detectedEncoding: result.detectedEncoding,
          encodingConfidence: result.encodingConfidence,
          overallConfidence: result.overallConfidence,
          metadata: result.metadata,
          linesCount: result.lines.length,
          tablesCount: (result.tables || []).length,
          morphologyStats: result.morphologyStats,
          exportedFont: config.fontFamily || 'TAU-Marutham',
          processingTimeMs: item.durationMs || result.processingTimeMs
        },
        null,
        2
      );
      jsonFolder.file(`${String(i + 1).padStart(2, '0')}_${safeBaseName}_metadata.json`, jsonContent);
    }

    // Count stats for manifest
    const wordCount = result.lines.reduce((acc, l) => acc + (l.words?.length || 0), 0);
    totalWordsAcrossAll += wordCount;
    totalConfidenceSum += result.overallConfidence;

    manifestEntries.push({
      index: i + 1,
      name: item.name,
      title: result.metadata?.documentTitle || item.name,
      confidence: result.overallConfidence,
      lines: result.lines.length,
      encoding: result.detectedEncoding,
      docxName: docxFileName
    });
  }

  // Create Batch Manifest if requested
  if (config.includeBatchManifest) {
    const avgConfidence = (totalConfidenceSum / eligibleItems.length) * 100;
    const manifestText = `========================================================================
Tamify DOCX - BATCH PROCESSING EXPORT MANIFEST
========================================================================
Generated At: ${new Date().toLocaleString('ta-IN', { timeZone: 'Asia/Kolkata' })} (IST)
Target Font: ${config.fontFamily || 'TAU-Marutham'} (மருதம் - Tamil Unicode Standard)
Total Processed Documents: ${eligibleItems.length}
Total Extracted Words: ${totalWordsAcrossAll}
Average OCR Confidence: ${avgConfidence.toFixed(2)}%
Generated with: Gemini 3.7 Flash OCR Ensemble & Tamil Morphological Sandhi Engine

DOCUMENT LIST:
------------------------------------------------------------------------
${manifestEntries
  .map(
    (e) =>
      `[${e.index}] ${e.docxName}
    • Original Source: ${e.name}
    • Title: ${e.title}
    • Encoding Detected: ${e.encoding}
    • Confidence Score: ${(e.confidence * 100).toFixed(1)}% | Lines: ${e.lines}`
  )
  .join('\n\n')}
========================================================================
Font Compatibility Note:
The DOCX documents are styled with '${config.fontFamily || 'TAU-Marutham'}' font. 
On systems where TAU-Marutham is installed, Word will render crisp authentic Tamil typography.
Fallback font family: Nirmala UI / Noto Sans Tamil / Latha.
========================================================================`;

    zip.file('BATCH_MANIFEST.txt', manifestText);
  }

  if (onProgress) {
    onProgress(90, 'Compressing ZIP archive...');
  }

  // Generate final ZIP blob
  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    },
    (metadata) => {
      if (onProgress) {
        onProgress(90 + Math.round(metadata.percent * 0.1), 'Packaging ZIP stream...');
      }
    }
  );

  const cleanZipName = config.zipFileName?.trim()
    ? (config.zipFileName.endsWith('.zip') ? config.zipFileName : `${config.zipFileName}.zip`)
    : `Tamil_Unicode_DOCX_Batch_Tau-marutham_${Date.now().toString().slice(-6)}.zip`;

  return {
    blob: zipBlob,
    filename: cleanZipName,
    totalExported: eligibleItems.length
  };
}

function sanitizeFilename(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '_').replace(/\s+/g, '_');
}
