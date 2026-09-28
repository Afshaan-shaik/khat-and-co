import React from 'react';
import { HANDWRITING_FONTS, INK_PALETTES } from '../constants/fonts';
import { FontOption } from '../types/letter';

interface FontPickerProps {
  selectedFontId: string;
  onSelectFont: (font: FontOption) => void;
  selectedInk: string;
  onSelectInk: (inkHex: string) => void;
  paperDefaultInk?: string;
  isDarkPaper: boolean;
  ruledLines: boolean;
  onToggleRuledLines: () => void;
}

export const FontPicker: React.FC<FontPickerProps> = ({
  selectedFontId,
  onSelectFont,
  selectedInk,
  onSelectInk,
  paperDefaultInk,
  isDarkPaper,
  ruledLines,
  onToggleRuledLines
}) => {
  const inkList = isDarkPaper ? INK_PALETTES.darkPaper : INK_PALETTES.lightPaper;
  const isPaperOwnActive = Boolean(
    paperDefaultInk &&
    selectedInk.toLowerCase() === paperDefaultInk.toLowerCase()
  );

  // Custom metadata for each font matching reference image
  const getFontDetails = (id: string) => {
    switch (id) {
      case 'caveat':
        return { display: 'Hello, you', sub: 'Neat' };
      case 'dancing':
        return { display: 'Hello, you', sub: 'Old cursive' };
      case 'reenie':
        return { display: 'Hello, you', sub: 'Quick note' };
      case 'kalam':
        return { display: 'नमस्ते, तुम', sub: 'Hindi hand' };
      case 'amita':
        return { display: 'प्रिय, तुम', sub: 'Hindi calligraphy' };
      default:
        return { display: 'Hello, you', sub: 'Script' };
    }
  };

  // Group 1: Latin handwriting, Group 2: Hindi handwriting
  const latinFonts = HANDWRITING_FONTS.filter((f) => ['caveat', 'dancing', 'reenie'].includes(f.id));
  const hindiFonts = HANDWRITING_FONTS.filter((f) => ['kalam', 'amita'].includes(f.id));

  return (
    <div className="font-ink-controls-wrapper">

      {/* ── Handwriting Section ── */}
      <div className="control-subgroup">
        <div className="section-label-clean">
          <span>Handwriting</span>
        </div>

        {/* Row 1: Latin Fonts */}
        <div className="font-pill-row mb-2">
          {latinFonts.map((font) => {
            const isSelected = font.id === selectedFontId;
            const details = getFontDetails(font.id);
            return (
              <button
                key={font.id}
                type="button"
                onClick={() => onSelectFont(font)}
                className={`font-pill-card ${isSelected ? 'active' : ''}`}
                style={{ fontFamily: font.family }}
                aria-pressed={isSelected}
              >
                <span className="font-pill-sample">{details.display}</span>
                <span className="font-pill-label">{details.sub}</span>
              </button>
            );
          })}
        </div>

        {/* Row 2: Hindi Fonts */}
        <div className="font-pill-row font-pill-row-hindi">
          {hindiFonts.map((font) => {
            const isSelected = font.id === selectedFontId;
            const details = getFontDetails(font.id);
            return (
              <button
                key={font.id}
                type="button"
                onClick={() => onSelectFont(font)}
                className={`font-pill-card ${isSelected ? 'active' : ''}`}
                style={{ fontFamily: font.family }}
                aria-pressed={isSelected}
              >
                <span className="font-pill-sample">{details.display}</span>
                <span className="font-pill-label">{details.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Ink Section ── */}
      <div className="control-subgroup">
        <div className="section-label-clean">
          <span>Ink</span>
        </div>

        <div className="ink-selector-bar">
          {/* Paper's Own Default Ink Button */}
          {paperDefaultInk && (
            <button
              type="button"
              className={`btn-paper-own-ink ${isPaperOwnActive ? 'active' : ''}`}
              onClick={() => onSelectInk(paperDefaultInk)}
              title="Reset to paper's curated ink color"
              aria-pressed={isPaperOwnActive}
            >
              Paper&apos;s own
            </button>
          )}

          {/* Color Swatches */}
          <div className="ink-swatches-row">
            {inkList.map((ink) => {
              const isSelected = selectedInk.toLowerCase() === ink.hex.toLowerCase();
              return (
                <button
                  key={ink.hex}
                  type="button"
                  className={`ink-swatch-circle ${isSelected ? 'active' : ''}`}
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
      </div>

      {/* ── Ruled Lines Toggle ── */}
      <div className="ruled-toggle-bar">
        <span className="section-label-clean" style={{ margin: 0 }}>
          Ruled Lines
        </span>
        <button
          type="button"
          className={`btn-ruled-toggle ${ruledLines ? 'active' : ''}`}
          onClick={onToggleRuledLines}
          aria-pressed={ruledLines}
        >
          {ruledLines ? (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
