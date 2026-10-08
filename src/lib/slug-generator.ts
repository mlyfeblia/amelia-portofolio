/**
 * Smart Semantic English Slug Generator for Psychology, Counseling & BKI Articles
 * Maps Indonesian BKI, psychology, counseling, and campus life terminology
 * into clean, search-engine optimized (SEO) English slugs.
 */

import slugify from '@sindresorhus/slugify';


// Common Indonesian grammatical particles, filler words, and stop words to omit from SEO slugs
export const INDONESIAN_STOPWORDS = new Set([
  'dan',
  'di',
  'ke',
  'dari',
  'pada',
  'dalam',
  'untuk',
  'dengan',
  'saat',
  'ketika',
  'oleh',
  'tentang',
  'bagi',
  'ini',
  'itu',
  'yang',
  'atau',
  'adalah',
  'sebagai',
  'antara',
  'tengah',
  'riuh',
  'riuhnya',
  'bukan',
  'hanya',
  'padahal',
  'tanpa',
  'tak',
  'bisa',
  'agar',
  'harus',
  'menjadi',
  'serta',
  'pun',
  'akan',
  'lagi',
  'sudah',
  'belum',
  'saja',
  'kita',
  'kamu',
  'saya',
  'dia',
  'mereka',
  'secara',
  'lebih',
  'sangat',
  'amat',
  'bila',
  'jika',
  'kala',
  'suatu',
  'sebuah',
  'para',
  'si',
  'sang',
  'seperti',
  'lewat',
  'melalui',
  'berikut',
  'praktis',
  'sederhana',
  'karena',
  'namun',
  'tetapi',
  'walau',
  'meski',
  'setiap',
  'didera',
  'penuh',
  'ala',
  'cara',
  // Extra common Indonesian connective filler & prepositions
  'punya',
  'ada',
  'terhadap',
  'atas',
  'bawah',
  'ialah',
  'yakni',
  'yaitu',
  'bagai',
  'bagaikan',
  'selalu',
  'sering',
  'masih',
  'pula',
  'supaya',
  'hingga',
  'sampai',
  'demi',
  'maupun',
  'menuju',
  'paling',
  'tiap',
  'bertemu',
  'apakah',
  'bagaimana',
  'kenapa',
  'mengapa',
  'siapa',
  'kapan',
  'dimana',
  'mana',
  'ia',
  'anda',
  'kami',
  'kalian',
  'beliau',
  'nya',
  'ku',
  'mu',
  'lah',
  'kah',
  'tah',
  'era',
  'zaman',
]);

