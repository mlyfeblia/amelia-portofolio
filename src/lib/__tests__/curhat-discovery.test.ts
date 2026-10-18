import { describe, it, expect } from 'vitest';
import { seededShuffle } from '@/lib/seeded-random';
import { AnonymousMessage } from '@/types';

describe('Public Curhat Discovery & Sorting Rules', () => {
  const sampleMessages: AnonymousMessage[] = [
    {
      id: '1',
      alias: 'Bunga',
      message: 'Belum dijawab satu',
      category: 'Akademik, Karier & Produktivitas',
      isPublic: true,
      isAnswered: false,
      createdAt: '2026-10-15T10:00:00.000Z',
    },
    {
      id: '2',
      alias: 'Langit',
      message: 'Sudah dijawab satu',
      category: 'Akademik, Karier & Produktivitas',
      isPublic: true,
      isAnswered: true,
      answer: 'Tanggapan bijak amel...',
      createdAt: '2026-10-14T10:00:00.000Z',
    },
    {
      id: '3',
      alias: 'Bintang',
      message: 'Sudah dijawab dua',
      category: 'Kesehatan Mental Islami',
      isPublic: true,
      isAnswered: true,
      answer: 'Tanggapan kedua...',
      createdAt: '2026-10-13T10:00:00.000Z',
    },
    {
      id: '4',
      alias: 'Senja',
      message: 'Belum dijawab dua',
      category: 'Kesehatan Mental Islami',
      isPublic: true,
      isAnswered: false,
      createdAt: '2026-10-16T10:00:00.000Z',
    },
  ];

  it('partitions curhat so answered messages are placed first, and unanswered messages are placed last', () => {
    const answered = sampleMessages.filter((m) => m.isAnswered);
    const unanswered = sampleMessages.filter((m) => !m.isAnswered);

    expect(answered.length).toBe(2);
    expect(unanswered.length).toBe(2);

    const shuffledAnswered = seededShuffle(answered, 'seed-session-1');
    const result = [...shuffledAnswered, ...unanswered];

    // First two must be answered
    expect(result[0].isAnswered).toBe(true);
    expect(result[1].isAnswered).toBe(true);

    // Last two must be unanswered
    expect(result[2].isAnswered).toBe(false);
    expect(result[3].isAnswered).toBe(false);
  });

  it('seeded shuffle produces consistent order across pagination in same session', () => {
    const answered = sampleMessages.filter((m) => m.isAnswered);
    const run1 = seededShuffle(answered, 'same-session-key');
    const run2 = seededShuffle(answered, 'same-session-key');

    expect(run1).toEqual(run2);
  });

  it('fresh visit seed on re-entering page yields different discovery permutations', () => {
    const answered = [
      { id: '1', alias: 'A' },
      { id: '2', alias: 'B' },
      { id: '3', alias: 'C' },
      { id: '4', alias: 'D' },
      { id: '5', alias: 'E' },
    ];

    const visit1 = seededShuffle(answered, 'visit_seed_1');
    const visit2 = seededShuffle(answered, 'visit_seed_2');

    expect(visit1.length).toBe(answered.length);
    expect(visit2.length).toBe(answered.length);
    expect(visit1).not.toEqual(visit2);
  });

  it('guarantees deterministic chronological partition without client-side shuffle flicker', () => {
    const list: AnonymousMessage[] = [
      { id: '1', alias: 'A', message: 'msg1', isPublic: true, isAnswered: false, category: 'Akademik', createdAt: '2026-10-10' },
      { id: '2', alias: 'B', message: 'msg2', isPublic: true, isAnswered: true, answer: 'ans2', category: 'Akademik', createdAt: '2026-10-12' },
      { id: '3', alias: 'C', message: 'msg3', isPublic: true, isAnswered: true, answer: 'ans3', category: 'Akademik', createdAt: '2026-10-11' },
      { id: '4', alias: 'D', message: 'msg4', isPublic: true, isAnswered: false, category: 'Akademik', createdAt: '2026-10-09' },
    ];

    const answered = list.filter((m) => m.isAnswered);
    const unanswered = list.filter((m) => !m.isAnswered);
    const result = [...answered, ...unanswered];

    // Answered first, unanswered last, each maintaining exact deterministic order
    expect(result.map((m) => m.id)).toEqual(['2', '3', '1', '4']);
  });
});
