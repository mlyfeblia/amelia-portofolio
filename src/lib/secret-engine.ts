import crypto from 'node:crypto';

export const SECRET_PIN = '071220';
export const SECRET_SESSION_COOKIE = 'amel_xyz_auth';

/**
 * Timing-safe PIN verification for the secret view engine
 */
export function verifySecretPin(inputPin: unknown): boolean {
  if (typeof inputPin !== 'string') return false;
  const cleanInput = inputPin.trim();
  const target = SECRET_PIN;

  if (cleanInput.length !== target.length) {
    return false;
  }

  const inputBuffer = Buffer.from(cleanInput);
  const targetBuffer = Buffer.from(target);

  try {
    return crypto.timingSafeEqual(inputBuffer, targetBuffer);
  } catch {
    return false;
  }
}
