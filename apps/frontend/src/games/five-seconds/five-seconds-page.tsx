import { useEffect } from 'react';
import { useUrlSyncedSettings } from './hooks/use-url-synced-settings';
import { GameplayPage } from './pages/gameplay-page';
import { FiveSecondsLobby } from './pages/lobby-page';
import { ResultsPage } from './pages/results-page';
import { useFiveSecondsStore } from './stores/game-store';

export default function FiveSecondsPage() {
  useUrlSyncedSettings();

  const phase = useFiveSecondsStore(state => state.phase);
  const players = useFiveSecondsStore(state => state.players);
  const setPhase = useFiveSecondsStore(state => state.setPhase);

  useEffect(() => {
    if ((phase === 'playing' || phase === 'results') && players.length === 0) {
      console.warn('No players found, redirecting to lobby');
      setPhase('lobby');
    }
  }, [phase, players.length, setPhase]);

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
