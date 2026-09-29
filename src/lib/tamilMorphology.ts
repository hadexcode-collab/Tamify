/**
 * Tamil Lexical, Morphological and Contextual Engine
 * Integrates open-source standards from open-tamil, TVA, and classical Nannul / Tholkappiyam.
 */
import { WordToken, LineToken } from '../types';
import {
  splitTamilSyllables,
  modernizeArchaicTamilGlyphs,
  validateTamilSandhi,
  fixTamilSoundAlikeConfusions,
  parseTamilNumerals
} from './openTamilEngine';

// ==========================================
// GOVERNMENT & LEGAL TAMIL LEXICON GLOSSARY (120+ Official Terms)
// ==========================================
export const GOV_LEGAL_LEXICON: Record<string, { meaningEn: string; category: string; root: string }> = {
  // Government Order & General Administration
  'அரசாணை': { meaningEn: 'Government Order (G.O.)', category: 'Official Document', root: 'அரசு + ஆணை' },
  'தலைமைச்': { meaningEn: 'Chief / Principal / Secretariat', category: 'Designation / Hierarchy', root: 'தலைமை' },
  'செயலகம்': { meaningEn: 'Secretariat', category: 'Administration', root: 'செயலகம்' },
  'பார்வை': { meaningEn: 'Reference / Read (in official order)', category: 'Order Structure', root: 'பார்வை' },
  'பொருள்': { meaningEn: 'Subject / Matter', category: 'Order Structure', root: 'பொருள்' },
  'ஆணை': { meaningEn: 'Order / Directive / Decree', category: 'Order Structure', root: 'ஆணை' },
  'சுற்றறிக்கை': { meaningEn: 'Circular / Notification', category: 'Official Document', root: 'சுற்று + அறிக்கை' },
  'நகல்': { meaningEn: 'Copy / Duplicate / CC', category: 'Distribution', root: 'நகல்' },
  'இணைப்பு': { meaningEn: 'Annexure / Enclosure', category: 'Document Attachment', root: 'இணைப்பு' },
  'ஒப்பம்': { meaningEn: 'Signature / Signed', category: 'Authentication', root: 'ஒப்பம்' },
  'செயலாளர்': { meaningEn: 'Secretary', category: 'Officer Designation', root: 'செயலாளர்' },
  'கூடுதல்': { meaningEn: 'Additional', category: 'Designation Prefix', root: 'கூடுதல்' },
  'முதன்மை': { meaningEn: 'Principal / Chief', category: 'Designation Prefix', root: 'முதன்மை' },
  'இணை': { meaningEn: 'Joint / Associate', category: 'Designation Prefix', root: 'இணை' },
  'துணை': { meaningEn: 'Deputy', category: 'Designation Prefix', root: 'துணை' },
  'உதவி': { meaningEn: 'Assistant', category: 'Designation Prefix', root: 'உதவி' },
  'ஆட்சியர்': { meaningEn: 'Collector / Administrator', category: 'Officer Designation', root: 'ஆட்சியர்' },
  'மாவட்ட': { meaningEn: 'District', category: 'Administrative Division', root: 'மாவட்டம்' },
  'ஆணையர்': { meaningEn: 'Commissioner', category: 'Officer Designation', root: 'ஆணையர்' },
  'இயக்குநர்': { meaningEn: 'Director', category: 'Officer Designation', root: 'இயக்குநர்' },
  'வட்டாட்சியர்': { meaningEn: 'Tahsildar / Revenue Officer', category: 'Revenue Officer', root: 'வட்டம் + ஆட்சியர்' },
  'வருவாய்த்துறை': { meaningEn: 'Revenue Department', category: 'Government Department', root: 'வருவாய் + துறை' },
  'பொதுத்துறை': { meaningEn: 'Public Department / General Administration', category: 'Government Department', root: 'பொது + துறை' },
  'நிதித்துறை': { meaningEn: 'Finance Department', category: 'Government Department', root: 'நிதி + துறை' },
  'உள்துறை': { meaningEn: 'Home Department', category: 'Government Department', root: 'உள் + துறை' },
  'பணியாளர்': { meaningEn: 'Personnel / Staff', category: 'Administration', root: 'பணியாளர்' },
  'நிர்வாகச்': { meaningEn: 'Administrative', category: 'Administration', root: 'நிர்வாகம்' },
  'சீர்திருத்தம்': { meaningEn: 'Reforms', category: 'Administration', root: 'சீர்திருத்தம்' },
  'அறிவிக்கை': { meaningEn: 'Gazette Notification / Official Notice', category: 'Official Notice', root: 'அறிவிக்கை' },
  'சென்னைப்': { meaningEn: 'Of Chennai / Madras Secretariat', category: 'Geography / Capital', root: 'சென்னை' },
  'தமிழ்நாடு': { meaningEn: 'Tamil Nadu State', category: 'State Jurisdiction', root: 'தமிழ் + நாடு' },
  'அரசு': { meaningEn: 'Government / State Authority', category: 'Government Jurisdiction', root: 'அரசு' },
  'ஆளுநர்': { meaningEn: 'Governor', category: 'Constitutional Head', root: 'ஆளுநர்' },
  'ஆளுநரின்': { meaningEn: 'By Order of the Governor', category: 'Constitutional Formula', root: 'ஆளுநர் + இன்' },
  'ஆணைப்படி': { meaningEn: 'By Order / As Commanded', category: 'Authentication Formula', root: 'ஆணை + படி' },
  'சுருக்கம்': { meaningEn: 'Abstract / Summary (of G.O.)', category: 'Order Structure', root: 'சுருக்கம்' },
  'நிலை': { meaningEn: 'Standing / Routine (e.g. G.O. Ms)', category: 'Order Classification', root: 'நிலை' },
  'பெறுநர்': { meaningEn: 'To / Addressee / Recipient', category: 'Official Letter Structure', root: 'பெறு + நர்' },
  'அனுப்புநர்': { meaningEn: 'From / Sender / Dispatcher', category: 'Official Letter Structure', root: 'அனுப்பு + நர்' },
  'அனைத்துத்': { meaningEn: 'All / Comprehensive', category: 'Administrative Modifier', root: 'அனைத்து' },
  'துறைத்': { meaningEn: 'Departmental / Of Department', category: 'Administrative Modifier', root: 'துறை' },
  'தலைவர்கள்': { meaningEn: 'Heads / Directors / Chairpersons', category: 'Officer Designation', root: 'தலைவர் + கள்' },
  'தலைவர்': { meaningEn: 'Head / Director / Chairman', category: 'Officer Designation', root: 'தலைவர்' },
  'பொதுத்துறைக்கு': { meaningEn: 'To the Public / General Department', category: 'Administrative Addressee', root: 'பொதுத்துறை + கு' },
  'செயலகப்': { meaningEn: 'Of Secretariat / Secretariat Level', category: 'Administrative Modifier', root: 'செயலகம்' },
  'வேண்டும்': { meaningEn: 'Required / Must / Directed to', category: 'Administrative Mandate', root: 'வேண்டு' },
  'செய்து': { meaningEn: 'Having executed / performed', category: 'Verbal Participle', root: 'செய்' },

  // Land Records & Registration Terms
  'சார்பதிவாளர்': { meaningEn: 'Sub-Registrar', category: 'Registration Department', root: 'சார்பதிவாளர்' },
  'பத்திரப்பதிவு': { meaningEn: 'Deed / Document Registration', category: 'Registration Law', root: 'பத்திரம் + பதிவு' },
  'கிரயம்': { meaningEn: 'Sale / Conveyance of Property', category: 'Property Deed', root: 'கிரயம்' },
  'கிரயதாரர்': { meaningEn: 'Purchaser / Buyer in deed', category: 'Legal Entity', root: 'கிரயம் + தாரர்' },
  'விற்பனையாளர்': { meaningEn: 'Vendor / Seller', category: 'Legal Entity', root: 'விற்பனை + ஆளர்' },
  'சொத்து': { meaningEn: 'Property / Asset', category: 'Property Deed', root: 'சொத்து' },
  'நன்செய்': { meaningEn: 'Wetland / Irrigated agricultural land', category: 'Land Revenue', root: 'நன்மை + செய்' },
  'புன்செய்': { meaningEn: 'Dryland / Rain-fed agricultural land', category: 'Land Revenue', root: 'புன்மை + செய்' },
  'பட்டா': { meaningEn: 'Land title deed / Revenue Record', category: 'Land Revenue', root: 'பட்டா' },
  'சிட்டா': { meaningEn: 'Land ledger record', category: 'Land Revenue', root: 'சிட்டா' },
  'அடங்கல்': { meaningEn: 'Land crop and cultivation register', category: 'Land Revenue', root: 'அடங்கல்' },
  'புல': { meaningEn: 'Survey (e.g. Survey Number)', category: 'Survey Measurement', root: 'புலம்' },
  'புலவெண்': { meaningEn: 'Survey Number', category: 'Survey Measurement', root: 'புலம் + எண்' },
  'உட்பிரிவு': { meaningEn: 'Sub-division (e.g. Survey Sub-division)', category: 'Survey Measurement', root: 'உள் + பிரிவு' },
  'எண்': { meaningEn: 'Number / Reference No.', category: 'Measurement / Index', root: 'எண்' },
  'விஸ்தீரணம்': { meaningEn: 'Extent / Area Measurement', category: 'Survey Measurement', root: 'விஸ்தீரணம்' },
  'சென்ட்': { meaningEn: 'Cents (Unit of Land Extent)', category: 'Survey Unit', root: 'Cent' },
  'ஏக்கர்': { meaningEn: 'Acre (Land Unit)', category: 'Survey Unit', root: 'Acre' },
  'குழி': { meaningEn: 'Kuzhi (Traditional Tamil Land Unit)', category: 'Traditional Measure', root: 'குழி' },
  'எல்லைகள்': { meaningEn: 'Boundaries (North, South, East, West)', category: 'Property Description', root: 'எல்லை' },
  'வடக்கு': { meaningEn: 'North', category: 'Direction', root: 'வடக்கு' },
  'தெற்கு': { meaningEn: 'South', category: 'Direction', root: 'தெற்கு' },
  'கிழக்கு': { meaningEn: 'East', category: 'Direction', root: 'கிழக்கு' },
  'மேற்கு': { meaningEn: 'West', category: 'Direction', root: 'மேற்கு' },
  'வில்லங்கம்': { meaningEn: 'Encumbrance / Lien on property', category: 'Registration Law', root: 'வில்லங்கம்' },
  'சார்பதிவு': { meaningEn: 'Sub-Registry office', category: 'Registration Department', root: 'சார் + பதிவு' },
  'முத்திரைத்தாள்': { meaningEn: 'Stamp Paper', category: 'Registration Law', root: 'முத்திரை + தாள்' },
  'சான்றொப்பம்': { meaningEn: 'Attestation / Witness Signature', category: 'Legal Authentication', root: 'சான்று + ஒப்பம்' },
  'சாட்சிகள்': { meaningEn: 'Witnesses', category: 'Legal Authentication', root: 'சாட்சி' },

  // School Education, SMC & Academic Administration Terms
  'பள்ளிக்': { meaningEn: 'School / Educational', category: 'Education Department', root: 'பள்ளி' },
  'கல்வித்துறை': { meaningEn: 'Education Department', category: 'Government Department', root: 'கல்வி + துறை' },
  'பள்ளி': { meaningEn: 'School / Institution', category: 'Education', root: 'பள்ளி' },
  'மேலாண்மைக்குழு': { meaningEn: 'Management Committee (SMC)', category: 'School Governance', root: 'மேலாண்மை + குழு' },
  'மறுக்கட்டமைப்பு': { meaningEn: 'Restructuring / Reconstitution', category: 'Administrative Process', root: 'மறு + கட்டமைப்பு' },
  'நெறிமுறைகள்': { meaningEn: 'Guidelines / Regulations / Standard Operating Procedures', category: 'Regulatory Framework', root: 'நெறிமுறை' },
  'வழிகாட்டு': { meaningEn: 'Guiding / Directional', category: 'Regulatory Framework', root: 'வழி + காட்டு' },
  'அனுமதி': { meaningEn: 'Permission / Sanction / Approval', category: 'Administrative Approval', root: 'அனுமதி' },
  'அளித்தல்': { meaningEn: 'Granting / Accorded / Issuing', category: 'Administrative Action', root: 'அளி' },
  'வெளியிடப்படுகிறது': { meaningEn: 'Is hereby issued / published', category: 'Order Formula', root: 'வெளியீடு' },
  'வௌியிடப்படுகிறது': { meaningEn: 'Is hereby issued (archaic sandhi spelling)', category: 'Order Formula', root: 'வெளியீடு' },
  'தலைமையாசிரியர்': { meaningEn: 'Headmaster / Headmistress / Principal', category: 'School Administration', root: 'தலைமை + ஆசிரியர்' },
  'ஆசிரியர்': { meaningEn: 'Teacher / Educator', category: 'School Administration', root: 'ஆசிரியர்' },
  'உறுப்பினர்கள்': { meaningEn: 'Members / Committee Representatives', category: 'Governance', root: 'உறுப்பினர் + கள்' },
  'உறுப்பினர்': { meaningEn: 'Member / Representative', category: 'Governance', root: 'உறுப்பினர்' },
  'பெற்றோர்': { meaningEn: 'Parents / Guardians', category: 'Stakeholder', root: 'பெற்றோர்' },
  'தாய்மார்கள்': { meaningEn: 'Mothers (50% SMC representation mandate)', category: 'Stakeholder', root: 'தாய் + மார்கள்' },
  'வகுப்பு': { meaningEn: 'Class / Standard / Grade', category: 'Education', root: 'வகுப்பு' },
  'கல்வி': { meaningEn: 'Education / Learning', category: 'Education', root: 'கல்வி' },

  // Judicial & Legal Terms
  'நீதிமன்றம்': { meaningEn: 'Court of Law', category: 'Judiciary', root: 'நீதி + மன்றம்' },
  'உயர்நீதிமன்றம்': { meaningEn: 'High Court', category: 'Judiciary', root: 'உயர் + நீதிமன்றம்' },
  'வழக்கு': { meaningEn: 'Lawsuit / Case / Suit', category: 'Judiciary', root: 'வழக்கு' },
  'மனுதாரர்': { meaningEn: 'Petitioner / Applicant', category: 'Judiciary', root: 'மனு + தாரர்' },
  'எதிர்மனுதாரர்': { meaningEn: 'Respondent / Opposite Party', category: 'Judiciary', root: 'எதிர் + மனுதாரர்' },
  'தீர்ப்பு': { meaningEn: 'Judgement / Verdict', category: 'Judiciary', root: 'தீர்ப்பு' },
  'உத்தரவு': { meaningEn: 'Order / Injunction', category: 'Judiciary', root: 'உத்தரவு' },
  'உறுதிமொழி': { meaningEn: 'Affidavit / Solemn Affirmation', category: 'Judiciary', root: 'உறுதி + மொழி' },
  'பிரமாணப்': { meaningEn: 'Affidavit / Sworn', category: 'Judiciary', root: 'பிரமாணம்' },

  // Additional Governance, Legal, Registration, Gazette & Classical Terms
  'அரசிதழ்': { meaningEn: 'Official Gazette / Government Gazette', category: 'Official Publication', root: 'அரசு + இதழ்' },
  'அரசாங்க': { meaningEn: 'Governmental / State Administrative', category: 'Government Jurisdiction', root: 'அரசாங்கம்' },
  'கருவூலம்': { meaningEn: 'State Treasury', category: 'Finance / Treasury', root: 'கருவூலம்' },
  'கருவூலங்களுக்கும்': { meaningEn: 'To the Treasuries', category: 'Finance / Treasury', root: 'கருவூலம் + கள் + கு + உம்' },
  'விடுமுறை': { meaningEn: 'Official Holiday / Public Leave', category: 'Administration', root: 'விடுமுறை' },
  'நாட்கள்': { meaningEn: 'Days / Dates', category: 'Calendar', root: 'நாள் + கள்' },
  'செலாவணி': { meaningEn: 'Negotiable Instruments / Currency', category: 'Commercial Law', root: 'செலாவணி' },
  'சட்டம்': { meaningEn: 'Act / Statutory Law', category: 'Statutory Law', root: 'சட்டம்' },
  'பிரிவு': { meaningEn: 'Section / Clause of Act', category: 'Legal Structure', root: 'பிரிவு' },
  'நீதித்துறை': { meaningEn: 'Judiciary / Judicial Department', category: 'Judiciary', root: 'நீதி + துறை' },
  'நீதிமன்றங்களுக்கும்': { meaningEn: 'To Courts of Law', category: 'Judiciary', root: 'நீதிமன்றம் + கள் + கு + உம்' },
  'சுவாதீனம்': { meaningEn: 'Possession / Custody of Property', category: 'Property Law', root: 'சுவாதீனம்' },
  'சுவாதீனத்துடன்': { meaningEn: 'With complete absolute possession', category: 'Property Law', root: 'சுவாதீனம் + உடன்' },
  'அடமானம்': { meaningEn: 'Mortgage / Hypothecation', category: 'Property Law', root: 'அடமானம்' },
  'அடமானமோ': { meaningEn: 'Any Mortgage / Lien', category: 'Property Law', root: 'அடமானம்' },
  'ஜப்தி': { meaningEn: 'Attachment / Seizure of Property', category: 'Civil Procedure', root: 'ஜப்தி' },
  'ஜப்தியோ': { meaningEn: 'Any Attachment / Distraint', category: 'Civil Procedure', root: 'ஜப்தி' },
  'வில்லங்கமோ': { meaningEn: 'Any Encumbrance / Charge', category: 'Property Law', root: 'வில்லங்கம்' },
  'ஆட்சித்தலைவர்': { meaningEn: 'District Collector / Magistrate', category: 'District Administration', root: 'ஆட்சி + தலைவர்' },
  'ஆட்சித்தலைவர்கள்': { meaningEn: 'District Collectors', category: 'District Administration', root: 'ஆட்சி + தலைவர் + கள்' },
  'ஆட்சிமொழி': { meaningEn: 'Official Language of Administration', category: 'Language Policy', root: 'ஆட்சி + மொழி' },
  'ஒருங்குறி': { meaningEn: 'Unicode Standard Encoding', category: 'Information Technology', root: 'ஒருங்கு + குறி' },
  'கணினிமயமாக்கல்': { meaningEn: 'Computerization / Digitalization', category: 'Information Technology', root: 'கணினி + மயம் + ஆக்கல்' },
  'பங்குனி': { meaningEn: 'Panguni (12th Tamil Solar Month)', category: 'Tamil Solar Calendar', root: 'பங்குனி' },
  'ஆவணி': { meaningEn: 'Aavani (5th Tamil Solar Month)', category: 'Tamil Solar Calendar', root: 'ஆவணி' },
  'திருவள்ளுவர்': { meaningEn: 'Thiruvalluvar (Tamil Sage & Era Epoch)', category: 'Tamil Era', root: 'திருவள்ளுவர்' },
  'புணரியல்': { meaningEn: 'Chapter on Phonological Sandhi', category: 'Classical Grammar', root: 'புணர் + இயல்' },
  'சூத்திரம்': { meaningEn: 'Grammatical Aphorsim / Formula / Sutra', category: 'Grammar Verse', root: 'சூத்திரம்' },
  'பதவுரை': { meaningEn: 'Word-by-word Exegesis / Gloss', category: 'Commentary Exegesis', root: 'பதம் + உரை' },
  'புணர்ச்சி': { meaningEn: 'Sandhi / Phonological Morphophonemics', category: 'Grammar Mechanism', root: 'புணர்ச்சி' },
  'நிலைமொழி': { meaningEn: 'Preceding Word / Standing Base', category: 'Sandhi Component', root: 'நிலை + மொழி' },
  'வருமொழி': { meaningEn: 'Following Word / Suffix Ingress', category: 'Sandhi Component', root: 'வரு + மொழி' },
  'தோன்றல்': { meaningEn: 'Augmentation / Insertion Sandhi', category: 'Sandhi Classification', root: 'தோன்றல்' },
  'திரிதல்': { meaningEn: 'Mutation / Transformation Sandhi', category: 'Sandhi Classification', root: 'திரிதல்' },
  'கெடுதல்': { meaningEn: 'Elision / Deletion Sandhi', category: 'Sandhi Classification', root: 'கெடுதல்' },
  'உடம்படுமெய்': { meaningEn: 'Intervocalic Gliding Consonant (ய், வ்)', category: 'Phonology', root: 'உடம்படு + மெய்' },
  'தமிழ்த்தாய்': { meaningEn: 'Mother Tamil (Personification)', category: 'Literary Deity', root: 'தமிழ் + தாய்' },
  'மரவேர்': { meaningEn: 'Tree Root (Elision Sandhi Example)', category: 'Grammar Example', root: 'மரம் + வேர்' },
  'மணியடித்தான்': { meaningEn: 'Rang the bell (Gliding Sandhi Example)', category: 'Grammar Example', root: 'மணி + அடித்தான்' },
  'உரை': { meaningEn: 'Commentary / Exegesis', category: 'Literature', root: 'உரை' },
  'உரையாசிரியர்': { meaningEn: 'Commentator / Exegete', category: 'Scholarship', root: 'உரை + ஆசிரியர்' },
  'வல்லினம்': { meaningEn: 'Hard Consonants (k, c, t, th, p, r)', category: 'Phonology', root: 'வல் + இனம்' },
  'மெல்லினம்': { meaningEn: 'Nasal Consonants (ng, nj, n, nh, m, nn)', category: 'Phonology', root: 'மெல் + இனம்' },
  'இடையினம்': { meaningEn: 'Medial Consonants (y, r, l, v, zh, L)', category: 'Phonology', root: 'இடை + இனம்' }
};

