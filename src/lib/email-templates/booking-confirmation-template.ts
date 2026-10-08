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
 * Generate branded HTML email for user's booking confirmation.
 * Compatible with Gmail, Apple Mail, Outlook, and mobile clients.
 */
export function generateBookingConfirmationHtml(booking: Booking): string {
  const siteUrl = env.SITE_URL;
  const safeName = escapeHtml(booking.name);
  const safeCode = escapeHtml(booking.code);
  const formattedDate = formatDisplayDate(booking.date);
  const safeTimeSlot = escapeHtml(booking.timeSlot);
  const modeLabel = getModeLabel(booking.mode);
  const safeCategory = escapeHtml(booking.category);
  const trackUrl = `${siteUrl}/schedule?code=${encodeURIComponent(booking.code)}`;
  const waUrl = `https://wa.me/6282210445785?text=${encodeURIComponent(
    `Assalamu'alaikum Kak Amel, saya sudah mengajukan jadwal konseling dengan Kode Reservasi ${booking.code}.`
  )}`;

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>Konfirmasi Jadwal Konseling - Amelia BKI</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F4F1EA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #192820;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F4F1EA; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #E5DFD5; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(25, 40, 32, 0.06);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #1A563C; padding: 36px 32px; text-align: center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <!-- Brand Emblem -->
                    <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 999px; padding: 6px 18px; margin-bottom: 12px;">
                      <span style="color: #FFFFFF; font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">AMELIA</span>
                    </div>
                    <h1 style="margin: 0; color: #FFFFFF; font-family: 'Georgia', serif; font-size: 24px; font-weight: 700; line-height: 1.3;">
                      Bimbingan Konseling Islam
                    </h1>
                    <p style="margin: 8px 0 0 0; color: #D5E5DC; font-size: 13px; font-weight: 400; letter-spacing: 0.3px;">
                      UIN Siber Syekh Nurjati Cirebon · Cyber Counseling Sebaya
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 36px 32px;">
              <!-- Greeting & Status -->
              <p style="margin: 0 0 8px 0; color: #1A563C; font-size: 14px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">
                Status: Diterima
              </p>
              <h2 style="margin: 0 0 16px 0; color: #192820; font-family: 'Georgia', serif; font-size: 21px; font-weight: 600; line-height: 1.4;">
                Assalamu'alaikum Warahmatullahi Wabarakatuh, Kak ${safeName}
              </h2>
              <p style="margin: 0 0 24px 0; color: #42564C; font-size: 15px; line-height: 1.6;">
                Terima kasih sudah melangkah dan mempercayakan ceritamu. Permohonan sesi konselingmu <strong>telah berhasil diterima</strong> oleh sistem. Kak Amel akan segera meninjau jadwalmu dan mempersiapkan ruang dialog yang nyaman.
              </p>

              <!-- Reservation Details Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FBF9F5; border: 1px solid #E5DFD5; border-radius: 12px; margin-bottom: 28px; overflow: hidden;">
                <!-- Code Highlight -->
                <tr>
                  <td style="padding: 18px 24px; background-color: #EDF5F0; border-bottom: 1px solid #C8DFD2;">
                    <span style="display: block; font-size: 11px; font-weight: 700; color: #1A563C; letter-spacing: 1px; text-transform: uppercase;">KODE RESERVASI SESI</span>
                    <span style="display: block; font-family: 'Courier New', Courier, monospace; font-size: 26px; font-weight: 700; color: #1A563C; letter-spacing: 1.5px; margin-top: 4px;">${safeCode}</span>
                  </td>
                </tr>
                <!-- Details Rows -->
                <tr>
                  <td style="padding: 20px 24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="38%" style="padding: 8px 0; color: #60756B; font-size: 13px; font-weight: 500;">Tanggal Sesi</td>
                        <td width="62%" style="padding: 8px 0; color: #192820; font-size: 14px; font-weight: 600;">${formattedDate}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #60756B; font-size: 13px; font-weight: 500; border-top: 1px dashed #E5DFD5;">Waktu / Sesi</td>
                        <td style="padding: 8px 0; color: #192820; font-size: 14px; font-weight: 600; border-top: 1px dashed #E5DFD5;">${safeTimeSlot}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #60756B; font-size: 13px; font-weight: 500; border-top: 1px dashed #E5DFD5;">Format Konseling</td>
                        <td style="padding: 8px 0; color: #1A563C; font-size: 14px; font-weight: 600; border-top: 1px dashed #E5DFD5;">
                          ${modeLabel}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #60756B; font-size: 13px; font-weight: 500; border-top: 1px dashed #E5DFD5;">Topik Konsultasi</td>
                        <td style="padding: 8px 0; color: #192820; font-size: 14px; font-weight: 600; border-top: 1px dashed #E5DFD5;">${safeCategory}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Action CTAs -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 28px;">
                <tr>
                  <td align="center" style="padding-bottom: 12px;">
                    <a href="${trackUrl}" target="_blank" style="display: block; width: 100%; box-sizing: border-box; background-color: #1A563C; color: #FFFFFF; font-size: 15px; font-weight: 600; text-align: center; text-decoration: none; padding: 14px 24px; border-radius: 8px; box-shadow: 0 2px 8px rgba(26, 86, 60, 0.25);">
                      🔍 Lacak &amp; Pantau Status Sesi
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <a href="${waUrl}" target="_blank" style="display: block; width: 100%; box-sizing: border-box; background-color: #EDF5F0; border: 1px solid #C8DFD2; color: #1A563C; font-size: 14px; font-weight: 600; text-align: center; text-decoration: none; padding: 12px 24px; border-radius: 8px;">
                      💬 Konfirmasi / Tanya via WhatsApp Konselor
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Safe Space & Confidentiality Guarantee -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAF9; border-left: 4px solid #1A563C; border-radius: 4px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <h3 style="margin: 0 0 6px 0; color: #1A563C; font-size: 14px; font-weight: 700;">
                      🔒 Jaminan Kerahasiaan (Confidential Safe Space)
                    </h3>
                    <p style="margin: 0; color: #42564C; font-size: 13px; line-height: 1.5;">
                      Setiap informasi, cerita, dan identitas yang kamu bagikan dilindungi sepenuhnya oleh kode etik profesi konseling Islam. Ruang ini adalah tempat yang aman untuk didengar tanpa penghakiman (<em>zero judgment</em>).
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Closing Note -->
              <p style="margin: 0; color: #60756B; font-size: 13px; line-height: 1.5;">
                Simpan email ini atau catat kode reservasi di atas. Jika kamu membutuhkan penyesuaian waktu, silakan hubungi Kak Amel melalui tautan di atas sebelum sesi dimulai.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FBF9F5; border-top: 1px solid #E5DFD5; padding: 28px 32px; text-align: center;">
              <p style="margin: 0 0 6px 0; color: #192820; font-size: 13px; font-weight: 600;">
                Amelia (Amel) · Konselor Sebaya BKI
              </p>
              <p style="margin: 0 0 12px 0; color: #60756B; font-size: 12px;">
                Jurusan Bimbingan Konseling Islam · UIN Siber Syekh Nurjati Cirebon
              </p>
              <p style="margin: 0; color: #8C9E94; font-size: 11px; line-height: 1.4;">
                Pesan otomatis dari layanan resmi <a href="${siteUrl}" style="color: #1A563C; text-decoration: underline;">amelia-portofolio</a>.<br>
                Mohon tidak membalas langsung ke alamat pengirim jika menggunakan domain uji coba.
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
