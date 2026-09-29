import React, { useState } from 'react';
import {
  Globe,
  Languages,
  ArrowRightLeft,
  Copy,
  Check,
  Sparkles,
  FileText,
  Download,
  BookOpen,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  SUPPORTED_INDIC_LANGUAGES,
  IndicScriptCode,
  convertTamilToIndicScript,
  MULTILINGUAL_GOV_TEMPLATES,
  IndicLanguageInfo
} from '../lib/indicLanguageEngine';
import { OCRProcessResult } from '../types';

interface MultilingualIndicStudioProps {
  currentResult: OCRProcessResult | null;
  onApplyTransliteratedText?: (text: string) => void;
}

export const MultilingualIndicStudio: React.FC<MultilingualIndicStudioProps> = ({
  currentResult,
  onApplyTransliteratedText
}) => {
  const [sourceText, setSourceText] = useState<string>(
    currentResult?.fullUnicodeText ||
    'தமிழ்நாடு அரசு தலைமைச் செயலகம், சென்னை.\nஅரசாணை (நிலை) எண்: 142\nபொருள்: அனைத்து மாவட்ட அரசு அலுவலகங்களிலும் தமிழ் ஆட்சிமொழி செயலாக்கம்.'
  );

  const [selectedTargetLang, setSelectedTargetLang] = useState<IndicScriptCode>('iso');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [activeTemplateIdx, setActiveTemplateIdx] = useState<number>(0);

  const convertedOutput = convertTamilToIndicScript(sourceText, selectedTargetLang);

  const handleCopy = () => {
    navigator.clipboard.writeText(convertedOutput);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleLoadCurrentDoc = () => {
    if (currentResult?.fullUnicodeText) {
      setSourceText(currentResult.fullUnicodeText);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-[#12141A] border border-white/10 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#00FF66] text-black flex items-center justify-center font-black text-2xl shadow-lg shadow-[#00FF66]/20">
            <Globe className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black uppercase text-white tracking-tight">
                பாரதிய மொழிகள் & வரிவடிவ மாற்றகம் (Pan-Indian Languages & Transliteration Studio)
              </h2>
              <span className="bg-[#00FF66]/10 text-[#00FF66] text-[10px] font-mono font-bold px-2 py-0.5 border border-[#00FF66]/20">
                MULTI-SCRIPT AKSHARA ENGINE
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Lossless Akshara-level phonetic conversion between Tamil, Hindi (Devanagari), Telugu, Malayalam, Kannada, Bengali, and ISO 15919 Romanized English.
            </p>
          </div>
        </div>

        {currentResult && (
          <button
            onClick={handleLoadCurrentDoc}
            className="bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/20 px-4 py-2 text-xs font-bold uppercase transition-all flex items-center gap-2 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[#00FF66]" />
            <span>LOAD CURRENT ACTIVE DOCUMENT</span>
          </button>
        )}
      </div>

      {/* Target Language Selector Grid */}
      <div className="space-y-3">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
          <Languages className="w-4 h-4 text-[#FFB800]" />
          <span>இலக்கு மொழி / வரிவடிவம் (SELECT TARGET SCRIPT / LANGUAGE):</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {SUPPORTED_INDIC_LANGUAGES.map((lang) => {
            const isSelected = selectedTargetLang === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => setSelectedTargetLang(lang.code)}
                className={`p-3 text-left border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#181B22] border-[#00FF66] shadow-md shadow-[#00FF66]/10 scale-[1.02]'
                    : 'bg-[#12141A] border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-white">{lang.name}</span>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: lang.badgeColor }}
                    />
                  </div>
                  <div className="text-sm font-bold text-[#FFB800] mt-1">{lang.nativeName}</div>
                </div>
                <div className="text-[9px] font-mono text-gray-400 mt-2 truncate">
                  {lang.family}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side Live Transliteration Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Box (Tamil Unicode) */}
        <div className="bg-[#12141A] border border-white/10 p-5 flex flex-col space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-400 uppercase">
            <span className="text-[#FFB800] flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              <span>மூலத் தமிழ் ஆவணம் (Source Tamil Unicode)</span>
            </span>
            <span className="text-[10px] text-gray-400">
              {sourceText.length} Chars
            </span>
          </div>

          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            rows={12}
            className="w-full flex-1 bg-black/60 border border-white/10 p-4 text-white font-sans text-sm leading-relaxed focus:outline-none focus:border-[#FFB800]"
            placeholder="தமிழ் உரையை இங்கே உள்ளிடவும்..."
          />
        </div>

        {/* Target Box (Converted Indian Script) */}
        <div className="bg-[#12141A] border border-white/10 p-5 flex flex-col space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-400 uppercase">
            <span className="text-[#00FF66] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>
                மாற்றப்பட்ட வரிவடிவம் ({SUPPORTED_INDIC_LANGUAGES.find(l => l.code === selectedTargetLang)?.name})
              </span>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 text-[11px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-[#00FF66]" /> : <Copy className="w-3.5 h-3.5 text-[#00FF66]" />}
                <span>{isCopied ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>
          </div>

          <div className="w-full flex-1 bg-black/60 border border-[#00FF66]/20 p-4 text-[#00FF66] font-sans text-base leading-relaxed overflow-y-auto min-h-[250px] whitespace-pre-wrap selection:bg-[#00FF66]/30">
            {convertedOutput || 'Transliterated output will appear here...'}
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono pt-1">
            <span>Encoding standard: Indic Unicode Block</span>
            <span>Target script code: {selectedTargetLang.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Multilingual Official Government & Legal Lexicon Templates */}
      <div className="bg-[#12141A] border border-white/10 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-[#FFB800]" />
            <h3 className="text-base font-black uppercase text-white tracking-tight">
              பல்மொழி அரசு மற்றும் சட்ட விதிமுறைகள் (Pan-Indian Government Lexicon Equivalents)
            </h3>
          </div>
          <span className="text-xs font-mono text-gray-400">OFFICIAL GLOSSARY</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {MULTILINGUAL_GOV_TEMPLATES.map((tmpl, idx) => (
            <div
              key={idx}
              className="bg-black/40 border border-white/10 p-4 space-y-2 hover:border-[#00FF66]/40 transition-all"
            >
              <div className="text-sm font-bold text-[#FFB800]">{tmpl.tamil}</div>
              <div className="text-xs font-semibold text-white">{tmpl.english}</div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-300 pt-2 border-t border-white/10 font-sans">
                <div>
                  <span className="text-[9px] font-mono text-gray-400 block">HINDI</span>
                  {tmpl.hindi}
                </div>
                <div>
                  <span className="text-[9px] font-mono text-gray-400 block">TELUGU</span>
                  {tmpl.telugu}
                </div>
                <div>
                  <span className="text-[9px] font-mono text-gray-400 block">MALAYALAM</span>
                  {tmpl.malayalam}
                </div>
                <div>
                  <span className="text-[9px] font-mono text-gray-400 block">KANNADA</span>
                  {tmpl.kannada}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
