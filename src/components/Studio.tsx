import React, { useRef, useState } from 'react';
import { LetterData, PaperTemplate, FontOption, WaxSealData } from '../types/letter';
import { LetterEditor } from './LetterEditor';
import { TemplatePicker } from './TemplatePicker';
import { FontPicker } from './FontPicker';
import { StickerDrawer } from './StickerDrawer';
import { WaxSealPicker, WaxSealSVG } from './WaxSealPicker';
import { resolveWaxSeal } from '../constants/waxSeal';
import { VoiceWizard } from './VoiceWizard';
import { InspireMe } from './InspireMe';
import { PAPER_TEMPLATES } from '../constants/templates';
import { StickerDefinition } from '../constants/stickers';

interface StudioProps {
  isOpen: boolean;
  onClose: () => void;
  letter: LetterData;
  onChangeLetter: (fields: Partial<LetterData>) => void;
  onSelectTemplate: (tmpl: PaperTemplate) => void;
  onSelectFont: (font: FontOption) => void;
  onSelectInk: (inkHex: string) => void;
  onToggleRuledLines: () => void;
  onAddSticker: (def: StickerDefinition) => void;
  sealData?: WaxSealData;
  onChangeSeal: (seal: WaxSealData) => void;
  onPreviewEnvelope: () => void;
  onShareLink: () => void;
  onSavePicture: () => void;
  isExporting?: boolean;
}

