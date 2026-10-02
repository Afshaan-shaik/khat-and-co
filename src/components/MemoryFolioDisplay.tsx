import React from 'react';
import { MemoryItem } from '../types/letter';

interface MemoryFolioDisplayProps {
  items: MemoryItem[];
  onOpenPhoto: (index: number) => void;
  isRecipientView?: boolean;
}

export const MemoryFolioDisplay: React.FC<MemoryFolioDisplayProps> = ({
  items,
  onOpenPhoto,
  isRecipientView = false
}) => {
  if (!items || items.length === 0) return null;

  const count = items.length;

  return (
    <section
      className={`folio-letter-section memory-folio-display count-${count} ${isRecipientView ? 'recipient-view' : ''}`}
      aria-label="Memory Folio — Photographs with this letter"
      data-testid="memory-folio-display"
    >
      <div className="folio-letter-divider">
        <span className="folio-divider-line" />
        <span className="folio-divider-label">
          <span className="folio-divider-symbol">✦</span>
          <span>Photographic Keepsake</span>
          <span className="folio-divider-symbol">✦</span>
        </span>
        <span className="folio-divider-line" />
      </div>

      {/* Responsive Layout Grid (Diptych, Triptych, or Single Large Print) */}
      <div className={`folio-display-grid layout-${count}`}>
        {items.map((item, idx) => (
          <figure
            key={item.id}
            className={`folio-display-item item-${idx + 1}`}
            onClick={() => onOpenPhoto(idx)}
            role="button"
            tabIndex={0}
            aria-label={`View photo ${idx + 1} fullscreen: ${item.caption || item.originalFilename || 'Memory'}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onOpenPhoto(idx);
            }}
          >
            <div className="folio-display-frame">
              <img
                src={item.previewUrl || item.originalUrl}
                alt={item.caption || item.originalFilename || `Photograph ${idx + 1}`}
                className="folio-display-img"
                style={{
                  objectPosition:
                    item.focalX !== undefined && item.focalY !== undefined
                      ? `${item.focalX}% ${item.focalY}%`
                      : item.focalPoint || 'center'
                }}
                loading="lazy"
              />
              <div className="folio-display-hover-hint">
                <span>⤢ Enlarge</span>
              </div>
            </div>

            {/* Subtle Handwritten Notation / Date Stamp */}
            {(item.caption || item.memoryDate || item.memoryTitle) && (
              <figcaption className="folio-display-caption">
                {item.memoryDate && (
                  <time className="folio-display-date">{item.memoryDate}</time>
                )}
                {item.caption && (
                  <p className="folio-display-note memory-stamp-caption font-handwriting">
                    {item.caption}
                  </p>
                )}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  );
};
