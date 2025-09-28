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

    // If both players have now joined, mark the game as initialized and load logos
    if (state.playerA.name !== 'Player A' && state.playerB.name !== 'Player B') {
      state.gameInitialized = true;
      // Initialize logos for both players based on the selected set and grid
      this.initializeLogos(state);
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
    // Initialize both players with the same set of logos
    const logos = payload.logos || this.getDefaultLogos(state.selectedSet, state.selectedGrid);

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

  private initializeLogos(state: LogoGameState) {
    // This would typically load logos based on selectedSet and selectedGrid
    // For now, we'll create some default logos
    const logos = this.getDefaultLogos(state.selectedSet, state.selectedGrid);

    state.playerA.logos = [...logos];
    state.playerB.logos = [...logos];

    this.updatePlayerStats(state.playerA);
    this.updatePlayerStats(state.playerB);
  }

  private getDefaultLogos(selectedSet: string, selectedGrid: string): LogoItem[] {
    // This is a placeholder - you'll want to implement actual logo loading
    // based on your selectedSet and selectedGrid parameters
    const gridSizes: { [key: string]: number } = {
      '4x3': 12,
      '6x4': 24,
      '8x6': 48,
      // Add more grid configurations as needed
    };

    const logoCount = gridSizes[selectedGrid] || 12;

    // Generate placeholder logos - replace with actual logo loading logic
    return Array.from({ length: logoCount }, (_, index) => ({
      id: index + 1,
      name: `${selectedSet} Logo ${index + 1}`,
      imageUrl: `/api/logos/${selectedSet}/${index + 1}.png`, // Adjust URL as needed
      eliminated: false,
    }));
  }
}
