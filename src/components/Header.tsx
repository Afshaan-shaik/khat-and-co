import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenPrompt?: () => void;
  onPreviewEnvelope?: () => void;
  onShareLink?: () => void;
  onSavePicture?: () => void;
  isExporting?: boolean;
  onOpenStudio?: () => void;
  onOpenYourDesk?: () => void;
  onOpenSealedUntilFuture?: () => void;
  onOpenTimeCapsule?: () => void;
  onOpenVoiceWizard?: () => void;
  onOpenInspireMe?: () => void;
  onOpenAtelier?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onOpenStudio,
  onOpenAtelier
}) => {
  const isDark = theme === 'dark';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // Close menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        closeMobileMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen, closeMobileMenu]);

  // Lock body scroll when mobile menu is active
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('mobile-menu-active');
    } else {
      document.body.classList.remove('mobile-menu-active');
    }
    return () => {
      document.body.classList.remove('mobile-menu-active');
    };
  }, [isMobileMenuOpen]);

  const handleLinkClick = () => {
    closeMobileMenu();
  };

  const handleStudioClick = () => {
    closeMobileMenu();
    if (onOpenStudio) {
      onOpenStudio();
    }
  };

  return (
    <header className="nav">
      <div className="container nav-in">
        {/* Brand with letter envelope logo */}
        <a
          href="#top"
          className="brand"
          role="banner"
          aria-label="Khath & Co. — letters for the people you miss"
          data-testid="logo"
          onClick={handleLinkClick}
        >
          <BrandLogo theme={theme} />
        </a>

        {/* Desktop Navigation Section Links */}
        <nav className="nav-links desktop-nav-links" aria-label="Sections">
          <a href="#studio">Write</a>
          <a
            href="#studio"
            role="button"
            className="nav-studio"
            onClick={handleStudioClick}
            aria-label="Open Studio"
            data-testid="nav-studio"
          >
            Studio
          </a>
          <a
            href="#atelier"
            role="button"
            className="nav-atelier"
            id="atelier-desktop-trigger"
            onClick={(e) => {
              e.preventDefault();
              if (onOpenAtelier) onOpenAtelier();
            }}
            aria-label="Open The Letter Atelier"
            data-testid="nav-atelier"
          >
            Atelier
          </a>
          <a href="#shelf">Shelf</a>
          <a href="#nudge">Nudge</a>
        </nav>

        {/* Right side controls */}
        <div className="nav-right" data-testid="action-bar">
          <button
            className="icon-btn"
            id="themeBtn"
            data-testid="theme-toggle"
            type="button"
            onClick={onToggleTheme}
            aria-label="Switch between the light and dark desk"
          >
            {isDark ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" />
              </svg>
            )}
          </button>

          <a className="btn cta sm desktop-cta-btn" href="#studio">
            Write a letter
          </a>

          {/* Mobile 3-dash Hamburger Menu Button */}
          <button
            className="icon-btn mobile-menu-toggle"
            id="mobileMenuToggle"
            data-testid="mobile-menu-toggle"
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {isMobileMenuOpen ? (
              <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Backdrop & Panel */}
      {typeof document !== 'undefined' &&
        createPortal(
          <>
            {isMobileMenuOpen && (
              <div
                className="mobile-nav-backdrop"
                onClick={closeMobileMenu}
                aria-hidden="true"
              />
            )}

            <div
              className={`mobile-nav-drawer ${isMobileMenuOpen ? 'open' : ''}`}
              id="mobileNavDrawer"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation"
            >
              <div className="mobile-nav-header">
                <span className="mobile-nav-title">Navigation</span>
                <button
                  type="button"
                  className="icon-btn mobile-nav-close"
                  onClick={closeMobileMenu}
                  aria-label="Close menu"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <nav className="mobile-nav-list" aria-label="Mobile Sections">
                <a href="#studio" className="mobile-nav-link" onClick={handleLinkClick}>
                  <span className="mobile-nav-num">01</span>
                  <span>Write</span>
                </a>
                <a
                  href="#studio"
                  role="button"
                  className="mobile-nav-link"
                  onClick={handleStudioClick}
                >
                  <span className="mobile-nav-num">02</span>
                  <span>Studio</span>
                </a>
                <a
                  href="#atelier"
                  role="button"
                  id="atelier-mobile-trigger"
                  className="mobile-nav-link text-start"
                  onClick={(e) => {
                    e.preventDefault();
                    closeMobileMenu();
                    if (onOpenAtelier) onOpenAtelier();
                  }}
                  data-testid="mobile-nav-atelier"
                >
                  <span className="mobile-nav-num">✦</span>
                  <span>The Letter Atelier</span>
                </a>
                <a href="#shelf" className="mobile-nav-link" onClick={handleLinkClick}>
                  <span className="mobile-nav-num">03</span>
                  <span>The Shelf</span>
                </a>
                <a href="#nudge" className="mobile-nav-link" onClick={handleLinkClick}>
                  <span className="mobile-nav-num">04</span>
                  <span>Weekly Nudge</span>
                </a>
              </nav>

              <div className="mobile-nav-footer">
                <a
                  className="btn cta mobile-nav-cta"
                  href="#studio"
                  onClick={handleLinkClick}
                >
                  Write a letter
                </a>
                <div className="mobile-nav-theme-row">
                  <span>Theme: {isDark ? 'Night Desk' : 'Day Desk'}</span>
                  <button
                    type="button"
                    className="btn ghost sm"
                    onClick={onToggleTheme}
                    aria-label="Toggle dark/light mode"
                  >
                    {isDark ? 'Switch to Day ☀' : 'Switch to Night ☾'}
                  </button>
                </div>
              </div>
            </div>
          </>,
          document.body
        )}
    </header>
  );
};
