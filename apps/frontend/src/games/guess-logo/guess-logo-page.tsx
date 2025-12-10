import { useGuessLogoState } from '@guess-logo/guess-logo';
import { logger } from '@/utils/logger';
import GameplayPage from './pages/gameplay-page';
import GuessLogoLobby from './pages/lobby-page';

export default function GamePlayPage() {
  const { phase } = useGuessLogoState();
  logger.info({ phase }, 'Current game phase:');
  switch (phase) {
    case 'lobby':
      return <GuessLogoLobby />;
    case 'playing':
      return <GameplayPage />;
    default:
      return <GuessLogoLobby />;
  }
}
