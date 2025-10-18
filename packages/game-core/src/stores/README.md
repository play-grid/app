# Game Core Store

A flexible, type-safe game state management library built on Zustand. Provides reusable game store patterns including player management, turn systems, phase transitions, and persistence.

## Features

- 🎮 **Pre-built Game State Management** - Complete player, phase, and turn management out of the box
- 🔄 **Turn-Based System** - Optional turn rotation with round tracking
- 👥 **Player Management** - Add, remove, update players with host assignment
- 📊 **Game Phases** - Structured phase system (lobby → playing → results)
- 💾 **Persistence** - Optional localStorage persistence with validation and expiration
- 🛠️ **TypeScript First** - Fully typed with generics for custom state
- 🎯 **Extensible** - Add custom state and actions while keeping core functionality

## Quick Start

### Basic Game Store

```typescript
import { createGameStore } from './stores';

interface MyGameSettings {
  difficulty: 'easy' | 'medium' | 'hard';
  rounds: number;
}

const useGameStore = createGameStore<MyGameSettings>({
  name: 'my-game',
  initialSettings: {
    difficulty: 'medium',
    rounds: 5,
  },
  options: {
    minPlayers: 2,
    maxPlayers: 4,
    requireReady: true,
  },
});

// Use in component
function GameLobby() {
  const { players, addPlayer, startGame, canStartGame } = useGameStore();
  
  return (
    <div>
      <h1>Players: {players.length}</h1>
      <button 
        onClick={startGame} 
        disabled={!canStartGame()}
      >
        Start Game
      </button>
    </div>
  );
}
```

### Turn-Based Game

```typescript
const useGameStore = createGameStore<MyGameSettings>({
  name: 'turn-based-game',
  initialSettings: { /* ... */ },
  options: {
    turnBased: true,
    minPlayers: 2,
  },
});

function GameBoard() {
  const { turnState, nextTurn, players } = useGameStore();
  const currentPlayer = players.find(p => p.id === turnState?.currentPlayerId);
  
  return (
    <div>
      <p>Current Turn: {currentPlayer?.name}</p>
      <p>Round: {turnState?.roundNumber}</p>
      <button onClick={nextTurn}>End Turn</button>
    </div>
  );
}
```

### Custom State & Actions

```typescript
interface CustomGameState {
  score: number;
  gameBoard: string[][];
}

const useGameStore = createGameStore<MyGameSettings, Player, CustomGameState>({
  name: 'custom-game',
  initialSettings: { /* ... */ },
  customState: {
    score: 0,
    gameBoard: [[]],
  },
  customActions: (set, get) => ({
    incrementScore: () => {
      set({ score: get().score + 1 });
    },
    updateBoard: (board: string[][]) => {
      set({ gameBoard: board });
    },
  }),
});
```

## Core API

### Store Configuration

```typescript
interface CreateGameStoreConfig<TSettings, TPlayer, TCustom> {
  name: string;                    // Store name for persistence
  initialSettings: TSettings;      // Initial game settings
  options?: {
    minPlayers?: number;           // Minimum players (default: 1)
    maxPlayers?: number;           // Maximum players (optional)
    turnBased?: boolean;           // Enable turn system (default: false)
    requireReady?: boolean;        // Require all players ready (default: false)
  };
  persist?: boolean;               // Enable persistence (default: true)
  devtools?: boolean;              // Enable Redux devtools (default: true)
  customState?: Partial<TCustom>; // Additional state
  customActions?: (set, get) => Record<string, any>; // Custom actions
}
```

### Base State

```typescript
interface BaseGameState<TSettings, TPlayer> {
  phase: GamePhase;                // Current game phase
  players: TPlayer[];              // All players
  hostId: string;                  // Host player ID
  settings: TSettings;             // Game settings
  turnState?: TurnState;           // Turn tracking (if turnBased)
  createdAt: number;               // Creation timestamp
  startedAt?: number;              // Game start timestamp
  endedAt?: number;                // Game end timestamp
}
```

### Base Actions

#### Phase Management
- `setPhase(phase: GamePhase)` - Change game phase

#### Player Management
- `addPlayer(playerData: Omit<TPlayer, 'isHost' | 'isReady'>)` - Add new player
- `removePlayer(playerId: string)` - Remove player
- `updatePlayer(playerId: string, updates: Partial<TPlayer>)` - Update player
- `setPlayers(players: TPlayer[])` - Replace all players
- `togglePlayerReady(playerId: string)` - Toggle player ready state

#### Settings
- `updateSettings(updates: Partial<TSettings>)` - Update game settings

#### Turn Management (if turnBased)
- `nextTurn()` - Advance to next player
- `previousTurn()` - Go back to previous player
- `setCurrentPlayer(playerId: string)` - Set specific player's turn
- `nextRound()` - Advance to next round

#### Lifecycle
- `canStartGame()` - Check if game can start
- `startGame()` - Start the game
- `endGame()` - End the game
- `resetGame()` - Reset to initial state

