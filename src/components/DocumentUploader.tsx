import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  FileCode,
  Sparkles,
  Camera,
  Image as ImageIcon,
  Check,
  ChevronRight,
  BookOpen,
  Building,
  LandPlot,
  Newspaper,
  Scroll,
  Info,
  FolderArchive,
  Layers,
  Files
} from 'lucide-react';
import { SAMPLE_DOCUMENTS } from '../lib/sampleDocuments';
import { DocumentSample, EncodingType } from '../types';

interface DocumentUploaderProps {
  onProcessDocument: (
    data: {
      imageBase64?: string;
      mimeType?: string;
      rawText?: string;
      requestedEncoding: EncodingType;
      userHint?: string;
    }
  ) => void;
  isProcessing: boolean;
  selectedEncoding: EncodingType;
  setSelectedEncoding: (enc: EncodingType) => void;
  onSwitchToBatchMode?: () => void;
  onSwitchToPublishedMode?: () => void;
  onMultiFilesSelected?: (files: FileList) => void;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onProcessDocument,
  isProcessing,
  selectedEncoding,
  setSelectedEncoding,
  onSwitchToBatchMode,
  onSwitchToPublishedMode,
  onMultiFilesSelected
}) => {
  const [activeInputType, setActiveInputType] = useState<'upload' | 'paste' | 'samples'>('samples');
  const [selectedSample, setSelectedSample] = useState<DocumentSample>(SAMPLE_DOCUMENTS[0]);
  const [pastedText, setPastedText] = useState<string>(SAMPLE_DOCUMENTS[0].rawText || '');
  const [userHint, setUserHint] = useState<string>('Official Secretariat Government Order (1986)');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Category Icons helper
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'GOVERNMENT_ORDER':
        return Building;
      case 'DEED_REGISTRATION':
        return LandPlot;
      case 'GAZETTE':
        return Newspaper;
      case 'LEGACY_BAMINI':
        return FileCode;
      case 'CLASSICAL_LITERATURE':
      default:
        return Scroll;
    }
  };

  // Handle File Upload (Image or Text/PDF, with multiple files handling)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (files.length > 1 && onMultiFilesSelected) {
      onMultiFilesSelected(files);
      return;
    }

    const file = files[0];
    setFileName(file.name);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setPreviewImage(base64);
        setActiveInputType('upload');
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setPreviewImage(base64);
        setActiveInputType('upload');
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setPastedText(text);
        setActiveInputType('paste');
      };
      reader.readAsText(file);
    }
  };

  const handleSelectSample = (sample: DocumentSample) => {
    setSelectedSample(sample);
    setPastedText(sample.rawText || '');
    setSelectedEncoding(sample.defaultEncoding);
    setUserHint(sample.title);
    setPreviewImage(null);
    setFileName(null);
  };

  const handleStartProcessing = () => {
    if (activeInputType === 'upload' && previewImage) {
      onProcessDocument({
        imageBase64: previewImage,
        mimeType: previewImage.includes('data:application/pdf') ? 'application/pdf' : 'image/png',
        requestedEncoding: selectedEncoding,
        userHint
      });
    } else if (activeInputType === 'paste' || activeInputType === 'samples') {
      onProcessDocument({
        rawText: pastedText,
        requestedEncoding: selectedEncoding,
        userHint
      });
    }
  };

  return (
    <div className="bg-[#12141A] border border-white/10 p-6 sm:p-8 text-[#D1D5DB] max-w-5xl mx-auto shadow-2xl">
      {/* Title & Subtitle */}
      <div className="mb-8 border-b border-white/10 pb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex p-2 bg-white rounded-xl border border-white/20 shadow-xl shrink-0">
            <img
              src="/tamify-logo.svg"
              alt="Tamify"
              className="h-16 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono font-bold text-[#FFB800] uppercase tracking-[0.2em]">
                TAMIFY ENGINE 2026
              </span>
              <span className="h-px bg-[#FFB800]/30 w-12"></span>
              <span className="text-[10px] font-mono font-bold text-[#00FF66] uppercase">
                OUTPUT: MARUTHAM DOCX
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              தமிழ் ஆவணங்களை தூய ஒருங்குறி <span className="text-[#FFB800]">DOCX</span> ஆக மாற்றுக
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-2 font-normal leading-relaxed max-w-2xl">
              பழைய தட்டச்சு அரசாணைகள், பத்திரப்பதிவு ஆவணங்கள், நாளிதழ்கள் மற்றும் BAMINI / TSCII / TAM எழுத்துருக்களை துல்லியமான தமிழ் Unicode Microsoft Word (.docx) கோப்பாக மாற்றும் தளம்.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          {onSwitchToPublishedMode && (
            <button
              onClick={onSwitchToPublishedMode}
              className="bg-[#0A0B0E] hover:bg-white/10 border border-[#FFB800]/50 hover:border-[#FFB800] text-[#FFB800] p-3 text-xs font-mono font-black uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer shadow-lg"
            >
              <Files className="w-4 h-4 text-[#FFB800]" />
              <div className="text-left">
                <div className="text-white text-[11px] font-black">வெளியிடப்பட்ட சோதனைகள்</div>
                <div className="text-[9px] text-[#FFB800]">TEST PDF & DOCX பதிவிறக்கு</div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#FFB800]" />
            </button>
          )}

          {onSwitchToBatchMode && (
            <button
              onClick={onSwitchToBatchMode}
              className="bg-[#0A0B0E] hover:bg-white/10 border border-[#00FF66]/50 hover:border-[#00FF66] text-[#00FF66] p-3 text-xs font-mono font-black uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer shadow-lg"
            >
              <FolderArchive className="w-4 h-4 text-[#00FF66]" />
              <div className="text-left">
                <div className="text-white text-[11px] font-black">தொகுதி முறை (BATCH)</div>
                <div className="text-[9px] text-gray-400">பல கோப்புகளை ZIP ஆக மாற்றுக</div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#00FF66]" />
            </button>
          )}
        </div>
      </div>

      {/* Input Mode Switcher */}
      <div className="flex items-center justify-start mb-6 overflow-x-auto pb-2 sm:pb-0">
        <div className="bg-[#0A0B0E] p-1 border border-white/10 flex gap-1">
          <button
            id="tab-select-samples"
            onClick={() => setActiveInputType('samples')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeInputType === 'samples'
                ? 'bg-white/10 text-white border border-[#FFB800]/60'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#FFB800]" />
            <span>மாதிரி ஆவணங்கள் (Samples)</span>
          </button>

          <button
            id="tab-select-upload"
            onClick={() => setActiveInputType('upload')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeInputType === 'upload'
                ? 'bg-white/10 text-white border border-[#FFB800]/60'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#FFB800]" />
            <span>கோப்பு பதிவேற்றம் (PDF / Image)</span>
          </button>

          <button
            id="tab-select-paste"
            onClick={() => setActiveInputType('paste')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeInputType === 'paste'
                ? 'bg-white/10 text-white border border-[#FFB800]/60'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-[#FFB800]" />
            <span>எழுத்துரு உரை (Paste Text)</span>
          </button>
        </div>
      </div>

      {/* Samples Selector View */}
      {activeInputType === 'samples' && (
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-300 uppercase tracking-widest">
              வரலாற்றுத் தமிழ் மாதிரி ஆவணங்கள் (SELECT AUTHENTIC SAMPLE):
            </span>
            <span className="text-[11px] text-[#00FF66] font-mono font-bold">5 SAMPLES LOADED</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SAMPLE_DOCUMENTS.map((sample) => {
              const Icon = getCategoryIcon(sample.category);
              const isSelected = selectedSample.id === sample.id;
              return (
                <button
                  key={sample.id}
                  id={`sample-item-${sample.id}`}
                  onClick={() => handleSelectSample(sample)}
                  className={`text-left p-3.5 border transition-all relative ${
                    isSelected
                      ? 'bg-[#0A0B0E] border-[#FFB800] ring-1 ring-[#FFB800] shadow-lg'
                      : 'bg-[#0A0B0E]/60 border-white/10 hover:border-white/20 hover:bg-[#0A0B0E]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`w-7 h-7 flex items-center justify-center font-bold ${
                        isSelected ? 'bg-[#FFB800] text-black' : 'bg-white/10 text-gray-400'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-black border border-white/10 text-gray-300">
                      {sample.year}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-white uppercase tracking-tight mt-2.5 line-clamp-1">{sample.title}</h3>
                  <h4 className="text-[11px] font-medium text-[#FFB800] line-clamp-1 mt-0.5">
                    {sample.tamilTitle}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                    {sample.description}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                    <span className="text-gray-500 uppercase font-mono">ENCODING:</span>
                    <span className="font-mono text-[#00FF66] font-bold">{sample.defaultEncoding}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Sample Preview Text snippet */}
          <div className="bg-[#0A0B0E] p-4 border border-white/10">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <span>ஆவண மூல உரை மாதிரி (SOURCE RAW STREAM):</span>
              <span className="text-[10px] text-[#FFB800] font-mono">
                {selectedSample.sourceType} • {selectedSample.year}
              </span>
            </div>
            <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap max-h-36 overflow-y-auto leading-relaxed bg-black/50 p-3 border border-white/5">
              {pastedText}
            </pre>
          </div>
        </div>
      )}

      {/* File Upload View */}
      {activeInputType === 'upload' && (
        <div className="mb-6 space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf,.txt"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload-input"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/20 hover:border-[#FFB800] bg-[#0A0B0E] p-8 text-center cursor-pointer transition-all group"
          >
            <div className="w-14 h-14 mx-auto bg-white/5 group-hover:bg-[#FFB800]/20 text-gray-400 group-hover:text-[#FFB800] flex items-center justify-center transition-all mb-4 border border-white/10">
              <UploadCloud className="w-7 h-7" />
            </div>

            <h3 className="text-sm font-bold text-white uppercase tracking-wider group-hover:text-[#FFB800]">
              {fileName ? fileName : 'பழைய தமிழ் ஆவணத்தை இங்கே பதிவேற்றவும் (DROP FILE HERE)'}
            </h3>
            <p className="text-xs text-gray-400 mt-1 font-mono">
              Supports Scanned Government PDFs, TIFF, PNG, High-res JPEG, Typewriter documents
            </p>

            <div className="inline-flex items-center gap-2 mt-4 text-[11px] font-bold text-[#FFB800] bg-[#FFB800]/10 px-3 py-1 border border-[#FFB800]/30 uppercase tracking-wider">
              <Camera className="w-3.5 h-3.5" />
              <span>Camera Scan / File Upload</span>
            </div>
          </div>

          {previewImage && (
            <div className="bg-[#0A0B0E] p-4 border border-white/10 flex items-center gap-4">
              <img
                src={previewImage}
                alt="Document preview"
                className="w-20 h-20 object-cover border border-white/20"
              />
              <div>
                <h4 className="text-xs font-bold text-white uppercase">{fileName || 'Uploaded Scanned Document'}</h4>
                <p className="text-[11px] text-[#00FF66] font-mono mt-0.5">Gemini Vision Multi-modal OCR Ready</p>
                <button
                  onClick={() => {
                    setPreviewImage(null);
                    setFileName(null);
                  }}
                  className="text-[10px] font-bold text-rose-400 hover:text-rose-300 uppercase tracking-wider mt-1 cursor-pointer"
                >
                  Remove file
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Paste Raw Text View */}
      {activeInputType === 'paste' && (
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-gray-300 uppercase tracking-wider">
            <span>பாமினி (BAMINI) / TSCII / TAM மூல உரையை ஒட்டுக (PASTE LEGACY TEXT):</span>
            <span className="text-[11px] text-[#FFB800] font-mono">{pastedText.length} CHARACTERS</span>
          </div>

          <textarea
            id="textarea-pasted-text"
            rows={7}
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="e.g. md;ghd jkpœ kf;fs;... (Bamini) or 1980s Typewriter text..."
            className="w-full bg-[#0A0B0E] border border-white/10 focus:border-[#FFB800] p-4 text-xs font-mono text-gray-200 outline-none resize-none leading-relaxed"
          />
        </div>
      )}

      {/* Options Bar: Encoding Selector & Context Hint */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10 mb-6">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">
            02. எழுத்துரு குறியாக்கம் (ENCODING MODE):
          </label>
          <select
            id="select-encoding-mode"
            value={selectedEncoding}
            onChange={(e) => setSelectedEncoding(e.target.value as EncodingType)}
            className="w-full bg-[#0A0B0E] border border-white/10 focus:border-[#FFB800] px-3.5 py-2.5 text-xs text-white font-medium outline-none"
          >
            <option value="AUTO_DETECT">✨ தானியங்கி கண்டறிதல் (Auto-Detect Encoding)</option>
            <option value="BAMINI">⌨️ பாமினி (BAMINI Font Standard)</option>
            <option value="TSCII">📜 TSCII (Tamil Standard Code - 0x80)</option>
            <option value="TAM">📑 TAM (Tamil Monolingual ASCII)</option>
            <option value="TAB">📑 TAB (Tamil Bilingual ASCII)</option>
            <option value="SHREELIPI">🔤 ShreeLipi / Shree-Tam Font</option>
            <option value="SCANNED_IMAGE_OCR">👁️ பார்வை OCR (Scanned Image / Typewriter OCR)</option>
            <option value="UNICODE">🌐 ஒருங்குறி உரை (Direct Unicode Tamil)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">
            03. ஆவணக் குறிப்பு (CONTEXT & DEPARTMENT HINT):
          </label>
          <input
            id="input-user-hint"
            type="text"
            value={userHint}
            onChange={(e) => setUserHint(e.target.value)}
            placeholder="e.g. தமிழ்நாடு அரசு அரசாணை 1986 / நிலப்பதிவு ஆவணம்"
            className="w-full bg-[#0A0B0E] border border-white/10 focus:border-[#FFB800] px-3.5 py-2.5 text-xs text-white outline-none"
          />
        </div>
      </div>

      {/* Start Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0A0B0E] p-4 border border-white/10">
        <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
          <Info className="w-4 h-4 text-[#FFB800] shrink-0" />
          <span>
            Deterministic mapping + Gemini 3.7 Flash + In-Browser Tesseract.js (tam+eng) OCR ensemble + Sandhi fusion.
          </span>
        </div>

        <button
          id="btn-process-document"
          disabled={isProcessing || (!previewImage && !pastedText.trim())}
          onClick={handleStartProcessing}
          className={`w-full sm:w-auto px-6 py-3 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl cursor-pointer ${
            isProcessing
              ? 'bg-white/10 text-gray-500 cursor-not-allowed'
              : 'bg-[#FFB800] hover:bg-[#ffc833] active:scale-95 text-black shadow-[#FFB800]/20'
          }`}
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              <span>செயலாக்கப்படுகிறது (PROCESSING)...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>மாற்றத்தைத் தொடங்கு (EXECUTE PIPELINE)</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
