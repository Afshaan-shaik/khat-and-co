import React from 'react';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenPrompt: () => void;
  onPreviewEnvelope: () => void;
  onShareLink: () => void;
  onSavePicture: () => void;
  isExporting?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onOpenPrompt,
  onPreviewEnvelope,
  onShareLink,
  onSavePicture,
  isExporting = false
}) => {
  return (
    <header className="app-header px-3 px-md-4 px-lg-5">
      <div className="header-grid-container">

        {/* ── Brand Identity Lockup (Mark + Title + Tagline with full 'miss') ── */}
        <div className="header-brand-cell">
          <a
            href="#"
            className="brand-link"
            role="banner"
            aria-label="Khat & Co. — letters for the people you miss"
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

        {/* ── Action Controls (Collapses to icons cleanly on narrow viewports) ── */}
        <div
          className="header-actions-cell"
          data-testid="action-bar"
        >

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
            <span className="btn-label-text">Weekly Prompt</span>
          </button>

          {/* Reader Preview */}
          <button
            type="button"
            className="btn-khat-secondary header-action-btn"
            onClick={onPreviewEnvelope}
            title="See it as your reader will (Envelope View)"
            aria-label="Preview Envelope Experience"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z" />
              <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10" />
            </svg>
            <span className="btn-label-text">Reader Preview</span>
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
            <span className="btn-label-text">{isExporting ? 'Saving...' : 'Save Picture'}</span>
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

        </div>
      </div>
    </header>
  );
};
