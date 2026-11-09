import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';

const KEY_LENGTH = 64;
const SCRYPT_N = 16_384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const DUMMY_SALT = Buffer.alloc(16, 0x5a);

function derive(password: string, salt: Buffer, n = SCRYPT_N, r = SCRYPT_R, p = SCRYPT_P): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, KEY_LENGTH, { N: n, r, p, maxmem: 64 * 1024 * 1024 }, (error, key) => {
      if (error) reject(error);
      else resolve(key as Buffer);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await derive(password, salt);
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString('base64url')}$${derived.toString('base64url')}`;
}

export async function verifyPassword(password: string, encoded: string | null | undefined): Promise<boolean> {
  if (!encoded) {
    const candidate = await derive(password, DUMMY_SALT);
    timingSafeEqual(candidate, Buffer.alloc(KEY_LENGTH));
    return false;
  }

  const [algorithm, nText, rText, pText, saltText, hashText] = encoded.split('$');
  const n = Number(nText);
  const r = Number(rText);
  const p = Number(pText);
  if (algorithm !== 'scrypt' || n !== SCRYPT_N || r !== SCRYPT_R || p !== SCRYPT_P || !saltText || !hashText) return false;

  try {
    const salt = Buffer.from(saltText, 'base64url');
    const expected = Buffer.from(hashText, 'base64url');
    if (salt.length !== 16 || expected.length !== KEY_LENGTH) return false;
    const candidate = await derive(password, salt, n, r, p);
    return timingSafeEqual(candidate, expected);
  } catch {
    return false;
  }
}
