import { Video, MessageSquare, Users } from 'lucide-react';
import { ConsultationCategory, CounselingMode, BOOKING_CATEGORIES } from '@/types';

export { BOOKING_CATEGORIES };

export const BOOKING_TIME_SLOTS = [
  '09:30 - 10:30 WIB (Pagi)',
  '13:30 - 14:30 WIB (Siang)',
  '16:00 - 17:00 WIB (Sore)',
  '19:30 - 20:30 WIB (Malam)',
];

export const BOOKING_MODES: {
  id: CounselingMode;
  label: string;
  desc: string;
  icon: typeof Video;
}[] = [
  { id: 'online_chat', label: 'Chat Terjadwal', desc: 'Percakapan teks intensif via WhatsApp 60 menit', icon: MessageSquare },
  { id: 'online_meet', label: 'Video Call via WhatsApp', desc: 'Tatap muka virtual privat langsung di WhatsApp', icon: Video },
  { id: 'tatap_muka_cirebon', label: 'Tatap Muka Langsung', desc: 'Area Kampus UIN Siber Cirebon', icon: Users },
];

export interface BookingFormState {
  name: string;
  alias: string;
  phone: string;
  email: string;
  category: ConsultationCategory;
  mode: CounselingMode;
  date: string;
  timeSlot: string;
  notes: string;
}

export const DEFAULT_BOOKING_FORM: BookingFormState = {
  name: '',
  alias: '',
  phone: '',
  email: '',
  category: 'Manajemen Stres, Emosi & Burnout',
  mode: 'online_chat',
  date: '',
  timeSlot: '16:00 - 17:00 WIB (Sore)',
  notes: '',
};

export function getTodayDateString() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
}

export function getMaxBookingDateString(daysAhead = 60) {
  const target = new Date();
  target.setDate(target.getDate() + daysAhead);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(target);
}

export function resolveBookingCategory(query?: string | null): ConsultationCategory {
  if (!query || typeof query !== 'string') {
    return DEFAULT_BOOKING_FORM.category;
  }

  const clean = query.trim();
  if (!clean) return DEFAULT_BOOKING_FORM.category;

  // 1. Direct exact match (case-insensitive)
  const exact = BOOKING_CATEGORIES.find(
    (c) => c.toLowerCase() === clean.toLowerCase()
  );
  if (exact) return exact;

  // 2. Keyword heuristic mapping across articles, assessments, and curhat topics
  const lower = clean.toLowerCase();

  if (
    lower.includes('overthinking') ||
    lower.includes('cemas') ||
    lower.includes('pikiran') ||
    lower.includes('kognitif')
  ) {
    return 'Kecemasan & Overthinking';
  }
  if (
    lower.includes('burnout') ||
    lower.includes('stres') ||
    lower.includes('emosi') ||
    lower.includes('lelah')
  ) {
    return 'Manajemen Stres, Emosi & Burnout';
  }
  if (
    lower.includes('akademik') ||
    lower.includes('skripsi') ||
    lower.includes('kuliah') ||
    lower.includes('kampus')
  ) {
    return 'Akademik, Skripsi & Perkuliahan';
  }
  if (
    lower.includes('karier') ||
    lower.includes('kerja') ||
    lower.includes('finansial') ||
    lower.includes('pekerjaan')
  ) {
    return 'Perencanaan Karier & Dunia Kerja';
  }
  if (
    lower.includes('quarter') ||
    lower.includes('crisis') ||
    lower.includes('arah hidup') ||
    lower.includes('masa depan') ||
    lower.includes('self growth')
  ) {
    return 'Quarter-Life Crisis & Arah Hidup';
  }
  if (
    lower.includes('pasangan') ||
    lower.includes('cinta') ||
    lower.includes('percintaan') ||
    lower.includes('patah hati') ||
    lower.includes('jodoh')
  ) {
    return 'Percintaan, Pasangan & Patah Hati';
  }
  if (
    lower.includes('keluarga') ||
    lower.includes('orang tua') ||
    lower.includes('rumah') ||
    lower.includes('ayah') ||
    lower.includes('ibu')
  ) {
    return 'Keluarga & Relasi Orang Tua';
  }
  if (
    lower.includes('teman') ||
    lower.includes('sosial') ||
    lower.includes('pertemanan') ||
    lower.includes('people pleaser')
  ) {
    return 'Pertemanan, Sosial & People Pleaser';
  }
  if (
    lower.includes('percaya diri') ||
    lower.includes('citra diri') ||
    lower.includes('insecure') ||
    lower.includes('minder')
  ) {
    return 'Kepercayaan Diri & Citra Diri';
  }
  if (
    lower.includes('spiritual') ||
    lower.includes('islam') ||
    lower.includes('thuma') ||
    lower.includes('dzikir') ||
    lower.includes('doa') ||
    lower.includes('batin') ||
    lower.includes('ibadah')
  ) {
    return 'Pengembangan Diri & Spiritual Islami';
  }
  if (
    lower.includes('nikah') ||
    lower.includes('pernikahan') ||
    lower.includes('pra-nikah')
  ) {
    return 'Persiapan Menikah (Pra-Nikah)';
  }
  if (
    lower.includes('duka') ||
    lower.includes('kehilangan') ||
    lower.includes('trauma') ||
    lower.includes('ditinggal')
  ) {
    return 'Duka, Kehilangan & Pemulihan Batin';
  }

  return DEFAULT_BOOKING_FORM.category;
}
