export interface CuratedCoverImage {
  id: string;
  title: string;
  category: string;
  url: string;
  alt: string;
}

export const CURATED_ARTICLE_IMAGES: CuratedCoverImage[] = [
  {
    id: 'mental-health',
    title: 'Ketenangan Hati & Mindfulness',
    category: 'Kesehatan Mental Islami',
    url: '/images/articles/mental-health.webp',
    alt: 'Ketenangan jiwa dan refleksi batin islami',
  },
  {
    id: 'overthinking',
    title: 'Pelepas Beban Emosi',
    category: 'Manajemen Emosi & Overthinking',
    url: '/images/articles/overthinking.webp',
    alt: 'Jurnal reflektif untuk melepas overthinking',
  },
  {
    id: 'relationships',
    title: 'Ruang Dengar & Empati',
    category: 'Hubungan, Pertemanan & Pasangan',
    url: '/images/articles/relationships.webp',
    alt: 'Relasi hangat dan ruang dengar suportif',
  },
  {
    id: 'academic',
    title: 'Fokus & Produktivitas Belajar',
    category: 'Akademik, Karier & Produktivitas',
    url: '/images/articles/academic.webp',
    alt: 'Meja belajar tenang dan manajemen waktu kuliah',
  },
  {
    id: 'self-growth',
    title: 'Pencarian Makna Hidup',
    category: 'Quarter-Life Crisis & Self Growth',
    url: '/images/articles/self-growth.webp',
    alt: 'Menumbuhkan potensi diri dan ketenangan arah hidup',
  },
  {
    id: 'counseling',
    title: 'Sesi Cyber Counseling',
    category: 'Cyber Counseling & Edukasi Sebaya',
    url: '/images/articles/counseling.webp',
    alt: 'Konseling sebaya ramah dan rahasia via digital',
  },
  {
    id: 'mindfulness-islamic',
    title: 'Tafakur & Doa Reflektif',
    category: 'Spiritualitas & Ibadah',
    url: '/images/articles/mindfulness-islamic.webp',
    alt: 'Doa reflektif dan ketenangan hati dalam ibadah',
  },
  {
    id: 'peer-listening',
    title: 'Sahabat & Konselor Sebaya',
    category: 'Cyber Counseling & Edukasi Sebaya',
    url: '/images/articles/peer-listening.webp',
    alt: 'Ruang dengar hangat bersama konselor sebaya',
  },
  {
    id: 'future-hope',
    title: 'Harapan & Resolusi Batin',
    category: 'Quarter-Life Crisis & Self Growth',
    url: '/images/articles/future-hope.webp',
    alt: 'Langkah bertumbuh dan harapan masa depan yang cerah',
  },
];
