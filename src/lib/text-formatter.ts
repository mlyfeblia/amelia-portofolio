/**
 * Text Formatter Utilities
 *
 * Implements Indonesian PUEBI/EYD capitalization rules for:
 * 1. Title Case (formatIndonesianTitleCase)
 * 2. Sentence Case & auto-correction (formatSentenceCase)
 * 3. Person Name & academic/religious prefix formatting (formatPersonName)
 */

/**
 * Indonesian Kata Tugas (prepositions, conjunctions, interjections, particles)
 * that stay lowercase when appearing in the middle of a title, unless they are
 * the first word or immediately follow punctuation (colons, dashes, quotes, brackets, slashes, etc.).
 */
export const INDONESIAN_KATA_TUGAS = new Set([
  'dan',
  'di',
  'ke',
  'dari',
  'pada',
  'dalam',
  'untuk',
  'dengan',
  'atau',
  'yang',
  'oleh',
  'tentang',
  'bagi',
  'serta',
  'atas',
  'antara',
  'tanpa',
  'terhadap',
  'hingga',
  'sampai',
  'sebagai',
  'pun',
  'ala',
  'si',
  'sang',
  'demi',
  'per',
  'bila',
  'jika',
  'maupun',
]);

/**
 * Recognized acronyms preserved in uppercase.
 */
export const RECOGNIZED_ACRONYMS: Record<string, string> = {
  cbt: 'CBT',
  bki: 'BKI',
  uin: 'UIN',
  seo: 'SEO',
  pwa: 'PWA',
  ai: 'AI',
  url: 'URL',
  html: 'HTML',
  css: 'CSS',
  js: 'JS',
  api: 'API',
  ui: 'UI',
  ux: 'UX',
  pdf: 'PDF',
  faq: 'FAQ',
  ptsd: 'PTSD',
  ocd: 'OCD',
  adhd: 'ADHD',
  smk: 'SMK',
  sma: 'SMA',
  smp: 'SMP',
  sd: 'SD',
  dpr: 'DPR',
  ri: 'RI',
};

/**
 * Recognized Roman Numerals preserved in uppercase.
 */
const ROMAN_NUMERALS = new Set([
  'i',
  'ii',
  'iii',
  'iv',
  'v',
  'vi',
  'vii',
  'viii',
  'ix',
  'x',
  'xi',
  'xii',
]);

/**
 * Academic, professional, and religious title mappings for person names.
 */
const PERSON_NAME_SPECIAL_CASES: Record<string, string> = {
  'dr.': 'dr.',
  'dr': 'Dr.',
  'drg.': 'drg.',
  'drg': 'drg.',
  'drh.': 'drh.',
  'drh': 'drh.',
  'prof.': 'Prof.',
  'prof': 'Prof.',
  'drs.': 'Drs.',
  'dra.': 'Dra.',
  'ph.d.': 'Ph.D.',
  'ph.d': 'Ph.D.',
  's.psi.': 'S.Psi.',
  's.psi': 'S.Psi.',
  'm.psi.': 'M.Psi.',
  'm.psi': 'M.Psi.',
  's.pd.': 'S.Pd.',
  's.pd': 'S.Pd.',
  'm.pd.': 'M.Pd.',
  'm.pd': 'M.Pd.',
  's.ag.': 'S.Ag.',
  's.ag': 'S.Ag.',
  'm.ag.': 'M.Ag.',
  'm.ag': 'M.Ag.',
  's.sos.': 'S.Sos.',
  's.sos': 'S.Sos.',
  'm.sos.': 'M.Sos.',
  'm.sos': 'M.Sos.',
  'lc.': 'Lc.',
  'lc': 'Lc.',
  'ustadz': 'Ustadz',
  'ustadzah': 'Ustadzah',
  'ust.': 'Ust.',
  'ust': 'Ust.',
  'kiai': 'Kiai',
  'kyai': 'Kiai',
  'habib': 'Habib',
  'h.': 'H.',
  'hj.': 'Hj.',
  'kh.': 'K.H.',
};

/**
 * Name particles kept lowercase when in the middle of a person's name or alias.
 */
