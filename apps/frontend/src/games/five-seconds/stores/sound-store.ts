import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PlayerPenalization {
  isSoundEnabled: boolean;
  isMusicEnabled: boolean;
  toggleSound: () => void;
  toggleMusic: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  setMusicEnabled: (enabled: boolean) => void;
}

export const usePlayerPenalization = create<PlayerPenalization>()(
  persist(
    set => ({
      isSoundEnabled: true,
      isMusicEnabled: true,
      toggleSound: () => set(state => ({ isSoundEnabled: !state.isSoundEnabled })),
      toggleMusic: () => set(state => ({ isMusicEnabled: !state.isMusicEnabled })),
      setSoundEnabled: (enabled: boolean) => set({ isSoundEnabled: enabled }),
      setMusicEnabled: (enabled: boolean) => set({ isMusicEnabled: enabled }),
    }),
    {
      name: 'five-seconds-player-settings',
    },
  ),
);
