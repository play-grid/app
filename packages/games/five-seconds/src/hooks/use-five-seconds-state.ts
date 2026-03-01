import type { FiveSecondsGameState, VotingState } from '../logic/schema';
import type { Question } from '../schema';
import { useGameState } from '@playgrid/game-core';

/**
 * Five Seconds specific state selectors.
 */
export function useFiveSecondsState(): FiveSecondsGameState {
  return useGameState<FiveSecondsGameState>();
}

export function useCurrentQuestion(): Question | null {
  return useGameState(state => (state as FiveSecondsGameState).currentQuestion);
}

export function useVotingState(): VotingState | null {
  return useGameState(state => (state as FiveSecondsGameState).votingState);
}

export function useSeenQuestionIds(): string[] {
  return useGameState(state => (state as FiveSecondsGameState).seenQuestionIds);
}

export function useIsVoting(): boolean {
  return useGameState(
    state => (state as FiveSecondsGameState).votingState?.isVoting ?? false,
  );
}

export function useCurrentVoter(): string | null {
  return useGameState((state) => {
    const voting = (state as FiveSecondsGameState).votingState;
    if (!voting)
      return null;
    return voting.voters[voting.currentVoterIndex] ?? null;
  });
}

export function useFiveSecondsSettings() {
  return useGameState(
    state => (state as FiveSecondsGameState).settings,
  );
}
