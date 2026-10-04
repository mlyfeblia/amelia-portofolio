'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Booking, BookingStatus } from '@/types';
import { BookingHeader } from '@/components/admin/bookings/BookingHeader';
import { BookingFilters } from '@/components/admin/bookings/BookingFilters';
import { BookingList } from '@/components/admin/bookings/BookingList';
import { BookingDeleteModal } from '@/components/admin/bookings/BookingDeleteModal';

const CATEGORIES = [
  'Semua Topik',
  'Bimbingan & Konseling Islam',
  'Quarter-Life Crisis & Arah Hidup',
  'Kecemasan, Stres & Overthinking',
  'Akademik & Karir Mahasiswa',
  'Keluarga, Pasangan & Relasi',
  'Pengembangan Diri & Potensi',
];

export function AdminBookingsClient() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'semua'>('semua');
  const [categoryFilter, setCategoryFilter] = useState('Semua Topik');
  const [dateFilter, setDateFilter] = useState('');

  // Status updating
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<Booking | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      if (data.success) {
        setBookings(data.data);
      }
    } catch (e) {
      console.error('Failed to load bookings:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    fetch('/api/bookings')
      .then((res) => res.json())
      .then((data) => {
        if (!ignore && data.success) {
          setBookings(data.data);
        }
      })
      .catch((e) => {
        console.error('Failed to load bookings:', e);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: BookingStatus) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
        );
      }
    } catch (e) {
      console.error('Failed to update booking status:', e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmDelete = async (booking: Booking) => {
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) => prev.filter((b) => b.id !== booking.id));
        setDeleteModalOpen(false);
        setDeleteTarget(null);
      }
    } catch (e) {
      console.error('Failed to delete booking:', e);
    }
  };

  // Status Counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    bookings.forEach((b) => {
      counts[b.status] = (counts[b.status] || 0) + 1;
    });
    return counts;
  }, [bookings]);

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesStatus = statusFilter === 'semua' || b.status === statusFilter;
      const matchesCategory =
        categoryFilter === 'Semua Topik' || b.category === categoryFilter;
      const matchesDate = !dateFilter || b.date.includes(dateFilter);

      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        b.name.toLowerCase().includes(q) ||
        (b.alias && b.alias.toLowerCase().includes(q)) ||
        b.code.toLowerCase().includes(q) ||
        b.phone.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        (b.notes && b.notes.toLowerCase().includes(q));

      return matchesStatus && matchesCategory && matchesDate && matchesSearch;
    });
  }, [bookings, statusFilter, categoryFilter, dateFilter, search]);

  return (
    <div className="space-y-5 sm:space-y-6">
      <BookingHeader
        totalCount={bookings.length}
        loading={loading}
        onRefresh={loadBookings}
      />

      <BookingFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        dateFilter={dateFilter}
        onDateChange={setDateFilter}
        categories={CATEGORIES}
        statusCounts={statusCounts}
        totalCount={bookings.length}
      />

      <BookingList
        bookings={filteredBookings}
        loading={loading}
        updatingId={updatingId}
        onUpdateStatus={handleUpdateStatus}
        onDelete={(booking) => {
          setDeleteTarget(booking);
          setDeleteModalOpen(true);
        }}
      />

      <BookingDeleteModal
        booking={deleteTarget}
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
