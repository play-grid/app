'use client';

import { Award, Medal, RotateCcw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useFiveSecondsStore } from '../store';

export function ResultsPage() {
  const players = useFiveSecondsStore(state => state.players);
  const resetGame = useFiveSecondsStore(state => state.resetGame);

  // Sort players by score
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];

  const getPositionIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-8 h-8 text-yellow-500" />;
      case 1:
        return <Medal className="w-8 h-8 text-gray-400" />;
      case 2:
        return <Award className="w-8 h-8 text-amber-700" />;
      default:
        return null;
    }
  };

  const getPositionLabel = (index: number) => {
    switch (index) {
      case 0:
        return '1st Place';
      case 1:
        return '2nd Place';
      case 2:
        return '3rd Place';
      default:
        return `${index + 1}th Place`;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl space-y-8">
        {/* Winner Announcement */}
        <div className="text-center space-y-6">
          <Trophy className="w-24 h-24 mx-auto text-accent animate-bounce" />
          <div className="space-y-2">
            <h1 className="text-5xl md:text-7xl font-bold text-balance">
              {winner?.name}
              {' '}
              Wins!
            </h1>
            <p className="text-2xl text-muted-foreground">
              With
              {' '}
              {winner?.score}
              {' '}
              {winner?.score === 1 ? 'point' : 'points'}
            </p>
          </div>
        </div>

        {/* Leaderboard */}
        <Card className="p-6 md:p-8 space-y-6 bg-card border-border">
          <h2 className="text-3xl font-bold text-center">Final Scores</h2>

          <div className="space-y-4">
            {sortedPlayers.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-6 rounded-lg border transition-all ${
                  index === 0
                    ? 'bg-accent text-accent-foreground border-accent scale-105'
                    : 'bg-secondary border-border'
                }`}
              >
                <div className="flex items-center gap-4">
                  {getPositionIcon(index)}
                  <div className="w-12 h-12 rounded-full bg-background/20 flex items-center justify-center font-bold text-lg">
                    {player.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xl font-bold">{player.name}</p>
                    <p className="text-sm opacity-80">{getPositionLabel(index)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold tabular-nums">{player.score}</p>
                  <p className="text-sm opacity-80">{player.score === 1 ? 'point' : 'points'}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Play Again Button */}
        <div className="flex justify-center">
          <Button size="lg" onClick={resetGame} className="text-xl px-8 py-6">
            <RotateCcw className="w-6 h-6 mr-2" />
            Play Again
          </Button>
        </div>
      </div>
    </div>
  );
}
