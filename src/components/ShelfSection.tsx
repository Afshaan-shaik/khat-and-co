import React, { useState, useEffect } from 'react';
import { LetterData, RecycleBinItem } from '../types/letter';
import { renderPostageStampSvg, renderPostmarkSvg } from '../utils/stamps';
import {
  isSupabaseConfigured,
  fetchShelfFromSupabase,
  backupAllSiteDataToSupabase,
  deleteLetterFromSupabase
} from '../services/supabase';
import {
  loadShelfLetters,
  loadRecycleBin,
  moveToRecycleBin,
  restoreFromRecycleBin,
  truncateFromRecycleBin,
  emptyRecycleBin,
  getLetterId
} from '../utils/storage';
import { sfx } from '../utils/sound';

interface ShelfSectionProps {
  onOpenLetter: (letter: LetterData) => void;
  sentLettersTrigger?: number; // increments when a new letter is sealed
  showToast?: (msg: string) => void;
}

const SAMPLES = (): (LetterData & { sample?: boolean })[] => {
  return [
    {
      sample: true,
      recipient: 'Meera',
      sender: 'Arjun',
      date: 'Sunday, September 6, 2026',
      greeting: 'Dear Meera,',
      signoff: 'With love,',
      language: 'en',
      fontId: 'caveat',
      fontSize: 'm',
      templateId: 'lined',
      inkColor: '#1F2340',
      ruledLines: true,
      waxSeal: { id: 'custom', symbol: 'A', isCustom: true, customText: 'A', color: 'oxblood' },
      stamp: 2,
      city: 'Pune',
      ps: 'The terrace plant is still alive.',
      body:
        'Sunday again, and the chai here is still worse than yours.\n\nThis week I walked home the long way twice. There is a bakery that opens at six and smells like cardamom, and I stood outside it for a full minute like a fool.\n\nI saved three small things for you: a bus ticket, a leaf, and a joke I will tell you badly.\n\nWrite back soon.',
      stickers: [
        { id: 'stk_1', stickerId: 'washi', x: 50, y: 3, scale: 1, rotation: -3, zIndex: 1 },
        { id: 'stk_2', stickerId: 'marigold', x: 86, y: 84, scale: 0.9, rotation: 10, zIndex: 2 }
      ]
    },
    {
      sample: true,
      recipient: 'नानी',
      sender: 'सिया',
      date: 'Monday, September 14, 2026',
      greeting: 'प्रिय नानी,',
      signoff: 'प्यार सहित',
      language: 'hi',
      fontId: 'kalam',
      fontSize: 'm',
      templateId: 'flora',
      inkColor: '#26422F',
      ruledLines: false,
      waxSeal: { id: 'custom', symbol: 'स', isCustom: true, customText: 'स', color: 'rose' },
      stamp: 3,
      city: 'Jaipur',
      ps: 'छत की तुलसी अब भी हरी है।',
      body:
        'आपकी बहुत याद आती है।\n\nइस हफ़्ते आम के पेड़ पर पहली कैरी लगी। मुझे वही दोपहर याद आई जब आप हमें छत पर बिठाकर कहानियाँ सुनाती थीं।\n\nमैंने आपके लिए पीला धागा बचाकर रखा है।\n\nजल्दी चिट्ठी लिखिए।',
      stickers: [
        { id: 'stk_3', stickerId: 'heart', x: 82, y: 12, scale: 0.8, rotation: 12, zIndex: 1 }
      ]
    },
    {
      sample: true,
      recipient: 'Sam',
      sender: 'Rhea',
      date: 'Monday, September 21, 2026',
      greeting: 'Dear Sam,',
      signoff: 'Yours,',
      language: 'en',
      fontId: 'apple',
      fontSize: 's',
      templateId: 'midnight',
      inkColor: '#F1E8D2',
      ruledLines: false,
      waxSeal: { id: 'custom', symbol: 'R', isCustom: true, customText: 'R', color: 'gold' },
      stamp: 1,
      city: 'Leeds',
      ps: '',
      body:
        'It is 2 a.m. where you are and I am pretending I do not know that.\n\nI wanted to tell you that the moon looked ridiculous tonight, huge and orange, and I thought: Sam would have said something rude about it. I miss that.\n\nSleep well.',
      stickers: [
        { id: 'stk_4', stickerId: 'moon', x: 84, y: 10, scale: 0.85, rotation: 8, zIndex: 1 },
        { id: 'stk_5', stickerId: 'sparkle', x: 14, y: 88, scale: 0.7, rotation: 0, zIndex: 2 }
      ]
    }
  ];
};

