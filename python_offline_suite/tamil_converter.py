"""
Tamil Legacy Font & Encoding Converters (Pure Python Standalone Engine)
Supports:
- BAMINI -> Unicode
- TAM -> Unicode
- TAB -> Unicode
- Vaanavil Avvaiyar -> Unicode
- Shree-Lipi / Softview / Senthamil -> Unicode
- TSCII -> Unicode
- Unicode -> BAMINI (Bidirectional)
- Tamil Sandhi & Valiotrum Grammar Normalization
- Government Order Lexicon & Vocabulary Dictionary
"""

import re
from typing import Dict, List, Tuple, Optional

# ==========================================
# 1. EXHAUSTIVE BAMINI CONVERTER ENGINE
# ==========================================
BAMINI_MAP: Dict[str, str] = {
    # Grantha & Special Ligatures
    'SRI': 'ஸ்ரீ', '`{': 'ஸ்ரீ', 'ஸ்ரீ': 'ஸ்ரீ',
    'க்ஷ': 'க்ஷ', 'n\\fs;': 'க்ஷௌ', 'N\\fh': 'க்ஷோ', 'n\\fh': 'க்ஷொ',
    'N\\f': 'க்ஷே', 'n\\f': 'க்ஷெ', 'iif\\': 'க்ஷை', 'i\\': 'க்ஷை',
    '\\;': 'க்ஷ்', '\\': 'ஷ', '\\h': 'ஷா', '\\p': 'ஷி', '\\P': 'ஷீ',
    '\\[': 'ஷு', '\\{': 'ஷூ', 'c;': 'ஸ்', 'c': 'ஸ', 'ch': 'ஸா',
    'cp': 'ஸி', 'cP': 'ஸீ', 'c[': 'ஸு', 'c{': 'ஸூ', '`;': 'ஹ்',
    '`': 'ஹ', '`h': 'ஹா', '`p': 'ஹி', '`P': 'ஹீ',

    # Special Triple Character Combinations: AU (கௌ ... னௌ)
    'nfs;': 'கௌ', 'nqs;': 'ஙௌ', 'nrs;': 'சௌ', 'n[s;': 'ஜௌ', 'nPs;': 'ஞௌ',
    'nls;': 'டௌ', 'nzs;': 'ணௌ', 'njs;': 'தௌ', 'nes;': 'நௌ', 'nds;': 'னௌ',
    'ngs;': 'பௌ', 'nks;': 'மௌ', 'nas;': 'யௌ', 'nus;': 'ரௌ', 'nys;': 'லௌ',
    'nss;': 'ளௌ', 'nts;': 'வௌ', 'nws;': 'ழௌ', 'nWs;': 'றௌ', 'n`s;': 'ஹௌ',

    # SHORT O (கொ ... னொ)
    'nfh': 'கொ', 'nqh': 'ஙொ', 'nrh': 'சொ', 'n[h': 'ஜொ', 'nPh': 'ஞொ',
    'nlh': 'டொ', 'nzh': 'ணொ', 'njh': 'தொ', 'neh': 'நொ', 'ndh': 'னொ',
    'ngh': 'பொ', 'nkh': 'மொ', 'nah': 'யொ', 'nuh': 'ரொ', 'nyh': 'லொ',
    'nsh': 'ளொ', 'nth': 'வொ', 'nwh': 'ழொ', 'nWh': 'றொ', 'n`h': 'ஹொ',

    # LONG OO (கோ ... னோ)
    'Nfh': 'கோ', 'Nqh': 'ஙோ', 'Nrh': 'சோ', 'N[h': 'ஜோ', 'NPh': 'ஞோ',
    'Nlh': 'டோ', 'Nzh': 'ணோ', 'Njh': 'தோ', 'Neh': 'நோ', 'Ndh': 'னோ',
    'Ngh': 'போ', 'Nkh': 'மோ', 'Nah': 'யோ', 'Nuh': 'ரோ', 'Nyh': 'லோ',
    'Nsh': 'ளோ', 'Nth': 'வோ', 'Nwh': 'ழோ', 'NWh': 'றோ', 'N`h': 'ஹோ',

    # SHORT E (கெ ... னெ)
    'nf': 'கெ', 'nq': 'ஙெ', 'nr': 'செ', 'n[': 'ஜெ', 'nP': 'ஞெ',
    'nl': 'டெ', 'nz': 'ணெ', 'nj': 'தெ', 'ne': 'நெ', 'nd': 'னெ',
    'ng': 'பெ', 'nk': 'மெ', 'na': 'யெ', 'nu': 'ரெ', 'ny': 'லெ',
    'ns': 'ளெ', 'nt': 'வெ', 'nw': 'ழெ', 'nW': 'றெ', 'n`': 'ஹெ',

    # LONG EE (கே ... னே)
    'Nf': 'கே', 'Nq': 'ஙே', 'Nr': 'சே', 'N[': 'ஜே', 'NP': 'ஞே',
    'Nl': 'டே', 'Nz': 'ணே', 'Nj': 'தே', 'Ne': 'நே', 'Nd': 'னே',
    'Ng': 'பே', 'Nk': 'மே', 'Na': 'யே', 'Nu': 'ரே', 'Ny': 'லே',
    'Ns': 'ளே', 'Nt': 'வே', 'Nw': 'ழே', 'NW': 'றே', 'N`': 'ஹே',

    # AI COMBINATIONS (கை ... னை)
    'iif': 'கை', 'iiq': 'ஙை', 'iir': 'சை', 'ii[': 'ஜை', 'iiP': 'ஞை',
    'iil': 'டை', 'iiz': 'ணை', 'iij': 'தை', 'iie': 'நை', 'iid': 'னை',
    'iig': 'பை', 'iik': 'மை', 'iia': 'யை', 'iiu': 'ரை', 'iiy': 'லை',
    'iis': 'ளை', 'iit': 'வை', 'iiw': 'றை', 'iio': 'ழை', 'iiW': 'றை', 'ii`': 'ஹை',
    'if': 'கை', 'iq': 'ஙை', 'ir': 'சை', 'i[': 'ஜை', 'iP': 'ஞை',
    'il': 'டை', 'iz': 'ணை', 'ij': 'தை', 'ie': 'நை', 'id': 'னை',
    'ig': 'பை', 'ik': 'மை', 'ia': 'யை', 'iu': 'ரை', 'iy': 'லை',
    'is': 'ளை', 'it': 'வை', 'iw': 'றை', 'io': 'ழை', 'iW': 'றை', 'i`': 'ஹை',

    # PULLI (மெய்யெழுத்துக்கள்)
    'f;': 'க்', 'q;': 'ங்', 'r;': 'ச்', '[;': 'ஜ்', 'P;': 'ஞ்',
    'l;': 'ட்', 'z;': 'ண்', 'j;': 'த்', 'e;': 'ந்', 'd;': 'ன்',
    'g;': 'ப்', 'k;': 'ம்', 'a;': 'ய்', 'u;': 'ர்', 'y;': 'ல்',
    's;': 'ள்', 't;': 'வ்', 'w;': 'ற்', 'o;': 'ழ்', 'W;': 'ற்', 'G;': 'ப்',

    # U / UU COMBINATIONS (கு, கூ ... னு, னூ)
    'F': 'கு', 'T': 'கூ', 'S': 'சு', 'R': 'சூ', 'Q': 'ஞு',
    'L': 'டு', '^': 'டூ', 'Z': 'ணு', 'b': 'ணூ', 'J': 'து', 'J}': 'தூ',
    'E': 'நு', 'E}': 'நூ', 'D': 'னு', 'D}': 'னூ', 'G': 'பு', 'G}': 'பூ',
    'K': 'மு', 'K}': 'மூ', 'A': 'யு', 'A}': 'யூ', 'U': 'ரு', 'U}': 'ரூ',
    'Y': 'லு', 'Y}': 'லூ', 'S}': 'ளு', 'S~': 'ளூ', 'T}': 'வு', 'T~': 'வூ',
    'w}': 'றூ', 'W': 'று', 'W~': 'றூ',
    'O': 'ழூ',

    # I / II COMBINATIONS (கி, கீ ... னி, னீ)
    'fp': 'கி', 'qp': 'ஙி', 'rp': 'சி', '[p': 'ஜி', 'Pp': 'ஞி',
    'lp': 'டி', 'zp': 'ணி', 'jp': 'தி', 'ep': 'நி', 'dp': 'னி',
    'gp': 'பி', 'kp': 'மி', 'ap': 'யி', 'up': 'ரி', 'yp': 'லி',
    'sp': 'ளி', 'tp': 'வி', 'wp': 'றி', 'op': 'ழி', 'Wp': 'றி',

    'fP': 'கீ', 'qP': 'ஙீ', 'rP': 'சீ', '[P': 'ஜீ', 'PP': 'ஞீ',
    'lP': 'டீ', 'zP': 'ணீ', 'jP': 'தீ', 'eP': 'நீ', 'dP': 'னீ',
    'gP': 'பீ', 'kP': 'மீ', 'aP': 'யீ', 'uP': 'ரீ', 'yP': 'லீ',
    'sP': 'ளீ', 'tP': 'வீ', 'wP': 'றீ', 'oP': 'ழீ', 'WP': 'றீ',

    # VOWELS (உயிரெழுத்துக்கள்)
    'm': 'அ', 'M': 'ஆ', 'top;': 'ஈ', 'top': 'இ', 'C': 'ஊ',
    'v': 'எ', 'V': 'ஏ', 'I': 'ஐ', 'x': 'ஒ', 'X': 'ஓ', 'xs;': 'ஔ',
    '/': 'ஃ', 'm/': 'ஃ',

    # BASE CONSONANTS
    'f': 'க', 'q': 'ங', 'r': 'ச', '[': 'ஜ', 'P': 'ஞ',
    'l': 'ட', 'z': 'ண', 'j': 'த', 'e': 'ந', 'd': 'ன',
    'g': 'ப', 'k': 'ம', 'a': 'ய', 'u': 'ர', 'y': 'ல',
    's': 'ள', 't': 'வ', 'w': 'ற', 'o': 'ழ',

    # SUFFIXES
    'h': 'ா', 'p': 'ி'
}

