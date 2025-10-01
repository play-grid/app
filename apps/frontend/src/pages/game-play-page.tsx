import { InvalidGame } from '@/components/invalid-game';
import { useGameModeDetection } from '@/hooks/game-room/use-game-mode-detection';
import { LocalGamePlayPage } from './local-game-play-page';
import { OnlineGamePlayPage } from './online-game-play-page';

export function GamePlayPage() {
  const { mode, roomId } = useGameModeDetection();

  if (mode === 'online' && roomId) {
    return <OnlineGamePlayPage roomId={roomId} />;
  }

  if (mode === 'local') {
    return <LocalGamePlayPage />;
  }

  return <InvalidGame />;
}
