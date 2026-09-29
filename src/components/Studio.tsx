import React, { useRef } from 'react';
import { LetterData, PaperTemplate, FontOption } from '../types/letter';
import { LetterEditor } from './LetterEditor';
import { TemplatePicker } from './TemplatePicker';
import { FontPicker } from './FontPicker';
import { StickerDrawer } from './StickerDrawer';
import { WaxSealPicker, WaxSealData } from './WaxSealPicker';
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
  sealData: WaxSealData;
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
  const letterSheetRef = useRef<HTMLDivElement>(null);
  const currentTemplate = PAPER_TEMPLATES.find(t => t.id === letter.templateId) || PAPER_TEMPLATES[0];

  const handleUsePrompt = (prompt: string) => {
    const current = letter.body;
    const addition = current.trim() ? `\n\n${prompt}` : prompt;
    onChangeLetter({ body: current + addition });
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
          <details className="studio-accordion">
            <summary className="studio-accordion-summary">
              <span className="studio-acc-label">Wax Seal</span>
              <svg className="studio-acc-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M2 4l4 4 4-4" />
              </svg>
            </summary>
            <div className="studio-accordion-body">
              <WaxSealPicker sealData={sealData} onChangeSeal={onChangeSeal} />
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
          <div className="studio-preview-label">
            <span>Preview</span>
          </div>
          <div className="studio-preview-inner">
            <LetterEditor
              letter={letter}
              onChangeLetter={() => {}}
              letterSheetRef={{ current: null } as React.RefObject<HTMLDivElement>}
              readOnly={true}
            />
          </div>
        </aside>
      </div>
    </div>
  );
};
