import React, { useState } from 'react';
import { STICKER_CATEGORIES, STICKER_REGISTRY, StickerDefinition } from '../constants/stickers';

interface StickerDrawerProps {
  onAddSticker: (stickerDef: StickerDefinition) => void;
  stickerCount: number;
  /** When true, renders inline inside the sidebar (no floating panel) */
  inlineSidebar?: boolean;
}

export const StickerDrawer: React.FC<StickerDrawerProps> = ({
  onAddSticker,
  stickerCount,
  inlineSidebar = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('hearts-seals');

  const filteredStickers = Object.values(STICKER_REGISTRY).filter(
    (stk) => stk.category === activeCategory
  );

  // ── INLINE SIDEBAR MODE ── (renders a static sticker collection block)
  if (inlineSidebar) {
    return (
      <div className="sticker-section" data-testid="sticker-tray">

        {/* Category Tabs */}
        <div className="sticker-cat-tabs" role="tablist" aria-label="Sticker categories">
          {STICKER_CATEGORIES.map((cat) => {
            const isSelected = cat.id === activeCategory;
            return (
              <button
                key={cat.id}
                role="tab"
                aria-selected={isSelected}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`sticker-cat-tab ${isSelected ? 'active' : ''}`}
              >
                {cat.label}
                <span className="sticker-cat-label-hindi">{cat.labelHindi}</span>
              </button>
            );
          })}
        </div>

        {/* Sticker Grid */}
        <div
          className="sticker-grid"
          role="tabpanel"
          aria-label={STICKER_CATEGORIES.find(c => c.id === activeCategory)?.label}
          style={{ minHeight: '180px' }}
        >
          {filteredStickers.map((stk) => (
            <button
              key={stk.id}
              type="button"
              className="sticker-preview-btn"
              onClick={() => onAddSticker(stk)}
              title={`Add ${stk.name} to letter`}
              aria-label={`Add ${stk.name}`}
            >
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {stk.render()}
              </div>
            </button>
          ))}
        </div>

        {/* Tip */}
        <div className="sticker-tip">
          ✨ Tap to add · drag &amp; rotate on paper
        </div>
      </div>
    );
  }

  // ── FLOATING DRAWER MODE ── (mobile fallback, shown as floating button)
  return (
    <>
      {/* Floating Toggle Button */}
      <div className="sticker-drawer-toggle no-export">
        <button
          type="button"
          className="btn-khat-primary shadow-lg"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Toggle Sticker Drawer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span className="fw-semibold">Add Sticker</span>
          {stickerCount > 0 && (
            <span className="badge rounded-pill bg-white text-dark ms-1" style={{ fontSize: '11px' }}>
              {stickerCount}
            </span>
          )}
        </button>
      </div>

      {/* Floating Panel */}
      {isOpen && (
        <div
          className="sticker-drawer-panel no-export"
          role="dialog"
          aria-label="Sticker drawer"
          data-testid="sticker-tray"
        >
          {/* Header */}
          <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--ui-panel-border)', background: 'var(--drawer-header-bg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ui-text-bright)', display: 'block' }}>
                Stamp &amp; Sticker Collection
              </span>
              <span className="font-kalam" style={{ fontSize: '12px', color: 'var(--ui-text-muted)' }}>
                डाक टिकट व सुंदर स्टीकर्स
              </span>
            </div>
            <button
              type="button"
              className="btn-close"
              aria-label="Close sticker drawer"
              onClick={() => setIsOpen(false)}
              style={{ filter: 'var(--bs-btn-close-filter, none)' }}
            />
          </div>

          {/* Category Tabs */}
          <div className="sticker-cat-tabs">
            {STICKER_CATEGORIES.map((cat) => {
              const isSelected = cat.id === activeCategory;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`sticker-cat-tab ${isSelected ? 'active' : ''}`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Sticker Grid */}
          <div className="sticker-grid" style={{ minHeight: '260px', overflowY: 'auto' }}>
            {filteredStickers.map((stk) => (
              <button
                key={stk.id}
                type="button"
                className="sticker-preview-btn"
                onClick={() => { onAddSticker(stk); }}
                title={`Add ${stk.name} to letter`}
                aria-label={`Add ${stk.name}`}
              >
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {stk.render()}
                </div>
              </button>
            ))}
          </div>

          {/* Tip */}
          <div className="sticker-tip">
            Tap to add to letter. Drag, rotate, or resize on paper!
          </div>
        </div>
      )}
    </>
  );
};
