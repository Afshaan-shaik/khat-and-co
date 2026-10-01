import React, { useState, useRef, useEffect } from 'react';
import { LetterData, PlacedSticker } from '../types/letter';
import { sfx } from '../utils/sound';
import { renderWaxSealSvg, WAX_PALETTES, WAX_SEAL_OPTIONS, resolveWaxSeal } from '../constants/waxSeal';
import { renderPostageStampSvg, renderPostmarkSvg, POSTAGE_STAMPS } from '../utils/stamps';
import { STICKER_REGISTRY } from '../constants/stickers';
import { PAPER_TEMPLATES } from '../constants/templates';
import { HANDWRITING_FONTS } from '../constants/fonts';
import { WEEKLY_PROMPTS } from '../constants/prompts';
import { createShortShareUrl } from '../utils/shortLink';
import { encodeLetterToHash } from '../utils/codec';
import { copyTextToClipboard } from '../utils/clipboard';
import { exportLetterAsPdf, exportLetterAsPicture } from '../utils/export';
import { hasAudioAttachment } from './ReaderModal';

interface StudioSectionProps {
  letter: LetterData;
  onChangeLetter: (updated: Partial<LetterData>) => void;
  onOpenReader: (letter: LetterData, opt?: { peek?: boolean }) => void;
  onLetterSealed: () => void;
  showToast: (msg: string) => void;
}

type ToolType = 'text' | 'stickers' | 'paper' | 'seal' | 'more';

