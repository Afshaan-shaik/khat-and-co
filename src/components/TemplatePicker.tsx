import React from 'react';
import { PAPER_TEMPLATES } from '../constants/templates';
import { PaperTemplate } from '../types/letter';

interface TemplatePickerProps {
  selectedTemplateId: string;
  onSelectTemplate: (template: PaperTemplate) => void;
}

export const TemplatePicker: React.FC<TemplatePickerProps> = ({
  selectedTemplateId,
  onSelectTemplate
}) => {
  return (
    <div className="template-scroll" role="radiogroup" aria-label="Choose stationery paper template">
      {PAPER_TEMPLATES.map((tmpl) => {
        const isSelected = tmpl.id === selectedTemplateId;
        return (
          <button
            key={tmpl.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            className={`template-pill ${isSelected ? 'active' : ''}`}
            onClick={() => onSelectTemplate(tmpl)}
            title={`${tmpl.name} (${tmpl.nameHindi}): ${tmpl.description}`}
          >
            {/* Paper colour dot */}
            <span
              className="template-pill-dot"
              style={{
                backgroundColor: tmpl.paperBg,
                border: tmpl.isDarkPaper ? '1.5px solid #FAD889' : '1.5px solid rgba(0,0,0,0.15)',
                boxShadow: isSelected ? '0 0 6px rgba(180,69,90,0.45)' : 'none'
              }}
            />

            <span className="template-pill-name">{tmpl.name}</span>

            <span className="template-pill-hindi">{tmpl.nameHindi}</span>

            {isSelected && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
};
