import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCreateRoom } from '@/hooks/use-create-room';

interface CreateRoomDialogProps {
  onJoinGame: (roomId: string) => void;
}

export function CreateRoomDialog({ onJoinGame }: CreateRoomDialogProps) {
  const { t } = useTranslation();
  const { mutate, data: room, isPending, isError } = useCreateRoom();
  const [joinRoomId, setJoinRoomId] = useState('');

  const roomUrl = room ? `${window.location.origin}/game/${room.roomId}` : '';

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  function handleJoinGame() {
    if (joinRoomId.trim()) {
      onJoinGame(joinRoomId.trim());
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-1/2" size="lg">
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
                          <Input id="room-id" value={room.roomId} readOnly />
                          <Button onClick={() => copyToClipboard(room.roomId)}>{t('copy-code')}</Button>
                        </div>
                      </div>
                    </div>
                  )
                : (
                    <Button onClick={() => mutate()}>{t('create-room')}</Button>
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
  );
}
