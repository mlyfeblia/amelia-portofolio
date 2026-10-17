import { describe, it, expect } from 'vitest';
import { AnonymousMessage, Booking, Article } from '@/types';

// Pure helper function matching AdminCounselingClient triage
export function sortCurhatForAdmin(messages: AnonymousMessage[]): AnonymousMessage[] {
  return [...messages].sort((a, b) => {
    const aUnanswered = !a.isAnswered && (!a.answer || a.answer.trim().length === 0);
    const bUnanswered = !b.isAnswered && (!b.answer || b.answer.trim().length === 0);

    if (aUnanswered && !bUnanswered) return -1;
    if (!aUnanswered && bUnanswered) return 1;

    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });
}

// Pure helper function matching AdminBookingsClient triage
const STATUS_PRIORITY: Record<string, number> = {
  menunggu: 1,
  terkonfirmasi: 2,
  selesai: 3,
  dibatalkan: 4,
};

export function sortBookingsForAdmin(bookings: Booking[]): Booking[] {
  return [...bookings].sort((a, b) => {
    const rankA = STATUS_PRIORITY[a.status] ?? 99;
    const rankB = STATUS_PRIORITY[b.status] ?? 99;
    if (rankA !== rankB) return rankA - rankB;

    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });
}

// Pure helper function matching AdminArticlesClient triage
export function sortArticlesForAdmin(articles: Article[], statusFilter: string = 'semua'): Article[] {
  return [...articles].sort((a, b) => {
    const aDraft = !(a.isPublished ?? true);
    const bDraft = !(b.isPublished ?? true);

    if (statusFilter === 'semua') {
      if (aDraft && !bDraft) return -1;
      if (!aDraft && bDraft) return 1;
    }

    const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return dateB - dateA;
  });
}

