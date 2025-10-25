import { z } from 'zod';

export const GamePhaseSchema = z.enum(['lobby', 'playing', 'results']);

export const PlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().optional(),
  isHost: z.boolean(),
  isReady: z.boolean().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const TurnStateSchema = z.object({
  currentPlayerId: z.string(),
  turnIndex: z.number().int().min(0),
  roundNumber: z.number().int().min(1),
});

export const BaseGameStateSchema = z.object({
  phase: GamePhaseSchema,
  players: z.array(PlayerSchema),
  hostId: z.string(),
  settings: z.any(),
  turnState: TurnStateSchema.optional(),
  createdAt: z.number(),
  startedAt: z.number().optional(),
  endedAt: z.number().optional(),
});

export type GamePhase = z.infer<typeof GamePhaseSchema>;
export type Player = z.infer<typeof PlayerSchema>;
export type TurnState = z.infer<typeof TurnStateSchema>;
export type BaseGameStateWire = z.infer<typeof BaseGameStateSchema>;

export interface BaseGameState<TSettings = any, TPlayer extends Player = Player> {
  phase: GamePhase;
  players: TPlayer[];
  hostId: string;
  settings: TSettings;
  turnState?: TurnState;
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
}

export interface GameStoreOptions {
  maxPlayers?: number;
  minPlayers?: number;
  turnBased?: boolean;
  requireReady?: boolean;
}

export interface BaseGameActions<TSettings, TPlayer extends Player = Player> {

  setPhase: (phase: GamePhase) => void;

  addPlayer: (player: Omit<TPlayer, 'isHost' | 'isReady'>) => void;
  removePlayer: (playerId: string) => void;
  updatePlayer: (playerId: string, updates: Partial<TPlayer>) => void;
  setPlayers: (players: TPlayer[]) => void;
  togglePlayerReady: (playerId: string) => void;

  updateSettings: (updates: Partial<TSettings>) => void;

  nextTurn?: () => void;
  previousTurn?: () => void;
  setCurrentPlayer?: (playerId: string) => void;
  nextRound?: () => void;

  canStartGame: () => boolean;
  startGame: () => void;
  endGame: () => void;
  resetGame: () => void;
}

export interface GameStore<TSettings, TPlayer extends Player = Player>
  extends BaseGameState<TSettings, TPlayer>,
  BaseGameActions<TSettings, TPlayer> {}

export function createGameStateSchema<TSettings extends z.ZodType>(
  settingsSchema: TSettings,
) {
  return BaseGameStateSchema.extend({
    settings: settingsSchema,
  });
}

export function createPlayerSchema<TExtensions extends z.ZodRawShape>(
  extensions: TExtensions,
) {
  return PlayerSchema.extend(extensions);
}
