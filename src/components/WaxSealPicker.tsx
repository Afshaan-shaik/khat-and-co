import React, { useState } from 'react';

interface WaxSealOption {
  id: string;
  label: string;
  symbol: string;
  description: string;
}

const WAX_SEAL_OPTIONS: WaxSealOption[] = [
  { id: 'heart', label: '♡', symbol: '♡', description: 'Heart' },
  { id: 'star', label: '✦', symbol: '✦', description: 'Star' },
  { id: 'infinity', label: '∞', symbol: '∞', description: 'Infinity' },
  { id: 'fleur', label: '✿', symbol: '✿', description: 'Fleur' },
  { id: 'moon', label: '☽', symbol: '☽', description: 'Moon' },
  { id: 'crown', label: '♔', symbol: '♔', description: 'Crown' },
  { id: 'custom', label: 'A', symbol: 'A', description: 'Your Initial' },
];

export interface WaxSealData {
  symbol: string;
  isCustom: boolean;
  customText: string;
}

interface WaxSealPickerProps {
  sealData: WaxSealData;
  onChangeSeal: (seal: WaxSealData) => void;
}

export const WaxSealPicker: React.FC<WaxSealPickerProps> = ({ sealData, onChangeSeal }) => {
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleSelectSymbol = (opt: WaxSealOption) => {
    if (opt.id === 'custom') {
      setShowCustomInput(true);
      onChangeSeal({ symbol: sealData.customText || 'A', isCustom: true, customText: sealData.customText || 'A' });
    } else {
      setShowCustomInput(false);
      onChangeSeal({ symbol: opt.symbol, isCustom: false, customText: sealData.customText || 'A' });
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.slice(0, 2).toUpperCase();
    onChangeSeal({ symbol: val || 'A', isCustom: true, customText: val || 'A' });
  };

  const isCustomActive = sealData.isCustom;

  return (
    <div className="wax-seal-picker">
      <div className="wax-seal-preview-row">
        <div className="wax-seal-preview-wrap">
          <svg viewBox="0 0 68 68" width="64" height="64" fill="none" aria-hidden="true">
            <path
              d="M34 5 C42 4 47 8 54 12 C60 17 63 23 63 31 C64 39 60 47 55 53 C49 59 42 63 33 63 C25 62 18 59 12 53 C7 47 5 40 5 32 C5 24 9 17 15 12 C21 7 26 5 34 5 Z"
              fill="var(--rose)"
              stroke="rgba(0,0,0,0.15)"
              strokeWidth="1.5"
            />
            <text
              x="34"
              y="40"
              textAnchor="middle"
              fill="#F6EFE3"
              fontSize={sealData.symbol.length > 1 ? '16' : '24'}
              fontFamily="'Instrument Serif', serif"
              fontWeight="400"
            >
              {sealData.symbol}
            </text>
          </svg>
        </div>
        <div className="wax-seal-preview-label">
          <span className="wax-seal-preview-name">Your Wax Seal</span>
          <span className="wax-seal-preview-hint">Appears on your sealed envelope</span>
        </div>
      </div>

      <div className="wax-seal-options">
        {WAX_SEAL_OPTIONS.map((opt) => {
          const isActive = opt.id === 'custom' ? isCustomActive : (!isCustomActive && sealData.symbol === opt.symbol);
          return (
            <button
              key={opt.id}
              type="button"
              className={`wax-seal-opt-btn ${isActive ? 'active' : ''}`}
              onClick={() => handleSelectSymbol(opt)}
              aria-label={`Select ${opt.description} seal`}
              title={opt.description}
            >
              <span className="wax-seal-opt-symbol">{opt.id === 'custom' ? (sealData.customText || 'A') : opt.symbol}</span>
            </button>
          );
        })}
      </div>

      {(showCustomInput || isCustomActive) && (
        <div className="wax-seal-custom-input-wrap">
          <label htmlFor="wax-seal-custom" className="wax-seal-custom-label">
            Your initial or monogram (1–2 letters)
          </label>
          <input
            id="wax-seal-custom"
            type="text"
            className="wax-seal-custom-input"
            value={sealData.customText}
            onChange={handleCustomChange}
            maxLength={2}
            placeholder="A"
            aria-label="Custom wax seal initial or monogram"
          />
        </div>
      )}
    </div>
  );
};

/** Renders a wax seal SVG for inline use on envelopes and previews */
export const WaxSealSVG: React.FC<{ symbol: string; size?: number; color?: string }> = ({
  symbol,
  size = 52,
  color = 'var(--rose)'
}) => (
  <svg viewBox="0 0 68 68" width={size} height={size} fill="none" aria-label="Wax seal">
    <path
      d="M34 5 C42 4 47 8 54 12 C60 17 63 23 63 31 C64 39 60 47 55 53 C49 59 42 63 33 63 C25 62 18 59 12 53 C7 47 5 40 5 32 C5 24 9 17 15 12 C21 7 26 5 34 5 Z"
      fill={color}
      stroke="rgba(0,0,0,0.12)"
      strokeWidth="1.5"
    />
    <circle cx="34" cy="34" r="20" stroke="rgba(246,239,227,0.35)" strokeWidth="1.2" strokeDasharray="3 2" />
    <text
      x="34"
      y="40"
      textAnchor="middle"
      fill="#F6EFE3"
      fontSize={symbol.length > 1 ? '17' : '24'}
      fontFamily="'Instrument Serif', serif"
      fontWeight="400"
    >
      {symbol}
    </text>
  </svg>
);
