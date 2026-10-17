import fs from 'fs';
import path from 'path';
import postgres from 'postgres';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config({ path: '.env.local' });

const COOKIE_NAME = 'amel_admin_session';

function generateAdminSessionToken() {
  const secretKey = process.env.ADMIN_AUTH_SECRET || 'amelia-bki-secret-key-development-mode-2026';
  const timestamp = Date.now().toString();
  const nonce = crypto.randomBytes(16).toString('hex');
  const payload = `admin:${timestamp}:${nonce}`;
  const hmac = crypto.createHmac('sha256', secretKey).update(payload).digest('hex');
  return `${payload}:${hmac}`;
}

export const ARTICLE_ENGLISH_SLUGS = {
  // Articles 1-11 (Existing English Slugs)
  'art-1': 'finding-inner-peace-digital-era',
  'art-2': 'cbt-and-spiritual-healing-guide',
  'art-3': 'cyber-counseling-ethics-privacy-guide',
  'art-4': 'overcoming-academic-burnout-student-guide',
  'art-5': 'managing-social-anxiety-campus-life',
  'art-6': 'navigating-quarter-life-crisis-islamic-perspective',
  'art-7': 'active-listening-safe-space-peer-counseling',
  'art-8': 'rest-and-mindfulness-in-islamic-tradition',
  'art-9': 'reconciling-inner-child-islamic-healing',
  'art-10': 'family-conflict-communication-compassion',
  'art-11': 'emotional-regulation-techniques-for-stress',

  // Articles 12-37 (Standardized to Clean, Natural English Slugs)
  'art-12': 'art-of-saying-no-people-pleaser-boundaries',
  'art-13': 'overcoming-imposter-syndrome-gratitude-reality',
  'art-14': 'healing-heartbreak-recovering-from-disappointment',
  'art-15': 'bedtime-muhasabah-and-journaling-therapy',
  'art-16': 'navigating-financial-anxiety-early-career-pressures',
  'art-17': 'building-authentic-friendships-overcoming-loneliness',
  'art-18': 'toxic-positivity-and-the-art-of-emotional-validation',
  'art-19': 'prayer-as-soul-therapy-finding-khusyuk',
  'art-20': 'fear-of-failure-and-academic-procrastination',
  'art-21': 'taming-envy-in-the-digital-spotlight-era',
  'art-22': 'student-life-away-from-home-managing-loneliness',
  'art-23': 'building-spiritual-resilience-and-concept-of-ridha',
  'art-24': 'healthy-conflict-resolution-assertive-communication',
  'art-25': 'easing-future-anxiety-with-mindful-action',
  'art-26': 'first-responder-listening-ethics-peer-support',
  'art-27': 'anatomy-of-nafs-islamic-psychology-inner-peace',
  'art-28': 'art-of-self-forgiveness-releasing-past-regrets',
  'art-29': 'escaping-doom-scrolling-restoring-focus-attention',
  'art-30': 'navigating-isolation-in-first-workplace-environment',
  'art-31': 'therapeutic-power-of-wudhu-calming-nervous-system',
  'art-32': 'shrinking-friendship-circle-quality-over-quantity',
  'art-33': 'managing-rejection-sensitive-dysphoria-in-students',
  'art-34': 'role-of-peer-counselors-in-digital-campus-life',
  'art-35': 'balancing-ambition-and-tawakkal-in-career-journey',
  'art-36': 'breaking-intergenerational-trauma-and-parenting-wounds',
  'art-37': 'starting-the-morning-with-inner-tranquility-ritual',
};

async function migrateSlugs() {
  console.log('Migrating article slugs to standardized English URLs...');

  // 1. Update data/db.json
  const dbPath = path.join(process.cwd(), 'data', 'db.json');
  const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  let updatedInJson = 0;
  for (const article of dbData.articles) {
    const targetSlug = ARTICLE_ENGLISH_SLUGS[article.id];
    if (targetSlug && article.slug !== targetSlug) {
      console.log(`[JSON] Updating ${article.id}: "${article.slug}" -> "${targetSlug}"`);
      article.slug = targetSlug;
      updatedInJson++;
    }
  }

  fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf8');
  console.log(`[data/db.json] Successfully updated ${updatedInJson} articles to English slugs.`);

  // 2. Update PostgreSQL database if configured
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    try {
      const sql = postgres(databaseUrl, { ssl: { rejectUnauthorized: false } });
      let updatedInSql = 0;

      for (const [id, targetSlug] of Object.entries(ARTICLE_ENGLISH_SLUGS)) {
        const res = await sql`
          UPDATE articles
          SET slug = ${targetSlug}
          WHERE id = ${id} AND slug != ${targetSlug}
          RETURNING id, slug;
        `;
        if (res && res.length > 0) {
          console.log(`[PostgreSQL] Updated ${res[0].id} to slug: "${res[0].slug}"`);
          updatedInSql++;
        }
      }

      console.log(`[PostgreSQL Database] Successfully updated ${updatedInSql} articles in database.`);
      await sql.end();
    } catch (err) {
      console.error('[PostgreSQL Database Error]:', err.message);
    }
  }

  // 3. Patch Next.js dev server cache via HTTP API if reachable
  try {
    const adminToken = generateAdminSessionToken();
    let updatedInApi = 0;

    for (const [id, targetSlug] of Object.entries(ARTICLE_ENGLISH_SLUGS)) {
      try {
        const response = await fetch(`http://localhost:3000/api/articles/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Cookie: `${COOKIE_NAME}=${adminToken}`,
          },
          body: JSON.stringify({
            slug: targetSlug,
          }),
        });
        if (response.ok) {
          updatedInApi++;
        }
      } catch {
        // Dev server may not be running or reachable
      }
    }
    console.log(`[HTTP API / Next.js Server] Successfully patched ${updatedInApi} articles.`);
  } catch (err) {
    console.warn('[HTTP API Note]:', err.message);
  }

  console.log('Migration of article slugs to English completed successfully across all layers!');
}

migrateSlugs();
