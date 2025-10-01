import type { LogoSetKey } from './logo-types';
import type { Player } from './player';


// game room configuration , Agnostic of game type
export interface GameRoomConfig {
  roomId: string;
  name: string;
  maxPlayers: number;
  gameType: string;
  isPrivate: boolean;
  createdAt: string;
  selectedSet?: LogoSetKey;
  selectedGrid?: string;
}

// related to logo-guess game state
export interface SharedGameState {
  selectedSet: LogoSetKey;
  selectedList: string;
  selectedGrid: string;
  playerA: Player;
  playerB: Player;
  currentPlayer: 'A' | 'B';
  gameStarted: boolean;
  gameInitialized: boolean;
}

export interface GameRoomStats {
  totalConnections: number;
  maxPlayers: number;
  roomConfig: GameRoomConfig | null;
  sessions: {
    roomId: string;
    playerId?: string;
    joinedAt: number;
    duration: number;
  }[];
}
