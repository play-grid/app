import { PlayerSchema } from '@guess-logo/game-core';
import { z } from 'zod';

// REQUEST SCHEMAS (Input to DO endpoints)

/**
 * Schema for initializing a game session (DO internal API)
 */
export const initGameSessionSchema = z.object({
  roomId: z.string(),
  gameType: z.string(),
  maxPlayers: z.number().int().min(2).max(8),
  isPrivate: z.boolean(),
  createdBy: z.string().optional(),
  hostPlayerName: z.string().optional(),
});

/**
 * Schema for joining a game session (DO internal API)
 */
export const joinGameSessionSchema = z.object({
  playerName: z.string().min(1).max(25),
  playerId: z.string().optional(),
});

// RESPONSE SCHEMAS (Output from DO endpoints)

/**
 * Schema for Durable Object init response (/init endpoint)
 * Returns the full player object from game state (not just id/name)
 */
export const initGameSessionResponseSchema = z.object({
  success: z.boolean(),
  roomId: z.string(),
  hostPlayer: PlayerSchema.optional(), // Full player object with isHost, isReady, score
  credentials: z.string().optional(),
  currentState: z.any(),
});

/**
 * Schema for Durable Object join response (/join endpoint)
 * Returns the full player object from game state (not just id/name)
 */
export const joinGameSessionResponseSchema = z.object({
  roomId: z.string(),
  player: PlayerSchema, // Full player object with isHost, isReady, score
  credentials: z.string(),
  currentPlayers: z.number().int(),
  maxPlayers: z.number().int(),
  gameType: z.string(),
  currentState: z.any(),
  name: z.string().optional(),
  isPrivate: z.boolean().optional(),
  status: z.string().optional(),
  createdAt: z.string().optional(),
});

/**
 * Schema for Durable Object stats response (/stats endpoint)
 */
export const gameSessionStatsResponseSchema = z.object({
  roomId: z.string(),
  gameType: z.string(),
  currentPlayers: z.number().int(),
  maxPlayers: z.number().int(),
  players: z.array(PlayerSchema),
  createdAt: z.string(),
  phase: z.string().optional(),
});

/**
 * Schema for Durable Object validate credentials response (/validate-credentials endpoint)
 */
export const validateCredentialsResponseSchema = z.object({
  valid: z.boolean(),
});

/**
 * Schema for DO error responses
 */
export const gameSessionErrorSchema = z.object({
  error: z.string(),
});

// TYPE EXPORTS

// Request types
export type InitGameSessionInput = z.infer<typeof initGameSessionSchema>;
export type JoinGameSessionInput = z.infer<typeof joinGameSessionSchema>;

// Response types
export type InitGameSessionResponse = z.infer<typeof initGameSessionResponseSchema>;
export type JoinGameSessionResponse = z.infer<typeof joinGameSessionResponseSchema>;
export type GameSessionStatsResponse = z.infer<typeof gameSessionStatsResponseSchema>;
export type ValidateCredentialsResponse = z.infer<typeof validateCredentialsResponseSchema>;
export type GameSessionError = z.infer<typeof gameSessionErrorSchema>;
