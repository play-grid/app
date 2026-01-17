import { useTranslation } from 'react-i18next';
import { Badge } from './ui/badge';

interface RoundInfoProps {
  roundNumber: number;
}

export function RoundInfo({ roundNumber }: RoundInfoProps) {
  const { t } = useTranslation();
  return (
    <div className="text-center">
      <Badge variant="secondary" className="text-lg px-4 py-2">
        {t('fiveSecondsGame.gameplay.round', { number: roundNumber })}
      </Badge>
    </div>
  );
}
