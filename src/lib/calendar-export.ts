/**
 * Calendar Export Utility (iCalendar .ics and Google Calendar link)
 * Enables clients and counselors to add sessions to their calendar,
 * significantly reducing no-show rates.
 */

import { CounselingMode } from '@/types';

export interface CalendarEventParams {
  code: string;
  name?: string;
  category?: string;
  mode?: CounselingMode | string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "09:30 - 10:30 WIB (Pagi)"
  notes?: string;
}

export function parseSessionTimes(dateStr: string, timeSlot: string): { start: Date; end: Date } {
  // Expected timeSlot format: "09:30 - 10:30 WIB (...)" or "HH:mm - HH:mm"
  const match = timeSlot.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  
  // Clean dateStr to YYYY-MM-DD
  const cleanDate = dateStr.slice(0, 10);

  if (match) {
    const [, sH, sM, eH, eM] = match;
    const startIso = `${cleanDate}T${sH.padStart(2, '0')}:${sM}:00+07:00`;
    const endIso = `${cleanDate}T${eH.padStart(2, '0')}:${eM}:00+07:00`;
    const start = new Date(startIso);
    const end = new Date(endIso);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      return { start, end };
    }
  }

  // Fallback: 09:00 to 10:00 WIB
  const fallbackStart = new Date(`${cleanDate}T09:00:00+07:00`);
  const fallbackEnd = new Date(`${cleanDate}T10:00:00+07:00`);
  return {
    start: isNaN(fallbackStart.getTime()) ? new Date() : fallbackStart,
    end: isNaN(fallbackEnd.getTime()) ? new Date(Date.now() + 3600000) : fallbackEnd,
  };
}

export function formatIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

export function getLocationText(mode?: string): string {
  switch (mode) {
    case 'online_chat':
      return 'Chat WhatsApp Terjadwal (Amelia Agustina)';
    case 'online_meet':
      return 'Video Call via WhatsApp (Amelia Agustina)';
    case 'tatap_muka_cirebon':
      return 'Area Kampus UIN Siber Syekh Nurjati Cirebon';
    default:
      return 'Konseling Bersama Amelia Agustina';
  }
}

export function generateIcsCalendar(params: CalendarEventParams): string {
  const { start, end } = parseSessionTimes(params.date, params.timeSlot);
  const dtStart = formatIcsDate(start);
  const dtEnd = formatIcsDate(end);
  const dtStamp = formatIcsDate(new Date());
  const location = getLocationText(params.mode);
  const summary = `Sesi Konseling: ${params.category || 'Konseling Pribadi'} - Amelia Agustina`;
  
  const descriptionLines = [
    `Sesi Konseling bersama Amelia Agustina (Bimbingan Konseling Islam - UIN SSC)`,
    `Kode Booking: ${params.code}`,
    `Waktu: ${params.timeSlot}`,
    `Lokasi/Format: ${location}`,
  ];
  if (params.notes) {
    descriptionLines.push(`Catatan: ${params.notes.replace(/\r?\n/g, ' ')}`);
  }
  descriptionLines.push(`Kontak Amel: +62 858-6449-3354`);

  const description = descriptionLines.join('\\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Amelia Agustina Portfolio//Counseling Session//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:booking-${params.code}@amelia-agustina`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function getGoogleCalendarUrl(params: CalendarEventParams): string {
  const { start, end } = parseSessionTimes(params.date, params.timeSlot);
  const dtStart = formatIcsDate(start);
  const dtEnd = formatIcsDate(end);
  const location = getLocationText(params.mode);
  const title = `Sesi Konseling: ${params.category || 'Konseling'} - Amelia Agustina`;
  
  const details = [
    `Sesi Konseling bersama Amelia Agustina`,
    `Kode Booking: ${params.code}`,
    `Waktu: ${params.timeSlot}`,
    `Format: ${location}`,
    params.notes ? `Catatan: ${params.notes}` : '',
    `Kontak WhatsApp: +62 858-6449-3354`,
  ].filter(Boolean).join('\n');

  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.set('action', 'TEMPLATE');
  url.searchParams.set('text', title);
  url.searchParams.set('dates', `${dtStart}/${dtEnd}`);
  url.searchParams.set('details', details);
  url.searchParams.set('location', location);

  return url.toString();
}

export function downloadIcsFile(params: CalendarEventParams): void {
  if (typeof window === 'undefined') return;
  const content = generateIcsCalendar(params);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `konseling-${params.code || 'sesi'}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
