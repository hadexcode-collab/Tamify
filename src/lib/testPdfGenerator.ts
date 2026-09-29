/**
 * Test PDF Generator for Tamil Archival Documents
 * Creates authentic vintage archival / governmental scanned PDFs with seals, stamps,
 * typewriter margins, and tabular sections for testing and publication.
 */
import { jsPDF } from 'jspdf';
import { DocumentSample } from '../types';

export async function generateTestPdfBlob(sample: DocumentSample): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 595.28 pt
  const pageHeight = doc.internal.pageSize.getHeight(); // 841.89 pt

  // We render a high-DPI canvas to support crisp rendering of Tamil glyphs in the PDF
  const canvas = document.createElement('canvas');
  const scale = 2; // High-DPI scale for sharp text
  canvas.width = pageWidth * scale;
  canvas.height = pageHeight * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // Scale context
  ctx.scale(scale, scale);

  // Background: Aged archival paper tone
  ctx.fillStyle = sample.sourceType === 'TYPEWRITER' ? '#F9F7F1' : '#FAF8F5';
  ctx.fillRect(0, 0, pageWidth, pageHeight);

  // Subtle vintage paper grain / borders
  ctx.strokeStyle = '#D6CEBE';
  ctx.lineWidth = 1;
  ctx.strokeRect(28, 28, pageWidth - 56, pageHeight - 56);

  ctx.strokeStyle = '#E8E2D5';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(32, 32, pageWidth - 64, pageHeight - 64);

  // Top Archive Stamp / Watermark
  ctx.save();
  ctx.translate(pageWidth - 140, 60);
  ctx.rotate(-0.08);
  ctx.strokeStyle = '#B91C1C';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(0, 0, 105, 36);
  ctx.fillStyle = '#B91C1C';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('SECRETARIAT ARCHIVE', 6, 14);
  ctx.font = 'bold 8px monospace';
  ctx.fillText(`REF: TN-ARC/${sample.year}`, 6, 26);
  ctx.restore();

  // Seal Emblem
  ctx.save();
  ctx.fillStyle = '#1E3A8A';
  ctx.strokeStyle = '#1E3A8A';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(60, 62, 18, 0, Math.PI * 2);
  ctx.stroke();
  ctx.font = 'bold 7px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('TAMIL NADU', 60, 60);
  ctx.fillText('GOVT ARCHIVE', 60, 68);
  ctx.restore();

  // Document Title Header
  let y = 60;
  ctx.fillStyle = '#111827';
  ctx.textAlign = 'center';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('தமிழ்நாடு அரசு (GOVERNMENT OF TAMIL NADU)', pageWidth / 2, y);

  y += 20;
  ctx.font = 'bold 12px sans-serif';
  ctx.fillStyle = '#1F2937';
  ctx.fillText(sample.tamilTitle, pageWidth / 2, y);

  y += 16;
  ctx.strokeStyle = '#4B5563';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(45, y);
  ctx.lineTo(pageWidth - 45, y);
  ctx.stroke();

  y += 20;

  // Metadata Subhead
  ctx.textAlign = 'left';
  ctx.font = 'bold 10px monospace';
  ctx.fillStyle = '#4B5563';
  ctx.fillText(`TEST PDF ARCHIVE SPECIMEN • YEAR: ${sample.year} • TYPE: ${sample.sourceType}`, 45, y);
  ctx.fillText(`ENCODING: ${sample.defaultEncoding}`, pageWidth - 200, y);

  y += 22;

  // Render Body Lines
  const textLines = sample.rawText.split('\n');
  const maxWidth = pageWidth - 90;

  ctx.font = '11px sans-serif';
  ctx.fillStyle = '#1F2937';

  let inTable = false;

  for (let i = 0; i < textLines.length; i++) {
    const rawLine = textLines[i].trim();

    if (!rawLine) {
      y += 10;
      continue;
    }

    // Check if table row
    if (rawLine.includes('|')) {
      inTable = true;
      const cols = rawLine.split('|').map((c) => c.trim());
      const colWidth = maxWidth / cols.length;

      ctx.fillStyle = y < 400 && i < 15 ? '#F3F4F6' : '#FFFFFF';
      ctx.fillRect(45, y - 11, maxWidth, 18);
      ctx.strokeStyle = '#9CA3AF';
      ctx.strokeRect(45, y - 11, maxWidth, 18);

      ctx.fillStyle = '#111827';
      ctx.font = cols[0] === 'வ.எண்' || cols[0] === 'வ. எண்' || cols[0] === 'பண்டிகை / நிகழ்வு'
        ? 'bold 10px sans-serif'
        : '10px sans-serif';

      cols.forEach((colText, colIdx) => {
        const cellX = 50 + colIdx * colWidth;
        ctx.fillText(colText, cellX, y + 2);
        if (colIdx > 0) {
          ctx.beginPath();
          ctx.moveTo(45 + colIdx * colWidth, y - 11);
          ctx.lineTo(45 + colIdx * colWidth, y + 7);
          ctx.stroke();
        }
      });

      y += 20;
      continue;
    } else {
      inTable = false;
    }

    // Section headers
    if (
      rawLine.startsWith('அரசாணை') ||
      rawLine.startsWith('பார்வை:') ||
      rawLine.startsWith('ஆணை:') ||
      rawLine.startsWith('சொத்து விவரமும்') ||
      rawLine.startsWith('நான்கு மால்') ||
      rawLine.startsWith('சுருக்கம்') ||
      rawLine.startsWith('கிரயப் பத்திரம்') ||
      rawLine.startsWith('பொது (நிர்வாகம்)')
    ) {
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#111827';
      y += 6;
      ctx.fillText(rawLine, 45, y);
      y += 18;
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#1F2937';
      continue;
    }

    // Signatures
    if (rawLine.startsWith('(ஆளுநரின்') || rawLine.startsWith('(MSeupd;')) {
      y += 12;
      ctx.font = 'italic 10.5px sans-serif';
      ctx.fillText(rawLine, pageWidth - 200, y);
      y += 16;
      continue;
    }

    if (rawLine.includes('கூடுதல் தலைமைச் செயலாளர்') || rawLine.includes('Kjd;ikr; nrayhsh;')) {
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(rawLine, pageWidth - 200, y);
      y += 18;
      continue;
    }

    // Standard paragraphs - wrap if necessary
    ctx.font = '10.5px sans-serif';
    ctx.fillStyle = '#27272A';
    wrapText(ctx, rawLine, 45, y, maxWidth, 16, (lineStr, lineY) => {
      ctx.fillText(lineStr, 45, lineY);
      y = lineY;
    });

    y += 18;

    // Avoid overflowing single page
    if (y > pageHeight - 75) {
      break;
    }
  }

  // Bottom Verification Footer & Seal
  ctx.save();
  ctx.strokeStyle = '#D1D5DB';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(45, pageHeight - 55);
  ctx.lineTo(pageWidth - 45, pageHeight - 55);
  ctx.stroke();

  ctx.font = 'bold 8px monospace';
  ctx.fillStyle = '#6B7280';
  ctx.textAlign = 'left';
  ctx.fillText('AUTHENTIC TEST DATASET • GOVT ARCHIVES OF TAMIL NADU • SENTHAMIL OCR BENCHMARK', 45, pageHeight - 40);
  ctx.textAlign = 'right';
  ctx.fillText(`SPECIMEN ID: ${sample.id} • PAGE 1 OF 1`, pageWidth - 45, pageHeight - 40);
  ctx.restore();

  // Convert canvas to image and embed into jsPDF
  const imgData = canvas.toDataURL('image/png', 1.0);
  doc.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);

  const pdfArrayBuffer = doc.output('arraybuffer');
  return new Blob([pdfArrayBuffer], { type: 'application/pdf' });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  onLine: (line: string, y: number) => void
) {
  const words = text.split(' ');
  let currentLine = '';
  let curY = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine ? currentLine + ' ' + words[i] : words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      onLine(currentLine, curY);
      currentLine = words[i];
      curY += lineHeight;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    onLine(currentLine, curY);
  }
}
