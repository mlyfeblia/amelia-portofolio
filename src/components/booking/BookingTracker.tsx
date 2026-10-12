'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  History, 
  Calendar, 
  Clock, 
  ArrowRight, 
  AlertCircle, 
  Trash2, 
  Check, 
  Copy, 
  CheckCircle, 
  CalendarCheck,
  CalendarPlus,
  Video,
  MessageSquare,
  Users,
  ClipboardPaste,
  X
} from 'lucide-react';
import { 
  useDeviceBookings, 
  saveDeviceBooking, 
  removeDeviceBooking, 
  clearAllDeviceBookings, 
} from '@/lib/booking-storage';
import dynamic from 'next/dynamic';
import { BookingDetailCard, BookingDetailData } from './BookingDetailCard';
import { BookingStatus, CounselingMode } from '@/types';
import { SkeletonBookingCard, SkeletonDeviceBookingCard } from '@/components/ui/Skeleton';
import { Spinner } from '@/components/ui/Spinner';

const BookingDeviceDeleteModal = dynamic(
  () => import('./BookingDeviceDeleteModal').then((m) => m.BookingDeviceDeleteModal),
  { ssr: false }
);

interface BookingTrackerProps {
  initialCode?: string;
  onCodeChange?: (code: string) => void;
  onNavigateToNewBooking?: () => void;
}

