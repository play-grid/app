export { createLocalAdapter } from './adapters/local/zustand-store';

export type { GameDefinition, GameMeta } from './contracts/game-definition';

export { BaseActionSchema } from './contracts/game-definition';
export type { BaseAction } from './contracts/game-definition';

export { gameReducer } from './game-logic/reducer';

export { GameActionSchemas } from './game-logic/schema/actions.types';
export type { GameAction, GameEventType } from './game-logic/schema/actions.types';

export { BaseGameStateSchema, PlayerSchema } from './game-logic/schema/state.types';

export type { BaseGameStateWire, GamePhase, Player, TurnState } from './game-logic/schema/state.types';

export * from './game-registry';
export { AdapterProvider, useAdapter } from './react/adapter-context';
export { useDispatch } from './react/hooks/use-dispatch';
export { useGameActions } from './react/hooks/use-game-actions';
export {
  useAllPlayersReady,
  useCurrentPlayer,
  useCurrentRound,
  useGamePhase,
  useGamePlayer,
  useGamePlayers,
  useGameSetting,
  useGameSettings,
  useGameState,
  useHostPlayer,
  useIsPlayerTurn,
  usePlayerCount,
  useTurnState,
} from './react/hooks/use-game-state';

export { composeReducers } from './utils/reducer-utils';
