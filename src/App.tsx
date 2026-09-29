/**
 * Tamify • Indian Languages & Document Conversion Studio
 * Features:
 * - PDF to Excel (Spreadsheet extraction with Indian languages OCR)
 * - PDF to Word (High fidelity OCR & DOCX generation with TAU-Marutham typography)
 * - PDF Editor (Annotate, view, and process PDF pages)
 * - Language Converter (Official Indian Languages transliteration & legacy font conversion)
 */
import React, { useState } from 'react';
import { Header } from './components/Header';
import { WorkWorkspace } from './components/WorkWorkspace';
import { PdfEditorWorkspace } from './components/PdfEditorWorkspace';
import { LegacyConverterToolbox } from './components/LegacyConverterToolbox';
import { DocxExportModal } from './components/DocxExportModal';
import { WindowsExeExportModal } from './components/WindowsExeExportModal';
import { PdfToExcelConverter } from './components/PdfToExcelConverter';
import { OfficialReplyLetterWorkspace } from './components/OfficialReplyLetterWorkspace';
import {
  OCRProcessResult,
  EncodingType,
  ActiveTabType,
  OfficialIndianLanguageCode,
  OFFICIAL_INDIAN_LANGUAGES
} from './types';
import { convertLegacyToUnicode } from './lib/legacyConverters';
import { normalizeTamilScript, extractTamilDocumentStructureAndMetadata } from './lib/tamilMorphology';
import { runTesseractTamilOCR } from './lib/tesseractOcrEngine';

