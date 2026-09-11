import React from 'react';
import type { DifficultyMode, TestType, TimeDuration, WordCount } from '../types';
import { Clock, AlignLeft, Infinity, ShieldAlert, Code2, Quote, Zap, Crosshair } from 'lucide-react';

interface ModeSelectorProps {
  difficulty: DifficultyMode;
  testType: TestType;
  timeDuration: TimeDuration;
  wordCount: WordCount;
  troubleKeyCount: number;
  onSelectDifficulty: (diff: DifficultyMode) => void;
  onSelectTestType: (type: TestType) => void;
  onSelectTimeDuration: (duration: TimeDuration) => void;
  onSelectWordCount: (count: WordCount) => void;
  disabled?: boolean;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  difficulty,
  testType,
  timeDuration,
  wordCount,
  troubleKeyCount,
  onSelectDifficulty,
  onSelectTestType,
  onSelectTimeDuration,
  onSelectWordCount,
  disabled = false,
}) => {
  const difficultyButtons: { id: DifficultyMode; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'beginner', label: 'Beginner', icon: <Zap className="w-3.5 h-3.5" />, color: 'hover:bg-neo-lime' },
    { id: 'intermediate', label: 'Intermediate', icon: <AlignLeft className="w-3.5 h-3.5" />, color: 'hover:bg-neo-yellow' },
    { id: 'advanced', label: 'Advanced 70+', icon: <ShieldAlert className="w-3.5 h-3.5" />, color: 'hover:bg-neo-pink' },
    { id: 'code', label: 'Code Syntax', icon: <Code2 className="w-3.5 h-3.5" />, color: 'hover:bg-neo-cyan' },
    { id: 'quotes', label: 'Quotes', icon: <Quote className="w-3.5 h-3.5" />, color: 'hover:bg-neo-purple' },
    { id: 'drill', label: `Mistakes Drill (${troubleKeyCount})`, icon: <Crosshair className="w-3.5 h-3.5" />, color: 'hover:bg-neo-red' },
  ];

  const timeOptions: TimeDuration[] = [15, 30, 60, 120];
  const wordOptions: WordCount[] = [10, 25, 50, 100];

  return (
    <div className="w-full max-w-6xl mx-auto mb-6 flex flex-col md:flex-row items-center justify-between gap-4 p-2.5 bg-white dark:bg-[#1E1E1E] neo-box">
      {/* Difficulty Selector */}
      <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
        <span className="text-xs font-black uppercase text-gray-500 mr-1 hidden lg:inline">Difficulty:</span>
        {difficultyButtons.map((btn) => {
          const isSelected = difficulty === btn.id;
          let activeBg = 'bg-black text-white';
          if (btn.id === 'beginner') activeBg = 'bg-neo-lime text-black';
          if (btn.id === 'intermediate') activeBg = 'bg-neo-yellow text-black';
          if (btn.id === 'advanced') activeBg = 'bg-neo-pink text-white';
          if (btn.id === 'code') activeBg = 'bg-neo-cyan text-black';
          if (btn.id === 'quotes') activeBg = 'bg-neo-purple text-white';
          if (btn.id === 'drill') activeBg = 'bg-neo-red text-white';

          return (
            <button
              key={btn.id}
              disabled={disabled}
              onClick={() => onSelectDifficulty(btn.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 border-2 border-black text-xs font-black uppercase tracking-wider transition-all active:translate-x-0.5 active:translate-y-0.5 ${
                isSelected
                  ? `${activeBg} shadow-[2px_2px_0px_#000]`
                  : `bg-transparent text-black dark:text-white ${btn.color}`
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {btn.icon}
              <span>{btn.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mode & Config Selector */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
        {/* Test Type */}
        <div className="flex items-center bg-gray-100 dark:bg-black p-1 border-2 border-black">
          <button
            disabled={disabled}
            onClick={() => onSelectTestType('time')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-black uppercase border border-black transition-all ${
              testType === 'time' ? 'bg-neo-yellow text-black shadow-[1px_1px_0px_#000]' : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Time</span>
          </button>
          <button
            disabled={disabled}
            onClick={() => onSelectTestType('words')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-black uppercase border border-black transition-all ${
              testType === 'words' ? 'bg-neo-yellow text-black shadow-[1px_1px_0px_#000]' : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
            <span>Words</span>
          </button>
          <button
            disabled={disabled}
            onClick={() => onSelectTestType('zen')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-black uppercase border border-black transition-all ${
              testType === 'zen' ? 'bg-neo-yellow text-black shadow-[1px_1px_0px_#000]' : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            <Infinity className="w-3.5 h-3.5" />
            <span>Zen</span>
          </button>
        </div>

        {/* Quantities for Time or Words */}
        {testType === 'time' && (
          <div className="flex items-center gap-1">
            {timeOptions.map((t) => (
              <button
                key={t}
                disabled={disabled}
                onClick={() => onSelectTimeDuration(t)}
                className={`px-2 py-1 text-xs font-black border-2 border-black transition-all ${
                  timeDuration === t
                    ? 'bg-neo-pink text-white shadow-[2px_2px_0px_#000]'
                    : 'bg-white dark:bg-[#1E1E1E] text-black dark:text-white hover:bg-gray-100'
                }`}
              >
                {t}s
              </button>
            ))}
          </div>
        )}

        {testType === 'words' && (
          <div className="flex items-center gap-1">
            {wordOptions.map((w) => (
              <button
                key={w}
                disabled={disabled}
                onClick={() => onSelectWordCount(w)}
                className={`px-2 py-1 text-xs font-black border-2 border-black transition-all ${
                  wordCount === w
                    ? 'bg-neo-pink text-white shadow-[2px_2px_0px_#000]'
                    : 'bg-white dark:bg-[#1E1E1E] text-black dark:text-white hover:bg-gray-100'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
