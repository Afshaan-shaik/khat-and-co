import { WaxSealData, LetterData } from '../types/letter';

export interface WaxSealOption {
  id: string;
  label: string;
  symbol: string;
  description: string;
}

export const DEFAULT_WAX_SEAL: WaxSealData = {
  id: 'heart',
  symbol: '♡',
  isCustom: false,
  customText: 'A'
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
    if (symbol || id) {
      return {
        id: id || (symbol === '♡' ? 'heart' : 'custom'),
        symbol: symbol || (id === 'heart' ? '♡' : 'A'),
        isCustom: Boolean(seal.isCustom),
        customText: seal.customText ? String(seal.customText).slice(0, 2) : 'A'
      };
    }
  }
  return { ...DEFAULT_WAX_SEAL };
}
