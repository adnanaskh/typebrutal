import React, { useState } from 'react';
import { 
  X, 
  RefreshCw, 
  LogOut, 
  Database,
  Clock,
  Trash2,
  AlertTriangle,
  UserCheck,
  ShieldAlert
} from 'lucide-react';
import type { UserProfile, LastTrainingState } from '../types';

interface FirebaseModalProps {
  isOpen: boolean;
  currentUser: UserProfile | null;
  lastState: LastTrainingState | null;
  isSyncing: boolean;
  onClose: () => void;
  onLoginGoogle: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onManualSync: () => Promise<void>;
  onDeleteAccount: () => Promise<void>;
}

export const FirebaseModal: React.FC<FirebaseModalProps> = ({
  isOpen,
  currentUser,
  lastState,
  isSyncing,
  onClose,
  onLoginGoogle,
  onSignOut,
  onManualSync,
  onDeleteAccount,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [syncedToast, setSyncedToast] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSyncClick = async () => {
    await onManualSync();
    setSyncedToast(true);
    setTimeout(() => setSyncedToast(false), 3000);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDeleteAccount();
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-white dark:bg-[#1E1E1E] border-4 border-black shadow-[8px_8px_0px_#000] p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: USER PROFILE & ACCOUNT DETAILS */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b-3 border-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neo-yellow border-2 border-black flex items-center justify-center font-black text-black shadow-[2px_2px_0px_#000]">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black font-display uppercase tracking-tight text-black dark:text-white">
                USER PROFILE & ACCOUNT DETAILS
              </h2>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Manage your cloud sync status, training progress & account data
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setShowDeleteConfirm(false);
              onClose();
            }}
            className="p-1.5 bg-neo-red text-white border-2 border-black font-black hover:bg-red-600 transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Logged-In User Profile */}
        {currentUser ? (
          <div className="flex flex-col gap-4">
            {/* Account Card (NO Profile Photo) */}
            <div className="p-4 bg-neo-yellow/20 border-3 border-black shadow-[3px_3px_0px_#000] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Neobrutalist Initials Avatar Box (No Photo) */}
                <div className="w-12 h-12 bg-neo-yellow border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center font-black text-lg text-black font-display uppercase">
                  {currentUser.displayName ? currentUser.displayName.charAt(0) : 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-base text-black dark:text-white uppercase font-display">
                      {currentUser.displayName || 'Google Account'}
                    </span>
                    {currentUser.isDemo && (
                      <span className="px-1.5 py-0.2 bg-neo-pink text-white text-[9px] font-black uppercase border border-black">
                        DEMO USER
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 font-mono">
                    {currentUser.email || 'Synchronized with Firebase'}
                  </p>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={onSignOut}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-black border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0px_#000] hover:bg-neo-red hover:text-white transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                title="Sign out from this device"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>

            {/* Cloud Sync Status */}
            <div className="p-4 bg-gray-50 dark:bg-black border-2 border-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-black">
                <span className={`w-3 h-3 rounded-full ${isSyncing ? 'bg-neo-yellow animate-ping' : 'bg-neo-lime'} border border-black`} />
                <span className="uppercase text-black dark:text-white">
                  {isSyncing ? 'Syncing to Firebase Database...' : syncedToast ? '✅ Synced to Firebase!' : 'Firebase Cloud Sync Active'}
                </span>
              </div>

              <button
                onClick={handleSyncClick}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neo-cyan text-black font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-cyan-400 transition-all active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50 cursor-pointer"
                title="Force refresh synchronization with Firebase Realtime Database & Firestore"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{syncedToast ? 'Synced!' : 'Sync Now'}</span>
              </button>
            </div>

            {/* Latest Training State Snapshot */}
            {lastState ? (
              <div className="p-4 bg-white dark:bg-[#222222] border-3 border-black shadow-[3px_3px_0px_#000]">
                <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-black">
                  <span className="text-xs font-black uppercase flex items-center gap-1.5 text-black dark:text-white">
                    <Database className="w-4 h-4 text-neo-pink" />
                    LATEST STORED TRAINING SNAPSHOT
                  </span>
                  <span className="text-[11px] font-mono text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {lastState.date}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2 bg-neo-yellow border border-black text-center shadow-[1px_1px_0px_#000]">
                    <span className="text-[10px] font-black uppercase text-black/70">LAST WPM</span>
                    <p className="text-xl font-black font-display text-black">{lastState.lastWpm}</p>
                  </div>

                  <div className="p-2 bg-neo-cyan border border-black text-center shadow-[1px_1px_0px_#000]">
                    <span className="text-[10px] font-black uppercase text-black/70">ACCURACY</span>
                    <p className="text-xl font-black font-display text-black">{lastState.lastAccuracy}%</p>
                  </div>

                  <div className="p-2 bg-neo-lime border border-black text-center shadow-[1px_1px_0px_#000]">
                    <span className="text-[10px] font-black uppercase text-black/70">10-TEST AVG</span>
                    <p className="text-xl font-black font-display text-black">{lastState.rollingWpm} <span className="text-xs">WPM</span></p>
                  </div>

                  <div className="p-2 bg-neo-pink border border-black text-center text-white shadow-[1px_1px_0px_#000]">
                    <span className="text-[10px] font-black uppercase text-white/80">70 WPM GOAL</span>
                    <p className="text-xl font-black font-display text-white">{lastState.targetProgressPercent}%</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 dark:bg-black border-2 border-black text-center text-xs font-bold text-gray-500">
                Complete a typing test to automatically synchronize your first performance state to Firebase.
              </div>
            )}

            {/* DANGER ZONE: Permanent Account Deletion */}
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/20 border-3 border-neo-red shadow-[4px_4px_0px_#000]">
              {!showDeleteConfirm ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-black font-display uppercase text-neo-red flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      DANGER ZONE: DELETE ACCOUNT
                    </h4>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mt-0.5">
                      Completely delete your account and all stored data from Firebase with no trace remaining.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-neo-red hover:bg-red-600 text-white font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer whitespace-nowrap"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Account</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 p-3 bg-white dark:bg-[#1A1A1A] border-2 border-black">
                  <div className="flex items-center gap-2 text-neo-red font-black text-xs uppercase font-display">
                    <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                    <span>CONFIRM PERMANENT ACCOUNT DELETION</span>
                  </div>
                  <p className="text-xs font-semibold text-black dark:text-white leading-relaxed">
                    Are you absolutely sure you want to delete your account? This action is <strong>irreversible</strong>.
                    Your user account will be <strong>permanently deleted from Firebase Authentication</strong>, and your
                    Firestore records, history, streaks, and personal bests will be <strong>completely erased</strong> with zero trace left.
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-300 dark:border-gray-700">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isDeleting}
                      className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-black font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmDelete}
                      disabled={isDeleting}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-neo-red hover:bg-red-700 text-white font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isDeleting ? 'Deleting Completely...' : 'Yes, Delete Everything'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Logged Out State */
          <div className="flex flex-col gap-5 text-center py-2">
            <div className="p-6 bg-neo-yellow/20 border-3 border-black shadow-[4px_4px_0px_#000] flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-neo-yellow border-3 border-black flex items-center justify-center font-black text-3xl shadow-[3px_3px_0px_#000]">
                ⚡
              </div>
              <div>
                <h3 className="text-lg font-black font-display uppercase text-black dark:text-white">
                  Sign In To Your Account
                </h3>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 max-w-md mt-1">
                  Log in with your Google account to securely store all your typing sessions, streaks, mistake heatmaps, and 70+ WPM benchmarks in Firebase.
                </p>
              </div>

              {/* Google Sign In Button */}
              <button
                onClick={onLoginGoogle}
                disabled={isSyncing}
                className="w-full max-w-sm flex items-center justify-center gap-3 py-3.5 px-6 bg-white hover:bg-gray-50 text-black font-black text-sm uppercase border-3 border-black shadow-[4px_4px_0px_#000] active:translate-x-1 active:translate-y-1 transition-all cursor-pointer"
              >
                {/* SVG Google 'G' Logo */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                <span>Sign In With Google</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-5 pt-3 border-t-2 border-black flex justify-end">
          <button
            onClick={() => {
              setShowDeleteConfirm(false);
              onClose();
            }}
            className="px-5 py-2 bg-neo-yellow text-black font-black uppercase border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-yellow-400 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
