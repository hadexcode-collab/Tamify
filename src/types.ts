/**
 * Types and interfaces for Tamil Legacy Document to Unicode DOCX Converter
 */

export type ActiveTabType =
  | 'pdf-to-excel'
  | 'pdf-to-word'
  | 'reply-letter'
  | 'pdf-editor'
  | 'language-converter';

export type EncodingType =
  | 'AUTO_DETECT'
  | 'BAMINI'
  | 'TAM'
  | 'TAB'
  | 'TSCII'
  | 'SHREELIPI'
  | 'SOFTVIEW'
  | 'UNICODE'
  | 'SCANNED_IMAGE_OCR';

export type OfficialIndianLanguageCode =
  | 'auto'
  | 'hin'
  | 'eng'
  | 'mal'
  | 'kan'
  | 'tel'
  | 'ben'
  | 'ori'
  | 'tam'
  | 'mar'
  | 'guj'
  | 'pan'
  | 'asm'
  | 'urd'
  | 'san';

export interface OfficialIndianLanguage {
  code: OfficialIndianLanguageCode;
  name: string;
  nativeName: string;
  script: string;
  tesseractCode: string;
  samplePhrase: string;
  badgeColor: string;
}

export const OFFICIAL_INDIAN_LANGUAGES: OfficialIndianLanguage[] = [
  {
    code: 'auto',
    name: 'Auto-Detect',
    nativeName: 'தானியங்கி கண்டறிதல் (Auto)',
    script: 'Multilingual Indic & English',
    tesseractCode: 'tam+eng+hin',
    samplePhrase: 'Auto-detect language from document scan',
    badgeColor: '#38BDF8'
  },
  {
    code: 'hin',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    script: 'Devanagari',
    tesseractCode: 'hin+eng',
    samplePhrase: 'भारत सरकार आधिकारिक राजपत्र एवं परिपत्र',
    badgeColor: '#F97316'
  },
  {
    code: 'eng',
    name: 'English',
    nativeName: 'English (Official / Latin)',
    script: 'Latin / English',
    tesseractCode: 'eng',
    samplePhrase: 'Government Order, Circular & Official Gazette',
    badgeColor: '#10B981'
  },
  {
    code: 'tam',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    script: 'Tamil',
    tesseractCode: 'tam+eng',
    samplePhrase: 'தமிழ்நாடு அரசு அரசாணை நிலை எண் 142',
    badgeColor: '#FFB800'
  },
  {
    code: 'mal',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    script: 'Malayalam',
    tesseractCode: 'mal+eng',
    samplePhrase: 'കേരള സർക്കാർ ഉത്തരവ് നമ്പർ 142',
    badgeColor: '#EC4899'
  },
  {
    code: 'kan',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    script: 'Kannada',
    tesseractCode: 'kan+eng',
    samplePhrase: 'ಕರ್ನಾಟಕ ಸರಕಾರ ಅಧಿಕೃತ ಆದೇಶ ಸಂಖ್ಯೆ ೧೪೨',
    badgeColor: '#EAB308'
  },
  {
    code: 'tel',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    script: 'Telugu',
    tesseractCode: 'tel+eng',
    samplePhrase: 'ప్రభుత్వ ఉత్తర్వు జీవో సంఖ్య 142',
    badgeColor: '#06B6D4'
  },
  {
    code: 'ben',
    name: 'Bengali',
    nativeName: 'বাংলা',
    script: 'Bengali',
    tesseractCode: 'ben+eng',
    samplePhrase: 'পশ্চিমবঙ্গ সরকার আদেশ ও বিজ্ঞপ্তি সংখ্যা ১৪২',
    badgeColor: '#3B82F6'
  },
  {
    code: 'ori',
    name: 'Odia (Odisha)',
    nativeName: 'ଓଡ଼ିଆ',
    script: 'Odia',
    tesseractCode: 'ori+eng',
    samplePhrase: 'ଓଡ଼ିଶା ସରକାର ସରକାରୀ ଆଦେଶ ସଂଖ୍ୟା ୧୪୨',
    badgeColor: '#8B5CF6'
  },
  {
    code: 'mar',
    name: 'Marathi',
    nativeName: 'मराठी',
    script: 'Devanagari',
    tesseractCode: 'mar+eng',
    samplePhrase: 'महाराष्ट्र शासन राजपत्र व अधिकृत आदेश',
    badgeColor: '#FB923C'
  },
  {
    code: 'guj',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    script: 'Gujarati',
    tesseractCode: 'guj+eng',
    samplePhrase: 'ગુજરાત સરકાર સત્તાવાર પરિપત્ર અને હુકમ',
    badgeColor: '#14B8A6'
  },
  {
    code: 'pan',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ (Gurmukhi)',
    script: 'Gurmukhi',
    tesseractCode: 'pan+eng',
    samplePhrase: 'ਪੰਜਾਬ ਸਰਕਾਰ ਹੁਕਮ ਅਤੇ ਅਧਿਕਾਰਤ ਪੱਤਰ',
    badgeColor: '#F59E0B'
  },
  {
    code: 'asm',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    script: 'Bengali-Assamese',
    tesseractCode: 'asm+eng',
    samplePhrase: 'অসম চৰকাৰ কাৰ্যালয় আদেশ নং ১৪২',
    badgeColor: '#6366F1'
  },
  {
    code: 'urd',
    name: 'Urdu',
    nativeName: 'اردو',
    script: 'Perso-Arabic',
    tesseractCode: 'urd+eng',
    samplePhrase: 'حکومت کا سرکاری حکم نامہ اور گزٹ',
    badgeColor: '#22C55E'
  },
  {
    code: 'san',
    name: 'Sanskrit',
    nativeName: 'संस्कृतम्',
    script: 'Devanagari',
    tesseractCode: 'san+hin+eng',
    samplePhrase: 'सर्वकारस्य अधिकृत शासनादेशः पत्रावली च',
    badgeColor: '#D97706'
  }
];

