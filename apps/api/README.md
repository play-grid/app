# API Architecture: Game-Agnostic Room Engine

This document outlines the backend architecture, which is designed as a generic, reusable engine for stateful, real-time games.

## Core Architecture

The backend is built around a game-agnostic `GameRoomDurableObject`. This Durable Object (DO) serves as the "core" layer for any game room and is responsible for:

- Managing WebSocket connections for all players.
- Handling player joins and leaves.
- Persisting room configuration and the current game state to storage.
- Broadcasting state changes to all connected clients.

The DO is intentionally unaware of the specific rules or logic of any particular game. All game-specific logic is delegated to a "game logic module" that is dynamically loaded at runtime based on the `gameType` specified during room creation.

This architecture uses a **Strategy Pattern**:

-   **Context**: The `GameRoomDurableObject`.
-   **Strategy Interface**: The `IGameLogic` interface (defined in `src/lib/game-logic.ts`) which defines the required methods for any game.
-   **Concrete Strategies**: Individual game modules (e.g., `LogoGuessGame` in `src/lib/games/logo-guess-game.ts`) that implement `IGameLogic`.
-   **Factory**: The `gameLogicFactory` (in `src/lib/game-logic.factory.ts`) which selects the appropriate game module (strategy) at runtime.

---

## How to Add a New Game

To add a new game to the system, follow these steps:

### 1. Define Your Game's State and Logic

Create a new file for your game under `src/lib/games/`, for example, `my-new-game.ts`.

Inside this file, you will:
- Define the interfaces for your game's specific state (e.g., `MyNewGameState`).
- Create a class that implements the `IGameLogic` interface: `export class MyNewGame implements IGameLogic { ... }`.

### 2. Implement the `IGameLogic` Interface

Your `MyNewGame` class must implement the following methods:

-   **`getInitialState(roomConfig)`**: This method must return the default starting state for your game. You can use the `roomConfig` object to pass in game-specific settings from the client during room creation.

    ```typescript
    getInitialState(roomConfig: any): MyGameState {
      return {
        board: Array(9).fill(null),
        turn: 'X',
        // ...etc.
      };
    }
    ```

-   **`onPlayerJoin(state, playerName)`**: This method handles adding a new player to the game state. It should return an object containing the `newState` and the `player` object that was added.

    ```typescript
    onPlayerJoin(state: MyGameState, playerName: string): { newState: GameState; player: Player } {
      // logic to add player
      return { newState, player };
    }
    ```

-   **`handleAction(state, type, payload, playerId)`**: This is the core of your game logic. It receives actions sent from clients (e.g., `{ type: 'MAKE_MOVE', payload: { x: 1, y: 2 } }`). It should process the action, update the state accordingly, and return the new, updated state.

    ```typescript
    handleAction(state: MyGameState, type: string, payload: any, playerId: string): MyGameState {
      if (type === 'MAKE_MOVE') {
        // Your game logic for making a move
      }
      return state;
    }
    ```

### 3. Register Your Game in the Factory

Open `src/lib/game-logic.factory.ts` and follow these two steps:

1.  Import your new `MyNewGame` class.
2.  Add a new `case` to the `switch` statement in the `gameLogicFactory` function. The string key you use here is the `gameType` that clients will need to send when creating a room.

    ```typescript
    import { MyNewGame } from './games/my-new-game';
    // ...
    switch (gameType) {
      case 'logo-guess':
        return new LogoGuessGame();
      case 'my-new-game': // Add this line
        return new MyNewGame(); // Add this line
      default:
        return null;
    }
    ```

### 4. Update the Frontend

Finally, update your frontend application to:
1.  Allow users to select your new `gameType` ('my-new-game') when creating a room.
2.  Implement the client-side logic to send the specific actions (e.g., 'MAKE_MOVE') that your `handleAction` method expects.

Once these steps are complete, the `GameRoomDurableObject` will automatically handle all the core networking and state management for your new game.