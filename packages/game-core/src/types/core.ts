// Core phase types
export type GamePhase = 'lobby' | 'playing' | 'results';

// Base player interface
export interface Player {
  id: string;
  name: string;
  avatar?: string;
  isHost: boolean;
  isReady?: boolean;
  metadata?: Record<string, any>; // Game-specific extensions
}

// Turn/round state (optional for turn-based games)
export interface TurnState {
  currentPlayerId: string;
  turnIndex: number;
  roundNumber: number;
}

// Base game state
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

// Store options
export interface GameStoreOptions {
  maxPlayers?: number;
  minPlayers?: number;
  turnBased?: boolean;
  requireReady?: boolean; // Must all players be ready to start?
}

// Base actions interface
export interface BaseGameActions<TSettings, TPlayer extends Player = Player> {
  // Phase management
  setPhase: (phase: GamePhase) => void;

  // Player management
  addPlayer: (player: Omit<TPlayer, 'isHost' | 'isReady'>) => void;
  removePlayer: (playerId: string) => void;
  updatePlayer: (playerId: string, updates: Partial<TPlayer>) => void;
  setPlayers: (players: TPlayer[]) => void;
  togglePlayerReady: (playerId: string) => void;

  // Settings
  updateSettings: (updates: Partial<TSettings>) => void;

  // Turn management (only if turnBased: true)
  nextTurn?: () => void;
  previousTurn?: () => void;
  setCurrentPlayer?: (playerId: string) => void;
  nextRound?: () => void;

  // Lifecycle
  canStartGame: () => boolean;
  startGame: () => void;
  endGame: () => void;
  resetGame: () => void;
}

// Combined store interface
export interface GameStore<TSettings, TPlayer extends Player = Player> 
  extends BaseGameState<TSettings, TPlayer>,
          BaseGameActions<TSettings, TPlayer> {
}