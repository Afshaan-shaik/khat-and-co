import React, { useState, useEffect } from 'react';
import { LetterData } from '../types/letter';
import { renderPostageStampSvg, renderPostmarkSvg } from '../utils/stamps';
import { isSupabaseConfigured, fetchShelfFromSupabase, backupAllSiteDataToSupabase } from '../services/supabase';

interface ShelfSectionProps {
  onOpenLetter: (letter: LetterData) => void;
  sentLettersTrigger?: number; // increments when a new letter is sealed
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

export const ShelfSection: React.FC<ShelfSectionProps> = ({ onOpenLetter, sentLettersTrigger }) => {
  const [shelfLetters, setShelfLetters] = useState<(LetterData & { sample?: boolean })[]>([]);
  const [isSample, setIsSample] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadShelf() {
      // 1. Try Supabase first if configured
      if (isSupabaseConfigured()) {
        try {
          const remote = await fetchShelfFromSupabase();
          if (!cancelled && remote && remote.length > 0) {
            setShelfLetters(remote);
            setIsSample(false);
            return;
          }
        } catch {
          // fallback to localStorage
        }
      }

      // 2. Fallback to localStorage
      try {
        const stored = localStorage.getItem('khath:shelf');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (!cancelled && Array.isArray(parsed) && parsed.length > 0) {
            setShelfLetters(parsed);
            setIsSample(false);
            return;
          }
        }
      } catch {
        // Fallback
      }

      if (!cancelled) {
        setShelfLetters(SAMPLES());
        setIsSample(true);
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
        setShelfLetters(remote);
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

  return (
    <section className="section" id="shelf">
      <div className="container">
        <div className="shelf-head rv in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2>The shelf</h2>
            <p className="lead">
              Every letter you send stacks up here, oldest at the back. Tap one to open it again.
            </p>
          </div>
          {isSupabaseConfigured() && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
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

        <div className="shelf in" id="shelfRow">
          {shelfLetters.slice(-10).map((letter, idx) => {
            const rot = idx % 2 === 0 ? -1.6 : 1.6;

            return (
              <button
                key={letter.date + '_' + idx}
                type="button"
                className="shelf-item"
                style={
                  {
                    '--r': `${rot}deg`,
                    '--i': idx,
                    zIndex: idx + 1
                  } as React.CSSProperties
                }
                onClick={() => onOpenLetter(letter)}
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
              </button>
            );
          })}
        </div>

        <p className="hint shelf-note" id="shelfNote">
          {isSample
            ? 'These are sample letters. They disappear once you send your first.'
            : ''}
        </p>
      </div>
    </section>
  );
};
