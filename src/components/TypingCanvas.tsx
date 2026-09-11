import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Flame, AlertCircle, RotateCcw, MousePointerClick } from 'lucide-react';
import type { CharState, DifficultyMode, TestType, UserSettings, WpmPoint } from '../types';
import { StatsCalculator } from '../services/statsCalculator';
import { soundEngine } from '../services/soundEngine';

interface TypingCanvasProps {
  text: string;
  author?: string;
  source: string;
  testType: TestType;
  testConfig: number;
  difficulty: DifficultyMode;
  settings: UserSettings;
  externalKeyTrigger?: { key: string; timestamp: number } | null;
  onTestComplete: (stats: {
    wpm: number;
    rawWpm: number;
    netWpm: number;
    cpm: number;
    accuracy: number;
    consistency: number;
    duration: number;
    correctChars: number;
    incorrectChars: number;
    extraChars: number;
    missedKeys: Record<string, number>;
    timeline: WpmPoint[];
  }) => void;
  onResetTest: () => void;
  onKeyPressUpdate: (activeKey: string | null, targetKey: string | null) => void;
}

export const TypingCanvas: React.FC<TypingCanvasProps> = ({
  text,
  author,
  source,
  testType,
  testConfig,
  difficulty,
  settings,
  externalKeyTrigger,
  onTestComplete,
  onResetTest,
  onKeyPressUpdate,
}) => {
  const [charStates, setCharStates] = useState<CharState[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [extraCharsMap, setExtraCharsMap] = useState<Record<number, string>>({});
  
  // Test Lifecycle
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isFocused, setIsFocused] = useState<boolean>(true);

  // Live Metrics
  const [liveWpm, setLiveWpm] = useState<number>(0);
  const [liveAccuracy, setLiveAccuracy] = useState<number>(100);
  const [liveErrors, setLiveErrors] = useState<number>(0);
  const [streakCombo, setStreakCombo] = useState<number>(0);
  const [comboPopup, setComboPopup] = useState<string | null>(null);

  // Stats Tracking
  const missedKeysRef = useRef<Record<string, number>>({});
  const timelineRef = useRef<WpmPoint[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const activeCharRef = useRef<HTMLSpanElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Initialize character states when text changes
  useEffect(() => {
    const chars: CharState[] = text.split('').map((c) => ({
      char: c,
      state: 'untyped',
    }));
    setCharStates(chars);
    setCurrentIndex(0);
    setExtraCharsMap({});
    setHasStarted(false);
    setIsFinished(false);
    setElapsedTime(0);
    setLiveWpm(0);
    setLiveAccuracy(100);
    setLiveErrors(0);
    setStreakCombo(0);
    setComboPopup(null);
    missedKeysRef.current = {};
    timelineRef.current = [];

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    // Set initial target key
    if (chars.length > 0) {
      onKeyPressUpdate(null, chars[0].char);
    }
  }, [text]);

  // Focus input automatically
  const focusInput = useCallback(() => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus();
      setIsFocused(true);
    }
  }, []);

  useEffect(() => {
    focusInput();
  }, [focusInput]);

  // Global window listener to refocus input if user types anywhere
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't hijack if typing in an input or textarea (like Firebase modal)
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') && target !== hiddenInputRef.current) {
        return;
      }
      if (!isFocused && hiddenInputRef.current) {
        hiddenInputRef.current.focus();
        setIsFocused(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isFocused]);

  // Keep latest mutable references to prevent interval teardowns
  const charStatesRef = useRef<CharState[]>(charStates);
  charStatesRef.current = charStates;
  const extraCharsMapRef = useRef<Record<number, string>>(extraCharsMap);
  extraCharsMapRef.current = extraCharsMap;

  // Finish Test Routine
  const finishTest = useCallback((finalElapsed: number) => {
    if (isFinished) return;
    setIsFinished(true);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    const duration = Math.max(1, finalElapsed);
    let correct = 0;
    let incorrect = 0;
    let extra = 0;

    charStatesRef.current.forEach((c) => {
      if (c.state === 'correct') correct++;
      else if (c.state === 'incorrect') incorrect++;
    });
    Object.values(extraCharsMapRef.current).forEach((str) => {
      extra += str.length;
    });

    const totalTyped = correct + incorrect + extra;
    const finalWpm = StatsCalculator.calculateWpm(correct, duration);
    const rawWpm = StatsCalculator.calculateRawWpm(totalTyped, duration);
    const cpm = StatsCalculator.calculateCpm(correct, duration);
    const accuracy = StatsCalculator.calculateAccuracy(correct, totalTyped);

    // Ensure final timeline point exists
    const roundedSec = Math.max(1, Math.round(duration));
    const existingIdx = timelineRef.current.findIndex((p) => p.second === roundedSec);
    const finalPoint = {
      second: roundedSec,
      wpm: finalWpm,
      rawWpm,
      errors: incorrect + extra,
    };
    if (existingIdx >= 0) {
      timelineRef.current[existingIdx] = finalPoint;
    } else {
      timelineRef.current.push(finalPoint);
    }

    const consistency = StatsCalculator.calculateConsistency(timelineRef.current);

    soundEngine.playSuccessFanfare();

    onTestComplete({
      wpm: finalWpm,
      rawWpm,
      netWpm: finalWpm,
      cpm,
      accuracy,
      consistency,
      duration,
      correctChars: correct,
      incorrectChars: incorrect,
      extraChars: extra,
      missedKeys: { ...missedKeysRef.current },
      timeline: [...timelineRef.current],
    });
  }, [isFinished, onTestComplete]);

  const finishTestRef = useRef<(finalElapsed: number) => void>(finishTest);
  finishTestRef.current = finishTest;

  // Timer Tick - runs cleanly every 1 second while typing
  useEffect(() => {
    if (hasStarted && !isFinished) {
      timerIntervalRef.current = window.setInterval(() => {
        setElapsedTime((prev) => {
          const newElapsed = prev + 1;

          // Compute live metrics from latest state refs
          let correct = 0;
          let incorrect = 0;
          let extra = 0;
          charStatesRef.current.forEach((c) => {
            if (c.state === 'correct') correct++;
            else if (c.state === 'incorrect') incorrect++;
          });
          Object.values(extraCharsMapRef.current).forEach((str) => {
            extra += str.length;
          });
          const totalTyped = correct + incorrect + extra;

          const curWpm = StatsCalculator.calculateWpm(correct, newElapsed);
          const rawWpm = StatsCalculator.calculateRawWpm(totalTyped, newElapsed);
          const curAcc = StatsCalculator.calculateAccuracy(correct, totalTyped);

          setLiveWpm(curWpm);
          setLiveAccuracy(curAcc);

          // Record timeline point without duplicate seconds
          const existingIdx = timelineRef.current.findIndex((p) => p.second === newElapsed);
          const pt = {
            second: newElapsed,
            wpm: curWpm,
            rawWpm,
            errors: incorrect + extra,
          };
          if (existingIdx >= 0) {
            timelineRef.current[existingIdx] = pt;
          } else {
            timelineRef.current.push(pt);
          }

          // Check if time-based test has expired
          if (testType === 'time' && newElapsed >= testConfig) {
            finishTestRef.current(newElapsed);
          }

          return newElapsed;
        });
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [hasStarted, isFinished, testType, testConfig]);

  // Scroll active char into view smoothly
  useEffect(() => {
    if (activeCharRef.current && textContainerRef.current) {
      const el = activeCharRef.current;
      const container = textContainerRef.current;
      const topOffset = el.offsetTop - container.offsetTop;
      if (topOffset > 100) {
        container.scrollTo({ top: topOffset - 60, behavior: 'smooth' });
      }
    }
  }, [currentIndex]);

  // Core Key Processing Logic
  const processKey = useCallback((key: string, isCtrl: boolean = false, isAlt: boolean = false) => {
    if (isFinished) return;

    // Hotkey: Quick restart
    if (
      (settings.quickRestartKey === 'Tab' && key === 'Tab') ||
      (settings.quickRestartKey === 'Escape' && key === 'Escape')
    ) {
      onResetTest();
      return;
    }

    // Ignore modifier keys alone
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(key)) {
      return;
    }

    // Start timer on first printable keystroke
    if (!hasStarted) {
      setHasStarted(true);
    }

    // Update Virtual Keyboard pressed state
    onKeyPressUpdate(key, currentIndex < charStates.length ? charStates[currentIndex].char : null);
    setTimeout(() => {
      onKeyPressUpdate(null, currentIndex < charStates.length ? charStates[currentIndex].char : null);
    }, 80);

    // 1. Backspace & Delete handling
    if (key === 'Backspace' || key === 'Delete') {
      if (settings.confidenceMode) {
        return; // disabled in confidence mode
      }

      // Word Delete: Ctrl+Backspace or Ctrl+Delete or Alt+Backspace
      if (isCtrl || isAlt) {
        soundEngine.playKeySound(false);
        if (currentIndex === 0) return;

        // Find previous word boundary
        let targetIdx = currentIndex - 1;
        // Skip trailing spaces
        while (targetIdx > 0 && text[targetIdx] === ' ') {
          targetIdx--;
        }
        // Skip word characters
        while (targetIdx > 0 && text[targetIdx - 1] !== ' ') {
          targetIdx--;
        }

        setCharStates((prev) => {
          const updated = [...prev];
          for (let i = targetIdx; i < currentIndex; i++) {
            updated[i] = { ...updated[i], state: 'untyped', typedChar: undefined };
          }
          return updated;
        });
        setCurrentIndex(targetIdx);
        return;
      }

      // Single character deletion
      if (extraCharsMap[currentIndex] && extraCharsMap[currentIndex].length > 0) {
        const currentExtras = extraCharsMap[currentIndex];
        const newExtras = currentExtras.slice(0, -1);
        setExtraCharsMap((prev) => ({ ...prev, [currentIndex]: newExtras }));
        soundEngine.playKeySound(false);
        return;
      }

      if (currentIndex > 0) {
        const prevIndex = currentIndex - 1;
        setCharStates((prev) => {
          const updated = [...prev];
          updated[prevIndex] = { ...updated[prevIndex], state: 'untyped', typedChar: undefined };
          return updated;
        });
        setCurrentIndex(prevIndex);
        soundEngine.playKeySound(false);
      }
      return;
    }

    // 2. Character Input
    if (key.length === 1) {
      if (currentIndex >= charStates.length) {
        return; // Already at end
      }

      const expectedChar = charStates[currentIndex].char;
      const isCorrect = key === expectedChar;

      if (isCorrect) {
        soundEngine.playKeySound(key === ' ');

        setCharStates((prev) => {
          const updated = [...prev];
          updated[currentIndex] = { ...updated[currentIndex], state: 'correct', typedChar: key };
          return updated;
        });

        const nextIdx = currentIndex + 1;
        setCurrentIndex(nextIdx);

        // Update streak combo
        const newCombo = streakCombo + 1;
        setStreakCombo(newCombo);
        if (newCombo === 25) setComboPopup('⚡ 25 STREAK!');
        else if (newCombo === 50) setComboPopup('🔥 50 COMBO - ON FIRE!');
        else if (newCombo === 100) setComboPopup('🚀 100 STREAK - SPEED GOD!');
        if (newCombo % 25 === 0) {
          setTimeout(() => setComboPopup(null), 1800);
        }

        // Check if test finished (words mode or completed text)
        if (nextIdx >= charStates.length) {
          const currentSecs = Math.max(1, elapsedTime);
          finishTest(currentSecs);
          return;
        }

        // Target key update for keyboard
        onKeyPressUpdate(key, charStates[nextIdx] ? charStates[nextIdx].char : null);
      } else {
        // INCORRECT
        soundEngine.playErrorSound();
        setStreakCombo(0);
        setComboPopup(null);
        setLiveErrors((prev) => prev + 1);

        const lowerExpected = expectedChar.toLowerCase();
        missedKeysRef.current[lowerExpected] = (missedKeysRef.current[lowerExpected] || 0) + 1;

        setCharStates((prev) => {
          const updated = [...prev];
          updated[currentIndex] = { ...updated[currentIndex], state: 'incorrect', typedChar: key };
          return updated;
        });
        const nextIdx = currentIndex + 1;
        setCurrentIndex(nextIdx);

        if (nextIdx >= charStates.length) {
          const currentSecs = Math.max(1, elapsedTime);
          finishTest(currentSecs);
          return;
        }

        onKeyPressUpdate(key, charStates[nextIdx] ? charStates[nextIdx].char : null);
      }
    }
  }, [
    isFinished,
    settings.quickRestartKey,
    settings.confidenceMode,
    currentIndex,
    charStates,
    extraCharsMap,
    streakCombo,
    elapsedTime,
    text,
    hasStarted,
    onResetTest,
    onKeyPressUpdate,
    finishTest
  ]);

  // Handle external key triggers (e.g. from clicking on-screen keyboard)
  useEffect(() => {
    if (externalKeyTrigger) {
      processKey(externalKeyTrigger.key);
    }
  }, [externalKeyTrigger, processKey]);

  // Keydown Handler from hidden input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['Tab', 'Backspace', 'Delete', 'Escape', ' '].includes(e.key) || e.key.length === 1) {
      e.preventDefault();
    }
    processKey(e.key, e.ctrlKey || e.metaKey, e.altKey);
  };

  // Caret CSS Class
  const getCaretClass = () => {
    switch (settings.caretStyle) {
      case 'block':
        return 'caret-block';
      case 'underline':
        return 'caret-underline';
      case 'bar':
      case 'smooth':
      default:
        return 'caret-bar';
    }
  };

  // Font Size Class
  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case 'small':
        return 'text-lg md:text-xl leading-relaxed';
      case 'medium':
        return 'text-xl md:text-2xl leading-relaxed';
      case 'huge':
        return 'text-3xl md:text-4xl leading-relaxed';
      case 'large':
      default:
        return 'text-2xl md:text-3xl leading-relaxed';
    }
  };

  // Accurate Word Count Calculation
  const typedSlice = text.slice(0, currentIndex);
  const currentCompletedWords = typedSlice.length === 0 ? 0 : typedSlice.trim().split(/\s+/).filter(Boolean).length;

  // Progress computation
  const totalChars = charStates.length;
  const typedCount = currentIndex;
  const progressPercent = totalChars > 0 ? Math.min(100, Math.round((typedCount / totalChars) * 100)) : 0;

  // Remaining time for time-based mode
  const remainingTime = testType === 'time' ? Math.max(0, testConfig - elapsedTime) : elapsedTime;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
      {/* Live Stats HUD */}
      <div className="w-full flex items-center justify-between mb-4 px-2">
        {/* Left: Live WPM & Accuracy */}
        <div className="flex items-center gap-4">
          {!settings.blindMode ? (
            <>
              <div className="flex items-baseline gap-1.5 bg-white dark:bg-[#1E1E1E] px-3 py-1 border-2 border-black shadow-[2px_2px_0px_#000]">
                <span className="text-3xl font-black font-display text-neo-pink">{liveWpm}</span>
                <span className="text-xs font-bold text-gray-500 uppercase">WPM</span>
              </div>

              <div className="flex items-baseline gap-1.5 bg-white dark:bg-[#1E1E1E] px-3 py-1 border-2 border-black shadow-[2px_2px_0px_#000]">
                <span className="text-2xl font-black font-display text-neo-cyan">{liveAccuracy}%</span>
                <span className="text-xs font-bold text-gray-500 uppercase">ACC</span>
              </div>

              {liveErrors > 0 && (
                <div className="flex items-center gap-1 bg-neo-red/10 text-neo-red px-2.5 py-1 border-2 border-neo-red text-xs font-black">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{liveErrors} {liveErrors === 1 ? 'ERR' : 'ERRS'}</span>
                </div>
              )}
            </>
          ) : (
            <div className="px-3 py-1 bg-black text-white font-mono text-xs font-bold border-2 border-black">
              🕶️ BLIND MODE ACTIVE
            </div>
          )}

          {/* Combo Popup Badge */}
          {comboPopup && (
            <div className="animate-bounce-subtle px-3 py-1 bg-neo-yellow text-black font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-1">
              <Flame className="w-4 h-4 fill-neo-pink text-neo-pink" />
              <span>{comboPopup}</span>
            </div>
          )}
        </div>

        {/* Right: Accurate Word Tracking & Timer Display */}
        <div className="flex items-center gap-3">
          {/* Word Count Display */}
          {testType === 'words' && (
            <div className="flex items-center gap-2 bg-neo-yellow px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_#000]">
              <span className="text-xs font-black text-black uppercase">WORDS:</span>
              <span className="text-xl font-black font-mono text-black">
                {currentCompletedWords} / {testConfig}
              </span>
            </div>
          )}

          {/* Time Display */}
          {testType === 'time' && (
            <div className="flex items-center gap-2 bg-white dark:bg-[#1E1E1E] px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_#000]">
              <span className="text-xs font-black text-gray-500 uppercase">TIME LEFT:</span>
              <span className="text-xl font-black font-mono text-black dark:text-white">
                {remainingTime}s
              </span>
              <span className="text-xs font-bold text-gray-400 ml-1">({currentCompletedWords} words)</span>
            </div>
          )}

          {/* Zen Display */}
          {testType === 'zen' && (
            <div className="flex items-center gap-2 bg-white dark:bg-[#1E1E1E] px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_#000]">
              <span className="text-xs font-black text-gray-500 uppercase">TIME:</span>
              <span className="text-xl font-black font-mono text-black dark:text-white">{elapsedTime}s</span>
              <span className="text-xs font-bold text-gray-400 ml-1">({currentCompletedWords} words)</span>
            </div>
          )}

          {/* Quick Restart Button */}
          <button
            onClick={onResetTest}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-[#1E1E1E] border-2 border-black shadow-[2px_2px_0px_#000] font-bold text-xs hover:bg-neo-yellow transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            title={`Restart Test (${settings.quickRestartKey} or Button)`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">RESTART ({settings.quickRestartKey})</span>
          </button>
        </div>
      </div>

      {/* Main Typing Canvas Box */}
      <div 
        onClick={focusInput}
        className="w-full relative p-6 md:p-8 bg-white dark:bg-[#1E1E1E] neo-box-lg cursor-text select-none min-h-[220px] max-h-[360px] flex flex-col justify-between"
      >
        {/* Hidden physical keyboard focus capture */}
        <input
          ref={hiddenInputRef}
          type="text"
          className="absolute opacity-0 pointer-events-none -top-10 left-0"
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {/* Unfocused overlay prompt */}
        {!isFocused && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-20 flex items-center justify-center cursor-pointer">
            <div className="px-5 py-3 bg-neo-yellow border-3 border-black shadow-[4px_4px_0px_#000] flex items-center gap-2 text-black font-black uppercase text-sm tracking-wider animate-bounce-subtle">
              <MousePointerClick className="w-5 h-5" />
              <span>CLICK HERE OR PRESS ANY KEY TO TYPE</span>
            </div>
          </div>
        )}

        {/* Text rendering container */}
        <div
          ref={textContainerRef}
          className={`font-mono ${getFontSizeClass()} tracking-wide overflow-y-auto max-h-[240px] pr-2 break-words`}
          style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
        >
          {charStates.map((item, idx) => {
            const isCurrent = idx === currentIndex;
            const extra = extraCharsMap[idx];

            let charColorClass = 'char-untyped';
            if (item.state === 'correct') charColorClass = 'char-correct';
            else if (item.state === 'incorrect') charColorClass = 'char-incorrect';

            return (
              <React.Fragment key={idx}>
                <span
                  ref={isCurrent ? activeCharRef : null}
                  className={`relative ${charColorClass} ${isCurrent ? getCaretClass() : ''} transition-colors`}
                >
                  {item.char}
                </span>
                {extra && <span className="char-extra">{extra}</span>}
              </React.Fragment>
            );
          })}
        </div>

        {/* Bottom meta bar */}
        <div className="mt-6 pt-3 border-t-2 border-black dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-black text-white font-mono text-[10px] font-bold uppercase">
              {difficulty}
            </span>
            <span>Source: <strong className="text-black dark:text-white">{source}</strong></span>
            {author && <span>— <em>{author}</em></span>}
          </div>

          <div className="flex items-center gap-3">
            <span>
              Progress: <strong className="text-black dark:text-white">{progressPercent}%</strong>
              {testType === 'words' && <span className="text-[11px] text-gray-400 ml-1">({currentCompletedWords}/{testConfig} words)</span>}
            </span>
            <div className="w-20 h-2 bg-gray-200 border border-black overflow-hidden">
              <div
                className="h-full bg-neo-lime transition-all duration-200"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
