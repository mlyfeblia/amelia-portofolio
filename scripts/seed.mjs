import fs from 'fs';
import path from 'path';
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const sql = postgres(databaseUrl, { ssl: { rejectUnauthorized: false } });

const INDO_MONTHS = {
  januari: '01',
  februari: '02',
  maret: '03',
  april: '04',
  mei: '05',
  juni: '06',
  juli: '07',
  agustus: '08',
  september: '09',
  oktober: '10',
  november: '11',
  desember: '12',
};

function toIsoTimestamp(dateStr) {
  if (!dateStr) return new Date().toISOString();
  const trimmed = String(dateStr).trim();
  const parts = trimmed.split(/\s+/);
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = INDO_MONTHS[parts[1].toLowerCase()];
    const year = parts[2];
    if (month && year) {
      const hourUtc = (day === '29' && month === '09' && year === '2026') ? '10:30:00' : '02:30:00';
      const parsed = new Date(`${year}-${month}-${day}T${hourUtc}.000Z`);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
    }
  }

  const direct = new Date(trimmed);
  return isNaN(direct.getTime()) ? new Date().toISOString() : direct.toISOString();
}

function normalizeMode(mode) {
  if (mode === 'online_meet' || mode === 'online_chat' || mode === 'tatap_muka_cirebon') {
    return mode;
  }
  if (!mode) return 'online_meet';
  const m = String(mode).toLowerCase();
  if (m.includes('chat') || m.includes('whatsapp')) return 'online_chat';
  if (m.includes('tatap') || m.includes('offline') || m.includes('cirebon')) return 'tatap_muka_cirebon';
  return 'online_meet';
}

function normalizeStatus(status) {
  if (status === 'menunggu' || status === 'terkonfirmasi' || status === 'selesai' || status === 'dibatalkan') {
    return status;
  }
  return 'menunggu';
}

async function seed() {
  try {
    const dbJsonPath = path.join(process.cwd(), 'data', 'db.json');
    if (!fs.existsSync(dbJsonPath)) {
      console.log('No data/db.json found.');
      return;
    }

    const data = JSON.parse(fs.readFileSync(dbJsonPath, 'utf8'));

    // 1. Articles
    if (data.articles && data.articles.length > 0) {
      console.log(`Seeding ${data.articles.length} articles...`);
      for (const art of data.articles) {
        const publishedAt = toIsoTimestamp(art.publishedAt);
        await sql`
          INSERT INTO articles (id, slug, title, excerpt, content, category, read_time, published_at, tags, is_published, show_on_landing_page, views, cover_image)
          VALUES (
            ${art.id},
            ${art.slug},
            ${art.title},
            ${art.excerpt},
            ${art.content},
            ${art.category},
            ${art.readTime},
            ${publishedAt},
            ${JSON.stringify(art.tags || [])}::jsonb,
            ${art.isPublished !== undefined ? Boolean(art.isPublished) : true},
            ${art.showOnLandingPage !== undefined ? Boolean(art.showOnLandingPage) : false},
            ${art.views ?? 0},
            ${art.coverImage || null}
          )
          ON CONFLICT (id) DO UPDATE SET
            slug = EXCLUDED.slug,
            title = EXCLUDED.title,
            excerpt = EXCLUDED.excerpt,
            content = EXCLUDED.content,
            category = EXCLUDED.category,
            read_time = EXCLUDED.read_time,
            published_at = EXCLUDED.published_at,
            tags = EXCLUDED.tags,
            is_published = EXCLUDED.is_published,
            show_on_landing_page = EXCLUDED.show_on_landing_page,
            views = EXCLUDED.views,
            cover_image = EXCLUDED.cover_image;
        `;
      }
    }

    // 2. Bookings
    if (data.bookings && data.bookings.length > 0) {
      console.log(`Seeding ${data.bookings.length} bookings...`);
      for (const bk of data.bookings) {
        const mode = normalizeMode(bk.mode);
        const status = normalizeStatus(bk.status);
        const createdAt = toIsoTimestamp(bk.createdAt);
        await sql`
          INSERT INTO bookings (id, code, name, alias, phone, email, category, mode, date, time_slot, notes, status, created_at)
          VALUES (
            ${bk.id},
            ${bk.code},
            ${bk.name},
            ${bk.alias || null},
            ${bk.phone},
            ${bk.email},
            ${bk.category},
            ${mode},
            ${bk.date},
            ${bk.timeSlot},
            ${bk.notes || null},
            ${status},
            ${createdAt}
          )
          ON CONFLICT (id) DO NOTHING;
        `;
      }
    }

    // 3. Curhat
    if (data.curhatList && data.curhatList.length > 0) {
      console.log(`Seeding ${data.curhatList.length} curhat messages...`);
      for (const cur of data.curhatList) {
        const createdAt = toIsoTimestamp(cur.createdAt);
        const answeredAt = cur.answeredAt ? toIsoTimestamp(cur.answeredAt) : null;
        await sql`
          INSERT INTO curhat (id, alias, category, message, answer, is_answered, is_public, show_on_landing_page, created_at, answered_at)
          VALUES (
            ${cur.id},
            ${cur.alias},
            ${cur.category},
            ${cur.message},
            ${cur.answer || null},
            ${Boolean(cur.isAnswered)},
            ${Boolean(cur.isPublic)},
            ${cur.showOnLandingPage !== undefined ? Boolean(cur.showOnLandingPage) : false},
            ${createdAt},
            ${answeredAt}
          )
          ON CONFLICT (id) DO UPDATE SET
            alias = EXCLUDED.alias,
            category = EXCLUDED.category,
            message = EXCLUDED.message,
            answer = EXCLUDED.answer,
            is_answered = EXCLUDED.is_answered,
            is_public = EXCLUDED.is_public,
            show_on_landing_page = EXCLUDED.show_on_landing_page,
            created_at = EXCLUDED.created_at,
            answered_at = EXCLUDED.answered_at;
        `;
      }
    }

    console.log('Database seeding successfully completed!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await sql.end();
  }
}

seed();
