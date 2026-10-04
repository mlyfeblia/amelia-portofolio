export interface AssessmentQuestion {
  id: number;
  dimension: string;
  question: string;
  options: { text: string; score: number }[];
}

export interface AssessmentResultData {
  range: [number, number];
  level: string;
  category: string;
  body: string;
  recs: string[];
}

export const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: 1,
    dimension: 'Kondisi Kognitif & Pikiran',
    question: 'Bagaimana ritme pikiran Anda dalam 7 hari terakhir?',
    options: [
      { text: 'Tenang dan jernih, fokus terjaga, dan rutinitas terlaksana dengan baik.', score: 3 },
      { text: 'Sering overthinking dan cemas sesekali, namun masih mampu beraktivitas.', score: 2 },
      { text: 'Pikiran terasa bising, kalut, dan sangat sulit untuk menemukan ketenangan.', score: 1 },
    ],
  },
  {
    id: 2,
    dimension: 'Resiliensi Emosional',
    question: 'Ketika rencana hidup terhambat atau ada masalah tak terduga, apa yang terjadi?',
    options: [
      { text: 'Menerima keadaan dengan lapang dada, berikhtiar kembali, dan berserah diri.', score: 3 },
      { text: 'Sempat merasa down beberapa saat, namun perlahan bisa bangkit kembali.', score: 2 },
      { text: 'Mudah panik, menyalahkan diri sendiri secara ekstrem, atau merasa buntu total.', score: 1 },
    ],
  },
  {
    id: 3,
    dimension: 'Ketenangan Jiwa & Spiritualitas',
    question: 'Bagaimana perasaan Anda saat berada dalam keheningan atau menjalankan ibadah?',
    options: [
      { text: "Merasakan thuma'ninah, ibadah dan refleksi menjadi sumber kedamaian utama.", score: 3 },
      { text: 'Fluktuatif, terkadang tenang namun sering tergesa-gesa dan kurang fokus.', score: 2 },
      { text: 'Hampa, gelisah, atau dibayangi rasa bersalah dan ketakutan yang tak kunjung reda.', score: 1 },
    ],
  },
  {
    id: 4,
    dimension: 'Dukungan & Ruang Berbagi',
    question: 'Apakah Anda memiliki tempat atau orang yang aman untuk berbagi isi hati tanpa dihakimi?',
    options: [
      { text: 'Ada, sahabat atau keluarga selalu siap mendengar dan memvalidasi perasaan.', score: 3 },
      { text: 'Hanya sebagian kecil yang diceritakan; sisanya saya simpan rapat sendirian.', score: 2 },
      { text: 'Tidak ada sama sekali, saya memikul semua beban dan kesedihan sendirian.', score: 1 },
    ],
  },
  {
    id: 5,
    dimension: 'Manajemen Energi & Istirahat',
    question: 'Bagaimana kualitas tidur dan tingkat kelelahan fisik maupun mental yang Anda rasakan?',
    options: [
      { text: 'Tidur cukup dan teratur, bangun dengan energi yang siap memulai hari.', score: 3 },
      { text: 'Terkadang sulit tidur atau sering terjaga, lelah di sore hari namun masih terkendali.', score: 2 },
      { text: 'Sangat kelelahan (burnout), insomnia berulang, bangun tidur tetap merasa lesu.', score: 1 },
    ],
  },
  {
    id: 6,
    dimension: 'Penerimaan Diri & Ekspektasi',
    question: 'Saat hasil yang dicapai belum sesuai dengan ekspektasi pribadi, apa reaksi Anda?',
    options: [
      { text: 'Memahami bahwa kegagalan adalah proses belajar dan tetap menghargai usaha sendiri.', score: 3 },
      { text: 'Sempat membandingkan diri dengan pencapaian orang lain, meski akhirnya bisa menerima.', score: 2 },
      { text: 'Merasa diri tidak berharga, tenggelam dalam rasa bersalah dan minder berkepanjangan.', score: 1 },
    ],
  },
  {
    id: 7,
    dimension: 'Kejelasan Arah & Harapan',
    question: 'Bagaimana pandangan dan rasa optimisme Anda terhadap langkah masa depan saat ini?',
    options: [
      { text: 'Memiliki visi yang cukup terarah dan optimis melangkah setahap demi setahap.', score: 3 },
      { text: 'Terkadang diliputi keraguan tentang pilihan studi atau karier, namun tetap berjalan.', score: 2 },
      { text: 'Merasa tersesat, masa depan terasa menakutkan, dan bingung harus melangkah ke mana.', score: 1 },
    ],
  },
];

export const assessmentResults: AssessmentResultData[] = [
  {
    range: [17, 21],
    level: 'Jiwa Stabil & Adaptif',
    category: "Fase Nafs Muthma'innah (Hati yang Tenang)",
    body: 'Alhamdulillah, kondisi psikologis dan spiritual Anda saat ini berada dalam ritme yang harmonis dan seimbang. Kemampuan Anda dalam meregulasi emosi dan berserah diri pada ketetapan-Nya berfungsi dengan baik saat menghadapi tantangan hidup.',
    recs: [
      'Pertahankan rutinitas refleksi diri, digital detox, dan waktu hening harian.',
      'Jadikan ketenangan ini sebagai energi positif untuk menyemangati orang-orang di sekitar Anda.',
      'Tetap buka hati jika sewaktu-waktu membutuhkan sudut pandang baru dalam fase hidup selanjutnya.',
    ],
  },
  {
    range: [12, 16],
    level: 'Lelah Mental & Butuh Penjernihan',
    category: 'Fase Nafs Lawwamah (Dinamika Introspektif)',
    body: 'Anda sedang memikul beban pikiran yang cukup berat, sering terjebak dalam overthinking, dan mungkin mulai merasakan kelelahan batin. Ini adalah alarm alami dari tubuh dan jiwa Anda bahwa Anda butuh ruang jeda untuk bernapas.',
    recs: [
      'Kurangi konsumsi media sosial yang memicu kecemasan atau perbandingan sosial.',
      'Luangkan waktu istirahat tanpa rasa bersalah; Anda tidak harus selalu produktif setiap detik.',
      'Sangat disarankan mengambil sesi konseling sebaya untuk mengurai kusutnya pikiran sebelum menjadi burnout.',
    ],
  },
  {
    range: [7, 11],
    level: 'Beban Emosi Tinggi & Butuh Teman Dengar',
    category: 'Fase Membutuhkan Pendampingan Empatis Segera',
    body: 'Batin Anda saat ini berada dalam titik jenuh atau kelelahan emosional yang signifikan. Memendam semua perasaan dan kegelisahan ini sendirian terasa sangat berat dan melelahkan. Anda berhak mendapatkan ruang aman untuk didengar tanpa dihakimi.',
    recs: [
      'Jangan simpan beban ini sendirian lagi; izinkan diri Anda untuk meminta pertolongan.',
      'Jadwalkan sesi bimbingan konseling bersama Amel untuk membedah masalah secara bertahap.',
      'Gunakan Ruang Curhat Anonim jika Anda butuh menumpahkan isi hati terlebih dahulu secara rahasia.',
    ],
  },
];
