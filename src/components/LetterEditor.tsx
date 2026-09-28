import React, { useRef, useEffect, useState } from 'react';
import { LetterData } from '../types/letter';
import { PAPER_TEMPLATES } from '../constants/templates';
import { HANDWRITING_FONTS } from '../constants/fonts';
import { StickerCanvas } from './StickerCanvas';

interface LetterEditorProps {
  letter: LetterData;
  onChangeLetter: (updated: Partial<LetterData>) => void;
  readOnly?: boolean;
  letterSheetRef?: React.RefObject<HTMLDivElement>;
}

// Check if a hex color has high lightness (perceived luminance > 0.55)
function isLightHex(hex: string): boolean {
  if (!hex || !hex.startsWith('#')) return false;
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16) || 0;
  const g = parseInt(c.substring(2, 4), 16) || 0;
  const b = parseInt(c.substring(4, 6), 16) || 0;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55;
}

export const LetterEditor: React.FC<LetterEditorProps> = ({
  letter,
  onChangeLetter,
  readOnly = false,
  letterSheetRef
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

  const currentTemplate =
    PAPER_TEMPLATES.find((t) => t.id === letter.templateId) || PAPER_TEMPLATES[0];
  const currentFont =
    HANDWRITING_FONTS.find((f) => f.id === letter.fontId) || HANDWRITING_FONTS[0];

  // Safeguard: Ensure ink color always contrasts sharply against paper background
  let effectiveInk = letter.inkColor;
  if (currentTemplate.isDarkPaper) {
    if (!isLightHex(effectiveInk)) {
      effectiveInk = currentTemplate.defaultInk;
    }
  } else {
    if (isLightHex(effectiveInk)) {
      effectiveInk = currentTemplate.defaultInk;
    }
  }

  // Auto-resize textarea to fit content seamlessly
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.max(scrollHeight, 380)}px`;
    }
  }, [letter.body, letter.fontId]);

  // Border class based on template borderType
  const getBorderClass = () => {
    switch (currentTemplate.borderType) {
      case 'airmail':
        return 'border-airmail';
      case 'rose-gold':
        return 'border-rose-gold';
      case 'stars':
        return 'border-stars';
      case 'botanical':
        return 'border-botanical';
      case 'stitched':
        return 'border-stitched';
      case 'vintage':
        return 'border-vintage';
      case 'slate':
        return 'border-slate';
      default:
        return 'border-simple';
    }
  };

  const fontLineHeight = currentFont.lineHeight;
  const fontBaseSize = currentFont.baseFontSize;

  // ── Sticker Control Actions (Matching reference image media_1790607353509.png) ──
  const activeSticker =
    letter.stickers.find((s) => s.id === selectedStickerId) ||
    (letter.stickers.length > 0 ? letter.stickers[letter.stickers.length - 1] : null);

  const handleScaleSticker = (delta: number) => {
    if (!activeSticker) return;
    const newScale = Math.min(Math.max(Math.round((activeSticker.scale + delta) * 100) / 100, 0.4), 2.8);
    onChangeLetter({
      stickers: letter.stickers.map((s) =>
        s.id === activeSticker.id ? { ...s, scale: newScale } : s
      )
    });
  };

  const handleRotateSticker = (deltaDeg: number) => {
    if (!activeSticker) return;
    const newRot = ((activeSticker.rotation + deltaDeg + 180) % 360) - 180;
    onChangeLetter({
      stickers: letter.stickers.map((s) =>
        s.id === activeSticker.id ? { ...s, rotation: newRot } : s
      )
    });
  };

  const handleBringToFrontSticker = () => {
    if (!activeSticker) return;
    const maxZ = Math.max(...letter.stickers.map((s) => s.zIndex), 1);
    onChangeLetter({
      stickers: letter.stickers.map((s) =>
        s.id === activeSticker.id ? { ...s, zIndex: maxZ + 1 } : s
      )
    });
  };

  const handleCopySticker = () => {
    if (!activeSticker) return;
    const newSticker = {
      ...activeSticker,
      id: `stk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      x: Math.min(activeSticker.x + 4, 90),
      y: Math.min(activeSticker.y + 4, 90),
      zIndex: Math.max(...letter.stickers.map((s) => s.zIndex), 1) + 1
    };
    onChangeLetter({ stickers: [...letter.stickers, newSticker] });
    setSelectedStickerId(newSticker.id);
  };

  const handleRemoveSticker = () => {
    if (!activeSticker) return;
    onChangeLetter({
      stickers: letter.stickers.filter((s) => s.id !== activeSticker.id)
    });
    setSelectedStickerId(null);
  };

  return (
    <div className="desk-container">

      {/* ── Top Sticker Action Bar (Matching Reference Layout) ── */}
      {!readOnly && (
        <div className="desk-top-toolbar no-export">
          <p className="sticker-desk-hint">
            Tap a sticker on the letter to resize, turn or remove it.
          </p>
          <div className="top-sticker-actions" role="toolbar" aria-label="Sticker adjustment tools">
            <button
              type="button"
              className="btn-sticker-action"
              onClick={() => handleScaleSticker(-0.15)}
              disabled={!activeSticker}
              title="Make sticker smaller"
            >
              Smaller
            </button>
            <button
              type="button"
              className="btn-sticker-action"
              onClick={() => handleScaleSticker(0.15)}
              disabled={!activeSticker}
              title="Make sticker bigger"
            >
              Bigger
            </button>
            <button
              type="button"
              className="btn-sticker-action"
              onClick={() => handleRotateSticker(-15)}
              disabled={!activeSticker}
              title="Turn sticker left"
            >
              Turn left
            </button>
            <button
              type="button"
              className="btn-sticker-action"
              onClick={() => handleRotateSticker(15)}
              disabled={!activeSticker}
              title="Turn sticker right"
            >
              Turn right
            </button>
            <button
              type="button"
              className="btn-sticker-action"
              onClick={handleBringToFrontSticker}
              disabled={!activeSticker}
              title="Bring sticker to front"
            >
              To front
            </button>
            <button
              type="button"
              className="btn-sticker-action"
              onClick={handleCopySticker}
              disabled={!activeSticker}
              title="Copy / duplicate sticker"
            >
              Copy
            </button>
            <button
              type="button"
              className="btn-sticker-action btn-sticker-remove"
              onClick={handleRemoveSticker}
              disabled={!activeSticker}
              title="Remove sticker"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* ── Stationery Paper Sheet ── */}
      <div
        ref={letterSheetRef}
        id="khat-letter-sheet"
        className={`letter-sheet letter-entrance ${getBorderClass()}`}
        style={{
          backgroundColor: currentTemplate.paperBg,
          color: effectiveInk,
          fontFamily: currentFont.family,
          ['--font-line-height' as string]: `${fontLineHeight}px`,
          ['--font-base-size' as string]: `${fontBaseSize}px`,
          ['--ruled-line-color' as string]: letter.ruledLines ? currentTemplate.ruledColor : 'transparent',
          ['--ruled-offset-y' as string]: `${fontLineHeight - 4}px`
        }}
      >
        {/* Active Placed Stickers Layer */}
        <StickerCanvas
          stickers={letter.stickers}
          onChangeStickers={(newStickers) => onChangeLetter({ stickers: newStickers })}
          selectedId={selectedStickerId}
          onSelectId={setSelectedStickerId}
          readOnly={readOnly}
        />

        {/* Recipient envelope tag & Date header */}
        <div className="d-flex justify-content-between align-items-baseline flex-wrap gap-2 mb-4">
          {/* Recipient Name */}
          <div className="d-flex align-items-baseline gap-2" style={{ maxWidth: '60%' }}>
            <span
              className="font-sans fw-semibold text-uppercase"
              style={{ fontSize: '11px', letterSpacing: '1px', color: 'inherit', opacity: 0.65 }}
            >
              Envelope To:
            </span>
            {readOnly ? (
              <span className="fs-5 fw-semibold" style={{ color: 'inherit' }}>
                {letter.recipient}
              </span>
            ) : (
              <input
                type="text"
                className="letter-input-clean fs-5 fw-semibold"
                value={letter.recipient}
                onChange={(e) => onChangeLetter({ recipient: e.target.value })}
                placeholder="Recipient's Name (e.g. For Anaya)"
                maxLength={100}
                aria-label="Recipient's Name"
                style={{ color: 'inherit' }}
              />
            )}
          </div>

          {/* Letter Date */}
          <div className="text-end ms-auto">
            {readOnly ? (
              <span className="fs-6" style={{ color: 'inherit', opacity: 0.85 }}>
                {letter.date}
              </span>
            ) : (
              <input
                type="text"
                className="letter-input-clean text-end fs-6"
                value={letter.date}
                onChange={(e) => onChangeLetter({ date: e.target.value })}
                placeholder="Date of letter"
                maxLength={60}
                aria-label="Date of letter"
                style={{ color: 'inherit', opacity: 0.85 }}
              />
            )}
          </div>
        </div>

        {/* Salutation / Greeting */}
        <div className="mb-3">
          {readOnly ? (
            <h2 className="fs-3 m-0" style={{ fontFamily: 'inherit', color: 'inherit' }}>
              {letter.greeting}
            </h2>
          ) : (
            <input
              type="text"
              className="letter-input-clean fs-3"
              value={letter.greeting}
              onChange={(e) => onChangeLetter({ greeting: e.target.value })}
              placeholder="Greeting (e.g. My Dearest,)"
              maxLength={100}
              aria-label="Letter Greeting"
              style={{ color: 'inherit' }}
            />
          )}
        </div>

        {/* Letter Ruled Body */}
        <div className={`w-100 ${letter.ruledLines ? 'ruled-container' : ''} mb-4`}>
          {readOnly ? (
            <div
              className="letter-body-textarea"
              style={{ whiteSpace: 'pre-wrap', minHeight: '320px', color: 'inherit' }}
            >
              {letter.body}
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              rows={10}
              className="letter-input-clean letter-body-textarea w-100"
              value={letter.body}
              onChange={(e) => onChangeLetter({ body: e.target.value })}
              placeholder="Write your letter here... Pour your heart onto this paper. It automatically autosaves."
              aria-label="Letter body"
              maxLength={6000}
              style={{ color: 'inherit' }}
            />
          )}
        </div>

        {/* Sign-off & Sender Name (Bottom right aligned) */}
        <div className="d-flex flex-column align-items-end mt-4 pt-3">
          <div style={{ maxWidth: '300px', width: '100%', textAlign: 'right' }}>
            {readOnly ? (
              <div className="fs-4" style={{ color: 'inherit' }}>
                {letter.signoff}
              </div>
            ) : (
              <input
                type="text"
                className="letter-input-clean text-end fs-4"
                value={letter.signoff}
                onChange={(e) => onChangeLetter({ signoff: e.target.value })}
                placeholder="Sign-off (e.g. Yours always,)"
                maxLength={80}
                aria-label="Letter Sign-off"
                style={{ color: 'inherit' }}
              />
            )}

            {readOnly ? (
              <div className="fs-3 fw-bold mt-1" style={{ color: 'inherit' }}>
                {letter.sender}
              </div>
            ) : (
              <input
                type="text"
                className="letter-input-clean text-end fs-3 fw-bold mt-1"
                value={letter.sender}
                onChange={(e) => onChangeLetter({ sender: e.target.value })}
                placeholder="Your Name (e.g. Rohan)"
                maxLength={80}
                aria-label="Sender Name"
                style={{ color: 'inherit' }}
              />
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
