import { useFiveSecondsActions, useFiveSecondsState } from '@guess-logo/five-seconds';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAnalytics } from '@/hooks/use-analytics';
import { useIsCurrentUser } from '@/features/room/use-player-identity';
import { AnsweringView } from '../components/answering-view';
import { PlayerScores } from '../components/player-scores';
import { PreTurnView } from '../components/pre-turn-view';
import { ReadingView } from '../components/reading-view';
import { RoundInfo } from '../components/round-info';
import { SoundControls } from '../components/sound-controls';
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
import { useFiveSecondsSounds } from '../hooks/use-five-seconds-sounds';
import { useQuestion } from '../hooks/use-question';

export function GameplayPage() {
  const state = useFiveSecondsState();
  const {
    players,
    settings,
    turnState,
    votingState,
    questionError,
    phase,
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
  const { playSuccess } = useFiveSecondsSounds();
  const { trackTurnStart, trackTurnComplete, trackVoteSubmit, trackGameComplete, trackGameReset } = useAnalytics();
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

  // Derived time left — no useState needed since turnTimerEndsAt is in store
  const timeLeft = state.turnTimerEndsAt
    ? Math.max(0, Math.ceil((state.turnTimerEndsAt - Date.now()) / 1000))
    : settings.timePerTurn;

  // Force re-render every 500ms while timer is active so timeLeft stays current
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  useEffect(() => {
    if (!state.turnTimerEndsAt)
      return;

    const interval = setInterval(forceUpdate, 500);
    return () => clearInterval(interval);
  }, [state.turnTimerEndsAt]);

  const isCurrentUserTurn = useIsCurrentUser(currentPlayer?.id || '');

  const gamePhase = useMemo(() => {
    if (votingState?.isVoting)
      return 'voting';
    if (turnState?.phase === 'answering')
      return 'answering';
    if (turnState?.phase === 'reading')
      return 'reading';
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
          trackTurnComplete({
            game_id: 'five-seconds',
            round_number: turnState?.roundNumber,
            turn_number: turnState?.turnNumber,
            player_id: currentPlayer.id,
          });

          const maxScore = Math.max(...Object.values(players).map(p => p.score));
          if (maxScore >= settings.pointsToWin) {
            playSuccess(); // Win sound!
            trackGameComplete({
              game_id: 'five-seconds',
              winner_id: currentPlayer.id,
              final_scores: Object.values(players).map(p => ({ id: p.id, name: p.name, score: p.score })),
              total_players: Object.keys(players).length,
            });
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
  }, [isVotingFinished, currentPlayer, turnState, tallyVotes, endGame, players, settings.pointsToWin, playSuccess, trackTurnComplete, trackGameComplete]);

  const handleStartTurn = useCallback(async () => {
    trackTurnStart({
      game_id: 'five-seconds',
      round_number: turnState?.roundNumber,
      turn_number: turnState?.turnNumber,
      player_id: currentPlayer?.id,
    });
    await startTurn();
  }, [startTurn, turnState, currentPlayer, trackTurnStart]);

  const handleVote = useCallback((isValid: boolean) => {
    trackVoteSubmit({
      game_id: 'five-seconds',
      round_number: turnState?.roundNumber,
      voter_id: currentVoter?.id,
      current_player_id: currentPlayer?.id,
      is_valid: isValid,
    });
    submitVote(isValid);
  }, [submitVote, trackVoteSubmit, turnState, currentPlayer, currentVoter]);

  const handleResetGame = useCallback(() => {
    trackGameReset({
      game_id: 'five-seconds',
      reason: 'manual_reset',
      current_phase: phase,
    });
    resetGame();
    setIsResetConfirmOpen(false);
  }, [resetGame, trackGameReset, phase]);

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8">
      <div className="w-full max-w-4xl mx-auto mb-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
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

          <SoundControls />
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
              : questionError && !question
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
                          {t('fiveSecondsGame.lobby.backToLobby')}
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
                                {t('fiveSecondsGame.lobby.backToLobby')}
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
                    ? <PreTurnView currentPlayerName={currentPlayer?.name || ''} onStartTurn={handleStartTurn} isCurrentUserTurn={isCurrentUserTurn} />
                    : gamePhase === 'reading' && question && isValidQuestion(question)
                      ? <ReadingView currentQuestion={question} />
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
