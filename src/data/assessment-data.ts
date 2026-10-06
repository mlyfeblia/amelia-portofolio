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

export function computeDimensionScores(answers: number[]): DimensionScoreResult[] {
  const dimensionKeys: DimensionKey[] = ['pikiran', 'emosi', 'spiritual', 'sosial'];

  return dimensionKeys.map((key) => {
    const meta = ASSESSMENT_DIMENSIONS[key];
    const relatedQuestions = assessmentQuestions.filter((q) => q.dimensionKey === key);
    let score = 0;
    const maxScore = relatedQuestions.length * 3;

    relatedQuestions.forEach((q) => {
      const qIndex = assessmentQuestions.findIndex((item) => item.id === q.id);
      if (qIndex >= 0 && answers[qIndex] !== undefined) {
        score += answers[qIndex];
      }
    });

    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    let status: 'optimal' | 'moderate' | 'need_attention' = 'moderate';
    let advice = '';

    if (percentage >= 75) {
      status = 'optimal';
    } else if (percentage >= 45) {
      status = 'moderate';
    } else {
      status = 'need_attention';
    }

    // Dimension-specific targeted advice
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
