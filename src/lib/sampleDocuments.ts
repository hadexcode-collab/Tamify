/**
 * Authentic Preloaded Sample Documents representing common historical Tamil materials:
 * 1. Tamil Nadu Government Order (G.O. 1986 Secretariat typewriter)
 * 2. 1974 Land Registration Deed (கிரயப் பத்திரம்)
 * 3. 1968 Tamil Gazette / Newspaper column
 * 4. BAMINI Legacy encoded text file
 * 5. Classical Commentary with archaic sandhi
 */
import { DocumentSample } from '../types';

export const SAMPLE_DOCUMENTS: DocumentSample[] = [
  {
    id: 'sample-tn-go-1986',
    title: 'Tamil Nadu Government Order (Secretariat Typewriter 1986)',
    tamilTitle: 'தமிழ்நாடு அரசு அரசாணை (நிலை) எண். 142 - பொதுத்துறை (1986)',
    category: 'GOVERNMENT_ORDER',
    description: 'Authentic 1986 Tamil Nadu Government Order with official Secretariat header, Reference (பார்வை), Subject (பொருள்), Order clauses (ஆணை), and Joint Secretary signature.',
    year: '1986',
    sourceType: 'TYPEWRITER',
    defaultEncoding: 'SCANNED_IMAGE_OCR',
    rawText: `தமிழ்நாடு அரசு
சுருக்கம்

பொதுத்துறை - தலைமைச் செயலகப் பணியாளர் நலம் மற்றும் நிர்வாகச் சீர்திருத்தம் - மாவட்ட அளவிலான அரசு அலுவலகங்களில் தமிழ் ஆட்சிமொழி செயலாக்கம் மற்றும் ஆய்வுக் குழு அமைத்தல் - அரசாணை வெளியிடப்படுகிறது.

பொது (நிர்வாகம்) துறை

அரசாணை (நிலை) எண்: 142
நாள்: 18-04-1986
பங்குனி 5, அட்சய, திருவள்ளுவர் ஆண்டு 2017.

பார்வை:
1. அரசாணை (நிலை) எண். 560, பொதுத்துறை, நாள் 12-10-1981.
2. தமிழ் வளர்ச்சி மற்றும் பண்பாட்டுத் துறை இயக்குநர் அவர்களின் கடித எண். ந.க. 4521/ஆ/85, நாள் 05-02-1986.

ஆணை:
1. அனைத்து மாவட்டங்களிலும் உள்ள அரசு அலுவலகங்களில் அன்றாடக் கோப்புகள், சுற்றறிக்கைகள் மற்றும் பொதுமக்களுக்கான கடிதப் போக்குவரத்துகள் முழுமையாகத் தமிழில் மட்டுமே செயல்படுத்தப்பட வேண்டும் என மேற்கண்ட பார்வையில் குறிப்பிடப்பட்டுள்ள அரசாணையில் ஆணையிடப்பட்டிருந்தது.

2. இத்திட்டத்தின் முன்னேற்றம் மற்றும் நடைமுறைச் சிக்கல்களைக் கள ஆய்வு செய்து அறிக்கை சமர்ப்பிக்க மாவட்ட ஆட்சித்தலைவர் அவர்களின் தலைமையில் கீழ்வரும் உறுப்பினர்களைக் கொண்ட ஆய்வுக் குழு அமைக்கப்படுகிறது:

அட்டவணை:
வ.எண் | அலுவலர் பதவிப் பெயர் | குழுவில் நிலை
1 | மாவட்ட ஆட்சித்தலைவர் | தலைவர்
2 | மாவட்ட வருவாய் அலுவலர் | உறுப்பினர்-செயலர்
3 | தமிழ் வளர்ச்சி உதவி இயக்குநர் | உறுப்பினர்
4 | மாவட்ட முதன்மைக் கல்வி அலுவலர் | உறுப்பினர்

3. இக்குழுவானது மூன்று மாதங்களுக்கு ஒருமுறை கூடி ஆய்வு செய்து தனது ஆய்வறிக்கையினை தலைமைச் செயலகப் பொதுத்துறைக்கு அனுப்பி வைக்க வேண்டும்.

(ஆளுநரின் ஆணைப்படி)

செ. சுப்பிரமணியன்,
கூடுதல் தலைமைச் செயலாளர்.

பெறுநர்:
அனைத்து மாவட்ட ஆட்சித்தலைவர்கள்.
அனைத்துத் துறைத் தலைவர்கள்.
நகல்:
தமிழ் வளர்ச்சி இயக்குநர், சென்னை-8.
செயலாளரின் தனிச் செயலாளர்.`
  },
  {
    id: 'sample-land-deed-1974',
    title: 'Land Registration Deed (1974 Archaic Revenue Format)',
    tamilTitle: 'பத்திரப்பதிவு சார்பதிவாளர் அலுவலகக் கிரயப் பத்திரம் (1974)',
    category: 'DEED_REGISTRATION',
    description: '1974 Land sale conveyance deed with archaic revenue terms (நன்செய், புன்செய், பட்டா எண், விஸ்தீரணம், நான்கு எல்லைகள், வில்லங்கமின்மை உறுதிமொழி).',
    year: '1974',
    sourceType: 'IMAGE_SCAN',
    defaultEncoding: 'SCANNED_IMAGE_OCR',
    rawText: `தமிழ்நாடு பத்திரப்பதிவுத் துறை
சார்பதிவாளர் அலுவலகம்: திருக்கழுக்குன்றம்
ஆவண எண்: 1204 / 1974

கிரயப் பத்திரம்

1974-ஆம் ஆண்டு நவம்பர் மாதம் 14-ஆம் தேதி செங்கல்பட்டு மாவட்டம் திருக்கழுக்குன்றம் வட்டத்தில் வசிக்கும் மு. ராமசாமி முதலியார் குமாரர் சுந்தரமூர்த்தி (கிரயதாரர்) என்பவருக்கு, அதே ஊரில் வசிக்கும் கோ. மாணிக்கம் பிள்ளை குமாரர் தணிகாசலம் (விற்பனையாளர்) எழுதி வைத்த நன்செய் நிலக் கிரயப் பத்திரம்.

சொத்து விவரமும் எல்லைகளும்:
செங்கல்பட்டு பதிவு மாவட்டம், திருக்கழுக்குன்றம் சார் பதிவக எல்லைக்குட்பட்ட வல்லிபுரம் கிராமத்தில் உள்ள:
பட்டா எண்: 382
பழைய புல எண்: 45/2B
நில வகை: நன்செய் நிலம்
விஸ்தீரணம்: 1 ஏக்கர் 42 சென்ட்

நான்கு மால் எல்லைகள்:
வடக்கு: சுப்பராய நாயக்கர் நன்செய் நிலம்
தெற்கு: வாய்க்கால் மற்றும் பொது வரப்பு
கிழக்கு: வடிவேல் பிள்ளை பயிர் நிலம்
மேற்கு: கிராம நத்தம் பொதுப் பாதை

இச்சொத்தில் எவ்வித வில்லங்கமோ, அடமானமோ, ஜப்தியோ இல்லை என்றும், முழு உரிமை மற்றும் பூரண சுவாதீனத்துடன் ரூ. 4,500/- (நான்காயிரத்து ஐந்நூறு ரூபாய் மட்டும்) பெற்றுக்கொண்டு மனப்பூர்வமாக கிரயம் செய்து கொடுக்கப்பட்டது.`
  },
  {
    id: 'sample-bamini-legacy',
    title: 'Legacy BAMINI Encoded Government Notification',
    tamilTitle: 'பாமினி (BAMINI) எழுத்துரு குறியாக்கம் பெற்ற ஆவணம்',
    category: 'LEGACY_BAMINI',
    description: 'Raw BAMINI legacy ASCII keystroke text widely found in vintage desktop publishing (PageMaker, MS Word 97) before Unicode adoption.',
    year: '1998',
    sourceType: 'LEGACY_TEXT',
    defaultEncoding: 'BAMINI',
    rawText: `jkpo;ehL murpd; rpwg;G mwpf;if

murhiz epiy vz;: 89
ehs;: 24-06-1998

nghUs;: jkpof murpd; midj;J JiwfspYk; fzpdp kakhf;fy; kw;Wk; jkpœ; xUq;fpizg;G jpl;lk;.

ghh;it:
1. jkpœ; tsh;r;rpj; Jiw fbj vz;. 1042/97> ehs; 14-02-1998.

Miz:
jkpo;ehL murpd; jiyikr; nrayfj;jpy; midj;J fzpdpfspYk; jkpœ; xUq;Fwp (Unicode) gad;ghl;bid cldbahf eilKiwg;gLj;j Mizaplg;gLfpwJ.

(MSeupd; Mizg;gb)
K. fUzhepjp
Kjd;ikr; nrayhsh;`
  },
  {
    id: 'sample-gazette-1968',
    title: 'Madras Government Gazette Excerpt (1968 Dual Column)',
    tamilTitle: 'தமிழ்நாடு அரசிதழ் / அரசிதழ் அறிவிக்கை (1968)',
    category: 'GAZETTE',
    description: '1968 State Gazette excerpt with dual-column decree on public holidays and administrative notifications.',
    year: '1968',
    sourceType: 'MIXED_PDF',
    defaultEncoding: 'SCANNED_IMAGE_OCR',
    rawText: `தமிழ்நாடு அரசிதழ்
அரசாங்க அறிவிக்கை - பகுதி II - பிரிவு 1
சென்னை, புதன்கிழமை, ஆகஸ்டு 14, 1968 (ஆவணி 29, கீலக)

வருவாய்த்துறை மற்றும் பொது நிருவாகம்

அறிவிக்கை எண்: 284 / 1968
1881-ஆம் ஆண்டின் செலாவணி முறிச் சட்டத்தின் (மத்தியச் சட்டம் XXVI / 1881) 25-வது பிரிவின் கீழ், தமிழக அரசு கீழ்க்கண்ட நாட்களை அரசுப் பொது விடுமுறை நாட்களாக அறிவிக்கிறது.

அட்டவணை:
பண்டிகை / நிகழ்வு | நாள் | கிழமை
பொங்கல் திருநாள் | 14-01-1969 | செவ்வாய்க்கிழமை
திருவள்ளுவர் தினம் | 15-01-1969 | புதன்கிழமை
குடியரசு தினம் | 26-01-1969 | ஞாயிற்றுக்கிழமை
தமிழ் வருடப் பிறப்பு | 14-04-1969 | திங்கட்கிழமை

இவ்விடுமுறை நாட்கள் அனைத்து அரசு அலுவலகங்களுக்கும், கருவூலங்களுக்கும், நீதித்துறை நீதிமன்றங்களுக்கும் பொருந்தும்.`
  },
  {
    id: 'sample-classical-commentary',
    title: 'Classical Literature & Archaic Commentary (சங்க இலக்கிய உரை)',
    tamilTitle: 'தொல்காப்பிய உரை & சங்க இலக்கியப் பாடல் குறிப்பு',
    category: 'CLASSICAL_LITERATURE',
    description: 'Archaic Tamil commentary demonstrating sandhi (புணர்ச்சி) decomposition, archaic root markers, and literary glosses.',
    year: '1932',
    sourceType: 'IMAGE_SCAN',
    defaultEncoding: 'SCANNED_IMAGE_OCR',
    rawText: `தொல்காப்பியம் - எழுத்ததிகாரம் - புணரியல் உரை
உரை ஆசிரியர்: நச்சினார்க்கினியர் பதிப்பு

சூத்திரம்:
"மெய்யின் வழியது உயிர்தோன்று நிலையே"

பதவுரை & புணர்ச்சி விளக்கம்:
நிலைமொழியின் ஈற்று மெய்யும் வருமொழியின் முதல் உயிரும் கூடி ஒருமைப்பட்டு இயங்குவது புணர்ச்சியின் இயற்கை ஆகும்.

எடுத்துக்காட்டு:
1. தமிழ் + தாய் = தமிழ்த்தாய் (தோன்றல் புணர்ச்சி - வல்லெழுத்து மிகுதல்)
2. நல் + நூல் = நன்னூல் (திரிதல் புணர்ச்சி)
3. மரம் + வேர் = மரவேர் (கெடுதல் புணர்ச்சி)
4. மணி + அடித்தான் = மணியடித்தான் (உடம்படுமெய் 'ய்' தோன்றுதல்)

அரசு மற்றும் இலக்கிய ஆவணங்களில் சந்தி விதிகளை முறைப்படி கடைப்பிடித்தல் தெளிவான பொருளுணர்வுக்கு வழிவகுக்கும்.`
  },
  {
    id: 'sample-hsc-cs-key-2022',
    title: 'HSC Computer Science Examination Key Answers (May 2022)',
    tamilTitle: 'மேல்நிலை இரண்டாம் ஆண்டு தேர்வு - கணினி அறிவியல் விடைக்குறிப்பு (2022)',
    category: 'GOVERNMENT_ORDER',
    description: 'Government Examination official key answers sheet with English and Tamil bilingual tables, questions, parts, and marking schemes.',
    year: '2022',
    sourceType: 'MIXED_PDF',
    defaultEncoding: 'AUTO_DETECT',
    rawText: `DEPARTMENT OF GOVERNMENT EXAMINATION
HIGHER SECONDARY SECOND YEAR EXAMINATION - MAY-2022
KEY ANSWERS FOR COMPUTER SCIENCE

PART - I (15 x 1 = 15 Marks)
Choose the correct answer:

Q.No | Option | Answer Key | Marks
1 | (b) | Subroutine | 1
2 | (a) | Pure function | 1
3 | (d) | Big O | 1
4 | (c) | Local, Enclosed, Global, Built-in | 1
5 | (a) | Interactive mode | 1
6 | (c) | \\n | 1
7 | (b) | while | 1
8 | (a) | pass | 1
9 | (d) | def | 1
10 | (c) | Slicing | 1
11 | (b) | Append | 1
12 | (a) | Class | 1
13 | (c) | Relational Database | 1
14 | (b) | SQL | 1
15 | (d) | CSV | 1

PART - II (Answer any 6 Questions - Q.No. 24 is Compulsory - 6 x 2 = 12 Marks)

16. Define Function with respect to Programming Language.
- A function is a named block of code that performs a specific task.
- Functions help in code reusability and modularity.

17. What is Interface and Implementation?
- Interface: Specifies what a component does (declarations/signatures).
- Implementation: Specifies how the functionality is actually carried out.

18. What is Dynamic Scoping?
- In dynamic scoping, a variable is searched in the calling function chain rather than where it was defined textually.

19. Write notes on Python indentation.
- Python uses whitespace indentation (spaces or tabs) to define blocks of code instead of curly braces {}.

20. List the relational operators supported in Python.
- == (Equal to)
- != (Not equal to)
- > (Greater than), < (Less than)
- >= (Greater than or equal to), <= (Less than or equal to)

21. What is a Tuple in Python?
- A Tuple is an ordered sequence of elements enclosed in parentheses (). Tuples are immutable.

22. What are the components of DBMS?
- Hardware, Software, Data, Users, and Database Access Language.

23. Differentiate between DDL and DML in SQL.
- DDL (Data Definition Language): CREATE, ALTER, DROP (defines database schema).
- DML (Data Manipulation Language): INSERT, UPDATE, DELETE (manipulates stored data).

24. (Compulsory) What will be the output of the following Python snippet?
x = 10
y = 20
print(f"Result = {x + y}")
Output:
Result = 30`
  },
  {
    id: 'sample-cuddalore-deo-textbook-handover',
    title: 'School Education Dept - Textbook Handover Form (Cuddalore DEO)',
    tamilTitle: 'மாவட்டக் கல்வி அலுவலகம், கடலூர் - பாடநூல் ஒப்படைப்புப் படிவம் (VI முதல் +2 வரை)',
    category: 'GOVERNMENT_ORDER',
    description: 'Authentic school education textbook handover return form with multiple grade-wise tabular schedules (VI-VII volumes, VIII-X subject-wise counts, and Higher Secondary +1/+2 27-subject matrix).',
    year: '2024',
    sourceType: 'MIXED_PDF',
    defaultEncoding: 'AUTO_DETECT',
    rawText: `தமிழ்நாடு அரசு - பள்ளிக் கல்வித்துறை
மாவட்டக் கல்வி அலுவலகம், கடலூர்
அரசு மற்றும் அரசு உதவிபெறும் பள்ளிகளுக்கான பாடநூல்கள் ஒப்படைப்புப் படிவம்

[அட்டவணை 1]
வகுப்புகள் VI & VII பாடநூல்கள் ஒப்படைப்பு விவரம்:
வ. எண் | வகுப்பு | ஒப்படைக்கப்பட்ட தொகுப்புகள் (RETURNED BOOKS Sets-Nos) | பருவம் 1 (VOL-1 Nos தமிழ், ஆங்கிலம்) T/M | பருவம் 1 (VOL-1 Nos தமிழ், ஆங்கிலம்) E/M | பருவம் 2 (VOL-2 Nos கணிதம்) T/M | பருவம் 2 (VOL-2 Nos கணிதம்) E/M | பருவம் 3 (VOL-3 Nos அறிவியல், சமூக அறிவியல்) T/M | பருவம் 3 (VOL-3 Nos அறிவியல், சமூக அறிவியல்) E/M
1 | VI | 45 | 45 | 0 | 45 | 0 | 45 | 0
2 | VII | 52 | 52 | 0 | 52 | 0 | 52 | 0

[அட்டவணை 2]
வகுப்புகள் VIII, IX & X பாடநூல்கள் ஒப்படைப்பு விவரம்:
வ. எண் | வகுப்பு | பயிற்று மொழி (Medium) | தமிழ் Nos | ஆங்கிலம் Nos | கணிதம் Nos | அறிவியல் Nos | சமூக அறிவியல் Nos
1 | VIII | தமிழ் வழி | 48 | 48 | 48 | 48 | 48
2 | VIII | ஆங்கில வழி | 12 | 12 | 12 | 12 | 12
3 | IX | தமிழ் வழி | 50 | 50 | 50 | 50 | 50
4 | IX | ஆங்கில வழி | 15 | 15 | 15 | 15 | 15
5 | X | தமிழ் வழி | 55 | 55 | 55 | 55 | 55
6 | X | ஆங்கில வழி | 20 | 20 | 20 | 20 | 20

[அட்டவணை 3]
மேல்நிலைக் கல்வி (+1 & +2) 27 பாடநூல்கள் ஒப்படைப்பு விவரம்:
வ. எண் | வகுப்பு | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27
1 | +1 தமிழ் வழி | 35 | 35 | 35 | 35 | 30 | 30 | 25 | 25 | 20 | 20 | 15 | 15 | 10 | 10 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0
2 | +1 ஆங்கில வழி | 18 | 18 | 18 | 18 | 15 | 15 | 12 | 12 | 10 | 10 | 8 | 8 | 5 | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0
3 | +2 தமிழ் வழி | 38 | 38 | 38 | 38 | 32 | 32 | 28 | 28 | 22 | 22 | 16 | 16 | 12 | 12 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0
4 | +2 ஆங்கில வழி | 20 | 20 | 20 | 20 | 16 | 16 | 14 | 14 | 12 | 12 | 10 | 10 | 6 | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0

மேற்கண்ட விவரங்கள் அனைத்தும் சரிபார்க்கப்பட்டு கடலூர் மாவட்டக் கல்வி அலுவலகக் கிடங்கில் பாடநூல்கள் முறையாக ஒப்படைக்கப்பட்டன.
ஒப்படைத்த தலைமை ஆசிரியர் கையொப்பம்
பெற்றுக்கொண்ட அலுவலர் / கிடங்குப் பொறுப்பாளர் கையொப்பம்`
  }
];
