export * from './adapters/index';

export { createGameContract } from './adapters/multiplayer/contracts/base.contract';
export type { GameContract } from './adapters/multiplayer/contracts/base.contract';

export * from './contracts/game-definition';
export * from './contracts/game-effects';
export { createGameDefinition } from './game-definition-factory';
export { gameReducer } from './game-logic/reducer';

export { GameActionSchema } from './game-logic/schema/actions.types';
export type { GameAction } from './game-logic/schema/actions.types';

export { BaseGameStateSchema, PlayerSchema } from './game-logic/schema/state.types';
export type { BaseGameState, GamePhase, Player, TurnState } from './game-logic/schema/state.types';

export * from './game-registry';
export { AdapterProvider, useAdapter } from './react/adapter-context';
export { useDispatch } from './react/hooks/use-dispatch';
export { useGameActions } from './react/hooks/use-game-actions';
export * from './react/hooks/use-game-state';
export * from './sub-phases';

export { composeReducers } from './utils/reducer-utils';
