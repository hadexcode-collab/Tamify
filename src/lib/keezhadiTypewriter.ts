/**
 * Keezhadi Typewriting & Epigraphy Input Engine (கீழடி தட்டச்சு & தமிழி உள்ளீட்டுப் பொறி)
 * 
 * Supports:
 * 1. Keezhadi / Tamil99 Standard Layout
 * 2. Anjal Phonetic Transliteration (அஞ்சல் ஒலிபெயர்ப்பு)
 * 3. BAMINI Legacy Mechanical Typewriter Keymap (பாமினி தட்டச்சு முறை)
 * 4. Keezhadi Tamil-Brahmi Epigraphical Script & Archaic Symbols (கீழடி தமிழி எழுத்துக்கள்)
 */

export type TypewriterLayoutMode = 'KEEZHADI_TAMIL99' | 'ANJAL_PHONETIC' | 'BAMINI_TYPEWRITER' | 'TAMIL_BRAHMI_EPIGRAPHY';

export interface VirtualKeyDef {
  keyId: string;
  label: string;
  subLabel?: string;
  code: string;
  actionValue?: string;
  shiftValue?: string;
  type: 'CONSONANT' | 'VOWEL' | 'MODIFIER' | 'CONTROL' | 'SPECIAL' | 'PULLI';
  width?: string; // Tailwind width class
}

// ==========================================
// 1. TAMIL-BRAHMI (KEEZHADI / TAMIZHI) MAP
// ==========================================
// Maps modern Tamil characters to Unicode Tamil-Brahmi (U+11000 - U+1107F)
export const TAMIL_TO_BRAHMI_MAP: Record<string, string> = {
  // Uyir (Independent Vowels)
  'அ': '𑀅',
  'ஆ': '𑀆',
  'இ': '𑀇',
  'ஈ': '𑀈',
  'உ': '𑀉',
  'ஊ': '𑀊',
  'எ': '𑀏',
  'ஏ': '𑀏', // Brahmi has single E
  'ஐ': '𑀐',
  'ஒ': '𑀑',
  'ஓ': '𑀑',
  'ஔ': '𑀒',
  'ஃ': '𑀃',

  // Mei (Base Consonants with inherent 'a')
  'க': '𑀓',
  'ங': '𑀗',
  'ச': '𑀘',
  'ஞ': '𑀜',
  'ட': '𑀝',
  'ண': '𑀡',
  'த': '𑀢',
  'ந': '𑀦',
  'ப': '𑀧',
  'ம': '𑀫',
  'ய': '𑀬',
  'ர': '𑀭',
  'ல': '𑀮',
  'வ': '𑀯',
  'ழ': '𑀵', // Dravidian retroflex fricative
  'ள': '𑀴',
  'ற': '𑀶', // Dravidian alveolar trill
  'ன': '𑀷', // Dravidian alveolar nasal
  'ஜ': '𑀚',
  'ஸ': '𑀲',
  'ஷ': '𑀱',
  'ஹ': '𑀳',

  // Vowel Diacritics (Uyirmei signs)
  'ா': '𑀸',
  'ி': '𑀺',
  'ீ': '𑀻',
  'ு': '𑀼',
  'ூ': '𑀽',
  'ெ': '𑁂',
  'ே': '𑁂',
  'ை': '𑁃',
  'ொ': '𑁂𑀸',
  'ோ': '𑁂𑀸',
  'ௌ': '𑁂𑀼',
  '்': '𑁆' // Virama / Pulli in Tamil Brahmi
};

/**
 * Converts modern Unicode Tamil text to Keezhadi Tamil-Brahmi script
 */
export function convertTamilToKeezhadiBrahmi(text: string): string {
  if (!text) return '';
  let res = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (TAMIL_TO_BRAHMI_MAP[ch]) {
      res += TAMIL_TO_BRAHMI_MAP[ch];
    } else {
      res += ch;
    }
  }
  return res;
}

// ==========================================
// 2. ANJAL PHONETIC INPUT PARSER
// ==========================================

