import React from 'react';
import {
  FileSearch,
  Zap,
  Eye,
  Sparkles,
  ShieldCheck,
  Volume2,
  FileCheck,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { OCRProcessResult } from '../types';

interface PipelineVisualizerProps {
  currentResult: OCRProcessResult | null;
  isProcessing: boolean;
  activeStage?: number;
}

export const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({
  currentResult,
  isProcessing,
  activeStage = 6
}) => {
  const stages = [
    {
      id: 1,
      title: '1. Font / Encoding Detection',
      tamilTitle: 'எழுத்துரு குறியாக்கக் கண்டறிதல்',
      desc: 'Statistical signature analysis (BAMINI, TSCII, TAM, TAB, ShreeLipi vs. Scanned Raster Image)',
      icon: FileSearch,
      stat: currentResult?.detectedEncoding || 'Auto-Detect',
      status: currentResult ? 'completed' : isProcessing ? 'active' : 'idle'
    },
    {
      id: 2,
      title: '2. Deterministic Converter',
      tamilTitle: 'திட்டவட்ட மாற்றி (Deterministic)',
      desc: 'Zero-loss ASCII-to-Unicode glyph & kombu state machine mapping',
      icon: Zap,
      stat: currentResult?.processingMethod === 'DETERMINISTIC_ONLY' ? 'Direct Mapped' : 'Ensemble Hybrid',
      status: currentResult ? 'completed' : isProcessing ? 'active' : 'idle'
    },
    {
      id: 3,
      title: '3. Multimodal & Tesseract.js OCR Ensemble',
      tamilTitle: 'பார்வைக் குறியீடு படிப்பி (Gemini + Tesseract.js)',
      desc: 'Gemini 3.7 Flash cloud vision coupled with in-browser Tesseract.js Tamil (tam+eng) fallback for ink bleeds, typewriter dots & damaged pullis',
      icon: Eye,
      stat: currentResult?.logs?.some((l) => l.includes('Tesseract.js'))
        ? 'Tesseract.js Engine Active'
        : currentResult?.lines
        ? `${currentResult.lines.length} Lines Decoded`
        : 'Vision + Tesseract Ready',
      status: currentResult ? 'completed' : isProcessing ? 'active' : 'idle'
    },
    {
      id: 4,
      title: '4. Lexical + Morphological Fusion',
      tamilTitle: 'சொல் இலக்கண & புணர்ச்சி இணைப்பு',
      desc: 'Sandhi (புணர்ச்சி) validation, Tamil Nadu Secretariat lexicon & Grantha ligature sanity',
      icon: Sparkles,
      stat: currentResult?.morphologyStats
        ? `${currentResult.morphologyStats.govTermsIdentified} Gov Terms, ${currentResult.morphologyStats.sandhiAdjusted} Sandhi`
        : 'Grammar Engine Ready',
      status: currentResult ? 'completed' : isProcessing ? 'active' : 'idle'
    },
    {
      id: 5,
      title: '5. Confidence Scoring & Heatmap',
      tamilTitle: 'துல்லிய மதிப்பீடு & பிழைத்திருத்தம்',
      desc: 'Per-word visual heatmaps with agreement matrix & alternative repair suggestions',
      icon: ShieldCheck,
      stat: currentResult
        ? `${Math.round(currentResult.overallConfidence * 100)}% Overall Score`
        : 'Scoring Engine Ready',
      status: currentResult ? 'completed' : isProcessing ? 'active' : 'idle'
    },
    {
      id: 6,
      title: '6. Pronunciation & Context Layer',
      tamilTitle: 'ISO 15919 ஒலிபெயர்ப்பு & குரல்',
      desc: 'Scientific Romanization, phonetic breakdown, official English gloss and TTS pronunciation',
      icon: Volume2,
      stat: currentResult ? 'Transliteration Synced' : 'Phonetics Ready',
      status: currentResult ? 'completed' : isProcessing ? 'active' : 'idle'
    },
    {
      id: 7,
      title: '7. Clean Unicode DOCX Output',
      tamilTitle: 'தூய ஒருங்குறி DOCX ஆவணம்',
      desc: 'Full Microsoft Word .docx format with Tamil fonts, tables, official header & letterhead',
      icon: FileCheck,
      stat: currentResult ? 'Ready for Download' : 'DOCX Ready',
      status: currentResult ? 'completed' : isProcessing ? 'active' : 'idle'
    }
  ];

  return (
    <div className="bg-[#12141A] border border-white/10 p-6 sm:p-8 text-[#D1D5DB] shadow-2xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold text-[#FFB800] uppercase tracking-[0.2em]">
              ARCHITECTURE & TELEMETRY
            </span>
            <span className="h-px bg-[#FFB800]/30 w-12"></span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            தமிழ் ஆவண செயலாக்க கட்டமைப்பு (PIPELINE ENGINE)
          </h2>
          <p className="text-xs text-gray-400 mt-1 font-mono">
            DETERMINISTIC FONT DECODER ➔ MULTI-MODAL GEMINI VISION ➔ MORPHOLOGY FUSION ➔ UNICODE DOCX
          </p>
        </div>

        {currentResult && (
          <div className="flex items-center gap-4 bg-[#0A0B0E] px-4 py-2.5 border border-white/10">
            <div className="text-right">
              <div className="text-[10px] uppercase text-gray-500 font-mono font-bold">LATENCY (வேகம்)</div>
              <div className="text-sm font-mono font-bold text-[#00FF66]">
                {(currentResult.processingTimeMs / 1000).toFixed(2)}s
              </div>
            </div>
            <div className="h-6 w-px bg-white/10"></div>
            <div className="text-right">
              <div className="text-[10px] uppercase text-gray-500 font-mono font-bold">CONFIDENCE (துல்லியம்)</div>
              <div className="text-sm font-mono font-bold text-[#FFB800]">
                {(currentResult.overallConfidence * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pipeline Stages Grid / Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isDone = stage.status === 'completed';
          const isActive = stage.status === 'active';

          return (
            <div
              key={stage.id}
              className={`relative p-4.5 transition-all border ${
                isDone
                  ? 'bg-[#0A0B0E] border-white/10 hover:border-[#FFB800]/50'
                  : isActive
                  ? 'bg-[#0A0B0E] border-[#FFB800] shadow-lg shadow-[#FFB800]/10'
                  : 'bg-[#0A0B0E]/50 border-white/5 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`w-9 h-9 flex items-center justify-center font-bold ${
                    isDone
                      ? 'bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66]/30'
                      : isActive
                      ? 'bg-[#FFB800] text-black font-black'
                      : 'bg-white/5 text-gray-400 border border-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex items-center gap-1">
                  {isDone ? (
                    <span className="flex items-center gap-1 text-[10px] text-[#00FF66] font-mono font-bold bg-[#00FF66]/10 px-2 py-0.5 border border-[#00FF66]/30 uppercase">
                      <CheckCircle className="w-3 h-3" />
                      <span>COMPLETED</span>
                    </span>
                  ) : isActive ? (
                    <span className="flex items-center gap-1 text-[10px] text-[#FFB800] font-mono font-bold bg-[#FFB800]/10 px-2 py-0.5 border border-[#FFB800]/40 uppercase">
                      <Clock className="w-3 h-3 animate-spin" />
                      <span>ACTIVE</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-500 font-mono font-bold">STAGE 0{stage.id}</span>
                  )}
                </div>
              </div>

              <div className="mt-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-tight">{stage.title}</h3>
                <h4 className="text-[11px] font-medium text-[#FFB800] mt-0.5">{stage.tamilTitle}</h4>
                <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">{stage.desc}</p>
              </div>

              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-[10px] text-gray-500 uppercase">OUTPUT:</span>
                <span className="text-[11px] font-bold text-[#00FF66] bg-black/80 px-2 py-0.5 border border-white/5">
                  {stage.stat}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Execution Logs */}
      {currentResult && currentResult.logs && (
        <div className="mt-6 bg-[#0A0B0E] p-4 border border-white/10 font-mono text-xs text-gray-300">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            <span>இயந்திரப் பதிவுகள் (SYSTEM EXECUTION LOGS)</span>
            <span className="text-[#00FF66]">GEMINI 3.7 MULTI-MODAL VERIFIED</span>
          </div>
          <div className="space-y-1">
            {currentResult.logs.map((log, lidx) => (
              <div key={lidx} className="flex items-center gap-2 text-gray-300">
                <span className="text-[#00FF66] font-bold">✔</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
