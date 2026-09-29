import React, { useState, useRef, useEffect, useCallback } from 'react';

interface VoiceWizardProps {
  onAttach?: (blob: Blob, durationSeconds: number) => void;
  onClose?: () => void;
  isOpen: boolean;
}

type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';

const MAX_SECONDS = 60;

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const VoiceWizard: React.FC<VoiceWizardProps> = ({ onAttach, onClose, isOpen }) => {
  const [state, setState] = useState<RecordingState>('idle');
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [waveAmplitudes, setWaveAmplitudes] = useState<number[]>(Array(20).fill(0.15));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!window.MediaRecorder || !navigator.mediaDevices) {
      setIsSupported(false);
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopTimer();
      stopStream();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset when closed
  useEffect(() => {
    if (!isOpen) {
      handleDelete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const stopTimer = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const animateWave = useCallback(() => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    // Sample 20 evenly spaced values for the waveform bars
    const step = Math.floor(dataArray.length / 20);
    const amplitudes = Array.from({ length: 20 }, (_, i) => {
      const val = dataArray[i * step] / 255;
      return Math.max(0.07, val);
    });
    setWaveAmplitudes(amplitudes);
    animFrameRef.current = requestAnimationFrame(animateWave);
  }, []);

  const handleStartRecording = async () => {
    if (!isSupported) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up analyser for waveform
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stopStream();
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        setWaveAmplitudes(Array(20).fill(0.15));
      };

      mr.start(250);
      setState('recording');
      setSecondsElapsed(0);

      timerRef.current = window.setInterval(() => {
        setSecondsElapsed(s => {
          if (s + 1 >= MAX_SECONDS) {
            handleStopRecording();
            return MAX_SECONDS;
          }
          return s + 1;
        });
      }, 1000);

      animFrameRef.current = requestAnimationFrame(animateWave);
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionDenied(true);
      }
    }
  };

  const handlePauseRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
      setState('paused');
      stopTimer();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setWaveAmplitudes(Array(20).fill(0.15));
    }
  };

  const handleResumeRecording = () => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
      setState('recording');
      timerRef.current = window.setInterval(() => {
        setSecondsElapsed(s => {
          if (s + 1 >= MAX_SECONDS) {
            handleStopRecording();
            return MAX_SECONDS;
          }
          return s + 1;
        });
      }, 1000);
      animFrameRef.current = requestAnimationFrame(animateWave);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    stopTimer();
    setState('stopped');
  };

  const handleDelete = () => {
    stopTimer();
    stopStream();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setAudioBlob(null);
    setState('idle');
    setSecondsElapsed(0);
    setPermissionDenied(false);
    setWaveAmplitudes(Array(20).fill(0.15));
  };

  const handleAttach = () => {
    if (audioBlob && onAttach) {
      onAttach(audioBlob, secondsElapsed);
    }
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="voice-wizard-panel" role="dialog" aria-label="Voice Wizard" aria-modal="false">
      <div className="voice-wizard-header">
        <span className="voice-wizard-title">Voice Wizard</span>
        <span className="voice-wizard-subtitle">Leave a little of your voice behind.</span>
        {onClose && (
          <button type="button" className="voice-wizard-close" onClick={onClose} aria-label="Close Voice Wizard">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="1" y1="1" x2="13" y2="13" /><line x1="13" y1="1" x2="1" y2="13" />
            </svg>
          </button>
        )}
      </div>

      {!isSupported ? (
        <div className="voice-wizard-fallback">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
          </svg>
          <p>Voice recording is not supported in this browser. Try Chrome or Safari to leave a voice message.</p>
        </div>
      ) : permissionDenied ? (
        <div className="voice-wizard-fallback">
          <p className="voice-wizard-permission-msg">
            Microphone access was denied. Please allow microphone access in your browser settings to record a voice note.
          </p>
          <button type="button" className="voice-wizard-action-btn" onClick={() => setPermissionDenied(false)}>
            Try again
          </button>
        </div>
      ) : (
        <>
          {/* Waveform + Timer */}
          <div className="voice-wizard-display">
            <div className="voice-wizard-timer" aria-live="polite" aria-label={`Recording time: ${formatDuration(secondsElapsed)}`}>
              {formatDuration(secondsElapsed)}
              {state === 'recording' && <span className="voice-rec-dot" aria-hidden="true" />}
            </div>
            <div className="voice-wizard-waveform" aria-hidden="true">
              {waveAmplitudes.map((amp, i) => (
                <div
                  key={i}
                  className={`waveform-bar ${state === 'recording' ? 'active' : ''}`}
                  style={{ height: `${Math.round(amp * 100)}%` }}
                />
              ))}
            </div>
            {state !== 'idle' && (
              <div className="voice-wizard-limit-hint">
                {MAX_SECONDS - secondsElapsed}s remaining
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="voice-wizard-controls">
            {state === 'idle' && (
              <button
                type="button"
                className="voice-wizard-btn voice-wizard-btn-record"
                onClick={handleStartRecording}
                aria-label="Start recording"
                title="Start recording"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                </svg>
                <span>Begin</span>
              </button>
            )}

            {state === 'recording' && (
              <>
                <button type="button" className="voice-wizard-btn" onClick={handlePauseRecording} aria-label="Pause recording" title="Pause">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                  <span>Pause</span>
                </button>
                <button type="button" className="voice-wizard-btn voice-wizard-btn-stop" onClick={handleStopRecording} aria-label="Stop recording" title="Stop">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                  </svg>
                  <span>Stop</span>
                </button>
              </>
            )}

            {state === 'paused' && (
              <>
                <button type="button" className="voice-wizard-btn" onClick={handleResumeRecording} aria-label="Resume recording" title="Resume">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                  <span>Resume</span>
                </button>
                <button type="button" className="voice-wizard-btn voice-wizard-btn-stop" onClick={handleStopRecording} aria-label="Stop recording" title="Stop">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                  </svg>
                  <span>Stop</span>
                </button>
              </>
            )}

            {state === 'stopped' && audioUrl && (
              <>
                <audio
                  controls
                  src={audioUrl}
                  className="voice-wizard-audio"
                  aria-label="Recorded voice message"
                  preload="metadata"
                />
                <div className="voice-wizard-stopped-actions">
                  <button type="button" className="voice-wizard-btn" onClick={handleDelete} aria-label="Delete recording and start over" title="Delete">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6" /><path d="M14 11v6" />
                    </svg>
                    <span>Delete</span>
                  </button>
                  {onAttach && (
                    <button type="button" className="voice-wizard-btn voice-wizard-btn-save" onClick={handleAttach} aria-label="Attach voice note to letter" title="Attach to letter">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                        <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
                      </svg>
                      <span>Attach to Letter</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {state === 'idle' && (
            <p className="voice-wizard-hint">
              Your voice note will be attached to this letter. Recording is limited to 60 seconds.
            </p>
          )}
        </>
      )}
    </div>
  );
};
