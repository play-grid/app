import type { GameState, IGameLogic, Player } from '../game-logic';

// --- Types specific to the Logo Guess Game ---
interface LogoItem {
  id: number;
  name: string;
  imageUrl: string;
  eliminated: boolean;
}

interface LogoPlayer extends Player {
  logos: LogoItem[];
  winner: LogoItem | null;
  activeCount: number;
}

interface LogoGameState {
  playerA: LogoPlayer;
  playerB: LogoPlayer;
  currentPlayer: 'A' | 'B';
  gameInitialized: boolean;
  gameStarted: boolean;
  selectedSet: string;
  selectedGrid: string;
}
// --- End of specific types ---

export class LogoGuessGame implements IGameLogic {
  getInitialState(roomConfig: any): LogoGameState {
    // Here you could fetch logos based on roomConfig.selectedSet, etc.
    // For now, we'll keep it simple.
    return {
      playerA: this.createEmptyPlayer('Player A'),
      playerB: this.createEmptyPlayer('Player B'),
      currentPlayer: 'A',
      gameInitialized: false, // Will be true once players join and logos are loaded
      gameStarted: false,
      selectedSet: roomConfig.selectedSet || 'companies',
      selectedGrid: roomConfig.selectedGrid || '8x6',
    };
  }

  onPlayerJoin(state: LogoGameState, playerName: string): { newState: GameState; player: Player } {
    let playerToUpdate: 'playerA' | 'playerB';

    // Assign the first available slot
    if (state.playerA.name === 'Player A') {
      playerToUpdate = 'playerA';
    }
    else if (state.playerB.name === 'Player B') {
      playerToUpdate = 'playerB';
    }
    else {
      // This case should be handled by room full logic before calling this
      throw new Error('Room is full');
    }

    state[playerToUpdate].name = playerName;
    const player = state[playerToUpdate];

    // If both players have now joined, mark the game as initialized
    if (state.playerA.name !== 'Player A' && state.playerB.name !== 'Player B') {
      state.gameInitialized = true;
      // Here you would also populate the `logos` array for both players
    }

    return { newState: state, player };
  }

  handleAction(state: LogoGameState, type: string, payload: any, _playerId: string): LogoGameState {
    switch (type) {
      case 'TOGGLE_LOGO':
        return this.handleToggleLogo(state, payload);
      case 'SWITCH_TURN':
        return this.handleSwitchTurn(state);
      default:
        return state; // Return unchanged state for unknown actions
    }
  }

  // --- Private helpers for Logo Guess Game logic ---

  private handleToggleLogo(state: LogoGameState, payload: { playerId: 'A' | 'B'; logoId: number }): LogoGameState {
    const player = payload.playerId === 'A' ? state.playerA : state.playerB;
    player.logos = player.logos.map(logo =>
      logo.id === payload.logoId ? { ...logo, eliminated: !logo.eliminated } : logo,
    );
    this.updatePlayerStats(player);
    return state;
  }

  private handleSwitchTurn(state: LogoGameState): LogoGameState {
    state.currentPlayer = state.currentPlayer === 'A' ? 'B' : 'A';
    return state;
  }

  private createEmptyPlayer(name: string): LogoPlayer {
    return {
      id: crypto.randomUUID(),
      name,
      logos: [],
      winner: null,
      activeCount: 0,
    };
  }

  private updatePlayerStats(player: LogoPlayer) {
    const activeLogos = player.logos.filter(logo => !logo.eliminated);
    player.activeCount = activeLogos.length;
    player.winner = activeLogos.length === 1 ? activeLogos[0] : null;
  }
}
