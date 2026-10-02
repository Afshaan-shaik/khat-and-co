import React, { useState, useRef } from 'react';
import { MemoryFolioData, MemoryItem, MemoryFocalPoint } from '../types/letter';
import { uploadPhotograph, deleteMemoryItem } from '../services/memoryStorage';
import { getOrCreateWorkspaceSession } from '../services/session';
import { sfx } from '../utils/sound';

interface MemoryFolioProps {
  isOpen: boolean;
  onClose: () => void;
  folio?: MemoryFolioData;
  onUpdateFolio: (updated: MemoryFolioData) => void;
  onViewPhoto: (photoIndex: number) => void;
  showToast: (msg: string) => void;
}

export const MemoryFolio: React.FC<MemoryFolioProps> = ({
  isOpen,
  onClose,
  folio,
  onUpdateFolio,
  onViewPhoto,
  showToast
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  if (!isOpen) return null;

  const { session } = getOrCreateWorkspaceSession();
  const currentItems = folio?.items || [];
  const includeInLetter = Boolean(folio?.includeInLetter);

  // Helper to ensure a folio object exists
  const getEnsuredFolio = (): MemoryFolioData => {
    if (folio) return folio;
    return {
      id: `folio_${Date.now()}`,
      workspaceSessionId: session.id,
      items: [],
      includeInLetter: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  const handleToggleInclude = () => {
    const base = getEnsuredFolio();
    const updated: MemoryFolioData = {
      ...base,
      includeInLetter: !includeInLetter,
      updatedAt: new Date().toISOString()
    };
    onUpdateFolio(updated);
    sfx.snap();
    showToast(
      !includeInLetter
        ? '✦ Memory Folio will be included in the sealed letter'
        : '🔒 Memory Folio set to private (will not be shared)'
    );
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (currentItems.length >= 3) {
      showToast('Maximum 3 photographs allowed per Memory Folio.');
      return;
    }

    const file = files[0];
    setIsUploading(true);
    setUploadProgress(5);
    setUploadError(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      sfx.rustle();
      const uploadedItem = await uploadPhotograph(file, {
        onProgress: (p) => setUploadProgress(p),
        signal: controller.signal
      });

      const base = getEnsuredFolio();
      const updatedItems = [...base.items, uploadedItem];
      const updatedFolio: MemoryFolioData = {
        ...base,
        items: updatedItems,
        updatedAt: new Date().toISOString()
      };

      onUpdateFolio(updatedFolio);
      setIsUploading(false);
      setUploadProgress(0);
      sfx.snap();
      showToast(
        uploadedItem.is4K
          ? '✦ 4K Ultra HD photograph preserved and added to folio'
          : '✦ Photograph preserved and added to folio'
      );
    } catch (err: any) {
      if (err.message === 'Upload cancelled') {
        showToast('Upload cancelled.');
      } else {
        console.error('Photo upload error:', err);
        setUploadError(err.message || 'Failed to upload photograph');
        showToast(err.message || 'Failed to upload photograph');
      }
      setIsUploading(false);
      setUploadProgress(0);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsUploading(false);
    setUploadProgress(0);
    setUploadError(null);
  };

  const handleRemovePhoto = async (index: number) => {
    const item = currentItems[index];
    if (!item) return;

    sfx.scratch();
    const base = getEnsuredFolio();
    const updatedItems = base.items.filter((_, i) => i !== index);
    const updatedFolio: MemoryFolioData = {
      ...base,
      items: updatedItems,
      updatedAt: new Date().toISOString()
    };

    onUpdateFolio(updatedFolio);
    deleteMemoryItem(item.id).catch(() => {});
    showToast('Photograph removed from folio.');
  };

  const handleUpdateItemMetadata = (index: number, updates: Partial<MemoryItem>) => {
    const base = getEnsuredFolio();
    const updatedItems = [...base.items];
    if (!updatedItems[index]) return;

    updatedItems[index] = {
      ...updatedItems[index],
      ...updates
    };

    const updatedFolio: MemoryFolioData = {
      ...base,
      items: updatedItems,
      updatedAt: new Date().toISOString()
    };

    onUpdateFolio(updatedFolio);
  };

  return (
    <div
      className="folio-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Memory Folio — Keep a few moments with this letter"
      onClick={onClose}
    >
      <div
        className="folio-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Folio Modal Header */}
        <div className="folio-header">
          <div className="folio-title-area">
            <span className="folio-kicker">Photographic Keepsake</span>
            <h2 className="folio-heading">Memory Folio</h2>
            <p className="folio-microcopy">“A few moments worth keeping.”</p>
          </div>
          <button
            type="button"
            className="folio-close-btn"
            onClick={() => {
              sfx.snap();
              onClose();
            }}
            aria-label="Close Memory Folio"
          >
            ×
          </button>
        </div>

        {/* Privacy & Sharing Controlled Bar (Part 8 & 9) */}
        <div className="folio-privacy-card">
          <div className="folio-privacy-info">
            <div className="folio-privacy-status">
              <span className={`folio-privacy-dot ${includeInLetter ? 'shared' : 'private'}`} />
              <strong className="folio-privacy-label">
                {includeInLetter ? 'Included in Letter' : 'Private Workspace Keepsake'}
              </strong>
            </div>
            <p className="folio-privacy-explainer">
              {includeInLetter
                ? 'These photographs will be tucked into the envelope for your recipient.'
                : 'Private by default. Unseen by recipient unless toggled on.'}
            </p>
          </div>

          <label className="folio-toggle-label">
            <input
              type="checkbox"
              id="folio-include-shared"
              data-testid="folio-include-shared"
              className="folio-toggle-input"
              checked={includeInLetter}
              onChange={handleToggleInclude}
            />
            <span className="folio-toggle-slider" />
            <span className="folio-toggle-text">
              {includeInLetter ? 'Include with Letter' : 'Keep Private'}
            </span>
          </label>
        </div>

        {/* Collection Size Counter */}
        <div className="folio-counter-row">
          <span className="folio-counter-text">
            Collection: <strong>{currentItems.length} of 3</strong> photographs
          </span>
          <span className="folio-fidelity-badge">
            ✦ 4K Originals Preserved
          </span>
        </div>

        {/* Photo Gallery Grid */}
        <div className="folio-gallery-grid">
          {currentItems.map((item, idx) => {
            return (
              <div key={item.id} className="folio-photo-card" data-testid={`memory-card-${idx}`}>
                {/* Visual Thumbnail */}
                <div
                  className="folio-thumb-wrap"
                  onClick={() => onViewPhoto(idx)}
                  title="Click to view fullscreen in original fidelity"
                >
                  <img
                    src={item.previewUrl || item.originalUrl}
                    alt={item.caption || item.originalFilename || 'Memory photograph'}
                    className="folio-thumb-img"
                    style={{ objectPosition: item.focalPoint || 'center' }}
                    loading="lazy"
                  />
                  <div className="folio-thumb-overlay">
                    <span className="folio-view-icon">⤢ View Fullscreen</span>
                  </div>

                  {item.is4K && (
                    <span className="folio-4k-chip" title="Ultra HD 4K source preserved">
                      4K Ultra HD
                    </span>
                  )}
                </div>

                {/* Card Details & Metadata */}
                <div className="folio-card-body">
                  <div className="folio-meta-header">
                    <span className="folio-photo-num">Moment 0{idx + 1}</span>
                    <button
                      type="button"
                      className="folio-remove-btn"
                      onClick={() => handleRemovePhoto(idx)}
                      aria-label={`Remove photo ${idx + 1}`}
                      title="Remove from folio"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Optional Date Stamp */}
                  <div className="folio-input-group">
                    <label className="folio-input-label" htmlFor={`folio-date-${item.id}`}>
                      Date Stamp
                    </label>
                    <input
                      id={`folio-date-${item.id}`}
                      type="text"
                      className="folio-text-input"
                      placeholder="e.g. 14 October 2026"
                      value={item.memoryDate || ''}
                      onChange={(e) =>
                        handleUpdateItemMetadata(idx, { memoryDate: e.target.value })
                      }
                    />
                  </div>

                  {/* Optional Handwritten Caption */}
                  <div className="folio-input-group">
                    <label className="folio-input-label" htmlFor={`folio-cap-${item.id}`}>
                      Caption
                    </label>
                    <input
                      id={`folio-cap-${item.id}`}
                      type="text"
                      className="folio-text-input font-handwriting"
                      placeholder="“That evening by the sea.”"
                      value={item.caption || ''}
                      onChange={(e) =>
                        handleUpdateItemMetadata(idx, { caption: e.target.value })
                      }
                    />
                  </div>

                  {/* Focal Point Selector (Non-destructive display framing) */}
                  <div className="folio-focal-row">
                    <span className="folio-input-label">Focal Point:</span>
                    <div className="folio-focal-pills">
                      {(['center', 'top', 'bottom', 'face'] as MemoryFocalPoint[]).map((fp) => (
                        <button
                          key={fp}
                          type="button"
                          className={`folio-focal-pill ${item.focalPoint === fp ? 'active' : ''}`}
                          onClick={() => handleUpdateItemMetadata(idx, { focalPoint: fp })}
                        >
                          {fp.charAt(0).toUpperCase() + fp.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tech specs readout */}
                  <div className="folio-specs">
                    <span>
                      {item.width} × {item.height}px
                    </span>
                    <span>·</span>
                    <span>
                      {item.byteSize
                        ? `${(item.byteSize / (1024 * 1024)).toFixed(1)} MB`
                        : 'Source'}
                    </span>
                    <span>·</span>
                    <span>{item.orientation}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Upload Dropzone / Add Button (if under 3 items) */}
          {currentItems.length < 3 && !isUploading && (
            <div
              className={`folio-dropzone ${isDragging ? 'dragging' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFileSelect(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
              }}
            >
              <div className="folio-dropzone-inner">
                <div className="folio-dropzone-icon">✦</div>
                <h3 className="folio-dropzone-title">Add a photograph</h3>
                <p className="folio-dropzone-hint">
                  Drop high-resolution photograph here, or browse.
                </p>
                <span className="folio-dropzone-types">
                  JPEG · PNG · WebP · 4K Supported
                </span>
              </div>
            </div>
          )}

          {/* Active Uploading Card */}
          {isUploading && (
            <div className="folio-uploading-card">
              <div className="folio-spinner" />
              <div className="folio-upload-status">
                <span className="folio-upload-text">Preserving photograph at full resolution...</span>
                <div className="folio-progress-bar">
                  <div
                    className="folio-progress-fill"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="folio-upload-pct">{uploadProgress}%</span>
              </div>
              <button
                type="button"
                className="btn ghost sm"
                onClick={handleCancelUpload}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {uploadError && (
          <div className="folio-error-banner" role="alert">
            <span>{uploadError}</span>
            <button
              type="button"
              className="folio-error-close"
              onClick={() => setUploadError(null)}
            >
              ×
            </button>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          style={{ display: 'none' }}
          onChange={(e) => handleFileSelect(e.target.files)}
        />

        {/* Footer Info */}
        <div className="folio-modal-footer">
          <p className="folio-footer-note">
            Original 4K photographs are preserved untouched without downscaling. Display derivatives
            ensure fast letter rendering while keeping original quality intact.
          </p>
          <button
            type="button"
            className="btn cta sm"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
