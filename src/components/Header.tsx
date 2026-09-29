import React from 'react';
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
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme
}) => {
  const isDark = theme === 'dark';

  return (
    <header className="nav">
      <div className="container nav-in">
        {/* Brand with small letter envelope logo */}
        <a
          href="#top"
          className="brand"
          role="banner"
          aria-label="Khath & Co. — letters for the people you miss"
          data-testid="logo"
        >
          <BrandLogo theme={theme} />
        </a>

        {/* Navigation Section Links */}
        <nav className="nav-links" aria-label="Sections">
          <a href="#studio">Write</a>
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
          <a className="btn cta sm" href="#studio">
            Write a letter
          </a>
        </div>
      </div>
    </header>
  );
};
