import React, { useState } from 'react';
import { WEEKLY_PROMPTS } from '../constants/prompts';

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PromptModal: React.FC<PromptModalProps> = ({ isOpen, onClose }) => {
  const [promptIndex, setPromptIndex] = useState(0);

  if (!isOpen) return null;

  const currentPrompt = WEEKLY_PROMPTS[promptIndex % WEEKLY_PROMPTS.length];

  const handleNextPrompt = () => {
    setPromptIndex((prev) => (prev + 1) % WEEKLY_PROMPTS.length);
  };

  return (
    <div
      className="envelope-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="prompt-modal-title"
      onClick={onClose}
    >
      <div
        className="controls-card p-4 p-md-5"
        style={{ maxWidth: '540px', width: '100%', position: 'relative' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center gap-2">
            <span
              className="badge"
              style={{
                backgroundColor: 'rgba(180, 69, 90, 0.15)',
                color: 'var(--rose)',
                fontSize: '12px',
                padding: '6px 12px'
              }}
            >
              {currentPrompt.theme}
            </span>
            <span className="small text-muted font-kalam">खत के विचार</span>
          </div>
          <button
            type="button"
            className="btn-close"
            aria-label="Close prompts dialog"
            onClick={onClose}
          />
        </div>

        {/* English Prompt */}
        <div className="mb-4">
          <p
            id="prompt-modal-title"
            className="fs-4 fw-normal lh-base mb-2"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--ui-text)' }}
          >
            "{currentPrompt.english}"
          </p>
        </div>

        {/* Hindi Prompt */}
        <div
          className="p-3 rounded-3 mb-4"
          style={{
            backgroundColor: 'var(--ui-btn-secondary-bg)',
            borderLeft: '3px solid var(--rose)'
          }}
        >
          <p
            className="m-0 fs-5 lh-base font-kalam"
            style={{ color: 'var(--ui-text)' }}
          >
            "{currentPrompt.hindi}"
          </p>
        </div>

        <p className="small text-muted mb-4" style={{ fontSize: '12.5px' }}>
          * This prompt is only for your creative inspiration. Khat &amp; Co. will never insert or alter any text in your letter.
        </p>

        {/* Actions */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <button
            type="button"
            className="btn-khat-secondary"
            onClick={handleNextPrompt}
            aria-label="Show another weekly prompt"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            <span>Another Prompt (अगला विचार)</span>
          </button>

          <button
            type="button"
            className="btn-khat-primary"
            onClick={onClose}
          >
            Write My Letter
          </button>
        </div>
      </div>
    </div>
  );
};
