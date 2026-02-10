import type { RoomFlowProps } from '@/features/room/room-flow';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RoomFlow } from '@/features/room/room-flow';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

interface GameRoomModalProps extends Omit<RoomFlowProps, 'onClose'> {
  trigger: React.ReactNode;
}

export function GameRoomModal({ trigger, ...roomFlowProps }: GameRoomModalProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-125 p-6 flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('play-online')}</DialogTitle>
          <DialogDescription>{t('room.dialog.description')}</DialogDescription>
        </DialogHeader>
        <RoomFlow {...roomFlowProps} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
