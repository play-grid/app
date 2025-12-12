import z from 'zod';

export const TurnDirectionSchema = z.enum(['forward', 'reverse']);
export type TurnDirection = z.infer<typeof TurnDirectionSchema>;

export const TurnPhaseSchema = z.string();
export type TurnPhase = z.infer<typeof TurnPhaseSchema>;

export const TurnStateSchema = z.object({
  playerOrder: z.array(z.string()).min(1),
  currentPlayerIndex: z.number().int().min(0),
  currentPlayerId: z.string(),
  direction: TurnDirectionSchema.default('forward'),
  roundNumber: z.number().int().min(1).default(1),
  turnNumber: z.number().int().min(0).default(0),
  phase: TurnPhaseSchema.optional(),
  skipsRemaining: z.number().int().min(0).default(0),
});
export type TurnState = z.infer<typeof TurnStateSchema>;

export const GamePhaseSchema = z.enum(['lobby', 'playing', 'results']);
export type GamePhase = z.infer<typeof GamePhaseSchema>;

export const PlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().optional(),
  isHost: z.boolean(),
  isReady: z.boolean(),
  score: z.number(),
  metadata: z.record(z.string(), z.any()).optional(),
});
export type Player = z.infer<typeof PlayerSchema>;

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
export type BaseGameState = z.infer<typeof BaseGameStateSchema>;