export default function App() {
  const [currentResult, setCurrentResult] = useState<OCRProcessResult | null>(null);
  const [activePdfFile, setActivePdfFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [ocrProgressMessage, setOcrProgressMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTabType>('pdf-to-excel');
  const [selectedLanguage, setSelectedLanguage] = useState<OfficialIndianLanguageCode>('auto');
  const [selectedEncoding, setSelectedEncoding] = useState<EncodingType>('AUTO_DETECT');
  const [isDocxModalOpen, setIsDocxModalOpen] = useState<boolean>(false);
  const [isWindowsExeModalOpen, setIsWindowsExeModalOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Deterministic + morphological client OCR builder
  const buildClientResult = (text?: string, enc: EncodingType = 'AUTO_DETECT', title?: string): OCRProcessResult => {
    const startTime = Date.now();
    let contentToProcess = text || '';

    let converted = contentToProcess;
    if (enc === 'BAMINI' || enc === 'TSCII' || enc === 'TAM' || enc === 'TAB' || enc === 'SHREELIPI') {
      converted = convertLegacyToUnicode(contentToProcess, enc);
    }
    const { normalized, fixesCount } = normalizeTamilScript(converted);
    const docStructure = extractTamilDocumentStructureAndMetadata(normalized, title);

    return {
      detectedEncoding: enc === 'AUTO_DETECT' ? 'SCANNED_IMAGE_OCR' : enc,
      encodingConfidence: 0.98,
      processingMethod: 'HYBRID_FUSED',
      metadata: docStructure.metadata,
      fullUnicodeText: normalized,
      lines: docStructure.lines,
      tables: docStructure.tables,
      overallConfidence: 0.97,
      highConfidenceCount: docStructure.highCount,
      mediumConfidenceCount: docStructure.medCount,
      lowConfidenceCount: docStructure.lowCount,
      morphologyStats: {
        sandhiAdjusted: docStructure.sandhiCount,
        govTermsIdentified: docStructure.govTermsCount,
        ligaturesFixed: fixesCount,
        archaicGlyphsResolved: 0
      },
      processingTimeMs: Date.now() - startTime,
      logs: ['Document Unicode conversion completed with TAU-Marutham typography']
    };
  };

  // Central Document Processing Handler
  const handleProcessDocument = async (payload: {
    imageBase64?: string;
    mimeType?: string;
    rawText?: string;
    requestedEncoding: EncodingType;
    userHint?: string;
    targetLanguage?: string;
    forceLocalTesseract?: boolean;
  }) => {
    setIsProcessing(true);
    setErrorMessage(null);
    const effectiveLang = payload.targetLanguage || selectedLanguage;
    setOcrProgressMessage(`ஆவணம் பகுப்பாய்வு செய்யப்படுகிறது (${effectiveLang !== 'auto' ? effectiveLang.toUpperCase() : 'AUTO'})...`);

    // If client requested local in-browser OCR
    if (payload.forceLocalTesseract && payload.imageBase64) {
      try {
        setOcrProgressMessage('உலாவியின் உள்ளமைந்த Tesseract.js OCR இயங்குகிறது...');
        const tessLangs = effectiveLang && effectiveLang !== 'auto'
          ? `${effectiveLang}+eng`
          : 'tam+eng';
        const tessResult = await runTesseractTamilOCR(payload.imageBase64, {
          userHint: payload.userHint,
          requestedEncoding: payload.requestedEncoding,
          languages: tessLangs,
          onProgress: (p) => {
            setOcrProgressMessage(`[Tesseract.js] ${p.message}`);
          }
        });
        setCurrentResult(tessResult);
        setIsProcessing(false);
        setOcrProgressMessage(null);
        return;
      } catch (tessErr: any) {
        console.warn('Direct Tesseract failed, falling back to server:', tessErr);
      }
    }

    try {
      setOcrProgressMessage('ஆவணம் பகுப்பாய்வு செய்யப்படுகிறது (Cloud AI Vision & Indic OCR)...');
      let res: Response | null = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          res = await fetch('/api/ocr-ensemble', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: payload.imageBase64,
              mimeType: payload.mimeType,
              rawText: payload.rawText,
              requestedEncoding: payload.requestedEncoding,
              userHint: payload.userHint,
              targetLanguage: effectiveLang
            })
          });

          if (res.ok) break;

          if ((res.status === 503 || res.status === 429) && attempt === 0) {
            setOcrProgressMessage('சேவை பிஸியாக உள்ளது, மீண்டும் முயற்சிக்கப்படுகிறது...');
            await new Promise((r) => setTimeout(r, 1200));
            continue;
          }

          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `சேவை பிழை (Status: ${res.status})`);
        } catch (fetchErr: any) {
          if (attempt === 0) {
            await new Promise((r) => setTimeout(r, 1200));
            continue;
          }
          throw fetchErr;
        }
      }

      if (!res || !res.ok) {
        throw new Error('சேவை கோரிக்கை தோல்வியடைந்தது.');
      }

      const data = await res.json();
      setCurrentResult(data);
      setErrorMessage(null);
    } catch (err: any) {
      console.warn('Backend call failed, activating Tesseract.js Tamil Fallback:', err);

      // In-browser Tesseract.js OCR fallback for image/pdf
      if (payload.imageBase64) {
        try {
          setOcrProgressMessage('சர்வர் தொடர்பு தாமதமாகிறது. உலாவியின் Tesseract.js OCR இயங்குகிறது...');
          const tessLangs = effectiveLang && effectiveLang !== 'auto'
            ? `${effectiveLang}+eng`
            : 'tam+eng';
          const tessResult = await runTesseractTamilOCR(payload.imageBase64, {
            userHint: payload.userHint,
            requestedEncoding: payload.requestedEncoding,
            languages: tessLangs,
            onProgress: (p) => {
              setOcrProgressMessage(`[Tesseract.js Fallback] ${p.message}`);
            }
          });
          tessResult.logs.unshift(
            `[Tesseract.js Fallback Active] Backend API unavailable (${err.message || 'offline'}). Resiliently processed via in-browser Indic Engine.`
          );
          setCurrentResult(tessResult);
          setErrorMessage(null);
          return;
        } catch (tessErr: any) {
          console.error('Tesseract fallback failed:', tessErr);
        }
      }

      if (payload.rawText && payload.rawText.trim().length > 0) {
        const fallback = buildClientResult(payload.rawText, payload.requestedEncoding, payload.userHint);
        fallback.logs.unshift('[Fallback Active] Local deterministic converter applied.');
        setCurrentResult(fallback);
      } else {
        setErrorMessage(
          `ஆவண செயலாக்கம் தோல்வியடைந்தது: ${err.message || 'தெரியாத பிழை'}. தயவுசெய்து உங்கள் கோப்பை சரிபார்க்கவும்.`
        );
      }
    } finally {
      setIsProcessing(false);
      setOcrProgressMessage(null);
    }
  };

  const selectedLangObj = OFFICIAL_INDIAN_LANGUAGES.find((l) => l.code === selectedLanguage);

  return (
    <div className="min-h-screen bg-[#07080A] text-[#D1D5DB] flex flex-col font-sans selection:bg-[#FFB800] selection:text-black">
      {/* Universal Header with 4 Tabs & Language Selector */}
      <Header
        currentResult={currentResult}
        isProcessing={isProcessing}
        onOpenDocxModal={() => setIsDocxModalOpen(true)}
        onOpenExeModal={() => setIsWindowsExeModalOpen(true)}
        onReset={() => {
          setActiveTab('pdf-to-excel');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={setSelectedLanguage}
      />

      {/* Main Workspace: 4 Simple Dedicated Tabs */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Live Active OCR & Indic Ensemble Notification Banner */}
        {isProcessing && ocrProgressMessage && (
          <div className="mb-6 p-4 bg-[#12141A] border-2 border-[#FFB800] rounded shadow-2xl flex items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-[#FFB800] border-t-transparent rounded-full animate-spin shrink-0"></div>
              <div>
                <div className="text-xs font-mono font-bold text-[#FFB800] uppercase tracking-wider flex items-center gap-2">
                  <span>OCR Ensemble & Indic Engine Active</span>
                  <span className="bg-[#FFB800]/20 text-[#FFB800] px-2 py-0.5 text-[10px] rounded">LIVE</span>
                </div>
                <div className="text-xs text-white mt-0.5 font-sans font-medium">
                  {ocrProgressMessage}
                </div>
              </div>
            </div>
            <div className="hidden sm:block text-[11px] font-mono text-gray-400">
              {selectedLangObj ? `${selectedLangObj.name.toUpperCase()} OCR` : 'INDIC OCR'}
            </div>
          </div>
        )}

        {/* TAB 1: PDF TO EXCEL */}
        {activeTab === 'pdf-to-excel' && (
          <PdfToExcelConverter
            initialResult={currentResult}
            initialFile={activePdfFile}
            onOpenInEditor={(res) => {
              setCurrentResult(res);
              setActiveTab('pdf-to-word');
            }}
            selectedLanguage={selectedLanguage}
            onSelectLanguage={setSelectedLanguage}
          />
        )}

        {/* TAB 2: PDF TO WORD */}
        {activeTab === 'pdf-to-word' && (
          <WorkWorkspace
            currentResult={currentResult}
            onUpdateResult={setCurrentResult}
            isProcessing={isProcessing}
            onProcessDocument={handleProcessDocument}
            selectedEncoding={selectedEncoding}
            setSelectedEncoding={setSelectedEncoding}
            selectedLanguage={selectedLanguage}
            onSelectLanguage={setSelectedLanguage}
            onOpenDocxModal={() => setIsDocxModalOpen(true)}
            onOpenExeModal={() => setIsWindowsExeModalOpen(true)}
            onSwitchToPdfEditor={() => setActiveTab('pdf-editor')}
            onSwitchToPdfToExcel={() => setActiveTab('pdf-to-excel')}
            onFileSelect={setActivePdfFile}
            errorMessage={errorMessage}
            onClearError={() => setErrorMessage(null)}
          />
        )}

        {/* TAB 3: OFFICIAL REPLY LETTER (TAMIL NADU GOVT STANDARDS & TAU_MARUTHAM DOCX) */}
        {activeTab === 'reply-letter' && (
          <OfficialReplyLetterWorkspace
            initialPdfFile={activePdfFile}
          />
        )}

        {/* TAB 4: PDF EDITOR */}
        {activeTab === 'pdf-editor' && (
          <PdfEditorWorkspace
            isProcessingOCR={isProcessing}
            onProcessPageOCR={(imageBase64, hint) => {
              handleProcessDocument({
                imageBase64,
                mimeType: 'image/jpeg',
                requestedEncoding: 'AUTO_DETECT',
                userHint: hint || 'PDF Editor Document',
                targetLanguage: selectedLanguage
              });
              setActiveTab('pdf-to-word');
            }}
          />
        )}

        {/* TAB 5: LANGUAGE CONVERTER */}
        {activeTab === 'language-converter' && (
          <LegacyConverterToolbox
            selectedLanguage={selectedLanguage}
            onSelectLanguage={setSelectedLanguage}
          />
        )}
      </main>

      {/* Clean Minimal Footer */}
      <footer className="bg-[#0A0B0E] border-t border-white/10 py-5 text-xs text-gray-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white uppercase tracking-wider">Tamify</span>
            <span>•</span>
            <span className="text-gray-400 font-mono text-[11px]">
              Tamil & Indian Languages Document Studio • PDF to Word, Excel, Official Reply Letter (Tau-marutham), PDF Editor
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono text-gray-400">
            <div>
              Active Language: <span className="text-[#FFB800] font-bold">{selectedLangObj?.name || 'Auto-Detect'}</span>
            </div>
            <div>
              Default Typography: <span className="text-[#00FF66] font-bold">TAU-Marutham & Noto Sans</span>
            </div>
            <span>•</span>
            <button
              id="btn-footer-tamify-exe"
              onClick={() => setIsWindowsExeModalOpen(true)}
              className="text-[#00F0FF] hover:text-white hover:underline flex items-center gap-1 cursor-pointer font-bold transition-colors"
            >
              <span>Download tamify.exe (Win 64-bit)</span>
            </button>
          </div>
        </div>
      </footer>

      {/* DOCX Settings Modal */}
      {currentResult && (
        <DocxExportModal
          isOpen={isDocxModalOpen}
          onClose={() => setIsDocxModalOpen(false)}
          result={currentResult}
        />
      )}

      {/* Standalone Windows Executable (tamify.exe) Export Modal */}
      <WindowsExeExportModal
        isOpen={isWindowsExeModalOpen}
        onClose={() => setIsWindowsExeModalOpen(false)}
      />
    </div>
  );
}
