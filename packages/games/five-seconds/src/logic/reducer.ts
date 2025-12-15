// packages/games/five-seconds/game-logic/reducer.ts
import type { Draft } from 'immer';
import type { FiveSecondsAction, FiveSecondsGameState } from './schema';
import { produce } from 'immer';
import { logger } from '../logger';
import {
  addSeenQuestionId,
  resetVoting,
  setQuestion,
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
      case 'SET_QUESTION':
        setQuestion(draft, action.payload);
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
      case 'LOAD_QUESTIONS':
        // Store questions from effect handler
        draft.questions = action.payload.questions;
        if (action.payload.questions.length > 0) {
          // Set first question as current
          draft.currentQuestion = action.payload.questions[0];
          // Add all question IDs to seen list
          action.payload.questions.forEach((q) => {
            if (!draft.seenQuestionIds.includes(q.id)) {
              draft.seenQuestionIds.push(q.id);
            }
          });
        }
        break;
      case 'FETCH_QUESTIONS_ERROR':
        logger.error('Failed to fetch questions:', action.payload.error);
        break;
    }
  });
}
