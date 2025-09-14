import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export function GameRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { t } = useTranslation();

  // eslint-disable-next-line no-console
  console.log('roomId:', roomId, 'typeof roomId:', typeof roomId);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">{t('welcome-to-game-room')}</h1>
        <p className="text-lg">
          {t('room-id')}
          {roomId}
        </p>
        <p className="mt-4">{t('online-gameplay-coming-soon')}</p>
      </div>
    </div>
  );
}
