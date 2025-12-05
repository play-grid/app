import type { CreateRoomFormValues } from '@guess-logo/api/schemas';
import type { Room } from '@guess-logo/shared/schemas';
import type { ReactNode } from 'react';
import { createGameRoomBaseSchema } from '@guess-logo/api/schemas';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { DirectionProvider } from '@radix-ui/react-direction';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCreateRoom, useJoinRoom } from './use-room';

interface CreateOrJoinRoomDialogProps {
  gameType: string;
  gameSettings: Record<string, unknown>;
  renderGameSettings?: ReactNode;
  onRoomCreated: (room: Room) => void;
  onRoomJoined: (room: Room) => void;
}

export function CreateOrJoinRoomDialog({
  gameType,
  gameSettings,
  renderGameSettings,
  onRoomCreated,
  onRoomJoined,
}: CreateOrJoinRoomDialogProps) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const { mutate: createRoom, data: room, isPending, isError } = useCreateRoom({
    onSuccess: (room) => {
      onRoomCreated(room);
      setOpen(false);
    },
  });
  const { mutate: joinRoom, isPending: isJoining, isError: isJoiningError } = useJoinRoom({
    onSuccess: (room) => {
      onRoomJoined(room);
      setOpen(false);
    },
  });
  const [joinRoomId, setJoinRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm<CreateRoomFormValues>({
    resolver: standardSchemaResolver(createGameRoomBaseSchema),
    defaultValues: {
      name: '',
      maxPlayers: 4,
      gameType,
      isPrivate: false,
    },
  });

  const roomUrl = room ? `${window.location.origin}/game/${room.id}` : '';
  const isRTL = i18n.language === 'ar';

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  function handleJoinGame() {
    if (joinRoomId.trim() && playerName.trim()) {
      joinRoom({ roomId: joinRoomId.trim(), playerName: playerName.trim() });
    }
  }

  const onSubmit = (values: CreateRoomFormValues) => {
    const roomData = {
      ...values,
      ...gameSettings,
      gameType,
    };
    createRoom(roomData);
  };

  const isPrivate = useWatch({
    control,
    name: 'isPrivate',
    defaultValue: false,
  });
  return (
    <DirectionProvider dir={isRTL ? 'rtl' : 'ltr'}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-1/2 " size="lg">
            {t('play-online')}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('play-online')}</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="create-room">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create-room">{t('create-room')}</TabsTrigger>
              <TabsTrigger value="join-room">{t('join-room')}</TabsTrigger>
            </TabsList>
            <TabsContent value="create-room">
              {isError && <p className="text-red-500">{t('create-room-error')}</p>}
              {isPending
                ? (
                    <p>{t('creating-room')}</p>
                  )
                : room
                  ? (
                      <div className="space-y-4">
                        <p>{t('room-created')}</p>
                        {renderGameSettings}
                        <div>
                          <Label htmlFor="room-url">{t('room-url')}</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Input id="room-url" value={roomUrl} readOnly />
                            <Button onClick={() => copyToClipboard(roomUrl)}>{t('copy-url')}</Button>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="room-id">{t('room-code')}</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Input id="room-id" value={room.id} readOnly />
                            <Button onClick={() => copyToClipboard(room.id)}>{t('copy-code')}</Button>
                          </div>
                        </div>
                      </div>
                    )
                  : (
                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">{t('room-name')}</Label>
                          <Input
                            id="name"
                            type="text"
                            placeholder={t('room-name-placeholder')}
                            {...register('name')}
                          />
                          {errors.name && <p className="text-red-500 text-sm mt-1">{t(errors.name.message as string)}</p>}
                        </div>

                        {renderGameSettings}

                        <div className="space-y-2">
                          <Label htmlFor="maxPlayers">{t('max-players')}</Label>
                          <Input
                            id="maxPlayers"
                            type="number"
                            {...register('maxPlayers', { valueAsNumber: true })}
                            min={2}
                            max={8}
                          />
                          {errors.maxPlayers && <p className="text-red-500 text-sm mt-1">{errors.maxPlayers.message}</p>}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="isPrivate"
                            checked={isPrivate}
                            onCheckedChange={checked => setValue('isPrivate', Boolean(checked))}
                          />
                          <Label htmlFor="isPrivate">{t('private-room')}</Label>
                        </div>
                        <Button type="submit">{t('create-room')}</Button>
                      </form>
                    )}
            </TabsContent>
            <TabsContent value="join-room">
              {/* TODO refactor this to use RHF with shared zod schema this is temporary */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="player-name">{t('your-name')}</Label>
                  <Input
                    id="player-name"
                    type="text"
                    placeholder={t('your-name-placeholder')}
                    value={playerName}
                    onChange={e => setPlayerName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="join-room-id">{t('enter-room-code')}</Label>
                  <div className="flex items-.center gap-2">
                    <Input
                      id="join-room-id"
                      type="text"
                      placeholder={t('enter-room-code')}
                      value={joinRoomId}
                      onChange={e => setJoinRoomId(e.target.value)}
                    />
                    <Button onClick={handleJoinGame} disabled={isJoining}>
                      {isJoining ? t('joining...') : t('join')}
                    </Button>
                  </div>
                  {isJoiningError && <p className="text-red-500">{t('join-room-error')}</p>}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </DirectionProvider>
  );
}
