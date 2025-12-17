import type { GameAction } from './schema/actions.types';
import type { BaseGameState } from './schema/state.types';
import {
  addPlayer,
  changePhase,
  endGame,
  initTurnState,
  nextRound,
  nextTurn,
  previousTurn,
  removePlayer,
  removePlayerFromTurnOrder,
  reorderPlayers,
  resetGame,
  reverseTurnDirection,
  setCurrentPlayer,
  setTurnPhase,
  skipPlayers,
  startGame,
  togglePlayerReady,
  updatePlayer,
  updateSettings,
} from './actions';

export function gameReducer<T extends BaseGameState>(
  state: T,
  action: GameAction,
): T {
  switch (action.type) {
    case 'SET_PHASE':
      return changePhase(state, action.payload);
    case 'START_GAME':
      return startGame(state);
    case 'END_GAME':
      return endGame(state);
    case 'RESET_GAME':
      return resetGame(state);
    case 'ADD_PLAYER':
      return addPlayer(state, action.payload);
    case 'REMOVE_PLAYER': {
      let newState = removePlayer(state, action.payload.playerId);
      if (state.turnState) {
        newState = removePlayerFromTurnOrder(newState, action.payload.playerId);
      }
      return newState;
    }
    case 'UPDATE_PLAYER':
      return updatePlayer(state, action.payload.playerId, action.payload.updates);
    case 'TOGGLE_PLAYER_READY':
      return togglePlayerReady(state, action.payload.playerId);
    case 'UPDATE_SETTINGS':
      return updateSettings(state, action.payload);
    case 'INIT_TURN_STATE':
      return initTurnState(state, action.payload);
    case 'NEXT_TURN':
      return nextTurn(state, action.payload);
    case 'PREVIOUS_TURN':
      return previousTurn(state);
    case 'REVERSE_TURN_DIRECTION':
      return reverseTurnDirection(state);
    case 'SKIP_PLAYERS':
      return skipPlayers(state, action.payload.count);
    case 'SET_CURRENT_PLAYER':
      return setCurrentPlayer(state, action.payload.playerId);
    case 'SET_TURN_PHASE':
      return setTurnPhase(state, action.payload.phase);
    case 'REORDER_PLAYERS':
      return reorderPlayers(state, action.payload.newOrder);
    case 'NEXT_ROUND':
      return nextRound(state, action.payload);
    default:
      return state;
  }
}
