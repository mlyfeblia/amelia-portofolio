'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Booking, BookingStatus, BOOKING_CATEGORIES } from '@/types';
import dynamic from 'next/dynamic';
import { useToast } from '@/context/ToastContext';
import { BookingHeader } from '@/components/admin/bookings/BookingHeader';
import { BookingFilters } from '@/components/admin/bookings/BookingFilters';
import { BookingList } from '@/components/admin/bookings/BookingList';

const BookingDeleteModal = dynamic(
  () => import('@/components/admin/bookings/BookingDeleteModal').then((m) => m.BookingDeleteModal),
  { ssr: false }
);

const ITEMS_PER_PAGE = 6;

const CATEGORIES = [
  'Semua Topik',
  ...BOOKING_CATEGORIES,
];

export function AdminBookingsClient() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [search, setSearch] = useState(() => {
    if (typeof window === 'undefined') return '';
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('q') || sessionStorage.getItem('admin_bookings_q') || '';
    } catch {
      return '';
    }
  });

  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'semua'>(() => {
    if (typeof window === 'undefined') return 'semua';
    try {
      const params = new URLSearchParams(window.location.search);
      const s = params.get('status') || sessionStorage.getItem('admin_bookings_status');
      if (s) return s as BookingStatus | 'semua';
    } catch {}
    return 'semua';
  });

  const [categoryFilter, setCategoryFilter] = useState(() => {
    if (typeof window === 'undefined') return 'Semua Topik';
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('topik') || sessionStorage.getItem('admin_bookings_topik') || 'Semua Topik';
    } catch {
      return 'Semua Topik';
    }
  });

  const [dateFilter, setDateFilter] = useState(() => {
    if (typeof window === 'undefined') return '';
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('tgl') || sessionStorage.getItem('admin_bookings_tgl') || '';
    } catch {
      return '';
    }
  });

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
    setCurrentPage(1);
    syncFilterParams(statusFilter, categoryFilter, dateFilter, val);
  };
  const handleStatusChange = (val: BookingStatus | 'semua') => {
    setStatusFilter(val);
    setCurrentPage(1);
    syncFilterParams(val, categoryFilter, dateFilter, search);
  };
  const handleCategoryChange = (val: string) => {
    setCategoryFilter(val);
    setCurrentPage(1);
    syncFilterParams(statusFilter, val, dateFilter, search);
  };
  const handleDateChange = (val: string) => {
    setDateFilter(val);
    setCurrentPage(1);
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
    const target = bookings.find((b) => b.id === id);
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
        if (newStatus === 'terkonfirmasi') {
          toast.success(`Janji temu konseli ${target?.name || ''} berhasil dikonfirmasi.`);
        } else if (newStatus === 'selesai') {
          toast.success(`Sesi konseling ${target?.name || ''} telah ditandai selesai.`);
        } else if (newStatus === 'dibatalkan') {
          toast.info(`Janji temu konseli ${target?.name || ''} telah dibatalkan.`);
        }
      } else {
        toast.error('Gagal memperbarui status janji temu. Silakan coba lagi.');
      }
    } catch (e) {
      console.error('Failed to update booking status:', e);
      toast.error('Gagal memperbarui status janji temu. Silakan coba lagi.');
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
        toast.info(`Janji temu ${booking.name} berhasil dihapus.`);
      } else {
        toast.error('Gagal menghapus janji temu.');
      }
    } catch (e) {
      console.error('Failed to delete booking:', e);
      toast.error('Gagal menghapus janji temu.');
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

  // Available unique dates sorted descending with human-readable Indonesian labels
  const availableDates = useMemo(() => {
    const dateCounts: Record<string, number> = {};
    bookings.forEach((b) => {
      if (b.date) {
        dateCounts[b.date] = (dateCounts[b.date] || 0) + 1;
      }
    });

    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());

    return Object.keys(dateCounts)
      .sort((a, b) => b.localeCompare(a))
      .map((dateStr) => {
        let formattedLabel = dateStr;
        try {
          // Parse YYYY-MM-DD safely
          const [y, m, d] = dateStr.split('-').map(Number);
          if (y && m && d) {
            const dt = new Date(y, m - 1, d);
            formattedLabel = new Intl.DateTimeFormat('id-ID', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }).format(dt);
          }
        } catch {}

        const isToday = dateStr === todayStr;
        const label = isToday ? `Hari Ini (${formattedLabel})` : formattedLabel;

        return {
          value: dateStr,
          label,
          count: dateCounts[dateStr],
        };
      });
  }, [bookings]);

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesStatus = statusFilter === 'semua' || b.status === statusFilter;
      const matchesCategory =
        categoryFilter === 'Semua Topik' || b.category === categoryFilter;
      const matchesDate = !dateFilter || b.date === dateFilter || b.date.includes(dateFilter);

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
    setCurrentPage(1);
    syncFilterParams('semua', 'Semua Topik', '', '');
  };

  const hasActiveFilters = Boolean(
    search.trim() ||
    statusFilter !== 'semua' ||
    categoryFilter !== 'Semua Topik' ||
    dateFilter.trim()
  );

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedBookings = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredBookings.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBookings, safePage]);

  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

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
        availableDates={availableDates}
        categories={CATEGORIES}
        statusCounts={statusCounts}
        totalCount={bookings.length}
      />

      <BookingList
        bookings={paginatedBookings}
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
        currentPage={safePage}
        totalPages={totalPages}
        totalItems={filteredBookings.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
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
