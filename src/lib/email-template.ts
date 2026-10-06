/**
 * Standardized Email Link & Message Template Generator for Amelia Portfolio Admin
 */

export interface AdminContactEmailParams {
  clientEmail: string;
  clientName: string;
  code: string;
  date: string;
  slot: string;
}

export function getAdminContactEmailUrl(params: AdminContactEmailParams): string {
  const subject = `Konfirmasi Jadwal Bimbingan Konseling Amelia [${params.code}]`;
  const body = `Halo ${params.clientName},

Semoga pesan ini menjumpaimu dalam keadaan sehat dan tenang.

Perkenalkan, saya Amelia (Amel), konselor sebaya bimbingan konseling Islam UIN Siber Syekh Nurjati Cirebon.

Terkait dengan permohonan sesi konseling yang telah kamu ajukan di website:
- Kode Reservasi: ${params.code}
- Tanggal: ${params.date}
- Sesi Waktu: ${params.slot}

Aku ingin mengonfirmasi kesiapan sesi kita. Apakah jadwal tersebut sudah pas untukmu?

Jika ada hal yang ingin ditanyakan, penyesuaian jadwal, atau topik yang ingin dipersiapkan sebelum sesi dimulai, silakan langsung membalas email ini atau melalui WhatsApp resmi konseling di +62 822-1044-5785.

Terima kasih atas kepercayaannya. Ruang aman ini selalu terbuka untuk mendengar kisahmu.

Salam hangat,
Amelia (Amel)
Bimbingan Konseling Islam - UIN Siber Syekh Nurjati Cirebon
WhatsApp: +62 822-1044-5785`;

  return `mailto:${params.clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
