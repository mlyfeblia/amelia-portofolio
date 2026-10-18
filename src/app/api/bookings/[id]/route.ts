import { NextResponse } from 'next/server';
import { updateBookingStatus, deleteBooking, getBookingById } from '@/lib/data-store';
import { BookingStatus } from '@/types';
import { isAuthenticatedAdmin } from '@/lib/admin-auth';
import { telemetry } from '@/lib/telemetry';
import { sendBookingStatusUpdateEmail } from '@/lib/resend';
import { sendPushNotificationToBooking } from '@/lib/web-push-server';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const isAuth = await isAuthenticatedAdmin(request);
    if (!isAuth) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Silakan login sebagai pengelola.' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, message: 'Format payload tidak valid' }, { status: 400 });
    }

    const { status } = body;
    const allowedStatuses: BookingStatus[] = ['menunggu', 'terkonfirmasi', 'selesai', 'dibatalkan'];

    if (!status || typeof status !== 'string' || !allowedStatuses.includes(status as BookingStatus)) {
      return NextResponse.json(
        { success: false, message: 'Status tidak valid. Harus berupa: menunggu, terkonfirmasi, selesai, atau dibatalkan.' },
        { status: 400 }
      );
    }

    const existing = await getBookingById(id);
    const updated = await updateBookingStatus(id, status as BookingStatus);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Janji temu tidak ditemukan' }, { status: 404 });
    }

    // Await email & Web Push notifications if status changed so serverless function completes delivery
    if (existing && existing.status !== status) {
      const statusTitle =
        status === 'terkonfirmasi'
          ? 'Jadwal Konseling Terkonfirmasi!'
          : status === 'selesai'
          ? 'Sesi Konseling Selesai'
          : `Status Jadwal: ${status}`;
      const statusBody =
        status === 'terkonfirmasi'
          ? 'Alhamdulillah, jadwal konselingmu telah dikonfirmasi oleh Amel. Buka web untuk melihat detail.'
          : status === 'selesai'
          ? 'Sesi konselingmu telah selesai dilaksanakan. Terima kasih atas kepercayaanmu.'
          : `Status reservasi [${updated.code}] diperbarui menjadi ${status}.`;

      const notificationTasks: Promise<unknown>[] = [
        sendPushNotificationToBooking(updated.code, {
          title: statusTitle,
          body: statusBody,
          url: `/schedule?code=${updated.code}`,
        }),
      ];

      if (updated.email) {
        notificationTasks.push(sendBookingStatusUpdateEmail(updated, status as BookingStatus));
      }

      await Promise.allSettled(notificationTasks);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    telemetry.error('Error updating booking status', error, { route: '/api/bookings/[id]', method: 'PATCH' });
    return NextResponse.json({ success: false, message: 'Gagal memperbarui status janji temu' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const isAuth = await isAuthenticatedAdmin(request);
    if (!isAuth) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Silakan login sebagai pengelola.' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const deleted = await deleteBooking(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Janji temu tidak ditemukan atau gagal dihapus' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Janji temu berhasil dihapus' });
  } catch (error) {
    telemetry.error('Error deleting booking', error, { route: '/api/bookings/[id]', method: 'DELETE' });
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus janji temu' },
      { status: 500 }
    );
  }
}
