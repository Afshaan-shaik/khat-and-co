import { LetterData } from '../types/letter';
import { PAPER_TEMPLATES } from '../constants/templates';

export const DRAFT_STORAGE_KEY = 'khat-and-co:draft';
export const THEME_STORAGE_KEY = 'khat-and-co:theme';

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
  return {
    ...createDefaultLetter(),
    ...raw,
    stickers: Array.isArray(raw.stickers) ? raw.stickers : []
  };
}

export function loadSavedDraft(): LetterData {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return createDefaultLetter();
    const parsed = JSON.parse(raw);
    return sanitizeLoadedLetter(parsed);
  } catch (err) {
    console.warn('Could not load draft from localStorage', err);
    return createDefaultLetter();
  }
}

export function saveDraft(letter: LetterData): void {
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(letter));
  } catch (err) {
    console.warn('Could not save draft to localStorage', err);
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
