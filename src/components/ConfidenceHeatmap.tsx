import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Zap,
  RefreshCw,
  Sliders,
  HelpCircle
} from 'lucide-react';
import { OCRProcessResult, WordToken } from '../types';

interface ConfidenceHeatmapProps {
  result: OCRProcessResult;
  onApplyWordCorrection?: (wordId: string, correctedText: string) => void;
}

export const ConfidenceHeatmap: React.FC<ConfidenceHeatmapProps> = ({
  result,
  onApplyWordCorrection
}) => {
  const [selectedConfidenceFilter, setSelectedConfidenceFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [activeWordToken, setActiveWordToken] = useState<WordToken | null>(null);

  // Collect all word tokens across lines
  const allWords: WordToken[] = [];
  result.lines.forEach((l) => {
    if (l.words) {
      allWords.push(...l.words);
    }
  });

  const highCount = allWords.filter((w) => w.confidence >= 0.95).length;
  const medCount = allWords.filter((w) => w.confidence >= 0.8 && w.confidence < 0.95).length;
  const lowCount = allWords.filter((w) => w.confidence < 0.8).length;
  const totalWords = allWords.length || 1;

  const highPercent = Math.round((highCount / totalWords) * 100);
  const medPercent = Math.round((medCount / totalWords) * 100);
  const lowPercent = Math.round((lowCount / totalWords) * 100);

  const filteredWords = allWords.filter((w) => {
    if (selectedConfidenceFilter === 'high') return w.confidence >= 0.95;
    if (selectedConfidenceFilter === 'medium') return w.confidence >= 0.8 && w.confidence < 0.95;
    if (selectedConfidenceFilter === 'low') return w.confidence < 0.8;
    return true;
  });

  return (
    <div className="bg-[#12141A] border border-white/10 p-6 sm:p-8 text-[#D1D5DB] space-y-6 shadow-2xl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold text-[#00FF66] uppercase tracking-[0.2em]">
              CONFIDENCE MATRIX & LEXICAL ACCURACY
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            துல்லிய மதிப்பீடு & வெப்ப வரைபடம் (CONFIDENCE HEATMAP)
          </h2>
          <p className="text-xs text-gray-400 mt-1 font-mono">
            WORD-BY-WORD MORPHOLOGICAL VERIFICATION & OCR AGREEMENT MATRIX
          </p>
        </div>

        <div className="flex items-center gap-6 bg-[#0A0B0E] px-5 py-3 border border-white/10">
          <div>
            <span className="text-[10px] text-gray-500 uppercase font-mono font-bold block">OVERALL ACCURACY</span>
            <span className="text-2xl font-mono font-black text-[#00FF66]">
              {(result.overallConfidence * 100).toFixed(1)}%
            </span>
          </div>
          <div className="h-8 w-px bg-white/10"></div>
          <div>
            <span className="text-[10px] text-gray-500 uppercase font-mono font-bold block">VERIFIED WORDS</span>
            <span className="text-2xl font-mono font-black text-white">{allWords.length}</span>
          </div>
        </div>
      </div>

      {/* Progress Bars & Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setSelectedConfidenceFilter('high')}
          className={`p-4 border transition-all text-left cursor-pointer ${
            selectedConfidenceFilter === 'high'
              ? 'bg-[#0A0B0E] border-[#00FF66] ring-1 ring-[#00FF66]'
              : 'bg-[#0A0B0E]/60 border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
              <CheckCircle className="w-3.5 h-3.5 text-[#00FF66]" />
              <span>HIGH CONFIDENCE (&gt;95%)</span>
            </span>
            <span className="font-mono font-bold text-[#00FF66]">{highPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 overflow-hidden">
            <div className="h-full bg-[#00FF66]" style={{ width: `${highPercent}%` }}></div>
          </div>
          <p className="text-[11px] text-gray-400 mt-2 font-mono">{highCount} words fully verified by ensemble</p>
        </button>

        <button
          onClick={() => setSelectedConfidenceFilter('medium')}
          className={`p-4 border transition-all text-left cursor-pointer ${
            selectedConfidenceFilter === 'medium'
              ? 'bg-[#0A0B0E] border-[#FFB800] ring-1 ring-[#FFB800]'
              : 'bg-[#0A0B0E]/60 border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-[#FFB800]" />
              <span>SANDHI ADJUSTED (80-95%)</span>
            </span>
            <span className="font-mono font-bold text-[#FFB800]">{medPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 overflow-hidden">
            <div className="h-full bg-[#FFB800]" style={{ width: `${medPercent}%` }}></div>
          </div>
          <p className="text-[11px] text-gray-400 mt-2 font-mono">{medCount} words corrected with grammar rules</p>
        </button>

        <button
          onClick={() => setSelectedConfidenceFilter('low')}
          className={`p-4 border transition-all text-left cursor-pointer ${
            selectedConfidenceFilter === 'low'
              ? 'bg-[#0A0B0E] border-rose-500 ring-1 ring-rose-500'
              : 'bg-[#0A0B0E]/60 border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>REQUIRES REVIEW (&lt;80%)</span>
            </span>
            <span className="font-mono font-bold text-rose-400">{lowPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 overflow-hidden">
            <div className="h-full bg-rose-500" style={{ width: `${lowPercent}%` }}></div>
          </div>
          <p className="text-[11px] text-gray-400 mt-2 font-mono">{lowCount} words flagged for manual check</p>
        </button>
      </div>

      {/* Interactive Word Cloud / Matrix View */}
      <div className="bg-[#0A0B0E] p-6 border border-white/10">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-wider">
            <span>சொல் வரைபடம் (WORD MATRIX TOKENS):</span>
            <span className="text-[11px] font-mono text-[#00FF66] font-bold">({filteredWords.length} TOKENS)</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setSelectedConfidenceFilter('all')}
              className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-all border border-white/10 cursor-pointer ${
                selectedConfidenceFilter === 'all'
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              அனைத்தும் (RESET FILTER)
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 max-h-96 overflow-y-auto p-2">
          {filteredWords.map((word, widx) => {
            const isHigh = word.confidence >= 0.95;
            const isMed = word.confidence >= 0.8 && word.confidence < 0.95;
            const isSelected = activeWordToken?.id === word.id;

            return (
              <button
                key={word.id || widx}
                onClick={() => setActiveWordToken(word)}
                className={`px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer border ${
                  isSelected
                    ? 'border-[#FFB800] bg-[#FFB800]/20 text-white shadow-lg'
                    : ''
                } ${
                  isHigh
                    ? 'bg-black/50 text-[#00FF66] border-[#00FF66]/30 hover:bg-[#00FF66]/10'
                    : isMed
                    ? 'bg-black/50 text-[#FFB800] border-[#FFB800]/30 hover:bg-[#FFB800]/10'
                    : 'bg-rose-950/40 text-rose-200 border-rose-500/50 hover:bg-rose-900/60'
                }`}
              >
                {word.text}
                <span className="ml-1.5 text-[10px] font-mono font-bold opacity-75">
                  {Math.round(word.confidence * 100)}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Word Inspector Modal/Tray */}
      {activeWordToken && (
        <div className="bg-[#0A0B0E] p-5 border border-[#FFB800] shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-lg font-black text-[#FFB800]">{activeWordToken.text}</span>
              <span className="font-mono text-xs text-gray-300 font-bold">
                [ISO: {activeWordToken.isoTransliteration}]
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 font-bold border ${
                  activeWordToken.confidence >= 0.95
                    ? 'bg-[#00FF66]/20 text-[#00FF66] border-[#00FF66]/40'
                    : 'bg-[#FFB800]/20 text-[#FFB800] border-[#FFB800]/40'
                }`}
              >
                {Math.round(activeWordToken.confidence * 100)}% CONFIDENCE
              </span>
            </div>

            {activeWordToken.meaningEn && (
              <p className="text-xs text-gray-200 mt-1 font-semibold">
                <span className="font-bold text-gray-400 uppercase">GLOSS:</span> {activeWordToken.meaningEn}
              </p>
            )}

            {activeWordToken.sandhiRule && (
              <p className="text-xs text-sky-300 font-mono">
                <span className="font-bold text-gray-400 uppercase">SANDHI:</span> {activeWordToken.sandhiRule}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveWordToken(null)}
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-1.5 text-xs uppercase tracking-wider cursor-pointer border border-white/20"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
