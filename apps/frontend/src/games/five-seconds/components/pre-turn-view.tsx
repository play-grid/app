import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PreTurnViewProps {
  currentPlayerName: string;
  onStartTurn: () => void;
}

export function PreTurnView({ currentPlayerName, onStartTurn }: PreTurnViewProps) {
  return (
    <div className="text-center space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">
          {currentPlayerName}
          's Turn
        </h2>
        <p className="text-muted-foreground">Get ready to answer!</p>
      </div>
      <Button size="lg" onClick={onStartTurn} className="text-xl px-8 py-6">
        Start Turn
        <ArrowRight className="w-6 h-6 ml-2" />
      </Button>
    </div>
  );
}
