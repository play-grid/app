import type { GameMode } from '@guess-logo/stat-clash';
import { Flame, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/card';

interface StreakBarProps {
  playerName: string;
  streak: number;
  score: number;
  mode: GameMode;
}

export function StreakBar({ playerName, streak, score, mode }: StreakBarProps) {
  const { t } = useTranslation();

  return (
    <Card className="p-4 flex items-center justify-between gap-4">
      <div>
        <p className="text-sm text-muted-foreground">
          {mode === 'solo' ? t('statClashGame.streakBar.currentRun') : t('statClashGame.streakBar.currentTurn', { playerName })}
        </p>
        <p className="text-lg font-semibold">{playerName}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-md bg-muted/60 px-3 py-1.5">
          <Flame className="size-4 text-orange-500" />
          <span className="text-sm font-semibold">
            {t('statClashGame.streakBar.streak')}
            {streak}
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-md bg-muted/60 px-3 py-1.5">
          <Trophy className="size-4 text-yellow-500" />
          <span className="text-sm font-semibold">
            {t('statClashGame.streakBar.score')}
            {score}
          </span>
        </div>
      </div>
    </Card>
  );
}
