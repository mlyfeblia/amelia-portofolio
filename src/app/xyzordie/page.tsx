import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { isValidAdminSessionToken, COOKIE_NAME } from '@/lib/admin-auth';
import { getArticles } from '@/lib/data-store';
import SecretViewClient from './SecretViewClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Not Found',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default async function SecretXyzPage() {
  // 1. Layer 1 Check: Sesi Login Admin Harus Aktif
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  const isAdmin = isValidAdminSessionToken(token);

  // Jika belum login admin, langsung lempar notFound() (100% identik tampilan 404 asli)
  if (!isAdmin) {
    notFound();
  }

  // 2. Ambil data artikel awal
  const rawArticles = await getArticles(false);
  const initialArticles = rawArticles.map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    views: a.views ?? 0,
    isPublished: a.isPublished ?? true,
    publishedAt: a.publishedAt,
    category: a.category || 'Refleksi Diri',
  }));

  // 3. Render gerbang rahasia & dasbor
  return <SecretViewClient initialArticles={initialArticles} />;
}
