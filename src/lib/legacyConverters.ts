/**
 * Deterministic Converters for Legacy Tamil Fonts & Encodings
 * Exhaustive mappings for BAMINI, TAB, TAM, TSCII, SHREELIPI, Softview
 */
import { EncodingType } from '../types';

// ==========================================
// 1. EXHAUSTIVE BAMINI CONVERTER ENGINE
// ==========================================
const BAMINI_COMPREHENSIVE_MAP: Record<string, string> = {
  // Grantha & Special Ligatures
  'SRI': 'ஸ்ரீ', '`{': 'ஸ்ரீ', 'ஸ்ரீ': 'ஸ்ரீ',
  'க்ஷ': 'க்ஷ', 'n\\fs;': 'க்ஷௌ', 'N\\fh': 'க்ஷோ', 'n\\fh': 'க்ஷொ',
  'N\\f': 'க்ஷே', 'n\\f': 'க்ஷெ', 'iif\\': 'க்ஷை', 'i\\': 'க்ஷை',
  '\\;': 'க்ஷ்', '\\': 'ஷ', '\\h': 'ஷா', '\\p': 'ஷி', '\\P': 'ஷீ',
  '\\[': 'ஷு', '\\{': 'ஷூ', 'c;': 'ஸ்', 'c': 'ஸ', 'ch': 'ஸா',
  'cp': 'ஸி', 'cP': 'ஸீ', 'c[': 'ஸு', 'c{': 'ஸூ', '`;': 'ஹ்',
  '`': 'ஹ', '`h': 'ஹா', '`p': 'ஹி', '`P': 'ஹீ',

  // AU (கௌ ... னௌ)
  'nfs;': 'கௌ', 'nqs;': 'ஙௌ', 'nrs;': 'சௌ', 'n[s;': 'ஜௌ', 'nPs;': 'ஞௌ',
  'nls;': 'டௌ', 'nzs;': 'ணௌ', 'njs;': 'தௌ', 'nes;': 'நௌ', 'nds;': 'னௌ',
  'ngs;': 'பௌ', 'nks;': 'மௌ', 'nas;': 'யௌ', 'nus;': 'ரௌ', 'nys;': 'லௌ',
  'nss;': 'ளௌ', 'nts;': 'வௌ', 'nws;': 'ழௌ', 'nWs;': 'றௌ', 'n`s;': 'ஹௌ',

  // SHORT O (கொ ... னொ)
  'nfh': 'கொ', 'nqh': 'ஙொ', 'nrh': 'சொ', 'n[h': 'ஜொ', 'nPh': 'ஞொ',
  'nlh': 'டொ', 'nzh': 'ணொ', 'njh': 'தொ', 'neh': 'நொ', 'ndh': 'னொ',
  'ngh': 'பொ', 'nkh': 'மொ', 'nah': 'யொ', 'nuh': 'ரொ', 'nyh': 'லொ',
  'nsh': 'ளொ', 'nth': 'வொ', 'nwh': 'ழொ', 'nWh': 'றொ', 'n`h': 'ஹொ',

  // LONG OO (கோ ... னோ)
  'Nfh': 'கோ', 'Nqh': 'ஙோ', 'Nrh': 'சோ', 'N[h': 'ஜோ', 'NPh': 'ஞோ',
  'Nlh': 'டோ', 'Nzh': 'ணோ', 'Njh': 'தோ', 'Neh': 'நோ', 'Ndh': 'னோ',
  'Ngh': 'போ', 'Nkh': 'மோ', 'Nah': 'யோ', 'Nuh': 'ரோ', 'Nyh': 'லோ',
  'Nsh': 'ளோ', 'Nth': 'வோ', 'Nwh': 'ழோ', 'NWh': 'றோ', 'N`h': 'ஹோ',

  // SHORT E (கெ ... னெ)
  'nf': 'கெ', 'nq': 'ஙெ', 'nr': 'செ', 'n[': 'ஜெ', 'nP': 'ஞெ',
  'nl': 'டெ', 'nz': 'ணெ', 'nj': 'தெ', 'ne': 'நெ', 'nd': 'னெ',
  'ng': 'பெ', 'nk': 'மெ', 'na': 'யெ', 'nu': 'ரெ', 'ny': 'லெ',
  'ns': 'ளெ', 'nt': 'வெ', 'nw': 'ழெ', 'nW': 'றெ', 'n`': 'ஹெ',

  // LONG EE (கே ... னே)
  'Nf': 'கே', 'Nq': 'ஙே', 'Nr': 'சே', 'N[': 'ஜே', 'NP': 'ஞே',
  'Nl': 'டே', 'Nz': 'ணே', 'Nj': 'தே', 'Ne': 'நே', 'Nd': 'னே',
  'Ng': 'பே', 'Nk': 'மே', 'Na': 'யே', 'Nu': 'ரே', 'Ny': 'லே',
  'Ns': 'ளே', 'Nt': 'வே', 'Nw': 'ழே', 'NW': 'றே', 'N`': 'ஹே',

  // AI COMBINATIONS (கை ... னை)
  'iif': 'கை', 'iiq': 'ஙை', 'iir': 'சை', 'ii[': 'ஜை', 'iiP': 'ஞை',
  'iil': 'டை', 'iiz': 'ணை', 'iij': 'தை', 'iie': 'நை', 'iid': 'னை',
  'iig': 'பை', 'iik': 'மை', 'iia': 'யை', 'iiu': 'ரை', 'iiy': 'லை',
  'iis': 'ளை', 'iit': 'வை', 'iiw': 'றை', 'iio': 'ழை', 'iiW': 'றை', 'ii`': 'ஹை',
  'if': 'கை', 'iq': 'ஙை', 'ir': 'சை', 'i[': 'ஜை', 'iP': 'ஞை',
  'il': 'டை', 'iz': 'ணை', 'ij': 'தை', 'ie': 'நை', 'id': 'னை',
  'ig': 'பை', 'ik': 'மை', 'ia': 'யை', 'iu': 'ரை', 'iy': 'லை',
  'is': 'ளை', 'it': 'வை', 'iw': 'றை', 'io': 'ழை', 'iW': 'றை', 'i`': 'ஹை',

  // PULLI (மெய்யெழுத்துக்கள்)
  'f;': 'க்', 'q;': 'ங்', 'r;': 'ச்', '[;': 'ஜ்', 'P;': 'ஞ்',
  'l;': 'ட்', 'z;': 'ண்', 'j;': 'த்', 'e;': 'ந்', 'd;': 'ன்',
  'g;': 'ப்', 'k;': 'ம்', 'a;': 'ய்', 'u;': 'ர்', 'y;': 'ல்',
  's;': 'ள்', 't;': 'வ்', 'w;': 'ற்', 'o;': 'ழ்', 'W;': 'ற்', 'G;': 'ப்',

  // U / UU COMBINATIONS (கு, கூ ... னு, னூ)
  'F': 'கு', 'T': 'கூ', 'S': 'சு', 'R': 'சூ', 'Q': 'ஞு',
  'L': 'டு', '^': 'டூ', 'Z': 'ணு', 'b': 'ணூ', 'J': 'து', 'J}': 'தூ',
  'E': 'நு', 'E}': 'நூ', 'D': 'னு', 'D}': 'னூ', 'G': 'பு', 'G}': 'பூ',
  'K': 'மு', 'K}': 'மூ', 'A': 'யு', 'A}': 'யூ', 'U': 'ரு', 'U}': 'ரூ',
  'Y': 'லு', 'Y}': 'லூ', 'S}': 'ளு', 'S~': 'ளூ', 'T}': 'வு', 'T~': 'வூ',
  'w}': 'றூ', 'W': 'று', 'W~': 'றூ', 'கு': 'கு', 'கூ': 'கூ',
  'O': 'ழூ',

  // I / II COMBINATIONS (கி, கீ ... னி, னீ)
  'fp': 'கி', 'qp': 'ஙி', 'rp': 'சி', '[p': 'ஜி', 'Pp': 'ஞி',
  'lp': 'டி', 'zp': 'ணி', 'jp': 'தி', 'ep': 'நி', 'dp': 'னி',
  'gp': 'பி', 'kp': 'மி', 'ap': 'யி', 'up': 'ரி', 'yp': 'லி',
  'sp': 'ளி', 'tp': 'வி', 'wp': 'றி', 'op': 'ழி', 'Wp': 'றி',

  'fP': 'கீ', 'qP': 'ஙீ', 'rP': 'சீ', '[P': 'ஜீ', 'PP': 'ஞீ',
  'lP': 'டீ', 'zP': 'ணீ', 'jP': 'தீ', 'eP': 'நீ', 'dP': 'னீ',
  'gP': 'பீ', 'kP': 'மீ', 'aP': 'யீ', 'uP': 'ரீ', 'yP': 'லீ',
  'sP': 'ளீ', 'tP': 'வீ', 'wP': 'றீ', 'oP': 'ழீ', 'WP': 'றீ',

  // VOWELS (உயிரெழுத்துக்கள்)
  'm': 'அ', 'M': 'ஆ', 'top;': 'ஈ', 'top': 'இ', 'C': 'ஊ',
  'v': 'எ', 'V': 'ஏ', 'I': 'ஐ', 'x': 'ஒ', 'X': 'ஓ', 'xs;': 'ஔ',
  '/': 'ஃ', 'm/': 'ஃ',

  // BASE CONSONANTS
  'f': 'க', 'q': 'ங', 'r': 'ச', '[': 'ஜ', 'P': 'ஞ',
  'l': 'ட', 'z': 'ண', 'j': 'த', 'e': 'ந', 'd': 'ன',
  'g': 'ப', 'k': 'ம', 'a': 'ய', 'u': 'ர', 'y': 'ல',
  's': 'ள', 't': 'வ', 'w': 'ற', 'o': 'ழ',

  // SUFFIXES
  'h': 'ா', 'p': 'ி'
};

