import { NextResponse } from 'next/server';
import { getBookings, createBooking } from '@/lib/data-store';

export async function GET() {
  try {
    const bookings = await getBookings();
    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data janji temu' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, alias, phone, email, category, mode, date, timeSlot, notes } = body;

    if (!name || !phone || !email || !category || !mode || !date || !timeSlot) {
      return NextResponse.json(
        { success: false, message: 'Harap lengkapi semua kolom yang wajib diisi.' },
        { status: 400 }
      );
    }

    const newBooking = await createBooking({
      name,
      alias: alias || name,
      phone,
      email,
      category,
      mode,
      date,
      timeSlot,
      notes: notes || '',
    });

    return NextResponse.json({
      success: true,
      message: 'Jadwal konsultasi berhasil diajukan! Kami akan menghubungi Anda melalui WhatsApp/Email.',
      data: newBooking,
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan sistem saat membuat janji temu' }, { status: 500 });
  }
}
