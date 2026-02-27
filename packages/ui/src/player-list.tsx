import { Plus, Trash2, UsersIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { cn } from '.';
import { Badge } from './badge';
import { Button } from './button';
import { Card } from './card';
import { Input } from './input';

export interface PlayerValidationConfig {
  enabled?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  minLengthMessage?: string;
  maxLengthMessage?: string;
  patternMessage?: string;
  requiredMessage?: string;
  duplicateNameMessage?: string;
}

export interface PlayerListConfig {
  showAnimations?: boolean;
  showAvatar?: boolean;
  showHostBadge?: boolean;
  showRemoveButton?: boolean;
  maxPlayers?: number;
  enableValidation?: boolean;
  showAddForm?: boolean;
}

export interface PlayerListProps<T extends { id: string; name?: string; isHost?: boolean }> {
  players: Record<string, T>;
  currentPlayerId?: string;
  hostId?: string;

  onAddPlayer: (name: string) => void;
  onRemovePlayer: (playerId: string) => void;

  config?: PlayerListConfig;
  validation?: PlayerValidationConfig;

  gameSpecificControls?: React.ReactNode;
  renderPlayerItem?: (player: T) => React.ReactNode;
  renderRemoveButton?: (player: T) => React.ReactNode;

  translationNamespace?: string;
}

export function createPlayerNameSchema(
  validation: PlayerValidationConfig,
  t: any,
  translationNamespace: string = 'common',
) {
  const {
    minLength = 2,
    maxLength = 20,
    pattern,
    minLengthMessage,
    maxLengthMessage,
    patternMessage,
  } = validation;

  return z
    .string()
    .trim()
    .min(minLength, minLengthMessage || t(`${translationNamespace}.validation.minLength`, 'Name must be at least 2 characters'))
    .max(maxLength, maxLengthMessage || t(`${translationNamespace}.validation.maxLength`, 'Name must not exceed 20 characters'))
    .regex(pattern || /^[a-z0-9\s\u0600-\u06FF]+$/i, patternMessage || t(`${translationNamespace}.validation.invalidCharacters`, 'Name can only contain letters, numbers, and spaces'));
}

export function PlayerList<T extends { id: string; name?: string; isHost?: boolean }>({
  players,
  hostId,
  onAddPlayer,
  onRemovePlayer,
  config = {},
  validation = {},
  gameSpecificControls,
  renderPlayerItem,
  renderRemoveButton,
  translationNamespace = 'common',
}: PlayerListProps<T>) {
  const { t } = useTranslation();
  const [playerName, setPlayerName] = useState('');
  const [exiting, setExiting] = useState<string[]>([]);
  const [entering, setEntering] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string>('');

  const {
    showAnimations = false,
    showAvatar = true,
    showHostBadge = true,
    showRemoveButton = true,
    maxPlayers,
    enableValidation = true,
    showAddForm = true,
  } = config;

  const orderedPlayers = useMemo(
    () => Object.values(players),
    [players],
  );

  const validatePlayerName = (name: string): boolean => {
    if (!enableValidation) {
      return true;
    }

    const playerNameSchema = createPlayerNameSchema(validation, t, translationNamespace);

    try {
      playerNameSchema.parse(name);

      if (validation.duplicateNameMessage && Object.values(players).some(p => p.name?.toLowerCase() === name.trim().toLowerCase())) {
        setValidationError(validation.duplicateNameMessage);
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

    if (enableValidation && value.trim()) {
      validatePlayerName(value);
    }
    else {
      setValidationError('');
    }
  };

  const handleAddPlayer = () => {
    const trimmedName = playerName.trim();

    if (!trimmedName) {
      if (validation.requiredMessage) {
        setValidationError(validation.requiredMessage);
      }
      return;
    }

    if (maxPlayers && Object.keys(players).length >= maxPlayers) {
      return;
    }

    if (enableValidation && !validatePlayerName(trimmedName)) {
      return;
    }

    onAddPlayer(trimmedName);

    if (showAnimations) {
      setEntering([`player-${Date.now()}`]);
      setTimeout(() => setEntering([]), 200);
    }

    setPlayerName('');
    setValidationError('');
  };

  const handleRemovePlayer = (playerId: string) => {
    if (showAnimations) {
      setExiting([playerId]);
      setTimeout(() => {
        onRemovePlayer(playerId);
        setExiting([]);
      }, 200);
    }
    else {
      onRemovePlayer(playerId);
    }
  };

  // const isHost = (playerId: string) => hostId === playerId;
  const canRemovePlayer = (playerId: string) => {
    if (!showRemoveButton)
      return false;
    return playerId !== hostId;
  };

  const playerCount = Object.keys(players).length;
  const isMaxPlayersReached = maxPlayers ? playerCount >= maxPlayers : false;
  const isAddButtonDisabled = isMaxPlayersReached || !playerName.trim() || !!validationError;

  return (
    <Card className="p-5 space-y-4">
      {renderPlayerItem
        ? renderPlayerItem(orderedPlayers[0])
        : (
            <>
              {/* Header */}
              <div className="flex items-center gap-3">
                <UsersIcon className="w-5 h-5" aria-hidden="true" />
                <h2 className="text-xl font-semibold">
                  {
                    translationNamespace === 'statClashGame'
                      ? t('statClashGame.hotseatSetup.title')
                      : t('fiveSecondsGame.lobby.playersTitle', { count: playerCount, max: maxPlayers })
                  }
                </h2>
              </div>

              {/* Add Player Form */}
              {showAddForm && (
                <div className="flex gap-2">
                  <Input
                    value={playerName}
                    onChange={e => handleInputChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isAddButtonDisabled) {
                        e.preventDefault();
                        handleAddPlayer();
                      }
                    }}
                    placeholder={translationNamespace === 'statClashGame'
                      ? t('statClashGame.hotseatSetup.playerNamePlaceholder')
                      : t('fiveSecondsGame.lobby.enterYourName')}
                    className={cn(enableValidation && validationError && 'border-destructive focus-visible:ring-destructive')}
                    maxLength={validation.maxLength || 20}
                    aria-invalid={!!validationError}
                    disabled={isMaxPlayersReached}
                  />
                  <Button
                    type="button"
                    onClick={handleAddPlayer}
                    disabled={isAddButtonDisabled}
                  >
                    <Plus className="size-4" />
                    {translationNamespace === 'statClashGame'
                      ? t('statClashGame.hotseatSetup.add')
                      : t('fiveSecondsGame.lobby.join')}
                  </Button>
                </div>
              )}

              {/* Validation Error */}
              {showAddForm && enableValidation && validationError && (
                <p className="text-sm text-destructive flex items-center gap-1" role="alert">
                  <span aria-hidden="true">⚠</span>
                  {validationError}
                </p>
              )}

              {/* Max Players Warning */}
              {showAddForm && isMaxPlayersReached && maxPlayers && (
                <p className="text-sm text-muted-foreground">
                  {translationNamespace === 'statClashGame'
                    ? t('statClashGame.lobby.minPlayersRequired')
                    : t('fiveSecondsGame.lobby.maxPlayersInfo')}
                </p>
              )}

              {/* Player List */}
              <div
                className="space-y-2"
                role="list"
                aria-label={t('fiveSecondsGame.lobby.currentPlayers')}
              >
                {orderedPlayers.length === 0
                  ? (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">{t('fiveSecondsGame.lobby.noPlayers')}</p>
                      </div>
                    )
                  : (
                      orderedPlayers.map(player => (
                        <div
                          key={player.id}
                          className={cn(
                            'flex items-center justify-between rounded-md border border-border/70 bg-background/70 px-3 py-2',
                            'transition-[background-color] duration-300 origin-center',
                            showAnimations && exiting.includes(player.id) && 'animate-player-list-exit opacity-0 pointer-events-none',
                            showAnimations && entering.includes(player.id) && 'animate-player-list-enter',
                          )}
                          role="listitem"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {showAvatar && (
                              <div
                                className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold shrink-0 text-sm"
                                aria-hidden="true"
                              >
                                {(player.name || t('statClashGame.gameplay.player'))[0].toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate">{player.name || t('statClashGame.gameplay.player')}</p>
                              {showHostBadge && player.isHost && (
                                <Badge variant="secondary" className="text-xs">
                                  {t('fiveSecondsGame.lobby.host')}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {
                            renderRemoveButton
                              ? (
                                  renderRemoveButton(player)
                                )
                              : (
                                  canRemovePlayer(player.id) && (
                                    <Button
                                      onClick={() => handleRemovePlayer(player.id)}
                                      aria-label={`Remove ${player.name || 'player'}`}
                                      className="shrink-0"
                                    >
                                      <Trash2 className="size-4" />
                                    </Button>
                                  )
                                )
                          }
                        </div>
                      ))
                    )}
              </div>

              {gameSpecificControls}
            </>
          )}
    </Card>
  );
}
