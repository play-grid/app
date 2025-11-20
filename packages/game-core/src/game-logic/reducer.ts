import type { GameAction } from './schema/actions.types';
import type { BaseGameStateWire } from './schema/state.types';
import {
  addPlayer,
  changePhase,
  endGame,
  nextRound,
  nextTurn,
  removePlayer,
  setCurrentPlayer,
  startGame,
  togglePlayerReady,
  updatePlayer,
  updateSettings,
} from './actions';

export function gameReducer(state: BaseGameStateWire, action: GameAction): BaseGameStateWire {
  switch (action.type) {
    case 'SET_PHASE':
      return changePhase(state, action.payload);
    case 'ADD_PLAYER':
      return addPlayer(state, action.payload);
    case 'REMOVE_PLAYER':
      return removePlayer(state, action.payload.playerId);
    case 'UPDATE_PLAYER':
      return updatePlayer(state, action.payload.playerId, action.payload.updates);
    case 'TOGGLE_PLAYER_READY':
      return togglePlayerReady(state, action.payload.playerId);
    case 'UPDATE_SETTINGS':
      return updateSettings(state, action.payload);
    case 'START_GAME':
      return startGame(state);
    case 'END_GAME':
      return endGame(state);
    case 'NEXT_TURN':
      return nextTurn(state);
    case 'SET_CURRENT_PLAYER':
      return setCurrentPlayer(state, action.payload.playerId);
    case 'NEXT_ROUND':
      return nextRound(state);
    default:
      return state;
  }
}
