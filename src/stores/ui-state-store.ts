import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export interface UIState {
  // Game Setup UI
  attemptedStart: boolean
  playOnlineBtn: boolean

  // Loading states
  isLoading: boolean
  loadAttempted: boolean

  // Resume game functionality
  showResumeOption: boolean
  resumeCheckComplete: boolean

  // Error states
  error: string | null

  // Actions
  setAttemptedStart: (attempted: boolean) => void
  setPlayOnlineBtn: (disabled: boolean) => void
  setIsLoading: (loading: boolean) => void
  setLoadAttempted: (attempted: boolean) => void
  setShowResumeOption: (show: boolean) => void
  setResumeCheckComplete: (complete: boolean) => void
  setError: (error: string | null) => void

  // Reset functions
  resetSetupUI: () => void
  resetLoadingStates: () => void
}

export const useUIStore = create<UIState>()(
  devtools(
    immer(set => ({
      // Initial state
      attemptedStart: false,
      playOnlineBtn: false,
      isLoading: false,
      loadAttempted: false,
      showResumeOption: false,
      resumeCheckComplete: false,
      error: null,

      // Actions
      setAttemptedStart: attemptedStart =>
        set((state) => {
          state.attemptedStart = attemptedStart
        }),

      setPlayOnlineBtn: playOnlineBtn =>
        set((state) => {
          state.playOnlineBtn = playOnlineBtn
        }),

      setIsLoading: isLoading =>
        set((state) => {
          state.isLoading = isLoading
        }),

      setLoadAttempted: loadAttempted =>
        set((state) => {
          state.loadAttempted = loadAttempted
        }),

      setShowResumeOption: showResumeOption =>
        set((state) => {
          state.showResumeOption = showResumeOption
        }),

      setResumeCheckComplete: resumeCheckComplete =>
        set((state) => {
          state.resumeCheckComplete = resumeCheckComplete
        }),

      setError: error =>
        set((state) => {
          state.error = error
        }),

      // Reset functions
      resetSetupUI: () =>
        set((state) => {
          state.attemptedStart = false
          state.playOnlineBtn = false
          state.error = null
        }),

      resetLoadingStates: () =>
        set((state) => {
          state.isLoading = false
          state.loadAttempted = false
        }),
    })),
    { name: 'UIStore' },
  ),
)
