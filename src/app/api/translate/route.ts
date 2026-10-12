import { NextRequest, NextResponse } from 'next/server';
import slugify from '@sindresorhus/slugify';
import { translateWithLocalDictionary } from '@/lib/slug-generator';
import { checkDistributedRateLimit, getClientIp } from '@/lib/rate-limiter';
import { isAuthenticatedAdmin } from '@/lib/admin-auth';

export const runtime = 'nodejs';

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateCheck = await checkDistributedRateLimit(`translate:${ip}`, 20, 60);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          message: `Terlalu banyak permintaan translasi otomatis. Silakan coba lagi dalam ${rateCheck.retryAfterSeconds} detik.`,
        },
        {
          status: 429,
          headers: { 'Retry-After': rateCheck.retryAfterSeconds.toString() },
        }
      );
    }

    // Require authenticated admin session for translation utility
    const isAuth = await isAuthenticatedAdmin(req);
    if (!isAuth) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Silakan masuk sebagai pengelola.' },
        { status: 401 }
      );
    }

    let body: { text?: unknown };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const { text } = body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json(
        { success: false, message: 'Field "text" is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const trimmedText = text.trim();
    let englishTranslation = '';

    // Tier 1: Google Cloud Translation API (if API key is configured)
    const googleApiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (googleApiKey) {
      try {
        const googleUrl = `https://translation.googleapis.com/language/translate/v2?key=${googleApiKey}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);

        const res = await fetch(googleUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            q: trimmedText,
            target: 'en',
            source: 'id',
            format: 'text',
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          const translated = data?.data?.translations?.[0]?.translatedText;
          if (translated && typeof translated === 'string' && translated.trim()) {
            englishTranslation = decodeHtmlEntities(translated.trim());
          }
        }
      } catch (err) {
        console.warn('[translate-api] Google Translation error, falling back to MyMemory:', err);
      }
    }

    // Tier 2: MyMemory Translation API (free public tier)
    if (!englishTranslation) {
      try {
        const query = encodeURIComponent(trimmedText.slice(0, 500));
        const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${query}&langpair=id|en`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);

        const res = await fetch(myMemoryUrl, {
          headers: { 'User-Agent': 'AmeliaPortfolio/1.0' },
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          const translated = data?.responseData?.translatedText;
          if (
            translated &&
            typeof translated === 'string' &&
            translated.trim() &&
            !translated.toUpperCase().includes('MYMEMORY WARNING') &&
            (data.responseStatus === 200 || data.responseStatus === '200')
          ) {
            englishTranslation = decodeHtmlEntities(translated.trim());
          }
        }
      } catch (err) {
        console.warn('[translate-api] MyMemory API error, falling back to local dictionary:', err);
      }
    }

    // Tier 3: Local Offline Dictionary Fallback
    if (!englishTranslation) {
      englishTranslation = translateWithLocalDictionary(trimmedText);
    }

    // Fallback if dictionary returned empty
    if (!englishTranslation) {
      englishTranslation = trimmedText;
    }

    // Convert pure English translation to URL slug via @sindresorhus/slugify
    const slug =
      slugify(englishTranslation, { lowercase: true, separator: '-' }) ||
      slugify(trimmedText, { lowercase: true, separator: '-' });

    return NextResponse.json({
      success: true,
      originalText: trimmedText,
      translatedText: englishTranslation,
      slug,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal translation error',
      },
      { status: 500 }
    );
  }
}
