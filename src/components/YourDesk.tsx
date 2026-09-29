import React, { useState, useEffect } from 'react';
import { LetterData } from '../types/letter';


interface YourDeskProps {
  isOpen: boolean;
  onClose: () => void;
  letter: LetterData;
  onEditDraft: () => void;
  onPreviewEnvelope: () => void;
  onOpenSealedUntilFuture: () => void;
  onOpenTimeCapsule: () => void;
}

function getFirstLine(body: string): string {
  const line = body.trim().split('\n').find(l => l.trim().length > 0) || '';
  return line.length > 60 ? line.slice(0, 60) + '…' : line;
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'var(--gold)',
  sent: 'var(--rose)',
  scheduled: 'var(--airmail-blue)',
  sealed: '#8A6D4A',
  capsule: '#6B7A5E',
};

export const YourDesk: React.FC<YourDeskProps> = ({
  isOpen,
  onClose,
  letter,
  onEditDraft,
  onPreviewEnvelope,
  onOpenSealedUntilFuture,
  onOpenTimeCapsule,
}) => {
  const [activeTab, setActiveTab] = useState<'drafts' | 'sealed' | 'capsules'>('drafts');
  const [sealedCount, setSealedCount] = useState(0);
  const [capsuleCount, setCapsuleCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Count items from localStorage
      try {
        const sc = JSON.parse(localStorage.getItem('khat-and-co:sealed-letters') || '[]').length;
        const cc = JSON.parse(localStorage.getItem('khat-and-co:time-capsules') || '[]').length;
        setSealedCount(sc);
        setCapsuleCount(cc);
      } catch { /* ignore */ }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const hasDraftContent = letter.body.trim().length > 0;

  return (
    <div
      className="desk-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Your Desk"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="desk-modal-panel">
        <div className="desk-modal-header">
          <div>
            <h2 className="desk-modal-title">Your Desk</h2>
            <p className="desk-modal-subtitle">Your letters, in one quiet place.</p>
          </div>
          <button type="button" className="btn-khat-secondary btn-icon-only" onClick={onClose} aria-label="Close Your Desk">
            ✕
          </button>
        </div>

        {/* Tab navigation */}
        <div className="desk-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'drafts'}
            className={`desk-tab-btn ${activeTab === 'drafts' ? 'active' : ''}`}
            onClick={() => setActiveTab('drafts')}
          >
            Drafts
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'sealed'}
            className={`desk-tab-btn ${activeTab === 'sealed' ? 'active' : ''}`}
            onClick={() => setActiveTab('sealed')}
          >
            Sealed Until Future
            {sealedCount > 0 && <span className="desk-tab-count">{sealedCount}</span>}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'capsules'}
            className={`desk-tab-btn ${activeTab === 'capsules' ? 'active' : ''}`}
            onClick={() => setActiveTab('capsules')}
          >
            Time Capsules
            {capsuleCount > 0 && <span className="desk-tab-count">{capsuleCount}</span>}
          </button>
        </div>

        {/* Tab content */}
        <div className="desk-body">
          {activeTab === 'drafts' && (
            <div role="tabpanel" aria-label="Drafts">
              {hasDraftContent ? (
                <div className="desk-letter-row">
                  <div className="desk-letter-status-dot" style={{ background: STATUS_COLORS['draft'] }} aria-hidden="true" />
                  <div className="desk-letter-info">
                    <span className="desk-letter-recipient">{letter.recipient}</span>
                    <span className="desk-letter-firstline">{getFirstLine(letter.body)}</span>
                    <span className="desk-letter-date">{letter.date}</span>
                  </div>
                  <div className="desk-letter-status-label" style={{ color: STATUS_COLORS['draft'] }}>
                    Draft
                  </div>
                  <div className="desk-letter-actions">
                    <button
                      type="button"
                      className="desk-action-btn"
                      onClick={() => { onEditDraft(); onClose(); }}
                      title="Continue editing this letter"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="desk-action-btn"
                      onClick={() => { onPreviewEnvelope(); onClose(); }}
                      title="Preview as your reader will see it"
                    >
                      Preview
                    </button>
                  </div>
                </div>
              ) : (
                <div className="desk-empty-state">
                  <p className="desk-empty-text">No drafts yet.</p>
                  <p className="desk-empty-hint">Begin writing a letter to see it here.</p>
                  <button
                    type="button"
                    className="btn-khat-secondary"
                    onClick={() => { onEditDraft(); onClose(); }}
                  >
                    Start Writing
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'sealed' && (
            <div role="tabpanel" aria-label="Sealed Until Future letters">
              {sealedCount > 0 ? (
                <div className="desk-feature-link-row">
                  <div className="desk-feature-link-info">
                    <span className="desk-feature-link-label">Sealed Until Future</span>
                    <span className="desk-feature-link-count">{sealedCount} letter{sealedCount !== 1 ? 's' : ''} sealed</span>
                  </div>
                  <button
                    type="button"
                    className="btn-khat-secondary"
                    onClick={() => { onOpenSealedUntilFuture(); onClose(); }}
                  >
                    Open
                  </button>
                </div>
              ) : (
                <div className="desk-empty-state">
                  <p className="desk-empty-text">No sealed letters.</p>
                  <p className="desk-empty-hint">Write something today that can only be opened on a chosen future date.</p>
                  <button
                    type="button"
                    className="btn-khat-secondary"
                    onClick={() => { onOpenSealedUntilFuture(); onClose(); }}
                  >
                    Seal a Letter
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'capsules' && (
            <div role="tabpanel" aria-label="Time Capsules">
              {capsuleCount > 0 ? (
                <div className="desk-feature-link-row">
                  <div className="desk-feature-link-info">
                    <span className="desk-feature-link-label">Letter Time Capsules</span>
                    <span className="desk-feature-link-count">{capsuleCount} capsule{capsuleCount !== 1 ? 's' : ''} preserved</span>
                  </div>
                  <button
                    type="button"
                    className="btn-khat-secondary"
                    onClick={() => { onOpenTimeCapsule(); onClose(); }}
                  >
                    Open
                  </button>
                </div>
              ) : (
                <div className="desk-empty-state">
                  <p className="desk-empty-text">No time capsules yet.</p>
                  <p className="desk-empty-hint">Preserve a letter for a birthday, anniversary, or a year from now.</p>
                  <button
                    type="button"
                    className="btn-khat-secondary"
                    onClick={() => { onOpenTimeCapsule(); onClose(); }}
                  >
                    Create a Capsule
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
