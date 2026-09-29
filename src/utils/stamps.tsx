const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

interface EllipseOptions {
  cx?: number;
  cy?: number;
  off?: number;
  x?: string;
}

const P = (n: number, rx: number, ry: number, d: number, fill: string, o?: EllipseOptions) => {
  const opt = o || {};
  const cx = opt.cx == null ? 50 : opt.cx;
  const cy = opt.cy == null ? 50 : opt.cy;
  const off = opt.off || 0;
  return Array.from({ length: n }, (_, i) => (
    `<ellipse cx="${cx}" cy="${cy - d}" rx="${rx}" ry="${ry}" fill="${fill}" ${opt.x || ''} transform="rotate(${i * 360 / n + off} ${cx} ${cy})"/>`
  )).join('');
};

export interface PostageStamp {
  id: number;
  name: string;
  bg: string;
  art: string;
}

export const POSTAGE_STAMPS: PostageStamp[] = [
  {
    id: 0,
    name: 'Dil',
    bg: '#F2D6D0',
    art: '<path d="M32 52C14 40 18 22 28 22C31 22 32 25 32 27C32 25 33 22 36 22C46 22 50 40 32 52Z" fill="#B3283A"/>'
  },
  {
    id: 1,
    name: 'Patang',
    bg: '#D9E4F0',
    art: '<path d="M32 16L48 34L32 54L16 34Z" fill="#E0703A"/><path d="M32 16V54M16 34H48" stroke="#FBF3E4" stroke-width="1.2"/><path d="M32 54Q24 57 30 60T30 63" stroke="#1F2340" fill="none" stroke-width="1.2"/>'
  },
  {
    id: 2,
    name: 'Chai',
    bg: '#EFE0C5',
    art: '<path d="M20 34H44V42Q44 52 32 52Q20 52 20 42Z" fill="#1F2340"/><path d="M44 37Q52 37 50 44Q48 48 43 47" fill="none" stroke="#1F2340" stroke-width="2"/><ellipse cx="32" cy="54" rx="16" ry="2.6" fill="#7F1D2B"/><path d="M27 30Q23 26 27 22M33 30Q29 26 33 21M39 30Q35 26 39 22" stroke="#7F1D2B" fill="none" stroke-width="1.4" stroke-linecap="round"/>'
  },
  {
    id: 3,
    name: 'Genda',
    bg: '#F8E2B0',
    art: P(10, 4.5, 8, 13, '#E9922B', { cx: 32, cy: 37 }) + P(10, 4, 7, 8, '#F2B233', { cx: 32, cy: 37, off: 18 }) + '<circle cx="32" cy="37" r="4.5" fill="#A5541A"/>'
  }
];

let stampUid = 0;

export function renderPostageStampSvg(index: number = 0, px?: number): string {
  const s = POSTAGE_STAMPS[(index || 0) % POSTAGE_STAMPS.length];
  const id = 'st_' + (++stampUid);
  let h = '';
  for (let x = 4; x <= 60; x += 8) {
    h += `<circle cx="${x}" cy="0" r="2.6"/><circle cx="${x}" cy="78" r="2.6"/>`;
  }
  for (let y = 4; y <= 74; y += 8) {
    h += `<circle cx="0" cy="${y}" r="2.6"/><circle cx="64" cy="${y}" r="2.6"/>`;
  }
  return `<svg viewBox="0 0 64 78"${px ? ` width="${px}" height="${px * 78 / 64}"` : ''} aria-hidden="true"><defs><mask id="${id}"><rect width="64" height="78" fill="#fff"/><g fill="#000">${h}</g></mask></defs><g mask="url(#${id})"><rect width="64" height="78" fill="#FBF6EA"/><rect x="5" y="5" width="54" height="68" fill="${s.bg}"/>${s.art}<text x="32" y="68.5" text-anchor="middle" font-family="Bodoni Moda,serif" font-size="6.4" fill="#1F2340">${s.name}</text></g></svg>`;
}

let postmarkUid = 0;

export function renderPostmarkSvg(city?: string, date?: number | string): string {
  const id = 'pm_' + (++postmarkUid);
  const c = (city || '').toUpperCase().slice(0, 10) || 'POSTED';
  const d = new Date(date || Date.now());
  const esc = (str: string) => str.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m] || m));

  return `<svg viewBox="0 0 120 70" aria-hidden="true"><defs><path id="${id}" d="M31 40A19 19 0 0 1 69 40"/></defs><g fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="50" cy="40" r="30"/><circle cx="50" cy="40" r="26.5" stroke-width=".8"/><path d="M84 26q6-5 12 0t12 0M84 36q6-5 12 0t12 0M84 46q6-5 12 0t12 0"/></g><text font-size="6.4" font-family="Hanken Grotesk,sans-serif" font-weight="600" letter-spacing=".8" fill="currentColor"><textPath href="#${id}" startOffset="50%" text-anchor="middle">${esc(c)}</textPath></text><text x="50" y="45" text-anchor="middle" font-size="8" font-family="Hanken Grotesk,sans-serif" font-weight="600" fill="currentColor">${d.getDate()} ${MON[d.getMonth()]}</text><text x="50" y="54" text-anchor="middle" font-size="7.4" font-family="Hanken Grotesk,sans-serif" fill="currentColor">${d.getFullYear()}</text></svg>`;
}
