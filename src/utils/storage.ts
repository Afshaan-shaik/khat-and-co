import { LetterData, RecycleBinItem } from '../types/letter';
import { PAPER_TEMPLATES } from '../constants/templates';
import { DEFAULT_WAX_SEAL } from '../constants/waxSeal';
import { getOrCreateWorkspaceSession } from '../services/session';

export const DRAFT_STORAGE_KEY = 'khat-and-co:draft';
export const THEME_STORAGE_KEY = 'khat-and-co:theme';
export const SHELF_STORAGE_KEY = 'khath:shelf';
export const RECYCLE_BIN_STORAGE_KEY = 'khath:shelf:recycle_bin';

export function getFormattedToday(): string {
  try {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return 'September 28, 2026';
  }
}

export function createDefaultLetter(): LetterData {
  return {
    recipient: 'Dearest Friend',
    date: getFormattedToday(),
    greeting: 'My Dearest,',
    body: `I am writing this from across the miles, where the evening has just begun to settle quietly on my desk.\n\nA few minutes ago, I was thinking about the last time we sat together, lost in conversation without watching the clock. Sometimes the world moves too quickly, but writing to you on this paper brings everything back into focus.\n\nTell me how your week has been, what made you laugh, and what song has been stuck in your head. I hope you take a quiet minute today just for yourself.\n\nWrite back soon. I will be looking out for your letter.`,
    signoff: 'Yours always,',
    sender: 'Me',
    templateId: 'airmail-classic',
    fontId: 'caveat',
    inkColor: PAPER_TEMPLATES[0].defaultInk,
    ruledLines: true,
    waxSeal: { ...DEFAULT_WAX_SEAL },
    stickers: [
      {
        id: 'init_stamp',
        stickerId: 'stamp-airmail',
        x: 82,
        y: 6,
        scale: 1.05,
        rotation: 0,
        zIndex: 2
      },
      {
        id: 'init_postmark',
        stickerId: 'postmark-date',
        x: 74,
        y: 11,
        scale: 0.95,
        rotation: 0,
        zIndex: 3
      },
      {
        id: 'init_seal',
        stickerId: 'wax-seal-heart',
        x: 12,
        y: 86,
        scale: 1,
        rotation: 0,
        zIndex: 4
      }
    ]
  };
}

export function sanitizeLoadedLetter(raw: any): LetterData {
  if (!raw || typeof raw !== 'object') return createDefaultLetter();
  const defaultLetter = createDefaultLetter();

  let waxSeal = defaultLetter.waxSeal;
  const rawWs = raw.waxSeal || raw.ws;
  if (rawWs && typeof rawWs === 'object') {
    const symbol = String(rawWs.symbol || rawWs.s || '').trim();
    const id = String(rawWs.id || '').trim();
    if (symbol || id) {
      waxSeal = {
        id: id || (symbol === '♡' ? 'heart' : 'custom'),
        symbol: symbol || (id === 'heart' ? '♡' : 'A'),
        isCustom: rawWs.isCustom !== undefined ? Boolean(rawWs.isCustom) : Boolean(rawWs.c),
        customText: rawWs.customText ? String(rawWs.customText).slice(0, 2) : (rawWs.t ? String(rawWs.t).slice(0, 2) : 'A')
      };
    }
  }

  // Sanitize Memory Folio if attached
  let memoryFolio = undefined;
  if (raw.memoryFolio && typeof raw.memoryFolio === 'object') {
    const rawItems = Array.isArray(raw.memoryFolio.items) ? raw.memoryFolio.items : [];
    const sanitizedItems = rawItems.slice(0, 4).map((item: any, idx: number) => ({
      id: String(item.id || `mem_${Date.now()}_${idx}`),
      storageObjectKey: String(item.storageObjectKey || item.id || `key_${idx}`),
      originalFilename: String(item.originalFilename || `photo_${idx + 1}.jpg`),
      mimeType: String(item.mimeType || 'image/jpeg'),
      byteSize: Number(item.byteSize) || 0,
      width: Number(item.width) || 1920,
      height: Number(item.height) || 1080,
      orientation: item.orientation === 'portrait' ? 'portrait' : item.orientation === 'square' ? 'square' : 'landscape',
      caption: item.caption ? String(item.caption).slice(0, 200) : undefined,
      memoryDate: item.memoryDate ? String(item.memoryDate).slice(0, 100) : undefined,
      memoryTitle: item.memoryTitle ? String(item.memoryTitle).slice(0, 100) : undefined,
      focalPoint: item.focalPoint || 'center',
      focalX: item.focalX !== undefined ? Number(item.focalX) : undefined,
      focalY: item.focalY !== undefined ? Number(item.focalY) : undefined,
      sortOrder: typeof item.sortOrder === 'number' ? item.sortOrder : idx,
      createdAt: item.createdAt || new Date().toISOString(),
      originalUrl: String(item.originalUrl || item.previewUrl || ''),
      previewUrl: String(item.previewUrl || item.originalUrl || ''),
      is4K: Boolean(item.is4K || (Number(item.width) >= 3840 || Number(item.height) >= 3840))
    }));

    memoryFolio = {
      id: String(raw.memoryFolio.id || `folio_${Date.now()}`),
      workspaceSessionId: String(raw.memoryFolio.workspaceSessionId || raw.workspaceSessionId || ''),
      letterId: raw.memoryFolio.letterId || raw.id,
      items: sanitizedItems,
      includeInLetter: true,
      createdAt: raw.memoryFolio.createdAt || new Date().toISOString(),
      updatedAt: raw.memoryFolio.updatedAt || new Date().toISOString()
    };
  }

  return {
    ...defaultLetter,
    ...raw,
    waxSeal,
    stickers: Array.isArray(raw.stickers) ? raw.stickers : [],
    memoryFolio
  };
}

