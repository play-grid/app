import { useTranslation } from 'react-i18next';
import BackButton from '@/components/back-button';
import { Button } from '@/components/ui/button';
import { useFiveSecondsStore } from '../store';
import { GameSettings } from './game-settings';
import { PlayerList } from './player-list';

export function FiveSecondsLobby() {
  const { t } = useTranslation();
  const startGame = useFiveSecondsStore(s => s.startGame);
  const canStartGame = useFiveSecondsStore(s => s.canStartGame());

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <BackButton />
      <h1 className="text-3xl font-bold text-center">{t('five-seconds-game')}</h1>
      <PlayerList />
      <GameSettings />
      <Button onClick={startGame} disabled={!canStartGame} className="w-full">
        {t('start-game')}
      </Button>
    </div>
  );
}
