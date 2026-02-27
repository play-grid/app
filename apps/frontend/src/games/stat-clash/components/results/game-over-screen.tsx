import type { StatClashGameState } from '@guess-logo/stat-clash';
import { RotateCcw } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface GameOverScreenProps {
  state: StatClashGameState;
  onPlayAgain: (settings: StatClashGameState['settings']) => void;
  onBackToLobby: () => void;
}

export function GameOverScreen({ state, onPlayAgain, onBackToLobby }: GameOverScreenProps) {
  const { t } = useTranslation();
  const sortedPlayers = useMemo(
    () => Object.values(state.players).sort((a, b) => b.score - a.score),
    [state.players],
  );

  return (
    <Card className="p-6 sm:p-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold">{t('statClashGame.results.gameOver')}</h2>
        <p className="mt-2 text-muted-foreground">
          {state.settings.mode === 'solo' ? t('statClashGame.results.soloEnding') : t('statClashGame.results.hotseatEnding')}
        </p>
      </div>

      <div className="mt-6 space-y-2">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            className="flex items-center justify-between rounded-lg border border-border/70 bg-background/70 px-4 py-3"
          >
            <div>
              <p className="font-semibold">
                #
                {index + 1}
                {' '}
                {player.name || t('statClashGame.gameplay.player')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('statClashGame.results.streak')}
                {player.streak}
                {' '}
                · {t('statClashGame.results.rounds')}
                {player.roundsPlayed}
              </p>
            </div>
            <p className="text-lg font-bold">{player.score}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button onClick={() => onPlayAgain(state.settings)}>
          <RotateCcw className="size-4" />
          {t('statClashGame.results.playAgain')}
        </Button>
        <Button variant="outline" onClick={onBackToLobby}>
          {t('statClashGame.results.backToLobby')}
        </Button>
      </div>
    </Card>
  );
}
