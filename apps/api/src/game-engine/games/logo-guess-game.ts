import type {
  GameRoomConfig,
  LogoItem,
  Player,
  SharedGameState,
} from '@guess-logo/shared/types';
import type { GameState, IGameLogic } from '../game-logic';

export class LogoGuessGame implements IGameLogic {
  getInitialState(roomConfig: GameRoomConfig): SharedGameState {
    return {
      playerA: this.createEmptyPlayer('Player A'),
      playerB: this.createEmptyPlayer('Player B'),
      currentPlayer: 'A',
      gameInitialized: false, // Will be true once players join and logos are loaded
      gameStarted: false,
      selectedSet: roomConfig.selectedSet || 'companies',
      selectedList: roomConfig.selectedSet || 'companies',
      selectedGrid: roomConfig.selectedGrid || '8x6',
    };
  }

  onPlayerJoin(
    state: SharedGameState,
    playerName: string,
  ): { success: boolean; newState: GameState; player?: Player; error?: string } {
    // This game has a hard limit of 2 players.
    if (state.playerA.name !== 'Player A' && state.playerB.name !== 'Player B') {
      return { success: false, newState: state, error: 'Room is full' };
    }

    const playerSlot = state.playerA.name === 'Player A' ? 'A' : 'B';

    let player: Player;
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

  handleAction(state: SharedGameState, type: string, payload: any, _playerId: string): SharedGameState {
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

  private handleToggleLogo(state: SharedGameState, payload: { playerId: 'A' | 'B'; logoId: number }): SharedGameState {
    const player = payload.playerId === 'A' ? state.playerA : state.playerB;
    player.logos = player.logos.map(logo =>
      logo.id === payload.logoId ? { ...logo, eliminated: !logo.eliminated } : logo,
    );
    this.updatePlayerStats(player);
    return state;
  }

  private handleSwitchTurn(state: SharedGameState): SharedGameState {
    state.currentPlayer = state.currentPlayer === 'A' ? 'B' : 'A';
    return state;
  }

  private handleInitializeLogos(state: SharedGameState, payload: { logos: LogoItem[] }): SharedGameState {
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

  private handleStartGame(state: SharedGameState): SharedGameState {
    state.gameStarted = true;
    return state;
  }

  private createEmptyPlayer(name: string): Player {
    return {
      id: crypto.randomUUID(),
      name,
      logos: [],
      winner: null,
      activeCount: 0,
    };
  }

  private updatePlayerStats(player: Player) {
    const activeLogos = player.logos.filter(logo => !logo.eliminated);
    player.activeCount = activeLogos.length;
    player.winner = activeLogos.length === 1 ? activeLogos[0] : null;
  }
}
