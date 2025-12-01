import { createGameContract } from '@guess-logo/game-core';
import {
  FiveSecondsActionSchema,
  FiveSecondsGameStateSchema,
} from './logic/schema';

/**
 * Five Seconds multiplayer contract.
 */
export const fiveSecondsContract = createGameContract({
  stateSchema: FiveSecondsGameStateSchema,
  actionSchema: FiveSecondsActionSchema,
});

export type FiveSecondsContract = typeof fiveSecondsContract;
