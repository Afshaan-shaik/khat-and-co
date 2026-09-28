import React, { useState } from 'react';
import { STICKER_CATEGORIES, STICKER_REGISTRY, StickerDefinition } from '../constants/stickers';

interface StickerDrawerProps {
  onAddSticker: (stickerDef: StickerDefinition) => void;
  stickerCount: number;
}

export const StickerDrawer: React.FC<StickerDrawerProps> = ({
  onAddSticker,
  stickerCount
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('hearts-seals');

  const filteredStickers = Object.values(STICKER_REGISTRY).filter(
    (stk) => stk.category === activeCategory
  );

  return (
    <>
      {/* Floating Toggle Button on bottom right */}
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

      {/* Floating Sticker Drawer Panel */}
      {isOpen && (
        <div
          className="sticker-drawer-panel no-export"
          role="dialog"
          aria-label="Sticker drawer"
        >
          {/* Header */}
          <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
            <div>
              <span className="fw-semibold d-block" style={{ fontSize: '15px' }}>
                Stamp &amp; Sticker Collection
              </span>
              <span className="text-muted font-kalam" style={{ fontSize: '12px' }}>
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

          {/* Category Tabs */}
          <div
            className="d-flex border-bottom overflow-x-auto px-2 pt-2 gap-1"
            style={{ scrollbarWidth: 'none' }}
          >
            {STICKER_CATEGORIES.map((cat) => {
              const isSelected = cat.id === activeCategory;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`btn btn-sm text-nowrap rounded-top-2 rounded-bottom-0 ${
                    isSelected ? 'btn-khat-primary' : 'btn-khat-secondary'
                  }`}
                  style={{ fontSize: '12px', padding: '6px 10px' }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Sticker Grid */}
          <div className="sticker-grid" style={{ minHeight: '260px' }}>
            {filteredStickers.map((stk) => (
              <button
                key={stk.id}
                type="button"
                className="sticker-preview-btn"
                onClick={() => {
                  onAddSticker(stk);
                }}
                title={`Add ${stk.name} to letter`}
                aria-label={`Add ${stk.name}`}
              >
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {stk.render()}
                </div>
              </button>
            ))}
          </div>

          {/* Tip at bottom */}
          <div className="p-2 text-center text-muted small border-top" style={{ fontSize: '11px' }}>
            Tap to add to letter. Drag, rotate, or resize on paper!
          </div>
        </div>
      )}
    </>
  );
};
