/**
 * Open-Tamil Algorithmic Core & Tamil Script Standard Rules
 * Derived from legal, open-source Tamil computing standards:
 * - open-tamil (MIT License, Muthu Annamalai et al.)
 * - TVA (Tamil Virtual Academy) Unicode & TAM/TAB/TSCII specifications
 * - Thamizha / NHM Writer / e-Kalappai open mapping tables (GPL/MIT)
 * - Classical Nannul & Tholkappiyam Sandhi (புணர்ச்சி) rule sets
 */

// ==========================================
// 1. TAMIL SCRIPT CHARACTER CLASSIFICATIONS
// ==========================================

export const UYIR_LETTERS = ['அ', 'ஆ', 'இ', 'ஈ', 'உ', 'ஊ', 'எ', 'ஏ', 'ஐ', 'ஒ', 'ஓ', 'ஔ'];
export const AYUDHAM = 'ஃ';
export const MEI_LETTERS = [
  'க்', 'ங்', 'ச்', 'ஞ்', 'ட்', 'ண்',
  'த்', 'ந்', 'ப்', 'ம்', 'ய்', 'ர்',
  'ல்', 'வ்', 'ழ்', 'ள்', 'ற்', 'ன்'
];
export const BASE_CONSONANTS = [
  'க', 'ங', 'ச', 'ஞ', 'ட', 'ண',
  'த', 'ந', 'ப', 'ம', 'ய', 'ர',
  'ல', 'வ', 'ழ', 'ள', 'ற', 'ன'
];
export const GRANTHA_MEI = ['ஜ்', 'ஶ்', 'ஷ்', 'ஸ்', 'ஹ்', 'க்ஷ்'];
export const GRANTHA_BASE = ['ஜ', 'ஶ', 'ஷ', 'ஸ', 'ஹ', 'க்ஷ'];

export const VOWEL_SIGNS = [
  'ா', // aa
  'ி', // i
  'ீ', // ii
  'ு', // u
  'ூ', // uu
  'ெ', // e
  'ே', // ee
  'ை', // ai
  'ொ', // o
  'ோ', // oo
  'ௌ'  // au
];

export const VALLINAM = ['க்', 'ச்', 'ட்', 'த்', 'ப்', 'ற்'];
export const MELLINAM = ['ங்', 'ஞ்', 'ண்', 'ந்', 'ம்', 'ன்'];
export const IDAIYINAM = ['ய்', 'ர்', 'ல்', 'வ்', 'ழ்', 'ள்'];

// Tamil Numerals Table (0x0BE6 to 0x0BF2)
export const TAMIL_NUMERALS_MAP: Record<string, number> = {
  '௦': 0, '௧': 1, '௨': 2, '௩': 3, '௪': 4,
  '௫': 5, '௬': 6, '௭': 7, '௮': 8, '௯': 9,
  '௰': 10, '௱': 100, '௲': 1000
};

export const TAMIL_SYMBOLS_MAP: Record<string, string> = {
  '௳': 'நாள் (Day / Date)',
  '௴': 'மாதம் (Month)',
  '௵': 'வருடம் (Year)',
  '௶': 'பற்று (Debit)',
  '௷': 'வரவு (Credit)',
  '௸': 'மேற்படி (As above / Ditto)',
  '௹': 'ரூபாய் (Rupee)',
  '௺': 'எண் (Number)'
};

// ==========================================
// 2. SYLLABLE PARSER (அசை / எழுத்துப் பிரிப்பான்)
// ==========================================

export interface TamilSyllable {
  raw: string;
  type: 'UYIR' | 'MEI' | 'UYIRMEI' | 'AYUDHAM' | 'GRANTHA' | 'NON_TAMIL';
  base?: string;
  vowelSign?: string;
  iso: string;
}

/**
 * Splits Tamil text into discrete phonetic syllables according to open-tamil standard
 */
