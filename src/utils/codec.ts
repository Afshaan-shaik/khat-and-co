import LZString from 'lz-string';
import { LetterData, PlacedSticker } from '../types/letter';
import { PAPER_TEMPLATES } from '../constants/templates';
import { HANDWRITING_FONTS } from '../constants/fonts';
import { STICKER_REGISTRY } from '../constants/stickers';

const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

export function encodeLetterToHash(letter: LetterData): string {
  try {
    const minified = {
      r: letter.recipient.slice(0, 120),
      d: letter.date.slice(0, 80),
      g: letter.greeting.slice(0, 120),
      b: letter.body.slice(0, 6000),
      s: letter.signoff.slice(0, 120),
      n: letter.sender.slice(0, 120),
      t: letter.templateId,
      f: letter.fontId,
      i: letter.inkColor,
      rl: letter.ruledLines ? 1 : 0,
      st: (letter.stickers || []).slice(0, 40).map((stk) => ({
        id: stk.id,
        sId: stk.stickerId,
        x: Math.round(stk.x * 10) / 10,
        y: Math.round(stk.y * 10) / 10,
        sc: Math.round(stk.scale * 100) / 100,
        r: Math.round(stk.rotation),
        z: stk.zIndex
      }))
    };

    const json = JSON.stringify(minified);
    const compressed = LZString.compressToEncodedURIComponent(json);
    return compressed;
  } catch (err) {
    console.error('Failed to encode letter', err);
    return '';
  }
}

export function decodeLetterFromHash(hashStr: string): LetterData | null {
  try {
    if (!hashStr) return null;
    let clean = hashStr.startsWith('#') ? hashStr.slice(1) : hashStr;
    if (clean.startsWith('l=')) clean = clean.slice(2);
    if (!clean) return null;

    // Decompress via LZString
    let jsonStr = LZString.decompressFromEncodedURIComponent(clean);
    
    // Fallback if not compressed or plain JSON
    if (!jsonStr) {
      try {
        jsonStr = decodeURIComponent(atob(clean));
      } catch {
        jsonStr = clean;
      }
    }

    if (!jsonStr) return null;
    const raw = JSON.parse(jsonStr);

    // Sanitize & Validate fields
    const validTemplateIds = new Set(PAPER_TEMPLATES.map((t) => t.id));
    const validFontIds = new Set(HANDWRITING_FONTS.map((f) => f.id));

    const templateId = validTemplateIds.has(raw.t || raw.templateId)
      ? (raw.t || raw.templateId)
      : 'airmail-classic';

    const fontId = validFontIds.has(raw.f || raw.fontId)
      ? (raw.f || raw.fontId)
      : 'caveat';

    const rawInk = raw.i || raw.inkColor || '';
    const inkColor = HEX_COLOR_REGEX.test(rawInk)
      ? rawInk
      : (PAPER_TEMPLATES.find((t) => t.id === templateId)?.defaultInk || '#1F2340');

    // Parse stickers with strict registry whitelisting & coordinate clamping
    const rawStickers = Array.isArray(raw.st) ? raw.st : Array.isArray(raw.stickers) ? raw.stickers : [];
    const sanitizedStickers: PlacedSticker[] = [];

    for (const s of rawStickers.slice(0, 40)) {
      const sId = String(s.sId || s.stickerId || '');
      if (!STICKER_REGISTRY[sId]) continue; // strictly whitelist against known SVG stickers

      const x = Math.min(Math.max(Number(s.x) || 0, 0), 100);
      const y = Math.min(Math.max(Number(s.y) || 0, 0), 100);
      const scale = Math.min(Math.max(Number(s.sc || s.scale) || 1, 0.4), 3.0);
      const rotation = Math.min(Math.max(Number(s.r || s.rotation) || 0, -360), 360);
      const zIndex = Math.min(Math.max(Math.floor(Number(s.z || s.zIndex) || 1), 1), 100);

      sanitizedStickers.push({
        id: String(s.id || `stk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`),
        stickerId: sId,
        x,
        y,
        scale,
        rotation,
        zIndex
      });
    }

    const letter: LetterData = {
      recipient: String(raw.r ?? raw.recipient ?? '').slice(0, 120),
      date: String(raw.d ?? raw.date ?? '').slice(0, 80),
      greeting: String(raw.g ?? raw.greeting ?? '').slice(0, 120),
      body: String(raw.b ?? raw.body ?? '').slice(0, 6000),
      signoff: String(raw.s ?? raw.signoff ?? '').slice(0, 120),
      sender: String(raw.n ?? raw.sender ?? '').slice(0, 120),
      templateId,
      fontId,
      inkColor,
      stickers: sanitizedStickers,
      ruledLines: raw.rl !== undefined ? Boolean(raw.rl) : (raw.ruledLines !== undefined ? Boolean(raw.ruledLines) : true)
    };

    return letter;
  } catch (err) {
    console.warn('Failed to parse letter data from hash', err);
    return null;
  }
}