export function loadSavedDraft(explicitSessionId?: string): LetterData {
  try {
    const { session } = getOrCreateWorkspaceSession();
    const effectiveSessionId = explicitSessionId || session.id;
    const sessionKey = `khath:workspace_draft:${effectiveSessionId}`;

    if (typeof window !== 'undefined' && window.sessionStorage) {
      const sessionRaw = window.sessionStorage.getItem(sessionKey);
      if (sessionRaw) {
        const parsed = JSON.parse(sessionRaw);
        return sanitizeLoadedLetter({
          ...parsed,
          workspaceSessionId: effectiveSessionId
        });
      }
    }

    // Fresh workspace session starts with a clean slate
    const freshLetter = createDefaultLetter();
    freshLetter.workspaceSessionId = effectiveSessionId;
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(sessionKey, JSON.stringify(freshLetter));
    }
    return freshLetter;
  } catch (err) {
    console.warn('Could not load draft from session storage', err);
    return createDefaultLetter();
  }
}

export function saveDraft(letter: LetterData, explicitSessionId?: string): void {
  try {
    const { session } = getOrCreateWorkspaceSession();
    const effectiveSessionId = explicitSessionId || letter.workspaceSessionId || session.id;
    const sessionKey = `khath:workspace_draft:${effectiveSessionId}`;

    const letterToSave: LetterData = {
      ...letter,
      workspaceSessionId: effectiveSessionId
    };

    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(sessionKey, JSON.stringify(letterToSave));
    }
    // Backward compatibility mirror for existing tests and legacy recovery
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(letterToSave));
      } catch {}
    }
  } catch (err) {
    console.warn('Could not save draft to session storage', err);
  }
}

export function loadThemePreference(): 'dark' | 'light' {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    // Default to dark desk mode for ultra-premium stationery aesthetic
    return 'dark';
  } catch {
    return 'dark';
  }
}

export function saveThemePreference(theme: 'dark' | 'light'): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (err) {
    console.warn('Could not save theme preference', err);
  }
}

export function getLetterId(letter: LetterData, fallbackIndex?: number): string {
  if (letter.id) return letter.id;
  const base = `${letter.recipient || 'recipient'}_${letter.date || 'date'}_${letter.body ? letter.body.slice(0, 25) : ''}`;
  const clean = base.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  return fallbackIndex !== undefined ? `${clean}_${fallbackIndex}` : clean;
}

export function loadShelfLetters(): LetterData[] {
  try {
    const raw = localStorage.getItem(SHELF_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item, idx) => {
      const sanitized = sanitizeLoadedLetter(item);
      if (!sanitized.id) {
        sanitized.id = getLetterId(sanitized, idx);
      }
      return sanitized;
    });
  } catch (err) {
    console.warn('Could not load shelf letters from localStorage', err);
    return [];
  }
}

export function saveShelfLetters(letters: LetterData[]): void {
  try {
    const cleaned = letters.map((l, idx) => ({
      ...l,
      id: l.id || getLetterId(l, idx)
    }));
    localStorage.setItem(SHELF_STORAGE_KEY, JSON.stringify(cleaned.slice(-30)));
  } catch (err) {
    console.warn('Could not save shelf letters to localStorage', err);
  }
}

export function loadRecycleBin(): RecycleBinItem[] {
  try {
    const raw = localStorage.getItem(RECYCLE_BIN_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item, idx) => ({
      id: item.id || `bin_${idx}_${Date.now()}`,
      letter: sanitizeLoadedLetter(item.letter),
      deletedAt: item.deletedAt || new Date().toISOString()
    }));
  } catch (err) {
    console.warn('Could not load recycle bin from localStorage', err);
    return [];
  }
}

export function saveRecycleBin(items: RecycleBinItem[]): void {
  try {
    localStorage.setItem(RECYCLE_BIN_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('Could not save recycle bin to localStorage', err);
  }
}

export function moveToRecycleBin(letter: LetterData): RecycleBinItem {
  const shelf = loadShelfLetters();
  const letterId = letter.id || getLetterId(letter);

  // Remove from active shelf
  const updatedShelf = shelf.filter((l) => {
    if (l.id && letterId && l.id === letterId) return false;
    if (l.date === letter.date && l.recipient === letter.recipient && l.body === letter.body) {
      return false;
    }
    return true;
  });
  saveShelfLetters(updatedShelf);

  // Add to recycle bin
  const bin = loadRecycleBin();
  const newItem: RecycleBinItem = {
    id: letterId,
    letter: { ...letter, id: letterId },
    deletedAt: new Date().toISOString()
  };
  saveRecycleBin([newItem, ...bin.filter((b) => b.id !== letterId)]);
  return newItem;
}

export function restoreFromRecycleBin(id: string): LetterData | null {
  const bin = loadRecycleBin();
  const item = bin.find((b) => b.id === id);
  if (!item) return null;

  // Remove from recycle bin
  const updatedBin = bin.filter((b) => b.id !== id);
  saveRecycleBin(updatedBin);

  // Add back to shelf
  const shelf = loadShelfLetters();
  const restoredLetter = item.letter;
  saveShelfLetters([...shelf, restoredLetter]);
  return restoredLetter;
}

export function truncateFromRecycleBin(id: string): boolean {
  const bin = loadRecycleBin();
  const updatedBin = bin.filter((b) => b.id !== id);
  saveRecycleBin(updatedBin);
  return true;
}

export function emptyRecycleBin(): void {
  try {
    localStorage.removeItem(RECYCLE_BIN_STORAGE_KEY);
  } catch (err) {
    console.warn('Could not empty recycle bin', err);
  }
}
