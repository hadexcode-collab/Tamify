import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  Camera,
  FileCode,
  Sparkles,
  Download,
  Copy,
  Check,
  Edit3,
  Trash2,
  Settings,
  FileText,
  RefreshCw,
  Eye,
  AlertCircle,
  Table as TableIcon,
  FileSignature,
  FileSpreadsheet,
  Languages,
  Laptop
} from 'lucide-react';
import { OCRProcessResult, EncodingType, LineToken, WordToken, TamilDocxFont, OfficialIndianLanguageCode, OFFICIAL_INDIAN_LANGUAGES } from '../types';
import { generateTamilDocxBlob } from '../lib/docxGenerator';
import { transliterateTamilToISO } from '../lib/tamilMorphology';
import {
  downloadTamilExcelFile,
  countPdfPages,
  executePdfToExcelConversion
} from '../lib/excelGenerator';

interface WorkWorkspaceProps {
  currentResult: OCRProcessResult | null;
  onUpdateResult: (result: OCRProcessResult | null) => void;
  isProcessing: boolean;
  onProcessDocument: (payload: {
    imageBase64?: string;
    mimeType?: string;
    rawText?: string;
    requestedEncoding: EncodingType;
    userHint?: string;
    targetLanguage?: string;
    forceLocalTesseract?: boolean;
  }) => void;
  selectedEncoding: EncodingType;
  setSelectedEncoding: (enc: EncodingType) => void;
  selectedLanguage?: OfficialIndianLanguageCode;
  onSelectLanguage?: (lang: OfficialIndianLanguageCode) => void;
  onOpenDocxModal: () => void;
  onOpenExeModal?: () => void;
  onSwitchToBatch?: () => void;
  onSwitchToPdfEditor?: () => void;
  onSwitchToPdfToExcel?: () => void;
  onFileSelect?: (file: File) => void;
  errorMessage?: string | null;
  onClearError?: () => void;
}

