import { NextResponse } from 'next/server';
import { getCurhatList, createCurhat } from '@/lib/data-store';

export async function GET() {
  try {
    const list = await getCurhatList();
    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    console.error('Error fetching curhat:', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil curhat' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { alias, category, message, isPublic = true } = body;

    if (!message || message.trim().length < 10) {
      return NextResponse.json(
        { success: false, message: 'Pesan cerita minimal 10 karakter.' },
        { status: 400 }
      );
    }

    const newCurhat = await createCurhat({
      alias: alias || 'Hamba Allah',
      category: category || 'Kisah & Pertanyaan',
      message: message.trim(),
      isPublic: Boolean(isPublic),
    });

    return NextResponse.json({
      success: true,
      message: 'Cerita/pertanyaanmu berhasil dikirimkan ke Kak Amel.',
      data: newCurhat,
    });
  } catch (error) {
    console.error('Error posting curhat:', error);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}
