import React, { useState, useEffect } from 'react';
import { isSoundEnabled, setSoundEnabled, subscribeSound } from '../utils/sound';

export const SoundCursor: React.FC = () => {
  const [soundOn, setSoundOn] = useState(isSoundEnabled);

  useEffect(() => {
    return subscribeSound((enabled) => setSoundOn(enabled));
  }, []);

  const handleToggleSound = () => {
    setSoundEnabled(!soundOn);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const finePointer = window.matchMedia('(pointer:fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reducedMotion) return;

    const cursor = document.getElementById('cursor');
    if (!cursor) return;

    cursor.style.opacity = '1';
    let x = -60;
    let y = -60;
    let tx = -60;
    let ty = -60;

    const onPointerMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      const target = e.target as HTMLElement | null;
      const isInteractive = Boolean(
        target?.closest &&
        target.closest('a, button, input, textarea, .stk, [role="button"]')
      );
      cursor.classList.toggle('big', isInteractive);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });

    let rafId: number;
    const loop = () => {
      x += (tx - x) * 0.24;
      y += (ty - y) * 0.24;
      cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div className="cursor" id="cursor" aria-hidden="true" />
      <button
        className="sound"
        id="soundBtn"
        type="button"
        onClick={handleToggleSound}
        aria-pressed={soundOn}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 9v6h4l5 4V5L8 9z" />
          <path id="soundWave" d="M17 9c1.5 1.5 1.5 4.5 0 6" opacity={soundOn ? 1 : 0} />
        </svg>
        <span>{soundOn ? 'Sound on' : 'Sound off'}</span>
      </button>
    </>
  );
};
