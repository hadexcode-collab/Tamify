/**
 * Universal Indic Script & Indian Languages Engine (பாரதிய மொழிகள் & வரிவடிவப் பொறி)
 * 
 * Supports inter-Indic Akshara conversion across:
 * - Tamil (தமிழ்)
 * - Devanagari / Hindi / Sanskrit (हिन्दी / संस्कृतम्)
 * - Telugu (తెలుగు)
 * - Malayalam (മലയാളം)
 * - Kannada (ಕನ್ನಡ)
 * - Bengali (বাংলা)
 * - ISO 15919 / IAST Romanized English
 * - Grantha Epigraphy (கிரந்த எழுத்துக்கள்)
 */

import { transliterateTamilToISO } from './tamilMorphology';
import { convertTamilToKeezhadiBrahmi } from './keezhadiTypewriter';

export type IndicScriptCode = 'tam' | 'dev' | 'tel' | 'mal' | 'kan' | 'ben' | 'ori' | 'guj' | 'pan' | 'iso' | 'brahmi';

export interface IndicLanguageInfo {
  code: IndicScriptCode;
  name: string;
  nativeName: string;
  family: string;
  sampleText: string;
  badgeColor: string;
}

export const SUPPORTED_INDIC_LANGUAGES: IndicLanguageInfo[] = [
  {
    code: 'tam',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    family: 'Dravidian (Classical)',
    sampleText: 'தமிழ்நாடு அரசு அரசாணை நிலை எண் 142',
    badgeColor: '#FFB800'
  },
  {
    code: 'dev',
    name: 'Hindi / Marathi / Sanskrit (Devanagari)',
    nativeName: 'हिन्दी / मराठी / संस्कृतम्',
    family: 'Indo-Aryan',
    sampleText: 'तमिलनाडु सरकार शासनादेश संख्या १४२',
    badgeColor: '#FF5722'
  },
  {
    code: 'iso',
    name: 'English (ISO 15919 Transliteration)',
    nativeName: 'Romanized English',
    family: 'ISO International Standard',
    sampleText: 'tamiḻnāṭu aracu aracāṇai nilai eṇ 142',
    badgeColor: '#00FF66'
  },
  {
    code: 'mal',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    family: 'Dravidian (Kerala)',
    sampleText: 'തമിഴ്നാട് സർക്കാർ ഉത്തരവ് നമ്പർ 142',
    badgeColor: '#E040FB'
  },
  {
    code: 'kan',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    family: 'Dravidian (Karnataka)',
    sampleText: 'ತಮಿಳುನಾಡು ಸರಕಾರ ಆದೇಶ ಸಂಖ್ಯೆ ೧೪೨',
    badgeColor: '#FFD600'
  },
  {
    code: 'tel',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    family: 'Dravidian (Andhra / Telangana)',
    sampleText: 'తమిళనాడు ప్రభుత్వం జీవో సంఖ్య 142',
    badgeColor: '#00E5FF'
  },
  {
    code: 'ben',
    name: 'Bengali / Assamese',
    nativeName: 'বাংলা / অসমীয়া',
    family: 'Indo-Aryan (Eastern)',
    sampleText: 'তামিলনাড়ু সরকার আদেশ সংখ্যা ১৪২',
    badgeColor: '#29B6F6'
  },
  {
    code: 'ori',
    name: 'Odia (Odisha)',
    nativeName: 'ଓଡ଼ିଆ',
    family: 'Indo-Aryan (Odisha)',
    sampleText: 'ତାମିଲନାଡ଼ୁ ସରକାର ଆଦେଶ ସଂଖ୍ୟା ୧୪୨',
    badgeColor: '#A855F7'
  },
  {
    code: 'guj',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    family: 'Indo-Aryan (Western)',
    sampleText: 'તમિલનાડુ સરકાર આદેશ સંખ્યા ૧૪૨',
    badgeColor: '#10B981'
  },
  {
    code: 'pan',
    name: 'Punjabi (Gurmukhi)',
    nativeName: 'ਪੰਜਾਬੀ',
    family: 'Indo-Aryan (Gurmukhi)',
    sampleText: 'ਤਮਿਲਨਾਡੂ ਸਰਕਾਰ ਹੁਕਮ ਨੰਬਰ ੧੪੨',
    badgeColor: '#F59E0B'
  },
  {
    code: 'brahmi',
    name: 'Tamil-Brahmi (Keezhadi Epigraphy)',
    nativeName: 'தமிழி / கீழடி கல்வெட்டு',
    family: 'Ancient Epigraphical',
    sampleText: '𑀢𑀫𑀺𑀵𑁆𑀦𑀸𑀝𑀼 𑀅𑀭𑀘𑀼',
    badgeColor: '#E65100'
  }
];