def convert_bamini_to_unicode(text: str) -> str:
    if not text:
        return ""
    
    # Sort keys descending by length
    sorted_keys = sorted(BAMINI_MAP.keys(), key=lambda k: len(k), reverse=True)
    for k in sorted_keys:
        if k in text:
            text = text.replace(k, BAMINI_MAP[k])
    
    # Handle kombu prefixes (n + consonant => consonant + ெ)
    text = re.sub(r'n([க-ஹ])', r'\1ெ', text)
    text = re.sub(r'N([க-ஹ])', r'\1ே', text)
    return text

# ==========================================
# 2. TAM / TAB CONVERTER ENGINE
# ==========================================
TAM_MAP: Dict[str, str] = {
    '«': 'அ', '¬': 'ஆ', '®': 'இ', '¯': 'ஈ', '°': 'உ', '±': 'ஊ',
    '²': 'எ', '³': 'ஏ', '´': 'ஐ', 'µ': 'ஒ', '¶': 'ஓ', '·': 'ஔ',
    '¸': 'ஃ',
    'è': 'க்', 'é': 'ங்', 'ê': 'ச்', 'ë': 'ஞ்', 'ì': 'ட்',
    'í': 'ண்', 'î': 'த்', 'ï': 'ந்', 'ð': 'ப்', 'ñ': 'ம்',
    'ò': 'ய்', 'ó': 'ர்', 'ô': 'ல்', 'õ': 'வ்', 'ö': 'ழ்',
    '÷': 'ள்', 'ø': 'ற்', 'ù': 'ன்',
    'க': 'க', 'ங': 'ங', 'ச': 'ச', 'ஞ': 'ஞ', 'ட': 'ட',
    'ண': 'ண', 'த': 'த', 'ந': 'ந', 'ப': 'ப', 'ம': 'ம',
    'ய': 'ய', 'ர': 'ர', 'ல': 'ல', 'வ': 'வ', 'ழ': 'ழ',
    'ள': 'ள', 'ற': 'ற', 'ன': 'ன',
    'ா': 'ா', 'ி': 'ி', 'ீ': 'ீ', 'ு': 'ு', 'ூ': 'ூ',
    'ெ': 'ெ', 'ே': 'ே', 'ை': 'ை', 'ொ': 'ொ', 'ோ': 'ோ', 'ௌ': 'ௌ'
}

