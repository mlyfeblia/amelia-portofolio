'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, KeyRound, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

import { adminCache } from '@/lib/admin-cache';

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

  const submittingRef = useRef(false);
  const pinInputRef = useRef<HTMLInputElement>(null);

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

  const broadcastAuthSync = useCallback((action: 'login' | 'logout' | 'refresh', remaining?: number) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        'amelia_admin_auth_sync',
        JSON.stringify({ action, remaining, timestamp: Date.now() })
      );
    } catch {}
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    adminCache.clearAll();
    setIsAuthenticated(false);
    setRemainingSeconds(0);
    setPin('');
    if (pinInputRef.current) {
      pinInputRef.current.value = '';
    }
    setShowPin(false);
    broadcastAuthSync('logout', 0);
  }, [broadcastAuthSync]);

  // 30-minute countdown ticker when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setPin('');
          if (pinInputRef.current) {
            pinInputRef.current.value = '';
          }
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

  // Resync session remainingSeconds when returning to tab (handles mobile background tab throttling)
  // and synchronize login/logout/refresh across multiple open admin tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleSessionExpired = () => {
      logout();
      setSessionNotice(
        'Sesi login telah berakhir demi keamanan. Draf tulisanmu tetap tersimpan aman di browser.'
      );
    };

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        try {
          const res = await fetch('/api/admin/verify');
          const data = await res.json();
          if (data.authenticated) {
            if (typeof data.remainingSeconds === 'number' && data.remainingSeconds > 0) {
              setRemainingSeconds(data.remainingSeconds);
            }
          } else {
            handleSessionExpired();
          }
        } catch {}
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'amelia_admin_auth_sync' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.action === 'logout') {
            adminCache.clearAll();
            setIsAuthenticated(false);
            setRemainingSeconds(0);
            setPin('');
            setShowPin(false);
          } else if (parsed.action === 'login') {
            setIsAuthenticated(true);
            setRemainingSeconds(parsed.remaining || DEFAULT_SESSION_SECONDS);
            setSessionNotice(null);
          } else if (parsed.action === 'refresh' && typeof parsed.remaining === 'number') {
            setRemainingSeconds(parsed.remaining);
          }
        } catch {}
      }
    };

    window.addEventListener('amelia:admin-session-expired', handleSessionExpired);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('amelia:admin-session-expired', handleSessionExpired);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, [isAuthenticated, logout]);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/refresh', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        const nextRemaining = data.remainingSeconds || DEFAULT_SESSION_SECONDS;
        setRemainingSeconds(nextRemaining);
        broadcastAuthSync('refresh', nextRemaining);
        return true;
      }
    } catch {
      // network/fetch error
    }
    return false;
  }, [broadcastAuthSync]);

  const login = async (inputPin: string): Promise<boolean> => {
    if (submittingRef.current) return false;
    submittingRef.current = true;
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
        setPin('');
        if (pinInputRef.current) {
          pinInputRef.current.value = '';
        }
        setPinError(false);
        setRemainingSeconds(DEFAULT_SESSION_SECONDS);
        setSessionNotice(null);
        broadcastAuthSync('login', DEFAULT_SESSION_SECONDS);
        return true;
      }
    } catch {
      // network/fetch error
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
    setPinError(true);
    setPin('');
    if (pinInputRef.current) {
      pinInputRef.current.value = '';
    }
    setTimeout(() => {
      pinInputRef.current?.focus();
    }, 50);
    return false;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !pin.trim()) return;
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
      <div className="min-h-screen bg-[var(--color-paper)] flex items-center justify-center p-2.5 min-[340px]:p-5">
        <div className="w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl p-4 min-[340px]:p-6 sm:p-9 shadow-sm text-center space-y-4 min-[340px]:space-y-6 animate-fade-in-up">
          
          <div className="w-12 h-12 min-[340px]:w-14 min-[340px]:h-14 rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] mx-auto flex items-center justify-center border border-[var(--color-accent-border)] shadow-2xs">
            <KeyRound className="w-5 h-5 min-[340px]:w-6 min-[340px]:h-6" />
          </div>

          <div className="space-y-1.5 min-w-0">
            <h1
              className="text-xl sm:text-2xl font-medium text-[var(--color-ink)] leading-snug break-words"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Portal Konselor Amelia
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed break-words">
              Masukkan PIN pengelola untuk mengelola janji temu konseling, ruang curhat, dan artikel refleksi.
            </p>
          </div>

          {sessionNotice && (
            <div className="p-3 min-[340px]:p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-left flex items-start gap-2.5 text-xs text-amber-900 animate-fade-in-up">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-950 mb-0.5">Sesi Berakhir (30 Menit)</p>
                <p className="text-amber-800 leading-relaxed">{sessionNotice}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleFormSubmit} autoComplete="off" className="space-y-3.5 min-[340px]:space-y-4 text-left">
            <div>
              <label htmlFor="admin-pin" className="block text-xs font-semibold text-[var(--color-ink)] mb-1.5">
                PIN Akses Pengelola
              </label>
              
              <div className={`relative flex items-center ${pinError ? 'animate-shake' : ''}`}>
                <input
                  ref={pinInputRef}
                  id="admin-pin"
                  name="counselor_auth_pin"
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoComplete="off"
                  data-lpignore="true"
                  data-form-type="other"
                  disabled={submitting}
                  readOnly={submitting}
                  value={pin}
                  onChange={(e) => {
                    const onlyNums = e.target.value.replace(/[^0-9]/g, '');
                    setPin(onlyNums);
                    if (pinError) setPinError(false);
                    if (onlyNums.length === 6 && !submitting && !submittingRef.current) {
                      login(onlyNums);
                    }
                  }}
                  placeholder="••••••"
                  className={`w-full pl-3 min-[340px]:pl-4 pr-10 min-[340px]:pr-11 py-2 min-[340px]:py-2.5 rounded-xl bg-[var(--color-paper)] border text-center font-mono tracking-widest text-base font-semibold text-[var(--color-ink)] focus:outline-none focus:ring-2 transition-all ${
                    submitting ? 'opacity-60 cursor-not-allowed' : ''
                  } ${
                    pinError
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                      : 'border-[var(--color-paper-border)] focus:border-[var(--color-accent)] focus:ring-[var(--color-accent-soft)]'
                  }`}
                  autoFocus
                />

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-2.5 p-1.5 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-surface)] transition-all cursor-pointer disabled:opacity-50"
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
              className="btn-primary btn-interactive w-full py-2.5 text-xs min-[340px]:text-sm justify-center cursor-pointer shadow-xs disabled:opacity-60 flex items-center gap-1.5 min-[340px]:gap-2 whitespace-nowrap"
            >
              {submitting ? (
                <>
                  <Spinner size="sm" variant="white" label="Memverifikasi PIN..." />
                  <span>Memverifikasi PIN...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 shrink-0" />
                  <span>Masuk Dashboard<span className="hidden min-[340px]:inline"> Konselor</span></span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-[var(--color-paper-border)]">
            <Link
              href="/"
              className="text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-accent)] inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
              <span>Kembali ke Halaman Web<span className="hidden min-[340px]:inline"> Utama</span></span>
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
