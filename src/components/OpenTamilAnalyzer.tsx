import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileCode2,
  Layers,
  Scale,
  Binary,
  ArrowRight,
  Copy,
  Check,
  Languages,
  Library,
  Cpu,
  History
} from 'lucide-react';
import {
  splitTamilSyllables,
  modernizeArchaicTamilGlyphs,
  validateTamilSandhi,
  fixTamilSoundAlikeConfusions,
  parseTamilNumerals,
  numberToTamilNumerals,
  UYIR_LETTERS,
  MEI_LETTERS,
  VALLINAM,
  MELLINAM,
  IDAIYINAM,
  TAMIL_NUMERALS_MAP,
  TAMIL_SYMBOLS_MAP
} from '../lib/openTamilEngine';
import { OCRProcessResult } from '../types';

interface OpenTamilAnalyzerProps {
  currentResult: OCRProcessResult | null;
  onApplyRefinedText?: (refinedText: string) => void;
}

export const OpenTamilAnalyzer: React.FC<OpenTamilAnalyzerProps> = ({
  currentResult,
  onApplyRefinedText
}) => {
  const [inputText, setInputText] = useState<string>(
    currentResult?.fullUnicodeText ||
    'தமிழ்நாடு அரசு தலைமைச் செயலகம். அரசாணை நிலை எண் 142. அந்த புத்தகம் பாடலை படித்தான். ௨௲௨௪ ஆம் ஆண்டு அறிவிக்கை.'
  );

  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'sandhi' | 'syllables' | 'archaic' | 'numerals' | 'legal_attributions'
  >('overview');

  const [copied, setCopied] = useState<boolean>(false);
  const [testNumber, setTestNumber] = useState<number>(2024);

  // Compute live open-source analytics
  const syllables = splitTamilSyllables(inputText);
  const sandhiIssues = validateTamilSandhi(inputText);
  const archaicResult = modernizeArchaicTamilGlyphs(inputText);
  const soundAlikeResult = fixTamilSoundAlikeConfusions(inputText);
  const parsedNumerals = parseTamilNumerals(inputText);

  const uyirCount = syllables.filter((s) => s.type === 'UYIR').length;
  const meiCount = syllables.filter((s) => s.type === 'MEI').length;
  const uyirmeiCount = syllables.filter((s) => s.type === 'UYIRMEI').length;
  const granthaCount = syllables.filter((s) => s.type === 'GRANTHA').length;
  const ayudhamCount = syllables.filter((s) => s.type === 'AYUDHAM').length;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAutoRepair = () => {
    let repaired = inputText;
    // 1. Archaic fixes
    repaired = modernizeArchaicTamilGlyphs(repaired).text;
    // 2. Sound alike fixes
    repaired = fixTamilSoundAlikeConfusions(repaired).text;
    // 3. Sandhi fixes where explicit
    for (const issue of sandhiIssues) {
      if (issue.hasIssue) {
        repaired = repaired.replace(issue.originalSnippet, issue.suggestion);
      }
    }
    setInputText(repaired);
    if (onApplyRefinedText) {
      onApplyRefinedText(repaired);
    }
  };

  return (
    <div className="bg-[#12141A] border border-[#232733] shadow-2xl overflow-hidden font-sans text-gray-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#171B24] via-[#12141A] to-[#1A1D27] p-6 border-b border-[#232733] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-[#00FF66]/10 border border-[#00FF66]/30 text-[#00FF66] shrink-0">
            <Library className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-mono font-bold text-white tracking-wide">
                திறந்த மூல மொழியியல் கட்டமைப்பு (OPEN-SOURCE LINGUISTIC ENGINE)
              </h2>
              <span className="bg-[#00FF66]/20 text-[#00FF66] text-[10px] px-2 py-0.5 font-mono font-black uppercase border border-[#00FF66]/40">
                MIT & TVA STANDARDS
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1 max-w-3xl">
              Legally incorporates established, permissive open-source algorithms from <strong className="text-white">open-tamil</strong>, <strong className="text-white">Tamil Virtual Academy (TVA)</strong>, <strong className="text-white">Thamizha</strong>, and classical <strong className="text-[#FFB800]">தொல்காப்பியம் / நன்னூல்</strong> grammatical rule sets to maximize output accuracy.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <button
            onClick={handleAutoRepair}
            className="px-4 py-2.5 bg-[#00FF66] hover:bg-[#00E55C] text-black font-mono font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#00FF66]/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>முழு சீரமைப்பு (Auto-Refine)</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation */}
      <div className="flex items-center overflow-x-auto bg-[#0A0B0E] border-b border-[#232733] px-6 py-2 gap-2 text-xs font-mono">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-3.5 py-2 uppercase font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'overview'
              ? 'bg-[#00FF66]/10 text-[#00FF66] border-b-2 border-[#00FF66]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>கண்ணோட்டம் (Overview)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sandhi')}
          className={`px-3.5 py-2 uppercase font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'sandhi'
              ? 'bg-[#00FF66]/10 text-[#00FF66] border-b-2 border-[#00FF66]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>புணர்ச்சி விதிகள் (Sandhi Engine)</span>
          {sandhiIssues.length > 0 && (
            <span className="bg-[#FFB800] text-black text-[9px] px-1.5 py-0.2 font-black rounded-full">
              {sandhiIssues.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('syllables')}
          className={`px-3.5 py-2 uppercase font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'syllables'
              ? 'bg-[#00FF66]/10 text-[#00FF66] border-b-2 border-[#00FF66]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>அசை / எழுத்து (Syllables & Phonetics)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('archaic')}
          className={`px-3.5 py-2 uppercase font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'archaic'
              ? 'bg-[#00FF66]/10 text-[#00FF66] border-b-2 border-[#00FF66]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>பழைய எழுத்துக்கள் (Archaic Glyphs)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('numerals')}
          className={`px-3.5 py-2 uppercase font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'numerals'
              ? 'bg-[#00FF66]/10 text-[#00FF66] border-b-2 border-[#00FF66]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Binary className="w-3.5 h-3.5" />
          <span>தமிழ் எண்கள் (Tamil Numerals)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('legal_attributions')}
          className={`px-3.5 py-2 uppercase font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'legal_attributions'
              ? 'bg-[#00FF66]/10 text-[#00FF66] border-b-2 border-[#00FF66]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <FileCode2 className="w-3.5 h-3.5" />
          <span>திறந்த மூல உரிமங்கள் (Legal Notice)</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-6 space-y-6">
        {/* Source Text Scratchpad / Inspector */}
        <div className="bg-[#171B24] border border-[#232733] p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Languages className="w-3.5 h-3.5 text-[#00FF66]" />
              <span>ஆய்வு உரை (Target Unicode Text for Linguistic Analysis)</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(inputText)}
                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-xs font-mono text-gray-300 flex items-center gap-1.5 transition-all cursor-pointer border border-[#232733]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#00FF66]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'நகலெடுக்கப்பட்டது' : 'நகலெடு'}</span>
              </button>
            </div>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={3}
            className="w-full bg-[#0A0B0E] border border-[#232733] focus:border-[#00FF66] p-3 text-sm font-sans text-gray-100 outline-none leading-relaxed"
            placeholder="தமிழ் உரையை உள்ளிடவும்..."
          />
        </div>

        {/* Tab 1: Overview */}
        {activeSubTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* 4 Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[#171B24] border border-[#232733] p-4">
                <div className="text-[10px] font-mono uppercase text-gray-400">மொத்த அசைகள் (Syllables)</div>
                <div className="text-2xl font-mono font-bold text-white mt-1">{syllables.length}</div>
                <div className="text-[11px] text-gray-400 mt-1">
                  உயிர்: {uyirCount} | மெய்: {meiCount} | உயிர்மெய்: {uyirmeiCount}
                </div>
              </div>

              <div className="bg-[#171B24] border border-[#232733] p-4">
                <div className="text-[10px] font-mono uppercase text-gray-400">புணர்ச்சி சோதனைகள் (Sandhi)</div>
                <div className="text-2xl font-mono font-bold text-[#00FF66] mt-1">
                  {sandhiIssues.length === 0 ? 'நன்னூல் சரி' : `${sandhiIssues.length} குறிப்புகள்`}
                </div>
                <div className="text-[11px] text-gray-400 mt-1">தொல்காப்பிய புணர்ச்சி விதிகள்</div>
              </div>

              <div className="bg-[#171B24] border border-[#232733] p-4">
                <div className="text-[10px] font-mono uppercase text-gray-400">பழைய வரிவடிவங்கள் (Archaic)</div>
                <div className="text-2xl font-mono font-bold text-[#FFB800] mt-1">
                  {archaicResult.replacementsCount} சீரமைப்பு
                </div>
                <div className="text-[11px] text-gray-400 mt-1">முந்தைய அச்சு வரிவடிவங்கள்</div>
              </div>

              <div className="bg-[#171B24] border border-[#232733] p-4">
                <div className="text-[10px] font-mono uppercase text-gray-400">கிரந்த எழுத்துக்கள் (Grantha)</div>
                <div className="text-2xl font-mono font-bold text-cyan-400 mt-1">{granthaCount}</div>
                <div className="text-[11px] text-gray-400 mt-1">ஸ்ரீ, க்ஷ, ஜ, ஷ, ஸ, ஹ</div>
              </div>
            </div>

            {/* Architecture Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#171B24] border border-[#232733] p-5 space-y-3">
                <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00FF66]" />
                  <span>திறந்த மூல நுட்பங்களின் நன்மைகள் (Open-Source Advantages)</span>
                </h3>
                <ul className="text-xs text-gray-300 space-y-2 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-[#00FF66] font-mono font-bold">1.</span>
                    <span><strong>வல்லினம் மிகும்/மிகா இடங்கள்:</strong> நன்னூல் சூத்திரங்கள் (சுட்டுப் பெயர், இரண்டாம்/நான்காம் வேற்றுமை) மூலம் தானியங்கி ஆய்வு.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#00FF66] font-mono font-bold">2.</span>
                    <span><strong>150+ BAMINI/TAM/TSCII விதிகளின் தொகுப்பு:</strong> Thamizha மற்றும் TVA தரநிலைகளின் முழுமையான குறியீட்டு அட்டவணை.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#00FF66] font-mono font-bold">3.</span>
                    <span><strong>அசை பிரிப்பு (Syllabification):</strong> ISO 15919 மற்றும் ஒலிபெயர்ப்பு (Phonetics) துல்லிய கணிப்பு.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#00FF66] font-mono font-bold">4.</span>
                    <span><strong>19ஆம் நூற்றாண்டு பழைய வரிவடிவங்கள்:</strong> பழைய சுருள் ணா, றா, னா மற்றும் ணை, லை, ளை, னை சீர்திருத்தம்.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-[#171B24] border border-[#232733] p-5 space-y-3">
                <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#FFB800]" />
                  <span>அங்கீகரிக்கப்பட்ட திறந்த மூலத் திட்டங்கள் (Open Source Stack)</span>
                </h3>
                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2.5 bg-[#0A0B0E] border border-[#232733] flex items-center justify-between">
                    <span className="text-white font-bold">open-tamil</span>
                    <span className="text-[#00FF66] text-[10px]">MIT License (Muthu Annamalai et al.)</span>
                  </div>
                  <div className="p-2.5 bg-[#0A0B0E] border border-[#232733] flex items-center justify-between">
                    <span className="text-white font-bold">TVA TSCII 1.7 / TAM / TAB</span>
                    <span className="text-cyan-400 text-[10px]">Tamil Virtual Academy Standards</span>
                  </div>
                  <div className="p-2.5 bg-[#0A0B0E] border border-[#232733] flex items-center justify-between">
                    <span className="text-white font-bold">Thamizha / e-Kalappai</span>
                    <span className="text-[#FFB800] text-[10px]">GPL / Public Domain Key Mappings</span>
                  </div>
                  <div className="p-2.5 bg-[#0A0B0E] border border-[#232733] flex items-center justify-between">
                    <span className="text-white font-bold">தொல்காப்பியம் & நன்னூல் விதிகள்</span>
                    <span className="text-purple-400 text-[10px]">Classical Grammar Corpus</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Sandhi Rule Engine */}
        {activeSubTab === 'sandhi' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-[#171B24] border border-[#232733] p-5">
              <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2 mb-2">
                <Scale className="w-4 h-4 text-[#00FF66]" />
                <span>நன்னூல் புணர்ச்சி விதி ஆய்வாளர் (Classical Sandhi Validator)</span>
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                தானாகவே சொல்லெல்லைகளை (word boundaries) ஆய்வு செய்து, வல்லினம் மிகும் இடங்கள் (க், ச், த், ப்) மற்றும் மிகா இடங்களை கண்டறிந்து பரிந்துரைக்கிறது.
              </p>

              {sandhiIssues.length === 0 ? (
                <div className="p-4 bg-[#00FF66]/10 border border-[#00FF66]/30 text-[#00FF66] text-xs font-mono flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>உள்ளிட்ட உரையில் புணர்ச்சிப் பிழைகள் எதுவும் கண்டறியப்படவில்லை (No Sandhi violations detected).</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {sandhiIssues.map((issue, idx) => (
                    <div key={idx} className="p-3 bg-[#0A0B0E] border border-[#FFB800]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                      <div>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-[#FFB800]" />
                          <span className="text-white font-bold">{issue.ruleName}</span>
                          <span className="bg-[#FFB800]/20 text-[#FFB800] text-[9px] px-1.5 py-0.2">
                            {issue.type}
                          </span>
                        </div>
                        <div className="mt-1.5 flex items-center gap-2 text-gray-300">
                          <span className="line-through text-red-400">{issue.originalSnippet}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
                          <span className="text-[#00FF66] font-bold">{issue.suggestion}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const updated = inputText.replace(issue.originalSnippet, issue.suggestion);
                          setInputText(updated);
                          if (onApplyRefinedText) onApplyRefinedText(updated);
                        }}
                        className="px-3 py-1.5 bg-[#00FF66] text-black font-black text-[11px] uppercase tracking-wider hover:bg-[#00E55C] transition-all cursor-pointer shrink-0"
                      >
                        திருத்து (Apply)
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sandhi Grammar Reference Cheat Sheet */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-[#171B24] border border-[#232733] p-4 space-y-2">
                <div className="text-[#00FF66] font-mono font-bold">1. வல்லினம் மிகும் இடங்கள்</div>
                <p className="text-gray-400 leading-relaxed">
                  அ, இ, எ (சுட்டெழுத்துக்கள்), அந்த, இந்த, எந்த பின் வல்லினம் (க், ச், த், ப்) மிகும்.
                  <br />
                  <span className="text-gray-300 italic">எ.கா: அந்த + புத்தகம் = அந்தப் புத்தகம்</span>
                </p>
              </div>

              <div className="bg-[#171B24] border border-[#232733] p-4 space-y-2">
                <div className="text-[#00FF66] font-mono font-bold">2. இரண்டாம் வேற்றுமை உருபு</div>
                <p className="text-gray-400 leading-relaxed">
                  'ஐ' கார ஈற்றுப் பெயர் பின்வரும் சொல்லுடன் சேரும்போது வல்லினம் மிகும்.
                  <br />
                  <span className="text-gray-300 italic">எ.கா: பாடலை + படித்தான் = பாடலைப் படித்தான்</span>
                </p>
              </div>

              <div className="bg-[#171B24] border border-[#232733] p-4 space-y-2">
                <div className="text-[#FFB800] font-mono font-bold">3. வல்லினம் மிகா இடங்கள்</div>
                <p className="text-gray-400 leading-relaxed">
                  அது, இது, எது மற்றும் உம்மைத்தொகை (இரவு பகல்), எழுவாய் தொடர் (தம்பி படித்தான்) பின் மிகாது.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Syllable & Phonetics Explorer */}
        {activeSubTab === 'syllables' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-[#171B24] border border-[#232733] p-5">
              <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-[#00FF66]" />
                <span>அசை மற்றும் ஒலிபெயர்ப்பு பகுப்பான் (open-tamil Syllabification Engine)</span>
              </h3>

              <div className="flex flex-wrap gap-2 max-h-72 overflow-y-auto p-2 bg-[#0A0B0E] border border-[#232733]">
                {syllables.map((s, idx) => (
                  <div
                    key={idx}
                    className={`px-2.5 py-1.5 border text-center font-mono transition-all ${
                      s.type === 'UYIR'
                        ? 'bg-blue-900/30 border-blue-500/50 text-blue-300'
                        : s.type === 'MEI'
                        ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-300'
                        : s.type === 'UYIRMEI'
                        ? 'bg-purple-900/30 border-purple-500/50 text-purple-300'
                        : s.type === 'GRANTHA'
                        ? 'bg-amber-900/30 border-amber-500/50 text-amber-300'
                        : 'bg-white/5 border-white/10 text-gray-400'
                    }`}
                  >
                    <div className="text-sm font-sans font-bold text-white">{s.raw}</div>
                    <div className="text-[10px] text-gray-400">{s.iso}</div>
                    <div className="text-[8px] uppercase tracking-wider opacity-70 mt-0.5">{s.type}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Letter Classification Legend */}
            <div className="grid grid-cols-3 gap-3 text-xs font-mono">
              <div className="bg-[#171B24] border border-[#232733] p-3">
                <div className="text-[#00FF66] font-bold mb-1">வல்லினம் (Hard):</div>
                <div className="text-gray-300">{VALLINAM.join(' ')}</div>
              </div>
              <div className="bg-[#171B24] border border-[#232733] p-3">
                <div className="text-cyan-400 font-bold mb-1">மெல்லினம் (Nasal):</div>
                <div className="text-gray-300">{MELLINAM.join(' ')}</div>
              </div>
              <div className="bg-[#171B24] border border-[#232733] p-3">
                <div className="text-[#FFB800] font-bold mb-1">இடையினம் (Medial):</div>
                <div className="text-gray-300">{IDAIYINAM.join(' ')}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Archaic Glyphs */}
        {activeSubTab === 'archaic' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-[#171B24] border border-[#232733] p-5">
              <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2 mb-2">
                <History className="w-4 h-4 text-[#FFB800]" />
                <span>பழைய வரிவடிவச் சீர்திருத்தங்கள் (Pre-1978 Archaic Glyph Modernizer)</span>
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                1978-க்கு முந்தைய அச்சு ஆவணங்கள், கல்வெட்டுகள் மற்றும் தட்டச்சு ஆவணங்களில் இடம்பெற்ற சுருள் வரிவடிவங்களை நவீன யூனிகோடாக மாற்றுகிறது.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 bg-[#0A0B0E] border border-[#232733] text-center">
                  <div className="text-gray-400">பழைய ண-சுருள்</div>
                  <div className="text-base text-[#00FF66] font-bold my-1">ணா</div>
                  <div className="text-[10px] text-gray-500">U+0BBE Modernizer</div>
                </div>
                <div className="p-3 bg-[#0A0B0E] border border-[#232733] text-center">
                  <div className="text-gray-400">பழைய ற-சுருள்</div>
                  <div className="text-base text-[#00FF66] font-bold my-1">றா</div>
                  <div className="text-[10px] text-gray-500">U+0BBE Modernizer</div>
                </div>
                <div className="p-3 bg-[#0A0B0E] border border-[#232733] text-center">
                  <div className="text-gray-400">பழைய ன-சுருள்</div>
                  <div className="text-base text-[#00FF66] font-bold my-1">னா</div>
                  <div className="text-[10px] text-gray-500">U+0BBE Modernizer</div>
                </div>
                <div className="p-3 bg-[#0A0B0E] border border-[#232733] text-center">
                  <div className="text-gray-400">பழைய ணை, லை, ளை, னை</div>
                  <div className="text-base text-[#00FF66] font-bold my-1">ணை லை ளை னை</div>
                  <div className="text-[10px] text-gray-500">U+0BC8 AI-Modifier</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Tamil Numerals & Fractions */}
        {activeSubTab === 'numerals' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-[#171B24] border border-[#232733] p-5 space-y-4">
              <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                <Binary className="w-4 h-4 text-[#00FF66]" />
                <span>தமிழ் எண்கள் மற்றும் குறியீடுகள் மாற்றி (Tamil Numerals Calculator)</span>
              </h3>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs font-mono text-gray-400 block mb-1">அரபு எண் (Arabic Number):</label>
                  <input
                    type="number"
                    value={testNumber}
                    onChange={(e) => setTestNumber(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-[#0A0B0E] border border-[#232733] focus:border-[#00FF66] p-2.5 text-sm font-mono text-white outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-mono text-gray-400 block mb-1">தமிழ் எண் வடிவம் (Tamil Numeral):</label>
                  <div className="bg-[#0A0B0E] border border-[#00FF66]/50 p-2.5 text-base font-sans font-bold text-[#00FF66]">
                    {numberToTamilNumerals(testNumber)}
                  </div>
                </div>
              </div>

              {/* Table of Ancient Numerals */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono pt-2">
                {Object.entries(TAMIL_NUMERALS_MAP).map(([sym, val]) => (
                  <div key={sym} className="p-2 bg-[#0A0B0E] border border-[#232733] flex justify-between items-center">
                    <span className="text-lg text-white font-bold">{sym}</span>
                    <span className="text-[#00FF66] font-black">{val}</span>
                  </div>
                ))}
              </div>

              {/* Table of Traditional Symbols */}
              <div className="pt-2">
                <div className="text-xs font-mono text-gray-400 mb-2">பாரம்பரியக் கணக்கீட்டுக் குறியீடுகள் (Ancient Symbols):</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  {Object.entries(TAMIL_SYMBOLS_MAP).map(([sym, desc]) => (
                    <div key={sym} className="p-2 bg-[#0A0B0E] border border-[#232733] flex items-center gap-2">
                      <span className="text-lg text-[#FFB800] font-bold">{sym}</span>
                      <span className="text-gray-300 text-[10px]">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Legal Attributions & Licenses */}
        {activeSubTab === 'legal_attributions' && (
          <div className="space-y-4 animate-fade-in text-xs font-mono">
            <div className="bg-[#171B24] border border-[#232733] p-5 space-y-3">
              <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-[#00FF66]" />
                <span>சட்டப்பூர்வ திறந்த மூல உரிம அறிவிப்புகள் (Legal & Open Source Notices)</span>
              </h3>
              <p className="text-gray-400 leading-relaxed">
                This project respectfully adopts open-source algorithms, Unicode encoding mapping specifications, and grammatical rules from permissive, community-curated Tamil computing projects:
              </p>

              <div className="p-4 bg-[#0A0B0E] border border-[#232733] space-y-2 text-gray-300">
                <div className="text-white font-bold">1. open-tamil (MIT License)</div>
                <div className="text-[11px] text-gray-400">
                  Copyright (c) 2013-2024 Muthu Annamalai and Open-Tamil Authors.
                  <br />
                  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files to deal in the Software without restriction.
                </div>
              </div>

              <div className="p-4 bg-[#0A0B0E] border border-[#232733] space-y-2 text-gray-300">
                <div className="text-white font-bold">2. Tamil Virtual Academy (TVA Standards)</div>
                <div className="text-[11px] text-gray-400">
                  TSCII 1.7, TAM (Tamil Monolingual), and TAB (Tamil Bilingual) font encoding standards released for public computing and Tamil software interoperability by TVA & Tamil Nadu Govt.
                </div>
              </div>

              <div className="p-4 bg-[#0A0B0E] border border-[#232733] space-y-2 text-gray-300">
                <div className="text-white font-bold">3. Thamizha / e-Kalappai / NHM Writer (GPL/MIT Permissive Mappings)</div>
                <div className="text-[11px] text-gray-400">
                  Keyboard driver mapping definitions and legacy 8-bit glyph tables for BAMINI, Vaanavil Avvaiyar, Shreelipi, and Typewriter layouts.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
