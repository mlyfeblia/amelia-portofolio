'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, KeyRound, Eye, EyeOff } from 'lucide-react';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  login: (pin: string) => boolean;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// PIN Khusus Pengelola Amelia
const VALID_PINS = ['160523'];

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('amel_admin_auth');
      if (saved === 'true') {
        setIsAuthenticated(true);
      }
    } catch {
      // sessionStorage not available
    } finally {
      setChecking(false);
    }
  }, []);

  const login = (inputPin: string) => {
    if (VALID_PINS.includes(inputPin.trim())) {
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem('amel_admin_auth', 'true');
      } catch {
        // ignore
      }
      setPinError(false);
      return true;
    }
    setPinError(true);
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem('amel_admin_auth');
    } catch {
      // ignore
    }
    setPin('');
    setShowPin(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(pin);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[var(--color-paper)] flex items-center justify-center">
        <div className="text-sm text-[var(--color-ink-muted)] animate-pulse">
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
              Masukkan PIN pengelola untuk mengelola janji temu konseling, ruang curhat, dan data website.
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
            <div>
              <label htmlFor="admin-pin" className="block text-xs font-semibold text-[var(--color-ink)] mb-1.5">
                PIN Akses Pengelola
              </label>
              
              <div className="relative flex items-center">
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
                  className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-center font-mono tracking-widest text-base font-semibold text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)] transition-all"
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
                <p className="text-xs text-red-600 mt-1.5 text-center font-medium animate-fade-in-up">
                  PIN yang Anda masukkan tidak valid.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-2.5 text-sm justify-center cursor-pointer shadow-xs"
            >
              Masuk Dashboard Konselor
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
    <AdminAuthContext.Provider value={{ isAuthenticated, login, logout }}>
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
