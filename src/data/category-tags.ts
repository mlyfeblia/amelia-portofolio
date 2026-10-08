/**
 * Default tags per category for articles in Amelia Portfolio.
 * Provides 5 contextual, relevant default tags per category that can be customized by the author.
 */

export const CATEGORY_DEFAULT_TAGS: Record<string, string[]> = {
  'Kesehatan Mental Islami': [
    "Thuma'ninah",
    'Tazkiyatun Nafs',
    'Kesehatan Mental',
    'BKI',
    'Ketenangan Batin',
  ],
  'Manajemen Emosi & Overthinking': [
    'Regulasi Emosi',
    'Overthinking',
    'Manajemen Stres',
    'Mindfulness',
    'Sabar & Solat',
  ],
  'Hubungan, Pertemanan & Pasangan': [
    'Komunikasi Asertif',
    'Empati',
    'Relasi Sehat',
    'Keluarga',
    'Ruang Dengar',
  ],
  'Akademik, Karier & Produktivitas': [
    'Academic Burnout',
    'Manajemen Waktu',
    'Tips Mahasiswa',
    'Fokus Belajar',
    'Produktivitas',
  ],
  'Quarter-Life Crisis & Self Growth': [
    'Quarter-Life Crisis',
    'Arah Hidup',
    'Pencarian Jati Diri',
    'Tawakkal',
    'Self Growth',
  ],
  'Cyber Counseling & Edukasi Sebaya': [
    'Cyber Counseling',
    'Konselor Sebaya',
    'Ruang Aman',
    'Etika Konseling',
    'Edukasi Sebaya',
  ],
  'Pengembangan Diri & Spiritual': [
    'Self Growth',
    'Tazkiyatun Nafs',
    'Pengembangan Diri',
    'Spiritualitas',
    'Ketenangan Batin',
  ],
  'Pengembangan Diri & Spiritual Islami': [
    'Self Growth',
    'Tazkiyatun Nafs',
    'Pengembangan Diri',
    'Spiritualitas',
    'Ketenangan Batin',
  ],
};

/**
 * Returns a 5-element array of default tags for a given article category.
 * If the category is not found in CATEGORY_DEFAULT_TAGS, it falls back to 'Kesehatan Mental Islami'.
 */
export function getDefaultTagsForCategory(category: string): string[] {
  const tags = CATEGORY_DEFAULT_TAGS[category] || CATEGORY_DEFAULT_TAGS['Kesehatan Mental Islami'];
  return [...tags];
}
