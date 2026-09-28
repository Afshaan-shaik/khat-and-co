import React, { useRef, useEffect } from 'react';
import { PlacedSticker } from '../types/letter';
import { STICKER_REGISTRY } from '../constants/stickers';

interface StickerCanvasProps {
  stickers: PlacedSticker[];
  onChangeStickers: (stickers: PlacedSticker[]) => void;
  selectedId: string | null;
  onSelectId: (id: string | null) => void;
  readOnly?: boolean;
}

export const StickerCanvas: React.FC<StickerCanvasProps> = ({
  stickers,
  onChangeStickers,
  selectedId,
  onSelectId,
  readOnly = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Dragging state tracking
  const dragRef = useRef<{
    activeId: string | null;
    startX: number;
    startY: number;
    initStickerX: number;
    initStickerY: number;
    containerWidth: number;
    containerHeight: number;
  }>({
    activeId: null,
    startX: 0,
    startY: 0,
    initStickerX: 0,
    initStickerY: 0,
    containerWidth: 1,
    containerHeight: 1
  });

  // Handle pointer down (initiate drag)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, sticker: PlacedSticker) => {
    if (readOnly) return;
    e.stopPropagation();

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    dragRef.current = {
      activeId: sticker.id,
      startX: e.clientX,
      startY: e.clientY,
      initStickerX: sticker.x,
      initStickerY: sticker.y,
      containerWidth: rect.width || 1,
      containerHeight: rect.height || 1
    };

    onSelectId(sticker.id);

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore if pointer capture fails
    }
  };

  // Handle pointer move (dragging)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (readOnly || !dragRef.current.activeId) return;

    const { activeId, startX, startY, initStickerX, initStickerY, containerWidth } = dragRef.current;
    const deltaXPixels = e.clientX - startX;
    const deltaYPixels = e.clientY - startY;

    // Convert pixel delta to percentage of letter width (1 unit = 1% of width)
    const deltaXPercent = (deltaXPixels / containerWidth) * 100;
    const deltaYPercent = (deltaYPixels / containerWidth) * 100;

    const targetEl = document.getElementById(`placed_${activeId}`);
    if (targetEl) {
      const newX = Math.min(Math.max(initStickerX + deltaXPercent, 0), 96);
      const newY = Math.min(Math.max(initStickerY + deltaYPercent, 0), 96);
      targetEl.style.left = `${newX}%`;
      targetEl.style.top = `${newY}%`;
    }
  };

  // Handle pointer up (commit to React state)
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (readOnly || !dragRef.current.activeId) return;

    const { activeId, startX, startY, initStickerX, initStickerY, containerWidth } = dragRef.current;
    const deltaXPercent = ((e.clientX - startX) / containerWidth) * 100;
    const deltaYPercent = ((e.clientY - startY) / containerWidth) * 100;

    const finalX = Math.round(Math.min(Math.max(initStickerX + deltaXPercent, 0), 96) * 10) / 10;
    const finalY = Math.round(Math.min(Math.max(initStickerY + deltaYPercent, 0), 96) * 10) / 10;

    onChangeStickers(
      stickers.map((s) => (s.id === activeId ? { ...s, x: finalX, y: finalY } : s))
    );

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    dragRef.current.activeId = null;
  };

  // Keyboard controls for accessible nudging and deletion
  useEffect(() => {
    if (readOnly || !selectedId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const step = e.shiftKey ? 5 : 1;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        onChangeStickers(
          stickers.map((s) => (s.id === selectedId ? { ...s, y: Math.max(s.y - step, 0) } : s))
        );
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        onChangeStickers(
          stickers.map((s) => (s.id === selectedId ? { ...s, y: Math.min(s.y + step, 96) } : s))
        );
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onChangeStickers(
          stickers.map((s) => (s.id === selectedId ? { ...s, x: Math.max(s.x - step, 0) } : s))
        );
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onChangeStickers(
          stickers.map((s) => (s.id === selectedId ? { ...s, x: Math.min(s.x + step, 96) } : s))
        );
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onChangeStickers(stickers.filter((s) => s.id !== selectedId));
        onSelectId(null);
      } else if (e.key === 'Escape') {
        onSelectId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, stickers, readOnly, onChangeStickers, onSelectId]);

  // Click or touch anywhere outside to deselect
  useEffect(() => {
    if (readOnly || !selectedId) return;

    const handlePointerDownOutside = (e: PointerEvent | MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const activeEl = document.getElementById(`placed_${selectedId}`);
      if (activeEl && activeEl.contains(target)) return;

      if (target.closest && (target.closest('.sticker-item') || target.closest('.top-sticker-actions'))) {
        return;
      }

      onSelectId(null);
    };

    window.addEventListener('pointerdown', handlePointerDownOutside, true);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDownOutside, true);
    };
  }, [selectedId, readOnly, onSelectId]);

  return (
    <div
      ref={containerRef}
      className="stickers-layer"
      aria-label="Decorated stickers on letter"
    >
      {stickers.map((sticker) => {
        const def = STICKER_REGISTRY[sticker.stickerId];
        if (!def) return null;

        const isSelected = !readOnly && selectedId === sticker.id;

        return (
          <div
            key={sticker.id}
            id={`placed_${sticker.id}`}
            role="button"
            tabIndex={readOnly ? -1 : 0}
            aria-label={`${def.name} sticker. Press arrow keys to move, Delete to remove.`}
            className={`sticker-item ${isSelected ? 'selected' : ''}`}
            style={{
              left: `${sticker.x}%`,
              top: `${sticker.y}%`,
              width: `${def.width * sticker.scale}px`,
              height: `${def.height * sticker.scale}px`,
              transform: `rotate(${sticker.rotation}deg)`,
              zIndex: sticker.zIndex
            }}
            onPointerDown={(e) => handlePointerDown(e, sticker)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onClick={(e) => {
              e.stopPropagation();
              if (!readOnly) onSelectId(sticker.id);
            }}
          >
            {/* Inline SVG Sticker render */}
            {def.render()}
          </div>
        );
      })}
    </div>
  );
};
