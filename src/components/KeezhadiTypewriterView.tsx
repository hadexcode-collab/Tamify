import React, { useState, useEffect } from 'react';
import {
  Keyboard,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  Languages,
  BookOpen,
  ArrowRight,
  Plus
} from 'lucide-react';
import {
  TypewriterLayoutMode,
  KEEZHADI_TAMIL99_KEYS,
  KEEZHADI_BRAHMI_QUICK_TILES,
  convertTamilToKeezhadiBrahmi,
  transliterateAnjalToTamil,
  VirtualKeyDef
} from '../lib/keezhadiTypewriter';

interface KeezhadiTypewriterViewProps {
  onInsertTextIntoDocument?: (text: string) => void;
}

export const KeezhadiTypewriterView: React.FC<KeezhadiTypewriterViewProps> = ({
  onInsertTextIntoDocument
}) => {
  const [layoutMode, setLayoutMode] = useState<TypewriterLayoutMode>('KEEZHADI_TAMIL99');
  const [typedBuffer, setTypedBuffer] = useState<string>('தமிழ்நாடு அரசு தலைமைச் செயலகம்');
  const [anjalInput, setAnjalInput] = useState<string>('');
  const [isShiftActive, setIsShiftActive] = useState<boolean>(false);
  const [isCapsActive, setIsCapsActive] = useState<boolean>(false);
  const [activeKeyHighlight, setActiveKeyHighlight] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isInserted, setIsInserted] = useState<boolean>(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);

  // Play subtle mechanical typewriter click sound
  const playKeySound = () => {
    if (!isSoundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800 + Math.random() * 200, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    } catch {
      // Ignore audioContext autoplay limits
    }
  };

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If typing in a native textarea, don't hijack unless Anjal or Tamil99 is focused
      if (document.activeElement?.tagName === 'TEXTAREA' && (document.activeElement as any).id !== 'keezhadi-main-textarea') {
        return;
      }

      setActiveKeyHighlight(e.code);
      playKeySound();

      if (e.key === 'Shift') {
        setIsShiftActive(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftActive(false);
      }
      setTimeout(() => setActiveKeyHighlight(null), 150);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSoundEnabled]);

  // Handle virtual key click
  const handleKeyClick = (key: VirtualKeyDef) => {
    playKeySound();
    setActiveKeyHighlight(key.code);
    setTimeout(() => setActiveKeyHighlight(null), 120);

    if (key.actionValue === 'SHIFT') {
      setIsShiftActive(prev => !prev);
      return;
    }
    if (key.actionValue === 'CAPS') {
      setIsCapsActive(prev => !prev);
      return;
    }
    if (key.actionValue === 'BACKSPACE') {
      setTypedBuffer(prev => prev.slice(0, -1));
      return;
    }

    const valueToInsert = isShiftActive && key.shiftValue ? key.shiftValue : (key.actionValue || key.label);
    setTypedBuffer(prev => prev + valueToInsert);
  };

  // Anjal Live Input Handler
  const handleAnjalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAnjalInput(val);
    const converted = transliterateAnjalToTamil(val);
    setTypedBuffer(converted);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(typedBuffer);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleInsert = () => {
    if (onInsertTextIntoDocument && typedBuffer) {
      onInsertTextIntoDocument(typedBuffer);
      setIsInserted(true);
      setTimeout(() => setIsInserted(false), 2000);
    }
  };

  const brahmiOutput = convertTamilToKeezhadiBrahmi(typedBuffer);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Studio Header */}
      <div className="bg-[#12141A] border border-white/10 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#FFB800] text-black flex items-center justify-center font-black text-2xl shadow-lg shadow-[#FFB800]/20">
            ⌨
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black uppercase text-white tracking-tight">
                கீழடி தட்டச்சு & தமிழி உள்ளீட்டுப் பொறி (Keezhadi Typewriting Studio)
              </h2>
              <span className="bg-[#00FF66]/10 text-[#00FF66] text-[10px] font-mono font-bold px-2 py-0.5 border border-[#00FF66]/20">
                ARCHAEOLOGICAL & UNICODE
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Type in classical Tamil99, Anjal phonetic Roman keys, BAMINI mechanical typewriter, or instant Keezhadi Tamil-Brahmi epigraphy.
            </p>
          </div>
        </div>

        {/* Sound toggle & actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSoundEnabled(prev => !prev)}
            className={`p-2 border text-xs font-bold flex items-center gap-1.5 transition-all ${
              isSoundEnabled
                ? 'bg-white/10 border-[#FFB800] text-[#FFB800]'
                : 'bg-black/40 border-white/10 text-gray-400 hover:text-white'
            }`}
            title="Toggle mechanical key click audio"
          >
            {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="text-[10px] uppercase font-mono">{isSoundEnabled ? 'SOUND ON' : 'MUTED'}</span>
          </button>

          {onInsertTextIntoDocument && (
            <button
              onClick={handleInsert}
              className="bg-[#00FF66] hover:bg-[#00e65c] active:scale-95 text-black px-4 py-2 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-[#00FF66]/20 cursor-pointer"
            >
              {isInserted ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{isInserted ? 'INSERTED!' : 'INSERT INTO DOC'}</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/20 px-3.5 py-2 text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {isCopied ? <Check className="w-4 h-4 text-[#00FF66]" /> : <Copy className="w-4 h-4 text-[#FFB800]" />}
            <span>{isCopied ? 'COPIED' : 'COPY'}</span>
          </button>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => setLayoutMode('KEEZHADI_TAMIL99')}
          className={`p-3 text-left border transition-all ${
            layoutMode === 'KEEZHADI_TAMIL99'
              ? 'bg-[#FFB800]/10 border-[#FFB800] text-white shadow-md'
              : 'bg-[#12141A] border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-[#FFB800]">1. தமிழ்99 / கீழடி</span>
            <span className="text-[9px] font-mono text-gray-400">LAYOUT</span>
          </div>
          <p className="text-[11px] text-gray-300 mt-1">Standard Tamil99 & Inscript visual typewriter layout</p>
        </button>

        <button
          onClick={() => setLayoutMode('ANJAL_PHONETIC')}
          className={`p-3 text-left border transition-all ${
            layoutMode === 'ANJAL_PHONETIC'
              ? 'bg-[#00FF66]/10 border-[#00FF66] text-white shadow-md'
              : 'bg-[#12141A] border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-[#00FF66]">2. அஞ்சல் (Anjal)</span>
            <span className="text-[9px] font-mono text-gray-400">PHONETIC</span>
          </div>
          <p className="text-[11px] text-gray-300 mt-1">Type English letters (e.g. "thamizh" → "தமிழ்")</p>
        </button>

        <button
          onClick={() => setLayoutMode('BAMINI_TYPEWRITER')}
          className={`p-3 text-left border transition-all ${
            layoutMode === 'BAMINI_TYPEWRITER'
              ? 'bg-[#00E5FF]/10 border-[#00E5FF] text-white shadow-md'
              : 'bg-[#12141A] border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-[#00E5FF]">3. பாமினி தட்டச்சு</span>
            <span className="text-[9px] font-mono text-gray-400">TYPEWRITER</span>
          </div>
          <p className="text-[11px] text-gray-300 mt-1">Legacy Remington typewriter key positions (jkpo; → தமிழ்)</p>
        </button>

        <button
          onClick={() => setLayoutMode('TAMIL_BRAHMI_EPIGRAPHY')}
          className={`p-3 text-left border transition-all ${
            layoutMode === 'TAMIL_BRAHMI_EPIGRAPHY'
              ? 'bg-[#E65100]/20 border-[#FFB800] text-white shadow-md'
              : 'bg-[#12141A] border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-[#FFB800]">4. தமிழி (Brahmi)</span>
            <span className="text-[9px] font-mono text-gray-400">EPIGRAPHY</span>
          </div>
          <p className="text-[11px] text-gray-300 mt-1">Keezhadi archaeological pot-sherd epigraphical converter</p>
        </button>
      </div>

      {/* Anjal Live Input Bar (if Anjal active) */}
      {layoutMode === 'ANJAL_PHONETIC' && (
        <div className="bg-[#181B22] border border-[#00FF66]/30 p-4 space-y-2">
          <label className="text-xs font-mono font-bold uppercase text-[#00FF66] flex items-center gap-2">
            <Languages className="w-3.5 h-3.5" />
            <span>Phonetic Input (Type English words here e.g. "vanakkam nanbargalae"):</span>
          </label>
          <input
            type="text"
            value={anjalInput}
            onChange={handleAnjalChange}
            placeholder="Type e.g.: tamil nadu arasaanaai 142 thalaivargal..."
            className="w-full bg-black/60 border border-white/20 px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-[#00FF66]"
          />
          <div className="flex flex-wrap gap-2 text-[10px] text-gray-400 font-mono">
            <span className="bg-white/5 px-2 py-0.5">ka = க</span>
            <span className="bg-white/5 px-2 py-0.5">kaa = கா</span>
            <span className="bg-white/5 px-2 py-0.5">ki = கி</span>
            <span className="bg-white/5 px-2 py-0.5">kee = கீ</span>
            <span className="bg-white/5 px-2 py-0.5">ku = கு</span>
            <span className="bg-white/5 px-2 py-0.5">koo = கூ</span>
            <span className="bg-white/5 px-2 py-0.5">thamizh = தமிழ்</span>
            <span className="bg-white/5 px-2 py-0.5">vanakkam = வணக்கம்</span>
          </div>
        </div>
      )}

      {/* Main Text Buffer & Output Dual Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Modern Unicode Buffer */}
        <div className="bg-[#12141A] border border-white/10 p-4 flex flex-col space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-400 uppercase">
            <span className="text-[#FFB800] flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5" />
              <span>ஒருங்குறித் தட்டச்சுப் பலகை (Unicode Output Buffer)</span>
            </span>
            <button
              onClick={() => { setTypedBuffer(''); setAnjalInput(''); }}
              className="text-gray-400 hover:text-white flex items-center gap-1 text-[10px]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>CLEAR</span>
            </button>
          </div>
          <textarea
            id="keezhadi-main-textarea"
            value={typedBuffer}
            onChange={(e) => setTypedBuffer(e.target.value)}
            rows={5}
            placeholder="தட்டச்சு செய்யப்படும் சொற்கள் இங்கே தோன்றும்..."
            className="w-full flex-1 bg-black/50 border border-white/10 p-3 text-white font-sans text-base leading-relaxed focus:outline-none focus:border-[#FFB800]"
          />
          <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
            <span>எழுத்துக்கள் (Chars): {typedBuffer.length}</span>
            <span>சொற்கள் (Words): {typedBuffer.split(/\s+/).filter(Boolean).length}</span>
          </div>
        </div>

        {/* Keezhadi Tamil-Brahmi Epigraphy Mirror Panel */}
        <div className="bg-[#16130E] border border-[#FFB800]/30 p-4 flex flex-col space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#FFB800] uppercase">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>கீழடி தமிழி கல்வெட்டுப் பிரதி (Tamil-Brahmi Epigraph Mirror)</span>
            </span>
            <span className="text-[10px] bg-[#FFB800]/20 text-[#FFB800] px-2 py-0.5 border border-[#FFB800]/30">
              6th Century BCE
            </span>
          </div>
          <div className="w-full flex-1 bg-black/60 border border-[#FFB800]/20 p-3 text-[#FFB800] font-mono text-xl tracking-widest leading-loose overflow-y-auto min-h-[120px]">
            {brahmiOutput || '𑀢𑀫𑀺𑀵𑁆...'}
          </div>
          <p className="text-[10px] text-gray-400 italic">
            * Transcribed into authentic Sangam Tamil-Brahmi glyphs discovered at Keezhadi, Kodumanal, and Alagankulam.
          </p>
        </div>
      </div>

      {/* Keezhadi Epigraphy Presets (Sangam Pot-sherd inscriptions) */}
      <div className="bg-[#12141A] border border-white/10 p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-300 uppercase">
          <span className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-[#FFB800]" />
            <span>கீழடி மண்பாண்ட மற்றும் கல்வெட்டுப் பெயர்கள் (Quick Epigraphy Inserts)</span>
          </span>
          <span className="text-[10px] text-gray-400">Click to append</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {KEEZHADI_BRAHMI_QUICK_TILES.map((tile, idx) => (
            <button
              key={idx}
              onClick={() => {
                playKeySound();
                setTypedBuffer(prev => prev ? `${prev} ${tile.label}` : tile.label);
              }}
              className="bg-black/40 hover:bg-[#FFB800]/10 border border-white/10 hover:border-[#FFB800]/50 p-2.5 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white group-hover:text-[#FFB800]">{tile.label}</span>
                <span className="text-xs font-mono text-[#FFB800]">{tile.brahmi}</span>
              </div>
              <div className="text-[10px] text-gray-400 mt-1 flex items-center justify-between">
                <span>{tile.translit}</span>
                <span className="text-gray-400 text-[9px]">{tile.meaning}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Visual Keyboard Stage */}
      <div className="bg-[#0A0C10] border border-white/15 p-4 sm:p-6 shadow-2xl space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-gray-400 uppercase pb-2 border-b border-white/10">
          <div className="flex items-center gap-4">
            <span className="text-white font-bold">விசைப்பலகை (INTERACTIVE KEYBOARD):</span>
            <span className="text-[#FFB800] font-bold">
              {layoutMode === 'KEEZHADI_TAMIL99' ? 'கீழடி தமிழ்99' : layoutMode === 'BAMINI_TYPEWRITER' ? 'பாமினி தட்டச்சு' : 'ஒலிபெயர்ப்பு'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-2 py-0.5 text-[10px] font-bold ${isShiftActive ? 'bg-[#FFB800] text-black' : 'bg-white/5 text-gray-400'}`}>
              SHIFT {isShiftActive ? 'ON' : 'OFF'}
            </span>
            <span className={`px-2 py-0.5 text-[10px] font-bold ${isCapsActive ? 'bg-[#00FF66] text-black' : 'bg-white/5 text-gray-400'}`}>
              CAPS {isCapsActive ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        {/* Keyboard Key Grid */}
        <div className="space-y-2 pt-2">
          {KEEZHADI_TAMIL99_KEYS.map((row, rIdx) => (
            <div key={rIdx} className="flex justify-center gap-1.5 flex-wrap">
              {row.map((k) => {
                const isActive = activeKeyHighlight === k.code;
                const isShift = isShiftActive && k.shiftValue;
                const displayMain = isShift ? k.shiftValue : k.label;
                const displaySub = isShift ? k.label : k.subLabel;

                return (
                  <button
                    key={k.keyId}
                    onClick={() => handleKeyClick(k)}
                    className={`h-11 sm:h-12 ${k.width || 'w-10 sm:w-12'} rounded-sm border flex flex-col items-center justify-center p-1 transition-all active:scale-95 cursor-pointer font-sans ${
                      isActive
                        ? 'bg-[#FFB800] border-white text-black shadow-lg scale-105 z-10'
                        : k.type === 'CONTROL'
                        ? 'bg-[#181B22] border-white/20 text-gray-300 hover:bg-white/10 hover:text-white'
                        : k.type === 'VOWEL'
                        ? 'bg-[#141B26] border-blue-500/30 text-blue-300 hover:bg-blue-500/20 hover:border-blue-400'
                        : k.type === 'PULLI'
                        ? 'bg-[#261E14] border-[#FFB800]/50 text-[#FFB800] font-black'
                        : 'bg-[#12141A] border-white/10 text-white hover:bg-white/10 hover:border-white/30'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-bold">{displayMain}</span>
                    {displaySub && (
                      <span className="text-[9px] font-mono text-gray-400 leading-none">{displaySub}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
