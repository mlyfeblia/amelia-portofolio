import { NextResponse } from 'next/server';
import { getBookings, createBooking } from '@/lib/data-store';
import { isAuthenticatedAdmin } from '@/lib/admin-auth';
import { checkDistributedRateLimit, getClientIp } from '@/lib/rate-limiter';
import { validateBookingInput } from '@/lib/validators';
import { telemetry } from '@/lib/telemetry';
import { sendBookingConfirmationEmail, sendAdminBookingAlertEmail } from '@/lib/resend';
import { sendPushNotificationToRole } from '@/lib/web-push-server';

export async function GET(request: Request) {
  try {
    const isAuth = await isAuthenticatedAdmin(request);
    if (!isAuth) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Silakan masuk ke portal admin konselor.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const bookings = await getBookings(
      isNaN(limit) ? 100 : limit,
      isNaN(offset) ? 0 : offset
    );
    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    telemetry.error('Failed to fetch bookings', error, { route: '/api/bookings', method: 'GET' });
    return NextResponse.json({ success: false, message: 'Gagal mengambil data janji temu' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  try {
    // Limit to 10 bookings per 10 minutes (600 seconds) per IP
    const rateCheck = await checkDistributedRateLimit(`booking:${ip}`, 10, 600);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          message: `Terlalu banyak permintaan pembuatan jadwal. Silakan coba kembali dalam ${rateCheck.retryAfterSeconds} detik.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateCheck.retryAfterSeconds.toString(),
          },
        }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Format data JSON tidak valid.' },
        { status: 400 }
      );
    }

    // Server-side honeypot verification
    if (body && typeof body === 'object') {
      const b = body as Record<string, unknown>;
      if ((typeof b.botTrap === 'string' && b.botTrap.trim().length > 0) ||
          (typeof b.website === 'string' && b.website.trim().length > 0)) {
        return NextResponse.json({
          success: true,
          message: 'Jadwal konsultasi berhasil diajukan! Amel akan segera menghubungimu melalui WhatsApp atau Email ya.',
          data: { id: 'bk-filtered', code: 'BKI-OK-000' },
        });
      }
    }

    const validation = validateBookingInput(body);

    if (!validation.success || !validation.data) {
      return NextResponse.json(
        { success: false, message: validation.error || 'Data janji temu tidak valid.' },
        { status: 400 }
      );
    }

    const newBooking = await createBooking(validation.data);

    // Trigger async email notifications in background
    sendBookingConfirmationEmail(newBooking).catch((e) => console.error('Booking confirmation email error:', e));
    sendAdminBookingAlertEmail(newBooking).catch((e) => console.error('Admin booking alert email error:', e));

    // Trigger non-blocking push notification to admin devices
    sendPushNotificationToRole('admin', {
      title: 'Janji Temu Baru Diajukan!',
      body: `${newBooking.name} (${newBooking.category}) untuk jadwal ${newBooking.date}`,
      url: '/admin/bookings',
      tag: `booking-${newBooking.code}`,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Jadwal konsultasi berhasil diajukan! Amel akan segera menghubungimu melalui WhatsApp atau Email ya.',
      data: newBooking,
    });
  } catch (error) {
    telemetry.error('Error creating booking', error, { route: '/api/bookings', method: 'POST', ip });
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem saat membuat janji temu' },
      { status: 500 }
    );
  }
}
