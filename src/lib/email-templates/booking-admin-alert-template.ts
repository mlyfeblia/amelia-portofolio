import { Booking } from '@/types';
import { env } from '@/lib/env';

function escapeHtml(text: string | undefined | null): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDisplayDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return escapeHtml(dateStr);
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return escapeHtml(dateStr);
  }
}

function getModeLabel(mode: string): string {
  switch (mode) {
    case 'online_meet':
      return 'Google Meet Virtual';
    case 'online_chat':
      return 'Chat Terjadwal';
    case 'tatap_muka_cirebon':
      return 'Tatap Muka di Kampus';
    default:
      return escapeHtml(mode);
  }
}

/**
 * Clean phone number to international WhatsApp format (e.g. 0812 -> 62812).
 */
function normalizeWhatsAppPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) {
    return '62' + digits.slice(1);
  }
  return digits;
}

/**
 * Generate branded HTML email alert for Amelia (admin) on new booking submission.
 */
export function generateBookingAdminAlertHtml(booking: Booking): string {
  const siteUrl = env.SITE_URL;
  const safeName = escapeHtml(booking.name);
  const safeAlias = booking.alias ? escapeHtml(booking.alias) : '';
  const safePhone = escapeHtml(booking.phone);
  const safeEmail = escapeHtml(booking.email);
  const safeCode = escapeHtml(booking.code);
  const formattedDate = formatDisplayDate(booking.date);
  const safeTimeSlot = escapeHtml(booking.timeSlot);
  const modeLabel = getModeLabel(booking.mode);
  const safeCategory = escapeHtml(booking.category);
  const safeNotes = escapeHtml(booking.notes || 'Tidak ada catatan tambahan');
  
  const adminUrl = `${siteUrl}/admin/bookings`;
  const cleanPhone = normalizeWhatsAppPhone(booking.phone);
  const waDirectUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Halo Kak ${booking.name}, saya Amelia (Konselor BKI). Saya menerima pengajuan jadwal konselingmu [${booking.code}].`
  )}`;

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>Alert Jadwal Baru - Amelia BKI</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F4F1EA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #192820;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F4F1EA; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #E5DFD5; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(25, 40, 32, 0.06);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #1A563C; padding: 32px; text-align: left;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <div style="display: inline-block; background-color: #EDF5F0; border-radius: 6px; padding: 4px 10px; margin-bottom: 12px;">
                      <span style="color: #1A563C; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">ADMIN NOTIFICATION</span>
                    </div>
                    <h1 style="margin: 0; color: #FFFFFF; font-family: 'Georgia', serif; font-size: 22px; font-weight: 700; line-height: 1.3;">
                      📅 Permohonan Jadwal Konseling Baru Masuk
                    </h1>
                    <p style="margin: 6px 0 0 0; color: #D5E5DC; font-size: 13px;">
                      Kode Reservasi: <strong style="font-family: monospace; color: #FFFFFF;">${safeCode}</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 20px 0; color: #42564C; font-size: 14px; line-height: 1.5;">
                Halo Mel, ada konseli baru yang baru saja mengajukan jadwal konsultasi melalui website:
              </p>

              <!-- Client Info Table -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FBF9F5; border: 1px solid #E5DFD5; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="35%" style="padding: 7px 0; color: #60756B; font-size: 13px; font-weight: 500;">Nama Konseli</td>
                        <td width="65%" style="padding: 7px 0; color: #192820; font-size: 14px; font-weight: 700;">
                          ${safeName} ${safeAlias ? `<span style="font-weight: 400; color: #60756B;">(alias: ${safeAlias})</span>` : ''}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 7px 0; color: #60756B; font-size: 13px; font-weight: 500; border-top: 1px dashed #E5DFD5;">Kontak WhatsApp</td>
                        <td style="padding: 7px 0; color: #1A563C; font-size: 14px; font-weight: 600; border-top: 1px dashed #E5DFD5;">
                          <a href="${waDirectUrl}" target="_blank" style="color: #1A563C; text-decoration: underline;">
                            ${safePhone} (Klik untuk Chat)
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 7px 0; color: #60756B; font-size: 13px; font-weight: 500; border-top: 1px dashed #E5DFD5;">Email</td>
                        <td style="padding: 7px 0; color: #192820; font-size: 14px; border-top: 1px dashed #E5DFD5;">
                          <a href="mailto:${safeEmail}" style="color: #1A563C; text-decoration: none;">${safeEmail}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 7px 0; color: #60756B; font-size: 13px; font-weight: 500; border-top: 1px dashed #E5DFD5;">Topik Konseling</td>
                        <td style="padding: 7px 0; color: #192820; font-size: 14px; font-weight: 600; border-top: 1px dashed #E5DFD5;">
                          ${safeCategory}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 7px 0; color: #60756B; font-size: 13px; font-weight: 500; border-top: 1px dashed #E5DFD5;">Format Sesi</td>
                        <td style="padding: 7px 0; color: #192820; font-size: 14px; font-weight: 600; border-top: 1px dashed #E5DFD5;">
                          ${modeLabel}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 7px 0; color: #60756B; font-size: 13px; font-weight: 500; border-top: 1px dashed #E5DFD5;">Waktu Diminta</td>
                        <td style="padding: 7px 0; color: #192820; font-size: 14px; font-weight: 600; border-top: 1px dashed #E5DFD5;">
                          ${formattedDate} · ${safeTimeSlot}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Notes Box -->
              <div style="margin-bottom: 24px;">
                <span style="display: block; font-size: 12px; font-weight: 700; color: #60756B; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                  Catatan Awal dari Konseli:
                </span>
                <div style="background-color: #FEF9EC; border: 1px solid #FCE8B3; border-radius: 8px; padding: 16px; font-size: 13px; line-height: 1.6; color: #42564C; font-style: italic;">
                  &ldquo;${safeNotes}&rdquo;
                </div>
              </div>

              <!-- Action Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
                <tr>
                  <td align="center">
                    <a href="${adminUrl}" target="_blank" style="display: block; width: 100%; box-sizing: border-box; background-color: #1A563C; color: #FFFFFF; font-size: 15px; font-weight: 600; text-align: center; text-decoration: none; padding: 14px 24px; border-radius: 8px; box-shadow: 0 2px 8px rgba(26, 86, 60, 0.25);">
                      ⚙️ Buka Panel Admin Bookings
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FBF9F5; border-top: 1px solid #E5DFD5; padding: 20px 32px; text-align: center;">
              <p style="margin: 0; color: #8C9E94; font-size: 12px;">
                Notifikasi Otomatis Sistem Konselor Amelia BKI · UIN Siber Cirebon
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
