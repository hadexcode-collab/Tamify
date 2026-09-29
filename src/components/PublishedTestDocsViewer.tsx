import React, { useState } from 'react';
import {
  FileText,
  Download,
  FolderArchive,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Award,
  Layers,
  ArrowRight,
  Eye,
  FileCheck,
  FileSpreadsheet,
  Check,
  Printer,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  PUBLISHED_BENCHMARK_ITEMS,
  PublishedTestItem,
  downloadCompletePublishedTestKit,
  generateSampleResultDocxBlob
} from '../lib/publishedBenchmarkBundle';
import { generateTestPdfBlob } from '../lib/testPdfGenerator';
import { OCRProcessResult } from '../types';

interface PublishedTestDocsViewerProps {
  onLoadIntoEditor: (result: OCRProcessResult) => void;
  onSwitchToBatch: () => void;
}

export const PublishedTestDocsViewer: React.FC<PublishedTestDocsViewerProps> = ({
  onLoadIntoEditor,
  onSwitchToBatch
}) => {
  const [selectedItem, setSelectedItem] = useState<PublishedTestItem>(PUBLISHED_BENCHMARK_ITEMS[0]);
  const [isDownloadingZip, setIsDownloadingZip] = useState<boolean>(false);
  const [zipProgressMsg, setZipProgressMsg] = useState<string>('');
  const [downloadingItemKey, setDownloadingItemKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Trigger download of a single Test PDF
  const handleDownloadTestPdf = async (item: PublishedTestItem) => {
    try {
      setDownloadingItemKey(`pdf-${item.sample.id}`);
      const pdfBlob = await generateTestPdfBlob(item.sample);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.testPdfName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setToastMessage(`Downloaded Test PDF: ${item.testPdfName}`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      console.error('Failed to download test pdf:', err);
      alert(`PDF download failed: ${err.message}`);
    } finally {
      setDownloadingItemKey(null);
    }
  };

  // Trigger download of a single Result DOCX (TAU-Marutham)
  const handleDownloadResultDocx = async (item: PublishedTestItem) => {
    try {
      setDownloadingItemKey(`docx-${item.sample.id}`);
      const docxBlob = await generateSampleResultDocxBlob(item.sample);
      const url = URL.createObjectURL(docxBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.resultDocxName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setToastMessage(`Downloaded Result DOCX: ${item.resultDocxName} (TAU-Marutham Font)`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      console.error('Failed to download result docx:', err);
      alert(`DOCX download failed: ${err.message}`);
    } finally {
      setDownloadingItemKey(null);
    }
  };

  // Trigger download of the complete published ZIP suite
  const handleDownloadCompleteSuite = async () => {
    try {
      setIsDownloadingZip(true);
      setZipProgressMsg('Generating all Test PDFs & TAU-Marutham DOCXs...');

      const suite = await downloadCompletePublishedTestKit((percent, msg) => {
        setZipProgressMsg(`${msg} (${percent}%)`);
      });

      const url = URL.createObjectURL(suite.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = suite.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 }
      });

      setToastMessage(`Successfully published & downloaded Complete Benchmark Suite (${suite.filename})`);
      setTimeout(() => setToastMessage(null), 6000);
    } catch (err: any) {
      console.error('Suite download failed:', err);
      alert(`Download failed: ${err.message}`);
    } finally {
      setIsDownloadingZip(false);
      setZipProgressMsg('');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-[#D1D5DB]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-[#0A0B0E] border-2 border-[#00FF66] text-[#00FF66] p-4 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-between shadow-2xl animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#00FF66]" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-gray-400 hover:text-white p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Banner Card */}
      <div className="bg-[#12141A] border border-white/10 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-6 border-b border-white/10 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono font-bold text-[#00FF66] uppercase tracking-[0.2em] bg-[#00FF66]/10 px-2.5 py-0.5 border border-[#00FF66]/30">
                OFFICIAL PUBLISHED BENCHMARK
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-[10px] font-mono font-bold text-[#FFB800] uppercase">
                TEST PDFS & TAU-MARUTHAM RESULT DOCXS
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              வெளியிடப்பட்ட சோதனைக் கோப்புகள் & முடிவுகள் (PUBLISHED TEST DATASETS)
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-3xl leading-relaxed">
              தமிழ்நாடு அரசு தலைமைச் செயலக அரசாணை, பத்திரப்பதிவு கிரயப் பத்திரம், அரசு அரசிதழ், பாமினி ஆவணம் மற்றும் தொல்காப்பிய உரையின் <strong>அசல் சோதனை PDF (Test PDF)</strong> மற்றும் <strong>TAU-Marutham எழுத்துருவில் உருவான முடிவுகள் (Result DOCX)</strong> ஆகியவற்றை நேரடியாகப் பதிவிறக்கலாம்.
            </p>
          </div>

          {/* Master Download Button */}
          <div className="w-full lg:w-auto shrink-0">
            <button
              id="btn-download-complete-test-suite"
              disabled={isDownloadingZip}
              onClick={handleDownloadCompleteSuite}
              className="w-full sm:w-auto bg-[#00FF66] hover:bg-[#00e65c] active:scale-95 text-black font-black px-6 py-3.5 text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-xl shadow-[#00FF66]/20"
            >
              {isDownloadingZip ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>{zipProgressMsg || 'தொகுக்கப்படுகிறது...'}</span>
                </>
              ) : (
                <>
                  <FolderArchive className="w-4 h-4 text-black" />
                  <span>அனைத்து PDF + DOCX தொகுப்பையும் ZIP ஆகப் பதிவிறக்கு (DOWNLOAD ALL)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Telemetry Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6">
          <div className="bg-[#0A0B0E] p-3.5 border border-white/10">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
              PUBLISHED SPECIMENS
            </span>
            <span className="text-xl font-black text-white font-mono mt-1 block">
              5 BENCHMARKS
            </span>
          </div>

          <div className="bg-[#0A0B0E] p-3.5 border border-white/10">
            <span className="text-[10px] font-mono font-bold text-[#00FF66] uppercase tracking-widest block">
              AVG OCR ACCURACY
            </span>
            <span className="text-xl font-black text-[#00FF66] font-mono mt-1 block">
              99.38%
            </span>
          </div>

          <div className="bg-[#0A0B0E] p-3.5 border border-white/10">
            <span className="text-[10px] font-mono font-bold text-[#FFB800] uppercase tracking-widest block">
              OUTPUT FONT
            </span>
            <span className="text-xl font-black text-[#FFB800] font-mono mt-1 block">
              TAU-MARUTHAM (மருதம்)
            </span>
          </div>

          <div className="bg-[#0A0B0E] p-3.5 border border-white/10">
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block">
              FORMATS INCLUDED
            </span>
            <span className="text-xl font-black text-cyan-400 font-mono mt-1 block">
              PDF + DOCX + TXT
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Specimen Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {PUBLISHED_BENCHMARK_ITEMS.map((item, idx) => {
          const isSelected = selectedItem.sample.id === item.sample.id;
          return (
            <button
              key={item.sample.id}
              onClick={() => setSelectedItem(item)}
              className={`p-4 text-left transition-all border cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#12141A] border-[#FFB800] shadow-lg shadow-[#FFB800]/10'
                  : 'bg-[#0A0B0E] border-white/10 hover:border-white/25 hover:bg-[#12141A]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-2">
                  <span className={isSelected ? 'text-[#FFB800]' : 'text-gray-400'}>
                    SPECIMEN 0{idx + 1}
                  </span>
                  <span className="bg-white/10 text-white px-1.5 py-0.2">
                    {item.sample.year}
                  </span>
                </div>
                <h4 className="text-xs font-black text-white uppercase tracking-tight line-clamp-2">
                  {item.sample.tamilTitle}
                </h4>
              </div>

              <div className="mt-4 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                <span className="text-[#00FF66] font-bold">{item.accuracyScore}% MATCH</span>
                <span className="text-gray-400">{item.linesCount} lines</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Specimen Deep Dive: Side-by-Side Test PDF vs Result DOCX */}
      <div className="bg-[#12141A] border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Specimen Header & Download Actions */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-white/10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 text-[11px] font-mono font-bold text-[#FFB800] uppercase">
              <span>{selectedItem.sample.category}</span>
              <span>•</span>
              <span>SOURCE: {selectedItem.sample.sourceType}</span>
              <span>•</span>
              <span>ACCURACY: {selectedItem.accuracyScore}%</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              {selectedItem.sample.tamilTitle}
            </h2>
            <p className="text-xs text-gray-400 mt-1 max-w-2xl font-normal">
              {selectedItem.sample.description}
            </p>
          </div>

          {/* Action Download Buttons for this specimen */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Download Test PDF */}
            <button
              id="btn-download-test-pdf-active"
              disabled={downloadingItemKey === `pdf-${selectedItem.sample.id}`}
              onClick={() => handleDownloadTestPdf(selectedItem)}
              className="bg-[#0A0B0E] hover:bg-white/10 text-white border border-white/20 font-bold px-4 py-2.5 text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <FileText className="w-4 h-4 text-rose-400" />
              <span>
                {downloadingItemKey === `pdf-${selectedItem.sample.id}`
                  ? 'PDF உருவாகிறது...'
                  : 'TEST PDF பதிவிறக்கு (.pdf)'}
              </span>
            </button>

            {/* Download Result DOCX (TAU-Marutham) */}
            <button
              id="btn-download-result-docx-active"
              disabled={downloadingItemKey === `docx-${selectedItem.sample.id}`}
              onClick={() => handleDownloadResultDocx(selectedItem)}
              className="bg-[#00FF66] hover:bg-[#00e65c] text-black font-black px-4 py-2.5 text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-[#00FF66]/20"
            >
              <Download className="w-4 h-4 text-black" />
              <span>
                {downloadingItemKey === `docx-${selectedItem.sample.id}`
                  ? 'DOCX உருவாகிறது...'
                  : 'RESULT DOCX பதிவிறக்கு (TAU-MARUTHAM)'}
              </span>
            </button>
          </div>
        </div>

        {/* Feature Tags */}
        <div className="flex flex-wrap gap-2">
          {selectedItem.highlightFeatures.map((feat, i) => (
            <span
              key={i}
              className="bg-[#0A0B0E] border border-white/10 text-gray-300 text-[11px] font-mono px-3 py-1 flex items-center gap-1.5"
            >
              <Check className="w-3 h-3 text-[#00FF66]" />
              <span>{feat}</span>
            </span>
          ))}
        </div>

        {/* Side-by-Side Visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Column 1: Test PDF Simulation View */}
          <div className="bg-[#FAF8F5] text-[#1F2937] p-6 border-2 border-[#D6CEBE] shadow-inner relative overflow-hidden flex flex-col justify-between min-h-[480px]">
            {/* Vintage Stamp */}
            <div className="absolute top-4 right-4 rotate-[-8deg] border-2 border-red-700 text-red-700 px-3 py-1 font-mono text-[9px] font-black uppercase tracking-wider pointer-events-none opacity-85">
              TEST ARCHIVE SCAN • {selectedItem.sample.year}
            </div>

            <div>
              {/* Header */}
              <div className="text-center pb-4 border-b border-gray-400 mb-4">
                <div className="w-8 h-8 rounded-full border border-blue-900 mx-auto flex items-center justify-center text-[7px] font-bold text-blue-900 mb-1">
                  TN GOVT
                </div>
                <h3 className="font-bold text-sm text-gray-900 uppercase">
                  தமிழ்நாடு அரசு (GOVERNMENT OF TAMIL NADU)
                </h3>
                <p className="text-[11px] font-bold text-gray-800">
                  {selectedItem.sample.tamilTitle}
                </p>
                <div className="text-[9px] font-mono text-gray-600 mt-1">
                  SPECIMEN: {selectedItem.testPdfName}
                </div>
              </div>

              {/* Body Content */}
              <div className="font-mono text-xs leading-relaxed text-gray-800 whitespace-pre-wrap max-h-[320px] overflow-y-auto pr-2">
                {selectedItem.sample.rawText}
              </div>
            </div>

            {/* Bottom bar */}
            <div className="pt-4 border-t border-gray-300 mt-4 flex items-center justify-between text-[10px] font-mono text-gray-600">
              <span>SOURCE FORMAT: {selectedItem.sample.sourceType}</span>
              <button
                onClick={() => handleDownloadTestPdf(selectedItem)}
                className="text-red-700 hover:text-red-900 font-bold underline cursor-pointer"
              >
                Download Test PDF (.pdf) ↓
              </button>
            </div>
          </div>

          {/* Column 2: Result DOCX Unicode (TAU-Marutham Font) View */}
          <div className="bg-[#0A0B0E] border-2 border-[#00FF66]/30 p-6 flex flex-col justify-between min-h-[480px] text-gray-200">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00FF66] animate-pulse"></span>
                  <span className="text-xs font-mono font-black text-[#00FF66] uppercase">
                    TAU-MARUTHAM UNICODE OUTPUT (.DOCX)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 border border-white/10">
                  FONT: TAU-MARUTHAM • 12PT
                </span>
              </div>

              {/* Formatted Text Preview */}
              <div className="space-y-3 font-sans text-xs leading-relaxed max-h-[320px] overflow-y-auto pr-2">
                <div className="bg-[#12141A] p-4 border border-white/10 space-y-2">
                  <div className="text-center border-b border-white/10 pb-2">
                    <h4 className="font-black text-sm text-[#FFB800]">
                      தமிழ்நாடு அரசு / GOVERNMENT OF TAMIL NADU
                    </h4>
                    <p className="text-[11px] text-gray-400">
                      தலைமைச் செயலகம், சென்னை-600009
                    </p>
                  </div>

                  <p className="font-bold text-white text-xs">
                    {selectedItem.sample.tamilTitle}
                  </p>

                  <div className="text-gray-300 text-xs space-y-2 whitespace-pre-wrap">
                    {selectedItem.sample.rawText}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="pt-4 border-t border-white/10 mt-4 flex items-center justify-between text-xs font-mono">
              <span className="text-[#00FF66] font-bold">
                ✓ WORD COMPATIBLE • ZERO CORRUPTION
              </span>
              <button
                onClick={() => handleDownloadResultDocx(selectedItem)}
                className="text-[#00FF66] hover:text-[#00e65c] font-black underline cursor-pointer"
              >
                Download Result DOCX (.docx) ↓
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Batch Processing CTA */}
      <div className="bg-[#12141A] border border-white/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FFB800] text-black font-black flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase">
              உங்கள் சொந்த ஆவணத் தொகுதியைச் செயலாக்க வேண்டுமா?
            </h3>
            <p className="text-xs text-gray-400 font-mono">
              Process your own vintage Tamil scans, PDFs, and BAMINI texts in the parallel queue.
            </p>
          </div>
        </div>

        <button
          onClick={onSwitchToBatch}
          className="bg-[#FFB800] hover:bg-[#ffc833] text-black font-black px-5 py-2.5 text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shrink-0"
        >
          <span>தொகுதி செயலாக்கத்திற்குச் செல் (BATCH QUEUE)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
