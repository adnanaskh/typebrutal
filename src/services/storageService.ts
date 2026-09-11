import type { TestResult, StreakData, UserSettings, KeyMistakeStat, LastTrainingState } from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'typebrutal_settings_v1',
  HISTORY: 'typebrutal_history_v1',
  STREAK: 'typebrutal_streak_v1',
  MISTAKES: 'typebrutal_mistakes_v1',
  LAST_STATE: 'typebrutal_last_state_v1',
};

export const DEFAULT_SETTINGS: UserSettings = {
  soundProfile: 'cherry-blue',
  soundVolume: 0.6,
  theme: 'cyber-yellow',
  caretStyle: 'smooth',
  showLiveWpm: true,
  showLiveKeyboard: true,
  keyboardFingerGuide: true,
  keyboardHeatmap: false,
  targetWpm: 70,
  fontSize: 'large',
  blindMode: false,
  confidenceMode: false,
  quickRestartKey: 'Tab',
};

export class StorageService {
  // 1. Settings
  public static getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  }

  public static saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }

  public static formatLocalDateTime(dateOrTimestamp: Date | number = new Date()): string {
    const d = typeof dateOrTimestamp === 'number' ? new Date(dateOrTimestamp) : dateOrTimestamp;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  // 2. Test History
  public static getHistory(): TestResult[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed.map((item: TestResult) => {
            if (item && typeof item.timestamp === 'number') {
              return { ...item, date: StorageService.formatLocalDateTime(item.timestamp) };
            }
            return item;
          });
        }
      }
    } catch {
      // ignore
    }
    return [];
  }

  public static saveTestResult(result: TestResult): void {
    try {
      const history = this.getHistory();
      history.unshift(result);
      // Keep up to 200 recent tests for analytics
      const trimmed = history.slice(0, 200);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trimmed));
      
      // Update streaks and mistakes
      this.updateStreak();
      this.recordMistakes(result.missedKeys);
    } catch {
      // ignore
    }
  }

  // 3. Streak Tracking
  public static getStreak(): StreakData {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STREAK);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // ignore
    }
    return {
      currentStreak: 0,
      bestStreak: 0,
      lastActiveDate: '',
      historyDates: [],
    };
  }

  public static getLocalDateString(d: Date = new Date()): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  public static updateStreak(): StreakData {
    const today = this.getLocalDateString(new Date());
    const streak = this.getStreak();

    if (streak.lastActiveDate === today) {
      return streak; // already counted today
    }

    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = this.getLocalDateString(yesterdayDate);

    if (streak.lastActiveDate === yesterday) {
      streak.currentStreak += 1;
    } else if (streak.lastActiveDate === '') {
      streak.currentStreak = 1;
    } else {
      // Streak broken
      streak.currentStreak = 1;
    }

    if (streak.currentStreak > streak.bestStreak) {
      streak.bestStreak = streak.currentStreak;
    }

    streak.lastActiveDate = today;
    if (!streak.historyDates.includes(today)) {
      streak.historyDates.push(today);
    }

    try {
      localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streak));
    } catch {
      // ignore
    }
    return streak;
  }

  // 4. Mistake tracking
  public static getMistakes(): Record<string, number> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MISTAKES);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // ignore
    }
    return {};
  }

  public static recordMistakes(newMistakes: Record<string, number>): void {
    const existing = this.getMistakes();
    Object.entries(newMistakes).forEach(([key, count]) => {
      existing[key] = (existing[key] || 0) + count;
    });
    try {
      localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(existing));
    } catch {
      // ignore
    }
  }

  public static getTopTroubleKeys(limit = 6): KeyMistakeStat[] {
    const mistakes = this.getMistakes();
    const entries = Object.entries(mistakes);
    entries.sort((a, b) => b[1] - a[1]);
    const totalMistakes = entries.reduce((sum, [, count]) => sum + count, 0);

    return entries.slice(0, limit).map(([key, count]) => ({
      key,
      count,
      totalAttempts: totalMistakes,
      errorRate: totalMistakes > 0 ? (count / totalMistakes) * 100 : 0
    }));
  }

  // 5. Aggregate stats
  public static getStatsSummary() {
    const history = this.getHistory();
    if (history.length === 0) {
      return {
        totalTests: 0,
        bestWpm: 0,
        averageWpm: 0,
        rolling10Wpm: 0,
        totalWords: 0,
        totalTimeSeconds: 0,
        averageAccuracy: 0,
        target70Progress: 0,
      };
    }

    const totalTests = history.length;
    const bestWpm = Math.max(...history.map(h => h.wpm));
    const averageWpm = Math.round(history.reduce((sum, h) => sum + h.wpm, 0) / totalTests);
    
    // Rolling 10 tests average
    const recent10 = history.slice(0, 10);
    const rolling10Wpm = Math.round(recent10.reduce((sum, h) => sum + h.wpm, 0) / recent10.length);

    const totalWords = history.reduce((sum, h) => sum + Math.round(h.correctChars / 5), 0);
    const totalTimeSeconds = history.reduce((sum, h) => sum + h.duration, 0);
    const averageAccuracy = Math.round((history.reduce((sum, h) => sum + h.accuracy, 0) / totalTests) * 10) / 10;

    const target70Progress = Math.min(100, Math.round((rolling10Wpm / 70) * 100));

    return {
      totalTests,
      bestWpm,
      averageWpm,
      rolling10Wpm,
      totalWords,
      totalTimeSeconds,
      averageAccuracy,
      target70Progress,
    };
  }

  // 6. Last State Tracking
  public static getLastState(): LastTrainingState | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LAST_STATE);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed.timestamp === 'number') {
          return { ...parsed, date: StorageService.formatLocalDateTime(parsed.timestamp) };
        }
        return parsed;
      }
    } catch {
      // ignore
    }
    return null;
  }

  public static saveLastState(state: LastTrainingState): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_STATE, JSON.stringify(state));
    } catch {
      // ignore
    }
  }

  // 7. Secure Export / Import Data
  public static exportAllData(): string {
    const data = {
      settings: this.getSettings(),
      history: this.getHistory(),
      streak: this.getStreak(),
      mistakes: this.getMistakes(),
      lastState: this.getLastState(),
      exportedAt: new Date().toISOString(),
      app: 'TYPEBRUTAL',
      version: '1.0'
    };
    return JSON.stringify(data, null, 2);
  }

  public static importData(jsonString: string): boolean {
    try {
      // Safe parsing
      const data = JSON.parse(jsonString);
      if (data && typeof data === 'object' && data.app === 'TYPEBRUTAL') {
        if (data.settings && typeof data.settings === 'object') {
          this.saveSettings({ ...DEFAULT_SETTINGS, ...data.settings });
        }
        if (Array.isArray(data.history)) {
          // Validate history array elements
          const sanitizedHistory = data.history.filter((h: unknown) => 
            h && typeof h === 'object' && typeof (h as TestResult).wpm === 'number'
          );
          localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(sanitizedHistory));
        }
        if (data.streak && typeof data.streak === 'object' && typeof data.streak.currentStreak === 'number') {
          localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(data.streak));
        }
        if (data.mistakes && typeof data.mistakes === 'object') {
          localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(data.mistakes));
        }
        if (data.lastState && typeof data.lastState === 'object') {
          this.saveLastState(data.lastState);
        }
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  }

  public static resetAllData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
      localStorage.removeItem(STORAGE_KEYS.STREAK);
      localStorage.removeItem(STORAGE_KEYS.MISTAKES);
      localStorage.removeItem(STORAGE_KEYS.LAST_STATE);
    } catch {
      // ignore
    }
  }

  public static clearAllCachesAndStorage(): void {
    try {
      localStorage.clear();
    } catch {
      this.resetAllData();
    }
    try {
      sessionStorage.clear();
    } catch {
      // ignore
    }
    try {
      if (typeof window !== 'undefined' && 'caches' in window) {
        caches.keys().then((keys) => {
          keys.forEach((key) => caches.delete(key));
        }).catch(() => {});
      }
    } catch {
      // ignore
    }
  }
}
