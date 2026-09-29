import { WaxSealData, LetterData } from '../types/letter';

export interface WaxSealOption {
  id: string;
  label: string;
  symbol: string;
  description: string;
}

export const WAX_PALETTES: Record<string, [string, string, string]> = {
  oxblood: ['#7F1D2B', '#54101B', '#B0404F'],
  navy: ['#2B3563', '#181E40', '#5567A6'],
  forest: ['#2F5D46', '#1B3A2A', '#5A9377'],
  gold: ['#B58A2E', '#75521A', '#E2C170'],
  rose: ['#B4576A', '#7C3143', '#DE93A3']
};

export const DEFAULT_WAX_SEAL: WaxSealData = {
  id: 'heart',
  symbol: '♡',
  isCustom: false,
  customText: 'A',
  color: 'oxblood'
};

export const WAX_SEAL_OPTIONS: WaxSealOption[] = [
  { id: 'heart', label: '♡', symbol: '♡', description: 'Heart' },
  { id: 'star', label: '✦', symbol: '✦', description: 'Star' },
  { id: 'infinity', label: '∞', symbol: '∞', description: 'Infinity' },
  { id: 'fleur', label: '✿', symbol: '✿', description: 'Fleur' },
  { id: 'moon', label: '☽', symbol: '☽', description: 'Moon' },
  { id: 'crown', label: '♔', symbol: '♔', description: 'Crown' },
  { id: 'custom', label: 'A', symbol: 'A', description: 'Your Initial' }
];

export const HEART_PATH = 'M50 86C14 60 16 26 36 26C44 26 50 32 50 38C50 32 56 26 64 26C84 26 86 60 50 86Z';

let sealIdCounter = 0;

/**
 * Renders complete 3D realistic wax seal SVG string with scalloped rim, lighting and emblem/monogram.
 */
export function renderWaxSealSvg(colorKey: string = 'oxblood', monogramOrSymbol?: string, px?: number): string {
  const w = WAX_PALETTES[colorKey] || WAX_PALETTES.oxblood;
  const b = w[0];
  const d = w[1];
  const l = w[2];
  const id = 'sg_' + (++sealIdCounter);
  const m = (monogramOrSymbol || '').slice(0, 2);

  let rim = '';
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * 6.2832 + 0.25;
    const r = 37 + ((i * 37) % 5);
    rim += `<circle cx="${(50 + Math.cos(a) * r * 0.93).toFixed(1)}" cy="${(50 + Math.sin(a) * r * 0.93).toFixed(1)}" r="${7 + ((i * 13) % 4)}" fill="${b}"/>`;
  }

  const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] || c));

  let mark = '';
  if (m && m !== '♡') {
    const fontSize = m.length > 1 ? 25 : 32;
    mark = `<text x="50.8" y="51.6" text-anchor="middle" dominant-baseline="central" font-family="'Bodoni Moda',serif" font-size="${fontSize}" fill="${l}" opacity=".55">${esc(m)}</text><text x="50" y="50.6" text-anchor="middle" dominant-baseline="central" font-family="'Bodoni Moda',serif" font-size="${fontSize}" fill="${d}">${esc(m)}</text>`;
  } else {
    mark = `<path d="${HEART_PATH}" transform="translate(28.5 28) scale(.43)" fill="${l}" opacity=".5"/><path d="${HEART_PATH}" transform="translate(28 27) scale(.43)" fill="${d}"/>`;
  }

  return `<svg viewBox="0 0 100 100"${px ? ` width="${px}" height="${px}"` : ''} aria-hidden="true"><defs><radialGradient id="${id}" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="${l}"/><stop offset=".5" stop-color="${b}"/><stop offset="1" stop-color="${d}"/></radialGradient></defs>${rim}<circle cx="50" cy="50" r="40" fill="url(#${id})"/><circle cx="50" cy="50" r="31" fill="none" stroke="${d}" stroke-opacity=".55" stroke-width="2"/><circle cx="50" cy="50" r="31" fill="none" stroke="${l}" stroke-opacity=".4" stroke-width="1" transform="translate(.9 .9)"/>${mark}</svg>`;
}

export function renderWaxSealHalves(colorKey: string = 'oxblood', monogramOrSymbol?: string): string {
  const sealSvg = renderWaxSealSvg(colorKey, monogramOrSymbol);
  return `<div class="seal-wrap"><div class="seal-half l">${sealSvg}</div><div class="seal-half r">${sealSvg}</div></div>`;
}

/**
 * Deterministically resolves the wax seal to render.
 * Zero fallback to default if a valid custom or predefined seal exists.
 * Safe fallback to DEFAULT_WAX_SEAL if completely undefined (e.g. legacy letters).
 */
export function resolveWaxSeal(letterOrSeal?: LetterData | WaxSealData | null): WaxSealData {
  if (!letterOrSeal) return { ...DEFAULT_WAX_SEAL };
  const seal: WaxSealData | undefined =
    'waxSeal' in letterOrSeal ? letterOrSeal.waxSeal : (letterOrSeal as WaxSealData);
  if (seal && typeof seal === 'object') {
    const symbol = String(seal.symbol || '').trim();
    const id = String(seal.id || '').trim();
    const color = String(seal.color || 'oxblood').trim();
    if (symbol || id) {
      return {
        id: id || (symbol === '♡' ? 'heart' : 'custom'),
        symbol: symbol || (id === 'heart' ? '♡' : 'A'),
        isCustom: Boolean(seal.isCustom),
        customText: seal.customText ? String(seal.customText).slice(0, 2) : 'A',
        color: WAX_PALETTES[color] ? color : 'oxblood'
      };
    }
  }
  return { ...DEFAULT_WAX_SEAL };
}
