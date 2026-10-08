export type BookingStatus = 'menunggu' | 'terkonfirmasi' | 'selesai' | 'dibatalkan';

export type CounselingMode = 'online_meet' | 'online_chat' | 'tatap_muka_cirebon';

export const BOOKING_CATEGORIES = [
  'Manajemen Stres, Emosi & Burnout',
  'Kecemasan & Overthinking',
  'Akademik, Skripsi & Perkuliahan',
  'Perencanaan Karier & Dunia Kerja',
  'Quarter-Life Crisis & Arah Hidup',
  'Percintaan, Pasangan & Patah Hati',
  'Keluarga & Relasi Orang Tua',
  'Pertemanan, Sosial & People Pleaser',
  'Kepercayaan Diri & Citra Diri',
  'Pengembangan Diri & Spiritual Islami',
  'Persiapan Menikah (Pra-Nikah)',
  'Duka, Kehilangan & Pemulihan Batin',
  'Konsultasi Bebas & Topik Lainnya',
] as const;

export type ConsultationCategory = (typeof BOOKING_CATEGORIES)[number] | string;

export interface Booking {
  id: string;
  code: string;
  name: string;
  alias?: string;
  phone: string;
  email: string;
  category: ConsultationCategory;
  mode: CounselingMode;
  date: string;
  timeSlot: string;
  notes: string;
  status: BookingStatus;
  createdAt: string;
}

export const CURHAT_CATEGORIES = [
  'Pertemanan & Sosial',
  'Keluarga & Rumah',
  'Percintaan & Pasangan',
  'Quarter-Life Crisis & Arah Hidup',
  'Akademik, Skripsi & Kuliah',
  'Karier, Kerja & Finansial',
  'Kesehatan Mental & Emosi',
  'Spiritualitas & Ibadah',
  'Kepercayaan Diri & Citra Diri',
  'Kisah Bebas & Lainnya',
] as const;

export type CurhatCategory = (typeof CURHAT_CATEGORIES)[number];

export const ARTICLE_CATEGORIES = [
  'Kesehatan Mental Islami',
  'Manajemen Emosi & Overthinking',
  'Hubungan, Pertemanan & Pasangan',
  'Akademik, Karier & Produktivitas',
  'Quarter-Life Crisis & Self Growth',
  'Cyber Counseling & Edukasi Sebaya',
  'Pengembangan Diri & Spiritual',
] as const;

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

export interface AnonymousMessage {
  id: string;
  alias: string;
  category: string;
  message: string;
  answer?: string;
  isAnswered: boolean;
  isPublic: boolean;
  showOnLandingPage?: boolean;
  createdAt: string;
  answeredAt?: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: string;
  publishedAt: string;
  tags: string[];
  isPublished?: boolean;
  showOnLandingPage?: boolean;
  views?: number;
  coverImage?: string;
}

export interface AssessmentQuestion {
  id: number;
  question: string;
  options: {
    label: string;
    score: number;
    description: string;
  }[];
}
