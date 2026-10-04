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
 * Safely parse Indonesian textual date ("24 September 2026") into a valid Date object.
 */
export function parseIndonesianDate(dateStr?: string): Date {
  if (!dateStr) return new Date();

  const parts = dateStr.trim().split(/\s+/);
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

  const direct = new Date(dateStr);
  return isNaN(direct.getTime()) ? new Date() : direct;
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

