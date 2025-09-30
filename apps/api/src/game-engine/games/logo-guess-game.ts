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

interface LogoGameConfig {
  selectedSet?: string;
  selectedGrid?: string;
  // Add other game-specific config options here
}
// --- End of specific types ---

export class LogoGuessGame implements IGameLogic {
  getInitialState(roomConfig: LogoGameConfig): LogoGameState {
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

  onPlayerJoin(state: LogoGameState, playerName: string): { success: boolean; newState: GameState; player?: Player; error?: string } {
    // This game has a hard limit of 2 players.
    if (state.playerA.name !== 'Player A' && state.playerB.name !== 'Player B') {
      return { success: false, newState: state, error: 'Room is full' };
    }

    const playerSlot = state.playerA.name === 'Player A' ? 'A' : 'B';

    let player: LogoPlayer;
    if (playerSlot === 'A') {
      state.playerA.name = playerName;
      player = state.playerA;
    }
    else {
      state.playerB.name = playerName;
      player = state.playerB;
    }

    // If both players have now joined, mark the game as initialized
    if (state.playerA.name !== 'Player A' && state.playerB.name !== 'Player B') {
      state.gameInitialized = true;
    }

    return { success: true, newState: state, player };
  }

  handleAction(state: LogoGameState, type: string, payload: any, _playerId: string): LogoGameState {
    switch (type) {
      case 'TOGGLE_LOGO':
        return this.handleToggleLogo(state, payload);
      case 'SWITCH_TURN':
        return this.handleSwitchTurn(state);
      case 'INITIALIZE_LOGOS':
        return this.handleInitializeLogos(state, payload);
      case 'START_GAME':
        return this.handleStartGame(state);
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

  private handleInitializeLogos(state: LogoGameState, payload: { logos: LogoItem[] }): LogoGameState {
    // The payload must contain the logos. If not, the caller has made a mistake.
    if (!payload.logos || payload.logos.length === 0) {
      console.error('INITIALIZE_LOGOS action called without a valid logos payload.');
      return state; // Return state unchanged to prevent errors.
    }

    const { logos } = payload;

    state.playerA.logos = [...logos];
    state.playerB.logos = [...logos];

    this.updatePlayerStats(state.playerA);
    this.updatePlayerStats(state.playerB);

    return state;
  }

  private handleStartGame(state: LogoGameState): LogoGameState {
    state.gameStarted = true;
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
