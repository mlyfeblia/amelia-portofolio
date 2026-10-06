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
        await sql`
          INSERT INTO articles (id, slug, title, excerpt, content, category, read_time, published_at, tags, is_published, show_on_landing_page)
          VALUES (
            ${art.id},
            ${art.slug},
            ${art.title},
            ${art.excerpt},
            ${art.content},
            ${art.category},
            ${art.readTime},
            ${art.publishedAt},
            ${JSON.stringify(art.tags || [])}::jsonb,
            ${art.isPublished !== undefined ? Boolean(art.isPublished) : true},
            ${art.showOnLandingPage !== undefined ? Boolean(art.showOnLandingPage) : false}
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
            show_on_landing_page = EXCLUDED.show_on_landing_page;
        `;
      }
    }

    // 2. Bookings
    if (data.bookings && data.bookings.length > 0) {
      console.log(`Seeding ${data.bookings.length} bookings...`);
      for (const bk of data.bookings) {
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
            ${bk.mode},
            ${bk.date},
            ${bk.timeSlot},
            ${bk.notes || null},
            ${bk.status || 'menunggu'},
            ${bk.createdAt}
          )
          ON CONFLICT (id) DO NOTHING;
        `;
      }
    }

    // 3. Curhat
    if (data.curhatList && data.curhatList.length > 0) {
      console.log(`Seeding ${data.curhatList.length} curhat messages...`);
      for (const cur of data.curhatList) {
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
            ${cur.createdAt},
            ${cur.answeredAt || null}
          )
          ON CONFLICT (id) DO UPDATE SET
            answer = EXCLUDED.answer,
            is_answered = EXCLUDED.is_answered,
            is_public = EXCLUDED.is_public,
            show_on_landing_page = EXCLUDED.show_on_landing_page,
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
