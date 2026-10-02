import { NextResponse } from 'next/server';
import { answerCurhat } from '@/lib/data-store';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { answer, isPublic } = body;

    if (!answer && typeof isPublic !== 'boolean') {
      return NextResponse.json({ success: false, message: 'Data update tidak valid' }, { status: 400 });
    }

    const updated = await answerCurhat(id, answer, isPublic);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Pesan curhat tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating curhat:', error);
    return NextResponse.json({ success: false, message: 'Gagal memperbarui curhat' }, { status: 500 });
  }
}
