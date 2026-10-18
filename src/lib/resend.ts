import { Resend } from 'resend';
import { Booking, AnonymousMessage, BookingStatus } from '@/types';
import { generateBookingConfirmationHtml } from './email-templates/booking-confirmation-template';
import { generateBookingAdminAlertHtml } from './email-templates/booking-admin-alert-template';
import { generateCurhatAdminAlertHtml } from './email-templates/curhat-admin-alert-template';
import { generateBookingStatusUpdatedHtml } from './email-templates/booking-status-updated-template';
import { telemetry } from './telemetry';
import { env } from './env';

const DEFAULT_ADMIN_EMAIL = 'mlyfeblia150207@gmail.com';
const DEFAULT_FROM_EMAIL = 'Amelia BKI <onboarding@resend.dev>';

let cachedResend: Resend | null = null;
let cachedApiKey: string | undefined;

function getResendClient(): Resend | null {
  const key = (process.env.RESEND_API_KEY || '').trim();
  if (!key) return null;
  if (!cachedResend || cachedApiKey !== key) {
    cachedResend = new Resend(key);
    cachedApiKey = key;
  }
  return cachedResend;
}

function getAdminEmail(): string {
  const configured = (process.env.ADMIN_NOTIFICATION_EMAIL || '').trim();
  // Normalize legacy unverified alias to the verified Resend owner address when using onboarding@resend.dev
  if (!configured || (configured === 'mlyfeblia@gmail.com' && getFromEmail().includes('onboarding@resend.dev'))) {
    return DEFAULT_ADMIN_EMAIL;
  }
  return configured;
}

function getFromEmail(): string {
  return (process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL).trim();
}

function isSandboxRestrictionError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const errObj = error as { statusCode?: number; name?: string; message?: string };
  const msg = (errObj.message || '').toLowerCase();
  return (
    errObj.statusCode === 403 ||
    errObj.name === 'validation_error' ||
    msg.includes('only send testing emails') ||
    msg.includes('verify a domain')
  );
}

/**
 * Send booking confirmation email directly to the client/user.
 * If Resend is in sandbox mode (onboarding@resend.dev) and rejects external recipient with 403,
 * automatically routes a copy to the verified admin email with replyTo set to the client's email.
 */
export async function sendBookingConfirmationEmail(booking: Booking): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) {
    telemetry.info('Resend API key is not configured; skipping booking confirmation email.', {
      bookingCode: booking.code,
      recipient: booking.email,
    });
    return false;
  }

  const recipientEmail = (booking.email || '').trim();
  if (!recipientEmail || !recipientEmail.includes('@')) {
    telemetry.info('Invalid or missing email in booking; skipping email dispatch.', {
      bookingCode: booking.code,
      email: booking.email,
    });
    return false;
  }

  const fromEmail = getFromEmail();
  const adminEmail = getAdminEmail();
  const subject = `Konfirmasi Permohonan Sesi Konseling [${booking.code}] - Amelia BKI`;
  const text = `Assalamu'alaikum Warahmatullahi Wabarakatuh, Kak ${booking.name}.\n\nPermohonan sesi konseling kamu telah berhasil diterima.\nKode Reservasi: ${booking.code}\nTanggal: ${booking.date}\nSesi Waktu: ${booking.timeSlot}\nFormat: ${booking.mode === 'online_meet' ? 'Video Call via WhatsApp' : booking.mode === 'online_chat' ? 'Chat WhatsApp Terjadwal' : 'Tatap Muka di Kampus'}\nTopik: ${booking.category}\n\nLacak status: ${env.SITE_URL}/schedule?tab=tracker&code=${booking.code}\nWhatsApp Konselor: +62 822-1044-5785\n\nSalam hangat,\nAmelia (Amel) - BKI UIN Siber Cirebon`;

  try {
    const html = generateBookingConfirmationHtml(booking);
    const { data, error } = await resend.emails.send(
      {
        from: fromEmail,
        to: recipientEmail,
        replyTo: adminEmail,
        subject,
        html,
        text,
        tags: [
          { name: 'category', value: 'booking-confirmation' },
          { name: 'booking_code', value: booking.code },
        ],
      },
      {
        idempotencyKey: `booking-confirm/${booking.id}`,
      }
    );

    if (error) {
      if (
        isSandboxRestrictionError(error) &&
        recipientEmail.toLowerCase() !== adminEmail.toLowerCase()
      ) {
        const fallbackRes = await resend.emails.send(
          {
            from: fromEmail,
            to: adminEmail,
            replyTo: recipientEmail,
            subject: `[Salinan Konseli: ${recipientEmail}] ${subject}`,
            html,
            text,
            tags: [
              { name: 'category', value: 'booking-confirmation-sandbox-copy' },
              { name: 'booking_code', value: booking.code },
            ],
          },
          {
            idempotencyKey: `booking-confirm-fallback/${booking.id}`,
          }
        );

        if (!fallbackRes.error) {
          telemetry.info('Booking confirmation email routed via sandbox fallback to admin inbox', {
            bookingCode: booking.code,
            originalRecipient: recipientEmail,
            fallbackRecipient: adminEmail,
            emailId: fallbackRes.data?.id,
          });
          return true;
        }
      }

      telemetry.error('Failed to send booking confirmation email via Resend', error, {
        bookingCode: booking.code,
        recipient: recipientEmail,
      });
      return false;
    }

    telemetry.info('Booking confirmation email sent successfully', {
      bookingCode: booking.code,
      emailId: data?.id,
    });
    return true;
  } catch (err) {
    telemetry.error('Unexpected error while sending booking confirmation email', err, {
      bookingCode: booking.code,
      recipient: recipientEmail,
    });
    return false;
  }
}