export interface DocumentSample {
  id: string;
  title: string;
  tamilTitle: string;
  category: 'GOVERNMENT_ORDER' | 'DEED_REGISTRATION' | 'GAZETTE' | 'LEGACY_BAMINI' | 'CLASSICAL_LITERATURE';
  description: string;
  year: string;
  sourceType: 'IMAGE_SCAN' | 'LEGACY_TEXT' | 'TYPEWRITER' | 'MIXED_PDF';
  previewImageUrl?: string;
  rawText?: string;
  defaultEncoding: EncodingType;
  pageCount?: number;
}

export interface WordToken {
  id: string;
  text: string;
  originalText?: string;
  confidence: number; // 0.0 to 1.0
  isoTransliteration: string;
  phonetic: string;
  rootWord?: string;
  posTag?: string; // Noun, Verb, Postposition (வேற்றுமை), Sandhi (சந்தி), etc.
  meaningEn?: string;
  isGovernmentTerm?: boolean;
  hasSandhi?: boolean;
  sandhiRule?: string;
  isCorrected?: boolean;
  suggestions?: string[];
}

export interface LineToken {
  id: string;
  lineNumber: number;
  type: 'HEADER' | 'PARAGRAPH' | 'TABLE_ROW' | 'SIGNATURE' | 'REFERENCE' | 'SUBJECT' | 'SEAL_METADATA';
  tamilText: string;
  originalRawText?: string;
  confidence: number;
  words: WordToken[];
  tableCells?: string[];
  notes?: string;
}

export interface TableBlock {
  id: string;
  headers: string[];
  rows: string[][];
  caption?: string;
}

export interface DocumentMetadata {
  documentTitle: string;
  department?: string;
  orderNumber?: string;
  dateStr?: string;
  place?: string;
  subject?: string;
  reference?: string;
  signatory?: string;
  sealText?: string;
  pageCount: number;
}

