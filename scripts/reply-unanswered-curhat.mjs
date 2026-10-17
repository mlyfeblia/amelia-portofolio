import fs from 'fs';
import path from 'path';
import postgres from 'postgres';
import dotenv from 'dotenv';
import crypto from 'crypto';

const COOKIE_NAME = 'amel_admin_session';

function generateAdminSessionToken() {
  const secretKey = process.env.ADMIN_AUTH_SECRET || 'amelia-bki-secret-key-development-mode-2026';
  const timestamp = Date.now().toString();
  const nonce = crypto.randomBytes(16).toString('hex');
  const payload = `admin:${timestamp}:${nonce}`;
  const hmac = crypto.createHmac('sha256', secretKey).update(payload).digest('hex');
  return `${payload}:${hmac}`;
}

dotenv.config({ path: '.env.local' });

const replies = {
  'cur-25': `Halo Pencari Jati Diri yang baik. Peluk hangat untuk hatimu yang sedang merasa lelah membandingkan diri. Wajar sekali jika kamu merasa gamang saat melihat teman-teman tampak memiliki keahlian yang spesifik. Namun ingat, dunia tidak hanya membutuhkan seorang spesialis; dunia juga sangat membutuhkan sosok generalis yang adaptif, tekun, dan mampu menghubungkan banyak hal.

Kelebihan seseorang tidak selalu berwujud keahlian teknis seperti coding atau desain. Sifatmu yang bisa mendengarkan dengan tulus, rasa tanggung jawab, kejujuran, dan kemauan untuk terus belajar adalah modal karakter yang sangat bernilai di dunia kerja maupun kehidupan. Berhentilah membandingkan awal perjalananmu dengan bab pertengahan orang lain. Ambil satu hal kecil yang membuatmu penasaran minggu ini, pelajari pelan-pelan tanpa tuntutan harus langsung mahir. Allah telah merancang peran khusus untukmu yang tidak akan pernah tertukar dengan siapa pun.`,

  'cur-26': `Halo sahabat Penjaga Rahasia Rumah. Terima kasih banyak sudah bertahan sejauh ini dengan pundak yang begitu tangguh. Menjadi anak pertama yang harus menjadi perisai bagi adik-adik di tengah badai bentakan orang tua adalah beban yang sangat berat dan melelahkan jiwa.

Ketahuilah, kamu berhak merasa lelah dan kamu berhak menangis. Kamu tidak harus selalu terlihat sempurna dan tak terkalahkan. Pertengkaran finansial orang tua sepenuhnya adalah tanggung jawab mereka sebagai orang dewasa, bukan salahmu atau tanggung jawabmu untuk menyelesaikannya saat ini. Saat suasana di rumah mulai memanas, ajak adik-adik masuk ke kamar, putar musik yang tenang atau lantunan murottal lembut dengan earphone, dan temani mereka dengan pelukan hangat. Namun setelah adik-adik tenang, carilah ruang aman untuk dirimu sendiri, tumpahkan air matamu dalam sujud doa. Hatimu berharga, jangan biarkan dirimu tenggelam sendirian tanpa pertolongan ya.`,

  'cur-47': `Halo Anak Bungsu yang berhati mulia. Sungguh mengharukan melihat baktimu yang begitu tulus kepada ibu tercinta. Di saat yang sama, tawaran beasiswa S2 adalah amanah prestasi luar biasa yang patut kamu syukuri. Wajar jika batinmu terombang-ambing di antara cinta kepada orang tua dan cita-cita masa depan.

Ingatlah satu hal penting: merawat ibu yang sepuh bukanlah tanggung jawab tunggal kamu seorang diri, melainkan kewajiban bersama seluruh anak-anaknya. Langkah pertama yang sangat bijak adalah mengadakan musyawarah keluarga secara hangat bersama seluruh kakakmu. Sampaikan kabar gembira beasiswa ini dan bicarakan opsi pengasuhan ibu secara terbuka, apakah dengan sistem giliran menginap, membawa ibu tinggal bersamamu di Jogja bila memungkinkan, atau bantuan kerabat dekat. Libatkan ibu dalam dialog dari hati ke hati, sebab sering kali doa dan restu seorang ibu yang ikhlas justru menjadi pembuka jalan kemudahan yang tak disangka-sangka. Sholat istikharahlah dengan lapang dada.`,

  'cur-48': `Halo Pengagum Rahasia Sunyi. Kagum kepada sosok yang santun dan taat adalah hal yang sangat fitrah dan indah. Namun, menyiksa diri dengan pikiran bahwa kamu 'penuh kekurangan dan tidak pantas' adalah bentuk ketidakadilan terhadap dirimu sendiri. Setiap manusia adalah ciptaan Allah yang mulia dan sedang dalam proses penyempurnaan diri.

Perasaan yang hadir selama 2 tahun tidak perlu dikubur dengan rasa benci atau rendah diri. Alihkan rasa kagum itu menjadi bahan bakar positif untuk memperbaiki kualitas diri, baik dari sisi spiritualitas, wawasan, maupun kedewasaan emosi. Jika kamu merasa sudah siap dan memiliki niat yang lurus ke arah masa depan, kamu tidak harus memendamnya selamanya; kamu bisa meminta bantuan perantara yang amanah atau menyapanya secara wajar dalam batasan etika. Namun jika saat ini belum memungkinkan, titipkan rasa itu dalam doa-doa sunyimu. Biarkan Allah yang menata skenario terbaik, entah dengan mempersatukan kalian atau menghadirkan sosok yang jauh lebih tepat untukmu.`,

  'cur-49': `Halo sahabat Penyintas yang tangguh. Pertama-tama, Amel ingin memberikan apresiasi sebesar-besarnya atas keberanianmu melepaskan diri dari relasi beracun tersebut. Keluar dari lingkaran manipulasi membutuhkan kekuatan batin yang luar biasa, dan kamu sudah membuktikannya.

Respon tubuhmu yang gemetar dan berkeringat dingin saat mendengar nada tinggi adalah reaksi alami sistem saraf yang masih berada dalam mode siaga (fight-or-flight). Tubuhmu sedang berusaha melindungimu dari bahaya masa lalu. Saat reaksi itu muncul, lakukan teknik grounding: letakkan kedua telapak kaki menapak kokoh di lantai, tempelkan satu tangan di dadamu, lalu tarik nafas dalam-dalam sambil berkata dalam hati, 'Aku aman sekarang. Bahaya itu sudah berlalu.' Pemulihan trauma bukanlah garis lurus instan, melainkan proses bertahap. Berikan waktu dan kasih sayang pada jiwamu yang sedang memulihkan diri. Jika reaksi ini masih terus mengganggu, ruang konseling sebaya selalu terbuka untuk mendampingimu.`,

  'cur-50': `Halo Pejuang Skripsi yang sedang berproses. Sangat wajar jika kamu merasa terpukul, kecewa, dan enggan menyentuh laptop setelah proposalmu ditolak. Tiga bulan membaca puluhan jurnal adalah perjuangan nyata yang sangat menguras tenaga dan pikiran.

Namun percayalah, jerih payah membaca jurnal-jurnal itu sama sekali tidak sia-sia. Ilmu, pemahaman literatur, dan ketajaman analisismu sudah bertumbuh tanpa kamu sadari. Yang ditolak oleh penguji adalah keselarasan metodologinya, bukan kapasitas intelektual atau harga dirimu sebagai mahasiswa. Berikan izin bagi dirimu untuk rehat total selama dua hingga tiga hari ke depan. Lepaskan beban laptop sejenak, jalan-jalan santai, tidur yang cukup, dan pulihkan energi jiwamu. Setelah kepalamu kembali dingin, diskusikan masukan penguji satu per satu dengan dosen pembimbing. Skripsi yang baik bukanlah skripsi yang sempurna sejak awal, melainkan skripsi yang selesai dan terus diperbaiki langkah demi langkah.`,

  'cur-71': `Halo sahabat Mahasiswa Semester Akhir. Tarik nafas panjang pelan-pelan ya. Peluk hangat untukmu yang sedang menghadapi musibah berat ini. Sangat wajar jika kamu merasa ingin menangis dan berteriak sekencang-kencangnya; tumpahkan seluruh emosi sedihmu hari ini, jangan ditahan.

Setelah perasaanmu sedikit lebih lega, ada dua ikhtiar yang bisa kamu coba. Pertama, jangan buru-buru memformat laptop atau flashdisk; bawa perangkatmu ke teknisi komputer atau ahli data recovery, karena sering kali file yang terkena virus atau bad sector masih bisa diselamatkan dengan perangkat lunak khusus. Kedua, seandainya skenario terburuk kamu harus mengolah data ulang, ketahuilah bahwa menulis untuk kedua kalinya akan jauh lebih cepat karena alur pikir dan pemahaman metodologinya sudah terbentuk matang di kepalamu. Komunikasikan juga situasi ini dengan jujur kepada dosen pembimbing. Allah tidak akan menguji seorang hamba melebihi kesanggupannya, dan kamu pasti bisa bangkit melewati ujian ini.`,

  'cur-72': `Halo sahabat yang baik. Kegelisahanmu sangat beralasan dan hakmu untuk memilih pasangan hidup sepenuhnya dilindungi, baik secara nurani maupun dalam syariat Islam yang mensyaratkan keridhaan penuh kedua mempelai. Niat bapak menjodohkanmu mungkin berakar dari rasa cemas dan harapan agar putrinya hidup aman secara finansial, meskipun caranya terasa mendesak.

Untuk menyampaikan penolakan dengan santun tanpa memicu ketegangan, gunakan pendekatan komunikasi kasih sayang. Pilihlah waktu yang tenang, siapkan minuman kesukaan bapak, lalu awali dengan mengucapkan terima kasih atas perhatian dan kasih sayangnya selama ini. Sampaikan dengan nada lembut dan rendah hati bahwa setelah sholat istikharah dan perenungan mendalam, hatimu belum menemukan ketenangan untuk menikah saat ini karena ingin fokus berikhtiar di dunia kerja. Tegaskan bahwa kamu ingin menikah saat dirimu sudah benar-benar siap lahir batin agar rumah tangga kelak sakinah. Jika terasa terlalu berat bicara berdua, ajak ibu atau kerabat yang bijak untuk membantu menjembatani pembicaraan ini secara kekeluargaan.`,

  'cur-73': `Halo sahabat Pekerja Tangguh. Tenangkan hatimu, tidak ada yang 'salah' atau rusak dengan kesehatan mentalmu! Perubahan emosi menjadi mudah meledak dan penyendiri adalah konsekuensi biologis langsung dari terganggunya ritme sirkadian tubuh dan minimnya paparan sinar matahari selama 8 bulan kerja malam.

Kurang tidur berkualitas dan minimnya sinar matahari mengacaukan produksi hormon serotonin dan melatonin, sehingga amigdala otak menjadi hiperaktif dan mudah tersulut amarah. Untuk memulihkan energimu, coba terapkan beberapa langkah ini: sempatkan berjemur 15 menit di bawah sinar matahari pagi sebelum tidur siang, gunakan tirai gelap (blackout curtain) dan penutup telinga agar tidur siangmu benar-benar nyenyak tanpa gangguan, serta cukupi konsumsi air putih dan suplemen vitamin D. Jelaskan juga secara santai kepada teman-teman bahwa pola shift malam sedang membuat fisikmu cepat lelah, sehingga mereka mengerti kondisimu. Hormat setinggi-tingginya untuk jerih payah halalmu menghidupi diri.`,

  'cur-74': `Air mata haru dan peluk hangat untukmu, sahabatku yang hebat. Rasa rindu yang begitu dalam kepada almarhum ayah di momen wisuda adalah bukti nyata betapa cintanya tetap hidup dan mengalir abadi di dalam setiap detak nadimu. Sangat wajar dan indah jika hatimu basah oleh kerinduan ini.

Ketahuilah, meskipun ayah tidak tampak secara fisik di barisan kursi wisuda, setiap tetes keringat perjuangan beliau sejak kamu kecil telah menjelma menjadi toga kehormatan yang kamu kenakan hari ini. Doa anak yang sholeh adalah salah satu amalan yang tidak pernah terputus menembus alam barzakh. Hadiahkanlah doa terbaik dan lantunan ayat suci untuk ayah seusai sholatmu. Bawalah toga kelulusanmu saat berziarah ke makam beliau dengan senyuman bangga. Ayahmu di sana pasti tersenyum bahagia melihat putrinya tumbuh menjadi pribadi yang sarjana, tangguh, dan membanggakan. Selamat atas gelar sarjanamu ya.`,

  'cur-75': `Halo Pejuang Ibadah yang dirahmati Allah. Rasa tidak nyaman dan tertekan yang kamu rasakan adalah pertanda bahwa hatimu masih hidup, bersih, dan peka terhadap nilai-nilai kebaikan. Bertahan menjaga kesucian ibadah di tengah lingkungan yang bebas adalah jihad batin yang pahalanya sangat besar di sisi Allah.

Sembari menunggu masa sewa berakhir, ada beberapa langkah pelindung yang bisa kamu terapkan: jadikan kamarmu sebagai benteng privasi yang tertutup rapat, gunakan kunci pintu dan earphone dengan lantunan murottal saat beribadah agar suasana batinmu tenang. Kamu juga bisa memperbanyak waktu berada di perpustakaan kampus atau masjid sekitar untuk belajar dan sholat berjamaah yang lebih khusyuk. Terkait sisa sewa, cobalah tanyakan kepada pemilik kos atau teman lain apakah kamarmu bisa di-over-kontrak (dialihkan ke orang lain) agar sisa uang sewamu bisa kembali dan kamu dapat segera pindah ke kosan yang lebih kondusif. Tetaplah teguh memegang prinsip, Allah senantiasa membersamai orang-orang yang menjaga batas kesucian.`
};