/**
 * Send notification email to Amelia (admin) when a new counseling booking is created.
 * Non-blocking: returns boolean and never throws an exception to caller.
 */
export async function sendAdminBookingAlertEmail(booking: Booking): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) {
    telemetry.info('Resend API key is not configured; skipping admin booking alert email.', {
      bookingCode: booking.code,
    });
    return false;
  }

  const fromEmail = getFromEmail();
  const adminEmail = getAdminEmail();

  try {
    const html = generateBookingAdminAlertHtml(booking);
    const modeLabel =
      booking.mode === 'online_meet'
        ? 'Video Call via WhatsApp'
        : booking.mode === 'online_chat'
        ? 'Chat WhatsApp Terjadwal'
        : 'Tatap Muka di Kampus (Cirebon)';
    const text = `Permohonan Jadwal Konseling Baru Masuk\n\nDetail Konseli:\n- Nama: ${booking.name}${booking.alias ? ` (${booking.alias})` : ''}\n- Kontak WhatsApp: ${booking.phone}\n- Email: ${booking.email || '-'}\n- Topik: ${booking.category}\n- Format: ${modeLabel}\n- Tanggal: ${booking.date}\n- Sesi: ${booking.timeSlot}\n- Catatan: ${booking.notes || 'Tidak ada catatan tambahan'}\n- Kode Reservasi: ${booking.code}\n\nBuka Panel Admin: ${env.SITE_URL}/admin/bookings`;

    const validClientEmail =
      booking.email && booking.email.includes('@') ? booking.email.trim() : undefined;

    const { data, error } = await resend.emails.send(
      {
        from: fromEmail,
        to: adminEmail,
        ...(validClientEmail ? { replyTo: validClientEmail } : {}),
        subject: `📅 [Jadwal Baru] ${booking.name} (${booking.category}) - ${booking.code}`,
        html,
        text,
        tags: [
          { name: 'category', value: 'admin-alert' },
          { name: 'type', value: 'booking' },
        ],
      },
      {
        idempotencyKey: `booking-alert/${booking.id}`,
      }
    );

    if (error) {
      telemetry.error('Failed to send admin booking alert email via Resend', error, {
        bookingCode: booking.code,
        adminEmail,
      });
      return false;
    }

    telemetry.info('Admin booking alert email sent successfully', {
      bookingCode: booking.code,
      emailId: data?.id,
    });
    return true;
  } catch (err) {
    telemetry.error('Unexpected error while sending admin booking alert email', err, {
      bookingCode: booking.code,
      adminEmail,
    });
    return false;
  }
}

/**
 * Send notification email to Amelia (admin) when a new anonymous curhat message is submitted.
 * Non-blocking: returns boolean and never throws an exception to caller.
 */
export async function sendAdminCurhatAlertEmail(curhat: AnonymousMessage): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) {
    telemetry.info('Resend API key is not configured; skipping admin curhat alert email.', {
      curhatId: curhat.id,
    });
    return false;
  }

  const fromEmail = getFromEmail();
  const adminEmail = getAdminEmail();

  try {
    const html = generateCurhatAdminAlertHtml(curhat);
    const text = `Pesan Curhat Anonim Baru Masuk\n\nDetail Curhat:\n- Nama Samaran: ${curhat.alias || 'Teman Anonim'}\n- Kategori: ${curhat.category || 'Curhat Umum'}\n- Waktu: ${curhat.createdAt}\n\nIsi Pesan:\n"${curhat.message}"\n\nTanggapi di Panel Admin: ${env.SITE_URL}/admin/counseling`;

    const { data, error } = await resend.emails.send(
      {
        from: fromEmail,
        to: adminEmail,
        subject: `💌 [Curhat Baru] Pesan dari ${curhat.alias || 'Anonim'} (${curhat.category || 'Umum'})`,
        html,
        text,
        tags: [
          { name: 'category', value: 'admin-alert' },
          { name: 'type', value: 'curhat' },
        ],
      },
      {
        idempotencyKey: `curhat-alert/${curhat.id}`,
      }
    );

    if (error) {
      telemetry.error('Failed to send admin curhat alert email via Resend', error, {
        curhatId: curhat.id,
        adminEmail,
      });
      return false;
    }

    telemetry.info('Admin curhat alert email sent successfully', {
      curhatId: curhat.id,
      emailId: data?.id,
    });
    return true;
  } catch (err) {
    telemetry.error('Unexpected error while sending admin curhat alert email', err, {
      curhatId: curhat.id,
      adminEmail,
    });
    return false;
  }
}

