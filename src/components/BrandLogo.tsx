import React from 'react';

interface BrandLogoProps {
  theme?: 'dark' | 'light';
  className?: string;
  style?: React.CSSProperties;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  theme = 'dark',
  className = '',
  style = {}
}) => {
  const isDark = theme === 'dark';

  return (
    <div
      className={`khat-brand-lockup ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        textDecoration: 'none',
        ...style
      }}
    >
      {/* ── Left Envelope Mark & Floating Hearts (Standalone crisp SVG icon) ── */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 162 110"
        fill="none"
        className="brand-envelope-mark"
        style={{
          height: '66px',
          width: 'auto',
          flexShrink: 0,
          display: 'block'
        }}
        aria-hidden="true"
        role="presentation"
      >
        <defs>
          <filter id="khat-logo-glow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow
              dx="0"
              dy="2"
              stdDeviation={isDark ? '4' : '2'}
              floodColor={isDark ? 'rgba(255, 107, 139, 0.32)' : 'rgba(180, 69, 90, 0.16)'}
            />
          </filter>
        </defs>

        <g transform="translate(4, 2)" filter="url(#khat-logo-glow)">
          {/* Tilted Envelope */}
          <g transform="rotate(-6 65 72)">
            {/* Envelope Body */}
            <rect
              x="8"
              y="26"
              width="114"
              height="76"
              rx="8"
              fill="#FAF5EB"
              stroke={isDark ? '#F5ECD7' : '#1F2340'}
              strokeWidth="3.6"
              strokeLinejoin="round"
            />

            {/* Top dashed airmail rose line */}
            <line
              x1="16"
              y1="37"
              x2="114"
              y2="37"
              stroke="#B4455A"
              strokeWidth="2.8"
              strokeDasharray="6 4.5"
              strokeLinecap="round"
            />

            {/* Bottom dashed airmail blue line */}
            <line
              x1="16"
              y1="91"
              x2="114"
              y2="91"
              stroke="#3E5C8A"
              strokeWidth="2.8"
              strokeDasharray="6 4.5"
              strokeLinecap="round"
            />

            {/* Diagonals */}
            <line x1="10" y1="100" x2="55" y2="66" stroke={isDark ? '#F5ECD7' : '#1F2340'} strokeWidth="2.8" strokeLinecap="round" />
            <line x1="120" y1="100" x2="77" y2="66" stroke={isDark ? '#F5ECD7' : '#1F2340'} strokeWidth="2.8" strokeLinecap="round" />

            {/* Top flap fold */}
            <path
              d="M10 28 L66 66 L120 28"
              fill="none"
              stroke={isDark ? '#F5ECD7' : '#1F2340'}
              strokeWidth="3.4"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Wax Seal in center */}
            <circle cx="66" cy="66" r="13" fill="#B4455A" stroke={isDark ? '#F5ECD7' : '#1F2340'} strokeWidth="2.8" />

            {/* Heart in seal */}
            <path
              d="M66 72.5 L64.7 71.3 C60.2 67.2 57.1 64.4 57.1 61 C57.1 58.2 59.2 56.1 62 56.1 C63.6 56.1 65.1 56.8 66 58 C66.9 56.8 68.4 56.1 70 56.1 C72.8 56.1 74.9 58.2 74.9 61 C74.9 64.4 71.8 67.2 67.3 71.3 L66 72.5 Z"
              fill="#FAF5EB"
            />
          </g>

          {/* Floating Hearts */}
          {/* Top heart */}
          <g transform="translate(122, 8) rotate(-14) scale(0.65)">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill={isDark ? '#FFB5C5' : '#E9B7C1'}
            />
          </g>

          {/* Middle heart (vibrant) */}
          <g transform="translate(128, 30) rotate(18) scale(1.12)">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill={isDark ? '#FF4D6D' : '#B4455A'}
            />
          </g>

          {/* Bottom heart */}
          <g transform="translate(138, 70) rotate(10) scale(0.72)">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill={isDark ? '#FF7A95' : '#D98A9A'}
            />
          </g>
        </g>
      </svg>

      {/* ── Textual Brand Identity (HTML with crisp typography & no clipping) ── */}
      <div className="brand-text-block">
        <div className="brand-title">
          Khath <span className="brand-amp">&amp;</span> Co.
        </div>
        <div
          className="brand-tagline"
          data-testid="tagline"
          title="खत · letters for the people you miss"
        >
          खत · letters for the people you miss
        </div>
      </div>
    </div>
  );
};
