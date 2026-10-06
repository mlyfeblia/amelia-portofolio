import { NextResponse } from 'next/server';
import { getBookingByCode, getBookingsByCodes } from '@/lib/data-store';
import { checkDistributedRateLimit, getClientIp } from '@/lib/rate-limiter';
import { telemetry } from '@/lib/telemetry';

export async function GET(request: Request) {
  const ip = getClientIp(request);
  try {
    // Rate limit: 40 tracking requests per minute per IP
    const rateCheck = await checkDistributedRateLimit(`booking_track:${ip}`, 40, 60);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          message: `Terlalu banyak permintaan pelacakan status. Silakan tunggu ${rateCheck.retryAfterSeconds} detik.`,
        },
        {
          status: 429,
          headers: { 'Retry-After': rateCheck.retryAfterSeconds.toString() },
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const singleCode = searchParams.get('code');
    const multipleCodes = searchParams.get('codes');

    // Case 1: Batch lookup by codes (from client localStorage)
    if (multipleCodes) {
      const codeList = multipleCodes
        .split(',')
        .map((c) => c.trim().toUpperCase())
        .filter((c) => c.length > 0)
        .slice(0, 15);

      if (codeList.length === 0) {
        return NextResponse.json({ success: true, data: [] });
      }

      const rows = await getBookingsByCodes(codeList);
      const sanitized = rows.map((b) => ({
        id: b.id,
        code: b.code,
        name: b.name,
        alias: b.alias,
        category: b.category,
        mode: b.mode,
        date: b.date,
        timeSlot: b.timeSlot,
        notes: b.notes,
        status: b.status,
        createdAt: b.createdAt,
      }));

      return NextResponse.json({ success: true, data: sanitized });
    }

    // Case 2: Single code lookup
    const cleanSingleCode = singleCode?.trim().toUpperCase().replace(/\s+/g, '') || '';
    if (!cleanSingleCode) {
      return NextResponse.json(
        { success: false, message: 'Kode referensi janji temu wajib dicantumkan.' },
        { status: 400 }
      );
    }

    const booking = await getBookingByCode(cleanSingleCode);
    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message: `Janji temu dengan kode referensi "${cleanSingleCode}" tidak ditemukan. Pastikan kodenya sesuai (contoh: BKI-2610-XXXXXX).`,
        },
        { status: 404 }
      );
    }

    const sanitized = {
      id: booking.id,
      code: booking.code,
      name: booking.name,
      alias: booking.alias,
      category: booking.category,
      mode: booking.mode,
      date: booking.date,
      timeSlot: booking.timeSlot,
      notes: booking.notes,
      status: booking.status,
      createdAt: booking.createdAt,
    };

    return NextResponse.json({ success: true, data: sanitized });
  } catch (error) {
    telemetry.error('Error tracking booking by code', error, {
      route: '/api/bookings/track',
      ip,
    });
    return NextResponse.json(
      { success: false, message: 'Terjadi kendala saat memeriksa status janji temu.' },
      { status: 500 }
    );
  }
}
