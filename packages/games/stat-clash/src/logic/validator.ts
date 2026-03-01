import type { ValidationContext, ValidationResult } from '@playgrid/game-core';
import type { StatClashAction, StatClashGameState } from './schema';

export function validateStatClashAction(
  context: ValidationContext,
): ValidationResult {
  const state = context.state as StatClashGameState;
  const action = context.action as StatClashAction;

  if (action.type === 'GUESS_HIGHER') {
    if (state.settings.mode !== 'solo'
      && state.turnState?.currentPlayerId !== action.payload.playerId) {
      return { valid: false, reason: 'Not your turn' };
    }
  }

  if (action.type === 'ADD_HOTSEAT_PLAYER' && state.settings.mode !== 'hotseat') {
    return { valid: false, reason: 'Cannot add players in this mode' };
  }

  if (action.type === 'REMOVE_HOTSEAT_PLAYER' && state.settings.mode !== 'hotseat') {
    return { valid: false, reason: 'Cannot remove players in this mode' };
  }

  return { valid: true };
}