// Akshara / Character Offset Mapping relative to base Unicode block
// Tamil: U+0B80, Devanagari: U+0900, Telugu: U+0C00, Malayalam: U+0D00, Kannada: U+0C80, Bengali: U+0980

// Base offsets table for Indic phonemes (0x00 to 0x7F)
const TAMIL_UNICODE_BASE = 0x0B80;
const DEVANAGARI_BASE = 0x0900;
const TELUGU_BASE = 0x0C00;
const MALAYALAM_BASE = 0x0D00;
const KANNADA_BASE = 0x0C80;
const BENGALI_BASE = 0x0980;

// High-precision Akshara direct conversion map between Tamil and other Indic scripts
const TAMIL_TO_INDIC_DIRECT: Record<string, Record<string, string>> = {
  // Vowels
  'அ': { dev: 'अ', tel: 'అ', mal: 'അ', kan: 'ಅ', ben: 'অ', iso: 'a' },
  'ஆ': { dev: 'आ', tel: 'ఆ', mal: 'ആ', kan: 'ಆ', ben: 'আ', iso: 'ā' },
  'இ': { dev: 'इ', tel: 'ఇ', mal: 'ഇ', kan: 'ಇ', ben: 'ই', iso: 'i' },
  'ஈ': { dev: 'ई', tel: 'ఈ', mal: 'ഈ', kan: 'ಈ', ben: 'ঈ', iso: 'ī' },
  'உ': { dev: 'उ', tel: 'ఉ', mal: 'ഉ', kan: 'ಉ', ben: 'উ', iso: 'u' },
  'ஊ': { dev: 'ऊ', tel: 'ఊ', mal: 'ഊ', kan: 'ಊ', ben: 'ঊ', iso: 'ū' },
  'எ': { dev: 'ऎ', tel: 'ఎ', mal: 'എ', kan: 'ಎ', ben: 'এ', iso: 'e' },
  'ஏ': { dev: 'ए', tel: 'ఏ', mal: 'ഏ', kan: 'ಏ', ben: 'এ', iso: 'ē' },
  'ஐ': { dev: 'ऐ', tel: 'ఐ', mal: 'ഐ', kan: 'ಐ', ben: 'ঐ', iso: 'ai' },
  'ஒ': { dev: 'ऒ', tel: 'ఒ', mal: 'ഒ', kan: 'ಒ', ben: 'ও', iso: 'o' },
  'ஓ': { dev: 'ओ', tel: 'ఓ', mal: 'ഓ', kan: 'ಓ', ben: 'ও', iso: 'ō' },
  'ஔ': { dev: 'औ', tel: 'ఔ', mal: 'ഔ', kan: 'ಔ', ben: 'ঔ', iso: 'au' },
  'ஃ': { dev: 'ः', tel: 'ః', mal: 'ഃ', kan: 'ಃ', ben: 'ঃ', iso: 'ḵ' },

  // Base Consonants
  'க': { dev: 'क', tel: 'క', mal: 'ക', kan: 'ಕ', ben: 'ক', iso: 'ka' },
  'ங': { dev: 'ङ', tel: 'ఙ', mal: 'ങ', kan: 'ಙ', ben: 'ঙ', iso: 'ṅa' },
  'ச': { dev: 'च', tel: 'చ', mal: 'ച', kan: 'ಚ', ben: 'চ', iso: 'ca' },
  'ஞ': { dev: 'ञ', tel: 'ఞ', mal: 'ഞ', kan: 'ಞ', ben: 'ঞ', iso: 'ña' },
  'ட': { dev: 'ट', tel: 'ట', mal: 'ട', kan: 'ಟ', ben: 'ট', iso: 'ṭa' },
  'ண': { dev: 'ण', tel: 'ణ', mal: 'ണ', kan: 'ಣ', ben: 'ণ', iso: 'ṇa' },
  'த': { dev: 'त', tel: 'త', mal: 'ത', kan: 'ತ', ben: 'ত', iso: 'ta' },
  'ந': { dev: 'न', tel: 'న', mal: 'ന', kan: 'ನ', ben: 'ন', iso: 'na' },
  'ப': { dev: 'प', tel: 'ప', mal: 'പ', kan: 'ಪ', ben: 'প', iso: 'pa' },
  'ம': { dev: 'म', tel: 'మ', mal: 'മ', kan: 'ಮ', ben: 'ম', iso: 'ma' },
  'ய': { dev: 'य', tel: 'య', mal: 'യ', kan: 'ಯ', ben: 'য', iso: 'ya' },
  'ர': { dev: 'र', tel: 'ర', mal: 'ര', kan: 'ರ', ben: 'র', iso: 'ra' },
  'ல': { dev: 'ल', tel: 'ల', mal: 'ല', kan: 'ಲ', ben: 'ল', iso: 'la' },
  'வ': { dev: 'व', tel: 'వ', mal: 'വ', kan: 'ವ', ben: 'ব', iso: 'va' },
  'ழ': { dev: 'ऴ', tel: 'ఴ', mal: 'ഴ', kan: 'ೞ', ben: 'ড়', iso: 'ḻa' },
  'ள': { dev: 'ळ', tel: 'ళ', mal: 'ള', kan: 'ಳ', ben: 'ল', iso: 'ḷa' },
  'ற': { dev: 'ऱ', tel: 'ఱ', mal: 'റ', kan: 'ಱ', ben: 'র', iso: 'ṟa' },
  'ன': { dev: 'ऩ', tel: 'న', mal: 'ന', kan: 'ನ', ben: 'ন', iso: 'ṉa' },
  'ஜ': { dev: 'ज', tel: 'జ', mal: 'ജ', kan: 'ಜ', ben: 'জ', iso: 'ja' },
  'ஷ': { dev: 'ष', tel: 'ష', mal: 'ഷ', kan: 'ಷ', ben: 'ষ', iso: 'ṣa' },
  'ஸ': { dev: 'स', tel: 'స', mal: 'സ', kan: 'ಸ', ben: 'স', iso: 'sa' },
  'ஹ': { dev: 'ह', tel: 'హ', mal: 'ഹ', kan: 'ಹ', ben: 'হ', iso: 'ha' },
  'க்ஷ': { dev: 'क्ष', tel: 'క్ష', mal: 'ക്ഷ', kan: 'ಕ್ಷ', ben: 'ক্ষ', iso: 'kṣa' },

  // Matras / Vowel Signs
  'ா': { dev: 'ा', tel: 'ా', mal: 'ാ', kan: 'ಾ', ben: 'া', iso: 'ā' },
  'ி': { dev: 'ि', tel: 'ి', mal: 'ി', kan: 'ಿ', ben: 'ি', iso: 'i' },
  'ீ': { dev: 'ी', tel: 'ీ', mal: 'ീ', kan: 'ೀ', ben: 'ী', iso: 'ī' },
  'ு': { dev: 'ु', tel: 'ు', mal: 'ു', kan: 'ು', ben: 'ু', iso: 'u' },
  'ூ': { dev: 'ू', tel: 'ూ', mal: 'ൂ', kan: 'ೂ', ben: 'ূ', iso: 'ū' },
  'ெ': { dev: 'ॆ', tel: 'ె', mal: 'െ', kan: 'ೆ', ben: 'ে', iso: 'e' },
  'ே': { dev: 'े', tel: 'ే', mal: 'േ', kan: 'ೇ', ben: 'ে', iso: 'ē' },
  'ை': { dev: 'ै', tel: 'ై', mal: 'ൈ', kan: 'ೈ', ben: 'ৈ', iso: 'ai' },
  'ொ': { dev: 'ॊ', tel: 'ొ', mal: 'ൊ', kan: 'ೊ', ben: 'ো', iso: 'o' },
  'ோ': { dev: 'ो', tel: 'ో', mal: 'ോ', kan: 'ೋ', ben: 'ো', iso: 'ō' },
  'ௌ': { dev: 'ौ', tel: 'ౌ', mal: 'ൌ', kan: 'ೌ', ben: 'ৌ', iso: 'au' },
  '்': { dev: '्', tel: '్', mal: '്', kan: '್', ben: '্', iso: '' }
};

