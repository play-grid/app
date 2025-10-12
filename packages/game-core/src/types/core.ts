// game-core/types/core.ts
export type GamePhase = 'lobby' | 'playing' | 'results';

export interface Player {
  id: string;
  name: string;
  avatar?: string;
  isHost?: boolean;
  isReady?: boolean;
  metadata?: Record<string, any>; // Game-specific data
}

export interface BaseGameState<TSettings = any> {
  // Phase management
  phase: GamePhase;
  
  // Players (generic list)
  players: Player[];
  hostId: string;
  
  // Game settings (typed per game)
  settings: TSettings;
  
  // Turn/round management (optional)
  turnState?: {
    currentPlayerId: string;
    turnIndex: number;
    roundNumber: number;
  };
  
  // Timestamps
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
}
