import React from 'react';
import type { Metadata } from 'next';
import { AdminOverviewClient } from '@/components/admin/overview/AdminOverviewClient';

export const metadata: Metadata = {
  title: {
    absolute: 'Dashboard Pengelola | Admin Amelia',
  },
  description: 'Ringkasan operasional janji temu konseling, pesan curhat, dan artikel Amelia.',
};

export default function AdminOverviewPage() {
  return <AdminOverviewClient />;
}
