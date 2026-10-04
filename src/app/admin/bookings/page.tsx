import React from 'react';
import type { Metadata } from 'next';
import { AdminBookingsClient } from '@/components/admin/bookings/AdminBookingsClient';

export const metadata: Metadata = {
  title: 'Kelola Janji Temu',
  description: 'Daftar dan kelola status reservasi sesi konseling privat Amelia.',
};

export default function AdminBookingsPage() {
  return <AdminBookingsClient />;
}