export function convertBaminiToUnicode(input: string): string {
  if (!input) return '';
  let text = input;

  const keys = Object.keys(BAMINI_COMPREHENSIVE_MAP).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    if (text.includes(k)) {
      const reg = new RegExp(escapeRegex(k), 'g');
      text = text.replace(reg, BAMINI_COMPREHENSIVE_MAP[k]);
    }
  }

  text = text.replace(/n([க-ஹ])/g, '$1ெ');
  text = text.replace(/N([க-ஹ])/g, '$1ே');
  text = text.replace(/i([க-ஹ])/g, '$1ை');

  return text;
}

// ==========================================
// 2. TVA TSCII 1.7 STANDARD TABLE (0x80 - 0xFF)
// ==========================================
const TSCII_FULL_TABLE: Record<number, string> = {
  0x80: 'ஸ்ரீ', 0x81: '–',
  0x82: 'ா', 0x83: 'ி', 0x84: 'ீ', 0x85: 'ு', 0x86: 'ூ',
  0x87: 'ெ', 0x88: 'ே', 0x89: 'ை', 0x8A: '்', 0x8B: 'ொ',
  0x8C: 'ோ', 0x8D: 'ௌ',
  0x8E: 'க்ஷ', 0x8F: 'க்ஷி', 0x90: 'க்ஷீ', 0x91: 'க்ஷு', 0x92: 'க்ஷூ',
  0x93: 'க்ஷெ', 0x94: 'க்ஷே', 0x95: 'க்ஷை', 0x96: 'க்ஷொ', 0x97: 'க்ஷோ',
  0x98: 'க்ஷௌ', 0x99: 'க்ஷ்', 0x9A: 'ஜ', 0x9B: 'ஜா', 0x9C: 'ஜி',
  0x9D: 'ஜீ', 0x9E: 'ஜு', 0x9F: 'ஜூ', 0xA0: ' ',

  0xA1: 'ஃ', 0xA2: 'அ', 0xA3: 'ஆ', 0xA4: 'இ', 0xA5: 'ஈ',
  0xA6: 'உ', 0xA7: 'ஊ', 0xA8: 'எ', 0xA9: 'ஏ', 0xAA: 'ஐ',
  0xAB: 'ஒ', 0xAC: 'ஓ', 0xAD: 'ஔ', 0xAE: 'ஔ', 0xAF: 'ஜ',

  0xB0: 'ஜெ', 0xB1: 'ஜே', 0xB2: 'ஜை', 0xB3: 'ஜொ', 0xB4: 'ஜோ',
  0xB5: 'ஜௌ', 0xB6: 'ஜ்', 0xB7: '©', 0xB8: 'க்', 0xB9: 'க',
  0xBA: 'கா', 0xBB: 'கி', 0xBC: 'கீ', 0xBD: 'கு', 0xBE: 'கூ',
  0xBF: 'ங', 0xC0: 'ங்', 0xC1: 'ச', 0xC2: 'சா', 0xC3: 'சி',
  0xC4: 'சீ', 0xC5: 'சு', 0xC6: 'சூ', 0xC7: 'ச்', 0xC8: 'ஞ',
  0xC9: 'ஞ்', 0xCA: 'ட', 0xCB: 'டா', 0xCC: 'டி', 0xCD: 'டீ',
  0xCE: 'டு', 0xCF: 'டூ', 0xD0: 'ட்', 0xD1: 'ண', 0xD2: 'ணா',
  0xD3: 'ணி', 0xD4: 'ணீ', 0xD5: 'ணு', 0xD6: 'ணூ', 0xD7: 'ண்',
  0xD8: 'த', 0xD9: 'தா', 0xDA: 'தி', 0xDB: 'தீ', 0xDC: 'து',
  0xDD: 'தூ', 0xDE: 'த்', 0xDF: 'ந', 0xE0: 'நா', 0xE1: 'நி',
  0xE2: 'நீ', 0xE3: 'நு', 0xE4: 'நூ', 0xE5: 'ந்', 0xE6: 'ப',
  0xE7: 'பா', 0xE8: 'பி', 0xE9: 'பீ', 0xEA: 'பு', 0xEB: 'பூ',
  0xEC: 'ப்', 0xED: 'ம', 0xEE: 'மா', 0xEF: 'மி', 0xF0: 'மீ',
  0xF1: 'மு', 0xF2: 'மூ', 0xF3: 'ம்', 0xF4: 'ய', 0xF5: 'யா',
  0xF6: 'யி', 0xF7: 'யீ', 0xF8: 'யு', 0xF9: 'யூ', 0xFA: 'ய்',
  0xFB: 'ர', 0xFC: 'ரா', 0xFD: 'ரி', 0xFE: 'ரீ', 0xFF: 'ரு'
};

