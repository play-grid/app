import type { GuessDirection, StatClashGameState } from '@playgrid/stat-clash';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/card';
import { GuessButtons } from './guess-buttons';
import { ItemCard } from './item-card';
import { StreakBar } from './streak-bar';

interface GameBoardProps {
  state: StatClashGameState;
  onGuess: (direction: GuessDirection, playerId: string) => void;
}

export function GameBoard({ state, onGuess }: GameBoardProps) {
  const { t } = useTranslation();
  const currentRound = state.currentRound;
  const currentPlayerId = state.turnState?.currentPlayerId || state.hostId || Object.keys(state.players)[0];
  const currentPlayer = currentPlayerId ? state.players[currentPlayerId] : undefined;

  if (!currentRound) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-2xl font-semibold">{t('statClashGame.gameplay.preparingRound')}</h2>
        <p className="mt-2 text-muted-foreground">
          {state.error?.message || t('statClashGame.gameplay.fetchingItems')}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <StreakBar
        playerName={currentPlayer?.name || t('statClashGame.gameplay.player')}
        streak={currentPlayer?.streak || 0}
        score={currentPlayer?.score || 0}
        mode={state.settings.mode === 'hotseat' ? 'hotseat' : 'solo'}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ItemCard item={currentRound.leftItem} side="left" showValue />
        <ItemCard item={currentRound.rightItem} side="right" showValue={Boolean(currentRound.revealed)} />
      </div>

      <GuessButtons
        onGuess={(direction) => {
          if (!currentPlayerId)
            return;
          onGuess(direction, currentPlayerId);
        }}
        disabled={!currentPlayerId}
      />

      {state.settings.mode === 'hotseat' && (
        <p className="text-center text-sm text-muted-foreground">
          {t('statClashGame.gameplay.passingTurnOrder')}
          {state.turnState?.playerOrder.map(id => state.players[id]?.name || t('statClashGame.gameplay.player')).join(' → ')}
        </p>
      )}
    </div>
  );
}
