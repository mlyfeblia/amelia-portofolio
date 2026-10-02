import { NextResponse } from 'next/server';
import { getArticles } from '@/lib/data-store';

export async function GET() {
  try {
    const articles = await getArticles();
    return NextResponse.json({ success: true, data: articles });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil artikel' }, { status: 500 });
  }
}
