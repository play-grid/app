import type { Draft } from 'immer';
import type {
  AddSeenQuestionIdAction,
  FiveSecondsGameState,
  StartVotingAction,
  SubmitVoteAction,
} from './schema';
import { gameReducer as coreGameReducer } from '@guess-logo/game-core/game-logic/reducer';

export function addSeenQuestionId(
  draft: Draft<FiveSecondsGameState>,
  payload: AddSeenQuestionIdAction['payload'],
): void {
  draft.seenQuestionIds.push(payload.id);
}

export function startVoting(
  draft: Draft<FiveSecondsGameState>,
  payload: StartVotingAction['payload'],
): void {
  draft.votingState = {
    isVoting: true,
    votes: [],
    voters: payload.voters,
    currentVoterIndex: 0,
  };
}

export function submitVote(
  draft: Draft<FiveSecondsGameState>,
  payload: SubmitVoteAction['payload'],
): void {
  if (draft.votingState && draft.votingState.isVoting) {
    const currentVoterId = draft.votingState.voters[draft.votingState.currentVoterIndex];
    if (currentVoterId) {
      draft.votingState.votes.push({ playerId: currentVoterId, isValid: payload.isValid });
      draft.votingState.currentVoterIndex += 1;
    }
  }
}

export function resetVoting(draft: Draft<FiveSecondsGameState>): void {
  draft.votingState = null;
}

export function tallyVotes(
  draft: Draft<FiveSecondsGameState>,
): void {
  const voting = draft.votingState;
  if (!voting) {
    return;
  }

  const validVotes = voting.votes.filter(v => v.isValid).length;
  const invalidVotes = voting.votes.length - validVotes;

  if (validVotes <= invalidVotes) {
    // TODO:implement
    // Penalty logic for failed vote
  }

  // Reset voting state
  draft.votingState = null;

  // Compose with the core reducer to advance the turn
  const nextTurnAction = { type: 'NEXT_TURN' as const };
  const nextCoreState = coreGameReducer(
    draft as Parameters<typeof coreGameReducer>[0],
    nextTurnAction,
  );
  Object.assign(draft, nextCoreState);
}
