import { createUIStore } from '@guess-logo/game-core/stores/ui';

interface GuessLogoUICustomState {
  // Game Setup UI (from legacy)
  attemptedStart: boolean;
  playOnlineBtn: boolean;

  // Loading states
  loadAttempted: boolean;

  // Resume game functionality
  showResumeOption: boolean;
  resumeCheckComplete: boolean;
}

// ============ Initial State ============
const initialCustomState: GuessLogoUICustomState = {
  // Legacy state
  attemptedStart: false,
  playOnlineBtn: false,
  loadAttempted: false,
  showResumeOption: false,
  resumeCheckComplete: false,
};

// ============ Store Creation ============
export const useGuessLogoUIStore = createUIStore<GuessLogoUICustomState>({
  name: 'GuessLogo',
  initialCustomState,
});

export const guessLogoUI = {

  setAttemptedStart: (attempted: boolean) => {
    useGuessLogoUIStore.getState().updateCustom({ attemptedStart: attempted });
  },

  setPlayOnlineBtn: (disabled: boolean) => {
    useGuessLogoUIStore.getState().updateCustom({ playOnlineBtn: disabled });
  },

  setLoadAttempted: (attempted: boolean) => {
    useGuessLogoUIStore.getState().updateCustom({ loadAttempted: attempted });
  },

  setShowResumeOption: (show: boolean) => {
    useGuessLogoUIStore.getState().updateCustom({ showResumeOption: show });
  },

  setResumeCheckComplete: (complete: boolean) => {
    useGuessLogoUIStore.getState().updateCustom({ resumeCheckComplete: complete });
  },

  resetSetupUI: () => {
    useGuessLogoUIStore.getState().updateCustom({
      attemptedStart: false,
      playOnlineBtn: false,
    });
    useGuessLogoUIStore.getState().clearError();
  },

  resetLoadingStates: () => {
    useGuessLogoUIStore.getState().setLoading(false);
    useGuessLogoUIStore.getState().updateCustom({ loadAttempted: false });
  },
};

// ============ Selectors (Getters) ============
export const guessLogoUISelectors = {
  // Legacy selectors
  useAttemptedStart: () => useGuessLogoUIStore(s => s.custom.attemptedStart),
  usePlayOnlineBtn: () => useGuessLogoUIStore(s => s.custom.playOnlineBtn),
  useLoadAttempted: () => useGuessLogoUIStore(s => s.custom.loadAttempted),
  useShowResumeOption: () => useGuessLogoUIStore(s => s.custom.showResumeOption),
  useResumeCheckComplete: () => useGuessLogoUIStore(s => s.custom.resumeCheckComplete),

  // Base store selectors (legacy compatibility)
  useIsLoading: () => useGuessLogoUIStore(s => s.isLoading),
  useError: () => useGuessLogoUIStore(s => s.error),
};
