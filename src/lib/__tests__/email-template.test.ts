import { describe, it, expect } from 'vitest';
import {
  getAdminContactEmailContent,
  getAdminContactEmailUrl,
  getAdminContactGmailUrl,
} from '@/lib/email-template';

describe('Admin Email Contact Templates & Protocol URLs', () => {
  const sampleParams = {
    clientEmail: 'konseli.test@example.com',
    clientName: 'Siti Rahmawati',
    code: 'BK-2026-9921',
    date: '2026-10-22',
    slot: '09:00 - 10:00 WIB',
  };

  it('generates structured subject and body with all booking information', () => {
    const { subject, body } = getAdminContactEmailContent(sampleParams);

    expect(subject).toBe('Konfirmasi Jadwal Bimbingan Konseling Amelia [BK-2026-9921]');
    expect(body).toContain('Halo Siti Rahmawati,');
    expect(body).toContain('BK-2026-9921');
    expect(body).toContain('2026-10-22');
    expect(body).toContain('09:00 - 10:00 WIB');
    expect(body).toContain('Amelia (Amel)');
    expect(body).toContain('+62 822-1044-5785');
  });

  it('generates a valid mailto: URL with properly encoded query parameters', () => {
    const mailtoUrl = getAdminContactEmailUrl(sampleParams);

    expect(mailtoUrl.startsWith('mailto:konseli.test@example.com?')).toBe(true);
    expect(mailtoUrl).toContain('subject=');
    expect(mailtoUrl).toContain('body=');

    const urlParams = new URLSearchParams(mailtoUrl.replace(/^mailto:[^?]+\?/, ''));
    expect(urlParams.get('subject')).toBe('Konfirmasi Jadwal Bimbingan Konseling Amelia [BK-2026-9921]');
    expect(urlParams.get('body')).toContain('Halo Siti Rahmawati,');
  });

  it('generates a valid web Gmail compose URL with fs=1 and view=cm', () => {
    const gmailUrl = getAdminContactGmailUrl(sampleParams);

    expect(gmailUrl.startsWith('https://mail.google.com/mail/?')).toBe(true);
    const parsed = new URL(gmailUrl);
    expect(parsed.searchParams.get('view')).toBe('cm');
    expect(parsed.searchParams.get('fs')).toBe('1');
    expect(parsed.searchParams.get('to')).toBe('konseli.test@example.com');
    expect(parsed.searchParams.get('su')).toBe('Konfirmasi Jadwal Bimbingan Konseling Amelia [BK-2026-9921]');
    expect(parsed.searchParams.get('body')).toContain('Halo Siti Rahmawati,');
  });

  it('handles special characters in names and slots safely', () => {
    const paramsWithSpecialChars = {
      clientEmail: 'special+tag@domain.co.id',
      clientName: 'Ahmad & Nur "Keluarga"',
      code: 'BK-SPECIAL/01',
      date: '2026-11-01',
      slot: '13:00 & 14:00 (Sesi #2)',
    };

    const gmailUrl = getAdminContactGmailUrl(paramsWithSpecialChars);
    const parsed = new URL(gmailUrl);
    expect(parsed.searchParams.get('to')).toBe('special+tag@domain.co.id');
    expect(parsed.searchParams.get('su')).toContain('BK-SPECIAL/01');
    expect(parsed.searchParams.get('body')).toContain('Ahmad & Nur "Keluarga"');
  });
});
