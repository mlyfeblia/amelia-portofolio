import { describe, it, expect } from 'vitest';
import { resolveBookingCategory, BOOKING_CATEGORIES, DEFAULT_BOOKING_FORM } from '@/data/booking-data';
import { resolveCurhatCategory } from '@/components/counseling/CurhatForm';

describe('Booking Category Resolver Architecture', () => {
  it('resolves direct exact matches for all BOOKING_CATEGORIES', () => {
    BOOKING_CATEGORIES.forEach((cat) => {
      expect(resolveBookingCategory(cat)).toBe(cat);
    });
  });

  it('resolves case-insensitive and trimmed category strings', () => {
    expect(resolveBookingCategory('  kecemasan & overthinking  ')).toBe('Kecemasan & Overthinking');
    expect(resolveBookingCategory('MANAJEMEN STRES, EMOSI & BURNOUT')).toBe('Manajemen Stres, Emosi & Burnout');
  });

  it('accurately maps assessment result topics to valid booking categories', () => {
    // Pikiran
    expect(resolveBookingCategory('Kecemasan & Overthinking')).toBe('Kecemasan & Overthinking');
    expect(resolveBookingCategory('Kecemasan, Overthinking & Stress')).toBe('Kecemasan & Overthinking');
    // Emosi
    expect(resolveBookingCategory('Manajemen Stres, Emosi & Burnout')).toBe('Manajemen Stres, Emosi & Burnout');
    // Spiritual
    expect(resolveBookingCategory('Pengembangan Diri & Spiritual Islami')).toBe('Pengembangan Diri & Spiritual Islami');
    expect(resolveBookingCategory('Spiritualitas & Ketenangan Hati')).toBe('Pengembangan Diri & Spiritual Islami');
    // Sosial
    expect(resolveBookingCategory('Pertemanan, Sosial & People Pleaser')).toBe('Pertemanan, Sosial & People Pleaser');
    expect(resolveBookingCategory('Hubungan, Pertemanan & Batasan Diri')).toBe('Pertemanan, Sosial & People Pleaser');
  });

  it('accurately maps article categories to valid booking categories', () => {
    expect(resolveBookingCategory('Kesehatan Mental Islami')).toBe('Pengembangan Diri & Spiritual Islami');
    expect(resolveBookingCategory('Manajemen Emosi & Overthinking')).toBe('Kecemasan & Overthinking');
    expect(resolveBookingCategory('Hubungan, Pertemanan & Pasangan')).toBe('Percintaan, Pasangan & Patah Hati');
    expect(resolveBookingCategory('Akademik, Karier & Produktivitas')).toBe('Akademik, Skripsi & Perkuliahan');
    expect(resolveBookingCategory('Quarter-Life Crisis & Self Growth')).toBe('Quarter-Life Crisis & Arah Hidup');
  });

  it('accurately maps curhat categories and services query slugs to valid booking categories', () => {
    expect(resolveBookingCategory('Keluarga & Rumah')).toBe('Keluarga & Relasi Orang Tua');
    expect(resolveBookingCategory('Percintaan & Pasangan')).toBe('Percintaan, Pasangan & Patah Hati');
    expect(resolveBookingCategory('Karier, Kerja & Finansial')).toBe('Perencanaan Karier & Dunia Kerja');
    expect(resolveBookingCategory('Spiritualitas & Ibadah')).toBe('Pengembangan Diri & Spiritual Islami');
    expect(resolveBookingCategory('cyber')).toBe('Konsultasi Bebas & Topik Lainnya');
    expect(resolveBookingCategory('edukasi')).toBe('Konsultasi Bebas & Topik Lainnya');
    expect(resolveBookingCategory('sebaya')).toBe('Konsultasi Bebas & Topik Lainnya');
    expect(resolveBookingCategory('bebas')).toBe('Konsultasi Bebas & Topik Lainnya');
  });

  it('resolves curhat categories from URL query parameters and article topics', () => {
    expect(resolveCurhatCategory('emosi')).toBe('Kesehatan Mental & Emosi');
    expect(resolveCurhatCategory('spiritual')).toBe('Spiritualitas & Ibadah');
    expect(resolveCurhatCategory('akademik')).toBe('Akademik, Skripsi & Kuliah');
    expect(resolveCurhatCategory('relasi')).toBe('Pertemanan & Sosial');
    expect(resolveCurhatCategory('bebas')).toBe('Kisah Bebas & Lainnya');
  });

  it('gracefully falls back to default booking category on empty or unrecognized input', () => {
    expect(resolveBookingCategory('')).toBe(DEFAULT_BOOKING_FORM.category);
    expect(resolveBookingCategory(null)).toBe(DEFAULT_BOOKING_FORM.category);
    expect(resolveBookingCategory(undefined)).toBe(DEFAULT_BOOKING_FORM.category);
    expect(resolveBookingCategory('xyz-unknown-topic')).toBe(DEFAULT_BOOKING_FORM.category);
  });
});