export function splitTamilSyllables(text: string): TamilSyllable[] {
  if (!text) return [];
  const syllables: TamilSyllable[] = [];
  let i = 0;
  const len = text.length;

  while (i < len) {
    const char = text[i];
    const nextChar = i + 1 < len ? text[i + 1] : '';

    // 1. Ayudham
    if (char === AYUDHAM) {
      syllables.push({ raw: char, type: 'AYUDHAM', iso: 'ḵ' });
      i++;
      continue;
    }

    // 2. Independent Vowel (உயிர்)
    if (UYIR_LETTERS.includes(char)) {
      syllables.push({ raw: char, type: 'UYIR', base: char, iso: getIsoForChar(char) });
      i++;
      continue;
    }

    // 3. Special Sri (ஸ்ரீ / ஶ்ரீ)
    if (char === 'ஸ்ரீ' || (char === 'ஸ' && nextChar === '்' && i + 2 < len && text[i + 2] === 'ரீ')) {
      syllables.push({ raw: 'ஸ்ரீ', type: 'GRANTHA', iso: 'śrī' });
      i += char === 'ஸ்ரீ' ? 1 : 3;
      continue;
    }

    // 4. Grantha Ksh (க்ஷ)
    if (char === 'க்' && nextChar === 'ஷ') {
      const third = i + 2 < len ? text[i + 2] : '';
      if (third === '்') {
        syllables.push({ raw: 'க்ஷ்', type: 'GRANTHA', iso: 'kṣ' });
        i += 3;
      } else if (VOWEL_SIGNS.includes(third)) {
        syllables.push({ raw: `க்ஷ${third}`, type: 'GRANTHA', base: 'க்ஷ', vowelSign: third, iso: `kṣ${getIsoForVowelSign(third)}` });
        i += 3;
      } else {
        syllables.push({ raw: 'க்ஷ', type: 'GRANTHA', base: 'க்ஷ', iso: 'kṣa' });
        i += 2;
      }
      continue;
    }

    // 5. Consonants (தமிழ் மெய் & உயிர்மெய்)
    if (BASE_CONSONANTS.includes(char) || GRANTHA_BASE.includes(char)) {
      if (nextChar === '்') {
        // Pure Consonant (மெய்)
        syllables.push({ raw: char + '்', type: GRANTHA_BASE.includes(char) ? 'GRANTHA' : 'MEI', base: char, iso: getIsoForConsonant(char) });
        i += 2;
      } else if (VOWEL_SIGNS.includes(nextChar)) {
        // Uyirmei with explicit vowel sign
        syllables.push({
          raw: char + nextChar,
          type: GRANTHA_BASE.includes(char) ? 'GRANTHA' : 'UYIRMEI',
          base: char,
          vowelSign: nextChar,
          iso: `${getIsoForConsonant(char)}${getIsoForVowelSign(nextChar)}`
        });
        i += 2;
      } else {
        // Inherent 'a' uyirmei
        syllables.push({
          raw: char,
          type: GRANTHA_BASE.includes(char) ? 'GRANTHA' : 'UYIRMEI',
          base: char,
          vowelSign: 'அ',
          iso: `${getIsoForConsonant(char)}a`
        });
        i++;
      }
      continue;
    }

    // Non-Tamil characters (spaces, punctuation, digits)
    syllables.push({ raw: char, type: 'NON_TAMIL', iso: char });
    i++;
  }

  return syllables;
}

// ==========================================
// 3. ARCHAIC SCRIPT REFORMER (பழைய எழுத்துச் சீர்திருத்தம்)
// ==========================================

/**
 * Modernizes archaic 19th and 20th century pre-Periyar Tamil ligatures
 * Converts old looped ணா, றா, னா, ணை, லை, ளை, னை to canonical Unicode.
 */
export function modernizeArchaicTamilGlyphs(text: string): { text: string; replacementsCount: number } {
  if (!text) return { text: '', replacementsCount: 0 };
  let res = text;
  let count = 0;

  // Replacement patterns for legacy scanned OCR artifacts
  const archaicReplacements: [RegExp, string][] = [
    [/ண\u0BBE/g, 'ணா'],
    [/ற\u0BBE/g, 'றா'],
    [/ன\u0BBE/g, 'னா'],
    [/ண\u0BC8/g, 'ணை'],
    [/ல\u0BC8/g, 'லை'],
    [/ள\u0BC8/g, 'ளை'],
    [/ன\u0BC8/g, 'னை'],
    // Old Grantha Sri variants
    [/ஸ\u0BCD\u0BB0\u0BC0/g, 'ஸ்ரீ'],
    [/ஶ\u0BCD\u0BB0\u0BC0/g, 'ஸ்ரீ'],
    // Attached modifier fixes
    [/([க-ஹ])\u0BC6\u0BBE/g, '$1ொ'],
    [/([க-ஹ])\u0BC7\u0BBE/g, '$1ோ'],
    [/([க-ஹ])\u0BC6\u0BD7/g, '$1ௌ']
  ];

  for (const [pattern, repl] of archaicReplacements) {
    const matches = res.match(pattern);
    if (matches) {
      count += matches.length;
      res = res.replace(pattern, repl);
    }
  }

  return { text: res, replacementsCount: count };
}

