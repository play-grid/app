import { zodResolver } from '@hookform/resolvers/zod';
import { DirectionProvider } from '@radix-ui/react-direction';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCreateRoom } from '@/hooks/use-create-room';
import { getGameTypes } from '@/services/game-type-service';

interface CreateRoomDialogProps {
  onJoinGame: (roomId: string) => void;
}

const createRoomSchema = z.object({
  name: z.string().min(1, 'room-name-required').max(50, 'room-name-too-long'),
  maxPlayers: z.number().int().min(2).max(8),
  gameType: z.enum(['logo-guess']),
  isPrivate: z.boolean(),
});

type CreateRoomFormValues = z.infer<typeof createRoomSchema>;

export function CreateRoomDialog({ onJoinGame }: CreateRoomDialogProps) {
  const { t, i18n } = useTranslation();
  const { mutate, data: room, isPending, isError } = useCreateRoom();
  const [joinRoomId, setJoinRoomId] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateRoomFormValues>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      name: '',
      maxPlayers: 4,
      gameType: 'logo-guess',
      isPrivate: false,
    },
  });

  const { data: gameTypes, isLoading: isLoadingGameTypes, isError: isErrorGameTypes } = useQuery({
    queryKey: ['gameTypes'],
    queryFn: getGameTypes,
  });

  const roomUrl = room ? `${window.location.origin}/game/${room.id}` : '';
  const isRTL = i18n.language === 'ar';

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  function handleJoinGame() {
    if (joinRoomId.trim()) {
      onJoinGame(joinRoomId.trim());
    }
  }

  const onSubmit = (values: CreateRoomFormValues) => {
    mutate(values);
  };

  return (
    <DirectionProvider dir={isRTL ? 'rtl' : 'ltr'}>
      <Dialog>
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
              {isPending || isLoadingGameTypes
                ? (
                    <p>{t('creating-room')}</p>
                  )
                : isErrorGameTypes
                  ? (
                      <p className="text-red-500">{t('failed-to-load-game-types')}</p>
                    )
                  : room
                    ? (
                        <div className="space-y-4">
                          <p>{t('room-created')}</p>
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
                          <div>
                            <Select
                              value={watch('gameType')}
                              onValueChange={value => setValue('gameType', value as 'logo-guess')}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder={t('select-game-type')} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectLabel>{t('game-type')}</SelectLabel>
                                  {gameTypes?.map(type => (
                                    <SelectItem key={type.id} value={type.id}>
                                      {type.name}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                            {errors.gameType && <p className="text-red-500 text-sm mt-1">{errors.gameType.message}</p>}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="isPrivate"
                              checked={watch('isPrivate')}
                              onCheckedChange={checked => setValue('isPrivate', Boolean(checked))}
                            />
                            <Label htmlFor="isPrivate">{t('private-room')}</Label>
                          </div>
                          <Button type="submit">{t('create-room')}</Button>
                        </form>
                      )}
            </TabsContent>
            <TabsContent value="join-room">
              <div className="space-y-4">
                <Label htmlFor="join-room-id">{t('enter-room-code')}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="join-room-id"
                    type="text"
                    placeholder={t('enter-room-code')}
                    value={joinRoomId}
                    onChange={e => setJoinRoomId(e.target.value)}
                  />
                  <Button onClick={handleJoinGame}>{t('join')}</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </DirectionProvider>
  );
}
