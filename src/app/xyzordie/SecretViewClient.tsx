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
  Sliders,
  History,
  ShieldAlert,
  Zap,
  ChevronDown,
  ChevronUp,
  Terminal,
  Activity,
  Layers,
  Check,
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
  const [showMobileLogs, setShowMobileLogs] = useState(false);

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
          addLog('success', `+${count} views ke seluruh ${data.totalUpdated || 'semua'} artikel.`);
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
      setActionErrorMessage('Harap pilih satu artikel spesifik untuk mode target view.');
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
        addLog('info', `Target views [${slug}] disetel ke ${data.currentViews}`);
        setArticles((prev) =>
          prev.map((a) => (a.slug === slug ? { ...a, views: data.currentViews } : a))
        );
      } else {
        setActionErrorMessage(data.message || 'Gagal mengatur target views');
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

    addLog('info', `Auto-Pilot aktif. Menjalankan penambahan setiap ${intervalSeconds} detik.`);

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
            addLog('success', `+${data.added} views -> [${data.slug}] total ${data.currentViews}`);
            setArticles((prev) =>
              prev.map((a) => (a.slug === data.slug ? { ...a, views: data.currentViews } : a))
            );
          }
        }
      } catch {
        // silent fail on intermittent network drop
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

  // Filtered articles
  const filteredArticles = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAllViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);

  // ═════════════════════════════════════════════════════════════════════
  // SCREEN 1: PIN LOCK GATEWAY (Obsidian Security Screen)
  // ═════════════════════════════════════════════════════════════════════
  if (!isUnlocked) {
    return (
      <main className="min-h-screen bg-[#070B09] text-[#E0EBE4] flex flex-col items-center justify-center p-3.5 min-[340px]:p-5 sm:p-8 selection:bg-emerald-900 selection:text-white">
        <div className="w-full max-w-[340px] sm:max-w-[380px] bg-[#0E1511] border border-[#1B2921] rounded-2xl p-5 sm:p-7 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center space-y-2 relative z-10">
            <div className="w-11 h-11 rounded-xl bg-[#14201A] border border-emerald-500/25 text-emerald-400 mx-auto flex items-center justify-center shadow-inner">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1 pt-1">
              <span className="text-[10.5px] uppercase tracking-wider font-mono text-emerald-400 font-semibold block">
                /xyzordie gateway
              </span>
              <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white">
                Otorisasi Konsol Rahasia
              </h1>
              <p className="text-xs text-[#7A9184] leading-relaxed">
                Masukkan 6-digit PIN otorisasi internal untuk membuka dasbor views.
              </p>
            </div>
          </div>

          <form onSubmit={handleVerifyPin} className="space-y-4 relative z-10">
            <div className="space-y-1.5">
              <label htmlFor="secret-pin" className="text-[11.5px] font-medium text-[#9BB1A4] block">
                Kode PIN Akses
              </label>
              <input
                id="secret-pin"
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, ''));
                  setPinError('');
                }}
                placeholder="••••••"
                autoFocus
                className="w-full h-11 px-3 text-center tracking-[0.35em] sm:tracking-[0.5em] text-lg font-mono bg-[#070B09] border border-[#23352B] rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:tracking-normal placeholder:text-sm placeholder:text-[#42554A]"
              />
            </div>

            {pinError && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/20 text-rose-300 text-xs animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span className="leading-tight">{pinError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isCheckingPin || pin.length < 4}
              className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-medium text-xs sm:text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60"
            >
              {isCheckingPin ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <span>Buka Akses Konsol</span>
                  <ArrowUpRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-[#18241E] flex items-center justify-between text-[10.5px] text-[#55695E] relative z-10">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Sesi Admin Aktif
            </span>
            <span className="font-mono">v2.6.0</span>
          </div>
        </div>
      </main>
    );
  }

  // ═════════════════════════════════════════════════════════════════════
  // SCREEN 2: SECRET VIEW ENGINE CONSOLE (Obsidian Command Console)
  // ═════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#070B09] text-[#E0EBE4] p-3.5 min-[340px]:p-5 sm:p-7 lg:p-10 font-sans selection:bg-emerald-900 selection:text-white">
      <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6">

        {/* ── Top Header & Telemetry Summary HUD ── */}
        <header className="rounded-2xl bg-[#0E1511] border border-[#1B2921] p-4 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            
            {/* Title & Brand */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-950/90 border border-emerald-500/30 text-emerald-400">
                  <Terminal className="w-3 h-3" /> /xyzordie
                </span>
                <span className="text-[11px] text-[#55695E] font-mono">Restricted Telemetry Console</span>
              </div>
              <h1 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
                Konsol Otomasi Pembaca Artikel
              </h1>
              <p className="text-xs text-[#7A9184] max-w-xl">
                Sistem internal untuk menambah jumlah pembaca secara atomik, instan, maupun terjadwal berkala (Auto-Pilot).
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
              <button
                type="button"
                onClick={fetchLatestArticles}
                disabled={isRefreshing}
                className="btn-interactive h-9 min-[340px]:h-10 px-3 sm:px-4 rounded-xl border border-[#23352B] bg-[#14201A] hover:bg-[#1A2A22] text-[#C1D4C9] text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 flex-1 sm:flex-initial"
                title="Segarkan data terbaru"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
                <span>Segarkan</span>
              </button>

              <button
                type="button"
                onClick={() => setIsUnlocked(false)}
                className="btn-interactive h-9 min-[340px]:h-10 px-3.5 rounded-xl border border-rose-900/30 bg-rose-950/20 hover:bg-rose-900/30 text-rose-300 text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5"
                title="Kunci kembali konsol"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden min-[360px]:inline">Kunci</span>
              </button>
            </div>
          </div>

          {/* Telemetry Metric Cards */}
          <div className="grid grid-cols-2 min-[480px]:grid-cols-4 gap-2.5 sm:gap-3 pt-1 border-t border-[#18241E]">
            <div className="p-3 rounded-xl bg-[#070B09] border border-[#18241E]">
              <span className="text-[10px] uppercase tracking-wider text-[#55695E] font-medium block">
                Total Pembaca
              </span>
              <span className="text-base sm:text-xl font-bold font-mono text-emerald-400 tabular-nums">
                {totalAllViews.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#070B09] border border-[#18241E]">
              <span className="text-[10px] uppercase tracking-wider text-[#55695E] font-medium block">
                Jumlah Artikel
              </span>
              <span className="text-base sm:text-xl font-bold font-mono text-white tabular-nums">
                {articles.length} <span className="text-xs font-normal text-[#55695E]">item</span>
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#070B09] border border-[#18241E]">
              <span className="text-[10px] uppercase tracking-wider text-[#55695E] font-medium block">
                Status Auto-Pilot
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isAutoPilot ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'
                  }`}
                />
                <span
                  className={`text-xs sm:text-sm font-semibold font-mono ${
                    isAutoPilot ? 'text-emerald-400' : 'text-[#7A9184]'
                  }`}
                >
                  {isAutoPilot ? 'Aktif' : 'Standby'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#070B09] border border-[#18241E]">
              <span className="text-[10px] uppercase tracking-wider text-[#55695E] font-medium block">
                Koneksi Database
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs sm:text-sm font-semibold text-emerald-400 font-mono">
                  Tersambung
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ── Status Alerts ── */}
        {actionSuccessMessage && (
          <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span className="leading-relaxed">{actionSuccessMessage}</span>
            </div>
            <button
              onClick={() => setActionSuccessMessage('')}
              className="text-emerald-400 hover:text-emerald-200 text-xs font-mono px-1 py-0.5 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}
        {actionErrorMessage && (
          <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span className="leading-relaxed">{actionErrorMessage}</span>
            </div>
            <button
              onClick={() => setActionErrorMessage('')}
              className="text-rose-400 hover:text-rose-200 text-xs font-mono px-1 py-0.5 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Control Center & Activity Terminal ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">

          {/* Left Panel: Segmented Control Hub (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-[#0E1511] border border-[#1B2921] rounded-2xl p-4 sm:p-5 space-y-5 shadow-xl">
              
              {/* Segmented Tab Controls (Responsive Mobile & Desktop) */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-[#070B09] border border-[#18241E]">
                <button
                  type="button"
                  onClick={() => setActiveTab('autopilot')}
                  className={`flex-1 py-2 px-2 sm:px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'autopilot'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-[#7A9184] hover:text-white'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span className="sm:hidden">Auto</span>
                  <span className="hidden sm:inline">1. Auto-Pilot</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('batch')}
                  className={`flex-1 py-2 px-2 sm:px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'batch'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-[#7A9184] hover:text-white'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span className="sm:hidden">Cepat</span>
                  <span className="hidden sm:inline">2. Tambah Cepat</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('target')}
                  className={`flex-1 py-2 px-2 sm:px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'target'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-[#7A9184] hover:text-white'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span className="sm:hidden">Target</span>
                  <span className="hidden sm:inline">3. Atur Target</span>
                </button>
              </div>

              {/* ── MODE 1: AUTO-PILOT ── */}
              {activeTab === 'autopilot' && (
                <div className="space-y-4">
                  {/* Master Toggle Banner */}
                  <div className="flex flex-col min-[420px]:flex-row items-start min-[420px]:items-center justify-between gap-3 p-4 rounded-xl bg-[#070B09] border border-[#18241E]">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-semibold text-white">
                          Status Runner
                        </span>
                        {isAutoPilot ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Aktif ({intervalSeconds}s)
                          </span>
                        ) : (
                          <span className="text-[11px] font-mono text-[#55695E] bg-[#0E1511] px-2 py-0.5 rounded-full border border-[#18241E]">
                            Nonaktif
                          </span>
                        )}
                      </div>
                      <p className="text-[11.5px] text-[#7A9184] leading-normal">
                        {isAutoPilot
                          ? `Menambah views setiap ${intervalSeconds} detik secara otomatis.`
                          : 'Jalankan untuk penambahan pembaca berkala dan acak natural.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAutoPilot(!isAutoPilot)}
                      className={`btn-interactive h-10 px-4 min-[340px]:px-5 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg w-full min-[420px]:w-auto shrink-0 ${
                        isAutoPilot
                          ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/40'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
                      }`}
                    >
                      {isAutoPilot ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>Hentikan Runner</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Mulai Auto-Pilot</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Settings Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-[#7A9184] block">
                        Target Artikel
                      </label>
                      <select
                        value={autoTarget}
                        onChange={(e) => setAutoTarget(e.target.value)}
                        className="w-full h-10 px-2.5 rounded-xl bg-[#070B09] border border-[#1B2921] text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      >
                        <option value="random">🎲 Seluruh Artikel (Acak)</option>
                        {articles.map((a) => (
                          <option key={a.id} value={a.slug}>
                            {a.title.slice(0, 30)}... ({a.views} views)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-[#7A9184] block">
                        Frekuensi Interval
                      </label>
                      <select
                        value={intervalSeconds}
                        onChange={(e) => setIntervalSeconds(Number(e.target.value))}
                        className="w-full h-10 px-2.5 rounded-xl bg-[#070B09] border border-[#1B2921] text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      >
                        <option value={5}>Setiap 5 Detik (Cepat)</option>
                        <option value={8}>Setiap 8 Detik (Rekomendasi)</option>
                        <option value={15}>Setiap 15 Detik (Santai)</option>
                        <option value={30}>Setiap 30 Detik (Natural)</option>
                        <option value={60}>Setiap 1 Menit</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-[#7A9184] block">
                        Views per Tik
                      </label>
                      <div className="flex items-center justify-between gap-1.5 h-10 px-3 rounded-xl bg-[#070B09] border border-[#1B2921] text-xs text-white font-mono">
                        <span className="text-[11px] text-[#7A9184]">Acak:</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={1}
                            max={5}
                            value={autoMinViews}
                            onChange={(e) => setAutoMinViews(Math.max(1, Number(e.target.value)))}
                            className="w-8 text-center bg-transparent border-b border-emerald-500/50 focus:border-emerald-500 focus:outline-none text-emerald-400 font-bold"
                          />
                          <span className="text-[#55695E]">-</span>
                          <input
                            type="number"
                            min={autoMinViews}
                            max={10}
                            value={autoMaxViews}
                            onChange={(e) => setAutoMaxViews(Math.max(autoMinViews, Number(e.target.value)))}
                            className="w-8 text-center bg-transparent border-b border-emerald-500/50 focus:border-emerald-500 focus:outline-none text-emerald-400 font-bold"
                          />
                          <span className="text-[10px] text-[#55695E]">views</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── MODE 2: QUICK BATCH BOOST ── */}
              {activeTab === 'batch' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#7A9184] block">
                      Pilih Sasaran Artikel
                    </label>
                    <select
                      value={selectedSlug}
                      onChange={(e) => setSelectedSlug(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-[#070B09] border border-[#1B2921] text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
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
                    <span className="text-xs font-medium text-[#7A9184] block">
                      Tombol Penambahan Instan
                    </span>
                    <div className="grid grid-cols-2 min-[340px]:grid-cols-3 sm:grid-cols-6 gap-2">
                      {[10, 25, 50, 100, 250, 500].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleBoost(selectedSlug, num)}
                          className="btn-interactive h-10 rounded-xl bg-[#070B09] hover:bg-emerald-950/60 border border-[#1B2921] hover:border-emerald-500/40 text-white font-mono text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95"
                        >
                          <Flame className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>+{num}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col min-[380px]:flex-row items-stretch min-[380px]:items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min={1}
                        max={5000}
                        value={customCount}
                        onChange={(e) => setCustomCount(Math.max(1, Number(e.target.value)))}
                        className="w-full h-10 px-3 rounded-xl bg-[#070B09] border border-[#1B2921] text-xs text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                        placeholder="Jumlah custom"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#55695E] font-mono pointer-events-none">
                        views
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBoost(selectedSlug, customCount)}
                      className="btn-interactive h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40 shrink-0"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Tambah +{customCount} Views</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ── MODE 3: ATUR TARGET ── */}
              {activeTab === 'target' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/25 text-amber-200 text-xs flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                    <span className="leading-relaxed">
                      Mode Target akan langsung menyesuaikan angka views artikel ke angka pasti yang kamu masukkan.
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#7A9184] block">
                      Pilih Artikel
                    </label>
                    <select
                      value={selectedSlug === 'all' && articles[0] ? articles[0].slug : selectedSlug}
                      onChange={(e) => {
                        setSelectedSlug(e.target.value);
                        const match = articles.find((a) => a.slug === e.target.value);
                        if (match) setTargetViewInput(match.views);
                      }}
                      className="w-full h-10 px-3 rounded-xl bg-[#070B09] border border-[#1B2921] text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    >
                      {articles.map((a) => (
                        <option key={a.id} value={a.slug}>
                          {a.title} (Saat ini: {a.views} views)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col min-[380px]:flex-row items-stretch min-[380px]:items-center gap-3">
                    <div className="space-y-1 flex-1">
                      <label className="text-[11px] text-[#7A9184] block">
                        Target Jumlah Pembaca
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={targetViewInput}
                        onChange={(e) => setTargetViewInput(Math.max(0, Number(e.target.value)))}
                        className="w-full h-10 px-3 rounded-xl bg-[#070B09] border border-[#1B2921] text-sm text-white font-mono font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>

                    <div className="min-[380px]:pt-5">
                      <button
                        type="button"
                        onClick={() => {
                          const target = selectedSlug === 'all' && articles[0] ? articles[0].slug : selectedSlug;
                          handleSetTarget(target, targetViewInput);
                        }}
                        className="btn-interactive w-full min-[380px]:w-auto h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40"
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

          {/* Right Panel: Live Activity Terminal (5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="bg-[#0E1511] border border-[#1B2921] rounded-2xl p-4 sm:p-5 space-y-3 shadow-xl">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-white tracking-wide">
                    Live Telemetry Log
                  </span>
                  <span className="text-[10px] font-mono text-[#55695E]">({logs.length})</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Mobile toggle log visibility button */}
                  <button
                    type="button"
                    onClick={() => setShowMobileLogs(!showMobileLogs)}
                    className="lg:hidden text-[11px] text-[#7A9184] hover:text-white transition-colors flex items-center gap-1 px-2 py-0.5 rounded-lg border border-[#18241E]"
                  >
                    {showMobileLogs ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    <span>{showMobileLogs ? 'Tutup' : 'Lihat'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLogs([])}
                    className="text-[11px] text-[#55695E] hover:text-[#C1D4C9] transition-colors cursor-pointer px-1 py-0.5"
                  >
                    Bersihkan
                  </button>
                </div>
              </div>

              {/* Terminal Screen (Always open on lg:, toggled on mobile) */}
              <div
                className={`${
                  showMobileLogs ? 'block' : 'hidden lg:block'
                } h-[200px] sm:h-[240px] overflow-y-auto p-3 rounded-xl bg-[#070B09] border border-[#18241E] font-mono text-[11px] space-y-1.5 scrollbar-thin select-text`}
              >
                {logs.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-[#42554A] italic text-xs text-center px-4">
                    Belum ada aktivitas. Mulai Auto-Pilot atau tambah view secara instan.
                  </div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-1.5 leading-relaxed break-all">
                      <span className="text-[#42554A] shrink-0 font-mono">[{log.time}]</span>
                      <span
                        className={
                          log.type === 'success'
                            ? 'text-emerald-400'
                            : log.type === 'error'
                            ? 'text-rose-400'
                            : 'text-[#85998D]'
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

        {/* ── Articles List Section (Dual-Mode: Smart Cards on Mobile, High-Density Table on Desktop) ── */}
        <section className="bg-[#0E1511] border border-[#1B2921] rounded-2xl p-4 sm:p-6 space-y-4 shadow-xl">
          
          {/* Section Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h2 className="text-sm sm:text-base font-semibold text-white tracking-tight flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Daftar Artikel ({articles.length})</span>
              </h2>
              <p className="text-xs text-[#7A9184]">
                Akses cepat untuk menambah views secara langsung per artikel.
              </p>
            </div>

            {/* Search Input */}
            <div className="w-full sm:w-64 relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#55695E]" />
              <input
                type="text"
                placeholder="Cari judul / slug artikel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-xl bg-[#070B09] border border-[#18241E] text-xs text-white placeholder:text-[#42554A] focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* ── 1. MOBILE VIEW: SMART ARTICLE CARDS (< 640px) ── */}
          <div className="space-y-2.5 sm:hidden">
            {filteredArticles.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#55695E] bg-[#070B09] rounded-xl border border-[#18241E] italic">
                Tidak ada artikel yang sesuai dengan pencarian.
              </div>
            ) : (
              filteredArticles.map((art) => (
                <div
                  key={art.id}
                  className="p-3.5 rounded-xl bg-[#070B09] border border-[#18241E] space-y-2.5 transition-colors"
                >
                  {/* Title & Slug */}
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-semibold text-white leading-snug line-clamp-2">
                        {art.title}
                      </h3>
                      {art.isPublished ? (
                        <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-500/20">
                          Publik
                        </span>
                      ) : (
                        <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-800 text-zinc-400">
                          Draft
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-[#55695E] font-mono">
                      <span>{art.category || 'Refleksi'}</span>
                      <span>•</span>
                      <span className="truncate">{art.slug}</span>
                    </div>
                  </div>

                  {/* Metrics & Quick Actions Bar */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#14201A]">
                    <div className="flex items-center gap-1.5 font-mono">
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-sm font-bold text-emerald-400 tabular-nums">
                        {art.views.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] text-[#55695E]">views</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleBoost(art.slug, 10)}
                        className="btn-interactive h-8 px-2.5 rounded-lg bg-[#0E1511] hover:bg-emerald-950 border border-[#23352B] hover:border-emerald-500/40 text-[11px] font-mono font-semibold text-emerald-300 transition-all cursor-pointer active:scale-95"
                        title="Tambah 10 views"
                      >
                        +10
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBoost(art.slug, 50)}
                        className="btn-interactive h-8 px-2.5 rounded-lg bg-[#0E1511] hover:bg-emerald-950 border border-[#23352B] hover:border-emerald-500/40 text-[11px] font-mono font-semibold text-emerald-300 transition-all cursor-pointer active:scale-95"
                        title="Tambah 50 views"
                      >
                        +50
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBoost(art.slug, 100)}
                        className="btn-interactive h-8 px-2.5 rounded-lg bg-[#0E1511] hover:bg-emerald-950 border border-[#23352B] hover:border-emerald-500/40 text-[11px] font-mono font-semibold text-emerald-300 transition-all cursor-pointer active:scale-95"
                        title="Tambah 100 views"
                      >
                        +100
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ── 2. DESKTOP VIEW: HIGH-DENSITY TELEMETRY TABLE (>= 640px) ── */}
          <div className="hidden sm:block overflow-x-auto rounded-xl border border-[#18241E]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#070B09] text-[#7A9184] border-b border-[#18241E] uppercase tracking-wider text-[10px] font-mono">
                <tr>
                  <th className="py-3 px-4">Judul Artikel</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Views Saat Ini</th>
                  <th className="py-3 px-4 text-center">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#14201A] font-sans">
                {filteredArticles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-[#55695E] italic">
                      Tidak ada artikel yang cocok dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredArticles.map((art) => (
                    <tr key={art.id} className="hover:bg-[#121B16] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-white max-w-sm lg:max-w-md line-clamp-1">
                          {art.title}
                        </div>
                        <span className="text-[10px] text-[#55695E] font-mono">{art.slug}</span>
                      </td>
                      <td className="py-3 px-4 text-[#7A9184] whitespace-nowrap">
                        {art.category || 'Refleksi Diri'}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {art.isPublished ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-500/25">
                            <Check className="w-2.5 h-2.5" /> Publik
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-800 text-zinc-400">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 tabular-nums">
                          <Eye className="w-3 h-3 text-[#55695E]" />
                          {art.views.toLocaleString('id-ID')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleBoost(art.slug, 10)}
                            className="btn-interactive px-2 py-1 rounded-md bg-[#070B09] hover:bg-emerald-950 border border-[#1B2921] hover:border-emerald-500/40 text-[11px] font-mono text-emerald-300 transition-all cursor-pointer active:scale-95"
                            title="Tambah 10 views"
                          >
                            +10
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBoost(art.slug, 50)}
                            className="btn-interactive px-2 py-1 rounded-md bg-[#070B09] hover:bg-emerald-950 border border-[#1B2921] hover:border-emerald-500/40 text-[11px] font-mono text-emerald-300 transition-all cursor-pointer active:scale-95"
                            title="Tambah 50 views"
                          >
                            +50
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBoost(art.slug, 100)}
                            className="btn-interactive px-2 py-1 rounded-md bg-[#070B09] hover:bg-emerald-950 border border-[#1B2921] hover:border-emerald-500/40 text-[11px] font-mono text-emerald-300 transition-all cursor-pointer active:scale-95"
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
