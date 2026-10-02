import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Newsreader } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

// ── Fonts ────────────────────────────────────────────────────────
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
  preload: true,
});

const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal'],      // roman only — italic display headers are a design anti-pattern
  weight: ['400', '500', '600'],
  variable: '--font-display',
  display: 'swap',
  preload: true,
});

// ── Constants ─────────────────────────────────────────────────────
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mlyfeblia.vercel.app';
const SITE_NAME = 'Amelia — Bimbingan Konseling Islam';
const DEFAULT_DESC =
  'Portofolio resmi Amelia (Amel), mahasiswi Bimbingan Konseling Islam UIN Siber Syekh Nurjati Cirebon. Konseling islami berbasis Tazkiyatun Nafs, cyber counseling, dan edukasi kesehatan mental generasi digital.';

// ── Root Metadata ─────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: `${SITE_NAME} | UIN Siber Syekh Nurjati Cirebon`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESC,
  keywords: [
    'Amelia', 'Amel', 'Bimbingan Konseling Islam', 'BKI',
    'UIN Siber Syekh Nurjati Cirebon', 'UINSSC', 'Cyber Counseling',
    'Kesehatan Mental Islami', 'Tazkiyatun Nafs', 'Konseling Online',
    'Konselor Sebaya', 'Konseling Cirebon', 'Quarter Life Crisis',
    'Stres Akademik', 'Psikologi Islam',
  ],
  authors: [{ name: 'Amelia', url: BASE_URL }],
  creator: 'Amelia',
  publisher: 'Amelia — BKI UIN Siber Syekh Nurjati Cirebon',

  // Canonical
  alternates: {
    canonical: BASE_URL,
    languages: {
      'id-ID': BASE_URL,
    },
  },

  // Open Graph
  openGraph: {
    type: 'profile',
    locale: 'id_ID',
    url: BASE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Konseling Islami & Cyber Counseling`,
    description: DEFAULT_DESC,
    firstName: 'Amelia',
    username: 'amel-bki',
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Amelia — Bimbingan Konseling Islam UIN Siber Syekh Nurjati Cirebon',
      },
    ],
  },

  // Twitter / X Card
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} | Konseling Islami & Cyber Counseling`,
    description: DEFAULT_DESC,
    images: [`${BASE_URL}/og-image.png`],
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Verification placeholders (replace with real values from Search Console)
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },

  // App
  applicationName: SITE_NAME,
  category: 'education',
};

// ── Viewport (separate export as required by Next.js 15+) ─────────
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F9F7F2' },
    { media: '(prefers-color-scheme: dark)',  color: '#1A2920' },
  ],
};

// ── JSON-LD Structured Data ────────────────────────────────────────
const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Amelia',
  alternateName: 'Amel',
  description: DEFAULT_DESC,
  url: BASE_URL,
  jobTitle: 'Mahasiswi Bimbingan Konseling Islam',
  affiliation: {
    '@type': 'EducationalOrganization',
    name: 'Universitas Islam Negeri Siber Syekh Nurjati Cirebon',
    alternateName: 'UIN Siber Syekh Nurjati Cirebon',
    url: 'https://uinssc.ac.id',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Cirebon',
      addressRegion: 'Jawa Barat',
      addressCountry: 'ID',
    },
  },
  knowsAbout: [
    'Bimbingan Konseling Islam',
    'Cyber Counseling',
    'Tazkiyatun Nafs',
    'Cognitive Behavioral Therapy',
    'Kesehatan Mental Islam',
    'Quarter Life Crisis',
  ],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Cirebon',
    addressRegion: 'Jawa Barat',
    addressCountry: 'ID',
  },
};

const webSiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: BASE_URL,
  description: DEFAULT_DESC,
  inLanguage: 'id-ID',
  author: {
    '@type': 'Person',
    name: 'Amelia',
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/artikel?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

// ── Root Layout ───────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${jakarta.variable} ${newsreader.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        {/* Preconnect for font performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen antialiased">
        {/* Skip to main content — WCAG 2.4.1 Bypass Blocks */}
        <a href="#main-content" className="skip-nav">
          Lewati ke konten utama
        </a>

        {children}

        {/* JSON-LD — structured data for rich results */}
        <Script
          id="json-ld-person"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
          strategy="afterInteractive"
        />
        <Script
          id="json-ld-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
