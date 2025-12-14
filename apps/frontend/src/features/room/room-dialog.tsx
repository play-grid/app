import type { CreateRoomFormValues } from '@guess-logo/api/schemas';
import type { Room } from '@guess-logo/shared/schemas';
import type { ReactNode } from 'react';
import { createGameRoomBaseSchema } from '@guess-logo/api/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { DirectionProvider } from '@radix-ui/react-direction';
import { Check, Copy, Globe, Lock } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AltArrowLeftIcon, AltArrowRightIcon } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSession } from '@/hooks/auth-hooks';
import { cn } from '@/lib/utils';
import { CopyButton } from './copy-button';
import { JoinRoomForm } from './join-room-form';
import { useCreateRoom } from './use-room';

function generateRandomRoomName(t: any) {
  const nameParts = t('randomRoomNames', { returnObjects: true });
  if (
    nameParts
    && typeof nameParts === 'object'
    && 'adjectives' in nameParts
    && 'nouns' in nameParts
    && Array.isArray(nameParts.adjectives)
    && Array.isArray(nameParts.nouns)
    && nameParts.adjectives.length > 0
    && nameParts.nouns.length > 0
  ) {
    const adj = nameParts.adjectives[Math.floor(Math.random() * nameParts.adjectives.length)];
    const noun = nameParts.nouns[Math.floor(Math.random() * nameParts.nouns.length)];
    return `${adj} ${noun}`;
  }
  return t('default-room-name');
}