export function BookingTracker({ initialCode, onCodeChange, onNavigateToNewBooking }: BookingTrackerProps) {
  const trackerContainerRef = React.useRef<HTMLDivElement>(null);
  const [searchInput, setSearchInput] = useState(initialCode || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeBooking, setActiveBooking] = useState<BookingDetailData | null>(null);

  const scrollToTrackerTop = useCallback(() => {
    if (typeof window !== 'undefined' && trackerContainerRef.current) {
      const yOffset = -90;
      const y = trackerContainerRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
  }, []);

  const handleSelectBooking = useCallback((booking: BookingDetailData) => {
    setActiveBooking(booking);
    scrollToTrackerTop();
  }, [scrollToTrackerTop]);

  // Device-detected bookings state from external store
  const deviceRecords = useDeviceBookings();
  const [liveBookings, setLiveBookings] = useState<Record<string, BookingDetailData>>({});
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Filter device records dynamically as user types code
  const filteredDeviceRecords = React.useMemo(() => {
    if (!searchInput.trim()) return deviceRecords;
    const q = searchInput.trim().toUpperCase();
    return deviceRecords.filter((rec) => {
      return (
        rec.code.toUpperCase().includes(q) ||
        (rec.name ? rec.name.toUpperCase().includes(q) : false) ||
        (rec.category ? rec.category.toUpperCase().includes(q) : false)
      );
    });
  }, [deviceRecords, searchInput]);

  // Track code callback defined before effects that use it
  const handleTrackCode = useCallback(async (codeToSearch: string) => {
    const cleanCode = codeToSearch.trim().toUpperCase().replace(/\s+/g, '');
    if (!cleanCode) {
      setError('Masukkan kode referensi janji temu kamu ya.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/bookings/track?code=${encodeURIComponent(cleanCode)}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Janji temu tidak ditemukan.');
      }

      const booking: BookingDetailData = data.data;
      setActiveBooking(booking);
      onCodeChange?.(cleanCode);
      scrollToTrackerTop();

      // Save to device storage for easy access later
      saveDeviceBooking({
        code: booking.code,
        name: booking.alias || booking.name,
        category: booking.category,
        date: booking.date,
        timeSlot: booking.timeSlot,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal melacak kode janji temu.');
    } finally {
      setLoading(false);
    }
  }, [onCodeChange, scrollToTrackerTop]);

  // Adjust state during render when initialCode prop changes
  const [prevInitialCode, setPrevInitialCode] = useState(initialCode);
  if (prevInitialCode !== initialCode) {
    setPrevInitialCode(initialCode);
    setSearchInput(initialCode || '');
    if (!initialCode) {
      setActiveBooking(null);
      setError('');
    }
  }

  // Fetch live statuses for all stored device bookings
  useEffect(() => {
    if (deviceRecords.length === 0) {
      return;
    }

    let isMounted = true;

    Promise.resolve().then(async () => {
      if (!isMounted) return;
      setLoadingHistory(true);
      try {
        const codes = deviceRecords.map((r) => r.code).join(',');
        const res = await fetch(`/api/bookings/track?codes=${encodeURIComponent(codes)}`);
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.data)) {
          const map: Record<string, BookingDetailData> = {};
          for (const item of json.data) {
            map[item.code.toUpperCase()] = item;
          }
          setLiveBookings(map);
        }
      } catch {
        // ignore network errors
      } finally {
        if (isMounted) setLoadingHistory(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [deviceRecords]);

  // If initialCode provided, automatically track it via async task
  useEffect(() => {
    if (initialCode) {
      Promise.resolve().then(() => {
        handleTrackCode(initialCode);
      });
    }
  }, [initialCode, handleTrackCode]);

  const handleSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleTrackCode(searchInput);
  };

  const handleCopyCode = async (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      // fallback
    }
  };

  const handlePasteCode = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          const clean = text.trim().toUpperCase().replace(/\s+/g, '');
          setSearchInput(clean);
          setError('');
        }
      }
    } catch {
      setError('Izin clipboard belum aktif di perambanmu. Kamu bisa ketik atau tempel manual ya.');
    }
  };

  // State for standardized verification modal
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    mode: 'single' | 'all';
    targetCode?: string;
    targetName?: string;
  }>({
    isOpen: false,
    mode: 'all',
  });

  const handleOpenRemoveSingle = (code: string, name?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteModalState({
      isOpen: true,
      mode: 'single',
      targetCode: code,
      targetName: name,
    });
  };

  const handleConfirmModalDelete = () => {
    if (deleteModalState.mode === 'all') {
      clearAllDeviceBookings();
      setActiveBooking(null);
      setSearchInput('');
      setLiveBookings({});
      onCodeChange?.('');
    } else if (deleteModalState.targetCode) {
      const code = deleteModalState.targetCode.toUpperCase();
      removeDeviceBooking(code);
      if (activeBooking?.code.toUpperCase() === code) {
        setActiveBooking(null);
      }
      if (searchInput.trim().toUpperCase() === code) {
        setSearchInput('');
      }
      setLiveBookings((prev) => {
        const next = { ...prev };
        delete next[code];
        return next;
      });
      onCodeChange?.('');
    }
    setDeleteModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'menunggu':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--color-warning-soft)] text-[var(--color-warning)] border border-[var(--color-warning-border)]">
            <Clock className="w-3.5 h-3.5 text-[var(--color-warning)]" />
            <span>Menunggu</span>
          </span>
        );
      case 'terkonfirmasi':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--color-info-soft)] text-[var(--color-info)] border border-[var(--color-info-border)]">
            <CheckCircle className="w-3.5 h-3.5 text-[var(--color-info)]" />
            <span>Terkonfirmasi</span>
          </span>
        );
      case 'selesai':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-accent-border)]">
            <CalendarCheck className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <span>Selesai</span>
          </span>
        );
      case 'dibatalkan':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--color-error-soft)] text-[var(--color-error)] border border-[var(--color-error-border)]">
            <AlertCircle className="w-3.5 h-3.5 text-[var(--color-error)]" />
            <span>Dibatalkan</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-[var(--color-paper-muted)] text-[var(--color-ink-muted)] border border-[var(--color-paper-border)]">
            {status}
          </span>
        );
    }
  };

  const getModeLabel = (mode?: CounselingMode) => {
    switch (mode) {
      case 'online_meet':
        return { label: 'Google Meet', icon: Video };
      case 'online_chat':
        return { label: 'Chat Terjadwal', icon: MessageSquare };
      case 'tatap_muka_cirebon':
        return { label: 'Tatap Muka Cirebon', icon: Users };
      default:
        return { label: 'Konseling Privat', icon: Video };
    }
  };

  return (
    <div ref={trackerContainerRef} key={activeBooking ? `detail-${activeBooking.code}` : 'history-list'} className="space-y-8 tab-content-enter">
      {/* If active booking is viewed, display the detail card */}
      {activeBooking ? (
        <BookingDetailCard
          booking={activeBooking}
          onRemoveFromDevice={(code) => handleOpenRemoveSingle(code, activeBooking.alias || activeBooking.name)}
          onBack={() => {
            setActiveBooking(null);
            setSearchInput('');
            setError('');
            onCodeChange?.('');
            scrollToTrackerTop();
          }}
        />
      ) : (
        <>
          {/* Section 1: Search Form */}
          <div className="p-3.5 sm:p-5 rounded-2xl bg-[var(--color-paper)]/70 border border-[var(--color-paper-border)] space-y-3.5 shadow-2xs">
            <div>
              <label 
                htmlFor="booking-track-input"
                className="text-xs sm:text-sm font-semibold text-[var(--color-ink)]"
              >
                Lacak Status Janji Temu
              </label>
            </div>

            <form onSubmit={handleSubmitSearch} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--color-ink-muted)]">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    id="booking-track-input"
                    type="text"
                    value={searchInput}
                    onChange={(e) => {
                      setSearchInput(e.target.value.toUpperCase().replace(/\s+/g, ''));
                      if (error) setError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setSearchInput('');
                        setError('');
                        onCodeChange?.('');
                      }
                    }}
                    placeholder="Contoh: BKI-2610-A7C12D"
                    className={`form-input pl-10 pr-28 font-mono text-xs sm:text-sm tracking-wider uppercase placeholder:font-sans placeholder:normal-case shadow-2xs ${
                      error ? 'form-input-error' : ''
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1.5">
                    {searchInput ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchInput('');
                          setError('');
                          onCodeChange?.('');
                        }}
                        className="btn-icon-interactive p-1 rounded-md text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper)] transition-colors cursor-pointer"
                        title="Hapus ketikan kode"
                        aria-label="Hapus ketikan kode referensi"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={handlePasteCode}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-sans font-medium text-[var(--color-accent)] bg-[var(--color-accent-soft)] hover:bg-[var(--color-accent-border)]/60 transition-all cursor-pointer active:scale-95 shrink-0"
                      title="Tempel kode dari papan klip (clipboard)"
                      aria-label="Tempel kode referensi dari clipboard"
                    >
                      <ClipboardPaste className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-[11px] font-semibold">Tempel</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !searchInput.trim()}
                  className="btn-primary btn-interactive text-xs sm:text-sm font-semibold py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0 w-full sm:w-auto shadow-xs"
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" variant="white" />
                      <span>Memeriksa...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Lacak Status</span>
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="flex items-start justify-between gap-2.5 p-3 sm:py-2.5 sm:px-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-xs text-rose-900 shadow-2xs tab-content-enter">
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <p className="font-medium text-rose-900 text-xs leading-relaxed break-words">
                      {error}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setError('')}
                    className="btn-icon-interactive p-1 -mr-1 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-100/70 transition-colors cursor-pointer shrink-0"
                    aria-label="Tutup pemberitahuan"
                    title="Tutup"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Loading Active Tracker Search */}
          {loading && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-[var(--color-ink-muted)]">
                <Spinner size="xs" variant="accent" />
                <span>Memuat rincian janji temu...</span>
              </div>
              <SkeletonBookingCard />
            </div>
          )}

          {/* Section 2: Device History */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-[var(--color-paper-border)]">
              <div className="flex items-center gap-2 min-w-0">
                <History className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                <h3 className="text-sm sm:text-base font-semibold text-[var(--color-ink)] truncate">
                  Riwayat di Perangkat Ini
                </h3>
                {deviceRecords.length > 0 && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] font-bold shrink-0">
                    {deviceRecords.length}
                  </span>
                )}
              </div>
            </div>

            {loadingHistory ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-[var(--color-ink-muted)]">
                  <Spinner size="xs" variant="accent" />
                  <span>Menyinkronkan status terkini...</span>
                </div>
                <div className="grid grid-cols-1 gap-3.5">
                  <SkeletonDeviceBookingCard />
                  <SkeletonDeviceBookingCard />
                </div>
              </div>
            ) : deviceRecords.length === 0 ? (
              <div className="py-12 sm:py-16 text-center space-y-5 tab-content-enter">
                <div className="w-16 h-16 rounded-3xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] mx-auto flex items-center justify-center text-[var(--color-accent)] shadow-2xs">
                  <CalendarCheck className="w-8 h-8" aria-hidden="true" />
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <h3
                    className="text-xl sm:text-2xl font-medium text-[var(--color-ink)]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    Belum Ada Riwayat di Perangkat Ini
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
                    Setiap kali kamu mengajukan janji temu melalui browser ini, kode referensi dan perkembangan sesinya akan tersimpan otomatis dan privat di perangkat ini tanpa perlu repot login.
                  </p>
                </div>
                {onNavigateToNewBooking && (
                  <div className="pt-2">
                    <button
                      onClick={onNavigateToNewBooking}
                      type="button"
                      className="btn-primary btn-interactive text-xs sm:text-sm py-2.5 px-6 rounded-xl cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 inline-flex items-center gap-2"
                    >
                      <CalendarPlus className="w-4 h-4" />
                      <span>Ajukan Janji Temu Sekarang</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {searchInput.trim() && filteredDeviceRecords.length > 0 && (
                  <div className="flex items-center justify-between text-xs text-[var(--color-ink-muted)] px-0.5">
                    <span>
                      Menampilkan <strong>{filteredDeviceRecords.length}</strong> dari {deviceRecords.length} riwayat yang cocok
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput('');
                        setError('');
                        onCodeChange?.('');
                      }}
                      className="text-[11px] text-[var(--color-accent)] hover:underline cursor-pointer font-medium"
                    >
                      Reset Filter
                    </button>
                  </div>
                )}

                {filteredDeviceRecords.length === 0 ? (
                  <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center border border-[var(--color-paper-border)] rounded-2xl bg-[var(--color-surface)] space-y-3 tab-content-enter shadow-2xs w-full mx-auto">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-paper-muted)] text-[var(--color-ink-muted)] flex items-center justify-center shrink-0">
                      <Search className="w-5 h-5" />
                    </div>
                    <div className="space-y-1.5 max-w-md w-full flex flex-col items-center justify-center text-center">
                      <p className="text-xs sm:text-sm font-semibold text-[var(--color-ink)] text-center w-full">
                        Tidak ada rekaman &ldquo;{searchInput}&rdquo; di histori perangkat ini
                      </p>
                      <p className="text-xs text-[var(--color-ink-muted)] text-center leading-relaxed max-w-sm w-full">
                        {error
                          ? 'Tidak ditemukan janji temu dengan kode tersebut baik di perangkat ini maupun di sistem.'
                          : 'Kode ini mungkin didaftarkan melalui perangkat lain.'}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1 w-full">
                      {!error && (
                        <button
                          type="button"
                          onClick={() => handleTrackCode(searchInput)}
                          disabled={loading}
                          className="btn-primary btn-interactive inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                        >
                          <Search className="w-3.5 h-3.5" />
                          <span>Lacak ke Server</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setSearchInput('');
                          setError('');
                          onCodeChange?.('');
                        }}
                        className="btn-secondary btn-interactive inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Tampilkan Semua Riwayat</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3.5">
                    {filteredDeviceRecords.map((record) => {
                      const live = liveBookings[record.code.toUpperCase()];
                      const status = live?.status || 'menunggu';
                      const dateText = live?.date || record.date;
                      const timeText = live?.timeSlot || record.timeSlot;
                      const nameText = live?.alias || live?.name || record.name;
                      const categoryText = live?.category || record.category || 'Konseling Privat';
                      const modeInfo = getModeLabel(live?.mode);
                      const ModeIcon = modeInfo.icon;
                      const isCopied = copiedCode === record.code;

                  return (
                    <div
                      key={record.code}
                      onClick={() => {
                        if (live) {
                          handleSelectBooking(live);
                        } else {
                          handleTrackCode(record.code);
                        }
                      }}
                      className="group p-4 sm:p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)] transition-all shadow-2xs hover:shadow-xs cursor-pointer space-y-3 card-interactive"
                    >
                      {/* Top Row: Code Pill + Status Badge + Actions */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--color-paper)] border border-[var(--color-paper-border)] font-mono font-semibold text-[11px] sm:text-xs text-[var(--color-accent)] select-text shrink-0">
                            <span>{record.code}</span>
                            <button
                              onClick={(e) => handleCopyCode(e, record.code)}
                              type="button"
                              className="p-0.5 rounded text-[var(--color-ink-muted)] hover:text-[var(--color-accent)] cursor-pointer inline-flex items-center justify-center transition-colors shrink-0"
                              title="Salin kode referensi"
                              aria-label="Salin kode referensi"
                            >
                              {isCopied ? (
                                <Check className="w-3 h-3 text-emerald-600 animate-pop-success" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <div className="shrink-0">{getStatusBadge(status)}</div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleOpenRemoveSingle(record.code, nameText, e)}
                          className="btn-interactive inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-[var(--color-ink-muted)] hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer shrink-0"
                          title="Hapus riwayat kode ini dari perangkat"
                          aria-label={`Hapus riwayat ${record.code}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>

                      {/* Middle Row: Topic Title and Metadata */}
                      <div className="space-y-1.5">
                        <h4 className="text-sm font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors">
                          {categoryText}
                        </h4>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[var(--color-ink-muted)]">
                          {nameText && (
                            <span>Konseli: <strong className="text-[var(--color-ink)] font-medium">{nameText}</strong></span>
                          )}
                          <span className="inline-flex items-center gap-1">
                            <ModeIcon className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                            <span>{modeInfo.label}</span>
                          </span>
                          {dateText && (
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                              <span>{dateText}</span>
                            </span>
                          )}
                          {timeText && (
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                              <span>{timeText}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom Row: Detail Link CTA */}
                      <div className="pt-2.5 border-t border-[var(--color-paper-border)]/70 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-[var(--color-ink-soft)] truncate">
                          Rincian &amp; jadwal sesi
                        </span>
                        <span className="btn-secondary btn-interactive px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-lg inline-flex items-center gap-1 sm:gap-1.5 shrink-0 shadow-2xs group-hover:border-[var(--color-accent-border)] group-hover:text-[var(--color-accent)] transition-all">
                          <span className="sm:hidden">Pantau</span>
                          <span className="hidden sm:inline">Pantau Perkembangan</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )}

      {/* Standardized Verification Modal for Device Booking History Deletion */}
      <BookingDeviceDeleteModal
        isOpen={deleteModalState.isOpen}
        mode={deleteModalState.mode}
        targetCode={deleteModalState.targetCode}
        targetName={deleteModalState.targetName}
        onClose={() => setDeleteModalState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmModalDelete}
      />
    </div>
  );
}