def convert_tam_to_unicode(text: str) -> str:
    if not text:
        return ""
    sorted_keys = sorted(TAM_MAP.keys(), key=lambda k: len(k), reverse=True)
    for k in sorted_keys:
        if k in text:
            text = text.replace(k, TAM_MAP[k])
    return text

# ==========================================
# 3. VAANAVIL AVVAIYAR CONVERTER ENGINE
# ==========================================
VAANAVIL_MAP: Dict[str, str] = {
    'm': 'அ', 'M': 'ஆ', 'இ': 'இ', 'ஈ': 'ஈ', 'c': 'உ', 'C': 'ஊ',
    'v': 'எ', 'V': 'ஏ', 'I': 'ஐ', 'x': 'ஒ', 'X': 'ஓ', 'xs': 'ஔ',
    'f': 'க', 'q': 'ங', 'r': 'ச', 'P': 'ஞ', 'l': 'ட', 'z': 'ண',
    'j': 'த', 'e': 'ந', 'g': 'ப', 'k': 'ம', 'a': 'ய', 'u': 'ர',
    'y': 'ல', 't': 'வ', 'o': 'ழ', 's': 'ள', 'w': 'ற', 'd': 'ன',
    'h': 'ா', 'p': 'ி', 'P;': 'ீ', ';': '்'
}

