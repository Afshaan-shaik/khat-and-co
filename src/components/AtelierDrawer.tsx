import React from 'react';
import { sfx } from '../utils/sound';

interface AtelierDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMemoryFolio: () => void;
  onSelectFeature: (feature: 'paper' | 'postmark' | 'secretFold' | 'memoryFolio' | 'soundscape') => void;
}

export const AtelierDrawer: React.FC<AtelierDrawerProps> = ({
  isOpen,
  onClose,
  onOpenMemoryFolio,
  onSelectFeature
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="atelier-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="The Letter Atelier"
      onClick={onClose}
    >
      <div
        className="atelier-drawer"
        id="letter-atelier-drawer"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="atelier-header">
          <div className="atelier-title-block">
            <span className="atelier-kicker">Stationery Objects</span>
            <h2 className="atelier-title">The Letter Atelier</h2>
            <p className="atelier-subtitle">Refined rituals for slow mail</p>
          </div>
          <button
            type="button"
            className="atelier-close-btn"
            onClick={() => {
              sfx.snap();
              onClose();
            }}
            aria-label="Close Atelier"
          >
            ×
          </button>
        </div>

        <nav className="atelier-list" aria-label="Atelier rituals">
          {/* 1. Paper Ritual */}
          <button
            type="button"
            className="atelier-card"
            onClick={() => {
              sfx.rustle();
              onSelectFeature('paper');
              onClose();
            }}
          >
            <div className="atelier-card-icon">✦</div>
            <div className="atelier-card-content">
              <span className="atelier-card-title">Paper Ritual</span>
              <span className="atelier-card-desc">Choose the paper</span>
            </div>
            <div className="atelier-card-arrow">→</div>
          </button>

          {/* 2. Postmark */}
          <button
            type="button"
            className="atelier-card"
            onClick={() => {
              sfx.snap();
              onSelectFeature('postmark');
              onClose();
            }}
          >
            <div className="atelier-card-icon">◉</div>
            <div className="atelier-card-content">
              <span className="atelier-card-title">Postmark</span>
              <span className="atelier-card-desc">Leave a little trace</span>
            </div>
            <div className="atelier-card-arrow">→</div>
          </button>

          {/* 3. Secret Fold */}
          <button
            type="button"
            className="atelier-card"
            onClick={() => {
              sfx.snap();
              onSelectFeature('secretFold');
              onClose();
            }}
          >
            <div className="atelier-card-icon">♡</div>
            <div className="atelier-card-content">
              <span className="atelier-card-title">Secret Fold</span>
              <span className="atelier-card-desc">Hide something inside</span>
            </div>
            <div className="atelier-card-arrow">→</div>
          </button>

          {/* 4. Memory Thread */}
          <div className="atelier-card atelier-card-static">
            <div className="atelier-card-icon">∞</div>
            <div className="atelier-card-content">
              <span className="atelier-card-title">Memory Thread</span>
              <span className="atelier-card-desc">Keep the moments together</span>
            </div>
            <span className="atelier-badge">Quiet</span>
          </div>

          {/* 5. Scent of the Letter */}
          <button
            type="button"
            className="atelier-card"
            onClick={() => {
              sfx.scratch();
              onSelectFeature('soundscape');
            }}
          >
            <div className="atelier-card-icon">❀</div>
            <div className="atelier-card-content">
              <span className="atelier-card-title">Scent of the Letter</span>
              <span className="atelier-card-desc">Give it an atmosphere</span>
            </div>
            <div className="atelier-card-arrow">♪</div>
          </button>

          {/* 6. Memory Folio (Highlighted Primary Feature) */}
          <button
            type="button"
            className="atelier-card atelier-card-featured"
            onClick={() => {
              sfx.rustle();
              onOpenMemoryFolio();
            }}
          >
            <div className="atelier-card-icon featured-icon">✦</div>
            <div className="atelier-card-content">
              <div className="d-flex align-items-center gap-2">
                <span className="atelier-card-title">Memory Folio</span>
                <span className="atelier-pill">New · 4K</span>
              </div>
              <span className="atelier-card-desc">Keep a few moments with this letter</span>
            </div>
            <div className="atelier-card-arrow">→</div>
          </button>
        </nav>

        <div className="atelier-footer">
          <p className="atelier-footnote">
            Every object is crafted to feel like a secret tucked inside an envelope.
          </p>
        </div>
      </div>
    </div>
  );
};
