'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Booking, BookingStatus, BOOKING_CATEGORIES } from '@/types';
import dynamic from 'next/dynamic';
import { BookingHeader } from '@/components/admin/bookings/BookingHeader';
import { BookingFilters } from '@/components/admin/bookings/BookingFilters';
import { BookingList } from '@/components/admin/bookings/BookingList';

const BookingDeleteModal = dynamic(
  () => import('@/components/admin/bookings/BookingDeleteModal').then((m) => m.BookingDeleteModal),
  { ssr: false }
);

const CATEGORIES = [
  'Semua Topik',
  ...BOOKING_CATEGORIES,
];

export function AdminBookingsClient() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'semua'>('semua');
  const [categoryFilter, setCategoryFilter] = useState('Semua Topik');
  const [dateFilter, setDateFilter] = useState('');

  // Sync filters from URL and sessionStorage on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const s = params.get('status') || sessionStorage.getItem('admin_bookings_status');
      const c = params.get('topik') || sessionStorage.getItem('admin_bookings_topik');
      const d = params.get('tgl') || sessionStorage.getItem('admin_bookings_tgl');
      const q = params.get('q') || sessionStorage.getItem('admin_bookings_q');

      if (s) setStatusFilter(s as BookingStatus | 'semua');
      if (c) setCategoryFilter(c);
      if (d) setDateFilter(d);
      if (q) setSearch(q);
    } catch {}
  }, []);

  const syncFilterParams = (
    s: BookingStatus | 'semua',
    c: string,
    d: string,
    q: string
  ) => {
    try {
      if (s && s !== 'semua') sessionStorage.setItem('admin_bookings_status', s);
      else sessionStorage.removeItem('admin_bookings_status');

      if (c && c !== 'Semua Topik') sessionStorage.setItem('admin_bookings_topik', c);
      else sessionStorage.removeItem('admin_bookings_topik');

      if (d) sessionStorage.setItem('admin_bookings_tgl', d);
      else sessionStorage.removeItem('admin_bookings_tgl');

      if (q.trim()) sessionStorage.setItem('admin_bookings_q', q.trim());
      else sessionStorage.removeItem('admin_bookings_q');

      const url = new URL(window.location.href);
      if (s && s !== 'semua') url.searchParams.set('status', s);
      else url.searchParams.delete('status');

      if (c && c !== 'Semua Topik') url.searchParams.set('topik', c);
      else url.searchParams.delete('topik');

      if (d) url.searchParams.set('tgl', d);
      else url.searchParams.delete('tgl');

      if (q.trim()) url.searchParams.set('q', q.trim());
      else url.searchParams.delete('q');

      window.history.replaceState({}, '', url.toString());
    } catch {}
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    syncFilterParams(statusFilter, categoryFilter, dateFilter, val);
  };
  const handleStatusChange = (val: BookingStatus | 'semua') => {
    setStatusFilter(val);
    syncFilterParams(val, categoryFilter, dateFilter, search);
  };
  const handleCategoryChange = (val: string) => {
    setCategoryFilter(val);
    syncFilterParams(statusFilter, val, dateFilter, search);
  };
  const handleDateChange = (val: string) => {
    setDateFilter(val);
    syncFilterParams(statusFilter, categoryFilter, val, search);
  };

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

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('semua');
    setCategoryFilter('Semua Topik');
    setDateFilter('');
    syncFilterParams('semua', 'Semua Topik', '', '');
  };

  const hasActiveFilters = Boolean(
    search.trim() ||
    statusFilter !== 'semua' ||
    categoryFilter !== 'Semua Topik' ||
    dateFilter.trim()
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      <BookingHeader
        totalCount={bookings.length}
        loading={loading}
        onRefresh={loadBookings}
      />

      <BookingFilters
        search={search}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        categoryFilter={categoryFilter}
        onCategoryChange={handleCategoryChange}
        dateFilter={dateFilter}
        onDateChange={handleDateChange}
        categories={CATEGORIES}
        statusCounts={statusCounts}
        totalCount={bookings.length}
      />

      <BookingList
        bookings={filteredBookings}
        loading={loading}
        updatingId={updatingId}
        search={search}
        statusFilter={statusFilter}
        categoryFilter={categoryFilter}
        dateFilter={dateFilter}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
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