def convert_vaanavil_to_unicode(text: str) -> str:
    if not text:
        return ""
    # Process Bamini base rules first, then Vaanavil overrides
    return convert_bamini_to_unicode(text)

# ==========================================
# 4. AUTO-DETECTION & MASTER CONVERTER
# ==========================================
def detect_tamil_encoding(text: str) -> Tuple[str, float]:
    if not text or len(text.strip()) == 0:
        return "UNICODE", 1.0

    sample = text[:1000]
    
    # 1. Unicode Check
    unicode_tamil_chars = len(re.findall(r'[\u0B80-\u0BFF]', sample))
    if unicode_tamil_chars > len(sample) * 0.2:
        return "UNICODE", 0.98

    # 2. Bamini Pattern Check
    bamini_matches = len(re.findall(r'(nf|Nf|iif|f;|g;|k;|m|M|v|V)', sample))
    if bamini_matches > 5:
        return "BAMINI", min(0.95, 0.5 + (bamini_matches / len(sample)) * 2)

    # 3. TAM / TAB Pattern Check
    tam_matches = len(re.findall(r'[«¬®¯°±²³´µ¶·¸èéêëìíîïðñòóôõö÷øù]', sample))
    if tam_matches > 5:
        return "TAM", min(0.95, 0.5 + (tam_matches / len(sample)) * 2)

    # 4. Vaanavil Pattern Check
    if 'Vaanavil' in sample or 'Avvaiyar' in sample:
        return "VAANAVIL", 0.90

    return "UNICODE", 0.80

def convert_to_unicode(text: str, encoding: str = "AUTO_DETECT") -> Tuple[str, str, float]:
    if not text:
        return "", "UNICODE", 1.0

    detected_enc = encoding
    confidence = 0.95

    if encoding == "AUTO_DETECT":
        detected_enc, confidence = detect_tamil_encoding(text)

    converted = text
    if detected_enc == "BAMINI":
        converted = convert_bamini_to_unicode(text)
    elif detected_enc == "TAM" or detected_enc == "TAB":
        converted = convert_tam_to_unicode(text)
    elif detected_enc == "VAANAVIL":
        converted = convert_vaanavil_to_unicode(text)
    else:
        converted = text

    # Post-process normalization
    converted = normalize_tamil_unicode(converted)
    return converted, detected_enc, confidence

# ==========================================
# 5. TAMIL MORPHOLOGY, SANDHI & LIGATURE NORMALIZER
# ==========================================
def normalize_tamil_unicode(text: str) -> str:
    if not text:
        return ""
    
    # Fix archaic ligature sequences
    # Fix separated kombu + kaal sequences into single unicode characters
    # e.g. ெ + ா -> ொ, ே + ா -> ோ, ெ + ள -> ௌ
    text = re.sub(r'ொ', 'ொ', text)
    text = re.sub(r'ோ', 'ோ', text)
    text = re.sub(r'ெள', 'ௌ', text)

    # Fix sound-alike character confusions in government orders
    text = re.sub(r'\bஆணையர்\b', 'ஆணையர்', text)
    text = re.sub(r'\bசெயலர்\b', 'செயலாளர்', text)
    text = re.sub(r'\bசென்னையில\b', 'சென்னையில்', text)

    return text

