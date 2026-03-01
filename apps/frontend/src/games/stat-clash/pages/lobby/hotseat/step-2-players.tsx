import { useStatClashState } from '@playgrid/stat-clash';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { useStatClashActions } from '../../../hooks/use-stat-clash-actions';

export function Step2HotseatPlayers() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const state = useStatClashState();
  const { addHotseatPlayer, removeHotseatPlayer } = useStatClashActions();
  const [name, setName] = useState('');

  const players = Object.values(state.players);

  const submitAddPlayer = () => {
    const trimmed = name.trim();
    if (!trimmed)
      return;
    addHotseatPlayer(trimmed);
    setName('');
  };

  const handleContinue = () => {
    if (players.length >= 2) {
      navigate('category', { replace: true });
    }
  };

  return (
    <div className="stat-clash-shell px-4 py-6 md:px-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            {t('statClashGame.lobby.steps.back')}
          </Button>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{t('statClashGame.hotseatSetup.title')}</h1>
            <p className="text-muted-foreground">{t('statClashGame.hotseatSetup.description')}</p>
          </div>
        </div>

        <Card className="p-6 space-y-4">
          <div className="flex gap-2">
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t('statClashGame.hotseatSetup.playerNamePlaceholder')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  submitAddPlayer();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={submitAddPlayer}>
              <Plus className="size-4" />
              {t('statClashGame.hotseatSetup.add')}
            </Button>
          </div>

          <div className="space-y-2">
            {players.map(player => (
              <div key={player.id} className="flex items-center justify-between rounded-md border border-border/70 bg-background/70 px-3 py-2">
                <div>
                  <p className="font-medium">{player.name || t('statClashGame.hotseatSetup.player')}</p>
                  <p className="text-xs text-muted-foreground">
                    {player.id === state.hostId ? t('statClashGame.hotseatSetup.host') : t('statClashGame.hotseatSetup.player')}
                  </p>
                </div>
                {player.id !== state.hostId && (
                  <Button variant="ghost" size="sm" onClick={() => removeHotseatPlayer(player.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {players.length < 2 && (
            <p className="text-sm text-amber-600">{t('statClashGame.lobby.minPlayersRequired')}</p>
          )}

          <Button onClick={handleContinue} disabled={players.length < 2} size="lg" fullWidth>
            {t('statClashGame.lobby.steps.next')}
          </Button>
        </Card>
      </div>
    </div>
  );
}
