import React, { useState, useEffect, useRef } from 'react';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenPrompt: () => void;
  onPreviewEnvelope: () => void;
  onShareLink: () => void;
  onSavePicture: () => void;
  isExporting?: boolean;
  onOpenStudio: () => void;
  onOpenYourDesk: () => void;
  onOpenSealedUntilFuture: () => void;
  onOpenTimeCapsule: () => void;
  onOpenVoiceWizard: () => void;
  onOpenInspireMe: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onOpenPrompt,
  onPreviewEnvelope,
  onShareLink,
  onSavePicture,
  isExporting = false,
  onOpenStudio,
  onOpenYourDesk,
  onOpenSealedUntilFuture,
  onOpenTimeCapsule,
  onOpenVoiceWizard,
  onOpenInspireMe,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on ESC
  useEffect(() => {
    if (!menuOpen) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [menuOpen]);

  // Trap scroll behind menu
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeAndRun = (fn: () => void) => {
    setMenuOpen(false);
    fn();
  };

  return (
    <>
      <header className="app-header px-3 px-md-4 px-lg-5">
        <div className="header-grid-container">

          {/* ── Brand Identity Lockup ── */}
          <div className="header-brand-cell">
            <a
              href="#"
              className="brand-link"
              role="banner"
              aria-label="Khath & Co. — letters for the people you miss"
              data-testid="logo"
              onClick={(e) => e.preventDefault()}
            >
              <BrandLogo theme={theme} />
            </a>
          </div>

          {/* ── Free badge (centre, hidden on smaller screens) ── */}
          <div className="header-center-cell d-none d-xl-flex">
            <span className="header-free-badge">
              Free. No account needed.
            </span>
          </div>

          {/* ── Action Controls (Desktop) ── */}
          <div
            className="header-actions-cell"
            data-testid="action-bar"
          >
            {/* Desktop-only: feature shortcuts */}
            <div className="d-none d-md-flex align-items-center gap-2">
              {/* Studio */}
              <button
                type="button"
                className="btn-khat-secondary header-action-btn"
                onClick={onOpenStudio}
                title="Open Studio — premium letter workspace"
                aria-label="Open Studio"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
                <span className="btn-label-text">Studio</span>
              </button>

              {/* Weekly Prompt */}
              <button
                type="button"
                className="btn-khat-secondary header-action-btn"
                onClick={onOpenPrompt}
                title="Weekly Writing Prompts in English & Hindi"
                aria-label="Weekly Writing Prompts"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                <span className="btn-label-text">Prompt</span>
              </button>

              {/* Reader Preview */}
              <button
                type="button"
                className="btn-khat-secondary header-action-btn"
                onClick={onPreviewEnvelope}
                title="See it as your reader will"
                aria-label="Preview Envelope Experience"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z" />
                  <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10" />
                </svg>
                <span className="btn-label-text">Preview</span>
              </button>

              {/* Save as Picture */}
              <button
                type="button"
                className="btn-khat-secondary header-action-btn"
                onClick={onSavePicture}
                disabled={isExporting}
                title="Download high-resolution image of your letter"
                aria-label="Save as Picture"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span className="btn-label-text">{isExporting ? 'Saving...' : 'Save'}</span>
              </button>

              {/* Share Letter — primary CTA */}
              <button
                type="button"
                className="btn-khat-primary header-action-btn"
                onClick={onShareLink}
                title="Create an envelope link to send to your loved one"
                aria-label="Copy Share Link"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                <span className="btn-label-text">Share Letter</span>
              </button>
            </div>

            {/* Theme Toggle — Always visible */}
            <button
              type="button"
              className="btn-khat-secondary btn-icon-only header-theme-btn"
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Switch to daylight paper' : 'Switch to night desk'}
              aria-label="Toggle dark/light desk theme"
              data-testid="theme-toggle"
            >
              {theme === 'dark' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FAD889" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              )}
            </button>

            {/* Mobile Hamburger ☰ — mobile only */}
            <button
              type="button"
              className="btn-khat-secondary btn-icon-only d-flex d-md-none"
              onClick={() => setMenuOpen(true)}
              aria-label="Open main menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-drawer"
              data-testid="hamburger-menu"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ══════════════════ MOBILE OFFCANVAS DRAWER ══════════════════ */}
      {menuOpen && (
        <div
          className="mobile-drawer-backdrop"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
      <div
        id="mobile-nav-drawer"
        ref={drawerRef}
        className={`mobile-nav-drawer ${menuOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Main navigation menu"
        tabIndex={-1}
      >
        <div className="mobile-drawer-inner">
          {/* Drawer header */}
          <div className="mobile-drawer-header">
            <span className="mobile-drawer-brand">Khath <span style={{ color: 'var(--rose)', fontStyle: 'italic' }}>&</span> Co.</span>
            <button
              type="button"
              className="btn-khat-secondary btn-icon-only mobile-drawer-close"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <line x1="1" y1="1" x2="13" y2="13" /><line x1="13" y1="1" x2="1" y2="13" />
              </svg>
            </button>
          </div>

          {/* Navigation sections */}
          <nav className="mobile-drawer-nav" aria-label="Mobile feature navigation">

            {/* YOUR LETTER */}
            <div className="mobile-nav-group">
              <span className="mobile-nav-group-label">YOUR LETTER</span>
              <button type="button" className="mobile-nav-item" onClick={() => { setMenuOpen(false); onEditDraft(); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                Write a Letter
              </button>
              <button type="button" className="mobile-nav-item" onClick={() => closeAndRun(onOpenYourDesk)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-4 0v2" /><path d="M8 7V5a2 2 0 0 1 4 0v2" />
                </svg>
                Your Desk
              </button>
            </div>

            {/* CREATE */}
            <div className="mobile-nav-group">
              <span className="mobile-nav-group-label">CREATE</span>
              <button type="button" className="mobile-nav-item" onClick={() => closeAndRun(onOpenStudio)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
                </svg>
                Studio
              </button>
              <button type="button" className="mobile-nav-item" onClick={() => { setMenuOpen(false); /* Wax seal is inside Studio */ onOpenStudio(); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
                </svg>
                Wax Seal
              </button>
              <button type="button" className="mobile-nav-item" onClick={() => closeAndRun(onOpenVoiceWizard)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
                </svg>
                Voice Wizard
              </button>
              <button type="button" className="mobile-nav-item" onClick={() => closeAndRun(onOpenInspireMe)}>
                <span className="mobile-nav-star" aria-hidden="true">✦</span>
                Inspire Me
              </button>
            </div>

            {/* SEND INTO THE FUTURE */}
            <div className="mobile-nav-group">
              <span className="mobile-nav-group-label">SEND INTO THE FUTURE</span>
              <button type="button" className="mobile-nav-item" onClick={() => closeAndRun(onOpenSealedUntilFuture)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Sealed Until Future
              </button>
              <button type="button" className="mobile-nav-item" onClick={() => closeAndRun(onOpenTimeCapsule)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                Letter Time Capsule
              </button>
            </div>

            {/* TOOLS */}
            <div className="mobile-nav-group">
              <span className="mobile-nav-group-label">TOOLS</span>
              <button type="button" className="mobile-nav-item" onClick={() => { setMenuOpen(false); onOpenPrompt(); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Weekly Prompt
              </button>
              <button type="button" className="mobile-nav-item" onClick={() => { setMenuOpen(false); onPreviewEnvelope(); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z" />
                </svg>
                Reader Preview
              </button>
              <button type="button" className="mobile-nav-item" onClick={() => { setMenuOpen(false); onShareLink(); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                Share Letter
              </button>
              <button type="button" className="mobile-nav-item" onClick={() => { setMenuOpen(false); onSavePicture(); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Save Picture
              </button>
              <button type="button" className="mobile-nav-item" onClick={() => { setMenuOpen(false); onToggleTheme(); }}>
                {theme === 'dark' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FAD889" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                  </svg>
                )}
                {theme === 'dark' ? 'Daylight Paper' : 'Night Desk'}
              </button>
            </div>
          </nav>

          {/* Bottom brand note */}
          <div className="mobile-drawer-footer">
            <p className="mobile-drawer-footer-text">
              Free · No account needed · Written with love
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

// Helper — used by hamburger "Write a Letter" which just closes menu (editing is default state)
function onEditDraft() { /* no-op — main view is always editing */ }
