import type { WpmPoint } from '../types';

export class StatsCalculator {
  public static calculateWpm(correctChars: number, elapsedSeconds: number): number {
    if (elapsedSeconds <= 0) return 0;
    const minutes = elapsedSeconds / 60;
    const words = correctChars / 5;
    return Math.max(0, Math.round(words / minutes));
  }

  public static calculateRawWpm(totalTypedChars: number, elapsedSeconds: number): number {
    if (elapsedSeconds <= 0) return 0;
    const minutes = elapsedSeconds / 60;
    const words = totalTypedChars / 5;
    return Math.max(0, Math.round(words / minutes));
  }

  public static calculateCpm(correctChars: number, elapsedSeconds: number): number {
    if (elapsedSeconds <= 0) return 0;
    const minutes = elapsedSeconds / 60;
    return Math.max(0, Math.round(correctChars / minutes));
  }

  public static calculateAccuracy(correctChars: number, totalCharsTyped: number): number {
    if (totalCharsTyped <= 0) return 100;
    const acc = (correctChars / totalCharsTyped) * 100;
    return Math.max(0, Math.min(100, Math.round(acc * 10) / 10));
  }

  // Consistency score (0-100%) based on variance of speed across the test
  public static calculateConsistency(timeline: WpmPoint[]): number {
    if (timeline.length < 3) return 100;
    const wpms = timeline.map(p => p.wpm);
    const mean = wpms.reduce((a, b) => a + b, 0) / wpms.length;
    if (mean === 0) return 100;

    const variance = wpms.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / wpms.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = (stdDev / mean) * 100;

    const consistency = Math.max(0, Math.min(100, Math.round(100 - coefficientOfVariation)));
    return consistency;
  }

  // Generate actionable tips to accelerate towards 70 WPM
  public static getTargetTips(currentWpm: number, accuracy: number, target = 70): {
    percentage: number;
    title: string;
    description: string;
    badgeColor: string;
  } {
    const percentage = Math.min(100, Math.round((currentWpm / target) * 100));

    if (currentWpm >= target && accuracy >= 95) {
      return {
        percentage: 100,
        title: '🎯 TARGET CRUSHED! ELITE TYPIST',
        description: `You've conquered the 70 WPM milestone with ${accuracy}% precision. Push for 90+ WPM in Advanced/Code Mode!`,
        badgeColor: 'bg-neo-lime text-black'
      };
    }

    if (accuracy < 93) {
      return {
        percentage,
        title: '⚠️ SLOW DOWN FOR ACCURACY',
        description: `Your accuracy is ${accuracy}%. Aim for 96%+ before accelerating velocity; neural pathways reinforce with clean strokes.`,
        badgeColor: 'bg-neo-red text-white'
      };
    }

    if (currentWpm >= 50) {
      return {
        percentage,
        title: '⚡ STRIKING DISTANCE (50-69 WPM)',
        description: `You are at ${currentWpm} WPM (${percentage}% to 70 WPM). Focus on word-chunking and looking 2-3 words ahead on screen!`,
        badgeColor: 'bg-neo-cyan text-black'
      };
    }

    if (currentWpm >= 30) {
      return {
        percentage,
        title: '🚀 BUILDING MOMENTUM (30-49 WPM)',
        description: `Keep your hands glued to the home row and avoid looking at the physical keyboard. You will hit 70 WPM in no time!`,
        badgeColor: 'bg-neo-yellow text-black'
      };
    }

    return {
      percentage,
      title: '🌱 FOUNDATION PHASE (<30 WPM)',
      description: `Focus strictly on proper 10-finger placement using the on-screen visual keyboard guide. Muscle memory develops in 7-14 days.`,
      badgeColor: 'bg-neo-pink text-white'
    };
  }
}
