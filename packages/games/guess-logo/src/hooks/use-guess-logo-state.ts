import type { GuessLogoGameState } from '../logic/schema';
import { useGameState } from '@playgrid/game-core';

export function useGuessLogoState(): GuessLogoGameState {
  return useGameState<GuessLogoGameState>();
}

export function useLogos() {
  return useGameState(state => (state as GuessLogoGameState).logos);
}

export function useSettings() {
  return useGameState(state => (state as GuessLogoGameState).settings);
}

export function usePlayers() {
  return useGameState(state => (state as GuessLogoGameState).players);
}

export function useCurrentPlayer() {
  return useGameState((state) => {
    if (!state.turnState)
      return null;
    return (state as GuessLogoGameState).players[state.turnState.currentPlayerId];
  });
}

export function useIsContentLoaded() {
  return useGameState(state => (state as GuessLogoGameState).isContentLoaded);
}
