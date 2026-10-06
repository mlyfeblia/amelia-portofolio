import { ImageResponse } from 'next/og';
import { getArticleBySlug } from '@/lib/data-store';

export const alt = 'Artikel Amelia - Konseling & Kesehatan Mental Islami';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug, true);

  const title = article?.title || 'Artikel & Refleksi Amelia';
  const category = article?.category || 'Kesehatan Mental Islami';
  const readTime = article?.readTime || '5 menit baca';
  const publishedAt = article?.publishedAt || 'Amelia Konseling';

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
          padding: '60px 72px',
          fontFamily: 'sans-serif',
          border: '14px solid #1A563C',
        }}
      >
        {/* Top Header: Category & Read Time */}
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
              letterSpacing: '-0.01em',
            }}
          >
            {category}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              color: '#556561',
              fontSize: '20px',
              fontWeight: 500,
            }}
          >
            <span>{readTime}</span>
            <span style={{ margin: '0 12px' }}>•</span>
            <span>{publishedAt}</span>
          </div>
        </div>

        {/* Center: Article Title */}
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
              fontSize: title.length > 70 ? '44px' : '52px',
              lineHeight: 1.25,
              fontWeight: 700,
              color: '#182420',
              margin: 0,
              letterSpacing: '-0.02em',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {title}
          </h1>
        </div>

        {/* Bottom Footer: Author & Brand Identity */}
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
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#1A563C',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '26px',
                fontWeight: 700,
                marginRight: '18px',
              }}
            >
              A
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#182420',
                }}
              >
                Amelia (Amel)
              </span>
              <span
                style={{
                  fontSize: '18px',
                  color: '#556561',
                  fontWeight: 500,
                }}
              >
                Konselor Sebaya · BKI UIN Siber Syekh Nurjati Cirebon
              </span>
            </div>
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
              letterSpacing: '0.02em',
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
