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
    <div className="w-100 mb-3">
      <div className="d-flex align-items-center justify-content-between mb-2 px-1">
        <label className="small text-muted fw-semibold" style={{ letterSpacing: '0.4px' }}>
          PAPER STATIONERY · कागज़ का चुनाव
        </label>
        <span className="small text-muted d-none d-sm-inline" style={{ fontSize: '12px' }}>
          {PAPER_TEMPLATES.find((t) => t.id === selectedTemplateId)?.description}
        </span>
      </div>

      <div
        className="d-flex align-items-center gap-2 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'thin' }}
        role="radiogroup"
        aria-label="Choose stationery paper template"
      >
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
              {/* Paper color thumbnail circle */}
              <span
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: tmpl.paperBg,
                  border: tmpl.isDarkPaper ? '1px solid #FAD889' : '1px solid rgba(0,0,0,0.15)',
                  boxShadow: isSelected ? '0 0 6px rgba(180, 69, 90, 0.4)' : 'none',
                  display: 'inline-block'
                }}
              />
              <span className="fw-medium">{tmpl.name}</span>
              <span className="text-muted font-kalam" style={{ fontSize: '12px' }}>
                {tmpl.nameHindi}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
