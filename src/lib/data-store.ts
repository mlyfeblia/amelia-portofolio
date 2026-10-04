import crypto from 'crypto';
import { revalidatePath } from 'next/cache';
import { db, isDatabaseConfigured } from '@/db';
import { articles, bookings, curhat } from '@/db/schema';
import { desc, eq, and } from 'drizzle-orm';
import { Booking, AnonymousMessage, Article } from '@/types';

// Fallback articles in case of offline/build-time isolation
const fallbackArticles: Article[] = [
  {
    id: 'art-1',
    slug: 'finding-inner-peace-digital-era',
    title: "Cara Menemukan Ketenangan Batin dan Mengatasi Overthinking di Tengah Riuhnya Notifikasi Digital",
    excerpt: "Pernahkah kamu merasa lelah mental padahal seharian hanya menatap layar ponsel? Konsep Thuma'ninah hadir sebagai ruang jeda di tengah riuhnya dunia siber.",
    content: `
Pernahkah kamu merasa energimu terkuras habis padahal seharian hanya duduk menatap layar ponsel? Rasanya pikiran tidak pernah benar-benar istirahat, selalu ada pesan baru yang harus dibalas atau kabar orang lain yang memicu rasa cemas.

Kondisi seperti ini sangat wajar dialami oleh generasi kita saat ini. Kita hidup di tengah banjir informasi yang bergerak jauh lebih cepat daripada kemampuan otak kita untuk memprosesnya secara tenang.

## Memahami Sumber Overthinking di Dunia Maya

Sering kali, overthinking bukan muncul karena kita kekurangan ide atau informasi. Masalah utamanya justru karena sistem saraf kita kelebihan beban (*sensory overload*) akibat terus-menerus membandingkan diri di media sosial.

Ketika melihat linimasa yang dipenuhi pencapaian teman sebaya, otak kita otomatis menyalakan alarm rasa tertinggal (*fear of missing out*). Akibatnya, kita merasa harus terus berlari tanpa pernah memberi ruang bagi hati untuk bernapas.

Dalam psikologi Islam, fenomena hati yang gelisah dan terombang-ambing ini disebut dengan fase *idhthirab*. Hati kehilangan pegangan karena terlalu sibuk merespons stimuli dunia luar yang fana.

### Mengenal Thuma'ninah sebagai Jangkar Diri

Para ulama dan pakar kesehatan mental Islam menjelaskan bahwa ketenangan sejati (*thuma'ninah*) berawal dari kemampuan kita untuk sadar penuh (*mindfulness*) di hadapan Sang Pencipta. Thuma'ninah bukan berarti lari dari masalah hidup, melainkan menemukan titik hening di dalam dada agar kita tidak mudah roboh saat badai datang.

Ketika batin berada dalam keadaan tenang, cara berpikir kita menjadi jauh lebih jernih. Kita bisa membedakan mana hal yang berada di dalam kendali kita dan mana yang sepenuhnya di luar kendali kita.

## Tiga Langkah Sederhana Mengistirahatkan Pikiran

Untuk membangun kembali rasa damai di tengah keseharian yang padat, kamu bisa mencoba tiga langkah praktis berikut ini:

1. **Jadwalkan Digital Fasting Ringan**: Berikan jeda 30 menit sebelum tidur tanpa menatap layar gawai. Ganti kebiasaan *scrolling* larut malam dengan membaca doa reflektif atau menulis jurnal syukur sederhana.
2. **Latihan Pernapasan dan Grounding**: Saat kepalamu mulai terasa penuh, pejamkan mata sejenak dan tarik napas dalam empat hitungan. Hembuskan perlahan sambil mengingat bahwa hari esok sudah ada yang menjamin, tugas kita hanyalah melangkah sebaik mungkin hari ini.
3. **Belajar Melepaskan Tuntutan Sempurna**: Kamu tidak harus membuktikan apa pun kepada algoritma internet. Keberhargaan dirimu tidak ditentukan oleh angka likes, melainkan oleh ketulusan niat dan usahamu untuk terus berbuat baik.

Jika kamu merasa beban pikiranmu sudah terlalu berat untuk dipikul sendirian, jangan ragu untuk berbagi cerita. Meminta bantuan bukanlah tanda kelemahan, melainkan bukti keberanian untuk merawat diri sendiri.
    `,
    category: 'Kesehatan Mental Islami',
    readTime: '5 menit baca',
    publishedAt: '24 September 2026',
    tags: ["Thuma'ninah", 'Overthinking', 'Digital Well-being', 'Tazkiyatun Nafs', 'BKI']
  },
  {
    id: 'art-2',
    slug: 'cbt-and-spiritual-healing-guide',
    title: 'Ketika Logika CBT Bertemu Tazkiyatun Nafs untuk Mengurai Cemas dan Luka Batin Mahasiswa',
    excerpt: 'Bagaimana restrukturisasi pola pikir Cognitive Behavioral Therapy berpadu dengan pembersihan jiwa dalam menyembuhkan luka batin dan kegelisahan masa depan?',
    content: `
Banyak orang mengira bahwa bimbingan konseling hanyalah tempat untuk mendengarkan nasihat normatif. Padahal, konseling yang baik adalah ruang kolaborasi yang aman untuk membedah akar kegelisahanmu dengan cara yang ilmiah sekaligus menyentuh hati.

Di bangku kuliah Bimbingan Konseling Islam, aku belajar bahwa manusia adalah kesatuan utuh antara akal pikiran, emosi, dan ruhani. Memisahkan salah satunya sering kali membuat proses pemulihan terasa kurang lengkap.

## Hubungan Antara Pikiran dan Ketenangan Jiwa

Pendekatan Cognitive Behavioral Therapy (CBT) mengajarkan bahwa penderitaan kita bukan disebabkan oleh peristiwa itu sendiri, melainkan oleh cara kita mengartikan peristiwa tersebut (*cognitive appraisal*). 

Misalnya, saat pesanmu belum dibalas oleh teman atau dosen pembimbing. Pikiran otomatis bisa saja langsung berbisik, "Mereka pasti tidak menyukaiku," padahal faktanya mereka mungkin sedang sibuk atau ada kendala lain.

Dalam tradisi spiritual Islam, pola bisikan negatif yang destruktif ini dikenal sebagai *khawathir as-su'*. Jika dibiarkan berlarut-larut, bisikan ini akan meracuni suasana hati dan melahirkan kecemasan berlebihan.

### Titik Temu CBT dan Konsep Husnudzon

Di sinilah letak keindahan integrasi antara CBT dan tazkiyatun nafs (penyucian jiwa). CBT memberi kita pisau bedah kognitif untuk menguji fakta secara objektif, sedangkan nilai Islam memberikan rasa percaya diri dan prasangka baik (*husnudzon*) kepada rencana Tuhan.

Ketika seorang konseli merasa gagal hanya karena satu ujian yang belum memuaskan, konseling sebaya hadir untuk meluruskan distorsi tersebut. Kita belajar membedakan antara 'peristiwa yang kurang beruntung' dengan 'harga diri sebagai manusia'.

## Cara Melatih Resiliensi Mental Sehari-hari

Untuk melatih pikiran agar lebih tangguh dan tenang dalam menghadapi rintangan, cobalah tips berikut:

- **Tulis Pikiranmu di Atas Kertas**: Menuliskan unek-unek membantu kita melihat masalah dari sudut pandang pengamat luar (*cognitive defusion*).
- **Cek Bukti Nyata**: Tanyakan pada diri sendiri, "Apakah ketakutan terburuk ini benar-benar pasti terjadi, atau ini cuma skenario seram yang dibuat oleh kepalaku?"
- **Perbanyak Muhasabah Tanpa Menghakimi**: Bersikaplah ramah kepada diri sendiri sebagaimana kamu memperlakukan sahabat terbaikmu yang sedang terluka.

Kamu berhak mendapatkan ruang dengar yang tulus tanpa perlu takut dihakimi. Setiap proses bertumbuh butuh waktu, dan tidak apa-apa jika hari ini kamu baru bisa melangkah perlahan.
    `,
    category: 'Kajian Konseling',
    readTime: '6 menit baca',
    publishedAt: '18 September 2026',
    tags: ['CBT', 'Tazkiyatun Nafs', 'Kesehatan Mental', 'Konselor Sebaya']
  },
  {
    id: 'art-3',
    slug: 'cyber-counseling-ethics-privacy-guide',
    title: 'Etika Cyber Counseling dan Rahasia Menjaga Ruang Dengar Aman Tanpa Takut Dihakimi',
    excerpt: 'Bercerita lewat layar sering terasa lebih melegakan bagi generasi digital. Inilah komitmen etika kerahasiaan dan kenyamanan konseling daring bersama Amel.',
    content: `
Bagi banyak anak muda zaman sekarang, masuk ke ruangan konseling fisik bisa terasa sangat menegangkan. Ada ketakutan terlihat oleh orang lain, rasa canggung berhadapan langsung, atau takut dinilai sebagai orang yang bermasalah.

Kehadiran cyber counseling membuka pintu alternatif yang jauh lebih ramah dan mudah dijangkau. Lewat percakapan daring yang nyaman, siapa pun bisa mulai membuka cerita dari kamar mereka sendiri.

## Mengapa Konseling Daring Terasa Begitu Nyaman?

Bercerita lewat media daring memberikan rasa aman bertingkat (*graded exposure*). Kamu punya kendali penuh atas caramu mengekspresikan perasaan, baik melalui panggilan video santai maupun ketikan pesan yang mendalam.

Bagi mereka yang kesulitan berbicara secara langsung saat emosinya meluap, menuliskan isi hati menjadi terapi tersendiri. Proses merangkai kata membantu menata kembali benang kusut yang selama ini bersarang di kepala.

Selain itu, jarak geografis bukan lagi menjadi penghalang. Teman-teman dari berbagai daerah di luar Cirebon tetap bisa mendapatkan pendampingan yang hangat dan terarah.

### Amanah Kerahasiaan Adalah Pondasi Utama

Pertanyaan yang paling sering muncul adalah: "Apakah ceritaku benar-benar aman dan tidak akan bocor?"

Jawabannya adalah pasti aman. Dalam kode etik bimbingan konseling, kerahasiaan (*confidentiality*) bukanlah sekadar aturan formal, melainkan janji amanah yang harus dijaga sampai kapan pun.

Setiap catatan sesi disimpan dengan pengamanan ketat, dan nama konseli selalu disamarkan jika dijadikan bahan pembelajaran kasus. Kepercayaan yang kamu titipkan adalah kehormatan bagi seorang konselor.

## Menyiapkan Sesi Daring Pertamamu

Jika ini pertama kalinya kamu ingin mencoba sesi konseling virtual, kamu bisa menyiapkan beberapa hal sederhana ini:

1. **Pilih Ruangan yang Privat**: Pastikan kamu berada di tempat yang tenang agar bisa berbicara atau mengetik dengan leluasa tanpa khawatir terdengar orang lain.
2. **Koneksi Internet yang Stabil**: Gunakan jaringan internet yang lancar agar obrolan kita tidak terputus di tengah cerita penting.
3. **Lepaskan Ekspektasi yang Kaku**: Kamu tidak perlu menyusun kata-kata yang rapi atau formal. Ceritakan saja apa adanya dengan gayamu sendiri.

Ruang konseling bersama Amel selalu terbuka untuk mendengarkan setiap keluh kesahmu. Mari luapkan perlahan, karena kamu tidak harus memikul semuanya sendirian.
    `,
    category: 'Cyber Counseling',
    readTime: '5 menit baca',
    publishedAt: '10 September 2026',
    tags: ['Cyber Counseling', 'Safe Space', 'Etika Konseling', 'Generasi Digital']
  },
  {
    id: 'art-4',
    slug: 'overcoming-academic-burnout-student-guide',
    title: 'Langkah Praktis Mengatasi Academic Burnout dan Rasa Bersalah Saat Istirahat bagi Mahasiswa',
    excerpt: 'Sering merasa bersalah saat rebahan padahal tubuh sudah berteriak kelelahan? Kenali perbedaan antara malas biasa dengan academic burnout yang butuh penanganan tepat.',
    content: `
Pernahkah kamu memaksakan diri membuka laptop untuk mengerjakan tugas kuliah, tapi yang terjadi hanyalah menatap layar kosong selama berjam-jam? Tubuhmu lelah luar biasa, tapi saat mencoba rebahan santai, pikiranmu justru dihantui rasa bersalah yang menusuk.

Jika situasi ini terasa sangat akrab, kamu mungkin bukan sedang malas, melainkan sedang mengalami apa yang disebut dengan *academic burnout*.

## Membedakan Malas Biasa dengan Burnout Nyata

Banyak mahasiswa merasa malu karena mengira dirinya tidak punya motivasi belajar. Padahal, malas dan burnout adalah dua kondisi yang sangat berbeda secara psikologis.

Orang yang malas biasanya menikmati waktu santainya tanpa beban mental. Sebaliknya, orang yang mengalami burnout tetap merasa cemas dan tegang bahkan saat tubuhnya sedang tidak melakukan apa pun.

Kelelahan kronis ini muncul karena otak kita terus dipaksa beroperasi di mode siaga tinggi tanpa jeda pemulihan yang cukup. Tuntutan tugas, ujian, dan ekspektasi masa depan menguras seluruh cadangan energimu.

### Menghapus Toxic Guilt Saat Rehat

Budaya serba sibuk (*hustle culture*) sering kali menanamkan ilusi beracun bahwa manusia hanya bernilai jika terus-menerus produktif. Akibatnya, istirahat dianggap sebagai dosa atau kelemahan.

Ingatlah prinsip kesehatan jiwa yang diajarkan dalam Islam: tubuh dan jiwamu memiliki hak atas dirimu untuk diistirahatkan (*Inna linafsika 'alaika haqqa*). 

Beristirahat bukanlah hadiah yang baru boleh diambil setelah kamu kelelahan parah. Istirahat adalah bagian wajib dari siklus kerja agar kamu bisa kembali berfungsi secara optimal.

## Strategi Praktis Memulihkan Energi Belajar

Untuk keluar dari jeratan burnout tanpa rasa bersalah, mulailah dengan langkah-langkah ramah berikut:

- **Beri Izin Istirahat Tanpa Syarat**: Jadwalkan satu blok waktu khusus di mana kamu benar-benar bebas dari urusan akademis tanpa merasa bersalah.
- **Pecah Tugas Jadi Porsi Kecil**: Jangan memikirkan seluruh skripsi atau tugas akhir sekaligus. Cukup targetkan menulis satu paragraf atau membaca satu lembar hari ini.
- **Bicara dengan Orang yang Mengerti**: Luapkan unek-unekmu kepada teman yang suportif atau konselor sebaya yang siap mendengarkan tanpa menghakimi.

Jangan menunggu energimu habis sampai titik nol baru mencari pertolongan. Pulihkan jiwamu perlahan, karena kesehatan mentalmu jauh lebih berharga daripada nilai di atas kertas.
    `,
    category: 'Pengembangan Diri',
    readTime: '5 menit baca',
    publishedAt: '28 September 2026',
    tags: ['Academic Burnout', 'Self Compassion', 'Tips Mahasiswa', 'Manajemen Stres']
  },
  {
    id: 'art-5',
    slug: 'managing-social-anxiety-campus-life',
    title: 'Seni Menjinakkan Kecemasan Sosial dan Membangun Rasa Percaya Diri di Lingkungan Kampus',
    excerpt: 'Merasa cemas saat harus presentasi atau berbaur di organisasi kampus? Simak panduan konseling sebaya untuk melatih rasa percaya diri tanpa kehilangan jati diri.',
    content: `
Pernahkah kamu merasa jantung berdegup kencang saat nama kamu dipanggil untuk berbicara di depan kelas? Tangan terasa dingin, suara bergetar, dan pikiran seketika menjadi kosong melompong.

Bagi banyak mahasiswa, lingkungan kampus bisa terasa mengintimidasi. Tuntutan presentasi, kerja kelompok, dan dinamika organisasi sering kali memicu kecemasan sosial yang melelahkan.

## Memahami Sinyal Kecemasan Sosial

Kecemasan sosial (*social anxiety*) bukan berarti kamu orang yang aneh atau penakut. Ini adalah respons perlindungan alami dari sistem saraf kita yang salah membaca situasi sosial sebagai ancaman fisik.

Otak kita terlalu khawatir akan kemungkinan dihakimi, ditertawakan, atau dinilai kurang kompeten oleh teman sebaya. Padahal faktanya, sebagian besar orang di ruangan tersebut terlalu sibuk memikirkan diri mereka sendiri.

Dalam pandangan konseling sebaya, langkah awal mengatasi kecemasan bukanlah memusuhi rasa gugup tersebut, melainkan belajar mengenali pemicunya secara tenang.

### Tiga Latihan Praktis Sebelum Tampil

Berikut beberapa latihan sederhana yang bisa kamu terapkan sebelum berbicara di depan umum atau mengikuti diskusi kelompok:

1. **Latihan Pernapasan Diafragma 4-7-8**: Tarik napas melalui hidung dalam empat hitungan, tahan selama tujuh hitungan, lalu hembuskan perlahan melalui bibir selama delapan hitungan. Ini membantu mengaktifkan sistem saraf parasimpatis agar denyut jantung kembali stabil.
2. **Ubah Fokus dari Diri ke Pesan**: Alih-alih mencemaskan "Bagaimana pandangan orang tentang penampilanku?", fokuskan pikiranmu pada "Informasi bermanfaat apa yang bisa aku bagikan kepada teman-temanku hari ini?".
3. **Terima Ketidaksempurnaan dengan Senyuman**: Sedikit salah ucap atau terselip kata adalah hal yang sangat manusiawi. Audiens tidak mengharapkan robot yang tanpa cela, melainkan manusia yang autentik.

Kepercayaan diri bukanlah sesuatu yang muncul dalam semalam. Ini adalah otot keberanian yang dilatih setahap demi setahap melalui pengalaman nyata.

Jika rasa cemasmu terasa sangat mengganggu keseharian dan membuatmu menarik diri dari pergaulan, ruang konseling bersama Amel selalu siap mendampingi prosesmu.
    `,
    category: 'Kepercayaan Diri',
    readTime: '5 menit baca',
    publishedAt: '29 September 2026',
    tags: ['Social Anxiety', 'Percaya Diri', 'Tips Mahasiswa', 'Konselor Sebaya']
  },
  {
    id: 'art-6',
    slug: 'navigating-quarter-life-crisis-islamic-perspective',
    title: 'Menavigasi Quarter-Life Crisis dengan Perspektif Islam dan Refleksi Maqashid Hidup',
    excerpt: 'Memasuki usia 20-an sering kali diwarnai kebingungan arah masa depan dan karier. Bagaimana nilai Islam memandu kita melewati fase pencarian jati diri ini?',
    content: `
Memasuki usia dua puluhan sering kali membawa gelombang tanda tanya besar. "Apakah jurusan yang kupilih sudah tepat?", "Bagaimana masa depanku setelah lulus?", dan "Mengapa orang lain tampak jauh lebih mapan daripada aku?".

Kondisi psikologis ini dikenal dengan istilah *quarter-life crisis*. Rasa bimbang, cemas akan masa depan, dan perbandingan diri menjadi makanan sehari-hari yang menguras batin.

## Titik Temu Krisis Usia dan Fase Pencarian Makna

Dalam psikologi perkembangan, krisis ini adalah jembatan transisi dari masa remaja menuju kedewasaan penuh. Wajar jika jembatan tersebut bergoyang dan membuat langkah terasa gamang.

Perspektif Islam memandang fase kebimbangan ini sebagai momentum emas untuk bermuhasabah (*self-reflection*). Ini adalah saat di mana seseorang mulai mempertanyakan tujuan hakiki dari kehidupannya di dunia.

Kecemasan sering kali memuncak saat kita mencoba mengontrol hal-hal yang sepenuhnya berada dalam ketetapan Allah, seperti rezeki, waktu kesuksesan, dan takdir masa depan.

### Menyelaraskan Ikhtiar dan Konsep Tawakkal

Untuk meredakan kegelisahan di fase transisi ini, ada tiga prinsip hikmah yang dapat menjadi panduan hidupmu:

- **Fokus pada Usaha Hari Ini**: Kewajiban kita hanyalah berikhtiar dengan sungguh-sungguh pada hari ini. Hasil akhir dan waktu terkabulnya doa adalah hak prerogatif Sang Pencipta.
- **Setiap Orang Memiliki Garis Waktu Sendiri**: Bunga mawar dan bunga melati mekar di musim yang berbeda. Keberhasilan teman sebayamu tidak pernah mengurangi jatah rezeki yang telah disiapkan untukmu.
- **Libatkan Allah dalam Setiap Perencanaan**: Awali setiap langkah dengan niat ibadah dan sholat istikharah. Hati yang bersandar pada Dzat Yang Maha Kuasa tidak akan pernah merasa hampa.

Kamu tidak perlu memiliki semua jawaban untuk sepuluh tahun ke depan hari ini. Cukup ambil satu langkah baik berikutnya, dan biarkan pintu-pintu kemudahan terbuka satu per satu.

Bila kamu butuh teman diskusi yang hangat untuk memetakan minat dan arah kariermu, mari jadwalkan sesi bimbingan bersama Amel.
    `,
    category: 'Kesehatan Mental Islami',
    readTime: '6 menit baca',
    publishedAt: '26 September 2026',
    tags: ['Quarter-Life Crisis', 'Tazkiyatun Nafs', 'Tawakkal', 'Arah Hidup']
  },
  {
    id: 'art-7',
    slug: 'active-listening-safe-space-peer-counseling',
    title: 'Kekuatan Mendengarkan Tanpa Menghakimi: Seni Menjadi Teman Cerita yang Menenangkan',
    excerpt: 'Sering kali orang yang bercerita tidak butuh disuguhi rentetan solusi instan, melainkan telinga yang tulus mendengar dan hati yang memvalidasi perasaannya.',
    content: `
Pernahkah kamu menceritakan beban hidupmu kepada seseorang, namun yang kamu dapatkan hanyalah kalimat "Ah, kamu kurang bersyukur" atau "Masalahmu belum seberapa dibanding masalahku"?

Bukannya merasa lega, respons seperti itu justru membuat hati semakin terluka dan menutup diri rapat-rapat. Kita merasa perasaan kita disepelekan dan tidak dihargai.

## Mengapa Hadir Sepenuhnya Jauh Lebih Berharga?

Dalam keterampilan konseling sebaya, kemampuan mendengarkan secara aktif (*active listening*) adalah pondasi paling mendasar. Mendengar aktif bukan sekadar menangkap suara, melainkan hadir secara utuh bersama orang yang sedang bercerita.

Ketika seseorang sedang rapuh, mereka biasanya tidak membutuhkan kuliah nasihat atau daftar solusi teknis. Kebutuhan terdalam mereka adalah validasi: merasa dilihat, didengar, dan dimengerti keberadaannya.

Mendengarkan dengan penuh empati menciptakan ruang aman (*safe space*) di mana konseli merasa diterima tanpa takut akan penghakiman moral.

### Tiga Kunci Menjadi Teman Dengar yang Baik

Jika kamu ingin menjadi sahabat yang nyaman untuk berbagi cerita bagi orang-orang di sekitarmu, latihlah tiga hal ini:

1. **Tahan Keinginan Memotong dan Menghakimi**: Biarkan sahabatmu menuntaskan ceritanya sampai selesai. Berikan jeda hening agar mereka bisa memproses emosi di dalam dada.
2. **Validasi Emosi yang Muncul**: Gunakan kalimat sederhana seperti "Aku paham ini pasti sangat berat untukmu" atau "Terima kasih sudah mau berbagi cerita yang tidak mudah ini kepadaku".
3. **Jaga Kerahasiaan Secara Utuh**: Jangan pernah menjadikan cerita rahasia sahabatmu sebagai bahan obrolan dengan orang lain. Kepercayaan yang rusak sangat sulit untuk dibangun kembali.

Menjadi pendengar yang baik adalah bentuk sedekah batin yang sangat luhur. Lewat telinga yang tulus dan tatapan yang hangat, kita membantu meringankan beban saudara kita.

Di ruang konseling Amelia, setiap cerita dijaga kerahasiaannya dengan komitmen etika profesi yang amanah dan penuh kasih sayang.
    `,
    category: 'Kajian Konseling',
    readTime: '5 menit baca',
    publishedAt: '22 September 2026',
    tags: ['Active Listening', 'Empati', 'Peer Counselor', 'Komunikasi']
  },
  {
    id: 'art-8',
    slug: 'rest-and-mindfulness-in-islamic-tradition',
    title: "Konsep Istirahat Berkualitas dan Thuma'ninah dalam Tradisi Kesehatan Mental Islam",
    excerpt: 'Istirahat bukan tanda kelemahan, melainkan hak tubuh dan ruhani yang diwajibkan syariat. Mengapa meluangkan waktu hening adalah bagian dari ketaatan?',
    content: `
Di era serba cepat ini, kelelahan seakan-akan dianggap sebagai lencana kehormatan. Semakin sibuk seseorang dan semakin sedikit waktu tidurnya, semakin ia dipuji sebagai sosok yang pekerja keras.

Namun ironisnya, tubuh dan jiwa manusia tidak dirancang untuk terus dipacu tanpa batas. Ketika mesin batin dipaksa bekerja non-stop, yang tersisa hanyalah kejenuhan kronis dan hilangnya makna hidup.

## Istirahat Sebagai Perintah Syariat

Banyak orang lupa bahwa dalam ajaran Islam, beristirahat bukanlah dosa, melainkan bagian dari kewajiban menjaga amanah tubuh (*hifz an-nafs*).

Rasulullah SAW mengingatkan bahwa tubuhmu memiliki hak atas dirimu (*Inna linafsika 'alaika haqqa*). Menolak untuk beristirahat saat tubuh sudah sakit adalah bentuk pengabaian terhadap nikmat kesehatan yang dititipkan.

Bahkan dalam ritme ibadah sholat lima waktu, terselip hikmah jeda berkala agar manusia berhenti sejenak dari hiruk-pikuk duniawi untuk menyambung kembali tali ruhaninya.

### Mengintegrasikan Thuma'ninah dalam Keseharian

Ketenangan batin (*thuma'ninah*) dapat kita latih setiap hari melalui praktik-praktik yang meneduhkan:

- **Hadir Utuh di Setiap Waktu Sholat**: Jadikan sholat sebagai oase pelepas lelah, bukan sekadar kewajiban yang harus cepat-cepat dituntaskan. Hayati setiap gerakan ruku dan sujud sebagai momen berserah diri.
- **Batasi Polusi Suara dan Informasi**: Luangkan waktu sepuluh menit setiap pagi atau sore hari untuk duduk dalam keheningan tanpa ponsel. Biarkan pikiranmu mengendap secara alami.
- **Penuhi Kebutuhan Tidur Tanpa Beban**: Niatkan tidur malam sebagai ikhtiar mengumpulkan energi agar esok hari bisa beribadah dan menebar kebaikan dengan lebih maksimal.

Merawat diri sendiri adalah prasyarat utama sebelum kamu bisa menolong orang lain. Kamu tidak bisa menuangkan air dari teko yang kosong.

Jika kamu merasa lelah yang berkepanjangan dan butuh ruang tenang untuk menyusun kembali ritme hidupmu, Amelia siap menemani langkahmu.
    `,
    category: 'Kesehatan Mental Islami',
    readTime: '5 menit baca',
    publishedAt: '15 September 2026',
    tags: ["Thuma'ninah", 'Mindfulness', 'Self Care', 'Istirahat Berkualitas']
  }
];

