'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  Video, 
  MessageSquare, 
  Users, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { Booking, BookingStatus, CounselingMode } from '@/types';
import { getAdminContactWhatsAppUrl } from '@/lib/whatsapp';

const STATUS_TABS: { label: string; value: BookingStatus | 'semua' }[] = [
  { label: 'Semua', value: 'semua' },
  { label: 'Menunggu', value: 'menunggu' },
  { label: 'Terkonfirmasi', value: 'terkonfirmasi' },
  { label: 'Selesai', value: 'selesai' },
  { label: 'Dibatalkan', value: 'dibatalkan' },
];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'semua'>('semua');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadBookings = async () => {
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
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const updateStatus = async (id: string, newStatus: BookingStatus) => {
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
      console.error('Failed to update status', e);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const matchesStatus = statusFilter === 'semua' || b.status === statusFilter;
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

      return matchesStatus && matchesSearch;
    });
  }, [bookings, statusFilter, search]);

  const getModeLabel = (mode: CounselingMode) => {
    switch (mode) {
      case 'online_meet':
        return { label: 'Google Meet', icon: Video };
      case 'online_chat':
        return { label: 'Chat Terjadwal', icon: MessageSquare };
      case 'tatap_muka_cirebon':
        return { label: 'Tatap Muka Cirebon', icon: Users };
      default:
        return { label: mode, icon: Video };
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'terkonfirmasi':
        return 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] border-[var(--color-accent-border)]';
      case 'menunggu':
        return 'bg-amber-500/10 text-amber-700 border-amber-200';
      case 'selesai':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'dibatalkan':
        return 'bg-rose-500/10 text-rose-700 border-rose-200';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-medium text-[var(--color-ink)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Kelola Janji Temu Konseling
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">
            Total {bookings.length} reservasi tercatat di sistem database.
          </p>
        </div>

        <button
          onClick={loadBookings}
          disabled={loading}
          className="btn-secondary text-xs py-2 px-3.5 inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Segarkan</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
        
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[var(--color-ink-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama, kode referensi, nomor WhatsApp, email, atau topik..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)]/70 focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>

        {/* Status Tabs (Horizontally scrollable on mobile) */}
        <div className="flex items-center gap-1.5 pt-1 border-t border-[var(--color-paper-border)] overflow-x-auto no-scrollbar pb-1">
          {STATUS_TABS.map((tab) => {
            const count =
              tab.value === 'semua'
                ? bookings.length
                : bookings.filter((b) => b.status === tab.value).length;
            const isActive = statusFilter === tab.value;

            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[var(--color-accent)] text-white shadow-xs font-semibold'
                    : 'bg-[var(--color-paper)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] border border-[var(--color-paper-border)]'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[var(--color-paper-muted)] text-[var(--color-ink-muted)]'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="p-12 text-center bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl text-xs text-[var(--color-ink-muted)]">
          Memuat daftar janji temu...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl text-xs text-[var(--color-ink-muted)] space-y-1">
          <Calendar className="w-8 h-8 text-[var(--color-ink-muted)]/50 mx-auto mb-2" />
          <p className="font-semibold text-[var(--color-ink)]">Tidak ada janji temu ditemukan</p>
          <p>Coba sesuaikan kata kunci pencarian atau filter status yang dipilih.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((item) => {
            const mode = getModeLabel(item.mode);
            const ModeIcon = mode.icon;

            return (
              <div
                key={item.id}
                className="p-5 sm:p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] shadow-xs space-y-4 card-interactive"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--color-paper-border)]">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-[var(--color-accent)]">
                      {item.code}
                    </span>
                    <div>
                      <h3 className="font-semibold text-[var(--color-ink)] text-base sm:text-lg leading-tight">
                        {item.name}
                      </h3>
                      {item.alias && item.alias !== item.name && (
                        <p className="text-xs text-[var(--color-ink-muted)]">Panggilan: {item.alias}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium border uppercase tracking-wider text-[11px] ${getStatusBadge(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[var(--color-ink-muted)] block mb-0.5">Topik Konseling</span>
                    <span className="font-semibold text-[var(--color-ink)] text-sm">{item.category}</span>
                  </div>

                  <div>
                    <span className="text-[var(--color-ink-muted)] block mb-0.5">Waktu &amp; Tanggal</span>
                    <div className="font-semibold text-[var(--color-ink)] flex items-center gap-1.5 text-sm">
                      <Clock className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                      <span>{item.date} · {item.timeSlot}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[var(--color-ink-muted)] block mb-0.5">Format Pertemuan</span>
                    <div className="font-semibold text-[var(--color-ink)] flex items-center gap-1.5 text-sm">
                      <ModeIcon className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                      <span>{mode.label}</span>
                    </div>
                  </div>
                </div>

                {/* Notes if any */}
                {item.notes && (
                  <div className="p-3.5 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-xs text-[var(--color-ink-muted)]">
                    <strong className="text-[var(--color-ink)] block mb-1">Catatan dari Konseli:</strong>
                    <p className="italic leading-relaxed">&ldquo;{item.notes}&rdquo;</p>
                  </div>
                )}

                {/* Contact and Status Actions */}
                <div className="pt-3 border-t border-[var(--color-paper-border)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  
                  {/* Left: Contact actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={getAdminContactWhatsAppUrl({
                        clientPhone: item.phone,
                        clientName: item.alias || item.name,
                        code: item.code,
                        date: item.date,
                        slot: item.timeSlot,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-xs py-1.5 px-3 inline-flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Chat WhatsApp ({item.phone})</span>
                    </a>

                    <a
                      href={`mailto:${item.email}?subject=Konfirmasi%20Konseling%20Amelia%20(${item.code})`}
                      className="btn-secondary text-xs py-1.5 px-3 inline-flex items-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email ({item.email})</span>
                    </a>
                  </div>

                  {/* Right: Status Change Actions */}
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="text-xs text-[var(--color-ink-muted)] mr-1">Status:</span>

                    {item.status !== 'terkonfirmasi' && (
                      <button
                        onClick={() => updateStatus(item.id, 'terkonfirmasi')}
                        disabled={updatingId === item.id}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition-colors cursor-pointer"
                      >
                        Konfirmasi
                      </button>
                    )}

                    {item.status !== 'selesai' && (
                      <button
                        onClick={() => updateStatus(item.id, 'selesai')}
                        disabled={updatingId === item.id}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-muted)] transition-colors cursor-pointer"
                      >
                        Selesai
                      </button>
                    )}

                    {item.status !== 'dibatalkan' && (
                      <button
                        onClick={() => updateStatus(item.id, 'dibatalkan')}
                        disabled={updatingId === item.id}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        Batal
                      </button>
                    )}
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