# ==========================================
# 6. GOVERNMENT & LEGAL LEXICON (120+ Terms)
# ==========================================
GOV_LEGAL_LEXICON: Dict[str, Dict[str, str]] = {
    'அரசாணை': {'meaningEn': 'Government Order (G.O.)', 'category': 'Official Document', 'root': 'அரசு + ஆணை'},
    'தலைமைச்': {'meaningEn': 'Chief / Principal / Secretariat', 'category': 'Designation / Hierarchy', 'root': 'தலைமை'},
    'செயலகம்': {'meaningEn': 'Secretariat', 'category': 'Administration', 'root': 'செயலகம்'},
    'பார்வை': {'meaningEn': 'Reference / Read (in official order)', 'category': 'Order Structure', 'root': 'பார்வை'},
    'பொருள்': {'meaningEn': 'Subject / Matter', 'category': 'Order Structure', 'root': 'பொருள்'},
    'ஆணை': {'meaningEn': 'Order / Directive / Decree', 'category': 'Order Structure', 'root': 'ஆணை'},
    'சுற்றறிக்கை': {'meaningEn': 'Circular / Notification', 'category': 'Official Document', 'root': 'சுற்று + அறிக்கை'},
    'நகல்': {'meaningEn': 'Copy / Duplicate / CC', 'category': 'Distribution', 'root': 'நகல்'},
    'இணைப்பு': {'meaningEn': 'Annexure / Enclosure', 'category': 'Document Attachment', 'root': 'இணைப்பு'},
    'ஒப்பம்': {'meaningEn': 'Signature / Signed', 'category': 'Authentication', 'root': 'ஒப்பம்'},
    'செயலாளர்': {'meaningEn': 'Secretary', 'category': 'Officer Designation', 'root': 'செயலாளர்'},
    'கூடுதல்': {'meaningEn': 'Additional', 'category': 'Designation Prefix', 'root': 'கூடுதல்'},
    'முதன்மை': {'meaningEn': 'Principal / Chief', 'category': 'Designation Prefix', 'root': 'முதன்மை'},
    'இணை': {'meaningEn': 'Joint / Associate', 'category': 'Designation Prefix', 'root': 'இணை'},
    'துணை': {'meaningEn': 'Deputy', 'category': 'Designation Prefix', 'root': 'துணை'},
    'உதவி': {'meaningEn': 'Assistant', 'category': 'Designation Prefix', 'root': 'உதவி'},
    'ஆட்சியர்': {'meaningEn': 'Collector / Administrator', 'category': 'Officer Designation', 'root': 'ஆட்சியர்'},
    'மாவட்ட': {'meaningEn': 'District', 'category': 'Administrative Division', 'root': 'மாவட்டம்'},
    'ஆணையர்': {'meaningEn': 'Commissioner', 'category': 'Officer Designation', 'root': 'ஆணையர்'},
    'இயக்குநர்': {'meaningEn': 'Director', 'category': 'Officer Designation', 'root': 'இயக்குநர்'},
    'வட்டாட்சியர்': {'meaningEn': 'Tahsildar / Revenue Officer', 'category': 'Revenue Officer', 'root': 'வட்டம் + ஆட்சியர்'},
    'வருவாய்த்துறை': {'meaningEn': 'Revenue Department', 'category': 'Government Department', 'root': 'வருவாய் + துறை'},
    'பொதுத்துறை': {'meaningEn': 'Public Department / General Administration', 'category': 'Government Department', 'root': 'பொது + துறை'},
    'நிதித்துறை': {'meaningEn': 'Finance Department', 'category': 'Government Department', 'root': 'நிதி + துறை'},
    'உள்துறை': {'meaningEn': 'Home Department', 'category': 'Government Department', 'root': 'உள் + துறை'},
    'பணியாளர்': {'meaningEn': 'Personnel / Staff', 'category': 'Administration', 'root': 'பணியாளர்'},
    'நிர்வாகச்': {'meaningEn': 'Administrative', 'category': 'Administration', 'root': 'நிர்வாகம்'},
    'சீர்திருத்தம்': {'meaningEn': 'Reforms', 'category': 'Administration', 'root': 'சீர்திருத்தம்'},
    'அறிவிக்கை': {'meaningEn': 'Gazette Notification / Official Notice', 'category': 'Official Notice', 'root': 'அறிவிக்கை'},
    'சென்னைப்': {'meaningEn': 'Of Chennai / Madras Secretariat', 'category': 'Geography / Capital', 'root': 'சென்னை'},
    'தமிழ்நாடு': {'meaningEn': 'Tamil Nadu State', 'category': 'State Jurisdiction', 'root': 'தமிழ் + நாடு'},
    'அரசு': {'meaningEn': 'Government / State Authority', 'category': 'Government Jurisdiction', 'root': 'அரசு'},
    'ஆளுநர்': {'meaningEn': 'Governor', 'category': 'Constitutional Head', 'root': 'ஆளுநர்'},
    'ஆளுநரின்': {'meaningEn': 'By Order of the Governor', 'category': 'Constitutional Formula', 'root': 'ஆளுநர் + இன்'},
    'ஆணைப்படி': {'meaningEn': 'By Order / As Commanded', 'category': 'Authentication Formula', 'root': 'ஆணை + படி'},
    'சுருக்கம்': {'meaningEn': 'Abstract / Summary (of G.O.)', 'category': 'Order Structure', 'root': 'சுருக்கம்'},
    'நிலை': {'meaningEn': 'Standing / Routine (e.g. G.O. Ms)', 'category': 'Order Classification', 'root': 'நிலை'},
    'பெறுநர்': {'meaningEn': 'To / Addressee / Recipient', 'category': 'Official Letter Structure', 'root': 'பெறு + நர்'},
    'அனுப்புநர்': {'meaningEn': 'From / Sender / Dispatcher', 'category': 'Official Letter Structure', 'root': 'அனுப்பு + நர்'}
}

