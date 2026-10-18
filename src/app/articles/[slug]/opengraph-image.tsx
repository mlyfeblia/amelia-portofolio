import { ImageResponse } from 'next/og';
import { getArticleBySlug } from '@/lib/data-store';
import { LEGACY_SLUG_REDIRECTS } from '@/lib/article-redirects';

export const alt = 'Artikel Amelia | Bimbingan Konseling Islam';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const targetSlug = LEGACY_SLUG_REDIRECTS[slug] || slug;
  const article = await getArticleBySlug(targetSlug, true);

  const title = article ? article.title : 'Artikel Refleksi Kesehatan Mental & Konseling';
  const category = article ? article.category : 'Bimbingan Konseling Islam';
  const readTime = article ? article.readTime : '5 menit baca';

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
          padding: '56px 72px',
          fontFamily: 'sans-serif',
          border: '14px solid #1A563C',
        }}
      >
        {/* Top Header: Category Pill & Source */}
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
              backgroundColor: '#EDF5F0',
              border: '2px solid #C8DFD2',
              borderRadius: '9999px',
              padding: '6px 20px',
              color: '#1A563C',
              fontSize: '20px',
              fontWeight: 700,
            }}
          >
            {category}
          </div>
          <div
            style={{
              color: '#42564C',
              fontSize: '18px',
              fontWeight: 500,
            }}
          >
            Amelia • {readTime}
          </div>
        </div>

        {/* Center: Article Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: '16px',
            marginBottom: '16px',
          }}
        >
          <h1
            style={{
              fontSize: title.length > 70 ? '44px' : '52px',
              lineHeight: 1.22,
              fontWeight: 800,
              color: '#192820',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </h1>
        </div>

        {/* Bottom Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '2px solid #E5DFD5',
            paddingTop: '24px',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '20px',
                color: '#192820',
                fontWeight: 700,
              }}
            >
              Amelia (Amel)
            </span>
            <span style={{ margin: '0 10px', color: '#B3C4BD' }}>•</span>
            <span
              style={{
                fontSize: '18px',
                color: '#60756B',
                fontWeight: 500,
              }}
            >
              Bimbingan Konseling Islam UIN Siber Cirebon
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#1A563C',
              color: '#FFFFFF',
              borderRadius: '10px',
              padding: '8px 20px',
              fontSize: '16px',
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