/**
 * Send status update email directly to the client when admin confirms, completes, or cancels a booking.
 * Non-blocking: returns boolean and never throws an exception to caller.
 */
export async function sendBookingStatusUpdateEmail(
  booking: Booking,
  newStatus: BookingStatus
): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) {
    telemetry.info('Resend API key is not configured; skipping status update email.', {
      bookingCode: booking.code,
      status: newStatus,
    });
    return false;
  }

  const recipientEmail = (booking.email || '').trim();
  if (!recipientEmail || !recipientEmail.includes('@')) {
    telemetry.info('Invalid or missing email in booking; skipping status update email dispatch.', {
      bookingCode: booking.code,
      email: booking.email,
    });
    return false;
  }

  const fromEmail = getFromEmail();
  const adminEmail = getAdminEmail();

  try {
    const html = generateBookingStatusUpdatedHtml(booking, newStatus);
    let subject = `Pembaruan Jadwal Konseling [${booking.code}] - Amelia BKI`;
    if (newStatus === 'terkonfirmasi') {
      subject = `[Jadwal Terkonfirmasi] Sesi Konseling [${booking.code}] - Amelia BKI`;
    } else if (newStatus === 'selesai') {
      subject = `[Sesi Selesai] Terima Kasih Telah Berbagi Ruang Konseling [${booking.code}]`;
    } else if (newStatus === 'dibatalkan') {
      subject = `[Pemberitahuan Jadwal] Informasi Sesi Konseling [${booking.code}]`;
    }

    const text = `Assalamu'alaikum Warahmatullahi Wabarakatuh, Kak ${booking.name}.\n\nStatus jadwal sesi konseling kamu (${booking.code}) telah diperbarui menjadi: ${newStatus}.\nTanggal: ${booking.date}\nWaktu: ${booking.timeSlot}\n\nLacak status selengkapnya: ${env.SITE_URL}/schedule?tab=tracker&code=${booking.code}\nWhatsApp Konselor: +62 822-1044-5785\n\nSalam hangat,\nAmelia (Amel) - BKI UIN Siber Cirebon`;
    const eventNonce = Date.now().toString(36);

    const { data, error } = await resend.emails.send(
      {
        from: fromEmail,
        to: recipientEmail,
        replyTo: adminEmail,
        subject,
        html,
        text,
        tags: [
          { name: 'category', value: 'booking-status-update' },
          { name: 'booking_code', value: booking.code },
          { name: 'new_status', value: newStatus },
        ],
      },
      {
        idempotencyKey: `status-update/${booking.id}/${newStatus}/${eventNonce}`,
      }
    );

    if (error) {
      if (
        isSandboxRestrictionError(error) &&
        recipientEmail.toLowerCase() !== adminEmail.toLowerCase()
      ) {
        const fallbackRes = await resend.emails.send(
          {
            from: fromEmail,
            to: adminEmail,
            replyTo: recipientEmail,
            subject: `[Salinan Konseli: ${recipientEmail}] ${subject}`,
            html,
            text,
            tags: [
              { name: 'category', value: 'booking-status-update-sandbox-copy' },
              { name: 'booking_code', value: booking.code },
              { name: 'new_status', value: newStatus },
            ],
          },
          {
            idempotencyKey: `status-update-fallback/${booking.id}/${newStatus}/${eventNonce}`,
          }
        );

        if (!fallbackRes.error) {
          telemetry.info('Booking status update email routed via sandbox fallback to admin inbox', {
            bookingCode: booking.code,
            originalRecipient: recipientEmail,
            fallbackRecipient: adminEmail,
            newStatus,
            emailId: fallbackRes.data?.id,
          });
          return true;
        }
      }

      telemetry.error('Failed to send booking status update email via Resend', error, {
        bookingCode: booking.code,
        recipient: recipientEmail,
        newStatus,
      });
      return false;
    }

    telemetry.info('Booking status update email sent successfully', {
      bookingCode: booking.code,
      emailId: data?.id,
      newStatus,
    });
    return true;
  } catch (err) {
    telemetry.error('Unexpected error while sending booking status update email', err, {
      bookingCode: booking.code,
      recipient: recipientEmail,
      newStatus,
    });
    return false;
  }
}

