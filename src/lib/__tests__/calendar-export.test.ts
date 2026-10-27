import { describe, it, expect } from 'vitest';
import {
  parseSessionTimes,
  formatIcsDate,
  generateIcsCalendar,
  getGoogleCalendarUrl,
  getLocationText,
} from '../calendar-export';

describe('calendar-export utility', () => {
  it('parses session times correctly for morning slot', () => {
    const { start, end } = parseSessionTimes('2026-11-05', '09:30 - 10:30 WIB (Pagi)');
    expect(start.toISOString()).toBe('2026-11-05T02:30:00.000Z');
    expect(end.toISOString()).toBe('2026-11-05T03:30:00.000Z');
  });

  it('parses session times correctly for evening slot', () => {
    const { start, end } = parseSessionTimes('2026-11-05', '19:30 - 20:30 WIB (Malam)');
    // 19:30 WIB is 12:30 UTC
    expect(start.toISOString()).toBe('2026-11-05T12:30:00.000Z');
    expect(end.toISOString()).toBe('2026-11-05T13:30:00.000Z');
  });

  it('provides safe fallback if slot format is irregular', () => {
    const { start, end } = parseSessionTimes('2026-11-05', 'Waktu Fleksibel');
    expect(start).toBeInstanceOf(Date);
    expect(end).toBeInstanceOf(Date);
    expect(end.getTime()).toBeGreaterThan(start.getTime());
  });

  it('formats dates into standard ICS UTC strings', () => {
    const d = new Date('2026-11-05T02:30:00.000Z');
    const formatted = formatIcsDate(d);
    expect(formatted).toBe('20261105T023000Z');
  });

  it('resolves location correctly based on mode', () => {
    expect(getLocationText('online_chat')).toContain('Chat WhatsApp');
    expect(getLocationText('online_meet')).toContain('Video Call via WhatsApp');
    expect(getLocationText('tatap_muka_cirebon')).toContain('UIN Siber Syekh Nurjati Cirebon');
  });

  it('generates valid iCalendar (.ics) event string', () => {
    const ics = generateIcsCalendar({
      code: 'BK-TEST99',
      category: 'Akademik & Perkuliahan',
      mode: 'online_meet',
      date: '2026-11-05',
      timeSlot: '09:30 - 10:30 WIB (Pagi)',
      notes: 'Ingin berdiskusi seputar skripsi',
    });

    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('UID:booking-BK-TEST99@amelia-agustina');
    expect(ics).toContain('SUMMARY:Sesi Konseling: Akademik & Perkuliahan - Amelia Agustina');
    expect(ics).toContain('DTSTART:20261105T023000Z');
    expect(ics).toContain('DTEND:20261105T033000Z');
    expect(ics).toContain('LOCATION:Video Call via WhatsApp (Amelia Agustina)');
    expect(ics).toContain('END:VEVENT');
    expect(ics).toContain('END:VCALENDAR');
  });

  it('generates a valid Google Calendar URL', () => {
    const url = getGoogleCalendarUrl({
      code: 'BK-TEST99',
      category: 'Karier & Masa Depan',
      mode: 'online_chat',
      date: '2026-11-05',
      timeSlot: '13:30 - 14:30 WIB (Siang)',
    });

    expect(url).toContain('https://calendar.google.com/calendar/render?action=TEMPLATE');
    expect(url).toContain('text=Sesi+Konseling%3A+Karier+%26+Masa+Depan+-+Amelia+Agustina');
    expect(url).toContain('dates=20261105T063000Z%2F20261105T073000Z');
  });
});
