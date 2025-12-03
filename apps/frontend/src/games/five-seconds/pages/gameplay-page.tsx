import {
  useFiveSecondsActions,
  useFiveSecondsState,
}  from '@guess-logo/five-seconds';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { useTimer } from '../hooks/use-timer';
import { NoQuestionsFoundError } from '../services/questions.service';

export function GameplayPage() {
  const state = useFiveSecondsState();
  const {
    players,
    settings,
    turnState,
    votingState,
    seenQuestionIds,
  } = state;
  const {
    nextTurn,
    endGame,
    startVoting,
    submitVote,
    tallyVotes,
    resetVoting,
    resetGame,
    setPhase,
    addSeenQuestionId,
  } = useFiveSecondsActions();

  const { t } = useTranslation();
  const hasProcessedVotingRef = useRef(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Local component state
  const {
    data: currentQuestion,
    isLoading,
    isError,
    isPaused,
    error,
    refetch: fetchQuestion,
  } = useQuestion(settings.categoryIds, settings.difficulty, seenQuestionIds);

  // Calculate time for current question
  const timeForCurrentQuestion = useMemo(() => {
    if (currentQuestion && 'id' in currentQuestion && currentQuestion.estimatedReadingTime) {
      const readingTime = Number.parseInt(currentQuestion.estimatedReadingTime, 10) || 0;
      return settings.timePerTurn + readingTime;
    }
    return settings.timePerTurn;
  }, [currentQuestion, settings.timePerTurn]);

  // Derived state
  const currentPlayer = players[turnState?.currentPlayerId || ''];

  // Timer hook
  const { timeLeft, start: startTimer, reset: resetTimer, isRunning } = useTimer({
    initialTime: timeForCurrentQuestion,
    onComplete: useCallback(() => {
      if (currentPlayer) {
        const voterIds = Object.values(players)
          .filter(p => p.id !== currentPlayer.id)
          .map(p => p.id);
        startVoting(voterIds);
      }
    }, [players, currentPlayer, startVoting]),
  });

  // Derived state: determine game phase from voting state and timer
  const gamePhase = useMemo(() => {
    if (votingState?.isVoting)
      return 'voting';
    if (isRunning)
      return 'answering';
    return 'pre-turn';
  }, [votingState?.isVoting, isRunning]);

  // Fetch initial question on mount
  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  // Add question to seen list
  useEffect(() => {
    if (currentQuestion && 'id' in currentQuestion && !seenQuestionIds.includes(currentQuestion.id)) {
      addSeenQuestionId(currentQuestion.id);
    }
  }, [currentQuestion, seenQuestionIds, addSeenQuestionId]);

  // Reset timer when question changes
  useEffect(() => {
    if (currentQuestion && 'id' in currentQuestion) {
      resetTimer(timeForCurrentQuestion);
    }
  }, [currentQuestion, timeForCurrentQuestion, resetTimer]);

  // More derived state
  const isVotingFinished = votingState && votingState.currentVoterIndex >= votingState.voters.length;
  const currentVoterId = votingState && votingState.voters[votingState.currentVoterIndex];
  const currentVoter = players[currentVoterId || ''];

  // Handle next turn logic
  const handleNextTurn = useCallback(async () => {
    if (turnState && turnState.roundNumber >= settings.roundsToWin && turnState.turnIndex === Object.keys(players).length - 1) {
      await endGame();
      return;
    }

    await resetVoting();
    await nextTurn();
    fetchQuestion();
  }, [turnState, players, endGame, nextTurn, resetVoting, fetchQuestion, settings]);

  // Handle voting finished
  useEffect(() => {
    if (isVotingFinished && currentPlayer && !hasProcessedVotingRef.current) {
      hasProcessedVotingRef.current = true;

      const processVotingEnd = async () => {
        await tallyVotes(currentPlayer.id);
        await handleNextTurn();
      };

      processVotingEnd().then(() => {
        // Reset ref after processing
        hasProcessedVotingRef.current = false;
      });
    }
    else if (!isVotingFinished) {
      hasProcessedVotingRef.current = false;
    }
  }, [isVotingFinished, currentPlayer, tallyVotes, handleNextTurn]);

  // Event Handlers
  const handleStartTurn = useCallback(() => {
    startTimer();
  }, [startTimer]);

  const handleVote = useCallback((isValid: boolean) => {
    submitVote(isValid);
  }, [submitVote]);

  const handleResetGame = useCallback(() => {
    resetGame();
    setIsResetConfirmOpen(false);
  }, [resetGame]);

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8">
      {/* Header with Reset Button */}
      <div className="w-full max-w-4xl mx-auto mb-6">
        <div className="flex justify-start gap-2">
          {!isError && !isPaused && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setPhase('lobby')}
              aria-label={t('common.back')}
            >
              <ArrowLeft className="w-4 h-4" />
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
          <PlayerScores players={Object.values(players)} currentPlayerId={currentPlayer?.id} />
          <RoundInfo roundNumber={turnState?.roundNumber || 1} />

          <Card className="p-8 md:p-12 space-y-8 bg-card border-border">
            {isLoading
              ? (
                  <div className="flex items-center justify-center">
                    <Spinner />
                  </div>
                )
              : isError || isPaused
                ? (
                    error instanceof NoQuestionsFoundError
                      ? (
                          <div className="text-center">
                            <p className="mb-4">{t('fiveSecondsGame.gameplay.noMoreQuestions')}</p>
                            <Button onClick={() => resetGame()}>
                              {t('fiveSecondsGame.gameplay.backToLobby')}
                            </Button>
                          </div>
                        )
                      : (
                          <div className="text-center">
                            <p className="mb-4">{t('common.error')}</p>
                            <Button onClick={() => fetchQuestion()}>
                              {t('common.retry')}
                            </Button>
                          </div>
                        )
                  )
                : gamePhase === 'pre-turn' && currentQuestion && 'id' in currentQuestion
                  ? (
                      <PreTurnView
                        currentPlayerName={currentPlayer?.name || ''}
                        onStartTurn={handleStartTurn}
                      />
                    )
                  : gamePhase === 'voting' && !isVotingFinished && currentQuestion && 'id' in currentQuestion && votingState
                    ? (
                        <VotingView
                          votingState={votingState}
                          currentVoter={currentVoter}
                          currentPlayer={currentPlayer}
                          currentQuestion={currentQuestion}
                          onVote={handleVote}
                        />
                      )
                    : gamePhase === 'answering' && currentQuestion && 'id' in currentQuestion
                      ? (
                          <AnsweringView
                            timeLeft={timeLeft}
                            totalTime={timeForCurrentQuestion}
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
