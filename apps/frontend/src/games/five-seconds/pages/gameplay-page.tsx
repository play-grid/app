import { ArrowRight, ThumbsDown, ThumbsUp, Timer, Trophy, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
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
  const votingState = useFiveSecondsStore(state => state.votingState);
  const updatePlayer = useFiveSecondsStore(state => state.updatePlayer);
  const nextTurn = useFiveSecondsStore(state => state.nextTurn);
  const endGame = useFiveSecondsStore(state => state.endGame);
  const startVoting = useFiveSecondsStore(state => state.startVoting);
  const submitVote = useFiveSecondsStore(state => state.submitVote);
  const tallyVotes = useFiveSecondsStore(state => state.tallyVotes);
  const resetVoting = useFiveSecondsStore(state => state.resetVoting);

  const [currentQuestion, setCurrentQuestion] = useState(() =>
    getRandomQuestion(settings.categories, settings.difficulty),
  );
  const [timeLeft, setTimeLeft] = useState(settings.timePerTurn);
  const [isAnswering, setIsAnswering] = useState(false);

  const currentPlayer = players.find(p => p.id === turnState?.currentPlayerId);

  // --- Turn Timer Effects ---
  useEffect(() => {
    if (!isAnswering)
      return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAnswering]);

  useEffect(() => {
    if (timeLeft === 0 && isAnswering && currentPlayer) {
      setIsAnswering(false);
      startVoting(currentPlayer.id, players);
    }
  }, [timeLeft, isAnswering, currentPlayer, players, startVoting]);

  // --- Voting Logic ---
  const isVotingFinished = votingState && votingState.currentVoterIndex >= votingState.voters.length;
  const currentVoterId = votingState && votingState.voters[votingState.currentVoterIndex];
  const currentVoter = players.find(p => p.id === currentVoterId);

  const handleVote = (isValid: boolean) => {
    submitVote(isValid);
  };
    // --- Turn Management ---
  const handleNextTurn = useCallback(() => {
    setIsAnswering(false);
    resetVoting();

    if (turnState && turnState.roundNumber >= 5 && turnState.turnIndex === players.length - 1) {
      endGame();
      return;
    }

    if (nextTurn) {
      nextTurn();
    }

    setCurrentQuestion(getRandomQuestion(settings.categories, settings.difficulty));
    setTimeLeft(settings.timePerTurn);
  }, [turnState, players, endGame, nextTurn, settings, resetVoting]);

  const handleStartTurn = () => {
    setIsAnswering(true);
    setTimeLeft(settings.timePerTurn);
  };

  useEffect(() => {
    if (isVotingFinished) {
      // All votes are in, tally and move to the next turn immediately.
      const isValid = tallyVotes();
      if (isValid && currentPlayer) {
        updatePlayer(currentPlayer.id, { score: currentPlayer.score + 1 });
      }
      handleNextTurn();
    }
  }, [isVotingFinished, tallyVotes, currentPlayer, updatePlayer, handleNextTurn]);

  // --- Render Helpers ---
  const progressPercentage = (timeLeft / settings.timePerTurn) * 100;
  const votingProgress = votingState
    ? (votingState.votes.length / votingState.voters.length) * 100
    : 0;

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
          {!isAnswering && !votingState?.isVoting
            ? (
          // --- Pre-Turn ---
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
            : votingState?.isVoting && !isVotingFinished
              ? (
            // --- Voting Turn ---
                  <div className="space-y-8">
                    <div className="text-center space-y-4">
                      <div className="flex items-center justify-center gap-2">
                        <Users className="w-6 h-6 text-accent" />
                        <h2 className="text-2xl font-bold">
                          {currentVoter?.name}
                          , please vote!
                        </h2>
                      </div>
                      <p className="text-muted-foreground">
                        Was
                        {' '}
                        {currentPlayer?.name}
                        's answer valid?
                      </p>
                    </div>

                    <div className="text-center space-y-2">
                      <Badge variant="outline" className="text-sm">
                        {currentQuestion.category}
                        {' '}
                        •
                        {currentQuestion.difficulty}
                      </Badge>
                      <h3 className="text-2xl md:text-4xl font-bold text-balance">
                        {currentQuestion.question}
                      </h3>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>
                          Votes:
                          {' '}
                          {votingState.votes.length}
                          {' '}
                          /
                          {' '}
                          {votingState.voters.length}
                        </span>
                        <span>
                          {Math.round(votingProgress)}
                          %
                        </span>
                      </div>
                      <Progress value={votingProgress} className="h-2" />
                    </div>

                    <div className="flex gap-4 justify-center">
                      <Button
                        size="lg"
                        onClick={() => handleVote(true)}
                        className="text-lg px-8 bg-green-600 hover:bg-green-700"
                      >
                        <ThumbsUp className="w-5 h-5 mr-2" />
                        {' '}
                        Valid
                      </Button>
                      <Button
                        size="lg"
                        variant="destructive"
                        onClick={() => handleVote(false)}
                        className="text-lg px-8"
                      >
                        <ThumbsDown className="w-5 h-5 mr-2" />
                        {' '}
                        Invalid
                      </Button>
                    </div>
                  </div>
                )
              : (
            // --- Answering Turn ---
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-4">
                        <Timer className="w-8 h-8 text-accent" />
                        <span className="text-6xl font-bold tabular-nums">{timeLeft}</span>
                      </div>
                      <Progress value={progressPercentage} className="h-3" />
                    </div>

                    <div className="text-center space-y-4">
                      <Badge variant="outline" className="text-sm">
                        {currentQuestion.category}
                        {' '}
                        •
                        {currentQuestion.difficulty}
                      </Badge>
                      <h3 className="text-3xl md:text-4xl font-bold text-balance">
                        {currentQuestion.question}
                      </h3>
                    </div>
                  </div>
                )}
        </Card>
      </div>
    </div>
  );
}