/**
 * Transliterates Tamil Unicode text into any Indian Script or ISO 15919 Romanization
 */
export function convertTamilToIndicScript(text: string, targetScript: IndicScriptCode): string {
  if (!text) return '';
  if (targetScript === 'tam') return text;
  if (targetScript === 'iso') {
    return transliterateTamilToISO(text);
  }
  if (targetScript === 'brahmi') {
    return convertTamilToKeezhadiBrahmi(text);
  }

  let out = '';
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    const nextCh = text[i + 1];

    // Compound check (e.g. க்ஷ)
    if (ch === 'க' && nextCh === '்' && text[i + 2] === 'ஷ') {
      const entry = TAMIL_TO_INDIC_DIRECT['க்ஷ'];
      if (entry && (entry as any)[targetScript]) {
        out += (entry as any)[targetScript];
        i += 3;
        continue;
      }
    }

    // Direct entry
    if (TAMIL_TO_INDIC_DIRECT[ch]) {
      const mapped = (TAMIL_TO_INDIC_DIRECT[ch] as any)[targetScript];
      if (mapped !== undefined) {
        out += mapped;
      } else {
        out += ch;
      }
    } else {
      out += ch;
    }
    i++;
  }

  return out;
}

/**
 * Multilingual Translation / Gloss helper for Government and Legal headers
 */
