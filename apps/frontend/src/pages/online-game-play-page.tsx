import { useTranslation } from 'react-i18next';
import { GameHeader } from '@/components/game-header';
import { GameInstructions } from '@/components/game-instructions';
import { PlayerGrid } from '@/components/player-grid';
import { Button } from '@/components/ui/button';
import { useGameActions } from '@/hooks/game-room/use-game-actions';
import { useGameUI } from '@/hooks/game-room/use-game-ui';
import { useOnlineGame } from '@/hooks/game-room/use-online-game';
import { useLanguageNavigation } from '@/hooks/use-language-navigation';
import { getGridConfiguration } from '@/lib/grid-configurations';
import { useGameStore } from '@/stores/game-state-store';

interface OnlineGamePlayPageProps {
  roomId: string;
}

export function OnlineGamePlayPage({ roomId }: OnlineGamePlayPageProps) {
  const { navigate } = useLanguageNavigation();
  const { t } = useTranslation();

  // --- Online Mode Hooks --- //
  const { connectionStatus, sendAction } = useOnlineGame(roomId);
  const { toggleLogo, switchTurn } = useGameActions({ mode: 'online', sendAction });

  // --- Store --- //
  const { playerA, playerB, currentPlayer, selectedGrid, selectedSet, resetGame } = useGameStore();

  // --- UI Logic --- //
  const { showLoading, loadingMessage, showError, errorMessage } = useGameUI({
    mode: 'online',
    isLocalLoading: false,
    localError: null,
    connectionStatus,
  });

  // --- Event Handlers --- //
  const handleLeaveGame = () => {
    resetGame();
    navigate('/');
  };

  if (showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  if (showError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-500 mb-4">{errorMessage}</p>
          <Button onClick={handleLeaveGame} className="px-4 py-2 bg-primary text-white rounded-md">
            {t('back-to-setup')}
          </Button>
        </div>
      </div>
    );
  }

  const gridConfig = getGridConfiguration(selectedGrid);
  return (
    <div className="min-h-screen p-4">
      <GameHeader
        selectedSet={selectedSet}
        currentPlayer={currentPlayer}
        playerA={playerA}
        playerB={playerB}
        gridConfig={gridConfig}
        onSwitchTurn={switchTurn}
        onResetGame={handleLeaveGame}
        onStartNewGame={handleLeaveGame} // Rematch logic would differ for online
      />
      <div className="grid lg:grid-cols-[1fr_2px_1fr] gap-16 relative">
        <PlayerGrid player={playerA} onToggleLogo={logoId => toggleLogo('A', logoId)} gridConfig={gridConfig} />
        <div className="bg-gray-300 border-1" />
        <PlayerGrid player={playerB} onToggleLogo={logoId => toggleLogo('B', logoId)} gridConfig={gridConfig} />
      </div>
      <GameInstructions />
    </div>
  );
}
