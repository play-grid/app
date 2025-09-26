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

  // TODO: Add a proper 'Not Found' or 'Invalid Game' component
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg text-red-500">Invalid Game Link</p>
    </div>
  );
}