const NAME_LOWERCASE_PARTICLES = new Set([
  'bin',
  'binti',
  'van',
  'von',
  'de',
  'da',
  'yang',
]);

/**
 * Capitalizes a single word: first letter uppercase, rest lowercase.
 * Preserves internal apostrophes (e.g. "ta'awun" -> "Ta'awun").
 */
function capitalizeWord(word: string): string {
  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/**
 * Checks whether the word at `offset` in `fullString` is preceded by punctuation
 * or is the very first word, thus mandating capitalization under PUEBI/EYD rules.
 */
function shouldCapitalizeWord(
  word: string,
  offset: number,
  fullString: string
): boolean {
  const preceding = fullString.slice(0, offset);

  // 1. First word in string (no word characters before it)
  if (!/[a-zA-Z0-9À-ÿ]/.test(preceding)) {
    return true;
  }

  // 2. Second part of a hyphenated compound word (e.g., "Anak-Anak", "Quarter-Life")
  if (/[a-zA-Z0-9À-ÿ]-$/.test(preceding)) {
    return true;
  }

  // 3. Follows punctuation: colon (:), dash (—, –, or spaced - ), quotes, brackets, slash, sentence enders (. ? !)
  const trimmed = preceding.replace(/[ \t]+$/, '');
  const isPunctuationBound =
    /[:;—–/(\[{"'“‘`]$/.test(trimmed) ||
    /[.?!]$/.test(trimmed) ||
    /(?:^|\s)-$/.test(trimmed);

  if (isPunctuationBound) {
    return true;
  }

  // 4. Ordinal number prefix pattern like "ke-1", "ke-2"
  if (/^ke-\d+/i.test(fullString.slice(offset))) {
    return true;
  }

  return false;
}

/**
 * Formats a string to Indonesian Title Case following PUEBI/EYD conventions.
 *
 * Rules:
 * - Kata tugas (prepositions and conjunctions) stay lowercase in the middle of titles.
 * - Words at the beginning of string or after punctuation (: , — , - , " , ' , ( , / , . , ? , !) are capitalized.
 * - Recognized acronyms (CBT, BKI, UIN, SEO, PWA, AI, URL, HTML, CSS, JS, API) are converted to/preserved in uppercase.
 * - Hyphenated compound words have both parts capitalized (Anak-Anak, Quarter-Life).
 * - Trailing and leading whitespace is preserved so real-time typing is never disrupted.
 */
export function formatIndonesianTitleCase(text: string): string {
  if (!text || typeof text !== 'string') return text || '';

  return text.replace(/[a-zA-Z0-9À-ÿ]+(?:'[a-zA-Z0-9À-ÿ]+)*/g, (match, offset: number, fullString: string) => {
    const lower = match.toLowerCase();

    // Check recognized acronyms
    if (RECOGNIZED_ACRONYMS[lower]) {
      return RECOGNIZED_ACRONYMS[lower];
    }

    // Check Roman Numerals
    if (ROMAN_NUMERALS.has(lower)) {
      return lower.toUpperCase();
    }

    // Check Kata Tugas
    if (INDONESIAN_KATA_TUGAS.has(lower)) {
      if (shouldCapitalizeWord(match, offset, fullString)) {
        return capitalizeWord(lower);
      }
      return lower;
    }

    // Standard word: capitalize first letter
    return capitalizeWord(match);
  });
}

/**
 * Formats a person name or alias:
 * - Capitalizes the first letter of each word (ahmad fauzi -> Ahmad Fauzi).
 * - Preserves academic/religious titles (dr. -> dr., Dr. -> Dr., Ustadz, S.Psi., etc.).
 * - Preserves particles in the middle (bin, binti, yang).
 * - Preserves real-time typing spacing.
 */
export function formatPersonName(name: string): string {
  if (!name || typeof name !== 'string') return name || '';

  return name.replace(/[a-zA-Z0-9À-ÿ]+(?:[.'][a-zA-Z0-9À-ÿ]+)*\.?/g, (token, offset: number, fullString: string) => {
    const lower = token.toLowerCase();

    // Check special cases (exact prefix / title / degree match)
    const preceding = fullString.slice(0, offset);
    if (PERSON_NAME_SPECIAL_CASES[lower]) {
      // If user typed uppercase Dr. with a dot, preserve Dr.
      if (lower === 'dr.' && token.startsWith('D')) {
        return 'Dr.';
      }
      const mapped = PERSON_NAME_SPECIAL_CASES[lower];
      // Prevent dot-less prefixes (dr, drg, drh, prof, ust, lc) from injecting a period mid-word during live typing
      if (!token.includes('.') && mapped.endsWith('.')) {
        const isFollowedByChar = offset + token.length < fullString.length;
        const isAfterComma = /,\s*$/.test(preceding);
        if (!isFollowedByChar && !isAfterComma) {
          return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
        }
      }
      return mapped;
    }

    // Check lowercase particles in middle of name (bin, binti, yang)
    const isFirstWord = !/[a-zA-Z0-9À-ÿ]/.test(preceding);
    if (!isFirstWord && NAME_LOWERCASE_PARTICLES.has(lower)) {
      return lower;
    }

    // Hyphenated Arabic prefixes like "Al-" in "Al-Ghazali"
    if (lower === 'al' && fullString[offset + token.length] === '-') {
      return 'Al';
    }

    // Degrees with dots (e.g., S.H., M.M.)
    if (token.includes('.')) {
      return token
        .split('.')
        .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : ''))
        .join('.');
    }

    // Standard word
    return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
  });
}

/**
 * Formats a block of text into sentence case:
 * - Capitalizes the first non-whitespace letter of text and after sentence enders (. , ? , ! , or \n).
 * - Preserves markdown headers (#, ##, etc.), lists (-, *, 1.), and blockquotes (>).
 * - Preserves markdown code blocks and inline code spans intact.
 */
export function formatSentenceCase(text: string): string {
  if (!text || typeof text !== 'string') return text || '';

  // 1. Protect markdown code blocks (``` ... ```) and inline code (`...`)
  const codeBlocks: string[] = [];
  const protectedText = text.replace(/```[\s\S]*?```|`[^`\n]+`/g, (match) => {
    codeBlocks.push(match);
    return `___CODE_BLOCK_${codeBlocks.length - 1}___`;
  });

  // 2. Helper to capitalize sentences within a single line
  const formatLineSentences = (line: string): string => {
    if (!line.trim()) return line;

    // Capitalize first non-whitespace/quote letter
    let formatted = line.replace(
      /^(\s*["'“‘(]?)([a-zà-ÿ])/i,
      (_, pre, ch) => pre + ch.toUpperCase()
    );

    // Capitalize after sentence enders: . ? ! followed by spaces and optional quotes
    formatted = formatted.replace(
      /([.?!]["'”’)]?)(\s+)(["'“‘(]?)([a-zà-ÿ])/g,
      (_, punct, spaces, openQuote, char) =>
        punct + spaces + openQuote + char.toUpperCase()
    );

    return formatted;
  };

  // 3. Process line-by-line to preserve Markdown headers, list items, and blockquotes
  const lines = protectedText.split('\n');
  const processedLines = lines.map((line) => {
    // Markdown headers: # Header
    const headerMatch = line.match(/^(#{1,6}\s+)(.*)$/);
    if (headerMatch) {
      const [, prefix, rest] = headerMatch;
      return prefix + formatLineSentences(rest);
    }

    // Markdown lists: - Item, * Item, 1. Item
    const listMatch = line.match(/^(\s*(?:[-*+]|\d+\.)\s+)(.*)$/);
    if (listMatch) {
      const [, prefix, rest] = listMatch;
      return prefix + formatLineSentences(rest);
    }

    // Markdown blockquote: > Quote
    const quoteMatch = line.match(/^(\s*>\s*)(.*)$/);
    if (quoteMatch) {
      const [, prefix, rest] = quoteMatch;
      return prefix + formatLineSentences(rest);
    }

    return formatLineSentences(line);
  });

  // 4. Restore code blocks
  let result = processedLines.join('\n');
  codeBlocks.forEach((code, index) => {
    result = result.replace(`___CODE_BLOCK_${index}___`, () => code);
  });

  return result;
}
