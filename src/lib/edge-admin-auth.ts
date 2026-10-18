export const COOKIE_NAME = 'amel_admin_session';
export const ADMIN_SESSION_MAX_AGE_SECONDS = 30 * 60; // 1800 seconds
export const ADMIN_SESSION_MAX_AGE_MS = ADMIN_SESSION_MAX_AGE_SECONDS * 1000;

function hexToUint8Array(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) return new Uint8Array(0);
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    const val = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
    if (Number.isNaN(val)) return new Uint8Array(0);
    bytes[i] = val;
  }
  return bytes;
}

/**
 * Timing-safe HMAC-SHA256 token verification compatible with Edge Runtime (Web Crypto API)
 */
export async function isValidAdminSessionTokenEdge(
  token?: string | null,
  secretKey: string = (process.env.ADMIN_AUTH_SECRET || '').trim() || (process.env.NODE_ENV === 'production' ? '' : 'amel-admin-counseling-secret-key-2026')
): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(':');
  if (parts.length !== 4) return false;

  const [role, timestampStr, nonce, receivedHmac] = parts;
  if (role !== 'admin') return false;

  const timestamp = parseInt(timestampStr, 10);
  if (Number.isNaN(timestamp)) return false;

  const elapsed = Date.now() - timestamp;
  if (elapsed >= ADMIN_SESSION_MAX_AGE_MS || elapsed < 0) {
    return false;
  }

  const payload = `admin:${timestampStr}:${nonce}`;
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);

  try {
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const receivedSignature = hexToUint8Array(receivedHmac);
    const payloadBytes = encoder.encode(payload);

    return await crypto.subtle.verify(
      'HMAC',
      cryptoKey,
      receivedSignature as unknown as BufferSource,
      payloadBytes as unknown as BufferSource
    );
  } catch {
    return false;
  }
}
