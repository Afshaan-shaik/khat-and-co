import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './CinematicIntro.module.css';

interface CinematicIntroProps {
  onComplete: () => void;
  onThemeChange?: (theme: 'dark' | 'light') => void;
}

interface HeartItem {
  id: number;
  left: number;
  fontSize: number;
  duration: number;
  delay: number;
}

const CHIP_TEXTS = [
  '✍ Write on warm paper',
  '◉ Seal it with wax',
  '➤ Send a link that opens like an envelope'
];

export const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete, onThemeChange }) => {
  // Session theme: defaults to 'dark' for every new session; preserved across reloads in same session
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = sessionStorage.getItem('khath-theme');
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
    } catch {}
    return 'dark';
  });

  // Animation states
  const [envIn, setEnvIn] = useState(false);
  const [envOpen, setEnvOpen] = useState(false);
  const [caption, setCaption] = useState<string>('');
  const [captionShow, setCaptionShow] = useState(false);
  const [toText, setToText] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [chipsVisible, setChipsVisible] = useState<boolean[]>([false, false, false]);
  const [isFinale, setIsFinale] = useState(false);
  const [isDissolving, setIsDissolving] = useState(false);
  const [barProgress, setBarProgress] = useState<'0%' | '100%'>('0%');
  const [barTransition, setBarTransition] = useState('none');

  // References
  const stageRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLButtonElement>(null);
  const enterRef = useRef<HTMLButtonElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const timersRef = useRef<number[]>([]);
  const typerRef = useRef<number | null>(null);
  const openedRef = useRef(false);
  const isDissolvingRef = useRef(false);

  // Pre-generate 14 floating hearts with consistent random attributes
  const [hearts] = useState<HeartItem[]>(() => {
    return Array.from({ length: 14 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      fontSize: 10 + Math.random() * 16,
      duration: 9 + Math.random() * 9,
      delay: Math.random() * 8
    }));
  });

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
    if (typerRef.current) {
      window.clearInterval(typerRef.current);
      typerRef.current = null;
    }
  }, []);

  const addTimer = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const say = useCallback((text: string) => {
    setCaptionShow(false);
    addTimer(() => {
      setCaption(text);
      setCaptionShow(true);
    }, 350);
  }, [addTimer]);

  const typeText = useCallback((fullText: string, speed: number, onUpdate: (val: string) => void) => {
    if (typerRef.current) {
      window.clearInterval(typerRef.current);
      typerRef.current = null;
    }
    let i = 0;
    onUpdate('');
    typerRef.current = window.setInterval(() => {
      i++;
      onUpdate(fullText.slice(0, i));
      if (i >= fullText.length) {
        if (typerRef.current) {
          window.clearInterval(typerRef.current);
          typerRef.current = null;
        }
      }
    }, speed);
  }, []);

  // Theme updater
  const handleSetTheme = useCallback((newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    document.documentElement.dataset.theme = newTheme;
    try {
      sessionStorage.setItem('khath-theme', newTheme);
    } catch {}
    onThemeChange?.(newTheme);
  }, [onThemeChange]);

  // Synchronize document theme initially
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    onThemeChange?.(theme);
  }, [theme, onThemeChange]);

  // Finale transition
  const handleFinale = useCallback(() => {
    clearAllTimers();
    setCaptionShow(false);
    setIsFinale(true);
    setBarTransition('none');
    setBarProgress('100%');
    // Focus CTA
    window.setTimeout(() => {
      enterRef.current?.focus();
    }, 400);
  }, [clearAllTimers]);

  // Envelope Open Sequence
  const handleOpenEnvelope = useCallback(() => {
    if (openedRef.current) return;
    openedRef.current = true;
    setEnvOpen(true);

    // Progress bar 12s linear transition
    setBarTransition('width 12s linear');
    setBarProgress('100%');

    addTimer(() => {
      typeText('Dear you,', 70, setToText);
      say('Somewhere, someone is thinking of you.');
    }, 700);

    addTimer(() => {
      typeText(
        'I read your last note and it made me smile from miles away… so here is a little paper, a little wax, and all my love.',
        32,
        setBodyText
      );
    }, 1900);

    addTimer(() => {
      say('Khath & Co. turns a few quiet minutes into a keepsake.');
    }, 6200);

    // Chips staggered entrance
    CHIP_TEXTS.forEach((_, i) => {
      addTimer(() => {
        setChipsVisible((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 6600 + i * 700);
    });

    addTimer(handleFinale, 10800);
  }, [addTimer, say, typeText, handleFinale]);

  // Complete and dissolve intro
  const handleEnterStudio = useCallback(() => {
    if (isDissolvingRef.current) return;
    isDissolvingRef.current = true;
    clearAllTimers();
    setIsDissolving(true);

    // Remove overlay after dissolve animation (1200ms)
    window.setTimeout(() => {
      onComplete();
    }, 1200);
  }, [clearAllTimers, onComplete]);

  // 3D Parallax on pointer movement
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (!stageRef.current) return;
    const x = e.clientX / window.innerWidth - 0.5;
    const y = e.clientY / window.innerHeight - 0.5;
    stageRef.current.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 6}deg)`;
  }, []);

  // Keyboard navigation: Escape skips to finale or completes; autofocus management
  useEffect(() => {
    previousActiveElementRef.current = document.activeElement as HTMLElement | null;
    sealRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        if (!isFinale) {
          handleFinale();
        } else {
          handleEnterStudio();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isFinale, handleFinale, handleEnterStudio]);

  // Body & HTML scroll lock, prevent horizontal shift & cleanup on unmount
  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyMaxWidth = document.body.style.maxWidth;
    const originalHtmlMaxWidth = document.documentElement.style.maxWidth;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.maxWidth = '100vw';
    document.documentElement.style.maxWidth = '100vw';
    window.scrollTo(0, 0);

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.maxWidth = originalBodyMaxWidth;
      document.documentElement.style.maxWidth = originalHtmlMaxWidth;
      clearAllTimers();
      // Restore focus to previous element or studio landmark
      if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === 'function') {
        try {
          previousActiveElementRef.current.focus();
        } catch {}
      } else {
        const topEl = document.getElementById('top') || document.getElementById('studio');
        topEl?.focus?.();
      }
    };
  }, [clearAllTimers]);

  // Initial timeline mount
  useEffect(() => {
    // 300ms: envelope slides in
    addTimer(() => {
      setEnvIn(true);
    }, 300);

    // 1500ms: caption appears
    addTimer(() => {
      say('A letter has arrived for you…');
    }, 1500);

    // 5200ms: auto-open if visitor hasn't tapped the wax seal
    addTimer(() => {
      handleOpenEnvelope();
    }, 5200);

    return () => {
      clearAllTimers();
    };
  }, [addTimer, say, handleOpenEnvelope, clearAllTimers]);

  return (
    <div
      role="dialog"
      aria-label="Khath & Co. introduction"
      aria-modal="true"
      className={`${styles.introOverlay} ${isDissolving ? styles.out : ''}`}
      data-intro-theme={theme}
      onPointerMove={handlePointerMove}
    >
      {/* Top progress bar */}
      <div
        className={styles.bar}
        style={{
          width: barProgress,
          transition: barTransition
        }}
      />

      {/* Brand logo top left */}
      <div className={styles.brand}>
        Khath <b>&amp;</b> Co.
      </div>

      {/* Top right controls: Theme toggle & Skip button */}
      <div className={styles.topControls}>
        <button
          type="button"
          className={styles.themeBtn}
          onClick={() => handleSetTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Switch between day and night mode"
          title="Day / Night"
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>

        <button
          type="button"
          className={styles.skipBtn}
          onClick={handleFinale}
          style={{ opacity: isFinale ? 0 : 1, pointerEvents: isFinale ? 'none' : 'auto' }}
        >
          Skip intro
        </button>
      </div>

      {/* Floating ambient hearts */}
      <div className={styles.hearts} aria-hidden="true">
        {hearts.map((h) => (
          <i
            key={h.id}
            className={styles.heart}
            style={{
              left: `${h.left}%`,
              fontSize: `${h.fontSize}px`,
              animationDuration: `${h.duration}s`,
              animationDelay: `${h.delay}s`
            }}
          >
            ♥
          </i>
        ))}
      </div>

      {/* 3D Perspective Stage */}
      <div className={styles.stage} ref={stageRef}>
        <div className={`${styles.env} ${envIn ? styles.in : ''} ${envOpen ? styles.open : ''}`}>
          {/* Airmail stripe border & inner paper */}
          <div className={`${styles.envLayer} ${styles.stripe}`}>
            <div className={styles.stripeInner} />
          </div>

          {/* Letter with animated typing */}
          <div className={styles.letter}>
            <div className={styles.letterTo}>{toText}</div>
            <div className={styles.letterTxt}>{bodyText}</div>
          </div>

          {/* Envelope lower pocket */}
          <div className={styles.pocket} />

          {/* Envelope fold flap */}
          <div className={styles.flap} />

          {/* Interactive wax seal button */}
          <button
            ref={sealRef}
            type="button"
            className={styles.seal}
            onClick={() => {
              clearAllTimers();
              handleOpenEnvelope();
            }}
            aria-label="Break the seal"
          >
            K
          </button>

          {/* "Tap the seal to open" prompt */}
          <div
            className={styles.tapPrompt}
            style={{ opacity: envOpen ? 0 : 1 }}
          >
            tap the seal to open
          </div>
        </div>

        {/* Dynamic Caption */}
        <div className={`${styles.cap} ${captionShow ? styles.show : ''}`}>
          {caption}
        </div>

        {/* Feature Pill Chips */}
        <div className={styles.chips}>
          {CHIP_TEXTS.map((chipText, idx) => (
            <span
              key={chipText}
              className={`${styles.chip} ${chipsVisible[idx] ? styles.show : ''}`}
            >
              {chipText}
            </span>
          ))}
        </div>
      </div>

      {/* Finale Screen */}
      <div className={`${styles.finale} ${isFinale ? styles.show : ''}`}>
        <div className={styles.hi}>खत · letters for the people you miss</div>
        <div className={styles.logo}>
          Khath <b>&amp;</b> Co.
        </div>
        <p className={styles.sub}>
          Slow mail for a fast world. Ten quiet minutes, one letter, someone smiling miles away.
        </p>
        <button
          ref={enterRef}
          type="button"
          className={styles.enterBtn}
          onClick={handleEnterStudio}
        >
          Enter the studio
        </button>
      </div>
    </div>
  );
};
