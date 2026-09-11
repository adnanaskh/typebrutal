import React from 'react';
import { Flame, Volume2, VolumeX, BarChart3, Settings, Keyboard, Target, Sparkles } from 'lucide-react';
import type { UserSettings, StreakData, ThemeMode, UserProfile } from '../types';

interface HeaderProps {
  settings: UserSettings;
  streak: StreakData;
  rollingWpm: number;
  currentUser: UserProfile | null;
  isSyncing: boolean;
  activeView: 'trainer' | 'analytics';
  onViewChange: (view: 'trainer' | 'analytics') => void;
  onOpenSettings: () => void;
  onOpenFirebaseModal: () => void;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  streak,
  rollingWpm,
  currentUser,
  isSyncing,
  activeView,
  onViewChange,
  onOpenSettings,
  onOpenFirebaseModal,
  onUpdateSettings,
}) => {
  const toggleSound = () => {
    if (settings.soundProfile === 'off') {
      onUpdateSettings({ soundProfile: 'cherry-blue' });
    } else {
      onUpdateSettings({ soundProfile: 'off' });
    }
  };

  const cycleTheme = () => {
    const themes: ThemeMode[] = ['cyber-yellow', 'neo-dark', 'pastel-punch', 'matrix-acid'];
    const nextIdx = (themes.indexOf(settings.theme) + 1) % themes.length;
    onUpdateSettings({ theme: themes[nextIdx] });
  };

  const progressPercent = Math.min(100, Math.round((rollingWpm / (settings.targetWpm || 70)) * 100));

  return (
    <header className="w-full max-w-6xl mx-auto mb-6 flex flex-col md:flex-row items-center justify-between gap-4 p-3 bg-white dark:bg-[#1E1E1E] neo-box">
      {/* Brand Title */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => onViewChange('trainer')}
          className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
        >
          <div className="w-10 h-10 bg-neo-yellow border-2 border-black flex items-center justify-center font-black text-xl shadow-[2px_2px_0px_#000] group-hover:rotate-6 transition-transform">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-tighter uppercase font-display">
                TYPE<span className="text-neo-pink">BRUTAL</span>
              </span>
              <span className="px-1.5 py-0.5 bg-black text-neo-yellow text-[10px] font-black uppercase tracking-wider border border-black">
                70+ WPM
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">
              Deliberate Muscle Memory & Speed Forge
            </p>
          </div>
        </button>
      </div>

      {/* Center stats / 70 WPM target badge */}
      <div className="flex items-center gap-3">
        {/* Streak Counter */}
        <div 
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neo-orange/20 border-2 border-black shadow-[2px_2px_0px_#000] font-bold text-sm"
          title={`Active Day Streak: ${streak.currentStreak} Days (Best: ${streak.bestStreak})`}
        >
          <Flame className={`w-4 h-4 ${streak.currentStreak > 0 ? 'text-neo-orange fill-neo-orange animate-bounce-subtle' : 'text-gray-400'}`} />
          <span>{streak.currentStreak} <span className="text-xs text-gray-600 dark:text-gray-300 font-normal">DAY{streak.currentStreak === 1 ? '' : 'S'}</span></span>
        </div>

        {/* 70 WPM Goal Target */}
        <div 
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-neo-yellow/20 border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-bold"
          title={`10-Test Rolling Average: ${rollingWpm} WPM. Target: ${settings.targetWpm} WPM`}
        >
          <Target className="w-4 h-4 text-neo-pink" />
          <div className="flex flex-col">
            <div className="flex justify-between gap-2">
              <span>GOAL: {settings.targetWpm} WPM</span>
              <span className="font-extrabold text-neo-pink">{progressPercent}%</span>
            </div>
            <div className="w-24 h-2 bg-gray-200 border border-black overflow-hidden mt-0.5">
              <div 
                className="h-full bg-neo-pink transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        {/* Google Auth / Cloud Sync Status Button */}
        {currentUser ? (
          <button
            onClick={onOpenFirebaseModal}
            className="flex items-center gap-2 px-2.5 py-1.5 bg-neo-lime/30 border-2 border-black font-black text-xs shadow-[2px_2px_0px_#000] transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            title="Google Connected & Cloud Synced - Click to view status"
          >
            <div className="w-5 h-5 bg-neo-yellow border border-black flex items-center justify-center font-black text-[10px] text-black">
              {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="hidden md:inline font-bold max-w-[100px] truncate">
              {currentUser.displayName?.split(' ')[0] || 'User'}
            </span>
            <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-neo-yellow animate-ping' : 'bg-neo-lime'}`} />
          </button>
        ) : (
          <button
            onClick={onOpenFirebaseModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-black border-2 border-black font-black text-xs shadow-[2px_2px_0px_#000] transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer hover:bg-gray-100"
            title="Sign in with Google to save progress to Firebase Firestore"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="hidden sm:inline">GOOGLE SIGN IN</span>
          </button>
        )}

        {/* Switch to Analytics or Trainer */}
        <button
          onClick={() => onViewChange(activeView === 'trainer' ? 'analytics' : 'trainer')}
          className={`flex items-center gap-1.5 px-3 py-1.5 border-2 border-black font-bold text-xs shadow-[2px_2px_0px_#000] transition-transform active:translate-x-0.5 active:translate-y-0.5 ${
            activeView === 'analytics' ? 'bg-neo-pink text-white' : 'bg-neo-cyan text-black'
          }`}
          title="Toggle Analytics & Streak History"
        >
          {activeView === 'trainer' ? (
            <>
              <BarChart3 className="w-4 h-4" />
              <span>STATS</span>
            </>
          ) : (
            <>
              <Keyboard className="w-4 h-4" />
              <span>TRAIN</span>
            </>
          )}
        </button>

        {/* Sound toggle & quick switch */}
        <button
          onClick={toggleSound}
          className={`p-2 border-2 border-black shadow-[2px_2px_0px_#000] font-bold transition-transform active:translate-x-0.5 active:translate-y-0.5 ${
            settings.soundProfile !== 'off' ? 'bg-neo-lime text-black' : 'bg-gray-200 text-gray-500'
          }`}
          title={`Sound: ${settings.soundProfile !== 'off' ? settings.soundProfile.toUpperCase() : 'MUTED'} (Click to toggle)`}
        >
          {settings.soundProfile !== 'off' ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Theme cycle button */}
        <button
          onClick={cycleTheme}
          className="p-2 bg-white dark:bg-black border-2 border-black shadow-[2px_2px_0px_#000] font-bold transition-transform active:translate-x-0.5 active:translate-y-0.5"
          title={`Current Theme: ${settings.theme}. Click to cycle theme.`}
        >
          <Sparkles className="w-4 h-4 text-neo-yellow" />
        </button>

        {/* Settings modal trigger */}
        <button
          onClick={onOpenSettings}
          className="p-2 bg-neo-yellow border-2 border-black shadow-[2px_2px_0px_#000] font-bold transition-transform active:translate-x-0.5 active:translate-y-0.5"
          title="Open Settings & Customizations"
        >
          <Settings className="w-4 h-4 text-black" />
        </button>
      </div>
    </header>
  );
};
