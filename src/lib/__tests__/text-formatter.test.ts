import { describe, it, expect } from 'vitest';
import {
  formatIndonesianTitleCase,
  formatPersonName,
  formatSentenceCase,
} from '../text-formatter';

describe('Text Formatter Unit Test Suite (PUEBI/EYD)', () => {
  describe('formatIndonesianTitleCase', () => {
    it('capitalizes standard words correctly', () => {
      expect(formatIndonesianTitleCase('panduan konseling islami')).toBe('Panduan Konseling Islami');
    });

    it('keeps kata tugas lowercase in the middle of title', () => {
      expect(formatIndonesianTitleCase('merawat hati dan jiwa di era modern')).toBe('Merawat Hati dan Jiwa di Era Modern');
      expect(formatIndonesianTitleCase('berdamai dengan diri sendiri untuk masa depan')).toBe('Berdamai dengan Diri Sendiri untuk Masa Depan');
    });

    it('capitalizes kata tugas if it is the first word', () => {
      expect(formatIndonesianTitleCase('di balik senyuman seorang mahasiswa')).toBe('Di Balik Senyuman Seorang Mahasiswa');
      expect(formatIndonesianTitleCase('tentang ketenangan jiwa')).toBe('Tentang Ketenangan Jiwa');
    });

    it('capitalizes kata tugas immediately after punctuation (colon, dash)', () => {
      expect(formatIndonesianTitleCase('konseling sebaya: di mana kita memulai')).toBe('Konseling Sebaya: Di Mana Kita Memulai');
    });

    it('preserves recognized acronyms in uppercase (CBT, BKI, PWA, AI)', () => {
      expect(formatIndonesianTitleCase('penerapan cbt dan bki dalam bimbingan')).toBe('Penerapan CBT dan BKI dalam Bimbingan');
      expect(formatIndonesianTitleCase('pemanfaatan pwa dan ai untuk kesehatan mental')).toBe('Pemanfaatan PWA dan AI untuk Kesehatan Mental');
    });
  });

  describe('formatPersonName', () => {
    it('formats plain person names into title case', () => {
      expect(formatPersonName('amelia rahmawati')).toBe('Amelia Rahmawati');
      expect(formatPersonName('MUHAMMAD HAJATUR RACHMAN')).toBe('Muhammad Hajatur Rachman');
    });

    it('preserves academic titles and degrees properly', () => {
      expect(formatPersonName('nur amelia, s.sos')).toBe('Nur Amelia, S.Sos.');
      expect(formatPersonName('dr. ahmad dahlan, m.pd')).toBe('dr. Ahmad Dahlan, M.Pd.');
    });

    it('handles honorific prefixes like Kak and Ustazah', () => {
      expect(formatPersonName('kak amel')).toBe('Kak Amel');
    });

    it('does not inject premature periods on partial prefix tokens during live typing', () => {
      expect(formatPersonName('dr')).toBe('Dr');
      expect(formatPersonName('drupadi')).toBe('Drupadi');
      expect(formatPersonName('prof')).toBe('Prof');
      expect(formatPersonName('dr ahmad')).toBe('Dr. Ahmad');
      expect(formatPersonName('dr. ahmad')).toBe('dr. Ahmad');
      expect(formatPersonName('prof. budi')).toBe('Prof. Budi');
    });
  });

  describe('formatSentenceCase', () => {
    it('capitalizes the start of each sentence', () => {
      const input = 'selamat pagi semuanya. semoga harimu menyenangkan! mari kita belajar.';
      const output = 'Selamat pagi semuanya. Semoga harimu menyenangkan! Mari kita belajar.';
      expect(formatSentenceCase(input)).toBe(output);
    });

    it('formats mixed-case sentences correctly', () => {
      expect(formatSentenceCase('halo dunia. apa kabar?')).toBe('Halo dunia. Apa kabar?');
    });
  });
});
