import { z } from 'zod';

// ============ Core Type Schemas ============

export const GamePhaseSchema = z.enum(['lobby', 'playing', 'results']);

export const PlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().optional(),
  isHost: z.boolean(),
  isReady: z.boolean(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const TurnStateSchema = z.object({
  currentPlayerId: z.string(),
  turnIndex: z.number(),
  roundNumber: z.number(),
});

export const BaseGameStateSchema = z.object({
  phase: GamePhaseSchema,
  players: z.array(PlayerSchema),
  hostId: z.string(),
  settings: z.record(z.string(), z.any()),
  turnState: TurnStateSchema.optional(),
  createdAt: z.number(),
  startedAt: z.number().optional(),
  endedAt: z.number().optional(),
});

// ============ Type Exports ============

export type GamePhase = z.infer<typeof GamePhaseSchema>;
export type Player = z.infer<typeof PlayerSchema>;
export type TurnState = z.infer<typeof TurnStateSchema>;
export type BaseGameStateWire = z.infer<typeof BaseGameStateSchema>;

// ============ Store Types (not for wire transfer) ============

export interface BaseGameState<TSettings, TPlayer extends Player = Player> {
  phase: GamePhase;
  players: TPlayer[];
  hostId: string;
  settings: TSettings;
  turnState?: TurnState;
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
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

export type GameStore<TSettings, TPlayer extends Player = Player> = BaseGameState<TSettings, TPlayer>
  & BaseGameActions<TSettings, TPlayer>;

export interface GameStoreOptions {
  maxPlayers?: number;
  minPlayers?: number;
  turnBased?: boolean;
  requireReady?: boolean;
}

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
