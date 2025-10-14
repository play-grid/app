import { GameplayPage } from './pages/gameplay-page';
import { FiveSecondsLobby } from './pages/lobby-page';
import { ResultsPage } from './pages/results-page';
import { useFiveSecondsStore } from './store';

export default function FiveSecondsPage() {
  const phase = useFiveSecondsStore(s => s.phase);

  switch (phase) {
    case 'lobby':
      return <FiveSecondsLobby />;
    case 'playing':
      return <GameplayPage />;
    case 'results':
      return <ResultsPage />;
    default:
      return <FiveSecondsLobby />;
  }
}