const ANJAL_VOWELS: [string, string, string][] = [
  // [Roman pattern, Standalone Uyir, Uyirmei Diacritic]
  ['aai', 'ஆய்', 'ாய்'],
  ['aau', 'ஆவ்', 'ாவ்'],
  ['aa', 'ஆ', 'ா'],
  ['A', 'ஆ', 'ா'],
  ['ai', 'ஐ', 'ை'],
  ['ay', 'ஐ', 'ை'],
  ['au', 'ஔ', 'ௌ'],
  ['ou', 'ஔ', 'ௌ'],
  ['ee', 'ஈ', 'ீ'],
  ['ii', 'ஈ', 'ீ'],
  ['I', 'ஈ', 'ீ'],
  ['oo', 'ஊ', 'ூ'],
  ['uu', 'ஊ', 'ூ'],
  ['U', 'ஊ', 'ூ'],
  ['ae', 'ஏ', 'ே'],
  ['E', 'ஏ', 'ே'],
  ['oa', 'ஓ', 'ோ'],
  ['O', 'ஓ', 'ோ'],
  ['a', 'அ', ''],
  ['i', 'இ', 'ி'],
  ['u', 'உ', 'ு'],
  ['e', 'எ', 'ெ'],
  ['o', 'ஒ', 'ொ']
];

const ANJAL_CONSONANTS: [string, { mei: string; base: string }][] = [
  ['sri', { mei: 'ஸ்ரீ', base: 'ஸ்ரீ' }],
  ['shri', { mei: 'ஸ்ரீ', base: 'ஸ்ரீ' }],
  ['ksh', { mei: 'க்ஷ்', base: 'க்ஷ' }],
  ['th', { mei: 'த்', base: 'த' }],
  ['dh', { mei: 'த்', base: 'த' }],
  ['zh', { mei: 'ழ்', base: 'ழ' }],
  ['sh', { mei: 'ஷ்', base: 'ஷ' }],
  ['ch', { mei: 'ச்', base: 'ச' }],
  ['nj', { mei: 'ஞ்', base: 'ஞ' }],
  ['gn', { mei: 'ஞ்', base: 'ஞ' }],
  ['ng', { mei: 'ங்', base: 'ங' }],
  ['nd', { mei: 'ண்', base: 'ண' }],
  ['nn', { mei: 'ண்', base: 'ண' }],
  ['rr', { mei: 'ற்', base: 'ற' }],
  ['tt', { mei: 'ட்', base: 'ட' }],
  ['ll', { mei: 'ள்', base: 'ள' }],
  ['lh', { mei: 'ள்', base: 'ள' }],
  ['k', { mei: 'க்', base: 'க' }],
  ['g', { mei: 'க்', base: 'க' }],
  ['c', { mei: 'ச்', base: 'ச' }],
  ['s', { mei: 'ஸ்', base: 'ஸ' }],
  ['t', { mei: 'ட்', base: 'ட' }],
  ['d', { mei: 'ட்', base: 'ட' }],
  ['T', { mei: 'ட்', base: 'ட' }],
  ['D', { mei: 'ட்', base: 'ட' }],
  ['N', { mei: 'ண்', base: 'ண' }],
  ['n', { mei: 'ந்', base: 'ந' }],
  ['p', { mei: 'ப்', base: 'ப' }],
  ['b', { mei: 'ப்', base: 'ப' }],
  ['m', { mei: 'ம்', base: 'ம' }],
  ['y', { mei: 'ய்', base: 'ய' }],
  ['r', { mei: 'ர்', base: 'ர' }],
  ['R', { mei: 'ற்', base: 'ற' }],
  ['l', { mei: 'ல்', base: 'ல' }],
  ['L', { mei: 'ள்', base: 'ள' }],
  ['v', { mei: 'வ்', base: 'வ' }],
  ['w', { mei: 'வ்', base: 'வ' }],
  ['z', { mei: 'ழ்', base: 'ழ' }],
  ['j', { mei: 'ஜ்', base: 'ஜ' }],
  ['h', { mei: 'ஹ்', base: 'ஹ' }],
  ['S', { mei: 'ஷ்', base: 'ஷ' }]
];

/**
 * High-precision Syllable-by-Syllable Anjal phonetic transliteration parser
 */