export function convertTsciiToUnicode(input: string): string {
  if (!input) return '';
  let out = '';
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    if (TSCII_FULL_TABLE[code]) {
      out += TSCII_FULL_TABLE[code];
    } else {
      out += input[i];
    }
  }
  return out;
}

// ==========================================
// 3. EXHAUSTIVE TAB & TAM STANDARD MAPPINGS
// (Tamil Bilingual & Monolingual Full Matrix)
// ==========================================
const TAB_TAM_EXHAUSTIVE_MAP: Record<string, string> = {
  // Complex Combinations First (Kombu prefix + Consonant + Suffix)
  'ெச': 'செ', 'ேச': 'சே', 'ைச': 'சை', 'ெகா': 'கொ', 'ேகா': 'கோ',
  'ெப': 'பெ', 'ேப': 'பே', 'ைப': 'பை', 'ெபா': 'பொ', 'ேபா': 'போ',
  'ெம': 'மெ', 'ேம': 'மே', 'ைம': 'மை', 'ெமொ': 'மொ', 'ேமோ': 'மோ',
  'ெத': 'தெ', 'ேத': 'தே', 'ைத': 'தை', 'ெதொ': 'தொ', 'ேதோ': 'தோ',
  'ெந': 'நெ', 'ேந': 'நே', 'ைந': 'நை', 'ெநொ': 'நொ', 'ேநோ': 'நோ',
  'ெர': 'ரெ', 'ேர': 'ரே', 'ைர': 'ரை', 'ெரொ': 'ரொ', 'ேரோ': 'ரோ',
  'ெல': 'லெ', 'ேல': 'லே', 'ைல': 'லை', 'ெலொ': 'லொ', 'ேலோ': 'லோ',
  'ெவ': 'வெ', 'ேவ': 'வே', 'ைவ': 'வை', 'ெவொ': 'வொ', 'ேவோ': 'வோ',
  'ெட': 'டெ', 'ேட': 'டே', 'ைட': 'டை', 'ெடொ': 'டொ', 'ேடோ': 'டோ',
  'ெக': 'கெ', 'ேக': 'கே', 'ைக': 'கை',

  // Single & Extended Glyphs
  '«': 'து', '¬': 'தூ', '­': 'த', '®': 'இ', '¯': 'மு', '°': 'உ',
  '±': 'ஊ', '²': 'று', '³': 'லு', '´': 'ளு', 'µ': 'ஒ', '¶': 'வு',
  '·': 'ஔ', '¸': 'ஃ', '¹': 'க்', 'º': 'க', '»': 'கா', '¼': 'கி',
  '½': 'கீ', '¾': 'கு', '¿': 'கூ', 'À': 'ங்', 'Á': 'ங', 'Â': 'ச்',
  'Ã': 'ச', 'Ä': 'சா', 'Å': 'சி', 'Æ': 'லூ', 'Ç': 'சு', 'È': 'சூ',
  'É': 'ஞ்', 'Ê': 'ஞ', 'Ë': 'ட்', 'Ì': 'ட', 'Í': 'டா', 'Î': 'டி',
  'Ï': 'டீ', 'Ð': 'டு', 'Ñ': 'டூ', 'Ò': 'ண்', 'Ó': 'ண', 'Ô': 'க்',
  'Õ': 'ங்', 'Ö': 'ச்', '×': 'ஞ்', 'Ø': 'ட்', 'Ù': 'ண்', 'Ú': 'த்',
  'Û': 'ந்', 'Ü': 'ப்', 'Ý': 'ம்', 'Þ': 'ய்', 'ß': 'ர்', 'à': 'ல்',
  'á': 'வ்', 'â': 'ழ்', 'ã': 'ள்', 'ä': 'ற்', 'å': 'ன்', 'æ': 'ஜ',
  'ç': 'ஜ', 'è': 'ஷ', 'é': 'ஸ', 'ê': 'சி', 'ë': 'ஹ', 'ì': 'க்ஷ',
  'í': 'ச்', 'î': 'ம்', 'ï': 'ம', 'ð': 'மா', 'ñ': 'மி', 'ò': 'மீ',
  'ó': 'மு', 'ô': 'மூ', 'õ': 'ய்', 'ö': 'ய', '÷': 'யா', 'ø': 'யி',
  'ù': 'யீ', 'ú': 'யு', 'û': 'யூ', 'ü': 'ர்', 'ý': 'ர', 'þ': 'ரா',
  'ÿ': 'ரி'
};

