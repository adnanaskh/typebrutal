import React from 'react';
import { Sparkles, Flame } from 'lucide-react';

interface VirtualKeyboardProps {
  activeKey: string | null;
  targetKey: string | null;
  mistakes: Record<string, number>;
  showFingerGuide?: boolean;
  showHeatmap?: boolean;
  onToggleFingerGuide?: () => void;
  onToggleHeatmap?: () => void;
  onKeyClick?: (key: string) => void;
}

export type FingerZone =
  | 'l-pinky' | 'l-ring' | 'l-mid' | 'l-index' | 'l-thumb'
  | 'r-thumb' | 'r-index' | 'r-mid' | 'r-ring' | 'r-pinky';

export interface KeyDef {
  code: string;
  char: string;
  shiftChar?: string;
  topLabel?: string;
  botLabel?: string;
  w: number;
  finger: FingerZone;
  label?: string;
}

const ROW0: KeyDef[] = [
  { code: 'Backquote',    char: '`',  shiftChar: '~',  topLabel: '~',  botLabel: '`',  w: 1,    finger: 'l-pinky' },
  { code: 'Digit1',      char: '1',  shiftChar: '!',  topLabel: '!',  botLabel: '1',  w: 1,    finger: 'l-pinky' },
  { code: 'Digit2',      char: '2',  shiftChar: '@',  topLabel: '@',  botLabel: '2',  w: 1,    finger: 'l-ring'  },
  { code: 'Digit3',      char: '3',  shiftChar: '#',  topLabel: '#',  botLabel: '3',  w: 1,    finger: 'l-mid'   },
  { code: 'Digit4',      char: '4',  shiftChar: '$',  topLabel: '$',  botLabel: '4',  w: 1,    finger: 'l-index' },
  { code: 'Digit5',      char: '5',  shiftChar: '%',  topLabel: '%',  botLabel: '5',  w: 1,    finger: 'l-index' },
  { code: 'Digit6',      char: '6',  shiftChar: '^',  topLabel: '^',  botLabel: '6',  w: 1,    finger: 'r-index' },
  { code: 'Digit7',      char: '7',  shiftChar: '&',  topLabel: '&',  botLabel: '7',  w: 1,    finger: 'r-index' },
  { code: 'Digit8',      char: '8',  shiftChar: '*',  topLabel: '*',  botLabel: '8',  w: 1,    finger: 'r-mid'   },
  { code: 'Digit9',      char: '9',  shiftChar: '(',  topLabel: '(',  botLabel: '9',  w: 1,    finger: 'r-ring'  },
  { code: 'Digit0',      char: '0',  shiftChar: ')',  topLabel: ')',  botLabel: '0',  w: 1,    finger: 'r-pinky' },
  { code: 'Minus',       char: '-',  shiftChar: '_',  topLabel: '_',  botLabel: '-',  w: 1,    finger: 'r-pinky' },
  { code: 'Equal',       char: '=',  shiftChar: '+',  topLabel: '+',  botLabel: '=',  w: 1,    finger: 'r-pinky' },
  { code: 'Backspace',   char: 'Backspace', label: '\u232B Backspace', w: 2, finger: 'r-pinky' },
];

