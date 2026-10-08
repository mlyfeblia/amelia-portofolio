import { Booking, BookingStatus } from '@/types';
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
      return 'Google Meet Virtual (Tatap Muka Daring)';
    case 'online_chat':
      return 'Chat Terjadwal (Komunikasi Teks)';
    case 'tatap_muka_cirebon':
      return 'Tatap Muka di Kampus UIN Siber Cirebon';
    default:
      return escapeHtml(mode);
  }
}

interface StatusConfig {
  badgeText: string;
  badgeBg: string;
  badgeColor: string;
  badgeBorder: string;
  headline: string;
  introText: string;
  quoteArabic?: string;
  quoteTranslation?: string;
  quoteSource?: string;
  instructionTitle: string;
  instructionText: string;
}

function getStatusConfig(status: BookingStatus, safeName: string, safeCode: string): StatusConfig {
  switch (status) {
    case 'terkonfirmasi':
      return {
        badgeText: 'JADWAL TERKONFIRMASI',
        badgeBg: '#EDF5F0',
        badgeColor: '#1A563C',
        badgeBorder: '#C8DFD2',
        headline: `Alhamdulillah, Jadwal Konseling Kamu Resmi Terkonfirmasi`,
        introText: `Kabar baik untukmu, Kak <strong>${safeName}</strong>. Permohonan jadwal konselingmu telah ditinjau dan disetujui resmi oleh Kak Amel. Ruang aman kita sudah disiapkan untuk sesi mendatang.`,
        quoteArabic: `فَإِنَّ مَعَ الْعُسْرِ يُسْرًا • إِنَّ مَعَ الْعُسْرِ يُسْرًا`,
        quoteTranslation: `“Maka sesungguhnya beserta kesulitan ada kemudahan, sesungguhnya beserta kesulitan ada kemudahan.”`,
        quoteSource: `QS. Al-Insyirah: 5–6`,
        instructionTitle: `Adab &amp; Persiapan Sesi Pertemuan`,
        instructionText: `Pilihlah ruangan yang tenang dan kondusif agar kamu bisa bercerita dengan leluasa tanpa gangguan. Untuk sesi virtual, Kak Amel akan mengontakmu melalui WhatsApp sebelum sesi dimulai.`,
      };
    case 'selesai':
      return {
        badgeText: 'SESI SELESAI',
        badgeBg: '#F0F7FB',
        badgeColor: '#0284C7',
        badgeBorder: '#BAE6FD',
        headline: `Terima Kasih Telah Berbagi Ruang Konseling`,
        introText: `Alhamdulillah, sesi konseling untuk reservasi <strong>${safeCode}</strong> telah selesai dilaksanakan. Terima kasih atas keberanian dan ketulusanmu meluangkan waktu untuk merawat kesehatan batin.`,
        quoteArabic: `رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي`,
        quoteTranslation: `“Ya Tuhanku, lapangkanlah dadaku, dan mudahkanlah untukku urusanku.”`,
        quoteSource: `QS. Thaha: 25–26`,
        instructionTitle: `Langkah Muhasabah &amp; Tindak Lanjut`,
        instructionText: `Perjalanan bertumbuh membutuhkan waktu dan kelembutan pada diri sendiri. Jika suatu saat kamu membutuhkan teman bicara atau sesi penguatan lanjutan, pintu ruang konseling Kak Amel selalu terbuka untukmu.`,
      };
    case 'dibatalkan':
      return {
        badgeText: 'JADWAL DIBATALKAN',
        badgeBg: '#FEF2F2',
        badgeColor: '#B91C1C',
        badgeBorder: '#FECACA',
        headline: `Pemberitahuan Pembatalan Sesi Konseling`,
        introText: `Kami menginformasikan bahwa reservasi sesi konseling dengan kode <strong>${safeCode}</strong> saat ini telah dibatalkan atau ditutup.`,
        instructionTitle: `Pilihan Penjadwalan Ulang`,
        instructionText: `Jika kamu masih membutuhkan sesi konseling di lain kesempatan, silakan ajukan jadwal baru yang sesuai dengan waktumu melalui website atau hubungi Kak Amel langsung via WhatsApp.`,
      };
    default:
      return {
        badgeText: 'PEMBARUAN STATUS',
        badgeBg: '#F3EFE8',
        badgeColor: '#192820',
        badgeBorder: '#E5DFD5',
        headline: `Pembaruan Status Jadwal Konseling`,
        introText: `Status reservasi sesi konseling kamu dengan kode <strong>${safeCode}</strong> telah diperbarui.`,
        instructionTitle: `Informasi Sesi`,
        instructionText: `Silakan pantau status terbaru melalui tautan pelacakan di bawah ini.`,
      };
  }
}

