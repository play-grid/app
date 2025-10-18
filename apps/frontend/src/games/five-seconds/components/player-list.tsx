import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UsersIcon } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { useFiveSecondsStore } from '../stores/game-store';

export function PlayerList() {
  const { t } = useTranslation();
  const players = useFiveSecondsStore(s => s.players);
  const addPlayer = useFiveSecondsStore(s => s.addPlayer);
  const removePlayer = useFiveSecondsStore(s => s.removePlayer);
  // const togglePlayerReady = useFiveSecondsStore(state => state.togglePlayerReady);
  const [playerName, setPlayerName] = useState('');

  // This is a placeholder for adding players. In a real scenario,
  // this would be more sophisticated.
  const handleAddPlayer = () => {
    if (playerName.trim()) {
      addPlayer({
        id: `player-${Date.now()}`,
        name: playerName.trim(),
        score: 0,
      });
      setPlayerName('');
    }
  };

  return (
    <Card className="p-6 space-y-6 bg-card border-border">
      <div className="flex items-center gap-3">
        <UsersIcon className="w-6 h-6 text-accent" />
        <h2 className="text-2xl font-bold">
          {t('fiveSecondsGame.lobby.playersTitle', { count: players.length, max: 4 })}
        </h2>
      </div>

      {/* Add Player */}
      <div className="flex gap-2">
        <Input
          placeholder={t('fiveSecondsGame.lobby.enterYourName')}
          value={playerName}
          onChange={e => setPlayerName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAddPlayer()}
          className="bg-background border-border"
        />
        <Button onClick={handleAddPlayer} disabled={players.length >= 4}>
          {t('fiveSecondsGame.lobby.join')}
        </Button>
      </div>

      {/* Player List */}
      <div className="space-y-3">
        {players.length === 0
          ? (
              <p className="text-center text-muted-foreground py-8">{t('fiveSecondsGame.lobby.noPlayers')}</p>
            )
          : (
              players.map(player => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-4 bg-secondary rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold">
                      {player.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">{player.name}</p>
                      {player.isHost && (
                        <Badge variant="secondary" className="text-xs">
                          {t('fiveSecondsGame.lobby.host')}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/*
                          uncomment this if i make online mode multiplayer
                          {player.isReady
                            ? (
                              <Check className="w-5 h-5 text-accent" />
                              )
                              : (
                                <X className="w-5 h-5 text-muted-foreground" />
                                )}
                          <Button
                            size="sm"
                            variant={player.isReady ? 'secondary' : 'default'}
                            onClick={() => togglePlayerReady(player.id)}
                          >
                            {player.isReady ? t('fiveSecondsGame.lobby.notReady') : t('fiveSecondsGame.lobby.ready')}
                          </Button>
                           */}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        const removedPlayer = player;
                        removePlayer(player.id);
                        toast(t('common.toasts.playerRemoved', { name: player.name }), {
                          action: {
                            label: t('common.toasts.playerRemoveUndo'),
                            onClick: () => {
                              useFiveSecondsStore.getState().addPlayer(removedPlayer);
                            },
                          },
                        });
                      }}
                    >
                      {t('fiveSecondsGame.lobby.remove')}
                    </Button>
                  </div>
                </div>
              ))
            )}
      </div>
    </Card>
  );
}
