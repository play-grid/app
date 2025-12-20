import { AlertCircle, Globe, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CopyButton } from './copy-button';
import { useRoomStats } from './use-room';

interface RoomStatsHeaderProps {
  mode: string;
  roomId?: string | null;
}

export function RoomHeader({
  mode,
  roomId,
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
            </div>
          </div>
        </Card>
      );
    }
  }

  return null;
}