export const ShelfSection: React.FC<ShelfSectionProps> = ({
  onOpenLetter,
  sentLettersTrigger,
  showToast
}) => {
  const [shelfLetters, setShelfLetters] = useState<(LetterData & { sample?: boolean })[]>([]);
  const [isSample, setIsSample] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Recycle bin & tabs state
  const [viewMode, setViewMode] = useState<'shelf' | 'bin'>('shelf');
  const [binItems, setBinItems] = useState<RecycleBinItem[]>([]);
  const [confirmTarget, setConfirmTarget] = useState<{
    id: string;
    recipient?: string;
    isAll?: boolean;
  } | null>(null);

  // Load shelf and recycle bin on mount & whenever trigger updates
  useEffect(() => {
    let cancelled = false;

    async function loadShelf() {
      const currentBin = loadRecycleBin();
      const binIds = new Set(currentBin.map((b) => b.id));

      // 1. Try Supabase first if configured
      if (isSupabaseConfigured()) {
        try {
          const remote = await fetchShelfFromSupabase();
          if (!cancelled && remote && remote.length > 0) {
            const activeRemote = remote.filter((l) => !binIds.has(l.id || getLetterId(l)));
            if (activeRemote.length > 0) {
              setShelfLetters(activeRemote);
              setIsSample(false);
              setBinItems(currentBin);
              return;
            }
          }
        } catch {
          // fallback to localStorage
        }
      }

      // 2. Fallback to localStorage
      try {
        const stored = loadShelfLetters();
        if (stored && stored.length > 0) {
          const activeStored = stored.filter((l) => !binIds.has(l.id || getLetterId(l)));
          if (activeStored.length > 0) {
            if (!cancelled) {
              setShelfLetters(activeStored);
              setIsSample(false);
              setBinItems(currentBin);
              return;
            }
          }
        }
      } catch {
        // Fallback
      }

      if (!cancelled) {
        const activeSamples = SAMPLES().filter((l) => !binIds.has(getLetterId(l)));
        setShelfLetters(activeSamples);
        setIsSample(true);
        setBinItems(currentBin);
      }
    }

    loadShelf();

    return () => {
      cancelled = true;
    };
  }, [sentLettersTrigger]);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncStatus('Backing up data to Supabase...');
    const result = await backupAllSiteDataToSupabase();
    setIsSyncing(false);
    if (result.success) {
      setSyncStatus(`Backed up ${result.syncedCount} letter(s) to Supabase Storage & DB!`);
      const remote = await fetchShelfFromSupabase();
      if (remote && remote.length > 0) {
        const binIds = new Set(loadRecycleBin().map((b) => b.id));
        setShelfLetters(remote.filter((l) => !binIds.has(l.id || getLetterId(l))));
        setIsSample(false);
      }
    } else {
      setSyncStatus(result.error || 'Sync failed');
    }
    setTimeout(() => setSyncStatus(null), 4000);
  };

  const fmtDate = (str?: string) => {
    if (!str) return 'Recently';
    return str.split(',')[0] || str;
  };

  // Delete from shelf to Recycle Bin (Soft Delete)
  const handleDeleteToBin = (e: React.MouseEvent, letter: LetterData) => {
    e.preventDefault();
    e.stopPropagation();
    sfx.rustle();

    const targetId = letter.id || getLetterId(letter);
    moveToRecycleBin(letter);

    setShelfLetters((prev) =>
      prev.filter((l) => {
        const lId = l.id || getLetterId(l);
        return lId !== targetId;
      })
    );

    setBinItems(loadRecycleBin());
    showToast?.('Letter moved to Recycle Bin.');
  };

  // Restore letter from Recycle Bin to Shelf
  const handleRestore = (id: string) => {
    sfx.snap();
    const restored = restoreFromRecycleBin(id);
    if (restored) {
      const updatedShelf = loadShelfLetters();
      setShelfLetters(updatedShelf);
      setIsSample(false);
      setBinItems(loadRecycleBin());
      showToast?.(`Restored letter to ${restored.recipient || 'recipient'}.`);
    }
  };

  // Trigger confirmation modal for single truncate
  const promptTruncate = (item: RecycleBinItem) => {
    sfx.rustle();
    setConfirmTarget({ id: item.id, recipient: item.letter.recipient });
  };

  // Trigger confirmation modal for emptying entire bin
  const promptEmptyBin = () => {
    sfx.rustle();
    setConfirmTarget({ id: 'all', isAll: true });
  };

  // Final confirmation to truncate permanently
  const handleTruncateConfirm = async () => {
    if (!confirmTarget) return;
    sfx.thump();

    if (confirmTarget.isAll) {
      emptyRecycleBin();
      setBinItems([]);
      showToast?.('Recycle bin emptied permanently.');
    } else {
      truncateFromRecycleBin(confirmTarget.id);
      if (isSupabaseConfigured()) {
        await deleteLetterFromSupabase(confirmTarget.id);
      }
      setBinItems(loadRecycleBin());
      showToast?.('Letter permanently deleted.');
    }

    setConfirmTarget(null);
  };

  return (
    <section className="section" id="shelf">
      <div className="container">
        <div
          className="shelf-head rv in"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div>
            <h2>The shelf</h2>
            <p className="lead">
              Every letter you send stacks up here, oldest at the back. Tap one to open it again.
            </p>

            {/* View Switcher Tabs: Shelf vs Recycle Bin */}
            <div className="shelf-controls">
              <div className="shelf-tabs" role="tablist" aria-label="Shelf navigation">
                <button
                  type="button"
                  role="tab"
                  id="shelf-tab-active"
                  aria-selected={viewMode === 'shelf'}
                  className={`shelf-tab-btn ${viewMode === 'shelf' ? 'active' : ''}`}
                  onClick={() => {
                    sfx.rustle();
                    setViewMode('shelf');
                  }}
                >
                  <span>Active Shelf</span>
                  <span
                    className={`shelf-tab-count ${
                      shelfLetters.length > 0 && !isSample ? 'has-items' : ''
                    }`}
                  >
                    {isSample ? 0 : shelfLetters.length}
                  </span>
                </button>
                <button
                  type="button"
                  role="tab"
                  id="shelf-tab-bin"
                  aria-selected={viewMode === 'bin'}
                  className={`shelf-tab-btn ${viewMode === 'bin' ? 'active' : ''}`}
                  onClick={() => {
                    sfx.rustle();
                    setViewMode('bin');
                  }}
                >
                  <span>Recycle Bin</span>
                  <span className={`shelf-tab-count ${binItems.length > 0 ? 'has-items' : ''}`}>
                    {binItems.length}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {isSupabaseConfigured() && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '6px'
              }}
            >
              <button
                type="button"
                className="btn ghost sm"
                onClick={handleSync}
                disabled={isSyncing}
                style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
              >
                {isSyncing ? 'Syncing...' : '☁ Backup to Supabase'}
              </button>
              {syncStatus && (
                <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                  {syncStatus}
                </span>
              )}
            </div>
          )}
        </div>

        {/* View Mode: Active Shelf */}
        {viewMode === 'shelf' && (
          <>
            <div className="shelf in" id="shelfRow">
              {shelfLetters.slice(-10).map((letter, idx) => {
                const rot = idx % 2 === 0 ? -1.6 : 1.6;
                const letterId = letter.id || getLetterId(letter, idx);

                return (
                  <div
                    key={(letter.id || letter.date) + '_' + idx}
                    className="shelf-item"
                    data-testid={`shelf-item-${idx}`}
                    style={
                      {
                        '--r': `${rot}deg`,
                        '--i': idx,
                        zIndex: idx + 1
                      } as React.CSSProperties
                    }
                  >
                    {/* Delete button: Soft-deletes letter to Recycle Bin */}
                    <button
                      type="button"
                      className="shelf-del-btn"
                      title="Move to Recycle Bin"
                      aria-label={`Delete letter for ${letter.recipient || 'recipient'} to recycle bin`}
                      data-testid={`delete-letter-${letterId}`}
                      onClick={(e) => handleDeleteToBin(e, letter)}
                      onPointerDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                    >
                      ✕
                    </button>

                    {/* Clickable Envelope Body */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => onOpenLetter(letter)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onOpenLetter(letter);
                        }
                      }}
                      style={{ cursor: 'pointer', outline: 'none' }}
                    >
                      {/* 3D Envelope Front */}
                      <div className="env still" data-face="front">
                        <div className="env-stage">
                          <div className="env-flip">
                            <div className="env-face front">
                              <div className="ret">{letter.sender || ''}</div>
                              <div className="addr">
                                <small>To</small>
                                {letter.recipient || 'You'}
                              </div>
                              <div
                                className="pm"
                                dangerouslySetInnerHTML={{
                                  __html: renderPostmarkSvg(letter.city, Date.now())
                                }}
                              />
                              <div
                                className="stp"
                                dangerouslySetInnerHTML={{
                                  __html: renderPostageStampSvg(letter.stamp || 0)
                                }}
                              />
                              <i className="env-ring" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <span className="cap">
                        <b>
                          To {letter.recipient || 'you'}
                          {letter.sample && <em className="tag">Sample</em>}
                        </b>
                        <i>
                          {letter.unlockDate
                            ? `Sealed until ${letter.unlockDate}`
                            : fmtDate(letter.date)}
                        </i>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="hint shelf-note" id="shelfNote">
              {isSample
                ? 'These are sample letters. They disappear once you send your first.'
                : ''}
            </p>
          </>
        )}

        {/* View Mode: Recycle Bin */}
        {viewMode === 'bin' && (
          <div className="recycle-bin-view" data-testid="recycle-bin-container">
            <div className="recycle-bin-toolbar">
              <div>
                <span style={{ fontSize: '0.92rem', color: 'var(--muted)' }}>
                  {binItems.length === 0
                    ? 'Your recycle bin is clean.'
                    : `${binItems.length} deleted letter${binItems.length === 1 ? '' : 's'} stored.`}
                </span>
              </div>
              {binItems.length > 0 && (
                <button
                  type="button"
                  className="btn xs danger-outline"
                  data-testid="empty-bin-btn"
                  onClick={promptEmptyBin}
                >
                  Empty Bin Permanently
                </button>
              )}
            </div>

            {binItems.length === 0 ? (
              <div className="recycle-bin-empty" data-testid="recycle-bin-empty">
                <div className="recycle-bin-empty-seal">✉️</div>
                <h3>The bin is empty</h3>
                <p>
                  Letters you delete from your active shelf will rest here before being permanently
                  truncated.
                </p>
                <button
                  type="button"
                  className="btn sm ghost"
                  onClick={() => setViewMode('shelf')}
                >
                  Return to shelf
                </button>
              </div>
            ) : (
              <div className="recycle-bin-grid">
                {binItems.map((item) => (
                  <div
                    key={item.id}
                    className="recycle-bin-card"
                    data-testid={`bin-card-${item.id}`}
                  >
                    <div>
                      <div className="recycle-card-header">
                        <span className="recycle-card-to">
                          To: {item.letter.recipient || 'Someone'}
                        </span>
                        <span className="recycle-card-date">
                          {fmtDate(item.letter.date)}
                        </span>
                      </div>
                      <p className="recycle-card-snippet">
                        {item.letter.body || 'Empty letter content.'}
                      </p>
                    </div>

                    <div>
                      <div className="recycle-card-meta">
                        <span>
                          Deleted {new Date(item.deletedAt).toLocaleDateString()}
                        </span>
                        <span>From: {item.letter.sender || 'Anonymous'}</span>
                      </div>
                      <div className="recycle-card-actions">
                        <button
                          type="button"
                          className="btn xs primary-outline"
                          data-testid={`restore-btn-${item.id}`}
                          onClick={() => handleRestore(item.id)}
                          title="Restore this letter back to your shelf"
                        >
                          ↩ Restore
                        </button>
                        <button
                          type="button"
                          className="btn xs ghost"
                          onClick={() => onOpenLetter(item.letter)}
                          title="Preview this letter"
                        >
                          Preview
                        </button>
                        <button
                          type="button"
                          className="btn xs danger-text"
                          data-testid={`truncate-btn-${item.id}`}
                          onClick={() => promptTruncate(item)}
                          title="Delete permanently"
                        >
                          Truncate
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Vintage Stationery Confirmation Modal for Truncating */}
        {confirmTarget && (
          <div
            className="stationery-modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            data-testid="truncate-modal"
          >
            <div className="stationery-modal-box">
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
              <h3
                id="confirm-modal-title"
                style={{
                  fontFamily: "'Bodoni Moda', Georgia, serif",
                  fontSize: '1.35rem',
                  marginBottom: '10px'
                }}
              >
                {confirmTarget.isAll
                  ? 'Empty Entire Recycle Bin?'
                  : 'Permanently Truncate Letter?'}
              </h3>
              <p
                style={{
                  color: 'var(--muted)',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  marginBottom: '24px'
                }}
              >
                {confirmTarget.isAll
                  ? 'This action cannot be undone. All letters in the bin will be permanently erased from your storage.'
                  : `This will permanently truncate the letter for ${
                      confirmTarget.recipient || 'the recipient'
                    }. Once erased, it cannot be recovered.`}
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn ghost sm"
                  onClick={() => setConfirmTarget(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn danger sm"
                  data-testid="confirm-truncate-btn"
                  onClick={handleTruncateConfirm}
                >
                  {confirmTarget.isAll ? 'Yes, Empty All' : 'Yes, Truncate Permanently'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
