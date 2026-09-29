import React, { useState, useRef } from 'react';
import {
  Smartphone,
  Camera,
  Upload,
  Copy,
  Check,
  Share2,
  Download,
  Sparkles,
  Zap,
  RotateCcw,
  Keyboard,
  ArrowRight,
  ShieldCheck,
  FileText,
  Languages
} from 'lucide-react';
import { OCRProcessResult, EncodingType } from '../types';
import { convertLegacyToUnicode, detectEncoding } from '../lib/legacyConverters';
import { normalizeTamilScript } from '../lib/tamilMorphology';
import { transliterateAnjalToTamil, convertTamilToKeezhadiBrahmi } from '../lib/keezhadiTypewriter';
import { SAMPLE_DOCUMENTS } from '../lib/sampleDocuments';

interface AndroidLiteViewProps {
  currentResult: OCRProcessResult | null;
  onProcessText: (text: string, encoding: EncodingType, title?: string) => void;
  onProcessImagePayload: (payload: { imageBase64: string; mimeType: string; requestedEncoding: EncodingType }) => void;
  onOpenDocxModal: () => void;
  onSwitchToDesktop: () => void;
}

export const AndroidLiteView: React.FC<AndroidLiteViewProps> = ({
  currentResult,
  onProcessText,
  onProcessImagePayload,
  onOpenDocxModal,
  onSwitchToDesktop
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [outputUnicode, setOutputUnicode] = useState<string>(
    currentResult ? currentResult.fullUnicodeText : ''
  );
  const [detectedFormat, setDetectedFormat] = useState<string>('AUTO');
  const [copied, setCopied] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showKeezhadiMini, setShowKeezhadiMini] = useState<boolean>(false);
  const [anjalInput, setAnjalInput] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'convert' | 'camera' | 'samples'>('convert');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Sync if currentResult changes
  React.useEffect(() => {
    if (currentResult) {
      setOutputUnicode(currentResult.fullUnicodeText);
    }
  }, [currentResult]);

  // Instant light converter
  const handleInstantConvert = (rawText: string) => {
    setInputText(rawText);
    if (!rawText.trim()) {
      setOutputUnicode('');
      return;
    }
    const detection = detectEncoding(rawText);
    setDetectedFormat(detection.detectedEncoding);
    const converted = convertLegacyToUnicode(rawText, detection.detectedEncoding);
    const { normalized } = normalizeTamilScript(converted);
    setOutputUnicode(normalized);
  };

  const handleCopy = () => {
    if (!outputUnicode) return;
    navigator.clipboard.writeText(outputUnicode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    if (!outputUnicode) return;
    const textToShare = encodeURIComponent(outputUnicode);
    window.open(`https://api.whatsapp.com/send?text=${textToShare}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share && outputUnicode) {
      try {
        await navigator.share({
          title: 'Tamify DOCX ஆவணம்',
          text: outputUnicode
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleDownloadText = () => {
    if (!outputUnicode) return;
    const blob = new Blob([outputUnicode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tamil-doc-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        onProcessImagePayload({
          imageBase64: base64,
          mimeType: file.type || 'image/jpeg',
          requestedEncoding: 'AUTO_DETECT'
        });
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div id="android-lite-container" className="max-w-xl mx-auto space-y-4 pb-20 px-2 sm:px-4">
      {/* Lite App Header Banner */}
      <div className="bg-[#12141C] border border-[#FFB800]/40 p-4 rounded-xl shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 px-2 py-0.5 bg-white rounded-lg border border-white/20 flex items-center justify-center shadow-md">
            <img
              src="/tamify-logo.svg"
              alt="Tamify Logo"
              className="h-8 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-wide">Tamify Lite</h1>
              <span className="bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66]/30 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                ANDROlD V2.6
              </span>
            </div>
            <p className="text-xs text-gray-400">குறைந்த நினைவகம் • அதிவேக ஒருங்குறி மாற்றி</p>
          </div>
        </div>

        <button
          id="btn-switch-to-desktop"
          onClick={onSwitchToDesktop}
          className="text-[11px] text-gray-300 hover:text-white bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/10 font-mono flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>PC வடிவம்</span>
          <ArrowRight className="w-3 h-3 text-[#FFB800]" />
        </button>
      </div>

      {/* Mode Selector Tabs (Camera / Convert / Samples) */}
      <div className="grid grid-cols-3 gap-2 bg-[#12141C] p-1 rounded-xl border border-white/10 text-xs font-bold">
        <button
          id="btn-lite-tab-convert"
          onClick={() => setActiveSubTab('convert')}
          className={`py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeSubTab === 'convert'
              ? 'bg-[#FFB800] text-black shadow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>உடனடி மாற்றி</span>
        </button>

        <button
          id="btn-lite-tab-camera"
          onClick={() => {
            setActiveSubTab('camera');
            cameraInputRef.current?.click();
          }}
          className={`py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeSubTab === 'camera'
              ? 'bg-[#00FF66] text-black shadow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>கேமரா OCR</span>
        </button>

        <button
          id="btn-lite-tab-samples"
          onClick={() => setActiveSubTab('samples')}
          className={`py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeSubTab === 'samples'
              ? 'bg-white/20 text-white shadow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>மாதிரிகள்</span>
        </button>
      </div>

      {/* Hidden File Inputs for Mobile */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleCameraCapture}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleCameraCapture}
      />

      {/* CAMERA SCAN QUICK CARD */}
      {activeSubTab === 'camera' && (
        <div className="bg-[#12141C] border border-[#00FF66]/40 p-4 rounded-xl space-y-3 text-center">
          <div className="w-12 h-12 rounded-full bg-[#00FF66]/10 border border-[#00FF66] mx-auto flex items-center justify-center text-[#00FF66]">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">கேமரா மூலம் ஆவணம் ஸ்கேன் செய்க</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              அரசாணை, பத்திரப்பதிவு, பழைய தட்டச்சு பக்கங்களை புகைப்படம் எடுக்கவும்
            </p>
          </div>
          <div className="flex gap-2 justify-center pt-2">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="bg-[#00FF66] text-black font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer shadow"
            >
              <Camera className="w-4 h-4" />
              <span>நேரடி புகைப்படம் (Capture)</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-white/10 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer border border-white/10"
            >
              <Upload className="w-4 h-4" />
              <span>கேலரி / PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* SAMPLES CARD */}
      {activeSubTab === 'samples' && (
        <div className="bg-[#12141C] border border-white/10 p-4 rounded-xl space-y-2.5">
          <div className="text-xs font-bold text-[#FFB800] uppercase tracking-wider">
            சோதனைக்கான அரசு மாதிரி ஆவணங்கள் (Pre-loaded):
          </div>
          <div className="space-y-2">
            {SAMPLE_DOCUMENTS.map((doc) => (
              <button
                key={doc.id}
                onClick={() => {
                  handleInstantConvert(doc.rawText);
                  setActiveSubTab('convert');
                }}
                className="w-full text-left bg-black/40 hover:bg-white/5 border border-white/10 p-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-semibold text-white group-hover:text-[#FFB800]">
                    {doc.title}
                  </div>
                  <div className="text-[10px] font-mono text-gray-400">
                    வகை: {doc.defaultEncoding} • {doc.year}
                  </div>
                </div>
                <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-gray-300 group-hover:bg-[#FFB800] group-hover:text-black font-bold">
                  ஏற்று
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* INPUT PANE (Old Bamini / Typewriter text) */}
      <div className="bg-[#12141C] border border-white/10 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-gray-300 flex items-center gap-1.5">
            <span>பழைய எழுத்துரு / குறியீடு உரை:</span>
            {detectedFormat !== 'AUTO' && (
              <span className="bg-[#FFB800]/20 text-[#FFB800] text-[10px] font-mono font-bold px-1.5 py-0.2 rounded">
                {detectedFormat}
              </span>
            )}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowKeezhadiMini((prev) => !prev)}
              className="text-[#00FF66] text-[11px] font-mono flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>{showKeezhadiMini ? 'தட்டச்சு மூடு' : 'தட்டச்சு பலகை'}</span>
            </button>
            {inputText && (
              <button
                onClick={() => handleInstantConvert('')}
                className="text-gray-500 hover:text-white text-xs cursor-pointer"
              >
                அழி
              </button>
            )}
          </div>
        </div>

        {/* Mini Anjal / Keezhadi Input on Mobile */}
        {showKeezhadiMini && (
          <div className="bg-black/60 border border-[#00FF66]/30 p-2 rounded-lg space-y-2">
            <div className="text-[10px] text-[#00FF66] font-mono">
              ஆங்கிலத்தில் தட்டச்சு செய்யவும் (Anjal Phonetic - எ.கா: "thamizh" → "தமிழ்"):
            </div>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={anjalInput}
                onChange={(e) => setAnjalInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && anjalInput) {
                    e.preventDefault();
                    const converted = transliterateAnjalToTamil(anjalInput);
                    handleInstantConvert(inputText ? `${inputText} ${converted}` : converted);
                    setAnjalInput('');
                  }
                }}
                placeholder="எ.கா: thamizhnadu vanakkam"
                className="flex-1 bg-black border border-white/20 px-2.5 py-1.5 text-xs text-white rounded outline-none focus:border-[#00FF66]"
              />
              <button
                onClick={() => {
                  if (anjalInput) {
                    const converted = transliterateAnjalToTamil(anjalInput);
                    handleInstantConvert(inputText ? `${inputText} ${converted}` : converted);
                    setAnjalInput('');
                  }
                }}
                className="bg-[#00FF66] text-black font-bold text-xs px-3 py-1.5 rounded cursor-pointer uppercase"
              >
                சேர்
              </button>
            </div>
          </div>
        )}

        <textarea
          rows={4}
          value={inputText}
          onChange={(e) => handleInstantConvert(e.target.value)}
          placeholder="இங்கே BAMINI, TSCII, TAB அல்லது பழைய தட்டச்சு உரையை ஒட்டவும் (Paste here)..."
          className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-xs font-mono text-white outline-none focus:border-[#FFB800] resize-y"
        />
      </div>

      {/* OUTPUT PANE (Clean Unicode) */}
      <div className="bg-[#12141C] border border-[#00FF66]/40 rounded-xl p-3.5 space-y-2.5 shadow-md">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#00FF66] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>தூய தமிழ் ஒருங்குறி (Unicode Output):</span>
          </span>
          <span className="text-[10px] font-mono text-gray-400">
            {outputUnicode ? `${outputUnicode.length} எழுத்துக்கள்` : 'தயார்'}
          </span>
        </div>

        <div className="relative">
          <textarea
            rows={7}
            value={outputUnicode}
            onChange={(e) => setOutputUnicode(e.target.value)}
            placeholder="மாற்றப்பட்ட தமிழ் உரை இங்கே தோன்றும்..."
            className="w-full bg-black/80 border border-white/10 rounded-lg p-3 text-sm leading-relaxed text-white outline-none focus:border-[#00FF66] resize-y"
          />
        </div>

        {/* Quick Action Buttons for Mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <button
            id="btn-lite-copy"
            onClick={handleCopy}
            disabled={!outputUnicode}
            className="bg-[#00FF66] disabled:opacity-40 text-black font-bold text-xs py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow active:scale-95 transition-transform"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'நகலெடுக்கப்பட்டது' : 'நகலெடு (Copy)'}</span>
          </button>

          <button
            id="btn-lite-whatsapp"
            onClick={handleShareWhatsApp}
            disabled={!outputUnicode}
            className="bg-[#25D366] disabled:opacity-40 text-white font-bold text-xs py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow active:scale-95 transition-transform"
          >
            <Share2 className="w-4 h-4" />
            <span>வாட்ஸ்அப் பகிர்</span>
          </button>

          <button
            id="btn-lite-download"
            onClick={handleDownloadText}
            disabled={!outputUnicode}
            className="bg-white/10 disabled:opacity-40 text-white border border-white/10 font-bold text-xs py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
          >
            <Download className="w-4 h-4 text-[#FFB800]" />
            <span>.TXT சேமி</span>
          </button>

          <button
            id="btn-lite-docx"
            onClick={onOpenDocxModal}
            disabled={!outputUnicode}
            className="bg-[#0078D4] disabled:opacity-40 text-white font-bold text-xs py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow active:scale-95 transition-transform"
          >
            <FileText className="w-4 h-4" />
            <span>DOCX ஏற்றுமதி</span>
          </button>
        </div>
      </div>

      {/* Android Installation & Offline Guide Card */}
      <div className="bg-[#12141C] border border-[#FFB800]/20 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <Smartphone className="w-4 h-4 text-[#FFB800]" />
          <span>ஆண்ட்ராய்டு போனில் செயலியாக நிறுவுதல் (Android App Install):</span>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          1. கூகுள் குரோம் (Chrome) மெனுவை அழுத்தவும் (⋮ மூவடிவக் குறி).<br />
          2. <b className="text-white">"முகப்புத் திரையில் சேர்" (Add to Home screen)</b> அல்லது <b className="text-white">"Install App"</b> என்பதைத் தேர்ந்தெடுக்கவும்.<br />
          3. உங்கள் போனில் தனி செயலியாக (APK மாதிரி) இணையம் இன்றியும் இயங்கும்.
        </p>
      </div>
    </div>
  );
};