// Fallback Bookings for offline/demo/unconfigured database state
const fallbackBookings: Booking[] = [
  {
    id: 'bk-1790581539331',
    code: 'BKI-2609-227',
    name: 'Ahmad Fauzi',
    alias: 'Fauzi',
    phone: '081299887766',
    email: 'fauzi@example.com',
    category: 'Krisis Identitas Diri & Quarter-Life Crisis',
    mode: 'online_meet',
    date: '2026-10-05',
    timeSlot: '16:00 - 17:00 WIB',
    notes: 'Menemukan arah hidup setelah lulus semester ini.',
    status: 'menunggu',
    createdAt: '2026-09-28T07:45:39.331Z',
  },
  {
    id: 'bk-1',
    code: 'BKI-2609-001',
    name: 'Rahmat Hidayat',
    alias: 'Rahmat',
    phone: '081234567890',
    email: 'rahmat@example.com',
    category: 'Akademik & Karier',
    mode: 'online_meet',
    date: '2026-09-30',
    timeSlot: '15:30 - 16:30 WIB',
    notes: 'Konsultasi seputar kebimbangan memilih topik riset dan adaptasi perkuliahan.',
    status: 'terkonfirmasi',
    createdAt: '2026-09-26T10:00:00Z',
  },
  {
    id: 'bk-2',
    code: 'BKI-2609-002',
    name: 'Siti Nurhaliza',
    alias: 'Siti',
    phone: '085712345678',
    email: 'siti@example.com',
    category: 'Manajemen Stres & Kecemasan',
    mode: 'online_chat',
    date: '2026-10-02',
    timeSlot: '19:30 - 20:30 WIB',
    notes: 'Ingin berbagi cerita tentang adaptasi lingkungan kos dan menjaga ketenangan pikiran.',
    status: 'menunggu',
    createdAt: '2026-09-27T14:30:00Z',
  },
];

