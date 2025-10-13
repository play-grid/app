// games/guess-logo/types/game.ts
import type { Player } from '@guess-logo/game-core/types';
import type { LogoItem, LogoSetKey } from '@guess-logo/shared/types';

// Game settings
export interface GuessLogoSettings {
  selectedSet: LogoSetKey;
  selectedList: string;
  selectedGrid: string;
  gridCols: number;
}

// Extended player with game-specific data
export interface GuessLogoPlayer extends Player {
  logos: LogoItem[];
  winner: LogoItem | null;
  activeCount: number;
}

// Game-specific state (for extensions beyond base store)
export interface GuessLogoGameExtensions {
  // Loading states
  isUpdatingList: boolean;
  isUpdatingLogos: boolean;

  // Actions
  updateSelectedSet: (set: LogoSetKey) => Promise<void>;
  updateLogosForList: (
    listId: string,
    logoSet: LogoSetKey,
    language: string,
    count: number,
  ) => Promise<void>;
  shuffleLogos: (language: string) => Promise<void>;
  togglePlayerLogo: (playerId: string, logoId: number) => void;

  // Helpers
  getPlayerStats: (logos: LogoItem[]) => { activeCount: number; winner: LogoItem | null };
}
