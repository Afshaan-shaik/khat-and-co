import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LetterData, PaperTemplate, FontOption, PlacedSticker, WaxSealData } from './types/letter';
import {
  loadSavedDraft,
  saveDraft,
  loadThemePreference,
  saveThemePreference,
  createDefaultLetter,
  getFormattedToday
} from './utils/storage';
import { encodeLetterToHash, decodeLetterFromHash } from './utils/codec';
import { createShortShareUrl, resolveSharedLetter } from './utils/shortLink';
import { copyTextToClipboard } from './utils/clipboard';
import { exportLetterAsPicture } from './utils/export';
import { PAPER_TEMPLATES } from './constants/templates';
import { DEFAULT_WAX_SEAL } from './constants/waxSeal';
import { StickerDefinition } from './constants/stickers';

// Main Page Components (Claude HTML Architecture)
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { StudioSection } from './components/StudioSection';
import { ShelfSection } from './components/ShelfSection';
import { NudgeSection } from './components/NudgeSection';
import { SoundCursor } from './components/SoundCursor';
import { ReaderModal } from './components/ReaderModal';

// Modal Overlays & Existing Feature Modules
import { Studio } from './components/Studio';
import { YourDesk } from './components/YourDesk';
import { PromptModal } from './components/PromptModal';
import { TimeCapsuleManager } from './components/TimeCapsuleManager';
import { SealedUntilFuture } from './components/SealedUntilFuture';

// Expose encoder on window for automated test evaluation
if (typeof window !== 'undefined') {
  (window as any).encodeLetterToHash = encodeLetterToHash;
}

/**
 * Checks synchronously whether the current URL is a shared letter link.
 */
function hasIncomingShare(): boolean {
  if (typeof window === 'undefined') return false;
  const search = window.location.search || '';
  const hash = window.location.hash || '';
  return Boolean(
    search.includes('id=') ||
    hash.startsWith('#id=') ||
    hash.startsWith('#l=') ||
    (hash.length > 5 && !hash.startsWith('#id='))
  );
}

/**
 * Synchronously decodes letter payload from hash if available on initial render.
 */
function getInitialRecipientLetter(): LetterData | null {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash || '';
  if (hash.startsWith('#l=') || (hash.length > 5 && !hash.startsWith('#id='))) {
    try {
      return decodeLetterFromHash(hash);
    } catch {
      return null;
    }
  }
  return null;
}

