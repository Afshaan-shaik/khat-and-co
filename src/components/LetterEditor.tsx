import React, { useRef, useEffect } from 'react';
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

export const LetterEditor: React.FC<LetterEditorProps> = ({
  letter,
  onChangeLetter,
  readOnly = false,
  letterSheetRef
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentTemplate =
    PAPER_TEMPLATES.find((t) => t.id === letter.templateId) || PAPER_TEMPLATES[0];
  const currentFont =
    HANDWRITING_FONTS.find((f) => f.id === letter.fontId) || HANDWRITING_FONTS[0];

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

  return (
    <div className="desk-container" data-testid="letter">
      {/* Stationery Paper Sheet with entrance settle animation */}
      <div
        ref={letterSheetRef}
        id="khat-letter-sheet"
        data-testid="letter-sheet"
        className={`letter-sheet letter-entrance ${getBorderClass()}`}
        style={{
          backgroundColor: currentTemplate.paperBg,
          color: letter.inkColor,
          fontFamily: currentFont.family,
          // CSS variables for typography & ruled lines alignment
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
          readOnly={readOnly}
        />

        {/* Recipient envelope tag & Date header */}
        <div className="d-flex justify-content-between align-items-baseline flex-wrap gap-2 mb-4">
          {/* Recipient Name (For the envelope & letter) */}
          <div className="d-flex align-items-baseline gap-2" style={{ maxWidth: '60%' }}>
            <span
              className="text-muted font-sans fw-semibold text-uppercase"
              style={{ fontSize: '11px', letterSpacing: '1px', opacity: 0.7 }}
              data-testid="letter-to-label"
            >
              Envelope To:
            </span>
            {readOnly ? (
              <span className="fs-5 fw-semibold">{letter.recipient}</span>
            ) : (
              <input
                type="text"
                className="letter-input-clean fs-5 fw-semibold"
                value={letter.recipient}
                onChange={(e) => onChangeLetter({ recipient: e.target.value })}
                placeholder="Recipient's Name (e.g. For Anaya)"
                maxLength={100}
                aria-label="Recipient's Name"
              />
            )}
          </div>

          {/* Letter Date */}
          <div className="text-end ms-auto">
            {readOnly ? (
              <span className="fs-6" style={{ opacity: 0.85 }}>
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
              />
            )}
          </div>
        </div>

        {/* Salutation / Greeting */}
        <div className="mb-3">
          {readOnly ? (
            <h2 className="fs-3 m-0" data-testid="letter-greeting" style={{ fontFamily: 'inherit', color: 'inherit' }}>
              {letter.greeting}
            </h2>
          ) : (
            <input
              type="text"
              className="letter-input-clean fs-3"
              data-testid="letter-greeting"
              value={letter.greeting}
              onChange={(e) => onChangeLetter({ greeting: e.target.value })}
              placeholder="Greeting (e.g. My Dearest,)"
              maxLength={100}
              aria-label="Letter Greeting"
            />
          )}
        </div>

        {/* Letter Ruled Body */}
        <div className={`w-100 ${letter.ruledLines ? 'ruled-container' : ''} mb-4`}>
          {readOnly ? (
            <div
              className="letter-body-textarea"
              data-testid="letter-body"
              style={{ whiteSpace: 'pre-wrap', minHeight: '320px' }}
            >
              {letter.body}
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              rows={10}
              className="letter-input-clean letter-body-textarea w-100"
              data-testid="letter-body"
              value={letter.body}
              onChange={(e) => onChangeLetter({ body: e.target.value })}
              placeholder="Write your letter here... Pour your heart onto this paper. It automatically autosaves."
              aria-label="Letter body"
              maxLength={6000}
            />
          )}
        </div>

        {/* Sign-off & Sender Name (Bottom right aligned) */}
        <div className="d-flex flex-column align-items-end mt-4 pt-3" data-testid="letter-footer">
          <div style={{ maxWidth: '300px', width: '100%', textAlign: 'right' }}>
            {readOnly ? (
              <div className="fs-4">{letter.signoff}</div>
            ) : (
              <input
                type="text"
                className="letter-input-clean text-end fs-4"
                value={letter.signoff}
                onChange={(e) => onChangeLetter({ signoff: e.target.value })}
                placeholder="Sign-off (e.g. Yours always,)"
                maxLength={80}
                aria-label="Letter Sign-off"
              />
            )}

            {readOnly ? (
              <div className="fs-3 fw-bold mt-1">{letter.sender}</div>
            ) : (
              <input
                type="text"
                className="letter-input-clean text-end fs-3 fw-bold mt-1"
                value={letter.sender}
                onChange={(e) => onChangeLetter({ sender: e.target.value })}
                placeholder="Your Name (e.g. Rohan)"
                maxLength={80}
                aria-label="Sender Name"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
