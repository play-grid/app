export { createGameStore } from './adapter/local/zustand-store';
export type { GameStore } from './adapter/local/zustand-store';

export type { GameDefinition, GameMeta } from './contracts/game-definition';

export { BaseActionSchema } from './contracts/game-definition';
export type { BaseAction } from './contracts/game-definition';

export { gameReducer } from './game-logic/reducer';
export { GameActionSchema } from './game-logic/schema/actions.types';

export type { GameAction, GameEventType } from './game-logic/schema/actions.types';

export { BaseGameStateSchema, PlayerSchema } from './game-logic/schema/state.types';

export type { BaseGameStateWire, GamePhase, Player, TurnState } from './game-logic/schema/state.types';
export { createComposedReducer } from './utils/reducer-utils';
