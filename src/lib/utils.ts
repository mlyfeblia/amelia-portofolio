import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const INDO_MONTHS: Record<string, string> = {
  januari: '01',
  februari: '02',
  maret: '03',
  april: '04',
  mei: '05',
  juni: '06',
  juli: '07',
  agustus: '08',
  september: '09',
  oktober: '10',
  november: '11',
  desember: '12',
};

/**
 * Safely parse Indonesian textual date ("24 September 2026") or ISO string into a valid Date object.
 */
export function parseIndonesianDate(dateStr?: string | null): Date {
  if (!dateStr) return new Date();

  const trimmed = dateStr.trim();
  const parts = trimmed.split(/\s+/);
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = INDO_MONTHS[parts[1].toLowerCase()];
    const year = parts[2];
    if (month && year) {
      const parsed = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
  }

  const direct = new Date(trimmed);
  return isNaN(direct.getTime()) ? new Date() : direct;
}

/**
 * Safely converts any date input (Indonesian textual date, ISO string, or Date)
 * into a valid ISO timestamp string. Never throws.
 */
export function ensureValidIsoTimestamp(dateStr?: string | Date | null): string {
  if (!dateStr) return new Date().toISOString();
  if (dateStr instanceof Date) {
    return isNaN(dateStr.getTime()) ? new Date().toISOString() : dateStr.toISOString();
  }
  const parsed = parseIndonesianDate(dateStr);
  return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

/**
 * Safely formats any date (Indonesian textual date, ISO string, or Date) into standard Indonesian format:
 * e.g. "24 September 2026". Never throws.
 */
export function formatIndonesianDate(dateInput?: string | Date | null): string {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? parseIndonesianDate(dateInput) : dateInput;
  if (isNaN(date.getTime())) return typeof dateInput === 'string' ? dateInput : '';

  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Jakarta',
    }).format(date);
  } catch {
    return typeof dateInput === 'string' ? dateInput : '';
  }
}

/**
 * Returns ISO format date string (YYYY-MM-DD)
 */
export function getIsoDateString(dateStr?: string): string {
  const date = parseIndonesianDate(dateStr);
  return date.toISOString().split('T')[0];
}

/**
 * Safely serialize data to JSON-LD string, escaping '<' characters to prevent script injection.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