## Game Phases

The library includes a structured phase system:

```typescript
import { GAME_PHASES, canTransitionTo, isPlaying } from './phases';

// Available phases
GAME_PHASES.LOBBY    // 'lobby'
GAME_PHASES.PLAYING  // 'playing'
GAME_PHASES.RESULTS  // 'results'

// Phase validation
canTransitionTo('lobby', 'playing')  // true
canTransitionTo('playing', 'lobby')  // false

// Phase helpers
isPlaying(currentPhase)    // boolean
isInLobby(currentPhase)    // boolean
isFinished(currentPhase)   // boolean
```

Valid transitions:
- `lobby` → `playing`
- `playing` → `results`
- `results` → `lobby` (restart)

## Helper Functions

### Player Helpers
```typescript
import { 
  findPlayer,
  getHostPlayer,
  areAllPlayersReady,
  getReadyPlayers,
  reassignHost,
} from './helpers';
```

### Turn Helpers
```typescript
import {
  getCurrentPlayer,
  initializeTurnState,
  rotateTurn,
  getNextTurnIndex,
} from './helpers';
```

### Scoring Helpers
```typescript
import {
  rankPlayersByScore,
  getWinners,
} from './helpers';

const ranked = rankPlayersByScore(players);
const winners = getWinners(players); // All players with highest score
```

### ID Generation
```typescript
import { generatePlayerId, generateRoomId } from './helpers';

const playerId = generatePlayerId(); // 'player_1234567890_abc123xyz'
const roomId = generateRoomId();     // 'room_1234567890_abc123xyz'
```

## Persistence

### Manual Persistence Store

For custom persistence needs beyond Zustand's built-in persistence:

```typescript
import { createPersistenceStore } from './stores/create-persistence-store';

const usePersistence = createPersistenceStore<GameState>({
  storageKey: 'my-game-save',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  validate: (state) => {
    return state.phase && state.players?.length > 0;
  },
  hasValidData: (state) => {
    return state !== null && state.players.length > 0;
  },
});

// Usage
const { saveGameState, loadGameState, hasValidSavedGame } = usePersistence();

if (hasValidSavedGame()) {
  const savedState = loadGameState();
  // Restore game state
}
```

## Advanced Examples

### Multiplayer Lobby with Ready System

```typescript
const useGameStore = createGameStore<Settings>({
  name: 'multiplayer-game',
  initialSettings: { /* ... */ },
  options: {
    minPlayers: 2,
    maxPlayers: 8,
    requireReady: true,
  },
});

function Lobby() {
  const { 
    players, 
    togglePlayerReady, 
    canStartGame, 
    startGame 
  } = useGameStore();
  
  return (
    <>
      {players.map(player => (
        <div key={player.id}>
          <span>{player.name}</span>
          <span>{player.isReady ? '✓' : '○'}</span>
          <button onClick={() => togglePlayerReady(player.id)}>
            Toggle Ready
          </button>
        </div>
      ))}
      <button disabled={!canStartGame()} onClick={startGame}>
        Start Game ({players.filter(p => p.isReady).length}/{players.length})
      </button>
    </>
  );
}
```

### Turn-Based Game with Timer

```typescript
import { createTimer } from './helpers';

const useGameStore = createGameStore<Settings>({
  name: 'timed-turn-game',
  initialSettings: { turnTimeSeconds: 30 },
  options: { turnBased: true },
  customState: {
    timeRemaining: 30,
  },
  customActions: (set, get) => ({
    startTurnTimer: () => {
      const timer = createTimer(
        get().settings.turnTimeSeconds * 1000,
        (remaining) => set({ timeRemaining: Math.ceil(remaining / 1000) }),
        () => get().nextTurn()
      );
      timer.start();
    },
  }),
});
```

### Game with Scoring

```typescript
interface PlayerWithScore extends Player {
  score: number;
}

const useGameStore = createGameStore<Settings, PlayerWithScore>({
  name: 'score-game',
  initialSettings: { /* ... */ },
  customActions: (set, get) => ({
    addScore: (playerId: string, points: number) => {
      const { players } = get();
      set({
        players: players.map(p => 
          p.id === playerId 
            ? { ...p, score: p.score + points }
            : p
        ),
      });
    },
    getLeaderboard: () => {
      return rankPlayersByScore(get().players);
    },
  }),
});
```

## Type Definitions

```typescript
interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
}

type GamePhase = 'lobby' | 'playing' | 'results';

interface TurnState {
  currentPlayerId: string;
  turnIndex: number;
  roundNumber: number;
}
```

## Best Practices

1. **Initialize settings carefully** - Provide sensible defaults
2. **Validate state transitions** - Use `canStartGame()` before starting
3. **Handle edge cases** - Check for empty player arrays
4. **Use type safety** - Extend `Player` type for custom properties
5. **Separate concerns** - Keep game logic in custom actions
6. **Test persistence** - Verify state restoration works correctly