import { Badge } from '@/components/ui/badge';

interface RoundInfoProps {
  roundNumber: number;
}

export function RoundInfo({ roundNumber }: RoundInfoProps) {
  return (
    <div className="text-center">
      <Badge variant="secondary" className="text-lg px-4 py-2">
        Round
        {' '}
        {roundNumber}
      </Badge>
    </div>
  );
}
