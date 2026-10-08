import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('FAIL: DATABASE_URL is not set.');
  process.exit(1);
}

const sql = postgres(databaseUrl, { ssl: { rejectUnauthorized: false } });

async function runAudit() {
  console.log('--- 1. AUDITING DATABASE COLUMNS ---');
  const tables = ['articles', 'bookings', 'curhat', 'push_subscriptions'];
  for (const table of tables) {
    const cols = await sql`
      SELECT column_name, data_type, is_nullable, column_default, udt_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ${table}
      ORDER BY ordinal_position;
    `;
    console.log(`Table '${table}' has ${cols.length} columns:`);
    console.log(cols.map((c) => `  - ${c.column_name} (${c.data_type === 'USER-DEFINED' ? c.udt_name : c.data_type})`).join('\n'));
  }

  console.log('\n--- 2. VERIFYING CRUD: BOOKINGS ---');
  const testBookingId = `test-bk-${Date.now()}`;
  const testBookingCode = `BKI-TEST-${Date.now().toString().slice(-4)}`;

  // Insert (testing enum booking_status and counseling_mode with timestamptz created_at)
  await sql`
    INSERT INTO bookings (id, code, name, alias, phone, email, category, mode, date, time_slot, notes, status, created_at)
    VALUES (
      ${testBookingId},
      ${testBookingCode},
      'Test Konseli',
      'Anon',
      '081234567890',
      'test@example.com',
      'Akademik, Skripsi & Perkuliahan',
      'online_meet'::counseling_mode,
      '2026-10-10',
      '10:00 - 11:00 WIB',
      'Catatan test integrasi',
      'menunggu'::booking_status,
      ${new Date().toISOString()}::timestamptz
    )
  `;
  console.log('✓ Insert booking successful with native enums and timestamptz');

  // Select
  const [fetchedBooking] = await sql`SELECT * FROM bookings WHERE id = ${testBookingId}`;
  if (!fetchedBooking || fetchedBooking.code !== testBookingCode) throw new Error('Booking verification failed');
  console.log(`✓ Select booking successful (mode: ${fetchedBooking.mode}, status: ${fetchedBooking.status})`);

  // Update status
  await sql`UPDATE bookings SET status = 'terkonfirmasi'::booking_status WHERE id = ${testBookingId}`;
  const [updatedBooking] = await sql`SELECT status FROM bookings WHERE id = ${testBookingId}`;
  if (updatedBooking.status !== 'terkonfirmasi') throw new Error('Booking update failed');
  console.log('✓ Update booking status successful');

  // Delete
  await sql`DELETE FROM bookings WHERE id = ${testBookingId}`;
  const [deletedBooking] = await sql`SELECT * FROM bookings WHERE id = ${testBookingId}`;
  if (deletedBooking) throw new Error('Booking delete failed');
  console.log('✓ Delete test booking successful');

  console.log('\n--- 3. VERIFYING CRUD: CURHAT ---');
  const testCurhatId = `test-cur-${Date.now()}`;

  // Insert with timestamptz created_at
  await sql`
    INSERT INTO curhat (id, alias, category, message, is_answered, is_public, show_on_landing_page, created_at)
    VALUES (
      ${testCurhatId},
      'Sahabat Test',
      'Emosi & Kecemasan',
      'Ini adalah pesan tes integrasi database.',
      false,
      true,
      true,
      ${new Date().toISOString()}::timestamptz
    )
  `;
  console.log('✓ Insert curhat successful');

  // Select
  const [fetchedCurhat] = await sql`SELECT * FROM curhat WHERE id = ${testCurhatId}`;
  if (!fetchedCurhat || fetchedCurhat.show_on_landing_page !== true) throw new Error('Curhat verification failed');
  console.log('✓ Select curhat successful with show_on_landing_page = true');

  // Update answer with timestamptz answered_at
  await sql`
    UPDATE curhat 
    SET answer = 'Terima kasih sudah bercerita.', is_answered = true, answered_at = ${new Date().toISOString()}::timestamptz
    WHERE id = ${testCurhatId}
  `;
  const [updatedCurhat] = await sql`SELECT answer, is_answered FROM curhat WHERE id = ${testCurhatId}`;
  if (!updatedCurhat.is_answered) throw new Error('Curhat answer update failed');
  console.log('✓ Update curhat answer successful');

  // Delete
  await sql`DELETE FROM curhat WHERE id = ${testCurhatId}`;
  const [deletedCurhat] = await sql`SELECT * FROM curhat WHERE id = ${testCurhatId}`;
  if (deletedCurhat) throw new Error('Curhat delete failed');
  console.log('✓ Delete test curhat successful');

  console.log('\n--- 4. VERIFYING CRUD: ARTICLES ---');
  const testArticleId = `test-art-${Date.now()}`;
  const testSlug = `test-article-slug-${Date.now()}`;

  // Insert with timestamptz published_at
  await sql`
    INSERT INTO articles (id, slug, title, excerpt, content, category, read_time, published_at, tags, is_published, show_on_landing_page)
    VALUES (
      ${testArticleId},
      ${testSlug},
      'Judul Uji Integrasi',
      'Ringkasan tes',
      'Konten artikel tes integrasi.',
      'Cyber Counseling & Edukasi Sebaya',
      '3 menit baca',
      ${new Date().toISOString()}::timestamptz,
      ${JSON.stringify(['Test', 'Integrasi'])}::jsonb,
      true,
      true
    )
  `;
  console.log('✓ Insert article successful with timestamptz published_at');

  // Select
  const [fetchedArticle] = await sql`SELECT * FROM articles WHERE id = ${testArticleId}`;
  if (!fetchedArticle || fetchedArticle.slug !== testSlug || fetchedArticle.show_on_landing_page !== true) {
    throw new Error('Article verification failed');
  }
  console.log('✓ Select article successful with show_on_landing_page = true and tags JSONB parsed');

  // Update
  await sql`UPDATE articles SET title = 'Judul Uji Diperbarui' WHERE id = ${testArticleId}`;
  const [updatedArticle] = await sql`SELECT title FROM articles WHERE id = ${testArticleId}`;
  if (updatedArticle.title !== 'Judul Uji Diperbarui') throw new Error('Article update failed');
  console.log('✓ Update article title successful');

  // Delete
  await sql`DELETE FROM articles WHERE id = ${testArticleId}`;
  const [deletedArticle] = await sql`SELECT * FROM articles WHERE id = ${testArticleId}`;
  if (deletedArticle) throw new Error('Article delete failed');
  console.log('✓ Delete test article successful');

  console.log('\n--- 5. VERIFYING CRUD: PUSH SUBSCRIPTIONS ---');
  const testSubId = `test-sub-${Date.now()}`;
  const testEndpoint = `https://fcm.googleapis.com/fcm/send/test-${Date.now()}`;

  // Insert
  await sql`
    INSERT INTO push_subscriptions (id, endpoint, p256dh, auth, role, booking_code, created_at)
    VALUES (
      ${testSubId},
      ${testEndpoint},
      'test-p256dh-key',
      'test-auth-secret',
      'client',
      ${testBookingCode},
      ${new Date().toISOString()}::timestamptz
    )
  `;
  console.log('✓ Insert push subscription successful');

  // Select
  const [fetchedSub] = await sql`SELECT * FROM push_subscriptions WHERE id = ${testSubId}`;
  if (!fetchedSub || fetchedSub.endpoint !== testEndpoint) throw new Error('Push subscription verification failed');
  console.log(`✓ Select push subscription successful (role: ${fetchedSub.role}, bookingCode: ${fetchedSub.booking_code})`);

  // Delete
  await sql`DELETE FROM push_subscriptions WHERE id = ${testSubId}`;
  const [deletedSub] = await sql`SELECT * FROM push_subscriptions WHERE id = ${testSubId}`;
  if (deletedSub) throw new Error('Push subscription delete failed');
  console.log('✓ Delete test push subscription successful');

  console.log('\n=== ALL DATABASE OPERATIONS PASSED VERIFICATION ===');
}

runAudit()
  .catch((err) => {
    console.error('DATABASE AUDIT ERROR:', err);
    process.exit(1);
  })
  .finally(async () => {
    await sql.end();
  });