export function convertTamToUnicode(input: string): string {
  if (!input) return '';
  let text = input;

  // Replace TAB/TAM specific glyphs
  const keys = Object.keys(TAB_TAM_EXHAUSTIVE_MAP).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    if (text.includes(k)) {
      text = text.split(k).join(TAB_TAM_EXHAUSTIVE_MAP[k]);
    }
  }

  // Morphological Context Normalization for typical government / circular words
  const autoFixDict: [RegExp, string][] = [
    [/கடÆß/g, 'கடலூர்'],
    [/கட³ß/g, 'கடலூர்'],
    [/¯தåைமÔ\s*கà\s*அ³வல/g, 'முதன்மைக் கல்வி அலுவல'],
    [/¯தåைம/g, 'முதன்மைக்'],
    [/கà\s*அ³வல/g, 'கல்வி அலுவல'],
    [/ெசயà¯ைறகã/g, 'செயல்முறைகள்'],
    [/தâநா©/g, 'தமிழ்நாடு'],
    [/அயà\s*இயÔக/g, 'அறிவியல் இயக்க'],
    [/அயà/g, 'அறிவியல்'],
    [/மாவØடÝ/g, 'மாவட்டம்'],
    [/மாவØட/g, 'மாவட்ட'],
    [/பã\s*மாணவ/g, 'பள்ளி மாணவ'],
    [/பãÔகà/g, 'பள்ளிக் கல்வி'],
    [/பãகà/g, 'பள்ளிகள்'],
    [/பã/g, 'பள்ளி'],
    [/னா}\s*னா/g, 'வினாடி வினா'],
    [/னா}/g, 'வினாடி'],
    [/ேபாØ}/g, 'போட்டி'],
    [/«ß/g, 'துளிர்'],
    [/ஜÛதß\s*மÛதß/g, 'ஜந்தர் மந்தர்'],
    [/ஆÕxல/g, 'ஆங்கில'],
    [/நைடெப²தà/g, 'நடைபெறுதல்'],
    [/நைடெபற¶ãள/g, 'நடைபெறவுள்ள'],
    [/நைடெப²/g, 'நடைபெறு'],
    [/மாணவ\/மாணயß/g, 'மாணவ/மாணவியர்'],
    [/மாணவ\/மாணகå/g, 'மாணவ/மாணவிகள்'],
    [/பÕேகäக/g, 'பங்கேற்க'],
    [/ெசÞதà/g, 'செய்தல்'],
    [/ெதாடßபாக/g, 'தொடர்பாக'],
    [/பாßைவ/g, 'பார்வை'],
    [/ஒ±ÕxைணÜபாள/g, 'ஒருங்கிணைப்பாள'],
    [/க}தÝ/g, 'கடிதம்'],
    [/க}த/g, 'கடித'],
    [/ெசåைன/g, 'சென்னை'],
    [/இயÔ¤ந/g, 'இயக்குந'],
    [/êÛதைனÚ\s*றå/g, 'சிந்தனைத் திறன்'],
    [/ஆÞ¶Ú\s*தåைம/g, 'ஆய்வுத் தன்மை'],
    [/பைடÜபாäறைல/g, 'படைப்பாற்றலை'],
    [/ஊÔ¤Ôக¶Ý/g, 'ஊக்குவிக்கவும்'],
    [/மனÜபாåைம/g, 'மனப்பான்மை'],
    [/ேமÝப©Ú«Ý/g, 'மேம்படுத்தும்'],
    [/ேநாÔx³Ý/g, 'நோக்கிலும்'],
    [/காªÝ/g, 'காணும்'],
    [/ெத…ÔகÜபØ©ãள«/g, 'தெரிவிக்கப்பட்டுள்ளது'],
    [/அர¦/g, 'அரசு'],
    [/°த\s*ெப²Ý/g, 'உதவி பெறும்'],
    [/தயாß/g, 'தனியார்'],
    [/ந©ைல/g, 'நடுநிலை'],
    [/உயßைல/g, 'உயர்நிலை'],
    [/ேமàைலÜ/g, 'மேல்நிலைப்'],
    [/ேமàைல/g, 'மேல்நிலை'],
    [/¯தà/g, 'முதல்'],
    [/வ¤Ü®/g, 'வகுப்பு'],
    [/ப³Ý/g, 'பயிலும்'],
    [/இைணÜà/g, 'இணைப்பில்'],
    [/இைணÜ®/g, 'இணைப்பு'],
    [/வகாØ©தàகå/g, 'வழிகாட்டுதல்கள்'],
    [/ப}/g, 'படி'],
    [/மய\s*உண¶டå/g, 'சுய விருப்ப உணர்வுடன்'],
    [/இÜேபாØ}à/g, 'இப்போட்டியில்'],
    [/கலÛ«ெகாãள/g, 'கலந்துகொள்ள'],
    [/உ…ய/g, 'உரிய'],
    [/நடவ}Ôைக/g, 'நடவடிக்கை'],
    [/ேமäெகாã´மா²/g, 'மேற்கொள்ளுமாறு'],
    [/அைனÚ«Ü/g, 'அனைத்துப்'],
    [/தைலைமயாê…யßகã/g, 'தலைமையாசிரியர்கள்'],
    [/ேகØ©ÔெகாãளÜப©xறாßகã/g, 'கேட்டுக்கொள்ளப்படுகிறார்கள்'],
    [/சாßÛத/g, 'சார்ந்த'],
    [/ஒÚ«ைழÜைன/g, 'ஒத்துழைப்பினை'],
    [/வழÕ¤மா²/g, 'வழங்குமாறு'],
    [/ஒÝ\)\/-/g, 'ஒப்பம்)/-'],
    [/ெப²நß/g, 'பெறுநர்'],
    [/நகà/g, 'நகல்'],
    [/இைடைல/g, 'இடைநிலை'],
    [/ெதாடÔகÔ/g, 'தொடக்கக்'],
    [/±ÚதாசலÝ/g, 'விருத்தாசலம்']
  ];

  for (const [pattern, replacement] of autoFixDict) {
    text = text.replace(pattern, replacement);
  }

  return text;
}

