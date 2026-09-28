import React from 'react';
import { HANDWRITING_FONTS, INK_PALETTES } from '../constants/fonts';
import { FontOption } from '../types/letter';

interface FontPickerProps {
  selectedFontId: string;
  onSelectFont: (font: FontOption) => void;
  selectedInk: string;
  onSelectInk: (inkHex: string) => void;
  isDarkPaper: boolean;
  ruledLines: boolean;
  onToggleRuledLines: () => void;
}

export const FontPicker: React.FC<FontPickerProps> = ({
  selectedFontId,
  onSelectFont,
  selectedInk,
  onSelectInk,
  isDarkPaper,
  ruledLines,
  onToggleRuledLines
}) => {
  const inkList = isDarkPaper ? INK_PALETTES.darkPaper : INK_PALETTES.lightPaper;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Handwriting Font ── */}
      <div>
        <div className="section-label" id="font-section-label">
          <span>Handwriting</span>
        </div>
        <div className="font-grid">
          {HANDWRITING_FONTS.map((font) => {
            const isSelected = font.id === selectedFontId;
            return (
              <button
                key={font.id}
                type="button"
                onClick={() => onSelectFont(font)}
                className={`font-btn ${isSelected ? 'active' : ''}`}
                style={{ fontFamily: font.family }}
                title={font.sample}
                aria-pressed={isSelected}
              >
                <span>{font.sample?.split(',')[0] || 'Hello, you'}</span>
                <span className="font-btn-label">{font.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Ink Color ── */}
      <div>
        <div className="section-label" id="ink-section-label">
          <span>Ink {isDarkPaper ? '· Moonlight' : '· Classic'}</span>
        </div>
        <div className="ink-row">
          {inkList.map((ink) => {
            const isSelected = selectedInk.toLowerCase() === ink.hex.toLowerCase();
            return (
              <button
                key={ink.hex}
                type="button"
                className={`ink-swatch ${isSelected ? 'active' : ''}`}
                style={{ backgroundColor: ink.hex }}
                onClick={() => onSelectInk(ink.hex)}
                title={`${ink.name} (${ink.hex})`}
                aria-label={`Select ink color: ${ink.name}`}
                aria-pressed={isSelected}
              />
            );
          })}
        </div>
      </div>

      {/* ── Ruled Lines ── */}
      <div className="ruled-toggle-row">
        <span className="section-label" style={{ margin: 0, flex: 'none' }}>
          <span>Ruled Lines</span>
        </span>
        <button
          type="button"
          className={ruledLines ? 'btn-khat-primary' : 'btn-khat-secondary'}
          onClick={onToggleRuledLines}
          style={{ fontSize: '12.5px', padding: '7px 16px' }}
          aria-pressed={ruledLines}
        >
          {ruledLines ? (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Lines On
            </>
          ) : (
            'Plain Blank'
          )}
        </button>
      </div>

    </div>
  );
};