interface RoomDialogProps {
  gameType: string;
  gameSettings: Record<string, unknown>;
  renderGameSettings?: ReactNode;
  onRoomCreated: (room: Room) => void;
  onRoomJoined: (room: Room) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RoomDialog({
  gameType,
  gameSettings,
  renderGameSettings,
  onRoomCreated,
  onRoomJoined,
  open,
  onOpenChange,
}: RoomDialogProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useSession();

  // State for multi-step form
  const [createStep, setCreateStep] = useState(1);
  const [copied, setCopied] = useState<'url' | null>(null);

  const randomRoomName = useMemo(() => generateRandomRoomName(t), [t]);

  const { mutate: createRoom, data: room, isPending, isError } = useCreateRoom({
    onSuccess: (room) => {
      onRoomCreated(room);
    },
  });

  const createForm = useForm<CreateRoomFormValues>({
    resolver: zodResolver(createGameRoomBaseSchema),
    defaultValues: {
      name: randomRoomName,
      maxPlayers: 4,
      gameType,
      isPrivate: false,
      hostPlayerName: user?.name || '',
    },
  });

  const roomUrl = room ? `${window.location.origin}/${i18n.language}/${gameType}?mode=multiplayer&room=${room.id}` : '';
  const isRTL = i18n.language === 'ar';

  const handleCopy = async (text: string, type: 'url') => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCreateSubmit = (values: CreateRoomFormValues) => {
    if (createStep === 1) {
      setCreateStep(2);
      return;
    }

    const roomData = {
      ...values,
      ...gameSettings,
      gameType,
    };
    createRoom(roomData);
  };

  // const handleBackInCreate = () => {
  //   if (createStep === 2 && !room) {
  //     setCreateStep(1);
  //   }
  // };

  const handleDialogClose = (open: boolean) => {
    if (!open && !room) {
      setCreateStep(1);
      createForm.reset({
        name: generateRandomRoomName(t),
        maxPlayers: 4,
        gameType,
        isPrivate: false,
        hostPlayerName: user?.name || '',
      });
    }
    onOpenChange(open);
  };

  const isPrivate = useWatch({
    control: createForm.control,
    name: 'isPrivate',
    defaultValue: false,
  });

  const maxPlayers = useWatch({
    control: createForm.control,
    name: 'maxPlayers',
    defaultValue: 4,
  });

  return (
    <DirectionProvider dir={isRTL ? 'rtl' : 'ltr'}>
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[500px] p-6 flex flex-col min-h-[66vh]">
          <DialogHeader>
            <DialogTitle>{t('play-online')}</DialogTitle>
            <DialogDescription>{t('room.dialog.description')}</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="create-room" className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create-room">{t('create-room')}</TabsTrigger>
              <TabsTrigger value="join-room">{t('join-room')}</TabsTrigger>
            </TabsList>

            {/* CREATE ROOM TAB */}
            <TabsContent value="create-room" className="flex-1 flex flex-col mt-4 min-h-0">
              {isError && <p className="text-red-500 text-sm mb-4">{t('create-room-error')}</p>}

              {isPending
                ? (
                    <>
                      <div className="shrink-0 h-12"></div>

                      {/* Loading content */}
                      <div className="flex-1 flex items-center justify-center">
                        <Spinner />
                      </div>

                      {/* Placeholder for button area to maintain consistent height */}
                      <div className="mt-4 pt-4 h-16"></div>
                    </>
                  )
                : room
                  ? (
                      <div className="space-y-4">
                        {/* Success State - kept as is */}
                        <div className="text-center py-4">
                          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                            <Check className="w-6 h-6 text-green-600" />
                          </div>
                          <p className="font-semibold text-primary text-lg">{t('room-created')}</p>
                          <p className="text-sm text-muted-foreground">{t('share-code-with-players')}</p>
                        </div>
                        {renderGameSettings && (
                          <div className="space-y-2">
                            {renderGameSettings}
                          </div>
                        )}
                        <div className="space-y-3">
                          <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-4">
                            <Label htmlFor="room-code" className="text-sm font-medium mb-2 block">
                              {t('room-code')}
                            </Label>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 text-2xl font-bold font-mono text-primary">
                                {room.id}
                              </code>
                              <CopyButton text={room.id} variant="outline" />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="room-url" className="text-sm font-medium mb-2 block">
                              {t('room-url')}
                            </Label>
                            <div
                              className="relative group bg-primary/5 border-2 border-primary/20 rounded-lg p-4 cursor-pointer hover:bg-primary/10 hover:border-primary/30 transition-all duration-200 active:scale-[0.99]"
                              onClick={() => handleCopy(roomUrl, 'url')}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span className="font-mono text-sm text-primary truncate flex-1">
                                  {roomUrl}
                                </span>
                                <div className="shrink-0">
                                  {copied === 'url'
                                    ? (
                                        <div className="flex items-center gap-1.5 text-green-600 animate-in fade-in duration-200">
                                          <Check className="h-4 w-4" />
                                          <span className="text-xs font-medium">{t('copied')}</span>
                                        </div>
                                      )
                                    : (
                                        <div className="flex items-center gap-1.5 text-muted-foreground group-hover:text-primary transition-colors">
                                          <Copy className="h-4 w-4" />
                                          <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                            {t('copy-url')}
                                          </span>
                                        </div>
                                      )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            handleDialogClose(false);
                            const lang = i18n.language;
                            navigate(`/${lang}/${gameType}?mode=multiplayer&room=${room.id}&host=true`);
                          }}
                          className="w-full"
                        >
                          {t('start-game')}
                        </Button>
                      </div>
                    )
                  : (
                      <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="flex flex-col flex-1 min-h-0">
                        {/* Step indicator - fixed at top */}
                        <div className="shrink-0 space-y-2 mb-4">
                          <div className="flex flex-col items-start text-sm">
                            {/* {createStep === 2 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleBackInCreate}
                                className="h-auto p-2 text-muted-foreground hover:text-foreground"
                              >
                                {t('common.back')}
                              </Button>
                            )} */}
                            <span className="text-muted-foreground ml-auto">
                              {t('step')}
                              {' '}
                              {createStep}
                              {' '}
                              {t('of')}
                              {' '}
                              2
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <div
                              className={cn(
                                'flex-1 h-1 rounded-full cursor-pointer transition-colors',
                                createStep >= 1 ? 'bg-primary hover:bg-primary/70' : 'bg-muted',
                              )}
                              onClick={() => setCreateStep(1)}
                            />
                            <button
                              type="submit"
                              className={cn(
                                'flex-1 h-1 rounded-full cursor-pointer transition-colors',
                                createStep >= 2 ? 'bg-primary hover:bg-primary/70' : 'bg-muted',
                              )}
                            />
                          </div>
                        </div>
                        <div className="flex-1 overflow-y-auto min-h-0 px-2">
                          {/* STEP 1: Basic Info */}
                          {createStep === 1 && (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="name">{t('room-name')}</Label>
                                <Input
                                  id="name"
                                  type="text"
                                  placeholder={t('room-name-placeholder')}
                                  {...createForm.register('name')}
                                />
                                {createForm.formState.errors.name && (
                                  <p className="text-red-500 text-sm">{t(createForm.formState.errors.name.message as string)}</p>
                                )}
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="host-player-name">{t('your-name')}</Label>
                                <Input
                                  id="host-player-name"
                                  type="text"
                                  placeholder={t('your-name-placeholder')}
                                  {...createForm.register('hostPlayerName')}
                                />
                                {createForm.formState.errors.hostPlayerName && (
                                  <p className="text-red-500 text-sm">{t(createForm.formState.errors.hostPlayerName.message as string)}</p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* STEP 2: Settings */}
                          {createStep === 2 && (
                            <div className="space-y-4">
                              {renderGameSettings}
                              <div className="space-y-2">
                                <Label htmlFor="maxPlayers">{t('max-players')}</Label>
                                <div className="grid grid-cols-4 gap-2">
                                  {[2, 4, 6, 8].map(num => (
                                    <Button
                                      key={num}
                                      type="button"
                                      variant={maxPlayers === num ? 'default' : 'outline'}
                                      onClick={() => createForm.setValue('maxPlayers', num)}
                                      className="w-full"
                                    >
                                      {num}
                                    </Button>
                                  ))}
                                </div>
                                {createForm.formState.errors.maxPlayers && (
                                  <p className="text-red-500 text-sm">{t(createForm.formState.errors.maxPlayers.message as string)}</p>
                                )}
                              </div>

                              <div className="space-y-3">
                                <Label>{t('room-privacy')}</Label>
                                <ItemGroup className="space-y-2">
                                  <Item
                                    variant="outline"
                                    className={cn(
                                      'cursor-pointer items-start transition-all hover:bg-accent hover:border-primary/50',
                                      !isPrivate ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border',
                                    )}
                                    onClick={() => createForm.setValue('isPrivate', false)}
                                  >
                                    <ItemContent>
                                      <ItemTitle className="flex items-center gap-2">
                                        <Globe className="w-4 h-4" />
                                        {t('public-room')}
                                      </ItemTitle>
                                      <ItemDescription>
                                        {t('public-room-desc')}
                                      </ItemDescription>
                                    </ItemContent>
                                  </Item>

                                  {/* Private Room Item */}
                                  <Item
                                    variant="outline"
                                    className={cn(
                                      'cursor-pointer items-start transition-all hover:bg-accent hover:border-primary/50',
                                      isPrivate ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border',
                                    )}
                                    onClick={() => createForm.setValue('isPrivate', true)}
                                  >
                                    <ItemContent>
                                      <ItemTitle className="flex items-center gap-2">
                                        <Lock className="w-4 h-4" />
                                        {t('private-room')}
                                      </ItemTitle>
                                      <ItemDescription>
                                        {t('private-room-desc')}
                                      </ItemDescription>
                                    </ItemContent>
                                  </Item>
                                </ItemGroup>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="shrink-0 mt-4 pt-4">
                          <Button type="submit" className="w-full" disabled={isPending}>
                            {createStep === 1
                              ? (
                                  <>
                                    {t('common.next')}
                                    {isRTL ? <AltArrowLeftIcon className="h-4 w-4 rtl:mr-2 ml-2" /> : <AltArrowRightIcon className="h-4 w-4 rtl:mr-2 ml-2" />}
                                  </>
                                )
                              : (
                                  t('create-room')
                                )}
                          </Button>
                        </div>
                      </form>
                    )}
            </TabsContent>

            {/* JOIN ROOM TAB */}
            <TabsContent value="join-room" className="flex-1 flex flex-col mt-4 min-h-0">
              <JoinRoomForm
                gameType={gameType}
                onRoomJoined={onRoomJoined}
                onDialogClose={() => onOpenChange(false)}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </DirectionProvider>
  );
}
