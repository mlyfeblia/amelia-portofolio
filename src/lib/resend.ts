import { Resend } from 'resend';
import { Booking, AnonymousMessage, BookingStatus } from '@/types';
import { generateBookingConfirmationHtml } from './email-templates/booking-confirmation-template';
import { generateBookingAdminAlertHtml } from './email-templates/booking-admin-alert-template';
import { generateCurhatAdminAlertHtml } from './email-templates/curhat-admin-alert-template';
import { generateBookingStatusUpdatedHtml } from './email-templates/booking-status-updated-template';
import { telemetry } from './telemetry';

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;
const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'mlyfeblia@gmail.com';
const fromEmail = process.env.RESEND_FROM_EMAIL || 'Amelia BKI <onboarding@resend.dev>';

/**
 * Send booking confirmation email directly to the client/user.
 * Non-blocking: returns boolean and never throws an exception to caller.
 */
export async function sendBookingConfirmationEmail(booking: Booking): Promise<boolean> {
  if (!resend) {
    telemetry.info('Resend API key is not configured; skipping booking confirmation email.', {
      bookingCode: booking.code,
      recipient: booking.email,
    });
    return false;
  }

  if (!booking.email || !booking.email.includes('@')) {
    telemetry.info('Invalid or missing email in booking; skipping email dispatch.', {
      bookingCode: booking.code,
      email: booking.email,
    });
    return false;
  }

  try {
    const html = generateBookingConfirmationHtml(booking);
    const { data, error } = await resend.emails.send(
      {
        from: fromEmail,
        to: booking.email,
        subject: `Konfirmasi Permohonan Sesi Konseling [${booking.code}] - Amelia BKI`,
        html,
        text: `Assalamu'alaikum Warahmatullahi Wabarakatuh, Kak ${booking.name}.\n\nPermohonan sesi konseling kamu telah berhasil diterima.\nKode Reservasi: ${booking.code}\nTanggal: ${booking.date}\nSesi Waktu: ${booking.timeSlot}\nFormat: ${booking.mode}\nTopik: ${booking.category}\n\nLacak status: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://amelia.portofolio.id'}/schedule?code=${booking.code}\nWhatsApp Konselor: +62 822-1044-5785\n\nSalam hangat,\nAmelia (Amel) - BKI UIN Siber Cirebon`,
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
      telemetry.error('Failed to send booking confirmation email via Resend', error, {
        bookingCode: booking.code,
        recipient: booking.email,
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
      recipient: booking.email,
    });
    return false;
  }
}

/**
 * Send notification email to Amelia (admin) when a new counseling booking is created.
 * Non-blocking: returns boolean and never throws an exception to caller.
 */
export async function sendAdminBookingAlertEmail(booking: Booking): Promise<boolean> {
  if (!resend) {
    telemetry.info('Resend API key is not configured; skipping admin booking alert email.', {
      bookingCode: booking.code,
    });
    return false;
  }

  try {
    const html = generateBookingAdminAlertHtml(booking);
    const text = `Permohonan Jadwal Konseling Baru Masuk\n\nDetail Konseli:\n- Nama: ${booking.name}${booking.alias ? ` (${booking.alias})` : ''}\n- Kontak WhatsApp: ${booking.phone}\n- Email: ${booking.email}\n- Topik: ${booking.category}\n- Format: ${booking.mode}\n- Tanggal: ${booking.date}\n- Sesi: ${booking.timeSlot}\n- Catatan: ${booking.notes || 'Tidak ada catatan tambahan'}\n- Kode Reservasi: ${booking.code}\n\nBuka Panel Admin: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://amelia.portofolio.id'}/admin/bookings`;

    const { data, error } = await resend.emails.send(
      {
        from: fromEmail,
        to: adminEmail,
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
  if (!resend) {
    telemetry.info('Resend API key is not configured; skipping admin curhat alert email.', {
      curhatId: curhat.id,
    });
    return false;
  }

  try {
    const html = generateCurhatAdminAlertHtml(curhat);
    const text = `Pesan Curhat Anonim Baru Masuk\n\nDetail Curhat:\n- Nama Samaran: ${curhat.alias || 'Teman Anonim'}\n- Kategori: ${curhat.category || 'Curhat Umum'}\n- Waktu: ${curhat.createdAt}\n\nIsi Pesan:\n"${curhat.message}"\n\nTanggapi di Panel Admin: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://amelia.portofolio.id'}/admin/counseling`;

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
  if (!resend) {
    telemetry.info('Resend API key is not configured; skipping status update email.', {
      bookingCode: booking.code,
      status: newStatus,
    });
    return false;
  }

  if (!booking.email || !booking.email.includes('@')) {
    telemetry.info('Invalid or missing email in booking; skipping status update email dispatch.', {
      bookingCode: booking.code,
      email: booking.email,
    });
    return false;
  }

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

    const { data, error } = await resend.emails.send(
      {
        from: fromEmail,
        to: booking.email,
        subject,
        html,
        text: `Assalamu'alaikum Warahmatullahi Wabarakatuh, Kak ${booking.name}.\n\nStatus jadwal sesi konseling kamu (${booking.code}) telah diperbarui menjadi: ${newStatus}.\nTanggal: ${booking.date}\nWaktu: ${booking.timeSlot}\n\nLacak status selengkapnya: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://amelia.portofolio.id'}/schedule?code=${booking.code}\nWhatsApp Konselor: +62 822-1044-5785\n\nSalam hangat,\nAmelia (Amel) - BKI UIN Siber Cirebon`,
        tags: [
          { name: 'category', value: 'booking-status-update' },
          { name: 'booking_code', value: booking.code },
          { name: 'new_status', value: newStatus },
        ],
      },
      {
        idempotencyKey: `status-update/${booking.id}/${newStatus}`,
      }
    );

    if (error) {
      telemetry.error('Failed to send booking status update email via Resend', error, {
        bookingCode: booking.code,
        recipient: booking.email,
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
      recipient: booking.email,
      newStatus,
    });
    return false;
  }
}

