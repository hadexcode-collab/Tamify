import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  QrCode,
  Check,
  Copy,
  ExternalLink,
  X,
  Share2,
  Camera,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { downloadAndroidStudioProjectZip } from '../lib/offlineAndroidBundle';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchMobileView?: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  isOpen,
  onClose,
  onLaunchMobileView
}) => {
  const [downloadingZip, setDownloadingZip] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'qr' | 'apk' | 'guide'>('qr');
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  const currentAppUrl = typeof window !== 'undefined' ? window.location.origin : 'https://tamify.app';

  // Listen for PWA beforeinstallprompt on supported browsers
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPromptEvent(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentAppUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleTriggerPwaInstall = async () => {
    if (installPromptEvent) {
      installPromptEvent.prompt();
      const choiceResult = await installPromptEvent.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setInstallPromptEvent(null);
    } else {
      alert('உங்கள் Android போனில் Chrome-ல் திறந்து "Install app" அல்லது "Add to Home screen" என்பதைத் தட்டவும்.');
    }
  };

  const handleDownloadAndroidZip = async () => {
    try {
      setDownloadingZip(true);
      await downloadAndroidStudioProjectZip();
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0D111A] border border-blue-500/30 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl rounded-none text-[#E2E8F0]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#121824]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                ஆண்ட்ராய்டு போன் செயலி (Android Phone Version)
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider">
                  100% Offline Ready
                </span>
              </h2>
              <p className="text-xs text-[#94A3B8]">
                உங்கள் போனில் நேரடியாக நிறுவி கேமரா மூலம் தமிழ் ஆவணங்களை ஸ்கேன் செய்யுங்கள்
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Navigation */}
        <div className="flex border-b border-white/10 bg-[#0A0D14] text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('qr')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'qr'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>1. போனில் நிறுவ (Scan & Install)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('apk')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'apk'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>2. Native Android Code (.ZIP)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('guide')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'guide'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>3. போன் பயன்முறை (Mobile View)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 1: QR & Instant PWA Install on Android Phone */}
          {activeSubTab === 'qr' && (
            <div className="space-y-5">
              <div className="bg-gradient-to-r from-blue-950/40 to-slate-900/40 border border-blue-500/20 p-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  நேரடியாக உங்கள் Android போனில் நிறுவலாம் (Instant PWA App)
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  எந்த Google Play Store கணக்கும் தேவையில்லை. உங்கள் போன் கேமரா மூலம் கீழே உள்ள QR Code-ஐ ஸ்கேன் செய்யுங்கள் அல்லது Link-ஐ Chrome-ல் திறக்கவும்.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                {/* Visual QR Code Display */}
                <div className="flex flex-col items-center justify-center p-4 bg-[#080B10] border border-white/10">
                  <div className="w-44 h-44 bg-white p-2.5 flex items-center justify-center shadow-md">
                    {/* SVG generated QR Code placeholder with high contrast */}
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(currentAppUrl)}`}
                      alt="Tamify Mobile QR Code"
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <span className="text-[11px] text-gray-400 mt-2 font-mono flex items-center gap-1">
                    <Camera className="w-3 h-3 text-blue-400" /> போன் கேமராவால் ஸ்கேன் செய்யவும்
                  </span>
                </div>

                {/* Direct Link & 1-Click Install Button */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-400 block mb-1.5">
                      மொபைல் இணைய முகவரி (Mobile URL):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={currentAppUrl}
                        className="bg-[#121620] border border-white/15 px-3 py-2 text-xs font-mono text-blue-300 w-full select-all focus:outline-none"
                      />
                      <button
                        onClick={handleCopyUrl}
                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-xs font-bold transition-colors cursor-pointer shrink-0"
                      >
                        {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedUrl ? 'நகலெடுக்கப்பட்டது' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Browser PWA install prompt button */}
                  <button
                    onClick={handleTriggerPwaInstall}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 text-xs tracking-wider transition-colors cursor-pointer shadow-md"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>{installPromptEvent ? '📱 இந்த போனில் நேரடியாக நிறுவு (Install App)' : '📱 Android-ல் Install செய்யும் வழிமுறை'}</span>
                  </button>

                  <div className="p-3 bg-[#111622] border border-white/5 space-y-1.5 text-[11px] text-gray-300">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      ஆண்ட்ராய்டு போனில் திறந்ததும்:
                    </div>
                    <p className="text-gray-400">
                      1. Chrome மெனுவைத் தட்டவும் (<strong className="text-white">⋮ 3 புள்ளிகள்</strong>).
                    </p>
                    <p className="text-gray-400">
                      2. <strong className="text-blue-300">"Install app"</strong> அல்லது <strong className="text-blue-300">"Add to Home screen"</strong> என்பதைத் தேர்ந்தெடுக்கவும்.
                    </p>
                    <p className="text-gray-400">
                      3. உங்கள் போன் ஹோம் ஸ்கிரீனில் Tamify ஆப் ஐகான் தோன்றி ஆஃப்லைனில் இயங்கும்.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Native Android Source Code (Kotlin + Compose + CameraX) */}
          {activeSubTab === 'apk' && (
            <div className="space-y-4">
              <div className="bg-[#111622] border border-blue-500/20 p-4 space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-blue-400" />
                  முழுமையான Native Android Studio Code Package (.ZIP)
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Kotlin மற்றும் Jetpack Compose கொண்டு எழுதப்பட்ட முழுமையான ஆண்ட்ராய்டு ஆப் திட்டம். இதில் கேமரா ஸ்கேனர், ஆஃப்லைன் BAMINI மாற்றகம் மற்றும் DOCX சேமிப்பகம் அடங்கும்.
                </p>
              </div>

              <div className="bg-[#090D14] border border-white/10 p-3 font-mono text-[11px] text-gray-300 space-y-1">
                <div className="text-blue-400 font-bold">📂 Tamify_Android_Native_Suite.zip உள்ளடக்கம்:</div>
                <div className="pl-3 text-gray-400">├── app/src/main/java/com/tamify/ocr/MainActivity.kt (Jetpack Compose UI)</div>
                <div className="pl-3 text-gray-400">├── app/src/main/java/com/tamify/ocr/TamilUnicodeEngine.kt (Pure Kotlin BAMINI/TSCII Engine)</div>
                <div className="pl-3 text-gray-400">├── app/src/main/AndroidManifest.xml (CameraX & Storage permissions)</div>
                <div className="pl-3 text-gray-400">├── build.gradle.kts & settings.gradle.kts (Android Gradle 8.8)</div>
                <div className="pl-3 text-gray-400">└── README_ANDROID.md (APK compile instructions)</div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDownloadAndroidZip}
                  disabled={downloadingZip}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 text-xs tracking-wider transition-colors cursor-pointer shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>{downloadingZip ? 'தயாராகிறது...' : 'புதுப்பிக்கப்பட்ட Android Project (.ZIP) பதிவிறக்கு'}</span>
                </button>
              </div>

              {/* Troubleshooting "Incompatible Gradle JVM version" and "Module not specified" */}
              <div className="p-4 bg-amber-950/30 border border-amber-500/40 rounded-none space-y-2.5 text-xs">
                <div className="font-bold text-amber-300 flex items-center gap-2">
                  <span>⚠️ Android Studio "Incompatible Gradle JVM version" தீர்வு:</span>
                </div>
                <div className="text-gray-300 space-y-2 leading-relaxed text-[11px]">
                  <div className="bg-black/40 p-2.5 border border-amber-500/30">
                    <p className="font-semibold text-white mb-1">⚡ எளிய 1-கிளிக் தீர்வு (1-Click Quick Fix):</p>
                    <p>
                      உங்கள் திரையில் தோன்றும் நீல நிற லிங்க் <strong className="text-blue-400 underline">"Apply compatible Gradle JDK configuration and sync"</strong> அல்லது <strong className="text-blue-400 underline">"Change Gradle JDK configuration"</strong> என்பதைக் கிளிக் செய்யவும். Android Studio தானாகவே சரியான JDK 17/21 ஐ அமைத்து Sync செய்துவிடும்!
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-200">கைமுறையாக மாற்ற (Manual Fix in Settings):</p>
                    <p>
                      1. Android Studio-வில் <strong className="text-white">File ➔ Settings</strong> (Mac: <strong className="text-white">Android Studio ➔ Settings</strong>) திறக்கவும்.
                    </p>
                    <p>
                      2. <strong className="text-white">Build, Execution, Deployment ➔ Build Tools ➔ Gradle</strong> செல்லவும்.
                    </p>
                    <p>
                      3. <strong className="text-amber-200">Gradle JDK</strong> டிராப்டவுனில் <strong className="text-emerald-400">"Embedded JDK (version 17 / jbr-17)"</strong> அல்லது உங்கள் கணினியில் உள்ள JDK 17/21 ஐத் தேர்ந்தெடுக்கவும்.
                    </p>
                    <p>
                      4. <strong className="text-white">Apply</strong> கொடுத்து விட்டு, <strong className="text-white">Sync Project with Gradle Files</strong> (🐘 ஐகான்) கிளிக் செய்யவும்.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#0A0E17] border border-white/10 text-xs text-gray-400 space-y-1">
                <div className="font-bold text-gray-200">🛠️ APK உருவாக்குவது எப்படி:</div>
                <p>1. பதிவிறக்கிய ZIP கோப்பை அன்சிப் (Unzip) செய்யவும்.</p>
                <p>2. <strong className="text-white">Android Studio</strong>-ல் திறந்து <strong className="text-white">Build &gt; Build APK(s)</strong> கொடுக்கவும்.</p>
                <p>3. அல்லது டெர்மினலில் <code className="text-blue-300 bg-black/40 px-1 py-0.5">./gradlew assembleDebug</code> இயக்கவும்.</p>
              </div>
            </div>
          )}

          {/* TAB 3: Interactive Mobile View Mode */}
          {activeSubTab === 'guide' && (
            <div className="space-y-4">
              <div className="bg-[#111622] border border-blue-500/20 p-4 space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-400" />
                  போன் திரையில் நேரடியாகப் பரிசோதிக்க (Simulate Mobile View)
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  உங்கள் கணினித் திரையிலேயே ஆண்ட்ராய்டு மொபைல் ஆப் இடைமுகத்தை இயக்கி கேமரா ஸ்கேன், BAMINI மாற்றகம் மற்றும் WhatsApp பகிர்வை சோதித்துப் பார்க்கலாம்.
                </p>
              </div>

              <button
                onClick={() => {
                  onClose();
                  if (onLaunchMobileView) {
                    onLaunchMobileView();
                  }
                }}
                className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-black font-extrabold py-3 px-4 text-xs tracking-wider transition-colors cursor-pointer shadow-md"
              >
                <Smartphone className="w-4 h-4" />
                <span>மொபைல் காட்சியைத் தொடங்கு (Launch Mobile Screen)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-[#0B0F17] flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Android 8.0+ / Chrome / Samsung Internet Compatible
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1E293B] hover:bg-[#334155] text-white transition-colors cursor-pointer text-xs"
          >
            மூடு (Close)
          </button>
        </div>

      </div>
    </div>
  );
};
