'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Booking, AnonymousMessage, BookingStatus, Article } from '@/types';
import { OverviewHeader } from '@/components/admin/overview/OverviewHeader';
import { OverviewMetrics } from '@/components/admin/overview/OverviewMetrics';
import { OverviewRecentBookings } from '@/components/admin/overview/OverviewRecentBookings';
import { OverviewPendingCurhat } from '@/components/admin/overview/OverviewPendingCurhat';
import { useToast } from '@/context/ToastContext';

import { adminCache, useAdminRevalidate } from '@/lib/admin-cache';

export function AdminOverviewClient() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>(() => adminCache.getBookings() || []);
  const [curhatList, setCurhatList] = useState<AnonymousMessage[]>(() => adminCache.getCurhat() || []);
  const [articlesCount, setArticlesCount] = useState<number>(
    () => adminCache.getArticles()?.filter((a) => a.isPublished !== false).length || 0
  );
  const [loading, setLoading] = useState(() => !adminCache.getBookings() && !adminCache.getCurhat());
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const loadData = useCallback(async (signalArg?: unknown) => {
    const signal = signalArg instanceof AbortSignal ? signalArg : undefined;
    try {
      const [resB, resC, resA] = await Promise.all([
        fetch('/api/bookings', { signal }),
        fetch('/api/curhat', { signal }),
        fetch('/api/articles', { signal }),
      ]);

      if (resB.status === 401 || resC.status === 401 || resA.status === 401) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('amelia:admin-session-expired'));
        }
        return;
      }

      const dataB = await resB.json();
      const dataC = await resC.json();
      const dataA = await resA.json();

      if (dataB.success && Array.isArray(dataB.data)) {
        setBookings(dataB.data);
        adminCache.setBookings(dataB.data);
      }
      if (dataC.success && Array.isArray(dataC.data)) {
        setCurhatList(dataC.data);
        adminCache.setCurhat(dataC.data);
      }
      if (dataA.success && Array.isArray(dataA.data)) {
        setArticlesCount(dataA.data.filter((a: Article) => a.isPublished !== false).length);
        adminCache.setArticles(dataA.data);
      }
    } catch (e: unknown) {
      if ((e as Error)?.name !== 'AbortError') {
        console.error('Error fetching admin data:', e);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    async function fetchData() {
      try {
        const [resB, resC, resA] = await Promise.all([
          fetch('/api/bookings', { signal: controller.signal }),
          fetch('/api/curhat', { signal: controller.signal }),
          fetch('/api/articles', { signal: controller.signal }),
        ]);

        if (resB.status === 401 || resC.status === 401 || resA.status === 401) {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('amelia:admin-session-expired'));
          }
          return;
        }

        const dataB = await resB.json();
        const dataC = await resC.json();
        const dataA = await resA.json();

        if (!ignore && dataB.success && Array.isArray(dataB.data)) {
          setBookings(dataB.data);
          adminCache.setBookings(dataB.data);
        }
        if (!ignore && dataC.success && Array.isArray(dataC.data)) {
          setCurhatList(dataC.data);
          adminCache.setCurhat(dataC.data);
        }
        if (!ignore && dataA.success && Array.isArray(dataA.data)) {
          setArticlesCount(dataA.data.filter((a: Article) => a.isPublished !== false).length);
          adminCache.setArticles(dataA.data);
        }
      } catch (e: unknown) {
        if ((e as Error)?.name !== 'AbortError') {
          console.error('Error fetching admin data:', e);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, []);

  // Automatic silent background revalidation on tab re-entry and cross-tab sync
  useAdminRevalidate('bookings', loadData);
  useAdminRevalidate('curhat', loadData);
  useAdminRevalidate('articles', loadData);

  const handleConfirmBooking = async (id: string) => {
    const target = bookings.find((b) => b.id === id);
    setConfirmingId(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'terkonfirmasi' as BookingStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) => {
          const next = prev.map((b) => (b.id === id ? { ...b, status: 'terkonfirmasi' as BookingStatus } : b));
          adminCache.setBookings(next);
          return next;
        });
        toast.success(`Janji temu konseli ${target?.name || ''} berhasil dikonfirmasi.`);
      } else {
        toast.error('Gagal mengonfirmasi janji temu. Silakan coba lagi.');
      }
    } catch (e) {
      console.error('Failed to update booking status', e);
      toast.error('Gagal mengonfirmasi janji temu. Silakan coba lagi.');
    } finally {
      setConfirmingId(null);
    }
  };

  const waitingCount = bookings.filter((b) => b.status === 'menunggu').length;
  const confirmedCount = bookings.filter((b) => b.status === 'terkonfirmasi').length;
  const unansweredCount = curhatList.filter((c) => !c.isAnswered).length;

  return (
    <div className="space-y-6 sm:space-y-8">
      <OverviewHeader loading={loading} onRefresh={loadData} />

      <OverviewMetrics
        loading={loading}
        waitingBookingsCount={waitingCount}
        confirmedBookingsCount={confirmedCount}
        unansweredCurhatCount={unansweredCount}
        articlesCount={articlesCount}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
        <OverviewRecentBookings
          bookings={bookings}
          loading={loading}
          confirmingId={confirmingId}
          onConfirm={handleConfirmBooking}
        />
        <OverviewPendingCurhat
          curhatList={curhatList}
          loading={loading}
        />
      </div>
    </div>
  );
}
