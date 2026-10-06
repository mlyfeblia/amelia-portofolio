'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, KeyRound, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  remainingSeconds: number;
  login: (pin: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  sessionNotice: string | null;
  clearSessionNotice: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const DEFAULT_SESSION_SECONDS = 30 * 60; // 30 minutes

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(DEFAULT_SESSION_SECONDS);
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function verify() {
      try {
        const res = await fetch('/api/admin/verify');
        const data = await res.json();
        if (!active) return;
        if (data.authenticated) {
          setIsAuthenticated(true);
          if (typeof data.remainingSeconds === 'number' && data.remainingSeconds > 0) {
            setRemainingSeconds(data.remainingSeconds);
          } else {
            setRemainingSeconds(DEFAULT_SESSION_SECONDS);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        if (active) setIsAuthenticated(false);
      } finally {
        if (active) setChecking(false);
      }
    }

    verify();
    return () => {
      active = false;
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    setRemainingSeconds(0);
    setPin('');
    setShowPin(false);
  }, []);

  // 30-minute countdown ticker when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          logout();
          setSessionNotice(
            'Sesi login telah berakhir setelah 30 menit demi keamanan. Draf tulisanmu tetap tersimpan aman di browser.'
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, logout]);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/refresh', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setRemainingSeconds(data.remainingSeconds || DEFAULT_SESSION_SECONDS);
        return true;
      }
    } catch {
      // network/fetch error
    }
    return false;
  }, []);

  const login = async (inputPin: string): Promise<boolean> => {
    setSubmitting(true);
    setPinError(false);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: inputPin.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setPinError(false);
        setRemainingSeconds(DEFAULT_SESSION_SECONDS);
        setSessionNotice(null);
        return true;
      }
    } catch {
      // network/fetch error
    } finally {
      setSubmitting(false);
    }
    setPinError(true);
    return false;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;
    await login(pin);
  };

  const clearSessionNotice = () => setSessionNotice(null);

  if (checking) {
    return (
      <div className="min-h-screen bg-[var(--color-paper)] flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" variant="accent" label="Memuat portal pengelola..." />
        <div className="text-xs text-[var(--color-ink-muted)]">
          Memuat portal admin...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--color-paper)] flex items-center justify-center p-5">
        <div className="w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl p-7 sm:p-9 shadow-sm text-center space-y-6 animate-fade-in-up">
          
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] mx-auto flex items-center justify-center border border-[var(--color-accent-border)]">
            <KeyRound className="w-6 h-6" />
          </div>

          <div className="space-y-1.5">
            <h1
              className="text-2xl font-medium text-[var(--color-ink)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Portal Konselor Amelia
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
              Masukkan PIN pengelola untuk mengelola janji temu konseling, ruang curhat, dan artikel refleksi.
            </p>
          </div>

          {sessionNotice && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-left flex items-start gap-2.5 text-xs text-amber-900 animate-fade-in-up">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-950 mb-0.5">Sesi Berakhir (30 Menit)</p>
                <p className="text-amber-800 leading-relaxed">{sessionNotice}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
            <div>
              <label htmlFor="admin-pin" className="block text-xs font-semibold text-[var(--color-ink)] mb-1.5">
                PIN Akses Pengelola
              </label>
              
              <div className={`relative flex items-center ${pinError ? 'animate-shake' : ''}`}>
                <input
                  id="admin-pin"
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoComplete="current-password"
                  value={pin}
                  onChange={(e) => {
                    const onlyNums = e.target.value.replace(/[^0-9]/g, '');
                    setPin(onlyNums);
                    if (pinError) setPinError(false);
                  }}
                  placeholder="••••••"
                  className={`w-full pl-4 pr-11 py-2.5 rounded-xl bg-[var(--color-paper)] border text-center font-mono tracking-widest text-base font-semibold text-[var(--color-ink)] focus:outline-none focus:ring-2 transition-all ${
                    pinError
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                      : 'border-[var(--color-paper-border)] focus:border-[var(--color-accent)] focus:ring-[var(--color-accent-soft)]'
                  }`}
                  autoFocus
                />

                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-2.5 p-1.5 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-surface)] transition-all cursor-pointer"
                  aria-label={showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
                  tabIndex={-1}
                >
                  <div className="relative w-4 h-4">
                    <Eye
                      className={`w-4 h-4 absolute inset-0 transition-all duration-200 transform ${
                        showPin ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 -rotate-45'
                      }`}
                    />
                    <EyeOff
                      className={`w-4 h-4 absolute inset-0 transition-all duration-200 transform ${
                        showPin ? 'opacity-0 scale-75 rotate-45' : 'opacity-100 scale-100 rotate-0'
                      }`}
                    />
                  </div>
                </button>
              </div>

              {pinError && (
                <p className="text-xs text-[var(--color-error)] mt-1.5 text-center font-medium animate-fade-in-up">
                  PIN yang dimasukkan belum tepat.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary btn-interactive w-full py-2.5 text-sm justify-center cursor-pointer shadow-xs disabled:opacity-60 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Spinner size="sm" variant="white" label="Memverifikasi PIN..." />
                  <span>Memverifikasi PIN...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Masuk Dashboard Konselor</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-[var(--color-paper-border)]">
            <Link
              href="/"
              className="text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-accent)] inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali ke Halaman Web Utama
            </Link>
          </div>

        </div>
      </div>
    );
  }

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated,
        remainingSeconds,
        login,
        logout,
        refreshSession,
        sessionNotice,
        clearSessionNotice,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
