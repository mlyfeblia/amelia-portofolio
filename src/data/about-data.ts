export interface WorkExperience {
  company: string;
  role: string;
  period: string;
  badge: string;
  highlights: string[];
}

export interface OrgExperience {
  org: string;
  role: string;
  period: string;
  highlights: string[];
}

export interface Education {
  institution: string;
  degree: string;
  period: string;
  desc: string;
}

export const workExperiences: WorkExperience[] = [
  {
    company: 'PT Sinar Kreasi Jaya (SKY Games Ciledug)',
    role: 'Kasir & Layanan Pelanggan',
    period: '2 Bulan',
    badge: 'Retail & Recreation',
    highlights: [
      'Mengelola dan menghitung transaksi keuangan harian secara presisi serta memastikan saldo kas akurat setiap tutup operasional.',
      'Menyusun laporan kas harian secara teratur dan rapi untuk manajemen toko.',
      'Mengoperasikan Microsoft Excel untuk pencatatan transaksi kasir dan pengelolaan data keuangan.',
      'Menerapkan komunikasi yang ramah dan solutif dalam menangani interaksi dengan ratusan pelanggan setiap hari.',
    ],
  },
  {
    company: 'Kedai SK Kupat Tahu',
    role: 'Staf Operasional Multitask (Kasir, Pelayan, & Logistik)',
    period: '2020 - Sekarang',
    badge: 'Operasional & Pelayanan',
    highlights: [
      'Menangani transaksi tunai dan non-tunai harian dengan tingkat akurasi tinggi dan penuh tanggung jawab.',
      'Melayani puluhan hingga ratusan pelanggan setiap hari dengan sikap sigap, sopan, dan hangat.',
      'Mengatur logistik pasokan bahan baku secara berkala demi kelancaran operasional kedai.',
      'Menyelesaikan keluhan pelanggan di lapangan dengan pendekatan yang tenang dan mencari solusi terbaik.',
    ],
  },
  {
    company: 'Usaha Kuliner Mandiri (Cireng Kuah Amelia)',
    role: 'Pemilik & Pengelola Operasional',
    period: '2023 - 2025',
    badge: 'Kewirausahaan Mandiri',
    highlights: [
      'Mengembangkan resep dan memproduksi kuliner secara higienis hingga berhasil menjangkau puluhan pelanggan setia.',
      'Menjaga standar kualitas bahan baku dan kebersihan pengemasan produk.',
      'Mengatur pengiriman pesanan langsung ke tangan konsumen tepat waktu.',
    ],
  },
];

export const orgExperiences: OrgExperience[] = [
  {
    org: 'Duta Inspirasi Indonesia (Batch 19)',
    role: 'Anggota Bidang Media & Content Creator',
    period: 'Desember 2025 - Februari 2026',
    highlights: [
      'Merancang dan memproduksi konten edukasi digital seputar motivasi dan kesehatan mental remaja.',
      'Membangun komunikasi publik yang interaktif dan ramah di media sosial.',
    ],
  },
  {
    org: 'Youth Parliamentary Cirebon',
    role: 'Fasilitator',
    period: 'Januari 2026',
    highlights: [
      'Memandu sesi diskusi kelompok generasi muda agar berjalan tertib, terbuka, dan menghasilkan gagasan solutif.',
    ],
  },
  {
    org: 'Duta Inisiatif Jawa Barat (Batch 12 & 13)',
    role: 'Duta Inisiatif (Batch 12) & Fasilitator (Batch 13)',
    period: 'Agustus 2025 - Januari 2026',
    highlights: [
      'Menginisiasi kegiatan edukasi sosial dan mendampingi pelatihan anggota baru tingkat regional Jawa Barat.',
    ],
  },
  {
    org: 'Ikatan Remaja Masjid (Iremas) Jami Al-Falah & Rohis',
    role: 'Wakil Ketua Iremas (2025 - Sekarang) & Wakil Ketua Rohis (2023 - 2024)',
    period: 'Januari 2023 - Sekarang',
    highlights: [
      'Memimpin koordinasi kepengurusan dan merancang agenda kebersamaan pemuda yang sarat nilai spiritual.',
    ],
  },
];

export const educations: Education[] = [
  {
    institution: 'UIN Siber Syekh Nurjati Cirebon',
    degree: 'S1 Bimbingan Konseling (Mahasiswi Aktif · Semester 3)',
    period: '2025 - Sekarang',
    desc: 'Mendalami konseling sebaya, psikologi perkembangan, cyber counseling, serta integrasi nilai empati Islami dalam pendampingan batin.',
  },
  {
    institution: 'MAN 4 Cirebon',
    degree: 'Jurusan Keagamaan',
    period: '2022 - 2025',
    desc: 'Memperkuat fondasi adab, nilai-nilai spiritualitas, serta kedisiplinan organisasi melalui amanah sebagai Wakil Ketua Rohis.',
  },
];

export const hardSkills: string[] = [
  'Microsoft Office (Word, Excel, PowerPoint)',
  'Operasional Kasir & POS System Retail',
  'Penyusunan Rekapitulasi Kas & Keuangan',
  'Pembuatan Konten Edukasi Digital',
  'Pengelolaan Logistik & Rantai Pasok',
];

export const softSkills: string[] = [
  'Komunikasi Interpersonal & Public Speaking',
  'Pelayanan Pelanggan (Customer Service) Ramah',
  'Empati Aktif & Pendengar yang Amanah',
  'Regulasi Emosi & Manajemen Tekanan',
  'Kerja Keras, Tepat Waktu, & Tanggung Jawab',
  'Kerja Sama Tim & Fasilitasi Kelompok',
];
