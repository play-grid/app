import { z } from 'zod';

// Base schema for creating a game room
export const createGameRoomBaseSchema = z.object({
  name: z.string().min(1, 'room-name-required').max(50, 'room-name-too-long'),
  maxPlayers: z.number().int().min(2).max(8).optional(),
  gameType: z.enum(['logo-guess']).optional(),
  isPrivate: z.boolean().optional(),
});

// Input schema with preprocessing to handle defaults
export const createGameRoomInputSchema = createGameRoomBaseSchema.extend({}).transform(data => ({
  name: data.name,
  maxPlayers: data.maxPlayers ?? 4,
  gameType: data.gameType ?? 'logo-guess' as const,
  isPrivate: data.isPrivate ?? false,
}));

// Schema for game room response
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

// Schema for joining a game room
export const joinGameRoomSchema = z.object({
  playerName: z.string().min(1, 'Player name is required').max(25, 'Player name too long'),
});

export const joinGameRoomResponseSchema = gameRoomResponseSchema.extend({
  player: z.object({
    id: z.string(),
    name: z.string(),
  }),
});

// Type exports
export type CreateRoomFormValues = z.infer<typeof createGameRoomBaseSchema>;
export type CreateRoomInputValues = z.infer<typeof createGameRoomInputSchema>;
export type GameRoomResponse = z.infer<typeof gameRoomResponseSchema>;
export type JoinGameRoomValues = z.infer<typeof joinGameRoomSchema>;
export type JoinGameRoomResponse = z.infer<typeof joinGameRoomResponseSchema>;
