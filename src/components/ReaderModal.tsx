import React, { useState, useEffect, useRef } from 'react';
import { LetterData } from '../types/letter';
import { sfx } from '../utils/sound';
import { renderWaxSealSvg, resolveWaxSeal } from '../constants/waxSeal';
import { renderPostageStampSvg, renderPostmarkSvg } from '../utils/stamps';
import { STICKER_REGISTRY } from '../constants/stickers';
import { PAPER_TEMPLATES } from '../constants/templates';
import { exportLetterAsPdf, exportLetterAsPicture } from '../utils/export';
import { MemoryFolioDisplay } from './MemoryFolioDisplay';
import { PhotoViewer } from './PhotoViewer';

interface ReaderModalProps {
  isOpen: boolean;
  letter: LetterData | null;
  onClose: () => void;
  onWriteBack: (senderName: string, templateId: string, fontId: string) => void;
  isPeek?: boolean;
  isLoading?: boolean;
  loadError?: boolean;
  onRetry?: () => void;
}

/**
 * Helper to determine if a letter has a valid, non-empty audio attachment.
 * Prevents rendering empty audio controls, broken players, or placeholders when no audio is attached.
 */
export function hasAudioAttachment(voiceNoteUrl?: string | null): boolean {
  if (!voiceNoteUrl) return false;
  if (typeof voiceNoteUrl !== 'string') return false;
  const trimmed = voiceNoteUrl.trim();
  if (trimmed.length === 0) return false;
  if (trimmed === 'null' || trimmed === 'undefined' || trimmed === 'false') return false;
  return true;
}

