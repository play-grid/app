import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { AnsweringView } from '../components/answering-view';
import { PlayerScores } from '../components/player-scores';
import { PreTurnView } from '../components/pre-turn-view';
import { RoundInfo } from '../components/round-info';
import { VotingView } from '../components/voting-view';
import { useQuestion } from '../hooks/use-question';
import { useFiveSecondsStore } from '../stores/game-store';

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
  const resetGame = useFiveSecondsStore(state => state.resetGame);
  const setPhase = useFiveSecondsStore(state => state.setPhase);
  const seenQuestionIds = useFiveSecondsStore(state => state.seenQuestionIds);
  const addSeenQuestionId = useFiveSecondsStore(state => state.addSeenQuestionId);

  const { t } = useTranslation();
  // Local component state
  const {
    data: currentQuestion,
    isLoading,
    isError,
    refetch: fetchQuestion,
  } = useQuestion(settings.categoryIds, settings.difficulty, seenQuestionIds);

  const [timeLeft, setTimeLeft] = useState(settings.timePerTurn);
  const [isAnswering, setIsAnswering] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Fetch initial question on mount
  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  // Add question to seen list
  useEffect(() => {
    if (currentQuestion && !seenQuestionIds.includes(currentQuestion.id)) {
      addSeenQuestionId(currentQuestion.id);
    }
  }, [currentQuestion, seenQuestionIds, addSeenQuestionId]);

  // Derived state
  const currentPlayer = players.find(p => p.id === turnState?.currentPlayerId);
  const isVotingFinished
    = votingState && votingState.currentVoterIndex >= votingState.voters.length;
  const currentVoterId = votingState && votingState.voters[votingState.currentVoterIndex];
  const currentVoter = players.find(p => p.id === currentVoterId);

  // Effect to start voting when timer ends
  useEffect(() => {
    if (timeLeft === 0 && isAnswering && currentPlayer) {
      setIsAnswering(false);
      startVoting(currentPlayer.id, players);
    }
  }, [timeLeft, isAnswering, currentPlayer, players, startVoting]);

  // Effect to handle the countdown timer
  useEffect(() => {
    if (!isAnswering) {
      return undefined;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prevTime => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timerId);
  }, [isAnswering]);

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

    fetchQuestion();
    setTimeLeft(settings.timePerTurn);
  }, [turnState, players, endGame, nextTurn, settings, resetVoting, fetchQuestion]);

  useEffect(() => {
    if (isVotingFinished) {
      const isValid = tallyVotes();
      if (isValid && currentPlayer) {
        updatePlayer(currentPlayer.id, { score: currentPlayer.score + 1 });
      }
      handleNextTurn();
    }
  }, [isVotingFinished, tallyVotes, currentPlayer, updatePlayer, handleNextTurn]);

  // TODO: refactor this to be in game-core
  // ---  Event Handlers ---
  const handleStartTurn = () => {
    setIsAnswering(true);
    setTimeLeft(settings.timePerTurn);
  };

  const handleVote = (isValid: boolean) => {
    submitVote(isValid);
  };

  const handleResetGame = () => {
    resetGame();
    setIsResetConfirmOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8">
      {/* Header with Reset Button */}
      <div className="w-full max-w-4xl mx-auto mb-6">
        <div className="flex justify-start gap-2">
          {!isError
            && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  setPhase('lobby');
                }}
                aria-label={t('common.back')}
              >
                <ArrowLeft className="w-4 h-4" />
                {' '}
                {/* Using ArrowLeft icon */}
                <span className="hidden sm:inline">{t('common.back')}</span>
              </Button>
            )}
          <Dialog open={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                aria-label={t('fiveSecondsGame.gameplay.resetGame')}
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">{t('fiveSecondsGame.gameplay.resetGame')}</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('fiveSecondsGame.gameplay.resetConfirmTitle')}</DialogTitle>
                <DialogDescription>
                  {t('fiveSecondsGame.gameplay.resetConfirmDescription')}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">{t('common.cancel')}</Button>
                </DialogClose>
                <Button variant="destructive" onClick={handleResetGame}>
                  {t('fiveSecondsGame.gameplay.resetGame')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Game Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-4xl space-y-6">
          <PlayerScores players={players} currentPlayerId={currentPlayer?.id} />
          <RoundInfo roundNumber={turnState?.roundNumber || 1} />

          <Card className="p-8 md:p-12 space-y-8 bg-card border-border">
            {isLoading
              ? (
                  <div className="flex items-center justify-center">
                    <Spinner />
                  </div>
                )
              : isError
                ? (
                    <div className="text-center">
                      <p className="mb-4">{t('fiveSecondsGame.gameplay.noMoreQuestions')}</p>
                      <Button onClick={() => resetGame()}>
                        {t('fiveSecondsGame.gameplay.backToLobby')}
                      </Button>
                    </div>
                  )
                : !isAnswering && !votingState?.isVoting && currentQuestion
                    ? (
                        <PreTurnView
                          currentPlayerName={currentPlayer?.name || ''}
                          onStartTurn={handleStartTurn}
                        />
                      )
                    : votingState?.isVoting && !isVotingFinished && currentQuestion
                      ? (
                          <VotingView
                            votingState={votingState}
                            currentVoter={currentVoter}
                            currentPlayer={currentPlayer}
                            currentQuestion={currentQuestion}
                            onVote={handleVote}
                          />
                        )
                      : currentQuestion
                        ? (
                            <AnsweringView
                              timeLeft={timeLeft}
                              timePerTurn={settings.timePerTurn}
                              currentQuestion={currentQuestion}
                            />
                          )
                        : null}
          </Card>
        </div>
      </div>
    </div>
  );
}
