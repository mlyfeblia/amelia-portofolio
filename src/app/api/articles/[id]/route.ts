import { NextResponse } from 'next/server';
import { updateArticle, deleteArticle } from '@/lib/data-store';
import { isAuthenticatedAdmin } from '@/lib/admin-auth';
import { validateArticleUpdateInput } from '@/lib/validators';
import { telemetry } from '@/lib/telemetry';

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
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, message: 'ID artikel tidak valid' },
        { status: 400 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Format JSON payload tidak valid' },
        { status: 400 }
      );
    }

    const validation = validateArticleUpdateInput(body);
    if (!validation.success || !validation.data) {
      return NextResponse.json(
        { success: false, message: validation.error || 'Data artikel tidak valid' },
        { status: 400 }
      );
    }

    const updated = await updateArticle(id, validation.data);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Artikel tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    telemetry.error('Error updating article', error, { route: '/api/articles/[id]', method: 'PATCH' });
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui artikel' },
      { status: 500 }
    );
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
    const deleted = await deleteArticle(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Artikel tidak ditemukan atau gagal dihapus' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Artikel berhasil dihapus' });
  } catch (error) {
    telemetry.error('Error deleting article', error, { route: '/api/articles/[id]', method: 'DELETE' });
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus artikel' },
      { status: 500 }
    );
  }
}
