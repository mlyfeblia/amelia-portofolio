'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Booking, AnonymousMessage, BookingStatus } from '@/types';
import { OverviewHeader } from '@/components/admin/overview/OverviewHeader';
import { OverviewMetrics } from '@/components/admin/overview/OverviewMetrics';
import { OverviewRecentBookings } from '@/components/admin/overview/OverviewRecentBookings';
import { OverviewPendingCurhat } from '@/components/admin/overview/OverviewPendingCurhat';

export function AdminOverviewClient() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [curhatList, setCurhatList] = useState<AnonymousMessage[]>([]);
  const [articlesCount, setArticlesCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [resB, resC, resA] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/curhat'),
        fetch('/api/articles'),
      ]);
      const dataB = await resB.json();
      const dataC = await resC.json();
      const dataA = await resA.json();

      if (dataB.success) setBookings(dataB.data);
      if (dataC.success) setCurhatList(dataC.data);
      if (dataA.success) setArticlesCount(dataA.data.length);
    } catch (e) {
      console.error('Error fetching admin data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    Promise.all([
      fetch('/api/bookings').then((r) => r.json()),
      fetch('/api/curhat').then((r) => r.json()),
      fetch('/api/articles').then((r) => r.json()),
    ])
      .then(([dataB, dataC, dataA]) => {
        if (!ignore) {
          if (dataB.success) setBookings(dataB.data);
          if (dataC.success) setCurhatList(dataC.data);
          if (dataA.success) setArticlesCount(dataA.data.length);
        }
      })
      .catch((e) => {
        console.error('Error fetching admin data:', e);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleConfirmBooking = async (id: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'terkonfirmasi' as BookingStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: 'terkonfirmasi' } : b))
        );
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
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
