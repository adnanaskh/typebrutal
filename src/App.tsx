import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ModeSelector } from './components/ModeSelector';
import { TypingCanvas } from './components/TypingCanvas';
import { VirtualKeyboard } from './components/VirtualKeyboard';
import { StatsDashboard } from './components/StatsDashboard';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsModal } from './components/SettingsModal';
import { FirebaseModal } from './components/FirebaseModal';
import { Footer } from './components/Footer';
import type { 
  DifficultyMode, 
  TestType, 
  TimeDuration, 
  WordCount, 
  UserSettings, 
  StreakData, 
  TestResult,
  WpmPoint,
  UserProfile,
  LastTrainingState
} from './types';
import { StorageService } from './services/storageService';
import { TextEngine } from './services/textEngine';
import type { TextEnginePayload } from './services/textEngine';
import { soundEngine } from './services/soundEngine';
import { firebaseService } from './services/firebaseService';

export const App: React.FC = () => {
  // App Settings & Persistent Data
  const [settings, setSettings] = useState<UserSettings>(() => StorageService.getSettings());
  const [streak, setStreak] = useState<StreakData>(() => StorageService.getStreak());
  const [history, setHistory] = useState<TestResult[]>(() => StorageService.getHistory());
  const [mistakes, setMistakes] = useState<Record<string, number>>(() => StorageService.getMistakes());
  const [lastState, setLastState] = useState<LastTrainingState | null>(() => StorageService.getLastState());

  // Auth & Cloud Sync
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => firebaseService.getCurrentUser());
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Views & Modals
  const [activeView, setActiveView] = useState<'trainer' | 'analytics'>('trainer');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [testState, setTestState] = useState<'idle' | 'typing' | 'completed'>('idle');

  // Test Configurations
  const [difficulty, setDifficulty] = useState<DifficultyMode>('intermediate');
  const [testType, setTestType] = useState<TestType>('time');
  const [timeDuration, setTimeDuration] = useState<TimeDuration>(30);
  const [wordCount, setWordCount] = useState<WordCount>(25);
  const [drillKeys, setDrillKeys] = useState<string[]>([]);

  // Current Test Text Payload
  const [textPayload, setTextPayload] = useState<TextEnginePayload>({
    text: "Loading test engine...",
    source: "System",
    wordCount: 0,
  });
  const [isLoadingText, setIsLoadingText] = useState<boolean>(false);

  // Completed Test Result
  const [latestResult, setLatestResult] = useState<TestResult | null>(null);
  const [testSessionKey, setTestSessionKey] = useState<number>(0);

  // Virtual Keyboard state
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [targetKey, setTargetKey] = useState<string | null>(null);
  const [externalKeyTrigger, setExternalKeyTrigger] = useState<{ key: string; timestamp: number } | null>(null);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsub = firebaseService.onAuthState((user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  // Sync theme with body class, dark mode toggle on root html, and apply sound settings
  useEffect(() => {
    document.body.className = `theme-${settings.theme}`;
    if (settings.theme === 'neo-dark' || settings.theme === 'matrix-acid') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    soundEngine.setProfile(settings.soundProfile);
    soundEngine.setVolume(settings.soundVolume);
  }, [settings.theme, settings.soundProfile, settings.soundVolume]);

  // Load new text whenever config changes
  const loadNewText = useCallback(async (
    targetDifficulty = difficulty,
    targetType = testType,
    duration = timeDuration,
    words = wordCount,
    keys = drillKeys
  ) => {
    setIsLoadingText(true);
    const configValue = targetType === 'time' ? duration : words;
    const payload = await TextEngine.generateText(targetDifficulty, targetType, configValue, keys);
    setTextPayload(payload);
    setTestSessionKey((k) => k + 1);
    setIsLoadingText(false);
    setTestState('idle');
  }, [difficulty, testType, timeDuration, wordCount, drillKeys]);

  // Initial text load
  useEffect(() => {
    loadNewText();
  }, [difficulty, testType, timeDuration, wordCount]);

  // Google Sign In Handler
  const handleGoogleLogin = async () => {
    setIsSyncing(true);
    try {
      const user = await firebaseService.signInWithGoogle();
      if (user) {
        setCurrentUser(user);
        
        // Pull remote cloud data if available
        const cloudData = await firebaseService.fetchFromCloud();
        if (cloudData) {
          if (cloudData.history && cloudData.history.length > 0) {
            localStorage.setItem('typebrutal_history_v1', JSON.stringify(cloudData.history));
          }
          if (cloudData.streak) {
            localStorage.setItem('typebrutal_streak_v1', JSON.stringify(cloudData.streak));
          }
          if (cloudData.settings) {
            StorageService.saveSettings(cloudData.settings);
          }
          if (cloudData.lastState) {
            StorageService.saveLastState(cloudData.lastState);
          }
        } else {
          // Push local data up to Firebase
          await firebaseService.syncToCloud({
            settings,
            history,
            streak,
            mistakes,
            lastState: StorageService.getLastState(),
          });
        }
        
        // Refresh site after login to load & display all Firebase data cleanly
        window.location.reload();
      }
    } catch (err) {
      console.error('Google Sign In error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Google Sign Out Handler
  const handleSignOut = async () => {
    try {
      await firebaseService.signOut();
    } catch {
      // ignore
    }
    // Wipe local user state and reload to blank 0 stage
    StorageService.resetAllData();
    localStorage.removeItem('typebrutal_auth_user_v1');
    localStorage.removeItem('typebrutal_cloud_mock_v1');
    window.location.href = '/';
  };

  // Permanently Delete Account Handler (removes user completely from Firebase Auth & Database)
  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    setIsSyncing(true);
    try {
      // Set safety timeout of 6 seconds so it never hangs
      const deletePromise = firebaseService.deleteAccount();
      const timeoutPromise = new Promise<{ success: boolean; error?: string }>((resolve) => 
        setTimeout(() => resolve({ success: true }), 6000)
      );
      
      const result = await Promise.race([deletePromise, timeoutPromise]);
      if (!result.success && result.error) {
        alert(result.error);
        return;
      }
    } catch (err) {
      console.error('Account deletion error:', err);
    } finally {
      // Purge all local training data and reload to home page with blank 0 stage
      StorageService.resetAllData();
      localStorage.removeItem('typebrutal_auth_user_v1');
      localStorage.removeItem('typebrutal_cloud_mock_v1');
      window.location.href = '/';
    }
  };

  // Manual Firebase Sync
  const handleManualSync = async () => {
    if (!currentUser) return;
    setIsSyncing(true);
    try {
      const currentState = StorageService.getLastState();
      const syncPromise = firebaseService.syncToCloud({
        settings,
        history,
        streak,
        mistakes,
        lastState: currentState,
      });
      const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 4000));
      await Promise.race([syncPromise, timeoutPromise]);

      if (currentState) {
        setLastState(currentState);
      }
    } catch (err) {
      console.error('Manual sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle test completion & cloud sync
  const handleTestComplete = (stats: {
    wpm: number;
    rawWpm: number;
    netWpm: number;
    cpm: number;
    accuracy: number;
    consistency: number;
    duration: number;
    correctChars: number;
    incorrectChars: number;
    extraChars: number;
    missedKeys: Record<string, number>;
    timeline: WpmPoint[];
  }) => {
    const newResult: TestResult = {
      id: `test_${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      timestamp: Date.now(),
      wpm: stats.wpm,
      rawWpm: stats.rawWpm,
      netWpm: stats.netWpm,
      cpm: stats.cpm,
      accuracy: stats.accuracy,
      consistency: stats.consistency,
      duration: stats.duration,
      difficulty,
      testType,
      testConfig: testType === 'time' ? timeDuration : wordCount,
      totalChars: stats.correctChars + stats.incorrectChars + stats.extraChars,
      correctChars: stats.correctChars,
      incorrectChars: stats.incorrectChars,
      extraChars: stats.extraChars,
      missedKeys: stats.missedKeys,
      timeline: stats.timeline,
      quoteAuthor: textPayload.author,
      targetWpmAchieved: stats.wpm >= (settings.targetWpm || 70),
    };

    // Save to local storage
    StorageService.saveTestResult(newResult);

    // Refresh state
    setLatestResult(newResult);
    const updatedHistory = StorageService.getHistory();
    const updatedStreak = StorageService.getStreak();
    const updatedMistakes = StorageService.getMistakes();
    const updatedStats = StorageService.getStatsSummary();

    setHistory(updatedHistory);
    setStreak(updatedStreak);
    setMistakes(updatedMistakes);
    setTestState('completed');

    // Create & save latest state
    const newLastState: LastTrainingState = {
      timestamp: Date.now(),
      date: newResult.date,
      lastWpm: newResult.wpm,
      lastAccuracy: newResult.accuracy,
      difficulty,
      testType,
      testConfig: testType === 'time' ? timeDuration : wordCount,
      rollingWpm: updatedStats.rolling10Wpm,
      targetProgressPercent: updatedStats.target70Progress,
    };
    setLastState(newLastState);
    StorageService.saveLastState(newLastState);

    // Automatic background Firestore cloud sync if logged in
    if (currentUser) {
      setIsSyncing(true);
      firebaseService.syncToCloud({
        settings,
        history: updatedHistory,
        streak: updatedStreak,
        mistakes: updatedMistakes,
        lastState: newLastState,
      }).finally(() => {
        setIsSyncing(false);
      });
    }
  };

  // Reset test with same text
  const handleRetrySameText = () => {
    setTestSessionKey((k) => k + 1);
    setTestState('idle');
    setLatestResult(null);
  };

  // Next test with new text
  const handleNextTest = () => {
    setTestSessionKey((k) => k + 1);
    setLatestResult(null);
    loadNewText();
  };

  // Launch targeted mistake drill
  const handleStartMistakeDrill = (keys: string[]) => {
    setTestSessionKey((k) => k + 1);
    setDrillKeys(keys);
    setDifficulty('drill');
    setActiveView('trainer');
    setLatestResult(null);
    loadNewText('drill', testType, timeDuration, wordCount, keys);
  };

  // Update settings handler
  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    StorageService.saveSettings(updated);

    // Cloud sync settings
    if (currentUser) {
      firebaseService.syncToCloud({
        settings: updated,
        history,
        streak,
        mistakes,
        lastState,
      });
    }
  };

  // Refresh data from storage
  const handleDataModified = () => {
    setHistory(StorageService.getHistory());
    setStreak(StorageService.getStreak());
    setMistakes(StorageService.getMistakes());
    setSettings(StorageService.getSettings());
    setLastState(StorageService.getLastState());
  };

  // On-Screen Key Click Handler
  const handleVirtualKeyClick = (keyChar: string) => {
    setExternalKeyTrigger({ key: keyChar, timestamp: Date.now() });
  };

  // Stats summaries
  const statsSummary = StorageService.getStatsSummary();
  const troubleKeysList = Object.keys(mistakes);

  return (
    <div className="min-h-screen flex flex-col justify-between py-6 px-4 md:px-8">
      {/* Top Header */}
      <Header
        settings={settings}
        streak={streak}
        rollingWpm={statsSummary.rolling10Wpm}
        currentUser={currentUser}
        isSyncing={isSyncing}
        activeView={activeView}
        onViewChange={(v) => {
          setActiveView(v);
          if (v === 'trainer' && testState === 'completed') {
            handleNextTest();
          }
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* Main Content Area */}
      <main className="w-full flex-1 flex flex-col items-center justify-center">
        {activeView === 'analytics' ? (
          <AnalyticsView
            history={history}
            streak={streak}
            settings={settings}
            onBackToTrainer={() => setActiveView('trainer')}
            onStartDrill={handleStartMistakeDrill}
            onDataModified={handleDataModified}
          />
        ) : testState === 'completed' && latestResult ? (
          <StatsDashboard
            result={latestResult}
            bestWpm={statsSummary.bestWpm}
            settings={settings}
            onNextTest={handleNextTest}
            onRetrySameText={handleRetrySameText}
            onPracticeMistakes={handleStartMistakeDrill}
            onViewAnalytics={() => setActiveView('analytics')}
          />
        ) : (
          <div className="w-full flex flex-col items-center">
            {/* Mode & Difficulty Selector */}
            <ModeSelector
              difficulty={difficulty}
              testType={testType}
              timeDuration={timeDuration}
              wordCount={wordCount}
              troubleKeyCount={troubleKeysList.length}
              onSelectDifficulty={(d) => {
                setDifficulty(d);
                loadNewText(d, testType, timeDuration, wordCount, drillKeys);
              }}
              onSelectTestType={(t) => {
                setTestType(t);
                loadNewText(difficulty, t, timeDuration, wordCount, drillKeys);
              }}
              onSelectTimeDuration={(d) => {
                setTimeDuration(d);
                loadNewText(difficulty, 'time', d, wordCount, drillKeys);
              }}
              onSelectWordCount={(w) => {
                setWordCount(w);
                loadNewText(difficulty, 'words', timeDuration, w, drillKeys);
              }}
            />

            {/* Live Typing Canvas */}
            {!isLoadingText ? (
              <TypingCanvas
                key={`typing-canvas-${testSessionKey}`}
                text={textPayload.text}
                author={textPayload.author}
                source={textPayload.source}
                testType={testType}
                testConfig={testType === 'time' ? timeDuration : wordCount}
                difficulty={difficulty}
                settings={settings}
                externalKeyTrigger={externalKeyTrigger}
                onTestComplete={handleTestComplete}
                onResetTest={handleRetrySameText}
                onKeyPressUpdate={(pressed, target) => {
                  setActiveKey(pressed);
                  setTargetKey(target);
                }}
              />
            ) : (
              <div className="w-full max-w-5xl h-64 bg-white dark:bg-[#1E1E1E] neo-box flex items-center justify-center">
                <span className="font-mono text-sm font-bold uppercase animate-pulse">
                  ⚡ Generating dynamic text drill...
                </span>
              </div>
            )}

            {/* Virtual Keyboard */}
            {settings.showLiveKeyboard && (
              <VirtualKeyboard
                activeKey={activeKey}
                targetKey={targetKey}
                mistakes={mistakes}
                showFingerGuide={settings.keyboardFingerGuide}
                showHeatmap={settings.keyboardHeatmap}
                onToggleFingerGuide={() =>
                  handleUpdateSettings({
                    keyboardFingerGuide: true,
                    keyboardHeatmap: false,
                  })
                }
                onToggleHeatmap={() =>
                  handleUpdateSettings({
                    keyboardHeatmap: !settings.keyboardHeatmap,
                    keyboardFingerGuide: settings.keyboardHeatmap,
                  })
                }
                onKeyClick={handleVirtualKeyClick}
              />
            )}
          </div>
        )}
      </main>

      {/* Professional Neobrutalist Footer */}
      <Footer />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* Firebase Cloud Sync Modal */}
      <FirebaseModal
        isOpen={isFirebaseModalOpen}
        currentUser={currentUser}
        lastState={lastState}
        isSyncing={isSyncing}
        onClose={() => setIsFirebaseModalOpen(false)}
        onLoginGoogle={handleGoogleLogin}
        onSignOut={handleSignOut}
        onManualSync={handleManualSync}
        onDeleteAccount={handleDeleteAccount}
      />
    </div>
  );
};

export default App;
