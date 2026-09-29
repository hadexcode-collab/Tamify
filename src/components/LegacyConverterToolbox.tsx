import React, { useState, useEffect } from 'react';
import {
  ArrowRightLeft,
  Copy,
  Check,
  Sparkles,
  Languages,
  FileCode,
  FileText,
  BookmarkCheck,
  RotateCw
} from 'lucide-react';
import {
  convertBaminiToUnicode,
  convertTsciiToUnicode,
  convertTamToUnicode,
  convertShreelipiToUnicode,
  detectEncoding
} from '../lib/legacyConverters';
import { normalizeTamilScript } from '../lib/tamilMorphology';
import {
  convertTamilToIndicScript,
  IndicScriptCode,
  MULTILINGUAL_GOV_TEMPLATES
} from '../lib/indicLanguageEngine';
import {
  EncodingType,
  OfficialIndianLanguageCode,
  OFFICIAL_INDIAN_LANGUAGES
} from '../types';

interface LegacyConverterToolboxProps {
  selectedLanguage?: OfficialIndianLanguageCode;
  onSelectLanguage?: (lang: OfficialIndianLanguageCode) => void;
}

export const LegacyConverterToolbox: React.FC<LegacyConverterToolboxProps> = ({
  selectedLanguage = 'hin',
  onSelectLanguage
}) => {
  const [toolMode, setToolMode] = useState<'indic-language' | 'legacy-font'>('indic-language');

  // Indian Languages State
  const [targetIndicLang, setTargetIndicLang] = useState<OfficialIndianLanguageCode>(
    selectedLanguage === 'auto' ? 'hin' : selectedLanguage
  );
  const [indicInputText, setIndicInputText] = useState<string>(
    'தமிழ்நாடு அரசு அரசாணை (நிலை) எண் 142 - அனைத்து மாவட்ட ஆட்சியர்களுக்கும் சுற்றறிக்கை'
  );
  const [indicOutputText, setIndicOutputText] = useState<string>('');

  // Legacy Font Converter State
  const [sourceEncoding, setSourceEncoding] = useState<EncodingType>('BAMINI');
  const [legacyInputText, setLegacyInputText] = useState<string>(
    'jkpo;ehL murpd; jiyikr; nrayfj;jpy; midj;J fzpdpfspYk; jkpœ; xUq;Fwp (Unicode) gad;ghl;bid cldbahf eilKiwg;gLj;j Mizaplg;gLfpwJ.'
  );
  const [legacyOutputText, setLegacyOutputText] = useState<string>('');

  const [copied, setCopied] = useState<boolean>(false);
  const [autoDetectMsg, setAutoDetectMsg] = useState<string>('');

  // Sync if selectedLanguage changes from outside
  useEffect(() => {
    if (selectedLanguage && selectedLanguage !== 'auto') {
      setTargetIndicLang(selectedLanguage);
    }
  }, [selectedLanguage]);

  // Convert Indian Script
  const handleConvertIndic = (text = indicInputText, langCode = targetIndicLang) => {
    let scriptCode: IndicScriptCode = 'dev';
    if (langCode === 'eng') scriptCode = 'iso';
    else if (langCode === 'hin' || langCode === 'mar' || langCode === 'san') scriptCode = 'dev';
    else if (langCode === 'mal') scriptCode = 'mal';
    else if (langCode === 'kan') scriptCode = 'kan';
    else if (langCode === 'tel') scriptCode = 'tel';
    else if (langCode === 'ben' || langCode === 'asm') scriptCode = 'ben';
    else if (langCode === 'ori') scriptCode = 'ori';
    else if (langCode === 'guj') scriptCode = 'guj';
    else if (langCode === 'pan') scriptCode = 'pan';
    else if (langCode === 'tam') scriptCode = 'tam';

    const converted = convertTamilToIndicScript(text, scriptCode);
    setIndicOutputText(converted);
  };

  // Convert Legacy Font
  const handleConvertLegacy = (textToConvert = legacyInputText, enc = sourceEncoding) => {
    let rawResult = '';
    if (enc === 'BAMINI') {
      rawResult = convertBaminiToUnicode(textToConvert);
    } else if (enc === 'TSCII') {
      rawResult = convertTsciiToUnicode(textToConvert);
    } else if (enc === 'TAM' || enc === 'TAB') {
      rawResult = convertTamToUnicode(textToConvert);
    } else if (enc === 'SHREELIPI') {
      rawResult = convertShreelipiToUnicode(textToConvert);
    } else {
      rawResult = textToConvert;
    }

    const { normalized } = normalizeTamilScript(rawResult);
    setLegacyOutputText(normalized);
  };

  // Run on change
  useEffect(() => {
    handleConvertIndic();
  }, [indicInputText, targetIndicLang]);

  useEffect(() => {
    handleConvertLegacy();
  }, [legacyInputText, sourceEncoding]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAutoDetectLegacy = () => {
    const res = detectEncoding(legacyInputText);
    setSourceEncoding(res.detectedEncoding);
    setAutoDetectMsg(`கண்டறியப்பட்டது: ${res.detectedEncoding} (துல்லியம்: ${(res.confidence * 100).toFixed(0)}%)`);
    setTimeout(() => setAutoDetectMsg(''), 4000);
  };

  // Legacy Samples
  const legacySamples = [
    {
      name: 'கடலூர் மாவட்ட கடிதம் (Quiz G.O.)',
      encoding: 'TAM' as EncodingType,
      text: `கடÆß  மாவØட ¯தåைமÔ கà அ³வல…å ெசயà¯ைறகã \nந.க.எÙ.7429/அ6/2026                 நாã. 28 .08.2026 \n \nெபா±ã  \nபãÔகà -  தâநா© அயà இயÔகÝ – கடÆß \nமாவØடÝ – பã மாணவßக´Ôகான னா} னா ேபாØ} -  \n- «ß(தâ வ) / ஜÛதß மÛதß(ஆÕxல வ) னா} னா \nேபாØ} நைடெப²தà – மாணவ/மாணயßகைள பÕேகäகí \nெசÞதà - ெதாடßபாக.`
    },
    {
      name: 'Bamini G.O. Excerpt',
      encoding: 'BAMINI' as EncodingType,
      text: 'jkpo;ehL murpd; rpwg;G murhiz epiy vz;: 89 - midj;J JiwfSf;Fk; Rw;wwpf;if'
    },
    {
      name: 'TAM Extended ASCII',
      encoding: 'TAM' as EncodingType,
      text: '«Ã² º»¼½ ¾¿'
    }
  ];

  return (
    <div className="bg-[#12141A] border border-white/10 p-6 sm:p-8 text-[#D1D5DB] space-y-6 max-w-6xl mx-auto shadow-2xl">
      {/* Header with Mode Switching */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold text-[#FFB800] uppercase tracking-[0.2em]">
              UNIVERSAL INDIC & FONT CONVERSION ENGINE
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <span>மொழி & எழுத்துரு மாற்றி</span>
            <span className="text-sm font-normal text-gray-400 font-mono">(LANGUAGE CONVERTER)</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1 font-mono">
            OFFICIAL INDIAN LANGUAGES (HINDI, ENGLISH, MALAYALAM, KANNADA, TELUGU, BENGALI, ODIA) & LEGACY FONTS
          </p>
        </div>

        {/* Dual Mode Buttons */}
        <div className="flex items-center bg-[#0A0B0E] p-1 border border-white/10 rounded">
          <button
            id="btn-mode-indic"
            onClick={() => setToolMode('indic-language')}
            className={`px-3 sm:px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              toolMode === 'indic-language'
                ? 'bg-[#FFB800] text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>இந்திய மொழிகள் (Indian Languages)</span>
          </button>
          <button
            id="btn-mode-legacy"
            onClick={() => setToolMode('legacy-font')}
            className={`px-3 sm:px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              toolMode === 'legacy-font'
                ? 'bg-[#38BDF8] text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>பழைய எழுத்துரு (Legacy Fonts)</span>
          </button>
        </div>
      </div>

      {/* MODE 1: OFFICIAL INDIAN LANGUAGES CONVERTER */}
      {toolMode === 'indic-language' && (
        <div className="space-y-6">
          {/* Target Language Chips */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <BookmarkCheck className="w-4 h-4 text-[#FFB800]" />
                இலக்கு மொழி தேர்வு (Select Target Indian Language):
              </span>
              <span className="text-[11px] font-mono text-[#00FF66] font-bold">
                CURRENT: {OFFICIAL_INDIAN_LANGUAGES.find((l) => l.code === targetIndicLang)?.name} ({OFFICIAL_INDIAN_LANGUAGES.find((l) => l.code === targetIndicLang)?.nativeName})
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {OFFICIAL_INDIAN_LANGUAGES.filter((l) => l.code !== 'auto').map((lang) => {
                const isSelected = targetIndicLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    id={`btn-lang-chip-${lang.code}`}
                    onClick={() => {
                      setTargetIndicLang(lang.code);
                      if (onSelectLanguage) onSelectLanguage(lang.code);
                    }}
                    className={`px-3 py-1.5 text-xs font-bold rounded border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-white text-black border-white shadow-md scale-105'
                        : 'bg-[#0A0B0E] text-gray-300 border-white/10 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lang.badgeColor }} />
                    <span>{lang.name}</span>
                    <span className="text-[11px] opacity-75 font-normal">({lang.nativeName})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Official Gov Document Templates */}
          <div className="p-3 bg-[#0A0B0E] border border-white/10 rounded space-y-2">
            <div className="text-[11px] font-mono text-gray-400 font-bold uppercase flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#FFB800]" />
              அரசு ஆவண மாதிரிகள் (Government Document Official Phrases):
            </div>
            <div className="flex flex-wrap gap-2">
              {MULTILINGUAL_GOV_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  onClick={() => setIndicInputText(tmpl.tamil)}
                  className="bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 px-2.5 py-1 text-xs font-mono rounded cursor-pointer transition-colors"
                >
                  {tmpl.tamil}
                </button>
              ))}
            </div>
          </div>

          {/* Dual Pane: Input Source & Output Converted */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input (Tamil / Source Text) */}
            <div className="bg-[#0A0B0E] p-5 border border-white/10 flex flex-col h-80 rounded">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  மூல உரை (SOURCE / தமிழ் உரை):
                </span>
                <span className="text-[11px] font-mono text-gray-500 font-bold">
                  {indicInputText.length} CHARS
                </span>
              </div>
              <textarea
                rows={8}
                value={indicInputText}
                onChange={(e) => setIndicInputText(e.target.value)}
                placeholder="Type or paste Tamil / document text here..."
                className="flex-1 w-full bg-transparent text-sm font-medium text-[#FFB800] outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Output (Target Official Indian Language Script) */}
            <div className="bg-[#0A0B0E] p-5 border border-white/10 flex flex-col h-80 rounded">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10">
                <span className="text-xs font-bold text-[#00FF66] uppercase tracking-wider flex items-center gap-1.5">
                  <span>இலக்கு மொழி உரை:</span>
                  <span className="text-white">
                    {OFFICIAL_INDIAN_LANGUAGES.find((l) => l.code === targetIndicLang)?.name}
                  </span>
                </span>

                <button
                  onClick={() => handleCopy(indicOutputText)}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer rounded"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#00FF66]" />
                      <span className="text-[#00FF66]">COPIED!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#FFB800]" />
                      <span>நகல் (COPY)</span>
                    </>
                  )}
                </button>
              </div>
              <textarea
                readOnly
                rows={8}
                value={indicOutputText}
                className="flex-1 w-full bg-transparent text-base font-medium text-white outline-none resize-none leading-relaxed select-text"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: LEGACY FONT CONVERTER (BAMINI, TSCII, TAM, TAB, SHREELIPI) */}
      {toolMode === 'legacy-font' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-gray-400 font-bold uppercase text-[11px] font-mono">
                சோதனை மாதிரிகள் (SAMPLES):
              </span>
              {legacySamples.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSourceEncoding(s.encoding);
                    setLegacyInputText(s.text);
                  }}
                  className="bg-[#0A0B0E] hover:bg-white/10 text-gray-300 border border-white/10 px-3 py-1 text-xs font-mono font-bold uppercase transition-all cursor-pointer rounded"
                >
                  {s.name}
                </button>
              ))}
            </div>

            <button
              onClick={handleAutoDetectLegacy}
              className="bg-[#FFB800] hover:bg-[#ffc933] text-black font-black px-3.5 py-1.5 text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md rounded"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>எழுத்துரு கண்டறி (AUTO-DETECT)</span>
            </button>
          </div>

          {autoDetectMsg && (
            <div className="p-3 bg-[#0A0B0E] border border-[#00FF66] text-xs text-[#00FF66] font-mono font-bold uppercase rounded">
              {autoDetectMsg}
            </div>
          )}

          {/* Converter Dual Pane */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Source */}
            <div className="bg-[#0A0B0E] p-5 border border-white/10 flex flex-col h-80 rounded">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                    மூல எழுத்துரு:
                  </span>
                  <select
                    value={sourceEncoding}
                    onChange={(e) => setSourceEncoding(e.target.value as EncodingType)}
                    className="bg-black border border-white/20 text-xs text-[#FFB800] font-black uppercase px-2 py-1 outline-none rounded"
                  >
                    <option value="BAMINI">BAMINI (பாமினி)</option>
                    <option value="TSCII">TSCII (0x80 BYTE CODE)</option>
                    <option value="TAM">TAM (TAMIL ASCII)</option>
                    <option value="TAB">TAB (TAMIL BILINGUAL)</option>
                    <option value="SHREELIPI">SHREELIPI / SHREE-TAM</option>
                  </select>
                </div>
                <span className="text-[11px] font-mono text-gray-500 font-bold">
                  {legacyInputText.length} CHARS
                </span>
              </div>

              <textarea
                rows={8}
                value={legacyInputText}
                onChange={(e) => setLegacyInputText(e.target.value)}
                placeholder="Type or paste legacy text here..."
                className="flex-1 w-full bg-transparent text-xs font-mono text-[#FFB800] outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Output Unicode */}
            <div className="bg-[#0A0B0E] p-5 border border-white/10 flex flex-col h-80 rounded">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10">
                <span className="text-xs font-bold text-[#00FF66] uppercase tracking-wider">
                  தூய ஒருங்குறி உரை (UNICODE UTF-8):
                </span>

                <button
                  onClick={() => handleCopy(legacyOutputText)}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer rounded"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#00FF66]" />
                      <span className="text-[#00FF66]">COPIED!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#FFB800]" />
                      <span>நகல் (COPY)</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                readOnly
                rows={8}
                value={legacyOutputText}
                className="flex-1 w-full bg-transparent text-sm font-semibold text-white outline-none resize-none leading-relaxed select-text"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
