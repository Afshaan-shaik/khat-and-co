import LZString from 'lz-string';
import { LetterData, PlacedSticker, WaxSealData } from '../types/letter';
import { PAPER_TEMPLATES } from '../constants/templates';
import { HANDWRITING_FONTS } from '../constants/fonts';
import { STICKER_REGISTRY } from '../constants/stickers';
import { DEFAULT_WAX_SEAL } from '../constants/waxSeal';

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
      ws: letter.waxSeal ? {
        id: letter.waxSeal.id,
        s: letter.waxSeal.symbol,
        c: letter.waxSeal.isCustom ? 1 : 0,
        t: letter.waxSeal.customText || ''
      } : undefined,
      vnu: letter.voiceNoteUrl ? String(letter.voiceNoteUrl) : undefined,
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

    // Check if Claude HTML pack1 format: {v:1, a:to, b:from, c:text, d:close, e:lang, f:font, g:size, h:paper, i:stickers, j:seal, k:stamp, l:city, m:date, n:ps, o:unlock, p:pass}
    if (raw.v === 1 || (raw.a !== undefined && raw.c !== undefined)) {
      const lang = raw.e === 'hi' ? 'hi' : 'en';
      const to = String(raw.a || '');
      const from = String(raw.b || '');
      const text = String(raw.c || '');
      const close = String(raw.d || (lang === 'hi' ? 'प्यार सहित' : 'With love,'));
      const font = String(raw.f || 'caveat');
      const size = (raw.g === 's' || raw.g === 'l') ? raw.g : 'm';
      const paper = String(raw.h || 'lined');
      const stamp = Number(raw.k) || 0;
      const city = String(raw.l || '');
      const date = raw.m ? new Date(raw.m).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
      const ps = String(raw.n || '');
      const unlockDate = String(raw.o || '');
      const passphrase = String(raw.p || '');

      const sealColor = (raw.j && raw.j[0]) || 'oxblood';
      const sealMono = (raw.j && raw.j[1]) || 'K';

      const stickers: PlacedSticker[] = (raw.i || []).map((arr: any, idx: number) => ({
        id: `stk_${idx}_${Date.now()}`,
        stickerId: String(arr[0] || 'heart'),
        x: Number(arr[1]) || 50,
        y: Number(arr[2]) || 50,
        scale: Number(arr[3]) ? Number(arr[3]) / 20 : 1,
        rotation: Number(arr[4]) || 0,
        zIndex: idx + 1
      }));

      return {
        recipient: to,
        sender: from,
        greeting: lang === 'hi' ? `प्रिय ${to},` : `Dear ${to},`,
        body: text,
        signoff: close,
        date,
        templateId: paper,
        fontId: font,
        inkColor: '#1F2340',
        stickers,
        ruledLines: paper === 'lined',
        waxSeal: {
          id: 'custom',
          symbol: sealMono,
          isCustom: true,
          customText: sealMono,
          color: sealColor
        },
        city,
        stamp,
        ps,
        unlockDate,
        passphrase,
        fontSize: size,
        language: lang
      };
    }

    // Sanitize & Validate standard fields
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

    const rawWs = raw.ws || raw.waxSeal;
    const waxSeal: WaxSealData = (rawWs && typeof rawWs === 'object')
      ? {
          id: String(rawWs.id || (rawWs.s === '♡' ? 'heart' : 'custom')),
          symbol: String(rawWs.s || rawWs.symbol || '♡'),
          isCustom: rawWs.c !== undefined ? Boolean(rawWs.c) : Boolean(rawWs.isCustom),
          customText: String(rawWs.t || rawWs.customText || 'A').slice(0, 2),
          color: String(rawWs.color || 'oxblood')
        }
      : { ...DEFAULT_WAX_SEAL };

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
      ruledLines: raw.rl !== undefined ? Boolean(raw.rl) : (raw.ruledLines !== undefined ? Boolean(raw.ruledLines) : true),
      waxSeal,
      city: raw.city || raw.l || '',
      stamp: raw.stamp !== undefined ? Number(raw.stamp) : (raw.k !== undefined ? Number(raw.k) : 0),
      ps: raw.ps || raw.n || '',
      unlockDate: raw.unlockDate || raw.o || '',
      passphrase: raw.passphrase || raw.p || '',
      fontSize: raw.fontSize || raw.g || 'm',
      language: raw.language || (raw.e === 'hi' ? 'hi' : 'en'),
      voiceNoteUrl: raw.vnu || raw.voiceNoteUrl || null
    };

    return letter;
  } catch (err) {
    console.warn('Failed to parse letter data from hash', err);
    return null;
  }
}
