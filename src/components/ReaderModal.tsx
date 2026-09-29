import React, { useState, useEffect } from 'react';
import { LetterData } from '../types/letter';
import { sfx } from '../utils/sound';
import { renderWaxSealSvg } from '../constants/waxSeal';
import { renderPostageStampSvg, renderPostmarkSvg } from '../utils/stamps';
import { STICKER_REGISTRY } from '../constants/stickers';
import { exportLetterAsPicture } from '../utils/export';

interface ReaderModalProps {
  isOpen: boolean;
  letter: LetterData | null;
  onClose: () => void;
  onWriteBack: (senderName: string, templateId: string, fontId: string) => void;
  isPeek?: boolean;
}

export const ReaderModal: React.FC<ReaderModalProps> = ({
  isOpen,
  letter,
  onClose,
  onWriteBack,
  isPeek = false
}) => {
  const [isOpened, setIsOpened] = useState(false);
  const [passphraseInput, setPassphraseInput] = useState('');
  const [isPassVerified, setIsPassVerified] = useState(false);
  const [passError, setPassError] = useState(false);
  const [isPsTorn, setIsPsTorn] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [now, setNow] = useState(Date.now());

  const paperRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsOpened(false);
      setPassphraseInput('');
      setIsPassVerified(false);
      setPassError(false);
      setIsPsTorn(false);
      setIsShaking(false);
    } else {
      setIsOpened(false);
      setIsPassVerified(!letter?.passphrase);
    }
  }, [isOpen, letter]);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen || !letter) return null;

  const unlockMs = letter.unlockDate ? new Date(letter.unlockDate + 'T00:00:00').getTime() : 0;
  const isLocked = unlockMs > now;

  const formatCountdown = (diffMs: number) => {
    const s = Math.max(0, Math.floor(diffMs / 1000));
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return (d ? d + 'd ' : '') +
      String(h).padStart(2, '0') + 'h ' +
      String(m).padStart(2, '0') + 'm ' +
      String(sec).padStart(2, '0') + 's';
  };

  const handleSealClick = () => {
    if (isOpened) return;

    if (isLocked) {
      setIsShaking(true);
      sfx.thump();
      setTimeout(() => setIsShaking(false), 450);
      return;
    }

    if (letter.passphrase && !isPassVerified) {
      return;
    }

    triggerOpen();
  };

  const triggerOpen = () => {
    sfx.snap();
    setIsOpened(true);
    setTimeout(() => sfx.rustle(), 520);
  };

  const handlePassSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!letter.passphrase) {
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

  const handlePrint = async () => {
    if (paperRef.current) {
      try {
        await exportLetterAsPicture(paperRef.current, {
          fileName: `khat-letter-${letter.recipient || 'dear'}.png`,
          pixelRatio: 3
        });
      } catch {
        window.print();
      }
    } else {
      window.print();
    }
  };

  const waxColor = letter.waxSeal?.color || 'oxblood';
  const waxMono = letter.waxSeal?.customText || letter.waxSeal?.symbol || 'K';
  const isHindi = letter.language === 'hi' || /[\u0900-\u097F]/.test(letter.body);
  const salutePre = isHindi ? 'प्रिय' : 'Dear';

  return (
    <div className="reader" role="dialog" aria-modal="true" aria-label="A letter">
      <button
        className="reader-x"
        type="button"
        onClick={onClose}
        aria-label="Close letter"
      >
        ×
      </button>

      <div className="reader-scroll">
        {!isOpened ? (
          <>
            <div className="reader-stage">
              <div
                className={`env rises ${isOpened ? 'open' : ''}`}
                data-face="back"
              >
                <div className="env-stage">
                  <div className="env-flip">
                    {/* Front Face */}
                    <div className="env-face front">
                      <div className="ret">{letter.sender || ''}</div>
                      <div className="addr">
                        <small>To</small>
                        {letter.recipient || 'You'}
                      </div>
                      <div
                        className="pm"
                        dangerouslySetInnerHTML={{
                          __html: renderPostmarkSvg(letter.city, Date.now())
                        }}
                      />
                      <div
                        className="stp"
                        dangerouslySetInnerHTML={{
                          __html: renderPostageStampSvg(letter.stamp || 0)
                        }}
                      />
                      <i className="env-ring" />
                    </div>

                    {/* Back Face */}
                    <div className="env-face back">
                      <div className="env-lining" />
                      <div className="env-letter">
                        <div className="env-letter-in">
                          {salutePre} {letter.recipient || 'you'},
                          <br />
                          {letter.body.slice(0, 140)}...
                        </div>
                      </div>
                      <div className="env-pocket">
                        <div />
                      </div>
                      <div className="env-flap">
                        <div />
                      </div>
                      <button
                        className={`env-seal ${isShaking ? 'shake' : ''}`}
                        type="button"
                        onClick={handleSealClick}
                        aria-label="Break the wax seal"
                      >
                        <div className={`seal-wrap ${isOpened ? 'broken' : ''}`}>
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
                      </button>
                      <i className="env-ring" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="reader-msg" aria-live="polite">
              {isLocked ? (
                <>
                  Sealed until {letter.unlockDate}.
                  <br />
                  It opens in {formatCountdown(unlockMs - now)}
                </>
              ) : letter.passphrase && !isPassVerified ? (
                'This letter has a passphrase. Enter it below to unlock:'
              ) : isPeek ? (
                'This is how it opens for them. Tap the seal.'
              ) : (
                'Tap the seal to open it.'
              )}
            </div>

            {letter.passphrase && !isPassVerified && !isLocked && (
              <form className="reader-pass" onSubmit={handlePassSubmit}>
                <input
                  className="field"
                  type="text"
                  placeholder="Passphrase"
                  value={passphraseInput}
                  onChange={(e) => setPassphraseInput(e.target.value)}
                  autoComplete="off"
                  autoFocus
                />
                <button className="btn cta" type="submit">
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
          /* Unsealed Opened Letter View */
          <>
            <div className="reader-letter">
              <div
                ref={paperRef}
                className={`paper p-${letter.templateId} f-${letter.fontId} sz-${letter.fontSize || 'm'}`}
              >
                <div className="paper-in">
                  <div className="salute">
                    <span>{salutePre}</span>
                    <span className="nm">{letter.recipient || 'you'},</span>
                  </div>

                  <div className="body" style={{ color: letter.inkColor }}>
                    {letter.body}
                  </div>

                  <div className="closing">
                    <div>{letter.signoff || 'With love,'}</div>
                    <div>{letter.sender || ''}</div>
                  </div>

                  {letter.voiceNoteUrl && (
                    <div className="cassette">
                      <span>Voice note</span>
                      <audio controls src={letter.voiceNoteUrl} />
                    </div>
                  )}

                  {letter.ps && (
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
                </div>

                {/* Placed Stickers Layer */}
                <div className="stk-layer">
                  {(letter.stickers || []).map((st) => {
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
                        {def.render(letter.date)}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="reader-actions">
              <button className="btn ghost" type="button" onClick={handlePrint}>
                Save as PDF / Picture
              </button>
              <button
                className="btn cta"
                type="button"
                onClick={() => {
                  onWriteBack(letter.sender, letter.templateId, letter.fontId);
                  onClose();
                }}
              >
                Write back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
