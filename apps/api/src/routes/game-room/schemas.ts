// apps/api/src/routes/game-room/schemas.ts
import { getRegisteredGameIds } from '@guess-logo/game-core';
import { z } from 'zod';

// Public API Schemas
/**
 * Get valid game type schema
 * Safe to call at module load because games are imported in app.ts first
 */
function getGameTypeSchema() {
  const gameIds = getRegisteredGameIds();

  // Fallback to string if no games registered yet (shouldn't happen in prod)
  if (gameIds.length === 0) {
    console.warn('[Schemas] No games registered, using string for gameType');
    return z.string();
  }

  return z.enum(gameIds as [string, ...string[]]);
}

/**
 * Base schema for creating a game room
 */
export const createGameRoomBaseSchema = z.object({
  name: z.string().min(1, 'room-name-required').max(50, 'room-name-too-long'),
  maxPlayers: z.number().int().min(2).max(8).optional(),
  gameType: getGameTypeSchema().optional(),
  isPrivate: z.boolean().optional(),
});

/**
 * Input schema with preprocessing to handle defaults
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
 * Schema for game room response
 */
export const gameRoomResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  maxPlayers: z.number(),
  currentPlayers: z.number(),
  gameType: z.string(),
  isPrivate: z.boolean(),
  status: z.enum(['waiting', 'active', 'finished']),
  createdAt: z.string(),
  websocketUrl: z.string(),
});

/**
 * Schema for joining a game room
 */
export const joinGameRoomSchema = z.object({
  playerName: z
    .string()
    .min(1, 'Player name is required')
    .max(25, 'Player name too long'),
  playerId: z.string().optional(),
});

export const joinGameRoomResponseSchema = gameRoomResponseSchema.extend({
  player: z.object({
    id: z.string(),
    name: z.string(),
  }),
});

// Unified error schema
export const errorSchema = z.object({
  error: z.string(),
});

// Message schema for server errors
export const messageSchema = z.object({
  message: z.string(),
});

export const roomStatsResponseSchema = z.object({
  totalConnections: z.number(),
  maxPlayers: z.number(),
  roomConfig: z
    .object({
      roomId: z.string(),
      name: z.string(),
      maxPlayers: z.number(),
      gameType: z.string(),
      isPrivate: z.boolean(),
      createdAt: z.string(),
    })
    .nullable(),
  sessions: z.array(
    z.object({
      roomId: z.string(),
      playerId: z.string().optional(),
      joinedAt: z.number(),
      duration: z.number(),
    }),
  ),
});

// --- schemas for Durable Object Internal Communication ---

// What the DO returns when you call /stats
export const doRoomStatsSchema = z.object({
  roomId: z.string(),
  gameType: z.string(),
  currentPlayers: z.number(),
  maxPlayers: z.number(),
  players: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })),
  createdAt: z.string(),
});

export type DORoomStats = z.infer<typeof doRoomStatsSchema>;
export type roomStatsResponse = z.infer<typeof roomStatsResponseSchema>;
export type CreateRoomFormValues = z.infer<typeof createGameRoomBaseSchema>;
export type CreateRoomInputValues = z.infer<typeof createGameRoomInputSchema>;
export type GameRoomResponse = z.infer<typeof gameRoomResponseSchema>;
export type JoinGameRoomValues = z.infer<typeof joinGameRoomSchema>;
export type JoinGameRoomResponse = z.infer<typeof joinGameRoomResponseSchema>;
