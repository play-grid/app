import { z } from 'zod';

/**
 * Schema for initializing a game session (DO internal API)
 */
export const initGameSessionSchema = z.object({
  roomId: z.string(),
  gameType: z.string(),
  maxPlayers: z.number().int().min(2).max(8),
  isPrivate: z.boolean(),
  createdBy: z.string().optional(),
});

/**
 * Schema for joining a game session (DO internal API)
 */
export const joinGameSessionSchema = z.object({
  playerName: z.string().min(1).max(25),
  playerId: z.string().optional(),
});

export type InitGameSessionInput = z.infer<typeof initGameSessionSchema>;
export type JoinGameSessionInput = z.infer<typeof joinGameSessionSchema>;
