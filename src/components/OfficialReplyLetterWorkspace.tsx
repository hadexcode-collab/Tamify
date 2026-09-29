import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Copy,
  Check,
  Printer,
  Sparkles,
  UploadCloud,
  RefreshCw,
  Edit3,
  Eye,
  Building,
  Calendar,
  Hash,
  User,
  Users,
  CheckCircle2,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2
} from 'lucide-react';
import { OfficialReplyLetterData, ReplyToneType } from '../types';
import { generateOfficialReplyLetterDocx } from '../lib/docxGenerator';

interface OfficialReplyLetterWorkspaceProps {
  initialPdfFile?: File | null;
}

// Built-in Realistic Tamil Official Incoming Letters
const SAMPLE_INCOMING_LETTERS = [
  {
    id: 'sample-hm-inmai-model',
    title: 'மாதிரி கடிதம்: HM ➔ DEO (ஓய்வு இன்மை அறிக்கை)',
    department: 'பள்ளிக் கல்வித் துறை',
    date: '17-03-2026',
    refNo: 'ந.க எண்: 2199/அ1/2026',
    from: 'மாவட்டக் கல்வி அலுவலர் (இடைநிலை),\nமாவட்டக் கல்வி அலுவலகம்,\nகடலூர்.',
    to: 'தலைமை ஆசிரியர்,\nஅரசு மேல்நிலைப்பள்ளி,\nமஞ்சக்குப்பம், கடலூர்.',
    subject: 'கடலூர் கல்வி மாவட்டம் - மஞ்சக்குப்பம், அரசு மேல்நிலைப்பள்ளியில் 31.05.2026 வரை ஓய்வு பெறவுள்ள தலைமையாசிரியரின் இன்மை அறிக்கை அனுப்புதல் - சார்பு.',
    reference: 'மாவட்டக் கல்வி அலுவலரின் கடித ந.க எண்: 2199/அ1/2026 நாள்: 17-03-2026.',
    content: `கடலூர் கல்வி மாவட்டத்தில் அரசு / அரசு உதவி பெறும் பள்ளிகளில் 31.05.2026 வரை ஓய்வு பெறவுள்ள தலைமை ஆசிரியர்கள் குறித்த விவரங்கள் மற்றும் இன்மை அறிக்கையினை உடன் இவ்வலுவலகத்திற்கு அனுப்பி வைக்குமாறு அனைத்துப் பள்ளித் தலைமையாசிரியர்கள் கேட்டுக் கொள்ளப்படுகிறார்கள்.

(ஒம்)/- அ.இஸ்மாயில்
மாவட்டக் கல்வி அலுவலர் (இடைநிலை),
கடலூர்.`
  },
  {
    id: 'sample-deo-to-hms-breakfast',
    title: 'DEO கடலூர் ➔ பள்ளி தலைமையாசிரியர்கள் (காலை உணவு திட்டம்)',
    department: 'பள்ளிக் கல்வித் துறை',
    date: '28.08.2026',
    refNo: 'ந.க.எண். 7479/ஆ2/2025',
    from: 'மாவட்டக் கல்வி அலுவலர் (இடைநிலை),\nமாவட்டக் கல்வி அலுவலகம்,\nகடலூர்.',
    to: 'அனைத்து வகை அரசு / அரசு நிதிஉதவி பெறும் பள்ளித் தலைமையாசிரியர்கள்,\nகடலூர் கல்வி மாவட்டம்.',
    subject: 'பள்ளிக் கல்வித் துறை – பெருந்தலைவர் காமராஜர் காலை உணவுத் திட்டம் விரிவாக்கம் – 2026-2027 - அரசு / அரசு உதவி பெறும் உயர் / மேல்நிலைப் பள்ளிகளில் 6 முதல் 8-ம் வகுப்புகள் வரை பயிலும் மாணவர்களுக்கும் காலை உணவுத் திட்டம் வழங்குதல் - மாணவர்களின் எண்ணிக்கையினை EMIS-ல் உள்ளவாறு ஒத்திசைவு செய்து அனுப்பக் கோருதல் – தொடர்பாக.',
    reference: '1. கடலூர் மாவட்ட ஆட்சியரின் கடித ந.க.எண். அ2/134/2026, நாள்: 07.08.2026.\n2. கடலூர் மாவட்ட முதன்மைக் கல்வி அலுவலரின் செயல்முறைகள் ந.க.எண். 6694/ஆ6/2026, நாள்: 28.08.2026.',
    content: `பார்வையில் கண்டுள்ள கடலூர் மாவட்ட ஆட்சித் தலைவர் மற்றும் கடலூர் மாவட்ட முதன்மைக் கல்வி அலுவலரின் செயல்முறைகளின்படி, கடலூர் கல்வி மாவட்டத்தில் அரசு / அரசு உதவி பெறும் உயர் / மேல்நிலைப் பள்ளிகளில் பெருந்தலைவர் காமராஜர் காலை உணவுத் திட்டத்தினை 17.09.2026 முதல் செயல்படுத்திட உள்ளதாக தெரிவிக்கப்பட்டுள்ளது.

எனவே, தங்கள் பள்ளியில் 1 முதல் 8-ஆம் வகுப்பு வரை பயிலும் மாணவர்களின் எண்ணிக்கை விவரத்தினை EMIS-ல் உள்ள எண்ணிக்கையுடன் ஒத்திசைவு செய்து இணைப்பில் காணும் படிவத்தில் பூர்த்தி செய்து அதற்கான ஆதாரமாக EMIS இணையதளத்தில் மாணவர்களின் எண்ணிக்கையினை பதிவிறக்கம் செய்து அதில் தலைமையாசிரியர் கையொப்பமிட்டு, பூர்த்தி செய்யப்பட்ட படிவத்துடன் இணைத்து நாளை 29.08.2026 காலை 10.00 மணிக்குள் இவ்வலுவலகத்தில் ஒப்படைக்குமாறு அனைத்து வகை அரசு / அரசு உதவி பெறும் உயர் / மேல்நிலைப் பள்ளித் தலைமையாசிரியர்கள் / தாளாளர்கள் கேட்டுக் கொள்ளப்படுகிறார்கள்.

இணைப்பு :
1. முதன்மைக் கல்வி அலுவலரின் செயல்முறைகள்
2. படிவம்
3. மாணவர்களின் எண்ணிக்கை விவரம்

(ஒம்)/- அ.இஸ்மாயில்
மாவட்டக் கல்வி அலுவலர்,
(இடைநிலை), கடலூர்.

பெறுநர்:
அனைத்து வகை அரசு / அரசு நிதிஉதவி பெறும் பள்ளித் தலைமையாசிரியர்கள்,
கடலூர் கல்வி மாவட்டம்.`
  },
  {
    id: 'sample-quiz-competition',
    title: 'மாவட்ட ஆட்சியரகம் • வினாடி வினா போட்டி (Quiz Competition)',
    department: 'பள்ளிக் கல்வித் துறை',
    date: '24.08.2026',
    refNo: '7429/அ6/2026',
    from: 'மாவட்ட ஆட்சியர் அவர்களின் நேர்முக உதவியாளர் (கல்வி),\nமாவட்ட ஆட்சியரகம்,\nகடலூர் மாவட்டம்.',
    to: 'மாவட்ட முதன்மைக் கல்வி அலுவலர்,\nமாவட்ட முதன்மைக் கல்வி அலுவலகம்,\nகடலூர் – 607 001.',
    subject: 'பள்ளிக் கல்வி – 2026-ஆம் ஆண்டு தமிழ்நாடு தினத்தை முன்னிட்டு உயர்நிலை மற்றும் மேல்நிலைப் பள்ளி மாணவர்களுக்கான வினாடி வினா போட்டி நடத்துதல் – முன்னேற்பாடு விவரங்கள் கோருதல் – தொடர்பாக.',
    reference: '1. அரசாணை (நிலை) எண் 142, பள்ளிக் கல்வித் (பக1) துறை, நாள் 12.06.2025.\n2. பள்ளிக் கல்வி இயக்குநர் அவர்களின் செயல்முறைகள் ந.க.எண் 31802/எம்1/2026, நாள் 18.08.2026.',
    content: `பார்வையில் குறிப்பிடப்பட்டுள்ள அரசாணை மற்றும் பள்ளிக் கல்வி இயக்குநரின் செயல்முறைகளின்படி, கடலூர் மாவட்டத்தில் உள்ள அனைத்து அரசு, அரசு உதவிபெறும் உயர்நிலை மற்றும் மேல்நிலைப் பள்ளி மாணவர்களுக்கு தமிழ்நாடு தினத்தை முன்னிட்டு மாவட்ட அளவிலான வினாடி வினா போட்டிகள் நடத்திட உத்தேசிக்கப்பட்டுள்ளது.

இப்போட்டிகள் வட்டார அளவில் மற்றும் மாவட்ட அளவில் நடத்தப்பட்டு தகுதி பெறும் மாணவர்களுக்கு சான்றிதழ்களும் பரிசுகளும் வழங்கப்படும். 

எனவே, இப்போட்டிகளை நடத்துவதற்கு தேவையான தேர்வு மையங்கள், ஒருங்கிணைப்பாளர் அலுவலர்கள், மாதிரி வினாத்தாள்கள் தயாரிப்பு மற்றும் உத்தேச கால அட்டவணை குறித்த விரிவான திட்ட அறிக்கையினை 28.08.2026-க்குள் இவ்வலுவலகத்திற்கு அனுப்பி வைக்குமாறு கேட்டுக்கொள்ளப்படுகிறது.`
  },
  {
    id: 'sample-patta-appeal',
    title: 'வருவாய்த் துறை • பட்டா மாறுதல் மனு (Patta Appeal)',
    department: 'வருவாய்த் துறை',
    date: '16.08.2026',
    refNo: 'மனு எண்: 2026/09/24/71802',
    from: 'திரு. மா. செல்வராஜ் (மனுதாரர்),\nகதவு எண்: 14/2, காமராஜர் தெரு,\nபண்ருட்டி வட்டம், கடலூர் மாவட்டம்.',
    to: 'வட்டாட்சியர் அவர்கள்,\nவட்டாட்சியர் அலுவலகம்,\nபண்ருட்டி வட்டம், கடலூர் மாவட்டம்.',
    subject: 'நில அளவை மற்றும் பட்டா மாறுதல் – பண்ருட்டி வட்டம், காடாம்புலியூர் கிராமம், புல எண் 142/3-ல் உள்ள 2400 ச.அடி நிலத்திற்கு தனிப்பட்டா வழங்குதல் – கோரிக்கை மனு.',
    reference: '1. மனுதாரரின் இணையவழி விண்ணப்ப எண்: TN2026081042, நாள் 10.08.2026.',
    content: `மேற்படி முகவரியில் வசித்து வரும் நான் காடாம்புலியூர் கிராமத்தில் உள்ள எனது பூர்வீக நிலமான புல எண் 142/3-ல் 2400 சதுர அடி நிலத்தில் நீண்ட காலமாக வசித்து வருகிறேன். மேற்படி நிலத்திற்கு கூட்டுப் பட்டா மட்டுமே உள்ளது.

நான் மேற்கண்ட நிலத்திற்கான கிரைய ஆவணம், வில்லங்கச் சான்று மற்றும் வரி ரசீதுகளை இணைத்து இணையவழியாக தனிப்பட்டா கோரி விண்ணப்பித்துள்ளேன்.

எனவே, தயவுகூர்ந்து கிராம நிர்வாக அலுவலர் மற்றும் நில அளவையர் மூலம் களஆய்வு செய்து எனக்கு உரிய தனிப்பட்டா வழங்கிட ஆணை பிறப்பிக்குமாறு பணிவுடன் வேண்டுகிறேன்.`
  },
  {
    id: 'sample-water-inspection',
    title: 'ஊரக வளர்ச்சித் துறை • குடிநீர் திட்டம் (Rural Water Supply)',
    department: 'ஊரக வளர்ச்சி மற்றும் ஊராட்சித் துறை',
    date: '19.08.2026',
    refNo: 'ந.க.எண் 4190/வ2/2026',
    from: 'திட்ட இயக்குநர்,\nமாவட்ட ஊரக வளர்ச்சி முகமை,\nவிழுப்புரம் மாவட்டம்.',
    to: 'வட்டார வளர்ச்சி அலுவலர் (கி.ஊ),\nவட்டார வளர்ச்சி அலுவலகம்,\nசெஞ்சி வட்டம்.',
    subject: 'ஜல் ஜீவன் இயக்கம் – கிராமப்புற அனைத்து வீடுகளுக்கும் குடிநீர் இணைப்புகள் வழங்கும் திட்டம் – ஆய்வு மேற்கொண்டு அறிக்கை சமர்ப்பித்தல் – தொடர்பாக.',
    reference: '1. அரசாணை (நிலை) எண் 89, ஊரக வளர்ச்சித் துறை, நாள் 05.04.2026.',
    content: `செஞ்சி ஊராட்சி ஒன்றியத்திற்குட்பட்ட அனைத்து கிராம ஊராட்சிகளிலும் ஜல் ஜீவன் இயக்கத்தின் கீழ் தனி நபர் இல்லக் குடிநீர் இணைப்புகள் வழங்கும் பணிகள் நடைபெற்று வருகின்றன.

இப்பணிகளில் சில ஊராட்சிகளில் குழாய் பதிக்கும் பணிகள் நிறைவடையாமல் உள்ளதாக பொதுமக்கள் குறைதீர்க்கும் நாள் கூட்டத்தில் மனுக்கள் பெறப்பட்டுள்ளன.

எனவே, அனைத்து பணிகளையும் நேரில் களஆய்வு செய்து, குடிநீர் விநியோகம் சீராக உள்ளதை உறுதிசெய்து, முழுமையான நடவடிக்கை அறிக்கையினை இவ்வலுவலகத்திற்கு உடன் அனுப்பி வைக்குமாறு அறிவுறுத்தப்படுகிறது.`
  }
];

