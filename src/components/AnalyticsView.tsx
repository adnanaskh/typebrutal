import React, { useState } from 'react';
import { 
  Flame, 
  TrendingUp, 
  Target, 
  Crosshair, 
  Download, 
  Upload, 
  Trash2, 
  ArrowLeft,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import type { TestResult, StreakData, UserSettings } from '../types';
import { StorageService } from '../services/storageService';
import { firebaseService } from '../services/firebaseService';

interface AnalyticsViewProps {
  history: TestResult[];
  streak: StreakData;
  settings: UserSettings;
  onBackToTrainer: () => void;
  onStartDrill: (keys: string[]) => void;
  onDataModified: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  history,
  streak,
  settings,
  onBackToTrainer,
  onStartDrill,
  onDataModified,
}) => {
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState<boolean>(false);

  // Compute metrics
  const summary = StorageService.getStatsSummary();
  const topTroubleKeys = StorageService.getTopTroubleKeys(8);

  // Filter history
  const filteredHistory = filterDifficulty === 'all' 
    ? history 
    : history.filter(h => h.difficulty === filterDifficulty);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) return `${hrs}h ${mins % 60}m`;
    return `${mins}m ${seconds % 60}s`;
  };

  // Export data
  const handleExport = () => {
    const json = StorageService.exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `typebrutal-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import data
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = StorageService.importData(content);
      if (success) {
        setImportStatus('✅ Data imported successfully!');
        onDataModified();
      } else {
        setImportStatus('❌ Failed to parse data file.');
      }
      setTimeout(() => setImportStatus(null), 3000);
    };
    reader.readAsText(file);
  };

  // Reset and delete all data of user, and go back to trainer page
  const executeReset = async () => {
    try {
      StorageService.resetAllData();
      await firebaseService.resetCloudData();
    } catch (err) {
      console.warn('Reset error:', err);
    }
    onDataModified();
    onBackToTrainer();
    window.location.href = '/';
  };

  // 70 WPM Goal Stages
  const stages = [
    { label: 'Novice', threshold: 30, color: 'bg-neo-yellow' },
    { label: 'Intermediate', threshold: 45, color: 'bg-neo-orange' },
    { label: 'Fast Typist', threshold: 60, color: 'bg-neo-cyan' },
    { label: `${settings.targetWpm || 70} WPM Goal`, threshold: settings.targetWpm || 70, color: 'bg-neo-pink' },
    { label: 'Master (90+)', threshold: 90, color: 'bg-neo-lime' },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 p-2">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-[#1E1E1E] neo-box">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToTrainer}
            className="p-2 bg-neo-yellow border-2 border-black font-bold shadow-[2px_2px_0px_#000] hover:bg-yellow-400 transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            title="Back to Typing Trainer"
          >
            <ArrowLeft className="w-5 h-5 text-black" />
          </button>
          <div>
            <h1 className="text-2xl font-black font-display uppercase tracking-tight">
              PERFORMANCE <span className="text-neo-pink">ANALYTICS</span>
            </h1>
            <p className="text-xs font-semibold text-gray-500">
              Long-term progress, rolling averages & muscle memory diagnostics
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-black border-2 border-black text-xs font-bold shadow-[2px_2px_0px_#000] hover:bg-gray-100 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-black border-2 border-black text-xs font-bold shadow-[2px_2px_0px_#000] hover:bg-gray-100 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>

          {/* Prominent Reset Stat Button */}
          <button
            onClick={() => setShowResetConfirmModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neo-red text-white border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0px_#000] hover:bg-red-600 transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            title="Reset All Stats and Test History"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Stats</span>
          </button>
        </div>
      </div>

      {importStatus && (
        <div className="p-3.5 bg-neo-lime border-3 border-black text-xs font-black shadow-[3px_3px_0px_#000] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-black" />
          <span>{importStatus}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-neo-yellow border-3 border-black shadow-[3px_3px_0px_#000]">
          <span className="text-[11px] font-black uppercase text-black/70">10-TEST ROLLING</span>
          <p className="text-3xl font-black font-display text-black mt-1">{summary.rolling10Wpm} <span className="text-xs">WPM</span></p>
        </div>

        <div className="p-4 bg-neo-lime border-3 border-black shadow-[3px_3px_0px_#000]">
          <span className="text-[11px] font-black uppercase text-black/70">PERSONAL BEST</span>
          <p className="text-3xl font-black font-display text-black mt-1">{summary.bestWpm} <span className="text-xs">WPM</span></p>
        </div>

        <div className="p-4 bg-neo-cyan border-3 border-black shadow-[3px_3px_0px_#000]">
          <span className="text-[11px] font-black uppercase text-black/70">AVG ACCURACY</span>
          <p className="text-3xl font-black font-display text-black mt-1">{summary.averageAccuracy}%</p>
        </div>

        <div className="p-4 bg-neo-orange/20 border-3 border-black shadow-[3px_3px_0px_#000]">
          <span className="text-[11px] font-black uppercase text-gray-500">DAY STREAK</span>
          <p className="text-3xl font-black font-display text-black dark:text-white mt-1 flex items-center gap-1">
            <Flame className="w-6 h-6 text-neo-orange fill-neo-orange" />
            {streak.currentStreak}
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-[#1E1E1E] border-3 border-black shadow-[3px_3px_0px_#000]">
          <span className="text-[11px] font-black uppercase text-gray-500">TESTS TAKEN</span>
          <p className="text-3xl font-black font-display text-black dark:text-white mt-1">{summary.totalTests}</p>
        </div>

        <div className="p-4 bg-neo-pink border-3 border-black shadow-[3px_3px_0px_#000] text-white">
          <span className="text-[11px] font-black uppercase text-white/80">TOTAL TIME</span>
          <p className="text-2xl font-black font-display mt-1">{formatTime(summary.totalTimeSeconds)}</p>
        </div>
      </div>

      {/* 70 WPM Goal Roadmap & Speed Progress */}
      <div className="p-6 bg-white dark:bg-[#1E1E1E] neo-box">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 pb-3 border-b-2 border-black">
          <div>
            <h2 className="text-lg font-black font-display uppercase flex items-center gap-2">
              <Target className="w-5 h-5 text-neo-pink" />
              ROADMAP TO {settings.targetWpm || 70}+ WPM TARGET
            </h2>
            <p className="text-xs font-semibold text-gray-500">
              Current 10-Test Pace: <strong>{summary.rolling10Wpm} WPM</strong> — {summary.target70Progress}% to your target goal.
            </p>
          </div>
          <span className="px-3 py-1 bg-neo-pink text-white font-black text-xs uppercase border border-black shadow-[2px_2px_0px_#000]">
            {summary.rolling10Wpm >= (settings.targetWpm || 70) ? '🎯 GOAL CONQUERED!' : `${Math.max(0, (settings.targetWpm || 70) - summary.rolling10Wpm)} WPM TO GO`}
          </span>
        </div>

        {/* Milestone Milestones Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
          {stages.map((stg) => {
            const reached = summary.bestWpm >= stg.threshold;
            return (
              <div
                key={stg.label}
                className={`p-3 border-2 border-black text-center ${
                  reached ? `${stg.color} shadow-[2px_2px_0px_#000]` : 'bg-gray-100 dark:bg-black opacity-60'
                }`}
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  {reached && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
                  <span className="text-xs font-black uppercase text-black dark:text-white">{stg.label}</span>
                </div>
                <span className="text-lg font-black font-mono text-black dark:text-white">{stg.threshold}+ WPM</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historical WPM Progression Chart & Trouble Keys */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progression Chart */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-[#1E1E1E] neo-box flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-neo-pink" />
              WPM Historical Progression (Recent 25 Tests)
            </h3>
            <span className="text-xs font-bold text-gray-500">
              Target Line: {settings.targetWpm || 70} WPM
            </span>
          </div>

          {history.length > 0 ? (
            <div className="h-52 w-full flex items-end gap-1.5 pt-6 pb-2 px-2 border-b-2 border-l-2 border-black bg-gray-50 dark:bg-[#151515] relative">
              {/* Target guide line */}
              <div 
                className="absolute left-0 right-0 border-t-2 border-dashed border-neo-pink z-0 flex items-center justify-end pr-2 pointer-events-none"
                style={{ bottom: `${Math.min(95, Math.max(10, Math.round(((settings.targetWpm || 70) / 100) * 100)))}%` }}
              >
                <span className="text-[10px] font-black text-neo-pink bg-white dark:bg-black px-1 border border-neo-pink">
                  {settings.targetWpm || 70} WPM GOAL
                </span>
              </div>

              {history.slice(0, 25).reverse().map((test, idx) => {
                const heightPercent = Math.min(100, Math.max(8, Math.round((test.wpm / 100) * 100)));
                const isGoal = test.wpm >= (settings.targetWpm || 70);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group relative z-10">
                    {/* Tooltip */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center bg-black text-white text-[10px] font-mono px-2 py-1 z-20 whitespace-nowrap border border-white">
                      <span>{test.wpm} WPM ({test.accuracy}%)</span>
                      <span className="text-gray-400">{test.difficulty} • {test.date.slice(5)}</span>
                    </div>

                    {/* Bar */}
                    <div
                      className={`w-full max-w-[18px] border border-black rounded-t-sm transition-all ${
                        isGoal ? 'bg-neo-lime' : 'bg-neo-yellow group-hover:bg-neo-pink'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center text-xs font-bold text-gray-400">
              Complete typing tests to build your progression history!
            </div>
          )}
        </div>

        {/* All-Time Trouble Keys & Quick Drill */}
        <div className="p-6 bg-white dark:bg-[#1E1E1E] neo-box flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-black">
              <h3 className="text-sm font-black uppercase flex items-center gap-1.5">
                <Crosshair className="w-4 h-4 text-neo-red" />
                TROUBLE KEYS RADAR
              </h3>
              <span className="text-[11px] font-bold text-gray-500">
                Lifetime Typos
              </span>
            </div>

            {topTroubleKeys.length > 0 ? (
              <div className="flex flex-col gap-2 mb-4">
                {topTroubleKeys.map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-black border border-black">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 bg-neo-red text-white font-mono font-black text-sm flex items-center justify-center border border-black uppercase">
                        {item.key === ' ' ? 'SPC' : item.key}
                      </span>
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                        {item.count} total mistakes
                      </span>
                    </div>
                    <span className="text-xs font-black font-mono text-neo-red">
                      {Math.round(item.errorRate)}% error share
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs font-bold text-gray-400">
                No mistake data recorded yet.
              </div>
            )}
          </div>

          {topTroubleKeys.length > 0 && (
            <button
              onClick={() => onStartDrill(topTroubleKeys.map(k => k.key))}
              className="w-full flex items-center justify-center gap-2 py-3 bg-neo-red text-white font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_#000] hover:bg-red-600 transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            >
              <Crosshair className="w-4 h-4" />
              <span>Launch Targeted Mistake Drill</span>
            </button>
          )}
        </div>
      </div>

      {/* Test History Table */}
      <div className="p-6 bg-white dark:bg-[#1E1E1E] neo-box">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b-2 border-black">
          <h3 className="text-sm font-black uppercase flex items-center gap-2">
            📜 Complete Session History ({filteredHistory.length})
          </h3>

          {/* Filter tabs */}
          <div className="flex items-center gap-1">
            {['all', 'beginner', 'intermediate', 'advanced', 'code', 'quotes', 'drill'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterDifficulty(cat)}
                className={`px-2 py-1 text-[11px] font-black uppercase border border-black transition-all ${
                  filterDifficulty === cat
                    ? 'bg-neo-yellow text-black shadow-[1px_1px_0px_#000]'
                    : 'bg-gray-100 dark:bg-black text-gray-600 dark:text-gray-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-black bg-gray-100 dark:bg-black text-[11px] font-black uppercase">
                  <th className="p-2.5">Date / Time</th>
                  <th className="p-2.5">WPM</th>
                  <th className="p-2.5">Raw WPM</th>
                  <th className="p-2.5">Accuracy</th>
                  <th className="p-2.5">Consistency</th>
                  <th className="p-2.5">Mode</th>
                  <th className="p-2.5">Difficulty</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((test) => (
                  <tr key={test.id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-neo-yellow/10">
                    <td className="p-2.5 text-gray-600 dark:text-gray-400">{test.date}</td>
                    <td className="p-2.5 font-bold">
                      <span className={`px-1.5 py-0.5 border border-black ${test.wpm >= 70 ? 'bg-neo-lime text-black font-black' : 'bg-neo-yellow text-black'}`}>
                        {test.wpm}
                      </span>
                    </td>
                    <td className="p-2.5 text-gray-600 dark:text-gray-300">{test.rawWpm}</td>
                    <td className="p-2.5 font-bold text-emerald-600 dark:text-emerald-400">{test.accuracy}%</td>
                    <td className="p-2.5 text-gray-600 dark:text-gray-300">{test.consistency}%</td>
                    <td className="p-2.5 uppercase">{test.testType} ({test.testConfig})</td>
                    <td className="p-2.5">
                      <span className="px-1.5 py-0.5 bg-black text-white text-[10px] font-black uppercase">
                        {test.difficulty}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs font-bold text-gray-400">
            No tests match this filter.
          </div>
        )}
      </div>

      {/* In-App Confirmation Modal for Reset Stats */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#1E1E1E] border-4 border-black shadow-[8px_8px_0px_#000] p-6">
            <div className="flex items-center gap-3 text-neo-red mb-3">
              <div className="w-10 h-10 bg-neo-red text-white flex items-center justify-center border-2 border-black font-black text-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-black dark:text-white">
                RESET ALL STATISTICS?
              </h3>
            </div>

            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              This action will permanently delete all your saved typing test records, personal bests, daily streak history, and trouble key error heatmaps from local storage and the cloud.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-black text-black dark:text-white font-bold text-xs uppercase border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-gray-300 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={executeReset}
                className="px-5 py-2 bg-neo-red text-white font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-red-600 transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
              >
                Yes, Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
