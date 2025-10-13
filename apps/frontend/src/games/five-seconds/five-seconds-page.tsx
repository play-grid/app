import { FiveSecondsLobby } from './components/five-seconds-lobby';
import { useFiveSecondsStore } from './store';

function GamePhaseComponent() {
  return <div>Playing...</div>;
}

export default function FiveSecondsPage() {
  const phase = useFiveSecondsStore(s => s.phase);

  switch (phase) {
    case 'lobby':
      return <FiveSecondsLobby />;
    case 'playing':
      return <GamePhaseComponent />; // Placeholder for the game screen
    case 'results':
      return <div>Results</div>; // Placeholder for results screen
    default:
      return <FiveSecondsLobby />;
  }
}
