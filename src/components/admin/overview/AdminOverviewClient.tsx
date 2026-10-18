'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Booking, AnonymousMessage, BookingStatus } from '@/types';
import { OverviewHeader } from '@/components/admin/overview/OverviewHeader';
import { OverviewMetrics } from '@/components/admin/overview/OverviewMetrics';
import { OverviewRecentBookings } from '@/components/admin/overview/OverviewRecentBookings';
import { OverviewPendingCurhat } from '@/components/admin/overview/OverviewPendingCurhat';

import { adminCache, useAdminRevalidate } from '@/lib/admin-cache';

export function AdminOverviewClient() {
  const [bookings, setBookings] = useState<Booking[]>(() => adminCache.getBookings() || []);
  const [curhatList, setCurhatList] = useState<AnonymousMessage[]>(() => adminCache.getCurhat() || []);
  const [articlesCount, setArticlesCount] = useState<number>(() => adminCache.getArticles()?.length || 0);
  const [loading, setLoading] = useState(() => !adminCache.getBookings() && !adminCache.getCurhat());

  const loadData = useCallback(async (signalArg?: unknown) => {
    const signal = signalArg instanceof AbortSignal ? signalArg : undefined;
    const hasCached = Boolean(adminCache.getBookings() || adminCache.getCurhat());
    if (!hasCached) {
      setLoading(true);
    }
    try {
      const [resB, resC, resA] = await Promise.all([
        fetch('/api/bookings', { signal }),
        fetch('/api/curhat', { signal }),
        fetch('/api/articles', { signal }),
      ]);
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
        setArticlesCount(dataA.data.length);
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
    const controller = new AbortController();
    loadData(controller.signal);
    return () => {
      controller.abort();
    };
  }, [loadData]);

  // Automatic silent background revalidation on tab re-entry and cross-tab sync
  useAdminRevalidate('bookings', loadData);
  useAdminRevalidate('curhat', loadData);

  const handleConfirmBooking = async (id: string) => {
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
      }
    } catch (e) {
      console.error('Failed to update booking status', e);
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