/**
 * Generate modern Islamic HTML email when admin updates booking status
 * (terkonfirmasi, selesai, dibatalkan).
 * Inline CSS compatible with all email clients.
 */
export function generateBookingStatusUpdatedHtml(
  booking: Booking,
  newStatus: BookingStatus
): string {
  const siteUrl = env.SITE_URL;
  const safeName = escapeHtml(booking.name);
  const safeCode = escapeHtml(booking.code);
  const formattedDate = formatDisplayDate(booking.date);
  const safeTimeSlot = escapeHtml(booking.timeSlot);
  const modeLabel = getModeLabel(booking.mode);
  const safeCategory = escapeHtml(booking.category);
  const trackUrl = `${siteUrl}/schedule?code=${encodeURIComponent(booking.code)}`;
  const waUrl = `https://wa.me/6282210445785?text=${encodeURIComponent(
    `Assalamu'alaikum Kak Amel, saya ingin menanyakan perihal jadwal konseling dengan Kode Reservasi ${booking.code}.`
  )}`;
  const cfg = getStatusConfig(newStatus, safeName, safeCode);

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>${cfg.headline} - Amelia BKI</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F4F1EA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #192820;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F4F1EA; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #E5DFD5; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(25, 40, 32, 0.06);">
          
          <!-- Branded Islamic Header -->
          <tr>
            <td style="background-color: #1A563C; padding: 36px 32px; text-align: center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <!-- Basmalah Arabic Text -->
                    <p style="margin: 0 0 10px 0; color: #D5E5DC; font-family: 'Georgia', serif; font-size: 15px; letter-spacing: 0.5px;">
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </p>
                    <!-- Brand Pill -->
                    <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 999px; padding: 4px 16px; margin-bottom: 10px;">
                      <span style="color: #FFFFFF; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">AMELIA</span>
                    </div>
                    <h1 style="margin: 0; color: #FFFFFF; font-family: 'Georgia', serif; font-size: 23px; font-weight: 700; line-height: 1.3;">
                      Bimbingan Konseling Islam
                    </h1>
                    <p style="margin: 6px 0 0 0; color: #D5E5DC; font-size: 12.5px; font-weight: 400;">
                      UIN Siber Syekh Nurjati Cirebon · Ruang Aman &amp; Pendampingan Sebaya
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 36px 32px;">
              <!-- Status Pill Badge -->
              <div style="margin-bottom: 16px;">
                <span style="display: inline-block; background-color: ${cfg.badgeBg}; color: ${cfg.badgeColor}; border: 1px solid ${cfg.badgeBorder}; font-size: 11px; font-weight: 700; letter-spacing: 1px; padding: 6px 14px; border-radius: 999px;">
                  ${cfg.badgeText}
                </span>
              </div>

              <!-- Greeting & Headline -->
              <h2 style="margin: 0 0 14px 0; color: #192820; font-family: 'Georgia', serif; font-size: 21px; font-weight: 600; line-height: 1.4;">
                Assalamu'alaikum Warahmatullahi Wabarakatuh, Kak ${safeName}
              </h2>
              <p style="margin: 0 0 24px 0; color: #42564C; font-size: 15px; line-height: 1.6;">
                ${cfg.introText}
              </p>

              <!-- Reservation Details Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FBF9F5; border: 1px solid #E5DFD5; border-radius: 12px; margin-bottom: 24px; overflow: hidden;">
                <!-- Code Header -->
                <tr>
                  <td style="padding: 16px 22px; background-color: #EDF5F0; border-bottom: 1px solid #C8DFD2;">
                    <span style="display: block; font-size: 11px; font-weight: 700; color: #1A563C; letter-spacing: 1px; text-transform: uppercase;">KODE RESERVASI SESI</span>
                    <span style="display: block; font-family: 'Courier New', Courier, monospace; font-size: 24px; font-weight: 700; color: #1A563C; letter-spacing: 1.5px; margin-top: 3px;">${safeCode}</span>
                  </td>
                </tr>
                <!-- Details Rows -->
                <tr>
                  <td style="padding: 18px 22px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="38%" style="padding: 7px 0; color: #60756B; font-size: 13px; font-weight: 500;">Tanggal Pertemuan</td>
                        <td width="62%" style="padding: 7px 0; color: #192820; font-size: 14px; font-weight: 600;">${formattedDate}</td>
                      </tr>
                      <tr>
                        <td style="padding: 7px 0; color: #60756B; font-size: 13px; font-weight: 500; border-top: 1px dashed #E5DFD5;">Waktu / Sesi</td>
                        <td style="padding: 7px 0; color: #192820; font-size: 14px; font-weight: 600; border-top: 1px dashed #E5DFD5;">${safeTimeSlot}</td>
                      </tr>
                      <tr>
                        <td style="padding: 7px 0; color: #60756B; font-size: 13px; font-weight: 500; border-top: 1px dashed #E5DFD5;">Format Sesi</td>
                        <td style="padding: 7px 0; color: #1A563C; font-size: 14px; font-weight: 600; border-top: 1px dashed #E5DFD5;">
                          ${modeLabel}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 7px 0; color: #60756B; font-size: 13px; font-weight: 500; border-top: 1px dashed #E5DFD5;">Topik Konsultasi</td>
                        <td style="padding: 7px 0; color: #192820; font-size: 14px; font-weight: 600; border-top: 1px dashed #E5DFD5;">${safeCategory}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Islamic Quote Card (If Available) -->
              ${cfg.quoteArabic ? `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAF9; border-left: 4px solid #1A563C; border-radius: 4px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px; text-align: center;">
                    <p style="margin: 0 0 8px 0; color: #1A563C; font-family: 'Georgia', serif; font-size: 17px; line-height: 1.6; direction: rtl;">
                      ${cfg.quoteArabic}
                    </p>
                    <p style="margin: 0 0 4px 0; color: #42564C; font-size: 13px; font-style: italic; line-height: 1.5;">
                      ${cfg.quoteTranslation}
                    </p>
                    <span style="font-size: 11px; font-weight: 600; color: #60756B;">— ${cfg.quoteSource}</span>
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- Instruction / Guidance Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FBF9F5; border: 1px solid #E5DFD5; border-radius: 10px; margin-bottom: 26px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <h3 style="margin: 0 0 6px 0; color: #192820; font-size: 13.5px; font-weight: 700;">
                      🌱 ${cfg.instructionTitle}
                    </h3>
                    <p style="margin: 0; color: #42564C; font-size: 13px; line-height: 1.55;">
                      ${cfg.instructionText}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Call to Action Buttons -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center" style="padding-bottom: 12px;">
                    <a href="${trackUrl}" target="_blank" style="display: block; width: 100%; box-sizing: border-box; background-color: #1A563C; color: #FFFFFF; font-size: 14.5px; font-weight: 600; text-align: center; text-decoration: none; padding: 13px 24px; border-radius: 10px; box-shadow: 0 2px 8px rgba(26, 86, 60, 0.25);">
                      Buka Lacak Janji Temu Konseling
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <a href="${waUrl}" target="_blank" style="display: block; width: 100%; box-sizing: border-box; background-color: #EDF5F0; border: 1px solid #C8DFD2; color: #1A563C; font-size: 13.5px; font-weight: 600; text-align: center; text-decoration: none; padding: 11px 24px; border-radius: 10px;">
                      Hubungi / Konfirmasi via WhatsApp Kak Amel
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #60756B; font-size: 12.5px; line-height: 1.5; text-align: center;">
                Kerahasiaan konseli dilindungi penuh sesuai kode etik Bimbingan Konseling Islam.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FBF9F5; border-top: 1px solid #E5DFD5; padding: 26px 32px; text-align: center;">
              <p style="margin: 0 0 5px 0; color: #192820; font-size: 13px; font-weight: 600;">
                Amelia (Amel) · Konselor Sebaya BKI
              </p>
              <p style="margin: 0 0 10px 0; color: #60756B; font-size: 12px;">
                Bimbingan Konseling Islam · UIN Siber Syekh Nurjati Cirebon
              </p>
              <p style="margin: 0; color: #8C9E94; font-size: 11px; line-height: 1.4;">
                Pemberitahuan otomatis dari <a href="${siteUrl}" style="color: #1A563C; text-decoration: underline;">amelia-portofolio</a>.
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
