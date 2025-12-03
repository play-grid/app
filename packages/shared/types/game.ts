import type { LogoSetKey } from './logo-types';
import type { Player } from './player';

/**
 * @deprecated will be deleted soon
 */
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
