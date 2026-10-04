import { Video, MessageSquare, Users } from 'lucide-react';
import { ConsultationCategory, CounselingMode } from '@/types';

export const BOOKING_CATEGORIES: ConsultationCategory[] = [
  'Manajemen Stres & Kecemasan',
  'Akademik & Karier',
  'Krisis Identitas Diri & Quarter-Life Crisis',
  'Hubungan Keluarga & Pra-Nikah',
  'Pengembangan Diri & Spiritual Islami',
];

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
  { id: 'online_meet', label: 'Google Meet', desc: 'Tatap muka virtual privat', icon: Video },
  { id: 'online_chat', label: 'Chat Terjadwal', desc: 'Percakapan teks intensif 60 menit', icon: MessageSquare },
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
  category: 'Manajemen Stres & Kecemasan',
  mode: 'online_meet',
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