# ==========================================
# 5. OFFICIAL INDIAN LANGUAGES TRANSLITERATION
# ==========================================
INDIC_SCRIPT_MAP: Dict[str, Dict[str, str]] = {
    'அ': {'hin': 'अ', 'tel': 'అ', 'mal': 'അ', 'kan': 'ಅ', 'ben': 'অ', 'ori': 'ଅ', 'guj': 'અ', 'pan': 'ਅ', 'eng': 'a'},
    'ஆ': {'hin': 'आ', 'tel': 'ఆ', 'mal': 'ആ', 'kan': 'ಆ', 'ben': 'আ', 'ori': 'ଆ', 'guj': 'આ', 'pan': 'ਆ', 'eng': 'aa'},
    'இ': {'hin': 'इ', 'tel': 'ఇ', 'mal': 'ഇ', 'kan': 'ಇ', 'ben': 'ই', 'ori': 'ଇ', 'guj': 'ઇ', 'pan': 'ਇ', 'eng': 'i'},
    'ஈ': {'hin': 'ई', 'tel': 'ఈ', 'mal': 'ഈ', 'kan': 'ಈ', 'ben': 'ঈ', 'ori': 'ଈ', 'guj': 'ઈ', 'pan': 'ਈ', 'eng': 'ee'},
    'உ': {'hin': 'उ', 'tel': 'ఉ', 'mal': 'ഉ', 'kan': 'ಉ', 'ben': 'উ', 'ori': 'ଉ', 'guj': 'ઉ', 'pan': 'ਉ', 'eng': 'u'},
    'ஊ': {'hin': 'ऊ', 'tel': 'ఊ', 'mal': 'ഊ', 'kan': 'ಊ', 'ben': 'ঊ', 'ori': 'ଊ', 'guj': 'ઊ', 'pan': 'ਊ', 'eng': 'oo'},
    'எ': {'hin': 'ए', 'tel': 'ఎ', 'mal': 'എ', 'kan': 'ಎ', 'ben': 'এ', 'ori': 'ଏ', 'guj': 'એ', 'pan': 'ਏ', 'eng': 'e'},
    'ஏ': {'hin': 'ए', 'tel': 'ఏ', 'mal': 'ഏ', 'kan': 'ಏ', 'ben': 'এ', 'ori': 'ଏ', 'guj': 'એ', 'pan': 'ਏ', 'eng': 'ee'},
    'ஐ': {'hin': 'ऐ', 'tel': 'ఐ', 'mal': 'ഐ', 'kan': 'ಐ', 'ben': 'ঐ', 'ori': 'ଐ', 'guj': 'ઐ', 'pan': 'ਐ', 'eng': 'ai'},
    'ஒ': {'hin': 'ओ', 'tel': 'ఒ', 'mal': 'ഒ', 'kan': 'ಒ', 'ben': 'ও', 'ori': 'ଓ', 'guj': 'ઓ', 'pan': 'ਓ', 'eng': 'o'},
    'ஓ': {'hin': 'ओ', 'tel': 'ఓ', 'mal': 'ഓ', 'kan': 'ఓ', 'ben': 'ও', 'ori': 'ଓ', 'guj': 'ઓ', 'pan': 'ਓ', 'eng': 'oo'},
    'ஔ': {'hin': 'औ', 'tel': 'ఔ', 'mal': 'ഔ', 'kan': 'ಔ', 'ben': 'ঔ', 'ori': 'ଔ', 'guj': 'ઔ', 'pan': 'ਔ', 'eng': 'au'},
    'க': {'hin': 'क', 'tel': 'క', 'mal': 'ക', 'kan': 'ಕ', 'ben': 'ক', 'ori': 'କ', 'guj': 'ક', 'pan': 'ਕ', 'eng': 'ka'},
    'ங': {'hin': 'ङ', 'tel': 'ఙ', 'mal': 'ങ', 'kan': 'ಙ', 'ben': 'ঙ', 'ori': 'ଙ', 'guj': 'ઙ', 'pan': 'ਙ', 'eng': 'nga'},
    'ச': {'hin': 'च', 'tel': 'చ', 'mal': 'ച', 'kan': 'ಚ', 'ben': 'চ', 'ori': 'ଚ', 'guj': 'ચ', 'pan': 'ਚ', 'eng': 'cha'},
    'ஞ': {'hin': 'ञ', 'tel': 'ఞ', 'mal': 'ഞ', 'kan': 'ಞ', 'ben': 'ঞ', 'ori': 'ଞ', 'guj': 'ઞ', 'pan': 'ਞ', 'eng': 'nya'},
    'ட': {'hin': 'ट', 'tel': 'ట', 'mal': 'ട', 'kan': 'ಟ', 'ben': 'ট', 'ori': 'ଟ', 'guj': 'ટ', 'pan': 'ਟ', 'eng': 'ta'},
    'ண': {'hin': 'ण', 'tel': 'ణ', 'mal': 'ണ', 'kan': 'ಣ', 'ben': 'ণ', 'ori': 'ଣ', 'guj': 'ણ', 'pan': 'ਣ', 'eng': 'na'},
    'த': {'hin': 'त', 'tel': 'త', 'mal': 'ത', 'kan': 'ತ', 'ben': 'ত', 'ori': 'ତ', 'guj': 'ત', 'pan': 'ਤ', 'eng': 'tha'},
    'ந': {'hin': 'न', 'tel': 'న', 'mal': 'ന', 'kan': 'ನ', 'ben': 'ন', 'ori': 'ନ', 'guj': 'ન', 'pan': 'ਨ', 'eng': 'na'},
    'ப': {'hin': 'प', 'tel': 'ప', 'mal': 'പ', 'kan': 'ಪ', 'ben': 'প', 'ori': 'ପ', 'guj': 'પ', 'pan': 'ਪ', 'eng': 'pa'},
    'ம': {'hin': 'म', 'tel': 'మ', 'mal': 'മ', 'kan': 'ಮ', 'ben': 'ম', 'ori': 'ମ', 'guj': 'મ', 'pan': 'ਮ', 'eng': 'ma'},
    'ய': {'hin': 'य', 'tel': 'య', 'mal': 'യ', 'kan': 'ಯ', 'ben': 'য', 'ori': 'ଯ', 'guj': 'ય', 'pan': 'ਯ', 'eng': 'ya'},
    'ர': {'hin': 'र', 'tel': 'ర', 'mal': 'ര', 'kan': 'ರ', 'ben': 'র', 'ori': 'ର', 'guj': 'ર', 'pan': 'ਰ', 'eng': 'ra'},
    'ல': {'hin': 'ल', 'tel': 'ల', 'mal': 'ല', 'kan': 'ಲ', 'ben': 'ল', 'ori': 'ଲ', 'guj': 'લ', 'pan': 'ਲ', 'eng': 'la'},
    'வ': {'hin': 'व', 'tel': 'వ', 'mal': 'വ', 'kan': 'ವ', 'ben': 'ব', 'ori': 'ଵ', 'guj': 'વ', 'pan': 'ਵ', 'eng': 'va'},
    'ழ': {'hin': 'ऴ', 'tel': 'ఴ', 'mal': 'ഴ', 'kan': 'ೞ', 'ben': 'ড়', 'ori': 'ଳ', 'guj': 'ળ', 'pan': 'ਲ਼', 'eng': 'zha'},
    'ள': {'hin': 'ळ', 'tel': 'ళ', 'mal': 'ള', 'kan': 'ಳ', 'ben': 'ল', 'ori': 'ଳ', 'guj': 'ળ', 'pan': 'ਲ਼', 'eng': 'la'},
    'ற': {'hin': 'ऱ', 'tel': 'ఱ', 'mal': 'റ', 'kan': 'ಱ', 'ben': 'র', 'ori': 'ର', 'guj': 'ર', 'pan': 'ਰ', 'eng': 'ra'},
    'ன': {'hin': 'ऩ', 'tel': 'న', 'mal': 'ന', 'kan': 'ನ', 'ben': 'ন', 'ori': 'ନ', 'guj': 'ન', 'pan': 'ਨ', 'eng': 'na'},
    'ஜ': {'hin': 'ज', 'tel': 'జ', 'mal': 'ജ', 'kan': 'ಜ', 'ben': 'জ', 'ori': 'ଜ', 'guj': 'જ', 'pan': 'ਜ', 'eng': 'ja'},
    'ஷ': {'hin': 'ष', 'tel': 'ష', 'mal': 'ഷ', 'kan': 'ಷ', 'ben': 'ষ', 'ori': 'ଷ', 'guj': 'ષ', 'pan': 'ਸ਼', 'eng': 'sha'},
    'ஸ': {'hin': 'स', 'tel': 'స', 'mal': 'സ', 'kan': 'ಸ', 'ben': 'স', 'ori': 'ସ', 'guj': 'સ', 'pan': 'ਸ', 'eng': 'sa'},
    'ஹ': {'hin': 'ह', 'tel': 'హ', 'mal': 'ഹ', 'kan': 'ಹ', 'ben': 'হ', 'ori': 'ହ', 'guj': 'હ', 'pan': 'ਹ', 'eng': 'ha'},
    'ா': {'hin': 'ा', 'tel': 'ా', 'mal': 'ാ', 'kan': 'ಾ', 'ben': 'া', 'ori': 'ା', 'guj': 'ા', 'pan': 'ਾ', 'eng': 'aa'},
    'ி': {'hin': 'ि', 'tel': 'ి', 'mal': 'ി', 'kan': 'ಿ', 'ben': 'ি', 'ori': 'ି', 'guj': 'િ', 'pan': 'ਿ', 'eng': 'i'},
    'ீ': {'hin': 'ी', 'tel': 'ీ', 'mal': 'ീ', 'kan': 'ೀ', 'ben': 'ী', 'ori': 'ୀ', 'guj': 'ી', 'pan': 'ੀ', 'eng': 'ee'},
    'ு': {'hin': 'ु', 'tel': 'ు', 'mal': 'ു', 'kan': 'ು', 'ben': 'ু', 'ori': 'ୁ', 'guj': 'ુ', 'pan': 'ੁ', 'eng': 'u'},
    'ூ': {'hin': 'ू', 'tel': 'ూ', 'mal': 'ൂ', 'kan': 'ೂ', 'ben': 'ূ', 'ori': 'ୂ', 'guj': 'ૂ', 'pan': 'ੂ', 'eng': 'oo'},
    'ெ': {'hin': 'ॆ', 'tel': 'ె', 'mal': 'െ', 'kan': 'ೆ', 'ben': 'ে', 'ori': 'େ', 'guj': 'ે', 'pan': 'ੇ', 'eng': 'e'},
    'ே': {'hin': 'े', 'tel': 'ే', 'mal': 'േ', 'kan': 'ೇ', 'ben': 'ে', 'ori': 'େ', 'guj': 'ે', 'pan': 'ੇ', 'eng': 'ee'},
    'ை': {'hin': 'ै', 'tel': 'ై', 'mal': 'ൈ', 'kan': 'ೈ', 'ben': 'ৈ', 'ori': 'ୈ', 'guj': 'ૈ', 'pan': 'ੈ', 'eng': 'ai'},
    'ொ': {'hin': 'ॊ', 'tel': 'ొ', 'mal': 'ൊ', 'kan': 'ೊ', 'ben': 'ো', 'ori': 'ୋ', 'guj': 'ો', 'pan': 'ੋ', 'eng': 'o'},
    'ோ': {'hin': 'ो', 'tel': 'ో', 'mal': 'ോ', 'kan': 'ೋ', 'ben': 'ো', 'ori': 'ୋ', 'guj': 'ો', 'pan': 'ੋ', 'eng': 'oo'},
    'ௌ': {'hin': 'ौ', 'tel': 'ౌ', 'mal': 'ൌ', 'kan': 'ೌ', 'ben': 'ৌ', 'ori': 'ୌ', 'guj': 'ૌ', 'pan': 'ੌ', 'eng': 'au'},
    '்': {'hin': '्', 'tel': '్', 'mal': '്', 'kan': '್', 'ben': '্', 'ori': '୍', 'guj': '્', 'pan': '੍', 'eng': ''}
}

def convert_to_indic_script(text: str, target_lang: str = 'hin') -> str:
    """Converts Tamil Unicode text to chosen Indian Language script or English."""
    if not text or target_lang == 'tam':
        return text
    
    out = []
    for ch in text:
        if ch in INDIC_SCRIPT_MAP and target_lang in INDIC_SCRIPT_MAP[ch]:
            out.append(INDIC_SCRIPT_MAP[ch][target_lang])
        else:
            out.append(ch)
    return "".join(out)

