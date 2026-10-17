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
  mode?: string;
}

export function getBookingConfirmationWhatsAppUrl(params: BookingConfirmationParams): string {
  const displayName = params.alias && params.alias !== params.name
    ? `${params.name} (${params.alias})`
    : params.name;

  let modeText = '';
  if (params.mode === 'online_meet') modeText = ' via Video Call WhatsApp';
  else if (params.mode === 'online_chat') modeText = ' via Chat WhatsApp Terjadwal';
  else if (params.mode === 'tatap_muka_cirebon') modeText = ' secara Tatap Muka di Kampus';

  const text = `Halo Kak Amel, perkenalkan nama saya ${displayName}. Saya telah mengajukan janji temu konseling di website dengan Kode Reservasi: ${params.code} untuk tanggal ${params.date} (${params.slot})${modeText}. Mohon konfirmasi jadwal dan ketersediaan sesinya ya kak, terima kasih banyak!`;

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
  mode?: string;
}

export function getAdminContactWhatsAppUrl(params: AdminContactParams): string {
  const targetPhone = formatWhatsAppNumber(params.clientPhone);
  let modeDesc = '';
  if (params.mode === 'online_meet') modeDesc = ' (format Video Call via WhatsApp)';
  else if (params.mode === 'online_chat') modeDesc = ' (format Chat WhatsApp Terjadwal)';
  else if (params.mode === 'tatap_muka_cirebon') modeDesc = ' (format Tatap Muka di Kampus Cirebon)';

  const text = `Halo ${params.clientName}, salam kenal dari Amel (Konselor Sebaya UIN Siber Cirebon). Terkait janji temu konseling kamu (${params.code}) untuk jadwal ${params.date} (${params.slot})${modeDesc}, aku ingin konfirmasi kesiapan sesi kita. Apakah jadwal tersebut sudah pas buat kamu? Terima kasih ya.`;

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * 4. Assessment Result Consultation (Used in AssessmentSection)
 */
export interface AssessmentResultParams {
  level: string;
  category?: string;
  totalScore: number;
  maxScore?: number;
  dimensionsSummary?: string;
}

export function getAssessmentWhatsAppUrl(params: AssessmentResultParams): string {
  const max = params.maxScore ?? 24;
  const dimBlock = params.dimensionsSummary ? `\n\nRingkasan Dimensi:\n${params.dimensionsSummary}` : '';
  const text = `Halo Kak Amel, perkenalkan nama saya [Nama Kamu]. Saya baru saja mengisi Asesmen Kesejahteraan Jiwa di website dan mendapatkan hasil: ${params.level} dengan skor ${params.totalScore}/${max}.${dimBlock}\n\nSaya ingin berdiskusi dan konsultasi lebih lanjut dengan Kak Amel. Terima kasih!`;
  return `https://wa.me/${AMELIA_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