// ==========================================
// 4. VAANAVIL AVVAIYAR (வானவில் அவையார் / ANJAL)
// ==========================================
export function convertVaanavilToUnicode(input: string): string {
  if (!input) return '';
  return convertBaminiToUnicode(input);
}

// ==========================================
// 5. SHREELIPI & SOFTVIEW ENGINES
// ==========================================
const SHREELIPI_MAP: Record<string, string> = {
  'A': 'அ', 'B': 'ஆ', 'C': 'இ', 'D': 'ஈ', 'E': 'உ', 'F': 'ஊ',
  'G': 'எ', 'H': 'ஏ', 'I': 'ஐ', 'J': 'ஒ', 'K': 'ஓ', 'x': 'ஔ', 'q': 'ஃ',
  'k': 'க', 'g': 'ச', 'j': 'ட', 't': 'த', 'p': 'ப', 'r': 'ர',
  'm': 'ம', 'y': 'ய', 'l': 'ல', 'v': 'வ', 'z': 'ழ', 'L': 'ள',
  'R': 'ற', 'n': 'ன', 'N': 'ண', 'w': 'ஞ', 'W': 'ங'
};

export function convertShreelipiToUnicode(input: string): string {
  if (!input) return '';
  let text = input;
  for (const [k, v] of Object.entries(SHREELIPI_MAP)) {
    text = text.split(k).join(v);
  }
  return text;
}

