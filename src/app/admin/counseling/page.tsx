import React from 'react';
import type { Metadata } from 'next';
import { AdminCounselingClient } from '@/components/admin/counseling/AdminCounselingClient';

export const metadata: Metadata = {
  title: 'Kelola Ruang Curhat',
  description: 'Daftar dan berikan tanggapan pesan curhat anonim konseli Amelia.',
};

export default function AdminCounselingPage() {
  return <AdminCounselingClient />;
}
