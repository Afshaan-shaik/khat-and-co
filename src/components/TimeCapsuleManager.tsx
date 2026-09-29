import React, { useState, useEffect } from 'react';

export interface TimeCapsule {
  id: string;
  recipient: string;
  title: string;
  message: string;
  unlockDate: string; // ISO date string
  unlockTime?: string;
  createdAt: string;
  opened: boolean;
  occasion?: string;
}

const TIME_CAPSULE_KEY = 'khat-and-co:time-capsules';

const OCCASION_OPTIONS = [
  { value: 'birthday', label: 'Birthday' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'graduation', label: 'Graduation' },
  { value: 'new-year', label: 'New Year' },
  { value: 'one-year', label: 'One Year From Now' },
  { value: 'chosen', label: 'A Chosen Date' },
];

function loadCapsules(): TimeCapsule[] {
  try {
    const raw = localStorage.getItem(TIME_CAPSULE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCapsules(capsules: TimeCapsule[]): void {
  try {
    localStorage.setItem(TIME_CAPSULE_KEY, JSON.stringify(capsules));
  } catch { /* ignore */ }
}

function isUnlocked(capsule: TimeCapsule): boolean {
  const now = new Date();
  const unlock = new Date(`${capsule.unlockDate}${capsule.unlockTime ? 'T' + capsule.unlockTime : ''}`);
  return now >= unlock;
}

function formatUnlockDate(dateStr: string, timeStr?: string): string {
  try {
    const d = new Date(`${dateStr}${timeStr ? 'T' + timeStr : ''}`);
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

function getOneYearFromNow(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
}

/* ══════════════ Create Form ══════════════ */
interface CreateTimeCapsuleFormProps {
  onSave: (capsule: TimeCapsule) => void;
  onCancel: () => void;
}

const CreateTimeCapsuleForm: React.FC<CreateTimeCapsuleFormProps> = ({ onSave, onCancel }) => {
  const [recipient, setRecipient] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [unlockDate, setUnlockDate] = useState(getOneYearFromNow());
  const [unlockTime, setUnlockTime] = useState('09:00');
  const [occasion, setOccasion] = useState('chosen');

  const handleOccasionChange = (val: string) => {
    setOccasion(val);
    if (val === 'one-year') {
      setUnlockDate(getOneYearFromNow());
    }
  };

  const handleSave = () => {
    if (!recipient.trim() || !message.trim() || !unlockDate) return;
    const capsule: TimeCapsule = {
      id: `tc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      recipient: recipient.trim(),
      title: title.trim() || 'A Letter in Time',
      message: message.trim(),
      unlockDate,
      unlockTime,
      createdAt: new Date().toISOString(),
      opened: false,
      occasion,
    };
    onSave(capsule);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="capsule-form">
      <div className="capsule-form-field">
        <label className="capsule-form-label" htmlFor="capsule-recipient">For</label>
        <input
          id="capsule-recipient"
          type="text"
          className="capsule-form-input"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="Recipient name"
          required
        />
      </div>

      <div className="capsule-form-field">
        <label className="capsule-form-label" htmlFor="capsule-title">Title</label>
        <input
          id="capsule-title"
          type="text"
          className="capsule-form-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="For the day you need this."
        />
      </div>

      <div className="capsule-form-field">
        <label className="capsule-form-label" htmlFor="capsule-occasion">Occasion</label>
        <select
          id="capsule-occasion"
          className="capsule-form-select"
          value={occasion}
          onChange={(e) => handleOccasionChange(e.target.value)}
        >
          {OCCASION_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="capsule-form-row">
        <div className="capsule-form-field">
          <label className="capsule-form-label" htmlFor="capsule-date">Opens on</label>
          <input
            id="capsule-date"
            type="date"
            className="capsule-form-input"
            value={unlockDate}
            min={today}
            onChange={(e) => setUnlockDate(e.target.value)}
            required
          />
        </div>
        <div className="capsule-form-field">
          <label className="capsule-form-label" htmlFor="capsule-time">At time</label>
          <input
            id="capsule-time"
            type="time"
            className="capsule-form-input"
            value={unlockTime}
            onChange={(e) => setUnlockTime(e.target.value)}
          />
        </div>
      </div>

      <div className="capsule-form-field">
        <label className="capsule-form-label" htmlFor="capsule-message">Your letter</label>
        <textarea
          id="capsule-message"
          className="capsule-form-textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write what you wish to preserve..."
          rows={6}
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
          Seal the Capsule
        </button>
        <button type="button" className="btn-khat-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

/* ══════════════ Capsule Card ══════════════ */
interface CapsuleCardProps {
  capsule: TimeCapsule;
  index: number;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}

const CapsuleCard: React.FC<CapsuleCardProps> = ({ capsule, index, onOpen, onDelete }) => {
  const unlocked = isUnlocked(capsule);
  const unlockDisplay = formatUnlockDate(capsule.unlockDate, capsule.unlockTime);

  return (
    <div className={`capsule-card ${unlocked ? 'capsule-unlocked' : 'capsule-sealed'} ${capsule.opened ? 'capsule-opened' : ''}`}>
      <div className="capsule-card-header">
        <span className="capsule-index">TIME CAPSULE {String(index + 1).padStart(2, '0')}</span>
        <span className={`capsule-status-dot ${unlocked ? 'status-open' : 'status-sealed'}`} aria-hidden="true" />
      </div>

      <div className="capsule-card-body">
        <h3 className="capsule-title">"{capsule.title}"</h3>
        <div className="capsule-meta">
          <span className="capsule-for">For {capsule.recipient}</span>
          <span className="capsule-opens">
            {unlocked ? (
              capsule.opened ? 'Opened' : 'Ready to open'
            ) : (
              <>Opens: {unlockDisplay}</>
            )}
          </span>
        </div>
      </div>

      {/* Sealed state illustration */}
      {!unlocked && (
        <div className="capsule-sealed-state" aria-hidden="true">
          <svg viewBox="0 0 48 48" width="40" height="40" fill="none">
            <ellipse cx="24" cy="24" rx="20" ry="14" fill="none" stroke="var(--rose)" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
            <rect x="16" y="18" width="16" height="12" rx="2" fill="none" stroke="var(--rose)" strokeWidth="1.5" opacity="0.6" />
            <path d="M20 18v-3a4 4 0 0 1 8 0v3" stroke="var(--rose)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          </svg>
          <span className="capsule-sealed-label">Safely sealed</span>
        </div>
      )}

      {/* Unlocked state */}
      {unlocked && !capsule.opened && (
        <div className="capsule-arrived-state">
          <p className="capsule-arrived-msg">Your letter has arrived.</p>
          <button
            type="button"
            className="btn-khat-primary capsule-open-btn"
            onClick={() => onOpen(capsule.id)}
          >
            Open the letter
          </button>
        </div>
      )}

      {/* Opened content */}
      {capsule.opened && (
        <div className="capsule-opened-content">
          <p className="capsule-opened-text">{capsule.message}</p>
        </div>
      )}

      <div className="capsule-card-footer">
        <button
          type="button"
          className="capsule-delete-btn"
          onClick={() => onDelete(capsule.id)}
          aria-label={`Delete time capsule for ${capsule.recipient}`}
          title="Delete this capsule"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          </svg>
          Archive
        </button>
      </div>
    </div>
  );
};

/* ══════════════ Main Component ══════════════ */
interface TimeCapsuleManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TimeCapsuleManager: React.FC<TimeCapsuleManagerProps> = ({ isOpen, onClose }) => {
  const [capsules, setCapsules] = useState<TimeCapsule[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCapsules(loadCapsules());
    }
  }, [isOpen]);

  const handleSaveCapsule = (capsule: TimeCapsule) => {
    const updated = [capsule, ...capsules];
    setCapsules(updated);
    saveCapsules(updated);
    setIsCreating(false);
  };

  const handleOpenCapsule = (id: string) => {
    const updated = capsules.map(c => c.id === id ? { ...c, opened: true } : c);
    setCapsules(updated);
    saveCapsules(updated);
  };

  const handleDeleteCapsule = (id: string) => {
    if (!window.confirm('Archive this time capsule? This cannot be undone.')) return;
    const updated = capsules.filter(c => c.id !== id);
    setCapsules(updated);
    saveCapsules(updated);
  };

  if (!isOpen) return null;

  return (
    <div
      className="capsule-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Letter Time Capsule"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="capsule-modal-panel">
        <div className="capsule-modal-header">
          <div>
            <h2 className="capsule-modal-title">Letter Time Capsule</h2>
            <p className="capsule-modal-subtitle">Preserve a letter for a future moment.</p>
          </div>
          <button type="button" className="capsule-modal-close btn-khat-secondary btn-icon-only" onClick={onClose} aria-label="Close Time Capsule">
            ✕
          </button>
        </div>

        <div className="capsule-modal-body">
          {isCreating ? (
            <CreateTimeCapsuleForm
              onSave={handleSaveCapsule}
              onCancel={() => setIsCreating(false)}
            />
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
                Seal a New Capsule
              </button>

              {capsules.length === 0 ? (
                <div className="capsule-empty-state">
                  <div className="capsule-empty-icon" aria-hidden="true">
                    <svg viewBox="0 0 64 64" width="56" height="56" fill="none">
                      <ellipse cx="32" cy="32" rx="26" ry="18" stroke="var(--rose)" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.4" />
                      <path d="M22 28a4 4 0 0 1 8 0v4h-8v-4z" stroke="var(--ui-text-muted)" strokeWidth="1.5" fill="none" opacity="0.5" />
                      <rect x="18" y="32" width="18" height="14" rx="2" stroke="var(--ui-text-muted)" strokeWidth="1.5" fill="none" opacity="0.5" />
                    </svg>
                  </div>
                  <p className="capsule-empty-text">No time capsules yet.</p>
                  <p className="capsule-empty-hint">Write something today that becomes available on a chosen future date.</p>
                </div>
              ) : (
                <div className="capsule-list">
                  {capsules.map((cap, i) => (
                    <CapsuleCard
                      key={cap.id}
                      capsule={cap}
                      index={i}
                      onOpen={handleOpenCapsule}
                      onDelete={handleDeleteCapsule}
                    />
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