const ROW1: KeyDef[] = [
  { code: 'Tab',          char: 'Tab',  label: 'Tab \u21E5',   w: 1.5,  finger: 'l-pinky' },
  { code: 'KeyQ',        char: 'q',  shiftChar: 'Q', botLabel: 'Q', w: 1, finger: 'l-pinky' },
  { code: 'KeyW',        char: 'w',  shiftChar: 'W', botLabel: 'W', w: 1, finger: 'l-ring'  },
  { code: 'KeyE',        char: 'e',  shiftChar: 'E', botLabel: 'E', w: 1, finger: 'l-mid'   },
  { code: 'KeyR',        char: 'r',  shiftChar: 'R', botLabel: 'R', w: 1, finger: 'l-index' },
  { code: 'KeyT',        char: 't',  shiftChar: 'T', botLabel: 'T', w: 1, finger: 'l-index' },
  { code: 'KeyY',        char: 'y',  shiftChar: 'Y', botLabel: 'Y', w: 1, finger: 'r-index' },
  { code: 'KeyU',        char: 'u',  shiftChar: 'U', botLabel: 'U', w: 1, finger: 'r-index' },
  { code: 'KeyI',        char: 'i',  shiftChar: 'I', botLabel: 'I', w: 1, finger: 'r-mid'   },
  { code: 'KeyO',        char: 'o',  shiftChar: 'O', botLabel: 'O', w: 1, finger: 'r-ring'  },
  { code: 'KeyP',        char: 'p',  shiftChar: 'P', botLabel: 'P', w: 1, finger: 'r-pinky' },
  { code: 'BracketLeft', char: '[',  shiftChar: '{', topLabel: '{', botLabel: '[', w: 1, finger: 'r-pinky' },
  { code: 'BracketRight',char: ']',  shiftChar: '}', topLabel: '}', botLabel: ']', w: 1, finger: 'r-pinky' },
  { code: 'Backslash',   char: '\\', shiftChar: '|', topLabel: '|', botLabel: '\\', w: 1.5, finger: 'r-pinky' },
];

const ROW2: KeyDef[] = [
  { code: 'CapsLock', char: 'CapsLock', label: 'Caps \u21EA',   w: 1.75, finger: 'l-pinky' },
  { code: 'KeyA',    char: 'a', shiftChar: 'A', botLabel: 'A', w: 1, finger: 'l-pinky' },
  { code: 'KeyS',    char: 's', shiftChar: 'S', botLabel: 'S', w: 1, finger: 'l-ring'  },
  { code: 'KeyD',    char: 'd', shiftChar: 'D', botLabel: 'D', w: 1, finger: 'l-mid'   },
  { code: 'KeyF',    char: 'f', shiftChar: 'F', botLabel: 'F', w: 1, finger: 'l-index' },
  { code: 'KeyG',    char: 'g', shiftChar: 'G', botLabel: 'G', w: 1, finger: 'l-index' },
  { code: 'KeyH',    char: 'h', shiftChar: 'H', botLabel: 'H', w: 1, finger: 'r-index' },
  { code: 'KeyJ',    char: 'j', shiftChar: 'J', botLabel: 'J', w: 1, finger: 'r-index' },
  { code: 'KeyK',    char: 'k', shiftChar: 'K', botLabel: 'K', w: 1, finger: 'r-mid'   },
  { code: 'KeyL',    char: 'l', shiftChar: 'L', botLabel: 'L', w: 1, finger: 'r-ring'  },
  { code: 'Semicolon',char: ';', shiftChar: ':', topLabel: ':', botLabel: ';', w: 1, finger: 'r-pinky' },
  { code: 'Quote',   char: "'", shiftChar: '"', topLabel: '"', botLabel: "'", w: 1, finger: 'r-pinky' },
  { code: 'Enter',   char: 'Enter', label: 'Enter \u21B5',      w: 2.25, finger: 'r-pinky' },
];