// Multi-word phrase mappings (matched first, prioritized from compound to specific)
export const PHRASE_DICTIONARY: [RegExp, string][] = [
  // Compound contextual phrases (matched first to prevent disjointed fragments)
  [/\bregulasi[-\s]emosi[-\s]saat[-\s]didera[-\s]tekanan([-\s]hidup)?\b/gi, 'emotional-regulation'],
  [/\b(mengurai[-\s])?cemas[-\s]dan[-\s]luka[-\s]batin[-\s]mahasiswa\b/gi, 'student-anxiety-healing'],
  [/\b(seni\s+)?berkomunikasi[-\s]hangat\b/gi, 'warm-communication'],
  [/\blogika[-\s]cbt[-\s]bertemu[-\s]tazkiyatun[-\s]nafs\b/gi, 'cbt-soul-purification'],
  [/\blogika[-\s]cbt\b/gi, 'cbt'],
  [/\bluka[-\s]batin[-\s]mahasiswa\b/gi, 'student-inner-wound'],
  [/\bpertolongan[-\s]pertama[-\s]psikologis\b/gi, 'psychological-first-aid'],

  // Academic & Student Life
  [/\bacademic[-\s]burnout\b/gi, 'academic-burnout'],
  [/\bkejenuhan[-\s]akademik\b/gi, 'academic-burnout'],
  [/\bkejenuhan[-\s]belajar\b/gi, 'academic-burnout'],
  [/\btuntutan[-\s]akademik\b/gi, 'academic-demands'],
  [/\bstres[-\s]akademik\b/gi, 'academic-stress'],
  [/\bkecemasan[-\s]akademik\b/gi, 'academic-anxiety'],
  [/\bsenioritas[-\s]dan[-\s]junioritas\b/gi, 'seniority-gap'],

  // Crisis, Identity & Direction
  [/\bquarter[-\s]life[-\s]crisis\b/gi, 'quarter-life-crisis'],
  [/\bpencarian[-\s]jati[-\s]diri\b/gi, 'identity-search'],
  [/\bjati[-\s]diri\b/gi, 'identity-search'],
  [/\barah[-\s]hidup\b/gi, 'life-direction'],
  [/\bmakna[-\s]hidup\b/gi, 'meaning-of-life'],
  [/\bpencarian[-\s]makna\b/gi, 'finding-meaning'],
  [/\bpengembangan[-\s]diri\b/gi, 'self-growth'],
  [/\bpotensi[-\s]diri\b/gi, 'self-potential'],
  [/\bkepercayaan[-\s]diri\b/gi, 'self-confidence'],
  [/\brasa[-\s]percaya[-\s]diri\b/gi, 'self-confidence'],
  [/\bpercaya[-\s]diri\b/gi, 'self-confidence'],
  [/\brendah[-\s]diri\b/gi, 'inferiority-complex'],
  [/\brasa[-\s]bersalah\b/gi, 'guilt'],

  // Inner Peace, Healing & Mental Health
  [/\bketenangan[-\s]batin\b/gi, 'inner-peace'],
  [/\bkedamaian[-\s]batin\b/gi, 'inner-peace'],
  [/\bketenangan[-\s]jiwa\b/gi, 'inner-peace'],
  [/\bkesehatan[-\s]mental\b/gi, 'mental-health'],
  [/\bkesehatan[-\s]jiwa\b/gi, 'mental-health'],
  [/\bkesehatan[-\s]emosional\b/gi, 'emotional-health'],
  [/\bluka[-\s]batin\b/gi, 'inner-wound'],
  [/\binner[-\s]child[-\s]healing\b/gi, 'inner-child-healing'],
  [/\binner[-\s]child\b/gi, 'inner-child'],
  [/\bregulasi[-\s]emosi\b/gi, 'emotional-regulation'],
  [/\bmanajemen[-\s]emosi\b/gi, 'emotion-regulation'],
  [/\bmanajemen[-\s]stres\b/gi, 'stress-management'],
  [/\bkecemasan[-\s]sosial\b/gi, 'social-anxiety'],
  [/\bbelas[-\s]kasih[-\s]diri\b/gi, 'self-compassion'],
  [/\bistirahat[-\s]berkualitas\b/gi, 'quality-rest'],
  [/\bdoa[-\s]reflektif\b/gi, 'reflective-prayer'],
  [/\btekanan[-\s]hidup\b/gi, 'life-pressure'],
  [/\bdidera[-\s]tekanan\b/gi, 'under-pressure'],
  [/\bpola[-\s]pikir\b/gi, 'mindset'],

  // Digital World & Modern Noise
  [/\bnotifikasi[-\s]digital\b/gi, 'digital-noise'],
  [/\bdunia[-\s]siber\b/gi, 'digital-world'],
  [/\bmedia[-\s]sosial\b/gi, 'social-media'],

  // Self Concepts
  [/\bself[-\s]compassion\b/gi, 'self-compassion'],
  [/\bself[-\s]confidence\b/gi, 'self-confidence'],
  [/\bself[-\s]acceptance\b/gi, 'self-acceptance'],
  [/\bself[-\s]growth\b/gi, 'self-growth'],
  [/\bself[-\s]healing\b/gi, 'self-healing'],
  [/\bself[-\s]care\b/gi, 'self-care'],
  [/\bself[-\s]love\b/gi, 'self-love'],
  [/\bcinta[-\s]diri\b/gi, 'self-love'],
  [/\bpenerimaan[-\s]diri\b/gi, 'self-acceptance'],
  [/\bapresiasi[-\s]diri\b/gi, 'self-appreciation'],

  // Family, Relationships & Communication
  [/\borang[-\s]tua\b/gi, 'parents'],
  [/\bfriksi[-\s]antargenerasi\b/gi, 'generational-gap'],
  [/\bkomunikasi[-\s]asertif\b/gi, 'assertive-communication'],
  [/\bhubungan[-\s]sehat\b/gi, 'healthy-relationship'],
  [/\bhubungan[-\s]toksik\b/gi, 'toxic-relationship'],
  [/\bkeluarga[-\s]harmonis\b/gi, 'harmonious-family'],
  [/\bpatah[-\s]hati\b/gi, 'heartbreak'],

  // Counseling, Safe Space & Listening
  [/\bruang[-\s]dengar\b/gi, 'safe-space'],
  [/\bruang[-\s]aman\b/gi, 'safe-space'],
  [/\bteman[-\s]sebaya\b/gi, 'peer-counseling'],
  [/\bkonselor[-\s]sebaya\b/gi, 'peer-counseling'],
  [/\bkonseling[-\s]sebaya\b/gi, 'peer-counseling'],
  [/\bbimbingan[-\s]konseling\b/gi, 'islamic-counseling'],
  [/\bcyber[-\s]counseling\b/gi, 'cyber-counseling'],
  [/\bkonseling[-\s]daring\b/gi, 'online-counseling'],
  [/\bmendengarkan[-\s]aktif\b/gi, 'active-listening'],
  [/\bmendengar[-\s]aktif\b/gi, 'active-listening'],
  [/\bdukungan[-\s]emosional\b/gi, 'emotional-support'],

  // Islamic Counseling & Spirituality
  [/\btazkiyatun[-\s]nafs\b/gi, 'soul-purification'],
  [/\bthuma['’]?ninah\b/gi, 'inner-tranquility'],
  [/\btuma['’]?ninah\b/gi, 'inner-tranquility'],

  // Timelines & Stages
  [/\bmasa[-\s]depan\b/gi, 'future'],
  [/\bmasa[-\s]kecil\b/gi, 'childhood'],
  [/\bkelelahan[-\s]mental\b/gi, 'mental-fatigue'],
  [/\bbeban[-\s]pikiran\b/gi, 'mental-burden'],
  [/\bbeban[-\s]hidup\b/gi, 'life-burden'],
];

// Single word mappings for core actions, psychology tokens, and domain concepts
export const WORD_DICTIONARY: Record<string, string> = {
  // Verbs
  menemukan: 'finding',
  mencari: 'seeking',
  mengatasi: 'overcoming',
  menghadapi: 'facing',
  menjinakkan: 'managing',
  mengendalikan: 'controlling',
  mengurai: 'resolving',
  menyelesaikan: 'solving',
  menyembuhkan: 'healing',
  memulihkan: 'recovering',
  merawat: 'nurturing',
  menjaga: 'protecting',
  melindungi: 'protecting',
  memahami: 'understanding',
  mengenal: 'knowing',
  membangun: 'building',
  melatih: 'training',
  melepaskan: 'releasing',
  melepas: 'releasing',
  mendengarkan: 'listening',
  mendengar: 'listening',
  berkomunikasi: 'communicating',
  berdamai: 'making-peace',
  bertumbuh: 'growing',
  tumbuh: 'growing',
  berkembang: 'developing',
  berubah: 'transforming',
  berbagi: 'sharing',
  menavigasi: 'navigating',
  merangkai: 'crafting',
  membimbing: 'guiding',
  menemani: 'accompanying',
  menerima: 'accepting',
  merangkul: 'embracing',
  mengolah: 'processing',
  mengelola: 'managing',
  meredakan: 'calming',
  menenangkan: 'calming',
  mengurangi: 'reducing',
  menghilangkan: 'eliminating',
  meluapkan: 'expressing',
  mengekspresikan: 'expressing',
  melukai: 'hurting',
  belajar: 'learning',
  berpikir: 'thinking',
  merasakan: 'feeling',
  menyadari: 'realizing',
  memaafkan: 'forgiving',
  mengikhlaskan: 'letting-go',
  beristirahat: 'resting',
  bertahan: 'enduring',
  bangkit: 'rising',
  berjuang: 'striving',
  bicara: 'speaking',
  berbicara: 'speaking',

  // Psychology, Wellbeing & Emotional Concepts
  notifikasi: 'notifications',
  digital: 'digital',
  ketenangan: 'peace',
  kedamaian: 'peace',
  keheningan: 'stillness',
  tenang: 'peace',
  damai: 'peace',
  hening: 'stillness',
  jiwa: 'soul',
  batin: 'inner',
  hati: 'heart',
  fikiran: 'mind',
  pikiran: 'mind',
  akal: 'mind',
  cemas: 'anxiety',
  kecemasan: 'anxiety',
  stres: 'stress',
  depresi: 'depression',
  overthinking: 'overthinking',
  trauma: 'trauma',
  luka: 'wound',
  marah: 'anger',
  kemarahan: 'anger',
  sedih: 'sadness',
  kesedihan: 'sadness',
  grief: 'grief',
  duka: 'grief',
  emosi: 'emotion',
  emosional: 'emotional',
  perasaan: 'feelings',
  rasa: 'feeling',
  sensitif: 'sensitive',
  suasana: 'mood',
  mood: 'mood',
  bahagia: 'happiness',
  kebahagiaan: 'happiness',
  kecewa: 'disappointment',
  kekecewaan: 'disappointment',
  takut: 'fear',
  ketakutan: 'fear',
  bersalah: 'guilt',
  malu: 'shame',
  sepi: 'loneliness',
  kesepian: 'loneliness',
  hampa: 'emptiness',
  kehampaan: 'emptiness',
  lelah: 'fatigue',
  kelelahan: 'fatigue',
  jenuh: 'burnout',
  kejenuhan: 'burnout',
  kewalahan: 'overwhelm',
  percaya: 'trust',
  kepercayaan: 'trust',
  yakin: 'confidence',
  keyakinan: 'confidence',
  ragu: 'doubt',
  keraguan: 'doubt',
  insecure: 'insecurity',
  inferior: 'inferiority',

  // Family, Social & Relationships
  keluarga: 'family',
  orangtua: 'parents',
  ayah: 'father',
  ibu: 'mother',
  anak: 'children',
  saudara: 'siblings',
  komunikasi: 'communication',
  dialog: 'dialogue',
  friksi: 'conflict',
  konflik: 'conflict',
  antargenerasi: 'generational',
  generasi: 'generation',
  sahabat: 'friends',
  teman: 'friends',
  kawan: 'friends',
  sebaya: 'peer',
  relasi: 'relationship',
  hubungan: 'relationship',
  pasangan: 'partner',
  suami: 'husband',
  istri: 'wife',
  cinta: 'love',
  kasih: 'affection',
  sayang: 'affection',
  empati: 'empathy',
  simpati: 'sympathy',
  hangat: 'warm',
  kehangatan: 'warmth',

  // Student Life & Campus
  mahasiswa: 'student',
  kuliah: 'student',
  kampus: 'campus',
  akademik: 'academic',
  skripsi: 'thesis',
  tugas: 'assignment',
  ujian: 'exams',
  burnout: 'burnout',

  // Islamic Counseling & BKI Concepts
  spiritual: 'spiritual',
  spiritualitas: 'spiritual',
  ibadah: 'worship',
  doa: 'prayer',
  sholat: 'prayer',
  shalat: 'prayer',
  tafakur: 'reflection',
  refleksi: 'reflection',
  reflektif: 'reflective',
  thumaninah: 'inner-tranquility',
  ikhlas: 'sincerity',
  keikhlasan: 'sincerity',
  sabar: 'patience',
  kesabaran: 'patience',
  syukur: 'gratitude',
  bersyukur: 'gratitude',
  tawakal: 'surrender',
  tawakkal: 'surrender',
  istighfar: 'repentance',
  zikir: 'remembrance',
  dzikir: 'remembrance',
  muhasabah: 'introspection',
  bimbingan: 'guidance',
  konseling: 'counseling',
  konselor: 'counselor',
  islam: 'islamic',
  islami: 'islamic',

  // Professional & General Concepts
  terapi: 'therapy',
  terapis: 'therapist',
  psikologi: 'psychology',
  psikologis: 'psychological',
  mindfulness: 'mindfulness',
  ruang: 'space',
  waktu: 'time',
  hidup: 'life',
  kehidupan: 'life',
  cbt: 'cbt',
  logika: 'logic',
  diri: 'self',
  asertif: 'assertive',
  harapan: 'hope',
  resolusi: 'resolution',
  etika: 'ethics',
  privasi: 'privacy',
  rahasia: 'confidentiality',
  karier: 'career',
  fokus: 'focus',
  produktivitas: 'productivity',
  produktif: 'productive',
  tekanan: 'pressure',
  beban: 'burden',
  seni: 'art',
  kekuatan: 'power',
  cerita: 'story',
  curhat: 'story',
  tanggapan: 'response',
  krisis: 'crisis',
  arah: 'direction',
  makna: 'meaning',
  kebiasaan: 'habits',
  langkah: 'steps',
  tips: 'tips',
  panduan: 'guide',
  istirahat: 'rest',
  tidur: 'sleep',
  sehat: 'healthy',
  kesehatan: 'health',
  solusi: 'solutions',
  metode: 'methods',
  strategi: 'strategy',
  kunci: 'key',
  tujuan: 'purpose',
  cita: 'dreams',
  impian: 'dreams',
  perubahan: 'change',
};

// Dangling English prepositions/connectors that should never terminate a slug
const ENGLISH_DANGLING_CONNECTORS = new Set(['of', 'in', 'on', 'at', 'to', 'for', 'and', 'with', 'by']);

/**
 * Translates an Indonesian title into English using domain-specific phrase
 * and word dictionaries without artificial token/word limits.
 */
export function translateWithLocalDictionary(title: string): string {
  if (!title || typeof title !== 'string') return '';

  let raw = title.trim().toLowerCase();

  // Check if title starts with guide words ("cara", "tips", "panduan", "petunjuk", "langkah(-langkah)")
  let isGuide = false;
  const guidePrefixMatch = raw.match(/^(\d+\s+)?(cara|tips|panduan|petunjuk|langkah(-langkah)?)\s+(.+)$/i);
  if (guidePrefixMatch) {
    isGuide = true;
    raw = `${guidePrefixMatch[1] || ''}${guidePrefixMatch[4]}`;
  }

  // Normalize apostrophes and punctuation for predictable tokenization
  raw = raw
    .replace(/[’']/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Substitute multi-word phrases first (ordered by specificity)
  for (const [pattern, replacement] of PHRASE_DICTIONARY) {
    raw = raw.replace(pattern, ` ${replacement} `);
  }

  // Tokenize and process individual words
  const tokens = raw
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean);

  const resultTokens: string[] = [];
  const seenTokens = new Set<string>();

  for (const token of tokens) {
    let resolved: string | null = null;

    // If token is already a mapped hyphenated token (e.g. inner-peace)
    if (token.includes('-')) {
      resolved = token;
    } else if (WORD_DICTIONARY[token]) {
      resolved = WORD_DICTIONARY[token];
    } else if (token === 'cara' || token === 'tips' || token === 'panduan' || token === 'petunjuk') {
      isGuide = true;
      continue;
    } else if (INDONESIAN_STOPWORDS.has(token)) {
      continue;
    } else {
      const cleanToken = token.replace(/[^a-z0-9]/g, '');
      if (cleanToken.length >= 2 || /^\d+$/.test(cleanToken)) {
        resolved = cleanToken;
      }
    }

    if (resolved) {
      const subTokens = resolved.split('-');
      for (const st of subTokens) {
        if (!st) continue;
        // Eliminate repeating words across the slug for high-density SEO
        if (seenTokens.has(st)) continue;
        seenTokens.add(st);
        resultTokens.push(st);
      }
    }
  }

  // If this was recognized as a guide and doesn't already have 'guide' or 'how-to'
  if (isGuide && !seenTokens.has('guide') && !seenTokens.has('how-to')) {
    while (resultTokens.length > 0 && ENGLISH_DANGLING_CONNECTORS.has(resultTokens[resultTokens.length - 1])) {
      resultTokens.pop();
    }
    resultTokens.push('guide');
  }

  // Remove any trailing dangling prepositions/connectors
  while (resultTokens.length > 0 && ENGLISH_DANGLING_CONNECTORS.has(resultTokens[resultTokens.length - 1])) {
    resultTokens.pop();
  }

  return resultTokens.join(' ');
}

/**
 * Transforms an Indonesian article title into a clean, hyphenated lowercase English slug
 * using the domain dictionary and @sindresorhus/slugify without artificial 5-7 word limits.
 *
 * Pure translation is preserved across the entire title.
 */
export function generateEnglishArticleSlug(title: string): string {
  if (!title || typeof title !== 'string') return '';

  const translatedText = translateWithLocalDictionary(title);
  let slug = slugify(translatedText, { lowercase: true, separator: '-' });

  // Fallback if dictionary output produced empty slug
  if (!slug) {
    slug = slugify(title, { lowercase: true, separator: '-' });
  }

  return slug;
}

/**
 * Asynchronously generates an English translated slug using the multi-tier translation API
 * (/api/translate on client, or direct translation on server),
 * falling back to the local dictionary translator.
 */
export async function generateTranslatedArticleSlug(title: string): Promise<string> {
  const fallback = generateEnglishArticleSlug(title);
  if (!title || typeof title !== 'string' || !title.trim()) {
    return fallback;
  }

  try {
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: title }),
        signal: AbortSignal.timeout(3500),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.slug) {
          return data.slug;
        }
      }
    } else {
      // Server-side environment: if base URL available, attempt fetch, else fallback
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const res = await fetch(`${siteUrl}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: title }),
        signal: AbortSignal.timeout(3500),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.slug) {
          return data.slug;
        }
      }
    }
  } catch {
    // Graceful fallback on network or parse failure
  }

  return fallback;
}

