import { ConsultationCategory, CounselingMode, BOOKING_CATEGORIES as CANONICAL_BOOKING_CATEGORIES } from '@/types';

/**
 * Strict server-side input validation and sanitization.
 * Prevents payload bloat, XSS injection, and malformed database records.
 */

export const BOOKING_CATEGORIES: readonly string[] = [
  ...CANONICAL_BOOKING_CATEGORIES,
  // Backwards compatibility for existing records
  'Akademik & Karier',
  'Krisis Identitas Diri & Quarter-Life Crisis',
  'Manajemen Stres & Kecemasan',
  'Hubungan Keluarga & Pra-Nikah',
  'Pengembangan Diri & Spiritual Islami',
] as const;

export const BOOKING_MODES: readonly CounselingMode[] = [
  'online_meet',
  'online_chat',
  'tatap_muka_cirebon',
] as const;

export type BookingCategory = ConsultationCategory;
export type BookingMode = CounselingMode;

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const PHONE_REGEX = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
const DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Strips dangerous HTML tags and control characters to prevent XSS.
 */
export function sanitizeString(input?: string): string {
  if (!input) return '';
  return input
    .replace(/<[^>]*>/g, '') // remove HTML tags
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // remove control chars
    .trim();
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ValidatedBookingInput {
  name: string;
  alias?: string;
  phone: string;
  email: string;
  category: ConsultationCategory;
  mode: CounselingMode;
  date: string;
  timeSlot: string;
  notes: string;
}

export function validateBookingInput(body: unknown): ValidationResult<ValidatedBookingInput> {
  if (!body || typeof body !== 'object') {
    return { success: false, error: 'Data permintaan tidak valid.' };
  }

  const b = body as Record<string, unknown>;

  // 1. Name
  const rawName = typeof b.name === 'string' ? sanitizeString(b.name) : '';
  if (!rawName || rawName.length < 2 || rawName.length > 100) {
    return { success: false, error: 'Nama lengkap wajib diisi (antara 2 hingga 100 karakter).' };
  }

  // 2. Alias
  const rawAlias = typeof b.alias === 'string' ? sanitizeString(b.alias) : '';
  if (rawAlias.length > 100) {
    return { success: false, error: 'Nama panggilan maksimal 100 karakter.' };
  }

  // 3. Phone
  const rawPhone = typeof b.phone === 'string' ? b.phone.trim().replace(/[\s-]/g, '') : '';
  if (!rawPhone || !PHONE_REGEX.test(rawPhone)) {
    return {
      success: false,
      error: 'Nomor WhatsApp tidak valid. Gunakan format Indonesia yang benar (contoh: 08123456789 atau +628123456789).',
    };
  }

  // 4. Email
  const rawEmail = typeof b.email === 'string' ? b.email.trim().toLowerCase() : '';
  if (!rawEmail || rawEmail.length > 100 || !EMAIL_REGEX.test(rawEmail)) {
    return { success: false, error: 'Alamat email tidak valid.' };
  }

  // 5. Category
  const rawCategory = typeof b.category === 'string' ? b.category.trim() : '';
  if (!BOOKING_CATEGORIES.includes(rawCategory as BookingCategory)) {
    return { success: false, error: 'Kategori topik konseling tidak valid.' };
  }

  // 6. Mode
  const rawMode = typeof b.mode === 'string' ? b.mode.trim().toLowerCase() : '';
  if (!BOOKING_MODES.includes(rawMode as BookingMode)) {
    return { success: false, error: 'Format sesi konseling tidak valid (pilih GMeet, Chat, atau Offline).' };
  }

  // 7. Date
  const rawDate = typeof b.date === 'string' ? b.date.trim() : '';
  if (!rawDate || !DATE_FORMAT_REGEX.test(rawDate)) {
    return { success: false, error: 'Format tanggal janji temu tidak valid (gunakan YYYY-MM-DD).' };
  }

  // Check date range (between today and +60 days)
  const bookingDate = new Date(`${rawDate}T00:00:00Z`);
  if (isNaN(bookingDate.getTime())) {
    return { success: false, error: 'Tanggal janji temu tidak valid.' };
  }

  const now = new Date();
  const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(now);
  const minDate = new Date(`${todayStr}T00:00:00Z`);
  const maxDate = new Date(minDate.getTime() + 65 * 24 * 60 * 60 * 1000);

  if (bookingDate < minDate) {
    return { success: false, error: 'Tanggal janji temu tidak boleh berada di masa lampau.' };
  }
  if (bookingDate > maxDate) {
    return { success: false, error: 'Tanggal janji temu maksimal 60 hari ke depan.' };
  }

  // 8. Time Slot
  const rawTimeSlot = typeof b.timeSlot === 'string' ? sanitizeString(b.timeSlot) : '';
  if (!rawTimeSlot || rawTimeSlot.length > 40) {
    return { success: false, error: 'Pilihan jam sesi konsultasi wajib dipilih.' };
  }

  // 9. Notes
  const rawNotes = typeof b.notes === 'string' ? sanitizeString(b.notes) : '';
  if (rawNotes.length > 500) {
    return { success: false, error: 'Catatan tambahan maksimal 500 karakter.' };
  }

  return {
    success: true,
    data: {
      name: rawName,
      alias: rawAlias || rawName,
      phone: rawPhone,
      email: rawEmail,
      category: rawCategory as BookingCategory,
      mode: rawMode as BookingMode,
      date: rawDate,
      timeSlot: rawTimeSlot,
      notes: rawNotes,
    },
  };
}

export interface ValidatedCurhatInput {
  alias: string;
  category: string;
  message: string;
  isPublic: boolean;
}

export function validateCurhatInput(body: unknown): ValidationResult<ValidatedCurhatInput> {
  if (!body || typeof body !== 'object') {
    return { success: false, error: 'Data cerita tidak valid.' };
  }

  const b = body as Record<string, unknown>;

  const rawAlias = typeof b.alias === 'string' ? sanitizeString(b.alias) : '';
  if (rawAlias.length > 50) {
    return { success: false, error: 'Nama samaran maksimal 50 karakter.' };
  }

  const rawCategory = typeof b.category === 'string' ? sanitizeString(b.category) : '';
  if (rawCategory.length > 50) {
    return { success: false, error: 'Kategori maksimal 50 karakter.' };
  }

  const rawMessage = typeof b.message === 'string' ? sanitizeString(b.message) : '';
  if (!rawMessage || rawMessage.length < 10) {
    return { success: false, error: 'Pesan cerita minimal 10 karakter agar dapat dipahami dengan baik.' };
  }
  if (rawMessage.length > 1500) {
    return { success: false, error: 'Pesan cerita maksimal 1500 karakter.' };
  }

  return {
    success: true,
    data: {
      alias: rawAlias || 'Hamba Allah',
      category: rawCategory || 'Kisah & Pertanyaan',
      message: rawMessage,
      isPublic: b.isPublic !== false, // default true
    },
  };
}

export interface ValidatedArticleUpdateInput {
  title?: string;
  slug?: string;
  category?: string;
  readTime?: string;
  excerpt?: string;
  content?: string;
  tags?: string[];
  isPublished?: boolean;
  showOnLandingPage?: boolean;
}

export function validateArticleUpdateInput(body: unknown): ValidationResult<ValidatedArticleUpdateInput> {
  if (!body || typeof body !== 'object') {
    return { success: false, error: 'Data artikel tidak valid.' };
  }

  const b = body as Record<string, unknown>;
  const result: ValidatedArticleUpdateInput = {};

  if (b.isPublished !== undefined) {
    if (typeof b.isPublished !== 'boolean') {
      return { success: false, error: 'Status publikasi harus bernilai boolean.' };
    }
    result.isPublished = b.isPublished;
  }

  if (b.showOnLandingPage !== undefined) {
    if (typeof b.showOnLandingPage !== 'boolean') {
      return { success: false, error: 'Status beranda harus bernilai boolean.' };
    }
    result.showOnLandingPage = b.showOnLandingPage;
  }

  if (b.title !== undefined) {
    if (typeof b.title !== 'string') return { success: false, error: 'Judul artikel harus berupa teks.' };
    const title = sanitizeString(b.title);
    if (!title || title.length < 3 || title.length > 250) {
      return { success: false, error: 'Judul artikel harus memiliki panjang antara 3 dan 250 karakter.' };
    }
    result.title = title;
  }

  if (b.slug !== undefined) {
    if (typeof b.slug !== 'string') return { success: false, error: 'Slug artikel harus berupa teks.' };
    const slug = b.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    if (!slug || slug.length < 3 || slug.length > 150) {
      return { success: false, error: 'Slug artikel harus memiliki panjang antara 3 dan 150 karakter alfanumerik.' };
    }
    result.slug = slug;
  }

  if (b.category !== undefined) {
    if (typeof b.category !== 'string') return { success: false, error: 'Kategori harus berupa teks.' };
    const category = sanitizeString(b.category);
    if (category.length > 100) {
      return { success: false, error: 'Kategori maksimal 100 karakter.' };
    }
    result.category = category;
  }

  if (b.readTime !== undefined) {
    if (typeof b.readTime !== 'string') return { success: false, error: 'Waktu baca harus berupa teks.' };
    const readTime = sanitizeString(b.readTime);
    if (readTime.length > 50) {
      return { success: false, error: 'Estimasi waktu baca maksimal 50 karakter.' };
    }
    result.readTime = readTime;
  }

  if (b.excerpt !== undefined) {
    if (typeof b.excerpt !== 'string') return { success: false, error: 'Ringkasan artikel harus berupa teks.' };
    const excerpt = sanitizeString(b.excerpt);
    if (excerpt.length > 1000) {
      return { success: false, error: 'Ringkasan artikel maksimal 1000 karakter.' };
    }
    result.excerpt = excerpt;
  }

  if (b.content !== undefined) {
    if (typeof b.content !== 'string') return { success: false, error: 'Isi artikel harus berupa teks.' };
    const content = b.content.trim();
    if (!content || content.length < 10) {
      return { success: false, error: 'Konten artikel minimal 10 karakter.' };
    }
    if (content.length > 100000) {
      return { success: false, error: 'Konten artikel melebihi batas maksimum (100.000 karakter).' };
    }
    result.content = content;
  }

  if (b.tags !== undefined) {
    if (!Array.isArray(b.tags)) {
      return { success: false, error: 'Format tags harus berupa array.' };
    }
    if (b.tags.length > 20) {
      return { success: false, error: 'Maksimal 20 tag diperbolehkan.' };
    }
    result.tags = b.tags
      .filter((t): t is string => typeof t === 'string')
      .map((t) => sanitizeString(t))
      .filter(Boolean)
      .slice(0, 20);
  }

  return { success: true, data: result };
}

export interface ValidatedArticleCreateInput {
  title: string;
  slug: string;
  category: string;
  readTime: string;
  excerpt: string;
  content: string;
  tags: string[];
  isPublished?: boolean;
  showOnLandingPage?: boolean;
}

export function validateArticleCreateInput(body: unknown): ValidationResult<ValidatedArticleCreateInput> {
  if (!body || typeof body !== 'object') {
    return { success: false, error: 'Data artikel tidak valid.' };
  }

  const b = body as Record<string, unknown>;

  // isPublished & showOnLandingPage
  const isPublished = typeof b.isPublished === 'boolean' ? b.isPublished : true;
  const showOnLandingPage = typeof b.showOnLandingPage === 'boolean' ? b.showOnLandingPage : false;

  // Title
  if (typeof b.title !== 'string') return { success: false, error: 'Judul artikel wajib diisi.' };
  const title = sanitizeString(b.title);
  if (!title || title.length < 3 || title.length > 250) {
    return { success: false, error: 'Judul artikel harus antara 3 dan 250 karakter.' };
  }

  // Slug
  let rawSlug = typeof b.slug === 'string' ? b.slug : '';
  if (!rawSlug.trim()) {
    rawSlug = title;
  }
  const slug = rawSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (!slug || slug.length < 3 || slug.length > 150) {
    return { success: false, error: 'Slug artikel tidak valid (antara 3 dan 150 karakter alfanumerik).' };
  }

  // Category
  const category = typeof b.category === 'string' && b.category.trim() ? sanitizeString(b.category) : 'Bimbingan Konseling Islam';
  if (!category || category.length > 100) {
    return { success: false, error: 'Kategori maksimal 100 karakter.' };
  }

  // Read Time
  const readTime = typeof b.readTime === 'string' && b.readTime.trim() ? sanitizeString(b.readTime) : '5 menit baca';

  // Excerpt
  if (typeof b.excerpt !== 'string') return { success: false, error: 'Ringkasan artikel wajib diisi.' };
  const excerpt = sanitizeString(b.excerpt);
  if (!excerpt || excerpt.length < 5 || excerpt.length > 1000) {
    return { success: false, error: 'Ringkasan artikel antara 5 dan 1000 karakter.' };
  }

  // Content
  if (typeof b.content !== 'string') return { success: false, error: 'Isi konten artikel wajib diisi.' };
  const content = b.content.trim();
  if (!content || content.length < 10) {
    return { success: false, error: 'Isi konten artikel minimal 10 karakter.' };
  }
  if (content.length > 100000) {
    return { success: false, error: 'Isi artikel melebihi batas maksimum (100.000 karakter).' };
  }

  // Tags
  let tags: string[] = [];
  if (Array.isArray(b.tags)) {
    tags = b.tags
      .filter((t): t is string => typeof t === 'string')
      .map((t) => sanitizeString(t))
      .filter(Boolean)
      .slice(0, 20);
  }

  return {
    success: true,
    data: {
      title,
      slug,
      category,
      readTime,
      excerpt,
      content,
      tags,
      isPublished,
      showOnLandingPage,
    },
  };
}