const ROW3: KeyDef[] = [
  { code: 'ShiftLeft', char: 'Shift', label: '\u21E7 Shift',    w: 2.25, finger: 'l-pinky' },
  { code: 'KeyZ',    char: 'z', shiftChar: 'Z', botLabel: 'Z', w: 1, finger: 'l-pinky' },
  { code: 'KeyX',    char: 'x', shiftChar: 'X', botLabel: 'X', w: 1, finger: 'l-ring'  },
  { code: 'KeyC',    char: 'c', shiftChar: 'C', botLabel: 'C', w: 1, finger: 'l-mid'   },
  { code: 'KeyV',    char: 'v', shiftChar: 'V', botLabel: 'V', w: 1, finger: 'l-index' },
  { code: 'KeyB',    char: 'b', shiftChar: 'B', botLabel: 'B', w: 1, finger: 'l-index' },
  { code: 'KeyN',    char: 'n', shiftChar: 'N', botLabel: 'N', w: 1, finger: 'r-index' },
  { code: 'KeyM',    char: 'm', shiftChar: 'M', botLabel: 'M', w: 1, finger: 'r-index' },
  { code: 'Comma',   char: ',', shiftChar: '<', topLabel: '<', botLabel: ',', w: 1, finger: 'r-mid'   },
  { code: 'Period',  char: '.', shiftChar: '>', topLabel: '>', botLabel: '.', w: 1, finger: 'r-ring'  },
  { code: 'Slash',   char: '/', shiftChar: '?', topLabel: '?', botLabel: '/', w: 1, finger: 'r-pinky' },
  { code: 'ShiftRight', char: 'Shift', label: 'Shift \u21E7',  w: 2.75, finger: 'r-pinky' },
];

const ROW4: KeyDef[] = [
  { code: 'ControlLeft',  char: 'Control', label: 'Ctrl',      w: 1.25, finger: 'l-pinky' },
  { code: 'MetaLeft',     char: 'Meta',    label: '\u229E Win', w: 1.25, finger: 'l-pinky' },
  { code: 'AltLeft',      char: 'Alt',     label: 'Alt',       w: 1.25, finger: 'l-thumb' },
  { code: 'Space',        char: ' ',       label: 'SPACE',     w: 6.25, finger: 'l-thumb' },
  { code: 'AltRight',     char: 'Alt',     label: 'Alt',       w: 1.25, finger: 'r-thumb' },
  { code: 'MetaRight',    char: 'Meta',    label: '\u229E',     w: 1.25, finger: 'r-pinky' },
  { code: 'ContextMenu',  char: 'ContextMenu', label: '\u2630', w: 1.25, finger: 'r-pinky' },
  { code: 'ControlRight', char: 'Control', label: 'Ctrl',      w: 1.25, finger: 'r-pinky' },
];

const ALL_ROWS = [ROW0, ROW1, ROW2, ROW3, ROW4];

// 10 Distinct Finger Colors & High-Contrast Neobrutalist Borders
export const FINGER_BG: Record<FingerZone, string> = {
  'l-pinky': '#FBCFE8', // Rose / Pink
  'l-ring':  '#FED7AA', // Peach / Orange
  'l-mid':   '#FEF08A', // Yellow
  'l-index': '#BBF7D0', // Mint / Light Green
  'l-thumb': '#BAE6FD', // Sky Blue
  'r-thumb': '#C7D2FE', // Periwinkle Blue
  'r-index': '#99F6E4', // Aqua / Cyan
  'r-mid':   '#A7F3D0', // Emerald / Sage
  'r-ring':  '#DDD6FE', // Lavender / Indigo
  'r-pinky': '#F5D0FE', // Violet / Fuchsia
};

export const FINGER_BORDER: Record<FingerZone, string> = {
  'l-pinky': '#DB2777',
  'l-ring':  '#EA580C',
  'l-mid':   '#CA8A04',
  'l-index': '#16A34A',
  'l-thumb': '#0284C7',
  'r-thumb': '#4F46E5',
  'r-index': '#0D9488',
  'r-mid':   '#059669',
  'r-ring':  '#7C3AED',
  'r-pinky': '#C026D3',
};

export const FINGER_LABEL: Record<FingerZone, string> = {
  'l-pinky': 'Left Pinky',
  'l-ring':  'Left Ring',
  'l-mid':   'Left Middle',
  'l-index': 'Left Index',
  'l-thumb': 'Left Thumb',
  'r-thumb': 'Right Thumb',
  'r-index': 'Right Index',
  'r-mid':   'Right Middle',
  'r-ring':  'Right Ring',
  'r-pinky': 'Right Pinky',
};

