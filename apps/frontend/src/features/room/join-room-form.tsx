import type { JoinRoomFormValues } from '@guess-logo/api/schemas';
import type { Room } from '@guess-logo/shared/schemas';
import { joinRoomFormSchema } from '@guess-logo/api/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSession } from '@/hooks/auth-hooks';
import { useJoinRoom } from './use-room';

interface JoinRoomFormProps {
  gameType: string;
  onRoomJoined: (room: Room) => void;
  onDialogClose: () => void;
}

function extractRoomId(value: string): string {
  try {
    const url = new URL(value);
    const roomIdInQuery = url.searchParams.get('room');
    if (roomIdInQuery) {
      return roomIdInQuery;
    }
  }
  catch {
  }
  return value.trim();
}

export function JoinRoomForm({ gameType, onRoomJoined, onDialogClose }: JoinRoomFormProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useSession();

  const { mutate: joinRoom, isError: isJoiningError } = useJoinRoom({
    onSuccess: (room: Room) => {
      onRoomJoined(room);
      onDialogClose();
      const lang = i18n.language;
      navigate(`/${lang}/${gameType}?mode=multiplayer&room=${room.id}&host=false`);
    },
  });

  const joinForm = useForm<JoinRoomFormValues>({
    resolver: zodResolver(joinRoomFormSchema),
    defaultValues: {
      playerName: user?.name || '',
      roomId: searchParams.get('room') || '',
    },
  });

  const handleJoinSubmit = (values: JoinRoomFormValues) => {
    const roomId = extractRoomId(values.roomId);
    joinRoom({ roomId, playerName: values.playerName });
  };

  return (
    <form onSubmit={joinForm.handleSubmit(handleJoinSubmit)} className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 space-y-4 overflow-y-auto min-h-0">
        <div className="space-y-2">
          <Label htmlFor="player-name">{t('your-name')}</Label>
          <Input
            id="player-name"
            type="text"
            placeholder={t('your-name-placeholder')}
            {...joinForm.register('playerName')}
          />
          {joinForm.formState.errors.playerName && (
            <p className="text-red-500 text-sm">{t(joinForm.formState.errors.playerName.message as string)}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="join-room-id">{t('enter-room-code')}</Label>
          <Input
            id="join-room-id"
            type="text"
            placeholder={t('enter-room-code-or-link')}
            {...joinForm.register('roomId')}
            className="font-mono"
          />
          {joinForm.formState.errors.roomId && (
            <p className="text-red-500 text-sm">{t(joinForm.formState.errors.roomId.message as string)}</p>
          )}
        </div>
      </div>
      <div className="mt-4 pt-4">
        <Button type="submit" className="w-full">
          {t('join')}
        </Button>
        {isJoiningError && (
          <p className="text-red-500 text-sm text-center mt-2">{t('join-room-error')}</p>
        )}
      </div>
    </form>
  );
}