export interface MultilingualHeading {
  tamil: string;
  english: string;
  hindi: string;
  telugu: string;
  malayalam: string;
  kannada: string;
  bengali: string;
  odia: string;
  gujarati: string;
  punjabi: string;
}

export const MULTILINGUAL_GOV_TEMPLATES: MultilingualHeading[] = [
  {
    tamil: 'தமிழ்நாடு அரசு',
    english: 'Government of Tamil Nadu',
    hindi: 'तमिलनाडु सरकार',
    telugu: 'తమిళనాడు ప్రభుత్వం',
    malayalam: 'തമിഴ്നാട് സർക്കാർ',
    kannada: 'ತಮಿಳುನಾಡು ಸರಕಾರ',
    bengali: 'তামিলনাড়ু সরকার',
    odia: 'ତାମିଲନାଡ଼ୁ ସରକାର',
    gujarati: 'તમિલનાડુ સરકાર',
    punjabi: 'ਤਮਿਲਨਾਡੂ ਸਰਕਾਰ'
  },
  {
    tamil: 'அரசாணை (நிலை) எண்',
    english: 'Government Order (Ms) No.',
    hindi: 'शासनादेश (स्थायी) संख्या',
    telugu: 'ప్రభుత్వ ఉత్తర్వు (ఎంఎస్) సంఖ్య',
    malayalam: 'സർക്കാർ ഉത്തരവ് (എം.എസ്) നമ്പർ',
    kannada: 'ಸರಕಾರಿ ಆದೇಶ ಸಂಖ್ಯೆ',
    bengali: 'সরকারি আদেশ নম্বর',
    odia: 'ସରକାରୀ ଆଦେଶ ସଂଖ୍ୟା',
    gujarati: 'સરકારી હુકમ ક્રમાંક',
    punjabi: 'ਸਰਕਾਰੀ ਹੁਕਮ ਨੰਬਰ'
  },
  {
    tamil: 'சுருக்கம் / பொருள்',
    english: 'Abstract / Subject',
    hindi: 'संक्षेप / विषय',
    telugu: 'సారాంశం / విషయం',
    malayalam: 'സംഗ്രഹം / വിഷയം',
    kannada: 'ಸಾರಾಂಶ / ವಿಷಯ',
    bengali: 'সংক্ষেপ / বিষয়',
    odia: 'ସଂକ୍ଷିପ୍ତ / ବିଷୟ',
    gujarati: 'સારાંશ / વિષય',
    punjabi: 'ਸੰਖੇਪ / ਵਿਸ਼ਾ'
  },
  {
    tamil: 'பார்வை / மேற்கோள்',
    english: 'Reference / Read',
    hindi: 'संदर्भ / अवलोकित',
    telugu: 'సూచన / చూడబడినది',
    malayalam: 'പരാമർശം / വായിക്കുക',
    kannada: 'ಉಲ್ಲೇಖ / ಓದಲಾಗಿದೆ',
    bengali: 'রেফারেন্স / দ্রষ্টব্য',
    odia: 'ସନ୍ଦର୍ଭ / ପଠିତ',
    gujarati: 'સંદર્ભ / વંચાણે લીધું',
    punjabi: 'ਹਵਾਲਾ / ਪੜ੍ਹਿਆ ਗਿਆ'
  },
  {
    tamil: 'ஆளுநரின் ஆணைப்படி',
    english: 'By Order of the Governor',
    hindi: 'राज्यपाल के आदेश से',
    telugu: 'గవర్నరు వారి ఆదేశానుసారం',
    malayalam: 'ഗവർണറുടെ ഉത്തരവ് പ്രകാരം',
    kannada: 'ರಾಜ್ಯಪಾಲರ ಆಜ್ಞಾನುಸಾರ',
    bengali: 'রাজ্যপালের আদেশক্রমে',
    odia: 'ରାଜ୍ୟପାଳଙ୍କ ଆଦେଶାନୁସାରେ',
    gujarati: 'રાજ્યપાલના આદેશથી',
    punjabi: 'ਰਾਜਪਾਲ ਦੇ ਹੁਕਮ ਅਨੁਸਾਰ'
  }
];