export const App: React.FC = () => {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(loadThemePreference);

  // Active Draft Letter state for author desk
  const [letter, setLetter] = useState<LetterData>(loadSavedDraft);

  // Recipient Received Letter state (from URL hash or query)
  const [recipientLetter, setRecipientLetter] = useState<LetterData | null>(getInitialRecipientLetter);

  // Recipient Flow state
  const [isRecipientFlow, setIsRecipientFlow] = useState<boolean>(hasIncomingShare);
  const [isLoadingSharedLetter, setIsLoadingSharedLetter] = useState<boolean>(() => {
    return hasIncomingShare() && !getInitialRecipientLetter();
  });
  const [sharedLetterError, setSharedLetterError] = useState<boolean>(false);

  // Reader Modal state (from Claude HTML reader preview)
  const [readerLetter, setReaderLetter] = useState<LetterData | null>(null);
  const [isReaderOpen, setIsReaderOpen] = useState<boolean>(false);
  const [isPeekMode, setIsPeekMode] = useState<boolean>(false);
  const [shelfTrigger, setShelfTrigger] = useState(0);

  // Feature Modals state
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [isTimeCapsuleOpen, setIsTimeCapsuleOpen] = useState(false);
  const [isSealedUntilFutureOpen, setIsSealedUntilFutureOpen] = useState(false);
  const [isYourDeskOpen, setIsYourDeskOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

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

  // Check URL Hash & Search Query for shared letter
  useEffect(() => {
    let cancelled = false;

    const checkShared = async () => {
      const hash = window.location.hash;
      const search = window.location.search;
      if (!hash && !search) {
        setIsRecipientFlow(false);
        return;
      }

      setIsLoadingSharedLetter(true);
      setSharedLetterError(false);

      try {
        const decoded = await resolveSharedLetter(hash, search);
        if (cancelled) return;

        if (decoded) {
          setRecipientLetter(decoded);
          setIsRecipientFlow(true);
          setIsLoadingSharedLetter(false);
        } else {
          setIsLoadingSharedLetter(false);
          setSharedLetterError(true);
        }
      } catch {
        if (!cancelled) {
          setIsLoadingSharedLetter(false);
          setSharedLetterError(true);
        }
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

  // Add Sticker
  const handleAddSticker = (stickerDef: StickerDefinition) => {
    const count = (letter.stickers || []).length;
    const placedY = Math.round(Math.min(36 + ((count % 5) * 6), 62) * 10) / 10;

    const newPlaced: PlacedSticker = {
      id: `stk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      stickerId: stickerDef.id,
      x: 50,
      y: placedY,
      scale: 1,
      rotation: 0,
      zIndex: Math.max(...(letter.stickers || []).map((s) => s.zIndex), 0) + 1
    };

    handleUpdateLetter({ stickers: [...(letter.stickers || []), newPlaced] });
    showToast(`Added "${stickerDef.name}" to your letter!`);
  };

  // Share Letter Link
  const handleShareLink = async () => {
    showToast('✉️ Creating short link...');

    let shareUrl = '';
    try {
      shareUrl = await createShortShareUrl(letter);
    } catch {
      const base = `${window.location.origin}${window.location.pathname.replace(/\/$/, '')}/`;
      shareUrl = `${base}#l=${encodeLetterToHash(letter)}`;
    }

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

    const copied = await copyTextToClipboard(shareUrl);
    if (copied) {
      showToast('✉️ Short link copied! Ready to paste and send.');
    } else {
      prompt('Copy your short letter link to share:', shareUrl);
    }
  };

  // Save as Picture
  const handleSavePicture = async () => {
    const paperEl = document.getElementById('paper');
    if (!paperEl) return;
    try {
      setIsExporting(true);
      showToast('Preparing your picture...');
      await exportLetterAsPicture(paperEl, {
        fileName: 'khat-and-co-letter.png',
        pixelRatio: 3
      });
      showToast('Letter downloaded!');
    } catch (err) {
      console.error(err);
      showToast('Failed to save picture.');
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
    handleOpenReader(letter, { peek: true });
  };

  // Write Back action from recipient view
  const handleWriteBack = (senderName: string, templateId: string, fontId: string) => {
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
      waxSeal: { ...DEFAULT_WAX_SEAL },
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
    setIsRecipientFlow(false);
    setRecipientLetter(null);
    setIsReaderOpen(false);
    setReaderLetter(null);
    showToast(`Started reply to ${senderName || 'your friend'}!`);

    const studioEl = document.getElementById('studio');
    if (studioEl) {
      studioEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCloseEnvelope = () => {
    if (isRecipientFlow) {
      setIsRecipientFlow(false);
      setRecipientLetter(null);
      window.history.replaceState(null, '', window.location.pathname);
    }
    setIsReaderOpen(false);
    setReaderLetter(null);
  };

  // Reader Modal handlers
  const handleOpenReader = (targetLetter: LetterData, opt?: { peek?: boolean }) => {
    setReaderLetter(targetLetter);
    setIsPeekMode(Boolean(opt?.peek));
    setIsReaderOpen(true);
  };

  const handleCloseReader = () => {
    setIsReaderOpen(false);
    setReaderLetter(null);
    if (isRecipientFlow) {
      setIsRecipientFlow(false);
      setRecipientLetter(null);
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  // ══════════════════════════════════════════════════════════════════════
  // CRITICAL RECIPIENT FLOW GUARANTEE:
  // When a recipient opens a shared letter link (?id=... or #l=...),
  // the author desk (.workspace-layout) is NEVER rendered.
  // The recipient sees strictly the sealed ReaderModal concealing the letter!
  // ══════════════════════════════════════════════════════════════════════
  if (isRecipientFlow) {
    return (
      <div className="app-shell recipient-mode">
        <ReaderModal
          isOpen={true}
          letter={recipientLetter}
          onClose={handleCloseEnvelope}
          onWriteBack={handleWriteBack}
          isPeek={false}
          isLoading={isLoadingSharedLetter}
          loadError={sharedLetterError}
        />
        {toastMessage && (
          <div className="khat-toast" role="status" aria-live="polite">
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app-shell">
      <a className="skip" href="#studio">
        Skip to the letter studio
      </a>

      {/* Top Navigation */}
      <Header
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onOpenStudio={() => setIsStudioOpen(true)}
      />

      {/* Main Workspace Layout */}
      <div className="workspace-layout">
        {/* Quick Author Action Controls Bar */}
        <div className="container py-2 d-flex flex-wrap align-items-center gap-2" style={{ borderBottom: '1px solid var(--line)' }}>
          <button
            type="button"
            className="btn ghost sm"
            onClick={() => setIsStudioOpen(true)}
            title="Open Studio for full customization"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
            </svg>
            <span>Open Studio</span>
          </button>

          <button
            type="button"
            className="btn ghost sm"
            onClick={handlePreviewEnvelope}
            title="See it as your reader will (Envelope View)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z" />
              <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10" />
            </svg>
            <span>See it as your reader will</span>
          </button>

          <button
            type="button"
            className="btn ghost sm"
            onClick={handleShareLink}
            title="Create an envelope link to send to your loved one"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span>Copy share link</span>
          </button>

          <button
            type="button"
            className="btn ghost sm"
            onClick={handleResetLetter}
            title="Start a fresh letter"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
            <span>Start a new letter</span>
          </button>
        </div>

        <main id="top" data-testid="stage">
          {/* Hero Section with interactive 3D Hero Envelope */}
          <HeroSection />

          {/* 3-Step Letter Studio Workflow (Write, Seal, Send) */}
          <StudioSection
            letter={letter}
            onChangeLetter={handleUpdateLetter}
            onOpenReader={handleOpenReader}
            onLetterSealed={() => setShelfTrigger((prev) => prev + 1)}
            showToast={showToast}
          />

          {/* The Shelf Section with fanned-out envelope stack */}
          <ShelfSection
            onOpenLetter={(l) => handleOpenReader(l, { peek: false })}
            sentLettersTrigger={shelfTrigger}
          />

          {/* The Weekly Nudge Section with Google Calendar reminder */}
          <NudgeSection />
        </main>

        {/* Footer with credit lockup */}
        <footer className="app-footer">
          <div className="container d-flex flex-wrap justify-content-between align-items-center gap-2">
            <span className="app-footer-name">Khath &amp; Co. Made for slow mail.</span>
            <span className="app-footer-credit">
              Letters live inside their links. · crafted by -{' '}
              <a
                href="https://github.com/Afshaan-shaik"
                target="_blank"
                rel="noopener noreferrer"
                className="app-footer-author"
                style={{ textDecoration: 'underline' }}
              >
                Afshaan Shaik
              </a>
            </span>
          </div>
        </footer>
      </div>

      {/* Fine-Pointer Custom Cursor and Sound Toggle */}
      <SoundCursor />

      {/* 3D Reader Modal for unsealing letters */}
      <ReaderModal
        isOpen={isReaderOpen}
        letter={readerLetter}
        onClose={handleCloseReader}
        onWriteBack={handleWriteBack}
        isPeek={isPeekMode}
      />

      {/* Studio Modal */}
      <Studio
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        letter={letter}
        onChangeLetter={handleUpdateLetter}
        onSelectTemplate={handleSelectTemplate}
        onSelectFont={handleSelectFont}
        onSelectInk={handleSelectInk}
        onToggleRuledLines={handleToggleRuledLines}
        onAddSticker={handleAddSticker}
        sealData={letter.waxSeal}
        onChangeSeal={(newSeal: WaxSealData) => handleUpdateLetter({ waxSeal: newSeal })}
        onPreviewEnvelope={() => {
          setIsStudioOpen(false);
          handlePreviewEnvelope();
        }}
        onShareLink={handleShareLink}
        onSavePicture={handleSavePicture}
        isExporting={isExporting}
      />



      {/* Your Desk Modal */}
      <YourDesk
        isOpen={isYourDeskOpen}
        onClose={() => setIsYourDeskOpen(false)}
        letter={letter}
        onEditDraft={() => setIsYourDeskOpen(false)}
        onPreviewEnvelope={() => {
          setIsYourDeskOpen(false);
          handlePreviewEnvelope();
        }}
        onOpenSealedUntilFuture={() => {
          setIsYourDeskOpen(false);
          setIsSealedUntilFutureOpen(true);
        }}
        onOpenTimeCapsule={() => {
          setIsYourDeskOpen(false);
          setIsTimeCapsuleOpen(true);
        }}
      />

      {/* Weekly Writing Prompts Modal */}
      <PromptModal
        isOpen={isPromptOpen}
        onClose={() => setIsPromptOpen(false)}
      />

      {/* Sealed Until Future Modal */}
      <SealedUntilFuture
        isOpen={isSealedUntilFutureOpen}
        onClose={() => setIsSealedUntilFutureOpen(false)}
      />

      {/* Time Capsule Modal */}
      <TimeCapsuleManager
        isOpen={isTimeCapsuleOpen}
        onClose={() => setIsTimeCapsuleOpen(false)}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="khat-toast" role="status" aria-live="polite">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FAD889"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
