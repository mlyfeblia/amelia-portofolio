import { seededShuffle } from '@/lib/prng';

export type DimensionKey = 'pikiran' | 'emosi' | 'spiritual' | 'sosial';

export interface AssessmentDimension {
  id: DimensionKey;
  name: string;
  shortName: string;
  description: string;
  focusAreas: string;
}

export interface AssessmentOption {
  text: string;
  score: number; // 0 (berat/tertekan) to 3 (sangat stabil/tenang)
}

export interface AssessmentQuestion {
  id: number;
  dimensionKey: DimensionKey;
  dimensionName: string;
  question: string;
  context: string;
  options: AssessmentOption[];
}

export interface AssessmentResultData {
  range: [number, number];
  level: string;
  category: string;
  summary: string;
  body: string;
  recs: string[];
}

export const ASSESSMENT_DIMENSIONS: Record<DimensionKey, AssessmentDimension> = {
  pikiran: {
    id: 'pikiran',
    name: 'Ritme Pikiran & Beban Kognitif',
    shortName: 'Kognitif & Pikiran',
    description: 'Menilai kejernihan berpikir, intensitas overthinking, dan konsentrasi dalam rutinitas.',
    focusAreas: 'Kejernihan pikiran, fokus aktivitas harian, dan ketenangan membuat keputusan.',
  },
  emosi: {
    id: 'emosi',
    name: 'Stabilitas Emosi & Resiliensi Diri',
    shortName: 'Emosi & Resiliensi',
    description: 'Menilai regulasi emosional saat menghadapi tekanan, rasa kecewa, dan daya lentur batin.',
    focusAreas: 'Regulasi suasana hati, toleransi stres, dan pemulihan energi emosional.',
  },
  spiritual: {
    id: 'spiritual',
    name: "Kedamaian Batin & Spiritualitas (Thuma'ninah)",
    shortName: 'Batin & Spiritualitas',
    description: "Menilai tingkat ketenteraman hati, kepasrahan, dan penerimaan terhadap takdir serta fase hidup.",
    focusAreas: "Thuma'ninah dalam keheningan/ibadah, rasa bersyukur, dan keikhlasan batin.",
  },
  sosial: {
    id: 'sosial',
    name: 'Relasi Sosial & Batasan Diri (Boundaries)',
    shortName: 'Relasi Sosial & Batasan',
    description: 'Menilai ketersediaan ruang berbagi yang aman, rasa keterhubungan, dan batasan pribadi yang sehat.',
    focusAreas: 'Koneksi suportif tanpa stigma, keterbukaan hati, dan kemampuan menolak tanpa rasa bersalah.',
  },
};

