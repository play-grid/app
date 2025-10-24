import type { BaseGameActions, BaseGameState, GameStoreOptions, Player } from '../../types/core';
import {
  areAllPlayersReady,
  getCurrentPlayer,
  initializeTurnState,
  reassignHost,
  rotateTurn,
} from './helpers';

// TODO: Refactor to use pure reducer and Zod schemas instead of imperative actions.
// These interfaces are temporary to keep the store working until the refactor.
interface BaseGameState<TSettings, TPlayer extends Player = Player> {
  phase: GamePhase;
  players: TPlayer[];
  hostId: string;
  settings: TSettings;
  turnState?: TurnState;
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
}

interface BaseGameActions<TSettings, TPlayer extends Player = Player> {
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

export function createBaseStore<
  TSettings,
  TPlayer extends Player = Player,
  TCustom extends object = Record<string, never>,
>(
  initialSettings: TSettings,
  options: GameStoreOptions = {},
  initialCustomState: Partial<TCustom> = {},
) {
  const {
    maxPlayers,
    minPlayers = 1,
    turnBased = false,
    requireReady = false,
  } = options;

  return (set: any, get: any): BaseGameState<TSettings, TPlayer> & BaseGameActions<TSettings, TPlayer> => ({
    // ============ Initial State ============
    phase: 'lobby',
    players: [] as TPlayer[],
    hostId: '',
    settings: initialSettings,
    turnState: undefined,
    createdAt: Date.now(),
    startedAt: undefined,
    endedAt: undefined,

    // ============ Phase Management ============
    setPhase: (phase) => {
      set({ phase });
    },

    // ============ Player Management ============
    addPlayer: (playerData) => {
      const { players, hostId } = get();

      // Check max players
      if (maxPlayers && players.length >= maxPlayers) {
        console.warn(`Cannot add player: max players (${maxPlayers}) reached`);
        return;
      }

      const newPlayer: TPlayer = {
        ...playerData,
        isHost: players.length === 0,
        isReady: false,
      } as TPlayer;

      set({
        players: [...players, newPlayer],
        hostId: hostId || newPlayer.id,
      });
    },

    removePlayer: (playerId) => {
      const { players, turnState } = get();
      const newPlayers = players.filter((p: TPlayer) => p.id !== playerId);

      const updatedPlayers = reassignHost<TPlayer>(newPlayers);

      // Update turn state if current player was removed
      let newTurnState = turnState;
      if (turnState && turnState.currentPlayerId === playerId && newPlayers.length > 0) {
        const currentPlayer = getCurrentPlayer<TPlayer>(updatedPlayers, turnState);
        if (!currentPlayer) {
          newTurnState = initializeTurnState<TPlayer>(updatedPlayers);
        }
      }

      set({
        players: updatedPlayers,
        hostId: updatedPlayers.find(p => p.isHost)?.id || '',
        turnState: newTurnState,
      });
    },

    updatePlayer: (playerId, updates) => {
      const { players } = get();
      set({
        players: players.map((p: TPlayer) =>
          p.id === playerId ? { ...p, ...updates } : p,
        ),
      });
    },

    setPlayers: (players) => {
      const updatedPlayers = reassignHost<TPlayer>(players);
      set({
        players: updatedPlayers,
        hostId: updatedPlayers.find(p => p.isHost)?.id || '',
      });
    },

    togglePlayerReady: (playerId) => {
      const { players } = get();
      set({
        players: players.map((p: TPlayer) =>
          p.id === playerId ? { ...p, isReady: !p.isReady } : p,
        ),
      });
    },

    // ============ Settings ============
    updateSettings: (updates) => {
      const { settings } = get();
      set({ settings: { ...settings, ...updates } });
    },

    // ============ Turn Management (if enabled) ============
    ...(turnBased && {
      nextTurn: () => {
        const { players, turnState } = get();
        if (!turnState || players.length === 0)
          return;

        const newTurnState = rotateTurn<TPlayer>(players, turnState);
        set({ turnState: newTurnState });
      },

      previousTurn: () => {
        const { players, turnState } = get();
        if (!turnState || players.length === 0)
          return;

        const prevIndex = (turnState.turnIndex - 1 + players.length) % players.length;
        set({
          turnState: {
            ...turnState,
            turnIndex: prevIndex,
            currentPlayerId: players[prevIndex]?.id || '',
          },
        });
      },

      setCurrentPlayer: (playerId) => {
        const { players, turnState } = get();
        if (!turnState)
          return;

        const playerIndex = players.findIndex((p: TPlayer) => p.id === playerId);
        if (playerIndex === -1)
          return;

        set({
          turnState: {
            ...turnState,
            currentPlayerId: playerId,
            turnIndex: playerIndex,
          },
        });
      },

      nextRound: () => {
        const { turnState } = get();
        if (!turnState)
          return;

        set({
          turnState: {
            ...turnState,
            roundNumber: turnState.roundNumber + 1,
            turnIndex: 0,
          },
        });
      },
    }),

    // ============ Lifecycle ============
    canStartGame: () => {
      const { players } = get();

      // Check minimum players
      if (players.length < minPlayers) {
        return false;
      }

      // Check if all players are ready (if required)
      if (requireReady && !areAllPlayersReady<TPlayer>(players)) {
        return false;
      }

      return true;
    },

    startGame: () => {
      const { players, canStartGame } = get();

      if (!canStartGame()) {
        console.warn('Cannot start game: requirements not met');
        return;
      }

      const updates: any = {
        phase: 'playing',
        startedAt: Date.now(),
      };

      // Initialize turn state if turn-based
      if (turnBased && players.length > 0) {
        updates.turnState = initializeTurnState<TPlayer>(players);
      }

      set(updates);
    },

    endGame: () => {
      set({
        phase: 'results',
        endedAt: Date.now(),
      });
    },

    resetGame: () => {
      set({
        phase: 'lobby',
        players: [],
        hostId: '',
        settings: initialSettings,
        turnState: turnBased ? undefined : undefined,
        createdAt: Date.now(),
        startedAt: undefined,
        endedAt: undefined,
        ...initialCustomState,
      });
    },
  });
}
