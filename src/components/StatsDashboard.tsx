import React, { useEffect } from 'react';
import { RotateCcw, ArrowRight, Zap, TrendingUp, CheckCircle, Crosshair } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { TestResult, UserSettings } from '../types';
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

  // Trigger celebratory confetti if target achieved or personal best
  useEffect(() => {
    if (targetAchieved || isPersonalBest) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFE600', '#FF007A', '#00E5FF', '#00FF66', '#000000']
        });
      } catch {
        // ignore
      }
    }
  }, [targetAchieved, isPersonalBest]);

  // Timeline chart metrics
  const timeline = result.timeline;
  const maxTimelineWpm = Math.max(80, ...(timeline.map((p) => Math.max(p.wpm, p.rawWpm))));

  // Coaching tips
  const tips = StatsCalculator.getTargetTips(result.wpm, result.accuracy, settings.targetWpm || 70);

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
                70+ WPM MILESTONE UNLOCKED!
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
                You reached an all-time top speed of {result.wpm} WPM! Keep pushing towards your 70 WPM goal.
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

      {/* 70 WPM Coaching Intelligence & Progress Gauge */}
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
            <span className="text-xs font-bold text-gray-500">TO 70 WPM</span>
          </div>
          <div className="w-full h-3 bg-gray-200 border border-black mt-2 overflow-hidden">
            <div
              className="h-full bg-neo-pink transition-all duration-700"
              style={{ width: `${tips.percentage}%` }}
            />
          </div>
          <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase">
            Target: 70 WPM Goal
          </span>
        </div>
      </div>

      {/* Timeline Chart & Missed Keys Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* WPM Over Time Timeline */}
        <div className="md:col-span-2 p-5 bg-white dark:bg-[#1E1E1E] neo-box flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black uppercase tracking-wider">
              📈 Test Speed Progression (WPM / Time)
            </span>
            <div className="flex items-center gap-3 text-[11px] font-bold">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-neo-pink border border-black" /> WPM</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-gray-400 border border-black" /> Raw</span>
            </div>
          </div>

          {timeline.length > 0 ? (
            <div className="h-44 w-full flex items-end gap-1.5 pt-4 pb-1 px-2 border-b-2 border-l-2 border-black bg-gray-50 dark:bg-[#151515]">
              {timeline.map((pt, idx) => {
                const heightPercent = Math.min(100, Math.max(10, Math.round((pt.wpm / maxTimelineWpm) * 100)));
                const rawHeightPercent = Math.min(100, Math.max(10, Math.round((pt.rawWpm / maxTimelineWpm) * 100)));

                return (
                  <div key={idx} className="flex-1 flex items-end justify-center gap-0.5 h-full group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center bg-black text-white text-[10px] font-mono px-1.5 py-0.5 z-10 whitespace-nowrap">
                      <span>{pt.second}s: {pt.wpm} WPM</span>
                      {pt.errors > 0 && <span className="text-neo-red">{pt.errors} err</span>}
                    </div>

                    {/* Raw bar */}
                    <div
                      className="w-1.5 bg-gray-400 opacity-60 rounded-t-sm"
                      style={{ height: `${rawHeightPercent}%` }}
                    />
                    {/* WPM bar */}
                    <div
                      className="w-2 bg-neo-pink border border-black rounded-t-sm"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-xs font-bold text-gray-400">
              Complete more seconds of typing to render progression curve.
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
