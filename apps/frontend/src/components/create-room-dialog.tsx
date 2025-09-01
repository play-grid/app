import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useCreateRoom } from '@/hooks/use-create-room';

export function CreateRoomDialog() {
  const { t } = useTranslation();
  const { mutate, data: room, isPending, isError } = useCreateRoom();

  function copyRoomId() {
    if (room) {
      navigator.clipboard.writeText(room.roomId);
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
          <DialogTitle>{t('create-game-room')}</DialogTitle>
        </DialogHeader>
        {isError && <p className="text-red-500">{t('create-room-error')}</p>}
        {isPending
          ? (
              <p>{t('creating-room')}</p>
            )
          : room
            ? (
                <div>
                  <p>{t('room-created')}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Input value={room.roomId} readOnly />
                    <Button onClick={copyRoomId}>{t('copy-id')}</Button>
                  </div>
                </div>
              )
            : (
                <Button onClick={() => mutate()}>{t('create-room')}</Button>
              )}
      </DialogContent>
    </Dialog>
  );
}
