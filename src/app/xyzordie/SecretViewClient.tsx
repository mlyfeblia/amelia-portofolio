'use client';

import React, { useState, useEffect, useRef, useTransition, useMemo } from 'react';
import Link from 'next/link';
import {
  Lock,
  KeyRound,
  Play,
  Square,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
  Clock,
  ArrowUpRight,
  Check,
} from 'lucide-react';
import { useModalAnimation } from '@/lib/use-modal-animation';
import { cn } from '@/lib/utils';

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  views: number;
  isPublished: boolean;
  publishedAt: string;
  category?: string;
}

interface LogEntry {
  id: string;
  time: string;
  type: 'success' | 'info' | 'error';
  message: string;
}

interface SecretViewClientProps {
  initialArticles: ArticleItem[];
}

const ITEMS_PER_PAGE = 10;

export default function SecretViewClient({ initialArticles }: SecretViewClientProps) {
  // ── Authentication & Session State ──
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isCheckingPin, setIsCheckingPin] = useState(false);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const pinInputRef = useRef<HTMLInputElement>(null);

  // ── Articles & Data State ──
  const [articles, setArticles] = useState<ArticleItem[]>(initialArticles);
  const [isRefreshing, startRefreshTransition] = useTransition();

  // ── Search, Filters, Sorting & Pagination ──
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [sortBy, setSortBy] = useState<'views_desc' | 'views_asc' | 'date_desc' | 'title_asc'>('views_desc');
  const [currentPage, setCurrentPage] = useState(1);

  // ── Mode & Operational Controls (NO ICONS ON TABS) ──
  const [activeTab, setActiveTab] = useState<'autopilot' | 'batch' | 'target'>('autopilot');
  const [selectedSlug, setSelectedSlug] = useState<string>('all');
  const [customCount, setCustomCount] = useState<number>(25);
  const [targetViewInput, setTargetViewInput] = useState<number>(100);

  // ── Auto-Pilot Runner State & Telemetry ──
  const [isAutoPilot, setIsAutoPilot] = useState(false);
  const [intervalSeconds, setIntervalSeconds] = useState<number>(8);
  const [autoMinViews, setAutoMinViews] = useState<number>(1);
  const [autoMaxViews, setAutoMaxViews] = useState<number>(3);
  const [autoTarget, setAutoTarget] = useState<'random' | string>('random');
  const [sessionViewsAdded, setSessionViewsAdded] = useState<number>(0);
  const [lastTickTime, setLastTickTime] = useState<string | null>(null);
  const autoPilotTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Activity Logs ──
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showLogsDrawer, setShowLogsDrawer] = useState(false);

  // ── Feedback Notifications ──
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ── Modals State ──
  // 1. General Decision Confirmation Modal
  const [decisionModal, setDecisionModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    variant?: 'primary' | 'danger';
    onConfirm: () => Promise<void> | void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    confirmLabel: 'Konfirmasi',
    variant: 'primary',
    onConfirm: () => {},
  });
  const [isExecutingDecision, setIsExecutingDecision] = useState(false);

  // 2. Direct Target Setting Modal (for single article from Card / Table)
  const [targetModal, setTargetModal] = useState<{
    isOpen: boolean;
    slug: string;
    title: string;
    currentViews: number;
    targetViews: number;
  }>({
    isOpen: false,
    slug: '',
    title: '',
    currentViews: 0,
    targetViews: 0,
  });
  const [isExecutingTarget, setIsExecutingTarget] = useState(false);

  const addLog = (type: 'success' | 'info' | 'error', message: string) => {
    const time = new Date().toLocaleTimeString('id-ID', { hour12: false });
    setLogs((prev) => [{ id: Math.random().toString(), time, type, message }, ...prev.slice(0, 49)]);
  };

  // ── Multi-Tab & Admin Expiry Synchronization ──
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'amelia_admin_auth_sync' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          if (data.action === 'logout') {
            setIsSessionExpired(true);
            setIsUnlocked(false);
            if (autoPilotTimerRef.current) {
              clearInterval(autoPilotTimerRef.current);
            }
          }
        } catch {
          // ignore parsing error
        }
      }
    };

    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, []);

  // ── 1. PIN Auto-Verification (Auto-submit on 6 digits) ──
  const handleVerifyPin = async (inputPin: string) => {
    if (isCheckingPin || inputPin.length !== 6) return;

    setIsCheckingPin(true);
    setPinError('');

    try {
      const res = await fetch('/api/xyzordie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_pin', pin: inputPin.trim() }),
      });

      const data = await res.json().catch(() => null);

      if (res.status === 401 || res.status === 404) {
        if (data?.message?.includes('Sesi') || res.status === 404) {
          setIsSessionExpired(true);
          return;
        }
      }

      if (res.ok && data?.success) {
        setIsUnlocked(true);
        setPin('');
        addLog('info', 'Gerbang otorisasi berhasil dibuka.');
        fetchLatestArticles();
      } else {
        setPinError(data?.message || 'PIN rahasia salah.');
        setPin('');
        setTimeout(() => pinInputRef.current?.focus(), 50);
      }
    } catch {
      setPinError('Gagal memverifikasi PIN. Periksa koneksi internet.');
      setPin('');
    } finally {
      setIsCheckingPin(false);
    }
  };

  // ── 2. Refresh Articles Data ──
  const fetchLatestArticles = async () => {
    startRefreshTransition(async () => {
      try {
        const res = await fetch('/api/xyzordie', {
          headers: { 'x-secret-pin': '071220' },
        });

        if (res.status === 401 || res.status === 404) {
          setIsSessionExpired(true);
          return;
        }

        if (res.ok) {
          const data = await res.json();
          if (data.articles) {
            setArticles(data.articles);
          }
        }
      } catch {
        // silent fallback
      }
    });
  };

  // ── 3. Mutating Execution: Boost Views ──
  const executeBoost = async (slug: string, count: number) => {
    setFeedbackMessage(null);

    try {
      if (slug === 'all') {
        const res = await fetch('/api/xyzordie', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-secret-pin': '071220' },
          body: JSON.stringify({ action: 'boost_all', count, pin: '071220' }),
        });

        if (res.status === 401 || res.status === 404) {
          setIsSessionExpired(true);
          return;
        }

        const data = await res.json();
        if (res.ok && data.success) {
          setFeedbackMessage({ type: 'success', text: data.message });
          addLog('success', `+${count} views ke seluruh ${data.totalUpdated || 'semua'} artikel publik.`);
          fetchLatestArticles();
        } else {
          setFeedbackMessage({ type: 'error', text: data.message || 'Gagal menambah views' });
        }
      } else {
        const res = await fetch('/api/xyzordie', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-secret-pin': '071220' },
          body: JSON.stringify({ action: 'boost', slug, count, pin: '071220' }),
        });

        if (res.status === 401 || res.status === 404) {
          setIsSessionExpired(true);
          return;
        }

        const data = await res.json();
        if (res.ok && data.success) {
          setFeedbackMessage({ type: 'success', text: data.message });
          addLog('success', `+${count} views [${slug}] -> total ${data.currentViews}`);
          setArticles((prev) =>
            prev.map((a) => (a.slug === slug ? { ...a, views: data.currentViews } : a))
          );
        } else {
          setFeedbackMessage({ type: 'error', text: data.message || 'Gagal menambah views' });
        }
      }
    } catch {
      setFeedbackMessage({ type: 'error', text: 'Terjadi gangguan koneksi ke server.' });
    }
  };

  // ── Trigger Confirmation Modal for Boost ──
  const promptBoostConfirmation = (slug: string, count: number) => {
    if (slug === 'all') {
      setDecisionModal({
        isOpen: true,
        title: 'Konfirmasi Penambahan Massal',
        description: `Apakah Anda yakin ingin menambahkan +${count} views ke seluruh ${articles.filter((a) => a.isPublished).length} artikel publik secara bersamaan?`,
        confirmLabel: `Ya, Tambahkan +${count} Views`,
        variant: 'primary',
        onConfirm: async () => {
          await executeBoost('all', count);
        },
      });
    } else {
      const match = articles.find((a) => a.slug === slug);
      const title = match ? match.title : slug;
      const current = match ? match.views : 0;
      const next = current + count;

      setDecisionModal({
        isOpen: true,
        title: 'Konfirmasi Penambahan Views',
        description: `Tambahkan +${count} views ke artikel "${title}"? Jumlah pembaca akan bertambah dari ${current.toLocaleString('id-ID')} menjadi ${next.toLocaleString('id-ID')} views.`,
        confirmLabel: `Ya, Tambahkan +${count}`,
        variant: 'primary',
        onConfirm: async () => {
          await executeBoost(slug, count);
        },
      });
    }
  };

  // ── 4. Mutating Execution: Set Target Views ──
  const executeSetTarget = async (slug: string, targetViews: number) => {
    setFeedbackMessage(null);

    try {
      const res = await fetch('/api/xyzordie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-secret-pin': '071220' },
        body: JSON.stringify({ action: 'set', slug, targetViews, pin: '071220' }),
      });

      if (res.status === 401 || res.status === 404) {
        setIsSessionExpired(true);
        return;
      }

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedbackMessage({ type: 'success', text: data.message });
        addLog('info', `Target views [${slug}] disetel ke ${data.currentViews}`);
        setArticles((prev) =>
          prev.map((a) => (a.slug === slug ? { ...a, views: data.currentViews } : a))
        );
      } else {
        setFeedbackMessage({ type: 'error', text: data.message || 'Gagal mengatur target views' });
      }
    } catch {
      setFeedbackMessage({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
    }
  };

  // ── Trigger Confirmation Modal for Target from Tab ──
  const promptSetTargetConfirmation = (slug: string, targetViews: number) => {
    if (slug === 'all') {
      setFeedbackMessage({ type: 'error', text: 'Harap pilih satu judul artikel spesifik.' });
      return;
    }

    const matched = articles.find((a) => a.slug === slug);
    const title = matched ? matched.title : slug;
    const current = matched ? matched.views : 0;

    setDecisionModal({
      isOpen: true,
      title: 'Konfirmasi Penyetelan Target Views',
      description: `Apakah Anda yakin ingin menyetel jumlah pembaca artikel "${title}" menjadi tepat ${targetViews.toLocaleString('id-ID')} views (saat ini ${current.toLocaleString('id-ID')})?`,
      confirmLabel: 'Ya, Terapkan Target',
      variant: 'primary',
      onConfirm: async () => {
        await executeSetTarget(slug, targetViews);
      },
    });
  };

  // ── Trigger Lock Confirmation Modal ──
  const promptLockConfirmation = () => {
    setDecisionModal({
      isOpen: true,
      title: 'Kunci Konsol Operasional?',
      description: 'Anda akan keluar dari konsol penambah views. Untuk mengaksesnya kembali, Anda perlu memasukkan kode PIN otorisasi (071220).',
      confirmLabel: 'Ya, Kunci Konsol',
      variant: 'danger',
      onConfirm: () => {
        setIsUnlocked(false);
        setPin('');
      },
    });
  };

  // ── Trigger Target Modal from Card / Table ──
  const openTargetModalForArticle = (art: ArticleItem) => {
    setTargetModal({
      isOpen: true,
      slug: art.slug,
      title: art.title,
      currentViews: art.views,
      targetViews: art.views,
    });
  };

  // ── 5. Auto-Pilot Runner Loop ──
  useEffect(() => {
    if (!isAutoPilot) {
      if (autoPilotTimerRef.current) {
        clearInterval(autoPilotTimerRef.current);
        autoPilotTimerRef.current = null;
      }
      return;
    }

    addLog('info', `Auto-Pilot aktif: penambahan berkala setiap ${intervalSeconds} detik.`);

    const executeTick = async () => {
      try {
        const payload: Record<string, unknown> = {
          action: 'auto_tick',
          pin: '071220',
          minCount: autoMinViews,
          maxCount: autoMaxViews,
        };

        if (autoTarget !== 'random') {
          payload.slug = autoTarget;
        }

        const res = await fetch('/api/xyzordie', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-secret-pin': '071220' },
          body: JSON.stringify(payload),
        });

        if (res.status === 401 || res.status === 404) {
          setIsSessionExpired(true);
          setIsAutoPilot(false);
          return;
        }

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setSessionViewsAdded((prev) => prev + Number(data.added || 0));
            setLastTickTime(new Date().toLocaleTimeString('id-ID', { hour12: false }));
            addLog('success', `+${data.added} views -> [${data.slug}] total ${data.currentViews}`);
            setArticles((prev) =>
              prev.map((a) => (a.slug === data.slug ? { ...a, views: data.currentViews } : a))
            );
          }
        }
      } catch {
        // silent network jitter handling
      }
    };

    executeTick();
    autoPilotTimerRef.current = setInterval(executeTick, intervalSeconds * 1000);

    return () => {
      if (autoPilotTimerRef.current) {
        clearInterval(autoPilotTimerRef.current);
        autoPilotTimerRef.current = null;
      }
    };
  }, [isAutoPilot, intervalSeconds, autoMinViews, autoMaxViews, autoTarget]);

  // ── Categories List for Filter ──
  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => {
      if (a.category) set.add(a.category);
    });
    return Array.from(set).sort();
  }, [articles]);

  // ── Filtered & Sorted Articles ──
  const filteredArticles = useMemo(() => {
    return articles
      .filter((a) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = a.title.toLowerCase().includes(q);
          const matchSlug = a.slug.toLowerCase().includes(q);
          if (!matchTitle && !matchSlug) return false;
        }

        // Category filter
        if (selectedCategory !== 'ALL' && a.category !== selectedCategory) {
          return false;
        }

        // Status filter
        if (selectedStatus === 'PUBLISHED' && !a.isPublished) return false;
        if (selectedStatus === 'DRAFT' && a.isPublished) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'views_desc') return (b.views || 0) - (a.views || 0);
        if (sortBy === 'views_asc') return (a.views || 0) - (b.views || 0);
        if (sortBy === 'title_asc') return a.title.localeCompare(b.title);
        if (sortBy === 'date_desc') return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        return 0;
      });
  }, [articles, searchQuery, selectedCategory, selectedStatus, sortBy]);

  // Reset page to 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedStatus, sortBy]);

  // ── Pagination Calculation ──
  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / ITEMS_PER_PAGE));
  const paginatedArticles = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredArticles.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredArticles, currentPage]);

  const isFilterActive = searchQuery.trim() !== '' || selectedCategory !== 'ALL' || selectedStatus !== 'ALL' || sortBy !== 'views_desc';

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedStatus('ALL');
    setSortBy('views_desc');
    setCurrentPage(1);
  };

  const totalAllViews = useMemo(() => {
    return articles.reduce((sum, a) => sum + (a.views || 0), 0);
  }, [articles]);

  // ── Modal Animation Hook Instances ──
  const decisionRef = useRef<HTMLDivElement>(null);
  const decisionModalAnim = useModalAnimation({
    isOpen: decisionModal.isOpen,
    onClose: () => setDecisionModal((prev) => ({ ...prev, isOpen: false })),
    closeOnEscape: true,
    lockScroll: true,
    containerRef: decisionRef,
  });

  const targetModalRef = useRef<HTMLDivElement>(null);
  const targetModalAnim = useModalAnimation({
    isOpen: targetModal.isOpen,
    onClose: () => setTargetModal((prev) => ({ ...prev, isOpen: false })),
    closeOnEscape: true,
    lockScroll: true,
    containerRef: targetModalRef,
  });

  const sessionExpiredRef = useRef<HTMLDivElement>(null);
  const sessionExpiredAnim = useModalAnimation({
    isOpen: isSessionExpired,
    onClose: () => setIsSessionExpired(false),
    closeOnEscape: false,
    lockScroll: true,
    containerRef: sessionExpiredRef,
  });

  // ═════════════════════════════════════════════════════════════════════
  // SCREEN 1: CALM PIN GATEWAY (Warm Paper Theme, Auto-Submit on 6 digits)
  // ═════════════════════════════════════════════════════════════════════
  if (!isUnlocked) {
    return (
      <main className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] flex items-center justify-center p-3.5 min-[340px]:p-5 selection:bg-[var(--color-accent-soft)]">
        <div className="w-full max-w-[340px] min-[380px]:max-w-sm bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl p-5 min-[380px]:p-7 sm:p-8 shadow-xs text-center space-y-5 animate-fade-in-up">
          
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] mx-auto flex items-center justify-center border border-[var(--color-accent-border)] shadow-2xs">
            <KeyRound className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <h1
              className="text-lg min-[380px]:text-xl sm:text-2xl font-medium text-[var(--color-ink)] leading-snug"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Pengelola Views Artikel
            </h1>
            <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
              Ketik 6 digit PIN otorisasi internal untuk membuka konsol.
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <input
                ref={pinInputRef}
                id="xyz-secret-pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={pin}
                autoFocus
                disabled={isCheckingPin}
                onChange={(e) => {
                  const onlyNums = e.target.value.replace(/[^0-9]/g, '');
                  setPin(onlyNums);
                  if (pinError) setPinError('');
                  if (onlyNums.length === 6 && !isCheckingPin) {
                    handleVerifyPin(onlyNums);
                  }
                }}
                placeholder="••••••"
                className="w-full h-11 text-center font-mono tracking-[0.35em] sm:tracking-[0.5em] text-lg sm:text-xl font-bold rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)] transition-all placeholder:tracking-normal placeholder:text-sm placeholder:text-[var(--color-ink-soft)]"
              />

              {isCheckingPin && (
                <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-[var(--color-accent)] animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Memverifikasi PIN...</span>
                </div>
              )}
            </div>

            {pinError && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--color-error-soft)] border border-[var(--color-error-border)] text-[var(--color-error)] text-xs text-left animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="leading-tight">{pinError}</span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-[var(--color-paper-border)] flex items-center justify-between text-[11px] text-[var(--color-ink-soft)]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Sesi Admin Aktif
            </span>
            <span className="font-mono">/xyzordie</span>
          </div>
        </div>

        {/* Modal Sesi Admin Kedaluwarsa */}
        {sessionExpiredAnim.isRendered && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className={sessionExpiredAnim.backdropClass} aria-hidden="true" />
            <div
              ref={sessionExpiredRef}
              className={cn(
                'relative w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl p-6 shadow-xl space-y-4 z-10 text-center',
                sessionExpiredAnim.windowClass
              )}
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 mx-auto flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
                  Sesi Pengelola Berakhir
                </h2>
                <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
                  Demi keamanan, sesi admin telah berakhir setelah 30 menit. Silakan masuk kembali ke Portal Admin untuk melanjutkan operasional.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/admin"
                  className="btn-primary btn-interactive w-full h-10 inline-flex items-center justify-center gap-2 text-xs font-semibold rounded-xl text-white shadow-xs"
                >
                  <span>Masuk Kembali ke Portal Admin</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    );
  }

  // ═════════════════════════════════════════════════════════════════════
  // SCREEN 2: CLEAN CONSOLE DASHBOARD (Calm Paper & White Surface)
  // ═════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] flex flex-col font-sans selection:bg-[var(--color-accent-soft)]">
      
      {/* ── Top Header Bar ── */}
      <header className="bg-[var(--color-surface)] border-b border-[var(--color-paper-border)] sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-3.5 min-[340px]:px-5 sm:px-8 lg:px-10 h-16 flex items-center justify-between gap-3">
          
          {/* Brand & Page Name */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="text-lg sm:text-xl font-medium text-[var(--color-ink)] tracking-tight truncate block"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Amelia
            </span>
            <span className="text-[var(--color-paper-border)]">•</span>
            <span className="text-xs font-semibold text-[var(--color-ink)] truncate block">
              Pengelola Views
            </span>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={fetchLatestArticles}
              disabled={isRefreshing}
              className="btn-secondary btn-interactive h-8 sm:h-9 px-2.5 sm:px-3 text-xs font-medium inline-flex items-center justify-center gap-1.5 rounded-lg cursor-pointer"
              title="Segarkan data terbaru dari database"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', isRefreshing && 'animate-spin text-[var(--color-accent)]')} />
              <span className="hidden min-[400px]:inline">Segarkan</span>
            </button>

            <button
              type="button"
              onClick={promptLockConfirmation}
              className="btn-secondary btn-interactive h-8 sm:h-9 px-2.5 sm:px-3 text-xs font-medium inline-flex items-center justify-center gap-1.5 rounded-lg text-rose-700 hover:text-rose-800 hover:bg-rose-50 border-rose-200 cursor-pointer"
              title="Kunci kembali konsol ini"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Kunci</span>
            </button>
          </div>

        </div>
      </header>

      {/* ── Main Content Area ── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3.5 min-[340px]:px-5 sm:px-8 lg:px-10 py-5 sm:py-7 space-y-5 sm:space-y-6">

        {/* Feedback Alert Banner */}
        {feedbackMessage && (
          <div
            className={cn(
              'flex items-center justify-between gap-3 p-3.5 rounded-xl text-xs transition-all animate-in fade-in',
              feedbackMessage.type === 'success'
                ? 'bg-[var(--color-accent-soft)] border border-[var(--color-accent-border)] text-[var(--color-accent)]'
                : 'bg-[var(--color-error-soft)] border border-[var(--color-error-border)] text-[var(--color-error)]'
            )}
          >
            <div className="flex items-center gap-2">
              {feedbackMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span className="font-medium leading-relaxed">{feedbackMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackMessage(null)}
              className="p-1 hover:opacity-70 transition-opacity cursor-pointer font-mono"
            >
              ✕
            </button>
          </div>
        )}

        {/* ── 3 Operational Stat Cards ── */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] shadow-2xs">
            <span className="text-xs text-[var(--color-ink-muted)] block font-medium">Total Pembaca Artikel</span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-[var(--color-accent)] tracking-tight tabular-nums block mt-1">
              {totalAllViews.toLocaleString('id-ID')}
            </span>
            <span className="text-[11px] text-[var(--color-ink-soft)] block mt-0.5">Akumulasi seluruh views</span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] shadow-2xs">
            <span className="text-xs text-[var(--color-ink-muted)] block font-medium">Koleksi Artikel</span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-[var(--color-ink)] tracking-tight tabular-nums block mt-1">
              {articles.length} <span className="text-xs font-normal text-[var(--color-ink-muted)]">judul</span>
            </span>
            <span className="text-[11px] text-[var(--color-ink-soft)] block mt-0.5">
              {articles.filter((a) => a.isPublished).length} Publik • {articles.filter((a) => !a.isPublished).length} Draf
            </span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--color-ink-muted)] block font-medium">Status Auto-Pilot</span>
              <button
                type="button"
                onClick={() => setShowLogsDrawer(!showLogsDrawer)}
                className="text-[11px] text-[var(--color-accent)] hover:underline cursor-pointer"
              >
                {showLogsDrawer ? 'Tutup Log' : 'Buka Log'}
              </button>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className={cn(
                  'w-2.5 h-2.5 rounded-full',
                  isAutoPilot ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-300'
                )}
              />
              <span className="text-base sm:text-lg font-semibold text-[var(--color-ink)]">
                {isAutoPilot ? 'Sedang Berjalan' : 'Siaga (Standby)'}
              </span>
            </div>
            <span className="text-[11px] text-[var(--color-ink-soft)] block mt-0.5">
              {isAutoPilot
                ? `+${sessionViewsAdded} views sesi ini • Tik: ${intervalSeconds}s`
                : 'Otomasi berkala dinonaktifkan'}
            </span>
          </div>
        </section>

        {/* ── Operational Control Card (NO ICONS ON TABS, MAXIMIZED FEATURES) ── */}
        <section className="p-4 sm:p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] shadow-2xs space-y-5">
          
          {/* Segmented Mode Selector (CLEAN TEXT ONLY, NO ICONS) */}
          <div className="flex items-center p-1 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('autopilot')}
              className={cn(
                'flex-1 py-2 px-2 text-center text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap',
                activeTab === 'autopilot'
                  ? 'bg-[var(--color-surface)] text-[var(--color-ink)] shadow-2xs'
                  : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
              )}
            >
              Auto-Pilot
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('batch')}
              className={cn(
                'flex-1 py-2 px-2 text-center text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap',
                activeTab === 'batch'
                  ? 'bg-[var(--color-surface)] text-[var(--color-ink)] shadow-2xs'
                  : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
              )}
            >
              Tambah Cepat
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('target')}
              className={cn(
                'flex-1 py-2 px-2 text-center text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap',
                activeTab === 'target'
                  ? 'bg-[var(--color-surface)] text-[var(--color-ink)] shadow-2xs'
                  : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
              )}
            >
              Atur Target
            </button>
          </div>

          {/* ── MODE 1: AUTO-PILOT (MAXIMIZED & ROBUST) ── */}
          {activeTab === 'autopilot' && (
            <div className="space-y-4 pt-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)]">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-semibold text-[var(--color-ink)]">
                      Mesin Auto-Pilot Berkelanjutan
                    </h3>
                    {isAutoPilot && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Aktif
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--color-ink-muted)]">
                    {isAutoPilot
                      ? `Telah menambahkan +${sessionViewsAdded} views pada sesi ini. Eksekusi terakhir: ${lastTickTime || 'Memulai...'}`
                      : 'Menambah views secara bertahap dan natural di latar belakang selama tab aktif.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAutoPilot(!isAutoPilot)}
                  className={cn(
                    'btn-interactive h-10 px-5 text-xs font-semibold rounded-xl inline-flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer shrink-0',
                    isAutoPilot
                      ? 'bg-rose-700 hover:bg-rose-800 text-white'
                      : 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white'
                  )}
                >
                  {isAutoPilot ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Hentikan Auto-Pilot</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Jalankan Auto-Pilot</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--color-ink-muted)] block">Sasaran Artikel</label>
                  <select
                    value={autoTarget}
                    onChange={(e) => setAutoTarget(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)]"
                  >
                    <option value="random">🎲 Seluruh Artikel (Bergantian Acak)</option>
                    {articles.map((a) => (
                      <option key={a.id} value={a.slug}>
                        {a.title.slice(0, 34)}... ({a.views} views)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--color-ink-muted)] block">Frekuensi Interval</label>
                  <select
                    value={intervalSeconds}
                    onChange={(e) => setIntervalSeconds(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)]"
                  >
                    <option value={5}>Setiap 5 Detik (Cepat)</option>
                    <option value={8}>Setiap 8 Detik (Rekomendasi)</option>
                    <option value={15}>Setiap 15 Detik (Santai)</option>
                    <option value={30}>Setiap 30 Detik (Natural)</option>
                    <option value={60}>Setiap 1 Menit</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--color-ink-muted)] block">Views per Tik</label>
                  <div className="flex items-center justify-between h-10 px-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] text-xs text-[var(--color-ink)]">
                    <span className="text-[var(--color-ink-soft)] text-xs">Rentang:</span>
                    <div className="flex items-center gap-1 font-mono">
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={autoMinViews}
                        onChange={(e) => setAutoMinViews(Math.max(1, Number(e.target.value)))}
                        className="w-8 text-center border-b border-[var(--color-paper-border)] focus:border-[var(--color-accent)] focus:outline-none font-semibold text-[var(--color-accent)]"
                      />
                      <span className="text-[var(--color-ink-soft)]">-</span>
                      <input
                        type="number"
                        min={autoMinViews}
                        max={10}
                        value={autoMaxViews}
                        onChange={(e) => setAutoMaxViews(Math.max(autoMinViews, Number(e.target.value)))}
                        className="w-8 text-center border-b border-[var(--color-paper-border)] focus:border-[var(--color-accent)] focus:outline-none font-semibold text-[var(--color-accent)]"
                      />
                      <span className="text-[10px] text-[var(--color-ink-soft)]">views</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── MODE 2: TAMBAH CEPAT (BATCH) ── */}
          {activeTab === 'batch' && (
            <div className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--color-ink-muted)] block">Pilih Sasaran</label>
                <select
                  value={selectedSlug}
                  onChange={(e) => setSelectedSlug(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)]"
                >
                  <option value="all">🌐 Seluruh Artikel Publik Sekaligus ({articles.filter((a) => a.isPublished).length} Artikel)</option>
                  {articles.map((a) => (
                    <option key={a.id} value={a.slug}>
                      {a.title} ({a.views} views)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-medium text-[var(--color-ink-muted)] block">Preset Tambah Cepat</span>
                <div className="grid grid-cols-3 min-[480px]:grid-cols-6 gap-2">
                  {[10, 25, 50, 100, 250, 500].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => promptBoostConfirmation(selectedSlug, num)}
                      className="btn-interactive h-10 rounded-xl bg-[var(--color-paper)] hover:bg-[var(--color-accent-soft)] hover:border-[var(--color-accent-border)] border border-[var(--color-paper-border)] text-[var(--color-ink)] font-mono text-xs font-semibold transition-all cursor-pointer flex items-center justify-center active:scale-95"
                    >
                      +{num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-1 flex flex-col min-[380px]:flex-row items-stretch min-[380px]:items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min={1}
                    max={5000}
                    value={customCount}
                    onChange={(e) => setCustomCount(Math.max(1, Number(e.target.value)))}
                    className="w-full h-10 px-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] text-xs font-mono text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)]"
                    placeholder="Angka kustom"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[var(--color-ink-soft)] font-mono">
                    views
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => promptBoostConfirmation(selectedSlug, customCount)}
                  className="btn-primary btn-interactive h-10 px-5 text-xs font-semibold rounded-xl text-white inline-flex items-center justify-center shadow-xs shrink-0 cursor-pointer"
                >
                  Tambah +{customCount} Views
                </button>
              </div>
            </div>
          )}

          {/* ── MODE 3: ATUR TARGET (PRECISION SETTER) ── */}
          {activeTab === 'target' && (
            <div className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--color-ink-muted)] block">Pilih Artikel Spesifik</label>
                <select
                  value={selectedSlug === 'all' && articles[0] ? articles[0].slug : selectedSlug}
                  onChange={(e) => {
                    setSelectedSlug(e.target.value);
                    const match = articles.find((a) => a.slug === e.target.value);
                    if (match) setTargetViewInput(match.views);
                  }}
                  className="w-full h-10 px-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)]"
                >
                  {articles.map((a) => (
                    <option key={a.id} value={a.slug}>
                      {a.title} (Saat ini: {a.views} views)
                    </option>
                  ))}
                </select>
              </div>

              {/* Current Views vs Target Calculation */}
              {(() => {
                const targetArt = articles.find(
                  (a) => a.slug === (selectedSlug === 'all' && articles[0] ? articles[0].slug : selectedSlug)
                );
                const current = targetArt ? targetArt.views : 0;
                const diff = targetViewInput - current;

                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)]">
                      <div>
                        <span className="text-[11px] text-[var(--color-ink-soft)] block">Views Saat Ini</span>
                        <span className="text-base font-bold font-mono text-[var(--color-ink)] tabular-nums">
                          {current.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-[var(--color-ink-soft)] block">Selisih Penyesuaian</span>
                        <span
                          className={cn(
                            'text-base font-bold font-mono tabular-nums',
                            diff >= 0 ? 'text-[var(--color-accent)]' : 'text-rose-600'
                          )}
                        >
                          {diff >= 0 ? `+${diff.toLocaleString('id-ID')}` : diff.toLocaleString('id-ID')} views
                        </span>
                      </div>
                    </div>

                    {/* Target Presets */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] text-[var(--color-ink-soft)] block font-medium">Preset Cepat:</span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => setTargetViewInput(current + 50)}
                          className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-[var(--color-paper)] border border-[var(--color-paper-border)] hover:bg-[var(--color-accent-soft)] hover:border-[var(--color-accent-border)] text-[var(--color-ink)] cursor-pointer"
                        >
                          +50 views
                        </button>
                        <button
                          type="button"
                          onClick={() => setTargetViewInput(current + 100)}
                          className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-[var(--color-paper)] border border-[var(--color-paper-border)] hover:bg-[var(--color-accent-soft)] hover:border-[var(--color-accent-border)] text-[var(--color-ink)] cursor-pointer"
                        >
                          +100 views
                        </button>
                        <button
                          type="button"
                          onClick={() => setTargetViewInput(250)}
                          className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-[var(--color-paper)] border border-[var(--color-paper-border)] hover:bg-[var(--color-accent-soft)] hover:border-[var(--color-accent-border)] text-[var(--color-ink)] cursor-pointer"
                        >
                          Set ke 250
                        </button>
                        <button
                          type="button"
                          onClick={() => setTargetViewInput(500)}
                          className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-[var(--color-paper)] border border-[var(--color-paper-border)] hover:bg-[var(--color-accent-soft)] hover:border-[var(--color-accent-border)] text-[var(--color-ink)] cursor-pointer"
                        >
                          Set ke 500
                        </button>
                        <button
                          type="button"
                          onClick={() => setTargetViewInput(1000)}
                          className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-[var(--color-paper)] border border-[var(--color-paper-border)] hover:bg-[var(--color-accent-soft)] hover:border-[var(--color-accent-border)] text-[var(--color-ink)] cursor-pointer"
                        >
                          Set ke 1.000
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col min-[380px]:flex-row items-stretch min-[380px]:items-center gap-3 pt-1">
                      <div className="space-y-1 flex-1">
                        <label className="text-xs font-medium text-[var(--color-ink-muted)] block">Input Angka Target</label>
                        <input
                          type="number"
                          min={0}
                          value={targetViewInput}
                          onChange={(e) => setTargetViewInput(Math.max(0, Number(e.target.value)))}
                          className="w-full h-10 px-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] text-sm font-mono font-semibold text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)]"
                        />
                      </div>

                      <div className="min-[380px]:pt-5">
                        <button
                          type="button"
                          onClick={() => {
                            const target = selectedSlug === 'all' && articles[0] ? articles[0].slug : selectedSlug;
                            promptSetTargetConfirmation(target, targetViewInput);
                          }}
                          className="btn-primary btn-interactive w-full min-[380px]:w-auto h-10 px-5 text-xs font-semibold rounded-xl text-white inline-flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Terapkan Target</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Activity Log Drawer (Collapsible) */}
          {showLogsDrawer && (
            <div className="pt-3 border-t border-[var(--color-paper-border)] space-y-2">
              <div className="flex items-center justify-between text-xs text-[var(--color-ink-muted)]">
                <span className="font-semibold">Riwayat Eksekusi Views ({logs.length})</span>
                <button
                  type="button"
                  onClick={() => setLogs([])}
                  className="text-[11px] text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] cursor-pointer"
                >
                  Bersihkan Log
                </button>
              </div>

              <div className="h-32 overflow-y-auto p-3 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] font-mono text-[11px] space-y-1 select-text scrollbar-thin">
                {logs.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-[var(--color-ink-soft)] italic">
                    Belum ada riwayat aktivitas penambahan views.
                  </div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-1.5 leading-relaxed">
                      <span className="text-[var(--color-ink-soft)] shrink-0">[{log.time}]</span>
                      <span
                        className={
                          log.type === 'success'
                            ? 'text-emerald-700 font-medium'
                            : log.type === 'error'
                            ? 'text-rose-700'
                            : 'text-[var(--color-ink)]'
                        }
                      >
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </section>

        {/* ── Articles Directory Section with Interactive Filter & Pagination ── */}
        <section className="p-4 sm:p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] shadow-2xs space-y-5">
          
          {/* Header & Filter Controls Bar */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2
                  className="text-base sm:text-lg font-medium text-[var(--color-ink)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Daftar Artikel ({filteredArticles.length})
                </h2>
                <p className="text-xs text-[var(--color-ink-muted)]">
                  Kelola dan tambah views per judul artikel secara spesifik.
                </p>
              </div>

              {isFilterActive && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="btn-interactive self-start sm:self-auto text-xs text-[var(--color-accent)] hover:underline inline-flex items-center gap-1 cursor-pointer font-medium"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Semua Filter</span>
                </button>
              )}
            </div>

            {/* Filter Bar Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-soft)]" />
                <input
                  type="text"
                  placeholder="Cari judul artikel..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-lg bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-xs text-[var(--color-ink)] placeholder:text-[var(--color-ink-soft)] focus:outline-none focus:border-[var(--color-accent)]"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)]"
              >
                <option value="ALL">Semua Kategori ({articles.length})</option>
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as 'ALL' | 'PUBLISHED' | 'DRAFT')}
                className="w-full h-9 px-3 rounded-lg bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)]"
              >
                <option value="ALL">Semua Status</option>
                <option value="PUBLISHED">Publik Saja</option>
                <option value="DRAFT">Draf Saja</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full h-9 px-3 rounded-lg bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)] font-medium"
              >
                <option value="views_desc">Views Terbanyak (Tinggi ke Rendah)</option>
                <option value="views_asc">Views Tersedikit (Rendah ke Tinggi)</option>
                <option value="date_desc">Terbit Terbaru</option>
                <option value="title_asc">Judul Artikel (A-Z)</option>
              </select>

            </div>
          </div>

          {/* ── 1. MOBILE VIEW: SMART ARTICLE CARDS (NO URL / SLUG SHOWN) ── */}
          <div className="space-y-3 sm:hidden">
            {paginatedArticles.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--color-ink-muted)] bg-[var(--color-paper)] rounded-xl border border-[var(--color-paper-border)] italic">
                Tidak ada artikel yang sesuai dengan filter atau pencarian.
              </div>
            ) : (
              paginatedArticles.map((art) => (
                <div
                  key={art.id}
                  className="p-4 rounded-xl bg-[var(--color-paper)]/50 border border-[var(--color-paper-border)] space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-semibold text-[var(--color-ink)] leading-snug line-clamp-2">
                        {art.title}
                      </h3>
                      {art.isPublished ? (
                        <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Publik
                        </span>
                      ) : (
                        <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 text-zinc-600">
                          Draf
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[var(--color-ink-soft)]">
                      {art.category || 'Refleksi'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-[var(--color-paper-border)]">
                    <div className="flex items-center gap-1.5 font-mono">
                      <Eye className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                      <span className="text-sm font-bold text-[var(--color-accent)] tabular-nums">
                        {art.views.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] text-[var(--color-ink-soft)]">views</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => promptBoostConfirmation(art.slug, 10)}
                        className="btn-interactive h-8 px-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)] hover:bg-[var(--color-accent-soft)] text-xs font-mono font-semibold text-[var(--color-ink)] transition-all cursor-pointer active:scale-95"
                        title="Tambah 10 views (dengan konfirmasi)"
                      >
                        +10
                      </button>
                      <button
                        type="button"
                        onClick={() => promptBoostConfirmation(art.slug, 50)}
                        className="btn-interactive h-8 px-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)] hover:bg-[var(--color-accent-soft)] text-xs font-mono font-semibold text-[var(--color-ink)] transition-all cursor-pointer active:scale-95"
                        title="Tambah 50 views (dengan konfirmasi)"
                      >
                        +50
                      </button>
                      <button
                        type="button"
                        onClick={() => openTargetModalForArticle(art)}
                        className="btn-interactive h-8 px-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)] hover:bg-[var(--color-accent-soft)] text-xs font-medium text-[var(--color-ink-muted)] transition-all cursor-pointer active:scale-95"
                        title="Atur target view pasti pada artikel ini"
                      >
                        Target
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ── 2. DESKTOP VIEW: CLEAN DATA TABLE (NO URL / SLUG SHOWN) ── */}
          <div className="hidden sm:block overflow-x-auto rounded-xl border border-[var(--color-paper-border)]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--color-paper)] text-[var(--color-ink-muted)] border-b border-[var(--color-paper-border)] uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Judul Artikel</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Views</th>
                  <th className="py-3 px-4 text-center">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-paper-border)] font-sans">
                {paginatedArticles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-[var(--color-ink-muted)] italic">
                      Tidak ada artikel yang cocok dengan filter atau pencarian.
                    </td>
                  </tr>
                ) : (
                  paginatedArticles.map((art) => (
                    <tr key={art.id} className="hover:bg-[var(--color-paper)]/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-[var(--color-ink)] max-w-sm lg:max-w-md line-clamp-1">
                          {art.title}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[var(--color-ink-muted)] whitespace-nowrap">
                        {art.category || 'Refleksi'}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {art.isPublished ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Publik
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 text-zinc-600">
                            Draf
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[var(--color-accent)] whitespace-nowrap tabular-nums">
                        {art.views.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => promptBoostConfirmation(art.slug, 10)}
                            className="btn-interactive px-2 py-1 rounded-md bg-[var(--color-paper)] hover:bg-[var(--color-accent-soft)] hover:border-[var(--color-accent-border)] border border-[var(--color-paper-border)] text-[11px] font-mono font-semibold text-[var(--color-ink)] transition-all cursor-pointer"
                            title="Tambah 10 views (dengan konfirmasi)"
                          >
                            +10
                          </button>
                          <button
                            type="button"
                            onClick={() => promptBoostConfirmation(art.slug, 50)}
                            className="btn-interactive px-2 py-1 rounded-md bg-[var(--color-paper)] hover:bg-[var(--color-accent-soft)] hover:border-[var(--color-accent-border)] border border-[var(--color-paper-border)] text-[11px] font-mono font-semibold text-[var(--color-ink)] transition-all cursor-pointer"
                            title="Tambah 50 views (dengan konfirmasi)"
                          >
                            +50
                          </button>
                          <button
                            type="button"
                            onClick={() => openTargetModalForArticle(art)}
                            className="btn-interactive px-2 py-1 rounded-md bg-[var(--color-paper)] hover:bg-[var(--color-accent-soft)] border border-[var(--color-paper-border)] text-[11px] font-medium text-[var(--color-ink-muted)] transition-all cursor-pointer"
                            title="Atur target view pasti pada artikel ini"
                          >
                            Target
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── ANTI-WRAP RESPONSIVE PAGINATION BAR (100% CLEAN ON MOBILE & DESKTOP) ── */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[var(--color-paper-border)] text-xs text-[var(--color-ink-muted)]">
              <div className="text-center sm:text-left text-[11px] sm:text-xs text-[var(--color-ink-soft)]">
                Menampilkan <strong className="text-[var(--color-ink)]">{(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredArticles.length)}</strong> dari <strong className="text-[var(--color-ink)]">{filteredArticles.length}</strong> artikel
              </div>

              {/* Navigation Controls: Clean on mobile, number pills on desktop */}
              <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="btn-secondary btn-interactive h-8 px-3 rounded-lg text-xs font-medium inline-flex items-center gap-1 disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex-1 sm:flex-initial justify-center"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Sebelumnya</span>
                </button>

                {/* Mobile Page Display: Compact "1 / 4" */}
                <span className="sm:hidden text-xs font-semibold font-mono px-2.5 py-1 rounded-md bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-[var(--color-ink)] shrink-0">
                  {currentPage} / {totalPages}
                </span>

                {/* Desktop Page Numbers */}
                <div className="hidden sm:flex items-center gap-1 px-1 font-mono">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCurrentPage(num)}
                      className={cn(
                        'w-7 h-7 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                        currentPage === num
                          ? 'bg-[var(--color-accent)] text-white shadow-2xs'
                          : 'hover:bg-[var(--color-paper)] text-[var(--color-ink-muted)]'
                      )}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-secondary btn-interactive h-8 px-3 rounded-lg text-xs font-medium inline-flex items-center gap-1 disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex-1 sm:flex-initial justify-center"
                >
                  <span>Berikutnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

        </section>

      </main>

      {/* ═════════════════════════════════════════════════════════════════
          MODAL 1: GENERAL DECISION CONFIRMATION MODAL
         ═════════════════════════════════════════════════════════════════ */}
      {decisionModalAnim.isRendered && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3.5 min-[340px]:p-4 overflow-hidden select-none"
        >
          <div
            className={decisionModalAnim.backdropClass}
            aria-hidden="true"
            onClick={() => setDecisionModal((prev) => ({ ...prev, isOpen: false }))}
          />
          <div
            ref={decisionRef}
            className={cn(
              'relative w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4 z-10 select-text',
              decisionModalAnim.windowClass
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                    decisionModal.variant === 'danger'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-accent-border)]'
                  )}
                >
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3
                    className="text-base font-semibold text-[var(--color-ink)]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {decisionModal.title}
                  </h3>
                  <p className="text-xs text-[var(--color-ink-muted)]">Konfirmasi tindakan konsol</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDecisionModal((prev) => ({ ...prev, isOpen: false }))}
                className="text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[var(--color-ink)] leading-relaxed bg-[var(--color-paper)] p-3 rounded-xl border border-[var(--color-paper-border)]">
              {decisionModal.description}
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDecisionModal((prev) => ({ ...prev, isOpen: false }))}
                className="btn-secondary btn-interactive h-9 px-4 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={isExecutingDecision}
                onClick={async () => {
                  setIsExecutingDecision(true);
                  try {
                    await decisionModal.onConfirm();
                  } finally {
                    setIsExecutingDecision(false);
                    setDecisionModal((prev) => ({ ...prev, isOpen: false }));
                  }
                }}
                className={cn(
                  'btn-interactive h-9 px-4 text-xs font-semibold rounded-lg text-white inline-flex items-center gap-1.5 shadow-xs cursor-pointer',
                  decisionModal.variant === 'danger'
                    ? 'bg-rose-700 hover:bg-rose-800'
                    : 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]'
                )}
              >
                {isExecutingDecision ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <span>{decisionModal.confirmLabel}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════
          MODAL 2: DIRECT TARGET SETTING MODAL (from Card / Table click)
         ═════════════════════════════════════════════════════════════════ */}
      {targetModalAnim.isRendered && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3.5 min-[340px]:p-4 overflow-hidden select-none"
        >
          <div
            className={targetModalAnim.backdropClass}
            aria-hidden="true"
            onClick={() => setTargetModal((prev) => ({ ...prev, isOpen: false }))}
          />
          <div
            ref={targetModalRef}
            className={cn(
              'relative w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4 z-10 select-text',
              targetModalAnim.windowClass
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-accent-border)] flex items-center justify-center shrink-0">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3
                    className="text-base font-semibold text-[var(--color-ink)]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    Atur Target Views
                  </h3>
                  <p className="text-xs text-[var(--color-ink-muted)]">Penyesuaian views langsung ke angka pasti</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setTargetModal((prev) => ({ ...prev, isOpen: false }))}
                className="text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] space-y-1">
              <span className="text-[11px] text-[var(--color-ink-soft)] block">Artikel Terpilih:</span>
              <p className="text-xs font-semibold text-[var(--color-ink)] line-clamp-2">
                {targetModal.title}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)]">
              <div>
                <span className="text-[10px] text-[var(--color-ink-soft)] uppercase tracking-wider block">Views Saat Ini</span>
                <span className="text-base font-bold font-mono text-[var(--color-ink)] tabular-nums">
                  {targetModal.currentViews.toLocaleString('id-ID')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--color-ink-soft)] uppercase tracking-wider block">Selisih Penambahan</span>
                <span
                  className={cn(
                    'text-base font-bold font-mono tabular-nums',
                    targetModal.targetViews - targetModal.currentViews >= 0
                      ? 'text-[var(--color-accent)]'
                      : 'text-rose-600'
                  )}
                >
                  {targetModal.targetViews - targetModal.currentViews >= 0
                    ? `+${(targetModal.targetViews - targetModal.currentViews).toLocaleString('id-ID')}`
                    : (targetModal.targetViews - targetModal.currentViews).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Quick target presets in modal */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-[var(--color-ink-soft)] block font-medium">Preset Cepat:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setTargetModal((prev) => ({ ...prev, targetViews: prev.currentViews + 50 }))
                  }
                  className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-[var(--color-paper)] border border-[var(--color-paper-border)] hover:bg-[var(--color-accent-soft)] hover:border-[var(--color-accent-border)] text-[var(--color-ink)] cursor-pointer"
                >
                  +50
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setTargetModal((prev) => ({ ...prev, targetViews: prev.currentViews + 100 }))
                  }
                  className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-[var(--color-paper)] border border-[var(--color-paper-border)] hover:bg-[var(--color-accent-soft)] hover:border-[var(--color-accent-border)] text-[var(--color-ink)] cursor-pointer"
                >
                  +100
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setTargetModal((prev) => ({ ...prev, targetViews: 250 }))
                  }
                  className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-[var(--color-paper)] border border-[var(--color-paper-border)] hover:bg-[var(--color-accent-soft)] hover:border-[var(--color-accent-border)] text-[var(--color-ink)] cursor-pointer"
                >
                  250
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setTargetModal((prev) => ({ ...prev, targetViews: 500 }))
                  }
                  className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-[var(--color-paper)] border border-[var(--color-paper-border)] hover:bg-[var(--color-accent-soft)] hover:border-[var(--color-accent-border)] text-[var(--color-ink)] cursor-pointer"
                >
                  500
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setTargetModal((prev) => ({ ...prev, targetViews: 1000 }))
                  }
                  className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-[var(--color-paper)] border border-[var(--color-paper-border)] hover:bg-[var(--color-accent-soft)] hover:border-[var(--color-accent-border)] text-[var(--color-ink)] cursor-pointer"
                >
                  1.000
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--color-ink-muted)] block">Input Angka Target</label>
              <input
                type="number"
                min={0}
                value={targetModal.targetViews}
                onChange={(e) =>
                  setTargetModal((prev) => ({
                    ...prev,
                    targetViews: Math.max(0, Number(e.target.value)),
                  }))
                }
                className="w-full h-10 px-3 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-sm font-mono font-bold text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-paper-border)]">
              <button
                type="button"
                onClick={() => setTargetModal((prev) => ({ ...prev, isOpen: false }))}
                className="btn-secondary btn-interactive h-9 px-4 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={isExecutingTarget}
                onClick={async () => {
                  setIsExecutingTarget(true);
                  try {
                    await executeSetTarget(targetModal.slug, targetModal.targetViews);
                  } finally {
                    setIsExecutingTarget(false);
                    setTargetModal((prev) => ({ ...prev, isOpen: false }));
                  }
                }}
                className="btn-primary btn-interactive h-9 px-4 text-xs font-semibold rounded-lg text-white inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                {isExecutingTarget ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menerapkan...</span>
                  </>
                ) : (
                  <span>Terapkan Target</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════
          MODAL 3: ADMIN SESSION EXPIRED DIALOG
         ═════════════════════════════════════════════════════════════════ */}
      {sessionExpiredAnim.isRendered && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden select-none"
        >
          <div className={sessionExpiredAnim.backdropClass} aria-hidden="true" />
          <div
            ref={sessionExpiredRef}
            className={cn(
              'relative w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl p-6 shadow-xl space-y-4 z-10 text-center select-text',
              sessionExpiredAnim.windowClass
            )}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 mx-auto flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2
                className="text-lg font-medium text-[var(--color-ink)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Sesi Admin Telah Berakhir
              </h2>
              <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
                Demi keamanan, sesi admin Anda telah berakhir setelah 30 menit. Silakan masuk kembali ke Portal Admin untuk melanjutkan operasional.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <Link
                href="/admin"
                className="btn-primary btn-interactive flex-1 h-10 inline-flex items-center justify-center gap-2 text-xs font-semibold rounded-xl text-white shadow-xs"
              >
                <span>Masuk Kembali ke Portal Admin</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