// Fallback Curhat for offline/demo/unconfigured database state
const fallbackCurhat: AnonymousMessage[] = [
  {
    id: 'cur-1',
    alias: 'Bunga di Ujung Jalan',
    category: 'Quarter-Life Crisis',
    message: 'Kak Amel, saya mahasiswa tingkat akhir dan merasa tertinggal jauh dari teman-teman yang sudah kerja dan mandiri finansial. Rasanya setiap bangun pagi dada sesak dan takut gagal membahagiakan orang tua. Bagaimana cara meredam rasa rendah diri ini ya kak?',
    answer: 'Halo sahabat yang baik. Perasaanmu sangat valid dan manusiawi. Namun ingat, hidup bukanlah perlombaan lari cepat dengan satu garis finis yang sama. Allah menetapkan maqom (kedudukan) dan waktu mekar setiap bunga secara unik. Fokuslah pada langkah kecil yang bisa kamu ambil hari ini. Kamu tidak terlambat, kamu sedang ditempa. Jangan biarkan layar media orang lain meredupkan cahaya prosesmu sendiri ya.',
    isAnswered: true,
    isPublic: true,
    createdAt: '2026-09-22T09:30:00Z',
    answeredAt: '2026-09-22T14:15:00Z',
  },
  {
    id: 'cur-2',
    alias: 'Hamba Allah - Cirebon',
    category: 'Kecemasan & Ibadah',
    message: 'Saya sering sekali merasa cemas berlebihan sampai susah khusyuk saat sholat. Pikiran selalu loncat ke skripsi dan masalah keluarga. Apakah ini tanda iman saya lemah kak Amel?',
    answer: 'Sama sekali bukan pertanda imanmu lemah, sahabat. Kecemasan adalah sinyal biologis dan psikologis bahwa sistem sarafmu sedang kelebihan beban (overstimulated). Ketika pikiran melayang dalam sholat, jangan mencela dirimu. Tarik nafas lembut, sadari bahwa kamu sedang menghadap Sang Maha Penyayang, dan perlahan kembalikan fokus pada bacaan. Ibadah dalam keadaan berjuang melawan rasa cemas justru memiliki nilai kesabaran yang sangat mulia di mata Allah.',
    isAnswered: true,
    isPublic: true,
    createdAt: '2026-09-25T11:20:00Z',
    answeredAt: '2026-09-25T16:00:00Z',
  },
  {
    id: 'cur-3',
    alias: 'Pejuang Skripsi',
    category: 'Akademik & Burnout',
    message: 'Kak, bagaimana membedakan antara rasa malas biasa dengan kelelahan mental (burnout)? Rasanya ingin istirahat tapi merasa bersalah terus.',
    answer: 'Rasa bersalah saat istirahat adalah tanda khas burnout! Malas biasanya disertai rasa santai, sedangkan burnout tetap dipenuhi kecemasan meskipun tubuh sedang tidak mengerjakan apa-apa. Tubuh dan jiwamu memiliki hak untuk beristirahat ("Inna linafsika \'alaika haqqa"). Berikan dirimu izin beristirahat tanpa syarat selama 1 hari penuh untuk mengisi ulang baterai jiwamu.',
    isAnswered: true,
    isPublic: true,
    createdAt: '2026-09-27T08:10:00Z',
    answeredAt: '2026-09-27T10:45:00Z',
  },
  {
    id: 'cur-4',
    alias: 'Mahasiswa Rantau',
    category: 'Adaptasi & Hubungan Sosial',
    message: 'Kak Amel, ini tahun pertama saya merantau kuliah di Cirebon. Rasanya sepi sekali, susah berbaur dengan teman sekelas karena kendala bahasa dan budaya. Setiap malam rindu rumah sampai menangis. Gimana cara menguatkan hati ya kak?',
    answer: 'Peluk hangat untukmu, sahabat perantau. Rasa rindu rumah (homesick) adalah tanda betapa berharganya kehangatan keluarga bagimu, bukan tanda kelemahan. Beri dirimu waktu beradaptasi secara bertahap. Mulailah dari sapaan kecil kepada satu teman di sebelahmu. Cirebon kota yang ramah dan penuh berkah; perlahan tempat ini juga akan menjadi rumah kedua bagimu. Kamu tidak sendirian, pintu ruang curhat Amel selalu terbuka.',
    isAnswered: true,
    isPublic: true,
    createdAt: '2026-09-28T13:15:00Z',
    answeredAt: '2026-09-28T16:30:00Z',
  },
  {
    id: 'cur-5',
    alias: 'Jiwa yang Gelisah',
    category: 'Karier & Ekspektasi Diri',
    message: 'Saya merasa terjebak di jurusan yang bukan minat saya demi menyenangkan orang tua. Sekarang di semester 5 nilai mulai turun dan kehilangan motivasi belajar total. Mau bicara jujur takut dicap anak durhaka kak.',
    answer: 'Dilema antara bakti dan panggilan jiwa memang salah satu ujian terberat mahasiswa. Berbicara jujur dengan bahasa yang santun (qaulan layyina) bukanlah kedurhakaan, melainkan bentuk ikhtiar mencari jalan keluar bersama. Sering kali orang tua menuntut bukan karena ingin mengekang, melainkan karena khawatir akan masa depanmu. Kita bisa bersama-sama menyusun cara komunikasi asertif agar niat baikmu tersampaikan tanpa melukai hati mereka.',
    isAnswered: true,
    isPublic: true,
    createdAt: '2026-09-29T10:40:00Z',
    answeredAt: '2026-09-29T14:20:00Z',
  },
  {
    id: 'cur-6',
    alias: 'Sahabat Pendiam',
    category: 'Kepercayaan Diri & Kecemasan',
    message: 'Setiap ada tugas presentasi di kelas, jantung saya berdegup kencang, tangan dingin, dan suara bergetar sampai blank. Saya merasa minder karena teman-teman lain terlihat begitu percaya diri saat berbicara di depan umum.',
    answer: 'Kecemasan berbicara di depan umum (glossophobia) dialami oleh lebih dari 70% orang, termasuk mereka yang tampak tenang di luar. Kuncinya bukan menghilangkan rasa gugup seketika, melainkan berteman dengan rasa gugup tersebut. Cobalah teknik relaksasi pernapasan 4-7-8 sebelum maju, dan ingat bahwa audiens tidak sedang mengincarmu untuk mencari kesalahan. Langkah kecil latihan mandiri akan membantumu bertumbuh setahap demi setahap.',
    isAnswered: true,
    isPublic: true,
    createdAt: '2026-09-30T09:10:00Z',
    answeredAt: '2026-09-30T11:50:00Z',
  },
  {
    id: 'cur-7',
    alias: 'Pencari Ketenangan',
    category: 'Trauma & Pemulihan Batin',
    message: 'Kak Amel, saya punya luka batin masa lalu akibat perlakuan teman sekolah yang merundung (bully). Sampai sekarang rasa dendam dan trauma itu sering muncul tiba-tiba saat melihat hal serupa. Bagaimana cara benar-benar berdamai dan ikhlas ya kak?',
    answer: 'Memaafkan bukan berarti membenarkan tindakan orang yang melukaimu, melainkan melepaskan belenggu racun dendam dari dalam hatimu sendiri. Luka batin membutuhkan proses penyembuhan yang bertahap, persis seperti luka fisik. Jangan paksa dirimu untuk langsung merasa ikhlas jika hati masih perih. Akui rasa sakit itu di hadapan Allah dalam sujudmu, lalu serahkan keadilan kepada-Nya. Jiwamu terlalu berharga untuk terus memikul beban kesalahan orang lain.',
    isAnswered: true,
    isPublic: true,
    createdAt: '2026-10-01T08:25:00Z',
    answeredAt: '2026-10-01T12:00:00Z',
  },
  {
    id: 'cur-8',
    alias: 'Pejuang Hening',
    category: 'Digital Well-being',
    message: 'Saya merasa lelah mental setiap kali buka media sosial. Melihat teman-teman magang di perusahaan besar, ikut lomba sana-sini, rasanya diri ini tidak ada apa-apanya dan hidup berjalan di tempat.',
    answer: 'Media sosial adalah panggung etalase di mana orang hanya memajang momen terbaiknya, bukan proses jatuh bangun di belakang layar. Membandingkan proses aslimu dengan highlight orang lain adalah jebakan yang tidak adil bagi dirimu sendiri. Cobalah berpuasa media sosial selama akhir pekan. Fokus pada satu keterampilan kecil yang ingin kamu asah hari ini. Ukuran keberhasilanmu adalah dirimu kemarin, bukan feed orang lain.',
    isAnswered: true,
    isPublic: true,
    createdAt: '2026-10-01T15:00:00Z',
    answeredAt: '2026-10-01T18:30:00Z',
  },
];