// ==========================================
// SCRIPT NORMALIZER & LIGATURE SANITY
// ==========================================
export function normalizeTamilScript(rawUnicode: string): { normalized: string; fixesCount: number } {
  if (!rawUnicode) return { normalized: '', fixesCount: 0 };
  let text = rawUnicode;
  let fixesCount = 0;

  // 1. Convert Tamil numerals to standard Arabic representation where requested
  text = parseTamilNumerals(text);

  // 2. Modernize archaic glyphs (old ணா, றா, னா, ணை, லை, ளை, னை)
  const archaic = modernizeArchaicTamilGlyphs(text);
  text = archaic.text;
  fixesCount += archaic.replacementsCount;

  // 3. Fix misplaced / transposed Kombu (ெ, ே, ை) and vowel modifier errors (e.g. பறெுநர் -> பெறுநர், அனதை்துத் -> அனைத்துத், சயெலகப் -> செயலகப்)
  const soundAlike = fixTamilSoundAlikeConfusions(text);
  text = soundAlike.text;
  fixesCount += soundAlike.fixes.length;

  // 4. Fix leading isolated kombu (when scanned/typed at start of word/token before consonant: e.g. ' ெப' -> ' பெ')
  const leadingKombuRegex = /(^|[^\u0B80-\u0BFF\w])([ெேை])([க-ஹ])/g;
  if (leadingKombuRegex.test(text)) {
    text = text.replace(leadingKombuRegex, (_, prefix, kombu, cons) => {
      fixesCount++;
      return `${prefix}${cons}${kombu}`;
    });
  }

  // 5. Fix broken O / Oo ligatures: consonant + 'ெ' + 'ா' => consonant + 'ொ'
  const oRegex = /([க-ஹ])ொ/g;
  if (oRegex.test(text)) {
    text = text.replace(oRegex, (_, cons) => {
      fixesCount++;
      return cons + 'ொ';
    });
  }

  // 6. Fix broken Oo ligatures: consonant + 'ே' + 'ா' => consonant + 'ோ'
  const ooRegex = /([க-ஹ])ோ/g;
  if (ooRegex.test(text)) {
    text = text.replace(ooRegex, (_, cons) => {
      fixesCount++;
      return cons + 'ோ';
    });
  }

  // 7. Fix broken Au ligatures: consonant + 'ெ' + 'ள' => consonant + 'ௌ'
  const auRegex = /([க-ஹ])ெள/g;
  if (auRegex.test(text)) {
    text = text.replace(auRegex, (_, cons) => {
      fixesCount++;
      return cons + 'ௌ';
    });
  }

  // 8. Remove duplicated consecutive pullis (e.g. க்் -> க்)
  const doublePulliRegex = /்+/g;
  text = text.replace(doublePulliRegex, (m) => {
    if (m.length > 1) {
      fixesCount += m.length - 1;
      return '்';
    }
    return m;
  });

  return { normalized: text, fixesCount };
}

