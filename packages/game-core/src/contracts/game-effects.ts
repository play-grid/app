import type { BaseGameState } from '../game-logic/schema/state.types';
import type { BaseAction } from './game-definition';

export interface GameEffectContext {
  state: BaseGameState;
  action: BaseAction;
  apiUrl: string;
  ctx: any;
}

export type GameEffect = (
  context: GameEffectContext,
) => Promise<BaseAction | null>;

export type EffectHandlerFactory = (apiUrl: string) => GameEffect[];
