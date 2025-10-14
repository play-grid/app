import { useCallback, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { AnsweringView } from '../components/answering-view';
import { PlayerScores } from '../components/player-scores';
import { PreTurnView } from '../components/pre-turn-view';
import { RoundInfo } from '../components/round-info';
import { VotingView } from '../components/voting-view';
import { getRandomQuestion } from '../lib/questions';
import { useFiveSecondsStore } from '../store';

export function GameplayPage() {
  // Store selectors
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

  // Local component state
  const [currentQuestion, setCurrentQuestion] = useState(() =>
    getRandomQuestion(settings.categories, settings.difficulty),
  );
  const [timeLeft, setTimeLeft] = useState(settings.timePerTurn);
  const [isAnswering, setIsAnswering] = useState(false);

  // Derived state
  const currentPlayer = players.find(p => p.id === turnState?.currentPlayerId);
  const isVotingFinished
    = votingState && votingState.currentVoterIndex >= votingState.voters.length;
  const currentVoterId = votingState && votingState.voters[votingState.currentVoterIndex];
  const currentVoter = players.find(p => p.id === currentVoterId);

  // --- Game Flow Effects ---

  // Timer effect
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

  // Effect to start voting when timer ends
  useEffect(() => {
    if (timeLeft === 0 && isAnswering && currentPlayer) {
      setIsAnswering(false);
      startVoting(currentPlayer.id, players);
    }
  }, [timeLeft, isAnswering, currentPlayer, players, startVoting]);

  // Effect to tally votes when voting is finished
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

  useEffect(() => {
    if (isVotingFinished) {
      const isValid = tallyVotes();
      if (isValid && currentPlayer) {
        updatePlayer(currentPlayer.id, { score: currentPlayer.score + 1 });
      }
      handleNextTurn();
    }
  }, [isVotingFinished, tallyVotes, currentPlayer, updatePlayer, handleNextTurn]);

  // --- Event Handlers ---

  const handleStartTurn = () => {
    setIsAnswering(true);
    setTimeLeft(settings.timePerTurn);
  };

  const handleVote = (isValid: boolean) => {
    submitVote(isValid);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl space-y-8">
        <PlayerScores players={players} currentPlayerId={currentPlayer?.id} />

        <RoundInfo roundNumber={turnState?.roundNumber || 1} />

        <Card className="p-8 md:p-12 space-y-8 bg-card border-border">
          {!isAnswering && !votingState?.isVoting
            ? (
                <PreTurnView
                  currentPlayerName={currentPlayer?.name || ''}
                  onStartTurn={handleStartTurn}
                />
              )
            : votingState?.isVoting && !isVotingFinished
              ? (
                  <VotingView
                    votingState={votingState}
                    currentVoter={currentVoter}
                    currentPlayer={currentPlayer}
                    currentQuestion={currentQuestion}
                    onVote={handleVote}
                  />
                )
              : (
                  <AnsweringView
                    timeLeft={timeLeft}
                    timePerTurn={settings.timePerTurn}
                    currentQuestion={currentQuestion}
                  />
                )}
        </Card>
      </div>
    </div>
  );
}
