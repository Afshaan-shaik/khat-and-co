import React, { useState, useEffect } from 'react';

export interface SealedLetter {
  id: string;
  recipient: string;
  message: string;
  senderName: string;
  unlockDate: string;
  unlockTime?: string;
  createdAt: string;
  isOpened: boolean;
}

const SEALED_LETTERS_KEY = 'khat-and-co:sealed-letters';

function loadSealedLetters(): SealedLetter[] {
  try {
    const raw = localStorage.getItem(SEALED_LETTERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSealedLetters(letters: SealedLetter[]): void {
  try {
    localStorage.setItem(SEALED_LETTERS_KEY, JSON.stringify(letters));
  } catch { /* ignore */ }
}

function isUnlocked(letter: SealedLetter): boolean {
  const now = new Date();
  const unlock = new Date(`${letter.unlockDate}${letter.unlockTime ? 'T' + letter.unlockTime : ''}`);
  return now >= unlock;
}

function formatDate(dateStr: string, timeStr?: string): string {
  try {
    const d = new Date(`${dateStr}${timeStr ? 'T' + timeStr : ''}`);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

/* ══════════════ Create Form ══════════════ */
interface SealedUntilFutureFormProps {
  onSave: (letter: SealedLetter) => void;
  onCancel: () => void;
}

const SealedUntilFutureForm: React.FC<SealedUntilFutureFormProps> = ({ onSave, onCancel }) => {
  const [recipient, setRecipient] = useState('');
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [unlockTime, setUnlockTime] = useState('09:00');

  const today = new Date().toISOString().split('T')[0];

  const handleSave = () => {
    if (!recipient.trim() || !message.trim() || !unlockDate) return;
    const letter: SealedLetter = {
      id: `sl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      recipient: recipient.trim(),
      senderName: senderName.trim() || 'Someone who loves you',
      message: message.trim(),
      unlockDate,
      unlockTime,
      createdAt: new Date().toISOString(),
      isOpened: false,
    };
    onSave(letter);
  };

  return (
    <div className="sealed-form">
      <div className="sealed-form-row">
        <div className="capsule-form-field">
          <label className="capsule-form-label" htmlFor="sealed-recipient">For</label>
          <input
            id="sealed-recipient"
            type="text"
            className="capsule-form-input"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Recipient name"
            required
          />
        </div>
        <div className="capsule-form-field">
          <label className="capsule-form-label" htmlFor="sealed-sender">From</label>
          <input
            id="sealed-sender"
            type="text"
            className="capsule-form-input"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="Your name"
          />
        </div>
      </div>

      <div className="sealed-form-row">
        <div className="capsule-form-field">
          <label className="capsule-form-label" htmlFor="sealed-date">Opens on</label>
          <input
            id="sealed-date"
            type="date"
            className="capsule-form-input"
            value={unlockDate}
            min={today}
            onChange={(e) => setUnlockDate(e.target.value)}
            required
          />
        </div>
        <div className="capsule-form-field">
          <label className="capsule-form-label" htmlFor="sealed-time">At time</label>
          <input
            id="sealed-time"
            type="time"
            className="capsule-form-input"
            value={unlockTime}
            onChange={(e) => setUnlockTime(e.target.value)}
          />
        </div>
      </div>

      <div className="capsule-form-field">
        <label className="capsule-form-label" htmlFor="sealed-message">Your letter</label>
        <textarea
          id="sealed-message"
          className="capsule-form-textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write something to be read only when the time comes..."
          rows={7}
          required
        />
      </div>

      <div className="capsule-form-actions">
        <button
          type="button"
          className="btn-khat-primary"
          onClick={handleSave}
          disabled={!recipient.trim() || !message.trim() || !unlockDate}
        >
          Seal Until Future
        </button>
        <button type="button" className="btn-khat-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

/* ══════════════ Sealed Letter Card ══════════════ */
interface SealedLetterCardProps {
  letter: SealedLetter;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}

const SealedLetterCard: React.FC<SealedLetterCardProps> = ({ letter, onOpen, onDelete }) => {
  const unlocked = isUnlocked(letter);

  return (
    <div className={`sealed-letter-card ${unlocked ? 'sealed-unlocked' : 'sealed-still-sealed'}`}>
      {!unlocked ? (
        <>
          {/* Sealed state */}
          <div className="sealed-state-visual" aria-label="Sealed letter">
            <div className="sealed-envelope-icon" aria-hidden="true">
              <svg viewBox="0 0 72 52" width="72" height="52" fill="none">
                <rect x="2" y="2" width="68" height="48" rx="4" fill="var(--envelope-bg, #EDE4D4)" stroke="var(--ui-panel-border)" strokeWidth="1.5" />
                <path d="M2 2 L36 30 L70 2" stroke="var(--ui-panel-border)" strokeWidth="1.5" fill="none" />
                <circle cx="36" cy="30" r="10" fill="var(--rose)" opacity="0.85" />
                <text x="36" y="34" textAnchor="middle" fill="#F6EFE3" fontSize="9" fontFamily="'Instrument Serif', serif">♡</text>
              </svg>
            </div>
          </div>
          <div className="sealed-card-info">
            <div className="sealed-label">SEALED LETTER</div>
            <div className="sealed-for-name">For: <strong>{letter.recipient}</strong></div>
            <div className="sealed-opens-on">
              Opens: <strong>{formatDate(letter.unlockDate, letter.unlockTime)}</strong>
            </div>
            <p className="sealed-privacy-note">Your letter is safely sealed.</p>
          </div>
        </>
      ) : !letter.isOpened ? (
        <>
          <div className="sealed-arrived-badge">Your letter has arrived.</div>
          <div className="sealed-card-info">
            <div className="sealed-for-name">For: <strong>{letter.recipient}</strong></div>
            <div className="sealed-opens-on">
              Sealed on: {formatDate(letter.createdAt.split('T')[0])}
            </div>
          </div>
          <button type="button" className="btn-khat-primary sealed-open-btn" onClick={() => onOpen(letter.id)}>
            Open this letter
          </button>
        </>
      ) : (
        <>
          <div className="sealed-opened-label">Opened</div>
          <div className="sealed-card-info">
            <div className="sealed-for-name">For: <strong>{letter.recipient}</strong></div>
            <div className="sealed-opened-from">From: {letter.senderName}</div>
          </div>
          <div className="sealed-opened-content">
            <p>{letter.message}</p>
          </div>
        </>
      )}
      <button
        type="button"
        className="capsule-delete-btn sealed-delete-btn"
        onClick={() => onDelete(letter.id)}
        aria-label={`Delete sealed letter for ${letter.recipient}`}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        </svg>
        Delete
      </button>
    </div>
  );
};

/* ══════════════ Main Modal ══════════════ */
interface SealedUntilFutureProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SealedUntilFuture: React.FC<SealedUntilFutureProps> = ({ isOpen, onClose }) => {
  const [letters, setLetters] = useState<SealedLetter[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLetters(loadSealedLetters());
    }
  }, [isOpen]);

  const handleSave = (letter: SealedLetter) => {
    const updated = [letter, ...letters];
    setLetters(updated);
    saveSealedLetters(updated);
    setIsCreating(false);
  };

  const handleOpen = (id: string) => {
    const updated = letters.map(l => l.id === id ? { ...l, isOpened: true } : l);
    setLetters(updated);
    saveSealedLetters(updated);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this sealed letter? This cannot be undone.')) return;
    const updated = letters.filter(l => l.id !== id);
    setLetters(updated);
    saveSealedLetters(updated);
  };

  if (!isOpen) return null;

  return (
    <div
      className="capsule-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Sealed Until Future"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="capsule-modal-panel">
        <div className="capsule-modal-header">
          <div>
            <h2 className="capsule-modal-title">Sealed Until Future</h2>
            <p className="capsule-modal-subtitle">Write today. Let it arrive when the time comes.</p>
          </div>
          <button type="button" className="capsule-modal-close btn-khat-secondary btn-icon-only" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="capsule-modal-body">
          {isCreating ? (
            <SealedUntilFutureForm onSave={handleSave} onCancel={() => setIsCreating(false)} />
          ) : (
            <>
              <button
                type="button"
                className="capsule-create-btn btn-khat-secondary"
                onClick={() => setIsCreating(true)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Seal a New Letter
              </button>

              {letters.length === 0 ? (
                <div className="capsule-empty-state">
                  <div className="capsule-empty-icon" aria-hidden="true">
                    <svg viewBox="0 0 68 52" width="60" height="46" fill="none">
                      <rect x="3" y="3" width="62" height="46" rx="5" fill="none" stroke="var(--rose)" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.4" />
                      <path d="M3 3 L34 29 L65 3" stroke="var(--rose)" strokeWidth="1.5" fill="none" opacity="0.4" />
                      <circle cx="34" cy="29" r="8" fill="var(--rose)" opacity="0.25" />
                      <path d="M34 34 L33 33 C30.5 30.5 29 28.8 29 27 C29 25.5 30.5 24 32 24 C32.8 24 33.5 24.4 34 25 C34.5 24.4 35.2 24 36 24 C37.5 24 39 25.5 39 27 C39 28.8 37.5 30.5 35 33 Z" fill="var(--rose)" opacity="0.5" />
                    </svg>
                  </div>
                  <p className="capsule-empty-text">No sealed letters yet.</p>
                  <p className="capsule-empty-hint">Write something today that cannot be read until a chosen future date.</p>
                </div>
              ) : (
                <div className="sealed-list">
                  {letters.map((l) => (
                    <SealedLetterCard key={l.id} letter={l} onOpen={handleOpen} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