export const OfficialReplyLetterWorkspace: React.FC<OfficialReplyLetterWorkspaceProps> = ({
  initialPdfFile
}) => {
  const [incomingLetterText, setIncomingLetterText] = useState<string>(SAMPLE_INCOMING_LETTERS[0].content);
  const [selectedSampleId, setSelectedSampleId] = useState<string>('sample-hm-inmai-model');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(initialPdfFile ? initialPdfFile.name : null);
  const [isExtractingFile, setIsExtractingFile] = useState<boolean>(false);
  const [isDraftingReply, setIsDraftingReply] = useState<boolean>(false);
  const [replyTone, setReplyTone] = useState<ReplyToneType>('ACTION_TAKEN');
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isDownloadingDocx, setIsDownloadingDocx] = useState<boolean>(false);
  const [activeTabMode, setActiveTabMode] = useState<'preview' | 'edit'>('preview');
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);

  // The structured reply letter state initialized with the HM-to-DEO model letter format
  const [replyLetter, setReplyLetter] = useState<OfficialReplyLetterData>({
    letterheadGov: '',
    letterheadDept: '',
    letterheadOffice: '',
    letterRefNumber: '49/2026',
    letterDate: '17-03-2026',
    fromPersonName: 'திருமதி. போ. செந்தாமரைச்செல்வி',
    fromDesignation: 'தலைமை ஆசிரியர்,',
    fromDepartment: 'அரசு மேல்நிலைப்பள்ளி,',
    fromPlace: 'மஞ்சக்குப்பம்\nகடலூர்.',
    toDesignation: 'மாவட்டக் கல்வி அலுவலர் (இ.நி)',
    toDepartment: 'மாவட்டக் கல்வி அலுவலகம்',
    toPlace: 'கடலூர்.',
    salutation: 'ஐயா,',
    subject: 'கடலூர் கல்வி மாவட்டம் - மஞ்சக்குப்பம், அரசு மேல்நிலைப்பள்ளியில் 31.05.2026 வரை ஓய்வு பெறவுள்ள தலைமையாசிரியரின் இன்மை அறிக்கை அனுப்புதல் - சார்பு.',
    references: [
      'மாவட்டக் கல்வி அலுவலரின் கடித ந.க எண்: 2199/அ1/2026 நாள்: 17-03-2026.'
    ],
    bodyParagraphs: [
      'மஞ்சக்குப்பம், அரசு மேல்நிலைப்பள்ளியில் 31.05.2026 வரை ஓய்வுபெறவுள்ள தலைமையாசிரியரின் இன்மை அறிக்கை இத்துடன் இணைக்கப்பட்டு தங்களுக்கு பணிவுடன் அனுப்பி வைக்கப்படுகிறது.'
    ],
    closing: '',
    signatoryName: '',
    signatoryDesignation: 'தலைமை ஆசிரியர்',
    enclosures: [
      'இன்மை அறிக்கை'
    ],
    copyTo: [],
    fontFamily: 'Tau-marutham',
    fontSizePt: 12,
    formatStyle: 'HM_TO_DEO_MODEL'
  });

  // Handle uploaded file (PDF / Image)
  const handleFileUpload = async (file: File) => {
    setUploadedFileName(file.name);
    setIsExtractingFile(true);

    try {
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const base64Data = btoa(
          new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );

        // Send to backend OCR ensemble
        const res = await fetch('/api/ocr-ensemble', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType: 'application/pdf',
            requestedEncoding: 'AUTO_DETECT',
            userHint: file.name,
            targetLanguage: 'tam'
          })
        });

        if (res.ok) {
          const data = await res.json();
          const extracted = data.fullUnicodeText || '';
          setIncomingLetterText(extracted);
          // Automatically trigger reply generation
          await generateReplyDraft(extracted, data.metadata);
        } else {
          // Fallback reading
          setIncomingLetterText(`[PDF கோப்பு பெறப்பட்டது: ${file.name}]\nஅதிகாரப்பூர்வ கடித உரை பகுப்பாய்வு செய்யப்படுகிறது...`);
          await generateReplyDraft(`கடிதம்: ${file.name}\nநாள்: ${new Date().toLocaleDateString()}`);
        }
      } else if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const b64 = (e.target?.result as string)?.split(',')[1];
          if (b64) {
            const res = await fetch('/api/ocr-ensemble', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                imageBase64: b64,
                mimeType: file.type,
                requestedEncoding: 'AUTO_DETECT',
                userHint: file.name,
                targetLanguage: 'tam'
              })
            });
            if (res.ok) {
              const data = await res.json();
              setIncomingLetterText(data.fullUnicodeText || '');
              await generateReplyDraft(data.fullUnicodeText || '', data.metadata);
            }
          }
        };
        reader.readAsDataURL(file);
      } else {
        const text = await file.text();
        setIncomingLetterText(text);
        await generateReplyDraft(text);
      }
    } catch (err: any) {
      console.warn('PDF extraction failed, drafting with filename:', err);
      await generateReplyDraft(`கடிதம்: ${file.name}`);
    } finally {
      setIsExtractingFile(false);
    }
  };

  // Draft reply using backend endpoint (Gemini or Deterministic Tamil Engine)
  const generateReplyDraft = async (
    textToAnalyze: string = incomingLetterText,
    metadata: any = {}
  ) => {
    setIsDraftingReply(true);
    try {
      const res = await fetch('/api/draft-reply-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incomingText: textToAnalyze,
          incomingMetadata: metadata,
          replyTone,
          customInstructions,
          officeName: replyLetter.letterheadOffice,
          signatoryName: replyLetter.signatoryName,
          signatoryDesignation: replyLetter.signatoryDesignation
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.replyLetter) {
          setReplyLetter({
            ...data.replyLetter,
            fontFamily: 'Tau-marutham',
            fontSizePt: 12
          });
        }
      }
    } catch (err: any) {
      console.warn('Draft reply API failed, updating locally:', err);
    } finally {
      setIsDraftingReply(false);
    }
  };

  // Switch to one of the built-in sample letters
  const handleSelectSample = (sampleId: string) => {
    const sample = SAMPLE_INCOMING_LETTERS.find((s) => s.id === sampleId);
    if (!sample) return;
    setSelectedSampleId(sampleId);
    setUploadedFileName(null);
    setIncomingLetterText(sample.content);

    // Update reply letter tailored to the sample
    if (sampleId === 'sample-hm-inmai-model') {
      setReplyLetter({
        letterheadGov: '',
        letterheadDept: '',
        letterheadOffice: '',
        letterRefNumber: '49/2026',
        letterDate: '17-03-2026',
        fromPersonName: 'திருமதி. போ. செந்தாமரைச்செல்வி',
        fromDesignation: 'தலைமை ஆசிரியர்,',
        fromDepartment: 'அரசு மேல்நிலைப்பள்ளி,',
        fromPlace: 'மஞ்சக்குப்பம்\nகடலூர்.',
        toDesignation: 'மாவட்டக் கல்வி அலுவலர் (இ.நி)',
        toDepartment: 'மாவட்டக் கல்வி அலுவலகம்',
        toPlace: 'கடலூர்.',
        salutation: 'ஐயா,',
        subject: 'கடலூர் கல்வி மாவட்டம் - மஞ்சக்குப்பம், அரசு மேல்நிலைப்பள்ளியில் 31.05.2026 வரை ஓய்வு பெறவுள்ள தலைமையாசிரியரின் இன்மை அறிக்கை அனுப்புதல் - சார்பு.',
        references: [
          'மாவட்டக் கல்வி அலுவலரின் கடித ந.க எண்: 2199/அ1/2026 நாள்: 17-03-2026.'
        ],
        bodyParagraphs: [
          'மஞ்சக்குப்பம், அரசு மேல்நிலைப்பள்ளியில் 31.05.2026 வரை ஓய்வுபெறவுள்ள தலைமையாசிரியரின் இன்மை அறிக்கை இத்துடன் இணைக்கப்பட்டு தங்களுக்கு பணிவுடன் அனுப்பி வைக்கப்படுகிறது.'
        ],
        closing: '',
        signatoryName: '',
        signatoryDesignation: 'தலைமை ஆசிரியர்',
        enclosures: [
          'இன்மை அறிக்கை'
        ],
        copyTo: [],
        fontFamily: 'Tau-marutham',
        fontSizePt: 12,
        formatStyle: 'HM_TO_DEO_MODEL'
      });
    } else if (sampleId === 'sample-deo-to-hms-breakfast') {
      setReplyLetter({
        letterheadGov: '',
        letterheadDept: '',
        letterheadOffice: '',
        letterRefNumber: '49/2026',
        letterDate: '29-08-2026',
        fromPersonName: 'திருமதி. போ. செந்தாமரைச்செல்வி, எம்.ஏ., பி.எட்.,',
        fromDesignation: 'தலைமை ஆசிரியர்,',
        fromDepartment: 'அரசு மேல்நிலைப்பள்ளி,',
        fromPlace: 'மஞ்சக்குப்பம்,\nகடலூர்.',
        toDesignation: 'மாவட்டக் கல்வி அலுவலர் (இ.நி),',
        toDepartment: 'மாவட்டக் கல்வி அலுவலகம்,',
        toPlace: 'கடலூர்.',
        salutation: 'ஐயா,',
        subject: 'கடலூர் கல்வி மாவட்டம் - மஞ்சக்குப்பம், அரசு மேல்நிலைப்பள்ளியில் பெருந்தலைவர் காமராஜர் காலை உணவுத் திட்டம் விரிவாக்கம் – 6 முதல் 8-ஆம் வகுப்புகள் வரை பயிலும் மாணவர்களின் எண்ணிக்கையினை EMIS-ல் உள்ளவாறு ஒத்திசைவு செய்து அறிக்கை சமர்ப்பித்தல் - சார்பு.',
        references: [
          `1. மாவட்டக் கல்வி அலுவலரின் கடித ந.க எண்: 7479/ஆ2/2025 நாள்: 28.08.2026.`
        ],
        bodyParagraphs: [
          'மஞ்சக்குப்பம், அரசு மேல்நிலைப்பள்ளியில் 6 முதல் 8-ஆம் வகுப்பு வரை பயிலும் மாணவ / மாணவியரின் எண்ணிக்கை விவரங்கள் EMIS இணையதளத்தில் உள்ளவாறு முழுமையாக ஒத்திசைவு செய்யப்பட்டு, பூர்த்தி செய்யப்பட்ட படிவம் மற்றும் தலைமையாசிரியரால் கையொப்பமிடப்பட்ட EMIS மாணவர் எண்ணிக்கை பதிவிறக்க ஆதார நகல் இத்துடன் இணைக்கப்பட்டு தங்களுக்கு பணிவுடன் அனுப்பி வைக்கப்படுகிறது.'
        ],
        closing: '',
        signatoryName: '',
        signatoryDesignation: 'தலைமை ஆசிரியர்',
        enclosures: [
          '1. பூர்த்தி செய்யப்பட்ட படிவம்.',
          '2. தலைமையாசிரியர் சான்றொப்பமிட்ட EMIS மாணவர் எண்ணிக்கை பதிவிறக்க நகல்.'
        ],
        copyTo: [],
        fontFamily: 'Tau-marutham',
        fontSizePt: 12,
        formatStyle: 'HM_TO_DEO_MODEL'
      });
    } else if (sampleId === 'sample-quiz-competition') {
      setReplyLetter({
        letterheadGov: 'தமிழ்நாடு அரசு',
        letterheadDept: 'பள்ளிக் கல்வித் துறை',
        letterheadOffice: 'மாவட்ட முதன்மைக் கல்வி அலுவலர் அலுவலகம், கடலூர்',
        letterRefNumber: `8140/அ2/${new Date().getFullYear()}`,
        letterDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.'),
        fromDesignation: 'முதன்மைக் கல்வி அலுவலர்,',
        fromDepartment: 'மாவட்ட முதன்மைக் கல்வி அலுவலகம்,',
        fromPlace: 'கடலூர் – 607 001.',
        toDesignation: 'மாவட்ட ஆட்சியர் அவர்களின் நேர்முக உதவியாளர் (கல்வி),',
        toDepartment: 'மாவட்ட ஆட்சியரகம்,',
        toPlace: 'கடலூர் மாவட்டம்.',
        salutation: 'மதிப்புடையீர்,',
        subject: 'பள்ளிக் கல்வி – 2026-ஆம் ஆண்டு தமிழ்நாடு தின வினாடி வினா போட்டி நடத்துதல் – முன்னேற்பாடுகள் மற்றும் தேர்வு மைய விவரங்கள் சமர்ப்பித்தல் – தொடர்பாக.',
        references: [
          `1. தங்களின் கடித ந.க.எண் ${sample.refNo}, நாள் ${sample.date}.`,
          '2. அரசாணை (நிலை) எண் 142, பள்ளிக் கல்வித் (பக1) துறை, நாள் 12.06.2025.'
        ],
        bodyParagraphs: [
          'பார்வையில் குறிப்பிடப்பட்டுள்ள தங்களின் கடிதம் பெறப்பட்டு கவனமுடன் பரிசீலிக்கப்பட்டது. தமிழ்நாடு தினத்தை முன்னிட்டு மாவட்டத்தில் உள்ள அரசு மற்றும் அரசு உதவிபெறும் உயர்நிலை / மேல்நிலைப் பள்ளி மாணவர்களுக்கான வினாடி வினா போட்டிகள் நடத்துவது குறித்த முன்னேற்பாடுகள் துரிதமாக மேற்கொள்ளப்பட்டுள்ளன.',
          'கடலூர் மாவட்டத்தில் உள்ள 9 வட்டாரங்களிலும் வட்டார அளவிலான வினாடி வினா போட்டிகள் நடத்தப்பட்டு, அதில் முதலிடம் பெறும் 3 அணிகள் மாவட்ட அளவிலான இறுதிப் போட்டியில் பங்கேற்க உரிய மையங்கள் தெரிவு செய்யப்பட்டுள்ளன. இப்போட்டிகளை நேர்த்தியாக நடத்துவதற்கு வட்டார கல்வி அலுவலர்கள் ஒருங்கிணைப்பாளர்களாக நியமிக்கப்பட்டுள்ளனர்.',
          'எனவே, போட்டி நடைபெறும் மையங்கள், தேர்வு செய்யப்பட்ட ஆசிரிய ஒருங்கிணைப்பாளர்கள் மற்றும் உத்தேச கால அட்டவணை அடங்கிய விரிவான நடவடிக்கை அறிக்கை இத்துடன் இணைத்து அன்புடன் சமர்ப்பிக்கப்படுகிறது.'
        ],
        closing: 'தங்கள் உண்மையுள்ள,',
        signatoryName: 'முனைவர் இரா. சண்முகம்',
        signatoryDesignation: 'முதன்மைக் கல்வி அலுவலர், கடலூர்.',
        enclosures: [
          '1. தேர்வு மையங்கள் மற்றும் ஒருங்கிணைப்பாளர்கள் பட்டியல்.',
          '2. உத்தேச வினாடி வினா கால அட்டவணை நகல்.'
        ],
        copyTo: [
          '1. மாவட்ட ஆட்சித் தலைவர் அவர்கள், கடலூர் (தகவலுக்காக அன்புடன் சமர்ப்பிக்கப்படுகிறது).',
          '2. இயக்குநர், பள்ளிக் கல்வி இயக்ககம், சென்னை – 06.',
          '3. அலுவலகக் கோப்பு / இருப்புக்கோப்பு.'
        ],
        fontFamily: 'TAU-Marutham',
        fontSizePt: 12
      });
    } else if (sampleId === 'sample-patta-appeal') {
      setReplyLetter({
        letterheadGov: 'தமிழ்நாடு அரசு',
        letterheadDept: 'வருவாய்த் துறை',
        letterheadOffice: 'வட்டாட்சியர் அலுவலகம், பண்ருட்டி வட்டம்',
        letterRefNumber: `ந.க.எண் 3184/அ4/${new Date().getFullYear()}`,
        letterDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.'),
        fromDesignation: 'வட்டாட்சியர்,',
        fromDepartment: 'வட்டாட்சியர் அலுவலகம்,',
        fromPlace: 'பண்ருட்டி வட்டம் – 607 106.',
        toDesignation: 'திரு. மா. செல்வராஜ்,',
        toDepartment: 'கதவு எண்: 14/2, காமராஜர் தெரு,',
        toPlace: 'காடாம்புலியூர், பண்ருட்டி வட்டம்.',
        salutation: 'ஐயா,',
        subject: 'நில அளவை மற்றும் பட்டா மாறுதல் – காடாம்புலியூர் கிராமம், புல எண் 142/3-ல் உள்ள நிலத்திற்கு தனிப்பட்டா கோரிய மனு – களஆய்வு மற்றும் தீர்வு விவரம் தெரிவித்தல் – தொடர்பாக.',
        references: [
          `1. தங்களின் மனு எண்: 2026/09/24/71802, நாள் ${sample.date}.`,
          '2. காடாம்புலியூர் கிராம நிர்வாக அலுவலர் மற்றும் நில அளவையர் களஆய்வு அறிக்கை, நாள் 26.08.2026.'
        ],
        bodyParagraphs: [
          'பார்வை (1)-ல் உள்ள தங்களின் மனுவில் கோரப்பட்டிருந்தவாறு, பண்ருட்டி வட்டம், காடாம்புலியூர் கிராமம், புல எண் 142/3-ல் உள்ள 2400 சதுர அடி நிலத்தில் தனிப்பட்டா வழங்குவது குறித்து சம்பந்தப்பட்ட மண்டல துணை வட்டாட்சியர் மற்றும் நில அளவையர் மூலம் நேரடி களஆய்வு மேற்கொள்ளப்பட்டது.',
          'மேற்படி களஆய்வில் சமர்ப்பிக்கப்பட்ட ஆவணங்கள் மற்றும் வில்லங்கச் சான்றுகள் ஆய்வு செய்யப்பட்டு, எவ்வித ஆட்சேபனையும் இன்றி எல்லைகள் அளவீடு செய்யப்பட்டன. இதனைத் தொடர்ந்து தமிழ்நாடு அரசு இணையவழி பட்டா மாறுதல் விதிகளின்படி தங்களின் பெயரில் புதிய தனிப்பட்டா (பட்டா எண்: 1842) ஒப்புதல் வழங்கப்பட்டு ஆணை பிறப்பிக்கப்பட்டுள்ளது.',
          'எனவே, ஒப்புதல் அளிக்கப்பட்ட புதிய இணையவழி பட்டா நகல் இத்துடன் இணைத்து தங்களுக்கு அனுப்பி வைக்கப்படுகிறது என்ற விவரம் அன்புடன் தெரிவிக்கப்படுகிறது.'
        ],
        closing: 'தங்கள் உண்மையுள்ள,',
        signatoryName: 'கே. சிவக்குமார்',
        signatoryDesignation: 'வட்டாட்சியர், பண்ருட்டி வட்டம்.',
        enclosures: [
          '1. புதிய தனிப்பட்டா (பட்டா எண்: 1842) கணினி சான்றொப்ப நகல்.'
        ],
        copyTo: [
          '1. வருவாய் கோட்டாட்சியர் அவர்கள், கடலூர் (தகவலுக்காக).',
          '2. கிராம நிர்வாக அலுவலர், காடாம்புலியூர் கிராமம்.',
          '3. அலுவலகக் கோப்பு.'
        ],
        fontFamily: 'TAU-Marutham',
        fontSizePt: 12
      });
    } else if (sampleId === 'sample-water-inspection') {
      setReplyLetter({
        letterheadGov: 'தமிழ்நாடு அரசு',
        letterheadDept: 'ஊரக வளர்ச்சி மற்றும் ஊராட்சித் துறை',
        letterheadOffice: 'வட்டார வளர்ச்சி அலுவலகம் (கி.ஊ), செஞ்சி',
        letterRefNumber: `ந.க.எண் 5214/ஊ2/${new Date().getFullYear()}`,
        letterDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.'),
        fromDesignation: 'வட்டார வளர்ச்சி அலுவலர் (கிராம ஊராட்சிகள்),',
        fromDepartment: 'வட்டார வளர்ச்சி அலுவலகம்,',
        fromPlace: 'செஞ்சி – 604 202.',
        toDesignation: 'திட்ட இயக்குநர்,',
        toDepartment: 'மாவட்ட ஊரக வளர்ச்சி முகமை,',
        toPlace: 'விழுப்புரம் மாவட்டம்.',
        salutation: 'மதிப்புடையீர்,',
        subject: 'ஜல் ஜீவன் இயக்கம் – கிராமப்புற அனைத்து வீடுகளுக்கும் குடிநீர் குழாய் இணைப்புகள் – களஆய்வு நிறைவு மற்றும் சீரான விநியோக அறிக்கை சமர்ப்பித்தல் – தொடர்பாக.',
        references: [
          `1. தங்களின் கடித ந.க.எண் ${sample.refNo}, நாள் ${sample.date}.`,
          '2. செஞ்சி உதவிப் பொறியாளர் (ஊரக வளர்ச்சி) களஆய்வு அறிக்கை, நாள் 25.08.2026.'
        ],
        bodyParagraphs: [
          'பார்வை (1)-ல் காணும் தங்களின் கடிதத்தில் தெரிவிக்கப்பட்ட அறிவுரைகளின்படி, செஞ்சி வட்டாரத்தில் நிலுவையில் இருந்த 4 கிராம ஊராட்சிகளிலும் உள்ள குடிநீர்க் குழாய் அமைக்கும் பணிகள் நேரில் சென்று தீவிரமாக ஆய்வு செய்யப்பட்டன.',
          'மேற்படி ஆய்வின்படி விடுபட்ட அனைத்து 184 வீடுகளுக்கும் புதிய குடிநீர் இணைப்புகள் பொருத்தப்பட்டு, மேல்நிலை நீர்த்தேக்கத் தொட்டியிலிருந்து சோதனை ஓட்டம் வெற்றிகரமாக முடிக்கப்பட்டு தங்குதடையின்றி குடிநீர் விநியோகம் சீரமைக்கப்பட்டுள்ளது.',
          'எனவே, அனைத்து கிராம ஊராட்சிகளிலும் குடிநீர் இணைப்புகள் முழுமையாக நிறைவு செய்யப்பட்டு பொதுமக்கள் பயன்பாட்டிற்கு விடப்பட்டுள்ளது என்ற விரிவான களஆய்வு அறிக்கை இத்துடன் சமர்ப்பிக்கப்படுகிறது.'
        ],
        closing: 'தங்கள் உண்மையுள்ள,',
        signatoryName: 'எம். பாலசுப்பிரமணியன்',
        signatoryDesignation: 'வட்டார வளர்ச்சி அலுவலர் (கி.ஊ), செஞ்சி.',
        enclosures: [
          '1. ஊராட்சி வாரியான குடிநீர் இணைப்பு நிறைவுப் பட்டியல்.',
          '2. களஆய்வு புகைப்பட சான்றுகள்.'
        ],
        copyTo: [
          '1. மாவட்ட ஆட்சித் தலைவர் அவர்கள், விழுப்புரம் (தகவலுக்காக).',
          '2. அலுவலகக் கோப்பு.'
        ],
        fontFamily: 'TAU-Marutham',
        fontSizePt: 12
      });
    }
  };

  // Download DOCX in pure TAU-Marutham font
  const handleDownloadDocx = async () => {
    setIsDownloadingDocx(true);
    try {
      const blob = await generateOfficialReplyLetterDocx(replyLetter, {
        fontFamily: 'TAU-Marutham',
        fontSizePt: replyLetter.fontSizePt || 12
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanSubj = (replyLetter.subject || 'பதில்_கடிதம்').slice(0, 30).replace(/[^a-zA-Z0-9\u0B80-\u0BFF]/g, '_');
      a.download = `அதிகாரப்பூர்வ_பதில்_கடிதம்_${cleanSubj}_Tau-marutham.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadSuccessToast('அதிகாரப்பூர்வ பதில் கடிதம் Tau-marutham எழுத்துருவில் வேர்ட் (.docx) கோப்பாக வெற்றிகரமாக பதிவிறக்கப்பட்டது!');
      setTimeout(() => setDownloadSuccessToast(null), 5000);
    } catch (err: any) {
      alert(`DOCX உருவாக்குவதில் பிழை: ${err.message || err}`);
    } finally {
      setIsDownloadingDocx(false);
    }
  };

  // Copy text to clipboard
  const handleCopyText = () => {
    const fullText = [
      replyLetter.letterheadGov,
      replyLetter.letterheadDept,
      replyLetter.letterheadOffice,
      '',
      `கடித ந.க. எண்: ${replyLetter.letterRefNumber}\t\tநாள்: ${replyLetter.letterDate}`,
      '--------------------------------------------------------------------------------',
      'அனுப்புநர்:',
      `\t${replyLetter.fromDesignation}`,
      `\t${replyLetter.fromDepartment}`,
      `\t${replyLetter.fromPlace}`,
      '',
      'பெறுநர்:',
      `\t${replyLetter.toDesignation}`,
      `\t${replyLetter.toDepartment}`,
      `\t${replyLetter.toPlace}`,
      '',
      replyLetter.salutation,
      '',
      `பொருள்:\t${replyLetter.subject}`,
      '',
      `பார்வை:\t${replyLetter.references.join('\n\t')}`,
      '',
      replyLetter.bodyParagraphs.join('\n\n'),
      '',
      `\t\t\t\t\t\t${replyLetter.closing}`,
      `\t\t\t\t\t\t(${replyLetter.signatoryName})`,
      `\t\t\t\t\t\t${replyLetter.signatoryDesignation}`,
      '',
      replyLetter.enclosures.length > 0 ? `இணைப்பு:\n${replyLetter.enclosures.map((e) => `\t${e}`).join('\n')}\n` : '',
      replyLetter.copyTo.length > 0 ? `நகல்:\n${replyLetter.copyTo.map((c) => `\t${c}`).join('\n')}` : ''
    ].join('\n');

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {downloadSuccessToast && (
        <div className="p-4 bg-emerald-950/90 border-2 border-emerald-400 text-emerald-100 rounded shadow-xl flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-sm font-semibold">{downloadSuccessToast}</div>
          </div>
          <button
            onClick={() => setDownloadSuccessToast(null)}
            className="text-xs uppercase font-mono text-emerald-300 hover:text-white px-2 py-1"
          >
            மூடு
          </button>
        </div>
      )}

      {/* Main Workspace Header */}
      <div className="bg-[#12141A] border border-white/10 rounded-lg p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase">
              அரசு நெறிமுறை • Standard Alignment & Spacing
            </span>
            <span className="bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66]/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase">
              Tau-marutham Font
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-[#FFB800]" />
            <span>அதிகாரப்பூர்வ பதில் கடிதம் வரைவு (Official Reply Letter)</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-2xl">
            பெறப்பட்ட பிடிஎஃப் (PDF) கடிதத்தை ஆய்வு செய்து, தமிழ்நாடு அரசு தலைமைச் செயலகம் / மாவட்ட ஆட்சியரக அலுவலக நெறிமுறைகளின்படி தூய <strong className="text-[#00FF66]">Tau-marutham</strong> எழுத்துருவில் வேர்ட் (.docx) பதில் கடிதத்தை உருவாக்குங்கள்.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <button
            id="btn-reply-letter-copy"
            onClick={handleCopyText}
            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/20 text-gray-200 text-xs font-bold px-3 py-2 rounded transition-all cursor-pointer"
            title="முழு உரையையும் நகலெடு"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#00FF66]" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
            <span>{copied ? 'நகலெடுக்கப்பட்டது' : 'உரையை நகலெடு'}</span>
          </button>

          <button
            id="btn-reply-letter-print"
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/20 text-gray-200 text-xs font-bold px-3 py-2 rounded transition-all cursor-pointer"
            title="அச்சுப்பொறி / PDF அச்சிடு"
          >
            <Printer className="w-3.5 h-3.5 text-sky-400" />
            <span>அச்சிடு</span>
          </button>

          <button
            id="btn-reply-letter-download-docx"
            onClick={handleDownloadDocx}
            disabled={isDownloadingDocx}
            className="flex items-center gap-2 bg-[#00FF66] hover:bg-[#00e65c] text-black font-black text-xs uppercase tracking-wider px-4 py-2 rounded transition-all cursor-pointer shadow-lg disabled:opacity-50"
            title="வேர்ட் (.docx) கோப்பாக Tau-marutham எழுத்துருவில் பதிவிறக்கு"
          >
            {isDownloadingDocx ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4 text-black" />
            )}
            <span>Word (.docx) பதிவிறக்கு</span>
          </button>
        </div>
      </div>

      {/* 2-Column Split: Left Setup & Controls | Right Document Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN: Upload, Sample Selector & Drafting Strategy  */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 space-y-5">
          {/* Step 1: Upload PDF Letter Box */}
          <div className="bg-[#12141A] border border-white/10 rounded-lg p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-[#FFB800] uppercase tracking-wider flex items-center gap-1.5">
                <UploadCloud className="w-3.5 h-3.5 text-[#FFB800]" />
                <span>1. பெறப்பட்ட கடிதம் (PDF / படம்)</span>
              </span>
              {uploadedFileName && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                  ஏற்றப்பட்டது
                </span>
              )}
            </div>

            <label
              htmlFor="upload-pdf-letter-input"
              className="border-2 border-dashed border-white/20 hover:border-[#FFB800]/80 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-black/20 hover:bg-white/5"
            >
              <input
                id="upload-pdf-letter-input"
                type="file"
                accept=".pdf,image/png,image/jpeg,image/jpg"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
              <UploadCloud className="w-6 h-6 text-[#FFB800] mb-2" />
              <div className="text-xs font-bold text-white mb-0.5">
                பிடிஎஃப் (PDF) கடிதத்தை இங்கே பதிவேற்றவும்
              </div>
              <div className="text-[11px] text-gray-400">
                அல்லது கணினியிலிருந்து தேர்ந்தெடுக்க கிளிக் செய்க (.pdf, .jpg, .png)
              </div>
            </label>

            {uploadedFileName && (
              <div className="mt-3 p-2.5 bg-black/40 border border-white/10 rounded text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-mono text-gray-200 truncate">{uploadedFileName}</span>
                </div>
                {isExtractingFile && (
                  <span className="text-[10px] font-mono text-[#FFB800] animate-pulse">பகுப்பாய்வு...</span>
                )}
              </div>
            )}

            {/* Quick Sample Selector */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <div className="text-[11px] font-mono text-gray-400 mb-2 font-bold uppercase">
                அல்லது மாதிரி அரசு கடிதத்தைத் தேர்ந்தெடுக்கவும்:
              </div>
              <div className="space-y-1.5">
                {SAMPLE_INCOMING_LETTERS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectSample(s.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-sans transition-all flex items-center justify-between cursor-pointer ${
                      selectedSampleId === s.id && !uploadedFileName
                        ? 'bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/40 font-bold'
                        : 'bg-black/30 text-gray-300 hover:bg-white/5 hover:text-white border border-white/5'
                    }`}
                  >
                    <span className="truncate pr-2">{s.title}</span>
                    <span className="text-[10px] font-mono text-gray-400 shrink-0">{s.date}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 2: Reply Tone & Strategy */}
          <div className="bg-[#12141A] border border-white/10 rounded-lg p-4 sm:p-5">
            <span className="text-xs font-mono font-bold text-[#FFB800] uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#FFB800]" />
              <span>2. பதில் கடித வகை (Reply Tone)</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              {[
                { id: 'ACTION_TAKEN', label: 'நடவடிக்கை அறிக்கை', desc: 'Action Taken Report' },
                { id: 'APPROVAL_GRANTED', label: 'அனுமதி / ஒப்புதல் ஆணை', desc: 'Sanction / Approval' },
                { id: 'SEEKING_DETAILS', label: 'கூடுதல் ஆவணங்கள் கோருதல்', desc: 'Request Clarification' },
                { id: 'ACKNOWLEDGMENT', label: 'மனு ஒப்புகை', desc: 'Acknowledgment Receipt' },
                { id: 'GRIEVANCE_REDRESSED', label: 'மனு தீர்வு அறிவிப்பு', desc: 'Grievance Redressed' },
                { id: 'CUSTOM', label: 'தனிப்பயன் வரைவு', desc: 'Custom Instructions' }
              ].map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => setReplyTone(tone.id as ReplyToneType)}
                  className={`p-2 rounded text-left border transition-all cursor-pointer ${
                    replyTone === tone.id
                      ? 'bg-[#FFB800]/15 border-[#FFB800] text-white shadow-sm'
                      : 'bg-black/30 border-white/10 text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
                >
                  <div className="text-xs font-bold">{tone.label}</div>
                  <div className="text-[10px] font-mono text-gray-400">{tone.desc}</div>
                </button>
              ))}
            </div>

            {/* Custom Notes / Specific Guidance */}
            <div className="mt-3">
              <label className="text-[11px] font-mono text-gray-400 font-bold block mb-1">
                கூடுதல் குறிப்புகள் / அறிவுரைகள் (Optional):
              </label>
              <textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="எ.கா.: 24.08.2026 அன்று களஆய்வு முடிக்கப்பட்டது; 45 மாணவர்கள் தேர்வு செய்யப்பட்டனர்..."
                rows={2}
                className="w-full bg-black/40 border border-white/10 rounded p-2 text-xs text-white placeholder:text-gray-600 outline-none focus:border-[#FFB800]"
              />
            </div>

            {/* Generate Button */}
            <button
              id="btn-reply-letter-generate"
              onClick={() => generateReplyDraft(incomingLetterText)}
              disabled={isDraftingReply}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-[#FFB800] hover:bg-[#ffc526] text-black font-black text-xs uppercase tracking-wider py-2.5 rounded transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              {isDraftingReply ? (
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
              ) : (
                <Sparkles className="w-4 h-4 text-black" />
              )}
              <span>பதில் வரைவு உருவாக்கு (Generate Reply)</span>
            </button>
          </div>

          {/* Step 3: Quick Field Editor (Collapsible) */}
          <div className="bg-[#12141A] border border-white/10 rounded-lg p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-sky-400" />
                <span>3. கடித விவரங்களைத் திருத்து (Edit Details)</span>
              </span>
              <button
                onClick={() => setActiveTabMode(activeTabMode === 'preview' ? 'edit' : 'preview')}
                className="text-[11px] font-mono text-sky-400 hover:text-sky-300 underline"
              >
                {activeTabMode === 'preview' ? 'படிவத்தைத் திற' : 'படிவத்தை மூடு'}
              </button>
            </div>

            {activeTabMode === 'edit' && (
              <div className="space-y-3 mt-3 pt-3 border-t border-white/10 text-xs">
                <div>
                  <label className="text-[11px] font-mono text-gray-400 block mb-0.5">தலைமை அலுவலகம்:</label>
                  <input
                    type="text"
                    value={replyLetter.letterheadOffice}
                    onChange={(e) => setReplyLetter({ ...replyLetter, letterheadOffice: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-white text-xs outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-mono text-gray-400 block mb-0.5">ந.க. எண்:</label>
                    <input
                      type="text"
                      value={replyLetter.letterRefNumber}
                      onChange={(e) => setReplyLetter({ ...replyLetter, letterRefNumber: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-white text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-gray-400 block mb-0.5">நாள்:</label>
                    <input
                      type="text"
                      value={replyLetter.letterDate}
                      onChange={(e) => setReplyLetter({ ...replyLetter, letterDate: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-white text-xs outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-gray-400 block mb-0.5">கடித மாதிரி வடிவம்:</label>
                  <select
                    value={replyLetter.formatStyle || 'HM_TO_DEO_MODEL'}
                    onChange={(e) => setReplyLetter({ ...replyLetter, formatStyle: e.target.value as any })}
                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-white text-xs outline-none"
                  >
                    <option value="HM_TO_DEO_MODEL">பள்ளித் தலைமை ஆசிரியர் ➔ DEO மாதிரி (HM to DEO)</option>
                    <option value="SECRETARIAT_STANDARD">தலைமைச் செயலக / ஆட்சியரக வடிவம் (Secretariat Standard)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-gray-400 block mb-0.5">அனுப்புநர் HM பெயர் (விருப்பத்தேர்வு):</label>
                  <input
                    type="text"
                    value={replyLetter.fromPersonName || ''}
                    placeholder="எ.கா.: திருமதி. போ. செந்தாமரைச்செல்வி"
                    onChange={(e) => setReplyLetter({ ...replyLetter, fromPersonName: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-white text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-gray-400 block mb-0.5">அனுப்புநர் (HM) பதவி, பள்ளி & முகவரி:</label>
                  <input
                    type="text"
                    value={replyLetter.fromDesignation}
                    onChange={(e) => setReplyLetter({ ...replyLetter, fromDesignation: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-white text-xs outline-none mb-1"
                    placeholder="பதவி: தலைமை ஆசிரியர்,"
                  />
                  <input
                    type="text"
                    value={replyLetter.fromDepartment}
                    onChange={(e) => setReplyLetter({ ...replyLetter, fromDepartment: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-white text-xs outline-none mb-1"
                    placeholder="பள்ளியின் பெயர்: அரசு மேல்நிலைப்பள்ளி,"
                  />
                  <textarea
                    value={replyLetter.fromPlace}
                    onChange={(e) => setReplyLetter({ ...replyLetter, fromPlace: e.target.value })}
                    rows={2}
                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-white text-xs outline-none"
                    placeholder="பள்ளி முகவரி & ஊர் (வரிவாரியாக): மஞ்சக்குப்பம்&#10;கடலூர்."
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-gray-400 block mb-0.5">பெறுநர் (DEO) பதவி & அலுவலக முகவரி:</label>
                  <input
                    type="text"
                    value={replyLetter.toDesignation}
                    onChange={(e) => setReplyLetter({ ...replyLetter, toDesignation: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-white text-xs outline-none mb-1"
                    placeholder="பதவி: மாவட்டக் கல்வி அலுவலர் (இ.நி)"
                  />
                  <input
                    type="text"
                    value={replyLetter.toDepartment}
                    onChange={(e) => setReplyLetter({ ...replyLetter, toDepartment: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-white text-xs outline-none mb-1"
                    placeholder="அலுவலகம்: மாவட்டக் கல்வி அலுவலகம்"
                  />
                  <input
                    type="text"
                    value={replyLetter.toPlace}
                    onChange={(e) => setReplyLetter({ ...replyLetter, toPlace: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-white text-xs outline-none"
                    placeholder="ஊர் / மாவட்டம்: கடலூர்."
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-gray-400 block mb-0.5">பொருள்:</label>
                  <textarea
                    value={replyLetter.subject}
                    onChange={(e) => setReplyLetter({ ...replyLetter, subject: e.target.value })}
                    rows={2}
                    className="w-full bg-black/40 border border-white/10 rounded p-1.5 text-white text-xs outline-none"
                  />
                </div>

                <div className="bg-black/30 p-2 rounded border border-white/5">
                  <label className="text-[11px] font-mono text-[#00FF66] block mb-0.5 font-bold">கையொப்பப் பகுதி (Signature Area):</label>
                  <div className="text-[10px] text-gray-400 mb-1 leading-tight">
                    HM மாதிரி அமைப்பில், தலைமையாசிரியர் பதவி மற்றும் பள்ளி முகவரி வலதுபுறக் கீழ் கையொப்பப் பகுதியில் தானாகவே அமையும்.
                  </div>
                  <input
                    type="text"
                    value={replyLetter.signatoryDesignation}
                    onChange={(e) => setReplyLetter({ ...replyLetter, signatoryDesignation: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-white text-xs outline-none mb-1"
                    placeholder="பதவி: தலைமை ஆசிரியர்"
                  />
                  <div className="text-[10px] text-gray-500 font-mono">
                    பள்ளி: {replyLetter.fromDepartment} | {replyLetter.fromPlace.replace(/\n/g, ', ')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Official Government Letter Preview Sheet    */}
        {/* ========================================================= */}
        <div className="lg:col-span-8">
          {/* Top Control Bar of Document Sheet */}
          <div className="bg-[#181B22] border border-white/10 rounded-t-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-gray-300 font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#00FF66]" />
                <span>அதிகாரப்பூர்வ கடித மாதிரித் தாள் (A4 Sheet View)</span>
              </span>
              <span className="hidden sm:inline-block bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30 px-2 py-0.5 rounded font-mono text-[10px] font-semibold">
                எழுத்துரு: Tau-marutham
              </span>
            </div>

            {/* Layout Model Switcher */}
            <div className="flex items-center gap-2">
              <div className="bg-black/50 p-0.5 rounded border border-white/10 flex items-center text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => setReplyLetter({ ...replyLetter, formatStyle: 'HM_TO_DEO_MODEL' })}
                  className={`px-2.5 py-1 rounded transition-all cursor-pointer font-bold ${
                    replyLetter.formatStyle !== 'SECRETARIAT_STANDARD'
                      ? 'bg-[#00FF66] text-black shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="தலைமையாசிரியர் ➔ DEO மாதிரி வடிவம் (2 நெடுவரிசை & எல்லைக்கோடு)"
                >
                  HM ➔ DEO மாதிரி
                </button>
                <button
                  type="button"
                  onClick={() => setReplyLetter({ ...replyLetter, formatStyle: 'SECRETARIAT_STANDARD' })}
                  className={`px-2.5 py-1 rounded transition-all cursor-pointer font-bold ${
                    replyLetter.formatStyle === 'SECRETARIAT_STANDARD'
                      ? 'bg-[#00FF66] text-black shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="தலைமைச் செயலக / ஆட்சியரக வடிவம்"
                >
                  செயலக வடிவம்
                </button>
              </div>

              <span className="text-[11px] font-mono text-gray-400">12pt</span>
              <button
                onClick={handleDownloadDocx}
                disabled={isDownloadingDocx}
                className="flex items-center gap-1.5 bg-[#00FF66] hover:bg-[#00e65c] text-black font-black text-xs px-3 py-1.5 rounded transition-all cursor-pointer shadow"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Word (.docx)</span>
              </button>
            </div>
          </div>

          {/* The Sheet Itself */}
          <div className="official-letter-sheet p-8 sm:p-12 rounded-b-lg text-slate-900 font-tau-marutham min-h-[840px] leading-relaxed select-text border border-slate-200">
            {replyLetter.formatStyle !== 'SECRETARIAT_STANDARD' ? (
              /* ========================================================================= */
              /* HM TO DEO MODEL LAYOUT (As per uploaded government school reply letter)   */
              /* ========================================================================= */
              <div>
                {/* 1. Top Section: 2 Columns (Left: அனுப்புநர் | Right: பெறுநர்) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4 text-xs sm:text-sm">
                  {/* Left Column: அனுப்புநர் */}
                  <div className="space-y-0.5 text-slate-900">
                    <div className="font-bold text-slate-950 mb-1 text-sm sm:text-base">அனுப்புநர்</div>
                    {replyLetter.fromPersonName && (
                      <div className="font-semibold text-slate-900">{replyLetter.fromPersonName}</div>
                    )}
                    <div>{replyLetter.fromDesignation}</div>
                    <div>{replyLetter.fromDepartment}</div>
                    <div className="whitespace-pre-line">{replyLetter.fromPlace}</div>
                  </div>

                  {/* Right Column: பெறுநர் */}
                  <div className="space-y-0.5 text-slate-900 sm:pl-4">
                    <div className="font-bold text-slate-950 mb-1 text-sm sm:text-base">பெறுநர்</div>
                    <div>{replyLetter.toDesignation}</div>
                    <div>{replyLetter.toDepartment}</div>
                    <div className="whitespace-pre-line">{replyLetter.toPlace}</div>
                  </div>
                </div>

                {/* 2. Framed Border Box: [ ந.க.எண்: ...                 நாள்: ... ] */}
                <div className="border border-slate-700 rounded px-4 py-2.5 flex items-center justify-between font-bold text-xs sm:text-sm my-5 bg-slate-50/70">
                  <div>
                    <span>ந.க.எண்: </span>
                    <span className="font-semibold">{replyLetter.letterRefNumber}</span>
                  </div>
                  <div>
                    <span>நாள்: </span>
                    <span className="font-semibold">{replyLetter.letterDate}</span>
                  </div>
                </div>

                {/* 3. பொருள் (Subject) with Hanging Indent */}
                <div className="mb-3 text-xs sm:text-sm text-justify pl-8 -indent-8 leading-relaxed">
                  <span className="font-bold text-slate-950 mr-2">பொருள்:</span>
                  <span className="text-slate-900">{replyLetter.subject}</span>
                </div>

                {/* 4. பார்வை (Reference) with Hanging Indent & Centered ********** */}
                {replyLetter.references && replyLetter.references.length > 0 && (
                  <div className="mb-4 text-xs sm:text-sm pl-8 -indent-8 leading-relaxed">
                    <span className="font-bold text-slate-950 mr-2">பார்வை:</span>
                    <div className="inline-block align-top space-y-1 text-slate-900">
                      {replyLetter.references.map((ref, idx) => (
                        <div key={idx}>{ref}</div>
                      ))}
                    </div>
                    <div className="text-center text-slate-700 font-bold tracking-widest my-4 text-sm">
                      **********
                    </div>
                  </div>
                )}

                {/* 5. Salutation (ஐயா,) */}
                <div className="font-bold text-slate-950 text-xs sm:text-sm mb-4">
                  {replyLetter.salutation || 'ஐயா,'}
                </div>

                {/* 6. Body Paragraphs (Indented, Justified) */}
                <div className="space-y-4 text-xs sm:text-sm text-justify leading-relaxed text-slate-900 mb-8">
                  {replyLetter.bodyParagraphs.map((para, idx) => (
                    <p key={idx} className="indent-10 sm:indent-14 leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>

                {/* 7. Bottom Section: 2 Columns (Left: இணைப்பு | Right: தலைமை ஆசிரியர் & பள்ளி முகவரி) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end text-xs sm:text-sm pt-6">
                  {/* Left: இணைப்பு */}
                  <div>
                    {replyLetter.enclosures && replyLetter.enclosures.length > 0 && (
                      <div className="text-slate-900 leading-normal">
                        {replyLetter.enclosures.length === 1 ? (
                          <div className="font-bold text-slate-950">
                            இணைப்பு : <span className="font-normal">{replyLetter.enclosures[0].replace(/^இணைப்பு\s*[:.-]\s*/, '').replace(/^[0-9.]+\s*/, '')}</span>
                          </div>
                        ) : (
                          <div>
                            <div className="font-bold text-slate-950 mb-1.5">இணைப்பு :</div>
                            <div className="pl-4 space-y-1">
                              {replyLetter.enclosures.map((enc, idx) => (
                                <div key={idx}>{enc}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Signature Area (தலைமை ஆசிரியர், பள்ளிப் பெயர் & முகவரி) */}
                  <div className="text-right text-slate-900 space-y-0.5 leading-normal">
                    <div className="font-bold text-slate-950 text-sm sm:text-base">
                      {replyLetter.signatoryDesignation || 'தலைமை ஆசிரியர்'}
                    </div>
                    <div>{replyLetter.fromDepartment}</div>
                    {replyLetter.fromPlace && (
                      <div className="whitespace-pre-line">{replyLetter.fromPlace}</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* ========================================================================= */
              /* SECRETARIAT STANDARD LAYOUT                                              */
              /* ========================================================================= */
              <div>
                {/* 1. Header Letterhead */}
                <div className="text-center space-y-1 mb-6">
                  <div className="text-lg sm:text-xl font-black text-slate-950 tracking-tight">
                    {replyLetter.letterheadGov}
                  </div>
                  {replyLetter.letterheadDept && (
                    <div className="text-sm sm:text-base font-bold text-slate-800">
                      {replyLetter.letterheadDept}
                    </div>
                  )}
                  {replyLetter.letterheadOffice && (
                    <div className="text-xs sm:text-sm text-slate-600 font-medium">
                      {replyLetter.letterheadOffice}
                    </div>
                  )}
                </div>

                {/* 2. Reference No & Date Line */}
                <div className="flex items-center justify-between border-b-2 border-slate-300 pb-2.5 mb-6 text-xs sm:text-sm">
                  <div className="font-bold text-slate-900">
                    <span>கடித ந.க. எண்: </span>
                    <span className="font-semibold text-slate-800">{replyLetter.letterRefNumber}</span>
                  </div>
                  <div className="text-slate-800">
                    <span className="font-bold text-slate-900">நாள்: </span>
                    <span>{replyLetter.letterDate}</span>
                  </div>
                </div>

                {/* 3. அனுப்புநர் (From Section) */}
                <div className="mb-4 text-xs sm:text-sm">
                  <div className="font-bold text-slate-950 mb-1">அனுப்புநர்:</div>
                  <div className="pl-6 space-y-0.5 text-slate-800">
                    {replyLetter.fromPersonName && (
                      <div className="font-semibold text-slate-900">{replyLetter.fromPersonName}</div>
                    )}
                    <div>{replyLetter.fromDesignation}</div>
                    <div>{replyLetter.fromDepartment}</div>
                    <div>{replyLetter.fromPlace}</div>
                  </div>
                </div>

                {/* 4. பெறுநர் (To Section) */}
                <div className="mb-5 text-xs sm:text-sm">
                  <div className="font-bold text-slate-950 mb-1">பெறுநர்:</div>
                  <div className="pl-6 space-y-0.5 text-slate-800">
                    <div>{replyLetter.toDesignation}</div>
                    <div>{replyLetter.toDepartment}</div>
                    <div>{replyLetter.toPlace}</div>
                  </div>
                </div>

                {/* 5. விளிப்பு (Salutation) */}
                <div className="font-bold text-slate-950 text-xs sm:text-sm mb-4">
                  {replyLetter.salutation}
                </div>

                {/* 6. பொருள் (Subject) */}
                <div className="mb-3 text-xs sm:text-sm text-justify pl-6 -indent-6">
                  <span className="font-bold text-slate-950 mr-2">பொருள்:</span>
                  <span className="text-slate-900">{replyLetter.subject}</span>
                </div>

                {/* 7. பார்வை (Reference) */}
                {replyLetter.references && replyLetter.references.length > 0 && (
                  <div className="mb-5 text-xs sm:text-sm pl-6 -indent-6">
                    <span className="font-bold text-slate-950 mr-2">பார்வை:</span>
                    <div className="inline-block align-top space-y-1 text-slate-800">
                      {replyLetter.references.map((ref, idx) => (
                        <div key={idx}>{ref}</div>
                      ))}
                    </div>
                    <div className="text-center text-slate-400 text-xs tracking-widest my-3">
                      ----- * -----
                    </div>
                  </div>
                )}

                {/* 8. பத்திகள் (Body Paragraphs) */}
                <div className="space-y-3.5 text-xs sm:text-sm text-justify leading-relaxed text-slate-900 mb-8">
                  {replyLetter.bodyParagraphs.map((para, idx) => (
                    <p key={idx} className="indent-8 sm:indent-12 leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>

                {/* 9. முடிவுரை & கையொப்பப் பகுதி (Closing & Signatory Block) */}
                <div className="flex flex-col items-end text-right text-xs sm:text-sm text-slate-900 mb-6">
                  <div className="font-bold text-slate-950 mb-10">
                    {replyLetter.closing}
                  </div>
                  <div className="font-bold text-slate-950">
                    ({replyLetter.signatoryName})
                  </div>
                  <div className="text-slate-700 text-xs mt-0.5">
                    {replyLetter.signatoryDesignation}
                  </div>
                </div>

                {/* 10. இணைப்பு (Enclosures) */}
                {replyLetter.enclosures && replyLetter.enclosures.length > 0 && (
                  <div className="mb-4 text-xs sm:text-sm text-slate-800">
                    <div className="font-bold text-slate-950 mb-1">இணைப்பு:</div>
                    <div className="pl-6 space-y-0.5">
                      {replyLetter.enclosures.map((enc, idx) => (
                        <div key={idx}>{enc}</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 11. நகல் (Copy to) */}
                {replyLetter.copyTo && replyLetter.copyTo.length > 0 && (
                  <div className="text-xs sm:text-sm text-slate-800 pt-2 border-t border-slate-200">
                    <div className="font-bold text-slate-950 mb-1">நகல்:</div>
                    <div className="pl-6 space-y-0.5">
                      {replyLetter.copyTo.map((cp, idx) => (
                        <div key={idx}>{cp}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