export const ReaderModal: React.FC<ReaderModalProps> = ({
  isOpen,
  letter,
  onClose,
  onWriteBack,
  isPeek = false,
  isLoading = false,
  loadError = false,
  onRetry
}) => {
  const [stageState, setStageState] = useState<'sealed' | 'opening' | 'opened'>('sealed');
  const [passphraseInput, setPassphraseInput] = useState('');
  const [isPassVerified, setIsPassVerified] = useState(false);
  const [passError, setPassError] = useState(false);
  const [isPsTorn, setIsPsTorn] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const paperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setStageState('sealed');
      setPassphraseInput('');
      setIsPassVerified(false);
      setPassError(false);
      setIsPsTorn(false);
      setIsShaking(false);
      setIsDownloadingPdf(false);
      setDownloadSuccess(false);
    } else {
      setStageState('sealed');
      setIsPassVerified(!letter?.passphrase);
    }
  }, [isOpen, letter]);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unlockMs = letter?.unlockDate ? new Date(letter.unlockDate + 'T00:00:00').getTime() : 0;
  const isLocked = unlockMs > now;

  const formatCountdown = (diffMs: number) => {
    const s = Math.max(0, Math.floor(diffMs / 1000));
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return (
      (d ? d + 'd ' : '') +
      String(h).padStart(2, '0') +
      'h ' +
      String(m).padStart(2, '0') +
      'm ' +
      String(sec).padStart(2, '0') +
      's'
    );
  };

  const handleSealClick = () => {
    if (stageState !== 'sealed') return;
    if (loadError) {
      if (onRetry) onRetry();
      return;
    }

    if (isLocked) {
      setIsShaking(true);
      sfx.thump();
      setTimeout(() => setIsShaking(false), 450);
      return;
    }

    if (letter?.passphrase && !isPassVerified) {
      return;
    }

    triggerOpen();
  };

  const triggerOpen = () => {
    sfx.snap();
    setStageState('opening');
    setTimeout(() => sfx.rustle(), 520);

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = prefersReducedMotion ? 300 : 1800;

    setTimeout(() => {
      setStageState('opened');
    }, duration);
  };

  const handlePassSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!letter?.passphrase) {
      setIsPassVerified(true);
      triggerOpen();
      return;
    }
    const cleanIn = passphraseInput.trim().toLowerCase();
    const cleanTarget = letter.passphrase.trim().toLowerCase();
    if (cleanIn === cleanTarget) {
      setIsPassVerified(true);
      setPassError(false);
      triggerOpen();
    } else {
      setPassError(true);
    }
  };

  const handleSavePdf = async () => {
    if (!paperRef.current) {
      window.print();
      return;
    }

    setIsDownloadingPdf(true);
    try {
      const recipientName = (letter?.recipient || 'letter')
        .trim()
        .replace(/[^a-zA-Z0-9_-]/g, '_');
      await exportLetterAsPdf(paperRef.current, {
        fileName: `khat-letter-${recipientName}.pdf`,
        letter: letter || undefined,
        pixelRatio: 2
      });
      setIsDownloadingPdf(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      setIsDownloadingPdf(false);
      console.warn('PDF export failed, falling back to picture download:', err);
      // Secondary fallback: Picture download
      try {
        await exportLetterAsPicture(paperRef.current, {
          fileName: `khat-letter-${letter?.recipient || 'letter'}.png`,
          pixelRatio: 2
        });
      } catch {
        window.print();
      }
    }
  };

  const resolvedSeal = resolveWaxSeal(letter);
  const waxColor = resolvedSeal.color || 'oxblood';
  const isHeart = resolvedSeal.id === 'heart' || resolvedSeal.symbol === '♡';
  const displaySymbol = resolvedSeal.isCustom
    ? (resolvedSeal.customText || 'A')
    : (resolvedSeal.symbol || (isHeart ? '♡' : 'A'));
  const waxMono = displaySymbol;
  const isHindi = letter?.language === 'hi' || (letter?.body && /[\u0900-\u097F]/.test(letter.body));
  const salutePre = isHindi ? 'प्रिय' : 'Dear';
  const currentTemplate = PAPER_TEMPLATES.find((t) => t.id === letter?.templateId) || PAPER_TEMPLATES[0];
  const inkColor = letter?.inkColor || currentTemplate.defaultInk;
  const paperBg = currentTemplate.paperBg;
  const ruledColor = letter?.ruledLines !== false ? currentTemplate.ruledColor : 'transparent';

  return (
    <div
      className="reader envelope-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="A letter"
    >
      <button
        className="reader-x"
        id="readerX"
        type="button"
        onClick={onClose}
        aria-label="Close letter"
      >
        ×
      </button>

      <div className="reader-scroll" id="readerScroll">
        {stageState !== 'opened' ? (
          <>
            <div className={`reader-stage ${stageState === 'opening' ? 'opening' : ''}`}>
              <div
                className={`env rises still envelope-card ${stageState === 'opening' ? 'open' : ''}`}
                data-face="back"
              >
                <div className="env-stage">
                  <div className="env-flip">
                    {/* Front Face */}
                    <div className="env-face front">
                      <div className="ret">{letter?.sender || ''}</div>
                      <div className="addr">
                        <small>To</small>
                        <span className="recipient-name">{letter?.recipient || 'You'}</span>
                      </div>
                      <div
                        className="pm"
                        dangerouslySetInnerHTML={{
                          __html: renderPostmarkSvg(letter?.city, Date.now())
                        }}
                      />
                      <div
                        className="stp"
                        dangerouslySetInnerHTML={{
                          __html: renderPostageStampSvg(letter?.stamp || 0)
                        }}
                      />
                      <i className="env-ring" />
                    </div>

                    {/* Back Face */}
                    <div className="env-face back">
                      <div className="env-lining" />
                      <div className="env-letter">
                        <div className="env-letter-in">
                          <i className="ln" />
                          <i className="ln" />
                          <i className="ln" />
                          <i className="ln" />
                          <i className="ln" />
                          <i className="ln" />
                        </div>
                      </div>
                      <div className="env-pocket">
                        <div />
                      </div>
                      <div className="env-flap">
                        <div />
                      </div>
                      <button
                        className={`env-seal pulsing-wax-seal ${isShaking ? 'shake' : ''}`}
                        type="button"
                        onClick={handleSealClick}
                        aria-label="Break the wax seal"
                        data-testid="envelope-wax-seal"
                        data-seal-id={resolvedSeal.id}
                        data-seal-symbol={waxMono}
                      >
                        <div className={`seal-wrap ${stageState === 'opening' ? 'broken' : ''}`}>
                          <div
                            className="seal-half l"
                            dangerouslySetInnerHTML={{
                              __html: renderWaxSealSvg(waxColor, waxMono)
                            }}
                          />
                          <div
                            className="seal-half r"
                            dangerouslySetInnerHTML={{
                              __html: renderWaxSealSvg(waxColor, waxMono)
                            }}
                          />
                        </div>
                        {/* Hidden text matching seal monogram for accessibility and test assertion */}
                        <span
                          style={{
                            position: 'absolute',
                            opacity: 0,
                            width: '1px',
                            height: '1px',
                            overflow: 'hidden',
                            pointerEvents: 'none'
                          }}
                        >
                          {waxMono}
                        </span>
                      </button>
                      <i className="env-ring" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="reader-msg" aria-live="polite">
              {loadError ? (
                <div>
                  <div>Unable to load letter · खत नहीं मिला</div>
                  {onRetry && (
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-white-50 text-decoration-underline mt-2 p-0"
                      onClick={onRetry}
                      style={{ fontSize: '13px', cursor: 'pointer', border: 'none', background: 'none' }}
                      data-testid="reader-retry-btn"
                    >
                      Tap here or tap seal to retry · पुनः प्रयास करें
                    </button>
                  )}
                </div>
              ) : isLoading && !letter ? (
                'Receiving sealed letter...'
              ) : isLocked ? (
                <>
                  Sealed until {letter?.unlockDate}.
                  <br />
                  It opens in {formatCountdown(unlockMs - now)}
                </>
              ) : letter?.passphrase && !isPassVerified ? (
                'This letter has a passphrase. Enter it below to unlock:'
              ) : isPeek ? (
                'This is how it opens for them. Tap the seal.'
              ) : (
                'Tap the seal to open it.'
              )}
            </div>

            {letter?.passphrase && !isPassVerified && !isLocked && (
              <form className="reader-pass" onSubmit={handlePassSubmit}>
                <input
                  className="field"
                  id="passIn"
                  type="text"
                  placeholder="Passphrase"
                  value={passphraseInput}
                  onChange={(e) => setPassphraseInput(e.target.value)}
                  autoComplete="off"
                  autoFocus
                />
                <button className="btn cta" id="passGo" type="submit">
                  Unlock
                </button>
              </form>
            )}

            {passError && (
              <p className="hint" style={{ color: 'var(--cta)', marginTop: '8px' }}>
                That isn’t the passphrase. Ask the sender for it.
              </p>
            )}
          </>
        ) : (
          /* Unsealed Opened Letter View - EXACT MATCH TO IMAGE 3 */
          <>
            <div className="reader-letter envelope-revealed-container">
                <div
                  ref={paperRef}
                  className={`paper p-${currentTemplate.id} f-${letter?.fontId || 'caveat'} sz-${letter?.fontSize || 'm'} ${letter?.ruledLines !== false ? 'p-lined' : ''}`}
                  style={{
                    backgroundColor: paperBg,
                    color: inkColor,
                    ['--pbg' as string]: paperBg,
                    ['--ink' as string]: inkColor,
                    ['--ruled-line-color' as string]: ruledColor,
                    ['--margin-line-color' as string]: currentTemplate.isDarkPaper ? 'transparent' : 'rgba(210, 56, 47, 0.35)',
                    ...(currentTemplate.borderType !== 'airmail' ? { border: currentTemplate.paperBorder } : {})
                  }}
                >
                <div className="paper-in">
                  <div className="salute letter-to-label">
                    <span>{salutePre}</span>
                    <span className="nm">{letter?.recipient || 'you'},</span>
                  </div>

                  <div className="body" style={{ color: letter?.inkColor }}>
                    {letter?.body}
                  </div>

                  <div className="closing" data-testid="letter-footer">
                    <div>{letter?.signoff || 'With love,'}</div>
                    <div>{letter?.sender || ''}</div>
                  </div>

                  {hasAudioAttachment(letter?.voiceNoteUrl) && (
                    <div className="cassette" data-testid="letter-voice-note">
                      <div className="cassette-label">
                        <span>🎙️ Voice note</span>
                      </div>
                      <audio controls src={letter!.voiceNoteUrl!} />
                    </div>
                  )}

                  {letter?.ps && (
                    <div className={`ps ${isPsTorn ? 'torn' : ''}`}>
                      <div className="ps-note">P.S. {letter.ps}</div>
                      <button
                        className="ps-tear"
                        type="button"
                        onClick={() => {
                          setIsPsTorn(true);
                          sfx.rustle();
                        }}
                      >
                        Tear here to read the P.S.
                      </button>
                    </div>
                  )}

                  {/* Memory Folio Photographs (automatically attached to letter) */}
                  {letter?.memoryFolio && letter.memoryFolio.items && letter.memoryFolio.items.length > 0 && (
                    <MemoryFolioDisplay
                      items={letter.memoryFolio.items}
                      onOpenPhoto={(idx) => {
                        setSelectedPhotoIndex(idx);
                        setIsPhotoViewerOpen(true);
                      }}
                      isRecipientView={true}
                    />
                  )}
                </div>

                {/* Placed Stickers Layer */}
                <div className="stk-layer">
                  {(letter?.stickers || []).map((st) => {
                    const def = STICKER_REGISTRY[st.stickerId];
                    if (!def) return null;
                    return (
                      <div
                        key={st.id}
                        className="stk"
                        style={{
                          left: `${st.x}%`,
                          top: `${st.y}%`,
                          width: `${st.scale ? st.scale * 20 : 20}%`,
                          transform: `translate(-50%, -50%) rotate(${st.rotation}deg)`
                        }}
                      >
                        {def.render(letter?.date)}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="reader-actions" id="readerActions">
              <button
                className="btn ghost"
                id="rPdf"
                type="button"
                onClick={handleSavePdf}
                disabled={isDownloadingPdf}
                aria-label="Save letter as PDF"
                data-testid="save-pdf-btn"
              >
                {isDownloadingPdf ? 'Generating PDF...' : downloadSuccess ? '✓ PDF Saved' : 'Save as PDF'}
              </button>
              <button
                className="btn cta"
                id="rBack"
                type="button"
                data-testid="envelope-write-back-btn"
                onClick={() => {
                  onWriteBack(letter?.sender || '', letter?.templateId || 'lined', letter?.fontId || 'caveat');
                  onClose();
                }}
              >
                Write back <span style={{ opacity: 0.85, fontSize: '0.85em', marginLeft: '4px' }}>(जवाब लिखें)</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Fullscreen Photo Viewer */}
      {letter?.memoryFolio && (
        <PhotoViewer
          isOpen={isPhotoViewerOpen}
          onClose={() => setIsPhotoViewerOpen(false)}
          items={letter.memoryFolio.items}
          initialIndex={selectedPhotoIndex}
        />
      )}
    </div>
  );
};
