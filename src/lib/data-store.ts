import { db } from '@/db';
import { articles, bookings, curhat } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { Booking, AnonymousMessage, Article } from '@/types';

// Fallback articles in case of offline/build-time isolation
const fallbackArticles: Article[] = [
  {
    id: 'art-1',
    slug: 'menemukan-thumaninah-di-era-digital',
    title: "Menemukan Ketenangan Jiwa (Thuma'ninah) di Tengah Riuhnya Notifikasi Digital",
    excerpt: "Di zaman serba cepat dan hiperkonektivitas, hati manusia rentan mengalami disonansi batin. Bagaimana konsep Thuma'ninah dalam Islam menjadi jangkar ketenangan mental mahasiswa siber?",
    content: `
Kecemasan modern sering kali bukan berakar dari kekurangan informasi, melainkan kelimpahan stimuli yang gagal kita saring. Mahasiswa dan generasi muda hari ini hidup di persimpangan dua dunia: tuntutan akademis yang dinamis dan arus perbandingan sosial di media maya.

### Hakikat Thuma'ninah dalam Perspektif Psikologi Islam
Dalam literatur Islam, khususnya pandangan Imam Al-Ghazali dalam *Ihya' 'Ulumuddin*, hati (qalb) memiliki sifat berbolak-balik. Thuma'ninah adalah kondisi di mana hati telah melampaui fase keraguan (*syakk*) dan gejolak (*idhthirab*), lalu berlabuh dalam kepasrahan yang sadar kepada Allah Swt.

Ketika kita menarik napas dalam konseling, kita tidak hanya mengidentifikasi distorsi kognitif (pikiran otomatis negatif), tetapi juga menghubungkan kembali jiwa dengan Dzat Yang Maha Mengatur. 

### Tiga Langkah Membangun Jangkar Hening
1. **Digital Fasting Terukur (Shoum Media)**: Mengalokasikan 30-60 menit sebelum tidur tanpa paparan layar biru, menggantinya dengan dzikir petang atau muhasabah harian.
2. **Nafas Sadar & Tafakkur**: Saat kecemasan melonjak, ambil jeda 5 detik. Akui perasaan tanpa menghakiminya, lalu ingat ayat: *"Alaa bidzikrillahi tathma'innul qulub"* (Ingatlah, hanya dengan mengingat Allah hati menjadi tenang - QS. Ar-Ra'd: 28).
3. **Menerima Ketidaksempurnaan Diri (Tawadhu' & Self-Compassion)**: Berhenti menuntut diri menjadi sempurna di mata algoritma. Cukup hadir secara utuh bagi proses belajar hari ini.
    `,
    category: 'Kesehatan Mental Islami',
    readTime: '4 menit baca',
    publishedAt: '24 September 2026',
    tags: ["Thuma'ninah", 'Cyber Well-being', 'Tazkiyatun Nafs', 'BKI']
  },
  {
    id: 'art-2',
    slug: 'integrasi-cbt-dan-tazkiyatun-nafs',
    title: 'Ketika Logika CBT Bertemu Kesucian Jiwa: Integrasi Terapi Kognitif & Tazkiyatun Nafs',
    excerpt: 'Membedah bagaimana restrukturisasi kognitif (CBT) dan pembersihan kalbu saling melengkapi dalam mengurai depresi ringan, luka batin masa lalu, dan kecemasan masa depan.',
    content: `
Bimbingan Konseling Islam (BKI) bukan sekadar menasehati orang yang sedang terpuruk dengan ayat-ayat normatif. Sebagai calon konselor di era modern, kita memadukan kehangatan metodologis psikologi modern dengan kedalaman metafisika Islam.

### Titik Temu CBT dan Konsep Pikiran dalam Islam
Cognitive Behavioral Therapy (CBT) mengajarkan bahwa bukan situasi yang membuat seseorang menderita, melainkan cara pandang (*cognitive appraisal*) terhadap peristiwa tersebut. 

Dalam Islam, hal ini beririsan langsung dengan konsep **Husnudzon** (berprasangka baik) dan melawan **Khawathir as-Su'** (bisikan pikiran negatif destruktif). Ketika seorang konseli menganggap dirinya 'tidak berharga karena gagal satu ujian', konseling Islam membantu mendongkel distorsi itu:
- Meninjau bukti riil (metode CBT).
- Menemukan kembali kehormatan eksistensial manusia sebagai *khalifatullah fil ardh* yang dinilai dari usahanya, bukan sekadar hasil fana.

### Ruang Konseling sebagai Tempat Aman
Konseli tidak membutuhkan hakim, mereka membutuhkan saksi yang mendengarkan dengan penuh penerimaan. Pendekatan konseling yang saya terapkan mengedepankan prinsip: dengarkan terlebih dahulu hingga air mata tuntas, baru kemudian menyulam harapan bersama.
    `,
    category: 'Kajian Konseling',
    readTime: '5 menit baca',
    publishedAt: '18 September 2026',
    tags: ['CBT', 'Tazkiyatun Nafs', 'Metodologi Konseling', 'UIN Siber']
  },
  {
    id: 'art-3',
    slug: 'etika-cyber-counseling-mahasiswa',
    title: 'Cyber Counseling: Menjaga Kerahasiaan Klien di Ruang Konsultasi Tanpa Batas',
    excerpt: 'Keunggulan kuliah di UIN Siber Syekh Nurjati Cirebon membuka ruang luas bagi layanan konseling daring. Namun, bagaimana etika dan kehangatan empati tetap terjaga lewat layar?',
    content: `
Sebagai mahasiswi BKI di lingkungan kampus berbasis siber, saya menyaksikan langsung pergeseran cara generasi Z mencari bantuan psikologis. Konseli kerap merasa lebih berani menumpahkan isi hatinya lewat pesan tertulis atau sesi virtual daripada harus duduk berhadap-hadapan di ruangan formal.

### Mengapa Cyber Counseling Begitu Efektif?
- **Menurunkan Hambatan Stigma**: Banyak orang enggan mendatangi ruang konseling fisik karena takut dicap 'lemah' atau 'bermasalah'. Layanan siber memberikan ruang aman bergradasi.
- **Aksesibilitas Geografis**: Seseorang dari pelosok Cirebon, Indramayu, Majalengka, Kuningan (Ciayumajakuning) bahkan luar pulau dapat mengakses bimbingan konselor yang tepat.
- **Dokumentasi Reflektif**: Komunikasi tertulis memungkinkan konseli membaca kembali kalimat penguatan dan rencana aksi yang telah disepakati bersama.

Kuncinya tetap satu: etika kerahasiaan (*confidentiality*) dan keikhlasan niat untuk menjadi pendengar yang amanah.
    `,
    category: 'Cyber Counseling',
    readTime: '3 menit baca',
    publishedAt: '10 September 2026',
    tags: ['Cyber Counseling', 'Etika Konseling', 'UINSSC', 'Generasi Digital']
  }
];

