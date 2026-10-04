import React from 'react';
import type { Metadata } from 'next';
import { AdminArticlesClient } from '@/components/admin/articles/AdminArticlesClient';

export const metadata: Metadata = {
  title: 'Kelola Artikel & Publikasi',
  description: 'Daftar publikasi dan draf artikel reflektif bimbingan konseling Amelia.',
};

export default function AdminArticlesPage() {
  return <AdminArticlesClient />;
}
