import React, { useState } from 'react';
import {
  Smartphone,
  Monitor,
  Download,
  FolderArchive,
  Terminal,
  FileCode,
  CheckCircle2,
  Copy,
  ExternalLink,
  X,
  Layers,
  Sparkles,
  Package,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { downloadAndroidStudioProjectZip } from '../lib/offlineAndroidBundle';
import { downloadPythonOfflineSuiteZip } from '../lib/offlinePythonBundle';

interface DownloadProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadProjectsModal: React.FC<DownloadProjectsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'android' | 'desktop' | 'structure'>('android');
  const [downloadingAndroid, setDownloadingAndroid] = useState<boolean>(false);
  const [downloadingDesktop, setDownloadingDesktop] = useState<boolean>(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2500);
  };

  const handleDownloadAndroid = async () => {
    try {
      setDownloadingAndroid(true);
      await downloadAndroidStudioProjectZip();
    } catch (e) {
      console.error('Android download failed', e);
    } finally {
      setDownloadingAndroid(false);
    }
  };

  const handleDownloadDesktop = async () => {
    try {
      setDownloadingDesktop(true);
      await downloadPythonOfflineSuiteZip();
    } catch (e) {
      console.error('Desktop download failed', e);
    } finally {
      setDownloadingDesktop(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0F1117] border border-white/20 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl rounded-none text-[#E2E8F0] overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#161922]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00FF66]/10 border border-[#00FF66]/30 flex items-center justify-center text-[#00FF66]">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-wide flex items-center gap-2">
                <span>திட்டக் கோப்புகள் & பதிவிறக்கம் (App Project Downloads)</span>
                <span className="bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66]/40 text-[10px] px-2 py-0.5 font-mono font-bold uppercase tracking-wider">
                  Android & Desktop EXE
                </span>
              </h2>
              <p className="text-xs text-gray-400 font-mono">
                Android Studio Kotlin Project • Windows Desktop .EXE Builder • Full Offline Codebase
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1.5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-[#12141C] px-6">
          <button
            onClick={() => setActiveTab('android')}
            className={`py-3 px-4 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 cursor-pointer transition-all ${
              activeTab === 'android'
                ? 'border-[#00FF66] text-[#00FF66] bg-[#00FF66]/5'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>1. Android Version (Kotlin & Compose)</span>
          </button>

          <button
            onClick={() => setActiveTab('desktop')}
            className={`py-3 px-4 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 cursor-pointer transition-all ${
              activeTab === 'desktop'
                ? 'border-[#38BDF8] text-[#38BDF8] bg-[#38BDF8]/5'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Monitor className="w-4 h-4 text-[#38BDF8]" />
            <span>2. Desktop EXE & Python Suite</span>
          </button>

          <button
            onClick={() => setActiveTab('structure')}
            className={`py-3 px-4 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 cursor-pointer transition-all ${
              activeTab === 'structure'
                ? 'border-[#FFB800] text-[#FFB800] bg-[#FFB800]/5'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <FolderArchive className="w-4 h-4 text-[#FFB800]" />
            <span>3. திட்டக் கோப்புறைகள் (Folder Structure)</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0A0C10]">
          
          {/* TAB 1: ANDROID APP */}
          {activeTab === 'android' && (
            <div className="space-y-6">
              {/* Main Download Card */}
              <div className="bg-[#12151D] border border-emerald-500/30 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <h3 className="text-base font-bold text-white">Tamify Android Studio Native Project (.zip)</h3>
                  </div>
                  <p className="text-xs text-gray-400">
                    முழுமையான Native Android Studio Project (Kotlin, Jetpack Compose, CameraX, Google ML Kit Text Recognition, Room DB).
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1 font-mono text-[10px]">
                    <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5">
                      Gradle 8.5.2
                    </span>
                    <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5">
                      Kotlin 2.0.0
                    </span>
                    <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5">
                      Min SDK 24 (Android 7.0+)
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleDownloadAndroid}
                  disabled={downloadingAndroid}
                  className="bg-[#00FF66] hover:bg-[#00e65c] text-black font-black px-5 py-3 text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg transition-all shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>{downloadingAndroid ? 'கோப்பு உருவாகிறது...' : 'Android ZIP பதிவிறக்கு (.ZIP)'}</span>
                </button>
              </div>

              {/* Build Instructions */}
              <div className="bg-[#12151D] border border-white/10 p-5 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>Android Studio-வில் APK உருவாக்குவது எப்படி? (Quick Build Guide)</span>
                </h4>

                <div className="space-y-3 text-xs text-gray-300">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-white/10 text-white font-mono flex items-center justify-center font-bold text-xs shrink-0">1</span>
                    <p>மேலே உள்ள பொத்தானைக் கிளிக் செய்து <code className="bg-black/50 text-emerald-300 px-1.5 py-0.5 font-mono">Tamify_Android_Studio_Kotlin_Project.zip</code> கோப்பைப் பதிவிறக்கி உங்கள் கணினியில் Extract செய்யவும்.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-white/10 text-white font-mono flex items-center justify-center font-bold text-xs shrink-0">2</span>
                    <p><strong>Android Studio</strong> திறந்து <strong>Open Project</strong> கொடுத்து இந்த கோப்புறையைத் தேர்ந்தெடுக்கவும்.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-white/10 text-white font-mono flex items-center justify-center font-bold text-xs shrink-0">3</span>
                    <div className="space-y-1.5 flex-1">
                      <p>Terminal-ல் கீழே உள்ள கட்டளையை இயக்கி APK உருவாக்கலாம்:</p>
                      <div className="bg-[#0A0C10] border border-white/10 p-2.5 font-mono text-xs text-emerald-300 flex items-center justify-between">
                        <code>./gradlew assembleDebug</code>
                        <button
                          onClick={() => copyToClipboard('./gradlew assembleDebug', 'gradle-cmd')}
                          className="text-gray-400 hover:text-white"
                          title="Copy"
                        >
                          {copiedSnippet === 'gradle-cmd' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-400">உருவாக்கப்பட்ட APK: <code className="text-gray-300">app/build/outputs/apk/debug/app-debug.apk</code></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DESKTOP EXE & PYTHON SUITE */}
          {activeTab === 'desktop' && (
            <div className="space-y-6">
              {/* Main Download Card */}
              <div className="bg-[#12151D] border border-[#38BDF8]/30 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] animate-pulse"></span>
                    <h3 className="text-base font-bold text-white">Standalone Desktop GUI & EXE Builder Suite (.zip)</h3>
                  </div>
                  <p className="text-xs text-gray-400">
                    100% ஆஃப்லைன் Python Tkinter GUI Application + Windows .exe உருவாக்குவதற்கான PyInstaller Build Scripts (`build_exe.bat`, `build_exe.py`).
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1 font-mono text-[10px]">
                    <span className="bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20 px-2 py-0.5">
                      Python 3.9 - 3.12+
                    </span>
                    <span className="bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20 px-2 py-0.5">
                      PyInstaller 6.0+ (.EXE)
                    </span>
                    <span className="bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20 px-2 py-0.5">
                      Windows / Mac / Linux
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleDownloadDesktop}
                  disabled={downloadingDesktop}
                  className="bg-[#38BDF8] hover:bg-[#7dd3fc] text-black font-black px-5 py-3 text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg transition-all shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>{downloadingDesktop ? 'கோப்பு உருவாகிறது...' : 'Desktop EXE Suite (.ZIP)'}</span>
                </button>
              </div>

              {/* Step by step to compile .exe */}
              <div className="bg-[#12151D] border border-white/10 p-5 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
                  <Cpu className="w-4 h-4 text-[#38BDF8]" />
                  <span>1-கிளிக் மூலம் Windows Standalone .EXE உருவாக்குவது எப்படி?</span>
                </h4>

                <div className="space-y-3 text-xs text-gray-300">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-white/10 text-white font-mono flex items-center justify-center font-bold text-xs shrink-0">1</span>
                    <p><code className="bg-black/50 text-[#38BDF8] px-1.5 py-0.5 font-mono">Tamil_Offline_Python_OCR_Suite.zip</code> கோப்பைப் பதிவிறக்கி Extract செய்யவும்.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-white/10 text-white font-mono flex items-center justify-center font-bold text-xs shrink-0">2</span>
                    <div className="space-y-1 flex-1">
                      <p>Windows-ல் <code className="bg-black/50 text-[#38BDF8] px-1.5 py-0.5 font-mono font-bold">build_exe.bat</code> கோப்பை Double-Click செய்யவும் அல்லது Terminal-ல் இயக்கவும்:</p>
                      <div className="bg-[#0A0C10] border border-white/10 p-2.5 font-mono text-xs text-[#38BDF8] flex items-center justify-between">
                        <code>python build_exe.py</code>
                        <button
                          onClick={() => copyToClipboard('python build_exe.py', 'py-build-cmd')}
                          className="text-gray-400 hover:text-white"
                          title="Copy"
                        >
                          {copiedSnippet === 'py-build-cmd' ? <CheckCircle2 className="w-4 h-4 text-[#38BDF8]" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-white/10 text-white font-mono flex items-center justify-center font-bold text-xs shrink-0">3</span>
                    <p>சில வினாடிகளில் <code className="bg-black/50 text-emerald-400 px-1.5 py-0.5 font-mono">dist/Tamil_Archive_OCR_Studio.exe</code> என்ற ஒற்றைக் கோப்பு (.EXE) தயாராகிவிடும்! இதை எந்த கணினியிலும் Python இல்லாமலேயே நேரடியாக இயக்கலாம்.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROJECT FOLDER STRUCTURE */}
          {activeTab === 'structure' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Android Project Tree */}
                <div className="bg-[#12151D] border border-white/10 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-bold text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4" />
                      <span>Android Studio Folder Tree</span>
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">Kotlin / Compose</span>
                  </div>
                  <pre className="bg-[#0A0C10] p-3 text-[11px] font-mono text-gray-300 leading-relaxed overflow-x-auto border border-white/5">
{`Tamify_Android_Project/
├── app/
│   ├── build.gradle.kts
│   ├── proguard-rules.pro
│   └── src/
│       └── main/
│           ├── AndroidManifest.xml
│           ├── java/com/tamify/ocr/
│           │   ├── MainActivity.kt
│           │   ├── ui/
│           │   │   ├── OcrScreen.kt
│           │   │   ├── CameraScanScreen.kt
│           │   │   └── NitroPdfEditorScreen.kt
│           │   ├── ocr/
│           │   │   ├── OfflineMlKitEngine.kt
│           │   │   └── TamilMorphologyNormalizer.kt
│           │   └── export/
│           │       └── TamilDocxExporter.kt
│           └── res/
├── gradle/
│   └── libs.versions.toml
├── build.gradle.kts
└── settings.gradle.kts`}
                  </pre>
                </div>

                {/* Desktop Project Tree */}
                <div className="bg-[#12151D] border border-white/10 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-bold text-xs text-[#38BDF8] font-mono flex items-center gap-1.5">
                      <Monitor className="w-4 h-4" />
                      <span>Desktop & Python Folder Tree</span>
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">Standalone EXE</span>
                  </div>
                  <pre className="bg-[#0A0C10] p-3 text-[11px] font-mono text-gray-300 leading-relaxed overflow-x-auto border border-white/5">
{`Tamil_Offline_Python_Suite/
├── desktop_app.py         # Tkinter GUI App
├── tamil_ocr_engine.py    # Offline Tesseract & PyMuPDF
├── tamil_converter.py     # Bamini/TSCII/TAB Converters
├── tamil_docx_exporter.py # Word .docx Generator
├── build_exe.py           # PyInstaller .exe Compiler
├── build_exe.bat          # 1-Click Windows Compiler
├── requirements.txt       # Dependencies list
└── README.md              # User Manual`}
                  </pre>
                </div>
              </div>

              {/* Full Web & Server Codebase note */}
              <div className="bg-[#12151D] border border-white/10 p-4 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <p className="font-bold text-white">Google AI Studio Export Options</p>
                  <p className="text-gray-400">இணையப் பயன்பாட்டின் முழுமையான React & TypeScript மூலக் குறியீட்டை மேல் உள்ள Settings மெனு மூலம் ZIP அல்லது GitHub-க்கு Export செய்யலாம்.</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-[#12141C] flex items-center justify-between text-xs text-gray-400 font-mono">
          <span>Tamify v2.0 • 100% Standalone Offline Codebases</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold cursor-pointer"
          >
            மூடு (Close)
          </button>
        </div>

      </div>
    </div>
  );
};
