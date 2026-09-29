import React, { useState } from 'react';

interface InspireOption {
  id: string;
  label: string;
  prompt: string;
}

const INSPIRE_OPTIONS: InspireOption[] = [
  {
    id: 'love',
    label: 'Begin a love letter',
    prompt: 'What is one tiny moment with this person you still think about — a glance, a laugh, a silence?'
  },
  {
    id: 'miss',
    label: 'Say what you miss',
    prompt: 'Not the grand things. What small, ordinary thing do you miss most when you are apart?'
  },
  {
    id: 'gratitude',
    label: 'Thank someone',
    prompt: 'Tell them the one thing they did that you never properly thanked them for.'
  },
  {
    id: 'apologize',
    label: 'Apologize',
    prompt: 'Begin with the thing you have been trying to say. Not the explanation — the truth.'
  },
  {
    id: 'remember',
    label: 'Remember a moment',
    prompt: 'Describe a single afternoon, evening, or minute you shared. Write it like a painting.'
  },
  {
    id: 'goodbye',
    label: 'Say goodbye',
    prompt: 'What is the last thing you want them to remember about you — the real you, not the careful version?'
  },
  {
    id: 'blank',
    label: "When you don't know where to begin",
    prompt: 'Start with the weather outside your window right now. Let everything else follow.'
  },
];

interface InspireMeProps {
  onUsePrompt?: (prompt: string) => void;
}

export const InspireMe: React.FC<InspireMeProps> = ({ onUsePrompt }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [activeOption, setActiveOption] = useState<string | null>(null);

  const handleSelectOption = (opt: InspireOption) => {
    setActiveOption(opt.id);
    setSelectedPrompt(opt.prompt);
  };

  const handleUsePrompt = () => {
    if (selectedPrompt && onUsePrompt) {
      onUsePrompt(selectedPrompt);
    }
    setIsOpen(false);
    setSelectedPrompt(null);
    setActiveOption(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedPrompt(null);
    setActiveOption(null);
  };

  return (
    <div className="inspire-me-container">
      <button
        type="button"
        className={`inspire-me-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="inspire-me-panel"
        title="Inspire Me — a small spark beside the page"
      >
        <span className="inspire-star">✦</span>
        <span>Inspire Me</span>
      </button>

      {isOpen && (
        <div
          id="inspire-me-panel"
          className="inspire-me-panel"
          role="region"
          aria-label="Inspiration panel"
        >
          <div className="inspire-panel-header">
            <span className="inspire-panel-title">
              <span className="inspire-star">✦</span> What would you like to write?
            </span>
            <button
              type="button"
              className="inspire-panel-close"
              onClick={handleClose}
              aria-label="Close inspiration panel"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="1" y1="1" x2="12" y2="12" /><line x1="12" y1="1" x2="1" y2="12" />
              </svg>
            </button>
          </div>

          <div className="inspire-options-list">
            {INSPIRE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`inspire-option-btn ${activeOption === opt.id ? 'active' : ''}`}
                onClick={() => handleSelectOption(opt)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {selectedPrompt && (
            <div className="inspire-prompt-reveal" aria-live="polite">
              <p className="inspire-prompt-text">"{selectedPrompt}"</p>
              {onUsePrompt && (
                <button
                  type="button"
                  className="inspire-use-btn"
                  onClick={handleUsePrompt}
                >
                  Use this prompt →
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
