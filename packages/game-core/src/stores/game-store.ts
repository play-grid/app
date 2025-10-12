import type { GamePhase, Player } from '../types/core';

export interface GameStore<TSettings, TPlayer extends Player = Player> {
  // State
  phase: GamePhase;
  players: TPlayer[];
  hostId: string;
  settings: TSettings;
  turnState?: {
    currentPlayerId: string;
    turnIndex: number;
    roundNumber: number;
  };

  // Generic actions
  setPhase: (phase: GamePhase) => void;
  addPlayer: (player: TPlayer) => void;
  removePlayer: (playerId: string) => void;
  updatePlayer: (playerId: string, updates: Partial<TPlayer>) => void;
  setPlayers: (players: TPlayer[]) => void;
  updateSettings: (settings: Partial<TSettings>) => void;

  // Turn management (optional - only for turn-based games)
  nextTurn?: () => void;
  setCurrentPlayer?: (playerId: string) => void;

  // Lifecycle
  startGame: () => void;
  endGame: () => void;
  resetGame: () => void;
}

export function createGameStore<TSettings, TPlayer extends Player = Player>(
  initialSettings: TSettings,
  options?: {
    maxPlayers?: number;
    turnBased?: boolean;
  },
) {
  return (set: any, get: any) => ({
    // Initial state
    phase: 'lobby' as GamePhase,
    players: [] as TPlayer[],
    hostId: '',
    settings: initialSettings,
    turnState: options?.turnBased
      ? {
          currentPlayerId: '',
          turnIndex: 0,
          roundNumber: 1,
        }
      : undefined,

    // Actions
    setPhase: (phase: GamePhase) => set({ phase }),

    addPlayer: (player: TPlayer) => {
      const { players, hostId } = get();
      if (options?.maxPlayers && players.length >= options.maxPlayers) {
        return;
      }
      const newPlayer = {
        ...player,
        isHost: players.length === 0, // First player is host
      };
      set({
        players: [...players, newPlayer],
        hostId: hostId || newPlayer.id,
      });
    },

    removePlayer: (playerId: string) => {
      const { players, hostId } = get();
      const newPlayers = players.filter(p => p.id !== playerId);
      set({
        players: newPlayers,
        hostId: hostId === playerId ? (newPlayers[0]?.id || '') : hostId,
      });
    },

    updatePlayer: (playerId: string, updates: Partial<TPlayer>) => {
      const { players } = get();
      set({
        players: players.map(p =>
          p.id === playerId ? { ...p, ...updates } : p,
        ),
      });
    },

    setPlayers: (players: TPlayer[]) => set({ players }),

    updateSettings: (updates: Partial<TSettings>) => {
      const { settings } = get();
      set({ settings: { ...settings, ...updates } });
    },

    ...(options?.turnBased && {
      nextTurn: () => {
        const { players, turnState } = get();
        if (!turnState)
          return;

        const nextIndex = (turnState.turnIndex + 1) % players.length;
        set({
          turnState: {
            ...turnState,
            turnIndex: nextIndex,
            currentPlayerId: players[nextIndex]?.id || '',
            roundNumber: nextIndex === 0
              ? turnState.roundNumber + 1
              : turnState.roundNumber,
          },
        });
      },

      setCurrentPlayer: (playerId: string) => {
        const { players, turnState } = get();
        if (!turnState)
          return;

        const playerIndex = players.findIndex(p => p.id === playerId);
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
    }),

    startGame: () => {
      const { players, turnState } = get();
      set({
        phase: 'playing',
        startedAt: Date.now(),
        ...(turnState && players.length > 0 && {
          turnState: {
            ...turnState,
            currentPlayerId: players[0].id,
            turnIndex: 0,
          },
        }),
      });
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
        turnState: options?.turnBased
          ? {
              currentPlayerId: '',
              turnIndex: 0,
              roundNumber: 1,
            }
          : undefined,
      });
    },
  });
}
