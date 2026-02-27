import type { GuessDirection } from '@guess-logo/stat-clash';
import { ArrowBigLeft, ArrowBigRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';

interface GuessButtonsProps {
  disabled?: boolean;
  onGuess: (direction: GuessDirection) => void;
}

export function GuessButtons({ disabled = false, onGuess }: GuessButtonsProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        size="lg"
        disabled={disabled}
        onClick={() => onGuess('left')}
        className="h-14"
      >
        <ArrowBigLeft className="size-5" />
        {t('statClashGame.gameBoard.leftIsHigher')}
      </Button>
      <Button
        size="lg"
        disabled={disabled}
        onClick={() => onGuess('right')}
        className="h-14"
      >
        {t('statClashGame.gameBoard.rightIsHigher')}
        <ArrowBigRight className="size-5" />
      </Button>
    </div>
  );
}
