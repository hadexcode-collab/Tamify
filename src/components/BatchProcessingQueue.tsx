import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Play,
  Eye,
  FolderArchive,
  Check,
  X,
  Sparkles,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  BatchQueueItem,
  BatchProcessSettings,
  BatchZipExportConfig,
  OCRProcessResult
} from '../types';
import { exportBatchToZip } from '../lib/batchZipExporter';
import { generateTamilDocxBlob } from '../lib/docxGenerator';
import { SAMPLE_DOCUMENTS } from '../lib/sampleDocuments';
import { downloadBatchExcelFile, downloadTamilExcelFile } from '../lib/excelGenerator';

interface BatchProcessingQueueProps {
  queue: BatchQueueItem[];
  setQueue: React.Dispatch<React.SetStateAction<BatchQueueItem[]>>;
  isProcessingBatch: boolean;
  onStartBatch: (settings: BatchProcessSettings) => void;
  onPauseBatch: () => void;
  onInspectDocument: (result: OCRProcessResult) => void;
}

export const BatchProcessingQueue: React.FC<BatchProcessingQueueProps> = ({
  queue,
  setQueue,
  isProcessingBatch,
  onStartBatch,
  onPauseBatch,
  onInspectDocument
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Metrics
  const totalCount = queue.length;
  const completedCount = queue.filter((i) => i.status === 'COMPLETED').length;
  const queuedCount = queue.filter((i) => i.status === 'QUEUED').length;
  const failedCount = queue.filter((i) => i.status === 'FAILED').length;

  // Handle Multi-file upload
  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems: BatchQueueItem[] = [];
    const filesArray = Array.from(files);

    filesArray.forEach((file, index) => {
      const id = `item-${Date.now()}-${index}`;
      const nameLower = file.name.toLowerCase();
      const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|bmp|tiff|avif)$/i.test(nameLower);
      const isPdf = file.type === 'application/pdf' || nameLower.endsWith('.pdf');

      const newItem: BatchQueueItem = {
        id,
        name: file.name,
        fileSizeBytes: file.size,
        mimeType: isPdf ? 'application/pdf' : file.type || (isImage ? 'image/jpeg' : 'text/plain'),
        fileObject: file,
        sourceType: isImage ? 'IMAGE' : isPdf ? 'PDF' : 'TEXT',
        status: 'QUEUED',
        progress: 0,
        selectedEncoding: 'AUTO_DETECT',
        userHint: file.name,
        selectedForExport: true,
        addedAt: Date.now()
      };

      if (isImage || isPdf) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          setQueue((prev) =>
            prev.map((q) => (q.id === id ? { ...q, imageBase64: base64, previewUrl: base64 } : q))
          );
        };
        reader.readAsDataURL(file);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          setQueue((prev) =>
            prev.map((q) => (q.id === id ? { ...q, rawText: text } : q))
          );
        };
        reader.readAsText(file);
      }

      newItems.push(newItem);
    });

    setQueue((prev) => [...prev, ...newItems]);
  };

  // Remove single item
  const handleRemoveItem = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  // Clear all
  const handleClearAll = () => {
    if (isProcessingBatch) return;
    setQueue([]);
  };

  // Load sample test bundle into queue
  const handleLoadSamples = () => {
    if (isProcessingBatch) return;
    const sampleItems: BatchQueueItem[] = SAMPLE_DOCUMENTS.slice(0, 3).map((sample, idx) => ({
      id: `sample-batch-${Date.now()}-${idx}`,
      name: `${sample.title}.txt`,
      fileSizeBytes: (sample.rawText || '').length,
      mimeType: 'text/plain',
      rawText: sample.rawText,
      sourceType: 'TEXT',
      status: 'QUEUED',
      progress: 0,
      selectedEncoding: sample.defaultEncoding || 'AUTO_DETECT',
      userHint: sample.tamilTitle,
      selectedForExport: true,
      addedAt: Date.now()
    }));
    setQueue((prev) => [...prev, ...sampleItems]);
    setToastMessage(`மாதிரி ஆவணங்கள் சேர்க்கப்பட்டன (${sampleItems.length} ஆவணங்கள்)`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Single file instant DOCX download
  const handleDownloadSingleDocx = async (item: BatchQueueItem) => {
    if (!item.result) return;
    try {
      const blob = await generateTamilDocxBlob(item.result, {
        documentTitle: item.result.metadata?.documentTitle || item.name,
        fontFamily: 'TAU-Marutham',
        fontSize: 12,
        includeHeaderLetterhead: false,
        includeDocumentMetadata: false,
        tableBorderColor: 'CBD5E0',
        lineSpacing: 1.15,
        pageOrientation: 'portrait',
        includePronunciationAppendix: false,
        includeConfidenceSummary: false
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = `${item.name.replace(/\.[^/.]+$/, '')}_Tau-marutham.docx`;
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to download single docx:', e);
    }
  };

  // Export full batch as ZIP
  const handleExportZip = async () => {
    if (completedCount === 0) return;
    try {
      setIsExportingZip(true);
      const exportResult = await exportBatchToZip(
        queue,
        {
          zipFileName: `Tamil_Unicode_DOCX_Batch_Tau-marutham_${new Date().toISOString().slice(0, 10)}`,
          fontFamily: 'Tau-marutham' as any,
          fontSize: 12,
          includeLetterhead: true,
          includeMetadataBox: true,
          includeAppendix: false,
          includeTextFiles: true,
          includeJsonReports: false,
          includeBatchManifest: true
        }
      );

      const url = URL.createObjectURL(exportResult.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportResult.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setToastMessage(`பதிவிறக்கப்பட்டது: ${exportResult.filename}`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      console.error('Batch ZIP export error:', err);
      alert('ZIP export failed.');
    } finally {
      setIsExportingZip(false);
    }
  };

  // Export full batch as Multi-sheet Excel workbook
  const handleDownloadBatchExcel = () => {
    if (completedCount === 0) return;
    try {
      downloadBatchExcelFile(queue, `Tamify_Batch_Excel_${new Date().toISOString().slice(0, 10)}`);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setToastMessage('தொகுதி எக்செல் கோப்பு (.xlsx) வெற்றிகரமாக பதிவிறக்கப்பட்டது!');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      console.error('Batch Excel export error:', err);
      alert('Excel export failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-[#0A0B0E] border border-[#00FF66] text-[#00FF66] p-3 text-xs font-mono font-bold flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#00FF66]" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hidden Multi-file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,application/pdf,.txt"
        onChange={(e) => handleFilesSelected(e.target.files)}
        className="hidden"
        id="batch-file-input"
      />

      {/* Batch Header Card */}
      <div className="bg-[#12141A] border border-white/10 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <h1 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FolderArchive className="w-5 h-5 text-[#00FF66]" />
              <span>தொகுதி செயலாக்கம் (BATCH PROCESSING)</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              பல ஆவணங்களை ஒரே நேரத்தில் பதிவேற்றி, தூய ஒருங்குறி TAU-Marutham DOCX ஆக மாற்றி ZIP கோப்பாக பதிவிறக்குக.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {isProcessingBatch ? (
              <button
                id="btn-pause-batch"
                onClick={onPauseBatch}
                className="bg-amber-500/20 text-[#FFB800] border border-[#FFB800]/50 px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>நிறுத்து (PAUSE)</span>
              </button>
            ) : (
              <button
                id="btn-start-batch"
                disabled={queuedCount === 0 && failedCount === 0}
                onClick={() => onStartBatch({ concurrency: 2, defaultEncoding: 'AUTO_DETECT' })}
                className={`px-5 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                  queuedCount === 0 && failedCount === 0
                    ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                    : 'bg-[#FFB800] hover:bg-[#ffc833] text-black shadow-md'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>செயலாக்குக ({queuedCount})</span>
              </button>
            )}

            <button
              id="btn-export-zip"
              disabled={completedCount === 0 || isExportingZip}
              onClick={handleExportZip}
              className={`px-5 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                completedCount === 0
                  ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                  : 'bg-[#00FF66] hover:bg-[#00e65c] text-black shadow-md'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExportingZip ? 'உருவாகிறது...' : `ZIP பதிவிறக்கு (${completedCount})`}</span>
            </button>

            <button
              id="btn-export-batch-excel"
              disabled={completedCount === 0}
              onClick={handleDownloadBatchExcel}
              className={`px-5 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                completedCount === 0
                  ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                  : 'bg-emerald-400 hover:bg-emerald-300 text-black shadow-md'
              }`}
              title="Export all processed documents into a multi-sheet Excel workbook (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel (.xlsx) தொகுப்பு ({completedCount})</span>
            </button>
          </div>
        </div>

        {/* Upload Zone */}
        <div className="pt-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div
              id="batch-dropzone"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 border-2 border-dashed border-white/20 hover:border-[#00FF66] bg-[#0A0B0E] p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center group"
            >
              <div className="w-10 h-10 bg-white/5 group-hover:bg-[#00FF66]/10 text-gray-400 group-hover:text-[#00FF66] flex items-center justify-center rounded-lg border border-white/10 mb-2 transition-colors">
                <UploadCloud className="w-5 h-5" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase group-hover:text-[#00FF66]">
                பல கோப்புகளை இங்கே பதிவேற்றவும் (DROP MULTIPLE FILES)
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5 font-mono">
                படங்கள் (PNG/JPG), PDFகள் அல்லது Text கோப்புகளைத் தேர்ந்தெடுக்கவும்
              </p>
            </div>

            {/* Quick Sample Batch Button */}
            <button
              id="btn-load-sample-batch"
              onClick={handleLoadSamples}
              disabled={isProcessingBatch}
              className="sm:w-48 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-[#FFB800] p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
            >
              <Sparkles className="w-5 h-5 text-[#FFB800] mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-white uppercase">மாதிரி கோப்புகள்</span>
              <span className="text-[10px] text-gray-400 font-mono mt-0.5">Load 3 Sample Files</span>
            </button>
          </div>

          {/* Queue Summary Header */}
          {totalCount > 0 && (
            <div className="flex items-center justify-between text-xs font-mono text-gray-400 pt-2">
              <div className="flex items-center gap-3">
                <span>மொத்தம்: {totalCount}</span>
                <span>•</span>
                <span className="text-[#00FF66]">நிறைவுற்றவை: {completedCount}</span>
                <span>•</span>
                <span className="text-[#FFB800]">வரிசையில்: {queuedCount}</span>
                {failedCount > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-rose-400">தோல்வி: {failedCount}</span>
                  </>
                )}
              </div>
              <button
                onClick={handleClearAll}
                className="text-gray-400 hover:text-rose-400 cursor-pointer"
              >
                வரிசையை அழி (Clear All)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Queue Items List */}
      {queue.length > 0 && (
        <div className="bg-[#12141A] border border-white/10 p-4 space-y-2">
          {queue.map((item, idx) => (
            <div
              key={item.id}
              className="bg-[#0A0B0E] p-3 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/20 transition-colors"
            >
              {/* Item Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-xs font-mono text-gray-400 w-5 text-center">
                  {idx + 1}.
                </span>
                <FileText className="w-4 h-4 text-[#FFB800] shrink-0" />
                <div className="truncate">
                  <p className="text-xs font-bold text-white truncate">{item.name}</p>
                  <p className="text-[10px] text-gray-400 font-mono">
                    {Math.round(item.fileSizeBytes / 1024)} KB • {item.sourceType}
                  </p>
                </div>
              </div>

              {/* Status & Progress */}
              <div className="flex items-center gap-3 shrink-0">
                {item.status === 'COMPLETED' ? (
                  <span className="text-[10px] font-mono font-bold text-[#00FF66] bg-[#00FF66]/10 px-2 py-0.5 border border-[#00FF66]/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>நிறைவுற்றது</span>
                  </span>
                ) : item.status === 'PROCESSING' ? (
                  <span className="text-[10px] font-mono font-bold text-[#FFB800] bg-[#FFB800]/10 px-2 py-0.5 border border-[#FFB800]/30 flex items-center gap-1">
                    <Clock className="w-3 h-3 animate-spin" />
                    <span>செயலாக்கப்படுகிறது ({item.progress}%)</span>
                  </span>
                ) : item.status === 'FAILED' ? (
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 border border-rose-500/30 flex items-center gap-1 cursor-help"
                      title={item.error || 'Processing failed'}
                    >
                      <AlertCircle className="w-3 h-3" />
                      <span>தோல்வி</span>
                    </span>
                    <button
                      onClick={() => {
                        setQueue((prev) =>
                          prev.map((q) =>
                            q.id === item.id ? { ...q, status: 'QUEUED', progress: 0, error: undefined } : q
                          )
                        );
                      }}
                      className="text-[#FFB800] hover:text-white bg-[#FFB800]/10 hover:bg-[#FFB800]/20 p-1 border border-[#FFB800]/30 transition-colors cursor-pointer"
                      title="மீண்டும் முயற்சி செய்க (Retry)"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5">
                    வரிசையில் உள்ளது
                  </span>
                )}

                {/* Per-item Download DOCX & Excel */}
                {item.status === 'COMPLETED' && item.result && (
                  <>
                    <button
                      id={`btn-download-excel-item-${idx}`}
                      onClick={() => downloadTamilExcelFile(item.result!, item.name)}
                      className="bg-emerald-950/60 hover:bg-emerald-500 text-emerald-300 hover:text-black p-1.5 border border-emerald-500/40 transition-colors cursor-pointer"
                      title="Download Excel (.xlsx)"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`btn-download-item-${idx}`}
                      onClick={() => handleDownloadSingleDocx(item)}
                      className="bg-[#00FF66]/20 hover:bg-[#00FF66] text-[#00FF66] hover:text-black p-1.5 border border-[#00FF66]/40 transition-colors cursor-pointer"
                      title="Download DOCX"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onInspectDocument(item.result!)}
                      className="bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white p-1.5 border border-white/10 transition-colors cursor-pointer"
                      title="Inspect in Editor"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}

                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-gray-400 hover:text-rose-400 p-1.5 cursor-pointer"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
