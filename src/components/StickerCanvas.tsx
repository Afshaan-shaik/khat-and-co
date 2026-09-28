import React, { useRef, useState, useEffect } from 'react';
import { PlacedSticker } from '../types/letter';
import { STICKER_REGISTRY } from '../constants/stickers';

interface StickerCanvasProps {
  stickers: PlacedSticker[];
  onChangeStickers: (stickers: PlacedSticker[]) => void;
  readOnly?: boolean;
}

export const StickerCanvas: React.FC<StickerCanvasProps> = ({
  stickers,
  onChangeStickers,
  readOnly = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

    setSelectedId(sticker.id);

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

  // Toolbar operations
  const handleRotate = (id: string, deltaDeg: number) => {
    onChangeStickers(
      stickers.map((s) =>
        s.id === id ? { ...s, rotation: ((s.rotation + deltaDeg + 180) % 360) - 180 } : s
      )
    );
  };

  // Straighten to 0 degrees
  const handleStraighten = (id: string) => {
    onChangeStickers(
      stickers.map((s) => (s.id === id ? { ...s, rotation: 0 } : s))
    );
  };

  // Align sticker to horizontal center and straighten
  const handleCenter = (id: string) => {
    const container = containerRef.current;
    const containerWidth = container?.clientWidth || 640;
    const targetSticker = stickers.find((s) => s.id === id);
    if (!targetSticker) return;
    const def = STICKER_REGISTRY[targetSticker.stickerId];
    const stickerWidth = (def?.width || 80) * targetSticker.scale;
    const stickerWidthPercent = (stickerWidth / containerWidth) * 100;
    const centeredX = Math.round((50 - stickerWidthPercent / 2) * 10) / 10;

    onChangeStickers(
      stickers.map((s) => (s.id === id ? { ...s, x: centeredX, rotation: 0 } : s))
    );
  };

  const handleScale = (id: string, deltaScale: number) => {
    onChangeStickers(
      stickers.map((s) =>
        s.id === id ? { ...s, scale: Math.min(Math.max(Math.round((s.scale + deltaScale) * 100) / 100, 0.4), 2.8) } : s
      )
    );
  };

  const handleDuplicate = (sticker: PlacedSticker) => {
    const newSticker: PlacedSticker = {
      ...sticker,
      id: `stk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      x: Math.min(sticker.x + 3, 90),
      y: Math.min(sticker.y + 3, 90),
      rotation: 0, // Duplicate starts straight
      zIndex: Math.max(...stickers.map((s) => s.zIndex), 1) + 1
    };
    onChangeStickers([...stickers, newSticker]);
    setSelectedId(newSticker.id);
  };

  const handleBringToFront = (id: string) => {
    const maxZ = Math.max(...stickers.map((s) => s.zIndex), 1);
    onChangeStickers(stickers.map((s) => (s.id === id ? { ...s, zIndex: maxZ + 1 } : s)));
  };

  const handleDelete = (id: string) => {
    onChangeStickers(stickers.filter((s) => s.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  // Keyboard controls for accessible nudging and deletion
  useEffect(() => {
    if (readOnly || !selectedId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
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
        handleDelete(selectedId);
      } else if (e.key === 'Escape') {
        setSelectedId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, stickers, readOnly]);

  // Click or touch anywhere outside (blank page, margins, desk, textarea) to deselect (Canva-like behavior)
  useEffect(() => {
    if (readOnly || !selectedId) return;

    const handlePointerDownOutside = (e: PointerEvent | MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // If clicked inside the currently selected sticker or its floating toolbar, do not deselect
      const activeEl = document.getElementById(`placed_${selectedId}`);
      if (activeEl && activeEl.contains(target)) {
        return;
      }

      // If clicked on another sticker, let that sticker's pointerDown handle selection
      if (target.closest && target.closest('.sticker-item')) {
        return;
      }

      // Otherwise, user clicked/touched the blank page, left/right margins, empty desk, or typing area:
      // Immediately deselect and dismiss all toolbars/outlines with zero data loss
      setSelectedId(null);
    };

    // Use capture phase to ensure it catches clicks even across textareas or layered elements
    window.addEventListener('pointerdown', handlePointerDownOutside, true);
    window.addEventListener('touchstart', handlePointerDownOutside, true);
    window.addEventListener('mousedown', handlePointerDownOutside, true);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDownOutside, true);
      window.removeEventListener('touchstart', handlePointerDownOutside, true);
      window.removeEventListener('mousedown', handlePointerDownOutside, true);
    };
  }, [selectedId, readOnly]);

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
            className={`sticker-item stk-placed ${isSelected ? 'selected' : ''}`}
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
              if (!readOnly) setSelectedId(sticker.id);
            }}
          >
            {/* Inline SVG Sticker render */}
            {def.render()}

            {/* Quick action floating toolbar when sticker is selected */}
            {isSelected && (
              <div
                className="sticker-toolbar no-export"
                role="toolbar"
                aria-label="Sticker controls"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {/* Rotate CCW */}
                <button
                  type="button"
                  className="sticker-tool-btn"
                  onClick={() => handleRotate(sticker.id, -15)}
                  title="Rotate Left (-15°)"
                  aria-label="Rotate Left"
                >
                  ↺
                </button>

                {/* Straighten (0°) */}
                <button
                  type="button"
                  className="sticker-tool-btn"
                  onClick={() => handleStraighten(sticker.id)}
                  title="Straighten (0°)"
                  aria-label="Straighten to 0 degrees"
                  style={{ fontWeight: 700, fontSize: '11px', minWidth: '22px' }}
                >
                  0°
                </button>

                {/* Rotate CW */}
                <button
                  type="button"
                  className="sticker-tool-btn"
                  onClick={() => handleRotate(sticker.id, 15)}
                  title="Rotate Right (+15°)"
                  aria-label="Rotate Right"
                >
                  ↻
                </button>

                {/* Center Horizontally */}
                <button
                  type="button"
                  className="sticker-tool-btn"
                  onClick={() => handleCenter(sticker.id)}
                  title="Center Horizontally & Straighten"
                  aria-label="Center Horizontally"
                  style={{ fontWeight: 700, fontSize: '12px' }}
                >
                  ⫿
                </button>

                {/* Scale Smaller */}
                <button
                  type="button"
                  className="sticker-tool-btn"
                  onClick={() => handleScale(sticker.id, -0.15)}
                  title="Smaller"
                  aria-label="Make sticker smaller"
                >
                  −
                </button>

                {/* Scale Bigger */}
                <button
                  type="button"
                  className="sticker-tool-btn"
                  onClick={() => handleScale(sticker.id, 0.15)}
                  title="Bigger"
                  aria-label="Make sticker bigger"
                >
                  +
                </button>

                {/* Duplicate */}
                <button
                  type="button"
                  className="sticker-tool-btn"
                  onClick={() => handleDuplicate(sticker)}
                  title="Duplicate Sticker"
                  aria-label="Duplicate Sticker"
                >
                  ⧉
                </button>

                {/* Bring to Front */}
                <button
                  type="button"
                  className="sticker-tool-btn"
                  onClick={() => handleBringToFront(sticker.id)}
                  title="Bring to Front"
                  aria-label="Bring to Front"
                >
                  ▲
                </button>

                {/* Done / Deselect Button */}
                <button
                  type="button"
                  className="sticker-tool-btn text-success fw-bold"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(null);
                  }}
                  title="Done / Deselect (✓)"
                  aria-label="Done editing"
                >
                  ✓
                </button>

                {/* Delete */}
                <button
                  type="button"
                  className="sticker-tool-btn text-danger"
                  onClick={() => handleDelete(sticker.id)}
                  title="Delete Sticker"
                  aria-label="Delete Sticker"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
