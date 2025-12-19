import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';

interface PreTurnViewProps {
  currentPlayerName: string;
  onStartTurn: () => void;
}

export function PreTurnView({ currentPlayerName, onStartTurn }: PreTurnViewProps) {
  const { t } = useTranslation();
  return (
    <div className="text-center space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">
          {t('fiveSecondsGame.gameplay.playerTurn', { name: currentPlayerName })}
        </h2>
        <p className="text-muted-foreground">{t('fiveSecondsGame.gameplay.getReady')}</p>
      </div>
      <Button size="lg" onClick={onStartTurn} className="text-xl px-8 py-6">
        {t('fiveSecondsGame.gameplay.startTurn')}
        <ArrowRight className="w-6 h-6 ml-2" />
      </Button>
    </div>
  );
}
