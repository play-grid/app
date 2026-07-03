import {
  useFiveSecondsActions,
  useFiveSecondsState,
} from '@playgrid/five-seconds';
import { UsersIcon } from '@playgrid/ui/icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';
import { useRoomPermissions } from '@/context/room-permissions';
import { useCurrentUserId } from '@/features/room/use-player-identity';
import { useGameMode } from '@/hooks/use-game-mode';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';

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
  const { players } = useFiveSecondsState();
  const { addPlayer, removePlayer } = useFiveSecondsActions();
  const permissions = useRoomPermissions(players);
  const { isMultiplayer } = useGameMode();
  const currentUserId = useCurrentUserId();

  const [playerName, setPlayerName] = useState('');
  const [exiting, setExiting] = useState<string[]>([]);
  const [entering, setEntering] = useState<string[]>([]);

  const [validationError, setValidationError] = useState<string>('');

  const isNotCurrentUser = (playerId: string) => {
    if (!isMultiplayer)
      return true;
    return playerId !== currentUserId;
  };

  const validatePlayerName = (name: string): boolean => {
    const playerNameSchema = createPlayerNameSchema(t);

    try {
      playerNameSchema.parse(name);

      // Check for duplicate names
      if (Object.values(players).some(p => p.name.toLowerCase() === name.trim().toLowerCase())) {
        setValidationError(t('fiveSecondsGame.lobby.nameAlreadyExists'));
        return false;
      }

      setValidationError('');
      return true;
    }
    catch (error) {
      if (error instanceof z.ZodError) {
        setValidationError(error.issues[0].message);
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

    if (Object.keys(players).length >= MAX_PLAYERS) {
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
          addPlayer(player); // Use the addPlayer action from the new hooks
          setEntering([player.id]); // Animate when undoing
          setTimeout(() => setEntering([]), 200);
        },
      },
    });
  };

  const isMaxPlayersReached = Object.keys(players).length >= MAX_PLAYERS;
  const isAddButtonDisabled
    = isMaxPlayersReached || !playerName.trim() || !!validationError;

  return (
    <Card className="p-6 space-y-6 min-w-0">
      {/* Header */}
      <div className="flex items-center gap-3">
        <UsersIcon className="w-6 h-6" aria-hidden="true" />
        <h2 className="text-2xl font-bold">
          {t('fiveSecondsGame.lobby.playersTitle', {
            count: Object.keys(players).length,
            max: MAX_PLAYERS,
          })}
        </h2>
      </div>

      {/* Add Player Form - Only show for host in multiplayer or for everyone in local mode */}
      {!isMultiplayer && (
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
      )}

      {/* Player List */}
      <div
        className="space-y-3"
        role="list"
        aria-label={t('fiveSecondsGame.lobby.currentPlayers')}
      >
        {Object.keys(players).length === 0
          ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{t('fiveSecondsGame.lobby.noPlayers')}</p>
              </div>
            )
          : (
              Object.values(players).map(player => (
                <div
                  key={player.id}
                  className={cn(
                    'flex items-center justify-between p-4',
                    'transition-[background-color] duration-300 origin-center',
                    exiting.includes(player.id) && 'animate-player-list-exit opacity-0 pointer-events-none',
                    entering.includes(player.id) && 'animate-player-list-enter',
                  )}
                  role="listitem"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold shrink-0"
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

                  {(permissions.canKickPlayers && isNotCurrentUser(player.id)) && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemovePlayer(player)}
                      aria-label={t('fiveSecondsGame.lobby.removePlayer', { name: player.name })}
                      className="shrink-0"
                    >
                      {t('fiveSecondsGame.lobby.remove')}
                    </Button>
                  )}

                  {!permissions.canKickPlayers && isNotCurrentUser(player.id) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast.info('Vote to kick feature coming soon')}
                      aria-label={`Vote to kick ${player.name}`}
                      className="shrink-0"
                    >
                      Vote to Kick
                    </Button>
                  )}
                </div>
              ))
            )}
      </div>
    </Card>
  );
}
