import type { Draft } from 'immer';
import type { FiveSecondsAction, FiveSecondsGameState } from './schema';
import { produce } from 'immer';
import {
  addSeenQuestionId,
  resetVoting,
  startVoting,
  submitVote,
  tallyVotes,
} from './actions';

/**
 * The game-specific reducer for "Five Seconds".
 * This only handles actions that are unique to this game.
 * For core actions, it will do nothing and return the original state.
 */
export function fiveSecondsGameReducer(
  state: FiveSecondsGameState,
  action: FiveSecondsAction,
): FiveSecondsGameState {
  return produce(state, (draft: Draft<FiveSecondsGameState>) => {
    switch (action.type) {
      case 'ADD_SEEN_QUESTION_ID':
        addSeenQuestionId(draft, action.payload);
        break;
      case 'START_VOTING':
        startVoting(draft, action.payload);
        break;
      case 'SUBMIT_VOTE':
        submitVote(draft, action.payload);
        break;
      case 'RESET_VOTING':
        resetVoting(draft);
        break;
      case 'TALLY_VOTES':
        tallyVotes(draft, action.payload);
        break;
    }
  });
}
