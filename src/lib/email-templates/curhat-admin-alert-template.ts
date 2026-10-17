import { AnonymousMessage } from '@/types';
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
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  } catch {
    return escapeHtml(dateStr);
  }
}

/**
 * Generate branded HTML email alert for Amelia (admin) on new anonymous curhat message.
 */
export function generateCurhatAdminAlertHtml(curhat: AnonymousMessage): string {
  const siteUrl = env.SITE_URL;
  const safeAlias = escapeHtml(curhat.alias || 'Teman Anonim');
  const safeCategory = escapeHtml(curhat.category || 'Curhat Umum');
  const safeTime = formatDisplayDate(curhat.createdAt);
  const safeMessage = escapeHtml(curhat.message);
  const adminUrl = `${siteUrl}/admin/counseling`;

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>Curhat Anonim Baru - Amelia BKI</title>
  <style>
    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 16px 8px !important;
      }
      .email-card {
        border-radius: 12px !important;
      }
      .email-header-cell {
        padding: 24px 18px !important;
      }
      .email-body-cell {
        padding: 24px 18px !important;
      }
      .email-footer-cell {
        padding: 18px 16px !important;
      }
      .col-label {
        width: 44% !important;
        font-size: 12px !important;
      }
      .col-value {
        width: 56% !important;
        font-size: 13px !important;
      }
      .btn-block {
        display: block !important;
        width: 100% !important;
        padding-left: 12px !important;
        padding-right: 12px !important;
        box-sizing: border-box !important;
        font-size: 14px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F4F1EA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #192820;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="email-wrapper" style="background-color: #F4F1EA; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="email-card" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #E5DFD5; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(25, 40, 32, 0.06);">
          
          <!-- Header Banner -->
          <tr>
            <td class="email-header-cell" style="background-color: #1A563C; padding: 32px; text-align: left;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <div style="display: inline-block; background-color: #EDF5F0; border-radius: 6px; padding: 4px 10px; margin-bottom: 12px;">
                      <span style="color: #1A563C; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">KOTAK CERITA &amp; CYBER COUNSELING</span>
                    </div>
                    <h1 style="margin: 0; color: #FFFFFF; font-family: 'Georgia', serif; font-size: 22px; font-weight: 700; line-height: 1.3;">
                      💌 Pesan Curhat Anonim Baru Masuk
                    </h1>
                    <p style="margin: 6px 0 0 0; color: #D5E5DC; font-size: 13px;">
                      Dari: <strong style="color: #FFFFFF;">${safeAlias}</strong> · ${safeCategory}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td class="email-body-cell" style="padding: 32px;">
              <p style="margin: 0 0 20px 0; color: #42564C; font-size: 14px; line-height: 1.5;">
                Halo Mel, ada pesan curhat anonim baru yang masuk dan menanti tanggapan empatikmu:
              </p>

              <!-- Meta Info Table -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FBF9F5; border: 1px solid #E5DFD5; border-radius: 10px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="35%" class="col-label" style="padding: 5px 0; color: #60756B; font-size: 13px; font-weight: 500;">Nama Samaran</td>
                        <td width="65%" class="col-value" style="padding: 5px 0; color: #192820; font-size: 14px; font-weight: 700;">${safeAlias}</td>
                      </tr>
                      <tr>
                        <td class="col-label" style="padding: 5px 0; color: #60756B; font-size: 13px; font-weight: 500; border-top: 1px dashed #E5DFD5;">Kategori Masalah</td>
                        <td class="col-value" style="padding: 5px 0; color: #1A563C; font-size: 14px; font-weight: 600; border-top: 1px dashed #E5DFD5;">${safeCategory}</td>
                      </tr>
                      <tr>
                        <td class="col-label" style="padding: 5px 0; color: #60756B; font-size: 13px; font-weight: 500; border-top: 1px dashed #E5DFD5;">Waktu Dikirim</td>
                        <td class="col-value" style="padding: 5px 0; color: #60756B; font-size: 13px; border-top: 1px dashed #E5DFD5;">${safeTime}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Message Blockquote Box -->
              <div style="margin-bottom: 28px;">
                <span style="display: block; font-size: 12px; font-weight: 700; color: #60756B; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                  Isi Curhat Konseli:
                </span>
                <div style="background-color: #F8FAF9; border-left: 4px solid #1A563C; border-radius: 4px; padding: 20px; font-size: 14px; line-height: 1.7; color: #192820; white-space: pre-wrap; font-style: italic;">&ldquo;${safeMessage}&rdquo;</div>
              </div>

              <!-- Action Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
                <tr>
                  <td align="center">
                    <a href="${adminUrl}" target="_blank" class="btn-block" style="display: block; width: 100%; box-sizing: border-box; background-color: #1A563C; color: #FFFFFF; font-size: 15px; font-weight: 600; text-align: center; text-decoration: none; padding: 14px 24px; border-radius: 8px; box-shadow: 0 2px 8px rgba(26, 86, 60, 0.25);">
                      ✍️ Tanggapi di Panel Admin Curhat
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="email-footer-cell" style="background-color: #FBF9F5; border-top: 1px solid #E5DFD5; padding: 20px 32px; text-align: center;">
              <p style="margin: 0; color: #8C9E94; font-size: 12px;">
                Notifikasi Otomatis Ruang Curhat Amelia BKI · UIN Siber Cirebon
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