export const assessmentQuestions: AssessmentQuestion[] = [
  // ── Dimensi 1: Pikiran & Kognitif ──────────────────────────────────────────
  {
    id: 1,
    dimensionKey: 'pikiran',
    dimensionName: 'Ritme Pikiran & Beban Kognitif',
    context: 'Dinamika Fokus & Aktivitas Harian',
    question: 'Bagaimana ritme pikiranmu dalam menghadapi aktivitas dan tugas beberapa hari terakhir?',
    options: [
      { text: 'Tenang, fokus terjaga dengan baik, dan mampu menyelesaikan tugas tanpa merasa terbebani secara berlebihan.', score: 3 },
      { text: 'Cukup terkendali, sesekali overthinking namun masih mampu memilah prioritas dengan wajar.', score: 2 },
      { text: 'Sering melompat-lompat dan cemas, sulit berkonsentrasi karena terlalu banyak hal yang dipikirkan.', score: 1 },
      { text: 'Pikiran terasa sangat bising, kalut, dan buntu total; sulit menemukan ketenangan sedikit pun.', score: 0 },
    ],
  },
  {
    id: 2,
    dimensionKey: 'pikiran',
    dimensionName: 'Ritme Pikiran & Beban Kognitif',
    context: 'Pengambilan Keputusan & Ketidakpastian',
    question: 'Ketika dihadapkan pada ketidakpastian rencana atau keputusan penting, bagaimana kecenderungan respon batinmu?',
    options: [
      { text: 'Mampu menimbang risiko dengan kepala dingin, mencari jalan keluar bertahap, dan berserah pada hasil terbaik.', score: 3 },
      { text: 'Sempat ragu dan khawatir, namun perlahan bisa mengambil langkah dan berani memutuskan.', score: 2 },
      { text: 'Kerap terjebak skenario terburuk (catastrophizing) dan menunda keputusan karena takut keliru.', score: 1 },
      { text: 'Lumpuh secara mental (analysis paralysis), panik berlebih, dan merasa tak sanggup menentukan arah.', score: 0 },
    ],
  },
  {
    id: 9,
    dimensionKey: 'pikiran',
    dimensionName: 'Ritme Pikiran & Beban Kognitif',
    context: 'Kualitas Istirahat & Keheningan Malam',
    question: 'Ketika tiba waktu istirahat malam hari, bagaimana kondisi alur pikiranmu menjelang tidur?',
    options: [
      { text: 'Pikiran tenang, mudah terlelap tanpa beban pikiran mengganggu, dan bangun dengan rasa segar.', score: 3 },
      { text: 'Sesekali mengingat agenda esok hari sebentar, namun tetap bisa tidur cukup dan nyenyak.', score: 2 },
      { text: 'Kerap terjaga lama karena overthinking, memikirkan kesalahan masa lalu atau rasa cemas.', score: 1 },
      { text: 'Insomnia parah, pikiran berputar tanpa henti sepanjang malam, dan bangun dalam keadaan lelah luar biasa.', score: 0 },
    ],
  },
  {
    id: 10,
    dimensionKey: 'pikiran',
    dimensionName: 'Ritme Pikiran & Beban Kognitif',
    context: 'Beban Multi-Tugas & Ekspektasi Diri',
    question: 'Bagaimana caramu mengelola tumpukan ekspektasi dan target tanggung jawab yang datang bersamaan?',
    options: [
      { text: 'Mampu menyusun prioritas dengan realistis, mencicil satu per satu tanpa panik, dan menerima keterbatasan diri.', score: 3 },
      { text: 'Cukup adaptif, walau kadang terasa agak kewalahan di awal sebelum menemukan ritme kerja.', score: 2 },
      { text: 'Mudah panik, menumpuk semua beban di kepala sekaligus hingga bingung harus mulai dari mana.', score: 1 },
      { text: 'Merasa lumpuh dan ingin melarikan diri dari kenyataan karena tekanan terasa menenggelamkan.', score: 0 },
    ],
  },

  // ── Dimensi 2: Emosi & Resiliensi ──────────────────────────────────────────
  {
    id: 3,
    dimensionKey: 'emosi',
    dimensionName: 'Stabilitas Emosi & Resiliensi Diri',
    context: 'Respon Terhadap Hambatan & Kegagalan',
    question: 'Saat rencana tidak berjalan sesuai harapan atau ada hambatan tak terduga, apa respon emosional yang paling sering kamu rasakan?',
    options: [
      { text: 'Menerima keadaan dengan lapang dada, melihat hikmah pembelajarannya, dan siap berikhtiar kembali.', score: 3 },
      { text: 'Sempat merasa sedih atau kecewa beberapa saat, namun lekas menenangkan diri dan bangkit kembali.', score: 2 },
      { text: 'Cepat tersulut emosi, mudah tersinggung, atau memendam kesedihan mendalam selama berhari-hari.', score: 1 },
      { text: 'Menyalahkan diri sendiri secara ekstrem, merasa gagal total, atau ledakan emosi sulit dikendalikan.', score: 0 },
    ],
  },
  {
    id: 4,
    dimensionKey: 'emosi',
    dimensionName: 'Stabilitas Emosi & Resiliensi Diri',
    context: 'Energi Mental & Suasana Hati Harian',
    question: 'Bagaimana kondisi energi batin dan kestabilan suasana hatimu sepanjang hari?',
    options: [
      { text: 'Hangat, seimbang, dan memiliki energi positif dalam berinteraksi maupun menjalankan rutinitas.', score: 3 },
      { text: 'Fluktuatif secara wajar; rasa lelah di sore hari lekas pulih setelah istirahat sejenak.', score: 2 },
      { text: 'Sering mengalami kelelahan emosional (emotional exhaustion), hampa, atau kehilangan minat.', score: 1 },
      { text: 'Burnout berat, merasa tertekan sejak bangun tidur, dan merasa kehabisan daya emosional sama sekali.', score: 0 },
    ],
  },
  {
    id: 11,
    dimensionKey: 'emosi',
    dimensionName: 'Stabilitas Emosi & Resiliensi Diri',
    context: 'Validasi Rasa Sedih & Kerentanan Diri',
    question: 'Saat rasa sedih, lelah, atau kecewa hadir, bagaimana sikap batinmu terhadap perasaan tersebut?',
    options: [
      { text: 'Menerima dan memvalidasi perasaan itu dengan penuh welas asih (self-compassion) tanpa merasa bersalah.', score: 3 },
      { text: 'Bisa merasakan kesedihan dengan wajar, lalu mencari ruang jeda yang menenangkan untuk memulihkan diri.', score: 2 },
      { text: 'Kerap memendam atau memaksakan diri terlihat baik-baik saja (toxic positivity) hingga emosi menumpuk.', score: 1 },
      { text: 'Membenci diri sendiri saat merasa lemah, menyalahkan diri, atau mematikan rasa secara total (numbness).', score: 0 },
    ],
  },
  {
    id: 12,
    dimensionKey: 'emosi',
    dimensionName: 'Stabilitas Emosi & Resiliensi Diri',
    context: 'Kecemasan Terhadap Masa Depan',
    question: 'Seberapa sering kamu merasakan kekhawatiran intens atau rasa takut berlebih akan hal-hal yang belum terjadi?',
    options: [
      { text: 'Sangat jarang; yakin bahwa ikhtiar terbaik hari ini adalah bekal terpenting untuk masa depan.', score: 3 },
      { text: 'Kadang muncul kekhawatiran sesaat, namun bisa ditenangkan dengan afirmasi positif dan rencana terukur.', score: 2 },
      { text: 'Sering merasa cemas dan tegang tiba-tiba, dada berdebar memikirkan ketidakpastian hari esok.', score: 1 },
      { text: 'Kecemasan konstan mendominasi keseharian, membuat tubuh tegang terus-menerus dan sulit rileks.', score: 0 },
    ],
  },

  // ── Dimensi 3: Spiritualitas & Kedamaian Batin ─────────────────────────────
  {
    id: 5,
    dimensionKey: 'spiritual',
    dimensionName: "Kedamaian Batin & Spiritualitas (Thuma'ninah)",
    context: 'Keheningan & Koneksi Spiritual',
    question: 'Bagaimana perasaanmu saat berada dalam ruang hening atau menjalankan ibadah dan refleksi pribadi?',
    options: [
      { text: "Merasakan ketenteraman hati (thuma'ninah); ibadah dan refleksi menjadi penyejuk utama di tengah rutinitas.", score: 3 },
      { text: 'Cukup damai dan tenang, meski sesekali pikiran masih melayang pada urusan kesibukan duniawi.', score: 2 },
      { text: 'Terasa formalitas hampa, gelisah, atau dibayangi rasa cemas dan ketakutan yang tak kunjung reda.', score: 1 },
      { text: 'Merasa sangat jauh, hampa batiniah, atau dihantui rasa bersalah dan keputusasaan mendalam.', score: 0 },
    ],
  },
  {
    id: 6,
    dimensionKey: 'spiritual',
    dimensionName: "Kedamaian Batin & Spiritualitas (Thuma'ninah)",
    context: 'Penerimaan Diri & Makna Hidup',
    question: 'Sejauh mana kamu merasakan kerelaan (ridha) terhadap fase hidup yang sedang dijalani saat ini?',
    options: [
      { text: 'Yakin sepenuh hati bahwa setiap fase memiliki maksud baik dari Allah dan senantiasa bersyukur atas nikmat yang ada.', score: 3 },
      { text: 'Sebagian besar bisa menerima, walau sesekali muncul keluh kesah manusiawi yang dapat diredam.', score: 2 },
      { text: 'Kerap membandingkan nasib dengan pencapaian orang lain dan merasa hidup ini kurang adil bagi diri sendiri.', score: 1 },
      { text: 'Menolak realitas dengan kemarahan batin, merasa tidak berharga, dan kehilangan makna arah hidup.', score: 0 },
    ],
  },
  {
    id: 13,
    dimensionKey: 'spiritual',
    dimensionName: "Kedamaian Batin & Spiritualitas (Thuma'ninah)",
    context: 'Doa, Harapan & Kepasrahan (Tawakal)',
    question: 'Ketika mengalami kebuntuan hidup, bagaimana hubungan batinmu dalam memanjatkan doa dan berserah diri?',
    options: [
      { text: 'Menjadikan doa sebagai tempat bersandar ternyaman, meyakini takdir Allah selalu menyimpan kebaikan.', score: 3 },
      { text: 'Tetap berdoa dan berikhtiar dengan harapan baik, meski sesekali ada rasa gelisah yang wajar.', score: 2 },
      { text: 'Merasa doa kurang bermakna atau mulai meragukan apakah pertolongan akan datang pada waktunya.', score: 1 },
      { text: 'Merasa ditinggalkan, putus asa dari rahmat Allah, atau enggan meminta pertolongan karena batin hampa.', score: 0 },
    ],
  },
  {
    id: 14,
    dimensionKey: 'spiritual',
    dimensionName: "Kedamaian Batin & Spiritualitas (Thuma'ninah)",
    context: 'Rasa Syukur & Keberkahan Hidup',
    question: 'Di tengah rutinitas harian yang padat, seberapa mudah bagimu menemukan rasa syukur atas hal-hal sederhana?',
    options: [
      { text: 'Sangat mudah merasakan nikmat kecil (udara segar, nafas lega, kebaikan orang lain) yang menyejukkan hati.', score: 3 },
      { text: 'Bisa bersyukur saat diingatkan atau saat memiliki waktu luang untuk merenung di penghujung hari.', score: 2 },
      { text: 'Fokus lebih sering tertuju pada kekurangan dan rasa tidak puas dibanding apa yang sudah dimiliki.', score: 1 },
      { text: 'Hati terasa keras dan kering; sulit merasakan getaran syukur sedikit pun karena tertutup kepedihan batin.', score: 0 },
    ],
  },

  // ── Dimensi 4: Sosial & Batasan Diri ───────────────────────────────────────
  {
    id: 7,
    dimensionKey: 'sosial',
    dimensionName: 'Relasi Sosial & Batasan Diri (Boundaries)',
    context: 'Dukungan Sosial & Ruang Berbagi',
    question: 'Apakah kamu punya orang terdekat atau ruang aman untuk berbagi isi hati secara terbuka tanpa takut dihakimi?',
    options: [
      { text: 'Ada, memiliki sahabat atau keluarga yang selalu siap mendengar secara tulus dan memvalidasi perasaan.', score: 3 },
      { text: 'Ada beberapa kenalan, namun saya hanya berani bercerita hal ringan; keluh kesah utama tetap disimpan sendiri.', score: 2 },
      { text: 'Merasa kesepian di tengah keramaian; sulit menemukan seseorang yang benar-benar bisa dipercaya.', score: 1 },
      { text: 'Terisolasi sepenuhnya, memikul semua luka sendirian karena pernah dikecewakan atau merasa tak ada yang peduli.', score: 0 },
    ],
  },
  {
    id: 8,
    dimensionKey: 'sosial',
    dimensionName: 'Relasi Sosial & Batasan Diri (Boundaries)',
    context: 'Batasan Sehat & People Pleasing',
    question: 'Bagaimana caramu menjaga batasan diri yang sehat (boundaries) terhadap ekspektasi atau tuntutan orang lain?',
    options: [
      { text: 'Mampu menolak dengan santun tanpa rasa bersalah berlebih saat kapasitas diri sudah mencapai batas.', score: 3 },
      { text: 'Bisa menetapkan batas dalam banyak situasi, walau sesekali masih sungkan atau memaksakan diri.', score: 2 },
      { text: 'Sangat sulit berkata tidak (people pleasing); kerap mengorbankan waktu dan ketenangan diri demi diterima orang lain.', score: 1 },
      { text: 'Selalu mendahulukan orang lain hingga mengorbankan kesehatan fisik dan jiwa sendiri secara terus-menerus.', score: 0 },
    ],
  },
  {
    id: 15,
    dimensionKey: 'sosial',
    dimensionName: 'Relasi Sosial & Batasan Diri (Boundaries)',
    context: 'Perbandingan Sosial & Lingkungan Digital',
    question: 'Bagaimana perasaanmu saat melihat pencapaian atau gaya hidup orang lain di media sosial maupun lingkungan sekitar?',
    options: [
      { text: 'Turut berbahagia (ghibthah) tanpa merasa rendah diri, sadar setiap orang memiliki garis waktu masing-masing.', score: 3 },
      { text: 'Kadang terdistraksi membandingkan diri sebentar, namun lekas sadar dan kembali fokus pada proses sendiri.', score: 2 },
      { text: 'Kerap merasa tertinggal (FOMO), minder, dan cemas bahwa diri ini berjalan terlalu lambat.', score: 1 },
      { text: 'Tenggelam dalam inferioritas mendalam, membenci diri sendiri, dan menarik diri dari interaksi sosial.', score: 0 },
    ],
  },
  {
    id: 16,
    dimensionKey: 'sosial',
    dimensionName: 'Relasi Sosial & Batasan Diri (Boundaries)',
    context: 'Kenyamanan Menjadi Diri Sendiri',
    question: 'Sejauh mana kamu merasa aman dan nyaman mengekspresikan diri apa adanya di hadapan lingkaran pertemananmu?',
    options: [
      { text: 'Sangat nyaman dan dihargai apa adanya tanpa perlu memakai topeng atau pura-pura sempurna.', score: 3 },
      { text: 'Cukup nyaman di lingkaran inti terdekat, walau masih menjaga jarak di lingkungan baru.', score: 2 },
      { text: 'Kerap merasa harus selalu menyenangkan orang lain dan takut ditolak jika menunjukkan kelemahan.', score: 1 },
      { text: 'Merasa tidak ada tempat yang aman, selalu berpura-pura, dan merasa terasing meski berada di kerumunan.', score: 0 },
    ],
  },
];

