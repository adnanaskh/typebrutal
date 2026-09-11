import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  RotateCcw,
  ArrowRight,
  Zap,
  TrendingUp,
  CheckCircle,
  Crosshair,
  ChevronLeft,
  ChevronRight,
  Flame,
  Clock,
  Activity,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { TestResult, UserSettings, WpmPoint } from '../types';
import { StatsCalculator } from '../services/statsCalculator';

interface StatsDashboardProps {
  result: TestResult;
  bestWpm: number;
  settings: UserSettings;
  onNextTest: () => void;
  onRetrySameText: () => void;
  onPracticeMistakes: (troubleKeys: string[]) => void;
  onViewAnalytics: () => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  result,
  bestWpm,
  settings,
  onNextTest,
  onRetrySameText,
  onPracticeMistakes,
  onViewAnalytics,
}) => {
  const isPersonalBest = result.wpm > 0 && result.wpm >= bestWpm;
  const targetAchieved = result.wpm >= (settings.targetWpm || 70);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(false);

  // Trigger celebratory confetti if target achieved or personal best
  useEffect(() => {
    if (targetAchieved || isPersonalBest) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFE600', '#FF007A', '#00E5FF', '#00FF66', '#000000'],
        });
      } catch {
        // ignore
      }
    }
  }, [targetAchieved, isPersonalBest]);

  // Clean, Deduplicated, and Sorted Timeline Points
  const cleanTimeline = useMemo(() => {
    if (!result.timeline || !Array.isArray(result.timeline) || result.timeline.length === 0) {
      // Fallback point if timeline was somehow empty
      if (result.duration > 0 && result.wpm > 0) {
        return [
          {
            second: Math.max(1, Math.round(result.duration)),
            wpm: result.wpm,
            rawWpm: result.rawWpm,
            errors: result.incorrectChars + result.extraChars,
          },
        ];
      }
      return [];
    }

    // Map by second to eliminate duplicate seconds and keep latest point per second
    const pointMap = new Map<number, WpmPoint>();
    result.timeline.forEach((pt) => {
      if (pt && typeof pt.second === 'number' && pt.second > 0) {
        pointMap.set(pt.second, {
          second: pt.second,
          wpm: Math.max(0, Math.round(pt.wpm)),
          rawWpm: Math.max(0, Math.round(pt.rawWpm)),
          errors: Math.max(0, pt.errors || 0),
        });
      }
    });

    const sorted = Array.from(pointMap.values()).sort((a, b) => a.second - b.second);
    return sorted;
  }, [result.timeline, result.duration, result.wpm, result.rawWpm, result.incorrectChars, result.extraChars]);

  // Timeline Metrics & Y-Axis Scaling
  const targetWpm = settings.targetWpm || 70;
  const maxObservedWpm = useMemo(() => {
    if (cleanTimeline.length === 0) return Math.max(80, result.wpm, result.rawWpm);
    return Math.max(...cleanTimeline.map((p) => Math.max(p.wpm, p.rawWpm)));
  }, [cleanTimeline, result.wpm, result.rawWpm]);

  const peakWpm = useMemo(() => {
    if (cleanTimeline.length === 0) return result.wpm;
    return Math.max(...cleanTimeline.map((p) => p.wpm));
  }, [cleanTimeline, result.wpm]);

  const avgWpm = useMemo(() => {
    if (cleanTimeline.length === 0) return result.wpm;
    const total = cleanTimeline.reduce((sum, p) => sum + p.wpm, 0);
    return Math.round(total / cleanTimeline.length);
  }, [cleanTimeline, result.wpm]);

  // Rounded upper bound for WPM scale
  const maxTimelineWpm = useMemo(() => {
    const minTop = Math.max(70, targetWpm + 10, maxObservedWpm + 10);
    return Math.ceil(minTop / 20) * 20;
  }, [maxObservedWpm, targetWpm]);

  // Update scroll navigation availability
  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
    }
  };

  useEffect(() => {
    checkScrollability();
    const handleResize = () => checkScrollability();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [cleanTimeline]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScrollability, 300);
    }
  };

  // Coaching tips
  const tips = StatsCalculator.getTargetTips(result.wpm, result.accuracy, targetWpm);

  // Top missed keys
  const missedEntries = Object.entries(result.missedKeys).sort((a, b) => b[1] - a[1]);
  const troubleKeysList = missedEntries.map(([k]) => k);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      {/* Top Banner Alert / Celebration */}
      {targetAchieved ? (
        <div className="p-4 bg-neo-lime border-4 border-black shadow-[6px_6px_0px_#000] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🚀</span>
            <div>
              <h2 className="text-xl font-black font-display uppercase tracking-tight text-black">
                {targetWpm}+ WPM MILESTONE UNLOCKED!
              </h2>
              <p className="text-xs font-bold text-black/80">
                You hit {result.wpm} WPM with {result.accuracy}% accuracy! Your muscle memory is operating at pro velocity.
              </p>
            </div>
          </div>
          <span className="hidden md:inline px-3 py-1 bg-black text-neo-lime font-black text-sm uppercase">
            PRO GRADE
          </span>
        </div>
      ) : isPersonalBest && result.wpm > 30 ? (
        <div className="p-4 bg-neo-yellow border-4 border-black shadow-[6px_6px_0px_#000] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👑</span>
            <div>
              <h2 className="text-xl font-black font-display uppercase tracking-tight text-black">
                NEW PERSONAL BEST!
              </h2>
              <p className="text-xs font-bold text-black/80">
                You reached an all-time top speed of {result.wpm} WPM! Keep pushing towards your {targetWpm} WPM goal.
              </p>
            </div>
          </div>
          <span className="hidden md:inline px-3 py-1 bg-black text-neo-yellow font-black text-sm uppercase">
            PB RECORD
          </span>
        </div>
      ) : null}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Net WPM */}
        <div className="p-5 bg-neo-yellow border-4 border-black shadow-[4px_4px_0px_#000] flex flex-col justify-between">
          <span className="text-xs font-black uppercase text-black/70">NET WPM</span>
          <div className="my-2">
            <span className="text-5xl md:text-6xl font-black font-display text-black">{result.wpm}</span>
          </div>
          <span className="text-[11px] font-bold text-black/80 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" /> Words Per Minute
          </span>
        </div>

        {/* Accuracy */}
        <div className="p-5 bg-neo-cyan border-4 border-black shadow-[4px_4px_0px_#000] flex flex-col justify-between">
          <span className="text-xs font-black uppercase text-black/70">ACCURACY</span>
          <div className="my-2">
            <span className="text-5xl md:text-6xl font-black font-display text-black">{result.accuracy}%</span>
          </div>
          <span className="text-[11px] font-bold text-black/80 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> {result.correctChars} / {result.correctChars + result.incorrectChars + result.extraChars} chars
          </span>
        </div>

        {/* Raw WPM */}
        <div className="p-5 bg-white dark:bg-[#1E1E1E] border-4 border-black shadow-[4px_4px_0px_#000] flex flex-col justify-between">
          <span className="text-xs font-black uppercase text-gray-500">RAW SPEED</span>
          <div className="my-2">
            <span className="text-5xl md:text-6xl font-black font-display text-black dark:text-white">{result.rawWpm}</span>
          </div>
          <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> CPM: {result.cpm}
          </span>
        </div>

        {/* Consistency / Time */}
        <div className="p-5 bg-neo-pink border-4 border-black shadow-[4px_4px_0px_#000] flex flex-col justify-between text-white">
          <span className="text-xs font-black uppercase text-white/80">CONSISTENCY</span>
          <div className="my-2">
            <span className="text-5xl md:text-6xl font-black font-display text-white">{result.consistency}%</span>
          </div>
          <span className="text-[11px] font-bold text-white/90 flex items-center gap-1">
            ⏱️ {result.duration}s Elapsed
          </span>
        </div>
      </div>

      {/* Target Coaching Intelligence & Progress Gauge */}
      <div className="p-6 bg-white dark:bg-[#1E1E1E] neo-box flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2.5 py-1 text-xs font-black uppercase border border-black ${tips.badgeColor}`}>
              {tips.title}
            </span>
          </div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 leading-relaxed">
            {tips.description}
          </p>
        </div>

        <div className="flex flex-col items-center min-w-[200px] p-4 bg-gray-50 dark:bg-black border-2 border-black">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black font-display text-neo-pink">{tips.percentage}%</span>
            <span className="text-xs font-bold text-gray-500">TO {targetWpm} WPM</span>
          </div>
          <div className="w-full h-3 bg-gray-200 border border-black mt-2 overflow-hidden">
            <div
              className="h-full bg-neo-pink transition-all duration-700"
              style={{ width: `${tips.percentage}%` }}
            />
          </div>
          <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase">
            Target: {targetWpm} WPM Goal
          </span>
        </div>
      </div>

      {/* Timeline Chart & Missed Keys Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* WPM Over Time Timeline - Horizontally Scrollable */}
        <div className="md:col-span-2 p-5 bg-white dark:bg-[#1E1E1E] neo-box flex flex-col justify-between overflow-hidden">
          {/* Header Controls & Summary Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b-2 border-black/20 dark:border-white/20">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-neo-pink" />
                📈 Test Speed Progression (WPM / Time)
              </span>
              <span className="px-2 py-0.5 bg-gray-100 dark:bg-black font-mono text-[10px] font-bold border border-black dark:border-gray-700">
                {cleanTimeline.length}s
              </span>
            </div>

            {/* Badges & Scroll Arrows */}
            <div className="flex items-center gap-2">
              {/* Legend */}
              <div className="flex items-center gap-2.5 text-[10px] font-bold mr-1">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-neo-pink border border-black" /> Net
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-gray-400 border border-black" /> Raw
                </span>
              </div>

              {/* Scroll buttons for long tests */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleScroll('left')}
                  disabled={!canScrollLeft}
                  className={`p-1 border border-black bg-white dark:bg-black transition-all ${
                    canScrollLeft
                      ? 'hover:bg-neo-yellow active:translate-x-[-1px] cursor-pointer shadow-[1px_1px_0px_#000]'
                      : 'opacity-30 cursor-not-allowed'
                  }`}
                  title="Scroll timeline left"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleScroll('right')}
                  disabled={!canScrollRight}
                  className={`p-1 border border-black bg-white dark:bg-black transition-all ${
                    canScrollRight
                      ? 'hover:bg-neo-yellow active:translate-x-[1px] cursor-pointer shadow-[1px_1px_0px_#000]'
                      : 'opacity-30 cursor-not-allowed'
                  }`}
                  title="Scroll timeline right"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats Pill Strip */}
          <div className="flex items-center gap-3 mb-3 text-[11px] font-mono">
            <div className="px-2 py-0.5 bg-neo-yellow/20 border border-black font-bold flex items-center gap-1">
              <Flame className="w-3 h-3 text-neo-pink" /> Peak: <span className="font-black">{peakWpm} WPM</span>
            </div>
            <div className="px-2 py-0.5 bg-neo-lime/20 border border-black font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-neo-lime" /> Avg: <span className="font-black">{avgWpm} WPM</span>
            </div>
            <div className="px-2 py-0.5 bg-neo-cyan/20 border border-black font-bold flex items-center gap-1">
              <Clock className="w-3 h-3 text-neo-cyan" /> Duration: <span className="font-black">{result.duration}s</span>
            </div>
          </div>

          {/* Chart Display Area with Fixed Y-Axis & Scrollable Bar Track */}
          {cleanTimeline.length > 0 ? (
            <div className="relative flex border-2 border-black bg-gray-50 dark:bg-[#151515] overflow-hidden">
              {/* Sticky / Fixed Left Y-Axis Scale */}
              <div className="w-11 shrink-0 h-48 flex flex-col justify-between py-3 px-1 border-r-2 border-black bg-gray-100 dark:bg-[#1A1A1A] text-[9px] font-mono font-bold text-gray-500 select-none z-10">
                <span className="text-right leading-none">{maxTimelineWpm}</span>
                <span className="text-right leading-none">{Math.round(maxTimelineWpm * 0.75)}</span>
                <span className="text-right leading-none">{Math.round(maxTimelineWpm * 0.5)}</span>
                <span className="text-right leading-none">{Math.round(maxTimelineWpm * 0.25)}</span>
                <span className="text-right leading-none">0</span>
              </div>

              {/* Horizontally Scrollable Bar Canvas */}
              <div
                ref={scrollContainerRef}
                onScroll={checkScrollability}
                className="flex-1 h-48 overflow-x-auto overflow-y-hidden relative select-none scroll-smooth pb-1"
                style={{ scrollbarWidth: 'thin' }}
              >
                {/* Horizontal Guide Lines */}
                <div className="absolute inset-0 pointer-events-none z-0">
                  <div className="absolute w-full top-3 border-b border-dashed border-gray-300 dark:border-gray-800" />
                  <div className="absolute w-full top-1/4 border-b border-dashed border-gray-300 dark:border-gray-800" />
                  <div className="absolute w-full top-2/4 border-b border-dashed border-gray-300 dark:border-gray-800" />
                  <div className="absolute w-full top-3/4 border-b border-dashed border-gray-300 dark:border-gray-800" />

                  {/* Target WPM reference line */}
                  {targetWpm < maxTimelineWpm && (
                    <div
                      className="absolute w-full border-t-2 border-dashed border-neo-pink/60 flex items-center justify-end pr-2 z-0"
                      style={{
                        bottom: `${Math.min(96, Math.max(4, Math.round((targetWpm / maxTimelineWpm) * 100)))}%`,
                      }}
                    >
                      <span className="bg-neo-pink text-white text-[8px] font-black px-1 uppercase tracking-tight shadow-[1px_1px_0px_#000]">
                        Target {targetWpm}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bars Row Track */}
                <div
                  className="min-w-full h-full flex items-end gap-1.5 px-3 pt-6 pb-6 relative z-1"
                  style={{ width: `${Math.max(100, cleanTimeline.length * 42)}px` }}
                >
                  {cleanTimeline.map((pt, idx) => {
                    const heightPercent = Math.min(100, Math.max(6, Math.round((pt.wpm / maxTimelineWpm) * 100)));
                    const rawHeightPercent = Math.min(100, Math.max(6, Math.round((pt.rawWpm / maxTimelineWpm) * 100)));
                    const isTargetHit = pt.wpm >= targetWpm;

                    return (
                      <div
                        key={`timeline-pt-${pt.second}-${idx}`}
                        className="flex-1 min-w-[34px] max-w-[48px] h-full flex flex-col justify-end items-center group relative cursor-pointer"
                      >
                        {/* Interactive Tooltip Card */}
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center bg-black text-white text-[10px] font-mono px-2 py-1 z-30 border border-white shadow-[2px_2px_0px_rgba(0,0,0,0.8)] whitespace-nowrap pointer-events-none animate-in fade-in zoom-in duration-100">
                          <div className="font-bold text-neo-yellow border-b border-gray-700 pb-0.5 w-full text-center">
                            ⏱️ {pt.second}s
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-neo-pink font-bold">⚡ {pt.wpm} WPM</span>
                            <span className="text-gray-400">📈 {pt.rawWpm} Raw</span>
                          </div>
                          {pt.errors > 0 && (
                            <span className="text-neo-red font-bold text-[9px] mt-0.5">
                              ⚠️ {pt.errors} typo(s)
                            </span>
                          )}
                        </div>

                        {/* Dual Bar Graphic */}
                        <div className="w-full flex items-end justify-center gap-0.5 h-full">
                          {/* Raw Speed Bar */}
                          <div
                            className="w-1.5 bg-gray-400 dark:bg-gray-600 border-t border-x border-black/50 transition-all duration-300 opacity-70 group-hover:opacity-100"
                            style={{ height: `${rawHeightPercent}%` }}
                            title={`Raw: ${pt.rawWpm} WPM`}
                          />
                          {/* Net WPM Bar */}
                          <div
                            className={`w-2.5 border-t-2 border-x-2 border-black transition-all duration-300 ${
                              isTargetHit ? 'bg-neo-pink shadow-[0_0_6px_rgba(255,0,122,0.4)]' : 'bg-neo-pink/90'
                            } group-hover:scale-y-105 group-hover:bg-neo-pink`}
                            style={{ height: `${heightPercent}%` }}
                            title={`Net: ${pt.wpm} WPM`}
                          />
                        </div>

                        {/* X-Axis Tick Label & Error Dot */}
                        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
                          <span className="text-[9px] font-mono font-bold text-gray-500 group-hover:text-black dark:group-hover:text-white">
                            {pt.second}s
                          </span>
                          {pt.errors > 0 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-neo-red mt-0.5" title={`${pt.errors} errors`} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-44 flex items-center justify-center text-xs font-bold text-gray-400 border-2 border-dashed border-gray-300">
              No progression timeline data available for this session.
            </div>
          )}

          {/* Scroll Navigation Hint if test is longer */}
          {cleanTimeline.length > 10 && (
            <div className="mt-2 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              👈 Scroll horizontally or use arrow buttons to inspect second-by-second velocity 👉
            </div>
          )}
        </div>

        {/* Mistake Heatmap & Drill Actions */}
        <div className="p-5 bg-white dark:bg-[#1E1E1E] neo-box flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-black">
              <span className="text-xs font-black uppercase flex items-center gap-1">
                <span className="text-neo-red font-bold">⚠️</span>
                MISTAKE MAP
              </span>
              <span className="text-[11px] font-bold text-gray-500">
                {result.incorrectChars + result.extraChars} Errors
              </span>
            </div>

            {missedEntries.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-4">
                {missedEntries.slice(0, 8).map(([key, count]) => (
                  <div
                    key={key}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-neo-red/10 border-2 border-black shadow-[2px_2px_0px_#000] font-mono font-bold text-xs"
                  >
                    <span className="text-black dark:text-white uppercase">{key === ' ' ? 'SPACE' : key}</span>
                    <span className="px-1 bg-neo-red text-white text-[10px] font-black">{count}x</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-neo-lime/20 border-2 border-black text-center mb-4">
                <span className="text-2xl">🎯</span>
                <p className="text-xs font-black uppercase mt-1">Zero Typos! Flawless Precision.</p>
              </div>
            )}
          </div>

          {/* Drill My Mistakes button */}
          {troubleKeysList.length > 0 && (
            <button
              onClick={() => onPracticeMistakes(troubleKeysList)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-neo-red text-white font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_#000] hover:bg-red-600 transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            >
              <Crosshair className="w-4 h-4" />
              <span>Practice Missed Keys ({troubleKeysList.slice(0, 4).join(', ')})</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Action Bar */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={onNextTest}
          className="flex items-center gap-2 px-6 py-3.5 bg-neo-yellow text-black font-black text-sm uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000] hover:bg-yellow-400 transition-transform active:translate-x-1 active:translate-y-1 cursor-pointer"
        >
          <span>Next Test</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={onRetrySameText}
          className="flex items-center gap-2 px-5 py-3.5 bg-white dark:bg-[#1E1E1E] text-black dark:text-white font-bold text-sm uppercase border-3 border-black shadow-[4px_4px_0px_#000] hover:bg-gray-100 transition-transform active:translate-x-1 active:translate-y-1 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retry Same Text</span>
        </button>

        <button
          onClick={onViewAnalytics}
          className="flex items-center gap-2 px-5 py-3.5 bg-neo-cyan text-black font-bold text-sm uppercase border-3 border-black shadow-[4px_4px_0px_#000] hover:bg-cyan-400 transition-transform active:translate-x-1 active:translate-y-1 cursor-pointer"
        >
          <TrendingUp className="w-4 h-4" />
          <span>Full Analytics & History</span>
        </button>
      </div>
    </div>
  );
};