// Bookings
export async function getBookings(): Promise<Booking[]> {
  try {
    const rows = await db.select().from(bookings).orderBy(desc(bookings.createdAt));
    return rows.map((r) => ({
      ...r,
      alias: r.alias ?? undefined,
      notes: r.notes ?? '',
    })) as Booking[];
  } catch (error) {
    console.error('Error in getBookings:', error);
    return [];
  }
}

export async function createBooking(
  data: Omit<Booking, 'id' | 'code' | 'createdAt' | 'status'>
): Promise<Booking> {
  const dateStr = new Date().toISOString().slice(2, 7).replace('-', '');
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const code = `BKI-${dateStr}-${randomSuffix}`;
  const id = `bk-${Date.now()}`;
  const createdAt = new Date().toISOString();

  const [newRow] = await db
    .insert(bookings)
    .values({
      id,
      code,
      name: data.name,
      alias: data.alias || null,
      phone: data.phone,
      email: data.email,
      category: data.category,
      mode: data.mode,
      date: data.date,
      timeSlot: data.timeSlot,
      notes: data.notes || '',
      status: 'menunggu',
      createdAt,
    })
    .returning();

  return {
    ...newRow,
    alias: newRow.alias ?? undefined,
    notes: newRow.notes ?? '',
  } as Booking;
}

