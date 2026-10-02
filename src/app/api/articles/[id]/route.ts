import { NextResponse } from 'next/server';
import { updateArticle } from '@/lib/data-store';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const updated = await updateArticle(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Artikel tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui artikel' },
      { status: 500 }
    );
  }
}
