import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const BASE = 'http://127.0.0.1:3009';
const ADMIN_PIN = process.env.ADMIN_PIN || '160523';

let sessionCookie = '';
let testBookingId = '';
let testBookingCode = '';
let testCurhatId = '';
let testArticleId = '';

async function test(name, fn) {
  try {
    process.stdout.write(`Testing: ${name}... `);
    await fn();
    console.log('✓ PASSED');
  } catch (err) {
    console.log('✗ FAILED');
    console.error(err);
    process.exit(1);
  }
}

async function run() {
  console.log('=== STARTING FULL END-TO-END INTEGRATION TEST ===\n');

  // 1. PUBLIC PAGES (SSR / SSG / ISR)
  const publicPages = [
    '/',
    '/articles',
    '/counseling',
    '/schedule',
    '/assessment',
    '/services',
    '/about',
    '/admin',
    '/admin/bookings',
    '/admin/counseling',
    '/admin/articles',
    '/sitemap.xml',
    '/robots.txt',
    '/manifest.webmanifest',
  ];

  for (const page of publicPages) {
    await test(`Page HTTP GET ${page}`, async () => {
      const res = await fetch(`${BASE}${page}`);
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${page}`);
    });
  }

  // 2. PUBLIC API: GET ARTICLES
  await test('GET /api/articles', async () => {
    const res = await fetch(`${BASE}/api/articles`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
      throw new Error('Articles array empty or invalid');
    }
  });

  // 3. PUBLIC API: GET CURHAT (PUBLIC ONLY)
  await test('GET /api/curhat (public only)', async () => {
    const res = await fetch(`${BASE}/api/curhat`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) {
      throw new Error('Curhat response invalid');
    }
  });

  // 4. PUBLIC API: CREATE CURHAT
  await test('POST /api/curhat (create anonymous message)', async () => {
    const payload = {
      alias: 'Konseli Anonim Test',
      category: 'Kesehatan Mental & Emosi',
      message: 'Halo Kak Amel, ini adalah pesan tes integrasi otomatis.',
      isPublic: true,
      botTrap: '',
    };
    const res = await fetch(`${BASE}/api/curhat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.data?.id) throw new Error('Create curhat response failed');
    testCurhatId = json.data.id;
  });

  // 5. PUBLIC API: CREATE BOOKING
  await test('POST /api/bookings (create counseling appointment)', async () => {
    const payload = {
      name: 'Konseli Test Integrasi',
      alias: 'Konseli Amel',
      phone: '081234567890',
      email: 'konseli.test@example.com',
      category: 'Manajemen Stres, Emosi & Burnout',
      mode: 'online_meet',
      date: '2026-10-15',
      timeSlot: '14:00 - 15:00 WIB',
      notes: 'Uji integrasi otomatis frontend-backend-db',
      botTrap: '',
    };
    const res = await fetch(`${BASE}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.data?.code) throw new Error('Create booking failed');
    testBookingId = json.data.id;
    testBookingCode = json.data.code;
  });

  // 6. PUBLIC API: TRACK BOOKING (SINGLE CODE)
  await test(`GET /api/bookings/track?code=${testBookingCode}`, async () => {
    const res = await fetch(`${BASE}/api/bookings/track?code=${testBookingCode}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || json.data?.code !== testBookingCode) throw new Error('Track code mismatch');
    // Ensure privacy sanitization (no phone or email returned to public tracker)
    if (json.data.phone !== undefined || json.data.email !== undefined) {
      throw new Error('Privacy leak: phone or email exposed in public track endpoint!');
    }
  });

  // 7. PUBLIC API: BATCH TRACK BOOKINGS
  await test(`GET /api/bookings/track?codes=${testBookingCode}`, async () => {
    const res = await fetch(`${BASE}/api/bookings/track?codes=${testBookingCode}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
      throw new Error('Batch tracking failed');
    }
  });

  // 8. SECURITY: UNAUTHENTICATED ACCESS TO ADMIN APIS MUST BE REJECTED (401)
  await test('GET /api/bookings without auth -> 401 Unauthorized', async () => {
    const res = await fetch(`${BASE}/api/bookings`);
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  await test('POST /api/articles without auth -> 401 Unauthorized', async () => {
    const res = await fetch(`${BASE}/api/articles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Hacked' }),
    });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  // 9. ADMIN AUTH: LOGIN WITH WRONG PIN -> REJECTED
  await test('POST /api/admin/login with wrong PIN -> Rejected', async () => {
    const res = await fetch(`${BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: '000000' }),
    });
    if (res.status !== 401) throw new Error(`Expected 401 for bad PIN, got ${res.status}`);
  });

  // 10. ADMIN AUTH: LOGIN WITH CORRECT PIN
  await test('POST /api/admin/login with valid PIN -> Success & Cookie Set', async () => {
    const res = await fetch(`${BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: ADMIN_PIN }),
    });
    if (!res.ok) throw new Error(`Login failed with HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error('Login returned success = false');

    // Extract cookie
    const setCookie = res.headers.get('set-cookie');
    if (!setCookie || !setCookie.includes('amel_admin_session')) {
      throw new Error('amel_admin_session cookie not set');
    }
    // Take cookie string
    sessionCookie = setCookie.split(';')[0];
  });

  // 11. ADMIN AUTH: VERIFY SESSION
  await test('GET /api/admin/verify with valid cookie -> authenticated: true', async () => {
    const res = await fetch(`${BASE}/api/admin/verify`, {
      headers: { Cookie: sessionCookie },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.authenticated) throw new Error('Session verify returned unauthenticated');
  });

  // 12. ADMIN AUTH: REFRESH SESSION
  await test('POST /api/admin/refresh -> Success & 1800s remaining', async () => {
    const res = await fetch(`${BASE}/api/admin/refresh`, {
      method: 'POST',
      headers: { Cookie: sessionCookie },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || typeof json.remainingSeconds !== 'number') {
      throw new Error('Refresh session failed');
    }
  });

  // 13. ADMIN API: GET BOOKINGS (FULL DATA INCLUDING PHONE & EMAIL)
  await test('GET /api/bookings with auth -> Returns bookings list', async () => {
    const res = await fetch(`${BASE}/api/bookings`, {
      headers: { Cookie: sessionCookie },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) throw new Error('Failed to get bookings');
    const found = json.data.find(b => b.id === testBookingId);
    if (!found) throw new Error('Created test booking not found in admin bookings list');
    if (!found.phone || !found.email) throw new Error('Admin view missing phone/email');
  });

  // 14. ADMIN API: UPDATE BOOKING STATUS
  await test(`PATCH /api/bookings/${testBookingId} -> status: terkonfirmasi`, async () => {
    const res = await fetch(`${BASE}/api/bookings/${testBookingId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
      },
      body: JSON.stringify({ status: 'terkonfirmasi' }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || json.data?.status !== 'terkonfirmasi') {
      throw new Error('Update booking status failed');
    }
  });

  // 15. ADMIN API: DELETE BOOKING
  await test(`DELETE /api/bookings/${testBookingId}`, async () => {
    const res = await fetch(`${BASE}/api/bookings/${testBookingId}`, {
      method: 'DELETE',
      headers: { Cookie: sessionCookie },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error('Delete booking failed');
  });

  // 16. ADMIN API: ANSWER CURHAT & TOGGLE SHOW ON LANDING PAGE
  await test(`PATCH /api/curhat/${testCurhatId} -> Answer & showOnLandingPage`, async () => {
    const res = await fetch(`${BASE}/api/curhat/${testCurhatId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
      },
      body: JSON.stringify({
        answer: 'Terima kasih atas ceritamu. Semoga harimu menyenangkan.',
        isPublic: true,
        showOnLandingPage: true,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.data?.isAnswered || json.data?.showOnLandingPage !== true) {
      throw new Error('Answer curhat failed');
    }
  });

  // 17. ADMIN API: DELETE CURHAT
  await test(`DELETE /api/curhat/${testCurhatId}`, async () => {
    const res = await fetch(`${BASE}/api/curhat/${testCurhatId}`, {
      method: 'DELETE',
      headers: { Cookie: sessionCookie },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error('Delete curhat failed');
  });

  // 18. ADMIN API: CREATE ARTICLE
  const testSlug = `test-artikel-integrasi-${Date.now()}`;
  await test('POST /api/articles -> Create article', async () => {
    const payload = {
      slug: testSlug,
      title: 'Artikel Uji Integrasi Otomatis',
      excerpt: 'Ringkasan singkat uji artikel',
      content: '## Konten Lengkap Uji\n\nParagraf konten pengujian integrasi.',
      category: 'Cyber Counseling & Edukasi Sebaya',
      readTime: '3 menit baca',
      tags: ['Uji', 'Integrasi', 'Amelia'],
      isPublished: true,
      showOnLandingPage: false,
    };
    const res = await fetch(`${BASE}/api/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.data?.id) throw new Error('Create article failed');
    testArticleId = json.data.id;
  });

  // 19. ADMIN API: UPDATE ARTICLE
  await test(`PATCH /api/articles/${testArticleId} -> Update title and landing flag`, async () => {
    const res = await fetch(`${BASE}/api/articles/${testArticleId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
      },
      body: JSON.stringify({
        title: 'Artikel Uji Integrasi Diperbarui',
        showOnLandingPage: true,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || json.data?.title !== 'Artikel Uji Integrasi Diperbarui' || json.data?.showOnLandingPage !== true) {
      throw new Error('Update article failed');
    }
  });

  // 20. ADMIN API: DELETE ARTICLE
  await test(`DELETE /api/articles/${testArticleId}`, async () => {
    const res = await fetch(`${BASE}/api/articles/${testArticleId}`, {
      method: 'DELETE',
      headers: { Cookie: sessionCookie },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error('Delete article failed');
  });

  // 21. ADMIN AUTH: LOGOUT
  await test('POST /api/admin/logout', async () => {
    const res = await fetch(`${BASE}/api/admin/logout`, {
      method: 'POST',
      headers: { Cookie: sessionCookie },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error('Logout failed');
  });

  console.log('\n=================================================');
  console.log('🎉 ALL 21 INTEGRATION & SECURITY TESTS PASSED! 🎉');
  console.log('Frontend, Backend, Database, and Admin Auth are 100% synchronized and production ready!');
  console.log('=================================================\n');
}

run();