export interface OCRProcessResult {
  detectedEncoding: EncodingType;
  encodingConfidence: number;
  processingMethod: 'DETERMINISTIC_ONLY' | 'OCR_ENSEMBLE' | 'HYBRID_FUSED' | 'MULTI_PAGE_ENSEMBLE';
  metadata: DocumentMetadata;
  fullUnicodeText: string;
  lines: LineToken[];
  tables: TableBlock[];
  overallConfidence: number;
  highConfidenceCount: number;
  mediumConfidenceCount: number;
  lowConfidenceCount: number;
  morphologyStats: {
    sandhiAdjusted: number;
    govTermsIdentified: number;
    ligaturesFixed: number;
    archaicGlyphsResolved: number;
  };
  processingTimeMs: number;
  logs: string[];
}

export type TamilDocxFont =
  | 'Tau-marutham'
  | 'TAU-Marutham'
  | 'Latha'
  | 'Vijaya'
  | 'Nirmala UI'
  | 'Kavivanar'
  | 'Mukta Malar'
  | 'Noto Sans Tamil'
  | 'Bamini'
  | 'Arial Unicode MS'
  | 'Times New Roman'
  | string;

export interface DocxExportConfig {
  documentTitle: string;
  fontSize: number;
  fontFamily: TamilDocxFont;
  includeHeaderLetterhead: boolean;
  letterheadText?: string;
  subLetterheadText?: string;
  includeDocumentMetadata: boolean;
  tableBorderColor: string;
  lineSpacing: number;
  pageOrientation: 'portrait' | 'landscape';
  includePronunciationAppendix: boolean;
  includeConfidenceSummary: boolean;
}

export interface BatchQueueItem {
  id: string;
  name: string;
  fileSizeBytes: number;
  mimeType: string;
  fileObject?: File;
  imageBase64?: string;
  rawText?: string;
  sourceType: 'IMAGE' | 'PDF' | 'TEXT' | 'PRESET_SAMPLE';
  previewUrl?: string;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number; // 0 to 100
  selectedEncoding: EncodingType;
  userHint?: string;
  result?: OCRProcessResult;
  error?: string;
  durationMs?: number;
  selectedForExport: boolean;
  addedAt: number;
  completedAt?: number;
}

export interface BatchProcessSettings {
  concurrency: number; // 1, 2, 3, or 4
  defaultEncoding: EncodingType;
  defaultUserHint: string;
  autoStartOnDrop: boolean;
}

export interface BatchZipExportConfig {
  zipFileName: string;
  fontFamily: 'Tau-marutham' | 'TAU-Marutham' | 'Marutham' | 'Noto Sans Tamil' | 'Nirmala UI' | 'Latha' | 'Vijaya' | 'Tamil Sangam MN' | 'Arial Unicode MS';
  fontSize: number;
  includeLetterhead: boolean;
  includeMetadataBox: boolean;
  includeAppendix: boolean;
  includeTextFiles: boolean;
  includeJsonReports: boolean;
  includeBatchManifest: boolean;
}

export type ReplyToneType =
  | 'ACTION_TAKEN'
  | 'APPROVAL_GRANTED'
  | 'SEEKING_DETAILS'
  | 'ACKNOWLEDGMENT'
  | 'GRIEVANCE_REDRESSED'
  | 'CUSTOM';

export interface OfficialReplyLetterData {
  letterheadGov: string;
  letterheadDept: string;
  letterheadOffice: string;
  letterRefNumber: string;
  letterDate: string;
  fromPersonName?: string;
  fromDesignation: string;
  fromDepartment: string;
  fromPlace: string;
  toDesignation: string;
  toDepartment: string;
  toPlace: string;
  salutation: string;
  subject: string;
  references: string[];
  bodyParagraphs: string[];
  closing: string;
  signatoryName: string;
  signatoryDesignation: string;
  enclosures: string[];
  copyTo: string[];
  fontFamily?: string;
  fontSizePt?: number;
  formatStyle?: 'HM_TO_DEO_MODEL' | 'SECRETARIAT_STANDARD';
}

