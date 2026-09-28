import { LetterData } from '../types/letter';
import { encodeLetterToHash, decodeLetterFromHash } from './codec';
import { sanitizeLoadedLetter } from './storage';

const BYTEBIN_ENDPOINT = 'https://bytebin.lucko.me';

/**
 * Creates an ultra-short sharing URL for the letter.
 * Saves the letter payload and returns a concise link:
 * e.g. https://khat-and-co.vercel.app/?id=VVV4iyNYrX (45 chars)
 * Falls back immediately to the standalone hash (#l=...) if offline.
 */
export async function createShortShareUrl(letter: LetterData): Promise<string> {
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  const base = `${origin}${pathname}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${BYTEBIN_ENDPOINT}/post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(letter),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const key = data?.key;
      if (key && typeof key === 'string' && key.length > 2) {
        return `${base}?id=${encodeURIComponent(key)}`;
      }
    }
  } catch (err) {
    console.warn('Short link creation failed, falling back to standalone hash URL:', err);
  }

  // Fallback: standalone hash URL
  const encoded = encodeLetterToHash(letter);
  return `${base}#l=${encoded}`;
}

/**
 * Resolves a shared letter from either:
 * 1. Query parameter ?id=<shortKey>
 * 2. Hash fragment #id=<shortKey>
 * 3. Hash fragment #l=<compressedPayload>
 */
export async function resolveSharedLetter(
  hash: string,
  search: string
): Promise<LetterData | null> {
  // 1. Check query parameter: ?id=XYZ
  if (search) {
    const params = new URLSearchParams(search);
    const id = params.get('id');
    if (id && id.length > 2) {
      const remote = await fetchLetterById(id);
      if (remote) return remote;
    }
  }

  // 2. Check hash: #id=XYZ
  if (hash && hash.startsWith('#id=')) {
    const id = hash.slice(4).trim();
    if (id && id.length > 2) {
      const remote = await fetchLetterById(id);
      if (remote) return remote;
    }
  }

  // 3. Check legacy or standalone hash: #l=... or raw hash
  if (hash && (hash.startsWith('#l=') || hash.length > 5)) {
    return decodeLetterFromHash(hash);
  }

  return null;
}

/**
 * Fetches and sanitizes a letter payload by its short ID.
 */
async function fetchLetterById(id: string): Promise<LetterData | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${BYTEBIN_ENDPOINT}/${encodeURIComponent(id)}`, {
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return sanitizeLoadedLetter(data);
    }
  } catch (err) {
    console.warn(`Failed to fetch letter by short id "${id}":`, err);
  }
  return null;
}
