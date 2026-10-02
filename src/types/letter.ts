export interface PlacedSticker {
  id: string; // unique instance id, e.g. "stk_12345"
  stickerId: string; // key from sticker registry, e.g. "wax-seal-heart"
  x: number; // percentage of letter width (0 to 100)
  y: number; // percentage of letter width (or height)
  scale: number; // 0.4 to 2.5, default 1
  rotation: number; // degrees, -180 to 180
  zIndex: number;
}

export interface WaxSealData {
  id: string; // 'heart' | 'star' | 'infinity' | 'fleur' | 'moon' | 'crown' | 'custom'
  symbol: string; // '♡' | '✦' | '∞' | '✿' | '☽' | '♔' | custom text
  isCustom?: boolean;
  customText?: string;
  color?: string; // 'oxblood' | 'navy' | 'forest' | 'gold' | 'rose'
}

export interface LetterData {
  recipient: string; // "For Dearest Anaya"
  date: string; // "September 28, 2026"
  greeting: string; // "My Dearest,"
  body: string; // Main letter text
  signoff: string; // "Yours always,"
  sender: string; // "Afshaan"
  templateId: string; // "airmail-classic", "blush-romance", etc.
  fontId: string; // "caveat", "kalam", "amita", "dancing-script", "reenie"
  inkColor: string; // "#1F2340", etc.
  stickers: PlacedSticker[];
  ruledLines: boolean; // toggle ruled lines on or off
  waxSeal?: WaxSealData;
  city?: string; // "Pune", "Jaipur", etc.
  stamp?: number; // 0, 1, 2, 3
  ps?: string; // "P.S. The terrace plant is still alive."
  unlockDate?: string; // YYYY-MM-DD
  passphrase?: string;
  voiceNoteUrl?: string | null;
  id?: string; // unique identifier
  fontSize?: 's' | 'm' | 'l';
  language?: 'en' | 'hi';
  workspaceSessionId?: string;
  memoryFolio?: MemoryFolioData;
}

export type MemoryFocalPoint = 'center' | 'top' | 'bottom' | 'face' | 'custom';

export interface MemoryItem {
  id: string; // unique identifier, e.g. "mem_12345"
  storageObjectKey: string; // secure key
  originalFilename: string;
  mimeType: string; // 'image/jpeg' | 'image/png' | 'image/webp' | 'image/heic'
  byteSize: number;
  width: number; // e.g. 3840
  height: number; // e.g. 2160
  orientation: 'landscape' | 'portrait' | 'square';
  caption?: string; // e.g. "That evening by the sea."
  memoryDate?: string; // e.g. "14 October 2026"
  memoryTitle?: string; // optional title
  focalPoint: MemoryFocalPoint;
  focalX?: number; // percentage (0-100) if custom
  focalY?: number; // percentage (0-100) if custom
  sortOrder: number;
  createdAt: string;
  originalUrl: string; // source of truth, 4K preservation
  previewUrl: string; // high-quality display derivative
  is4K?: boolean; // true if 4K-class resolution
}

export interface MemoryFolioData {
  id: string; // unique folio id, e.g. "folio_12345"
  workspaceSessionId: string;
  letterId?: string;
  items: MemoryItem[]; // 1 to 4 photographs automatically attached to letter
  includeInLetter?: boolean; // legacy compatibility: attached photos are now always part of the letter
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceSessionRecord {
  id: string; // e.g. "ws_..."
  sessionToken: string; // cryptographically secure token
  createdAt: string;
  lastActiveAt: string;
}

export interface RecycleBinItem {
  id: string; // unique identifier for the deleted letter
  letter: LetterData;
  deletedAt: string; // ISO timestamp
}

export interface PaperTemplate {
  id: string;
  name: string;
  nameHindi: string;
  description: string;
  paperBg: string; // CSS color or gradient
  paperBorder: string; // border styling
  borderType: 'airmail' | 'rose-gold' | 'stars' | 'botanical' | 'vintage' | 'stitched' | 'slate' | 'simple';
  ruledColor: string;
  defaultInk: string;
  isDarkPaper: boolean;
  textureOverlay?: string;
  accentColor: string;
}

export interface FontOption {
  id: string;
  name: string;
  script: 'Latin & Hindi' | 'Latin' | 'Devanagari';
  family: string;
  lineHeight: number; // in pixels
  baseFontSize: number; // in pixels
  sample: string;
}

export interface WritingPrompt {
  id: number;
  english: string;
  hindi: string;
  theme: string;
}
