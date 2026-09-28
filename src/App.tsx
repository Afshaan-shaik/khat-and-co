import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LetterData, PaperTemplate, FontOption } from './types/letter';
import {
  loadSavedDraft,
  saveDraft,
  loadThemePreference,
  saveThemePreference,
  getFormattedToday
} from './utils/storage';
import { encodeLetterToHash, decodeLetterFromHash } from './utils/codec';
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

  // Check URL Hash for shared letter on load & on hash change
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash && (hash.startsWith('#l=') || hash.length > 5)) {
        const decoded = decodeLetterFromHash(hash);
        if (decoded) {
          // Never overwrite recipient's own draft! We open it in recipient envelope mode.
          setRecipientLetter(decoded);
          setIsRecipientFlow(true);
          setIsEnvelopeOpen(true);
        }
      }
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
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
    setLetter((prev) => {
      let newInk = prev.inkColor;
      // If switching to dark paper and ink is dark, switch to default light ink
      if (tmpl.isDarkPaper) {
        newInk = tmpl.defaultInk;
      } else {
        // If switching from dark to light paper and ink was light, switch to default dark ink
        const currentTmpl = PAPER_TEMPLATES.find((t) => t.id === prev.templateId);
        if (currentTmpl?.isDarkPaper) {
          newInk = tmpl.defaultInk;
        }
      }
      return {
        ...prev,
        templateId: tmpl.id,
        inkColor: newInk
      };
    });
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
    // Determine random subtle placement on the letter
    const count = letter.stickers.length;
    const offsetX = 20 + ((count * 15) % 60);
    const offsetY = 25 + ((count * 12) % 55);

    const newPlaced = {
      id: `stk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      stickerId: stickerDef.id,
      x: offsetX,
      y: offsetY,
      scale: 1,
      rotation: Math.round((Math.random() * 20 - 10)),
      zIndex: Math.max(...letter.stickers.map((s) => s.zIndex), 0) + 1
    };

    handleUpdateLetter({ stickers: [...letter.stickers, newPlaced] });
    showToast(`Added "${stickerDef.name}" to letter. You can drag and position it!`);
  };

  // Share Letter Link
  const handleShareLink = async () => {
    const encoded = encodeLetterToHash(letter);
    if (!encoded) {
      showToast('Could not generate share link. Please try again.');
      return;
    }

    const shareUrl = `${window.location.origin}${window.location.pathname}#l=${encoded}`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        showToast('✉️ Share link copied to clipboard! Send it to your loved one.');
      } else {
        // Fallback for older browsers
        prompt('Copy this letter link to share:', shareUrl);
      }
    } catch {
      prompt('Copy this letter link to share:', shareUrl);
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

    // Clear hash so recipient now has their clean editor
    window.history.replaceState(null, '', window.location.pathname);
    setIsEnvelopeOpen(false);
    setRecipientLetter(null);
    showToast(`Started reply to ${senderName || 'your friend'}!`);
  };

  // Close envelope modal
  const handleCloseEnvelope = () => {
    setIsEnvelopeOpen(false);
    if (isRecipientFlow) {
      // Clear hash if closing read view
      window.history.replaceState(null, '', window.location.pathname);
      setRecipientLetter(null);
    }
  };

  const currentTemplate =
    PAPER_TEMPLATES.find((t) => t.id === letter.templateId) || PAPER_TEMPLATES[0];

  return (
    <div className="min-vh-100 d-flex flex-column">
      {/* Header with left-aligned brand logo matching user image */}
      <Header
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onOpenPrompt={() => setIsPromptOpen(true)}
        onPreviewEnvelope={handlePreviewEnvelope}
        onShareLink={handleShareLink}
        onSavePicture={handleSavePicture}
        isExporting={isExporting}
      />

      {/* Main Stationery Desk Workspace */}
      <main className="container-fluid py-4 px-3 px-md-4 flex-grow-1">
        {/* Template Gallery Selector */}
        <TemplatePicker
          selectedTemplateId={letter.templateId}
          onSelectTemplate={handleSelectTemplate}
        />

        {/* Handwriting Font, Ink Swatches & Ruled Lines Controls */}
        <FontPicker
          selectedFontId={letter.fontId}
          onSelectFont={handleSelectFont}
          selectedInk={letter.inkColor}
          onSelectInk={handleSelectInk}
          isDarkPaper={currentTemplate.isDarkPaper}
          ruledLines={letter.ruledLines}
          onToggleRuledLines={handleToggleRuledLines}
        />

        {/* Letter Stationery Sheet on the Desk */}
        <LetterEditor
          letter={letter}
          onChangeLetter={handleUpdateLetter}
          letterSheetRef={letterSheetRef}
        />
      </main>

      {/* Footer Branding & Warm Tagline */}
      <footer className="py-4 text-center border-top mt-auto" style={{ borderColor: 'var(--ui-panel-border)' }}>
        <div className="container">
          <p className="font-serif fs-5 mb-1" style={{ color: 'var(--ui-text)' }}>
            Khat <span style={{ color: 'var(--rose)', fontStyle: 'italic' }}>&amp;</span> Co.
          </p>
          <p className="small text-muted font-kalam m-0">
            खत · letters for the people you miss · Free, no-login digital stationery
          </p>
        </div>
      </footer>

      {/* Floating Sticker Drawer & Tap-to-add */}
      <StickerDrawer
        onAddSticker={handleAddSticker}
        stickerCount={letter.stickers.length}
      />

      {/* Bilingual Weekly Writing Prompts Modal */}
      <PromptModal
        isOpen={isPromptOpen}
        onClose={() => setIsPromptOpen(false)}
      />

      {/* The Animated Envelope Reading Modal */}
      <EnvelopeModal
        isOpen={isEnvelopeOpen}
        letter={recipientLetter || letter}
        onClose={handleCloseEnvelope}
        onWriteBack={handleWriteBack}
        isRecipientFlow={isRecipientFlow}
      />

      {/* Gentle Floating Toast Notifications */}
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
