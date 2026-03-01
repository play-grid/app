import type { GameMode } from '@playgrid/stat-clash';
import { Monitor, Smartphone, Users, UserSquare2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface ModeSelectorProps {
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
}

export function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  const { t } = useTranslation();

  return (
    <Card className="p-5 space-y-4">
      <div>
        <h2 className="text-xl font-semibold">{t('statClashGame.lobby.gameMode')}</h2>
        <p className="text-sm text-muted-foreground">{t('statClashGame.lobby.gameModeDesc')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          variant={mode === 'solo' ? 'default' : 'outline'}
          onClick={() => onModeChange('solo')}
          className="justify-start h-auto py-3"
        >
          <UserSquare2 className="size-4" />
          {t('statClashGame.lobby.mode.solo')}
        </Button>
        <Button
          variant={mode === 'hotseat' ? 'default' : 'outline'}
          onClick={() => onModeChange('hotseat')}
          className="justify-start h-auto py-3"
        >
          <Users className="size-4" />
          {t('statClashGame.lobby.mode.hotseat')}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 opacity-70">
        <div className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
          <div className="font-medium text-foreground flex items-center gap-2">
            <Monitor className="size-4" />
            {t('statClashGame.lobby.mode.screenMode')}
          </div>
          <p className="mt-1">{t('statClashGame.lobby.mode.screenModeDesc')}</p>
        </div>
        <div className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
          <div className="font-medium text-foreground flex items-center gap-2">
            <Smartphone className="size-4" />
            {t('statClashGame.lobby.mode.remote')}
          </div>
          <p className="mt-1">{t('statClashGame.lobby.mode.remoteDesc')}</p>
        </div>
      </div>
    </Card>
  );
}
