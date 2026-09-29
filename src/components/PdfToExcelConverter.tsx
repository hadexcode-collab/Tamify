import React, { useState, useRef, useEffect } from 'react';
import {
  FileSpreadsheet,
  UploadCloud,
  Sparkles,
  Download,
  CheckCircle2,
  Table as TableIcon,
  Copy,
  Check,
  FileText,
  RefreshCw,
  Eye,
  AlertCircle,
  FileDown,
  Layers,
  Settings2,
  FolderOpen,
  Languages
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { OCRProcessResult, TableBlock, DocumentSample, OfficialIndianLanguageCode, OFFICIAL_INDIAN_LANGUAGES } from '../types';
import { SAMPLE_DOCUMENTS } from '../lib/sampleDocuments';
import {
  executePdfToExcelConversion,
  downloadTamilExcelFile,
  downloadTableCsv,
  downloadSingleTableExcel,
  tableToTsv,
  extractStructuredTablesFromResult,
  countPdfPages
} from '../lib/excelGenerator';
import { generateTestPdfBlob } from '../lib/testPdfGenerator';

interface PdfToExcelConverterProps {
  initialResult?: OCRProcessResult | null;
  initialFile?: File | null;
  onOpenInEditor?: (result: OCRProcessResult) => void;
  selectedLanguage?: OfficialIndianLanguageCode;
  onSelectLanguage?: (lang: OfficialIndianLanguageCode) => void;
}

export const PdfToExcelConverter: React.FC<PdfToExcelConverterProps> = ({
  initialResult,
  initialFile,
  onOpenInEditor,
  selectedLanguage: externalLanguage = 'auto',
  onSelectLanguage
}) => {
  // Input State
  const [selectedLanguage, setSelectedLanguage] = useState<OfficialIndianLanguageCode>(externalLanguage);

  useEffect(() => {
    if (externalLanguage) {
      setSelectedLanguage(externalLanguage);
    }
  }, [externalLanguage]);

  const handleLanguageChange = (code: OfficialIndianLanguageCode) => {
    setSelectedLanguage(code);
    onSelectLanguage?.(code);
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedSample, setSelectedSample] = useState<DocumentSample | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [documentTitle, setDocumentTitle] = useState<string>('தமிழ்_அரசாணை_அட்டவணை');
  const [detectedPageCount, setDetectedPageCount] = useState<number | null>(null);
  const [pageProgress, setPageProgress] = useState<{ current: number; total: number } | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Helper to process any selected or dropped file
  const processUploadedFile = async (file: File) => {
    setSelectedFile(file);
    setSelectedSample(null);
    setDocumentTitle(file.name.replace(/\.[^/.]+$/, ''));
    setError(null);
    setPageProgress(null);

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (isPdf) {
      try {
        const pages = await countPdfPages(file);
        setDetectedPageCount(pages);
      } catch (err) {
        console.warn('Page count inspection error:', err);
        setDetectedPageCount(1);
      }
    } else {
      setDetectedPageCount(1);
    }

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  // If initialFile is passed, load it automatically
  useEffect(() => {
    if (initialFile) {
      processUploadedFile(initialFile);
    }
  }, [initialFile]);

  // Conversion Execution State
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [progressPct, setProgressPct] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Result & Spreadsheet State
  const [conversionResult, setConversionResult] = useState<OCRProcessResult | null>(initialResult || null);
  const [activeSheetTab, setActiveSheetTab] = useState<'tables' | 'summary' | 'lines'>('tables');
  const [selectedTableFilter, setSelectedTableFilter] = useState<'all' | number>('all');
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const [editableTables, setEditableTables] = useState<TableBlock[]>([]);

  // Options
  const [singleSheetMode, setSingleSheetMode] = useState<boolean>(true);
  const [autoDownload, setAutoDownload] = useState<boolean>(true);
  const [includeMetadataSheet, setIncludeMetadataSheet] = useState<boolean>(false); // Excluded by default
  const [includeFullTextSheet, setIncludeFullTextSheet] = useState<boolean>(false); // Excluded by default

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize with sample on mount if no initial result
  useEffect(() => {
    if (initialResult) {
      const realResult: OCRProcessResult = (initialResult as any).result ? (initialResult as any).result : initialResult;
      setConversionResult(realResult);
      const tables = extractStructuredTablesFromResult(realResult);
      setEditableTables(tables);
      if (realResult.metadata?.documentTitle) {
        setDocumentTitle(realResult.metadata.documentTitle);
      }
      if (realResult.metadata?.pageCount) {
        setDetectedPageCount(realResult.metadata.pageCount);
      }
    } else {
      // Default to sample TN G.O. 142 which has a great committee table
      const sampleGo = SAMPLE_DOCUMENTS.find(s => s.id === 'sample-tn-go-1986') || SAMPLE_DOCUMENTS[0];
      setSelectedSample(sampleGo);
      setDocumentTitle(sampleGo.tamilTitle.slice(0, 30));
      setDetectedPageCount(sampleGo.pageCount || 1);
    }
  }, [initialResult]);

  // Handle File Upload (PDF or Image)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processUploadedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  // Handle Sample Select
  const handleSelectSample = (sampleId: string) => {
    const sample = SAMPLE_DOCUMENTS.find(s => s.id === sampleId);
    if (!sample) return;

    setSelectedSample(sample);
    setSelectedFile(null);
    setPreviewUrl(null);
    setDocumentTitle(sample.tamilTitle.slice(0, 35));
    setError(null);
    setDetectedPageCount(sample.pageCount || 1);
    setPageProgress(null);
  };

  // Execute PDF to Excel Conversion
  const handleExecuteConversion = async () => {
    setError(null);
    setIsConverting(true);
    setProgressPct(5);
    setProgressMsg('கோப்பு செயலாக்கம் தொடங்குகிறது (Initializing Converter)...');
    setPageProgress(null);

    try {
      let sourceToProcess: File | Blob | string;
      let rawTextToPass: string | undefined;

      if (selectedFile) {
        sourceToProcess = selectedFile;
      } else if (selectedSample) {
        sourceToProcess = selectedSample.rawText;
        rawTextToPass = selectedSample.rawText;
      } else {
        throw new Error('தயவுசெய்து ஒரு PDF கோப்பு அல்லது மாதிரியைத் தேர்ந்தெடுக்கவும்.');
      }

      const conversion = await executePdfToExcelConversion(sourceToProcess, {
        fileName: documentTitle,
        autoDownload: autoDownload,
        rawText: rawTextToPass,
        targetLanguage: selectedLanguage,
        singleSheetMode: singleSheetMode,
        includeMetadataSheet: includeMetadataSheet,
        includeFullTextSheet: includeFullTextSheet,
        onProgress: (msg, pct, pageInfo) => {
          setProgressMsg(msg);
          setProgressPct(pct);
          if (pageInfo) {
            setPageProgress(pageInfo);
            setDetectedPageCount(pageInfo.total);
          }
        }
      });

      setConversionResult(conversion.result);
      if (conversion.result.metadata?.pageCount) {
        setDetectedPageCount(conversion.result.metadata.pageCount);
      }
      const tables = extractStructuredTablesFromResult(conversion.result);
      setEditableTables(tables);

      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      console.error('PDF to Excel conversion failed:', err);
      setError(err.message || 'PDF-ஐ எக்செல் கோப்பாக மாற்றுவதில் பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.');
    } finally {
      setIsConverting(false);
      setProgressPct(100);
    }
  };

  // Direct Re-Download Excel file
  const handleDownloadExcel = () => {
    if (!conversionResult) return;
    const updatedResult: OCRProcessResult = {
      ...conversionResult,
      tables: editableTables
    };
    downloadTamilExcelFile(updatedResult, documentTitle, {
      singleSheetMode: singleSheetMode,
      includeMetadataSheet: includeMetadataSheet,
      includeFullTextSheet: includeFullTextSheet
    });
  };

  // Download single table as .xlsx Excel workbook
  const handleDownloadSingleExcel = (tbl: TableBlock) => {
    downloadSingleTableExcel(tbl, `${documentTitle}_${tbl.caption || 'அட்டவணை'}`);
  };

  // Download single table as CSV
  const handleDownloadCsv = (tbl: TableBlock) => {
    downloadTableCsv(tbl, `${documentTitle}_${tbl.caption || 'Table'}`);
  };

  // Copy table text to clipboard as TSV for native Excel pasting
  const handleCopyTable = (tbl: TableBlock) => {
    const tsvData = tableToTsv(tbl);
    navigator.clipboard.writeText(tsvData);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  // Update cell in editable preview
  const handleCellChange = (tblIdx: number, rowIdx: number, colIdx: number, newVal: string) => {
    setEditableTables(prev => {
      const next = [...prev];
      if (!next[tblIdx]) return prev;
      const targetTbl = { ...next[tblIdx] };
      const nextRows = (targetTbl.rows || []).map(r => (Array.isArray(r) ? [...r] : [String(r)]));
      if (nextRows[rowIdx]) {
        nextRows[rowIdx][colIdx] = newVal;
      }
      targetTbl.rows = nextRows;
      next[tblIdx] = targetTbl;
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,image/*,.pdf"
        onChange={handleFileChange}
        className="hidden"
        id="pdf-to-excel-file-input"
      />

      {/* Main Header Banner */}
      <div className="bg-[#12141A] border border-white/10 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase bg-emerald-950/60 px-2 py-0.5 border border-emerald-500/30">
                OFFICIAL WORKBOOK ENGINE • SHEETJS (.XLSX)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider mt-2 flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
              <span>PDF TO EXCEL CONVERTER (PDF ➔ EXCEL மாற்றி)</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1 max-w-3xl leading-relaxed">
              அரசு அரசாணைகள் (TN G.O.), அரசிதழ்கள், நிலப்பதிவு அட்டவணைகள் மற்றும் தேர்வு விடைக்குறிப்பு PDF-களில் உள்ள அட்டவணைத் தரவுகளைத் தூய தமிழ் ஒருங்குறி (Unicode UTF-8) வடிவில் எக்செல் (<span className="text-emerald-300 font-mono">.xlsx</span>) கோப்பாக உடனடியாக மாற்றுக.
            </p>
          </div>

          {/* Quick Action Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-white/5 hover:bg-white/10 border border-white/20 text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all"
            >
              <UploadCloud className="w-4 h-4 text-emerald-400" />
              <span>PDF கோப்பைத் தேர்ந்தெடு</span>
            </button>
          </div>
        </div>

        {/* Configuration & Selection Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
          {/* Column 1: Source File / Sample Selector */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>01. ஆவணத் தேர்வு (Select Document):</span>
            </h2>

            {/* Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed p-4 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-emerald-400 bg-emerald-950/50 scale-[1.01]'
                  : selectedFile
                  ? 'border-emerald-500 bg-emerald-950/20'
                  : 'border-white/20 hover:border-emerald-400/80 bg-[#0A0B0E]'
              }`}
            >
              <FileSpreadsheet className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
              <div className="text-xs font-bold text-white uppercase">
                {selectedFile ? selectedFile.name : 'PDF கோப்பை இங்கே விடவும்'}
              </div>
              <p className="text-[10px] text-gray-400 font-mono mt-1">
                {selectedFile
                  ? `${(selectedFile.size / 1024).toFixed(1)} KB • ${detectedPageCount || 1} பக்கங்கள் • தயார் நிலையில் உள்ளது`
                  : 'Click to select or drag PDF / scanned image'}
              </p>
            </div>

            {/* Sample Selector */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                அல்லது மாதிரி ஆவணத்தைத் தேர்ந்தெடுக்கவும் (Or Pick Sample):
              </label>
              <select
                value={selectedSample?.id || ''}
                onChange={(e) => handleSelectSample(e.target.value)}
                className="w-full bg-[#0A0B0E] border border-white/15 focus:border-emerald-400 px-3 py-2 text-xs text-emerald-300 font-medium outline-none cursor-pointer"
              >
                <option value="" disabled>மாதிரி ஆவணங்கள் (Preloaded Samples)...</option>
                {SAMPLE_DOCUMENTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.tamilTitle.slice(0, 42)} ({s.year})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Column 2: Language & Workbook Settings */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
              <Settings2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>02. மொழி & அமைப்புகள் (Language & Settings):</span>
            </h2>

            {/* Official Indian Language Selector */}
            <div className="bg-[#0A0B0E] p-3 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 font-mono">
                  <Languages className="w-3.5 h-3.5" />
                  <span>ஆவண மொழி (Document Language):</span>
                </label>
                <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  {OFFICIAL_INDIAN_LANGUAGES.find(l => l.code === selectedLanguage)?.script || 'Indic'}
                </span>
              </div>
              <select
                id="select-pdf-excel-language"
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value as OfficialIndianLanguageCode)}
                className="w-full bg-[#12141A] border border-emerald-500/40 focus:border-emerald-400 px-3 py-2 text-xs text-white font-bold outline-none cursor-pointer"
              >
                {OFFICIAL_INDIAN_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-[#0F1115] text-white">
                    {lang.name} • {lang.nativeName} ({lang.script})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-gray-400 font-sans italic">
                {OFFICIAL_INDIAN_LANGUAGES.find(l => l.code === selectedLanguage)?.samplePhrase}
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                எக்செல் கோப்புப் பெயர் (Excel File Name):
              </label>
              <input
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                className="w-full bg-[#0A0B0E] border border-white/15 focus:border-emerald-400 p-2 text-xs text-white outline-none font-mono"
                placeholder="தமிழ்_அரசாணை_அட்டவணை"
              />
            </div>

            <div className="space-y-2 bg-[#0A0B0E] p-3 border border-white/10 text-xs">
              <label className="flex items-center gap-2 text-emerald-300 font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={singleSheetMode}
                  onChange={(e) => setSingleSheetMode(e.target.checked)}
                  className="rounded border-emerald-400 text-emerald-500 focus:ring-emerald-500"
                />
                <span>ஒற்றைத் தாள் முறை (Single Sheet Mode - அனைத்து பக்கங்களும் ஒரே தாளில்)</span>
              </label>

              <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoDownload}
                  onChange={(e) => setAutoDownload(e.target.checked)}
                  className="rounded border-white/20 text-emerald-500 focus:ring-emerald-500"
                />
                <span>தானாகப் பதிவிறக்கு (Auto-Download .xlsx)</span>
              </label>

              <label className="flex items-center gap-2 text-gray-400 hover:text-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeMetadataSheet}
                  onChange={(e) => setIncludeMetadataSheet(e.target.checked)}
                  className="rounded border-white/20 text-emerald-500 focus:ring-emerald-500"
                />
                <span>ஆவணச் சுருக்கத் தாள் சேர்க்க (Metadata Sheet - இயல்புநிலையில் நீக்கப்பட்டுள்ளது)</span>
              </label>

              <label className="flex items-center gap-2 text-gray-400 hover:text-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeFullTextSheet}
                  onChange={(e) => setIncludeFullTextSheet(e.target.checked)}
                  className="rounded border-white/20 text-emerald-500 focus:ring-emerald-500"
                />
                <span>முழு உரை தாள் சேர்க்க (Full Text Sheet - இயல்புநிலையில் நீக்கப்பட்டுள்ளது)</span>
              </label>

              <div className="pt-2 border-t border-white/10 space-y-1 text-[11px]">
                <div className="flex items-center justify-between text-gray-400">
                  <span>அட்டவணை வடிவம்:</span>
                  <span className="text-emerald-400 font-bold">Ctrl+T Table (TableStyleMedium9)</span>
                </div>
                <div className="flex items-center justify-between text-gray-400">
                  <span>இயல்புநிலை எழுத்துரு:</span>
                  <span className="text-emerald-300 font-bold">Tau-marutham</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Execute Action Card */}
          <div className="space-y-4 flex flex-col justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>03. செயலாக்கம் (Execute Conversion):</span>
            </h2>

            <div className="bg-[#0A0B0E] p-4 border border-white/10 space-y-3 flex-1 flex flex-col justify-center">
              <div className="text-[11px] text-gray-400 space-y-1">
                <div className="flex items-center justify-between">
                  <span>தேர்ந்தெடுக்கப்பட்டது:</span>
                  <span className="text-white font-bold truncate max-w-[180px]">
                    {selectedFile ? selectedFile.name : selectedSample ? selectedSample.tamilTitle : 'இல்லை'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>பக்கங்கள் எண்ணிக்கை (Pages):</span>
                  <span className="text-emerald-400 font-mono font-black">
                    {detectedPageCount ? `${detectedPageCount} பக்கங்கள்` : '1 பக்கம்'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Excel தாள் அமைப்பு:</span>
                  <span className="text-white font-mono font-bold">
                    {singleSheetMode ? 'ஒருங்கிணைந்த ஒற்றைத் தாள் (Single Sheet)' : 'தனித்தனி தாள்கள்'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>வடிவம் (Design):</span>
                  <span className="text-emerald-400 font-mono font-bold">Table (Ctrl+T) • TableStyleMedium9</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Default Font:</span>
                  <span className="text-emerald-300 font-mono font-bold">Tau-marutham</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>குறியாக்கம்:</span>
                  <span className="text-gray-300 font-mono">Unicode UTF-8 (Tamil)</span>
                </div>
              </div>

              <button
                id="btn-execute-pdf-to-excel"
                disabled={isConverting}
                onClick={handleExecuteConversion}
                className={`w-full py-3 px-4 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                  isConverting
                    ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-500/40 cursor-wait'
                    : 'bg-emerald-400 hover:bg-emerald-300 text-black font-black'
                }`}
              >
                {isConverting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-300" />
                    <span>
                      {pageProgress 
                        ? `பக்கம் ${pageProgress.current} / ${pageProgress.total} (${progressPct}%)...` 
                        : `எக்செல் உருவாகிறது (${progressPct}%)...`}
                    </span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>
                      {detectedPageCount && detectedPageCount > 1
                        ? `அனைத்து ${detectedPageCount} பக்கங்களையும் EXCEL-ஆக மாற்று`
                        : 'EXCEL (.xlsx)-ஆக மாற்று (Convert to Excel)'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar (Visible while converting) */}
        {isConverting && (
          <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-400 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{progressMsg}</span>
              </span>
              <span className="text-white font-bold">{progressPct}%</span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPct}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Interactive Spreadsheet Preview */}
      {conversionResult && (
        <div className="bg-[#12141A] border border-white/10 p-6 shadow-xl space-y-4">
          {/* Header with Sheet Tabs and Export Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <TableIcon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <span>எக்செல் நேரடி முன்னோட்டம் (LIVE SPREADSHEET PREVIEW)</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 border border-emerald-500/30 font-mono">
                    {conversionResult.metadata?.pageCount || detectedPageCount || 1} பக்கங்கள் • {editableTables.length} அட்டவணைகள்
                  </span>
                  {singleSheetMode && (
                    <span className="text-[10px] text-emerald-300 bg-emerald-900/40 px-2 py-0.5 border border-emerald-400/40 font-mono">
                      ஒருங்கிணைந்த ஒற்றைத் தாள் (Single Sheet)
                    </span>
                  )}
                </h2>
                <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                  துல்லிய விகிதம்: {Math.round((conversionResult.overallConfidence || 0.95) * 100)}% • கலங்களைத் திருத்திக் கொள்ளலாம் (Editable Cells)
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleDownloadExcel}
                className="bg-emerald-400 hover:bg-emerald-300 text-black font-black px-4 py-2 text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
                title="Download complete multi-sheet Excel file (.xlsx)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Excel (.xlsx) பதிவிறக்கு</span>
              </button>

              {editableTables.length > 0 && (
                <button
                  onClick={() => handleDownloadCsv(editableTables[0])}
                  className="bg-white/5 hover:bg-white/10 border border-white/20 text-gray-200 px-3 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  title="Download first table as CSV"
                >
                  <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CSV பதிவிறக்கு</span>
                </button>
              )}

              {editableTables.length > 0 && (
                <button
                  onClick={() => handleCopyTable(editableTables[0])}
                  className="bg-white/5 hover:bg-white/10 border border-white/20 text-gray-200 px-3 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  title="Copy table data to clipboard"
                >
                  {copiedNotification ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-gray-400" />
                  )}
                  <span>{copiedNotification ? 'நகலெடுக்கப்பட்டது' : 'நகலெடு (Copy)'}</span>
                </button>
              )}

              {onOpenInEditor && (
                <button
                  onClick={() => onOpenInEditor(conversionResult)}
                  className="bg-[#1E293B] hover:bg-[#334155] border border-blue-400/40 text-blue-300 font-bold px-3 py-2 text-xs tracking-wider flex items-center gap-1.5 cursor-pointer"
                  title="Open extracted result in side-by-side Word DOCX editor"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span>ஆவணத் திருத்தியில் திற</span>
                </button>
              )}
            </div>
          </div>

          {/* Spreadsheet Sheet Tabs */}
          <div className="flex items-center gap-1 border-b border-white/10 bg-[#0A0B0E] p-1">
            <button
              onClick={() => setActiveSheetTab('tables')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all ${
                activeSheetTab === 'tables'
                  ? 'bg-[#161922] text-emerald-300 border-b-2 border-emerald-400 font-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>தாள் 1: அட்டவணை விவரங்கள் (Tables)</span>
            </button>

            <button
              onClick={() => setActiveSheetTab('summary')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all ${
                activeSheetTab === 'summary'
                  ? 'bg-[#161922] text-emerald-300 border-b-2 border-emerald-400 font-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>தாள் 2: ஆவணச் சுருக்கம் (Summary)</span>
            </button>

            <button
              onClick={() => setActiveSheetTab('lines')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all ${
                activeSheetTab === 'lines'
                  ? 'bg-[#161922] text-emerald-300 border-b-2 border-emerald-400 font-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>தாள் 3: முழு உரை வரிகள் ({conversionResult.lines?.length || 0} Lines)</span>
            </button>
          </div>

          {/* TAB 1: அட்டவணை விவரங்கள் (Tables & Data Grid) */}
          {activeSheetTab === 'tables' && (
            <div className="space-y-6 pt-2">
              {editableTables.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs font-mono bg-[#0A0B0E] border border-white/5">
                  அட்டவணைகள் எதுவும் கண்டறியப்படவில்லை. 'ஆவணச் சுருக்கம்' அல்லது 'முழு உரை வரிகள்' தாவலைச் சரிபார்க்கவும்.
                </div>
              ) : (
                <>
                  {/* Multi-Sheet Workbook Information Banner */}
                  <div className="p-3.5 bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-transparent border border-emerald-500/30 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-emerald-200">
                          பல தாள்கள் எக்செல் கட்டமைப்பு (Multi-Worksheet Excel Architecture)
                        </div>
                        <div className="text-gray-400 text-[11px] mt-0.5">
                          ஒவ்வொரு அட்டவணையும் தனியான தாளில் (Dedicated Sheet) Auto-Fit நெடுவரிசை அளவுகளுடன் பிரிக்கப்பட்டுள்ளது.
                        </div>
                      </div>
                    </div>
                    <div className="text-[11px] font-mono text-emerald-400/90 bg-emerald-950/60 px-2.5 py-1 border border-emerald-500/20 rounded">
                      {editableTables.length} தாள்கள் + 1 ஒருங்கிணைந்த தாள்
                    </div>
                  </div>

                  {/* Sub-navigation for Tables if multiple tables exist */}
                  {editableTables.length > 1 && (
                    <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#0D0F14] border border-white/10 rounded-lg">
                      <span className="text-[11px] text-gray-400 font-mono px-2">பார்வை:</span>
                      <button
                        type="button"
                        onClick={() => setSelectedTableFilter('all')}
                        className={`px-3 py-1 text-xs rounded transition-colors ${
                          selectedTableFilter === 'all'
                            ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                            : 'bg-white/5 text-gray-300 hover:bg-white/10'
                        }`}
                      >
                        அனைத்து அட்டவணைகளும் ({editableTables.length})
                      </button>
                      {editableTables.map((tbl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedTableFilter(idx)}
                          className={`px-3 py-1 text-xs rounded transition-colors flex items-center gap-1.5 ${
                            selectedTableFilter === idx
                              ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                              : 'bg-white/5 text-gray-300 hover:bg-white/10'
                          }`}
                        >
                          <span className="font-mono text-[10px] opacity-75">#{idx + 1}</span>
                          <span>{tbl.caption?.slice(0, 20) || `அட்டவணை ${idx + 1}`}</span>
                          <span className="text-[10px] font-mono opacity-60">({tbl.headers?.length || 0} நெடுவரிசை)</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {editableTables
                    .filter((_, idx) => selectedTableFilter === 'all' || selectedTableFilter === idx)
                    .map((tbl, filteredIdx) => {
                      const actualIdx = selectedTableFilter === 'all' ? filteredIdx : (selectedTableFilter as number);
                      const safeHeaders = tbl.headers || [];
                      const safeRows = tbl.rows || [];
                      return (
                        <div key={tbl.id || `tbl-${actualIdx}`} className="space-y-2 border border-white/10 p-3 bg-[#08090C] rounded-lg">
                          {/* Table Header & Per-Table Action Toolbar */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-white/5">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full"></span>
                              <span className="text-emerald-300 font-mono text-xs font-bold">
                                [{tbl.caption || `அட்டவணை ${actualIdx + 1}`}]
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono bg-white/5 px-2 py-0.5 rounded">
                                {safeRows.length} வரிசைகள் • {safeHeaders.length} நெடுவரிசைகள்
                              </span>
                            </div>

                            {/* Export / Copy Tools for THIS Table */}
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleDownloadSingleExcel(tbl)}
                                title="இந்த அட்டவணையை மட்டும் .xlsx வடிவில் பதிவிறக்கு"
                                className="flex items-center gap-1 px-2.5 py-1 text-[11px] bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 rounded transition-colors"
                              >
                                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                                <span>இவ்வட்டவணை Excel</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDownloadCsv(tbl)}
                                title="CSV வடிவில் பதிவிறக்கு"
                                className="flex items-center gap-1 px-2 py-1 text-[11px] bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 rounded transition-colors"
                              >
                                <FileDown className="w-3.5 h-3.5 text-gray-400" />
                                <span>CSV</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopyTable(tbl)}
                                title="Excel இல் நேரிடையாக ஒட்டுவதற்கு TSV நகலெடு (Copy for Excel Paste)"
                                className="flex items-center gap-1 px-2 py-1 text-[11px] bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 rounded transition-colors"
                              >
                                <Copy className="w-3.5 h-3.5 text-gray-400" />
                                <span>நகலெடு</span>
                              </button>
                            </div>
                          </div>

                          {/* Styled Excel Grid with Column Letters */}
                          <div className="overflow-x-auto border border-white/10 bg-[#0A0B0E] rounded shadow-inner max-h-[500px]">
                            <table className="w-full text-xs border-collapse">
                              {/* Column Header Letters: A, B, C, D... */}
                              <thead>
                                <tr className="bg-[#12141A] border-b border-white/10 text-gray-500 font-mono text-[10px] sticky top-0 z-20">
                                  <th className="w-12 p-1.5 border-r border-white/10 text-center bg-[#12141A]">#</th>
                                  {safeHeaders.map((_, colIdx) => {
                                    // Generate Excel-like column codes: A..Z, AA..AZ
                                    let colLetter = '';
                                    if (colIdx < 26) {
                                      colLetter = String.fromCharCode(65 + colIdx);
                                    } else {
                                      colLetter = String.fromCharCode(64 + Math.floor(colIdx / 26)) + String.fromCharCode(65 + (colIdx % 26));
                                    }
                                    return (
                                      <th key={colIdx} className="p-1.5 border-r border-white/10 text-center font-bold min-w-[70px] bg-[#12141A]">
                                        {colLetter}
                                      </th>
                                    );
                                  })}
                                </tr>

                                {/* Tamil Table Headers Row */}
                                <tr className="bg-[#16212D] border-b border-white/20 text-emerald-200 font-bold text-left sticky top-[25px] z-10 shadow-sm">
                                  <th className="w-12 p-2.5 border-r border-white/10 text-center font-mono text-gray-400 bg-[#16212D]">1</th>
                                  {safeHeaders.map((h, colIdx) => (
                                    <th key={colIdx} className="p-2.5 border-r border-white/10 font-sans tracking-wide text-xs bg-[#16212D] whitespace-nowrap">
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>

                              {/* Data Rows */}
                              <tbody>
                                {safeRows.map((row, rIdx) => (
                                  <tr
                                    key={rIdx}
                                    className={`border-b border-white/5 hover:bg-emerald-500/5 transition-colors ${
                                      rIdx % 2 === 0 ? 'bg-[#0A0B0E]' : 'bg-[#0E1015]'
                                    }`}
                                  >
                                    <td className="w-12 p-2 border-r border-white/10 text-center font-mono text-gray-500 text-[10px]">
                                      {rIdx + 2}
                                    </td>
                                    {(Array.isArray(row) ? row : [String(row)]).map((cell, cIdx) => (
                                      <td key={cIdx} className="p-1 border-r border-white/10">
                                        <input
                                          type="text"
                                          value={cell}
                                          onChange={(e) => handleCellChange(actualIdx, rIdx, cIdx, e.target.value)}
                                          className="w-full bg-transparent px-1.5 py-1 text-xs text-gray-200 focus:text-white focus:bg-emerald-950/40 focus:outline-none focus:ring-1 focus:ring-emerald-400 font-sans rounded"
                                        />
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                </>
              )}
            </div>
          )}

          {/* TAB 2: ஆவணச் சுருக்கம் (Summary Sheet View) */}
          {activeSheetTab === 'summary' && (
            <div className="overflow-x-auto border border-white/10 bg-[#0A0B0E] pt-2">
              <table className="w-full text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-[#1A2634] border-b border-white/20 text-emerald-200 font-bold text-left">
                    <th className="p-2.5 border-r border-white/10 w-64">புலம் / பண்பு (Attribute)</th>
                    <th className="p-2.5 border-r border-white/10">பிரித்தெடுக்கப்பட்ட தமிழ் விவரம் (Extracted Content)</th>
                    <th className="p-2.5 w-36">சரிபார்ப்பு நிலை (Status)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['ஆவணத் தலைப்பு', conversionResult.metadata?.documentTitle || 'தமிழ் ஆவணம்', 'கண்டறியப்பட்டது'],
                    ['துறை / அலுவலகம்', conversionResult.metadata?.department || '—', 'துறை'],
                    ['அரசாணை / அறிவிக்கை எண்', conversionResult.metadata?.orderNumber || '—', 'பதிவு எண்'],
                    ['நாள் / தேதி', conversionResult.metadata?.dateStr || '—', 'தேதி'],
                    ['இடம் / வட்டம்', conversionResult.metadata?.place || '—', 'நகரம்'],
                    ['பொருள் / சுருக்கம்', conversionResult.metadata?.subject || '—', 'பொருள்'],
                    ['பார்வை / குறிப்பு', conversionResult.metadata?.reference || '—', 'பார்வை'],
                    ['கையொப்பமிட்ட அலுவலர்', conversionResult.metadata?.signatory || '—', 'கையொப்பம்'],
                    ['மொத்தப் பக்கங்கள்', conversionResult.metadata?.pageCount || 1, 'பக்கங்கள்'],
                    ['OCR செயலாக்க முறை', conversionResult.processingMethod, 'Ensemble OCR'],
                    ['துல்லிய விகிதம்', `${Math.round((conversionResult.overallConfidence || 0.95) * 100)}%`, 'உயர் துல்லியம்'],
                    ['சந்தி இலக்கணத் திருத்தங்கள்', conversionResult.morphologyStats?.sandhiAdjusted || 0, 'திருத்தப்பட்டது'],
                    ['அரசுச் சொற்கள் அகராதி', conversionResult.morphologyStats?.govTermsIdentified || 0, 'அங்கீகரிக்கப்பட்டது']
                  ].map(([k, v, s], idx) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-2.5 border-r border-white/10 font-bold text-gray-300 bg-[#0E1015]">{k}</td>
                      <td className="p-2.5 border-r border-white/10 text-white font-medium">{v}</td>
                      <td className="p-2.5 text-emerald-400 font-mono text-[11px]">{s}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: முழு உரை வரிகள் (All Lines Sheet View) */}
          {activeSheetTab === 'lines' && (
            <div className="overflow-x-auto border border-white/10 bg-[#0A0B0E] pt-2">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-[#1A2634] border-b border-white/20 text-emerald-200 font-bold text-left">
                    <th className="w-16 p-2.5 border-r border-white/10 text-center font-mono">வரி #</th>
                    <th className="w-32 p-2.5 border-r border-white/10">உரை வகை</th>
                    <th className="w-24 p-2.5 border-r border-white/10 text-center font-mono">துல்லியம்</th>
                    <th className="p-2.5">தமிழ் ஒருங்குறி உரை (Unicode Text)</th>
                  </tr>
                </thead>
                <tbody>
                  {(conversionResult.lines || []).map((l, idx) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-2 border-r border-white/10 text-center font-mono text-gray-500 text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="p-2 border-r border-white/10 font-mono text-[11px] text-gray-400">
                        {l.type}
                      </td>
                      <td className="p-2 border-r border-white/10 text-center font-mono text-[11px] text-emerald-400">
                        {Math.round((l.confidence || conversionResult.overallConfidence || 0.95) * 100)}%
                      </td>
                      <td className="p-2 text-gray-200 font-sans leading-relaxed">
                        {l.tamilText}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