export function transliterateAnjalToTamil(input: string): string {
  if (!input) return '';
  let result = '';
  let i = 0;

  while (i < input.length) {
    const sub = input.slice(i);

    // Aytham check
    if (sub.startsWith('q') || sub.startsWith('akh')) {
      result += 'ஃ';
      i += sub.startsWith('akh') ? 3 : 1;
      continue;
    }

    // Non-letter characters (whitespace, punctuation, numbers) pass through directly
    if (!/^[a-zA-Z]/.test(sub)) {
      result += sub[0];
      i += 1;
      continue;
    }

    // 1. Check for Consonants
    let matchedConsonant: { mei: string; base: string } | null = null;
    let consonantLen = 0;

    for (const [cPattern, entry] of ANJAL_CONSONANTS) {
      if (sub.startsWith(cPattern)) {
        matchedConsonant = entry;
        consonantLen = cPattern.length;
        break;
      }
    }

    if (matchedConsonant) {
      // Check if followed immediately by a recognized vowel pattern
      const afterConsonant = input.slice(i + consonantLen);
      let matchedVowelSign: string | null = null;
      let vowelLen = 0;

      for (const [vPattern, , vSign] of ANJAL_VOWELS) {
        if (afterConsonant.startsWith(vPattern)) {
          matchedVowelSign = vSign;
          vowelLen = vPattern.length;
          break;
        }
      }

      if (matchedVowelSign !== null) {
        // Uyirmei formed (base + diacritic)
        result += matchedConsonant.base + matchedVowelSign;
        i += consonantLen + vowelLen;
      } else {
        // Pure Mei consonant (with pulli)
        result += matchedConsonant.mei;
        i += consonantLen;
      }
      continue;
    }

    // 2. Standalone Vowels (Uyir)
    let matchedUyir: string | null = null;
    let uyirLen = 0;

    for (const [vPattern, uyir] of ANJAL_VOWELS) {
      if (sub.startsWith(vPattern)) {
        matchedUyir = uyir;
        uyirLen = vPattern.length;
        break;
      }
    }

    if (matchedUyir) {
      result += matchedUyir;
      i += uyirLen;
      continue;
    }

    // Fallback: copy single character
    result += sub[0];
    i += 1;
  }

  // Refine common phonetic word patterns & nasals (e.g. வநக்கம் -> வணக்கம், பநம் -> பணம்)
  return result
    .replace(/வநக்கம்/g, 'வணக்கம்')
    .replace(/வநக்க/g, 'வணக்க')
    .replace(/பநம்/g, 'பணம்')
    .replace(/கந்([ \n.,;!?]|$)/g, 'கண்$1')
    .replace(/மநசு/g, 'மனசு')
    .replace(/மநம்/g, 'மனம்')
    .replace(/ந்([ \n.,;!?]|$)/g, 'ன்$1')
    .replace(/ந்ந்/g, 'ன்ன')
    .replace(/ந்([கசடதப])/g, 'ந்$1');
}

// ==========================================
// 3. VIRTUAL KEYBOARD LAYOUT DEFINITIONS
// ==========================================