export async function updateBookingStatus(
  id: string,
  status: Booking['status']
): Promise<Booking | null> {
  try {
    const [updated] = await db
      .update(bookings)
      .set({ status })
      .where(eq(bookings.id, id))
      .returning();

    if (!updated) return null;
    return {
      ...updated,
      alias: updated.alias ?? undefined,
      notes: updated.notes ?? '',
    } as Booking;
  } catch (error) {
    console.error('Error in updateBookingStatus:', error);
    return null;
  }
}

// Curhat / Anonymous Q&A
export async function getCurhatList(): Promise<AnonymousMessage[]> {
  try {
    const rows = await db.select().from(curhat).orderBy(desc(curhat.createdAt));
    return rows.map((r) => ({
      ...r,
      answer: r.answer ?? undefined,
      answeredAt: r.answeredAt ?? undefined,
    })) as AnonymousMessage[];
  } catch (error) {
    console.error('Error in getCurhatList:', error);
    return [];
  }
}

export async function createCurhat(data: {
  alias: string;
  category: string;
  message: string;
  isPublic: boolean;
}): Promise<AnonymousMessage> {
  const id = `cur-${Date.now()}`;
  const createdAt = new Date().toISOString();

  const [newRow] = await db
    .insert(curhat)
    .values({
      id,
      alias: data.alias || 'Teman Curhat',
      category: data.category || 'Umum',
      message: data.message,
      isAnswered: false,
      isPublic: data.isPublic,
      createdAt,
    })
    .returning();

  return {
    ...newRow,
    answer: newRow.answer ?? undefined,
    answeredAt: newRow.answeredAt ?? undefined,
  } as AnonymousMessage;
}

export async function answerCurhat(
  id: string,
  answer: string,
  isPublic?: boolean
): Promise<AnonymousMessage | null> {
  try {
    const updateData: Partial<typeof curhat.$inferInsert> = {
      answer,
      isAnswered: true,
      answeredAt: new Date().toISOString(),
    };

    if (typeof isPublic === 'boolean') {
      updateData.isPublic = isPublic;
    }

    const [updated] = await db
      .update(curhat)
      .set(updateData)
      .where(eq(curhat.id, id))
      .returning();

    if (!updated) return null;
    return {
      ...updated,
      answer: updated.answer ?? undefined,
      answeredAt: updated.answeredAt ?? undefined,
    } as AnonymousMessage;
  } catch (error) {
    console.error('Error in answerCurhat:', error);
    return null;
  }
}

// Articles
export async function getArticles(): Promise<Article[]> {
  try {
    const rows = await db.select().from(articles);
    if (!rows || rows.length === 0) {
      return fallbackArticles;
    }
    return rows.map((r) => ({
      ...r,
      tags: Array.isArray(r.tags) ? r.tags : [],
    })) as Article[];
  } catch (error) {
    console.error('Error in getArticles, falling back to local list:', error);
    return fallbackArticles;
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const [row] = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
    if (!row) {
      return fallbackArticles.find((a) => a.slug === slug) || null;
    }
    return {
      ...row,
      tags: Array.isArray(row.tags) ? row.tags : [],
    } as Article;
  } catch (error) {
    console.error('Error in getArticleBySlug, using fallback list:', error);
    return fallbackArticles.find((a) => a.slug === slug) || null;
  }
}
