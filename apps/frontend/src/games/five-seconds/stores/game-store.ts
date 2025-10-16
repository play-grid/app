import type { FiveSecondsGameSettings, FiveSecondsPlayer, VotingState } from '../types';
import { createGameStore } from '@guess-logo/game-core/stores';
import { CATEGORIES, DIFFICULTIES } from '../types';

const initialSettings: FiveSecondsGameSettings = {
  categories: [CATEGORIES[0]],
  difficulty: DIFFICULTIES[0],
  timePerTurn: 5,
};

export const useFiveSecondsStore = createGameStore<
  FiveSecondsGameSettings,
  FiveSecondsPlayer,
  {
    votingState: VotingState | null;
    submitVote: (isValid: boolean) => void;
    startVoting: (currentPlayerId: string, players: FiveSecondsPlayer[]) => void;
    resetVoting: () => void;
    tallyVotes: () => boolean; // returns true if majority voted valid
  }
>({
  name: 'five-seconds-game',
  initialSettings,
  options: {
    maxPlayers: 4,
    minPlayers: 2,
    turnBased: true,
    requireReady: false,
  },
  // Custom state and actions for voting
  customState: {
    votingState: null,
  },
  customActions: (set, get) => ({
    startVoting: (currentPlayerId: string, players: FiveSecondsPlayer[]) => {
      const voters = players.filter(p => p.id !== currentPlayerId).map(p => p.id);
      if (voters.length === 0) {
        // No one to vote, just move on
        get().resetVoting();
        get().nextTurn?.();
        return;
      }
      set({
        votingState: {
          isVoting: true,
          votes: [],
          voters,
          currentVoterIndex: 0,
        },
      });
    },
    submitVote: (isValid: boolean) => {
      const { votingState } = get();
      if (!votingState || !votingState.isVoting)
        return;

      const currentVoterId = votingState.voters[votingState.currentVoterIndex];
      if (!currentVoterId)
        return;

      set({
        votingState: {
          ...votingState,
          votes: [...votingState.votes, { playerId: currentVoterId, isValid }],
          currentVoterIndex: votingState.currentVoterIndex + 1,
        },
      });
    },
    tallyVotes: () => {
      const { votingState } = get();
      if (!votingState)
        return false;

      const validVotes = votingState.votes.filter((v: { isValid: boolean }) => v.isValid).length;
      const invalidVotes = votingState.votes.filter((v: { isValid: boolean }) => !v.isValid).length;

      // Majority wins
      return validVotes > invalidVotes;
    },
    resetVoting: () => {
      set({ votingState: null });
    },
  }),
});