export const KEEZHADI_TAMIL99_KEYS: VirtualKeyDef[][] = [
  // Row 1: Numbers & Archaic Signs
  [
    { keyId: 'k-1', label: '1', subLabel: '௧', code: 'Digit1', actionValue: '1', shiftValue: '௧', type: 'SPECIAL' },
    { keyId: 'k-2', label: '2', subLabel: '௨', code: 'Digit2', actionValue: '2', shiftValue: '௨', type: 'SPECIAL' },
    { keyId: 'k-3', label: '3', subLabel: '௩', code: 'Digit3', actionValue: '3', shiftValue: '௩', type: 'SPECIAL' },
    { keyId: 'k-4', label: '4', subLabel: '௪', code: 'Digit4', actionValue: '4', shiftValue: '௪', type: 'SPECIAL' },
    { keyId: 'k-5', label: '5', subLabel: '௫', code: 'Digit5', actionValue: '5', shiftValue: '௫', type: 'SPECIAL' },
    { keyId: 'k-6', label: '6', subLabel: '௬', code: 'Digit6', actionValue: '6', shiftValue: '௬', type: 'SPECIAL' },
    { keyId: 'k-7', label: '7', subLabel: '௭', code: 'Digit7', actionValue: '7', shiftValue: '௭', type: 'SPECIAL' },
    { keyId: 'k-8', label: '8', subLabel: '௮', code: 'Digit8', actionValue: '8', shiftValue: '௮', type: 'SPECIAL' },
    { keyId: 'k-9', label: '9', subLabel: '௯', code: 'Digit9', actionValue: '9', shiftValue: '௯', type: 'SPECIAL' },
    { keyId: 'k-0', label: '0', subLabel: '௰', code: 'Digit0', actionValue: '0', shiftValue: '௰', type: 'SPECIAL' },
    { keyId: 'k-100', label: '௱', subLabel: '100', code: 'Minus', actionValue: '௱', shiftValue: '௲', type: 'SPECIAL' },
    { keyId: 'k-bks', label: 'DEL', code: 'Backspace', actionValue: 'BACKSPACE', type: 'CONTROL', width: 'w-16' }
  ],
  // Row 2: Vowels & Uyirmei modifiers
  [
    { keyId: 'k-tab', label: 'TAB', code: 'Tab', actionValue: '\t', type: 'CONTROL', width: 'w-14' },
    { keyId: 'k-aa', label: 'ஆ', subLabel: 'ா', code: 'KeyQ', actionValue: 'ஆ', shiftValue: 'ா', type: 'VOWEL' },
    { keyId: 'k-ee', label: 'ஈ', subLabel: 'ீ', code: 'KeyW', actionValue: 'ஈ', shiftValue: 'ீ', type: 'VOWEL' },
    { keyId: 'k-uu', label: 'ஊ', subLabel: 'ூ', code: 'KeyE', actionValue: 'ஊ', shiftValue: 'ூ', type: 'VOWEL' },
    { keyId: 'k-e2', label: 'ஏ', subLabel: 'ே', code: 'KeyR', actionValue: 'ஏ', shiftValue: 'ே', type: 'VOWEL' },
    { keyId: 'k-ai', label: 'ஐ', subLabel: 'ை', code: 'KeyT', actionValue: 'ஐ', shiftValue: 'ை', type: 'VOWEL' },
    { keyId: 'k-su', label: 'சு', subLabel: 'ச்', code: 'KeyY', actionValue: 'சு', shiftValue: 'ச்', type: 'CONSONANT' },
    { keyId: 'k-tu', label: 'டு', subLabel: 'ட்', code: 'KeyU', actionValue: 'டு', shiftValue: 'ட்', type: 'CONSONANT' },
    { keyId: 'k-pa', label: 'ப', subLabel: 'ப்', code: 'KeyI', actionValue: 'ப', shiftValue: 'ப்', type: 'CONSONANT' },
    { keyId: 'k-ma', label: 'ம', subLabel: 'ம்', code: 'KeyO', actionValue: 'ம', shiftValue: 'ம்', type: 'CONSONANT' },
    { keyId: 'k-tha', label: 'த', subLabel: 'த்', code: 'KeyP', actionValue: 'த', shiftValue: 'த்', type: 'CONSONANT' },
    { keyId: 'k-ay', label: 'ஃ', subLabel: 'ஸ்ரீ', code: 'BracketLeft', actionValue: 'ஃ', shiftValue: 'ஸ்ரீ', type: 'SPECIAL' }
  ],
  // Row 3: Uyir & Mei
  [
    { keyId: 'k-cap', label: 'CAPS', code: 'CapsLock', actionValue: 'CAPS', type: 'CONTROL', width: 'w-16' },
    { keyId: 'k-a', label: 'அ', subLabel: '்', code: 'KeyA', actionValue: 'அ', shiftValue: '்', type: 'VOWEL' },
    { keyId: 'k-i', label: 'இ', subLabel: 'ி', code: 'KeyS', actionValue: 'இ', shiftValue: 'ி', type: 'VOWEL' },
    { keyId: 'k-u', label: 'உ', subLabel: 'ு', code: 'KeyD', actionValue: 'உ', shiftValue: 'ு', type: 'VOWEL' },
    { keyId: 'k-e', label: 'எ', subLabel: 'ெ', code: 'KeyF', actionValue: 'எ', shiftValue: 'ெ', type: 'VOWEL' },
    { keyId: 'k-o', label: 'ஒ', subLabel: 'ொ', code: 'KeyG', actionValue: 'ஒ', shiftValue: 'ொ', type: 'VOWEL' },
    { keyId: 'k-ka', label: 'க', subLabel: 'க்', code: 'KeyH', actionValue: 'க', shiftValue: 'க்', type: 'CONSONANT' },
    { keyId: 'k-ta2', label: 'ட', subLabel: 'ட்', code: 'KeyJ', actionValue: 'ட', shiftValue: 'ட்', type: 'CONSONANT' },
    { keyId: 'k-na', label: 'ந', subLabel: 'ந்', code: 'KeyK', actionValue: 'ந', shiftValue: 'ந்', type: 'CONSONANT' },
    { keyId: 'k-ya', label: 'ய', subLabel: 'ய்', code: 'KeyL', actionValue: 'ய', shiftValue: 'ய்', type: 'CONSONANT' },
    { keyId: 'k-pulli', label: '்', subLabel: 'புள்ளி', code: 'Semicolon', actionValue: '்', shiftValue: ':', type: 'PULLI' },
    { keyId: 'k-ent', label: 'ENTER', code: 'Enter', actionValue: '\n', type: 'CONTROL', width: 'w-20' }
  ],
  // Row 4: Bottom row consonants & grantha
  [
    { keyId: 'k-sft', label: 'SHIFT', code: 'ShiftLeft', actionValue: 'SHIFT', type: 'CONTROL', width: 'w-20' },
    { keyId: 'k-o2', label: 'ஓ', subLabel: 'ோ', code: 'KeyZ', actionValue: 'ஓ', shiftValue: 'ோ', type: 'VOWEL' },
    { keyId: 'k-au', label: 'ஔ', subLabel: 'ௌ', code: 'KeyX', actionValue: 'ஔ', shiftValue: 'ௌ', type: 'VOWEL' },
    { keyId: 'k-zha', label: 'ழ', subLabel: 'ழ்', code: 'KeyC', actionValue: 'ழ', shiftValue: 'ழ்', type: 'CONSONANT' },
    { keyId: 'k-la', label: 'ள', subLabel: 'ள்', code: 'KeyV', actionValue: 'ள', shiftValue: 'ள்', type: 'CONSONANT' },
    { keyId: 'k-ra', label: 'ற', subLabel: 'ற்', code: 'KeyB', actionValue: 'ற', shiftValue: 'ற்', type: 'CONSONANT' },
    { keyId: 'k-na2', label: 'ன', subLabel: 'ன்', code: 'KeyN', actionValue: 'ன', shiftValue: 'ன்', type: 'CONSONANT' },
    { keyId: 'k-na3', label: 'ண', subLabel: 'ண்', code: 'KeyM', actionValue: 'ண', shiftValue: 'ண்', type: 'CONSONANT' },
    { keyId: 'k-nga', label: 'ங', subLabel: 'ங்', code: 'Comma', actionValue: 'ங', shiftValue: 'ங்', type: 'CONSONANT' },
    { keyId: 'k-nja', label: 'ஞ', subLabel: 'ஞ்', code: 'Period', actionValue: 'ஞ', shiftValue: 'ஞ்', type: 'CONSONANT' },
    { keyId: 'k-sft2', label: 'SHIFT', code: 'ShiftRight', actionValue: 'SHIFT', type: 'CONTROL', width: 'w-20' }
  ],
  // Row 5: Space & Mode shortcuts
  [
    { keyId: 'k-spc', label: 'இடைவெளி (SPACEBAR)', code: 'Space', actionValue: ' ', type: 'CONTROL', width: 'w-80' }
  ]
];

