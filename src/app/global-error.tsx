'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Fatal root application error caught by global-error:', error);
  }, [error]);

  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          backgroundColor: '#FBF9F5',
          color: '#1E2B24',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <div
          style={{
            maxWidth: '480px',
            margin: '24px',
            padding: '36px 28px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E8E2D9',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              margin: '0 auto 16px',
              borderRadius: '50%',
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
            }}
          >
            !
          </div>

          <h1
            style={{
              fontSize: '20px',
              fontWeight: 600,
              margin: '0 0 8px',
              color: '#1E2B24',
            }}
          >
            Terjadi Masalah pada Sistem
          </h1>

          <p
            style={{
              fontSize: '14px',
              lineHeight: 1.6,
              color: '#55655E',
              margin: '0 0 24px',
            }}
          >
            Aplikasi mengalami kendala fatal saat memuat antarmuka utama. Silakan coba muat ulang halaman ini.
          </p>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={() => reset()}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#FFFFFF',
                backgroundColor: '#1B4D3E',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              Muat Ulang Aplikasi
            </button>

            <Link
              href="/"
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#1E2B24',
                backgroundColor: '#F5F2EB',
                border: '1px solid #E8E2D9',
                borderRadius: '10px',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Kembali ke Awal
            </Link>
          </div>

          {error.digest && (
            <p
              style={{
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#8A9790',
                marginTop: '24px',
                marginBottom: 0,
              }}
            >
              Ref ID: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