function revalidateDataPaths(types: ('bookings' | 'curhat' | 'articles')[]) {
  try {
    if (types.includes('bookings')) {
      revalidatePath('/schedule');
      revalidatePath('/admin/bookings');
      revalidatePath('/admin');
    }
    if (types.includes('curhat')) {
      revalidatePath('/counseling');
      revalidatePath('/admin/counseling');
      revalidatePath('/admin');
      revalidatePath('/');
    }
    if (types.includes('articles')) {
      revalidatePath('/articles');
      revalidatePath('/admin/articles');
      revalidatePath('/admin');
      revalidatePath('/');
      revalidatePath('/sitemap.xml');
    }
  } catch {
    // Safe to ignore outside active request context
  }
}

// Bookings
export async function getBookings(limit: number = 100, offset: number = 0): Promise<Booking[]> {
  if (isDatabaseConfigured && db) {
    try {
      const safeLimit = Math.min(Math.max(1, limit), 200);
      const safeOffset = Math.max(0, offset);
      const rows = await db
        .select()
        .from(bookings)
        .orderBy(desc(bookings.createdAt))
        .limit(safeLimit)
        .offset(safeOffset);
      if (rows && rows.length > 0) {
        return rows.map((r) => ({
          ...r,
          alias: r.alias ?? undefined,
          notes: r.notes ?? '',
        })) as Booking[];
      }
    } catch (error) {
      console.error('Error in getBookings from db, falling back to in-memory store:', error);
    }
  }
  return fallbackBookings.slice(offset, offset + limit);
}