export const assessmentResults: AssessmentResultData[] = [
  {
    range: [19, 24],
    level: 'Jiwa Stabil, Tenang & Adaptif',
    category: "Fase Nafs Muthma'innah (Hati yang Tenteram)",
    summary: 'Kondisi psikologis, emosi, dan batinmu berada dalam ritme yang harmonis, stabil, dan memiliki daya lentur yang baik.',
    body: 'Alhamdulillah, hasil evaluasi menunjukkan bahwa kamu punya fondasi regulasi emosi yang matang dan ketenangan batin yang terjaga. Caramu menghadapi ketidakpastian dan menjaga batasan diri yang sehat mencerminkan keseimbangan antara ikhtiar rasional dan tawakal yang kokoh.',
    recs: [
      'Pertahankan kebiasaan baik, waktu hening harian (mindful reflection), dan istirahat berkualitas.',
      'Jadikan energi positif dan ketenteraman batin ini sebagai sarana menebarkan kehangatan bagi lingkungan sekitar.',
      'Tetap beri ruang empati bagi diri sendiri apabila sewaktu-waktu dinamika hidup menghadirkan tantangan baru.',
    ],
  },
  {
    range: [11, 18],
    level: 'Dinamika Introspektif & Butuh Ruang Jeda',
    category: 'Fase Nafs Lawwamah (Dinamika Evaluatif)',
    summary: 'Kamu sedang memikul beban pikiran yang cukup terasa, ada gejolak introspektif, dan butuh ruang jeda untuk bernapas tenang.',
    body: 'Kondisimu saat ini mencerminkan fase introspeksi yang aktif. Kamu masih mampu beraktivitas dengan baik, tapi ada indikasi kelelahan mental atau overthinking yang mulai menumpuk. Tubuh dan hatimu sedang membunyikan alarm lembut bahwa kamu butuh jeda dan teman bercerita.',
    recs: [
      'Kurangi konsumsi media sosial yang memicu perbandingan sosial (social comparison) atau kecemasan tidak perlu.',
      'Terapkan teknik grounding atau brain dump: tuliskan semua kerumitan pikiran di atas kertas sebelum tidur.',
      'Sangat disarankan mengambil sesi bimbingan konseling sebaya bersama Amel untuk mengurai benang kusut pikiran sebelum berubah menjadi kejenuhan mendalam.',
    ],
  },
  {
    range: [0, 10],
    level: 'Kelelahan Batin Signifikan & Butuh Teman Dengar Segera',
    category: 'Fase Membutuhkan Pendampingan Empatis Segera',
    summary: 'Kapasitas batinmu sedang berada di titik jenuh kelelahan. Jangan pikul semua beban ini sendirian lagi ya.',
    body: 'Hasil asesmen menunjukkan bahwa ruang batin dan emosionalmu sedang memikul beban yang cukup berat. Menahan luka, cemas, atau rasa terisolasi sendirian adalah hal yang melelahkan. Kamu tidak sendirian, dan kamu berhak mendapatkan ruang aman yang memvalidasi perasaanmu dengan hangat tanpa penghakiman.',
    recs: [
      'Istirahatkan diri sejenak dari tuntutan berlebih; kamu tidak harus memaksakan diri terlihat kuat setiap saat.',
      'Izinkan dirimu untuk menerima pertolongan, dan jangan ragu buat berbagi sama orang yang kamu percaya.',
      'Jadwalkan sesi bimbingan konseling langsung bersama Amel atau luangkan curhat anonim di Ruang Curhat agar beban batin dapat terurai dengan aman.',
    ],
  },
];