export const WorkWorkspace: React.FC<WorkWorkspaceProps> = ({
  currentResult,
  onUpdateResult,
  isProcessing,
  onProcessDocument,
  selectedEncoding,
  setSelectedEncoding,
  selectedLanguage = 'auto',
  onSelectLanguage,
  onOpenDocxModal,
  onOpenExeModal,
  onSwitchToBatch,
  onSwitchToPdfEditor,
  onSwitchToPdfToExcel,
  onFileSelect,
  errorMessage,
  onClearError
}) => {
  // Input State
  const [inputMode, setInputMode] = useState<'upload' | 'camera' | 'paste'>('upload');
  const [isDownloadingExcel, setIsDownloadingExcel] = useState<boolean>(false);
  const [multiPageProgressMsg, setMultiPageProgressMsg] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    preview: string | null;
    rawText?: string;
    mimeType?: string;
    file?: File;
    pageCount?: number;
  } | null>(null);
  const [pastedText, setPastedText] = useState<string>('');

  // Font Selection for Output & DOCX
  const [selectedFont, setSelectedFont] = useState<TamilDocxFont>('TAU-Marutham');

  // Camera stream state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // File input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);

  // Output State
  const [isDownloadingDocx, setIsDownloadingDocx] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [lineEditText, setLineEditText] = useState<string>('');

  // Stop camera when switching mode or unmounting
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (inputMode !== 'camera') {
      stopCamera();
    }
  }, [inputMode]);

  const startCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
        });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } else {
        throw new Error('Camera not supported by browser');
      }
    } catch (err: any) {
      console.warn('WebRTC camera error; using native camera capture fallback:', err);
      setCameraError('Camera stream unavailable. Use direct photo capture.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setUploadedFile({
        name: `Camera_Scan_${Date.now()}.jpg`,
        preview: dataUrl,
        mimeType: 'image/jpeg'
      });
      stopCamera();
    }
  };

  // Handle single file upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const nameLower = file.name.toLowerCase();
    const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|bmp|tiff|avif)$/i.test(nameLower);
    const isPdf = file.type === 'application/pdf' || nameLower.endsWith('.pdf');

    if (onFileSelect) {
      onFileSelect(file);
    }

    if (isPdf) {
      countPdfPages(file).then((pCount) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          setUploadedFile({
            name: file.name,
            preview: base64,
            mimeType: 'application/pdf',
            file: file,
            pageCount: pCount
          });
        };
        reader.readAsDataURL(file);
      }).catch(() => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          setUploadedFile({
            name: file.name,
            preview: base64,
            mimeType: 'application/pdf',
            file: file,
            pageCount: 1
          });
        };
        reader.readAsDataURL(file);
      });
    } else if (isImage) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setUploadedFile({
          name: file.name,
          preview: base64,
          mimeType: file.type || 'image/jpeg',
          file: file,
          pageCount: 1
        });
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setUploadedFile({
          name: file.name,
          preview: null,
          rawText: text,
          file: file,
          pageCount: 1
        });
        setPastedText(text);
      };
      reader.readAsText(file);
    }
  };

  // Handle native camera capture input
  const handleNativeCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setUploadedFile({
        name: `Camera_Scan_${Date.now()}.jpg`,
        preview: base64,
        mimeType: file.type || 'image/jpeg',
        file: file,
        pageCount: 1
      });
    };
    reader.readAsDataURL(file);
  };

  // Execute OCR / Conversion
  const handleConvert = () => {
    if (inputMode === 'upload' || inputMode === 'camera') {
      if (uploadedFile?.preview) {
        onProcessDocument({
          imageBase64: uploadedFile.preview,
          mimeType: uploadedFile.mimeType || 'image/jpeg',
          requestedEncoding: selectedEncoding,
          userHint: uploadedFile.name,
          targetLanguage: selectedLanguage
        });
      } else if (uploadedFile?.rawText) {
        onProcessDocument({
          rawText: uploadedFile.rawText,
          requestedEncoding: selectedEncoding,
          userHint: uploadedFile.name,
          targetLanguage: selectedLanguage
        });
      }
    } else if (inputMode === 'paste' && pastedText.trim()) {
      onProcessDocument({
        rawText: pastedText,
        requestedEncoding: selectedEncoding,
        userHint: 'Pasted Indian Language Text',
        targetLanguage: selectedLanguage
      });
    }
  };

  // Direct In-Browser Tesseract.js OCR Execution
  const handleConvertTesseractDirect = () => {
    if (uploadedFile?.preview) {
      onProcessDocument({
        imageBase64: uploadedFile.preview,
        mimeType: uploadedFile.mimeType || 'image/jpeg',
        requestedEncoding: selectedEncoding,
        userHint: uploadedFile.name,
        targetLanguage: selectedLanguage,
        forceLocalTesseract: true
      });
    }
  };

  // 1-Click direct DOCX download with chosen font
  const handleDownloadDocx = async () => {
    if (!currentResult) return;
    try {
      setIsDownloadingDocx(true);
      const blob = await generateTamilDocxBlob(currentResult, {
        documentTitle: currentResult.metadata?.documentTitle || 'தமிழ் ஆவணம்',
        fontSize: 12,
        fontFamily: selectedFont,
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
      const safeTitle = (currentResult.metadata?.documentTitle || 'Tamil_Document')
        .replace(/[^a-zA-Z0-9_\u0B80-\u0BFF]/g, '_')
        .slice(0, 40);
      a.href = url;
      a.download = `${safeTitle}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate DOCX:', err);
    } finally {
      setIsDownloadingDocx(false);
    }
  };

  // 1-Click direct Excel (.xlsx) download
  const handleDownloadExcel = async () => {
    // If a multi-page PDF file is loaded, convert all pages into the single sheet!
    if (uploadedFile?.file && (uploadedFile.pageCount || 1) > 1) {
      try {
        setIsDownloadingExcel(true);
        setMultiPageProgressMsg(`${uploadedFile.pageCount} பக்கங்களும் Excel-ஆக மாற்றப்படுகிறது...`);
        const conv = await executePdfToExcelConversion(uploadedFile.file, {
          autoDownload: true,
          singleSheetMode: true,
          onProgress: (msg, _pct) => setMultiPageProgressMsg(msg)
        });
        if (conv?.result) {
          onUpdateResult(conv.result);
        }
      } catch (err) {
        console.error('Multi-page Excel conversion failed:', err);
        if (currentResult) {
          downloadTamilExcelFile(currentResult, currentResult.metadata?.documentTitle, { singleSheetMode: true });
        }
      } finally {
        setIsDownloadingExcel(false);
        setMultiPageProgressMsg(null);
      }
      return;
    }

    if (!currentResult) return;
    try {
      setIsDownloadingExcel(true);
      downloadTamilExcelFile(currentResult, currentResult.metadata?.documentTitle, { singleSheetMode: true });
    } catch (err) {
      console.error('Failed to generate Excel:', err);
    } finally {
      setIsDownloadingExcel(false);
    }
  };

  // Download raw Unicode text file
  const handleDownloadTxt = () => {
    if (!currentResult) return;
    const lines = currentResult.lines || [];
    const text = lines.map((l) => l.tamilText).join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentResult.metadata?.documentTitle || 'Tamil_Text'}_Unicode.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy Unicode Text to clipboard
  const handleCopyText = () => {
    if (!currentResult) return;
    const lines = currentResult.lines || [];
    const text = lines.map((l) => l.tamilText).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  // Save edited line
  const handleSaveLine = (lineId: string) => {
    if (!currentResult || !Array.isArray(currentResult.lines)) return;
    const updatedLines = currentResult.lines.map((l) => {
      if (l.id === lineId) {
        const words = lineEditText.split(/\s+/).filter(Boolean);
        const wordTokens: WordToken[] = words.map((w, widx) => ({
          id: `w-edit-${widx}`,
          text: w,
          confidence: 1.0,
          isoTransliteration: transliterateTamilToISO(w),
          phonetic: transliterateTamilToISO(w),
          isCorrected: true
        }));
        return { ...l, tamilText: lineEditText, words };
      }
      return l;
    });

    onUpdateResult({
      ...currentResult,
      lines: updatedLines,
      fullUnicodeText: updatedLines.map((l) => l.tamilText).join('\n')
    });
    setEditingLineId(null);
  };

  // Delete line
  const handleDeleteLine = (lineId: string) => {
    if (!currentResult || !Array.isArray(currentResult.lines)) return;
    const updatedLines = currentResult.lines.filter((l) => l.id !== lineId);
    onUpdateResult({
      ...currentResult,
      lines: updatedLines,
      fullUnicodeText: updatedLines.map((l) => l.tamilText).join('\n')
    });
  };

  const hasValidInput =
    (inputMode === 'upload' && (uploadedFile?.preview || uploadedFile?.rawText)) ||
    (inputMode === 'camera' && uploadedFile?.preview) ||
    (inputMode === 'paste' && pastedText.trim().length > 0);

  return (
    <div className="space-y-6">
      {/* Hidden File & Camera Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf,.txt"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={nativeCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleNativeCameraCapture}
        className="hidden"
      />

      {/* Error Alert Banner if OCR engine encounters high demand or failure */}
      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-200">{errorMessage}</p>
              <p className="text-xs text-red-300/80 mt-0.5">
                Gemini மாதிரி அதிக தேவையில் இருக்கும்போது தானாகவே அடுத்த மாற்று மாதிரிக்கு மாறுகிறது.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              onClick={handleConvert}
              disabled={isProcessing}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>மீண்டும் முயற்சிக்கவும் (Retry)</span>
            </button>
            {onClearError && (
              <button
                onClick={onClearError}
                className="px-2.5 py-1.5 text-xs text-gray-400 hover:text-white cursor-pointer"
              >
                தவிர்
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Dual Workspace: Work Input (Left) & Work Output (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ========================================================================= */}
        {/* 1. WORK INPUT (பணி உள்ளீடு) */}
        {/* ========================================================================= */}
        <div className="bg-[#12141A] border border-white/10 p-6 flex flex-col justify-between min-h-[580px] shadow-xl">
          <div className="space-y-5">
            {/* Input Header & Mode Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FFB800]"></span>
                  <span>பணி உள்ளீடு (WORK INPUT)</span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  கோப்பு பதிவேற்றம் அல்லது கேமரா மூலம் ஸ்கேன் செய்க
                </p>
              </div>

              {/* Mode Switcher */}
              <div className="flex bg-[#0A0B0E] p-1 border border-white/10">
                <button
                  id="tab-input-upload"
                  onClick={() => setInputMode('upload')}
                  className={`px-3 py-1.5 text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                    inputMode === 'upload'
                      ? 'bg-white/10 text-white border border-[#FFB800]/50'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5 text-[#FFB800]" />
                  <span>பதிவேற்றம்</span>
                </button>

                <button
                  id="tab-input-camera"
                  onClick={() => {
                    setInputMode('camera');
                    startCamera();
                  }}
                  className={`px-3 py-1.5 text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                    inputMode === 'camera'
                      ? 'bg-white/10 text-white border border-[#00FF66]/50'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5 text-[#00FF66]" />
                  <span>கேமரா</span>
                </button>

                <button
                  id="tab-input-paste"
                  onClick={() => setInputMode('paste')}
                  className={`px-3 py-1.5 text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                    inputMode === 'paste'
                      ? 'bg-white/10 text-white border border-[#FFB800]/50'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 text-[#FFB800]" />
                  <span>உரை</span>
                </button>
              </div>
            </div>

            {/* Input Content Area */}
            {/* Mode A: File Upload */}
            {inputMode === 'upload' && (
              <div className="space-y-4">
                <div
                  id="dropzone-file-upload"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/20 hover:border-[#FFB800] bg-[#0A0B0E] p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] group"
                >
                  <div className="w-12 h-12 bg-white/5 group-hover:bg-[#FFB800]/10 text-gray-400 group-hover:text-[#FFB800] flex items-center justify-center rounded-lg border border-white/10 mb-3 transition-colors">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase group-hover:text-[#FFB800]">
                    {uploadedFile?.name ? uploadedFile.name : 'கோப்பை இங்கே பதிவேற்றவும் (DROP FILE)'}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 font-mono">
                    PNG, JPG, PDF, Scanned TIFF அல்லது Text கோப்பு
                  </p>
                </div>

                {uploadedFile?.preview && (
                  <div className="bg-[#0A0B0E] p-3 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {uploadedFile.mimeType === 'application/pdf' ? (
                        <div className="w-12 h-12 bg-emerald-950/40 border border-emerald-500/40 flex flex-col items-center justify-center text-emerald-400">
                          <FileSpreadsheet className="w-5 h-5" />
                          <span className="text-[9px] font-mono font-bold uppercase mt-0.5">PDF</span>
                        </div>
                      ) : (
                        <img
                          src={uploadedFile.preview}
                          alt="Preview"
                          className="w-12 h-12 object-cover border border-white/20 rounded"
                        />
                      )}
                      <div>
                        <p className="text-xs font-bold text-white truncate max-w-xs">{uploadedFile.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-[#00FF66] font-mono">ஆவணம் தயார் (Ready)</span>
                          {uploadedFile.pageCount && uploadedFile.pageCount > 1 && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 border border-emerald-500/40 font-mono font-bold">
                              {uploadedFile.pageCount} பக்கங்கள் (Pages)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {uploadedFile.pageCount && uploadedFile.pageCount > 1 && (
                        <button
                          type="button"
                          onClick={handleDownloadExcel}
                          disabled={isDownloadingExcel}
                          className="text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-black px-3 py-1.5 uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all shadow-md"
                          title="Convert all 19 pages into a single consolidated Excel sheet"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>{isDownloadingExcel ? 'மாற்றுகிறது...' : `${uploadedFile.pageCount} பக்கங்களையும் Excel-ஆக மாற்று`}</span>
                        </button>
                      )}
                      <button
                        onClick={() => setUploadedFile(null)}
                        className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 cursor-pointer"
                      >
                        நீக்கு (Remove)
                      </button>
                    </div>
                  </div>
                )}

                {/* Multi-page progress alert */}
                {multiPageProgressMsg && (
                  <div className="bg-emerald-950/60 border border-emerald-500/50 p-3 text-xs text-emerald-200 font-mono flex items-center gap-2 animate-pulse">
                    <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>{multiPageProgressMsg}</span>
                  </div>
                )}
              </div>
            )}

            {/* Mode B: Camera Scan */}
            {inputMode === 'camera' && (
              <div className="space-y-4">
                {isCameraActive ? (
                  <div className="relative bg-black border border-white/20 overflow-hidden aspect-video flex items-center justify-center">
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                    <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3 px-4">
                      <button
                        id="btn-capture-photo"
                        onClick={capturePhoto}
                        className="bg-[#00FF66] hover:bg-[#00e65c] text-black font-black px-6 py-2.5 text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>புகைப்படம் எடு (CAPTURE PHOTO)</span>
                      </button>
                      <button
                        onClick={stopCamera}
                        className="bg-black/80 hover:bg-black text-white px-4 py-2.5 text-xs uppercase border border-white/20 cursor-pointer"
                      >
                        நிறுத்து
                      </button>
                    </div>
                  </div>
                ) : uploadedFile?.preview ? (
                  <div className="bg-[#0A0B0E] p-4 border border-white/10 space-y-3 text-center">
                    <img
                      src={uploadedFile.preview}
                      alt="Captured document"
                      className="max-h-56 mx-auto object-contain border border-white/20"
                    />
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={startCamera}
                        className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 uppercase font-bold border border-white/20 flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>மீண்டும் புகைப்படம் எடு</span>
                      </button>
                      <button
                        onClick={() => nativeCameraInputRef.current?.click()}
                        className="bg-white/10 hover:bg-white/20 text-[#00FF66] text-xs px-3 py-1.5 uppercase font-bold border border-white/20 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>நேரடி கேமரா</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#0A0B0E] p-8 border border-white/10 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-[#00FF66]/10 border border-[#00FF66] mx-auto flex items-center justify-center text-[#00FF66]">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase">கேமரா மூலம் ஆவணத்தை ஸ்கேன் செய்க</h3>
                      <p className="text-xs text-gray-400 mt-1">நேரடி வீடியோ அல்லது மொபைல் கேமரா மூலம் படம்பிடிக்கலாம்</p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        id="btn-start-camera-stream"
                        onClick={startCamera}
                        className="bg-[#00FF66] hover:bg-[#00e65c] text-black font-black px-5 py-2.5 text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>லைவ் கேமரா தொடங்கு</span>
                      </button>
                      <button
                        id="btn-native-camera-capture"
                        onClick={() => nativeCameraInputRef.current?.click()}
                        className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2.5 text-xs uppercase border border-white/20 cursor-pointer"
                      >
                        நேரடி படம் (Direct Photo)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mode C: Paste Text */}
            {inputMode === 'paste' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
                  <span>பாமினி / TSCII / TAM உரை:</span>
                  <span>{pastedText.length} எழுத்துக்கள்</span>
                </div>
                <textarea
                  id="textarea-work-paste"
                  rows={8}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="e.g. md;ghd jkpœ kf;fs;... (Bamini) அல்லது தட்டச்சு உரை..."
                  className="w-full bg-[#0A0B0E] border border-white/10 focus:border-[#FFB800] p-3 text-xs font-mono text-gray-200 outline-none resize-none leading-relaxed"
                />
              </div>
            )}

            {/* Language & Encoding Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Language Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#FFB800] mb-1.5 font-mono flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5" />
                  <span>ஆவண மொழி (Language):</span>
                </label>
                <select
                  id="select-work-language"
                  value={selectedLanguage}
                  onChange={(e) => onSelectLanguage?.(e.target.value as OfficialIndianLanguageCode)}
                  className="w-full bg-[#0A0B0E] border border-[#FFB800]/40 focus:border-[#FFB800] px-3 py-2 text-xs text-white font-bold outline-none cursor-pointer"
                >
                  {OFFICIAL_INDIAN_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-[#0F1115] text-white">
                      {lang.name} • {lang.nativeName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Encoding Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                  எழுத்துரு வகை (Encoding):
                </label>
                <select
                  id="select-work-encoding"
                  value={selectedEncoding}
                  onChange={(e) => setSelectedEncoding(e.target.value as EncodingType)}
                  className="w-full bg-[#0A0B0E] border border-white/20 focus:border-[#FFB800] px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="AUTO_DETECT">தானியங்கி கண்டறிதல் (Auto-Detect Encoding & OCR)</option>
                  <option value="BAMINI">பாமினி (BAMINI)</option>
                  <option value="TSCII">TSCII (தமிழ் ஸ்டாண்டர்ட்)</option>
                  <option value="TAM">TAM / TAB</option>
                  <option value="SHREELIPI">ShreeLipi / Shree-Tam</option>
                  <option value="SCANNED_IMAGE_OCR">ஸ்கேன் ஆவணம் (Scanned Image OCR)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="pt-6 border-t border-white/10 mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {onSwitchToPdfEditor && (
                <button
                  onClick={onSwitchToPdfEditor}
                  className="text-xs text-[#38BDF8] hover:text-[#7dd3fc] font-mono uppercase tracking-wider flex items-center gap-1.5 cursor-pointer bg-[#38BDF8]/10 px-2.5 py-1.5 border border-[#38BDF8]/30"
                  title="Open in Nitro PDF Editor to annotate, stamp, redact, or sign"
                >
                  <FileSignature className="w-3.5 h-3.5" />
                  <span>PDF திருத்தி →</span>
                </button>
              )}
              {onSwitchToPdfToExcel && (
                <button
                  id="btn-switch-to-pdf-to-excel"
                  onClick={onSwitchToPdfToExcel}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-mono uppercase tracking-wider flex items-center gap-1.5 cursor-pointer bg-emerald-950/40 px-2.5 py-1.5 border border-emerald-500/30"
                  title="Convert PDF Tables & Data to Excel Spreadsheet (.xlsx)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>PDF ➔ Excel (.xlsx) →</span>
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              {uploadedFile?.preview && (
                <button
                  id="btn-work-convert-tesseract"
                  type="button"
                  disabled={isProcessing}
                  onClick={handleConvertTesseractDirect}
                  className="w-full sm:w-auto px-4 py-3 bg-[#0A0B0E] hover:bg-white/10 text-[#00FF66] border border-[#00FF66]/40 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  title="Run offline in-browser Tesseract.js Tamil (tam+eng) OCR"
                >
                  <Eye className="w-3.5 h-3.5 text-[#00FF66]" />
                  <span>நேரடி Tesseract.js OCR</span>
                </button>
              )}

              <button
                id="btn-work-convert"
                disabled={isProcessing || !hasValidInput}
                onClick={handleConvert}
                className={`w-full sm:w-auto px-6 py-3 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isProcessing
                    ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                    : hasValidInput
                    ? 'bg-[#FFB800] hover:bg-[#ffc833] text-black shadow-lg shadow-[#FFB800]/20'
                    : 'bg-white/10 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>செயலாக்கப்படுகிறது...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>மாற்றுக (CONVERT)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. WORK OUTPUT (பணி வெளியீடு) */}
        {/* ========================================================================= */}
        <div className="bg-[#12141A] border border-white/10 p-6 flex flex-col justify-between min-h-[580px] shadow-xl">
          {currentResult ? (
            <div className="space-y-5 flex-1 flex flex-col">
              {/* Output Toolbar & Font Selection */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-mono text-gray-300 uppercase tracking-wider">
                    எழுத்துரு (FONT):
                  </label>
                  <select
                    value={selectedFont}
                    onChange={(e) => setSelectedFont(e.target.value as TamilDocxFont)}
                    className="bg-[#0A0B0E] border border-white/20 focus:border-[#00FF66] px-3 py-1.5 text-xs text-[#00FF66] font-bold outline-none cursor-pointer"
                  >
                    <option value="TAU-Marutham">TAU-Marutham (மருதம் - Default)</option>
                    <option value="Latha">Latha (லதா)</option>
                    <option value="Vijaya">Vijaya (விஜயா)</option>
                    <option value="Nirmala UI">Nirmala UI (நிர்மலா)</option>
                    <option value="Kavivanar">Kavivanar (கவிவாணர்)</option>
                    <option value="Mukta Malar">Mukta Malar (முக்தா மலர்)</option>
                    <option value="Noto Sans Tamil">Noto Sans Tamil</option>
                    <option value="Bamini">Bamini (பாமினி)</option>
                    <option value="Arial Unicode MS">Arial Unicode MS</option>
                    <option value="Times New Roman">Times New Roman</option>
                  </select>
                </div>

                {/* Primary Output Actions */}
                <div className="flex items-center gap-2">
                  <button
                    id="btn-work-download-excel"
                    disabled={isDownloadingExcel}
                    onClick={handleDownloadExcel}
                    className="bg-emerald-400 hover:bg-emerald-300 text-black font-black px-4 py-2 text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                    title="Download as Excel spreadsheet (.xlsx)"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>{isDownloadingExcel ? 'உருவாகிறது...' : 'Excel (.xlsx)'}</span>
                  </button>

                  <button
                    id="btn-work-download-docx"
                    disabled={isDownloadingDocx}
                    onClick={handleDownloadDocx}
                    className="bg-[#00FF66] hover:bg-[#00e65c] text-black font-black px-4 py-2 text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                    title="Download formatted DOCX"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isDownloadingDocx ? 'உருவாகிறது...' : 'DOCX'}</span>
                  </button>

                  <button
                    id="btn-work-docx-options"
                    onClick={onOpenDocxModal}
                    className="bg-[#0A0B0E] hover:bg-white/10 text-gray-300 hover:text-white p-2 border border-white/10 cursor-pointer"
                    title="DOCX Options"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Utility Sub-actions Bar */}
              <div className="flex items-center justify-end text-xs font-mono text-gray-400 bg-[#0A0B0E] p-2 border border-white/5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadExcel}
                    className="hover:text-emerald-400 flex items-center gap-1 cursor-pointer px-2 py-1 hover:bg-white/5 text-emerald-400/90"
                    title="Export as Microsoft Excel spreadsheet (.xlsx)"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Excel (.xlsx)</span>
                  </button>
                  <span>•</span>
                  <button
                    onClick={handleCopyText}
                    className="hover:text-white flex items-center gap-1 cursor-pointer px-2 py-1 hover:bg-white/5"
                  >
                    {copiedNotification ? <Check className="w-3.5 h-3.5 text-[#00FF66]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedNotification ? 'நகலெடுக்கப்பட்டது' : 'நகலெடு (Copy)'}</span>
                  </button>
                  <span>•</span>
                  <button
                    onClick={handleDownloadTxt}
                    className="hover:text-white flex items-center gap-1 cursor-pointer px-2 py-1 hover:bg-white/5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>TXT பதிவிறக்கு</span>
                  </button>
                  {onOpenExeModal && (
                    <>
                      <span>•</span>
                      <button
                        id="btn-work-export-exe"
                        onClick={onOpenExeModal}
                        className="hover:text-[#00F0FF] flex items-center gap-1 cursor-pointer px-2 py-1 hover:bg-white/5 text-[#00F0FF]/90 font-mono"
                        title="Download portable tamify.exe for Windows offline use"
                      >
                        <Laptop className="w-3.5 h-3.5 text-[#00F0FF]" />
                        <span>tamify.exe</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Converted Unicode Text Lines Area */}
              <div className="flex-1 max-h-[380px] overflow-y-auto space-y-2 pr-1">
                {(currentResult.lines || []).map((line, idx) => (
                  <div
                    key={line.id ? `${line.id}-${idx}` : `line-${idx}`}
                    className="group bg-[#0A0B0E] hover:bg-black/60 p-3 border border-white/5 hover:border-white/20 transition-colors"
                  >
                    {editingLineId === line.id ? (
                      <div className="space-y-2">
                        <textarea
                          rows={2}
                          value={lineEditText}
                          onChange={(e) => setLineEditText(e.target.value)}
                          className="w-full bg-[#12141A] border border-[#FFB800] p-2 text-xs text-white font-sans outline-none leading-relaxed"
                        />
                        <div className="flex items-center justify-end gap-2 text-xs">
                          <button
                            onClick={() => setEditingLineId(null)}
                            className="px-2.5 py-1 text-gray-400 hover:text-white uppercase font-mono"
                          >
                            ரத்து
                          </button>
                          <button
                            onClick={() => handleSaveLine(line.id)}
                            className="bg-[#00FF66] text-black font-bold px-3 py-1 uppercase"
                          >
                            சேமி
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-xs sm:text-sm text-gray-200 font-sans leading-relaxed flex-1">
                          {line.tamilText}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity shrink-0">
                          <button
                            onClick={() => {
                              setEditingLineId(line.id);
                              setLineEditText(line.tamilText);
                            }}
                            className="p-1 hover:text-[#FFB800] text-gray-400 cursor-pointer"
                            title="திருத்து (Edit line)"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteLine(line.id)}
                            className="p-1 hover:text-rose-400 text-gray-400 cursor-pointer"
                            title="நீக்கு (Delete line)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Table Extracted Preview (if any) */}
                {currentResult.tables && currentResult.tables.length > 0 && currentResult.tables[0] && (
                  <div className="bg-[#0A0B0E] p-3 border border-white/10 space-y-2 mt-3">
                    <div className="flex items-center gap-1.5 text-xs font-mono text-[#FFB800]">
                      <TableIcon className="w-3.5 h-3.5" />
                      <span>கண்டறியப்பட்ட அட்டவணை (EXTRACTED TABLE):</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse border border-white/10">
                        <thead>
                          <tr className="bg-white/5 text-gray-300">
                            {(currentResult.tables[0].headers || []).map((h, i) => (
                              <th key={i} className="p-2 border border-white/10 font-bold">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(currentResult.tables[0].rows || []).map((r, ri) => (
                            <tr key={ri} className="border-b border-white/5 hover:bg-white/5">
                              {(Array.isArray(r) ? r : [r]).map((c, ci) => (
                                <td key={ci} className="p-2 border border-white/10 text-gray-200">
                                  {c}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Quick Status */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-gray-400">
                <span>வெளியீட்டு எழுத்துரு: TAU-Marutham (மருதம்)</span>
                <span className="text-[#00FF66]">ஒருங்குறி மாற்றம் நிறைவுற்றது</span>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400 space-y-3">
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase">வெளியீடு காத்திருக்கிறது (Awaiting Output)</h3>
              <p className="text-xs text-gray-400 max-w-sm">
                இடதுபுறம் உள்ள பகுதியில் ஆவணத்தை பதிவேற்றி அல்லது கேமரா மூலம் படம்பிடித்து மாற்றவும். தூய ஒருங்குறி DOCX வடிவில் உடனடியாக பதிவிறக்கலாம்.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
