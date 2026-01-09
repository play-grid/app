import { useFiveSecondsActions, useFiveSecondsState } from '@guess-logo/five-seconds';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnsweringView } from '../components/answering-view';
import { PlayerScores } from '../components/player-scores';
import { PreTurnView } from '../components/pre-turn-view';

import { RoundInfo } from '../components/round-info';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Spinner } from '../components/ui/spinner';
import { VotingView } from '../components/voting-view';
import { useQuestion } from '../hooks/use-question';

export function GameplayPage() {
  const state = useFiveSecondsState();
  const {
    players,
    settings,
    turnState,
    votingState,
    questionError,
  } = state;

  const {
    endGame,
    startTurn,
    submitVote,
    tallyVotes,
    resetGame,
    setPhase,
  } = useFiveSecondsActions();

  const { t } = useTranslation();
  const hasProcessedVotingRef = useRef(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const {
    question,
    error,
    isLoading,
    fetchQuestion,
  } = useQuestion();

  const isValidQuestion = (
    q: unknown,
  ): q is { id: string; text: string; difficulty: string } => {
    return (
      typeof q === 'object'
      && q !== null
      && 'id' in q
      && 'text' in q
      && 'difficulty' in q
    );
  };

  const currentPlayer = players[turnState?.currentPlayerId || ''];
  const [timeLeft, setTimeLeft] = useState(settings.timePerTurn);

  useEffect(() => {
    if (state.turnTimerEndsAt) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((state.turnTimerEndsAt! - Date.now()) / 1000));
        setTimeLeft(remaining);
      }, 500);

      return () => clearInterval(interval);
    }
    else {
      setTimeLeft(settings.timePerTurn);
    }
  }, [state.turnTimerEndsAt, settings.timePerTurn]);

  const gamePhase = useMemo(() => {
    if (votingState?.isVoting)
      return 'voting';
    if (turnState?.phase === 'answering')
      return 'answering';
    return 'pre-turn';
  }, [votingState?.isVoting, turnState?.phase]);

  const isVotingFinished = votingState && votingState.currentVoterIndex >= votingState.voters.length;
  const currentVoterId = votingState && votingState.voters[votingState.currentVoterIndex];
  const currentVoter = players[currentVoterId || ''];

  useEffect(() => {
    if (isVotingFinished && currentPlayer && !hasProcessedVotingRef.current) {
      hasProcessedVotingRef.current = true;

      const processVotingEnd = async () => {
        try {
          if (
            turnState
            && turnState.roundNumber >= settings.roundsToWin
            && turnState.currentPlayerIndex === turnState.playerOrder.length - 1
          ) {
            await endGame();
            return;
          }

          await tallyVotes(currentPlayer.id);
        }
        catch (err) {
          console.error('Error processing voting end:', err);
        }
        finally {
          hasProcessedVotingRef.current = false;
        }
      };

      processVotingEnd();
    }
  }, [
    isVotingFinished,
    currentPlayer?.id,
    turnState,
    settings.roundsToWin,
    tallyVotes,
    endGame,
  ]);

  const handleStartTurn = useCallback(async () => {
    await startTurn();
  }, [startTurn]);

  const handleVote = useCallback((isValid: boolean) => {
    submitVote(isValid);
  }, [submitVote]);

  const handleResetGame = useCallback(() => {
    resetGame();
    setIsResetConfirmOpen(false);
  }, [resetGame]);

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8">
      <div className="w-full max-w-4xl mx-auto mb-6">
        <div className="flex justify-start gap-2">
          {error && (
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
                <span className="hidden sm:inline">
                  {t('fiveSecondsGame.gameplay.resetGame')}
                </span>
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {t('fiveSecondsGame.gameplay.resetConfirmTitle')}
                </DialogTitle>
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

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-4xl space-y-6">
          <PlayerScores
            players={Object.values(players)}
            currentPlayerId={currentPlayer?.id}
          />

          <RoundInfo roundNumber={turnState?.roundNumber || 1} />

          <Card className="p-8 md:p-12 space-y-8 bg-card border-border">
            {isLoading
              ? (
                  <div className="flex items-center justify-center">
                    <Spinner />
                  </div>
                )
              : questionError
                ? (
                    <div className="text-center space-y-4">
                      <p className="text-lg font-semibold text-destructive">
                        {t('fiveSecondsGame.gameplay.questionsLoadingError')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {questionError.message}
                      </p>
                      <div className="space-y-2">
                        {questionError.canRetry && (
                          <Button
                            variant="default"
                            onClick={() => window.location.reload()}
                          >
                            {t('common.retry')}
                          </Button>
                        )}
                        {questionError.suggestSettingsChange && (
                          <p className="text-xs text-muted-foreground">
                            {t('fiveSecondsGame.gameplay.tryChangingSettings')}
                          </p>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => setPhase('lobby')}
                        >
                          {t('fiveSecondsGame.gameplay.backToLobby')}
                        </Button>
                      </div>
                    </div>
                  )
                : error
                  ? (
                      <div className="text-center space-y-4">
                        <p className="text-lg font-semibold text-destructive">
                          {t('common.error')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {error}
                        </p>
                        {error
                          ? (
                              <Button
                                variant="default"
                                onClick={() => setPhase('lobby')}
                              >
                                {t('fiveSecondsGame.gameplay.backToLobby')}
                              </Button>
                            )
                          : (
                              <Button
                                variant="default"
                                onClick={() => fetchQuestion()}
                              >
                                {t('common.retry')}
                              </Button>
                            )}
                      </div>
                    )
                  : gamePhase === 'pre-turn' && question && isValidQuestion(question)
                    ? <PreTurnView currentPlayerName={currentPlayer?.name || ''} onStartTurn={handleStartTurn} />
                    : gamePhase === 'voting' && !isVotingFinished && question && isValidQuestion(question) && votingState
                      ? (
                          <VotingView
                            votingState={votingState}
                            currentVoter={currentVoter}
                            currentPlayer={currentPlayer}
                            currentQuestion={question}
                            onVote={handleVote}
                          />
                        )
                      : gamePhase === 'answering' && question && isValidQuestion(question)
                        ? (
                            <AnsweringView
                              timeLeft={timeLeft}
                              totalTime={settings.timePerTurn}
                              currentQuestion={question}
                            />
                          )
                        : null}
          </Card>
        </div>
      </div>
    </div>
  );
}