export const LEFT_HAND_FINGERS: FingerZone[] = ['l-pinky', 'l-ring', 'l-mid', 'l-index', 'l-thumb'];
export const RIGHT_HAND_FINGERS: FingerZone[] = ['r-thumb', 'r-index', 'r-mid', 'r-ring', 'r-pinky'];

export const FINGER_KEYS: Record<FingerZone, string> = {
  'l-pinky': 'Q A Z 1 ~',
  'l-ring':  'W S X 2',
  'l-mid':   'E D C 3',
  'l-index': 'R T F G V B 4 5',
  'l-thumb': 'Alt · Space',
  'r-thumb': 'Space · Alt',
  'r-index': 'Y U H J N M 6 7',
  'r-mid':   'I K , 8',
  'r-ring':  'O L . 9',
  'r-pinky': 'P ; / 0 - = ⮠',
};

const U = 34;
const GAP = 3;

function KeyLabel({ k }: { k: KeyDef }) {
  if (k.label !== undefined) {
    return (
      <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.01em', whiteSpace: 'nowrap', padding: '0 2px', textAlign: 'center' as const }}>
        {k.label}
      </span>
    );
  }
  return (
    <span style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-start', justifyContent: 'space-between', lineHeight: 1, padding: '2px 3px', width: '100%', height: '100%', boxSizing: 'border-box' as const }}>
      <span style={{ fontSize: 7.5, opacity: k.topLabel ? 0.72 : 0 }}>{k.topLabel ?? '\u00A0'}</span>
      <span style={{ fontSize: 11.5, fontWeight: 800 }}>{k.botLabel ?? k.char}</span>
    </span>
  );
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  activeKey, targetKey, mistakes, showFingerGuide = true, showHeatmap = false,
  onToggleFingerGuide, onToggleHeatmap,
}) => {
  const maxMistakes = Math.max(1, ...Object.values(mistakes || {}));

  const isActive = (k: KeyDef): boolean => {
    if (!activeKey) return false;
    const a = activeKey.toLowerCase();
    return (
      k.char.toLowerCase() === a ||
      k.code.toLowerCase() === a ||
      (!!k.shiftChar && k.shiftChar.toLowerCase() === a) ||
      (activeKey === ' ' && k.code === 'Space')
    );
  };

  const isTarget = (k: KeyDef): boolean => {
    if (!targetKey) return false;
    const t = targetKey.toLowerCase();
    return (
      k.char.toLowerCase() === t ||
      (!!k.shiftChar && k.shiftChar.toLowerCase() === t) ||
      (targetKey === ' ' && k.code === 'Space')
    );
  };

  const getKeyStyle = (k: KeyDef, active: boolean, target: boolean): React.CSSProperties => {
    const w = Math.round(k.w * U + (k.w - 1) * GAP);
    const base: React.CSSProperties = {
      width: w, minWidth: w, height: U, flexShrink: 0,
      display: 'flex',
      alignItems: k.label !== undefined ? 'center' : 'stretch',
      justifyContent: k.label !== undefined ? 'center' : 'flex-start',
      border: `2px solid ${FINGER_BORDER[k.finger]}`,
      boxShadow: `2px 2px 0px ${FINGER_BORDER[k.finger]}`,
      borderRadius: 3, cursor: 'default', userSelect: 'none' as const,
      transition: 'transform 0.06s, box-shadow 0.06s, background-color 0.06s',
      overflow: 'hidden', position: 'relative' as const, boxSizing: 'border-box' as const,
      color: '#111827',
    };

    if (active) {
      return {
        ...base,
        backgroundColor: 'var(--accent-yellow)',
        borderColor: '#000',
        boxShadow: '0 0 0 #000',
        color: '#000',
        fontWeight: 900,
        transform: 'translate(2px,2px)',
      };
    }

    if (target) {
      return {
        ...base,
        borderColor: 'var(--accent-pink)',
        boxShadow: '0 0 0 2px var(--accent-pink), 2px 2px 0 #000',
        animation: 'pulse-border 1s infinite alternate',
        backgroundColor: '#FFE4E6',
        color: '#000',
        fontWeight: 900,
      };
    }

    if (showHeatmap) {
      const c = (mistakes[k.char.toLowerCase()] ?? 0) + (k.shiftChar ? (mistakes[k.shiftChar.toLowerCase()] ?? 0) : 0);
      if (c > 0) {
        const r = c / maxMistakes;
        if (r > 0.6) return { ...base, backgroundColor: '#FF2A2A', borderColor: '#990000', color: '#fff', fontWeight: 900, boxShadow: '2px 2px 0 #000' };
        if (r > 0.3) return { ...base, backgroundColor: '#FF8C00', borderColor: '#B35900', color: '#000', fontWeight: 800, boxShadow: '2px 2px 0 #000' };
        return { ...base, backgroundColor: '#FFE600', borderColor: '#B3A100', color: '#000', fontWeight: 700, boxShadow: '2px 2px 0 #000' };
      }
      return { ...base, backgroundColor: 'var(--bg-card)', borderColor: '#000', color: 'var(--text-muted)', boxShadow: '2px 2px 0 #000' };
    }

    // Default 10-Finger Color Coding
    if (showFingerGuide) {
      return {
        ...base,
        backgroundColor: FINGER_BG[k.finger],
        borderColor: FINGER_BORDER[k.finger],
        boxShadow: `2px 2px 0 ${FINGER_BORDER[k.finger]}`,
        color: '#111827',
      };
    }

    return {
      ...base,
      backgroundColor: 'var(--bg-card)',
      borderColor: '#000',
      boxShadow: '2px 2px 0 #000',
      color: 'var(--text-main)',
    };
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-6">
      <div className="neo-box p-4 bg-white dark:bg-[#1E1E1E]">

        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-black flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black uppercase tracking-wider text-black dark:text-white">
              {showHeatmap ? '🔥 MISTAKE HEATMAP KEYBOARD' : '⌨️ 10-FINGER TOUCH TYPING ACCELERATOR'}
            </span>
            {targetKey && (
              <span className="px-2 py-0.5 bg-neo-pink text-white font-mono font-bold text-xs border border-black shadow-[1px_1px_0px_#000]">
                NEXT: {targetKey === ' ' ? 'SPACE' : targetKey.toUpperCase()}
              </span>
            )}
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2">
            {onToggleFingerGuide && (
              <button
                type="button"
                onClick={onToggleFingerGuide}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-black uppercase border-2 border-black transition-all cursor-pointer ${
                  !showHeatmap && showFingerGuide
                    ? 'bg-neo-cyan text-black shadow-[2px_2px_0px_#000]'
                    : 'bg-white dark:bg-[#1E1E1E] text-gray-500 opacity-70 hover:opacity-100'
                }`}
                title="Switch to 10-Finger Touch Typing Color Guide"
              >
                <Sparkles className="w-3.5 h-3.5" /> 10-Finger Colors
              </button>
            )}
            {onToggleHeatmap && (
              <button
                type="button"
                onClick={onToggleHeatmap}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-black uppercase border-2 border-black transition-all cursor-pointer ${
                  showHeatmap
                    ? 'bg-neo-red text-white shadow-[2px_2px_0px_#000]'
                    : 'bg-white dark:bg-[#1E1E1E] text-gray-500 opacity-70 hover:opacity-100'
                }`}
                title="Switch to Real-time Mistake Heatmap"
              >
                <Flame className="w-3.5 h-3.5" /> Mistake Heatmap
              </button>
            )}
          </div>
        </div>

        {/* Main 3-Column Layout: [Left Hand Guide] [Virtual Keyboard] [Right Hand Guide] */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 overflow-x-auto">

          {/* Left Hand Indicator Flank */}
          <div className="w-full lg:w-44 flex flex-col gap-1.5 p-2.5 bg-gray-50 dark:bg-black/40 border-2 border-black shadow-[2px_2px_0px_#000] flex-shrink-0">
            <div className="text-[10px] font-black uppercase tracking-wider text-black dark:text-white flex items-center justify-between pb-1 border-b border-black/20">
              <span>✋ LEFT HAND</span>
              <span className="text-[9px] text-gray-500">L1–L5</span>
            </div>
            {LEFT_HAND_FINGERS.map((zone) => (
              <div
                key={zone}
                style={{
                  backgroundColor: FINGER_BG[zone],
                  borderColor: FINGER_BORDER[zone],
                  boxShadow: `1.5px 1.5px 0px ${FINGER_BORDER[zone]}`,
                }}
                className="p-1.5 border-2 flex flex-col gap-0.5 rounded-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-black leading-tight">
                    {FINGER_LABEL[zone]}
                  </span>
                  <span
                    style={{ backgroundColor: FINGER_BORDER[zone] }}
                    className="w-2 h-2 rounded-full"
                  />
                </div>
                <span className="text-[8.5px] font-mono font-bold text-gray-800 leading-tight">
                  {FINGER_KEYS[zone]}
                </span>
              </div>
            ))}
          </div>

          {/* Center ANSI Keyboard Display */}
          <div className="flex-1 flex justify-center overflow-x-auto py-1">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column' as const,
                gap: GAP,
                userSelect: 'none' as const,
                fontFamily: 'monospace',
                pointerEvents: 'none',
              }}
            >
              {ALL_ROWS.map((row, rIdx) => (
                <div key={rIdx} style={{ display: 'flex', gap: GAP }}>
                  {row.map((k) => {
                    const active = isActive(k);
                    const target = isTarget(k);
                    return (
                      <button
                        type="button"
                        key={k.code}
                        style={getKeyStyle(k, active, target)}
                        tabIndex={-1}
                        title={`${k.code} (${FINGER_LABEL[k.finger]})`}
                      >
                        <KeyLabel k={k} />
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Right Hand Indicator Flank */}
          <div className="w-full lg:w-44 flex flex-col gap-1.5 p-2.5 bg-gray-50 dark:bg-black/40 border-2 border-black shadow-[2px_2px_0px_#000] flex-shrink-0">
            <div className="text-[10px] font-black uppercase tracking-wider text-black dark:text-white flex items-center justify-between pb-1 border-b border-black/20">
              <span>🤚 RIGHT HAND</span>
              <span className="text-[9px] text-gray-500">R1–R5</span>
            </div>
            {RIGHT_HAND_FINGERS.map((zone) => (
              <div
                key={zone}
                style={{
                  backgroundColor: FINGER_BG[zone],
                  borderColor: FINGER_BORDER[zone],
                  boxShadow: `1.5px 1.5px 0px ${FINGER_BORDER[zone]}`,
                }}
                className="p-1.5 border-2 flex flex-col gap-0.5 rounded-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-black leading-tight">
                    {FINGER_LABEL[zone]}
                  </span>
                  <span
                    style={{ backgroundColor: FINGER_BORDER[zone] }}
                    className="w-2 h-2 rounded-full"
                  />
                </div>
                <span className="text-[8.5px] font-mono font-bold text-gray-800 leading-tight">
                  {FINGER_KEYS[zone]}
                </span>
              </div>
            ))}
          </div>

        </div>

        {/* Heatmap Legend (when in Heatmap Mode) */}
        {showHeatmap && (
          <div className="mt-3 pt-2.5 border-t-2 border-black/15 flex flex-wrap items-center justify-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[#FF2A2A] border border-black inline-block" /> High Mistake Rate (&gt;60%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[#FF8C00] border border-black inline-block" /> Moderate Mistake (30–60%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[#FFE600] border border-black inline-block" /> Occasional Error (&lt;30%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-white dark:bg-black border border-black inline-block" /> Flawless / Clean
            </span>
          </div>
        )}

      </div>
    </div>
  );
};

