import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFiveSecondsSounds } from '../hooks/use-five-seconds-sounds';
import { Button } from './ui/button';

interface PreTurnViewProps {
  currentPlayerName: string;
  onStartTurn: () => void;
  isCurrentUserTurn: boolean;
}

export function PreTurnView({ currentPlayerName, onStartTurn, isCurrentUserTurn }: PreTurnViewProps) {
  const { t } = useTranslation();
  const { playStart } = useFiveSecondsSounds();

  const handleStart = () => {
    playStart();
    onStartTurn();
  };

  return (
    <div className="text-center space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">
          {t('fiveSecondsGame.gameplay.playerTurn', { name: currentPlayerName })}
        </h2>
        <p className="text-muted-foreground">
          {isCurrentUserTurn
            ? t('fiveSecondsGame.gameplay.getReady')
            : t('fiveSecondsGame.gameplay.waitingForPlayerTurn', { name: currentPlayerName })}
        </p>
      </div>
      {isCurrentUserTurn && (
        <Button size="lg" onClick={handleStart} className="text-xl px-8 py-6">
          {t('fiveSecondsGame.gameplay.startTurn')}
          <ArrowRight className="w-6 h-6 ml-2" />
        </Button>
      )}
    </div>
  );
}
