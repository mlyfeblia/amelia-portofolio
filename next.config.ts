import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  reactStrictMode: true,
  serverExternalPackages: ['postgres'],
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    contentDispositionType: 'inline',
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
      {
        source: '/(amelia.webp|icon.png|apple-icon.png|favicon.ico)',
        headers: [
          { key: 'Content-Disposition', value: 'inline' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/_next/image',
        headers: [
          { key: 'Content-Disposition', value: 'inline' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: '/tentang', destination: '/about', permanent: true },
      { source: '/layanan', destination: '/services', permanent: true },
      { source: '/asesmen', destination: '/assessment', permanent: true },
      { source: '/curhat', destination: '/counseling', permanent: true },
      { source: '/jadwal', destination: '/schedule', permanent: true },
      { source: '/artikel', destination: '/articles', permanent: true },
      { source: '/artikel/:slug', destination: '/articles/:slug', permanent: true },
    ];
  },
};

export default nextConfig;
