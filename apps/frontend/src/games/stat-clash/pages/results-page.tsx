import type { StatClashGameState } from '@playgrid/stat-clash';
import { useStatClashState } from '@playgrid/stat-clash';
import BackButton from '@/components/back-button';
import { GameOverScreen } from '../components/results/game-over-screen';
import { useStatClashActions } from '../hooks/use-stat-clash-actions';

const PERSISTENCE_KEY = 'stat-clash-game:v1';

export function ResultsPage() {
  const state = useStatClashState();
  const { startGame } = useStatClashActions();

  const handlePlayAgain = (settings: StatClashGameState['settings']) => {
    startGame(settings);
  };

  const handleBackToLobby = () => {
    localStorage.removeItem(PERSISTENCE_KEY);
    window.location.reload();
  };

  return (
    <div className="stat-clash-shell px-4 py-6 md:px-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <BackButton />
        <GameOverScreen
          state={state}
          onPlayAgain={handlePlayAgain}
          onBackToLobby={handleBackToLobby}
        />
      </div>
    </div>
  );
}