export async function createBooking(
  data: Omit<Booking, 'id' | 'code' | 'createdAt' | 'status'>
): Promise<Booking> {
  const dateStr = new Date().toISOString().slice(2, 7).replace('-', '');
  const id = `bk-${crypto.randomUUID()}`;
  const createdAt = new Date().toISOString();
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  const code = `BKI-${dateStr}-${randomSuffix}`;

  const newBooking: Booking = {
    id,
    code,
    name: data.name,
    alias: data.alias || undefined,
    phone: data.phone,
    email: data.email,
    category: data.category,
    mode: data.mode,
    date: data.date,
    timeSlot: data.timeSlot,
    notes: data.notes || '',
    status: 'menunggu',
    createdAt,
  };

  if (isDatabaseConfigured && db) {
    try {
      const [newRow] = await db
        .insert(bookings)
        .values({
          id,
          code,
          name: data.name,
          alias: data.alias || null,
          phone: data.phone,
          email: data.email,
          category: data.category,
          mode: data.mode,
          date: data.date,
          timeSlot: data.timeSlot,
          notes: data.notes || '',
          status: 'menunggu',
          createdAt,
        })
        .returning();

      if (newRow) {
        const result = {
          ...newRow,
          alias: newRow.alias ?? undefined,
          notes: newRow.notes ?? '',
        } as Booking;
        fallbackBookings.unshift(result);
        revalidateDataPaths(['bookings']);
        return result;
      }
    } catch (err) {
      console.error('Database insert failed in createBooking, falling back to in-memory store:', err);
    }
  }

  fallbackBookings.unshift(newBooking);
  revalidateDataPaths(['bookings']);
  return newBooking;
}

