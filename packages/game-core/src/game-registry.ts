// packages/game-core/src/game-registry.ts
import type { z } from 'zod';
import type { BaseAction, GameDefinition } from './contracts/game-definition';
import type { BaseGameStateWire } from './game-logic/schema/state.types';
import { createGameContract } from './adapters/multiplayer/contracts/base.contract';
import { logger } from './utils/logger';

interface RegisteredGame<
  TStateSchema extends z.ZodType<BaseGameStateWire>,
  TActionSchema extends z.ZodType<BaseAction>,
> {
  definition: GameDefinition<TStateSchema, TActionSchema>;
  contract: ReturnType<typeof createGameContract<TStateSchema, TActionSchema>>;
}

const gameRegistry = new Map<string, RegisteredGame<any, any>>();
/**
 * Single registration point for games.
 * Automatically creates both definition and contract.
 */
export function registerGame<
  TStateSchema extends z.ZodType<BaseGameStateWire>,
  TActionSchema extends z.ZodType<BaseAction>,
>(definition: GameDefinition<TStateSchema, TActionSchema>): void {
  const gameId = definition.meta.id;

  if (gameRegistry.has(gameId)) {
    logger.warn(`Game "${gameId}" already registered. Overwriting.`);
  }

  // Create contract from definition schemas
  const contract = createGameContract({
    stateSchema: definition.stateSchema,
    actionSchema: definition.actionSchema,
  });

  gameRegistry.set(gameId, { definition, contract });
}

/**
 * Get both definition and contract for a game
 */
export function getGame(
  gameId: string,
): RegisteredGame<any, any> | undefined {
  return gameRegistry.get(gameId);
}

/**
 * Get only the definition (for client-side usage)
 */
export function getGameDefinition(
  gameId: string,
): GameDefinition<any, any> | undefined {
  return gameRegistry.get(gameId)?.definition;
}

/**
 * Get only the contract (for server-side oRPC routing)
 */
export function getGameContract(gameId: string): any {
  return gameRegistry.get(gameId)?.contract;
}

export function getRegisteredGameIds(): string[] {
  return Array.from(gameRegistry.keys());
}

export function isGameRegistered(gameId: string): boolean {
  return gameRegistry.has(gameId);
}
