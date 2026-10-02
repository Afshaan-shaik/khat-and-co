import { LetterData } from '../types/letter';
import { encodeLetterToHash, decodeLetterFromHash } from './codec';
import { sanitizeLoadedLetter } from './storage';
import { getWorkspaceAuthHeaders } from '../services/session';
import { isSupabaseConfigured, saveLetterToDatabase, getLetterFromSupabase } from '../services/supabase';

const DPASTE_ENDPOINT = 'https://dpaste.com';
const BYTEBIN_ENDPOINT = 'https://bytebin.lucko.me';

/**
 * Creates an ultra-short canonical sharing URL for the letter.
 * Generates a clean 6-8 character Base62 share code via /api/letter/share,
 * returning: https://khath-and-co.vercel.app/l/K7mQ2x
 *
 * Rules:
 * - NO letter text, images, base64 data, audio, or session state inside the URL.
 * - Same unedited letter repeatedly shared returns the same canonical short URL.
 * - Images attached to the letter are automatically associated and published.
 */
export async function createShortShareUrl(letter: LetterData): Promise<string> {
  const origin = window.location.origin;

  // 1. Primary: Server Share API (/api/letter/share) -> returns /l/:code
  try {
    const authHeaders = getWorkspaceAuthHeaders();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const res = await fetch('/api/letter/share', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({ letter }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data?.shortUrl) return data.shortUrl;
      if (data?.shareCode) return `${origin}/l/${data.shareCode}`;
      if (data?.path) return `${origin}${data.path}`;
    }
  } catch (err) {
    console.warn('Primary /api/letter/share failed, evaluating fallbacks:', err);
  }

  // 2. Direct Cloud Fallback: Dpaste (Global, 365-day persistence, CORS-enabled)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${DPASTE_ENDPOINT}/api/v2/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        content: JSON.stringify({ letter, createdAt: new Date().toISOString() }),
        syntax: 'json',
        expiry_days: '365'
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const url = (await res.text()).trim();
      const code = url.split('/').filter(Boolean).pop();
      if (code && code.length >= 4) {
        return `${origin}/l/${code}`;
      }
    }
  } catch (err) {
    console.warn('Direct Dpaste fallback failed:', err);
  }

  // 3. Supabase fallback (Database + Storage)
  if (isSupabaseConfigured()) {
    try {
      const result = await saveLetterToDatabase(letter);
      if (result?.slug) {
        return `${origin}/l/${encodeURIComponent(result.slug)}`;
      }
    } catch (err) {
      console.warn('Supabase save failed, falling back:', err);
    }
  }

  // 4. Temporary storage fallback (Bytebin)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

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
      if (key && typeof key === 'string' && key.trim().length > 2) {
        return `${origin}/l/${encodeURIComponent(key.trim())}`;
      }
    }
  } catch (err) {
    console.warn('Bytebin fallback failed, falling back to standalone hash URL:', err);
  }

  // 5. Standalone compressed URL hash fallback (Preserves legacy support without breaking)
  const encoded = encodeLetterToHash(letter);
  return `${origin}/#l=${encoded}`;
}

/**
 * Resolves a shared letter from:
 * 1. Pathname: /l/:code or /letter/:code
 * 2. Query parameter: ?code=... or ?id=...
 * 3. Hash fragment: #id=... or #code=...
 * 4. Legacy compressed hash: #l=...
 */
