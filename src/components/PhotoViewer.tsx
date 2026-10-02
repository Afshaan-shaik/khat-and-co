import React, { useState, useEffect, useCallback } from 'react';
import { MemoryItem } from '../types/letter';
import { sfx } from '../utils/sound';

interface PhotoViewerProps {
  isOpen: boolean;
  onClose: () => void;
  items: MemoryItem[];
  initialIndex?: number;
  theme?: 'dark' | 'light';
}

export const PhotoViewer: React.FC<PhotoViewerProps> = ({
  isOpen,
  onClose,
  items,
  initialIndex = 0,
  theme = 'dark'
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, [initialIndex, isOpen]);

  const currentItem = items[currentIndex];

  const handleNext = useCallback(() => {
    if (items.length <= 1) return;
    sfx.rustle();
    setCurrentIndex((prev) => (prev + 1) % items.length);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, [items.length]);

  const handlePrev = useCallback(() => {
    if (items.length <= 1) return;
    sfx.rustle();
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, [items.length]);

  // Keyboard navigation: Escape to close, Left/Right arrows for next/prev
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === '+' || e.key === '=') {
        setZoomLevel((z) => Math.min(3.5, z + 0.25));
      } else if (e.key === '-') {
        setZoomLevel((z) => {
          const next = Math.max(1, z - 0.25);
          if (next === 1) setPanOffset({ x: 0, y: 0 });
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleNext, handlePrev]);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoomLevel((z) => Math.min(3.5, Number((z + 0.2).toFixed(2))));
    } else {
      setZoomLevel((z) => {
        const next = Math.max(1, Number((z - 0.2).toFixed(2)));
        if (next === 1) setPanOffset({ x: 0, y: 0 });
        return next;
      });
    }
  };

  // Pointer panning when zoomed in
  const handlePointerDown = (e: React.PointerEvent) => {
    if (zoomLevel > 1) {
      setIsPanning(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPanning && zoomLevel > 1) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handlePointerUp = () => {
    setIsPanning(false);
  };

  const handleDownloadOriginal = () => {
    if (!currentItem) return;
    const downloadUrl = currentItem.originalUrl || currentItem.previewUrl;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = currentItem.originalFilename || `memory-original-${currentIndex + 1}.jpg`;
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) document.body.removeChild(link);
    }, 1000);
    sfx.snap();
  };

  if (!isOpen || !currentItem) return null;

  return (
    <div
      className={`photo-viewer-backdrop theme-${theme}`}
      role="dialog"
      aria-modal="true"
      aria-label="Fullscreen Photograph Viewer"
      onClick={onClose}
      onWheel={handleWheel}
    >
      {/* Top Bar Controls */}
      <div className="viewer-top-bar" onClick={(e) => e.stopPropagation()}>
        <div className="viewer-counter">
          {items.length > 1 ? `${currentIndex + 1} / ${items.length}` : '1 / 1'}
          {currentItem.is4K && <span className="viewer-4k-badge">4K Ultra HD</span>}
        </div>

        <div className="viewer-actions">
          {/* Zoom Out */}
          <button
            type="button"
            className="viewer-btn"
            onClick={() => {
              setZoomLevel((z) => {
                const next = Math.max(1, z - 0.25);
                if (next === 1) setPanOffset({ x: 0, y: 0 });
                return next;
              });
            }}
            disabled={zoomLevel <= 1}
            aria-label="Zoom out"
            title="Zoom out (-)"
          >
            −
          </button>

          {/* Zoom Level Indicator */}
          <span className="viewer-zoom-text">{Math.round(zoomLevel * 100)}%</span>

          {/* Zoom In */}
          <button
            type="button"
            className="viewer-btn"
            onClick={() => setZoomLevel((z) => Math.min(3.5, z + 0.25))}
            disabled={zoomLevel >= 3.5}
            aria-label="Zoom in"
            title="Zoom in (+)"
          >
            +
          </button>

          {/* Download Original 4K */}
          <button
            type="button"
            className="viewer-btn"
            onClick={handleDownloadOriginal}
            aria-label="Download original uncompressed photograph"
            title="Download original photograph"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>

          {/* Close Button */}
          <button
            type="button"
            className="viewer-btn viewer-close-btn"
            onClick={onClose}
            aria-label="Close viewer"
            title="Close viewer (Esc)"
          >
            ×
          </button>
        </div>
      </div>

      {/* Main Stage Image */}
      <div
        className="viewer-stage"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <img
          src={currentItem.originalUrl || currentItem.previewUrl}
          alt={currentItem.caption || currentItem.originalFilename || 'Memory photograph'}
          className={`viewer-photo viewer-img ${zoomLevel > 1 ? 'zoomed' : ''}`}
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
            cursor: zoomLevel > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default'
          }}
          draggable={false}
        />
      </div>

      {/* Left Navigation Arrow */}
      {items.length > 1 && (
        <button
          type="button"
          className="viewer-nav-arrow viewer-nav-prev"
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          aria-label="Previous photograph"
          title="Previous (Left Arrow)"
        >
          ‹
        </button>
      )}

      {/* Right Navigation Arrow */}
      {items.length > 1 && (
        <button
          type="button"
          className="viewer-nav-arrow viewer-nav-next"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          aria-label="Next photograph"
          title="Next (Right Arrow)"
        >
          ›
        </button>
      )}

      {/* Bottom Metadata Bar */}
      {(currentItem.caption || currentItem.memoryDate || currentItem.memoryTitle) && (
        <div className="viewer-bottom-bar" onClick={(e) => e.stopPropagation()}>
          {currentItem.memoryTitle && (
            <span className="viewer-memory-title">{currentItem.memoryTitle}</span>
          )}
          {currentItem.memoryDate && (
            <span className="viewer-memory-date">{currentItem.memoryDate}</span>
          )}
          {currentItem.caption && (
            <p className="viewer-memory-caption font-handwriting">
              {currentItem.caption}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