export interface DimensionScoreResult {
  key: DimensionKey;
  name: string;
  shortName: string;
  score: number;
  maxScore: number;
  percentage: number;
  status: 'optimal' | 'moderate' | 'need_attention';
  advice: string;
}

/**
 * Samples exactly 8 questions (2 per dimension) deterministically using seed
 */
export function sampleAssessmentQuestions(seed?: string | number): AssessmentQuestion[] {
  const prngSeed = seed ?? 'default-assessment-seed';
  const keys: DimensionKey[] = ['pikiran', 'emosi', 'spiritual', 'sosial'];
  const sampled: AssessmentQuestion[] = [];

  keys.forEach((key) => {
    const dimQuestions = assessmentQuestions.filter((q) => q.dimensionKey === key);
    const shuffled = seededShuffle(dimQuestions, `${prngSeed}_dim_${key}`);
    sampled.push(...shuffled.slice(0, 2));
  });

  const finalQuestions = seededShuffle(sampled, `${prngSeed}_final`);

  // Shuffle options inside each question deterministically to eliminate acquiescence/position bias
  return finalQuestions.map((q) => ({
    ...q,
    options: seededShuffle(q.options, `${prngSeed}_q_${q.id}_opts`),
  }));
}

/**
 * Calculate dimension scores based on a map of question IDs to selected scores.
 * Independent of question order.
 */
