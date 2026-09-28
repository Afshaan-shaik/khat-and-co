import React, { useState, useEffect, useRef } from 'react';
import { LetterData } from '../types/letter';
import { LetterEditor } from './LetterEditor';
import { exportLetterAsPicture } from '../utils/export';

interface EnvelopeModalProps {
  letter: LetterData;
  isOpen: boolean;
  onClose: () => void;
  onWriteBack: (recipientSender: string, templateId: string, fontId: string) => void;
  isRecipientFlow?: boolean; // opened via URL hash
}

export const EnvelopeModal: React.FC<EnvelopeModalProps> = ({
  letter,
  isOpen,
  onClose,
  onWriteBack,
  isRecipientFlow = false
}) => {
  const [isOpening, setIsOpening] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const letterSheetRef = useRef<HTMLDivElement>(null);

  // Reset states whenever modal opens
  useEffect(() => {
    if (isOpen) {
      // Check prefers-reduced-motion
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        setIsOpening(false);
        setIsRevealed(true);
      } else {
        setIsOpening(false);
        setIsRevealed(false);
      }
    }
  }, [isOpen]);

  // Handle escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOpenEnvelope = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsRevealed(true);
      return;
    }

    setIsOpening(true);
    setTimeout(() => {
      setIsRevealed(true);
      setIsOpening(false);
    }, 1100);
  };

  const handleReplay = () => {
    setIsRevealed(false);
    setIsOpening(false);
  };

  const handleSavePicture = async () => {
    if (!letterSheetRef.current) return;
    try {
      setIsExporting(true);
      await exportLetterAsPicture(letterSheetRef.current, {
        fileName: 'khat-and-co-letter.png',
        pixelRatio: 3
      });
    } catch (err) {
      console.error('Failed to export letter picture', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="envelope-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Letter reading experience"
    >
      {/* Top action bar when letter is revealed */}
      {isRevealed && (
        <div
          className="fixed-top py-2 px-3 d-flex align-items-center justify-content-between flex-wrap gap-2"
          style={{
            backgroundColor: 'var(--ui-panel-bg)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--ui-panel-border)',
            zIndex: 2100
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <img src="/khat-mark.svg" alt="" aria-hidden="true" width="32" height="26" />
            <div>
              <span className="font-serif fs-5 fw-bold text-nowrap" style={{ color: 'var(--ui-text)' }}>
                Khat <span style={{ color: 'var(--rose)', fontStyle: 'italic' }}>&amp;</span> Co.
              </span>
              <span className="d-none d-sm-inline ms-2 small text-muted font-kalam">
                {isRecipientFlow ? `Letter for ${letter.recipient}` : 'Reader Preview Mode'}
              </span>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 ms-auto">
            {/* Write Back Button */}
            <button
              type="button"
              className="btn-khat-primary btn-sm"
              onClick={() => onWriteBack(letter.sender, letter.templateId, letter.fontId)}
              title="Reply to this letter on matching stationery"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 17 4 12 9 7" />
                <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
              </svg>
              <span>Write Back (जवाब लिखें)</span>
            </button>

            {/* Read Again / Replay */}
            <button
              type="button"
              className="btn-khat-secondary btn-sm"
              onClick={handleReplay}
              title="Fold back and open the envelope again"
            >
              <span>Read Again</span>
            </button>

            {/* Save Picture */}
            <button
              type="button"
              className="btn-khat-secondary btn-sm"
              onClick={handleSavePicture}
              disabled={isExporting}
              title="Download letter as high-resolution PNG"
            >
              {isExporting ? 'Saving...' : 'Save Picture'}
            </button>

            {/* Close */}
            <button
              type="button"
              className="btn-khat-secondary btn-icon-only btn-sm"
              onClick={onClose}
              aria-label="Close reader view"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* STAGE 1: FULL SCREEN ANIMATED ENVELOPE */}
      {!isRevealed && (
        <div className="envelope-view-stage">
          {/* Subtle instruction above envelope */}
          <div className="text-center mb-3">
            <span
              className="badge px-3 py-2 rounded-pill font-kalam"
              style={{
                backgroundColor: 'rgba(246, 239, 227, 0.15)',
                color: '#F6EFE3',
                fontSize: '14px',
                letterSpacing: '0.5px'
              }}
            >
              {isOpening ? 'Opening letter...' : 'A digital letter sealed for you · खत तुम्हारे लिए'}
            </span>
          </div>

          {/* Envelope Card */}
          <div
            className={`envelope-card ${isOpening ? 'envelope-opened' : ''}`}
            style={{ maxWidth: '520px', width: '100%', minHeight: '320px' }}
          >
            {/* Airmail dashed frame */}
            <div className="envelope-airmail-frame" />

            {/* Postal Stamp & Postmark at top right of envelope */}
            <div
              style={{
                position: 'absolute',
                top: '22px',
                right: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {/* Circular postmark */}
              <div style={{ width: '56px', height: '56px', opacity: 0.85 }}>
                <svg viewBox="0 0 84 84" width="100%" height="100%" fill="none">
                  <circle cx="42" cy="42" r="38" stroke="#1F2340" strokeWidth="2" opacity="0.85" />
                  <circle cx="42" cy="42" r="32" stroke="#1F2340" strokeWidth="1.2" strokeDasharray="4 2" />
                  <text x="42" y="24" textAnchor="middle" fill="#1F2340" fontSize="7" fontFamily="'Instrument Sans', sans-serif" fontWeight="700">
                    AIR MAIL
                  </text>
                  <text x="42" y="46" textAnchor="middle" fill="#B4455A" fontSize="8" fontFamily="'Instrument Sans', sans-serif" fontWeight="700">
                    SPECIAL
                  </text>
                  <text x="42" y="64" textAnchor="middle" fill="#1F2340" fontSize="7" fontFamily="'Kalam', cursive">
                    डाक विभाग
                  </text>
                </svg>
              </div>

              {/* Airmail postage stamp */}
              <div style={{ width: '48px', height: '58px', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
                <svg viewBox="0 0 64 76" width="100%" height="100%" fill="none">
                  <rect x="2" y="2" width="60" height="72" rx="2" fill="#F6EFE3" stroke="#3E5C8A" strokeWidth="2" strokeDasharray="3 3" />
                  <rect x="6" y="6" width="52" height="64" fill="#EAF0F8" stroke="#3E5C8A" strokeWidth="1.5" />
                  <path d="M22 36 C24 30 30 26 38 28 C42 29 46 27 48 24 C46 30 43 33 40 34 C44 38 41 44 34 44 C28 44 24 40 22 36 Z" fill="#FFFFFF" stroke="#3E5C8A" strokeWidth="1.5" />
                  <text x="32" y="58" textAnchor="middle" fill="#3E5C8A" fontSize="7" fontFamily="'Instrument Sans', sans-serif" fontWeight="700">
                    KHAT &amp; CO
                  </text>
                </svg>
              </div>
            </div>

            {/* Handwritten Addressed Text on Front - Down-Left Side */}
            <div
              className="text-start"
              style={{
                position: 'absolute',
                bottom: '22px',
                left: '26px',
                zIndex: 20,
                fontFamily: "'Kalam', 'Caveat', cursive",
                color: '#1F2340',
                maxWidth: '46%',
                pointerEvents: 'none'
              }}
            >
              <div className="small text-muted font-sans text-uppercase fw-bold" style={{ fontSize: '11px', letterSpacing: '1px', opacity: 0.75, marginBottom: '2px' }}>
                TO:
              </div>
              <div className="fw-bold lh-1 mb-2" style={{ fontSize: 'clamp(20px, 4.5vw, 28px)', color: '#1F2340', lineHeight: 1.1, wordBreak: 'break-word' }}>
                {letter.recipient || 'Dearest Friend'}
              </div>
              <div className="fs-5 text-muted font-sans mt-1" style={{ fontSize: '13px' }}>
                From: <span className="font-kalam fw-bold" style={{ color: '#B4455A', fontSize: '18px' }}>{letter.sender || 'Someone who loves you'}</span>
              </div>
            </div>

            {/* 3D Envelope Flap */}
            <div className="envelope-flap">
              <svg viewBox="0 0 520 180" width="100%" height="100%" preserveAspectRatio="none">
                <polygon
                  points="0,0 520,0 260,180"
                  fill="#E7DCBE"
                  stroke="#1F2340"
                  strokeWidth="2.5"
                />
                <line x1="20" y1="12" x2="250" y2="170" stroke="#B4455A" strokeWidth="2.5" strokeDasharray="7 5" />
                <line x1="500" y1="12" x2="270" y2="170" stroke="#3E5C8A" strokeWidth="2.5" strokeDasharray="7 5" />
              </svg>
            </div>

            {/* Sliding Letter Preview inside during opening */}
            {isOpening && (
              <div
                className="letter-sliding-out"
                style={{
                  position: 'absolute',
                  width: '85%',
                  height: '80%',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '6px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                  zIndex: 35,
                  padding: '16px'
                }}
              >
                <div style={{ width: '40%', height: '10px', backgroundColor: '#D9CDBC', borderRadius: '4px', marginBottom: '12px' }} />
                <div style={{ width: '90%', height: '8px', backgroundColor: '#EFEAE0', borderRadius: '4px', marginBottom: '8px' }} />
                <div style={{ width: '85%', height: '8px', backgroundColor: '#EFEAE0', borderRadius: '4px', marginBottom: '8px' }} />
                <div style={{ width: '70%', height: '8px', backgroundColor: '#EFEAE0', borderRadius: '4px' }} />
              </div>
            )}

            {/* Center Pulsing Wax Seal Button */}
            {!isOpening && (
              <button
                type="button"
                className="pulsing-wax-seal"
                onClick={handleOpenEnvelope}
                title="Tap to break the seal and open the letter"
                aria-label="Tap to open letter"
              >
                <svg viewBox="0 0 68 68" width="80" height="80" fill="none">
                  {/* Organic wax seal */}
                  <path
                    d="M34 6 C42 5 46 9 53 13 C59 18 62 23 62 31 C63 39 59 46 54 52 C48 58 41 62 33 62 C25 61 19 59 13 53 C8 47 6 41 6 33 C6 25 10 18 16 13 C22 8 26 6 34 6 Z"
                    fill="#B4455A"
                    stroke="#1F2340"
                    strokeWidth="2.8"
                  />
                  <circle cx="34" cy="34" r="20" stroke="rgba(246, 239, 227, 0.45)" strokeWidth="1.5" strokeDasharray="3 2" />
                  {/* Cream Heart inside seal */}
                  <path
                    d="M34 43 L32.5 41.6 C27.5 37 24 33.8 24 29.8 C24 26.5 26.5 24 29.8 24 C31.6 24 33.3 24.8 34 26.1 C34.7 24.8 36.4 24 38.2 24 C41.5 24 44 26.5 44 29.8 C44 33.8 40.5 37 35.5 41.6 L34 43 Z"
                    fill="#F6EFE3"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Help hint */}
          <div className="text-center mt-3">
            <span className="small text-light opacity-75 font-sans">
              Tap the rose wax seal to unseal · मोहर पर टैप करें
            </span>
          </div>

          {/* Close preview button */}
          <button
            type="button"
            className="btn btn-sm btn-link text-white-50 text-decoration-none mt-3"
            onClick={onClose}
          >
            ← Return to Editor
          </button>
        </div>
      )}

      {/* STAGE 2: REVEALED READ-ONLY LETTER SHEET */}
      {isRevealed && (
        <div className="w-100" style={{ paddingTop: '70px', paddingBottom: '40px' }}>
          <LetterEditor
            letter={letter}
            onChangeLetter={() => {}}
            readOnly={true}
            letterSheetRef={letterSheetRef}
          />
        </div>
      )}
    </div>
  );
};
