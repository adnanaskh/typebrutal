export type DifficultyMode = 'beginner' | 'intermediate' | 'advanced' | 'code' | 'quotes' | 'drill';

export type TestType = 'time' | 'words' | 'zen';

export type TimeDuration = 15 | 30 | 60 | 120;
export type WordCount = 10 | 25 | 50 | 100;

export type CaretStyle = 'smooth' | 'block' | 'underline' | 'bar';

export type SoundProfile = 'cherry-blue' | 'cherry-brown' | 'cherry-red' | 'typewriter' | 'synth' | 'off';

export type ThemeMode = 'neo-light' | 'neo-dark' | 'pastel-punch' | 'matrix-acid' | 'cyber-yellow';

export interface CharState {
  char: string;
  state: 'untyped' | 'correct' | 'incorrect' | 'extra';
  typedChar?: string;
}

export interface KeystrokeRecord {
  char: string;
  timestamp: number;
  isCorrect: boolean;
  expectedChar: string;
}

export interface WpmPoint {
  second: number;
  wpm: number;
  rawWpm: number;
  errors: number;
}

export interface TestResult {
  id: string;
  date: string;
  timestamp: number;
  wpm: number;
  rawWpm: number;
  netWpm: number;
  cpm: number;
  accuracy: number;
  consistency: number;
  duration: number; // in seconds
  difficulty: DifficultyMode;
  testType: TestType;
  testConfig: number; // e.g. 30s or 50 words
  totalChars: number;
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  missedKeys: Record<string, number>; // key -> mistake count
  timeline: WpmPoint[];
  quoteAuthor?: string;
  targetWpmAchieved: boolean;
}

export interface StreakData {
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  historyDates: string[]; // List of YYYY-MM-DD
}

export interface UserSettings {
  soundProfile: SoundProfile;
  soundVolume: number; // 0.0 to 1.0
  theme: ThemeMode;
  caretStyle: CaretStyle;
  showLiveWpm: boolean;
  showLiveKeyboard: boolean;
  keyboardFingerGuide: boolean;
  keyboardHeatmap: boolean;
  targetWpm: number; // default 70
  fontSize: 'small' | 'medium' | 'large' | 'huge';
  blindMode: boolean; // hides stats during test
  confidenceMode: boolean; // cannot backspace errors
  quickRestartKey: 'Tab' | 'Escape';
}

export interface KeyMistakeStat {
  key: string;
  count: number;
  totalAttempts: number;
  errorRate: number;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isDemo?: boolean;
}

export interface LastTrainingState {
  timestamp: number;
  date: string;
  lastWpm: number;
  lastAccuracy: number;
  difficulty: DifficultyMode;
  testType: TestType;
  testConfig: number;
  rollingWpm: number;
  targetProgressPercent: number;
}

export interface CloudUserData {
  profile: UserProfile;
  settings: UserSettings;
  history: TestResult[];
  streak: StreakData;
  mistakes: Record<string, number>;
  lastState: LastTrainingState | null;
  updatedAt: number;
}

export interface FirebaseCustomConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
  databaseURL?: string;
}

