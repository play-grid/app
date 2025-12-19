import type { FiveSecondsPlayer } from '@guess-logo/five-seconds';
import { Trophy } from 'lucide-react';
import { Card } from './ui/card';

interface PlayerScoresProps {
  players: FiveSecondsPlayer[];
  currentPlayerId?: string;
}

export function PlayerScores({ players, currentPlayerId }: PlayerScoresProps) {
  return (
    <div className="flex justify-center gap-4 flex-wrap">
      {players.map(player => (
        <Card
          key={player.id}
          className={`p-4 flex items-center gap-3 transition-all ${
            player.id === currentPlayerId
              ? 'bg-accent text-accent-foreground border-accent scale-105'
              : 'bg-card border-border'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold">
            {player.name[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold">{player.name}</p>
            <div className="flex items-center gap-1 text-sm">
              <Trophy className="w-4 h-4" />
              <span>{player.score}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
