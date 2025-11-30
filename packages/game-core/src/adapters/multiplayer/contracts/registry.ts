import type { z } from 'zod';
import type { GameContract } from './base.contract';

/**
 * Registry of all available game contracts.
 *
 * Server uses this to route WebSocket messages to correct game logic.
 */
export interface GameContractRegistry {
  [gameId: string]: GameContract<z.ZodType, z.ZodType>;
}

// Internal registry storage - MUST be declared first!
const gameContractRegistry: GameContractRegistry = {};

/**
 * Register a game contract
 */
export function registerGameContract<
  TStateSchema extends z.ZodType,
  TActionSchema extends z.ZodType,
>(
  gameId: string,
  contract: GameContract<TStateSchema, TActionSchema>,
): void {
  gameContractRegistry[gameId] = contract;
}

/**
 * Get contract for a specific game
 */
export function getGameContract(
  gameId: string,
): GameContract<z.ZodType, z.ZodType> | undefined {
  return gameContractRegistry[gameId];
}

/**
 * Get all registered game IDs
 */
export function getRegisteredGameIds(): string[] {
  return Object.keys(gameContractRegistry);
}

/**
 * Check if a game is registered
 */
export function isGameRegistered(gameId: string): boolean {
  return gameId in gameContractRegistry;
}
