import React, { useState, useEffect } from 'react';
import {
  Download,
  Laptop,
  CheckCircle2,
  X,
  Sparkles,
  ShieldCheck,
  FolderArchive,
  RefreshCw,
  Cpu,
  Terminal,
  ExternalLink,
  Layers,
  FileCheck,
  AlertCircle,
  FileCode,
  Copy,
  PackageCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface WindowsExeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'all-codes' | 'exe';
}

interface ExeInfo {
  exeFileName: string;
  exeSize: number;
  exeSizeFormatted: string;
  zipFileName: string;
  zipSize: number;
  zipSizeFormatted: string | null;
  updatedAt: string;
  architecture: string;
  targetPlatform: string;
}

interface AllCodesInfo {
  fileName: string;
  altFileName: string;
  size: number;
  sizeFormatted: string;
  updatedAt: string;
  description: string;
}

export const WindowsExeExportModal: React.FC<WindowsExeExportModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'exe'
}) => {
  const [activeTab, setActiveTab] = useState<'all-codes' | 'exe'>(initialTab);
  const [exeInfo, setExeInfo] = useState<ExeInfo | null>(null);
  const [allCodesInfo, setAllCodesInfo] = useState<AllCodesInfo | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState<boolean>(false);
  const [isDownloadingAllCodes, setIsDownloadingAllCodes] = useState<boolean>(false);
  const [isDownloadingExe, setIsDownloadingExe] = useState<boolean>(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState<boolean>(false);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);
  const [copiedCodeSnippet, setCopiedCodeSnippet] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoadingInfo(true);

    Promise.all([
      fetch('/api/download/all-codes-info')
        .then(r => r.json())
        .catch(() => null),
      fetch('/api/download/tamify-exe-info')
        .then(r => r.json())
        .catch(() => null)
    ])
      .then(([codesData, exeData]) => {
        if (!isMounted) return;
        if (codesData && codesData.success) {
          setAllCodesInfo(codesData);
        }
        if (exeData && exeData.success) {
          setExeInfo(exeData);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingInfo(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch {
      // ignore
    }
  };

  const handleDownloadAllCodes = () => {
    setIsDownloadingAllCodes(true);
    triggerConfetti();

    const fileName = 'Tamify_Complete_Source_Code.zip';
    const link = document.createElement('a');
    link.href = `/api/download/${fileName}?t=${Date.now()}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsDownloadingAllCodes(false);
      setDownloadSuccessToast('முழு மூலக் குறியீடு (All Codes ZIP) வெற்றிகரமாக பதிவிறக்கம் தொடங்கப்பட்டது!');
      setTimeout(() => setDownloadSuccessToast(null), 6000);
    }, 1200);
  };

  const handleDownloadExe = (fileName = 'tamify.exe') => {
    setIsDownloadingExe(true);
    triggerConfetti();

    const link = document.createElement('a');
    link.href = `/api/download/${fileName}?t=${Date.now()}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsDownloadingExe(false);
      setDownloadSuccessToast(`${fileName} வெற்றிகரமாக பதிவிறக்கம் தொடங்கப்பட்டது!`);
      setTimeout(() => setDownloadSuccessToast(null), 6000);
    }, 1200);
  };

  const handleDownloadZip = () => {
    setIsDownloadingZip(true);
    triggerConfetti();

    const link = document.createElement('a');
    link.href = `/api/download/Tamify_Windows_Desktop_x64.zip?t=${Date.now()}`;
    link.download = 'Tamify_Windows_Desktop_x64.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsDownloadingZip(false);
      setDownloadSuccessToast('Tamify Windows Portable ZIP வெற்றிகரமாக பதிவிறக்கம் தொடங்கப்பட்டது!');
      setTimeout(() => setDownloadSuccessToast(null), 6000);
    }, 1200);
  };

  const copyQuickStart = () => {
    navigator.clipboard.writeText('npm install\nnpm run dev');
    setCopiedCodeSnippet(true);
    setTimeout(() => setCopiedCodeSnippet(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="export-suite-modal"
        className="bg-[#0D0F14] border border-white/20 w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#12151D]">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              activeTab === 'all-codes'
                ? 'bg-[#00FF66]/15 border border-[#00FF66]/30 text-[#00FF66]'
                : 'bg-[#00F0FF]/15 border border-[#00F0FF]/30 text-[#00F0FF]'
            }`}>
              {activeTab === 'all-codes' ? (
                <FolderArchive className="w-5 h-5" />
              ) : (
                <Laptop className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  திட்ட ஏற்றுமதி & மூலக்குறியீடு (Export Project & Codes)
                </h2>
                <span className="bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66]/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                  100% Offline Ready
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono">
                Full Source Code ZIP • Windows Desktop Executable • Complete Offline Studio
              </p>
            </div>
          </div>
          <button
            id="close-export-suite-modal-btn"
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10 bg-[#10121A] px-6">
          <button
            id="tab-btn-all-codes"
            onClick={() => setActiveTab('all-codes')}
            className={`py-3 px-4 font-mono font-bold text-xs uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'all-codes'
                ? 'border-[#00FF66] text-[#00FF66] bg-[#00FF66]/5'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <FolderArchive className="w-4 h-4" />
            <span>முழு குறியீடு (All Codes ZIP)</span>
            <span className="text-[10px] bg-[#00FF66]/20 text-[#00FF66] px-1.5 py-0.2 rounded font-sans">
              அனைத்து கோப்புகளும்
            </span>
          </button>

          <button
            id="tab-btn-windows-exe"
            onClick={() => setActiveTab('exe')}
            className={`py-3 px-4 font-mono font-bold text-xs uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'exe'
                ? 'border-[#00F0FF] text-[#00F0FF] bg-[#00F0FF]/5'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Windows Desktop (.exe)</span>
            <span className="text-[10px] bg-[#00F0FF]/20 text-[#00F0FF] px-1.5 py-0.2 rounded font-sans">
              நேரடி இயக்கம்
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-gray-300">
          
          {/* Success Toast Notification */}
          {downloadSuccessToast && (
            <div className="p-3 bg-[#00FF66]/15 border border-[#00FF66]/40 rounded-lg flex items-center gap-2.5 text-xs text-[#00FF66] animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="font-semibold">{downloadSuccessToast}</span>
            </div>
          )}

          {/* TAB 1: ALL CODES ZIP */}
          {activeTab === 'all-codes' && (
            <div className="space-y-6">
              {/* Main Download Banner */}
              <div className="p-5 rounded-lg bg-gradient-to-br from-[#101B14] to-[#142319] border border-[#00FF66]/40 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-[#00FF66] font-mono text-xs font-bold uppercase mb-1">
                      <Sparkles className="w-4 h-4" />
                      <span>முழு திட்ட மூலக் குறியீடு (Full Source Code ZIP)</span>
                    </div>
                    <div className="text-xl font-black text-white font-mono flex items-center gap-2">
                      <span>Tamify_Complete_Source_Code.zip</span>
                      <span className="text-xs font-mono font-normal text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                        {allCodesInfo?.sizeFormatted || '0.35 MB'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 mt-2 max-w-lg leading-relaxed">
                      Frontend React, Express Backend, தமிழ் எழுத்துரு மாற்றி எஞ்சின்கள், Tau-marutham வேர்ட்/எக்செல் உருவாக்கிகள், பைதான் கருவிகள் மற்றும் கட்டமைப்பு கோப்புகள் உள்ளிட்ட 100% முழுமையான மூலக்குறியீடு.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 w-full sm:w-auto shrink-0">
                    <button
                      id="btn-download-all-codes-zip-primary"
                      onClick={handleDownloadAllCodes}
                      disabled={isDownloadingAllCodes}
                      className="px-5 py-3.5 rounded-lg bg-[#00FF66] hover:bg-[#00e65c] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-[#00FF66]/20 disabled:opacity-50"
                    >
                      {isDownloadingAllCodes ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      <span>Download All Code (ZIP)</span>
                    </button>

                    <a
                      href={`/api/download/tamify-all-codes.zip?t=${Date.now()}`}
                      download="tamify-all-codes.zip"
                      className="text-[11px] font-mono text-center text-gray-400 hover:text-[#00FF66] underline transition-colors"
                    >
                      மாற்று இணைப்பு: tamify-all-codes.zip
                    </a>
                  </div>
                </div>
              </div>

              {/* What is Included Grid */}
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-[#00FF66]" />
                  <span>ZIP கோப்பில் உள்ள முக்கிய பகுதிகள் (What's Included):</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#12141A] border border-white/10">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-[#00FF66]" />
                      <span>src/ (முழு Frontend & UI)</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      React 19, Tailwind CSS, PDF Editor, Official Reply Letter, PDF to Excel, Typewriter, மற்றும் அனைத்து UI கூறுகள்.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#12141A] border border-white/10">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-[#00F0FF]" />
                      <span>server.ts (Express Backend)</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      OCR Vision ensemble, Indic script parsers, Word & Excel generation, local API routes.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#12141A] border border-white/10">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#FFB800]" />
                      <span>src/lib/ (அனைத்து மாற்றி எஞ்சின்கள்)</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Bamini, TSCII, TAB, Vanavil, Unicode, OpenTamil, மற்றும் அரசு மாதிரி Tau-marutham Word formatting.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#12141A] border border-white/10">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-purple-400" />
                      <span>scripts/ & python_offline_suite/</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Windows .exe பேக்கேஜர் (build_windows_suite.mjs), ஏற்றுமதி ஸ்கிரிப்ட்கள், மற்றும் ஆஃப்லைன் பைதான் தொகுப்பு.
                    </p>
                  </div>
                </div>
              </div>

              {/* How to Run Locally */}
              <div className="p-4 rounded-lg bg-[#12141A] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono font-bold text-[#00FF66] uppercase tracking-wider flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>உங்கள் கணினியில் இயக்குவது எப்படி? (Quick Local Setup)</span>
                  </div>
                  <button
                    onClick={copyQuickStart}
                    className="flex items-center gap-1 text-[11px] font-mono text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded transition-colors cursor-pointer"
                  >
                    {copiedCodeSnippet ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-[#00FF66]" />
                        <span className="text-[#00FF66]">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Commands</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-black/60 rounded-md p-3 font-mono text-xs text-gray-300 border border-white/10 space-y-1">
                  <div className="text-gray-500"># 1. ZIP கோப்பை அன்சிப் செய்து டெர்மினலில் திறக்கவும்:</div>
                  <div className="text-emerald-400 font-bold">npm install</div>
                  <div className="text-gray-500 pt-1"># 2. லோக்கல் சர்வரைத் தொடங்கவும்:</div>
                  <div className="text-emerald-400 font-bold">npm run dev</div>
                  <div className="text-gray-500 pt-1"># 3. பிரவுசரில் http://localhost:3000 திறக்கவும்</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WINDOWS EXE */}
          {activeTab === 'exe' && (
            <div className="space-y-6">
              {/* Main Download Banner */}
              <div className="p-4 rounded-lg bg-gradient-to-br from-[#121722] to-[#181D2A] border border-[#00F0FF]/30 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-[#00F0FF] font-mono text-xs font-bold uppercase mb-1">
                      <Sparkles className="w-4 h-4" />
                      <span>Windows Standalone Executable (Verified)</span>
                    </div>
                    <div className="text-lg font-black text-white font-mono">
                      tamify.exe
                      <span className="ml-2 text-xs font-normal text-gray-400">
                        ({exeInfo?.exeSizeFormatted || '4.07 MB'})
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 mt-1 max-w-md">
                      இணைய இணைப்பு இல்லாமலும் (100% Offline) கணினியில் இயங்கும் முழுமையான தமிழ் ஆவண மென்பொருள். எந்தவித நிறுவலும் (No Installation) தேவையில்லை.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
                    <button
                      id="direct-download-tamify-exe-btn"
                      onClick={() => handleDownloadExe('tamify.exe')}
                      disabled={isDownloadingExe}
                      className="px-4 py-3 rounded-lg bg-[#00FF66] hover:bg-[#00e65c] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-[#00FF66]/20 disabled:opacity-50"
                      title="Download standard tamify.exe"
                    >
                      {isDownloadingExe ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      <span>Download tamify.exe</span>
                    </button>

                    <button
                      id="direct-download-tamify-alt-exe-btn"
                      onClick={() => handleDownloadExe('Tamify-Desktop-x64.exe')}
                      disabled={isDownloadingExe}
                      className="px-3 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-white/20 disabled:opacity-50"
                      title="Download fresh filename if Windows locked previous tamify.exe"
                    >
                      <Download className="w-3.5 h-3.5 text-[#00F0FF]" />
                      <span>Tamify-Desktop-x64.exe</span>
                    </button>
                  </div>
                </div>

                {/* Sub Action for ZIP bundle */}
                <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-gray-400 font-mono text-[11px] flex items-center gap-1.5">
                    <FolderArchive className="w-3.5 h-3.5 text-[#FFB800]" />
                    மாற்று வடிவம் (100% SmartScreen Free): Portable ZIP with start.bat
                  </span>
                  <button
                    id="download-portable-zip-btn"
                    onClick={handleDownloadZip}
                    disabled={isDownloadingZip}
                    className="text-[#00F0FF] hover:text-[#55f5ff] font-mono font-bold text-[11px] flex items-center gap-1 cursor-pointer underline hover:no-underline"
                  >
                    {isDownloadingZip ? 'தயாராகிறது...' : `Download Portable ZIP (${exeInfo?.zipSizeFormatted || '0.73 MB'})`}
                  </button>
                </div>
              </div>

              {/* Troubleshooting Section */}
              <div className="p-4 rounded-lg bg-[#FFB800]/10 border border-[#FFB800]/30 space-y-2.5 text-xs">
                <div className="text-xs font-mono font-bold text-[#FFB800] uppercase tracking-wider flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#FFB800]" />
                  <span>விண்டோஸ் டிப்ஸ் & தீர்வுகள் (Windows Tips & Solutions):</span>
                </div>
                <div className="bg-black/50 rounded-lg p-3 space-y-1.5 font-mono text-[11px] text-gray-300 border border-white/10">
                  <div>
                    <strong className="text-[#00FF66]">1. நேரடி இயக்கம்:</strong> <code className="text-white">tamify.exe</code> டபுள்-கிளிக் செய்தால் விண்டோ உடனே திறக்கும்.
                  </div>
                  <div>
                    <strong className="text-[#00F0FF]">2. SmartScreen வந்தால்:</strong> <strong className="text-white">"More info"</strong> கிளிக் செய்து &gt; <strong className="text-white">"Run anyway"</strong> தேர்ந்தெடுக்கவும்.
                  </div>
                  <div>
                    <strong className="text-[#FFB800]">3. மாற்று வழி:</strong> <strong className="text-white">"Download Portable ZIP"</strong> பதிவிறக்கி, அன்சிப் செய்து <code className="text-[#00FF66]">start.bat</code> இயக்கவும்.
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-[#12151D] text-xs">
          <div className="text-gray-400 font-mono text-[11px]">
            {activeTab === 'all-codes'
              ? 'Format: ZIP Archive • Includes 100% source codes, configs & build tools'
              : 'Target: Windows 10/11 x64 PE Executable • Portable Edition'}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase transition-colors cursor-pointer"
          >
            Close (மூடுக)
          </button>
        </div>
      </div>
    </div>
  );
};