export const KEEZHADI_BRAHMI_QUICK_TILES: { label: string; brahmi: string; translit: string; meaning: string }[] = [
  { label: 'தமிழ்', brahmi: '𑀢𑀫𑀺𑀵𑁆', translit: 'tamiḻ', meaning: 'Tamil Language' },
  { label: 'கீழடி', brahmi: '𑀓𑀻𑀵𑀝𑀺', translit: 'kīḻaḍi', meaning: 'Keezhadi Archaeological Site' },
  { label: 'அரசு', brahmi: '𑀅𑀭𑀘𑀼', translit: 'aracu', meaning: 'State / Governance' },
  { label: 'சேந்தன்', brahmi: '𑀘𑁂𑀦𑁆𑀢𑀦𑁆', translit: 'cēntan', meaning: 'Sangam Personal Name (Pot-sherd)' },
  { label: 'ஆதன்', brahmi: '𑀆𑀢𑀦𑁆', translit: 'ātan', meaning: 'Early Sangam Epigraph Clan' },
  { label: 'கொற்றன்', brahmi: '𑀓𑁂𑀸𑀶𑁆𑀶𑀦𑁆', translit: 'koṟṟan', meaning: 'Chieftain / Artisan Sign' },
  { label: 'திசையன்', brahmi: '𑀢𑀺𑀘𑁃𑀬𑀦𑁆', translit: 'ticaiyan', meaning: 'Merchant Guild Leader' },
  { label: 'குவிரன்', brahmi: '𑀓𑀼𑀯𑀺𑀭𑀦𑁆', translit: 'kuviran', meaning: 'Keezhadi Inscribed Jar Name' }
];
