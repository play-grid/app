import { useStatClashState } from '@playgrid/stat-clash';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { useStatClashActions } from '../../../hooks/use-stat-clash-actions';

export function Step5HotseatRounds() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const state = useStatClashState();
  const { startGame } = useStatClashActions();
  const [roundsPerPlayer, setRoundsPerPlayer] = useState(10);

  const handleContinue = () => {
    const settings = {
      ...state.settings,
      roundsPerPlayer,
    };
    startGame(settings);
    navigate('metric-type', { replace: true });
  };

  return (
    <div className="stat-clash-shell px-4 py-6 md:px-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            {t('statClashGame.lobby.steps.back')}
          </Button>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{t('statClashGame.hotseatSetup.roundsPerPlayer')}</h1>
            <p className="text-muted-foreground">{t('statClashGame.lobby.roundSetupDesc')}</p>
          </div>
        </div>

        <Card className="p-6 space-y-4">
          <Input
            type="number"
            min={1}
            max={20}
            value={roundsPerPlayer}
            onChange={e => setRoundsPerPlayer(Math.max(1, Math.min(20, Number(e.target.value || 1))))}
            className="text-lg"
          />
          <Button onClick={handleContinue} size="lg" fullWidth>
            {t('statClashGame.lobby.steps.next')}
          </Button>
        </Card>
      </div>
    </div>
  );
}
