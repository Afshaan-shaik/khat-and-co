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
    <div
      className="paper-gallery-row"
      role="radiogroup"
      aria-label="Choose stationery paper template"
    >
      {PAPER_TEMPLATES.map((tmpl) => {
        const isSelected = tmpl.id === selectedTemplateId;
        // Display short name (e.g. "Airmail", "Blush", "Midnight", etc.)
        const shortName = tmpl.name.split(' ')[0];

        return (
          <button
            key={tmpl.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            className={`paper-card-btn ${isSelected ? 'active' : ''}`}
            onClick={() => onSelectTemplate(tmpl)}
            title={`${tmpl.name} (${tmpl.nameHindi}): ${tmpl.description}`}
          >
            {/* Miniature Stationery Preview */}
            <div
              className={`mini-paper-preview ${getMiniBorderClass(tmpl.borderType)}`}
              style={{
                backgroundColor: tmpl.paperBg
              }}
            >
              {/* Miniature simulated ruled lines */}
              <div className="mini-paper-lines">
                <span style={{ backgroundColor: tmpl.ruledColor }} />
                <span style={{ backgroundColor: tmpl.ruledColor }} />
                <span style={{ backgroundColor: tmpl.ruledColor }} />
                <span style={{ backgroundColor: tmpl.ruledColor }} />
              </div>
            </div>

            {/* Labels underneath */}
            <span className="paper-card-name">{shortName}</span>
            <span className="paper-card-hindi">{tmpl.nameHindi}</span>
          </button>
        );
      })}
    </div>
  );
};

function getMiniBorderClass(borderType?: string): string {
  switch (borderType) {
    case 'airmail':
      return 'mini-border-airmail';
    case 'rose-gold':
      return 'mini-border-rose';
    case 'stars':
      return 'mini-border-stars';
    case 'botanical':
      return 'mini-border-botanical';
    case 'stitched':
      return 'mini-border-stitched';
    case 'vintage':
      return 'mini-border-vintage';
    case 'slate':
      return 'mini-border-slate';
    default:
      return 'mini-border-simple';
  }
}