describe('Admin Priority Triage Architecture', () => {
  describe('Curhat Admin Triage', () => {
    const sampleCurhat: AnonymousMessage[] = [
      {
        id: 'c1',
        alias: 'Hamba Allah',
        category: 'Karier',
        message: 'Sudah dijawab kemarin',
        isAnswered: true,
        answer: 'Terima kasih telah berbagi...',
        isPublic: true,
        createdAt: '2026-10-15T10:00:00.000Z',
      },
      {
        id: 'c2',
        alias: 'Si Gelisah',
        category: 'Overthinking',
        message: 'Belum dijawab, butuh tanggapan segera',
        isAnswered: false,
        isPublic: true,
        createdAt: '2026-10-16T08:00:00.000Z',
      },
      {
        id: 'c3',
        alias: 'Penjelajah Malam',
        category: 'Keluarga',
        message: 'Curhat baru belum dijawab',
        isAnswered: false,
        isPublic: true,
        createdAt: '2026-10-16T12:00:00.000Z',
      },
      {
        id: 'c4',
        alias: 'Jiwa Tenang',
        category: 'Ibadah',
        message: 'Sudah dijawab tadi pagi',
        isAnswered: true,
        answer: 'Alhamdulillah tetap semangat...',
        isPublic: true,
        createdAt: '2026-10-16T09:00:00.000Z',
      },
    ];

    it('prioritizes unanswered curhat at the top sorted by newest createdAt', () => {
      const sorted = sortCurhatForAdmin(sampleCurhat);
      expect(sorted[0].id).toBe('c3'); // newest unanswered
      expect(sorted[1].id).toBe('c2'); // older unanswered
      expect(sorted[0].isAnswered).toBe(false);
      expect(sorted[1].isAnswered).toBe(false);
    });

    it('places answered curhat after all unanswered items', () => {
      const sorted = sortCurhatForAdmin(sampleCurhat);
      expect(sorted[2].id).toBe('c4'); // newest answered
      expect(sorted[3].id).toBe('c1'); // older answered
      expect(sorted[2].isAnswered).toBe(true);
      expect(sorted[3].isAnswered).toBe(true);
    });
  });

  describe('Bookings Admin Triage', () => {
    const sampleBookings: Booking[] = [
      {
        id: 'b1',
        name: 'Ahmad',
        email: 'ahmad@example.com',
        phone: '081234567890',
        date: '2026-10-20',
        timeSlot: '10:00',
        category: 'Karier, Kerja & Finansial',
        mode: 'online_meet',
        notes: '',
        status: 'selesai',
        code: 'BK-001',
        createdAt: '2026-10-10T10:00:00.000Z',
      },
      {
        id: 'b2',
        name: 'Budi',
        email: 'budi@example.com',
        phone: '081234567891',
        date: '2026-10-21',
        timeSlot: '11:00',
        category: 'Akademik, Skripsi & Perkuliahan',
        mode: 'online_chat',
        notes: '',
        status: 'menunggu',
        code: 'BK-002',
        createdAt: '2026-10-16T14:00:00.000Z',
      },
      {
        id: 'b3',
        name: 'Citra',
        email: 'citra@example.com',
        phone: '081234567892',
        date: '2026-10-22',
        timeSlot: '13:00',
        category: 'Manajemen Stres, Emosi & Burnout',
        mode: 'online_meet',
        notes: '',
        status: 'terkonfirmasi',
        code: 'BK-003',
        createdAt: '2026-10-15T09:00:00.000Z',
      },
      {
        id: 'b4',
        name: 'Dina',
        email: 'dina@example.com',
        phone: '081234567893',
        date: '2026-10-23',
        timeSlot: '15:00',
        category: 'Keluarga & Relasi Orang Tua',
        mode: 'tatap_muka_cirebon',
        notes: '',
        status: 'dibatalkan',
        code: 'BK-004',
        createdAt: '2026-10-14T08:00:00.000Z',
      },
      {
        id: 'b5',
        name: 'Eko',
        email: 'eko@example.com',
        phone: '081234567894',
        date: '2026-10-24',
        timeSlot: '16:00',
        category: 'Quarter-Life Crisis & Arah Hidup',
        mode: 'online_meet',
        notes: '',
        status: 'menunggu',
        code: 'BK-005',
        createdAt: '2026-10-16T16:00:00.000Z',
      },
    ];

    it('ranks bookings in action-first order: menunggu > terkonfirmasi > selesai > dibatalkan', () => {
      const sorted = sortBookingsForAdmin(sampleBookings);
      expect(sorted[0].id).toBe('b5'); // newest menunggu
      expect(sorted[1].id).toBe('b2'); // older menunggu
      expect(sorted[2].id).toBe('b3'); // terkonfirmasi
      expect(sorted[3].id).toBe('b1'); // selesai
      expect(sorted[4].id).toBe('b4'); // dibatalkan
    });
  });

  describe('Articles Admin Triage', () => {
    const sampleArticles: Article[] = [
      {
        id: 'a1',
        title: 'Artikel Tayang 1',
        slug: 'artikel-tayang-1',
        excerpt: 'Ringkasan',
        content: 'Konten',
        category: 'Kesehatan Mental Islami',
        tags: ['mindfulness'],
        publishedAt: '2026-10-10',
        readTime: '4 menit',
        isPublished: true,
      },
      {
        id: 'a2',
        title: 'Draft Artikel Baru',
        slug: 'draft-artikel-baru',
        excerpt: 'Ringkasan draft',
        content: 'Konten draft',
        category: 'Quarter-Life Crisis & Self Growth',
        tags: ['growth'],
        publishedAt: '2026-10-16',
        readTime: '3 menit',
        isPublished: false,
      },
      {
        id: 'a3',
        title: 'Artikel Tayang 2',
        slug: 'artikel-tayang-2',
        excerpt: 'Ringkasan',
        content: 'Konten',
        category: 'Kesehatan Mental Islami',
        tags: ['doa'],
        publishedAt: '2026-10-12',
        readTime: '5 menit',
        isPublished: true,
      },
    ];

    it('prioritizes unpublished drafts at the top in "semua" view', () => {
      const sorted = sortArticlesForAdmin(sampleArticles, 'semua');
      expect(sorted[0].id).toBe('a2');
      expect(sorted[0].isPublished).toBe(false);
      expect(sorted[1].id).toBe('a3'); // newer published
      expect(sorted[2].id).toBe('a1'); // older published
    });
  });
});
