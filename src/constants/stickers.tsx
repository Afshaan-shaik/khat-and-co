import React from 'react';

export interface StickerDefinition {
  id: string;
  name: string;
  category: 'hearts-seals' | 'stamps-postmarks' | 'sky-garden-tape' | 'little-things-words';
  width: number;
  height: number;
  render: (todayDateStr?: string) => React.ReactNode;
}

export const STICKER_CATEGORIES = [
  { id: 'hearts-seals', label: 'Hearts & Seals', labelHindi: 'दिल व मोहर' },
  { id: 'stamps-postmarks', label: 'Stamps & Postmarks', labelHindi: 'डाक टिकट व मुहर' },
  { id: 'sky-garden-tape', label: 'Sky, Garden & Tape', labelHindi: 'आसमाँ, फूल व टेप' },
  { id: 'little-things-words', label: 'Little Things & Words', labelHindi: 'छोटी चीज़ें व अलफ़ाज़' }
] as const;

export const STICKER_REGISTRY: Record<string, StickerDefinition> = {
  // -------------------------------------------------------------
  // GROUP 1: HEARTS & SEALS
  // -------------------------------------------------------------
  'wax-seal-heart': {
    id: 'wax-seal-heart',
    name: 'Rose Wax Seal',
    category: 'hearts-seals',
    width: 68,
    height: 68,
    render: () => (
      <svg viewBox="0 0 68 68" width="100%" height="100%" fill="none">
        <defs>
          <filter id="seal-shadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="1" dy="3" stdDeviation="2" floodColor="#1F2340" floodOpacity="0.25" />
          </filter>
        </defs>
        {/* Organic scalloped wax edge */}
        <path
          d="M34 6 C42 5 46 9 53 13 C59 18 62 23 62 31 C63 39 59 46 54 52 C48 58 41 62 33 62 C25 61 19 59 13 53 C8 47 6 41 6 33 C6 25 10 18 16 13 C22 8 26 6 34 6 Z"
          fill="#B4455A"
          stroke="#1F2340"
          strokeWidth="2.5"
          filter="url(#seal-shadow)"
        />
        {/* Inner rim */}
        <circle cx="34" cy="34" r="20" stroke="rgba(246, 239, 227, 0.4)" strokeWidth="1.5" strokeDasharray="3 2" />
        {/* Wax seal heart motif */}
        <path
          d="M34 43 L32.5 41.6 C27.5 37 24 33.8 24 29.8 C24 26.5 26.5 24 29.8 24 C31.6 24 33.3 24.8 34 26.1 C34.7 24.8 36.4 24 38.2 24 C41.5 24 44 26.5 44 29.8 C44 33.8 40.5 37 35.5 41.6 L34 43 Z"
          fill="#F6EFE3"
        />
      </svg>
    )
  },
  'wax-seal-flower': {
    id: 'wax-seal-flower',
    name: 'Botanical Seal',
    category: 'hearts-seals',
    width: 68,
    height: 68,
    render: () => (
      <svg viewBox="0 0 68 68" width="100%" height="100%" fill="none">
        <path
          d="M34 6 C41 4 48 8 54 13 C60 19 63 26 62 34 C61 42 58 49 52 55 C46 60 39 63 32 62 C24 62 18 57 12 51 C7 45 5 38 6 31 C7 23 11 16 17 11 C23 7 28 6 34 6 Z"
          fill="#943749"
          stroke="#1F2340"
          strokeWidth="2.5"
        />
        <circle cx="34" cy="34" r="18" stroke="rgba(246, 239, 227, 0.35)" strokeWidth="1.5" />
        {/* Pressed botanical rose/sprig motif */}
        <path d="M34 42 C34 32 34 26 34 24" stroke="#F6EFE3" strokeWidth="2" strokeLinecap="round" />
        <path d="M34 36 C38 34 40 31 39 28 C37 28 35 31 34 34" fill="#F6EFE3" />
        <path d="M34 32 C30 30 28 27 29 24 C31 24 33 27 34 30" fill="#F6EFE3" />
        <circle cx="34" cy="23" r="3" fill="#F6EFE3" />
      </svg>
    )
  },
  'heart-classic': {
    id: 'heart-classic',
    name: 'Classic Rose Heart',
    category: 'hearts-seals',
    width: 52,
    height: 48,
    render: () => (
      <svg viewBox="0 0 52 48" width="100%" height="100%" fill="none">
        <path
          d="M26 44 L23.8 42 C13 32.2 6 25.8 6 17.8 C6 11.2 11.2 6 17.8 6 C21.5 6 25 7.7 26 10.3 C27 7.7 30.5 6 34.2 6 C40.8 6 46 11.2 46 17.8 C46 25.8 39 32.2 28.2 42 L26 44 Z"
          fill="#B4455A"
          stroke="#1F2340"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
  'heart-double': {
    id: 'heart-double',
    name: 'Twin Entwined Hearts',
    category: 'hearts-seals',
    width: 64,
    height: 48,
    render: () => (
      <svg viewBox="0 0 64 48" width="100%" height="100%" fill="none">
        {/* Left heart */}
        <path
          d="M24 38 L22 36.3 C12 27.6 6 22 6 15 C6 9.2 10.5 4.6 16.3 4.6 C19.6 4.6 22.7 6.1 24 8.5 C25.3 6.1 28.4 4.6 31.7 4.6 C37.5 4.6 42 9.2 42 15 C42 18.2 40.5 21.2 38 24"
          fill="#D98A9A"
          stroke="#1F2340"
          strokeWidth="2.5"
        />
        {/* Right heart overlapping */}
        <path
          d="M40 44 L38.2 42.4 C29 34.3 23 29.1 23 22.5 C23 17.2 27.1 13 32.5 13 C35.5 13 38.3 14.4 40 16.5 C41.7 14.4 44.5 13 47.5 13 C52.9 13 57 17.2 57 22.5 C57 29.1 51 34.3 41.8 42.4 L40 44 Z"
          fill="#B4455A"
          stroke="#1F2340"
          strokeWidth="2.5"
        />
      </svg>
    )
  },
  'envelope-tilted': {
    id: 'envelope-tilted',
    name: 'Airmail Envelope',
    category: 'hearts-seals',
    width: 64,
    height: 48,
    render: () => (
      <svg viewBox="0 0 64 48" width="100%" height="100%" fill="none">
        <g transform="rotate(-6 32 24)">
          <rect x="4" y="6" width="56" height="36" rx="4" fill="#F6EFE3" stroke="#1F2340" strokeWidth="2.4" />
          <line x1="8" y1="12" x2="56" y2="12" stroke="#B4455A" strokeWidth="1.8" strokeDasharray="3 2" />
          <line x1="8" y1="36" x2="56" y2="36" stroke="#3E5C8A" strokeWidth="1.8" strokeDasharray="3 2" />
          <path d="M6 7 L32 26 L58 7" stroke="#1F2340" strokeWidth="2" strokeLinecap="round" />
          <circle cx="32" cy="26" r="6" fill="#B4455A" stroke="#1F2340" strokeWidth="1.5" />
          <path d="M32 29 L31.3 28.3 C29.4 26.6 28 25.3 28 23.7 C28 22.4 29 21.4 30.3 21.4 C31 21.4 31.7 21.7 32 22.2 C32.3 21.7 33 21.4 33.7 21.4 C35 21.4 36 22.4 36 23.7 C36 25.3 34.6 26.6 32.7 28.3 Z" fill="#F6EFE3" />
        </g>
      </svg>
    )
  },
  'heart-ribbon': {
    id: 'heart-ribbon',
    name: 'Tied with Ribbon',
    category: 'hearts-seals',
    width: 58,
    height: 54,
    render: () => (
      <svg viewBox="0 0 58 54" width="100%" height="100%" fill="none">
        <path
          d="M29 42 L27.2 40.4 C18.2 32.2 12 26.6 12 19.8 C12 14.2 16.4 9.8 22 9.8 C25.1 9.8 28.1 11.2 29 13.5 C29.9 11.2 32.9 9.8 36 9.8 C41.6 9.8 46 14.2 46 19.8 C46 26.6 39.8 32.2 30.8 40.4 L29 42 Z"
          fill="#E9B7C1"
          stroke="#1F2340"
          strokeWidth="2.4"
        />
        {/* Ribbon knot */}
        <circle cx="29" cy="24" r="3" fill="#B4455A" stroke="#1F2340" strokeWidth="1.8" />
        <path d="M29 24 C23 20 18 25 21 28 C24 30 28 26 29 24 Z" fill="#B4455A" stroke="#1F2340" strokeWidth="1.6" />
        <path d="M29 24 C35 20 40 25 37 28 C34 30 30 26 29 24 Z" fill="#B4455A" stroke="#1F2340" strokeWidth="1.6" />
        <path d="M29 25 C28 32 24 38 22 42" stroke="#B4455A" strokeWidth="2" strokeLinecap="round" />
        <path d="M29 25 C30 32 34 38 36 42" stroke="#B4455A" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  },
  'heart-sparkle': {
    id: 'heart-sparkle',
    name: 'Sparkling Heart',
    category: 'hearts-seals',
    width: 54,
    height: 50,
    render: () => (
      <svg viewBox="0 0 54 50" width="100%" height="100%" fill="none">
        <path
          d="M24 38 L22.4 36.5 C14.4 29 9 24 9 17.8 C9 12.8 13 8.8 18 8.8 C20.8 8.8 23.4 10.1 24 12 C24.6 10.1 27.2 8.8 30 8.8 C35 8.8 39 12.8 39 17.8 C39 24 33.6 29 25.6 36.5 L24 38 Z"
          fill="#FCF0EC"
          stroke="#1F2340"
          strokeWidth="2.2"
        />
        <path d="M42 8 L44 14 L50 16 L44 18 L42 24 L40 18 L34 16 L40 14 Z" fill="#FAD889" stroke="#1F2340" strokeWidth="1.5" />
        <circle cx="8" cy="28" r="2" fill="#B4455A" />
        <circle cx="12" cy="34" r="1.5" fill="#FAD889" />
      </svg>
    )
  },
  'heart-pierced': {
    id: 'heart-pierced',
    name: "Cupid's Arrow",
    category: 'hearts-seals',
    width: 64,
    height: 52,
    render: () => (
      <svg viewBox="0 0 64 52" width="100%" height="100%" fill="none">
        <path
          d="M32 44 L30 42.2 C19 32.5 12 26 12 18 C12 11.4 17.2 6.2 23.8 6.2 C27.5 6.2 31 7.9 32 10.5 C33 7.9 36.5 6.2 40.2 6.2 C46.8 6.2 52 11.4 52 18 C52 26 45 32.5 34 42.2 L32 44 Z"
          fill="#D98A9A"
          stroke="#1F2340"
          strokeWidth="2.5"
        />
        {/* Arrow through heart */}
        <line x1="6" y1="46" x2="58" y2="6" stroke="#1F2340" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M58 6 L50 8 L56 14 Z" fill="#1F2340" />
        <path d="M6 46 L12 44 L8 40 Z" fill="#1F2340" />
      </svg>
    )
  },

  // -------------------------------------------------------------
  // GROUP 2: STAMPS & POSTMARKS
  // -------------------------------------------------------------
  'stamp-airmail': {
    id: 'stamp-airmail',
    name: 'Airmail Dove Stamp',
    category: 'stamps-postmarks',
    width: 64,
    height: 76,
    render: () => (
      <svg viewBox="0 0 64 76" width="100%" height="100%" fill="none">
        <defs>
          <pattern id="stamp-perforation" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="1.8" fill="#1F2340" />
          </pattern>
        </defs>
        {/* Stamp body with jagged perforated edges */}
        <rect x="3" y="3" width="58" height="70" rx="3" fill="#F6EFE3" stroke="#3E5C8A" strokeWidth="2" strokeDasharray="3 3" />
        <rect x="7" y="7" width="50" height="62" fill="#EAF0F8" stroke="#3E5C8A" strokeWidth="1.5" />
        {/* Dove carrying letter */}
        <path
          d="M22 36 C24 30 30 26 38 28 C42 29 46 27 48 24 C46 30 43 33 40 34 C44 38 41 44 34 44 C28 44 24 40 22 36 Z"
          fill="#FFFFFF"
          stroke="#3E5C8A"
          strokeWidth="1.6"
        />
        <text x="32" y="58" textAnchor="middle" fill="#3E5C8A" fontSize="7" fontFamily="'Instrument Sans', sans-serif" fontWeight="600" letterSpacing="0.8">
          AIR MAIL
        </text>
        <text x="32" y="66" textAnchor="middle" fill="#B4455A" fontSize="6" fontFamily="'Instrument Sans', sans-serif" fontWeight="700">
          ₹ 5.00
        </text>
      </svg>
    )
  },
  'stamp-tajmahal': {
    id: 'stamp-tajmahal',
    name: 'Taj Mahal Stamp',
    category: 'stamps-postmarks',
    width: 64,
    height: 76,
    render: () => (
      <svg viewBox="0 0 64 76" width="100%" height="100%" fill="none">
        <rect x="3" y="3" width="58" height="70" rx="3" fill="#FDF7F2" stroke="#B4455A" strokeWidth="2" strokeDasharray="3 3" />
        <rect x="7" y="7" width="50" height="62" fill="#FAF0E8" stroke="#B4455A" strokeWidth="1.5" />
        {/* Taj Mahal dome silhouette */}
        <path
          d="M20 44 L20 38 L24 38 L24 44 M40 44 L40 38 L44 38 L44 44 M26 44 L26 32 C26 26 32 20 32 20 C32 20 38 26 38 32 L38 44 Z"
          fill="#B4455A"
        />
        <line x1="16" y1="44" x2="48" y2="44" stroke="#B4455A" strokeWidth="2" />
        <line x1="18" y1="26" x2="18" y2="44" stroke="#B4455A" strokeWidth="1.2" />
        <line x1="46" y1="26" x2="46" y2="44" stroke="#B4455A" strokeWidth="1.2" />
        <text x="32" y="56" textAnchor="middle" fill="#B4455A" fontSize="7" fontFamily="'Kalam', cursive">
          भारत INDIA
        </text>
        <text x="32" y="65" textAnchor="middle" fill="#1F2340" fontSize="6" fontFamily="'Instrument Sans', sans-serif" fontWeight="600">
          KHATH &amp; CO
        </text>
      </svg>
    )
  },
  'stamp-botanical': {
    id: 'stamp-botanical',
    name: 'Fern Leaf Stamp',
    category: 'stamps-postmarks',
    width: 64,
    height: 76,
    render: () => (
      <svg viewBox="0 0 64 76" width="100%" height="100%" fill="none">
        <rect x="3" y="3" width="58" height="70" rx="3" fill="#F4F8F4" stroke="#26422F" strokeWidth="2" strokeDasharray="3 3" />
        <rect x="7" y="7" width="50" height="62" fill="#EBF2EA" stroke="#26422F" strokeWidth="1.5" />
        <path d="M32 46 C32 36 32 28 32 22" stroke="#26422F" strokeWidth="2" strokeLinecap="round" />
        <path d="M32 38 C38 36 41 33 40 30 C38 30 35 33 32 36" fill="#4A6F4E" />
        <path d="M32 34 C26 32 23 29 24 26 C26 26 29 29 32 32" fill="#4A6F4E" />
        <path d="M32 28 C37 26 39 23 38 21 C36 21 34 23 32 26" fill="#4A6F4E" />
        <path d="M32 24 C28 22 26 20 27 18 C29 18 31 20 32 22" fill="#4A6F4E" />
        <text x="32" y="58" textAnchor="middle" fill="#26422F" fontSize="7" fontFamily="'Instrument Serif', serif" fontStyle="italic">
          Botanica
        </text>
        <text x="32" y="66" textAnchor="middle" fill="#4A6F4E" fontSize="6" fontFamily="'Instrument Sans', sans-serif">
          10c
        </text>
      </svg>
    )
  },
  'stamp-rose': {
    id: 'stamp-rose',
    name: 'Vintage Rose Stamp',
    category: 'stamps-postmarks',
    width: 64,
    height: 76,
    render: () => (
      <svg viewBox="0 0 64 76" width="100%" height="100%" fill="none">
        <rect x="3" y="3" width="58" height="70" rx="3" fill="#FFF5F7" stroke="#7A2838" strokeWidth="2" strokeDasharray="3 3" />
        <rect x="7" y="7" width="50" height="62" fill="#FCE8EC" stroke="#7A2838" strokeWidth="1.5" />
        {/* Blooming rose drawing */}
        <circle cx="32" cy="30" r="10" fill="#B4455A" />
        <path d="M32 24 C28 24 26 28 32 34 C38 28 36 24 32 24 Z" fill="#FCF0EC" opacity="0.8" />
        <path d="M32 40 C32 46 32 48 32 48" stroke="#26422F" strokeWidth="2" strokeLinecap="round" />
        <text x="32" y="58" textAnchor="middle" fill="#7A2838" fontSize="7" fontFamily="'Instrument Serif', serif">
          Rose of Love
        </text>
        <text x="32" y="66" textAnchor="middle" fill="#B4455A" fontSize="6" fontFamily="'Instrument Sans', sans-serif" fontWeight="700">
          POSTAGE
        </text>
      </svg>
    )
  },
  'stamp-mountain': {
    id: 'stamp-mountain',
    name: 'Mountain Sunrise Stamp',
    category: 'stamps-postmarks',
    width: 64,
    height: 76,
    render: () => (
      <svg viewBox="0 0 64 76" width="100%" height="100%" fill="none">
        <rect x="3" y="3" width="58" height="70" rx="3" fill="#F5F9FC" stroke="#243C66" strokeWidth="2" strokeDasharray="3 3" />
        <rect x="7" y="7" width="50" height="62" fill="#E2EDF8" stroke="#243C66" strokeWidth="1.5" />
        <circle cx="32" cy="24" r="7" fill="#FAD889" />
        <polygon points="12,46 26,28 38,46" fill="#3E5C8A" />
        <polygon points="28,46 42,32 52,46" fill="#243C66" />
        <polygon points="26,28 23,32 29,32" fill="#FFFFFF" />
        <text x="32" y="58" textAnchor="middle" fill="#243C66" fontSize="7" fontFamily="'Instrument Sans', sans-serif" fontWeight="600">
          DISTANT HILLS
        </text>
        <text x="32" y="66" textAnchor="middle" fill="#3E5C8A" fontSize="6" fontFamily="'Instrument Sans', sans-serif">
          SPECIAL DELIVERY
        </text>
      </svg>
    )
  },
  'postmark-date': {
    id: 'postmark-date',
    name: "Today's Postmark",
    category: 'stamps-postmarks',
    width: 84,
    height: 84,
    render: (todayDateStr) => {
      let dateDisplay = '';
      try {
        if (todayDateStr) {
          const parsed = new Date(todayDateStr);
          if (!isNaN(parsed.getTime())) {
            dateDisplay = parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
          } else {
            dateDisplay = String(todayDateStr).slice(0, 11).toUpperCase();
          }
        }
      } catch {}
      if (!dateDisplay) {
        dateDisplay = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
      }
      return (
        <svg viewBox="0 0 84 84" width="100%" height="100%" fill="none">
          {/* Circular postal cancellation mark */}
          <circle cx="42" cy="42" r="38" stroke="#1F2340" strokeWidth="2" opacity="0.85" />
          <circle cx="42" cy="42" r="32" stroke="#1F2340" strokeWidth="1.2" strokeDasharray="4 2" opacity="0.75" />
          {/* Top arched text simulation */}
          <text x="42" y="24" textAnchor="middle" fill="#1F2340" fontSize="7" fontFamily="'Instrument Sans', sans-serif" fontWeight="700" letterSpacing="1.2" opacity="0.85">
            KHATH &amp; CO. POST
          </text>
          {/* Today's dynamic date in center */}
          <line x1="16" y1="36" x2="68" y2="36" stroke="#1F2340" strokeWidth="1.5" opacity="0.7" />
          <text x="42" y="46" textAnchor="middle" fill="#B4455A" fontSize="8" fontFamily="'Instrument Sans', sans-serif" fontWeight="700" letterSpacing="0.8">
            {dateDisplay}
          </text>
          <line x1="16" y1="52" x2="68" y2="52" stroke="#1F2340" strokeWidth="1.5" opacity="0.7" />
          <text x="42" y="64" textAnchor="middle" fill="#1F2340" fontSize="6.5" fontFamily="'Kalam', cursive" opacity="0.8">
            डाक घर · SENT WITH LOVE
          </text>
        </svg>
      );
    }
  },
  'postmark-wavy': {
    id: 'postmark-wavy',
    name: 'Wavy Cancellation Mark',
    category: 'stamps-postmarks',
    width: 90,
    height: 44,
    render: () => (
      <svg viewBox="0 0 90 44" width="100%" height="100%" fill="none" opacity="0.8">
        <path d="M4 10 Q14 2 24 10 T44 10 T64 10 T84 10" stroke="#1F2340" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M4 22 Q14 14 24 22 T44 22 T64 22 T84 22" stroke="#1F2340" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M4 34 Q14 26 24 34 T44 34 T64 34 T84 34" stroke="#1F2340" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    )
  },
  'stamp-priority': {
    id: 'stamp-priority',
    name: 'Par Avion / Priority',
    category: 'stamps-postmarks',
    width: 86,
    height: 38,
    render: () => (
      <svg viewBox="0 0 86 38" width="100%" height="100%" fill="none">
        <rect x="2" y="2" width="82" height="34" rx="3" fill="#3E5C8A" stroke="#1F2340" strokeWidth="2" />
        <rect x="5" y="5" width="76" height="28" rx="2" fill="none" stroke="#F6EFE3" strokeWidth="1" strokeDasharray="3 2" />
        <text x="43" y="18" textAnchor="middle" fill="#F6EFE3" fontSize="8" fontFamily="'Instrument Sans', sans-serif" fontWeight="700" letterSpacing="1">
          PAR AVION
        </text>
        <text x="43" y="28" textAnchor="middle" fill="#FAD889" fontSize="6.5" fontFamily="'Instrument Sans', sans-serif" fontWeight="600" letterSpacing="0.8">
          BY AIR MAIL · हवाई डाक
        </text>
      </svg>
    )
  },
  'stamp-bird': {
    id: 'stamp-bird',
    name: 'Carrier Pigeon',
    category: 'stamps-postmarks',
    width: 60,
    height: 60,
    render: () => (
      <svg viewBox="0 0 60 60" width="100%" height="100%" fill="none">
        <circle cx="30" cy="30" r="28" fill="#F7F3E9" stroke="#1F2340" strokeWidth="2" strokeDasharray="3 2" />
        {/* Bird silhouette carrying envelope */}
        <path d="M16 32 C18 26 24 22 32 24 C36 25 40 23 44 18 C42 25 38 28 34 30 C38 34 36 40 30 38 C24 38 18 36 16 32 Z" fill="#3E5C8A" stroke="#1F2340" strokeWidth="1.5" />
        <rect x="36" y="32" width="12" height="8" rx="1" fill="#FFFFFF" stroke="#B4455A" strokeWidth="1" />
      </svg>
    )
  },

  // -------------------------------------------------------------
  // GROUP 3: SKY, GARDEN & TAPE
  // -------------------------------------------------------------
  'sparkles': {
    id: 'sparkles',
    name: 'Gold Sparkles',
    category: 'sky-garden-tape',
    width: 48,
    height: 48,
    render: () => (
      <svg viewBox="0 0 48 48" width="100%" height="100%" fill="none">
        <path d="M24 6 L26 18 L38 20 L26 22 L24 34 L22 22 L10 20 L22 18 Z" fill="#FAD889" stroke="#1F2340" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M38 30 L39 35 L44 36 L39 37 L38 42 L37 37 L32 36 L37 35 Z" fill="#FAD889" stroke="#1F2340" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="12" cy="36" r="2.5" fill="#E9B7C1" stroke="#1F2340" strokeWidth="1" />
      </svg>
    )
  },
  'star-cluster': {
    id: 'star-cluster',
    name: 'Constellation Twinkles',
    category: 'sky-garden-tape',
    width: 54,
    height: 50,
    render: () => (
      <svg viewBox="0 0 54 50" width="100%" height="100%" fill="none">
        <polygon points="18,6 20,12 26,14 20,16 18,22 16,16 10,14 16,12" fill="#FAD889" stroke="#1F2340" strokeWidth="1.5" />
        <polygon points="38,18 40,24 46,25 40,27 38,33 36,27 30,25 36,24" fill="#FAD889" stroke="#1F2340" strokeWidth="1.5" />
        <polygon points="22,32 23,36 27,37 23,38 22,42 21,38 17,37 21,36" fill="#FAD889" stroke="#1F2340" strokeWidth="1.2" />
        <line x1="18" y1="14" x2="38" y2="25" stroke="#1F2340" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
        <line x1="38" y1="25" x2="22" y2="37" stroke="#1F2340" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
      </svg>
    )
  },
  'crescent-moon': {
    id: 'crescent-moon',
    name: 'Crescent Moon',
    category: 'sky-garden-tape',
    width: 48,
    height: 52,
    render: () => (
      <svg viewBox="0 0 48 52" width="100%" height="100%" fill="none">
        <path
          d="M32 6 C20 8 12 18 12 30 C12 40 18 48 28 50 C18 46 16 34 20 24 C24 14 30 8 32 6 Z"
          fill="#FAD889"
          stroke="#1F2340"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <polygon points="36,16 37,19 40,20 37,21 36,24 35,21 32,20 35,19" fill="#FAD889" stroke="#1F2340" strokeWidth="1.2" />
      </svg>
    )
  },
  'cloud-rain': {
    id: 'cloud-rain',
    name: 'Soft Raincloud',
    category: 'sky-garden-tape',
    width: 58,
    height: 48,
    render: () => (
      <svg viewBox="0 0 58 48" width="100%" height="100%" fill="none">
        <path
          d="M16 28 C12 28 8 24 8 20 C8 16 11 13 15 13 C16 9 20 6 25 6 C30 6 34 9 36 12 C38 11 41 11 43 13 C47 15 50 19 48 23 C50 25 50 28 48 28 Z"
          fill="#E5EDF6"
          stroke="#1F2340"
          strokeWidth="2.2"
        />
        {/* Raindrops */}
        <line x1="18" y1="34" x2="15" y2="42" stroke="#3E5C8A" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="29" y1="34" x2="26" y2="44" stroke="#3E5C8A" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="40" y1="34" x2="37" y2="42" stroke="#3E5C8A" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    )
  },
  'rainbow': {
    id: 'rainbow',
    name: 'Pastel Rainbow',
    category: 'sky-garden-tape',
    width: 60,
    height: 38,
    render: () => (
      <svg viewBox="0 0 60 38" width="100%" height="100%" fill="none">
        <path d="M8 34 A22 22 0 0 1 52 34" stroke="#B4455A" strokeWidth="4" strokeLinecap="round" />
        <path d="M14 34 A16 16 0 0 1 46 34" stroke="#FAD889" strokeWidth="4" strokeLinecap="round" />
        <path d="M20 34 A10 10 0 0 1 40 34" stroke="#4A6F4E" strokeWidth="4" strokeLinecap="round" />
        <path d="M26 34 A4 4 0 0 1 34 34" stroke="#3E5C8A" strokeWidth="4" strokeLinecap="round" />
      </svg>
    )
  },
  'sunshine': {
    id: 'sunshine',
    name: 'Radiant Sunshine',
    category: 'sky-garden-tape',
    width: 52,
    height: 52,
    render: () => (
      <svg viewBox="0 0 52 52" width="100%" height="100%" fill="none">
        <circle cx="26" cy="26" r="12" fill="#FAD889" stroke="#1F2340" strokeWidth="2.2" />
        {/* Sun rays */}
        <line x1="26" y1="6" x2="26" y2="10" stroke="#1F2340" strokeWidth="2.4" strokeLinecap="round" />
        <line x1="26" y1="42" x2="26" y2="46" stroke="#1F2340" strokeWidth="2.4" strokeLinecap="round" />
        <line x1="6" y1="26" x2="10" y2="26" stroke="#1F2340" strokeWidth="2.4" strokeLinecap="round" />
        <line x1="42" y1="26" x2="46" y2="26" stroke="#1F2340" strokeWidth="2.4" strokeLinecap="round" />
        <line x1="12" y1="12" x2="15" y2="15" stroke="#1F2340" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="37" y1="37" x2="40" y2="40" stroke="#1F2340" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="12" y1="40" x2="15" y2="37" stroke="#1F2340" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="37" y1="15" x2="40" y2="12" stroke="#1F2340" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    )
  },
  'butterfly': {
    id: 'butterfly',
    name: 'Garden Butterfly',
    category: 'sky-garden-tape',
    width: 52,
    height: 44,
    render: () => (
      <svg viewBox="0 0 52 44" width="100%" height="100%" fill="none">
        {/* Left wings */}
        <path d="M26 22 C22 10 10 8 8 16 C6 22 16 26 26 23" fill="#D98A9A" stroke="#1F2340" strokeWidth="2" />
        <path d="M26 24 C20 28 14 36 18 40 C22 42 26 34 26 26" fill="#E9B7C1" stroke="#1F2340" strokeWidth="2" />
        {/* Right wings */}
        <path d="M26 22 C30 10 42 8 44 16 C46 22 36 26 26 23" fill="#D98A9A" stroke="#1F2340" strokeWidth="2" />
        <path d="M26 24 C32 28 38 36 34 40 C30 42 26 34 26 26" fill="#E9B7C1" stroke="#1F2340" strokeWidth="2" />
        {/* Body and antennae */}
        <line x1="26" y1="16" x2="26" y2="34" stroke="#1F2340" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M26 16 Q22 10 20 8" stroke="#1F2340" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M26 16 Q30 10 32 8" stroke="#1F2340" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  },
  'rose-blossom': {
    id: 'rose-blossom',
    name: 'Blooming Rose',
    category: 'sky-garden-tape',
    width: 48,
    height: 52,
    render: () => (
      <svg viewBox="0 0 48 52" width="100%" height="100%" fill="none">
        {/* Leaves */}
        <path d="M24 36 C18 36 14 42 16 46 C20 46 24 40 24 36 Z" fill="#4A6F4E" stroke="#1F2340" strokeWidth="1.8" />
        <path d="M24 36 C30 36 34 42 32 46 C28 46 24 40 24 36 Z" fill="#4A6F4E" stroke="#1F2340" strokeWidth="1.8" />
        {/* Rose bloom */}
        <circle cx="24" cy="22" r="14" fill="#B4455A" stroke="#1F2340" strokeWidth="2.2" />
        <path d="M18 18 C22 14 26 14 30 18 C32 22 28 26 24 28 C20 26 16 22 18 18 Z" fill="#E9B7C1" stroke="#1F2340" strokeWidth="1.6" />
        <circle cx="24" cy="20" r="3" fill="#FCF4F4" />
      </svg>
    )
  },
  'daisy': {
    id: 'daisy',
    name: 'White Daisy',
    category: 'sky-garden-tape',
    width: 46,
    height: 46,
    render: () => (
      <svg viewBox="0 0 46 46" width="100%" height="100%" fill="none">
        {/* Petals */}
        <ellipse cx="23" cy="10" rx="4" ry="7" fill="#FFFFFF" stroke="#1F2340" strokeWidth="1.8" />
        <ellipse cx="23" cy="36" rx="4" ry="7" fill="#FFFFFF" stroke="#1F2340" strokeWidth="1.8" />
        <ellipse cx="10" cy="23" rx="7" ry="4" fill="#FFFFFF" stroke="#1F2340" strokeWidth="1.8" />
        <ellipse cx="36" cy="23" rx="7" ry="4" fill="#FFFFFF" stroke="#1F2340" strokeWidth="1.8" />
        <ellipse cx="14" cy="14" rx="4" ry="7" transform="rotate(-45 14 14)" fill="#FFFFFF" stroke="#1F2340" strokeWidth="1.8" />
        <ellipse cx="32" cy="32" rx="4" ry="7" transform="rotate(-45 32 32)" fill="#FFFFFF" stroke="#1F2340" strokeWidth="1.8" />
        <ellipse cx="32" cy="14" rx="4" ry="7" transform="rotate(45 32 14)" fill="#FFFFFF" stroke="#1F2340" strokeWidth="1.8" />
        <ellipse cx="14" cy="32" rx="4" ry="7" transform="rotate(45 14 32)" fill="#FFFFFF" stroke="#1F2340" strokeWidth="1.8" />
        {/* Center */}
        <circle cx="23" cy="23" r="6" fill="#FAD889" stroke="#1F2340" strokeWidth="2" />
      </svg>
    )
  },
  'sunflower': {
    id: 'sunflower',
    name: 'Sunny Sunflower',
    category: 'sky-garden-tape',
    width: 50,
    height: 50,
    render: () => (
      <svg viewBox="0 0 50 50" width="100%" height="100%" fill="none">
        {/* Golden petals */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
          <path
            key={deg}
            d="M25 25 L23 7 C24 5 26 5 27 7 Z"
            transform={`rotate(${deg} 25 25)`}
            fill="#FAD889"
            stroke="#1F2340"
            strokeWidth="1.2"
          />
        ))}
        {/* Center seed disc */}
        <circle cx="25" cy="25" r="9" fill="#3B291D" stroke="#1F2340" strokeWidth="2" />
        <circle cx="25" cy="25" r="5" fill="#4A3425" stroke="#FAD889" strokeWidth="0.8" strokeDasharray="2 1" />
      </svg>
    )
  },
  'leaf-sprig': {
    id: 'leaf-sprig',
    name: 'Eucalyptus Leaf Sprig',
    category: 'sky-garden-tape',
    width: 44,
    height: 60,
    render: () => (
      <svg viewBox="0 0 44 60" width="100%" height="100%" fill="none">
        <path d="M22 56 C22 40 22 24 22 8" stroke="#26422F" strokeWidth="2" strokeLinecap="round" />
        <path d="M22 44 C14 42 10 36 12 30 C16 32 20 38 22 42" fill="#CAD9C7" stroke="#26422F" strokeWidth="1.6" />
        <path d="M22 36 C30 34 34 28 32 22 C28 24 24 30 22 34" fill="#A8C4A6" stroke="#26422F" strokeWidth="1.6" />
        <path d="M22 24 C14 22 10 16 12 10 C16 12 20 18 22 22" fill="#CAD9C7" stroke="#26422F" strokeWidth="1.6" />
        <path d="M22 16 C30 14 34 8 32 4 C28 6 24 12 22 14" fill="#A8C4A6" stroke="#26422F" strokeWidth="1.6" />
      </svg>
    )
  },
  'washi-tape-rose': {
    id: 'washi-tape-rose',
    name: 'Rose Washi Tape',
    category: 'sky-garden-tape',
    width: 90,
    height: 32,
    render: () => (
      <svg viewBox="0 0 90 32" width="100%" height="100%" fill="none">
        {/* Semi-transparent washi tape with torn serrated ends */}
        <path
          d="M6 4 L84 4 L82 8 L85 14 L82 20 L84 28 L6 28 L8 22 L5 16 L8 10 Z"
          fill="#D98A9A"
          fillOpacity="0.75"
          stroke="#B4455A"
          strokeWidth="1.2"
        />
        <line x1="12" y1="16" x2="78" y2="16" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.8" />
      </svg>
    )
  },
  'washi-tape-stripes': {
    id: 'washi-tape-stripes',
    name: 'Airmail Washi Tape',
    category: 'sky-garden-tape',
    width: 90,
    height: 32,
    render: () => (
      <svg viewBox="0 0 90 32" width="100%" height="100%" fill="none">
        <defs>
          <pattern id="airmail-stripes-tape" width="16" height="16" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="16" stroke="#B4455A" strokeWidth="4" />
            <line x1="8" y1="0" x2="8" y2="16" stroke="#3E5C8A" strokeWidth="4" />
          </pattern>
        </defs>
        <path
          d="M6 4 L84 4 L82 8 L85 14 L82 20 L84 28 L6 28 L8 22 L5 16 L8 10 Z"
          fill="#F6EFE3"
          stroke="#1F2340"
          strokeWidth="1.2"
        />
        <path
          d="M6 4 L84 4 L82 8 L85 14 L82 20 L84 28 L6 28 L8 22 L5 16 L8 10 Z"
          fill="url(#airmail-stripes-tape)"
          fillOpacity="0.45"
        />
      </svg>
    )
  },
  'washi-tape-grid': {
    id: 'washi-tape-grid',
    name: 'Graph Grid Washi Tape',
    category: 'sky-garden-tape',
    width: 90,
    height: 32,
    render: () => (
      <svg viewBox="0 0 90 32" width="100%" height="100%" fill="none">
        <path
          d="M6 4 L84 4 L82 8 L85 14 L82 20 L84 28 L6 28 L8 22 L5 16 L8 10 Z"
          fill="#E8ECE9"
          fillOpacity="0.8"
          stroke="#4A6F4E"
          strokeWidth="1.2"
        />
        {/* Grid pattern lines */}
        {[16, 28, 40, 52, 64, 76].map((x) => (
          <line key={x} x1={x} y1="4" x2={x} y2="28" stroke="#4A6F4E" strokeWidth="0.8" strokeDasharray="1 1" opacity="0.6" />
        ))}
        <line x1="6" y1="12" x2="84" y2="12" stroke="#4A6F4E" strokeWidth="0.8" strokeDasharray="1 1" opacity="0.6" />
        <line x1="6" y1="20" x2="84" y2="20" stroke="#4A6F4E" strokeWidth="0.8" strokeDasharray="1 1" opacity="0.6" />
      </svg>
    )
  },

  // -------------------------------------------------------------
  // GROUP 4: LITTLE THINGS & WORDS
  // -------------------------------------------------------------
  'teacup': {
    id: 'teacup',
    name: 'Steaming Chai Cup',
    category: 'little-things-words',
    width: 54,
    height: 48,
    render: () => (
      <svg viewBox="0 0 54 48" width="100%" height="100%" fill="none">
        {/* Steam wisps */}
        <path d="M18 14 C16 10 20 8 18 4" stroke="#B4455A" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M26 12 C24 8 28 6 26 2" stroke="#B4455A" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M34 14 C32 10 36 8 34 4" stroke="#B4455A" strokeWidth="1.6" strokeLinecap="round" />
        {/* Cup body & handle */}
        <path d="M12 16 L40 16 L37 36 C37 40 33 42 26 42 C19 42 15 40 15 36 Z" fill="#F6EFE3" stroke="#1F2340" strokeWidth="2.2" />
        <path d="M40 20 C46 20 46 30 38 30" stroke="#1F2340" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        {/* Saucer */}
        <ellipse cx="26" cy="44" rx="18" ry="3" fill="#D9CDBC" stroke="#1F2340" strokeWidth="2" />
      </svg>
    )
  },
  'antique-key': {
    id: 'antique-key',
    name: 'Antique Brass Key',
    category: 'little-things-words',
    width: 60,
    height: 32,
    render: () => (
      <svg viewBox="0 0 60 32" width="100%" height="100%" fill="none">
        <circle cx="14" cy="16" r="9" fill="#FAD889" stroke="#1F2340" strokeWidth="2.2" />
        <circle cx="14" cy="16" r="4" fill="#F6EFE3" stroke="#1F2340" strokeWidth="1.8" />
        <line x1="23" y1="16" x2="54" y2="16" stroke="#1F2340" strokeWidth="3" strokeLinecap="round" />
        {/* Key teeth */}
        <path d="M44 16 L44 24 M50 16 L50 22" stroke="#1F2340" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    )
  },
  'cat-sleeping': {
    id: 'cat-sleeping',
    name: 'Sleeping Cat',
    category: 'little-things-words',
    width: 56,
    height: 44,
    render: () => (
      <svg viewBox="0 0 56 44" width="100%" height="100%" fill="none">
        {/* Curled cat body */}
        <ellipse cx="28" cy="26" rx="20" ry="14" fill="#E7D8C2" stroke="#1F2340" strokeWidth="2.2" />
        {/* Sleeping head */}
        <circle cx="16" cy="22" r="10" fill="#E7D8C2" stroke="#1F2340" strokeWidth="2" />
        {/* Ears */}
        <polygon points="10,14 12,8 16,13" fill="#B4455A" stroke="#1F2340" strokeWidth="1.5" />
        <polygon points="18,13 22,8 24,14" fill="#B4455A" stroke="#1F2340" strokeWidth="1.5" />
        {/* Sleeping eyes */}
        <path d="M12 24 Q14 26 16 24" stroke="#1F2340" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        {/* Curled tail */}
        <path d="M46 28 C48 20 42 16 38 18" stroke="#1F2340" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </svg>
    )
  },
  'cherries': {
    id: 'cherries',
    name: 'Sweet Cherries',
    category: 'little-things-words',
    width: 48,
    height: 52,
    render: () => (
      <svg viewBox="0 0 48 52" width="100%" height="100%" fill="none">
        {/* Stems */}
        <path d="M24 10 C22 22 16 30 14 36" stroke="#4A6F4E" strokeWidth="2" fill="none" />
        <path d="M24 10 C26 22 32 30 34 36" stroke="#4A6F4E" strokeWidth="2" fill="none" />
        {/* Leaf */}
        <path d="M24 10 C30 6 36 8 34 14 C28 14 26 12 24 10 Z" fill="#CAD9C7" stroke="#4A6F4E" strokeWidth="1.5" />
        {/* Cherries */}
        <circle cx="14" cy="38" r="9" fill="#B4455A" stroke="#1F2340" strokeWidth="2" />
        <circle cx="12" cy="35" r="2.5" fill="#FFFFFF" opacity="0.6" />
        <circle cx="34" cy="38" r="9" fill="#943749" stroke="#1F2340" strokeWidth="2" />
        <circle cx="32" cy="35" r="2.5" fill="#FFFFFF" opacity="0.6" />
      </svg>
    )
  },
  'ribbon-bow': {
    id: 'ribbon-bow',
    name: 'Satin Bow',
    category: 'little-things-words',
    width: 58,
    height: 48,
    render: () => (
      <svg viewBox="0 0 58 48" width="100%" height="100%" fill="none">
        <circle cx="29" cy="20" r="4.5" fill="#B4455A" stroke="#1F2340" strokeWidth="2" />
        {/* Bow loops */}
        <path d="M29 20 C18 12 8 18 12 24 C16 30 25 24 29 20 Z" fill="#E9B7C1" stroke="#1F2340" strokeWidth="2" />
        <path d="M29 20 C40 12 50 18 46 24 C42 30 33 24 29 20 Z" fill="#E9B7C1" stroke="#1F2340" strokeWidth="2" />
        {/* Ribbon tails */}
        <path d="M27 24 C24 32 18 40 14 44" stroke="#B4455A" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M31 24 C34 32 40 40 44 44" stroke="#B4455A" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    )
  },
  'paper-plane': {
    id: 'paper-plane',
    name: 'Paper Airplane',
    category: 'little-things-words',
    width: 62,
    height: 44,
    render: () => (
      <svg viewBox="0 0 62 44" width="100%" height="100%" fill="none">
        {/* Flight dotted trail */}
        <path d="M6 34 Q18 42 26 26" stroke="#3E5C8A" strokeWidth="1.8" strokeDasharray="3 3" fill="none" />
        {/* Folded paper plane */}
        <polygon points="56,8 24,22 34,28" fill="#F6EFE3" stroke="#1F2340" strokeWidth="2" strokeLinejoin="round" />
        <polygon points="56,8 34,28 32,38 38,32" fill="#D9CDBC" stroke="#1F2340" strokeWidth="1.8" strokeLinejoin="round" />
        <polygon points="56,8 24,22 42,16" fill="#FFFFFF" stroke="#1F2340" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    )
  },
  'label-miss-you': {
    id: 'label-miss-you',
    name: 'Label: "miss you"',
    category: 'little-things-words',
    width: 90,
    height: 38,
    render: () => (
      <svg viewBox="0 0 90 38" width="100%" height="100%" fill="none">
        <rect x="3" y="3" width="84" height="32" rx="6" fill="#FCF0EC" stroke="#B4455A" strokeWidth="1.8" strokeDasharray="3 2" />
        <text x="45" y="24" textAnchor="middle" fill="#B4455A" fontSize="18" fontFamily="'Caveat', 'Kalam', cursive" fontWeight="600">
          miss you ♡
        </text>
      </svg>
    )
  },
  'label-write-back': {
    id: 'label-write-back',
    name: 'Label: "write back soon"',
    category: 'little-things-words',
    width: 110,
    height: 38,
    render: () => (
      <svg viewBox="0 0 110 38" width="100%" height="100%" fill="none">
        <rect x="3" y="3" width="104" height="32" rx="6" fill="#F4F8F4" stroke="#26422F" strokeWidth="1.8" />
        <text x="55" y="24" textAnchor="middle" fill="#26422F" fontSize="17" fontFamily="'Caveat', 'Kalam', cursive" fontWeight="600">
          write back soon ✉
        </text>
      </svg>
    )
  },
  'label-hindi-yaad': {
    id: 'label-hindi-yaad',
    name: 'Label: "तुम्हारी याद"',
    category: 'little-things-words',
    width: 104,
    height: 42,
    render: () => (
      <svg viewBox="0 0 104 42" width="100%" height="100%" fill="none">
        <rect x="3" y="3" width="98" height="36" rx="6" fill="#FFF4F6" stroke="#B4455A" strokeWidth="2" />
        <text x="52" y="27" textAnchor="middle" fill="#B4455A" fontSize="19" fontFamily="'Kalam', cursive" fontWeight="700">
          तुम्हारी याद ♥
        </text>
      </svg>
    )
  },
  'label-hindi-pyaar': {
    id: 'label-hindi-pyaar',
    name: 'Label: "प्यार से"',
    category: 'little-things-words',
    width: 90,
    height: 42,
    render: () => (
      <svg viewBox="0 0 90 42" width="100%" height="100%" fill="none">
        <rect x="3" y="3" width="84" height="36" rx="6" fill="#F6EFE3" stroke="#1F2340" strokeWidth="2" />
        <text x="45" y="27" textAnchor="middle" fill="#1F2340" fontSize="18" fontFamily="'Kalam', cursive" fontWeight="700">
          प्यार से · सदैव
        </text>
      </svg>
    )
  },
  'label-with-love': {
    id: 'label-with-love',
    name: 'Label: "with all my love"',
    category: 'little-things-words',
    width: 116,
    height: 38,
    render: () => (
      <svg viewBox="0 0 116 38" width="100%" height="100%" fill="none">
        <rect x="3" y="3" width="110" height="32" rx="16" fill="#E8EDF6" stroke="#3E5C8A" strokeWidth="1.8" />
        <text x="58" y="24" textAnchor="middle" fill="#243C66" fontSize="17" fontFamily="'Caveat', 'Kalam', cursive" fontWeight="600">
          with all my love ❦
        </text>
      </svg>
    )
  },

  // -------------------------------------------------------------
  // BONUS: FUNNY, ROMANTIC & AESTHETIC STICKERS
  // -------------------------------------------------------------

  // ── HEARTS & SEALS (new) ──
  'heart-crying': {
    id: 'heart-crying',
    name: 'Crying Heart (Missing You!)',
    category: 'hearts-seals',
    width: 56,
    height: 56,
    render: () => (
      <svg viewBox="0 0 56 56" width="100%" height="100%" fill="none">
        <path d="M28 46 L26 44C16.8 35.6 10 29.8 10 22.2 C10 16.2 14.8 11.4 20.8 11.4 C24 11.4 27.2 12.9 28 15 C28.8 12.9 32 11.4 35.2 11.4 C41.2 11.4 46 16.2 46 22.2 C46 29.8 39.2 35.6 30 44 L28 46Z" fill="#FF6B8A" stroke="#B4455A" strokeWidth="2.2" strokeLinejoin="round"/>
        {/* Eyes */}
        <ellipse cx="22" cy="26" rx="2" ry="2.5" fill="#fff" opacity="0.9"/>
        <ellipse cx="34" cy="26" rx="2" ry="2.5" fill="#fff" opacity="0.9"/>
        <circle cx="22" cy="27" r="1.2" fill="#7B2340"/>
        <circle cx="34" cy="27" r="1.2" fill="#7B2340"/>
        {/* Tears */}
        <path d="M21 30 Q20 34 21.5 37" stroke="#93D4F5" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
        <path d="M35 30 Q36 34 34.5 37" stroke="#93D4F5" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
        <ellipse cx="21.5" cy="38" rx="1.5" ry="2" fill="#93D4F5"/>
        <ellipse cx="34.5" cy="38" rx="1.5" ry="2" fill="#93D4F5"/>
      </svg>
    )
  },

  'heart-on-fire': {
    id: 'heart-on-fire',
    name: 'Heart on Fire 🔥',
    category: 'hearts-seals',
    width: 58,
    height: 66,
    render: () => (
      <svg viewBox="0 0 58 66" width="100%" height="100%" fill="none">
        {/* Flame */}
        <path d="M29 4 C22 10 18 16 24 22 C20 16 28 8 29 4Z" fill="#FAD889"/>
        <path d="M29 4 C38 10 42 18 36 24 C40 16 32 8 29 4Z" fill="#F4825A"/>
        <path d="M24 22 C20 28 26 32 29 26 C32 32 38 28 34 22 C31 28 27 28 24 22Z" fill="#F4825A"/>
        {/* Heart */}
        <path d="M29 58 L27 56.2 C17.4 47.5 10 41.4 10 33.4 C10 27.2 14.8 22 21 22 C24.5 22 27.8 23.6 29 26 C30.2 23.6 33.5 22 37 22 C43.2 22 48 27.2 48 33.4 C48 41.4 40.6 47.5 31 56.2 L29 58Z" fill="#B4455A" stroke="#7B2340" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
    )
  },

  'heart-bandaged': {
    id: 'heart-bandaged',
    name: 'Healing Heart 🩹',
    category: 'hearts-seals',
    width: 60,
    height: 54,
    render: () => (
      <svg viewBox="0 0 60 54" width="100%" height="100%" fill="none">
        <path d="M30 46 L28 44.2 C18.4 35.7 11 29.5 11 21.5 C11 15.3 15.8 10 22 10 C25.5 10 28.8 11.6 30 14 C31.2 11.6 34.5 10 38 10 C44.2 10 49 15.3 49 21.5 C49 29.5 41.6 35.7 32 44.2 L30 46Z" fill="#FFB3C1" stroke="#B4455A" strokeWidth="2.2" strokeLinejoin="round"/>
        {/* Band-Aid */}
        <rect x="19" y="23" width="22" height="8" rx="3" fill="#FAD889" stroke="#E0A800" strokeWidth="1.2"/>
        <rect x="26" y="22" width="8" height="10" rx="2" fill="#fff" stroke="#E0A800" strokeWidth="1"/>
        <circle cx="30" cy="27" r="1.5" fill="#E0A800"/>
      </svg>
    )
  },

  'pinky-promise': {
    id: 'pinky-promise',
    name: 'Pinky Promise 🤙',
    category: 'hearts-seals',
    width: 64,
    height: 68,
    render: () => (
      <svg viewBox="0 0 64 68" width="100%" height="100%" fill="none">
        {/* Two pinkies linking */}
        <path d="M20 54 C20 46 16 38 18 30 C20 24 26 22 28 28 C30 24 36 24 36 30" stroke="#D98A9A" strokeWidth="6" strokeLinecap="round" fill="none"/>
        <path d="M44 54 C44 46 48 38 46 30 C44 24 38 22 36 28 C34 24 28 24 28 30" stroke="#D98A9A" strokeWidth="6" strokeLinecap="round" fill="none"/>
        {/* Thumbs touch at top */}
        <circle cx="28" cy="30" r="4" fill="#E9B7C1" stroke="#B4455A" strokeWidth="1.5"/>
        <circle cx="36" cy="30" r="4" fill="#E9B7C1" stroke="#B4455A" strokeWidth="1.5"/>
        <path d="M28 30 L36 30" stroke="#B4455A" strokeWidth="2" strokeLinecap="round"/>
        {/* Hearts above */}
        <path d="M26 18 L25.2 17.2 C22.6 14.6 21 13 21 11.2 C21 9.7 22.2 8.5 23.7 8.5 C24.5 8.5 25.3 8.9 25.7 9.5 C26.1 8.9 26.9 8.5 27.7 8.5 C29.2 8.5 30.4 9.7 30.4 11.2 C30.4 13 28.8 14.6 26.2 17.2 L26 18Z" fill="#B4455A"/>
        <path d="M38 18 L37.2 17.2 C34.6 14.6 33 13 33 11.2 C33 9.7 34.2 8.5 35.7 8.5 C36.5 8.5 37.3 8.9 37.7 9.5 C38.1 8.9 38.9 8.5 39.7 8.5 C41.2 8.5 42.4 9.7 42.4 11.2 C42.4 13 40.8 14.6 38.2 17.2 L38 18Z" fill="#B4455A"/>
        <text x="32" y="64" textAnchor="middle" fill="#B4455A" fontSize="9" fontFamily="'Caveat', 'Kalam', cursive" fontWeight="700">pinky promise</text>
      </svg>
    )
  },

  // ── LITTLE THINGS & WORDS (new funny/romantic) ──
  'label-you-make-me-crazy': {
    id: 'label-you-make-me-crazy',
    name: 'Label: "you make me crazy 🌀"',
    category: 'little-things-words',
    width: 126,
    height: 40,
    render: () => (
      <svg viewBox="0 0 126 40" width="100%" height="100%" fill="none">
        <rect x="3" y="3" width="120" height="34" rx="8" fill="#FFF0F5" stroke="#FF6B8A" strokeWidth="1.8" strokeDasharray="4 3"/>
        <text x="63" y="25" textAnchor="middle" fill="#B4455A" fontSize="16" fontFamily="'Caveat', 'Kalam', cursive" fontWeight="700">you make me crazy 🌀</text>
      </svg>
    )
  },

  'label-its-you': {
    id: 'label-its-you',
    name: 'Label: "it\'s always been you"',
    category: 'little-things-words',
    width: 140,
    height: 40,
    render: () => (
      <svg viewBox="0 0 140 40" width="100%" height="100%" fill="none">
        <rect x="3" y="3" width="134" height="34" rx="4" fill="#FBF7FF" stroke="#7C5CBF" strokeWidth="2"/>
        <text x="70" y="25" textAnchor="middle" fill="#5A3F99" fontSize="15" fontFamily="'Instrument Serif', serif" fontStyle="italic">it's always been you ✨</text>
      </svg>
    )
  },

  'label-ugh-miss-you': {
    id: 'label-ugh-miss-you',
    name: 'Label: "ugh I miss you so much"',
    category: 'little-things-words',
    width: 152,
    height: 42,
    render: () => (
      <svg viewBox="0 0 152 42" width="100%" height="100%" fill="none">
        <rect x="3" y="3" width="146" height="36" rx="18" fill="#F0F7FF" stroke="#3E5C8A" strokeWidth="1.8"/>
        <text x="76" y="26" textAnchor="middle" fill="#243C66" fontSize="15" fontFamily="'Caveat', 'Kalam', cursive" fontWeight="600">ugh I miss you so much 😩</text>
      </svg>
    )
  },

  'label-sending-hugs': {
    id: 'label-sending-hugs',
    name: 'Label: "sending virtual hugs"',
    category: 'little-things-words',
    width: 140,
    height: 42,
    render: () => (
      <svg viewBox="0 0 140 42" width="100%" height="100%" fill="none">
        <rect x="3" y="3" width="134" height="36" rx="18" fill="#FFF4EC" stroke="#E07040" strokeWidth="1.8"/>
        <text x="70" y="26" textAnchor="middle" fill="#C05020" fontSize="15" fontFamily="'Caveat', 'Kalam', cursive" fontWeight="700">sending virtual hugs 🤗</text>
      </svg>
    )
  },

  'label-cheesy-but-true': {
    id: 'label-cheesy-but-true',
    name: 'Label: "cheesy but true 🧀"',
    category: 'little-things-words',
    width: 126,
    height: 42,
    render: () => (
      <svg viewBox="0 0 126 42" width="100%" height="100%" fill="none">
        <rect x="3" y="3" width="120" height="36" rx="6" fill="#FFFBEC" stroke="#FAD030" strokeWidth="2"/>
        <text x="63" y="26" textAnchor="middle" fill="#8A6800" fontSize="15" fontFamily="'Caveat', 'Kalam', cursive" fontWeight="700">cheesy but true 🧀</text>
      </svg>
    )
  },

  'label-dil-se': {
    id: 'label-dil-se',
    name: 'Label: "दिल से दिल तक"',
    category: 'little-things-words',
    width: 116,
    height: 44,
    render: () => (
      <svg viewBox="0 0 116 44" width="100%" height="100%" fill="none">
        <rect x="3" y="3" width="110" height="38" rx="6" fill="#FFF0F4" stroke="#B4455A" strokeWidth="2"/>
        <text x="58" y="20" textAnchor="middle" fill="#B4455A" fontSize="13" fontFamily="'Kalam', cursive" fontWeight="700">दिल से दिल तक</text>
        <text x="58" y="36" textAnchor="middle" fill="#D98A9A" fontSize="10" fontFamily="'Instrument Serif', serif" fontStyle="italic">heart to heart</text>
      </svg>
    )
  },

  'label-aaj-yaad-aaye': {
    id: 'label-aaj-yaad-aaye',
    name: 'Label: "आज बहुत याद आये"',
    category: 'little-things-words',
    width: 136,
    height: 44,
    render: () => (
      <svg viewBox="0 0 136 44" width="100%" height="100%" fill="none">
        <rect x="3" y="3" width="130" height="38" rx="6" fill="#F6EFE3" stroke="#1F2340" strokeWidth="2"/>
        <text x="68" y="22" textAnchor="middle" fill="#1F2340" fontSize="14" fontFamily="'Kalam', cursive" fontWeight="700">आज बहुत याद आये 💭</text>
        <text x="68" y="37" textAnchor="middle" fill="#5E6482" fontSize="10" fontFamily="'Instrument Serif', serif" fontStyle="italic">missed you so much today</text>
      </svg>
    )
  },

  // ── SKY, GARDEN & TAPE (new aesthetic) ──
  'sticker-moon-stars': {
    id: 'sticker-moon-stars',
    name: 'Moon & Stars (Thinking of You)',
    category: 'sky-garden-tape',
    width: 64,
    height: 60,
    render: () => (
      <svg viewBox="0 0 64 60" width="100%" height="100%" fill="none">
        {/* Stars */}
        <path d="M10 12 L11.2 15.6 L15 15.6 L12.2 17.8 L13.4 21.4 L10 19.2 L6.6 21.4 L7.8 17.8 L5 15.6 L8.8 15.6Z" fill="#FAD889"/>
        <path d="M52 8 L52.8 10.4 L55.4 10.4 L53.3 11.9 L54.1 14.3 L52 12.8 L49.9 14.3 L50.7 11.9 L48.6 10.4 L51.2 10.4Z" fill="#FAD889"/>
        <path d="M56 32 L56.6 33.8 L58.5 33.8 L57 34.9 L57.6 36.7 L56 35.6 L54.4 36.7 L55 34.9 L53.5 33.8 L55.4 33.8Z" fill="#FAD889" opacity="0.8"/>
        {/* Crescent moon */}
        <path d="M38 52 C28 52 20 44 20 34 C20 28 22.4 22.6 26.4 18.8 C18.6 20.4 13 27.4 13 36 C13 46.4 21.4 55 31.4 55 C37.2 55 42.4 52.2 46 47.8 C43.5 50.4 40.9 52 38 52Z" fill="#FAD889"/>
        <path d="M38 52 C28 52 20 44 20 34 C20 28 22.4 22.6 26.4 18.8 C18.6 20.4 13 27.4 13 36 C13 46.4 21.4 55 31.4 55 C37.2 55 42.4 52.2 46 47.8 C43.5 50.4 40.9 52 38 52Z" stroke="#E0A800" strokeWidth="1.5" fill="none"/>
        <circle cx="8" cy="40" r="1.5" fill="#FAD889" opacity="0.6"/>
        <circle cx="44" cy="18" r="1.8" fill="#FAD889" opacity="0.7"/>
      </svg>
    )
  },

  'sticker-butterflies': {
    id: 'sticker-butterflies',
    name: 'Butterflies in Stomach 🦋',
    category: 'sky-garden-tape',
    width: 72,
    height: 60,
    render: () => (
      <svg viewBox="0 0 72 60" width="100%" height="100%" fill="none">
        {/* Butterfly 1 */}
        <ellipse cx="22" cy="22" rx="12" ry="8" fill="#E9B7C1" stroke="#B4455A" strokeWidth="1.2" transform="rotate(-20 22 22)"/>
        <ellipse cx="14" cy="30" rx="9" ry="6" fill="#D98A9A" stroke="#B4455A" strokeWidth="1.2" transform="rotate(10 14 30)"/>
        <path d="M22 22 C20 24 20 28 22 30" stroke="#1F2340" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        {/* Antenna */}
        <path d="M19 18 Q14 10 12 8" stroke="#1F2340" strokeWidth="1.2" strokeLinecap="round"/>
        <circle cx="12" cy="8" r="1.5" fill="#B4455A"/>
        <path d="M22 19 Q20 10 19 8" stroke="#1F2340" strokeWidth="1.2" strokeLinecap="round"/>
        <circle cx="19" cy="8" r="1.5" fill="#B4455A"/>

        {/* Butterfly 2 (smaller, different color) */}
        <ellipse cx="50" cy="38" rx="10" ry="6" fill="#B4D8F0" stroke="#3E5C8A" strokeWidth="1.2" transform="rotate(15 50 38)"/>
        <ellipse cx="58" cy="30" rx="7" ry="5" fill="#93C5E8" stroke="#3E5C8A" strokeWidth="1.2" transform="rotate(-10 58 30)"/>
        <path d="M50 38 C52 36 52 32 50 30" stroke="#1F2340" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M52 42 Q58 50 60 52" stroke="#1F2340" strokeWidth="1.2" strokeLinecap="round"/>
        <circle cx="60" cy="52" r="1.5" fill="#3E5C8A"/>
        <path d="M48 42 Q50 52 50 54" stroke="#1F2340" strokeWidth="1.2" strokeLinecap="round"/>
        <circle cx="50" cy="54" r="1.5" fill="#3E5C8A"/>

        {/* Heart between */}
        <path d="M36 32 L34.8 30.9 C31.6 27.8 29.5 26 29.5 23.8 C29.5 22.1 30.8 20.8 32.5 20.8 C33.4 20.8 34.3 21.2 34.8 21.9 C35.3 21.2 36.2 20.8 37.1 20.8 C38.8 20.8 40.1 22.1 40.1 23.8 C40.1 26 38 27.8 34.8 30.9 L36 32Z" fill="#B4455A"/>
      </svg>
    )
  },

  'sticker-chai': {
    id: 'sticker-chai',
    name: 'Chai Cup ☕ (Thinking of You)',
    category: 'sky-garden-tape',
    width: 58,
    height: 68,
    render: () => (
      <svg viewBox="0 0 58 68" width="100%" height="100%" fill="none">
        {/* Steam wisps */}
        <path d="M20 16 Q18 10 20 4" stroke="#9BA2BD" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
        <path d="M29 14 Q27 8 29 2" stroke="#9BA2BD" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
        <path d="M38 16 Q36 10 38 4" stroke="#9BA2BD" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
        {/* Cup */}
        <path d="M10 22 L14 56 C14 57 15 58 16 58 L42 58 C43 58 44 57 44 56 L48 22Z" fill="#FAD889" stroke="#E0A800" strokeWidth="2" strokeLinejoin="round"/>
        {/* Handle */}
        <path d="M44 32 C54 32 54 46 44 46" stroke="#E0A800" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        {/* Chai inside */}
        <path d="M13 28 L45 28" stroke="#C07030" strokeWidth="14" opacity="0.35"/>
        {/* Heart latte art */}
        <path d="M29 48 L28.4 47.4 C26.2 45.2 24.6 43.8 24.6 42.2 C24.6 41 25.5 40 26.7 40 C27.3 40 27.9 40.3 28.2 40.7 C28.5 40.3 29.1 40 29.7 40 C30.9 40 31.8 41 31.8 42.2 C31.8 43.8 30.2 45.2 28 47.4 L29 48Z" fill="#C07030" opacity="0.8"/>
        {/* Saucer */}
        <ellipse cx="29" cy="60" rx="22" ry="4" fill="#E0A800" opacity="0.6"/>
        {/* Label */}
        <text x="29" y="64" textAnchor="middle" fill="#8A6800" fontSize="7" fontFamily="'Kalam', cursive">याद</text>
      </svg>
    )
  },

  'sticker-red-string': {
    id: 'sticker-red-string',
    name: 'Red String of Fate 🧵',
    category: 'sky-garden-tape',
    width: 80,
    height: 60,
    render: () => (
      <svg viewBox="0 0 80 60" width="100%" height="100%" fill="none">
        {/* String with a loop in middle = fate */}
        <path d="M5 20 Q20 10 28 28 Q36 46 50 38 Q64 30 75 40" stroke="#B4455A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        {/* Left finger/hand hint */}
        <circle cx="5" cy="20" r="4" fill="#F6EFE3" stroke="#B4455A" strokeWidth="1.5"/>
        {/* Right finger */}
        <circle cx="75" cy="40" r="4" fill="#F6EFE3" stroke="#B4455A" strokeWidth="1.5"/>
        {/* Small hearts along string */}
        <path d="M29 28 L28.6 27.6 C27.4 26.4 26.6 25.6 26.6 24.6 C26.6 23.8 27.2 23.2 28 23.2 C28.4 23.2 28.8 23.4 29 23.7 C29.2 23.4 29.6 23.2 30 23.2 C30.8 23.2 31.4 23.8 31.4 24.6 C31.4 25.6 30.6 26.4 29.4 27.6 L29 28Z" fill="#FAD889"/>
        <path d="M51 38 L50.6 37.6 C49.4 36.4 48.6 35.6 48.6 34.6 C48.6 33.8 49.2 33.2 50 33.2 C50.4 33.2 50.8 33.4 51 33.7 C51.2 33.4 51.6 33.2 52 33.2 C52.8 33.2 53.4 33.8 53.4 34.6 C53.4 35.6 52.6 36.4 51.4 37.6 L51 38Z" fill="#FAD889"/>
        {/* Label */}
        <text x="40" y="56" textAnchor="middle" fill="#B4455A" fontSize="9" fontFamily="'Caveat', 'Kalam', cursive" fontWeight="600">red string of fate</text>
      </svg>
    )
  },

  'sticker-love-potion': {
    id: 'sticker-love-potion',
    name: 'Love Potion 🧪',
    category: 'sky-garden-tape',
    width: 54,
    height: 70,
    render: () => (
      <svg viewBox="0 0 54 70" width="100%" height="100%" fill="none">
        {/* Cork */}
        <rect x="20" y="4" width="14" height="10" rx="3" fill="#C09060" stroke="#8A6030" strokeWidth="1.5"/>
        {/* Neck */}
        <rect x="22" y="13" width="10" height="8" fill="#FFB3C1" stroke="#B4455A" strokeWidth="1.2"/>
        {/* Bottle body */}
        <path d="M14 20 C10 22 8 28 8 36 C8 48 16 62 27 62 C38 62 46 48 46 36 C46 28 44 22 40 20Z" fill="#FF8FA3" stroke="#B4455A" strokeWidth="2"/>
        {/* Liquid sparkle inside */}
        <ellipse cx="27" cy="42" rx="14" ry="12" fill="#FFD6E0" opacity="0.7"/>
        {/* Hearts floating in potion */}
        <path d="M22 40 L21.4 39.4 C19.6 37.6 18.5 36.5 18.5 35.2 C18.5 34.2 19.3 33.4 20.3 33.4 C20.8 33.4 21.3 33.7 21.6 34 C21.9 33.7 22.4 33.4 22.9 33.4 C23.9 33.4 24.7 34.2 24.7 35.2 C24.7 36.5 23.6 37.6 21.8 39.4 L22 40Z" fill="#B4455A"/>
        <path d="M32 46 L31.4 45.4 C29.6 43.6 28.5 42.5 28.5 41.2 C28.5 40.2 29.3 39.4 30.3 39.4 C30.8 39.4 31.3 39.7 31.6 40 C31.9 39.7 32.4 39.4 32.9 39.4 C33.9 39.4 34.7 40.2 34.7 41.2 C34.7 42.5 33.6 43.6 31.8 45.4 L32 46Z" fill="#B4455A"/>
        {/* Label */}
        <rect x="14" y="50" width="26" height="12" rx="3" fill="#FFF0F4" stroke="#B4455A" strokeWidth="1"/>
        <text x="27" y="59" textAnchor="middle" fill="#B4455A" fontSize="8" fontFamily="'Kalam', cursive" fontWeight="700">Love!</text>
        {/* Bubbles */}
        <circle cx="34" cy="30" r="2.5" fill="none" stroke="#FF6B8A" strokeWidth="1.2"/>
        <circle cx="20" cy="26" r="2" fill="none" stroke="#FF6B8A" strokeWidth="1.2"/>
      </svg>
    )
  },

  'sticker-telephone': {
    id: 'sticker-telephone',
    name: 'Vintage Telephone 📞',
    category: 'stamps-postmarks',
    width: 64,
    height: 64,
    render: () => (
      <svg viewBox="0 0 64 64" width="100%" height="100%" fill="none">
        {/* Base */}
        <rect x="8" y="28" width="48" height="26" rx="6" fill="#3E5C8A" stroke="#243C66" strokeWidth="2"/>
        {/* Dial circle */}
        <circle cx="32" cy="42" r="10" fill="#F6EFE3" stroke="#243C66" strokeWidth="1.5"/>
        <circle cx="32" cy="42" r="6" fill="#9BA2BD" stroke="#243C66" strokeWidth="1"/>
        {/* Dial numbers dots */}
        <circle cx="32" cy="35" r="1" fill="#243C66"/>
        <circle cx="37" cy="37" r="1" fill="#243C66"/>
        <circle cx="39" cy="42" r="1" fill="#243C66"/>
        <circle cx="37" cy="47" r="1" fill="#243C66"/>
        <circle cx="32" cy="49" r="1" fill="#243C66"/>
        <circle cx="27" cy="47" r="1" fill="#243C66"/>
        <circle cx="25" cy="42" r="1" fill="#243C66"/>
        <circle cx="27" cy="37" r="1" fill="#243C66"/>
        {/* Handset */}
        <path d="M12 20 C12 14 18 8 24 10 C28 11 30 14 28 18 C26 22 22 22 20 24 C18 26 18 30 20 32 C22 34 24 34 26 32 C28 30 28 28 32 26 C36 24 40 24 42 20 C44 14 42 8 38 6 C32 4 24 6 18 12 C12 18 10 26 12 30" stroke="#243C66" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
        <path d="M12 20 C12 14 18 8 24 10" stroke="#5273A6" strokeWidth="3" strokeLinecap="round" fill="none"/>
        <path d="M40 22 C44 18 44 12 40 8" stroke="#5273A6" strokeWidth="3" strokeLinecap="round" fill="none"/>
        {/* Heart on base */}
        <path d="M44 38 L43.4 37.4 C41.8 35.8 40.8 35 40.8 33.8 C40.8 32.8 41.6 32 42.6 32 C43.1 32 43.6 32.3 43.9 32.7 C44.2 32.3 44.7 32 45.2 32 C46.2 32 47 32.8 47 33.8 C47 35 46 35.8 44.4 37.4 L44 38Z" fill="#B4455A"/>
      </svg>
    )
  },

  // -------------------------------------------------------------
  // CLAUDE STUDIO PACK STICKERS
  // -------------------------------------------------------------
  'marigold': {
    id: 'marigold',
    name: 'Marigold',
    category: 'sky-garden-tape',
    width: 68,
    height: 68,
    render: () => (
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        {Array.from({ length: 14 }, (_, i) => (
          <ellipse key={`m1_${i}`} cx="50" cy="25" rx="7" ry="14" fill="#E8892B" transform={`rotate(${i * 360 / 14} 50 50)`} />
        ))}
        {Array.from({ length: 14 }, (_, i) => (
          <ellipse key={`m2_${i}`} cx="50" cy="35" rx="6" ry="11" fill="#F5B83D" transform={`rotate(${i * 360 / 14 + 13} 50 50)`} />
        ))}
        <circle cx="50" cy="50" r="7" fill="#A9521B" />
      </svg>
    )
  },
  'daisy-white': {
    id: 'daisy-white',
    name: 'Daisy White',
    category: 'sky-garden-tape',
    width: 68,
    height: 68,
    render: () => (
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => (
          <ellipse key={`d_${i}`} cx="50" cy="26" rx="5.5" ry="16" fill="#FFFDF6" stroke="#D8D0BD" strokeWidth="0.8" transform={`rotate(${i * 360 / 12} 50 50)`} />
        ))}
        <circle cx="50" cy="50" r="9" fill="#F1C232" />
      </svg>
    )
  },
  'poppy': {
    id: 'poppy',
    name: 'Poppy',
    category: 'sky-garden-tape',
    width: 68,
    height: 68,
    render: () => (
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <ellipse key={`p1_${i}`} cx="50" cy="36" rx="17" ry="18" fill="#D9455A" transform={`rotate(${i * 360 / 5} 50 50)`} />
        ))}
        {Array.from({ length: 5 }, (_, i) => (
          <ellipse key={`p2_${i}`} cx="50" cy="38" rx="12" ry="13" fill="#EA6B7C" transform={`rotate(${i * 360 / 5 + 36} 50 50)`} />
        ))}
        <circle cx="50" cy="50" r="6" fill="#3A1F2B" />
      </svg>
    )
  },
  'lavender': {
    id: 'lavender',
    name: 'Lavender',
    category: 'sky-garden-tape',
    width: 50,
    height: 72,
    render: () => (
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        <path d="M50 96C50 70 52 44 50 10" stroke="#5F7F4F" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        {Array.from({ length: 8 }, (_, i) => {
          const y = 16 + i * 8.5;
          return (
            <g key={`lav_${i}`}>
              <ellipse cx="43" cy={y} rx="5" ry="3" fill="#8C6BB8" transform={`rotate(-30 43 ${y})`} />
              <ellipse cx="57" cy={y} rx="5" ry="3" fill="#9C7CC6" transform={`rotate(30 57 ${y})`} />
            </g>
          );
        })}
        <ellipse cx="50" cy="9" rx="3" ry="5" fill="#8C6BB8" />
      </svg>
    )
  },
  'sprig': {
    id: 'sprig',
    name: 'Leaf Sprig',
    category: 'sky-garden-tape',
    width: 55,
    height: 72,
    render: () => (
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        <path d="M50 96C48 70 52 40 50 12" stroke="#5E7F4E" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        {Array.from({ length: 5 }, (_, i) => {
          const y = 84 - i * 16;
          const f = i % 2 ? '#83A46F' : '#6B8F5A';
          return (
            <g key={`spr_${i}`}>
              <ellipse cx="37" cy={y} rx="12" ry="5" fill={f} transform={`rotate(-35 37 ${y})`} />
              <ellipse cx="63" cy={y - 6} rx="12" ry="5" fill={f} transform={`rotate(35 63 ${y - 6})`} />
            </g>
          );
        })}
        <ellipse cx="50" cy="13" rx="5" ry="10" fill="#6B8F5A" />
      </svg>
    )
  },
  'fern': {
    id: 'fern',
    name: 'Fern',
    category: 'sky-garden-tape',
    width: 55,
    height: 72,
    render: () => (
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        <path d="M50 96Q44 50 56 8" stroke="#3F6A48" strokeWidth="2" fill="none" strokeLinecap="round" />
        {Array.from({ length: 10 }, (_, t) => {
          const y = 88 - t * 8.2;
          const x = 48 + t * 0.7;
          const len = 14 - t * 0.9;
          const lrx = len / 2;
          return (
            <g key={`fern_${t}`}>
              <ellipse cx={x - lrx} cy={y - 2} rx={lrx} ry="2.4" fill="#4F7A55" transform={`rotate(-25 ${x - lrx} ${y - 2})`} />
              <ellipse cx={x + lrx} cy={y - 2} rx={lrx} ry="2.4" fill="#5C8A62" transform={`rotate(25 ${x + lrx} ${y - 2})`} />
            </g>
          );
        })}
      </svg>
    )
  },
  'heart': {
    id: 'heart',
    name: 'Heart',
    category: 'hearts-seals',
    width: 60,
    height: 60,
    render: () => (
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        <path d="M50 86C14 60 16 26 36 26C44 26 50 32 50 38C50 32 56 26 64 26C84 26 86 60 50 86Z" fill="#C7364A" />
        <ellipse cx="34" cy="40" rx="6" ry="3.5" fill="#fff" opacity="0.35" transform="rotate(-35 34 40)" />
      </svg>
    )
  },
  'doodle': {
    id: 'doodle',
    name: 'Doodle Heart',
    category: 'hearts-seals',
    width: 60,
    height: 60,
    render: () => (
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        <path d="M50 86C14 60 16 26 36 26C44 26 50 32 50 38C50 32 56 26 64 26C84 26 86 60 50 86Z" fill="none" stroke="#B3283A" strokeWidth="3.6" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M50 86C14 60 16 26 36 26C44 26 50 32 50 38C50 32 56 26 64 26C84 26 86 60 50 86Z" fill="none" stroke="#B3283A" strokeWidth="1.4" opacity="0.55" transform="translate(2.5 2) rotate(2 50 56)" />
      </svg>
    )
  },
  'sparkle': {
    id: 'sparkle',
    name: 'Sparkle',
    category: 'hearts-seals',
    width: 55,
    height: 55,
    render: () => (
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        <path d="M50 8C53 34 66 47 92 50C66 53 53 66 50 92C47 66 34 53 8 50C34 47 47 34 50 8Z" fill="#D9A93E" />
        <path d="M50 8C53 34 66 47 92 50C66 53 53 66 50 92C47 66 34 53 8 50C34 47 47 34 50 8Z" fill="#EBC96A" transform="translate(68 4) scale(.26)" />
      </svg>
    )
  },
  'moon': {
    id: 'moon',
    name: 'Moon',
    category: 'hearts-seals',
    width: 55,
    height: 55,
    render: () => (
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        <path d="M62 14A38 38 0 1 0 86 62A30 30 0 0 1 62 14Z" fill="#E9C46A" />
        <path d="M50 8C51 16 54 19 62 20C54 21 51 24 50 32C49 24 46 21 38 20C46 19 49 16 50 8Z" fill="#E9C46A" transform="translate(30 4) scale(.5)" />
      </svg>
    )
  },
  'loveenv': {
    id: 'loveenv',
    name: 'Love Note',
    category: 'hearts-seals',
    width: 68,
    height: 55,
    render: () => (
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        <rect x="10" y="28" width="80" height="48" rx="4" fill="#F7EFE0" stroke="#1F2340" strokeWidth="2.4" />
        <path d="M10 32L50 58L90 32" fill="none" stroke="#1F2340" strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M50 86C14 60 16 26 36 26C44 26 50 32 50 38C50 32 56 26 64 26C84 26 86 60 50 86Z" transform="translate(38.5 46) scale(.24)" fill="#C7364A" />
      </svg>
    )
  },
  'trio': {
    id: 'trio',
    name: 'Little Hearts',
    category: 'hearts-seals',
    width: 68,
    height: 55,
    render: () => (
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        <path d="M50 86C14 60 16 26 36 26C44 26 50 32 50 38C50 32 56 26 64 26C84 26 86 60 50 86Z" transform="translate(6 34) scale(.5)" fill="#E58A98" />
        <path d="M50 86C14 60 16 26 36 26C44 26 50 32 50 38C50 32 56 26 64 26C84 26 86 60 50 86Z" transform="translate(30 4) scale(.66)" fill="#C7364A" />
        <path d="M50 86C14 60 16 26 36 26C44 26 50 32 50 38C50 32 56 26 64 26C84 26 86 60 50 86Z" transform="translate(50 46) scale(.44)" fill="#F1A9B4" />
      </svg>
    )
  },
  'washi': {
    id: 'washi',
    name: 'Washi Tape',
    category: 'little-things-words',
    width: 90,
    height: 40,
    render: () => (
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        <path d="M8 36H92L88 41L92 46L88 51L92 56L88 61L92 64H8L12 59L8 54L12 49L8 44L12 39Z" fill="#F3B8C1" opacity="0.88" />
        {Array.from({ length: 7 }, (_, i) => (
          <rect key={`w_${i}`} x={16 + i * 11} y="36" width="5" height="28" fill="#fff" opacity="0.5" />
        ))}
      </svg>
    )
  },
  'polaroid': {
    id: 'polaroid',
    name: 'Polaroid',
    category: 'little-things-words',
    width: 70,
    height: 84,
    render: () => (
      <svg viewBox="0 0 100 118" width="100%" height="100%" aria-hidden="true">
        <rect x="3" y="3" width="94" height="112" fill="#FBF8F0" stroke="#D9D2C0" />
        <rect x="10" y="10" width="80" height="80" fill="#BFD9E8" />
        <circle cx="68" cy="34" r="9" fill="#F2C14E" />
        <path d="M10 90V66C28 50 40 62 54 56C68 50 78 58 90 64V90Z" fill="#6D9A6A" />
        <path d="M10 90V78C30 68 60 84 90 74V90Z" fill="#4F7F58" />
        <path d="M24 102C34 96 40 108 52 100C62 94 70 106 78 99" stroke="#6B6F85" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    )
  },
  'ticket': {
    id: 'ticket',
    name: 'Ticket',
    category: 'little-things-words',
    width: 80,
    height: 50,
    render: () => (
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        <path d="M6 28H94V42A8 8 0 0 0 94 58V72H6V58A8 8 0 0 0 6 42Z" fill="#E7B35A" />
        <path d="M72 30V70" stroke="#8A5F1A" strokeDasharray="3 3" />
        <text x="38" y="56" text-anchor="middle" font-family="Caveat,cursive" font-size="22" fill="#5A3A0D">for you</text>
      </svg>
    )
  },
  'sticky': {
    id: 'sticky',
    name: 'Sticky Note',
    category: 'little-things-words',
    width: 65,
    height: 65,
    render: () => (
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        <path d="M14 14H86V70L70 86H14Z" fill="#F6E27F" />
        <path d="M86 70H70V86Z" fill="#DCC85E" />
        <path d="M24 34H72M24 46H64M24 58H50" stroke="#8A7A2A" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    )
  },
  'clip': {
    id: 'clip',
    name: 'Paper Clip',
    category: 'little-things-words',
    width: 45,
    height: 70,
    render: () => (
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        <path d="M70 24L36 58C29 65 38 74 45 67L78 34C88 24 74 10 64 20L28 56C14 70 34 90 48 76L72 52" fill="none" stroke="#8C93A6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
};

