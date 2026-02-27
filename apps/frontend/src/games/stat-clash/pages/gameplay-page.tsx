import { useStatClashState } from '@guess-logo/stat-clash';
import BackButton from '@/components/back-button';
import { GameBoard } from '../components/game/game-board';
import { useStatClashActions } from '../hooks/use-stat-clash-actions';

export function GameplayPage() {
  const state = useStatClashState();
  const { guessHigher } = useStatClashActions();

  return (
    <div className="stat-clash-shell px-4 py-6 md:px-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <BackButton />
        <GameBoard state={state} onGuess={guessHigher} />
      </div>
    </div>
  );
}