// ==========================================
// SANDHI & MORPHOLOGY TOKEN ENRICHER
// ==========================================
export function enrichWordTokens(rawWords: string[]): WordToken[] {
  return rawWords.map((word, idx) => {
    const cleanWord = word.trim();
    if (!cleanWord) {
      return {
        id: `w-${idx}`,
        text: word,
        confidence: 1.0,
        isoTransliteration: '',
        phonetic: ''
      };
    }

    const lookupKey = cleanWord.replace(/[.,:;()'"\-[\]]/g, '');
    const lexMatch = GOV_LEGAL_LEXICON[lookupKey] || GOV_LEGAL_LEXICON[cleanWord];

    // Compute syllable breakdown via open-tamil engine
    const syllables = splitTamilSyllables(cleanWord);
    const iso = syllables.map((s) => s.iso).join('');

    // Detect Sandhi junction
    let hasSandhi = false;
    let sandhiRule: string | undefined = undefined;

    if (/[க-ஹ][்]$/.test(cleanWord)) {
      const lastChar = cleanWord.slice(-2);
      if (['க்', 'ச்', 'த்', 'ப்'].includes(lastChar)) {
        hasSandhi = true;
        sandhiRule = `தோன்றல் புணர்ச்சி (வல்லொற்று மிகுதல் - ${lastChar})`;
      }
    }

    return {
      id: `w-${idx}-${Date.now() % 10000}`,
      text: cleanWord,
      originalText: cleanWord,
      confidence: lexMatch ? 0.99 : 0.94,
      isoTransliteration: iso,
      phonetic: iso
        .replace(/ā/g, 'aa')
        .replace(/ī/g, 'ee')
        .replace(/ū/g, 'oo')
        .replace(/ē/g, 'ae')
        .replace(/ō/g, 'oa')
        .replace(/kṣ/g, 'ksh')
        .replace(/ś/g, 'sh'),
      rootWord: lexMatch?.root,
      isGovernmentTerm: !!lexMatch,
      meaningEn: lexMatch?.meaningEn,
      posTag: lexMatch?.category || (hasSandhi ? 'Sandhi Compound' : undefined),
      hasSandhi,
      sandhiRule
    };
  });
}

// ==========================================
// DYNAMIC DOCUMENT STRUCTURE & METADATA PARSER
// ==========================================
export interface ExtractedDocStructure {
  metadata: {
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
  };
  lines: LineToken[];
  tables: {
    id: string;
    caption?: string;
    headers: string[];
    rows: string[][];
  }[];
  highCount: number;
  medCount: number;
  lowCount: number;
  sandhiCount: number;
  govTermsCount: number;
}

export function extractTamilDocumentStructureAndMetadata(
  normalizedText: string,
  userHint?: string
): ExtractedDocStructure {
  const rawLines = normalizedText.split('\n');
  const nonEmptyLines = rawLines.map(l => l.trim()).filter(Boolean);

  // 1. Identify Document Title
  let documentTitle = userHint || '';
  if (!documentTitle && nonEmptyLines.length > 0) {
    documentTitle = nonEmptyLines[0];
    if (nonEmptyLines.length > 1 && (nonEmptyLines[0] === 'தமிழ்நாடு அரசு' || nonEmptyLines[0].includes('அரசு'))) {
      documentTitle = `${nonEmptyLines[0]} - ${nonEmptyLines[1]}`;
    }
  }

  // 2. Scan for specific administrative metadata fields
  let department: string | undefined;
  let orderNumber: string | undefined;
  let dateStr: string | undefined;
  let place: string | undefined;
  let subject: string | undefined;
  let reference: string | undefined;
  let signatory: string | undefined;

  // Tables detection
  const tables: { id: string; caption?: string; headers: string[]; rows: string[][] }[] = [];
  let currentTable: { id: string; caption?: string; headers: string[]; rows: string[][] } | null = null;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();
    if (!line) continue;

    // Detect Department
    if (!department && (line.includes('துறை') || line.includes('அலுவலகம்'))) {
      department = line;
    }

    // Detect Order Number / Deed Number / Notification Number
    if (!orderNumber) {
      const orderMatch = line.match(/(அரசாணை\s*(?:\(நிலை\))?\s*எண்[:\s]*[^\n,]+|ஆவண\s*எண்[:\s]*[^\n,]+|அறிவிக்கை\s*எண்[:\s]*[^\n,]+|பட்டா\s*எண்[:\s]*[^\n,]+|vz;[:\s]*[^\n,]+)/i);
      if (orderMatch) {
        orderNumber = orderMatch[1].trim();
      }
    }

    // Detect Date
    if (!dateStr) {
      const dateMatch = line.match(/(?:நாள்|தேதி|ehs;)[:\s]*([^\n]+)|(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})|(\d{4}[-—]ஆம்\s*ஆண்டு\s*[^\n]+தேதி)/i);
      if (dateMatch) {
        dateStr = (dateMatch[1] || dateMatch[2] || dateMatch[3] || line).trim();
      }
    }

    // Detect Place / City
    if (!place) {
      if (line.includes('சென்னை') || line.includes('திருக்கழுக்குன்றம்') || line.includes('மதுரை') || line.includes('கோயம்புத்தூர்') || line.includes('திருச்சிராப்பள்ளி')) {
        place = line;
      }
    }

    // Detect Subject (பொருள் / சுருக்கம்)
    if (!subject) {
      if (line.startsWith('பொருள்:') || line.startsWith('பொருள் :') || line.startsWith('nghUs;:')) {
        subject = line.replace(/^(?:பொருள்|nghUs;)[:\s]*/i, '').trim();
      } else if (line.startsWith('சுருக்கம்')) {
        subject = rawLines[i + 1]?.trim() || line;
      }
    }

    // Detect Reference (பார்வை)
    if (!reference) {
      if (line.startsWith('பார்வை:') || line.startsWith('பார்வை :') || line.startsWith('ghh;it:')) {
        reference = line.replace(/^(?:பார்வை|ghh;it:)[:\s]*/i, '').trim();
        if (!reference && rawLines[i + 1]) {
          reference = rawLines[i + 1].trim();
        }
      }
    }

    // Detect Signatory (கையொப்பம் / ஆணைப்படி)
    if (!signatory) {
      if (line.includes('ஆணைப்படி') || line.includes('MSeupd; Mizg;gb') || line.includes('செயலாளர்') || line.includes('nrayhsh;') || line.includes('கிரயதாரர்') || line.includes('விற்பனையாளர்')) {
        signatory = line;
        if (rawLines[i + 1] && rawLines[i + 1].trim()) {
          signatory += `, ${rawLines[i + 1].trim()}`;
        }
      }
    }

    // Detect Table Lines
    if (line.startsWith('அட்டவணை:') || line.startsWith('அட்டவணை')) {
      if (currentTable && currentTable.rows.length > 0) {
        tables.push(currentTable);
      }
      currentTable = {
        id: `tbl-${tables.length + 1}`,
        caption: line,
        headers: [],
        rows: []
      };
      continue;
    }

    if (line.includes('|')) {
      const parts = line.split('|').map(p => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        if (!currentTable) {
          currentTable = {
            id: `tbl-${tables.length + 1}`,
            caption: 'அட்டவணை விவரங்கள்',
            headers: parts,
            rows: []
          };
        } else if (currentTable.headers.length === 0) {
          currentTable.headers = parts;
        } else {
          currentTable.rows.push(parts);
        }
      }
    } else if (currentTable && currentTable.rows.length > 0 && line.length > 0 && !line.includes('|')) {
      tables.push(currentTable);
      currentTable = null;
    }
  }

  if (currentTable && (currentTable.headers.length > 0 || currentTable.rows.length > 0)) {
    tables.push(currentTable);
  }

  // 3. Process Lines and enrich with word tokens
  let highCount = 0;
  let medCount = 0;
  let lowCount = 0;
  let sandhiCount = 0;
  let govTermsCount = 0;

  const lines: LineToken[] = rawLines.map((lineStr, idx) => {
    const words = lineStr.split(/\s+/).filter(Boolean);
    const enrichedWords = enrichWordTokens(words);

    for (const w of enrichedWords) {
      if (w.confidence >= 0.95) highCount++;
      else if (w.confidence >= 0.8) medCount++;
      else lowCount++;

      if (w.hasSandhi) sandhiCount++;
      if (w.isGovernmentTerm) govTermsCount++;
    }

    let lineType: 'HEADER' | 'PARAGRAPH' | 'TABLE_ROW' | 'SIGNATURE' | 'REFERENCE' | 'SUBJECT' = 'PARAGRAPH';
    if (lineStr.includes('|')) {
      lineType = 'TABLE_ROW';
    } else if (idx === 0 || lineStr.includes('அரசாணை') || lineStr.includes('அரசு') || lineStr.includes('அரசிதழ்') || lineStr.includes('தொல்காப்பியம்')) {
      lineType = 'HEADER';
    } else if (lineStr.startsWith('பார்வை') || lineStr.startsWith('பார்வை:') || lineStr.startsWith('ghh;it')) {
      lineType = 'REFERENCE';
    } else if (lineStr.startsWith('பொருள்') || lineStr.startsWith('பொருள்:') || lineStr.startsWith('nghUs;')) {
      lineType = 'SUBJECT';
    } else if (lineStr.includes('செயலாளர்') || lineStr.includes('ஒப்பம்') || lineStr.includes('ஆணைப்படி') || lineStr.includes('Mizg;gb') || lineStr.includes('இயக்குநர்') || lineStr.includes('சார்பதிவாளர்')) {
      lineType = 'SIGNATURE';
    }

    return {
      id: `line-${idx + 1}`,
      lineNumber: idx + 1,
      type: lineType,
      tamilText: lineStr,
      originalRawText: lineStr,
      confidence: 0.96,
      words: enrichedWords
    };
  });

  return {
    metadata: {
      documentTitle: documentTitle || 'தமிழ் ஆவணம் (Tamil Document)',
      department: department || 'பொது நிருவாகத் துறை',
      orderNumber,
      dateStr,
      place,
      subject,
      reference,
      signatory,
      pageCount: 1
    },
    lines,
    tables,
    highCount,
    medCount,
    lowCount,
    sandhiCount,
    govTermsCount
  };
}

// ==========================================
// TRANSLITERATION HELPER (ISO 15919)
// ==========================================
export function transliterateTamilToISO(tamilText: string): string {
  if (!tamilText) return '';
  const syllables = splitTamilSyllables(tamilText);
  return syllables.map((s) => s.iso).join('');
}