export function computeDimensionScoresById(
  answersById: Record<number, number>,
  activeQuestions: AssessmentQuestion[]
): DimensionScoreResult[] {
  const dimensionKeys: DimensionKey[] = ['pikiran', 'emosi', 'spiritual', 'sosial'];

  return dimensionKeys.map((key) => {
    const meta = ASSESSMENT_DIMENSIONS[key];
    const relatedQuestions = activeQuestions.filter((q) => q.dimensionKey === key);
    let score = 0;
    const maxScore = relatedQuestions.length * 3;

    relatedQuestions.forEach((q) => {
      const val = answersById[q.id];
      if (typeof val === 'number') {
        score += val;
      }
    });

    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    let status: 'optimal' | 'moderate' | 'need_attention' = 'moderate';

    if (percentage >= 75) {
      status = 'optimal';
    } else if (percentage >= 45) {
      status = 'moderate';
    } else {
      status = 'need_attention';
    }

    let advice = '';
    switch (key) {
      case 'pikiran':
        advice =
          status === 'optimal'
            ? 'Pikiran jernih dan fokus terarah dengan sangat baik.'
            : status === 'moderate'
              ? 'Waspadai overthinking berulang; luangkan jeda untuk memilah mana hal yang bisa dikontrol dan mana yang di luar kendali.'
              : 'Pikiran terasa sangat bising dan buntu. Butuh teknik pelepasan mental (brain dump) dan bimbingan untuk mengurai prioritas.';
        break;
      case 'emosi':
        advice =
          status === 'optimal'
            ? 'Regulasi emosi stabil dan memiliki resiliensi yang tangguh.'
            : status === 'moderate'
              ? 'Kapasitas emosi masih cukup baik, namun perlu istirahat yang cukup agar tidak mudah tersulut atau merasa hampa.'
              : 'Mengalami kelelahan emosional yang tinggi. Hindari menekan perasaan sendiri; beri validasi atas rasa lelah yang hadir.';
        break;
      case 'spiritual':
        advice =
          status === 'optimal'
            ? "Merasakan thuma'ninah yang mendalam dan berserah diri secara utuh."
            : status === 'moderate'
              ? 'Ruang batin cukup damai; perbanyak hening berkualitas dan dzikir penenang jiwa untuk memperkuat ketenteraman.'
              : 'Hati terasa hampa atau cemas berkepanjangan. Ingatlah bahwa fase terpuruk ini adalah undangan lembut untuk kembali mendekat pada-Nya.';
        break;
      case 'sosial':
        advice =
          status === 'optimal'
            ? 'Memiliki lingkar sosial yang sehat dan mampu menjaga batasan diri dengan tegas.'
            : status === 'moderate'
              ? 'Mulai belajar berkata "tidak" pada tuntutan yang melampaui kapasitas tanpa merasa bersalah.'
              : 'Terasa terisolasi atau terjebak dalam people pleasing ekstrem. Sangat butuh teman curhat yang aman dan tulus.';
        break;
    }

    return {
      key,
      name: meta.name,
      shortName: meta.shortName,
      score,
      maxScore,
      percentage,
      status,
      advice,
    };
  });
}

