import { NextRequest, NextResponse } from 'next/server';
import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { createAdminClient } from '@insforge/sdk';
import { isAuthenticatedAdmin } from '@/lib/admin-auth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const isAuth = await isAuthenticatedAdmin(req);
    if (!isAuth) {
      return NextResponse.json(
        { success: false, message: 'Tidak memiliki izin akses. Masuk sebagai pengelola konselor terlebih dahulu.' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = (formData.get('file') || formData.get('image')) as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'Tidak ada berkas gambar yang diunggah.' },
        { status: 400 }
      );
    }

    const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { success: false, message: 'Format berkas tidak didukung. Hanya gambar JPEG, PNG, WebP, atau AVIF yang diperbolehkan.' },
        { status: 400 }
      );
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: 'Ukuran berkas melebihi batas maksimal 5MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const rawBuffer = Buffer.from(bytes);

    // Validate binary header magic bytes to prevent disguised or polyglot files
    const isMagicValid =
      rawBuffer.length >= 12 &&
      ((rawBuffer[0] === 0xff && rawBuffer[1] === 0xd8 && rawBuffer[2] === 0xff) || // JPEG
        (rawBuffer[0] === 0x89 && rawBuffer[1] === 0x50 && rawBuffer[2] === 0x4e && rawBuffer[3] === 0x47) || // PNG
        (rawBuffer[0] === 0x52 && rawBuffer[1] === 0x49 && rawBuffer[2] === 0x46 && rawBuffer[3] === 0x46 && rawBuffer[8] === 0x57 && rawBuffer[9] === 0x45 && rawBuffer[10] === 0x42 && rawBuffer[11] === 0x50) || // WebP
        (rawBuffer[4] === 0x66 && rawBuffer[5] === 0x74 && rawBuffer[6] === 0x79 && rawBuffer[7] === 0x70)); // AVIF/ISO Base Media

    if (!isMagicValid) {
      return NextResponse.json(
        { success: false, message: 'Struktur berkas gambar terindikasi rusak atau tidak sesuai dengan format aslinya.' },
        { status: 400 }
      );
    }

    const originalName = file.name || 'foto-artikel';
    const baseNameWithoutExt = path.parse(originalName).name;
    const cleanBaseName =
      baseNameWithoutExt
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 36) || 'foto-artikel';
    const safeId = crypto.randomBytes(3).toString('hex');
    const filename = `${cleanBaseName}-${safeId}.webp`;

    let processedBuffer = rawBuffer;
    const mimeType = 'image/webp';

    const isWebp = file.type === 'image/webp' || file.name.toLowerCase().endsWith('.webp');
    const isSmallWebp = isWebp && file.size <= 500 * 1024; // <= 500 KB

    if (!isSmallWebp) {
      try {
        const sharp = (await import('sharp')).default;
        processedBuffer = await sharp(rawBuffer)
          .resize({ width: 1600, withoutEnlargement: true })
          .webp({ quality: 85, effort: 4 })
          .toBuffer();
      } catch (sharpErr) {
        console.warn('Sharp image decoding failed:', sharpErr);
        return NextResponse.json(
          {
            success: false,
            message: 'Berkas gambar tidak dapat diproses (rusak atau format tidak valid).',
          },
          { status: 400 }
        );
      }
    }

    // 1. Primary: InsForge Cloud Object Storage
    const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://y8ug7mrt.ap-southeast.insforge.app';
    const apiKey = process.env.INSFORGE_API_KEY;

    if (baseUrl && apiKey) {
      try {
        const insforge = createAdminClient({ baseUrl, apiKey });
        const uploadBlob = new Blob([processedBuffer], { type: mimeType });
        const uploadFile = new File([uploadBlob], filename, { type: mimeType });

        const uploadRes = await insforge.storage.from('articles').upload(filename, uploadFile);

        if (!uploadRes.error && uploadRes.data?.url) {
          return NextResponse.json({
            success: true,
            url: uploadRes.data.url,
            key: uploadRes.data.key || filename,
            message: 'Foto berhasil diunggah ke penyimpanan awan InsForge.',
          });
        }

        if (uploadRes.error) {
          console.warn('InsForge storage upload returned error:', uploadRes.error);
        }
      } catch (insforgeErr) {
        console.warn('Error connecting to InsForge storage:', insforgeErr);
      }
    }

    // 2. Local filesystem fallback (ONLY in non-serverless environments like local dev)
    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    if (!isServerless) {
      const uploadDir = path.join(process.cwd(), 'public', 'images', 'articles');
      await fs.mkdir(uploadDir, { recursive: true });
      const filepath = path.join(uploadDir, filename);
      await fs.writeFile(filepath, processedBuffer);

      return NextResponse.json({
        success: true,
        url: `/images/articles/${filename}`,
        key: filename,
        message: 'Foto berhasil disimpan di penyimpanan lokal.',
      });
    }

    // If on serverless and cloud storage was unavailable
    return NextResponse.json(
      {
        success: false,
        message: 'Layanan penyimpanan berkas cloud sementara tidak tersedia. Silakan coba kembali sesaat lagi.',
      },
      { status: 503 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat memproses unggahan.';
    console.error('Error handling upload:', error);
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
