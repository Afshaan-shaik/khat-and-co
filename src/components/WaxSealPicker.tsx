import React, { useState } from 'react';
import { WaxSealData } from '../types/letter';
import { WAX_SEAL_OPTIONS, DEFAULT_WAX_SEAL, resolveWaxSeal, WaxSealOption } from '../constants/waxSeal';

export type { WaxSealData };
export { WAX_SEAL_OPTIONS, DEFAULT_WAX_SEAL, resolveWaxSeal };

interface WaxSealPickerProps {
  sealData?: WaxSealData;
  onChangeSeal: (seal: WaxSealData) => void;
}

export const WaxSealPicker: React.FC<WaxSealPickerProps> = ({ sealData, onChangeSeal }) => {
  const currentSeal = resolveWaxSeal(sealData);
  const [showCustomInput, setShowCustomInput] = useState(() => Boolean(currentSeal.isCustom));

  const handleSelectSymbol = (opt: WaxSealOption) => {
    if (opt.id === 'custom') {
      setShowCustomInput(true);
      const customTxt = currentSeal.customText || 'A';
      onChangeSeal({
        id: 'custom',
        symbol: customTxt,
        isCustom: true,
        customText: customTxt
      });
    } else {
      setShowCustomInput(false);
      onChangeSeal({
        id: opt.id,
        symbol: opt.symbol,
        isCustom: false,
        customText: currentSeal.customText || 'A'
      });
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.slice(0, 2).toUpperCase();
    onChangeSeal({
      id: 'custom',
      symbol: val || 'A',
      isCustom: true,
      customText: val || 'A'
    });
  };

  const isCustomActive = Boolean(currentSeal.isCustom);

  return (
    <div className="wax-seal-picker" data-testid="wax-seal-picker">
      <div className="wax-seal-preview-row">
        <div className="wax-seal-preview-wrap" data-testid="wax-seal-active-preview">
          <WaxSealSVG seal={currentSeal} size={64} />
        </div>
        <div className="wax-seal-preview-label">
          <span className="wax-seal-preview-name">Your Wax Seal</span>
          <span className="wax-seal-preview-hint">Appears on your sealed envelope</span>
        </div>
      </div>

      <div className="wax-seal-options" role="radiogroup" aria-label="Wax seal options">
        {WAX_SEAL_OPTIONS.map((opt) => {
          const isActive = opt.id === 'custom'
            ? isCustomActive
            : (!isCustomActive && (currentSeal.id === opt.id || currentSeal.symbol === opt.symbol));
          return (
            <button
              key={opt.id}
              type="button"
              className={`wax-seal-opt-btn ${isActive ? 'active' : ''}`}
              onClick={() => handleSelectSymbol(opt)}
              aria-label={`Select ${opt.description} wax seal`}
              aria-checked={isActive}
              role="radio"
              title={opt.description}
              data-testid={`seal-option-${opt.id}`}
            >
              <span className="wax-seal-opt-symbol">
                {opt.id === 'custom' ? (currentSeal.customText || 'A') : opt.symbol}
              </span>
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
            data-testid="wax-seal-custom-input"
            type="text"
            className="wax-seal-custom-input"
            value={currentSeal.customText || ''}
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
export const WaxSealSVG: React.FC<{
  seal?: WaxSealData;
  symbol?: string;
  size?: number;
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  className?: string;
}> = ({
  seal,
  symbol: propSymbol,
  size = 52,
  color = 'var(--rose)',
  strokeColor = 'rgba(0,0,0,0.15)',
  strokeWidth = 1.5,
  className
}) => {
  const activeSeal = resolveWaxSeal(seal || (propSymbol ? { id: propSymbol === '♡' ? 'heart' : 'custom', symbol: propSymbol } : null));
  const isHeart = activeSeal.id === 'heart' || activeSeal.symbol === '♡';
  const displaySymbol = activeSeal.symbol || (isHeart ? '♡' : 'A');

  return (
    <svg
      viewBox="0 0 68 68"
      width={size}
      height={size}
      fill="none"
      aria-label={`Wax seal ${activeSeal.symbol}`}
      className={className}
    >
      <path
        d="M34 5 C42 4 47 8 54 12 C60 17 63 23 63 31 C64 39 60 47 55 53 C49 59 42 63 33 63 C25 62 18 59 12 53 C7 47 5 40 5 32 C5 24 9 17 15 12 C21 7 26 5 34 5 Z"
        fill={color}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      <circle cx="34" cy="34" r="20" stroke="rgba(246,239,227,0.38)" strokeWidth="1.3" strokeDasharray="3 2" />
      {isHeart ? (
        <path
          d="M34 43 L32.5 41.6 C27.5 37 24 33.8 24 29.8 C24 26.5 26.5 24 29.8 24 C31.6 24 33.3 24.8 34 26.1 C34.7 24.8 36.4 24 38.2 24 C41.5 24 44 26.5 44 29.8 C44 33.8 40.5 37 35.5 41.6 L34 43 Z"
          fill="#F6EFE3"
        />
      ) : (
        <text
          x="34"
          y="41"
          textAnchor="middle"
          fill="#F6EFE3"
          fontSize={displaySymbol.length > 1 ? '17' : '25'}
          fontFamily="'Instrument Serif', serif"
          fontWeight="400"
        >
          {displaySymbol}
        </text>
      )}
    </svg>
  );
};
