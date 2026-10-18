import { describe, it, expect } from 'vitest';
import {
  sanitizeString,
  validateBookingInput,
  validateCurhatInput,
  validateArticleCreateInput,
  validateArticleUpdateInput,
} from '../validators';

describe('Validators Unit Test Suite', () => {
  describe('sanitizeString', () => {
    it('strips HTML tags and script injections', () => {
      const malicious = '<script>alert("xss")</script>Hello <b>World</b>';
      expect(sanitizeString(malicious)).toBe('alert("xss")Hello World');
    });

    it('strips non-printable control characters', () => {
      const dirty = 'Safe\x00String\x08With\x1FChars';
      expect(sanitizeString(dirty)).toBe('SafeStringWithChars');
    });

    it('handles empty, undefined, or whitespace-only inputs', () => {
      expect(sanitizeString('')).toBe('');
      expect(sanitizeString(undefined)).toBe('');
      expect(sanitizeString('   ')).toBe('');
    });
  });

  describe('validateBookingInput', () => {
    const validBooking = {
      name: 'Fulan bin Fulan',
      alias: 'Fulan',
      phone: '081234567890',
      email: 'fulan@example.com',
      category: 'Manajemen Stres, Emosi & Burnout',
      mode: 'online_meet',
      date: '2026-10-20',
      timeSlot: '14:00 - 15:00 WIB',
      notes: 'Ingin konsultasi seputar stres kuliah.',
    };

    it('validates a correct booking payload', () => {
      const res = validateBookingInput(validBooking);
      expect(res.success).toBe(true);
      expect(res.data?.name).toBe('Fulan bin Fulan');
      expect(res.data?.email).toBe('fulan@example.com');
      expect(res.data?.phone).toBe('081234567890');
    });

    it('rejects an invalid email format', () => {
      const res = validateBookingInput({ ...validBooking, email: 'not-an-email' });
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/email/i);
    });

    it('rejects an invalid Indonesian phone number', () => {
      const res = validateBookingInput({ ...validBooking, phone: '12345' });
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/nomor whatsapp/i);
    });

    it('enforces 9 to 13 digits for Indonesian phone numbers', () => {
      // 9 digits (valid min)
      const res9 = validateBookingInput({ ...validBooking, phone: '081234567' });
      expect(res9.success).toBe(true);

      // 12 digits (standard)
      const res12 = validateBookingInput({ ...validBooking, phone: '0812-3456-7890' });
      expect(res12.success).toBe(true);

      // 13 digits (valid max)
      const res13 = validateBookingInput({ ...validBooking, phone: '0812345678901' });
      expect(res13.success).toBe(true);

      // 8 digits (too short, under 9)
      const res8 = validateBookingInput({ ...validBooking, phone: '08123456' });
      expect(res8.success).toBe(false);

      // 14 digits (too long, over 13)
      const res14 = validateBookingInput({ ...validBooking, phone: '08123456789012' });
      expect(res14.success).toBe(false);
    });

    it('sanitizes XSS injection in notes and name', () => {
      const dirtyBooking = {
        ...validBooking,
        name: 'Fulan <script>hack()</script>',
        notes: 'Catatan <img src=x onerror=alert(1)> aman',
      };
      const res = validateBookingInput(dirtyBooking);
      expect(res.success).toBe(true);
      expect(res.data?.name).toBe('Fulan hack()');
      expect(res.data?.notes).toBe('Catatan  aman');
    });

    it('rejects an unknown counseling category', () => {
      const res = validateBookingInput({ ...validBooking, category: 'Kategori Palsu' });
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/kategori/i);
    });
  });

  describe('validateCurhatInput', () => {
    it('accepts valid curhat message', () => {
      const res = validateCurhatInput({
        alias: 'Hamba Allah',
        category: 'Kesehatan Mental & Emosi',
        message: 'Saya sering merasa cemas saat memikirkan masa depan setelah wisuda.',
        isPublic: true,
      });
      expect(res.success).toBe(true);
      expect(res.data?.alias).toBe('Hamba Allah');
      expect(res.data?.isPublic).toBe(true);
    });

    it('rejects curhat message that is too short', () => {
      const res = validateCurhatInput({
        alias: 'Anon',
        category: 'Kesehatan Mental & Emosi',
        message: 'Pendek',
      });
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/minimal/i);
    });
  });

  describe('validateArticleCreateInput & Update', () => {
    it('validates a proper article creation payload', () => {
      const payload = {
        slug: 'merawat-kesehatan-mental-di-era-digital',
        title: 'Merawat Kesehatan Mental di Era Digital',
        excerpt: 'Panduan menjaga ketenangan batin di tengah riuhnya arus informasi media sosial.',
        content: '# Ketenangan Batin\n\nIsi artikel mendalam tentang mindfulness Islami.',
        category: 'Kesehatan Mental Islami',
        readTime: '4 menit baca',
        tags: ['Mental Health', 'Islam', 'Mindfulness'],
        isPublished: true,
      };
      const res = validateArticleCreateInput(payload);
      expect(res.success).toBe(true);
      expect(res.data?.slug).toBe('merawat-kesehatan-mental-di-era-digital');
    });

    it('rejects article creation with missing title', () => {
      const res = validateArticleCreateInput({
        excerpt: 'Excerpt only',
        content: 'Content only',
      });
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/judul/i);
    });

    it('validates partial article update', () => {
      const res = validateArticleUpdateInput({
        title: 'Judul Baru yang Diperbarui',
        isPublished: false,
      });
      expect(res.success).toBe(true);
      expect(res.data?.title).toBe('Judul Baru yang Diperbarui');
      expect(res.data?.isPublished).toBe(false);
    });

    it('rejects unsafe coverImage protocols (javascript:, http://) while allowing https:// and /images/', () => {
      const badJs = validateArticleUpdateInput({
        coverImage: 'javascript:alert(1)',
      });
      expect(badJs.success).toBe(false);

      const badHttp = validateArticleUpdateInput({
        coverImage: 'http://insecure.example.com/photo.jpg',
      });
      expect(badHttp.success).toBe(false);

      const goodInternal = validateArticleUpdateInput({
        coverImage: '/images/articles/sample.webp',
      });
      expect(goodInternal.success).toBe(true);
      expect(goodInternal.data?.coverImage).toBe('/images/articles/sample.webp');

      const goodHttps = validateArticleUpdateInput({
        coverImage: 'https://y8ug7mrt.ap-southeast.insforge.app/storage/v1/articles/test.webp',
      });
      expect(goodHttps.success).toBe(true);
    });

    it('enforces showOnLandingPage=false when isPublished=false', () => {
      const res = validateArticleUpdateInput({
        isPublished: false,
        showOnLandingPage: true,
      });
      expect(res.success).toBe(true);
      expect(res.data?.isPublished).toBe(false);
      expect(res.data?.showOnLandingPage).toBe(false);
    });
  });

  describe('formatIndoPhoneNumber', () => {
    // Dynamically test the helper
    it('formats phone numbers into 0812-3456-7890 standard masking', async () => {
      const { formatIndoPhoneNumber } = await import('@/components/booking/BookingClientInfoStep');
      expect(formatIndoPhoneNumber('')).toBe('');
      expect(formatIndoPhoneNumber('08')).toBe('08');
      expect(formatIndoPhoneNumber('0812')).toBe('0812');
      expect(formatIndoPhoneNumber('08123456')).toBe('0812-3456');
      expect(formatIndoPhoneNumber('081234567890')).toBe('0812-3456-7890');
      expect(formatIndoPhoneNumber('6281234567890')).toBe('0812-3456-7890');
      expect(formatIndoPhoneNumber('0812345678901234')).toBe('0812-3456-78901'); // max 13 digits
    });
  });
});
