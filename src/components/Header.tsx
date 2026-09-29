import React from 'react';
import {
  FileText,
  Download,
  FileSignature,
  ArrowRightLeft,
  FileSpreadsheet,
  Languages,
  Send,
  Laptop
} from 'lucide-react';
import { OCRProcessResult, ActiveTabType, OfficialIndianLanguageCode, OFFICIAL_INDIAN_LANGUAGES } from '../types';
import { downloadTamilExcelFile } from '../lib/excelGenerator';

interface HeaderProps {
  currentResult: OCRProcessResult | null;
  isProcessing: boolean;
  onOpenDocxModal: () => void;
  onOpenExeModal: () => void;
  onReset: () => void;
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  selectedLanguage: OfficialIndianLanguageCode;
  onSelectLanguage: (lang: OfficialIndianLanguageCode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentResult,
  isProcessing,
  onOpenDocxModal,
  onOpenExeModal,
  onReset,
  activeTab,
  setActiveTab,
  selectedLanguage,
  onSelectLanguage
}) => {
  return (
    <header className="bg-[#0F1115] border-b border-white/10 text-[#D1D5DB] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-2 md:py-0 md:h-20 gap-3">
          {/* Tamify Brand */}
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={onReset}
              title="Tamify • முகப்பு"
            >
              <div className="flex items-center justify-center h-10 sm:h-12 px-2 py-1 bg-white rounded-lg border border-white/20 shadow-md group-hover:border-[#FFB800] transition-colors">
                <img
                  src="/tamify-logo.svg"
                  alt="Tamify Logo"
                  className="h-8 sm:h-9 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1">
                    <span>Tamify</span>
                    <span className="text-xs sm:text-sm font-semibold text-[#FFB800] font-sans">இந்தியா</span>
                  </h1>
                </div>
                <p className="text-[10px] text-gray-400 font-mono tracking-wider hidden sm:block">
                  INDIAN LANGUAGES & DOCUMENT CONVERSION STUDIO
                </p>
              </div>
            </div>

            {/* Mobile Language Selector */}
            <div className="md:hidden">
              <select
                id="select-header-language-mobile"
                value={selectedLanguage}
                onChange={(e) => onSelectLanguage(e.target.value as OfficialIndianLanguageCode)}
                className="bg-[#181B22] border border-white/20 text-white text-xs font-bold px-2 py-1.5 rounded outline-none"
              >
                {OFFICIAL_INDIAN_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Core Controls: Language Selector & 4 Simplified Tabs */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-end">
            {/* Desktop Language Selector */}
            <div className="hidden md:flex items-center gap-1.5 bg-[#12141A] px-2.5 py-1.5 border border-white/10 rounded">
              <Languages className="w-3.5 h-3.5 text-[#FFB800]" />
              <span className="text-[11px] font-mono text-gray-400 font-bold uppercase">மொழி:</span>
              <select
                id="select-header-language-desktop"
                value={selectedLanguage}
                onChange={(e) => onSelectLanguage(e.target.value as OfficialIndianLanguageCode)}
                className="bg-transparent text-xs text-white font-bold outline-none cursor-pointer pr-1"
              >
                {OFFICIAL_INDIAN_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-[#0F1115] text-white">
                    {lang.name} • {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>

            {/* 4 Simple Tabs: PDF to Excel, PDF to Word, PDF Editor, Language Converter */}
            <nav className="flex items-center bg-[#12141A] p-1 border border-white/10 overflow-x-auto max-w-full">
              {/* Tab 1: PDF to Excel */}
              <button
                id="nav-tab-pdf-to-excel"
                onClick={() => setActiveTab('pdf-to-excel')}
                className={`px-3 sm:px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'pdf-to-excel'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400 shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title="Convert PDF Tables & Data to Excel Spreadsheet (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>PDF to Excel</span>
              </button>

              {/* Tab 2: PDF to Word */}
              <button
                id="nav-tab-pdf-to-word"
                onClick={() => setActiveTab('pdf-to-word')}
                className={`px-3 sm:px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'pdf-to-word'
                    ? 'bg-white/10 text-white border border-[#FFB800]/80 shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title="Convert PDF & Documents to Word (.docx)"
              >
                <FileText className="w-3.5 h-3.5 text-[#FFB800]" />
                <span>PDF to Word</span>
              </button>

              {/* Tab 3: Official Reply Letter */}
              <button
                id="nav-tab-reply-letter"
                onClick={() => setActiveTab('reply-letter')}
                className={`px-3 sm:px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'reply-letter'
                    ? 'bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800] shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title="Create Official Tamil Reply Letter in TAU-Marutham Word (.docx) from PDF"
              >
                <Send className="w-3.5 h-3.5 text-[#FFB800]" />
                <span>பதில் கடிதம் (Reply Letter)</span>
              </button>

              {/* Tab 4: PDF Editor */}
              <button
                id="nav-tab-pdf-editor"
                onClick={() => setActiveTab('pdf-editor')}
                className={`px-3 sm:px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'pdf-editor'
                    ? 'bg-sky-500/20 text-sky-300 border border-[#38BDF8] shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title="Edit, annotate, stamp, and sign PDFs"
              >
                <FileSignature className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>PDF Editor</span>
              </button>

              {/* Tab 5: Language Converter */}
              <button
                id="nav-tab-language-converter"
                onClick={() => setActiveTab('language-converter')}
                className={`px-3 sm:px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'language-converter'
                    ? 'bg-purple-500/20 text-purple-300 border border-[#A78BFA] shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title="Official Indian Languages & Font Converter"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-[#A78BFA]" />
                <span>Language Converter</span>
              </button>
            </nav>

            {/* Quick Export Excel Header Action */}
            {currentResult && (
              <button
                id="btn-header-excel-quick"
                onClick={() => downloadTamilExcelFile(currentResult)}
                className="hidden sm:flex items-center gap-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 font-bold px-3 py-2 text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                title="Download as Excel spreadsheet (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Excel</span>
              </button>
            )}

            {/* Quick Export DOCX Header Action */}
            {currentResult && activeTab === 'pdf-to-word' && (
              <button
                id="btn-header-docx-modal"
                onClick={onOpenDocxModal}
                className="flex items-center gap-2 bg-[#00FF66] hover:bg-[#00e65c] text-black font-black px-3.5 py-2 text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
                title="Download formatted DOCX"
              >
                <Download className="w-3.5 h-3.5" />
                <span>DOCX</span>
              </button>
            )}

            {/* Export downloadable tamify.exe Button */}
            <button
              id="btn-header-export-tamify-exe"
              onClick={onOpenExeModal}
              className="flex items-center gap-1.5 bg-[#00F0FF]/15 hover:bg-[#00F0FF]/25 border border-[#00F0FF]/40 hover:border-[#00F0FF] text-[#00F0FF] hover:text-white font-bold px-3 py-2 text-xs uppercase tracking-wider rounded transition-all cursor-pointer shadow-sm group"
              title="Export downloadable tamify.exe (Windows 64-bit Desktop Application)"
            >
              <Laptop className="w-3.5 h-3.5 text-[#00F0FF] group-hover:scale-110 transition-transform" />
              <span className="font-mono font-bold tracking-tight">tamify.exe</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

