import React from 'react';

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
    <header className="app-header py-2 px-3 px-md-4">
      <div className="container-fluid d-flex align-items-center justify-content-between flex-wrap gap-2">
        {/* Brand Logo on the left side matching user's uploaded image */}
        <div className="brand-link" role="banner" aria-label="Khat &amp; Co. — letters for the people you miss">
          <img
            src="/khat-logo.svg"
            alt="Khat &amp; Co."
            className="brand-logo-img d-none d-sm-block"
            width="240"
            height="56"
          />
          {/* Compact mark + text for small mobile screens */}
          <div className="d-flex align-items-center gap-2 d-sm-none">
            <img src="/khat-mark.svg" alt="" aria-hidden="true" width="40" height="34" />
            <div className="d-flex flex-column">
              <span className="font-serif fs-4 lh-1" style={{ color: 'var(--ui-text)' }}>
                Khat <span style={{ color: 'var(--rose)', fontStyle: 'italic' }}>&amp;</span> Co.
              </span>
              <span className="font-kalam" style={{ fontSize: '11px', color: 'var(--ui-text-muted)' }}>
                खत · letters for you
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls on the right */}
        <div className="d-flex align-items-center gap-2 flex-wrap ms-auto">
          {/* Weekly Prompt Button */}
          <button
            type="button"
            className="btn-khat-secondary"
            onClick={onOpenPrompt}
            title="Weekly Writing Prompts in English & Hindi"
            aria-label="Weekly Writing Prompts"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            <span className="d-none d-md-inline">Weekly Prompt</span>
            <span className="d-inline d-md-none">Prompt</span>
          </button>

          {/* See it as your reader will (Preview) */}
          <button
            type="button"
            className="btn-khat-secondary"
            onClick={onPreviewEnvelope}
            title="See it as your reader will (Envelope View)"
            aria-label="Preview Envelope Experience"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z" />
              <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10" />
            </svg>
            <span className="d-none d-lg-inline">Reader Preview</span>
            <span className="d-inline d-lg-none">Preview</span>
          </button>

          {/* Save as Picture (PNG) */}
          <button
            type="button"
            className="btn-khat-secondary"
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
            <span className="d-none d-md-inline">{isExporting ? 'Saving...' : 'Save Picture'}</span>
          </button>

          {/* Copy Share Link */}
          <button
            type="button"
            className="btn-khat-primary"
            onClick={onShareLink}
            title="Create an envelope link to send to your loved one"
            aria-label="Copy Share Link"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span>Share Letter</span>
          </button>

          {/* Theme Toggle (Dark Desk / Light Paper) */}
          <button
            type="button"
            className="btn-khat-secondary btn-icon-only"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to daylight paper' : 'Switch to night desk'}
            aria-label="Toggle dark/light desk theme"
          >
            {theme === 'dark' ? (
              // Sun icon
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            ) : (
              // Moon icon
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
