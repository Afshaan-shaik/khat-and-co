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

  // High contrast colors: pure white & rose in dark mode, crisp navy in light mode
  const titleColor = isDark ? '#FFFFFF' : '#1F2340';
  const ampColor = isDark ? '#FF6B8B' : '#B4455A';
  const taglineColor = isDark ? '#F8F2E6' : '#2C324E';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 570 140"
      fill="none"
      className={`khat-brand-logo ${className}`}
      style={{
        display: 'block',
        width: 'auto',
        ...style
      }}
      role="img"
      aria-label="Khat &amp; Co. — खत · letters for the people you miss"
    >
      <defs>
        <filter id="khat-logo-glow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation={isDark ? '4' : '2'}
            floodColor={isDark ? 'rgba(255, 107, 139, 0.22)' : 'rgba(180, 69, 90, 0.15)'}
          />
        </filter>
      </defs>

      {/* ── Left Envelope Mark & Floating Hearts ── */}
      <g transform="translate(6, 4)" filter="url(#khat-logo-glow)">
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
            stroke="#1F2340"
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
          <line x1="10" y1="100" x2="55" y2="66" stroke="#1F2340" strokeWidth="2.8" strokeLinecap="round" />
          <line x1="120" y1="100" x2="77" y2="66" stroke="#1F2340" strokeWidth="2.8" strokeLinecap="round" />

          {/* Top flap fold */}
          <path
            d="M10 28 L66 66 L120 28"
            fill="none"
            stroke="#1F2340"
            strokeWidth="3.4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Wax Seal in center */}
          <circle cx="66" cy="66" r="13" fill="#B4455A" stroke="#1F2340" strokeWidth="2.8" />

          {/* Heart in seal */}
          <path
            d="M66 72.5 L64.7 71.3 C60.2 67.2 57.1 64.4 57.1 61 C57.1 58.2 59.2 56.1 62 56.1 C63.6 56.1 65.1 56.8 66 58 C66.9 56.8 68.4 56.1 70 56.1 C72.8 56.1 74.9 58.2 74.9 61 C74.9 64.4 71.8 67.2 67.3 71.3 L66 72.5 Z"
            fill="#FAF5EB"
          />
        </g>

        {/* Floating Hearts */}
        <g transform="translate(122, 8) rotate(-14) scale(0.65)">
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill={isDark ? '#FFB5C5' : '#E9B7C1'}
          />
        </g>

        <g transform="translate(128, 30) rotate(18) scale(1.12)">
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill={isDark ? '#FF4D6D' : '#B4455A'}
          />
        </g>

        <g transform="translate(138, 70) rotate(10) scale(0.72)">
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill={isDark ? '#FF7A95' : '#D98A9A'}
          />
        </g>
      </g>

      {/* ── Brand Wordmark "Khat & Co." ── */}
      <text
        x="176"
        y="76"
        fill={titleColor}
        className="brand-title"
        style={{
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontSize: '76px',
          fontWeight: 400,
          fill: titleColor,
          letterSpacing: '-0.5px'
        }}
      >
        Khat{' '}
        <tspan
          fill={ampColor}
          className="brand-amp"
          style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontStyle: 'italic',
            fontWeight: 400,
            fill: ampColor
          }}
        >
          &amp;
        </tspan>{' '}
        Co.
      </text>

      {/* ── Expanded, High-Legibility Tagline ── */}
      <text
        x="176"
        y="114"
        fill={taglineColor}
        className="brand-sub"
        style={{
          fontFamily: "'Kalam', 'Instrument Sans', system-ui, sans-serif",
          fontSize: '25px',
          fontWeight: 600,
          fill: taglineColor,
          letterSpacing: '0.4px'
        }}
      >
        खत · letters for the people you miss
      </text>
    </svg>
  );
};