export async function updateBookingStatus(
  id: string,
  status: Booking['status']
): Promise<Booking | null> {
  let updatedBooking: Booking | null = null;

  if (isDatabaseConfigured && db) {
    try {
      const [updated] = await db
        .update(bookings)
        .set({ status })
        .where(eq(bookings.id, id))
        .returning();

      if (updated) {
        updatedBooking = {
          ...updated,
          alias: updated.alias ?? undefined,
          notes: updated.notes ?? '',
        } as Booking;
      }
    } catch (error) {
      console.error('Error in updateBookingStatus in db:', error);
    }
  }

  const idx = fallbackBookings.findIndex((b) => b.id === id);
  if (idx !== -1) {
    fallbackBookings[idx].status = status;
    if (!updatedBooking) {
      updatedBooking = fallbackBookings[idx];
    }
  }

  if (updatedBooking) {
    revalidateDataPaths(['bookings']);
  }

  return updatedBooking;
}

export async function deleteBooking(id: string): Promise<boolean> {
  let deleted = false;

  if (isDatabaseConfigured && db) {
    try {
      const [res] = await db.delete(bookings).where(eq(bookings.id, id)).returning();
      if (res) deleted = true;
    } catch (error) {
      console.error('Error in deleteBooking in db:', error);
    }
  }

  const idx = fallbackBookings.findIndex((b) => b.id === id);
  if (idx !== -1) {
    fallbackBookings.splice(idx, 1);
    deleted = true;
  }

  if (deleted) {
    revalidateDataPaths(['bookings']);
  }

  return deleted;
}

