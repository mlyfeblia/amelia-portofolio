import { NextResponse } from 'next/server';
import { updateCurhat, deleteCurhat } from '@/lib/data-store';
import { isAuthenticatedAdmin } from '@/lib/admin-auth';
import { sanitizeString } from '@/lib/validators';
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
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, message: 'Format data JSON tidak valid' }, { status: 400 });
    }
    const { answer, isPublic, showOnLandingPage } = body;

    if (
      typeof answer === 'undefined' &&
      typeof isPublic !== 'boolean' &&
      typeof showOnLandingPage !== 'boolean'
    ) {
      return NextResponse.json({ success: false, message: 'Data update tidak valid' }, { status: 400 });
    }

    if (answer !== undefined && (typeof answer !== 'string' || answer.length > 2500)) {
      return NextResponse.json({ success: false, message: 'Jawaban pengelola maksimal 2500 karakter' }, { status: 400 });
    }

    const updateOptions: { answer?: string; isPublic?: boolean; showOnLandingPage?: boolean } = {};
    if (typeof answer === 'string') {
      updateOptions.answer = sanitizeString(answer);
    }
    if (typeof isPublic === 'boolean') {
      updateOptions.isPublic = isPublic;
    }
    if (typeof showOnLandingPage === 'boolean') {
      updateOptions.showOnLandingPage = showOnLandingPage;
    }

    const updated = await updateCurhat(id, updateOptions);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Pesan curhat tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    telemetry.error('Error answering curhat', error, { route: '/api/curhat/[id]', method: 'PATCH' });
    return NextResponse.json({ success: false, message: 'Gagal memperbarui curhat' }, { status: 500 });
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
    const deleted = await deleteCurhat(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Curhat tidak ditemukan atau gagal dihapus' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Curhat berhasil dihapus' });
  } catch (error) {
    telemetry.error('Error deleting curhat', error, { route: '/api/curhat/[id]', method: 'DELETE' });
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus curhat' },
      { status: 500 }
    );
  }
}

