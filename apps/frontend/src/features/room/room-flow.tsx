import type { CreateRoomFormValues } from '@playgrid/api/schemas';
import type { Room } from '@playgrid/shared/schemas';
import type { ReactNode } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { createGameRoomBaseSchema } from '@playgrid/api/schemas';
import { AltArrowLeftIcon, AltArrowRightIcon } from '@playgrid/ui/icons';
import { DirectionProvider } from '@radix-ui/react-direction';
import { Check, ChevronDown, Copy, Globe, Lock } from 'lucide-react';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CopyButton } from '@/components/copy-button';
import { QRCodeDisplay } from '@/components/qrcode-display';
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSession } from '@/hooks/auth-hooks';
import { cn } from '@/lib/utils';
import { Button } from '../../games/five-seconds/components/ui/button';
import { Input } from '../../games/five-seconds/components/ui/input';
import { Label } from '../../games/five-seconds/components/ui/label';
import { Spinner } from '../../games/five-seconds/components/ui/spinner';
import { JoinRoomForm } from './join-room-form';
import { useCreateRoom } from './use-room';

export interface RoomFlowProps {
  gameType: string;
  gameSettings: Record<string, unknown>;
  renderGameSettings?: ReactNode;
  onRoomCreated: (room: Room) => void;
  onRoomJoined: (room: Room) => void;
  onClose: () => void;
  defaultTab?: 'create-room' | 'join-room';
}

export function RoomFlow({
  gameType,
  gameSettings,
  renderGameSettings,
  onRoomCreated,
  onRoomJoined,
  onClose,
  defaultTab = 'create-room',
}: RoomFlowProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useSession();

  // State for multi-step form
  const [createStep, setCreateStep] = useState(1);
  const [copied, setCopied] = useState<'url' | null>(null);
  const [advancedOptionsOpen, setAdvancedOptionsOpen] = useState(false);

  const { mutate: createRoom, data: room, isPending, isError } = useCreateRoom({
    onSuccess: (room) => {
      onRoomCreated(room);
    },
  });

  const createForm = useForm<CreateRoomFormValues>({
    resolver: zodResolver(createGameRoomBaseSchema),
    defaultValues: {
      name: '',
      maxPlayers: 4,
      gameType,
      isPrivate: false,
      hostPlayerName: user?.name || '',
    },
  });

  const roomUrl = room
    ? room.inviteToken
      ? `${window.location.origin}/${i18n.language}/play/${gameType}?mode=multiplayer&room=${room.id}&invite=${(room as any).inviteToken}`
      : `${window.location.origin}/${i18n.language}/play/${gameType}?mode=multiplayer&room=${room.id}`
    : '';
  const inviteExpiresAt = room?.inviteExpiresAt;
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
      name: values.name ?? '',
      ...gameSettings,
      gameType,
    };
    createRoom(roomData);
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
      <Tabs defaultValue={defaultTab} className="flex-1 flex flex-col min-h-0">
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
                    <Spinner className="text-foreground" />
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
                      <div className="w-12 h-12 bg-green-100 flex items-center justify-center mx-auto mb-3">
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
                      <div className="bg-primary/5 border-2 border-primary/20 p-4">
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
                        <div className="flex gap-2">
                          <div
                            className="relative group bg-primary/5 border-2 border-primary/20 p-4 cursor-pointer hover:bg-primary/10 hover:border-primary/30 transition-all duration-200 active:scale-[0.99] flex-1"
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
                          <QRCodeDisplay inviteUrl={roomUrl} expiresAt={inviteExpiresAt} />
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        onClose();
                        const lang = i18n.language;
                        navigate(`/${lang}/play/${gameType}?mode=multiplayer&room=${room.id}&host=true`);
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
                            'flex-1 h-1 cursor-pointer transition-colors',
                            createStep >= 1 ? 'bg-primary hover:bg-primary/70' : 'bg-muted',
                          )}
                          onClick={() => setCreateStep(1)}
                        />
                        <button
                          type="submit"
                          className={cn(
                            'flex-1 h-1 cursor-pointer transition-colors',
                            createStep >= 2 ? 'bg-primary hover:bg-primary/70' : 'bg-muted',
                          )}
                        />
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto min-h-0 px-3 py-3">
                      {/* STEP 1: Basic Info */}
                      {createStep === 1 && (
                        <div className="space-y-4">
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

                          <Button
                            type="button"
                            variant="ghost"
                            className="flex items-center gap-2 text-muted-foreground -ml-2"
                            onClick={() => setAdvancedOptionsOpen(!advancedOptionsOpen)}
                          >
                            <span>{t('room.advanced-options')}</span>
                            <ChevronDown className={`h-4 w-4 transition-transform ${advancedOptionsOpen ? 'rotate-180' : ''}`} />
                          </Button>

                          {advancedOptionsOpen && (
                            <div className="space-y-4 border-l-2 pl-4 ml-1 border-dashed">
                              <div className="space-y-2">
                                <Label htmlFor="name">{t('room-title-optional')}</Label>
                                <p className="text-sm text-muted-foreground">{t('leave-empty-to-start')}</p>
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
            onDialogClose={onClose}
          />
        </TabsContent>
      </Tabs>
    </DirectionProvider>
  );
}
