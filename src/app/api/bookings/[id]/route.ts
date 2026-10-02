import { NextResponse } from 'next/server';
import { updateBookingStatus } from '@/lib/data-store';
import { BookingStatus } from '@/types';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status } = body as { status: BookingStatus };

    if (!status) {
      return NextResponse.json({ success: false, message: 'Status diperlukan' }, { status: 400 });
    }

    const updated = await updateBookingStatus(id, status);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Janji temu tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ success: false, message: 'Gagal memperbarui status janji temu' }, { status: 500 });
  }
}
