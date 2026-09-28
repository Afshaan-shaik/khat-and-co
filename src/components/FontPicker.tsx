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
    <div className="controls-card p-3 mb-4">
      <div className="row g-3 align-items-center">
        {/* Handwriting Font Selector */}
        <div className="col-12 col-md-5">
          <div className="d-flex align-items-center justify-content-between mb-1">
            <label htmlFor="font-select" className="small text-muted fw-semibold">
              HANDWRITING · लिखावट
            </label>
            <span className="small text-muted" style={{ fontSize: '11px' }}>
              Includes Hindi support
            </span>
          </div>
          <div className="d-flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {HANDWRITING_FONTS.map((font) => {
              const isSelected = font.id === selectedFontId;
              return (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => onSelectFont(font)}
                  className={`btn btn-sm ${isSelected ? 'btn-khat-primary' : 'btn-khat-secondary'}`}
                  style={{
                    fontFamily: font.family,
                    fontSize: '17px',
                    padding: '4px 12px',
                    whiteSpace: 'nowrap'
                  }}
                  title={font.sample}
                >
                  {font.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Ink Color Swatches */}
        <div className="col-12 col-sm-8 col-md-5">
          <div className="d-flex align-items-center justify-content-between mb-1">
            <span className="small text-muted fw-semibold">
              INK COLOR · स्याही ({isDarkPaper ? 'Moonlight Inks' : 'Classic Inks'})
            </span>
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
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
                />
              );
            })}
          </div>
        </div>

        {/* Ruled Lines Toggle */}
        <div className="col-12 col-sm-4 col-md-2 text-sm-end">
          <label className="small text-muted fw-semibold d-block mb-1">
            RULED LINES
          </label>
          <button
            type="button"
            className={`btn btn-sm ${ruledLines ? 'btn-khat-primary' : 'btn-khat-secondary'}`}
            onClick={onToggleRuledLines}
            style={{ fontSize: '13px', padding: '6px 12px' }}
          >
            {ruledLines ? 'Lines: On' : 'Plain Blank'}
          </button>
        </div>
      </div>
    </div>
  );
};
