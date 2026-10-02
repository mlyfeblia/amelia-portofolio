import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { articles, bookings, curhat } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
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

// Bookings
export async function getBookings(): Promise<Booking[]> {
  try {
    const rows = await db.select().from(bookings).orderBy(desc(bookings.createdAt));
    return rows.map((r) => ({
      ...r,
      alias: r.alias ?? undefined,
      notes: r.notes ?? '',
    })) as Booking[];
  } catch (error) {
    console.error('Error in getBookings:', error);
    return [];
  }
}

export async function createBooking(
  data: Omit<Booking, 'id' | 'code' | 'createdAt' | 'status'>
): Promise<Booking> {
  const dateStr = new Date().toISOString().slice(2, 7).replace('-', '');
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const code = `BKI-${dateStr}-${randomSuffix}`;
  const id = `bk-${Date.now()}`;
  const createdAt = new Date().toISOString();

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

  return {
    ...newRow,
    alias: newRow.alias ?? undefined,
    notes: newRow.notes ?? '',
  } as Booking;
}

export async function updateBookingStatus(
  id: string,
  status: Booking['status']
): Promise<Booking | null> {
  try {
    const [updated] = await db
      .update(bookings)
      .set({ status })
      .where(eq(bookings.id, id))
      .returning();

    if (!updated) return null;
    return {
      ...updated,
      alias: updated.alias ?? undefined,
      notes: updated.notes ?? '',
    } as Booking;
  } catch (error) {
    console.error('Error in updateBookingStatus:', error);
    return null;
  }
}

// Curhat / Anonymous Q&A
export async function getCurhatList(): Promise<AnonymousMessage[]> {
  try {
    const rows = await db.select().from(curhat).orderBy(desc(curhat.createdAt));
    return rows.map((r) => ({
      ...r,
      answer: r.answer ?? undefined,
      answeredAt: r.answeredAt ?? undefined,
    })) as AnonymousMessage[];
  } catch (error) {
    console.error('Error in getCurhatList:', error);
    return [];
  }
}

export async function createCurhat(data: {
  alias: string;
  category: string;
  message: string;
  isPublic: boolean;
}): Promise<AnonymousMessage> {
  const id = `cur-${Date.now()}`;
  const createdAt = new Date().toISOString();

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

  return {
    ...newRow,
    answer: newRow.answer ?? undefined,
    answeredAt: newRow.answeredAt ?? undefined,
  } as AnonymousMessage;
}

export async function answerCurhat(
  id: string,
  answer: string,
  isPublic?: boolean
): Promise<AnonymousMessage | null> {
  try {
    const updateData: Partial<typeof curhat.$inferInsert> = {
      answer,
      isAnswered: true,
      answeredAt: new Date().toISOString(),
    };

    if (typeof isPublic === 'boolean') {
      updateData.isPublic = isPublic;
    }

    const [updated] = await db
      .update(curhat)
      .set(updateData)
      .where(eq(curhat.id, id))
      .returning();

    if (!updated) return null;
    return {
      ...updated,
      answer: updated.answer ?? undefined,
      answeredAt: updated.answeredAt ?? undefined,
    } as AnonymousMessage;
  } catch (error) {
    console.error('Error in answerCurhat:', error);
    return null;
  }
}

// Articles
export async function getArticles(): Promise<Article[]> {
  try {
    const rows = await db.select().from(articles);
    if (rows && rows.length > 0) {
      return rows.map((r) => ({
        ...r,
        tags: Array.isArray(r.tags) ? r.tags : [],
      })) as Article[];
    }
  } catch (error) {
    console.error('Error in getArticles from db:', error);
  }

  // Fallback to data/db.json on disk if available
  try {
    const dbPath = path.join(process.cwd(), 'data', 'db.json');
    if (fs.existsSync(dbPath)) {
      const json = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      if (Array.isArray(json.articles) && json.articles.length > 0) {
        return json.articles as Article[];
      }
    }
  } catch {
    // fallback
  }

  return fallbackArticles;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const [row] = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
    if (row) {
      return {
        ...row,
        tags: Array.isArray(row.tags) ? row.tags : [],
      } as Article;
    }
  } catch (error) {
    console.error('Error in getArticleBySlug from db:', error);
  }

  // Fallback to data/db.json
  try {
    const dbPath = path.join(process.cwd(), 'data', 'db.json');
    if (fs.existsSync(dbPath)) {
      const json = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      if (Array.isArray(json.articles)) {
        const found = json.articles.find((a: Article) => a.slug === slug);
        if (found) return found as Article;
      }
    }
  } catch {
    // fallback
  }

  return fallbackArticles.find((a) => a.slug === slug) || null;
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

    let updatedArticle: Article | null = null;

    // 1. Update Database (Postgres)
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
        } as Article;
      }
    } catch (dbErr) {
      console.error('Database update failed, continuing with file sync:', dbErr);
    }

    // 2. Sync to data/db.json on disk
    try {
      const dbPath = path.join(process.cwd(), 'data', 'db.json');
      if (fs.existsSync(dbPath)) {
        const fileContent = fs.readFileSync(dbPath, 'utf8');
        const json = JSON.parse(fileContent);
        if (Array.isArray(json.articles)) {
          const idx = json.articles.findIndex((a: Article) => a.id === id);
          if (idx !== -1) {
            json.articles[idx] = { ...json.articles[idx], ...data };
            if (!updatedArticle) {
              updatedArticle = json.articles[idx];
            }
            fs.writeFileSync(dbPath, JSON.stringify(json, null, 2), 'utf8');
          }
        }
      }
    } catch (fsErr) {
      console.error('File sync error in updateArticle:', fsErr);
    }

    // 3. Update in-memory fallback
    const fallbackIdx = fallbackArticles.findIndex((a) => a.id === id);
    if (fallbackIdx !== -1) {
      fallbackArticles[fallbackIdx] = { ...fallbackArticles[fallbackIdx], ...data };
      if (!updatedArticle) {
        updatedArticle = fallbackArticles[fallbackIdx];
      }
    }

    // 4. Invalidate Next.js cache so the update is immediately live
    if (updatedArticle) {
      try {
        revalidatePath('/articles');
        revalidatePath(`/articles/${updatedArticle.slug}`);
        revalidatePath('/admin/articles');
        revalidatePath('/');
      } catch {
        // Safe to ignore if outside server action / route context
      }
    }

    return updatedArticle;
  } catch (error) {
    console.error('Error in updateArticle:', error);
    return null;
  }
}