export async function resolveSharedLetter(
  hash: string,
  search: string,
  pathname: string = ''
): Promise<LetterData | null> {
  // 1. Check pathname: /l/:code or /letter/:code
  if (pathname) {
    const pathMatch = pathname.match(/^\/(?:l|letter)\/([a-zA-Z0-9_-]+)/);
    if (pathMatch && pathMatch[1]) {
      const code = pathMatch[1].trim();
      const letter = await fetchLetterByShareCode(code);
      if (letter) return letter;
    }
  }

  // 2. Check query parameter: ?code=XYZ or ?id=XYZ
  if (search) {
    const params = new URLSearchParams(search);
    const code = params.get('code') || params.get('id');
    if (code && code.trim().length > 1) {
      const cleanCode = code.trim().replace(/\/$/, '');
      const letter = await fetchLetterByShareCode(cleanCode);
      if (letter) return letter;
    }
  }

  // 3. Check hash: #id=XYZ or #code=XYZ
  if (hash) {
    if (hash.startsWith('#id=')) {
      const id = hash.slice(4).trim().replace(/\/$/, '');
      if (id.length > 1) {
        const letter = await fetchLetterByShareCode(id);
        if (letter) return letter;
      }
    } else if (hash.startsWith('#code=')) {
      const code = hash.slice(6).trim().replace(/\/$/, '');
      if (code.length > 1) {
        const letter = await fetchLetterByShareCode(code);
        if (letter) return letter;
      }
    } else if (hash.includes('id=')) {
      const match = hash.match(/id=([a-zA-Z0-9_-]+)/);
      if (match && match[1] && match[1].length > 1) {
        const letter = await fetchLetterByShareCode(match[1]);
        if (letter) return letter;
      }
    }
  }

  // Ignore standard in-page navigation anchors
  const PAGE_ANCHORS = ['#top', '#studio', '#shelf', '#nudge', '#step1', '#step2', '#step3', '#write'];
  if (PAGE_ANCHORS.includes(hash)) {
    return null;
  }

  // 4. Check legacy or standalone hash: #l=... or valid long encoded hash
  if (hash && (hash.startsWith('#l=') || hash.startsWith('#letter=') || (hash.length > 25 && !hash.startsWith('#id=')))) {
    return decodeLetterFromHash(hash);
  }

  return null;
}

/**
 * Resolves a letter by its short share code.
 * Tries server endpoint /api/letter/resolve?code=XYZ, then Supabase, then Bytebin.
 */
export async function fetchLetterByShareCode(code: string): Promise<LetterData | null> {
  const cleanCode = code.trim().replace(/\/$/, '');
  if (!cleanCode) return null;

  // 1. Check primary server /api/letter/resolve
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`/api/letter/resolve?code=${encodeURIComponent(cleanCode)}`, {
      headers: {
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const letter = data?.letter || data;
      if (letter && (letter.body || letter.recipient)) {
        return sanitizeLoadedLetter(letter);
      }
    }
  } catch (err) {
    console.warn(`Server resolve failed for share code "${cleanCode}":`, err);
  }

  // 2. Check Dpaste direct (High-availability global storage with CORS support)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${DPASTE_ENDPOINT}/${encodeURIComponent(cleanCode)}.txt`, {
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const text = await res.text();
      const data = JSON.parse(text);
      const letter = data?.letter || data;
      if (letter && (letter.body || letter.recipient)) {
        return sanitizeLoadedLetter(letter);
      }
    }
  } catch (err) {
    console.warn(`Direct Dpaste resolve notice for "${cleanCode}":`, err);
  }

  // 3. Check Bytebin direct (Crucial for cold lambdas or multi-device WhatsApp links)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${BYTEBIN_ENDPOINT}/${encodeURIComponent(cleanCode)}`, {
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const letter = data?.letter || data;
      if (letter && (letter.body || letter.recipient)) {
        return sanitizeLoadedLetter(letter);
      }
    }
  } catch (err) {
    console.warn(`Failed to fetch letter by short id "${cleanCode}":`, err);
  }

  // 4. Check Supabase
  if (isSupabaseConfigured()) {
    try {
      const fromSupabase = await getLetterFromSupabase(cleanCode);
      if (fromSupabase) return fromSupabase;
    } catch (err) {
      console.warn(`Supabase fetch failed for id "${cleanCode}":`, err);
    }
  }

  return null;
}

/**
 * Legacy alias for fetchLetterByShareCode.
 */
export async function fetchLetterById(id: string): Promise<LetterData | null> {
  return fetchLetterByShareCode(id);
}
