import { AlertCircle, Earth, Globe, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRoomStats } from './use-room';
import { CopyButton } from './copy-button';

interface RoomStatsHeaderProps {
  mode: string;
  roomId?: string | null;
  onSwitchMode?: (newMode: 'local' | 'multiplayer') => void;
  onOpenRoomDialog?: () => void;
}

export function RoomHeader({
  mode,
  roomId,
  onSwitchMode,
  onOpenRoomDialog,
}: RoomStatsHeaderProps) {
  const { t } = useTranslation();
  const { room, isLoading, isError, error } = useRoomStats({
    mode,
    roomId: roomId ?? undefined,
  });

  if (mode === 'local') {
    return (
      <div className="flex flex-col items-center justify-center gap-2">
        <Badge variant="secondary" className="gap-1.5">
          <Zap className="h-3.5 w-3.5" />
          {t('mode.local')}
        </Badge>
        {onSwitchMode && (
          <Button
            variant="default"
            size="sm"
            onClick={() => onSwitchMode('multiplayer')}
            className="gap-2"
          >
            <Earth className="h-4 w-4" />
            {t('play-online')}
          </Button>
        )}
      </div>
    );
  }

  if (mode === 'multiplayer' && roomId) {
    if (isError) {
      return (
        <Card className="border-destructive/50 bg-destructive/5 p-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
            <span className="text-xs text-destructive">
              {error instanceof Error ? error.message : t('room.error')}
            </span>

            {/* Switch to local actually switches mode */}
            {onSwitchMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSwitchMode('local')}
              >
                {t('play-local')}
              </Button>
            )}

            {/* Optional: keep a way to open the room dialog */}
            {onOpenRoomDialog && (
              <Button variant="ghost" size="sm" onClick={onOpenRoomDialog}>
                {t('room.change')}
              </Button>
            )}
          </div>
        </Card>
      );
    }

    if (isLoading) {
      return (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 animate-pulse">
            <Globe className="h-3.5 w-3.5" />
            {t('room.loading')}
          </Badge>

          {/* Switch to local actually switches mode */}
          {onSwitchMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSwitchMode('local')}
            >
              {t('play-local')}
            </Button>
          )}

          {/* Optional: keep dialog */}
          {onOpenRoomDialog && (
            <Button variant="ghost" size="sm" onClick={onOpenRoomDialog}>
              {t('room.change')}
            </Button>
          )}
        </div>
      );
    }

    if (room) {
      return (
        <Card className="border-primary/20 bg-linear-to-r from-primary/5 to-transparent p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-2">
                {t('mode.online')}
              </p>
              <div className="flex items-center gap-2 mt-2 justify-center">
                <code className="text-2xl font-mono font-bold text-primary px-3 py-1.5 rounded">
                  {roomId}
                </code>

                <CopyButton text={roomId!} />
              </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0">
              <Badge variant="outline" className="justify-center">
                {room.currentPlayers}
                /
                {room.maxPlayers}
              </Badge>
              <Badge
                variant={room.status === 'active' ? 'default' : 'secondary'}
                className="justify-center capitalize"
              >
                {room.status}
              </Badge>

              {/* Switch to local actually switches mode */}
              {onSwitchMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSwitchMode('local')}
                >
                  {t('play-local')}
                </Button>
              )}

              {/* Optional: keep dialog */}
              {onOpenRoomDialog && (
                <Button variant="ghost" size="sm" onClick={onOpenRoomDialog}>
                  {t('room.change')}
                </Button>
              )}
            </div>
          </div>
        </Card>
      );
    }
  }

  return null;
}
