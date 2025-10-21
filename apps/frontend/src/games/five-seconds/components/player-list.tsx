import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UsersIcon } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useFiveSecondsStore } from '../stores/game-store';

// Zod schema for player name validation
function createPlayerNameSchema(t: any) {
  return z
    .string()
    .trim()
    .min(2, t('fiveSecondsGame.lobby.validation.minLength'))
    .max(20, t('fiveSecondsGame.lobby.validation.maxLength'))
    .regex(/^[a-z0-9\s\u0600-\u06FF]+$/i, t('fiveSecondsGame.lobby.validation.invalidCharacters'));
}

const MAX_PLAYERS = 4;

export function PlayerList() {
  const { t } = useTranslation();
  const players = useFiveSecondsStore(s => s.players);
  const addPlayer = useFiveSecondsStore(s => s.addPlayer);
  const removePlayer = useFiveSecondsStore(s => s.removePlayer);

  const [playerName, setPlayerName] = useState('');
  const [exiting, setExiting] = useState<string[]>([]);
  const [entering, setEntering] = useState<string[]>([]);

  const [validationError, setValidationError] = useState<string>('');

  const validatePlayerName = (name: string): boolean => {
    const playerNameSchema = createPlayerNameSchema(t);

    try {
      playerNameSchema.parse(name);

      // Check for duplicate names
      if (players.some(p => p.name.toLowerCase() === name.trim().toLowerCase())) {
        setValidationError(t('fiveSecondsGame.lobby.nameAlreadyExists'));
        return false;
      }

      setValidationError('');
      return true;
    }
    catch (error) {
      if (error instanceof z.ZodError) {
        setValidationError(error.errors[0].message);
      }
      return false;
    }
  };

  const handleInputChange = (value: string) => {
    setPlayerName(value);

    // Only validate if there's input
    if (value.trim()) {
      validatePlayerName(value);
    }
    else {
      setValidationError('');
    }
  };

  const handleAddPlayer = () => {
    const trimmedName = playerName.trim();

    if (!trimmedName) {
      setValidationError(t('fiveSecondsGame.lobby.nameRequired'));
      return;
    }

    if (players.length >= MAX_PLAYERS) {
      toast.error(t('fiveSecondsGame.lobby.maxPlayersReached'));
      return;
    }

    if (!validatePlayerName(trimmedName)) {
      return;
    }

    const newPlayer = {
      id: `player-${Date.now()}`,
      name: trimmedName,
      score: 0,
    };

    addPlayer(newPlayer);
    setEntering([newPlayer.id]); // Mark as entering

    setTimeout(() => {
      setEntering([]);
    }, 200);

    setPlayerName('');
    setValidationError('');
    toast.success(t('fiveSecondsGame.lobby.playerAdded', { name: trimmedName }));
  };

  const handleRemovePlayer = (player: { id: string; name: string; score: number; isHost?: boolean }) => {
    setExiting([player.id]);

    setTimeout(() => {
      removePlayer(player.id);
      setExiting([]);
    }, 200);

    toast(t('common.toasts.playerRemoved', { name: player.name }), {
      action: {
        label: t('common.toasts.playerRemoveUndo'),
        onClick: () => {
          useFiveSecondsStore.getState().addPlayer(player);
          setEntering([player.id]); // Animate when undoing
          setTimeout(() => setEntering([]), 200);
        },
      },
    });
  };

  const isMaxPlayersReached = players.length >= MAX_PLAYERS;
  const isAddButtonDisabled = isMaxPlayersReached || !playerName.trim() || !!validationError;

  return (
    <Card className="p-6 space-y-6 bg-card border-border">
      {/* Header */}
      <div className="flex items-center gap-3">
        <UsersIcon className="w-6 h-6 text-accent" aria-hidden="true" />
        <h2 className="text-2xl font-bold">
          {t('fiveSecondsGame.lobby.playersTitle', { count: players.length, max: MAX_PLAYERS })}
        </h2>
      </div>

      {/* Add Player Form */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder={t('fiveSecondsGame.lobby.enterYourName')}
              value={playerName}
              onChange={e => handleInputChange(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !isAddButtonDisabled && handleAddPlayer()}
              className={`bg-background border-border ${validationError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              maxLength={20}
              aria-label={t('fiveSecondsGame.lobby.enterYourName')}
              aria-invalid={!!validationError}
              aria-describedby={validationError ? 'player-name-error' : undefined}
              disabled={isMaxPlayersReached}
            />
            {validationError && (
              <p
                id="player-name-error"
                className="text-sm text-destructive mt-1.5 flex items-center gap-1"
                role="alert"
              >
                <span aria-hidden="true">⚠</span>
                {validationError}
              </p>
            )}
          </div>
          <Button
            onClick={handleAddPlayer}
            disabled={isAddButtonDisabled}
            aria-label={t('fiveSecondsGame.lobby.join')}
          >
            {t('fiveSecondsGame.lobby.join')}
          </Button>
        </div>

        {isMaxPlayersReached && (
          <p className="text-sm text-muted-foreground">
            {t('fiveSecondsGame.lobby.maxPlayersInfo')}
          </p>
        )}
      </div>

      {/* Player List */}
      <div
        className="space-y-3"
        role="list"
        aria-label={t('fiveSecondsGame.lobby.currentPlayers')}
      >
        {players.length === 0
          ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{t('fiveSecondsGame.lobby.noPlayers')}</p>
              </div>
            )
          : (
              players.map(player => (
                <div
                  key={player.id}
                  className={cn(
                    'flex items-center justify-between p-4 bg-secondary rounded-lg border border-border hover:bg-secondary/80',
                    'transition-[background-color] duration-300 ease-(--ease-snappy) origin-center',
                    exiting.includes(player.id)
                    && 'animate-exit [animation-duration:300ms] [animation-timing-function:var(--ease-snappy)] opacity-0 pointer-events-none',
                    entering.includes(player.id)
                    && 'animate-enter [animation-duration:200ms] [animation-timing-function:var(--ease-snappy)]',
                  )}
                  role="listitem"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold flex-shrink-0"
                      aria-hidden="true"
                    >
                      {player.name[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate">{player.name}</p>
                      {player.isHost && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          {t('fiveSecondsGame.lobby.host')}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemovePlayer(player)}
                    aria-label={t('fiveSecondsGame.lobby.removePlayer', { name: player.name })}
                    className="flex-shrink-0"
                  >
                    {t('fiveSecondsGame.lobby.remove')}
                  </Button>
                </div>
              ))
            )}
      </div>
    </Card>
  );
}
