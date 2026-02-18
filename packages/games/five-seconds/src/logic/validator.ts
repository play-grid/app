import type { ValidationContext, ValidationResult } from '@guess-logo/game-core';
import type { FiveSecondsGameState } from './schema';
import { ENABLE_CUSTOM_QUESTIONS_FEATURE } from '../definition';

export function validateFiveSecondsAction(
  ctx: ValidationContext,
): ValidationResult {
  const state = ctx.state as FiveSecondsGameState;
  const action = ctx.action;
  const playerId = ctx.playerId;
  const phase = state.turnState?.phase;

  // Phase-based validation
  switch (action.type) {
    case 'START_TURN':
      if (phase !== 'pre-turn') {
        return {
          valid: false,
          reason: `START_TURN only allowed in pre-turn phase, current: ${phase}`,
        };
      }

      // Only current player can start their turn
      if (playerId && playerId !== state.turnState?.currentPlayerId) {
        return {
          valid: false,
          reason: 'Only the current player can start their turn',
        };
      }
      break;

    case 'START_VOTING':
      if (phase !== 'answering') {
        return {
          valid: false,
          reason: `START_VOTING only allowed in answering phase, current: ${phase}`,
        };
      }
      break;

    case 'SUBMIT_VOTE':
      if (phase !== 'voting') {
        return {
          valid: false,
          reason: `SUBMIT_VOTE only allowed in voting phase, current: ${phase}`,
        };
      }

      // Only current voter can vote
      if (state.votingState && playerId) {
        const currentVoterId = state.votingState.voters[state.votingState.currentVoterIndex];
        if (playerId !== currentVoterId) {
          return {
            valid: false,
            reason: 'Not your turn to vote',
          };
        }
      }
      break;

    case 'TALLY_VOTES':
      // Only allow if voting is complete
      if (state.votingState) {
        const isComplete = state.votingState.currentVoterIndex >= state.votingState.voters.length;
        if (!isComplete) {
          return {
            valid: false,
            reason: 'Cannot tally votes, voting not complete',
          };
        }
      }
      break;

    case 'NEXT_TURN':
      // FIX: NEXT_TURN should rarely be called directly by clients
      // It's now handled internally by TALLY_VOTES
      // Only allow in specific phases (like pre-turn for skip functionality)
      if (phase !== 'pre-turn') {
        return {
          valid: false,
          reason: 'NEXT_TURN is handled automatically by TALLY_VOTES. Only allowed in pre-turn phase for special cases.',
        };
      }
      break;

    // Core actions - always allowed
    case 'ADD_PLAYER':
    case 'REMOVE_PLAYER':
    case 'UPDATE_SETTINGS':
      // Prevent enabling custom questions when feature is disabled
      if (!ENABLE_CUSTOM_QUESTIONS_FEATURE && (action.payload as any)?.useCustomQuestions === true) {
        return {
          valid: false,
          reason: 'Custom questions feature is disabled',
        };
      }
      // These are always allowed (host permissions checked elsewhere if needed)
      break;
    case 'START_GAME':
    case 'END_GAME':
    case 'SET_PHASE':
      // These are always allowed (host permissions checked elsewhere if needed)
      break;

    case 'RESET_GAME':
      // Only host can reset the game
      if (playerId && state.players[playerId] && !state.players[playerId].isHost) {
        return {
          valid: false,
          reason: 'Only the host can reset the game',
        };
      }
      break;
      // Effect-triggered actions - always allowed (server-side only)
    case 'TIMES_UP':
    case 'LOAD_QUESTIONS':
    case 'SET_QUESTION':
    case 'START_TURN_TIMER':
    case 'FETCH_QUESTIONS_ERROR':
    case 'CLEAR_QUESTION_ERROR':
      // These come from effects, not user input
      break;

    default:
      // Unknown action - allow (might be base action)
      break;
  }

  return { valid: true };
}
