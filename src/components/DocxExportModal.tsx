import React, { useState } from 'react';
import {
  Download,
  FileText,
  Settings2,
  Check,
  X,
  Sparkles,
  BookOpen,
  Building,
  Layers,
  FileCode
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { OCRProcessResult, DocxExportConfig } from '../types';
import { generateTamilDocxBlob } from '../lib/docxGenerator';

interface DocxExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: OCRProcessResult;
}

export const DocxExportModal: React.FC<DocxExportModalProps> = ({
  isOpen,
  onClose,
  result
}) => {
  const [config, setConfig] = useState<DocxExportConfig>({
    documentTitle: result.metadata?.documentTitle || 'தமிழ் ஆவணம்',
    fontSize: 12,
    fontFamily: 'Tau-marutham',
    includeHeaderLetterhead: false,
    letterheadText: 'தமிழ்நாடு அரசு / GOVERNMENT OF TAMIL NADU',
    subLetterheadText: result.metadata?.department || '',
    includeDocumentMetadata: false,
    tableBorderColor: 'CBD5E0',
    lineSpacing: 1.15,
    pageOrientation: 'portrait',
    includePronunciationAppendix: false,
    includeConfidenceSummary: false
  });

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  // Trigger DOCX Download
  const handleDownloadDocx = async () => {
    try {
      setIsExporting(true);
      const blob = await generateTamilDocxBlob(result, config);

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = `${config.documentTitle.replace(/[/\\?%*:|"<>]/g, '_') || 'Tamil_Document'}.docx`;
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Fire celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to export DOCX:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Download Plain Text
  const handleDownloadTxt = () => {
    const textContent = result.lines.map((l) => l.tamilText).join('\n');
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.documentTitle || 'tamil_document'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#12141A] border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl text-[#D1D5DB]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#0A0B0E]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFB800] text-black font-black flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tight">
                தூய ஒருங்குறி DOCX ஆவண ஏற்றுமதி (DOCX EXPORT ENGINE)
              </h3>
              <p className="text-xs text-gray-400 font-mono">
                TRUE UTF-8 TAMIL TYPOGRAPHY WITH FORMATTED HEADERS, METADATA BOXES & GLOSSARY
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Settings & Preview */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Configuration Settings */}
            <div className="space-y-4 bg-[#0A0B0E] p-5 border border-white/10">
              <h4 className="text-xs font-black text-[#FFB800] uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Settings2 className="w-4 h-4" />
                <span>வடிவமைப்பு அமைப்புகள் (LAYOUT SETTINGS)</span>
              </h4>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1 font-mono">
                  DOCUMENT TITLE:
                </label>
                <input
                  type="text"
                  value={config.documentTitle}
                  onChange={(e) => setConfig({ ...config, documentTitle: e.target.value })}
                  className="w-full bg-[#12141A] border border-white/20 focus:border-[#FFB800] px-3 py-2 text-xs text-white outline-none font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1 font-mono">
                    TAMIL FONT:
                  </label>
                  <select
                    value={config.fontFamily}
                    onChange={(e) => setConfig({ ...config, fontFamily: e.target.value as any })}
                    className="w-full bg-[#12141A] border border-white/20 focus:border-[#FFB800] px-3 py-2 text-xs text-[#FFB800] font-bold uppercase outline-none"
                  >
                    <option value="Tau-marutham">Tau-marutham (மருதம் - Default)</option>
                    <option value="Latha">Latha (லதா)</option>
                    <option value="Vijaya">Vijaya (விஜயா)</option>
                    <option value="Nirmala UI">Nirmala UI (நிர்மலா)</option>
                    <option value="Kavivanar">Kavivanar (கவிவாணர்)</option>
                    <option value="Mukta Malar">Mukta Malar (முக்தா மலர்)</option>
                    <option value="Noto Sans Tamil">Noto Sans Tamil</option>
                    <option value="Bamini">Bamini (பாமினி)</option>
                    <option value="Arial Unicode MS">Arial Unicode MS</option>
                    <option value="Times New Roman">Times New Roman</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1 font-mono">
                    FONT SIZE:
                  </label>
                  <select
                    value={config.fontSize}
                    onChange={(e) => setConfig({ ...config, fontSize: Number(e.target.value) })}
                    className="w-full bg-[#12141A] border border-white/20 focus:border-[#FFB800] px-3 py-2 text-xs text-white font-bold uppercase outline-none"
                  >
                    <option value={10}>10 pt (Compact)</option>
                    <option value={11}>11 pt (Standard)</option>
                    <option value={12}>12 pt (Recommended)</option>
                    <option value={14}>14 pt (Large Print)</option>
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-3 border-t border-white/10 text-xs font-semibold">
                <label className="flex items-center gap-2.5 text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.includeHeaderLetterhead}
                    onChange={(e) => setConfig({ ...config, includeHeaderLetterhead: e.target.checked })}
                    className="accent-[#FFB800]"
                  />
                  <span>தமிழ்நாடு அரசு தலைப்பு (OFFICIAL LETTERHEAD)</span>
                </label>

                <label className="flex items-center gap-2.5 text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.includeDocumentMetadata}
                    onChange={(e) => setConfig({ ...config, includeDocumentMetadata: e.target.checked })}
                    className="accent-[#FFB800]"
                  />
                  <span>அரசாணை எண் & விவரப் பெட்டி (METADATA BOX)</span>
                </label>

                <label className="flex items-center gap-2.5 text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.includePronunciationAppendix}
                    onChange={(e) => setConfig({ ...config, includePronunciationAppendix: e.target.checked })}
                    className="accent-[#FFB800]"
                  />
                  <span>ISO 15919 ஒலிபெயர்ப்பு & சொல் அகராதி (APPENDIX)</span>
                </label>
              </div>
            </div>

            {/* Document Live Preview Sheet */}
            <div className="bg-[#0A0B0E] text-white p-6 border border-white/10 max-h-[380px] overflow-y-auto text-xs leading-relaxed font-sans select-text">
              {config.includeHeaderLetterhead && (
                <div className="text-center pb-3 mb-3 border-b border-white/10">
                  <h3 className="font-black text-sm text-[#FFB800] uppercase tracking-wide">{config.letterheadText}</h3>
                  <p className="text-[11px] text-gray-400 font-mono mt-0.5">{config.subLetterheadText}</p>
                </div>
              )}

              <h2 className="text-center font-bold text-xs text-white mb-3 uppercase tracking-tight">
                {config.documentTitle}
              </h2>

              {config.includeDocumentMetadata && (
                <div className="bg-[#12141A] p-3 border border-white/10 mb-3 text-[11px] space-y-1 font-mono">
                  {result.metadata?.orderNumber && (
                    <div>
                      <span className="font-bold text-[#FFB800]">ORDER NO:</span> {result.metadata.orderNumber}
                    </div>
                  )}
                  {result.metadata?.dateStr && (
                    <div>
                      <span className="font-bold text-[#FFB800]">DATE:</span> {result.metadata.dateStr}
                    </div>
                  )}
                  {result.metadata?.subject && (
                    <div>
                      <span className="font-bold text-[#FFB800]">SUBJECT:</span> {result.metadata.subject}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                {(result.lines || []).slice(0, 8).map((l, i) => (
                  <p
                    key={i}
                    className={
                      l.type === 'HEADER'
                        ? 'font-black text-[#FFB800]'
                        : l.type === 'SIGNATURE'
                        ? 'text-right font-bold text-gray-300'
                        : 'text-gray-200'
                    }
                  >
                    {l.tamilText}
                  </p>
                ))}
                {(result.lines || []).length > 8 && (
                  <p className="text-[10px] text-gray-500 font-mono text-center pt-2">
                    ... +{(result.lines || []).length - 8} MORE LINES INCLUDED IN FINAL DOCX ...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0A0B0E]">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTxt}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5 text-[#FFB800]" />
              <span>.TXT பதிவிறக்கம் (PLAIN TEXT)</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-gray-400 hover:text-white uppercase tracking-wider cursor-pointer"
            >
              ரத்து (CANCEL)
            </button>

            <button
              id="btn-confirm-docx-download"
              disabled={isExporting}
              onClick={handleDownloadDocx}
              className="bg-[#00FF66] hover:bg-[#00e65c] text-black font-black px-6 py-2.5 text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#00FF66]/20"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-black" />
                  <span>பதிவிறக்கம் தொடங்கியது! (DOWNLOADED)</span>
                </>
              ) : isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>DOCX உருவாக்கப்படுகிறது...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-black" />
                  <span>.DOCX கோப்பை பதிவிறக்கு (EXPORT DOCX)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
