import { CounselingMode } from '@/types';

export interface ServicePillar {
  num: string;
  title: string;
  desc: string;
}

export interface ServiceFormat {
  title: string;
  mode: CounselingMode;
  dur: string;
  desc: string;
}

export interface ServiceStep {
  step: string;
  title: string;
  desc: string;
}

export const pillars: ServicePillar[] = [
  {
    num: '01',
    title: 'Ruang Dengar Tanpa Penghakiman',
    desc: 'Kamu bebas menceritakan kerapuhanmu apa adanya. Aku hadir untuk mendengar dengan utuh tanpa memberikan stigma atau tatapan menghakimi.',
  },
  {
    num: '02',
    title: 'Kombinasi Logika CBT & Nilai Hati',
    desc: 'Membedah pikiran yang membuatmu cemas dengan metode ilmiah, sekaligus menyiram batin dengan kedamaian spiritual dan rasa syukur.',
  },
  {
    num: '03',
    title: 'Amanah Kerahasiaan 100%',
    desc: 'Ceritamu aman di sini. Semua identitas dan obrolan selama sesi dijaga ketat sesuai kode etik bimbingan konseling profesional.',
  },
  {
    num: '04',
    title: 'Solusi Bertahap yang Realistis',
    desc: 'Kita tidak mencari jalan pintas yang muluk-muluk. Bersama, kita susun langkah kecil yang ramah dan nyata untuk kamu jalani hari demi hari.',
  },
];

export const formats: ServiceFormat[] = [
  {
    title: 'Google Meet Virtual',
    mode: 'online_meet',
    dur: '60 Menit · Tatap Muka Daring',
    desc: 'Cocok buat kamu yang nyaman berdiskusi lewat tatap muka langsung dari kamar atau sudut tenang rumahmu.',
  },
  {
    title: 'Chat Terjadwal',
    mode: 'online_chat',
    dur: '60 Menit · Komunikasi Teks',
    desc: 'Pilihan pas bagi kamu yang lebih leluasa dan tenang mengekspresikan isi hati lewat ketikan kata demi kata.',
  },
  {
    title: 'Tatap Muka di Kampus',
    mode: 'tatap_muka_cirebon',
    dur: '60 Menit · Wilayah Cirebon',
    desc: 'Pertemuan langsung di area kampus UIN Siber Cirebon bagi sahabat yang berada di domisili sekitar.',
  },
];

export const steps: ServiceStep[] = [
  {
    step: '1',
    title: 'Pilih Jadwal Sesi',
    desc: 'Tentukan hari, jam, dan format obrolan yang paling nyaman buat rutinitasmu.',
  },
  {
    step: '2',
    title: 'Konfirmasi WhatsApp',
    desc: 'Amel akan menghubungimu secara privat untuk memastikan detail waktu sesi konseling.',
  },
  {
    step: '3',
    title: 'Sesi Curhat Bersama',
    desc: 'Obrolan santai 60 menit untuk menumpahkan beban pikiran dan memetakan jalan keluar.',
  },
  {
    step: '4',
    title: 'Rangkuman Refleksi',
    desc: 'Dapatkan catatan kecil penyemangat dan langkah praktis yang bisa kamu bawa pulang.',
  },
];
