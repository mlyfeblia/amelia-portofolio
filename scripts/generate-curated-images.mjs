import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const outputDir = path.join(process.cwd(), 'public', 'images', 'articles');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}


const items = [
  {
    filename: 'mental-health.webp',
    category: 'KESEHATAN MENTAL ISLAMI',
    subtitle: "Thuma'ninah & Ketenangan Jiwa",
    quote: 'Menenangkan batin di tengah riuhnya dunia dengan dzikir dan mindfulness',
    primaryColor: '#1B4D3E',
    secondaryColor: '#2D6A4F',
    accentColor: '#D8F3DC',
    bgGradStart: '#081C15',
    bgGradEnd: '#1B4332',
    iconSvg: `
      <circle cx="600" cy="270" r="140" fill="none" stroke="rgba(216,243,220,0.18)" stroke-width="2" />
      <circle cx="600" cy="270" r="100" fill="none" stroke="rgba(216,243,220,0.3)" stroke-width="2" stroke-dasharray="8 8" />
      <circle cx="600" cy="270" r="60" fill="rgba(82,183,136,0.25)" />
      <!-- Stylized Crescent & Mindfulness Water Drop -->
      <path d="M 600 200 C 625 240, 645 265, 645 285 C 645 310, 625 330, 600 330 C 575 330, 555 310, 555 285 C 555 265, 575 240, 600 200 Z" fill="#D8F3DC" opacity="0.9" />
      <circle cx="600" cy="285" r="12" fill="#1B4D3E" />
    `,
  },
  {
    filename: 'overthinking.webp',
    category: 'MANAJEMEN EMOSI & OVERTHINKING',
    subtitle: 'Melepas Beban & Menata Pikiran',
    quote: 'Mengurai benang kusut kekhawatiran dan melatih penerimaan diri secara utuh',
    primaryColor: '#1E293B',
    secondaryColor: '#334155',
    accentColor: '#FDE68A',
    bgGradStart: '#0F172A',
    bgGradEnd: '#1E293B',
    iconSvg: `
      <!-- Unwinding spiral / peaceful clarity wave -->
      <path d="M 460 270 Q 530 200, 600 270 T 740 270" fill="none" stroke="#FDE68A" stroke-width="4" stroke-linecap="round" />
      <path d="M 490 295 Q 545 245, 600 295 T 710 295" fill="none" stroke="rgba(253,230,138,0.5)" stroke-width="3" stroke-linecap="round" />
      <circle cx="600" cy="270" r="85" fill="none" stroke="rgba(253,230,138,0.15)" stroke-width="1.5" />
      <circle cx="600" cy="270" r="140" fill="none" stroke="rgba(253,230,138,0.08)" stroke-width="1" />
      <circle cx="600" cy="185" r="5" fill="#FDE68A" />
      <circle cx="660" cy="330" r="4" fill="#FDE68A" opacity="0.7" />
      <circle cx="530" cy="320" r="4" fill="#FDE68A" opacity="0.7" />
    `,
  },
  {
    filename: 'relationships.webp',
    category: 'HUBUNGAN, PERTEMANAN & PASANGAN',
    subtitle: 'Ruang Dengar & Relasi Bermakna',
    quote: 'Membangun komunikasi asertif, batasan sehat, dan kehangatan antarinsan',
    primaryColor: '#701A75',
    secondaryColor: '#86198F',
    accentColor: '#FBCFE8',
    bgGradStart: '#2A082E',
    bgGradEnd: '#4A044E',
    iconSvg: `
      <!-- Intersecting circles of empathy -->
      <circle cx="560" cy="270" r="80" fill="none" stroke="#FBCFE8" stroke-width="3" opacity="0.7" />
      <circle cx="640" cy="270" r="80" fill="none" stroke="#FBCFE8" stroke-width="3" opacity="0.7" />
      <!-- Heart overlap glow -->
      <ellipse cx="600" cy="270" rx="30" ry="50" fill="rgba(251,207,232,0.25)" />
      <circle cx="600" cy="270" r="140" fill="none" stroke="rgba(251,207,232,0.12)" stroke-width="1.5" stroke-dasharray="6 6" />
      <path d="M 600 255 C 600 245, 615 240, 620 250 C 625 260, 600 280, 600 280 C 600 280, 575 260, 580 250 C 585 240, 600 245, 600 255 Z" fill="#FBCFE8" />
    `,
  },
  {
    filename: 'academic.webp',
    category: 'AKADEMIK, KARIER & PRODUKTIVITAS',
    subtitle: 'Fokus Belajar & Manajemen Burnout',
    quote: 'Menjaga ritme produktivitas seimbang tanpa mengorbankan kesehatan mental',
    primaryColor: '#0E7490',
    secondaryColor: '#155E75',
    accentColor: '#A5F3FC',
    bgGradStart: '#083344',
    bgGradEnd: '#164E63',
    iconSvg: `
      <!-- Stylized compass / focus arch -->
      <circle cx="600" cy="270" r="130" fill="none" stroke="rgba(165,243,252,0.2)" stroke-width="1.5" />
      <circle cx="600" cy="270" r="90" fill="none" stroke="#A5F3FC" stroke-width="2.5" opacity="0.6" />
      <!-- Rays of focus -->
      <line x1="600" y1="160" x2="600" y2="190" stroke="#A5F3FC" stroke-width="3" stroke-linecap="round" />
      <line x1="600" y1="350" x2="600" y2="380" stroke="#A5F3FC" stroke-width="3" stroke-linecap="round" />
      <line x1="490" y1="270" x2="520" y2="270" stroke="#A5F3FC" stroke-width="3" stroke-linecap="round" />
      <line x1="680" y1="270" x2="710" y2="270" stroke="#A5F3FC" stroke-width="3" stroke-linecap="round" />
      <!-- Center book icon or focal diamond -->
      <polygon points="600,240 625,270 600,300 575,270" fill="#A5F3FC" opacity="0.85" />
    `,
  },
  {
    filename: 'self-growth.webp',
    category: 'QUARTER-LIFE CRISIS & SELF GROWTH',
    subtitle: 'Menumbuhkan Arah & Makna Hidup',
    quote: 'Menavigasi fase transisi dewasa muda dengan keteguhan prinsip dan harapan baru',
    primaryColor: '#92400E',
    secondaryColor: '#B45309',
    accentColor: '#FED7AA',
    bgGradStart: '#451A03',
    bgGradEnd: '#78350F',
    iconSvg: `
      <!-- Sprouting leaf / sunrise arch -->
      <path d="M 600 340 C 600 290, 560 260, 550 230 C 575 230, 610 250, 600 340 Z" fill="#FED7AA" opacity="0.9" />
      <path d="M 600 340 C 600 280, 640 250, 650 215 C 625 220, 595 245, 600 340 Z" fill="#FDBA74" opacity="0.85" />
      <circle cx="600" cy="180" r="16" fill="#FED7AA" />
      <circle cx="600" cy="270" r="140" fill="none" stroke="rgba(254,215,170,0.18)" stroke-width="1.5" stroke-dasharray="10 5" />
    `,
  },
  {
    filename: 'counseling.webp',
    category: 'CYBER COUNSELING & EDUKASI SEBAYA',
    subtitle: 'Ruang Cerita Aman & Terpercaya',
    quote: 'Konseling sebaya digital yang santun, rahasia, dan bebas dari penghakiman',
    primaryColor: '#115E59',
    secondaryColor: '#134E4A',
    accentColor: '#99F6E4',
    bgGradStart: '#042F2E',
    bgGradEnd: '#115E59',
    iconSvg: `
      <!-- Safe haven dialog shield -->
      <rect x="520" y="200" width="160" height="110" rx="24" fill="rgba(153,246,228,0.15)" stroke="#99F6E4" stroke-width="2.5" />
      <!-- Speech bubble tail -->
      <path d="M 550 310 L 530 335 L 575 310 Z" fill="#99F6E4" />
      <circle cx="570" cy="255" r="6" fill="#99F6E4" />
      <circle cx="600" cy="255" r="6" fill="#99F6E4" />
      <circle cx="630" cy="255" r="6" fill="#99F6E4" />
      <circle cx="600" cy="265" r="140" fill="none" stroke="rgba(153,246,228,0.15)" stroke-width="1.5" />
    `,
  },
  {
    filename: 'mindfulness-islamic.webp',
    category: 'SPIRITUALITAS & IBADAH',
    subtitle: 'Tafakur & Doa Reflektif',
    quote: 'Doa reflektif dan ketenangan hati dalam ibadah munajat spiritual',
    primaryColor: '#312E81',
    secondaryColor: '#4338CA',
    accentColor: '#C7D2FE',
    bgGradStart: '#0F172A',
    bgGradEnd: '#1E1B4B',
    iconSvg: `
      <!-- Spiritual arch & contemplative prayer light -->
      <path d="M 540 330 C 540 240, 570 200, 600 180 C 630 200, 660 240, 660 330 Z" fill="none" stroke="#C7D2FE" stroke-width="2.5" opacity="0.8" />
      <circle cx="600" cy="270" r="45" fill="rgba(199,210,254,0.15)" />
      <!-- Soft star / light burst -->
      <circle cx="600" cy="240" r="6" fill="#C7D2FE" />
      <path d="M 600 220 L 600 260 M 580 240 L 620 240" stroke="#C7D2FE" stroke-width="2" stroke-linecap="round" opacity="0.7" />
      <circle cx="600" cy="270" r="130" fill="none" stroke="rgba(199,210,254,0.12)" stroke-width="1.5" stroke-dasharray="8 6" />
    `,
  },
  {
    filename: 'peer-listening.webp',
    category: 'CYBER COUNSELING & EDUKASI SEBAYA',
    subtitle: 'Sahabat & Konselor Sebaya',
    quote: 'Ruang dengar hangat bersama konselor sebaya tanpa takut dihakimi',
    primaryColor: '#0F766E',
    secondaryColor: '#14B8A6',
    accentColor: '#CCFBF1',
    bgGradStart: '#042F2E',
    bgGradEnd: '#134E4A',
    iconSvg: `
      <!-- Connected peer circles & listening resonance -->
      <circle cx="550" cy="265" r="75" fill="none" stroke="#CCFBF1" stroke-width="2.5" opacity="0.7" />
      <circle cx="650" cy="265" r="75" fill="none" stroke="#CCFBF1" stroke-width="2.5" opacity="0.7" />
      <circle cx="600" cy="265" r="30" fill="rgba(204,251,241,0.2)" />
      <!-- Resonance ripples -->
      <path d="M 510 265 Q 600 200, 690 265" fill="none" stroke="#CCFBF1" stroke-width="2" stroke-dasharray="4 4" opacity="0.6" />
      <circle cx="600" cy="265" r="140" fill="none" stroke="rgba(204,251,241,0.12)" stroke-width="1.5" />
      <circle cx="570" cy="260" r="5" fill="#CCFBF1" />
      <circle cx="630" cy="260" r="5" fill="#CCFBF1" />
    `,
  },
  {
    filename: 'future-hope.webp',
    category: 'QUARTER-LIFE CRISIS & SELF GROWTH',
    subtitle: 'Harapan & Resolusi Batin',
    quote: 'Langkah bertumbuh dan harapan masa depan yang cerah dengan keyakinan diri',
    primaryColor: '#831843',
    secondaryColor: '#9D174D',
    accentColor: '#FBCFE8',
    bgGradStart: '#4C0519',
    bgGradEnd: '#831843',
    iconSvg: `
      <!-- Rising dawn arch & blossoming path -->
      <path d="M 480 340 C 530 280, 570 230, 600 190 C 630 230, 670 280, 720 340 Z" fill="none" stroke="#FBCFE8" stroke-width="2.5" opacity="0.75" />
      <circle cx="600" cy="250" r="45" fill="rgba(251,207,232,0.2)" />
      <circle cx="600" cy="210" r="12" fill="#FBCFE8" />
      <line x1="600" y1="160" x2="600" y2="185" stroke="#FBCFE8" stroke-width="2.5" stroke-linecap="round" />
      <line x1="560" y1="180" x2="575" y2="195" stroke="#FBCFE8" stroke-width="2" stroke-linecap="round" />
      <line x1="640" y1="180" x2="625" y2="195" stroke="#FBCFE8" stroke-width="2" stroke-linecap="round" />
      <circle cx="600" cy="270" r="140" fill="none" stroke="rgba(251,207,232,0.12)" stroke-width="1.5" stroke-dasharray="6 6" />
    `,
  },
];

