export interface PlacedSticker {
  id: string; // unique instance id, e.g. "stk_12345"
  stickerId: string; // key from sticker registry, e.g. "wax-seal-heart"
  x: number; // percentage of letter width (0 to 100)
  y: number; // percentage of letter width (or height)
  scale: number; // 0.4 to 2.5, default 1
  rotation: number; // degrees, -180 to 180
  zIndex: number;
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
