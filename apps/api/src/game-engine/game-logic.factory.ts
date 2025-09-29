import type { IGameLogic } from './game-logic';
import { LogoGuessGame } from './games/logo-guess-game';

/**
 * Factory function to get the game logic handler for a given game type.
 * @param gameType The type of the game (e.g., 'logo-guess').
 * @returns An instance of a class that implements IGameLogic.
 */
export function gameLogicFactory(gameType: string): IGameLogic | null {
  switch (gameType) {
    case 'logo-guess':
      return new LogoGuessGame();
    // In the future, you can add more games here:
    // case 'tic-tac-toe':
    //   return new TicTacToeGame();
    default:
      console.error(`Unknown game type: ${gameType}`);
      return null;
  }
}