// Curhat / Anonymous Q&A
export async function getCurhatList(
  onlyPublic: boolean = false,
  limit: number = 100,
  offset: number = 0
): Promise<AnonymousMessage[]> {
  if (isDatabaseConfigured && db) {
    try {
      const safeLimit = Math.min(Math.max(1, limit), 200);
      const safeOffset = Math.max(0, offset);

      const rows = onlyPublic
        ? await db
            .select()
            .from(curhat)
            .where(eq(curhat.isPublic, true))
            .orderBy(desc(curhat.createdAt))
            .limit(safeLimit)
            .offset(safeOffset)
        : await db
            .select()
            .from(curhat)
            .orderBy(desc(curhat.createdAt))
            .limit(safeLimit)
            .offset(safeOffset);

      if (rows && rows.length > 0) {
        return rows.map((r) => ({
          ...r,
          answer: r.answer ?? undefined,
          answeredAt: r.answeredAt ?? undefined,
        })) as AnonymousMessage[];
      }
    } catch (error) {
      console.error('Error in getCurhatList from db:', error);
    }
  }

  const filtered = onlyPublic ? fallbackCurhat.filter((c) => c.isPublic) : fallbackCurhat;
  return filtered.slice(offset, offset + limit);
}

export async function createCurhat(data: {
  alias: string;
  category: string;
  message: string;
  isPublic: boolean;
}): Promise<AnonymousMessage> {
  const id = `cur-${crypto.randomUUID()}`;
  const createdAt = new Date().toISOString();
  const newCurhat: AnonymousMessage = {
    id,
    alias: data.alias || 'Teman Curhat',
    category: data.category || 'Umum',
    message: data.message,
    isAnswered: false,
    isPublic: data.isPublic,
    createdAt,
  };

  if (isDatabaseConfigured && db) {
    try {
      const [newRow] = await db
        .insert(curhat)
        .values({
          id,
          alias: data.alias || 'Teman Curhat',
          category: data.category || 'Umum',
          message: data.message,
          isAnswered: false,
          isPublic: data.isPublic,
          createdAt,
        })
        .returning();

      if (newRow) {
        const result = {
          ...newRow,
          answer: newRow.answer ?? undefined,
          answeredAt: newRow.answeredAt ?? undefined,
        } as AnonymousMessage;
        fallbackCurhat.unshift(result);
        revalidateDataPaths(['curhat']);
        return result;
      }
    } catch (err) {
      console.error('Database insert failed in createCurhat:', err);
    }
  }

  fallbackCurhat.unshift(newCurhat);
  revalidateDataPaths(['curhat']);
  return newCurhat;
}

export async function updateCurhat(
  id: string,
  options: {
    answer?: string;
    isPublic?: boolean;
  }
): Promise<AnonymousMessage | null> {
  let updatedCurhat: AnonymousMessage | null = null;

  if (isDatabaseConfigured && db) {
    try {
      const updateData: Partial<typeof curhat.$inferInsert> = {};

      if (typeof options.answer === 'string') {
        const cleanAnswer = options.answer.trim();
        updateData.answer = cleanAnswer;
        updateData.isAnswered = cleanAnswer.length > 0;
        updateData.answeredAt = cleanAnswer.length > 0 ? new Date().toISOString() : null;
      }

      if (typeof options.isPublic === 'boolean') {
        updateData.isPublic = options.isPublic;
      }

      const [updated] = await db
        .update(curhat)
        .set(updateData)
        .where(eq(curhat.id, id))
        .returning();

      if (updated) {
        updatedCurhat = {
          ...updated,
          answer: updated.answer ?? undefined,
          answeredAt: updated.answeredAt ?? undefined,
        } as AnonymousMessage;
      }
    } catch (error) {
      console.error('Error in updateCurhat from db:', error);
    }
  }

  const idx = fallbackCurhat.findIndex((c) => c.id === id);
  if (idx !== -1) {
    if (typeof options.answer === 'string') {
      const cleanAnswer = options.answer.trim();
      fallbackCurhat[idx].answer = cleanAnswer;
      fallbackCurhat[idx].isAnswered = cleanAnswer.length > 0;
      fallbackCurhat[idx].answeredAt = cleanAnswer.length > 0 ? new Date().toISOString() : undefined;
    }
    if (typeof options.isPublic === 'boolean') {
      fallbackCurhat[idx].isPublic = options.isPublic;
    }
    if (!updatedCurhat) {
      updatedCurhat = fallbackCurhat[idx];
    }
  }

  if (updatedCurhat) {
    revalidateDataPaths(['curhat']);
  }

  return updatedCurhat;
}

