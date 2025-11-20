import z from 'zod';

export const GamePhaseSchema = z.enum(['lobby', 'playing', 'results']);

export const PlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().optional(),
  isHost: z.boolean(),
  isReady: z.boolean(),
  score: z.number(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const TurnStateSchema = z.object({
  currentPlayerId: z.string(),
  turnIndex: z.number(),
  roundNumber: z.number(),
});

export const BaseGameStateSchema = z.object({
  phase: GamePhaseSchema,
  players: z.record(z.string(), PlayerSchema),
  hostId: z.string(),
  settings: z.record(z.string(), z.any()),
  turnState: TurnStateSchema.optional(),
  createdAt: z.number(),
  startedAt: z.number().optional(),
  endedAt: z.number().optional(),
});

export type GamePhase = z.infer<typeof GamePhaseSchema>;
export type Player = z.infer<typeof PlayerSchema>;
export type TurnState = z.infer<typeof TurnStateSchema>;
export type BaseGameStateWire = z.infer<typeof BaseGameStateSchema>;
