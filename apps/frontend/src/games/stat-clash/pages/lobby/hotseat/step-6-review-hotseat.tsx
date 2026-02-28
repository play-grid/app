import { useStatClashState } from '@guess-logo/stat-clash';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';

export function Step6ReviewHotseat() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const state = useStatClashState();
  const players = Object.values(state.players);

  return (
    <div className="stat-clash-shell px-4 py-6 md:px-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            {t('statClashGame.lobby.steps.back')}
          </Button>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{t('statClashGame.lobby.steps.reviewHotseat')}</h1>
            <p className="text-muted-foreground">{t('statClashGame.lobby.steps.reviewTitle')}</p>
          </div>
        </div>

        <Card className="p-6 space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('statClashGame.lobby.gameMode')}</span>
                <span className="font-semibold">{t('statClashGame.lobby.mode.hotseat')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('statClashGame.lobby.category')}</span>
                <span className="font-semibold">{t(`statClashGame.lobby.categories.${state.settings.category}`)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('statClashGame.lobby.difficulty')}</span>
                <span className="font-semibold">{t(`statClashGame.lobby.difficultyOptions.${state.settings.difficulty}`)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('statClashGame.hotseatSetup.roundsPerPlayer')}</span>
                <span className="font-semibold">{state.settings.roundsPerPlayer}</span>
              </div>
              {state.settings.metricType && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('statClashGame.lobby.optionalMetricType')}</span>
                  <span className="font-semibold">{state.settings.metricType}</span>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-2">{t('statClashGame.lobby.steps.players')}</h3>
              <div className="space-y-1">
                {players.map(player => (
                  <div key={player.id} className="flex justify-between text-sm">
                    <span>{player.name}</span>
                    {player.id === state.hostId && <span className="text-muted-foreground">{t('statClashGame.hotseatSetup.host')}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Button onClick={() => navigate('../../gameplay', { replace: true })} size="lg" fullWidth>
            {t('statClashGame.lobby.startGame', { mode: t('statClashGame.lobby.startGameModes.hotseat') })}
          </Button>
        </Card>
      </div>
    </div>
  );
}
