import { generateEnglishArticleSlug } from '../src/lib/slug-generator';

interface TestCase {
  title: string;
  expected: string;
  description: string;
}

const testCases: TestCase[] = [
  // User Prompt Required Titles (Untruncated pure translation)
  {
    title: 'Cara Menemukan Ketenangan Batin dan Mengatasi Overthinking di Tengah Riuhnya Notifikasi Digital',
    expected: 'finding-inner-peace-overcoming-overthinking-digital-noise-guide',
    description: 'Title 1: Guide prefix, inner peace, overthinking, digital noise, untruncated',
  },
  {
    title: 'Seni Berkomunikasi Hangat dengan Orang Tua: Mengurai Friksi Antargenerasi Tanpa Melukai Hati',
    expected: 'warm-communication-parents-resolving-generational-gap-hurting-heart',
    description: 'Title 2: Warm communication, parents, resolving generational gap, hurting, heart, untruncated',
  },
  {
    title: 'Panduan Praktis Regulasi Emosi Saat Didera Tekanan Hidup: Menjinakkan Marah dan Sedih Secara Sehat',
    expected: 'emotional-regulation-managing-anger-sadness-healthy-guide',
    description: 'Title 3: Guide prefix, emotional regulation, managing anger and sadness, healthy, untruncated',
  },
  {
    title: 'Ketika Logika CBT Bertemu Tazkiyatun Nafs untuk Mengurai Cemas dan Luka Batin Mahasiswa',
    expected: 'cbt-soul-purification-student-anxiety-healing',
    description: 'Title 4: CBT logic meets soul purification for student anxiety healing',
  },

  // High-Frequency Domain Phrases
  {
    title: 'Quarter-life Crisis pada Mahasiswa',
    expected: 'quarter-life-crisis-student',
    description: 'Quarter-life crisis phrase with student',
  },
  {
    title: 'Langkah Mengatasi Academic Burnout Mahasiswa',
    expected: 'overcoming-academic-burnout-student-guide',
    description: 'Academic burnout with guide prefix',
  },
  {
    title: 'Cyber Counseling dan Konseling Daring untuk Teman Sebaya',
    expected: 'cyber-counseling-online-peer',
    description: 'Cyber counseling, online counseling, and peer counseling',
  },
  {
    title: 'Tazkiyatun Nafs dan Thumaninah untuk Ketenangan Jiwa',
    expected: 'soul-purification-inner-tranquility-peace',
    description: 'Islamic counseling: soul purification & inner tranquility',
  },
  {
    title: 'Ruang Dengar dan Ruang Aman untuk Konselor Sebaya',
    expected: 'safe-space-peer-counseling',
    description: 'Safe space and peer counseling with deduplication of repeated safe-space',
  },
  {
    title: 'Membangun Belas Kasih Diri dan Percaya Diri',
    expected: 'building-self-compassion-confidence',
    description: 'Self-compassion and self-confidence with deduplication of self',
  },
  {
    title: 'Mengatasi Rasa Bersalah dan Rendah Diri',
    expected: 'overcoming-guilt-inferiority-complex',
    description: 'Guilt and inferiority complex',
  },
  {
    title: 'Pencarian Jati Diri dan Arah Hidup',
    expected: 'identity-search-life-direction',
    description: 'Identity search and life direction',
  },
  {
    title: 'Tips Istirahat Berkualitas di Era Media Sosial',
    expected: 'quality-rest-social-media-guide',
    description: 'Quality rest in social media era',
  },

  // Token Deduplication & Cleanliness
  {
    title: 'Kesehatan Mental: Menjaga Kesehatan Mental',
    expected: 'mental-health-protecting',
    description: 'Deduplicates repeated tokens (mental, health)',
  },
  {
    title: '5 Cara Merawat Diri',
    expected: '5-nurturing-self-guide',
    description: 'Numeric prefix with guide handling',
  },

  // Fallback and edge cases
  {
    title: '',
    expected: '',
    description: 'Empty string returns empty slug',
  },
];

let failed = 0;

console.log('--- RUNNING SLUG GENERATOR VERIFICATION TESTS ---');

for (const { title, expected, description } of testCases) {
  const result = generateEnglishArticleSlug(title);
  if (result === expected) {
    console.log(`PASS: ${description}`);
  } else {
    console.error(`FAIL: ${description}`);
    console.error(`   Input:    "${title}"`);
    console.error(`   Expected: "${expected}"`);
    console.error(`   Received: "${result}"`);
    failed++;
  }
}

if (failed === 0) {
  console.log(`\nALL ${testCases.length} TESTS PASSED SUCCESSFULLY!`);
  process.exit(0);
} else {
  console.error(`\n${failed} OF ${testCases.length} TESTS FAILED!`);
  process.exit(1);
}
