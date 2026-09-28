import { FontOption } from '../types/letter';

export const HANDWRITING_FONTS: FontOption[] = [
  {
    id: 'caveat',
    name: 'Caveat',
    script: 'Latin & Hindi',
    family: "'Caveat', 'Kalam', cursive",
    lineHeight: 38,
    baseFontSize: 23,
    sample: 'Dearest friend · प्रिय मित्र'
  },
  {
    id: 'kalam',
    name: 'Kalam (कलम)',
    script: 'Devanagari',
    family: "'Kalam', cursive",
    lineHeight: 46, // Taller line height for Devanagari matras & ascenders
    baseFontSize: 20,
    sample: 'खत तुम्हारे नाम · Written for you'
  },
  {
    id: 'amita',
    name: 'Amita (अमिता)',
    script: 'Devanagari',
    family: "'Amita', 'Kalam', cursive",
    lineHeight: 48, // Generous line height for elegant Devanagari strokes
    baseFontSize: 19,
    sample: 'सदा तुम्हारी याद · Always yours'
  },
  {
    id: 'dancing',
    name: 'Dancing Script',
    script: 'Latin & Hindi',
    family: "'Dancing Script', 'Kalam', cursive",
    lineHeight: 40,
    baseFontSize: 21,
    sample: 'With all my heart · पूरे दिल से'
  },
  {
    id: 'reenie',
    name: 'Reenie Beanie',
    script: 'Latin & Hindi',
    family: "'Reenie Beanie', 'Kalam', cursive",
    lineHeight: 40,
    baseFontSize: 26,
    sample: 'Quick little note · बस यूँ ही'
  }
];

export const INK_PALETTES = {
  lightPaper: [
    { name: 'Ink Navy', hex: '#1F2340' },
    { name: 'Rose Petal', hex: '#B4455A' },
    { name: 'Deep Forest', hex: '#26422F' },
    { name: 'Warm Espresso', hex: '#3B291D' },
    { name: 'Twilight Blue', hex: '#243C66' },
    { name: 'Royal Plum', hex: '#48203E' }
  ],
  darkPaper: [
    { name: 'Paper Cream', hex: '#F6EFE3' },
    { name: 'Moonlight Gold', hex: '#FAD889' },
    { name: 'Soft Rose Starlight', hex: '#F5B8C6' },
    { name: 'Silver Frost', hex: '#E5ECF6' },
    { name: 'Sage Mint Glow', hex: '#C7E8D8' },
    { name: 'Lilac Whisper', hex: '#E5D6F8' }
  ]
};
