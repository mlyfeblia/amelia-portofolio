import { Booking, AnonymousMessage } from '@/types';

/**
 * Escapes and sanitizes a cell value for safe RFC 4180 CSV generation.
 * Handles commas, quotes, newlines, and prevents Excel formula injection (CSV injection).
 */
function escapeCsvValue(val: unknown): string {
  if (val === null || val === undefined) return '""';
  let str = String(val).trim();

  // Prevent CSV Injection / Formula Execution in Excel (=, +, -, @)
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape double quotes
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Downloads a formatted CSV file in the browser with UTF-8 BOM for perfect Excel compatibility.
 */
export function downloadCsv(filename: string, headers: string[], rows: unknown[][]) {
  if (typeof window === 'undefined') return;

  const headerRow = headers.map(escapeCsvValue).join(',');
  const dataRows = rows.map((row) => row.map(escapeCsvValue).join(',')).join('\r\n');

  // UTF-8 BOM ensures Excel recognizes UTF-8 Indonesian special characters without garbled text
  const csvContent = `\uFEFF${headerRow}\r\n${dataRows}`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports booking records to CSV.
 */
export function exportBookingsToCsv(bookings: Booking[], filenameSuffix = '') {
  const headers = [
    'Kode Reservasi',
    'Nama Konseli',
    'Nama Samaran / Alias',
    'Nomor WhatsApp',
    'Email',
    'Kategori Topik',
    'Format Sesi',
    'Tanggal Sesi',
    'Jam / Sesi',
    'Status',
    'Catatan Konseli',
    'Waktu Pendaftaran',
  ];

  const rows = bookings.map((b) => [
    b.code,
    b.name,
    b.alias || '',
    b.phone,
    b.email,
    b.category,
    b.mode,
    b.date,
    b.timeSlot,
    b.status,
    b.notes || '',
    b.createdAt,
  ]);

  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `rekap-janji-temu-amelia-${dateStr}${filenameSuffix ? `-${filenameSuffix}` : ''}.csv`;
  downloadCsv(filename, headers, rows);
}

/**
 * Exports anonymous counseling (curhat) records to CSV.
 */
export function exportCurhatToCsv(curhatList: AnonymousMessage[], filenameSuffix = '') {
  const headers = [
    'ID Pesan',
    'Nama Samaran / Alias',
    'Kategori Cerita',
    'Isi Pesan Curhat',
    'Status Tanggapan',
    'Tanggapan Konselor',
    'Waktu Ditanggapi',
    'Visibilitas Publik',
    'Sorotan Beranda',
    'Waktu Dibuat',
  ];

  const rows = curhatList.map((c) => [
    c.id,
    c.alias || 'Anonim',
    c.category,
    c.message,
    c.isAnswered ? 'Sudah Ditanggapi' : 'Belum Ditanggapi',
    c.answer || '',
    c.answeredAt || '',
    c.isPublic ? 'Publik' : 'Privat',
    c.showOnLandingPage ? 'Ya' : 'Tidak',
    c.createdAt,
  ]);

  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `rekap-ruang-curhat-amelia-${dateStr}${filenameSuffix ? `-${filenameSuffix}` : ''}.csv`;
  downloadCsv(filename, headers, rows);
}
