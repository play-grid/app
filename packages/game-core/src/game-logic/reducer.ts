import type { GameAction } from './schema/actions.types';
import type { BaseGameStateWire } from './schema/state.types';
import { addPlayer, changePhase } from './actions';

export function gameReducer(state: BaseGameStateWire, action: GameAction): BaseGameStateWire {
  switch (action.type) {
    case 'SET_PHASE':
      return changePhase(state, action.payload);
    case 'ADD_PLAYER':
      return addPlayer(state, action.payload);
    default:
      return state;
  }
}
