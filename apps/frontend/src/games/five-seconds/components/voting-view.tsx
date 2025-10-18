import type { Question } from '@guess-logo/shared/schemas/five-seconds';
import type { FiveSecondsPlayer, VotingState } from '../types';
import { ThumbsDown, ThumbsUp, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

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

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Users className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold">
            {t('fiveSecondsGame.gameplay.pleaseVote', { name: currentVoter?.name })}
          </h2>
        </div>
        <p className="text-muted-foreground">
          {t('fiveSecondsGame.gameplay.wasAnswerValid', { name: currentPlayer?.name })}
        </p>
      </div>

      <div className="text-center space-y-2">
        <Badge variant="outline" className="text-sm">
          {/* TODO: fetch category name from id */}
          {t(currentQuestion.categoryIds[0])}
          {' '}
          •
          {t(currentQuestion.difficulty.toLowerCase())}
        </Badge>
        <h3 className="text-2xl md:text-4xl font-bold text-balance">
          {currentQuestion.question}
        </h3>
      </div>

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
    </div>
  );
}
