import { ImageResponse } from 'next/og';

export const alt = 'Amelia | Portofolio & Bimbingan Konseling Islam';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#FBF9F5',
          padding: '64px 80px',
          fontFamily: 'sans-serif',
          border: '14px solid #1A563C',
        }}
      >
        {/* Top Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#EAF2EC',
              border: '2px solid #C4D9CD',
              borderRadius: '9999px',
              padding: '8px 24px',
              color: '#1A563C',
              fontSize: '22px',
              fontWeight: 700,
            }}
          >
            Portofolio & Konseling Sebaya
          </div>
          <div
            style={{
              color: '#556561',
              fontSize: '20px',
              fontWeight: 500,
            }}
          >
            UIN Siber Syekh Nurjati Cirebon
          </div>
        </div>

        {/* Center: Hero Heading */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: '20px',
            marginBottom: '20px',
          }}
        >
          <h1
            style={{
              fontSize: '60px',
              lineHeight: 1.15,
              fontWeight: 800,
              color: '#182420',
              margin: 0,
              letterSpacing: '-0.03em',
            }}
          >
            Amelia (Amel)
          </h1>
          <p
            style={{
              fontSize: '28px',
              lineHeight: 1.4,
              color: '#44534F',
              marginTop: '16px',
              marginBottom: 0,
              fontWeight: 400,
            }}
          >
            Ruang dengar aman, bimbingan konseling islami, ruang curhat anonim, dan catatan refleksi kesehatan jiwa.
          </p>
        </div>

        {/* Bottom Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '2px solid #E6E0D5',
            paddingTop: '28px',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span
              style={{
                fontSize: '20px',
                color: '#556561',
                fontWeight: 600,
              }}
            >
              • Janji Temu Konseling
            </span>
            <span style={{ margin: '0 8px', color: '#B3C4BD' }}>|</span>
            <span
              style={{
                fontSize: '20px',
                color: '#556561',
                fontWeight: 600,
              }}
            >
              • Ruang Curhat Anonim
            </span>
            <span style={{ margin: '0 8px', color: '#B3C4BD' }}>|</span>
            <span
              style={{
                fontSize: '20px',
                color: '#556561',
                fontWeight: 600,
              }}
            >
              • Artikel Refleksi
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#1A563C',
              color: '#FFFFFF',
              borderRadius: '12px',
              padding: '10px 24px',
              fontSize: '18px',
              fontWeight: 600,
            }}
          >
            mlyfeblia.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
