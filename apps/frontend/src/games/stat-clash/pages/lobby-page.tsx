import type { Category, Difficulty, GameMode } from '@guess-logo/stat-clash';
import { useStatClashState } from '@guess-logo/stat-clash';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HotseatSetup } from '../components/lobby/hotseat-setup';
import { ModeSelector } from '../components/lobby/mode-selector';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useStatClashActions } from '../hooks/use-stat-clash-actions';

export function LobbyPage() {
  const { t } = useTranslation();
  const state = useStatClashState();
  const { startGame, addHotseatPlayer, removeHotseatPlayer } = useStatClashActions();

  const [mode, setMode] = useState<GameMode>('solo');
  const [category, setCategory] = useState<Category>('mixed');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [roundsPerPlayer, setRoundsPerPlayer] = useState(10);
  const [metricType, setMetricType] = useState('');

  const playerCount = useMemo(() => Object.keys(state.players).length, [state.players]);

  const handleModeChange = (nextMode: GameMode) => {
    setMode(nextMode);

    if (nextMode === 'solo') {
      for (const player of Object.values(state.players)) {
        if (!player.isHost) {
          removeHotseatPlayer(player.id);
        }
      }
    }
  };

  const handleStartGame = () => {
    const settings: typeof state.settings = {
      mode,
      category,
      difficulty,
      roundsPerPlayer,
      metricType: metricType.trim() ? metricType.trim() : undefined,
      streakGoal: undefined,
      timeLimit: undefined,
    };

    startGame(settings);
  };

  const canStartGame = mode === 'solo' ? playerCount >= 1 : playerCount >= 2;

  return (
    <div className="stat-clash-shell px-4 py-6 md:px-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">{t('statClashGame.lobby.title')}</h1>
          <p className="text-muted-foreground">{t('statClashGame.lobby.description')}</p>
        </header>

        <div className="grid gap-4 lg:grid-cols-2">
          <ModeSelector mode={mode} onModeChange={handleModeChange} />

          <Card className="p-5 space-y-4">
            <div>
              <h2 className="text-xl font-semibold">{t('statClashGame.lobby.roundSetup')}</h2>
              <p className="text-sm text-muted-foreground">{t('statClashGame.lobby.roundSetupDesc')}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium flex flex-col gap-1.5">
                {t('statClashGame.lobby.category')}
                <select
                  className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
                  value={category}
                  onChange={e => setCategory(e.target.value as typeof category)}
                >
                  <option value="mixed">{t('statClashGame.lobby.categories.mixed')}</option>
                  <option value="football">{t('statClashGame.lobby.categories.football')}</option>
                  <option value="companies">{t('statClashGame.lobby.categories.companies')}</option>
                  <option value="countries">{t('statClashGame.lobby.categories.countries')}</option>
                </select>
              </label>

              <label className="text-sm font-medium flex flex-col gap-1.5">
                {t('statClashGame.lobby.difficulty')}
                <select
                  className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value as typeof difficulty)}
                >
                  <option value="easy">{t('statClashGame.lobby.difficultyOptions.easy')}</option>
                  <option value="medium">{t('statClashGame.lobby.difficultyOptions.medium')}</option>
                  <option value="hard">{t('statClashGame.lobby.difficultyOptions.hard')}</option>
                </select>
              </label>
            </div>

            <label className="text-sm font-medium flex flex-col gap-1.5">
              {t('statClashGame.lobby.optionalMetricType')}
              <Input
                value={metricType}
                onChange={e => setMetricType(e.target.value)}
                placeholder={t('statClashGame.lobby.metricTypePlaceholder')}
              />
            </label>

            <Button onClick={handleStartGame} disabled={!canStartGame} fullWidth>
              {t('statClashGame.lobby.startGame', { mode: t(`statClashGame.lobby.startGameModes.${mode}`) })}
            </Button>

            {!canStartGame && mode === 'hotseat' && (
              <p className="text-sm text-amber-600">{t('statClashGame.lobby.minPlayersRequired')}</p>
            )}
          </Card>
        </div>

        {mode === 'hotseat' && (
          <HotseatSetup
            players={state.players}
            hostId={state.hostId}
            roundsPerPlayer={roundsPerPlayer}
            onRoundsPerPlayerChange={value => setRoundsPerPlayer(Math.max(1, Math.min(20, value || 1)))}
            onAddPlayer={addHotseatPlayer}
            onRemovePlayer={removeHotseatPlayer}
          />
        )}
      </div>
    </div>
  );
}
