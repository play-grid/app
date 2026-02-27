import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';

export function Step1ModeSelection() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="stat-clash-shell min-h-screen flex items-center justify-center px-4 py-6 md:px-6">
      <div className="max-w-5xl space-y-4 w-full">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">{t('statClashGame.lobby.gameMode')}</h1>
          <p className="text-muted-foreground">{t('statClashGame.lobby.gameModeDesc')}</p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-semibold">{t('statClashGame.lobby.mode.solo')}</h2>
            <p className="text-muted-foreground">{t('statClashGame.lobby.modeDescription.solo')}</p>
            <Button onClick={() => navigate('solo/category')} fullWidth>
              {t('statClashGame.lobby.steps.select')}
            </Button>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-semibold">{t('statClashGame.lobby.mode.hotseat')}</h2>
            <p className="text-muted-foreground">{t('statClashGame.lobby.modeDescription.hotseat')}</p>
            <Button onClick={() => navigate('hotseat/players')} fullWidth>
              {t('statClashGame.lobby.steps.select')}
            </Button>
          </Card>
        </div>

        {/* Screen Mode and Remote modes to be added in the future */}
      </div>
    </div>
  );
}
