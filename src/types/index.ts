export type BookingStatus = 'menunggu' | 'terkonfirmasi' | 'selesai' | 'dibatalkan';

export type CounselingMode = 'online_meet' | 'online_chat' | 'tatap_muka_cirebon';

export type ConsultationCategory =
  | 'Akademik & Karier'
  | 'Krisis Identitas Diri & Quarter-Life Crisis'
  | 'Manajemen Stres & Kecemasan'
  | 'Hubungan Keluarga & Pra-Nikah'
  | 'Pengembangan Diri & Spiritual Islami';

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

export interface AnonymousMessage {
  id: string;
  alias: string;
  category: string;
  message: string;
  answer?: string;
  isAnswered: boolean;
  isPublic: boolean;
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