export const StudioSection: React.FC<StudioSectionProps> = ({
  letter,
  onChangeLetter,
  onOpenReader,
  onLetterSealed,
  showToast
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [activeTool, setActiveTool] = useState<ToolType>('text');
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [selectedStickerPack, setSelectedStickerPack] = useState<'Botanical' | 'Hearts' | 'Paper' | 'Wax Seals' | 'Vintage' | 'Stamps'>('Botanical');
  const [selectedStickerIndex, setSelectedStickerIndex] = useState<number>(-1);
  const [isPressingSeal, setIsPressingSeal] = useState(false);
  const [isSealingFaceBack, setIsSealingFaceBack] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState('');
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const exportPaperRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  // Auto-grow textarea
  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [letter.body]);

  // Key typing sound effect
  const lastKeyTimeRef = useRef(0);
  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChangeLetter({ body: e.target.value });
    const now = Date.now();
    if (now - lastKeyTimeRef.current > 90) {
      lastKeyTimeRef.current = now;
      sfx.scratch();
    }
  };

  // Sticker interactions on paper canvas
  const handlePaperPointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.stk') && selectedStickerIndex !== -1) {
      setSelectedStickerIndex(-1);
    }
  };

  const handleSelectSticker = (idx: number, e: React.PointerEvent) => {
    e.stopPropagation();
    setSelectedStickerIndex(idx);
    const layer = (e.currentTarget as HTMLElement).closest('.stk-layer') as HTMLElement;
    if (!layer) return;

    const st = letter.stickers[idx];
    if (!st) return;

    const target = e.target as HTMLElement;
    // Check if remove clicked
    if (target.closest('.stk-x')) {
      const updated = letter.stickers.filter((_, i) => i !== idx);
      onChangeLetter({ stickers: updated });
      setSelectedStickerIndex(-1);
      return;
    }

    // Drag or resize handle
    const rect = layer.getBoundingClientRect();
    const isHandle = Boolean(target.closest('.stk-h'));

    if (isHandle) {
      const cx = rect.left + (st.x / 100) * rect.width;
      const cy = rect.top + (st.y / 100) * rect.height;
      const a0 = Math.atan2(e.clientY - cy, e.clientX - cx);
      const d0 = Math.max(8, Math.hypot(e.clientX - cx, e.clientY - cy));
      const r0 = st.rotation;
      const s0 = st.scale;

      const onMove = (ev: PointerEvent) => {
        const a = Math.atan2(ev.clientY - cy, ev.clientX - cx);
        const d = Math.hypot(ev.clientX - cx, ev.clientY - cy);
        const newR = Math.round((r0 + ((a - a0) * 180) / Math.PI) / 5) * 5;
        const newScale = Number(Math.min(2.5, Math.max(0.4, (s0 * d) / d0)).toFixed(2));
        const updated = [...letter.stickers];
        updated[idx] = { ...st, rotation: newR, scale: newScale };
        onChangeLetter({ stickers: updated });
      };

      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    } else {
      const sx = e.clientX;
      const sy = e.clientY;
      const x0 = st.x;
      const y0 = st.y;

      const onMove = (ev: PointerEvent) => {
        const newX = Math.min(96, Math.max(4, Math.round(x0 + ((ev.clientX - sx) / rect.width) * 100)));
        const newY = Math.min(96, Math.max(4, Math.round(y0 + ((ev.clientY - sy) / rect.height) * 100)));
        const updated = [...letter.stickers];
        updated[idx] = { ...st, x: newX, y: newY };
        onChangeLetter({ stickers: updated });
      };

      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    }
  };

  // Add sticker from panel
  const handleAddStickerFromPanel = (stickerId: string) => {
    const newSticker: PlacedSticker = {
      id: `stk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      stickerId,
      x: Math.round(30 + Math.random() * 40),
      y: Math.round(25 + Math.random() * 40),
      scale: 1,
      rotation: Math.round((Math.random() * 24 - 12) / 5) * 5,
      zIndex: (letter.stickers.length || 0) + 1
    };
    onChangeLetter({ stickers: [...letter.stickers, newSticker] });
    setSelectedStickerIndex(letter.stickers.length);
    sfx.snap();
    showToast(`Added sticker to your letter!`);
  };

  // Voice note recording
  const handleToggleRecord = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      return;
    }

    try {
      setRecordingError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size) audioChunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: mr.mimeType || 'audio/webm' });
        const url = URL.createObjectURL(blob);
        onChangeLetter({ voiceNoteUrl: url });
        setIsRecording(false);
        showToast('Voice note attached to your letter!');
      };

      mr.start();
      setIsRecording(true);
      recordingTimerRef.current = window.setTimeout(() => {
        if (mr.state === 'recording') mr.stop();
      }, 30000);
    } catch {
      setRecordingError('Microphone not available. Please check permissions.');
    }
  };

  const handleRemoveVoice = () => {
    if (letter.voiceNoteUrl) {
      URL.revokeObjectURL(letter.voiceNoteUrl);
    }
    onChangeLetter({ voiceNoteUrl: null });
    showToast('Voice note removed.');
  };

  // Step 2 -> Step 3: Press the seal
  const handlePressSeal = async () => {
    setIsPressingSeal(true);
    setIsSealingFaceBack(true);
    sfx.rustle();

    setTimeout(() => {
      sfx.thump();
      setIsPressingSeal(false);

      // Save to shelf in localStorage
      try {
        const existingShelf = JSON.parse(localStorage.getItem('khath:shelf') || '[]');
        const list = Array.isArray(existingShelf) ? existingShelf : [];
        list.push({ ...letter, date: new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) });
        localStorage.setItem('khath:shelf', JSON.stringify(list.slice(-30)));
      } catch {
        // Fallback
      }

      // Generate share link
      createShortShareUrl(letter)
        .then((url) => setShareUrl(url))
        .catch(() => {
          const fallback = `${window.location.origin}${window.location.pathname}#l=${encodeLetterToHash(letter)}`;
          setShareUrl(fallback);
        });

      onLetterSealed();
      setStep(3);
    }, 1250);
  };

  const handleCopyLink = async () => {
    const success = await copyTextToClipboard(shareUrl);
    setIsCopying(true);
    showToast(success ? '✉️ Letter link copied!' : 'Failed to copy');
    setTimeout(() => setIsCopying(false), 2000);
  };

  const handleSavePdf = async () => {
    const targetElement = exportPaperRef.current || paperRef.current;
    if (!targetElement) {
      window.print();
      return;
    }
    setIsExportingPdf(true);
    try {
      const recipientName = (letter.recipient || 'dear')
        .trim()
        .replace(/[^a-zA-Z0-9_-]/g, '_');
      await exportLetterAsPdf(targetElement, {
        fileName: `khat-letter-${recipientName}.pdf`,
        letter,
        pixelRatio: 2
      });
      setIsExportingPdf(false);
      showToast('✉️ Letter saved as PDF!');
    } catch (err) {
      setIsExportingPdf(false);
      console.warn('PDF export failed, falling back to picture:', err);
      try {
        await exportLetterAsPicture(targetElement, {
          fileName: `khat-letter-${letter.recipient || 'dear'}.png`,
          pixelRatio: 2
        });
        showToast('Letter downloaded as picture!');
      } catch {
        window.print();
      }
    }
  };

  const handleWriteAnother = () => {
    onChangeLetter({
      recipient: '',
      body: '',
      signoff: 'With love,',
      sender: '',
      ps: '',
      unlockDate: '',
      passphrase: '',
      stickers: [],
      voiceNoteUrl: null
    });
    setStep(1);
    showToast('A fresh page ready for your words.');
  };

  const isHindi = letter.language === 'hi' || /[\u0900-\u097F]/.test(letter.body);
  const salutePre = isHindi ? 'प्रिय' : 'Dear';
  const waxColor = letter.waxSeal?.color || 'oxblood';
  const waxMono = letter.waxSeal?.customText || letter.waxSeal?.symbol || 'K';
  const currentTemplate = PAPER_TEMPLATES.find((t) => t.id === letter.templateId) || PAPER_TEMPLATES[0];

  // Sticker pack filter
  const getStickersForPack = () => {
    const all = Object.values(STICKER_REGISTRY);
    if (selectedStickerPack === 'Botanical') {
      return all.filter((s) => ['marigold', 'daisy', 'poppy', 'lavender', 'sprig', 'fern', 'pressed-flora'].includes(s.id));
    }
    if (selectedStickerPack === 'Hearts') {
      return all.filter((s) => ['heart', 'doodle', 'sparkle', 'moon', 'loveenv', 'trio', 'wax-seal-heart'].includes(s.id));
    }
    if (selectedStickerPack === 'Paper') {
      return all.filter((s) => ['washi', 'polaroid', 'ticket', 'sticky', 'clip', 'postage'].includes(s.id));
    }
    if (selectedStickerPack === 'Wax Seals') {
      return all.filter((s) => s.category === 'hearts-seals' || s.id.startsWith('wax-seal'));
    }
    if (selectedStickerPack === 'Vintage') {
      return all.filter((s) => s.category === 'little-things-words');
    }
    return all.filter((s) => s.category === 'stamps-postmarks');
  };

  return (
    <section className="section" id="studio">
      <div className="container">
        {/* Studio Heading & Stepper */}
        <div className="studio-head rv in">
          <h2>Write this week’s letter</h2>
          <ol className="stepper" id="stepper" aria-label="Progress">
            <li data-s="1" className={step === 1 ? 'on' : step > 1 ? 'done' : ''}>
              Write
            </li>
            <li data-s="2" className={step === 2 ? 'on' : step > 2 ? 'done' : ''}>
              Seal
            </li>
            <li data-s="3" className={step === 3 ? 'on' : ''}>
              Send
            </li>
          </ol>
        </div>

        {/* ── STEP 1: WRITE ── */}
        {step === 1 && (
          <div className="step" id="step1">
            <div className="row g-5 align-items-start">
              {/* Paper Canvas Column */}
              <div className="col-12 col-lg-7">
                {/* Floating Pill Toolbar */}
                <div className="toolbar" id="toolbar" role="toolbar" aria-label="Letter tools">
                  <button
                    className={`tool ${activeTool === 'text' ? 'on' : ''}`}
                    type="button"
                    onClick={() => {
                      setActiveTool('text');
                      setIsMobilePanelOpen(true);
                    }}
                  >
                    <svg viewBox="0 0 24 24">
                      <path d="M5 19 11 5l6 14M7.5 14h7" />
                    </svg>
                    <span>Text</span>
                  </button>
                  <button
                    className={`tool ${activeTool === 'stickers' ? 'on' : ''}`}
                    type="button"
                    onClick={() => {
                      setActiveTool('stickers');
                      setIsMobilePanelOpen(true);
                    }}
                  >
                    <svg viewBox="0 0 24 24">
                      <path d="M5 5h10l4 4v10H5z" />
                      <path d="M15 5v4h4" />
                    </svg>
                    <span>Stickers</span>
                  </button>
                  <button
                    className={`tool ${activeTool === 'paper' ? 'on' : ''}`}
                    type="button"
                    onClick={() => {
                      setActiveTool('paper');
                      setIsMobilePanelOpen(true);
                    }}
                  >
                    <svg viewBox="0 0 24 24">
                      <rect x="5" y="3" width="14" height="18" rx="1.5" />
                      <path d="M8 8h8M8 12h8M8 16h5" />
                    </svg>
                    <span>Paper</span>
                  </button>
                  <button
                    className={`tool ${activeTool === 'seal' ? 'on' : ''}`}
                    type="button"
                    onClick={() => {
                      setActiveTool('seal');
                      setIsMobilePanelOpen(true);
                    }}
                  >
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="8" />
                      <path d="M12 15.5s-3.5-2-3.5-4.2a2 2 0 0 1 3.5-1.2 2 2 0 0 1 3.5 1.2c0 2.2-3.5 4.2-3.5 4.2z" />
                    </svg>
                    <span>Seal</span>
                  </button>
                  <button
                    className={`tool ${activeTool === 'more' ? 'on' : ''}`}
                    type="button"
                    onClick={() => {
                      setActiveTool('more');
                      setIsMobilePanelOpen(true);
                    }}
                  >
                    <svg viewBox="0 0 24 24">
                      <circle cx="6" cy="12" r="1.2" />
                      <circle cx="12" cy="12" r="1.2" />
                      <circle cx="18" cy="12" r="1.2" />
                    </svg>
                    <span>More</span>
                  </button>
                </div>

                {/* Tactile Letter Paper */}
                <div className="paper-col" onPointerDown={handlePaperPointerDown}>
                  <div
                    ref={paperRef}
                    id="paper"
                    data-testid="letter-sheet"
                    className={`paper p-${letter.templateId} f-${letter.fontId} sz-${letter.fontSize || 'm'} ${letter.ruledLines ? 'p-lined' : ''}`}
                  >
                    <div className="paper-in">
                      <label className="salute" data-testid="letter-to-label">
                        <input
                          className="hand salute-prefix"
                          id="salPre"
                          data-testid="letter-greeting"
                          value={letter.greeting !== undefined ? letter.greeting : salutePre}
                          onChange={(e) => onChangeLetter({ greeting: e.target.value })}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            fontFamily: 'inherit',
                            fontSize: 'inherit',
                            color: 'inherit',
                            width: 'auto',
                            maxWidth: '180px',
                            display: 'inline-block'
                          }}
                        />
                        <input
                          className="hand"
                          id="inTo"
                          data-testid="letter-recipient"
                          maxLength={40}
                          placeholder="their name"
                          autoComplete="off"
                          value={letter.recipient}
                          onChange={(e) => onChangeLetter({ recipient: e.target.value })}
                        />
                      </label>

                      <textarea
                        ref={textareaRef}
                        id="inText"
                        data-testid="letter-body"
                        maxLength={2400}
                        rows={8}
                        placeholder="Start with something small from this week."
                        value={letter.body}
                        onChange={handleBodyChange}
                        style={{ color: letter.inkColor }}
                      />

                      <div className="closing" data-testid="letter-footer">
                        <input
                          className="hand"
                          id="inClose"
                          data-testid="letter-signoff"
                          maxLength={40}
                          aria-label="Closing words"
                          value={letter.signoff}
                          onChange={(e) => onChangeLetter({ signoff: e.target.value })}
                        />
                        <input
                          className="hand"
                          id="inFrom"
                          data-testid="letter-sender"
                          maxLength={40}
                          placeholder="your name"
                          autoComplete="off"
                          value={letter.sender}
                          onChange={(e) => onChangeLetter({ sender: e.target.value })}
                        />
                      </div>

                      {letter.ps && (
                        <div className="ps-preview" id="psPrev">
                          P.S. {letter.ps}
                        </div>
                      )}
                    </div>

                    {/* Interactive Sticker Layer */}
                    <div className="stk-layer" id="stkLayer">
                      {(letter.stickers || []).map((st, idx) => {
                        const def = STICKER_REGISTRY[st.stickerId];
                        if (!def) return null;
                        const isSelected = idx === selectedStickerIndex;

                        return (
                          <div
                            key={st.id}
                            className={`stk edit stk-placed ${isSelected ? 'sel selected' : ''}`}
                            data-i={idx}
                            style={{
                              left: `${st.x}%`,
                              top: `${st.y}%`,
                              width: `${st.scale ? st.scale * 20 : 20}%`,
                              transform: `translate(-50%, -50%) rotate(${st.rotation}deg)`
                            }}
                            onPointerDown={(e) => handleSelectSticker(idx, e)}
                          >
                            {def.render(letter.date)}
                            {isSelected && (
                              <>
                                <button className="stk-x" type="button" aria-label="Remove sticker">
                                  ×
                                </button>
                                <span className="stk-h" aria-label="Resize and turn" />
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <p className="save-line" id="saveState">
                    Your draft saves on this device as you write.
                  </p>
                </div>
              </div>

              {/* Right Customization Panel */}
              <div className="col-12 col-lg-5">
                {isMobilePanelOpen && (
                  <div
                    className="panel-backdrop"
                    onClick={() => setIsMobilePanelOpen(false)}
                    aria-hidden="true"
                  />
                )}
                <aside className={`panel ${isMobilePanelOpen ? 'open' : ''}`} id="panel" aria-label="Tool options">
                  {/* TEXT PANEL */}
                  {activeTool === 'text' && (
                    <>
                      <div className="panel-head">
                        <h3>Text</h3>
                        <button
                          type="button"
                          className="panel-x"
                          onClick={() => setIsMobilePanelOpen(false)}
                          aria-label="Close options"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="lbl">Language</div>
                      <div className="seg">
                        <button
                          type="button"
                          className={letter.language !== 'hi' ? 'on' : ''}
                          onClick={() => onChangeLetter({ language: 'en', signoff: 'With love,' })}
                        >
                          English
                        </button>
                        <button
                          type="button"
                          className={letter.language === 'hi' ? 'on' : ''}
                          onClick={() => onChangeLetter({ language: 'hi', signoff: 'प्यार सहित' })}
                        >
                          हिन्दी
                        </button>
                      </div>

                      <div className="lbl">Handwriting</div>
                      <div className="stack">
                        {HANDWRITING_FONTS.slice(0, 5).map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            className={`fontcard ${letter.fontId === f.id ? 'on' : ''}`}
                            onClick={() => onChangeLetter({ fontId: f.id })}
                          >
                            <span className="fs" style={{ fontFamily: f.family }}>
                              {letter.language === 'hi' ? 'प्यारे खत' : 'Dear you'}
                            </span>
                            <span className="fn">{f.name}</span>
                          </button>
                        ))}
                      </div>

                      <div className="lbl">Size</div>
                      <div className="seg">
                        {(['s', 'm', 'l'] as const).map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            className={(letter.fontSize || 'm') === sz ? 'on' : ''}
                            onClick={() => onChangeLetter({ fontSize: sz })}
                          >
                            {sz === 's' ? 'Small' : sz === 'm' ? 'Medium' : 'Large'}
                          </button>
                        ))}
                      </div>

                      <div className="lbl">Ink Color</div>
                      <div className="waxrow">
                        {['#1F2340', '#7F1D2B', '#26422F', '#3B291D', '#5567A6', '#F6EFE3'].map((ink) => (
                          <button
                            key={ink}
                            type="button"
                            className="wax"
                            style={{
                              background: ink,
                              outlineColor: letter.inkColor === ink ? 'var(--text)' : 'transparent'
                            }}
                            onClick={() => onChangeLetter({ inkColor: ink })}
                            aria-label={`Ink color ${ink}`}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {/* STICKERS PANEL */}
                  {activeTool === 'stickers' && (
                    <>
                      <div className="panel-head">
                        <h3>Stickers</h3>
                        <button
                          type="button"
                          className="panel-x"
                          onClick={() => setIsMobilePanelOpen(false)}
                          aria-label="Close options"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="seg">
                        {(['Botanical', 'Hearts', 'Paper', 'Wax Seals', 'Vintage', 'Stamps'] as const).map((pack) => (
                          <button
                            key={pack}
                            type="button"
                            className={selectedStickerPack === pack ? 'on' : ''}
                            onClick={() => setSelectedStickerPack(pack)}
                          >
                            {pack}
                          </button>
                        ))}
                      </div>

                      <div className="stk-grid">
                        {getStickersForPack().map((stk) => (
                          <button
                            key={stk.id}
                            type="button"
                            className="stk-pick"
                            onClick={() => handleAddStickerFromPanel(stk.id)}
                            aria-label={`Add ${stk.name}`}
                          >
                            {stk.render()}
                          </button>
                        ))}
                      </div>
                      <p className="hint" style={{ marginTop: '14px' }}>
                        Drag a sticker to move it. Pull the round handle to resize and turn it.
                      </p>
                    </>
                  )}

                  {/* PAPER PANEL */}
                  {activeTool === 'paper' && (
                    <>
                      <div className="panel-head">
                        <h3>Paper</h3>
                        <button
                          type="button"
                          className="panel-x"
                          onClick={() => setIsMobilePanelOpen(false)}
                          aria-label="Close options"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="strip">
                        {PAPER_TEMPLATES.map((tmpl) => (
                          <button
                            key={tmpl.id}
                            type="button"
                            className={`thumb ${letter.templateId === tmpl.id ? 'on' : ''}`}
                            onClick={() => {
                              onChangeLetter({ templateId: tmpl.id, inkColor: tmpl.defaultInk });
                              sfx.rustle();
                            }}
                          >
                            <div className={`paper mini p-${tmpl.id}`} />
                            <span>{tmpl.name}</span>
                          </button>
                        ))}
                      </div>

                      <div className="lbl">Ruled Lines</div>
                      <div className="seg">
                        <button
                          type="button"
                          className={letter.ruledLines ? 'on' : ''}
                          onClick={() => onChangeLetter({ ruledLines: true })}
                        >
                          Lined
                        </button>
                        <button
                          type="button"
                          className={!letter.ruledLines ? 'on' : ''}
                          onClick={() => onChangeLetter({ ruledLines: false })}
                        >
                          Blank
                        </button>
                      </div>
                    </>
                  )}

                  {/* SEAL PANEL */}
                  {activeTool === 'seal' && (
                    <>
                      <div className="panel-head">
                        <h3>Wax seal</h3>
                        <button
                          type="button"
                          className="panel-x"
                          onClick={() => setIsMobilePanelOpen(false)}
                          aria-label="Close options"
                        >
                          ✕
                        </button>
                      </div>
                      <div
                        className="seal-prev"
                        id="sealPrev"
                        data-testid="studio-preview-wax-seal"
                        dangerouslySetInnerHTML={{
                          __html: renderWaxSealSvg(waxColor, waxMono, 104)
                        }}
                      />

                      <div className="lbl">Wax Color</div>
                      <div className="waxrow">
                        {Object.keys(WAX_PALETTES).map((k) => (
                          <button
                            key={k}
                            type="button"
                            className={`wax ${waxColor === k ? 'on' : ''}`}
                            style={{
                              '--c': WAX_PALETTES[k][0],
                              '--h': WAX_PALETTES[k][2]
                            } as React.CSSProperties}
                            onClick={() =>
                              onChangeLetter({
                                waxSeal: { ...resolveWaxSeal(letter.waxSeal), color: k }
                              })
                            }
                            aria-label={`${k} wax`}
                          />
                        ))}
                      </div>

                      <div className="lbl">Monogram or Initial</div>
                      <input
                        className="field"
                        id="inMono"
                        data-testid="wax-seal-custom-input"
                        maxLength={2}
                        placeholder="Up to two letters"
                        value={letter.waxSeal?.customText || ''}
                        onChange={(e) =>
                          onChangeLetter({
                            waxSeal: {
                              ...resolveWaxSeal(letter.waxSeal),
                              customText: e.target.value.slice(0, 2),
                              isCustom: true
                            }
                          })
                        }
                        autoComplete="off"
                      />

                      <div className="lbl">Emblem Symbol</div>
                      <div className="seg" style={{ marginTop: '8px' }}>
                        {WAX_SEAL_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            data-testid={`seal-option-${opt.id}`}
                            className={letter.waxSeal?.id === opt.id ? 'on' : ''}
                            onClick={() =>
                              onChangeLetter({
                                waxSeal: {
                                  ...resolveWaxSeal(letter.waxSeal),
                                  id: opt.id,
                                  symbol: opt.symbol,
                                  isCustom: opt.id === 'custom'
                                }
                              })
                            }
                          >
                            {opt.symbol}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {/* MORE PANEL */}
                  {activeTool === 'more' && (
                    <>
                      <div className="panel-head">
                        <h3>More</h3>
                        <button
                          type="button"
                          className="panel-x"
                          onClick={() => setIsMobilePanelOpen(false)}
                          aria-label="Close options"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="lbl">P.S.</div>
                      <textarea
                        className="field"
                        id="inPS"
                        rows={3}
                        maxLength={280}
                        placeholder="A last thought. They tear it open at the end."
                        value={letter.ps || ''}
                        onChange={(e) => onChangeLetter({ ps: e.target.value })}
                      />

                      <div className="lbl">Voice note</div>
                      <div className="voice">
                        <button
                          type="button"
                          className="btn ghost sm"
                          onClick={handleToggleRecord}
                        >
                          {isRecording ? (
                            <>
                              <span className="rec-dot" /> Stop
                            </>
                          ) : (
                            'Record'
                          )}
                        </button>
                        {letter.voiceNoteUrl && (
                          <>
                            <audio controls src={letter.voiceNoteUrl} />
                            <button
                              type="button"
                              className="linkbtn"
                              onClick={handleRemoveVoice}
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                      <p className="hint" style={{ marginTop: '8px' }}>
                        {recordingError ||
                          'Up to 30 seconds. Voice notes play directly on this letter.'}
                      </p>

                      <div className="lbl">✦ Inspiration</div>
                      <div style={{ background: 'var(--chip)', padding: '12px', borderRadius: '12px', marginTop: '6px' }}>
                        <p style={{ fontStyle: 'italic', fontSize: '0.9rem' }}>
                          "{isHindi ? WEEKLY_PROMPTS[currentPromptIndex].hindi : WEEKLY_PROMPTS[currentPromptIndex].english}"
                        </p>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                          <button
                            type="button"
                            className="btn ghost sm"
                            onClick={() =>
                              setCurrentPromptIndex((prev) => (prev + 1) % WEEKLY_PROMPTS.length)
                            }
                          >
                            Another
                          </button>
                          <button
                            type="button"
                            className="btn cta sm"
                            onClick={() => {
                              const text = isHindi
                                ? WEEKLY_PROMPTS[currentPromptIndex].hindi
                                : WEEKLY_PROMPTS[currentPromptIndex].english;
                              const updated = letter.body ? `${letter.body}\n\n${text}` : text;
                              onChangeLetter({ body: updated });
                              showToast('Inspiration added to letter!');
                            }}
                          >
                            Add to letter
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </aside>
              </div>
            </div>

            {/* Step 1 Actions */}
            <div className="step-actions">
              <button
                className="btn cta lg"
                id="toSeal"
                type="button"
                onClick={() => {
                  if (!letter.body.trim()) {
                    showToast('Write a few lines first, then continue.');
                    textareaRef.current?.focus();
                    return;
                  }
                  setStep(2);
                }}
              >
                Continue to the envelope
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: SEAL ── */}
        {step === 2 && (
          <div className="step" id="step2">
            <div className="row g-5 align-items-center">
              {/* Envelope Stage */}
              <div className="col-12 col-lg-7">
                <div className="seal-stage" id="sealHost">
                  <div
                    className={`env still ${isPressingSeal ? 'presealing' : ''}`}
                    data-face={isSealingFaceBack ? 'back' : 'front'}
                  >
                    <div className="env-stage">
                      <div className="env-flip">
                        {/* Front */}
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

                        {/* Back */}
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
                          <button className="env-seal" type="button" aria-label="Wax seal">
                            <div className="seal-wrap">
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
              </div>

              {/* Envelope Customization Options */}
              <div className="col-12 col-lg-5">
                <div className="opt">
                  <h3>Stamp</h3>
                  <div className="stamp-row" id="stampRow">
                    {POSTAGE_STAMPS.map((s, idx) => (
                      <button
                        key={s.id}
                        type="button"
                        className={`stamp-pick ${(letter.stamp || 0) === idx ? 'on' : ''}`}
                        onClick={() => {
                          onChangeLetter({ stamp: idx });
                          sfx.snap();
                        }}
                        aria-label={`${s.name} stamp`}
                        dangerouslySetInnerHTML={{
                          __html: renderPostageStampSvg(idx)
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="opt">
                  <h3>Postmark</h3>
                  <input
                    className="field"
                    id="inCity"
                    maxLength={10}
                    placeholder="Your city, up to 10 letters"
                    value={letter.city || ''}
                    onChange={(e) => onChangeLetter({ city: e.target.value })}
                    autoComplete="off"
                  />
                  <p className="hint">Today’s date is stamped for you.</p>
                </div>

                <div className="opt">
                  <h3>Open on</h3>
                  <input
                    className="field"
                    id="inUnlock"
                    type="date"
                    value={letter.unlockDate || ''}
                    onChange={(e) => onChangeLetter({ unlockDate: e.target.value })}
                  />
                  <p className="hint">
                    Leave it empty to open right away. Until that day the envelope stays sealed, for you too.
                  </p>
                </div>

                <div className="opt">
                  <h3>Passphrase</h3>
                  <input
                    className="field"
                    id="inPass"
                    maxLength={40}
                    placeholder="Optional"
                    value={letter.passphrase || ''}
                    onChange={(e) => onChangeLetter({ passphrase: e.target.value })}
                    autoComplete="off"
                  />
                  <p className="hint">
                    A light lock for casual eyes, not encryption. Tell them the word yourself.
                  </p>
                </div>
              </div>
            </div>

            <div className="step-actions">
              <button
                className="btn ghost"
                id="backWrite"
                type="button"
                onClick={() => setStep(1)}
              >
                Back to the letter
              </button>
              <button
                className="btn cta lg"
                id="pressSeal"
                type="button"
                disabled={isPressingSeal}
                onClick={handlePressSeal}
              >
                {isPressingSeal ? 'Pressing...' : 'Press the seal'}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: SEND ── */}
        {step === 3 && (
          <div className="step" id="step3">
            <div className="row g-5 align-items-center">
              {/* Left OG Card */}
              <div className="col-12 col-lg-6">
                <div className="og" id="ogCard">
                  <div className="og-img" id="ogHost">
                    <div className="env still" data-face="back">
                      <div className="env-stage">
                        <div className="env-flip">
                          <div className="env-face back">
                            <div className="env-lining" />
                            <div className="env-pocket">
                              <div />
                            </div>
                            <div className="env-flap">
                              <div />
                            </div>
                            <div className="env-seal">
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: renderWaxSealSvg(waxColor, waxMono)
                                }}
                              />
                            </div>
                            <i className="env-ring" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="og-meta">
                    <b id="ogTitle">
                      {letter.sender ? `A letter from ${letter.sender}` : 'A letter for you'}
                    </b>
                    <span id="ogHostName">
                      {letter.unlockDate
                        ? `Sealed until ${letter.unlockDate}. khath-and-co.vercel.app`
                        : 'khath-and-co.vercel.app'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Send Actions */}
              <div className="col-12 col-lg-6">
                <div id="sendBody">
                  <h3 className="send-title">Your letter is sealed</h3>
                  <p className="hint" id="sendSub">
                    {[
                      letter.passphrase ? 'It has a passphrase.' : '',
                      letter.unlockDate ? `It stays sealed until ${letter.unlockDate}.` : ''
                    ]
                      .filter(Boolean)
                      .join(' ') || 'Send the link, and it opens like an envelope.'}
                  </p>

                  <div className="linkrow">
                    <input
                      className="field"
                      id="linkOut"
                      readOnly
                      aria-label="Letter link"
                      value={shareUrl}
                    />
                    <button
                      className="btn cta"
                      id="copyBtn"
                      type="button"
                      onClick={handleCopyLink}
                    >
                      {isCopying ? 'Copied' : 'Copy link'}
                    </button>
                  </div>

                  <div className="share-actions">
                    <a
                      className="btn ghost sm"
                      id="waBtn"
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `I wrote you a letter. Break the seal when you’re ready: ${shareUrl}`
                      )}`}
                    >
                      Send on WhatsApp
                    </a>
                    <button
                      className="btn ghost sm"
                      id="pdfBtn"
                      type="button"
                      onClick={handleSavePdf}
                      disabled={isExportingPdf}
                    >
                      {isExportingPdf ? 'Generating PDF...' : 'Save as PDF'}
                    </button>
                    <button
                      className="btn ghost sm"
                      id="peekBtn"
                      type="button"
                      onClick={() => onOpenReader(letter, { peek: true })}
                    >
                      Open it as they will
                    </button>
                  </div>

                  <p className="hint">
                    Your letter travels inside the link. Nothing is stored on a server, so keep the link safe.
                  </p>

                  <div style={{ marginTop: '28px' }}>
                    <button
                      className="btn ghost"
                      id="newBtn"
                      type="button"
                      onClick={handleWriteAnother}
                    >
                      Write another
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Offscreen high-fidelity letter paper for PDF export */}
      <div
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '560px',
          pointerEvents: 'none',
          zIndex: -100
        }}
        aria-hidden="true"
      >
        <div
          ref={exportPaperRef}
          className={`paper p-${currentTemplate.id} f-${letter.fontId} sz-${letter.fontSize || 'm'} ${letter.ruledLines ? 'p-lined' : ''}`}
          style={{
            backgroundColor: currentTemplate.paperBg,
            color: letter.inkColor || currentTemplate.defaultInk,
            ['--pbg' as string]: currentTemplate.paperBg,
            ['--ink' as string]: letter.inkColor || currentTemplate.defaultInk,
            ['--ruled-line-color' as string]: letter.ruledLines ? currentTemplate.ruledColor : 'transparent',
            ['--margin-line-color' as string]: currentTemplate.isDarkPaper ? 'transparent' : 'rgba(210, 56, 47, 0.35)',
            ...(currentTemplate.borderType !== 'airmail' ? { border: currentTemplate.paperBorder } : {})
          }}
        >
          <div className="paper-in">
            <div className="salute letter-to-label">
              <span>{letter.language === 'hi' || /[\u0900-\u097F]/.test(letter.body) ? 'प्रिय' : 'Dear'}</span>
              <span className="nm">{letter.recipient || 'friend'},</span>
            </div>

            <div className="body" style={{ color: letter.inkColor, whiteSpace: 'pre-wrap' }}>
              {letter.body}
            </div>

            <div className="closing" data-testid="letter-footer">
              <div>{letter.signoff || 'With love,'}</div>
              <div>{letter.sender || ''}</div>
            </div>

            {hasAudioAttachment(letter.voiceNoteUrl) && (
              <div className="cassette" data-testid="letter-voice-note">
                <div className="cassette-label">
                  <span>🎙️ Voice note</span>
                </div>
                <audio controls src={letter.voiceNoteUrl!} />
              </div>
            )}

            {letter.ps && (
              <div className="ps torn">
                <div className="ps-note">P.S. {letter.ps}</div>
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
    </section>
  );
};
