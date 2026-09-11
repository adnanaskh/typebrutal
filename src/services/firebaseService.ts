import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  deleteUser,
  reauthenticateWithPopup,
  type Auth,
  type User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc,
  type Firestore 
} from 'firebase/firestore';
import { 
  getDatabase, 
  ref as rtdbRef, 
  set as rtdbSet, 
  get as rtdbGet, 
  remove as rtdbRemove,
  type Database as RTDatabase 
} from 'firebase/database';
import { getAnalytics, isSupported } from 'firebase/analytics';
import type { UserProfile, CloudUserData, FirebaseCustomConfig, LastTrainingState } from '../types';

const STORAGE_KEYS = {
  AUTH_USER: 'typebrutal_auth_user_v1',
  CLOUD_MOCK_CACHE: 'typebrutal_cloud_mock_v1',
  LAST_STATE: 'typebrutal_last_state_v1',
};

// Production configuration read exclusively from environment variables
const STRICT_FIREBASE_CONFIG: FirebaseCustomConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "",
};

class FirebaseService {
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  private db: Firestore | null = null;
  private rtdb: RTDatabase | null = null;
  private googleProvider: GoogleAuthProvider | null = null;
  private currentUser: UserProfile | null = null;
  private isInitialized: boolean = false;
  private authListeners: ((user: UserProfile | null) => void)[] = [];

  constructor() {
    this.init();
  }

  // Retrieve strict Firebase credentials
  public getConfig(): FirebaseCustomConfig {
    return STRICT_FIREBASE_CONFIG;
  }

