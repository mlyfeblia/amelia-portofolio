'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import {
  Lock,
  Flame,
  Play,
  Square,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  ArrowUpRight,
  Sparkles,
  Sliders,
  History,
  ShieldAlert,
} from 'lucide-react';

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

export default function SecretViewClient({ initialArticles }: SecretViewClientProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isCheckingPin, setIsCheckingPin] = useState(false);

  const [articles, setArticles] = useState<ArticleItem[]>(initialArticles);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSlug, setSelectedSlug] = useState<string>('all');
  const [customCount, setCustomCount] = useState<number>(25);
  const [targetViewInput, setTargetViewInput] = useState<number>(100);
  const [activeTab, setActiveTab] = useState<'autopilot' | 'batch' | 'target'>('autopilot');

  // Auto-Pilot state
  const [isAutoPilot, setIsAutoPilot] = useState(false);
  const [intervalSeconds, setIntervalSeconds] = useState<number>(8);
  const [autoMinViews, setAutoMinViews] = useState<number>(1);
  const [autoMaxViews, setAutoMaxViews] = useState<number>(3);
  const [autoTarget, setAutoTarget] = useState<'random' | string>('random');
  const autoPilotTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Status & logs
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRefreshing, startRefreshTransition] = useTransition();
  const [actionSuccessMessage, setActionSuccessMessage] = useState('');
  const [actionErrorMessage, setActionErrorMessage] = useState('');

  const addLog = (type: 'success' | 'info' | 'error', message: string) => {
    const time = new Date().toLocaleTimeString('id-ID', { hour12: false });
    setLogs((prev) => [{ id: Math.random().toString(), time, type, message }, ...prev.slice(0, 49)]);
  };

  // 1. PIN Submit Verification
  const handleVerifyPin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin.trim()) return;

    setIsCheckingPin(true);
    setPinError('');

    try {
      const res = await fetch('/api/xyzordie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_pin', pin: pin.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsUnlocked(true);
        addLog('info', 'Gerbang otorisasi berhasil dibuka.');
        fetchLatestArticles();
      } else {
        setPinError(data.message || 'PIN rahasia salah.');
      }
    } catch {
      setPinError('Gagal memverifikasi PIN. Periksa koneksi.');
    } finally {
      setIsCheckingPin(false);
    }
  };

  // 2. Refresh Articles Data
  const fetchLatestArticles = async () => {
    startRefreshTransition(async () => {
      try {
        const res = await fetch('/api/xyzordie', {
          headers: { 'x-secret-pin': '071220' },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.articles) {
            setArticles(data.articles);
          }
        }
      } catch {
        // silent fail
      }
    });
  };

  // 3. Quick / Batch Boost
  const handleBoost = async (slug: string, count: number) => {
    setActionSuccessMessage('');
    setActionErrorMessage('');

    try {
      if (slug === 'all') {
        const res = await fetch('/api/xyzordie', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-secret-pin': '071220' },
          body: JSON.stringify({ action: 'boost_all', count, pin: '071220' }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setActionSuccessMessage(data.message);
          addLog('success', `+${count} views ditambahkan ke seluruh artikel.`);
          fetchLatestArticles();
        } else {
          setActionErrorMessage(data.message || 'Gagal menambah views');
        }
      } else {
        const res = await fetch('/api/xyzordie', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-secret-pin': '071220' },
          body: JSON.stringify({ action: 'boost', slug, count, pin: '071220' }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setActionSuccessMessage(data.message);
          addLog('success', `+${count} views [${slug}] -> total ${data.currentViews}`);
          // Optimistic local update
          setArticles((prev) =>
            prev.map((a) => (a.slug === slug ? { ...a, views: data.currentViews } : a))
          );
        } else {
          setActionErrorMessage(data.message || 'Gagal menambah views');
        }
      }
    } catch {
      setActionErrorMessage('Terjadi gangguan jaringan');
    }
  };

  // 4. Set Exact Target Views
  const handleSetTarget = async (slug: string, targetViews: number) => {
    if (slug === 'all') {
      setActionErrorMessage('Harap pilih artikel spesifik untuk target view.');
      return;
    }

    try {
      const res = await fetch('/api/xyzordie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-secret-pin': '071220' },
        body: JSON.stringify({ action: 'set', slug, targetViews, pin: '071220' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccessMessage(data.message);
        addLog('info', `Target views [${slug}] diubah ke ${data.currentViews}`);
        setArticles((prev) =>
          prev.map((a) => (a.slug === slug ? { ...a, views: data.currentViews } : a))
        );
      } else {
        setActionErrorMessage(data.message || 'Gagal mengubah target views');
      }
    } catch {
      setActionErrorMessage('Terjadi kesalahan jaringan');
    }
  };

  // 5. Auto-Pilot Runner Loop
  useEffect(() => {
    if (!isAutoPilot) {
      if (autoPilotTimerRef.current) {
        clearInterval(autoPilotTimerRef.current);
        autoPilotTimerRef.current = null;
      }
      return;
    }

    addLog('info', `Auto-Pilot aktif. Interval setiap ${intervalSeconds} detik.`);

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

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            addLog('success', `[Auto-Pilot] +${data.added} views -> [${data.slug}] total ${data.currentViews}`);
            setArticles((prev) =>
              prev.map((a) => (a.slug === data.slug ? { ...a, views: data.currentViews } : a))
            );
          }
        }
      } catch {
        // silent fail on network jitter
      }
    };

    // Run first tick immediately
    executeTick();

    // Loop
    autoPilotTimerRef.current = setInterval(executeTick, intervalSeconds * 1000);

    return () => {
      if (autoPilotTimerRef.current) {
        clearInterval(autoPilotTimerRef.current);
        autoPilotTimerRef.current = null;
      }
    };
  }, [isAutoPilot, intervalSeconds, autoMinViews, autoMaxViews, autoTarget]);

  // Filtered articles
  const filteredArticles = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAllViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);

  // ── Render Screen: PIN Lock Screen ──
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#0D1410] text-[#E0EBE4] flex flex-col items-center justify-center p-4 selection:bg-emerald-900 selection:text-white">
        <div className="w-full max-w-sm bg-[#141F19] border border-[#23332A] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-white">
              Restricted Operation Gateway
            </h1>
            <p className="text-xs text-[#8A9F93]">
              Masukkan PIN otorisasi rahasia untuk membuka dasbor manajemen views.
            </p>
          </div>

          <form onSubmit={handleVerifyPin} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="secret-pin" className="text-xs font-medium text-[#A1B5A9]">
                PIN Otorisasi (6 Digit)
              </label>
              <input
                id="secret-pin"
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setPinError('');
                }}
                placeholder="••••••"
                autoFocus
                className="w-full h-11 px-4 text-center tracking-[0.5em] text-lg font-mono bg-[#0D1410] border border-[#2B3E34] rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:tracking-normal placeholder:text-sm placeholder:text-[#4A5D52]"
              />
            </div>

            {pinError && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/20 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{pinError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isCheckingPin || pin.length < 4}
              className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50"
            >
              {isCheckingPin ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <span>Buka Akses</span>
                  <ArrowUpRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-[#23332A] flex items-center justify-between text-[11px] text-[#5C7366]">
            <span>Status: Sesi Admin Aktif</span>
            <span>v2.6.0 Internal</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Render Screen: Secret View Engine Dashboard ──
  return (
    <div className="min-h-screen bg-[#0D1410] text-[#E0EBE4] p-4 sm:p-6 lg:p-8 font-sans selection:bg-emerald-900 selection:text-white">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Top Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#141F19] border border-[#23332A] shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950 border border-emerald-500/30 text-emerald-400">
                <Flame className="w-3 h-3" /> Secret View Engine
              </span>
              <span className="text-xs text-[#5C7366] font-mono">/xyzordie</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Otomasi Pembaca Artikel
            </h1>
            <p className="text-xs text-[#8A9F93]">
              Pengatur jumlah pembaca artikel secara atomik, instan, atau berkelanjutan (Auto-Pilot).
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right px-3 py-1.5 rounded-xl bg-[#0D1410] border border-[#23332A]">
              <span className="text-[10px] uppercase tracking-wider text-[#5C7366] block">Total Pembaca</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">
                {totalAllViews.toLocaleString('id-ID')}
              </span>
            </div>

            <button
              type="button"
              onClick={fetchLatestArticles}
              disabled={isRefreshing}
              className="h-10 px-3.5 rounded-xl border border-[#2B3E34] bg-[#1A2821] hover:bg-[#23352C] text-[#C1D4C9] text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="Segarkan data dari server"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => setIsUnlocked(false)}
              className="h-10 px-3 rounded-xl border border-rose-900/30 bg-rose-950/20 hover:bg-rose-900/40 text-rose-300 text-xs font-medium transition-all cursor-pointer"
              title="Kunci kembali dasbor"
            >
              Kunci
            </button>
          </div>
        </header>

        {/* Action Alerts */}
        {actionSuccessMessage && (
          <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{actionSuccessMessage}</span>
            </div>
            <button
              onClick={() => setActionSuccessMessage('')}
              className="text-emerald-400 hover:text-emerald-200 text-xs font-mono"
            >
              ✕
            </button>
          </div>
        )}
        {actionErrorMessage && (
          <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{actionErrorMessage}</span>
            </div>
            <button
              onClick={() => setActionErrorMessage('')}
              className="text-rose-400 hover:text-rose-200 text-xs font-mono"
            >
              ✕
            </button>
          </div>
        )}

        {/* Engine Modes: Auto-Pilot vs Quick Batch vs Target */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Panel: Control Center (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-[#141F19] border border-[#23332A] rounded-2xl p-5 space-y-5">
              
              {/* Tab Selector */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0D1410] border border-[#23332A]">
                <button
                  type="button"
                  onClick={() => setActiveTab('autopilot')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'autopilot'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-[#8A9F93] hover:text-white'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>1. Auto-Pilot (Otomatis)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('batch')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'batch'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-[#8A9F93] hover:text-white'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>2. Tambah Cepat</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('target')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'target'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-[#8A9F93] hover:text-white'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>3. Atur Target</span>
                </button>
              </div>

              {/* ── Tab 1: Auto-Pilot ── */}
              {activeTab === 'autopilot' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#0D1410] border border-[#23332A]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">Status Auto-Pilot</span>
                        {isAutoPilot ? (
                          <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Berjalan
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-[#5C7366] bg-[#141F19] px-2 py-0.5 rounded-full border border-[#23332A]">
                            Nonaktif
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#8A9F93]">
                        {isAutoPilot
                          ? `Menambah views setiap ${intervalSeconds} detik secara otomatis.`
                          : 'Aktifkan untuk menambah pembaca secara berkala dan alami.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAutoPilot(!isAutoPilot)}
                      className={`h-10 px-5 rounded-xl font-medium text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                        isAutoPilot
                          ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/40'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
                      }`}
                    >
                      {isAutoPilot ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>Hentikan</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Mulai Auto-Pilot</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-[#8A9F93]">Target Artikel</label>
                      <select
                        value={autoTarget}
                        onChange={(e) => setAutoTarget(e.target.value)}
                        className="w-full h-9 px-2.5 rounded-lg bg-[#0D1410] border border-[#23332A] text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="random">🎲 Seluruh Artikel (Acak)</option>
                        {articles.map((a) => (
                          <option key={a.id} value={a.slug}>
                            {a.title.slice(0, 32)}... ({a.views} views)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-[#8A9F93]">Interval Detik</label>
                      <select
                        value={intervalSeconds}
                        onChange={(e) => setIntervalSeconds(Number(e.target.value))}
                        className="w-full h-9 px-2.5 rounded-lg bg-[#0D1410] border border-[#23332A] text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value={5}>Setiap 5 Detik (Cepat)</option>
                        <option value={8}>Setiap 8 Detik (Rekomendasi)</option>
                        <option value={15}>Setiap 15 Detik (Santai)</option>
                        <option value={30}>Setiap 30 Detik (Natural)</option>
                        <option value={60}>Setiap 1 Menit</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-[#8A9F93]">Views / Tik</label>
                      <div className="flex items-center gap-1.5 h-9 px-2.5 rounded-lg bg-[#0D1410] border border-[#23332A] text-xs text-white">
                        <span>Antara</span>
                        <input
                          type="number"
                          min={1}
                          max={5}
                          value={autoMinViews}
                          onChange={(e) => setAutoMinViews(Math.max(1, Number(e.target.value)))}
                          className="w-8 text-center bg-transparent border-b border-emerald-500 focus:outline-none"
                        />
                        <span>sd</span>
                        <input
                          type="number"
                          min={autoMinViews}
                          max={10}
                          value={autoMaxViews}
                          onChange={(e) => setAutoMaxViews(Math.max(autoMinViews, Number(e.target.value)))}
                          className="w-8 text-center bg-transparent border-b border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Tab 2: Quick Batch Boost ── */}
              {activeTab === 'batch' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#8A9F93]">Pilih Target Artikel</label>
                    <select
                      value={selectedSlug}
                      onChange={(e) => setSelectedSlug(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-[#0D1410] border border-[#23332A] text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="all">🌐 Seluruh Artikel Publik Sekaligus</option>
                      {articles.map((a) => (
                        <option key={a.id} value={a.slug}>
                          {a.title} ({a.views} views)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[#8A9F93]">Pilihan Penambahan Instan</label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {[10, 25, 50, 100, 250, 500].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleBoost(selectedSlug, num)}
                          className="h-10 rounded-xl bg-[#0D1410] hover:bg-emerald-950/60 border border-[#2B3E34] hover:border-emerald-500/50 text-white font-mono text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95"
                        >
                          <Flame className="w-3 h-3 text-emerald-400" />
                          <span>+{num}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={5000}
                      value={customCount}
                      onChange={(e) => setCustomCount(Math.max(1, Number(e.target.value)))}
                      className="w-32 h-10 px-3 rounded-xl bg-[#0D1410] border border-[#23332A] text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                      placeholder="Angka custom"
                    />
                    <button
                      type="button"
                      onClick={() => handleBoost(selectedSlug, customCount)}
                      className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Tambah +{customCount} Views</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ── Tab 3: Set Exact Target Views ── */}
              {activeTab === 'target' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/20 text-amber-200 text-xs flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>Mode Target akan langsung mengatur nilai `views` artikel ke angka pasti yang kamu masukkan.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#8A9F93]">Pilih Artikel Spesifik</label>
                    <select
                      value={selectedSlug === 'all' && articles[0] ? articles[0].slug : selectedSlug}
                      onChange={(e) => {
                        setSelectedSlug(e.target.value);
                        const match = articles.find((a) => a.slug === e.target.value);
                        if (match) setTargetViewInput(match.views);
                      }}
                      className="w-full h-10 px-3 rounded-xl bg-[#0D1410] border border-[#23332A] text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      {articles.map((a) => (
                        <option key={a.id} value={a.slug}>
                          {a.title} (Saat ini: {a.views} views)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-[#8A9F93] block">Target Views</label>
                      <input
                        type="number"
                        min={0}
                        value={targetViewInput}
                        onChange={(e) => setTargetViewInput(Math.max(0, Number(e.target.value)))}
                        className="w-36 h-10 px-3 rounded-xl bg-[#0D1410] border border-[#23332A] text-sm text-white font-mono font-semibold focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="pt-5">
                      <button
                        type="button"
                        onClick={() => {
                          const target = selectedSlug === 'all' && articles[0] ? articles[0].slug : selectedSlug;
                          handleSetTarget(target, targetViewInput);
                        }}
                        className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Terapkan Target</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Right Panel: Live Activity Terminal (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#141F19] border border-[#23332A] rounded-2xl p-5 space-y-3 h-full flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-white tracking-wide">Live Activity Log</span>
                </div>
                <button
                  type="button"
                  onClick={() => setLogs([])}
                  className="text-[11px] text-[#5C7366] hover:text-white transition-colors"
                >
                  Bersihkan
                </button>
              </div>

              <div className="flex-1 min-h-[220px] max-h-[300px] overflow-y-auto p-3 rounded-xl bg-[#0D1410] border border-[#23332A] font-mono text-[11px] space-y-1.5 scrollbar-thin">
                {logs.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-[#4A5D52] italic text-xs">
                    Belum ada aktivitas. Mulai Auto-Pilot atau tambah view secara manual.
                  </div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-[#4A5D52] shrink-0">[{log.time}]</span>
                      <span
                        className={
                          log.type === 'success'
                            ? 'text-emerald-400'
                            : log.type === 'error'
                            ? 'text-rose-400'
                            : 'text-[#8A9F93]'
                        }
                      >
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Section: Articles Table */}
        <section className="bg-[#141F19] border border-[#23332A] rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                Daftar Seluruh Artikel ({articles.length})
              </h2>
              <p className="text-xs text-[#8A9F93]">
                Klik aksi cepat untuk menambah pembaca secara spesifik pada masing-masing artikel.
              </p>
            </div>

            <div className="w-full sm:w-64 relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#5C7366]" />
              <input
                type="text"
                placeholder="Cari artikel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-xl bg-[#0D1410] border border-[#23332A] text-xs text-white placeholder:text-[#4A5D52] focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#23332A]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0D1410] text-[#8A9F93] border-b border-[#23332A] uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Judul Artikel</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Views Saat Ini</th>
                  <th className="py-3 px-4 text-center">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1D2B23] font-sans">
                {filteredArticles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#5C7366] italic">
                      Tidak ada artikel yang cocok dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredArticles.map((art) => (
                    <tr key={art.id} className="hover:bg-[#1A2821]/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-white max-w-md line-clamp-1">
                          {art.title}
                        </div>
                        <span className="text-[10px] text-[#5C7366] font-mono">{art.slug}</span>
                      </td>
                      <td className="py-3 px-4 text-[#8A9F93] whitespace-nowrap">
                        {art.category || 'Refleksi'}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {art.isPublished ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/20">
                            Publik
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-800 text-zinc-400">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Eye className="w-3 h-3 text-[#5C7366]" />
                          {art.views.toLocaleString('id-ID')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleBoost(art.slug, 10)}
                            className="px-2 py-1 rounded-md bg-[#0D1410] hover:bg-emerald-950 border border-[#2B3E34] hover:border-emerald-500/40 text-[11px] font-mono text-emerald-300 transition-all cursor-pointer"
                            title="Tambah 10 views"
                          >
                            +10
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBoost(art.slug, 50)}
                            className="px-2 py-1 rounded-md bg-[#0D1410] hover:bg-emerald-950 border border-[#2B3E34] hover:border-emerald-500/40 text-[11px] font-mono text-emerald-300 transition-all cursor-pointer"
                            title="Tambah 50 views"
                          >
                            +50
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBoost(art.slug, 100)}
                            className="px-2 py-1 rounded-md bg-[#0D1410] hover:bg-emerald-950 border border-[#2B3E34] hover:border-emerald-500/40 text-[11px] font-mono text-emerald-300 transition-all cursor-pointer"
                            title="Tambah 100 views"
                          >
                            +100
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
