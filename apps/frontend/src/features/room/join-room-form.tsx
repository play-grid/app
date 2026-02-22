import type { JoinRoomFormValues } from '@guess-logo/api/schemas';
import type { Room } from '@guess-logo/shared/schemas';
import { joinRoomFormSchema } from '@guess-logo/api/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSession } from '@/hooks/auth-hooks';
// TODO: update these to work in all games
import { Button } from '../../games/five-seconds/components/ui/button';
import { Input } from '../../games/five-seconds/components/ui/input';
import { Label } from '../../games/five-seconds/components/ui/label';
import { joinGameRoom } from './room-service';
import { useValidateInvite } from './use-room';

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

function extractInviteToken(value: string): string | undefined {
  try {
    const url = new URL(value);
    const inviteToken = url.searchParams.get('invite');
    if (inviteToken) {
      return inviteToken;
    }
  }
  catch {
  }
  return undefined;
}

export function JoinRoomForm({ gameType, onRoomJoined, onDialogClose }: JoinRoomFormProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useSession();
  const [_, setIsValidatingInvite] = useState(false);

  const inviteFromUrl = searchParams.get('invite');
  const roomIdFromUrl = searchParams.get('room');

  const { isValid: isInviteValid } = useValidateInvite({
    roomId: roomIdFromUrl,
    token: inviteFromUrl,
  });

  const inviteToken = (inviteFromUrl && roomIdFromUrl && isInviteValid) ? inviteFromUrl : undefined;

  const { mutate: joinGameRoomMutation, isError: isJoiningError } = useMutation({
    mutationFn: async ({ roomId, playerName, inviteToken }: { roomId: string; playerName: string; inviteToken?: string }) => {
      return joinGameRoom(roomId, { playerName, inviteToken });
    },
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

  const handleJoinSubmit = async (values: JoinRoomFormValues) => {
    const roomId = extractRoomId(values.roomId);
    const extractedInviteToken = extractInviteToken(values.roomId) || inviteToken;
    setIsValidatingInvite(true);
    joinGameRoomMutation({ roomId, playerName: values.playerName, inviteToken: extractedInviteToken });
    setIsValidatingInvite(false);
  };

  return (
    <form onSubmit={joinForm.handleSubmit(handleJoinSubmit)} className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 space-y-4 overflow-y-auto min-h-0 p-3">
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
