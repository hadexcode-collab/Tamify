import React, { useState } from 'react';
import {
  FileText,
  Eye,
  Check,
  Copy,
  Volume2,
  Sparkles,
  Edit3,
  Plus,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Table as TableIcon,
  HelpCircle,
  BookOpen,
  Keyboard,
  Globe,
  Languages
} from 'lucide-react';
import { OCRProcessResult, LineToken, WordToken } from '../types';
import { transliterateTamilToISO } from '../lib/tamilMorphology';
import { transliterateAnjalToTamil, convertTamilToKeezhadiBrahmi } from '../lib/keezhadiTypewriter';
import { convertTamilToIndicScript } from '../lib/indicLanguageEngine';

interface SideBySideEditorProps {
  result: OCRProcessResult;
  onUpdateResult: (updated: OCRProcessResult) => void;
  originalImageBase64?: string | null;
  originalRawText?: string;
  onOpenKeezhadiTab?: () => void;
}

export const SideBySideEditor: React.FC<SideBySideEditorProps> = ({
  result,
  onUpdateResult,
  originalImageBase64,
  originalRawText,
  onOpenKeezhadiTab
}) => {
  const [selectedWord, setSelectedWord] = useState<WordToken | null>(null);
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [lineEditText, setLineEditText] = useState<string>('');
  const [anjalInput, setAnjalInput] = useState<string>('');
  const [showInlineKeezhadi, setShowInlineKeezhadi] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const [filterConfidence, setFilterConfidence] = useState<'all' | 'needs_review'>('all');

  // Play audio pronunciation of Tamil word/sentence
  const playTamilAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ta-IN'; // Tamil India
      utterance.rate = 0.85; // Slightly slower for clarity
      window.speechSynthesis.speak(utterance);
    }
  };

  // Copy full Unicode text
  const handleCopyText = () => {
    const fullText = result.lines.map((l) => l.tamilText).join('\n');
    navigator.clipboard.writeText(fullText);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  // Start editing a line
  const handleStartEdit = (line: LineToken) => {
    setEditingLineId(line.id);
    setLineEditText(line.tamilText);
  };

  // Save edited line
  const handleSaveEdit = (lineId: string) => {
    const updatedLines = result.lines.map((l) => {
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

        return {
          ...l,
          tamilText: lineEditText,
          confidence: 1.0,
          words: wordTokens
        };
      }
      return l;
    });

    onUpdateResult({
      ...result,
      lines: updatedLines,
      fullUnicodeText: updatedLines.map((l) => l.tamilText).join('\n')
    });

    setEditingLineId(null);
  };

  // Change Line Type (Header, Reference, Subject, Signature, Paragraph)
  const handleChangeLineType = (
    lineId: string,
    newType: 'HEADER' | 'PARAGRAPH' | 'TABLE_ROW' | 'SIGNATURE' | 'REFERENCE' | 'SUBJECT'
  ) => {
    const updatedLines = result.lines.map((l) => {
      if (l.id === lineId) {
        return { ...l, type: newType };
      }
      return l;
    });

    onUpdateResult({
      ...result,
      lines: updatedLines
    });
  };

  // Delete line
  const handleDeleteLine = (lineId: string) => {
    const updatedLines = result.lines.filter((l) => l.id !== lineId);
    onUpdateResult({
      ...result,
      lines: updatedLines,
      fullUnicodeText: updatedLines.map((l) => l.tamilText).join('\n')
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Stats Bar */}
      <div className="bg-[#12141A] border border-white/10 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 text-[#D1D5DB]">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 bg-[#00FF66]"></span>
          <div>
            <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-tight">
              {result.metadata?.documentTitle || 'தமிழ் ஆவணப் பரிசோதகர் (DOCUMENT INSPECTOR)'}
            </h3>
            <div className="flex items-center gap-3 text-xs text-gray-400 mt-1 font-mono">
              <span>{result.lines.length} LINES</span>
              <span>•</span>
              <span className="text-[#00FF66] font-bold">
                {Math.round(result.overallConfidence * 100)}% CONFIDENCE
              </span>
              <span>•</span>
              <span className="bg-white/10 px-2 py-0.5 text-[10px] text-gray-200 font-bold border border-white/10">
                {result.detectedEncoding}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#0A0B0E] p-1 border border-white/10 text-xs">
            <button
              onClick={() => setFilterConfidence('all')}
              className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                filterConfidence === 'all' ? 'bg-white/10 text-[#FFB800] border border-[#FFB800]/60' : 'text-gray-400 hover:text-white'
              }`}
            >
              அனைத்தும் (ALL)
            </button>
            <button
              onClick={() => setFilterConfidence('needs_review')}
              className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                filterConfidence === 'needs_review'
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-500/50'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              கவனிக்க வேண்டியவை (REVIEW)
            </button>
          </div>

          <button
            id="btn-copy-unicode-text"
            onClick={handleCopyText}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
          >
            {copiedNotification ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#00FF66]" />
                <span className="text-[#00FF66]">COPIED!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#FFB800]" />
                <span>உரை நகல் (COPY)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Side-by-Side Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Original Document Source View */}
        <div className="lg:col-span-5 bg-[#12141A] border border-white/10 p-5 flex flex-col h-[700px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-200 uppercase tracking-wider">
              <Eye className="w-4 h-4 text-[#FFB800]" />
              <span>மூல ஆவணம் (SOURCE DOCUMENT)</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
                className="p-1.5 bg-[#0A0B0E] hover:bg-white/10 border border-white/10 text-gray-300 text-xs cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono text-gray-300 px-1 font-bold">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(200, z + 15))}
                className="p-1.5 bg-[#0A0B0E] hover:bg-white/10 border border-white/10 text-gray-300 text-xs cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-[#0A0B0E] p-4 border border-white/10 flex items-center justify-center">
            {originalImageBase64 ? (
              <img
                src={originalImageBase64}
                alt="Source Document Scan"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                className="max-w-full object-contain border border-white/20 transition-transform"
              />
            ) : originalRawText ? (
              <pre
                style={{ fontSize: `${(zoomLevel / 100) * 12}px` }}
                className="font-mono text-[#FFB800] whitespace-pre-wrap leading-relaxed select-text w-full h-full"
              >
                {originalRawText}
              </pre>
            ) : (
              <div className="text-center p-8 text-gray-500 font-mono">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-30 text-[#FFB800]" />
                <p className="text-xs uppercase">Original raster / legacy source stream</p>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-gray-400 uppercase">
            <span>FORMAT: <strong className="text-white">{result.detectedEncoding}</strong></span>
            <span>{result.metadata.dateStr || 'ARCHAIC RECORD'}</span>
          </div>
        </div>

        {/* Right Column: Clean Editable Unicode Tamil Output */}
        <div className="lg:col-span-7 bg-[#12141A] border border-white/10 p-5 flex flex-col h-[700px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-200 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#00FF66]" />
              <span>தூய ஒருங்குறி உரை (UNICODE TAMIL OUTPUT)</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-[#FFB800] bg-black/60 border border-white/10 px-2 py-0.5 uppercase tracking-wider">
                CLICK WORD FOR PHONETICS & GLOSS
              </span>
            </div>
          </div>

          {/* Interactive Lines List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {(result.lines || []).map((line, idx) => {
              const isEditing = editingLineId === line.id;
              const isLowConfidence = line.confidence < 0.85;

              if (filterConfidence === 'needs_review' && !isLowConfidence) {
                return null;
              }

              return (
                <div
                  key={line.id ? `${line.id}-${idx}` : `line-${idx}`}
                  className={`p-3.5 border transition-all ${
                    line.type === 'HEADER'
                      ? 'bg-[#0A0B0E] border-[#FFB800]/50'
                      : line.type === 'SIGNATURE'
                      ? 'bg-[#0A0B0E] border-white/20'
                      : line.type === 'REFERENCE' || line.type === 'SUBJECT'
                      ? 'bg-[#0A0B0E] border-sky-500/30'
                      : 'bg-[#0A0B0E] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-gray-400 font-bold">#{line.lineNumber}</span>
                      <select
                        value={line.type}
                        onChange={(e) => handleChangeLineType(line.id, e.target.value as any)}
                        className="bg-black border border-white/20 text-[10px] text-[#FFB800] px-2 py-0.5 font-bold uppercase tracking-wider outline-none"
                      >
                        <option value="HEADER">தலைப்பு (HEADER)</option>
                        <option value="SUBJECT">பொருள் (SUBJECT)</option>
                        <option value="REFERENCE">பார்வை (REFERENCE)</option>
                        <option value="PARAGRAPH">பத்தி (PARAGRAPH)</option>
                        <option value="TABLE_ROW">அட்டவணை (TABLE ROW)</option>
                        <option value="SIGNATURE">ஒப்பம் (SIGNATURE)</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.5 font-mono text-[10px] font-bold border ${
                          line.confidence >= 0.95
                            ? 'bg-[#00FF66]/10 text-[#00FF66] border-[#00FF66]/30'
                            : line.confidence >= 0.8
                            ? 'bg-[#FFB800]/10 text-[#FFB800] border-[#FFB800]/30'
                            : 'bg-rose-950 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        {Math.round(line.confidence * 100)}%
                      </span>

                      <button
                        onClick={() => playTamilAudio(line.tamilText)}
                        className="p-1 text-gray-400 hover:text-[#00FF66] hover:bg-white/10 transition-all cursor-pointer"
                        title="Listen to line pronunciation"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>

                      {isEditing ? (
                        <button
                          onClick={() => handleSaveEdit(line.id)}
                          className="bg-[#00FF66] hover:bg-[#00e65c] text-black px-2 py-0.5 text-[10px] font-black uppercase cursor-pointer"
                        >
                          சேமி (SAVE)
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(line)}
                          className="p-1 text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                          title="Edit Line"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteLine(line.id)}
                        className="p-1 text-gray-500 hover:text-rose-400 hover:bg-white/10 transition-all cursor-pointer"
                        title="Delete line"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
                        <span className="text-[#FFB800] flex items-center gap-1.5">
                          <Keyboard className="w-3.5 h-3.5" />
                          <span>கீழடி / அஞ்சல் தட்டச்சுப் பலகை (Keezhadi Typing Assistant):</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowInlineKeezhadi(prev => !prev)}
                            className="text-[#00FF66] hover:underline flex items-center gap-1"
                          >
                            <Languages className="w-3 h-3" />
                            <span>{showInlineKeezhadi ? 'HIDE PHONETIC' : 'SHOW PHONETIC (ANJAL)'}</span>
                          </button>
                          {onOpenKeezhadiTab && (
                            <button
                              type="button"
                              onClick={onOpenKeezhadiTab}
                              className="text-gray-400 hover:text-white"
                            >
                              FULL STUDIO ↗
                            </button>
                          )}
                        </div>
                      </div>

                      {showInlineKeezhadi && (
                        <div className="bg-black/60 border border-[#00FF66]/30 p-2 space-y-1.5">
                          <div className="text-[10px] text-[#00FF66] font-mono">
                            Type English letters to insert Tamil (e.g. "thalaivargal"):
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={anjalInput}
                              onChange={(e) => {
                                const val = e.target.value;
                                setAnjalInput(val);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && anjalInput) {
                                  e.preventDefault();
                                  const conv = transliterateAnjalToTamil(anjalInput);
                                  setLineEditText(prev => prev ? `${prev} ${conv}` : conv);
                                  setAnjalInput('');
                                }
                              }}
                              placeholder="Type in English (Anjal) and press Enter to append..."
                              className="flex-1 bg-black border border-white/20 px-2 py-1 text-xs text-white font-mono focus:border-[#00FF66] outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (anjalInput) {
                                  const conv = transliterateAnjalToTamil(anjalInput);
                                  setLineEditText(prev => prev ? `${prev} ${conv}` : conv);
                                  setAnjalInput('');
                                }
                              }}
                              className="bg-[#00FF66] text-black px-2.5 py-1 text-[10px] font-bold uppercase"
                            >
                              APPEND
                            </button>
                          </div>
                        </div>
                      )}

                      <textarea
                        rows={3}
                        value={lineEditText}
                        onChange={(e) => setLineEditText(e.target.value)}
                        className="w-full bg-black border border-[#FFB800] p-2.5 text-sm font-medium text-white outline-none"
                      />
                    </div>
                  ) : (
                    <div
                      className={`text-sm leading-relaxed flex flex-wrap gap-1.5 ${
                        line.type === 'HEADER'
                          ? 'font-black text-[#FFB800] text-base uppercase tracking-tight'
                          : line.type === 'SIGNATURE'
                          ? 'justify-end font-bold text-gray-200'
                          : line.type === 'REFERENCE' || line.type === 'SUBJECT'
                          ? 'font-bold text-sky-200'
                          : 'text-gray-100 font-normal'
                      }`}
                    >
                      {line.words && line.words.length > 0 ? (
                        line.words.map((w, widx) => {
                          const isGov = w.isGovernmentTerm;
                          const hasSandhi = w.hasSandhi;
                          const isLow = w.confidence < 0.85;

                          return (
                            <span
                              key={w.id || widx}
                              onClick={() => setSelectedWord(w)}
                              className={`cursor-pointer px-1 py-0.5 transition-all select-text relative ${
                                isGov
                                  ? 'bg-[#FFB800]/15 text-[#FFB800] font-bold border-b border-[#FFB800] hover:bg-[#FFB800]/30'
                                  : hasSandhi
                                  ? 'bg-sky-950/60 text-sky-300 font-semibold border-b border-sky-400 hover:bg-sky-900'
                                  : isLow
                                  ? 'bg-rose-950/60 text-rose-300 border-b border-rose-500 hover:bg-rose-900'
                                  : 'hover:bg-white/10 text-white'
                              }`}
                            >
                              {w.text}
                            </span>
                          );
                        })
                      ) : (
                        <span>{line.tamilText}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Word Inspector Card (Bottom Tray) */}
          {selectedWord && (
            <div className="mt-3 p-4 bg-[#0A0B0E] border border-[#FFB800] shadow-2xl flex items-center justify-between text-xs text-white">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => playTamilAudio(selectedWord.text)}
                  className="w-9 h-9 bg-[#FFB800] text-black font-black flex items-center justify-center transition-all cursor-pointer shadow-md"
                  title="Play pronunciation"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-base text-[#FFB800]">{selectedWord.text}</span>
                    <span className="font-mono text-gray-300 text-xs font-bold">
                      [{selectedWord.isoTransliteration || transliterateTamilToISO(selectedWord.text)}]
                    </span>
                    {selectedWord.isGovernmentTerm && (
                      <span className="bg-[#FFB800]/20 text-[#FFB800] text-[10px] font-bold px-2 py-0.5 border border-[#FFB800]/40 uppercase font-mono">
                        GOV LEXICON TERM
                      </span>
                    )}
                    {selectedWord.hasSandhi && (
                      <span className="bg-sky-950 text-sky-400 text-[10px] font-bold px-2 py-0.5 border border-sky-800 uppercase font-mono">
                        SANDHI (புணர்ச்சி)
                      </span>
                    )}
                  </div>
                  {selectedWord.meaningEn && (
                    <p className="text-xs text-gray-200 mt-1 font-semibold">
                      📖 {selectedWord.meaningEn}
                    </p>
                  )}
                  {selectedWord.sandhiRule && (
                    <p className="text-[10px] text-sky-300 font-mono mt-0.5">
                      ✨ {selectedWord.sandhiRule}
                    </p>
                  )}

                  {/* Multi-Script Indian Languages Bar */}
                  <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-white/10 text-[10px] font-mono">
                    <span className="text-gray-400 font-bold">AKSHARA EQUIVALENTS:</span>
                    <span className="bg-white/10 px-1.5 py-0.5 text-[#FF5722]" title="Hindi/Sanskrit Devanagari">
                      DEV: {convertTamilToIndicScript(selectedWord.text, 'dev')}
                    </span>
                    <span className="bg-white/10 px-1.5 py-0.5 text-[#00E5FF]" title="Telugu">
                      TEL: {convertTamilToIndicScript(selectedWord.text, 'tel')}
                    </span>
                    <span className="bg-white/10 px-1.5 py-0.5 text-[#E040FB]" title="Malayalam">
                      MAL: {convertTamilToIndicScript(selectedWord.text, 'mal')}
                    </span>
                    <span className="bg-white/10 px-1.5 py-0.5 text-[#FFD600]" title="Kannada">
                      KAN: {convertTamilToIndicScript(selectedWord.text, 'kan')}
                    </span>
                    <span className="bg-[#FFB800]/20 px-1.5 py-0.5 text-[#FFB800]" title="Keezhadi Tamil-Brahmi">
                      தமிழி: {convertTamilToKeezhadiBrahmi(selectedWord.text)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedWord(null)}
                className="text-gray-400 hover:text-white font-bold text-xs uppercase px-2 py-1 cursor-pointer"
              >
                ✕ CLOSE
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
