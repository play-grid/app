import type { FiveSecondsPlayer, Question, VotingState } from '@guess-logo/five-seconds';
import { Clock, ThumbsDown, ThumbsUp, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useIsCurrentUser } from '@/features/room/use-player-identity';
import { QuestionInfo } from './question-info';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

interface VotingViewProps {
  votingState: VotingState;
  currentVoter?: FiveSecondsPlayer;
  currentPlayer?: FiveSecondsPlayer;
  currentQuestion: Question;
  onVote: (isValid: boolean) => void;
}

export function VotingView({
  votingState,
  currentVoter,
  currentPlayer,
  currentQuestion,
  onVote,
}: VotingViewProps) {
  const { t } = useTranslation();
  const votingProgress = (votingState.votes.length / votingState.voters.length) * 100;
  const isCurrentUserVoter = useIsCurrentUser(currentVoter?.id || '');

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Users className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold">
            {isCurrentUserVoter
              ? t('fiveSecondsGame.gameplay.pleaseVote', { name: currentVoter?.name })
              : t('fiveSecondsGame.gameplay.waitingForVote', { name: currentVoter?.name })}
          </h2>
        </div>
        <p className="text-muted-foreground">
          {t('fiveSecondsGame.gameplay.wasAnswerValid', { name: currentPlayer?.name })}
        </p>
      </div>

      <QuestionInfo currentQuestion={currentQuestion} />

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            {t('fiveSecondsGame.gameplay.votes', { count: votingState.votes.length, total: votingState.voters.length })}
          </span>
          <span>
            {Math.round(votingProgress)}
            %
          </span>
        </div>
        <Progress value={votingProgress} className="h-2" />
      </div>

      {isCurrentUserVoter
        ? (
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => onVote(true)}
                className="text-lg px-8 bg-green-600 hover:bg-green-700"
              >
                <ThumbsUp className="w-5 h-5 mr-2" />
                {' '}
                {t('fiveSecondsGame.gameplay.valid')}
              </Button>
              <Button
                size="lg"
                variant="destructive"
                onClick={() => onVote(false)}
                className="text-lg px-8"
              >
                <ThumbsDown className="w-5 h-5 mr-2" />
                {' '}
                {t('fiveSecondsGame.gameplay.invalid')}
              </Button>
            </div>
          )
        : (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Clock className="w-5 h-5" />
                <p className="text-lg">
                  {t('fiveSecondsGame.gameplay.waitingForOthersToVote')}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('fiveSecondsGame.gameplay.yourVoteWillComeNext')}
              </p>
            </div>
          )}
    </div>
  );
}
