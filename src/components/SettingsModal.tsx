import React from 'react';
import { X, Volume2, Palette, Sliders, Type, Keyboard, Target } from 'lucide-react';
import type { UserSettings, SoundProfile, CaretStyle, ThemeMode } from '../types';
import { soundEngine } from '../services/soundEngine';

interface SettingsModalProps {
  isOpen: boolean;
  settings: UserSettings;
  onClose: () => void;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onClose,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const handleSoundChange = (profile: SoundProfile) => {
    onUpdateSettings({ soundProfile: profile });
    soundEngine.setProfile(profile);
    if (profile !== 'off') {
      soundEngine.playKeySound(false);
    }
  };

  const handleVolumeChange = (vol: number) => {
    onUpdateSettings({ soundVolume: vol });
    soundEngine.setVolume(vol);
    soundEngine.playKeySound(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-[#1E1E1E] border-4 border-black shadow-[8px_8px_0px_#000] p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b-3 border-black">
          <div className="flex items-center gap-2">
            <Sliders className="w-6 h-6 text-neo-pink" />
            <h2 className="text-xl font-black font-display uppercase tracking-tight">
              SETTINGS & CUSTOMIZATIONS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-neo-red text-white border-2 border-black font-black hover:bg-red-600 transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-6 text-sm">
          {/* 1. Mechanical Sound Engine */}
          <div className="flex flex-col gap-3 p-4 bg-gray-50 dark:bg-black border-2 border-black">
            <div className="flex items-center justify-between">
              <span className="font-black uppercase flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-neo-yellow" />
                MECHANICAL SWITCH AUDIO ENGINE
              </span>
              <span className="text-xs font-mono font-bold text-gray-500 uppercase">
                {settings.soundProfile}
              </span>
            </div>

            {/* Switch Profiles */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { id: 'cherry-blue', label: 'Cherry Blue' },
                { id: 'cherry-brown', label: 'Cherry Brown' },
                { id: 'cherry-red', label: 'Cherry Red' },
                { id: 'typewriter', label: 'Typewriter' },
                { id: 'synth', label: 'Cyber Synth' },
                { id: 'off', label: 'Mute / Off' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSoundChange(item.id as SoundProfile)}
                  className={`p-2 border-2 border-black text-xs font-black uppercase text-center transition-all ${
                    settings.soundProfile === item.id
                      ? 'bg-neo-yellow text-black shadow-[2px_2px_0px_#000]'
                      : 'bg-white dark:bg-[#1E1E1E] text-gray-600 dark:text-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Volume slider */}
            {settings.soundProfile !== 'off' && (
              <div className="flex items-center gap-4 mt-2">
                <span className="text-xs font-bold uppercase text-gray-500">Volume:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.soundVolume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-neo-pink h-2 bg-gray-200 border border-black cursor-pointer"
                />
                <span className="text-xs font-mono font-black w-8">
                  {Math.round(settings.soundVolume * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* 2. Theme & Visual Style */}
          <div className="flex flex-col gap-3 p-4 bg-gray-50 dark:bg-black border-2 border-black">
            <span className="font-black uppercase flex items-center gap-2">
              <Palette className="w-4 h-4 text-neo-cyan" />
              NEOBRUTALIST THEME
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'cyber-yellow', label: '⚡ Pop Neon (Light)', bg: 'bg-[#FFE600] text-black' },
                { id: 'neo-dark', label: '🕶️ Cyber Brutal (Dark)', bg: 'bg-[#121212] text-white border-cyan-400' },
                { id: 'pastel-punch', label: '🍬 Pastel Punch', bg: 'bg-[#F4EEFF] text-black' },
                { id: 'matrix-acid', label: '📟 Matrix Acid', bg: 'bg-[#0A0F0D] text-[#00FF66] border-[#00FF66]' },
              ].map((th) => (
                <button
                  key={th.id}
                  onClick={() => onUpdateSettings({ theme: th.id as ThemeMode })}
                  className={`p-2.5 border-2 border-black text-xs font-black text-center transition-all ${th.bg} ${
                    settings.theme === th.id ? 'ring-3 ring-black shadow-[3px_3px_0px_#000]' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {th.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Caret & Typography */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Caret Style */}
            <div className="p-4 bg-gray-50 dark:bg-black border-2 border-black flex flex-col gap-2">
              <span className="font-black uppercase flex items-center gap-2 text-xs">
                <Type className="w-4 h-4 text-neo-pink" />
                CARET / CURSOR STYLE
              </span>
              <div className="grid grid-cols-3 gap-1.5 mt-1">
                {[
                  { id: 'smooth', label: '| Bar' },
                  { id: 'block', label: '█ Block' },
                  { id: 'underline', label: '_ Line' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onUpdateSettings({ caretStyle: c.id as CaretStyle })}
                    className={`p-2 border-2 border-black text-xs font-black text-center ${
                      settings.caretStyle === c.id
                        ? 'bg-neo-pink text-white shadow-[2px_2px_0px_#000]'
                        : 'bg-white dark:bg-[#1E1E1E] text-black dark:text-white'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div className="p-4 bg-gray-50 dark:bg-black border-2 border-black flex flex-col gap-2">
              <span className="font-black uppercase flex items-center gap-2 text-xs">
                <Type className="w-4 h-4 text-neo-lime" />
                CANVAS FONT SIZE
              </span>
              <div className="grid grid-cols-4 gap-1.5 mt-1">
                {['small', 'medium', 'large', 'huge'].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => onUpdateSettings({ fontSize: sz as UserSettings['fontSize'] })}
                    className={`p-2 border-2 border-black text-xs font-black uppercase text-center ${
                      settings.fontSize === sz
                        ? 'bg-neo-lime text-black shadow-[2px_2px_0px_#000]'
                        : 'bg-white dark:bg-[#1E1E1E] text-black dark:text-white'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Target WPM Goal */}
          <div className="p-4 bg-gray-50 dark:bg-black border-2 border-black flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-black uppercase flex items-center gap-2 text-xs">
                <Target className="w-4 h-4 text-neo-pink" />
                TARGET SPEED GOAL (WPM)
              </span>
              <span className="text-sm font-black font-mono text-neo-pink">
                {settings.targetWpm} WPM
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2 mt-1">
              {[40, 55, 70, 85, 100].map((wpmVal) => (
                <button
                  key={wpmVal}
                  onClick={() => onUpdateSettings({ targetWpm: wpmVal })}
                  className={`p-2 border-2 border-black text-xs font-black text-center ${
                    settings.targetWpm === wpmVal
                      ? 'bg-neo-pink text-white shadow-[2px_2px_0px_#000]'
                      : 'bg-white dark:bg-[#1E1E1E] text-black dark:text-white hover:bg-gray-100'
                  }`}
                >
                  {wpmVal} WPM {wpmVal === 70 ? '🎯' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Toggles (Keyboard, Blind Mode, Confidence Mode) */}
          <div className="p-4 bg-gray-50 dark:bg-black border-2 border-black flex flex-col gap-3">
            <span className="font-black uppercase flex items-center gap-2 text-xs">
              <Keyboard className="w-4 h-4 text-neo-orange" />
              TRAINING MODES & VISUAL AIDS
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Show Keyboard */}
              <label className="flex items-center gap-2.5 p-2 bg-white dark:bg-[#1E1E1E] border-2 border-black cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showLiveKeyboard}
                  onChange={(e) => onUpdateSettings({ showLiveKeyboard: e.target.checked })}
                  className="w-4 h-4 accent-black"
                />
                <span className="font-bold">Show On-Screen Keyboard</span>
              </label>

              {/* Blind Mode */}
              <label className="flex items-center gap-2.5 p-2 bg-white dark:bg-[#1E1E1E] border-2 border-black cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.blindMode}
                  onChange={(e) => onUpdateSettings({ blindMode: e.target.checked })}
                  className="w-4 h-4 accent-black"
                />
                <span className="font-bold">Blind Mode (Hide live stats)</span>
              </label>

              {/* Confidence Mode */}
              <label className="flex items-center gap-2.5 p-2 bg-white dark:bg-[#1E1E1E] border-2 border-black cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.confidenceMode}
                  onChange={(e) => onUpdateSettings({ confidenceMode: e.target.checked })}
                  className="w-4 h-4 accent-black"
                />
                <span className="font-bold">Confidence Mode (No backspace)</span>
              </label>

              {/* Restart key */}
              <div className="flex items-center justify-between p-2 bg-white dark:bg-[#1E1E1E] border-2 border-black">
                <span className="font-bold">Quick Restart Hotkey:</span>
                <div className="flex gap-1">
                  {['Tab', 'Escape'].map((k) => (
                    <button
                      key={k}
                      onClick={() => onUpdateSettings({ quickRestartKey: k as 'Tab' | 'Escape' })}
                      className={`px-2 py-0.5 border border-black font-mono font-bold text-xs ${
                        settings.quickRestartKey === k ? 'bg-neo-yellow' : 'bg-gray-100 dark:bg-black'
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t-2 border-black flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-neo-yellow text-black font-black uppercase border-3 border-black shadow-[3px_3px_0px_#000] hover:bg-yellow-400 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
