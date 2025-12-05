import { useFiveSecondsState } from '@guess-logo/five-seconds';
import { GameplayPage } from './pages/gameplay-page';
import { FiveSecondsLobby } from './pages/lobby-page';
import { ResultsPage } from './pages/results-page';

export default function FiveSecondsPage() {
  const { phase } = useFiveSecondsState();
  // eslint-disable-next-line no-console
  console.log('Current game phase:', phase);

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
