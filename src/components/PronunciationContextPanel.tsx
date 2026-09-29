import React, { useState } from 'react';
import {
  Volume2,
  BookOpen,
  Sparkles,
  Search,
  ExternalLink,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import { OCRProcessResult } from '../types';
import { GOV_LEGAL_LEXICON, transliterateTamilToISO } from '../lib/tamilMorphology';

interface PronunciationContextPanelProps {
  result: OCRProcessResult;
}

export const PronunciationContextPanel: React.FC<PronunciationContextPanelProps> = ({
  result
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedIso, setCopiedIso] = useState<boolean>(false);
  const [isPlayingLineId, setIsPlayingLineId] = useState<string | null>(null);

  // Play audio pronunciation of Tamil line
  const playTamilAudio = (text: string, lineId: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ta-IN';
      utterance.rate = 0.85;
      utterance.onstart = () => setIsPlayingLineId(lineId);
      utterance.onend = () => setIsPlayingLineId(null);
      utterance.onerror = () => setIsPlayingLineId(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Generate complete ISO 15919 transliteration document
  const fullIsoText = (result.lines || [])
    .map((l) => `${l.tamilText}\n[ISO: ${transliterateTamilToISO(l.tamilText)}]`)
    .join('\n\n');

  const handleCopyIso = () => {
    navigator.clipboard.writeText(fullIsoText);
    setCopiedIso(true);
    setTimeout(() => setCopiedIso(false), 2000);
  };

  // Filter dictionary terms
  const glossaryEntries = Object.entries(GOV_LEGAL_LEXICON).filter(([term, data]) => {
    if (!searchTerm) return true;
    return (
      term.includes(searchTerm) ||
      data.meaningEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      data.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="bg-[#12141A] border border-white/10 p-6 sm:p-8 text-[#D1D5DB] space-y-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold text-[#FFB800] uppercase tracking-[0.2em]">
              PHONETICS & LEGAL LEXICON
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            உச்சரிப்பு, ISO 15919 ஒலிபெயர்ப்பு & அரசு அகராதி (PHONETICS & GLOSSARY)
          </h2>
          <p className="text-xs text-gray-400 mt-1 font-mono">
            PHONETIC ROMANIZATION, AUDIO SYNTHESIS & OFFICIAL TAMIL SECRETARIAT TERMINOLOGY
          </p>
        </div>

        <button
          onClick={handleCopyIso}
          className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
        >
          {copiedIso ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#00FF66]" />
              <span className="text-[#00FF66]">COPIED ISO 15919!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#FFB800]" />
              <span>முழு ISO உரை நகல் (COPY ISO)</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Line by line Transliteration and Audio */}
        <div className="lg:col-span-7 bg-[#0A0B0E] p-5 border border-white/10 flex flex-col h-[600px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
            <span className="text-xs font-bold text-gray-200 uppercase tracking-wider">
              வரிவரியாக ஒலிபெயர்ப்பு (LINE-BY-LINE TRANSLITERATION):
            </span>
            <span className="text-[10px] font-mono font-bold text-[#00FF66] bg-[#00FF66]/10 px-2 py-0.5 border border-[#00FF66]/30 uppercase">
              ISO 15919 STANDARD
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {(result.lines || []).map((line, idx) => {
              const iso = transliterateTamilToISO(line.tamilText);
              const isPlaying = isPlayingLineId === line.id;

              return (
                <div
                  key={line.id ? `${line.id}-${idx}` : `line-${idx}`}
                  className="p-3.5 bg-[#12141A] border border-white/10 hover:border-[#FFB800]/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white leading-relaxed">{line.tamilText}</p>
                      <p className="text-xs font-mono text-[#FFB800] font-semibold leading-relaxed">[ {iso} ]</p>
                    </div>

                    <button
                      onClick={() => playTamilAudio(line.tamilText, line.id)}
                      className={`p-2 transition-all cursor-pointer shrink-0 ${
                        isPlaying
                          ? 'bg-[#00FF66] text-black font-black'
                          : 'bg-white/10 text-gray-300 hover:bg-[#FFB800] hover:text-black'
                      }`}
                      title="Listen to Tamil pronunciation"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Government & Legal Tamil Glossary */}
        <div className="lg:col-span-5 bg-[#0A0B0E] p-5 border border-white/10 flex flex-col h-[600px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-200 uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-[#FFB800]" />
              <span>அரசு & சட்டச் சொல் அகராதி (GOV GLOSSARY):</span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono font-bold uppercase">{glossaryEntries.length} TERMS</span>
          </div>

          {/* Search Box */}
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="தேடுக (e.g. அரசாணை, நன்செய், கிரயம்)..."
              className="w-full bg-[#12141A] border border-white/20 pl-9 pr-3 py-2 text-xs text-white uppercase placeholder:normal-case font-mono outline-none focus:border-[#FFB800]"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {glossaryEntries.map(([term, data]) => {
              const iso = transliterateTamilToISO(term);
              return (
                <div
                  key={term}
                  className="p-3 bg-[#12141A] border border-white/10 hover:border-white/20"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-[#FFB800]">{term}</span>
                    <span className="text-[10px] font-mono font-bold text-gray-300 bg-white/10 px-2 py-0.5 border border-white/10 uppercase">
                      {data.category}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-gray-300 mt-0.5 font-bold">[ {iso} ]</div>
                  <div className="text-xs text-gray-200 mt-1 font-semibold leading-relaxed">{data.meaningEn}</div>
                  <div className="text-[10px] text-sky-300 font-mono mt-1 uppercase">ROOT: {data.root}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
