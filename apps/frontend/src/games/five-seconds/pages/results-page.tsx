import {
  useFiveSecondsActions,
  useFiveSecondsState,
} from '@guess-logo/five-seconds';
import { Award, Medal, RotateCcw, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export function ResultsPage() {
  const { t } = useTranslation();
  const { players } = useFiveSecondsState();
  const { resetGame } = useFiveSecondsActions();

  // Sort players by score
  const sortedPlayers = Object.values(players).sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];

  const getPositionIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-[#FFD700]" />;
      case 1:
        return <Medal className="w-6 h-6 text-[#C0C0C0]" />;
      case 2:
        return <Award className="w-6 h-6 text-[#CD7F32]" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center bg-foreground justify-center p-4 ">
      {/* CRT Screen Container */}
      <div className="w-full max-w-2xl relative bg-background border-8 border-border  p-8">

        {/* Scanline Effect Overlay */}
        <div
          className="absolute inset-0 pointer-events-none "
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              rgba(0, 0, 0, 0.15),
              rgba(0, 0, 0, 0.15) 1px,
              transparent 1px,
              transparent 2px
            )`,
          }}
        />

        {/* Screen Content */}
        <div className="space-y-8 relative z-10">

          {/* Game Over Header */}
          <div className="text-center space-y-4">
            <h1 className="text-6xl font-bold tracking-widest text-foreground">
              {t('fiveSecondsGame.results.gameOver', 'GAME OVER')}
            </h1>

            <p className="text-2xl text-popover">
              {t('fiveSecondsGame.results.winner', 'WINNER')}
              :
              {winner?.name.toUpperCase()}
            </p>
          </div>

          {/* Scoreboard */}
          <Card className=" border-[3px] border-foreground p-6 space-y-4">
            <h2 className="text-xl font-bold text-center text-popover">
              {t('fiveSecondsGame.results.finalScores', 'FINAL SCORES')}
            </h2>

            <div className="space-y-3">
              {sortedPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-4 border-2 border-foreground ${
                    index === 0
                      ? 'bg-primary text-[#1a1a1a]'
                      : ' text-popover'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 flex justify-center">
                      {getPositionIcon(index) || (
                        <span className="text-lg font-bold">
                          #
                          {index + 1}
                        </span>
                      )}
                    </div>
                    <span className="text-lg font-bold">
                      {player.name.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold tabular-nums">
                      {t('points', { count: player.score })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Play Again Button */}
          <div className="flex justify-center pt-4">
            <Button
              size="lg"
              onClick={resetGame}
              className="text-lg px-8 py-4"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              {t('fiveSecondsGame.results.playAgain', 'PLAY AGAIN')}
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
