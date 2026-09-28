import React, { useState } from 'react';
import { STICKER_CATEGORIES, STICKER_REGISTRY, StickerDefinition } from '../constants/stickers';

interface StickerDrawerProps {
  onAddSticker: (stickerDef: StickerDefinition) => void;
  stickerCount: number;
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

  // ── INLINE SIDEBAR MODE ── (matches reference image media_1790607376417.png)
  if (inlineSidebar) {
    return (
      <div className="stickers-stamps-card">
        {/* Title in serif font */}
        <h3 className="stickers-card-title">Stickers and stamps</h3>

        {/* Category Tabs */}
        <div className="sticker-cat-pill-tabs" role="tablist" aria-label="Sticker categories">
          {STICKER_CATEGORIES.map((cat) => {
            const isSelected = cat.id === activeCategory;
            return (
              <button
                key={cat.id}
                role="tab"
                aria-selected={isSelected}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`sticker-cat-pill ${isSelected ? 'active' : ''}`}
              >
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sub-category header matching reference */}
        <div className="sticker-subcat-header">
          {STICKER_CATEGORIES.find((c) => c.id === activeCategory)?.label || 'Hearts and seals'}
        </div>

        {/* Sticker Buttons Grid */}
        <div
          className="sticker-square-grid"
          role="tabpanel"
          aria-label={STICKER_CATEGORIES.find((c) => c.id === activeCategory)?.label}
        >
          {filteredStickers.map((stk) => (
            <button
              key={stk.id}
              type="button"
              className="sticker-square-btn"
              onClick={() => onAddSticker(stk)}
              title={`Add ${stk.name} to letter`}
              aria-label={`Add ${stk.name}`}
            >
              <div className="sticker-icon-wrapper">
                {stk.render()}
              </div>
            </button>
          ))}
        </div>

        {/* Helper tip */}
        <div className="sticker-card-footer">
          ✨ Tap to add · drag &amp; rotate on paper
        </div>
      </div>
    );
  }

  // ── FLOATING DRAWER MODE (Mobile fallback) ──
  return (
    <>
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

      {isOpen && (
        <div
          className="sticker-drawer-panel no-export"
          role="dialog"
          aria-label="Sticker drawer"
        >
          <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--ui-panel-border)', background: 'var(--drawer-header-bg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '17px', fontFamily: 'var(--font-serif)', color: 'var(--ui-text-bright)', display: 'block' }}>
                Stickers and stamps
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
            />
          </div>

          <div className="sticker-cat-pill-tabs px-3 pt-2">
            {STICKER_CATEGORIES.map((cat) => {
              const isSelected = cat.id === activeCategory;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`sticker-cat-pill ${isSelected ? 'active' : ''}`}
                >
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="sticker-square-grid p-3" style={{ maxHeight: '340px', overflowY: 'auto' }}>
            {filteredStickers.map((stk) => (
              <button
                key={stk.id}
                type="button"
                className="sticker-square-btn"
                onClick={() => onAddSticker(stk)}
                title={`Add ${stk.name}`}
                aria-label={`Add ${stk.name}`}
              >
                <div className="sticker-icon-wrapper">
                  {stk.render()}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
