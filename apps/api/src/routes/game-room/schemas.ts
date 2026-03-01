import { getRegisteredGameIds, PlayerSchema } from '@playgrid/game-core';
import { RoomSchema } from '@playgrid/shared/schemas';
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
  maxPlayers: true,
  isPrivate: true,
}).extend({
  name: z.string().max(50, 'validation.roomName.max').optional(),
  gameType: getGameTypeSchema().optional(),
  hostPlayerName: z.string().min(1, 'validation.hostName.required'),
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
      name: (data.name && data.name.trim()) ? data.name.trim() : `${data.hostPlayerName}'s Game`,
      maxPlayers: data.maxPlayers ?? 4,
      gameType: data.gameType ?? defaultGameType,
      isPrivate: data.isPrivate ?? false,
      hostPlayerName: data.hostPlayerName,
    };
  },
);

/**
 * Schema for joining a game room
 */
export const joinGameRoomSchema = z.object({
  playerName: PlayerSchema.shape.name,
  playerId: PlayerSchema.shape.id.optional(),
  inviteToken: z.string().optional(),
});

/**
 * Schema for the frontend "Join Room" form
 */
export const joinRoomFormSchema = z.object({
  playerName: z.string().min(2, 'validation.name.min').max(20, 'validation.name.max'),
  roomId: z.string().min(4, 'validation.roomId.min'),
});

/**
 * Base game room response - extends RoomSchema with websocket URL
 */
export const gameRoomResponseSchema = RoomSchema.extend({
  websocketUrl: z.url().describe('WebSocket URL for real-time gameplay'),
});

/**
 * Create response includes room info + host player details + credentials if host joined
 */
export const createGameRoomResponseSchema = gameRoomResponseSchema.extend({
  hostPlayer: PlayerSchema.optional().describe('The host player that was auto-joined'),
  credentials: z.string().optional().describe('Short-lived credential token for host WebSocket authentication'),
  initialGameState: z.any().optional().describe('The initial game state with host player'),
  inviteToken: z.string().optional().describe('Invite token for sharing the room'),
  inviteExpiresInMinutes: z.number().int().optional().describe('Invite token expiry time in minutes'),
  inviteExpiresAt: z.string().optional().describe('Invite token expiry timestamp'),
});

/**
 * Join response includes room info + player details + credentials
 */
export const joinGameRoomResponseSchema = gameRoomResponseSchema.extend({
  player: PlayerSchema.describe('The player that just joined'),
  credentials: z.string().describe('Short-lived credential token for WebSocket authentication'),
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

export type CreateRoomFormValues = z.infer<typeof createGameRoomBaseSchema>;

export type CreateGameRoomResponse = z.infer<typeof createGameRoomResponseSchema>;
export type CreateRoomInputValues = z.infer<typeof createGameRoomInputSchema>;
export type GameRoomResponse = z.infer<typeof gameRoomResponseSchema>;
export type JoinGameRoomValues = z.infer<typeof joinGameRoomSchema>;
export type JoinRoomFormValues = z.infer<typeof joinRoomFormSchema>;
export type JoinGameRoomResponse = z.infer<typeof joinGameRoomResponseSchema>;
export type RoomStatsResponse = z.infer<typeof roomStatsResponseSchema>;

export const generateInviteSchema = z.object({
  expiresInMinutes: z.number().int().min(1).max(168).optional(),
});

export const generateInviteResponseSchema = z.object({
  inviteToken: z.string(),
  inviteUrl: z.string(),
  expiresAt: z.string(),
  expiresInMinutes: z.number().int(),
});

export const validateInviteResponseSchema = z.object({
  valid: z.boolean(),
  roomId: z.string().optional(),
  expiresAt: z.string().optional(),
});

export const revokeInviteResponseSchema = z.object({
  success: z.boolean(),
});

export const revokeInviteSchema = z.object({
  inviteToken: z.string(),
});

export type GenerateInviteResponse = z.infer<typeof generateInviteResponseSchema>;
export type ValidateInviteResponse = z.infer<typeof validateInviteResponseSchema>;
export type RevokeInviteResponse = z.infer<typeof revokeInviteResponseSchema>;
export type GenerateInviteValues = z.infer<typeof generateInviteSchema>;
export type RevokeInviteValues = z.infer<typeof revokeInviteSchema>;
