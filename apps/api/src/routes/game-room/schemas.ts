import { getRegisteredGameIds, PlayerSchema } from '@guess-logo/game-core';
import { RoomSchema } from '@guess-logo/shared/schemas';
import { z } from 'zod';

/**
 * Get valid game type schema dynamically from registry
 */
function getGameTypeSchema() {
  const gameIds = getRegisteredGameIds();

  if (gameIds.length === 0) {
    console.warn('[Schemas] No games registered, using string for gameType');
    return z.string();
  }

  return z.enum(gameIds as [string, ...string[]]);
}

/**
 * Schema for creating a game room (form input)
 * Uses RoomSchema as base but makes fields optional/provides defaults
 */
export const createGameRoomBaseSchema = RoomSchema.pick({
  name: true,
  maxPlayers: true,
  isPrivate: true,
}).extend({
  // Override gameType to use registry validation
  gameType: getGameTypeSchema().optional(),
}).partial({
  maxPlayers: true,
  isPrivate: true,
  gameType: true,
});

/**
 * Input schema with preprocessing for defaults
 */
export const createGameRoomInputSchema = createGameRoomBaseSchema.transform(
  (data) => {
    const registeredGameIds = getRegisteredGameIds();
    const defaultGameType = registeredGameIds[0] || 'five-seconds';

    return {
      name: data.name,
      maxPlayers: data.maxPlayers ?? 4,
      gameType: data.gameType ?? defaultGameType,
      isPrivate: data.isPrivate ?? false,
    };
  },
);

/**
 * Schema for joining a game room
 */
export const joinGameRoomSchema = z.object({
  playerName: PlayerSchema.shape.name,
  playerId: PlayerSchema.shape.id.optional(),
});

/**
 * Base game room response - extends RoomSchema with websocket URL
 */
export const gameRoomResponseSchema = RoomSchema.extend({
  websocketUrl: z.url().describe('WebSocket URL for real-time gameplay'),
});

/**
 * Join response includes room info + player details
 */
export const joinGameRoomResponseSchema = gameRoomResponseSchema.extend({
  player: PlayerSchema.describe('The player that just joined'),
});

const sessionSchema = z.object({
  roomId: z.string(),
  playerId: z.string().optional(),
  joinedAt: z.number().describe('Unix timestamp'),
  duration: z.number().describe('Session duration in ms'),
});

/**
 * Stats response for monitoring room state
 */
export const roomStatsResponseSchema = z.object({
  totalConnections: z.number().int().describe('Current number of connected players'),
  maxPlayers: z.number().int().describe('Maximum allowed players'),
  
  roomConfig: RoomSchema.omit({
    status: true,
    currentPlayers: true,
  })
    .extend({
      roomId: z.string().describe('Alias for id (backward compatibility)'),
    })
    .nullable()
    .describe('Room configuration details'),
  sessions: z.array(
    sessionSchema,
  ).describe('Active player sessions'),
});

/**
 * Unified error response schema
 */
export const errorSchema = z.object({
  error: z.string(),
});

/**
 * Message schema for server errors
 */
export const messageSchema = z.object({
  message: z.string(),
});

/**
 * Internal schema for Durable Object stats endpoint
 * This is what the DO returns, separate from public API
 */
export const doRoomStatsSchema = z.object({
  roomId: z.string(),
  gameType: z.string(),
  currentPlayers: z.number().int(),
  maxPlayers: z.number().int(),
  players: z.array(PlayerSchema),
  createdAt: z.iso.datetime(),
});

export type CreateRoomFormValues = z.infer<typeof createGameRoomBaseSchema>;
export type CreateRoomInputValues = z.infer<typeof createGameRoomInputSchema>;
export type GameRoomResponse = z.infer<typeof gameRoomResponseSchema>;
export type JoinGameRoomValues = z.infer<typeof joinGameRoomSchema>;
export type JoinGameRoomResponse = z.infer<typeof joinGameRoomResponseSchema>;
export type RoomStatsResponse = z.infer<typeof roomStatsResponseSchema>;
export type DORoomStats = z.infer<typeof doRoomStatsSchema>;
