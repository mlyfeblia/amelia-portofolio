/**
 * Standardized WhatsApp Link & Message Template Generator for Amelia Portfolio
 * Phone: +62 822-1044-5785 (0822-1044-5785)
 */

export const AMELIA_WHATSAPP_NUMBER = '6282210445785';

/**
 * Clean phone numbers to standard international format without '+' or special chars
 */
export function formatWhatsAppNumber(phone: string): string {
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    return '62' + cleaned.slice(1);
  }
  return cleaned;
}

/**
 * 1. General Consultation / Inquiry (Used in Footer, Contact, About)
 * Includes "[Nama Kamu]" placeholder for easy filling by the user.
 */
export function getGeneralWhatsAppUrl(customTopic?: string): string {
  const text = customTopic
    ? `Halo Kak Amel, perkenalkan nama saya [Nama Kamu]. Saya ingin berkonsultasi mengenai ${customTopic}. Apakah ada waktu luang untuk sesi bimbingan? Terima kasih.`
    : `Halo Kak Amel, perkenalkan nama saya [Nama Kamu]. Saya ingin bertanya dan konsultasi seputar layanan bimbingan konseling sebaya. Apakah ada jadwal sesi yang tersedia? Terima kasih.`;
  return `https://wa.me/${AMELIA_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

/**
 * 2. Booking Confirmation from Client to Amel (Used on Booking Success screen)
 * Automatically includes the user's actual entered name, alias, code, date, and slot.
 */
export interface BookingConfirmationParams {
  name: string;
  alias?: string;
  code: string;
  date: string;
  slot: string;
}

export function getBookingConfirmationWhatsAppUrl(params: BookingConfirmationParams): string {
  const displayName = params.alias && params.alias !== params.name
    ? `${params.name} (${params.alias})`
    : params.name;

  const text = `Halo Kak Amel, perkenalkan nama saya ${displayName}. Saya telah mengajukan janji temu konseling di website dengan Kode Referensi: ${params.code} untuk tanggal ${params.date} (${params.slot}). Mohon konfirmasi jadwal dan tautan sesinya ya kak, terima kasih banyak!`;

  return `https://wa.me/${AMELIA_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

/**
 * 3. Counselor Direct Contact to Client (Used in Admin Portal)
 * Pre-fills warm, professional greeting from Amel to the client.
 */
export interface AdminContactParams {
  clientPhone: string;
  clientName: string;
  code: string;
  date: string;
  slot: string;
}

export function getAdminContactWhatsAppUrl(params: AdminContactParams): string {
  const targetPhone = formatWhatsAppNumber(params.clientPhone);
  const text = `Halo ${params.clientName}, salam kenal dari Amel (Konselor Sebaya UIN Siber Cirebon). Terkait permohonan sesi konseling Anda (${params.code}) untuk jadwal ${params.date} (${params.slot}), saya ingin mengonfirmasi kesiapan sesi kita. Apakah jadwal tersebut sudah sesuai untuk Anda? Terima kasih.`;

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * 4. Assessment Result Consultation (Used in AssessmentSection)
 */
export interface AssessmentResultParams {
  level: string;
  category: string;
  totalScore: number;
}

export function getAssessmentWhatsAppUrl(params: AssessmentResultParams): string {
  const text = `Halo Kak Amel, perkenalkan nama saya [Nama Kamu]. Saya baru saja mengisi Asesmen Kesejahteraan Jiwa di website dan mendapatkan hasil: ${params.level} (${params.category}) dengan skor ${params.totalScore}/21. Saya ingin berdiskusi dan konsultasi lebih lanjut dengan Kak Amel. Terima kasih!`;
  return `https://wa.me/${AMELIA_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