  // Initialize Firebase app safely
  public init() {
    try {
      const config = this.getConfig();
      if (config && config.apiKey && config.projectId) {
        if (!getApps().length) {
          this.app = initializeApp(config);
        } else {
          this.app = getApps()[0];
        }
        this.auth = getAuth(this.app);
        
        // Initialize Firestore
        try {
          this.db = getFirestore(this.app);
        } catch {
          // Firestore optional
        }

        // Initialize Realtime Database (100% Free on Spark plan)
        try {
          this.rtdb = getDatabase(this.app);
        } catch {
          // Realtime Database optional
        }

        this.googleProvider = new GoogleAuthProvider();
        this.googleProvider.setCustomParameters({ prompt: 'select_account' });
        this.isInitialized = true;

        // Initialize Analytics if supported in browser environment
        if (typeof window !== 'undefined') {
          isSupported().then((supported) => {
            if (supported && this.app) {
              try {
                getAnalytics(this.app);
              } catch {
                // ignore analytics errors
              }
            }
          }).catch(() => {});
        }

        // Listen for real auth state changes
        onAuthStateChanged(this.auth, (fbUser: User | null) => {
          if (fbUser) {
            const userProfile: UserProfile = {
              uid: fbUser.uid,
              displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Typing Champion',
              email: fbUser.email,
              photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`,
              isDemo: false,
            };
            this.currentUser = userProfile;
            localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(userProfile));
            this.notifyAuthListeners(userProfile);
          } else {
            this.currentUser = null;
            localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
            this.notifyAuthListeners(null);
          }
        });

        return;
      }
    } catch (err) {
      console.error('Firebase initialization error:', err);
    }

    try {
      const cached = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (cached) {
        const parsed: UserProfile = JSON.parse(cached);
        if (!parsed.isDemo) {
          this.currentUser = parsed;
        } else {
          localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
        }
      }
    } catch {
      this.currentUser = null;
    }
  }

  public onAuthState(cb: (user: UserProfile | null) => void) {
    this.authListeners.push(cb);
    cb(this.currentUser);
    return () => {
      this.authListeners = this.authListeners.filter(l => l !== cb);
    };
  }

  private notifyAuthListeners(user: UserProfile | null) {
    this.authListeners.forEach(cb => cb(user));
  }

  public getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  public isRealFirebaseConfigured(): boolean {
    return Boolean(this.isInitialized && this.auth);
  }

  // Sign in with Google (Authenticates with real Firebase Google Auth)
  public async signInWithGoogle(): Promise<UserProfile> {
    if (!this.isInitialized || !this.auth || !this.googleProvider) {
      throw new Error(
        'Firebase is not initialized. Please verify your VITE_FIREBASE_* environment variables in .env'
      );
    }

    try {
      const result = await signInWithPopup(this.auth, this.googleProvider);
      const fbUser = result.user;
      const profile: UserProfile = {
        uid: fbUser.uid,
        displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Google User',
        email: fbUser.email,
        photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`,
        isDemo: false,
      };
      this.currentUser = profile;
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(profile));
      this.notifyAuthListeners(profile);
      return profile;
    } catch (err: unknown) {
      console.error('Real Google Auth popup error:', err);
      const fbErr = err as { code?: string; message?: string };
      let message = 'Failed to sign in with Google.';
      if (fbErr?.code === 'auth/unauthorized-domain') {
        message = `Domain "${window.location.hostname}" is not authorized. Add it in Firebase Console > Authentication > Settings > Authorized domains.`;
      } else if (fbErr?.code === 'auth/operation-not-allowed') {
        message = 'Google Sign-In is not enabled. Enable it in Firebase Console > Authentication > Sign-in method > Google.';
      } else if (fbErr?.code === 'auth/popup-closed-by-user') {
        message = 'Sign-in popup was closed before completing authentication.';
      } else if (fbErr?.code === 'auth/popup-blocked') {
        message = 'Sign-in popup was blocked by the browser. Please allow popups for this site.';
      } else if (fbErr?.message) {
        message = fbErr.message;
      }
      throw new Error(message);
    }
  }

  // Sign out
  public async signOut(): Promise<void> {
    if (this.auth) {
      try {
        await fbSignOut(this.auth);
      } catch {
        // ignore
      }
    }
    this.currentUser = null;
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      localStorage.removeItem(STORAGE_KEYS.CLOUD_MOCK_CACHE);
      localStorage.removeItem(STORAGE_KEYS.LAST_STATE);
      sessionStorage.clear();
      if (typeof window !== 'undefined' && 'caches' in window) {
        caches.keys().then((keys) => {
          keys.forEach((key) => caches.delete(key));
        }).catch(() => {});
      }
    } catch {
      // ignore
    }
    this.notifyAuthListeners(null);
  }

  // Sync state to Firebase Firestore
  public async syncToCloud(data: Omit<CloudUserData, 'profile' | 'updatedAt'>): Promise<boolean> {
    if (!this.currentUser) return false;

    const payload: CloudUserData = {
      profile: this.currentUser,
      settings: data.settings,
      history: data.history,
      streak: data.streak,
      mistakes: data.mistakes,
      lastState: data.lastState,
      updatedAt: Date.now(),
    };

    try {
      localStorage.setItem(STORAGE_KEYS.CLOUD_MOCK_CACHE, JSON.stringify(payload));
      if (data.lastState) {
        localStorage.setItem(STORAGE_KEYS.LAST_STATE, JSON.stringify(data.lastState));
      }
    } catch {
      // ignore
    }

    // 1. Realtime Database sync (Free Tier)
    if (this.isInitialized && this.rtdb && !this.currentUser.isDemo) {
      try {
        const userRef = rtdbRef(this.rtdb, `users/${this.currentUser.uid}`);
        const safePayload = FirebaseService.sanitizeForRtdb(payload);
        await rtdbSet(userRef, safePayload);
      } catch (err) {
        console.warn('Realtime Database write note:', err);
      }
    }

    // 2. Firestore sync (Free Tier)
    if (this.isInitialized && this.db && !this.currentUser.isDemo) {
      try {
        const userDoc = doc(this.db, 'users', this.currentUser.uid);
        await setDoc(userDoc, payload, { merge: true });
      } catch (err) {
        console.warn('Firestore sync note:', err);
      }
    }

    return true;
  }

  // Sanitize object keys for Firebase Realtime Database (prohibits ., $, #, [, ], /)
  public static sanitizeForRtdb(val: unknown): unknown {
    if (val === null || val === undefined) return null;
    if (Array.isArray(val)) {
      return val.map(v => FirebaseService.sanitizeForRtdb(v));
    }
    if (typeof val === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
        const safeKey = k
          .replace(/\./g, '_dot_')
          .replace(/\$/g, '_dollar_')
          .replace(/#/g, '_hash_')
          .replace(/\[/g, '_lbracket_')
          .replace(/\]/g, '_rbracket_')
          .replace(/\//g, '_slash_');
        sanitized[safeKey] = FirebaseService.sanitizeForRtdb(v);
      }
      return sanitized;
    }
    return val;
  }

  // Revert sanitized object keys from Firebase Realtime Database
  public static desanitizeFromRtdb(val: unknown): unknown {
    if (val === null || val === undefined) return val;
    if (Array.isArray(val)) {
      return val.map(v => FirebaseService.desanitizeFromRtdb(v));
    }
    if (typeof val === 'object') {
      const desanitized: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
        const origKey = k
          .replace(/_dot_/g, '.')
          .replace(/_dollar_/g, '$')
          .replace(/_hash_/g, '#')
          .replace(/_lbracket_/g, '[')
          .replace(/_rbracket_/g, ']')
          .replace(/_slash_/g, '/');
        desanitized[origKey] = FirebaseService.desanitizeFromRtdb(v);
      }
      return desanitized;
    }
    return val;
  }

  // Fetch state from Firebase (Realtime Database or Cloud Firestore)
  public async fetchFromCloud(): Promise<CloudUserData | null> {
    if (!this.currentUser) return null;

    // 1. Check Realtime Database first
    if (this.isInitialized && this.rtdb && !this.currentUser.isDemo) {
      try {
        const userRef = rtdbRef(this.rtdb, `users/${this.currentUser.uid}`);
        const snap = await rtdbGet(userRef);
        if (snap.exists()) {
          return FirebaseService.desanitizeFromRtdb(snap.val()) as CloudUserData;
        }
      } catch (err) {
        console.warn('Realtime Database read note:', err);
      }
    }

    // 2. Check Firestore
    if (this.isInitialized && this.db && !this.currentUser.isDemo) {
      try {
        const userDoc = doc(this.db, 'users', this.currentUser.uid);
        const snap = await getDoc(userDoc);
        if (snap.exists()) {
          const data = snap.data() as CloudUserData;
          return data;
        }
      } catch (err) {
        console.warn('Firestore read note:', err);
      }
    }

    try {
      const cached = localStorage.getItem(STORAGE_KEYS.CLOUD_MOCK_CACHE);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // ignore
    }

    return null;
  }

  // Clear cloud data on Reset Stats
  public async resetCloudData(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.CLOUD_MOCK_CACHE);
    localStorage.removeItem(STORAGE_KEYS.LAST_STATE);

    if (this.isInitialized && this.currentUser && !this.currentUser.isDemo) {
      // Delete from Realtime Database
      if (this.rtdb) {
        try {
          const userRef = rtdbRef(this.rtdb, `users/${this.currentUser.uid}`);
          await rtdbRemove(userRef);
        } catch (err) {
          console.warn('Realtime Database reset note:', err);
        }
      }

      // Delete from Firestore
      if (this.db) {
        try {
          const userDoc = doc(this.db, 'users', this.currentUser.uid);
          await deleteDoc(userDoc);
        } catch (err) {
          console.warn('Firestore delete error:', err);
        }
      }
    }
  }

  // Permanently delete user account from Firebase Realtime DB, Firestore, Auth, and local state
  public async deleteAccount(): Promise<{ success: boolean; error?: string }> {
    const user = this.currentUser;
    if (!user) return { success: true };

    const uid = user.uid;

    if (this.isInitialized && !user.isDemo) {
      // 1. Permanently delete from Realtime Database
      if (this.rtdb) {
        try {
          const userRef = rtdbRef(this.rtdb, `users/${uid}`);
          await rtdbRemove(userRef);
        } catch (err) {
          console.warn('Realtime Database account removal note:', err);
        }
      }

      // 2. Permanently delete user document from Firestore
      if (this.db) {
        try {
          const userDoc = doc(this.db, 'users', uid);
          await deleteDoc(userDoc);
        } catch (err) {
          console.warn('Error deleting user document from Firestore:', err);
        }
      }
    }

    // 2. Permanently delete user from Firebase Authentication
    if (this.auth && this.auth.currentUser && !user.isDemo) {
      try {
        await deleteUser(this.auth.currentUser);
      } catch (err: unknown) {
        const authErr = err as { code?: string; message?: string };
        console.warn('Initial deleteUser attempt:', authErr);
        if (authErr?.code === 'auth/requires-recent-login' && this.googleProvider) {
          try {
            await reauthenticateWithPopup(this.auth.currentUser, this.googleProvider);
            await deleteUser(this.auth.currentUser);
          } catch (reauthErr) {
            console.error('Re-auth deletion failed:', reauthErr);
            // Sign out to clear session
            await this.signOut();
            return {
              success: false,
              error: 'Security prompt: Please sign back in with Google to confirm permanent deletion of your account.',
            };
          }
        }
      }
    }

    // 3. Completely purge local cache and storage
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    localStorage.removeItem(STORAGE_KEYS.CLOUD_MOCK_CACHE);
    localStorage.removeItem(STORAGE_KEYS.LAST_STATE);

    this.currentUser = null;
    this.notifyAuthListeners(null);

    return { success: true };
  }

  // Last State Management
  public getLastState(): LastTrainingState | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LAST_STATE);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return null;
  }

  public saveLastState(state: LastTrainingState) {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_STATE, JSON.stringify(state));
    } catch {
      // ignore
    }
  }
}

export const firebaseService = new FirebaseService();
