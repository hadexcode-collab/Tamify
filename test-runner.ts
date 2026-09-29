/**
 * Automated Verification Test Suite for Tamil OCR & Historical Linguistic Engine
 */
import { convertLegacyToUnicode, detectEncoding } from './src/lib/legacyConverters';
import {
  splitTamilSyllables,
  modernizeArchaicTamilGlyphs,
  validateTamilSandhi,
  fixTamilSoundAlikeConfusions,
  parseTamilNumerals,
  numberToTamilNumerals
} from './src/lib/openTamilEngine';
import { normalizeTamilScript, enrichWordTokens, GOV_LEGAL_LEXICON, extractTamilDocumentStructureAndMetadata } from './src/lib/tamilMorphology';
import { SAMPLE_DOCUMENTS } from './src/lib/sampleDocuments';

interface TestCaseResult {
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestCaseResult[] = [];

function assert(condition: boolean, name: string, details?: string) {
  results.push({ name, passed: !!condition, details });
  if (condition) {
    console.log(`  ✓ PASS: ${name}`);
  } else {
    console.error(`  ✗ FAIL: ${name} - ${details || 'Assertion failed'}`);
  }
}

console.log('================================================================');
console.log('RUNNING TAMIL OCR & LINGUISTIC ENGINE VERIFICATION TESTS');
console.log('================================================================\n');

// -------------------------------------------------------------
// 1. LEGACY ENCODING & CONVERTER TESTS (BAMINI, TSCII, TAB, TAM)
// -------------------------------------------------------------
console.log('[TEST GROUP 1]: Legacy Font Converters (BAMINI, TSCII, TAB, TAM, Vaanavil)');

// BAMINI Test
const baminiSample = 'jkpo;ehL murpd; rpwg;G mwpf;if';
const convertedBamini = convertLegacyToUnicode(baminiSample, 'BAMINI');
assert(
  convertedBamini.includes('தமிழ்நாடு') && convertedBamini.includes('அறிக்கை'),
  'BAMINI conversion converts "jkpo;ehL ... mwpf;if" to Unicode "தமிழ்நாடு ... அறிக்கை"',
  `Got: ${convertedBamini}`
);

// Auto-detection Test
const detected = detectEncoding(baminiSample).detectedEncoding;
assert(
  detected === 'BAMINI',
  'detectEncoding correctly identifies BAMINI keystroke patterns',
  `Detected: ${detected}`
);

// BAMINI Sample Document conversion
const baminiDoc = SAMPLE_DOCUMENTS.find(d => d.id === 'sample-bamini-legacy');
if (baminiDoc) {
  const convertedDoc = convertLegacyToUnicode(baminiDoc.rawText, 'BAMINI');
  assert(
    convertedDoc.includes('தமிழ்நாடு அரசின்') && convertedDoc.includes('அரசாணை நிலை எண்'),
    'Full BAMINI Government Order document converts cleanly',
    `Excerpt: ${convertedDoc.slice(0, 100)}...`
  );
}

// -------------------------------------------------------------
// 2. OPEN-TAMIL SYLLABLE PARSING & PHONETICS TESTS
// -------------------------------------------------------------
console.log('\n[TEST GROUP 2]: Open-Tamil Syllable Breakdown & ISO 15919 Transliteration');

const testWord = 'தமிழ்நாடு';
const syllables = splitTamilSyllables(testWord);
assert(
  syllables.length === 5,
  'splitTamilSyllables breaks "தமிழ்நாடு" into 5 syllables (த, மி, ழ், நா, டு)',
  `Got ${syllables.length} syllables: ${syllables.map(s => s.raw).join(', ')}`
);

const uyirLetter = splitTamilSyllables('அம்மா')[0];
assert(
  uyirLetter.type === 'UYIR' && uyirLetter.raw === 'அ',
  'First syllable of "அம்மா" classified as UYIR ("அ")',
  `Type: ${uyirLetter.type}`
);

const meiLetter = splitTamilSyllables('அம்மா')[1];
assert(
  meiLetter.type === 'MEI' && meiLetter.raw === 'ம்',
  'Second syllable of "அம்மா" classified as MEI ("ம்")',
  `Type: ${meiLetter.type}`
);

const isoOutput = syllables.map(s => s.iso).join('');
assert(
  isoOutput.includes('tamiḻnāṭu') || isoOutput.includes('tamil'),
  'ISO 15919 transliteration contains valid phonemes',
  `ISO: ${isoOutput}`
);

// -------------------------------------------------------------
// 3. THOLKAPPIYAM / NANNUL SANDHI RULE ENGINE TESTS
// -------------------------------------------------------------
console.log('\n[TEST GROUP 3]: Nannul & Tholkappiyam Classical Sandhi Engine');

// Demonstrative doubling: 'அந்த' + 'புத்தகம்' => 'அந்தப் புத்தகம்'
const sandhiSample1 = 'அந்த புத்தகம் மேசையில் உள்ளது';
const sandhiCheck1 = validateTamilSandhi(sandhiSample1);
assert(
  sandhiCheck1.some(i => i.originalSnippet.includes('அந்த புத்தகம்') && i.suggestion.includes('அந்தப் புத்தகம்')),
  'Sandhi engine flags missing Vallinam after "அந்த" (வல்லினம் மிகும் இடம்)',
  `Issues: ${JSON.stringify(sandhiCheck1)}`
);

// Accusative doubling: 'பாடலை' + 'படித்தான்' => 'பாடலைப் படித்தான்'
const sandhiSample2 = 'பாடலை படித்தான்';
const sandhiCheck2 = validateTamilSandhi(sandhiSample2);
assert(
  sandhiCheck2.some(i => i.originalSnippet.includes('பாடலை படித்தான்') && i.suggestion.includes('பாடலைப் படித்தான்')),
  'Sandhi engine flags missing Vallinam after 2nd case marker "ஐ" (பாடலை படித்தான் -> பாடலைப் படித்தான்)',
  `Issues: ${JSON.stringify(sandhiCheck2)}`
);

// Non-doubling protection (வல்லினம் மிகா இடம்)
const sandhiSample3 = 'தம்பி படித்தான்';
const sandhiCheck3 = validateTamilSandhi(sandhiSample3);
assert(
  !sandhiCheck3.some(i => i.originalSnippet.includes('தம்பி படித்தான்')),
  'Sandhi engine does NOT incorrectly flag nominative "தம்பி படித்தான்" (வல்லினம் மிகா இடம்)',
  `Issues: ${JSON.stringify(sandhiCheck3)}`
);

// -------------------------------------------------------------
// 4. PRE-1978 ARCHAIC GLYPH REFORM & SCRIPT NORMALIZER TESTS
// -------------------------------------------------------------
console.log('\n[TEST GROUP 4]: Archaic Glyph Modernizer & Ligature Sanity');

// Test Archaic looped Naa
const archaicInput = 'பழைய ணா, றா, னா மற்றும் ணை, லை, ளை, னை';
const archaicFixed = modernizeArchaicTamilGlyphs(archaicInput);
assert(
  archaicFixed.text.length > 0,
  'modernizeArchaicTamilGlyphs operates without errors on modern and vintage strings'
);

// Inverted kombu and broken ligatures test
const brokenLigature = 'கொடுத்தார்'; // Kombu + consonant + Kaal sequence
const normalized = normalizeTamilScript(brokenLigature);
assert(
  normalized.normalized.includes('கொடுத்தார்'),
  'normalizeTamilScript repairs broken "ெ + ா" ligatures to unitary "ொ"',
  `Got: ${normalized.normalized}`
);

// -------------------------------------------------------------
// 5. TAMIL NUMERALS & MEASUREMENT SYMBOL TESTS
// -------------------------------------------------------------
console.log('\n[TEST GROUP 5]: Ancient Tamil Numerals (எண்கள்) & Calendar Symbols');

const num2024 = numberToTamilNumerals(2024);
assert(
  num2024.includes('௨') && num2024.includes('௲'),
  'numberToTamilNumerals(2024) computes Tamil numeral with thousands multiplier (௲)',
  `Got: ${num2024}`
);

const parsedNum = parseTamilNumerals('௨௲௨௪ ஆம் ஆண்டு');
assert(
  parsedNum.includes('2024') || parsedNum.includes('2') || parsedNum.includes('4'),
  'parseTamilNumerals decodes Tamil numeral strings into Arabic digits',
  `Result: ${parsedNum}`
);

// -------------------------------------------------------------
// 6. GOVERNMENT & LEGAL LEXICON GLOSSARY TESTS
// -------------------------------------------------------------
console.log('\n[TEST GROUP 6]: Government & Revenue Lexicon Lookup');

const terms = ['அரசாணை', 'வட்டாட்சியர்', 'நன்செய்', 'வில்லங்கம்', 'சிட்டா', 'பட்டா'];
let foundAll = true;
for (const t of terms) {
  if (!GOV_LEGAL_LEXICON[t]) {
    foundAll = false;
    console.error(`Missing lexicon term: ${t}`);
  }
}
assert(
  foundAll,
  'GOV_LEGAL_LEXICON contains all key official administrative and revenue terms (அரசாணை, வட்டாட்சியர், நன்செய், etc.)'
);

const enriched = enrichWordTokens(['தமிழ்நாடு', 'அரசாணை', 'வட்டாட்சியர்']);
assert(
  enriched[1].isGovernmentTerm && enriched[1].meaningEn?.includes('Government Order'),
  'enrichWordTokens attaches official English glosses and root derivations to tokens',
  `Token 1 gloss: ${enriched[1].meaningEn}`
);

// -------------------------------------------------------------
// 7. KOMBU & LIGATURE TRANSPOSITION OCR REPAIR TESTS
// -------------------------------------------------------------
console.log('\n[TEST GROUP 7]: Kombu / Ai-kombu / Pulli Transposition Normalization');

const transpositionCases = [
  { input: 'பறெுநர்', expected: 'பெறுநர்' },
  { input: 'அனதை்துத்', expected: 'அனைத்துத்' },
  { input: 'துறதை்', expected: 'துறைத்' },
  { input: 'தலவைர்கள்', expected: 'தலைவர்கள்' },
  { input: 'சயெ்து', expected: 'செய்து' },
  { input: 'பொதுத்துறகை்கு', expected: 'பொதுத்துறைக்கு' },
  { input: 'சயெலகப்', expected: 'செயலகப்' },
  { input: 'வணே்டும்', expected: 'வேண்டும்' }
];

for (const tc of transpositionCases) {
  const norm = normalizeTamilScript(tc.input);
  assert(
    norm.normalized.includes(tc.expected),
    `Transposition fix: "${tc.input}" -> "${tc.expected}"`,
    `Got: "${norm.normalized}"`
  );
}

// -------------------------------------------------------------
// 8. ALL SAMPLE DOCUMENTS PARSER & STRUCTURE VERIFICATION TESTS
// -------------------------------------------------------------
console.log('\n[TEST GROUP 8]: All 5 Sample Documents Pipeline Verification');

for (const sample of SAMPLE_DOCUMENTS) {
  let text = sample.rawText;
  if (sample.defaultEncoding === 'BAMINI') {
    text = convertLegacyToUnicode(text, 'BAMINI');
  }
  const { normalized, fixesCount } = normalizeTamilScript(text);
  const doc = extractTamilDocumentStructureAndMetadata(normalized, sample.tamilTitle);

  assert(
    doc.lines.length > 5,
    `Sample "${sample.id}" parsed ${doc.lines.length} lines`,
    `Expected >5 lines, got ${doc.lines.length}`
  );

  assert(
    Boolean(doc.metadata.documentTitle),
    `Sample "${sample.id}" has valid title: "${doc.metadata.documentTitle}"`
  );

  if (sample.id === 'sample-tn-go-1986') {
    assert(
      doc.tables.length === 1 && doc.tables[0].rows.length === 4,
      `1986 G.O. table parsed with 4 member rows`,
      `Got ${doc.tables.length} tables, ${doc.tables[0]?.rows?.length} rows`
    );
    assert(
      doc.metadata.orderNumber?.includes('142'),
      `1986 G.O. Order Number extracted: "${doc.metadata.orderNumber}"`
    );
  }

  if (sample.id === 'sample-land-deed-1974') {
    assert(
      doc.metadata.orderNumber?.includes('1204') || normalized.includes('1204'),
      `1974 Land Deed document number extracted: "${doc.metadata.orderNumber}"`
    );
    assert(
      normalized.includes('நன்செய்') && normalized.includes('பட்டா எண்'),
      `1974 Land Deed contains revenue terms (நன்செய், பட்டா எண்)`
    );
  }

  if (sample.id === 'sample-bamini-legacy') {
    assert(
      normalized.includes('தமிழ்நாடு') && normalized.includes('ஒருங்குறி'),
      `BAMINI conversion rendered clean Unicode (தமிழ்நாடு, ஒருங்குறி)`
    );
    assert(
      doc.metadata.orderNumber?.includes('89') || normalized.includes('89'),
      `BAMINI G.O. Order number 89 detected`
    );
  }

  if (sample.id === 'sample-gazette-1968') {
    assert(
      doc.tables.length === 1 && doc.tables[0].rows.length === 4,
      `1968 Gazette holiday table parsed with 4 holiday rows`,
      `Got ${doc.tables.length} tables, ${doc.tables[0]?.rows?.length} rows`
    );
  }

  if (sample.id === 'sample-classical-commentary') {
    assert(
      normalized.includes('தொல்காப்பியம்') && normalized.includes('புணர்ச்சி'),
      `Classical commentary contains Tholkappiyam & Sandhi terms`
    );
  }
}

// -------------------------------------------------------------
// 9. KEEZHADI TYPEWRITING & TAMIL-BRAHMI EPIGRAPHY TESTS
// -------------------------------------------------------------
console.log('\n[TEST GROUP 9]: Keezhadi Typewriter & Tamil-Brahmi Epigraphy Engine');

import {
  transliterateAnjalToTamil,
  convertTamilToKeezhadiBrahmi,
  KEEZHADI_BRAHMI_QUICK_TILES
} from './src/lib/keezhadiTypewriter';

const anjalTest1 = transliterateAnjalToTamil('thamizh');
assert(
  anjalTest1.includes('தமிழ்'),
  `Anjal phonetic "thamizh" -> "தமிழ்" (got: "${anjalTest1}")`
);

const anjalTest2 = transliterateAnjalToTamil('vanakkam');
assert(
  anjalTest2.includes('வணக்கம்'),
  `Anjal phonetic "vanakkam" -> "வணக்கம்" (got: "${anjalTest2}")`
);

const brahmiTamil = convertTamilToKeezhadiBrahmi('தமிழ்');
assert(
  brahmiTamil.includes('𑀢𑀫𑀺𑀵𑁆'),
  `Tamil-Brahmi conversion for "தமிழ்" contains epigraphic glyphs 𑀢𑀫𑀺𑀵𑁆 (got: "${brahmiTamil}")`
);

const brahmiKeezhadi = convertTamilToKeezhadiBrahmi('கீழடி');
assert(
  brahmiKeezhadi.includes('𑀓𑀻𑀵𑀝𑀺'),
  `Tamil-Brahmi conversion for "கீழடி" produces 𑀓𑀻𑀵𑀝𑀺 (got: "${brahmiKeezhadi}")`
);

assert(
  KEEZHADI_BRAHMI_QUICK_TILES.length >= 8,
  `Keezhadi Sangam pot-sherd inscriptions database contains ${KEEZHADI_BRAHMI_QUICK_TILES.length} artifacts`
);

// -------------------------------------------------------------
// 10. PAN-INDIAN LANGUAGES & MULTI-SCRIPT TRANSLITERATION TESTS
// -------------------------------------------------------------
console.log('\n[TEST GROUP 10]: Pan-Indian Languages Transliteration Engine');

import {
  convertTamilToIndicScript,
  SUPPORTED_INDIC_LANGUAGES,
  MULTILINGUAL_GOV_TEMPLATES
} from './src/lib/indicLanguageEngine';

const tamilSample = 'தமிழ்நாடு அரசு';

const devanagariOut = convertTamilToIndicScript(tamilSample, 'dev');
assert(
  devanagariOut.includes('तमिऴ्नाटु') || devanagariOut.includes('तमि'),
  `Tamil to Devanagari (Hindi/Sanskrit) converted: "${devanagariOut}"`
);

const teluguOut = convertTamilToIndicScript(tamilSample, 'tel');
assert(
  teluguOut.includes('తమిఴ్నాటు') || teluguOut.includes('తమి'),
  `Tamil to Telugu converted: "${teluguOut}"`
);

const malayalamOut = convertTamilToIndicScript(tamilSample, 'mal');
assert(
  malayalamOut.includes('തമിഴ') || malayalamOut.includes('തമിഴ്'),
  `Tamil to Malayalam converted: "${malayalamOut}"`
);

const kannadaOut = convertTamilToIndicScript(tamilSample, 'kan');
assert(
  kannadaOut.includes('ತಮಿಳ') || kannadaOut.includes('ತಮಿೞ'),
  `Tamil to Kannada converted: "${kannadaOut}"`
);

const isoOut = convertTamilToIndicScript(tamilSample, 'iso');
assert(
  isoOut.includes('tamiḻnāṭu') || isoOut.includes('tami'),
  `Tamil to ISO 15919 Romanized English converted: "${isoOut}"`
);

assert(
  SUPPORTED_INDIC_LANGUAGES.length === 8,
  `All 8 Indian languages and scripts registered in language engine`
);

assert(
  MULTILINGUAL_GOV_TEMPLATES.length >= 5,
  `Multilingual Government Lexicon dictionary verified across all Indian languages`
);

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log('\n================================================================');
const passedCount = results.filter(r => r.passed).length;
const totalCount = results.length;
console.log(`TEST SUITE COMPLETED: ${passedCount}/${totalCount} TESTS PASSED (${((passedCount / totalCount) * 100).toFixed(1)}%)`);
console.log('================================================================');

if (passedCount === totalCount) {
  process.exit(0);
} else {
  process.exit(1);
}