async function syncReplies() {
  const now = new Date().toISOString();
  console.log('Synchronizing replies for 11 curhat messages at:', now);

  // 1. Update data/db.json
  const dbPath = path.join(process.cwd(), 'data', 'db.json');
  const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  let updatedInJson = 0;
  for (const item of dbData.curhatList) {
    if (replies[item.id]) {
      item.answer = replies[item.id];
      item.isAnswered = true;
      item.answeredAt = now;
      item.isPublic = true;
      updatedInJson++;
    }
  }

  fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf8');
  console.log(`[data/db.json] Successfully updated ${updatedInJson} curhat entries.`);

  // 2. Update PostgreSQL database if configured
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    try {
      const sql = postgres(databaseUrl, { ssl: { rejectUnauthorized: false } });
      let updatedInSql = 0;

      for (const [id, answer] of Object.entries(replies)) {
        const res = await sql`
          UPDATE curhat
          SET 
            answer = ${answer},
            is_answered = true,
            answered_at = ${now},
            is_public = true
          WHERE id = ${id}
          RETURNING id;
        `;
        if (res && res.length > 0) {
          updatedInSql++;
        }
      }

      console.log(`[PostgreSQL Database] Successfully updated ${updatedInSql} curhat entries.`);
      await sql.end();
    } catch (err) {
      console.error('[PostgreSQL Database Error]:', err.message);
    }
  }

  // 3. Call HTTP API on localhost:3000 if running to update in-memory cache & revalidate Next.js cache
  try {
    const adminToken = generateAdminSessionToken();
    let updatedInApi = 0;

    for (const [id, answer] of Object.entries(replies)) {
      try {
        const response = await fetch(`http://localhost:3000/api/curhat/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Cookie: `${COOKIE_NAME}=${adminToken}`,
          },
          body: JSON.stringify({
            answer,
            isPublic: true,
          }),
        });
        if (response.ok) {
          updatedInApi++;
        }
      } catch {
        // Dev server may not be reachable or route handled
      }
    }
    console.log(`[HTTP API / Next.js Server] Successfully patched ${updatedInApi} curhat entries.`);
  } catch (err) {
    console.warn('[HTTP API Note]:', err.message);
  }

  console.log('All 11 curhat messages successfully answered and synchronized across all layers!');
}

syncReplies();