async function generateImages() {
  for (const item of items) {
    const safeCat = item.category.replaceAll('&', '&amp;');
    const safeSub = item.subtitle.replaceAll('&', '&amp;');
    const safeQuote = item.quote.replaceAll('&', '&amp;');

    const svg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${item.bgGradStart}" />
          <stop offset="100%" stop-color="${item.bgGradEnd}" />
        </linearGradient>
        <linearGradient id="glow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${item.accentColor}" stop-opacity="0.25" />
          <stop offset="100%" stop-color="${item.accentColor}" stop-opacity="0" />
        </linearGradient>
        <radialGradient id="centerGlow" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="${item.accentColor}" stop-opacity="0.18" />
          <stop offset="100%" stop-color="${item.accentColor}" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- Background -->
      <rect width="1200" height="630" fill="url(#bg)" />

      <!-- Ambient Glow Circles -->
      <ellipse cx="600" cy="270" rx="480" ry="240" fill="url(#centerGlow)" />
      
      <!-- Subtle Islamic Arabesque / Geometric Grid Lines -->
      <g stroke="rgba(255,255,255,0.04)" stroke-width="1">
        <line x1="0" y1="126" x2="1200" y2="126" />
        <line x1="0" y1="252" x2="1200" y2="252" />
        <line x1="0" y1="378" x2="1200" y2="378" />
        <line x1="0" y1="504" x2="1200" y2="504" />
        <line x1="240" y1="0" x2="240" y2="630" />
        <line x1="480" y1="0" x2="480" y2="630" />
        <line x1="720" y1="0" x2="720" y2="630" />
        <line x1="960" y1="0" x2="960" y2="630" />
      </g>

      <!-- Decorative Outer Border Frame -->
      <rect x="36" y="36" width="1128" height="558" rx="20" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" />
      <rect x="44" y="44" width="1112" height="542" rx="16" fill="none" stroke="${item.accentColor}" stroke-width="1" stroke-opacity="0.2" />

      <!-- Center Visual Motif -->
      ${item.iconSvg}

      <!-- Top Branding Pill -->
      <g>
        <rect x="390" y="72" width="420" height="38" rx="19" fill="rgba(255,255,255,0.06)" stroke="${item.accentColor}" stroke-width="1" stroke-opacity="0.3" />
        <text x="600" y="96" fill="${item.accentColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" letter-spacing="2" text-anchor="middle">
          AMELIA BKI &#8226; ${safeCat}
        </text>
      </g>

      <!-- Bottom Headline and Reflection Text -->
      <text x="600" y="468" fill="#FFFFFF" font-family="'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif" font-size="34" font-weight="600" letter-spacing="-0.5" text-anchor="middle">
        ${safeSub}
      </text>

      <text x="600" y="508" fill="${item.accentColor}" opacity="0.85" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="400" text-anchor="middle">
        ${safeQuote}
      </text>

      <!-- Bottom Brand Signature -->
      <g opacity="0.5">
        <text x="600" y="555" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" letter-spacing="1" text-anchor="middle">
          RUANG KONSELING SEBAYA &#8226; KESEHATAN MENTAL ISLAMI
        </text>
      </g>
    </svg>
    `;

    const destPath = path.join(outputDir, item.filename);
    await sharp(Buffer.from(svg))
      .webp({ quality: 90, effort: 6 })
      .toFile(destPath);

    console.log(`Generated: ${destPath}`);
  }
}

generateImages().catch(console.error);