export async function answerCurhat(
  id: string,
  answer: string,
  isPublic?: boolean
): Promise<AnonymousMessage | null> {
  return updateCurhat(id, { answer, isPublic });
}

export async function deleteCurhat(id: string): Promise<boolean> {
  let deleted = false;

  if (isDatabaseConfigured && db) {
    try {
      const [res] = await db.delete(curhat).where(eq(curhat.id, id)).returning();
      if (res) deleted = true;
    } catch (error) {
      console.error('Error in deleteCurhat from db:', error);
    }
  }

  const idx = fallbackCurhat.findIndex((c) => c.id === id);
  if (idx !== -1) {
    fallbackCurhat.splice(idx, 1);
    deleted = true;
  }

  if (deleted) {
    revalidateDataPaths(['curhat']);
  }

  return deleted;
}

// Articles (PostgreSQL SSOT)
export async function getArticles(onlyPublished = false): Promise<Article[]> {
  if (isDatabaseConfigured && db) {
    try {
      const rows = onlyPublished
        ? await db.select().from(articles).where(eq(articles.isPublished, true))
        : await db.select().from(articles);
      if (rows && rows.length > 0) {
        return rows.map((r) => ({
          ...r,
          tags: Array.isArray(r.tags) ? r.tags : [],
          isPublished: r.isPublished ?? true,
        })) as Article[];
      }
    } catch (error) {
      console.error('Error in getArticles from db:', error);
    }
  }

  // Fallback to in-memory static articles for offline/build-time isolation
  return onlyPublished
    ? fallbackArticles.filter((a) => a.isPublished !== false)
    : fallbackArticles;
}

export async function getArticleBySlug(slug: string, onlyPublished = false): Promise<Article | null> {
  if (isDatabaseConfigured && db) {
    try {
      const query = onlyPublished
        ? db.select().from(articles).where(and(eq(articles.slug, slug), eq(articles.isPublished, true))).limit(1)
        : db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
      const [row] = await query;
      if (row) {
        return {
          ...row,
          tags: Array.isArray(row.tags) ? row.tags : [],
          isPublished: row.isPublished ?? true,
        } as Article;
      }
    } catch (error) {
      console.error('Error in getArticleBySlug from db:', error);
    }
  }

  // Fallback to in-memory static articles
  const found = fallbackArticles.find((a) => a.slug === slug);
  if (!found) return null;
  if (onlyPublished && found.isPublished === false) return null;
  return found;
}

export async function updateArticle(
  id: string,
  data: Partial<Omit<Article, 'id'>>
): Promise<Article | null> {
  try {
    const updateData: Partial<typeof articles.$inferInsert> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.readTime !== undefined) updateData.readTime = data.readTime;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;

    let updatedArticle: Article | null = null;

    // 1. Update Database (Postgres as Primary SSOT)
    if (isDatabaseConfigured && db) {
      try {
        const [updated] = await db
          .update(articles)
          .set(updateData)
          .where(eq(articles.id, id))
          .returning();

        if (updated) {
          updatedArticle = {
            ...updated,
            tags: Array.isArray(updated.tags) ? updated.tags : [],
            isPublished: updated.isPublished ?? true,
          } as Article;
        }
      } catch (dbErr) {
        console.error('Database update failed:', dbErr);
      }
    }

    // 2. Sync to in-memory fallback cache
    const fallbackIdx = fallbackArticles.findIndex((a) => a.id === id);
    if (fallbackIdx !== -1) {
      fallbackArticles[fallbackIdx] = { ...fallbackArticles[fallbackIdx], ...data };
      if (!updatedArticle) {
        updatedArticle = fallbackArticles[fallbackIdx];
      }
    }

    // 3. Invalidate Next.js cache so the update is immediately live
    if (updatedArticle) {
      revalidateDataPaths(['articles']);
    }

    return updatedArticle;
  } catch (error) {
    console.error('Error in updateArticle:', error);
    return null;
  }
}

export async function createArticle(
  data: Omit<Article, 'id' | 'publishedAt'> & { publishedAt?: string }
): Promise<Article> {
  const id = `art-${Date.now()}`;
  const insertData = {
    id,
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt,
    content: data.content,
    category: data.category,
    readTime: data.readTime || '5 menit baca',
    publishedAt: data.publishedAt || new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Jakarta',
    }).format(new Date()),
    tags: Array.isArray(data.tags) ? data.tags : [],
    isPublished: data.isPublished !== undefined ? data.isPublished : true,
  };

  if (isDatabaseConfigured && db) {
    try {
      const [inserted] = await db.insert(articles).values(insertData).returning();
      if (inserted) {
        const newArticle = {
          ...inserted,
          tags: Array.isArray(inserted.tags) ? inserted.tags : [],
          isPublished: inserted.isPublished ?? true,
        } as Article;

        fallbackArticles.unshift(newArticle);
        revalidateDataPaths(['articles']);
        return newArticle;
      }
    } catch (dbErr) {
      console.error('Error creating article in db:', dbErr);
    }
  }

  // Fallback in-memory
  const fallbackArticle: Article = {
    ...insertData,
    tags: Array.isArray(insertData.tags) ? insertData.tags : [],
    isPublished: insertData.isPublished,
  };
  fallbackArticles.unshift(fallbackArticle);
  revalidateDataPaths(['articles']);
  return fallbackArticle;
}

export async function deleteArticle(id: string): Promise<boolean> {
  let deleted = false;
  if (isDatabaseConfigured && db) {
    try {
      const [res] = await db.delete(articles).where(eq(articles.id, id)).returning();
      if (res) deleted = true;
    } catch (error) {
      console.error('Error in deleteArticle:', error);
    }
  }

  const idx = fallbackArticles.findIndex((a) => a.id === id);
  if (idx !== -1) {
    fallbackArticles.splice(idx, 1);
    deleted = true;
  }

  if (deleted) {
    revalidateDataPaths(['articles']);
  }

  return deleted;
}
