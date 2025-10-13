// games/guess-logo/stores/persistence-store.ts
import type { GamePhase, TurnState } from '@guess-logo/game-core/types';
import type { GuessLogoPlayer, GuessLogoSettings } from '../types/game';
import { createPersistenceStore } from '@guess-logo/game-core/stores/persistence';

// ============ Modern Saved State Type ============
export interface GuessLogoSavedState {
  settings: GuessLogoSettings;
  players: GuessLogoPlayer[];
  turnState: TurnState | undefined;
  phase: GamePhase;
}

// ============ UI Display Info ============
export interface GuessLogoSavedInfo {
  playerNames: string[];
  selectedSet: string;
  selectedList: string;
  selectedGrid: string;
  playerCount: number;
  timestamp?: number;
}

// ============ Validation Function ============
function validateGuessLogoState(state: any): boolean {
  return (
    state
    && typeof state === 'object'
    // Validate players
    && state.players
    && Array.isArray(state.players)
    && state.players.length >= 1
    && state.players.every((p: any) =>
      p.id
      && typeof p.id === 'string'
      && p.name
      && typeof p.name === 'string'
      && Array.isArray(p.logos)
      && p.logos.length > 0
      && typeof p.activeCount === 'number'
      && typeof p.isHost === 'boolean',
    )
    // Validate settings
    && state.settings
    && typeof state.settings === 'object'
    && typeof state.settings.selectedSet === 'string'
    && typeof state.settings.selectedList === 'string'
    && typeof state.settings.selectedGrid === 'string'
    && typeof state.settings.gridCols === 'number'
    // Validate phase
    && typeof state.phase === 'string'
    && ['lobby', 'playing', 'results'].includes(state.phase)
    // Validate turnState (optional)
    && (state.turnState === undefined || (
      typeof state.turnState === 'object'
      && typeof state.turnState.currentPlayerId === 'string'
      && typeof state.turnState.turnIndex === 'number'
      && typeof state.turnState.roundNumber === 'number'
    ))
  );
}

// ============ Create Persistence Store ============
export const usePersistenceStore = createPersistenceStore<GuessLogoSavedState>({
  storageKey: 'guess-logo-game-state',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  validate: validateGuessLogoState,
  hasValidData: hasValidGameData,
});

// ============ Helper Functions ============

/**
 * Create display info from saved state for UI
 */
export function createSaveInfo(state: GuessLogoSavedState): GuessLogoSavedInfo {
  return {
    playerNames: state.players.map(p => p.name),
    selectedSet: state.settings.selectedSet,
    selectedList: state.settings.selectedList,
    selectedGrid: state.settings.selectedGrid,
    playerCount: state.players.length,
  };
}

/**
 * Check if saved state matches current config
 */
export function matchesConfig(
  saved: GuessLogoSavedState,
  config: {
    selectedSet: string;
    selectedGrid: string;
  },
): boolean {
  return (
    saved.settings.selectedSet === config.selectedSet
    && saved.settings.selectedGrid === config.selectedGrid
  );
}

/**
 * Check if saved state has valid game data
 */
export function hasValidGameData(saved: GuessLogoSavedState | null): boolean {
  if (!saved)
    return false;

  return (
    saved.phase === 'playing'
    && saved.players.length >= 2
    && saved.players.every(p =>
      p.logos.length > 0
      && p.name.trim().length >= 2,
    )
  );
}

/**
 * Get a summary of the saved game for display
 */
export function getSavedGameSummary(saved: GuessLogoSavedState | null): string | null {
  if (!saved || !hasValidGameData(saved))
    return null;

  const playerNames = saved.players.map(p => p.name).join(' vs ');
  const { selectedSet, selectedGrid } = saved.settings;

  return `${playerNames} • ${selectedSet} • ${selectedGrid}`;
}