// ==========================================
// 4. RULE-BASED SANDHI VALIDATOR (நன்னூல் புணர்ச்சி விதிகள்)
// ==========================================

export interface SandhiCheckResult {
  hasIssue: boolean;
  ruleName: string;
  suggestion: string;
  originalSnippet: string;
  type: 'VALLINAM_MIKUTHAL' | 'VALLINAM_MIKAAMAI' | 'UDAMPADUMEI' | 'CORRECT';
}

/**
 * Validates Sandhi (வல்லினம் மிகுதல் / மிகாமை) rules across word boundaries
 * based on Nannul grammar formulas.
 */
export function validateTamilSandhi(phrase: string): SandhiCheckResult[] {
  const results: SandhiCheckResult[] = [];
  const words = phrase.split(/\s+/).filter(Boolean);

  for (let i = 0; i < words.length - 1; i++) {
    const w1 = words[i].replace(/[.,:;()'"\-[\]]/g, '');
    const w2 = words[i + 1].replace(/[.,:;()'"\-[\]]/g, '');
    if (!w1 || !w2) continue;

    const firstLetterOfW2 = w2[0];
    const isW2VallinamStart = ['க', 'ச', 'த', 'ப'].includes(firstLetterOfW2);

    if (!isW2VallinamStart) continue;

    const hardConsonant = firstLetterOfW2 === 'க' ? 'க்' :
                          firstLetterOfW2 === 'ச' ? 'ச்' :
                          firstLetterOfW2 === 'த' ? 'த்' : 'ப்';

    // Rule 1: சுட்டெழுத்து (அ, இ, எ) மற்றும் 'அந்த, இந்த, எந்த' பின் வல்லினம் மிகும்
    if (['அ', 'இ', 'எ', 'அந்த', 'இந்த', 'எந்த', 'அங்கு', 'இங்கு', 'எங்கு'].includes(w1)) {
      if (!w1.endsWith(hardConsonant) && !w2.startsWith(hardConsonant)) {
        results.push({
          hasIssue: true,
          ruleName: `சுட்டு/வினாப் பெயர் புணர்ச்சி (${w1} பின் வல்லினம் மிகும்)`,
          suggestion: `${w1}${hardConsonant} ${w2}`,
          originalSnippet: `${w1} ${w2}`,
          type: 'VALLINAM_MIKUTHAL'
        });
      }
    }

    // Rule 2: இரண்டாம் வேற்றுமை உருபு (ஐ) பின் வல்லினம் மிகும் (e.g. பாடலை + படித்தான் = பாடலைப் படித்தான்)
    if (w1.endsWith('ை') && w1.length > 2) {
      if (!w1.endsWith(`ை${hardConsonant}`) && !w2.startsWith(hardConsonant)) {
        // High likelihood of accusative case
        results.push({
          hasIssue: true,
          ruleName: `இரண்டாம் வேற்றுமை விரி (ஐ-கார ஈறு பின் ${hardConsonant} மிகும்)`,
          suggestion: `${w1}${hardConsonant} ${w2}`,
          originalSnippet: `${w1} ${w2}`,
          type: 'VALLINAM_MIKUTHAL'
        });
      }
    }

    // Rule 3: அது, இது, எது பின் வல்லினம் மிகாது (VALLINAM MIKAAMAI)
    if (['அது', 'இது', 'எது', 'அவை', 'இவை', 'எவை'].includes(w1)) {
      if (w2.startsWith(hardConsonant) || w1.endsWith(hardConsonant)) {
        const fixedW2 = w2.startsWith(hardConsonant) ? w2.slice(hardConsonant.length) : w2;
        const fixedW1 = w1.endsWith(hardConsonant) ? w1.slice(0, -hardConsonant.length) : w1;
        results.push({
          hasIssue: true,
          ruleName: `சுட்டுப் பெயர் மிகாமை (${w1} பின் வல்லினம் மிகக் கூடாது)`,
          suggestion: `${fixedW1} ${fixedW2}`,
          originalSnippet: `${w1} ${w2}`,
          type: 'VALLINAM_MIKAAMAI'
        });
      }
    }
  }

  return results;
}

// ==========================================
// 5. OCR DEGRADED SOUND-ALIKE & LIGATURE TRANSPOSITION CORRECTOR
// ==========================================

export interface ConfusionFix {
  original: string;
  corrected: string;
  reason: string;
}

/**
 * Fixes misplaced / transposed Kombu (ெ, ே, ை) and vowel modifier errors
 * commonly caused by visual OCR glyph ordering, 8-bit typewriter encoding, or typing flaws.
 * Examples:
 *   பறெுநர் -> பெறுநர்
 *   அனதை்துத் -> அனைத்துத்
 *   துறதை் -> துறைத்
 *   தலவைர்கள் -> தலைவர்கள்
 *   சயெ்து -> செய்து
 *   பொதுத்துறகை்கு -> பொதுத்துறைக்கு
 *   சயெலகப் -> செயலகப்
 *   வணே்டும் -> வேண்டும்
 */
export function fixTransposedTamilKombuAndLigatures(text: string): {
  text: string;
  fixesCount: number;
  fixes: ConfusionFix[];
} {
  if (!text) return { text: '', fixesCount: 0, fixes: [] };
  let res = text;
  const fixes: ConfusionFix[] = [];
  let count = 0;

  // 1. Transposition Pattern A: [Consonant 1] + [Consonant 2] + [ெ/ே/ை] + ்
  //    In valid Tamil, a consonant cannot have both a vowel sign (ெ/ே/ை) AND a virama/pulli (்).
  //    The vowel modifier belongs to Consonant 1, and the pulli belongs to Consonant 2.
  //    e.g. னதை் -> னைத் (அனதை்துத் -> அனைத்துத்)
  //         றதை் -> றைத் (துறதை் -> துறைத்)
  //         சயெ் -> செய் (சயெ்து -> செய்து)
  //         றகை் -> றைக் (பொதுத்துறகை்கு -> பொதுத்துறைக்கு)
  //         வணே் -> வேண் (வணே்டும் -> வேண்டும்)
  //         பறெ் -> பெற் (பறெ்று -> பெற்று)
  const patternA = /([க-ஹ])([க-ஹ])([ெேை])்/g;
  if (patternA.test(res)) {
    res = res.replace(patternA, (match, c1, c2, kombu) => {
      const fixed = `${c1}${kombu}${c2}்`;
      count++;
      fixes.push({
        original: match,
        corrected: fixed,
        reason: `இடம்பெயர்ந்த கொம்பு/புள்ளி இடமாற்றம் (${match} -> ${fixed})`
      });
      return fixed;
    });
  }

  // 2. Transposition Pattern B: [Consonant 1] + [Consonant 2] + [ெ/ே] + [Vowel Sign 2: ா, ி, ீ, ு, ூ]
  //    In valid Tamil, a single consonant cannot take two contradictory vowel signs simultaneously.
  //    The kombu (ெ/ே) was visually attached before Consonant 2, but logically modifies Consonant 1.
  //    e.g. பறெு -> பெறு (பறெுநர் -> பெறுநர்)
  //         களெு -> கெழு
  //         தளெி -> தெளி
  //         பறெி -> பெரி / பெறி
  const patternB = /([க-ஹ])([க-ஹ])([ெே])([ாிீுூ])/g;
  if (patternB.test(res)) {
    res = res.replace(patternB, (match, c1, c2, kombu, v2) => {
      const fixed = `${c1}${kombu}${c2}${v2}`;
      count++;
      fixes.push({
        original: match,
        corrected: fixed,
        reason: `இரட்டை உயிர்க்குறி இடமாற்றம் (${match} -> ${fixed})`
      });
      return fixed;
    });
  }

  // 3. Transposition Pattern C: Word-level and cluster-level transposed Kombu/Ai-kombu
  //    e.g. தலவை -> தலைவ (தலவைர்கள் -> தலைவர்கள்)
  //         சயெ -> செய (சயெலகப் -> செயலகப், சயெலாளர் -> செயலாளர், சயெ்தி -> செய்தி)
  //         தலமை -> தலைமை (தலமைச் -> தலைமைச்)
  //         அமவை -> அமைவ (அமவைு -> அமைவு)
  //         நலிவை -> நிலைவ
  //         நலிமை -> நிலைமை
  const specificTranspositions: [RegExp, string, string][] = [
    [/தலவை/g, 'தலைவ', 'தலவை -> தலைவ (தலைவர்கள்/தலைவர்)'],
    [/தலமை/g, 'தலைமை', 'தலமை -> தலைமை (தலைமைச் செயலகம்)'],
    [/சயெல/g, 'செயல', 'சயெல -> செயல (செயலகப்/செயலாளர்)'],
    [/சயெ்தி/g, 'செய்தி', 'சயெ்தி -> செய்தி'],
    [/சயெ்/g, 'செய்', 'சயெ் -> செய்'],
    [/பறெுத/g, 'பெறுத', 'பறெுத -> பெறுத (பெறுதல்)'],
    [/பறெு/g, 'பெறு', 'பறெு -> பெறு (பெறுநர்)'],
    [/வணே்டு/g, 'வேண்டு', 'வணே்டு -> வேண்டு (வேண்டும்)'],
    [/நலிமை/g, 'நிலைமை', 'நலிமை -> நிலைமை'],
    [/அமவை/g, 'அமைவ', 'அமவை -> அமைவ'],
    [/மலிவாக/g, 'மலிவாக', 'மலிவாக'],
    [/விலவை/g, 'விலைவ', 'விலவை -> விலைவ']
  ];

  for (const [pat, repl, reason] of specificTranspositions) {
    if (pat.test(res)) {
      res = res.replace(pat, (m) => {
        count++;
        fixes.push({ original: m, corrected: repl, reason });
        return repl;
      });
    }
  }

  return { text: res, fixesCount: count, fixes };
}

/**
 * Fixes common Tamil OCR degradation confusions (e.g. ண vs ன, ர vs ற, ல vs ள vs ழ, ெ vs ே)
 * based on contextual government and administrative dictionary models.
 */
export function fixTamilSoundAlikeConfusions(text: string): { text: string; fixes: ConfusionFix[] } {
  let res = text;
  const fixes: ConfusionFix[] = [];

  // Run the systematic kombu / ligature transposition corrector first
  const transposed = fixTransposedTamilKombuAndLigatures(res);
  res = transposed.text;
  fixes.push(...transposed.fixes);

  const commonConfusionMap: [RegExp, string, string][] = [
    [/\bஅரசாணை\s*நிர்வாகம்\b/g, 'அரசாணை நிருவாகம்', 'Administrative spelling standard'],
    [/\bசெயளாளர்\b/g, 'செயலாளர்', 'Fix ள -> ல in செயலாளர்'],
    [/\bதலைமைசெயலகம்\b/g, 'தலைமைச் செயலகம்', 'Sandhi stop insertion'],
    [/\bசார்பதிவாலர\b/g, 'சார்பதிவாளர்', 'Fix ல -> ள in சார்பதிவாளர்'],
    [/\bகிரயபத்திரம்\b/g, 'கிரயப் பத்திரம்', 'Sandhi stop insertion in Deed'],
    [/\bநன்செய்\s*நிலம்\b/g, 'நன்செய் நிலம்', 'Standard land revenue term'],
    [/\bவிஸ்தீரனம்\b/g, 'விஸ்தீரணம்', 'Fix ன -> ண in விஸ்தீரணம்'],
    [/\bபார்வை:\s*/g, 'பார்வை: ', 'Colon spacing standardization'],
    [/\bபொருள்:\s*/g, 'பொருள்: ', 'Colon spacing standardization'],
    [/\bசுற்றறிக்கை\b/g, 'சுற்றறிக்கை', 'Standard administrative circular spelling'],
    // OCR Typewriter / Ligature repairs
    [/\bவ\.?\s*எை்\b/g, 'வ. எண்', 'Fix OCR ligature எை் -> எண் in serial number'],
    [/\bவ\.?\s*எண்\b/g, 'வ. எண்', 'Standardize வ. எண் format'],
    [/\bஎை்\b/g, 'எண்', 'Fix OCR ligature எை் -> எண்'],
    [/\bகைிதம்\b/g, 'கணிதம்', 'Fix OCR ligature கைிதம் -> கணிதம்'],
    [/\bகையிதம்\b/g, 'கணிதம்', 'Fix OCR ligature கையிதம் -> கணிதம்'],
    [/\bஅட்டவடை\b/g, 'அட்டவணை', 'Fix OCR ligature அட்டவடை -> அட்டவணை'],
    [/\bவகுப்\s*பு\b/g, 'வகுப்பு', 'Join broken syllables in வகுப்பு'],
    [/\bபடி\s*வம்\b/g, 'படிவம்', 'Join broken syllables in படிவம்'],
    [/\bஒப்படைப்\s*பு\b/g, 'ஒப்படைப்பு', 'Join broken syllables in ஒப்படைப்பு'],
    [/\bஒப்படைப்புப்\s*படிவம்\b/g, 'ஒப்படைப்புப் படிவம்', 'Standardize handover form label'],
    [/\bஅலுவல\s*கம்\b/g, 'அலுவலகம்', 'Join broken syllables in அலுவலகம்'],
    [/\bஆை்\b/g, 'ஆண்', 'Fix OCR ligature ஆை் -> ஆண்'],
    [/\bபெை்\b/g, 'பெண்', 'Fix OCR ligature பெை் -> பெண்']
  ];

  for (const [pattern, repl, reason] of commonConfusionMap) {
    if (pattern.test(res)) {
      fixes.push({
        original: pattern.source,
        corrected: repl,
        reason
      });
      res = res.replace(pattern, repl);
    }
  }

  return { text: res, fixes };
}

// ==========================================
// 6. TAMIL NUMERAL CONVERTER (எண்கள் மாற்றி)
// ==========================================

/**
 * Converts Tamil numerals (e.g. ௨௲௨௪) into standard Arabic numbers (e.g. 2024)
 */
export function parseTamilNumerals(text: string): string {
  if (!text) return '';
  return text.replace(/[௦-௲]/g, (digit) => {
    return TAMIL_NUMERALS_MAP[digit] !== undefined ? String(TAMIL_NUMERALS_MAP[digit]) : digit;
  });
}

/**
 * Converts standard integer to Tamil numerals (supporting traditional multiplier representation)
 */
export function numberToTamilNumerals(num: number, useTraditional: boolean = true): string {
  if (!useTraditional || num < 0 || !Number.isInteger(num)) {
    const digits = ['௦', '௧', '௨', '௩', '௪', '௫', '௬', '௭', '௮', '௯'];
    return String(num)
      .split('')
      .map((d) => (/[0-9]/.test(d) ? digits[parseInt(d, 10)] : d))
      .join('');
  }

  if (num === 0) return '௦';
  const digits = ['', '௧', '௨', '௩', '௪', '௫', '௬', '௭', '௮', '௯'];
  let res = '';
  let n = num;

  const thousands = Math.floor(n / 1000);
  if (thousands > 0) {
    res += (thousands > 1 ? digits[thousands] : '') + '௲';
    n %= 1000;
  }

  const hundreds = Math.floor(n / 100);
  if (hundreds > 0) {
    res += (hundreds > 1 ? digits[hundreds] : '') + '௱';
    n %= 100;
  }

  const tens = Math.floor(n / 10);
  if (tens > 0) {
    res += (tens > 1 ? digits[tens] : '') + '௰';
    n %= 10;
  }

  if (n > 0) {
    res += digits[n];
  }
  return res || '௦';
}

// ==========================================
// HELPER ISO UTILITIES
// ==========================================
function getIsoForChar(char: string): string {
  const map: Record<string, string> = {
    'அ': 'a', 'ஆ': 'ā', 'இ': 'i', 'ஈ': 'ī', 'உ': 'u', 'ஊ': 'ū',
    'எ': 'e', 'ஏ': 'ē', 'ஐ': 'ai', 'ஒ': 'o', 'ஓ': 'ō', 'ஔ': 'au', 'ஃ': 'ḵ'
  };
  return map[char] || char;
}

function getIsoForConsonant(cons: string): string {
  const map: Record<string, string> = {
    'க': 'k', 'ங': 'ṅ', 'ச': 'c', 'ஞ': 'ñ', 'ட': 'ṭ', 'ண': 'ṇ',
    'த': 't', 'ந': 'n', 'ப': 'p', 'ம': 'm', 'ய': 'y', 'ர': 'r',
    'ல': 'l', 'வ': 'v', 'ழ': 'ḻ', 'ள': 'ḷ', 'ற': 'ṟ', 'ன': 'ṉ',
    'ஜ': 'j', 'ஶ': 'ś', 'ஷ': 'ṣ', 'ஸ': 's', 'ஹ': 'h', 'க்ஷ': 'kṣ'
  };
  return map[cons] || cons;
}

function getIsoForVowelSign(sign: string): string {
  const map: Record<string, string> = {
    'ா': 'ā', 'ி': 'i', 'ீ': 'ī', 'ு': 'u', 'ூ': 'ū',
    'ெ': 'e', 'ே': 'ē', 'ை': 'ai', 'ொ': 'o', 'ோ': 'ō', 'ௌ': 'au'
  };
  return map[sign] || '';
}
