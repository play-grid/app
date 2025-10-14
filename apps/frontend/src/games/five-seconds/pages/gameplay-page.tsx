import { ArrowRight, Timer, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getRandomQuestion } from '../lib/questions';
import { useFiveSecondsStore } from '../store';

export function GameplayPage() {
  const players = useFiveSecondsStore(state => state.players);
  const settings = useFiveSecondsStore(state => state.settings);
  const turnState = useFiveSecondsStore(state => state.turnState);
  const updatePlayer = useFiveSecondsStore(state => state.updatePlayer);
  const nextTurn = useFiveSecondsStore(state => state.nextTurn);
  const endGame = useFiveSecondsStore(state => state.endGame);

  const [currentQuestion, setCurrentQuestion] = useState(() =>
    getRandomQuestion(settings.categories, settings.difficulty),
  );

  const [timeLeft, setTimeLeft] = useState(settings.timePerTurn);
  const [isAnswering, setIsAnswering] = useState(false);

  const currentPlayer = players.find(p => p.id === turnState?.currentPlayerId);
  const handleTimeUp = () => {
    setIsAnswering(false);
  };

  useEffect(() => {
    if (!isAnswering)
      return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAnswering]);

  const handleNextTurn = () => {
    setIsAnswering(false);

    // Check if all players have had enough turns (e.g., 5 rounds)
    if (turnState && turnState.roundNumber >= 5 && turnState.turnIndex === players.length - 1) {
      endGame();
      return;
    }

    // Move to next turn
    if (nextTurn) {
      nextTurn();
    }

    // Generate new question
    setCurrentQuestion(getRandomQuestion(settings.categories, settings.difficulty));
    setTimeLeft(settings.timePerTurn);
  };

  const handleCorrect = () => {
    if (currentPlayer) {
      updatePlayer(currentPlayer.id, { score: currentPlayer.score + 1 });
    }
    handleNextTurn();
  };

  const handleIncorrect = () => {
    handleNextTurn();
  };

  const handleStartTurn = () => {
    setIsAnswering(true);
    setTimeLeft(settings.timePerTurn);
  };

  const progressPercentage = (timeLeft / settings.timePerTurn) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header - Scores */}
        <div className="flex justify-center gap-4 flex-wrap">
          {players.map(player => (
            <Card
              key={player.id}
              className={`p-4 flex items-center gap-3 transition-all ${
                player.id === currentPlayer?.id
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

        {/* Round Info */}
        <div className="text-center">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Round
            {' '}
            {turnState?.roundNumber || 1}
          </Badge>
        </div>

        {/* Main Game Card */}
        <Card className="p-8 md:p-12 space-y-8 bg-card border-border">
          {!isAnswering
            ? (
                <div className="text-center space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold">
                      {currentPlayer?.name}
                      's Turn
                    </h2>
                    <p className="text-muted-foreground">Get ready to answer!</p>
                  </div>
                  <Button size="lg" onClick={handleStartTurn} className="text-xl px-8 py-6">
                    Start Turn
                    <ArrowRight className="w-6 h-6 ml-2" />
                  </Button>
                </div>
              )
            : (
                <div className="space-y-8">
                  {/* Timer */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-4">
                      <Timer className="w-8 h-8 text-accent" />
                      <span className="text-6xl font-bold tabular-nums">{timeLeft}</span>
                    </div>
                    <Progress value={progressPercentage} className="h-3" />
                  </div>

                  {/* Question */}
                  <div className="text-center space-y-4">
                    <Badge variant="outline" className="text-sm">
                      {currentQuestion.category}
                      {' '}
                      •
                      {currentQuestion.difficulty}
                    </Badge>
                    <h3 className="text-3xl md:text-4xl font-bold text-balance">{currentQuestion.question}</h3>
                  </div>

                  {/* Answer Buttons */}
                  {timeLeft === 0 && (
                    <div className="flex gap-4 justify-center">
                      <Button size="lg" variant="default" onClick={handleCorrect} className="text-lg px-8">
                        Correct (+1 point)
                      </Button>
                      <Button size="lg" variant="outline" onClick={handleIncorrect} className="text-lg px-8 bg-transparent">
                        Incorrect
                      </Button>
                    </div>
                  )}
                </div>
              )}
        </Card>
      </div>
    </div>
  );
}