export const Studio: React.FC<StudioProps> = ({
  isOpen,
  onClose,
  letter,
  onChangeLetter,
  onSelectTemplate,
  onSelectFont,
  onSelectInk,
  onToggleRuledLines,
  onAddSticker,
  sealData,
  onChangeSeal,
  onPreviewEnvelope,
  onShareLink,
  onSavePicture,
  isExporting = false,
}) => {
  const [previewMode, setPreviewMode] = useState<'paper' | 'envelope'>('paper');
  const letterSheetRef = useRef<HTMLDivElement>(null);
  const currentTemplate = PAPER_TEMPLATES.find(t => t.id === letter.templateId) || PAPER_TEMPLATES[0];

  const currentSeal = resolveWaxSeal(letter.waxSeal || sealData);

  const handleUsePrompt = (prompt: string) => {
    const current = letter.body;
    const addition = current.trim() ? `\n\n${prompt}` : prompt;
    onChangeLetter({ body: current + addition });
  };

  const handleSealChange = (newSeal: WaxSealData) => {
    onChangeSeal(newSeal);
    onChangeLetter({ waxSeal: newSeal });
  };

  if (!isOpen) return null;

  return (
    <div
      className="studio-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Studio — Create your letter, your way"
    >
      {/* Studio Header */}
      <div className="studio-header">
        <button
          type="button"
          className="studio-back-btn"
          onClick={onClose}
          aria-label="Close Studio and return to editor"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          <span>Studio</span>
        </button>
        <div className="studio-title-block">
          <span className="studio-title">Studio</span>
          <span className="studio-subtitle">Create your letter, your way.</span>
        </div>
        <div className="studio-header-actions">
          <button
            type="button"
            className="btn-khat-secondary studio-action-btn"
            onClick={onPreviewEnvelope}
            title="Preview as your reader will see it"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z" />
              <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10" />
            </svg>
            <span className="d-none d-sm-inline">Preview</span>
          </button>
          <button
            type="button"
            className="btn-khat-secondary studio-action-btn"
            onClick={onSavePicture}
            disabled={isExporting}
            title="Save as picture"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span className="d-none d-sm-inline">{isExporting ? 'Saving...' : 'Save'}</span>
          </button>
          <button
            type="button"
            className="btn-khat-primary studio-action-btn"
            onClick={onShareLink}
            title="Copy share link"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span className="d-none d-sm-inline">Send</span>
          </button>
        </div>
      </div>

      {/* Studio Body — three-column on desktop, vertical on mobile */}
      <div className="studio-body">

        {/* ── LEFT: Contextual controls (Desktop) / Accordion (Mobile) ── */}
        <aside className="studio-left-panel" aria-label="Letter customisation controls">

          {/* Paper */}
          <details className="studio-accordion" open>
            <summary className="studio-accordion-summary">
              <span className="studio-acc-label">Paper</span>
              <svg className="studio-acc-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M2 4l4 4 4-4" />
              </svg>
            </summary>
            <div className="studio-accordion-body">
              <TemplatePicker
                selectedTemplateId={letter.templateId}
                onSelectTemplate={onSelectTemplate}
              />
            </div>
          </details>

          {/* Font & Ink */}
          <details className="studio-accordion" open>
            <summary className="studio-accordion-summary">
              <span className="studio-acc-label">Handwriting & Ink</span>
              <svg className="studio-acc-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M2 4l4 4 4-4" />
              </svg>
            </summary>
            <div className="studio-accordion-body">
              <FontPicker
                selectedFontId={letter.fontId}
                onSelectFont={onSelectFont}
                selectedInk={letter.inkColor}
                onSelectInk={onSelectInk}
                isDarkPaper={currentTemplate.isDarkPaper}
                ruledLines={letter.ruledLines}
                onToggleRuledLines={onToggleRuledLines}
              />
            </div>
          </details>

          {/* Wax Seal */}
          <details
            className="studio-accordion"
            onToggle={(e) => {
              if ((e.currentTarget as HTMLDetailsElement).open) {
                setPreviewMode('envelope');
              }
            }}
          >
            <summary className="studio-accordion-summary">
              <span className="studio-acc-label">Wax Seal</span>
              <svg className="studio-acc-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M2 4l4 4 4-4" />
              </svg>
            </summary>
            <div className="studio-accordion-body">
              <WaxSealPicker sealData={currentSeal} onChangeSeal={handleSealChange} />
            </div>
          </details>

          {/* Stickers */}
          <details className="studio-accordion">
            <summary className="studio-accordion-summary">
              <span className="studio-acc-label">Stickers & Stamps</span>
              <svg className="studio-acc-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M2 4l4 4 4-4" />
              </svg>
            </summary>
            <div className="studio-accordion-body studio-stickers-body">
              <StickerDrawer
                onAddSticker={onAddSticker}
                stickerCount={letter.stickers.length}
                inlineSidebar
              />
            </div>
          </details>

          {/* Voice */}
          <details className="studio-accordion">
            <summary className="studio-accordion-summary">
              <span className="studio-acc-label">Voice Note</span>
              <svg className="studio-acc-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M2 4l4 4 4-4" />
              </svg>
            </summary>
            <div className="studio-accordion-body">
              <VoiceWizard
                isOpen={true}
                onAttach={() => {/* Future: attach to letter metadata */}}
              />
            </div>
          </details>

        </aside>

        {/* ── CENTER: Large writing canvas ── */}
        <main className="studio-center-canvas" aria-label="Letter writing area">
          {/* Inspire Me — contextual near the editor */}
          <div className="studio-inspire-row">
            <InspireMe onUsePrompt={handleUsePrompt} />
          </div>

          <LetterEditor
            letter={letter}
            onChangeLetter={onChangeLetter}
            letterSheetRef={letterSheetRef}
          />
        </main>

        {/* ── RIGHT: Live preview panel (desktop only) ── */}
        <aside className="studio-right-panel d-none d-xl-flex" aria-label="Live letter preview">
          <div className="studio-preview-header-row d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom">
            <div className="studio-preview-label m-0 p-0 border-0">
              <span>Preview</span>
            </div>
            <div className="studio-preview-toggle-btns" role="tablist" aria-label="Preview view">
              <button
                type="button"
                className={`studio-preview-tab-btn ${previewMode === 'paper' ? 'active' : ''}`}
                onClick={() => setPreviewMode('paper')}
                title="Preview letter sheet"
                role="tab"
                aria-selected={previewMode === 'paper'}
              >
                Paper
              </button>
              <button
                type="button"
                className={`studio-preview-tab-btn ${previewMode === 'envelope' ? 'active' : ''}`}
                onClick={() => setPreviewMode('envelope')}
                title="Preview sealed envelope"
                role="tab"
                aria-selected={previewMode === 'envelope'}
              >
                Envelope
              </button>
            </div>
          </div>

          {previewMode === 'paper' ? (
            <div className="studio-preview-inner">
              <LetterEditor
                letter={letter}
                onChangeLetter={() => {}}
                letterSheetRef={{ current: null } as React.RefObject<HTMLDivElement>}
                readOnly={true}
              />
            </div>
          ) : (
            <div className="studio-preview-envelope-wrap" data-testid="studio-envelope-preview" style={{ padding: '8px 0' }}>
              <div
                className="envelope-card env-envelope"
                style={{
                  maxWidth: '100%',
                  width: '100%',
                  minHeight: '270px',
                  boxShadow: '0 12px 36px rgba(0,0,0,0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Airmail dashed frame */}
                <div className="envelope-airmail-frame" />

                {/* Postal Stamp & Postmark */}
                <div
                  style={{
                    position: 'absolute',
                    top: '14px',
                    right: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <div style={{ width: '40px', height: '40px', opacity: 0.85 }}>
                    <svg viewBox="0 0 84 84" width="100%" height="100%" fill="none">
                      <circle cx="42" cy="42" r="38" stroke="#1F2340" strokeWidth="2" opacity="0.85" />
                      <circle cx="42" cy="42" r="32" stroke="#1F2340" strokeWidth="1.2" strokeDasharray="4 2" />
                      <text x="42" y="24" textAnchor="middle" fill="#1F2340" fontSize="7" fontFamily="'Instrument Sans', sans-serif" fontWeight="700">
                        AIR MAIL
                      </text>
                      <text x="42" y="46" textAnchor="middle" fill="#B4455A" fontSize="8" fontFamily="'Instrument Sans', sans-serif" fontWeight="700">
                        SPECIAL
                      </text>
                    </svg>
                  </div>
                  <div style={{ width: '36px', height: '44px', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
                    <svg viewBox="0 0 64 76" width="100%" height="100%" fill="none">
                      <rect x="2" y="2" width="60" height="72" rx="2" fill="#F6EFE3" stroke="#3E5C8A" strokeWidth="2" strokeDasharray="3 3" />
                      <rect x="6" y="6" width="52" height="64" fill="#EAF0F8" stroke="#3E5C8A" strokeWidth="1.5" />
                      <path d="M22 36 C24 30 30 26 38 28 C42 29 46 27 48 24 C46 30 43 33 40 34 C44 38 41 44 34 44 C28 44 24 40 22 36 Z" fill="#FFFFFF" stroke="#3E5C8A" strokeWidth="1.5" />
                      <text x="32" y="58" textAnchor="middle" fill="#3E5C8A" fontSize="7" fontFamily="'Instrument Sans', sans-serif" fontWeight="700">
                        KHATH &amp; CO
                      </text>
                    </svg>
                  </div>
                </div>

                {/* Handwritten Addressed Text */}
                <div
                  className="text-start"
                  style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '18px',
                    zIndex: 20,
                    fontFamily: "'Kalam', 'Caveat', cursive",
                    color: '#1F2340',
                    maxWidth: '55%',
                    pointerEvents: 'none'
                  }}
                >
                  <div className="small text-muted font-sans text-uppercase fw-bold" style={{ fontSize: '10px', letterSpacing: '1px', opacity: 0.75, marginBottom: '2px' }}>
                    TO:
                  </div>
                  <div className="fw-bold lh-1 mb-1" style={{ fontSize: '18px', color: '#1F2340', wordBreak: 'break-word' }}>
                    {letter.recipient || 'For You'}
                  </div>
                  <div className="text-muted font-sans" style={{ fontSize: '11px' }}>
                    From: <span className="font-kalam fw-bold" style={{ color: '#B4455A', fontSize: '13px' }}>{letter.sender || 'Me'}</span>
                  </div>
                </div>

                {/* Envelope Flap */}
                <div className="envelope-flap" style={{ height: '54%' }}>
                  <svg viewBox="0 0 520 180" width="100%" height="100%" preserveAspectRatio="none">
                    <polygon points="0,0 520,0 260,180" fill="#E7DCBE" stroke="#1F2340" strokeWidth="2.5" />
                    <line x1="20" y1="12" x2="250" y2="170" stroke="#B4455A" strokeWidth="2.5" strokeDasharray="7 5" />
                    <line x1="500" y1="12" x2="270" y2="170" stroke="#3E5C8A" strokeWidth="2.5" strokeDasharray="7 5" />
                  </svg>
                </div>

                {/* Wax Seal on Preview Envelope */}
                <div
                  className="pulsing-wax-seal"
                  style={{
                    cursor: 'default',
                    animation: 'none',
                    transform: 'translate(-50%, -50%) scale(0.92)'
                  }}
                  data-testid="studio-preview-wax-seal"
                >
                  <WaxSealSVG
                    seal={currentSeal}
                    size={72}
                    color="#B4455A"
                    strokeColor="#1F2340"
                    strokeWidth={2.6}
                  />
                </div>
              </div>
              <div className="text-center mt-2">
                <span className="small text-muted font-sans" style={{ fontSize: '11px', opacity: 0.85 }}>
                  Live envelope preview with {currentSeal.symbol} wax seal
                </span>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