/**
 * Backward compatibility wrapper for array-indexed answers
 */
export function computeDimensionScores(answers: number[]): DimensionScoreResult[] {
  const answersById: Record<number, number> = {};
  const first8 = assessmentQuestions.slice(0, 8);
  first8.forEach((q, idx) => {
    if (answers[idx] !== undefined) {
      answersById[q.id] = answers[idx];
    }
  });
  return computeDimensionScoresById(answersById, first8);
}

export interface AssessmentSuggestionResult {
  lowestDimension: DimensionScoreResult;
  recommendedTopic: string;
  categoryFilter: string;
  relatedArticles: Array<{ title: string; slug: string; category: string; readTime: string }>;
  whatsappNote: string;
  offeringHeadline: string;
  offeringMessage: string;
}

export function getAssessmentSuggestions(
  dimensions: DimensionScoreResult[]
): AssessmentSuggestionResult {
  const urgencyWeight: Record<DimensionKey, number> = {
    emosi: 4,
    pikiran: 3,
    spiritual: 2,
    sosial: 1,
  };

  const sorted = [...dimensions].sort((a, b) => {
    if (a.percentage !== b.percentage) {
      return a.percentage - b.percentage;
    }
    return (urgencyWeight[b.key] || 0) - (urgencyWeight[a.key] || 0);
  });
  const lowest = sorted[0] || dimensions[0];

  switch (lowest.key) {
    case 'pikiran':
      return {
        lowestDimension: lowest,
        recommendedTopic: 'Kecemasan & Overthinking',
        categoryFilter: 'Manajemen Emosi & Overthinking',
        relatedArticles: [
          {
            title: "Terlalu Cemas Memikirkan Hari Esok? Melatih 'Mindful Action' untuk Meringankan Beban Kepala",
            slug: 'easing-future-anxiety-with-mindful-action',
            category: 'Manajemen Emosi & Overthinking',
            readTime: '6 menit baca',
          },
          {
            title: 'Menavigasi Quarter-Life Crisis dengan Perspektif Islam dan Refleksi Maqashid Hidup',
            slug: 'navigating-quarter-life-crisis-islamic-perspective',
            category: 'Quarter-Life Crisis & Self Growth',
            readTime: '6 menit baca',
          },
        ],
        whatsappNote: 'Halo Amel, saya telah menyelesaikan asesmen jiwa. Dimensi Pikiran & Kognitif saya membutuhkan perhatian khusus. Saya ingin konsultasi terkait manajemen overthinking.',
        offeringHeadline: 'Urai Benang Kusut Pikiran Bersama Teman Sebaya',
        offeringMessage: 'Saat pikiran terasa bising dan sulit dipilah sendiri, memiliki teman dengar yang objektif dan hangat dapat membantu menata kembali kejernihan mentalmu.',
      };
    case 'emosi':
      return {
        lowestDimension: lowest,
        recommendedTopic: 'Manajemen Stres, Emosi & Burnout',
        categoryFilter: 'Manajemen Emosi & Overthinking',
        relatedArticles: [
          {
            title: 'Panduan Praktis Regulasi Emosi Saat Didera Tekanan Hidup: Menjinakkan Marah dan Sedih Secara Sehat',
            slug: 'emotional-regulation-techniques-for-stress',
            category: 'Manajemen Emosi & Overthinking',
            readTime: '5 menit baca',
          },
          {
            title: 'Langkah Praktis Mengatasi Academic Burnout dan Rasa Bersalah Saat Istirahat bagi Mahasiswa',
            slug: 'overcoming-academic-burnout-student-guide',
            category: 'Kesehatan Mental Islami',
            readTime: '6 menit baca',
          },
        ],
        whatsappNote: 'Halo Amel, hasil asesmen menunjukkan stabilitas emosi dan energi mental saya sedang di titik lelah. Saya butuh sesi konseling untuk memulihkan resiliensi diri.',
        offeringHeadline: 'Beri Ruang Istirahat Bagi Hatimu yang Lelah',
        offeringMessage: 'Kamu tidak harus selalu terlihat tegar setiap saat. Di ruang konseling Amelia, semua rasa sedih dan lelahmu diterima seutuhnya tanpa penghakiman.',
      };
    case 'spiritual':
      return {
        lowestDimension: lowest,
        recommendedTopic: 'Pengembangan Diri & Spiritual Islami',
        categoryFilter: 'Kesehatan Mental Islami',
        relatedArticles: [
          {
            title: "Konsep Istirahat Berkualitas dan Thuma'ninah dalam Tradisi Kesehatan Mental Islam",
            slug: 'rest-and-mindfulness-in-islamic-tradition',
            category: 'Kesehatan Mental Islami',
            readTime: '6 menit baca',
          },
          {
            title: 'Menyembuhkan Luka Batin Masa Kecil (Inner Child) dengan Kehangatan Spiritualitas dan Belas Kasih Diri',
            slug: 'reconciling-inner-child-islamic-healing',
            category: 'Kesehatan Mental Islami',
            readTime: '5 menit baca',
          },
        ],
        whatsappNote: 'Halo Amel, hasil asesmen menunjukkan ruang spiritualitas dan kedamaian batin saya sedang hampa. Saya ingin berkonsultasi mengenai konseling islami.',
        offeringHeadline: 'Sentuhan Kesejukan Batin & Islamic Healing',
        offeringMessage: 'Pendekatan bimbingan islami Amelia berfokus merawat hati dengan dzikir, penerimaan takdir (ridha), dan membangun kembali harapan kepada Allah.',
      };
    case 'sosial':
    default:
      return {
        lowestDimension: lowest,
        recommendedTopic: 'Pertemanan, Sosial & People Pleaser',
        categoryFilter: 'Hubungan, Pertemanan & Pasangan',
        relatedArticles: [
          {
            title: 'Seni Menolak Tanpa Merasa Bersalah: Belajar Menetapkan Batasan Diri yang Sehat bagi People Pleaser',
            slug: 'art-of-saying-no-people-pleaser-boundaries',
            category: 'Hubungan, Pertemanan & Pasangan',
            readTime: '5 menit baca',
          },
          {
            title: 'Seni Menjinakkan Kecemasan Sosial dan Membangun Rasa Percaya Diri di Lingkungan Kampus',
            slug: 'managing-social-anxiety-campus-life',
            category: 'Hubungan, Pertemanan & Pasangan',
            readTime: '5 menit baca',
          },
        ],
        whatsappNote: 'Halo Amel, hasil asesmen menunjukkan dimensi sosial dan batasan diri saya butuh perhatian. Saya ingin berkonsultasi terkait relasi dan people pleasing.',
        offeringHeadline: 'Bangun Relasi Sehat yang Menghargai Batasan Dirimu',
        offeringMessage: 'Belajar menetapkan batas yang aman tanpa rasa bersalah berlebih adalah bentuk cinta pada diri sendiri. Mari urai dinamika relasimu di ruang privat bersama Amel.',
      };
  }
}