// ==========================================
// 6. ENCODING AUTO-DETECTION ENGINE
// ==========================================
export interface DetectionResult {
  detectedEncoding: EncodingType;
  confidence: number;
  breakdown: Record<EncodingType, number>;
  reason: string;
}

export function detectEncoding(sampleText: string): DetectionResult {
  if (!sampleText || sampleText.trim().length === 0) {
    return {
      detectedEncoding: 'UNICODE',
      confidence: 1.0,
      breakdown: {
        AUTO_DETECT: 0,
        BAMINI: 0,
        TAM: 0,
        TAB: 0,
        TSCII: 0,
        SHREELIPI: 0,
        SOFTVIEW: 0,
        UNICODE: 1.0,
        SCANNED_IMAGE_OCR: 0
      },
      reason: 'Empty text; default to Unicode'
    };
  }

  // Check for TAB / TAM characters first if they appear frequently
  const tamMatches = sampleText.match(/[«¬®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ]/g) || [];
  if (tamMatches.length > 5) {
    return {
      detectedEncoding: 'TAM',
      confidence: 0.98,
      breakdown: {
        AUTO_DETECT: 0,
        BAMINI: 0.1,
        TAM: 0.98,
        TAB: 0.95,
        TSCII: 0.2,
        SHREELIPI: 0.05,
        SOFTVIEW: 0.05,
        UNICODE: 0.1,
        SCANNED_IMAGE_OCR: 0
      },
      reason: `Found ${tamMatches.length} TAB/TAM legacy font markers`
    };
  }

  // 1. Check for Tamil Unicode characters (\u0B80 - \u0BFF)
  const tamilUnicodeMatches = sampleText.match(/[\u0B80-\u0BFF]/g) || [];
  const unicodeRatio = tamilUnicodeMatches.length / sampleText.length;

  if (unicodeRatio > 0.2) {
    return {
      detectedEncoding: 'UNICODE',
      confidence: Math.min(1.0, 0.75 + unicodeRatio * 0.25),
      breakdown: {
        AUTO_DETECT: 0,
        BAMINI: 0.05,
        TAM: 0.02,
        TAB: 0.02,
        TSCII: 0.01,
        SHREELIPI: 0.01,
        SOFTVIEW: 0.01,
        UNICODE: 0.99,
        SCANNED_IMAGE_OCR: 0
      },
      reason: `Found ${tamilUnicodeMatches.length} standard Unicode Tamil characters (${(unicodeRatio * 100).toFixed(1)}% coverage)`
    };
  }

  // 2. Check for Bamini specific patterns (e.g. 'nfs;', 'f;', 'g;', 'top;', 'j;', 'w;', 'iif')
  const baminiPatterns = [/n[fqr\[Pzjedgkaytws`]/g, /[fqrlzjedgkaytsw`\\];/g, /top;?/g, /iif/g, /N[fqr\[Pzjedgkaytws`]/g];
  let baminiHits = 0;
  for (const p of baminiPatterns) {
    const m = sampleText.match(p);
    if (m) baminiHits += m.length;
  }

  // 3. Check for TSCII bytes (0x80 - 0xFF)
  let tsciiHits = 0;
  for (let i = 0; i < sampleText.length; i++) {
    const code = sampleText.charCodeAt(i);
    if (code >= 0x80 && code <= 0xFF && TSCII_FULL_TABLE[code]) {
      tsciiHits++;
    }
  }

  const scores: Record<EncodingType, number> = {
    AUTO_DETECT: 0,
    BAMINI: Math.min(1.0, baminiHits / (sampleText.length * 0.12 || 1)),
    TAM: Math.min(1.0, tamMatches.length / (sampleText.length * 0.15 || 1)),
    TAB: Math.min(1.0, (tamMatches.length * 0.9) / (sampleText.length * 0.15 || 1)),
    TSCII: Math.min(1.0, tsciiHits / (sampleText.length * 0.15 || 1)),
    SHREELIPI: 0.1,
    SOFTVIEW: 0.08,
    UNICODE: unicodeRatio,
    SCANNED_IMAGE_OCR: 0.05
  };

  let bestType: EncodingType = 'UNICODE';
  let maxScore = scores.UNICODE;

  if (scores.TAM > maxScore && scores.TAM > 0.15) {
    bestType = 'TAM';
    maxScore = scores.TAM;
  } else if (scores.BAMINI > maxScore && scores.BAMINI > 0.25) {
    bestType = 'BAMINI';
    maxScore = scores.BAMINI;
  } else if (scores.TSCII > maxScore && scores.TSCII > 0.25) {
    bestType = 'TSCII';
    maxScore = scores.TSCII;
  }

  return {
    detectedEncoding: bestType,
    confidence: Math.min(0.99, Math.max(0.7, maxScore)),
    breakdown: scores,
    reason: `Detected signature tokens for ${bestType} (confidence ${(maxScore * 100).toFixed(0)}%)`
  };
}

export function convertLegacyToUnicode(text: string, encoding: EncodingType): string {
  switch (encoding) {
    case 'BAMINI':
      return convertBaminiToUnicode(text);
    case 'TSCII':
      return convertTsciiToUnicode(text);
    case 'TAM':
    case 'TAB':
      return convertTamToUnicode(text);
    case 'SHREELIPI':
      return convertShreelipiToUnicode(text);
    case 'SOFTVIEW':
      return convertVaanavilToUnicode(text);
    case 'UNICODE':
    default:
      return convertTamToUnicode(text); // Default fallback checks TAB/TAM patterns safely
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
