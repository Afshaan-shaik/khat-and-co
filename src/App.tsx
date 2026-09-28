import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LetterData, PaperTemplate, FontOption, PlacedSticker } from './types/letter';
import {
  loadSavedDraft,
  saveDraft,
  loadThemePreference,
  saveThemePreference,
  createDefaultLetter,
  getFormattedToday
} from './utils/storage';
import { encodeLetterToHash } from './utils/codec';
import { createShortShareUrl, resolveSharedLetter } from './utils/shortLink';
import { exportLetterAsPicture } from './utils/export';
import { PAPER_TEMPLATES } from './constants/templates';
import { StickerDefinition } from './constants/stickers';

// Components
import { Header } from './components/Header';
import { TemplatePicker } from './components/TemplatePicker';
import { FontPicker } from './components/FontPicker';
import { LetterEditor } from './components/LetterEditor';
import { StickerDrawer } from './components/StickerDrawer';
import { EnvelopeModal } from './components/EnvelopeModal';
import { PromptModal } from './components/PromptModal';

export const App: React.FC = () => {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(loadThemePreference);

  // Active Draft Letter state
  const [letter, setLetter] = useState<LetterData>(loadSavedDraft);

  // Recipient Received Letter state (from URL hash)
  const [recipientLetter, setRecipientLetter] = useState<LetterData | null>(null);

  // Mobile active tab ('write' | 'paper' | 'stickers')
  const [mobileTab, setMobileTab] = useState<'write' | 'paper' | 'stickers'>('write');

  // Modals & Drawers state
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [isRecipientFlow, setIsRecipientFlow] = useState(false);
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  // Ref to main letter paper sheet for picture export
  const letterSheetRef = useRef<HTMLDivElement>(null);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveThemePreference(theme);
  }, [theme]);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  }, []);

  // Autosave draft to localStorage (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      saveDraft(letter);
    }, 350);
    return () => clearTimeout(timer);
  }, [letter]);

  // Check URL Hash & Search Query for shared letter on load & on change
  useEffect(() => {
    let cancelled = false;

    const checkShared = async () => {
      const hash = window.location.hash;
      const search = window.location.search;
      if (!hash && !search) return;

      const decoded = await resolveSharedLetter(hash, search);
      if (decoded && !cancelled) {
        setRecipientLetter(decoded);
        setIsRecipientFlow(true);
        setIsEnvelopeOpen(true);
      }
    };

    checkShared();
    window.addEventListener('hashchange', checkShared);
    return () => {
      cancelled = true;
      window.removeEventListener('hashchange', checkShared);
    };
  }, []);

  // Handlers for Letter Updates
  const handleUpdateLetter = (updatedFields: Partial<LetterData>) => {
    setLetter((prev) => ({
      ...prev,
      ...updatedFields
    }));
  };

  // Template change
  const handleSelectTemplate = (tmpl: PaperTemplate) => {
    setLetter((prev) => ({
      ...prev,
      templateId: tmpl.id,
      inkColor: tmpl.defaultInk
    }));
  };

  // Font change
  const handleSelectFont = (font: FontOption) => {
    handleUpdateLetter({ fontId: font.id });
  };

  // Ink change
  const handleSelectInk = (inkHex: string) => {
    handleUpdateLetter({ inkColor: inkHex });
  };

  // Toggle ruled lines
  const handleToggleRuledLines = () => {
    handleUpdateLetter({ ruledLines: !letter.ruledLines });
  };

  // Add Sticker — perfectly straight (0° rotation) and centered horizontally on the letter
  const handleAddSticker = (stickerDef: StickerDefinition) => {
    const letterEl = letterSheetRef.current;
    const letterRect = letterEl?.getBoundingClientRect();
    const letterWidth = letterRect?.width || 640;
    const stickerWidth = stickerDef.width || 80;

    // Convert sticker pixel width to percentage of sheet width
    const stickerWidthPercent = (stickerWidth / letterWidth) * 100;

    // Center horizontally: exactly half of sheet width minus half of sticker width
    // Ensures equal spacing on both left and right (not a little left nor a little right)
    const centeredX = Math.round((50 - stickerWidthPercent / 2) * 10) / 10;

    // Proper vertical focal placement on the letter
    const count = letter.stickers.length;
    // Keep it in the clean reading area, gently staggering if user adds multiple consecutive stickers
    const placedY = Math.round(Math.min(36 + ((count % 5) * 6), 62) * 10) / 10;

    const newPlaced: PlacedSticker = {
      id: `stk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      stickerId: stickerDef.id,
      x: centeredX,
      y: placedY,
      scale: 1,
      rotation: 0, // Strictly straight (0° rotation, no tilt)
      zIndex: Math.max(...letter.stickers.map((s) => s.zIndex), 0) + 1
    };

    handleUpdateLetter({ stickers: [...letter.stickers, newPlaced] });

    // On mobile, switch back to 'write' tab so user immediately sees their placed sticker on the letter
    if (typeof window !== 'undefined' && window.innerWidth <= 767) {
      setMobileTab('write');
    }

    showToast(`Added "${stickerDef.name}" straight to your letter!`);
  };

  // Share Letter Link (Ultra-short, WhatsApp & Messenger friendly)
  const handleShareLink = async () => {
    showToast('✉️ Creating short link...');

    try {
      const shareUrl = await createShortShareUrl(letter);

      // On mobile devices, offer native Web Share if supported
      const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobile && navigator.share) {
        try {
          await navigator.share({
            title: 'Khath & Co. — Letters for the people you miss',
            text: 'I wrote a letter for you on Khath & Co. Open it with the wax seal:',
            url: shareUrl
          });
          showToast('✉️ Letter shared successfully!');
          return;
        } catch (err: any) {
          if (err.name === 'AbortError') return;
        }
      }

      // Copy clean short URL to clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        showToast('✉️ Short link copied! Ready to paste and send.');
      } else {
        prompt('Copy this short letter link to share:', shareUrl);
      }
    } catch {
      const fallbackUrl = `${window.location.origin}${window.location.pathname}#l=${encodeLetterToHash(letter)}`;
      prompt('Copy this letter link to share:', fallbackUrl);
    }
  };

  // Save as Picture (PNG)
  const handleSavePicture = async () => {
    if (!letterSheetRef.current) return;
    try {
      setIsExporting(true);
      showToast('Preparing your high-resolution stationery picture...');
      await exportLetterAsPicture(letterSheetRef.current, {
        fileName: 'khat-and-co-letter.png',
        pixelRatio: 3
      });
      showToast('Letter downloaded as "khat-and-co-letter.png"!');
    } catch (err) {
      console.error(err);
      showToast('Failed to save picture. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Start fresh letter
  const handleResetLetter = () => {
    const hasCustomText = letter.body.trim().length > 0 && letter.body !== createDefaultLetter().body;
    if (hasCustomText && !window.confirm('Start a fresh letter? This will clear your current message text.')) {
      return;
    }
    const fresh = createDefaultLetter();
    setLetter(fresh);
    saveDraft(fresh);
    showToast('A fresh page ready for your thoughts.');
  };

  // Preview envelope as recipient
  const handlePreviewEnvelope = () => {
    setRecipientLetter(letter);
    setIsRecipientFlow(false);
    setIsEnvelopeOpen(true);
  };

  // Write Back action from recipient view
  const handleWriteBack = (senderName: string, templateId: string, fontId: string) => {
    const confirmMsg =
      letter.body.trim().length > 0 && letter.body !== loadSavedDraft().body
        ? `Start a new reply letter to ${senderName || 'your friend'}? This will replace your current workspace letter.`
        : null;

    if (confirmMsg && !window.confirm(confirmMsg)) {
      return;
    }

    const replyLetter: LetterData = {
      recipient: senderName ? `For ${senderName}` : 'For You',
      date: getFormattedToday(),
      greeting: senderName ? `Dear ${senderName},` : 'My Dearest,',
      body: `I received your beautiful letter and it made me smile from miles away...\n\n`,
      signoff: 'With all my love,',
      sender: '',
      templateId: templateId || 'airmail-classic',
      fontId: fontId || 'caveat',
      inkColor: PAPER_TEMPLATES.find((t) => t.id === templateId)?.defaultInk || '#1F2340',
      ruledLines: true,
      stickers: [
        {
          id: 'reply_seal',
          stickerId: 'wax-seal-heart',
          x: 14,
          y: 84,
          scale: 1,
          rotation: 0,
          zIndex: 2
        }
      ]
    };

    setLetter(replyLetter);
    saveDraft(replyLetter);

    window.history.replaceState(null, '', window.location.pathname);
    setIsEnvelopeOpen(false);
    setRecipientLetter(null);
    showToast(`Started reply to ${senderName || 'your friend'}!`);
  };

  const handleCloseEnvelope = () => {
    setIsEnvelopeOpen(false);
    if (isRecipientFlow) {
      window.history.replaceState(null, '', window.location.pathname);
      setRecipientLetter(null);
    }
  };

  const currentTemplate =
    PAPER_TEMPLATES.find((t) => t.id === letter.templateId) || PAPER_TEMPLATES[0];

  return (
    <div className="app-shell">
      {/* Sticky Header with non-truncated brand identity and responsive action bar */}
      <Header
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onOpenPrompt={() => setIsPromptOpen(true)}
        onPreviewEnvelope={handlePreviewEnvelope}
        onShareLink={handleShareLink}
        onSavePicture={handleSavePicture}
        isExporting={isExporting}
      />

      {/* Mobile Tab Bar (< 960px) */}
      <nav className="mobile-tab-bar d-flex d-md-none" aria-label="Mobile navigation tabs">
        <button
          type="button"
          className={`mobile-tab-btn ${mobileTab === 'paper' ? 'active' : ''}`}
          onClick={() => setMobileTab('paper')}
        >
          Paper &amp; Ink
        </button>
        <button
          type="button"
          className={`mobile-tab-btn ${mobileTab === 'write' ? 'active' : ''}`}
          onClick={() => setMobileTab('write')}
        >
          Write Letter
        </button>
        <button
          type="button"
          className={`mobile-tab-btn ${mobileTab === 'stickers' ? 'active' : ''}`}
          onClick={() => setMobileTab('stickers')}
        >
          Stickers ({letter.stickers.length})
        </button>
      </nav>

      {/* Two-column workspace: left panel and right stage ending on the exact same baseline */}
      <div className="workspace-layout">

        {/* ── LEFT SIDEBAR PANEL ── */}
        <aside
          className={`sidebar-panel ${mobileTab !== 'write' ? 'mobile-visible' : ''}`}
          data-testid="left-panel"
          aria-label="Letter customization panel"
        >

          {/* Paper Stationery Picker */}
          <section
            className={`sidebar-section ${mobileTab === 'stickers' ? 'd-none d-md-block' : ''}`}
            aria-labelledby="paper-section-label"
          >
            <div className="section-label" id="paper-section-label">
              <span>Paper</span>
            </div>
            <TemplatePicker
              selectedTemplateId={letter.templateId}
              onSelectTemplate={handleSelectTemplate}
            />
          </section>

          {/* Handwriting Font & Ink Picker */}
          <section
            className={`sidebar-section ${mobileTab === 'stickers' ? 'd-none d-md-block' : ''}`}
            aria-labelledby="font-section-label"
          >
            <FontPicker
              selectedFontId={letter.fontId}
              onSelectFont={handleSelectFont}
              selectedInk={letter.inkColor}
              onSelectInk={handleSelectInk}
              isDarkPaper={currentTemplate.isDarkPaper}
              ruledLines={letter.ruledLines}
              onToggleRuledLines={handleToggleRuledLines}
            />
          </section>

          {/* Sticker & Stamp Collection (Docked at the bottom) */}
          <section
            className={`sidebar-section sticker-docked-section ${mobileTab === 'paper' ? 'd-none d-md-block' : ''}`}
            aria-labelledby="sticker-section-label"
          >
            <div className="section-label" id="sticker-section-label">
              <span>Stickers &amp; Stamps</span>
            </div>
            <StickerDrawer
              onAddSticker={handleAddSticker}
              stickerCount={letter.stickers.length}
              inlineSidebar
            />
          </section>

        </aside>

        {/* ── RIGHT STAGE DESK (Letter sheet + Actions at the ending of the letter) ── */}
        <main
          className={`editor-column ${mobileTab === 'write' ? 'mobile-visible' : ''}`}
          data-testid="stage"
          aria-label="Letter writing area"
        >
          <LetterEditor
            letter={letter}
            onChangeLetter={handleUpdateLetter}
            letterSheetRef={letterSheetRef}
          />

          {/* Desk Actions — Ending of the letter matching uploaded web page reference */}
          <div className="desk-actions" role="toolbar" aria-label="Letter actions">
            <button
              type="button"
              className="btn-khat-primary"
              onClick={handleSavePicture}
              disabled={isExporting}
              title="Save the finished letter as a picture"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>{isExporting ? 'Saving...' : 'Save as picture'}</span>
            </button>

            <button
              type="button"
              className="btn-khat-secondary"
              onClick={handlePreviewEnvelope}
              title="See it as your reader will (Envelope View)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z" />
                <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10" />
              </svg>
              <span>See it as your reader will</span>
            </button>

            <button
              type="button"
              className="btn-khat-secondary"
              onClick={handleShareLink}
              title="Create an envelope link to send to your loved one"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <span>Copy share link</span>
            </button>

            <button
              type="button"
              className="btn-khat-secondary"
              onClick={handleResetLetter}
              title="Start a fresh letter"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M8 16H3v5" />
              </svg>
              <span>Start a new letter</span>
            </button>
          </div>

          {/* Footer branding */}
          <footer className="app-footer">
            <p className="app-footer-name">
              Khath <span style={{ color: 'var(--rose)', fontStyle: 'italic' }}>&amp;</span> Co.
            </p>
            <p className="app-footer-tagline">
              खत · letters for the people you miss · Free, no-login digital stationery
            </p>
          </footer>
        </main>
      </div>

      {/* Bilingual Weekly Writing Prompts Modal */}
      <PromptModal
        isOpen={isPromptOpen}
        onClose={() => setIsPromptOpen(false)}
      />

      {/* Animated Envelope Reading Modal */}
      <EnvelopeModal
        isOpen={isEnvelopeOpen}
        letter={recipientLetter || letter}
        onClose={handleCloseEnvelope}
        onWriteBack={handleWriteBack}
        isRecipientFlow={isRecipientFlow}
      />

      {/* Floating Toast Notifications */}
      {toastMessage && (
        <div className="khat-toast" role="status" aria-live="polite">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FAD889" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
