import type { Question } from '@guess-logo/five-seconds';
import { Timer } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { QuestionInfo } from './question-info';

interface AnsweringViewProps {
  timeLeft: number;
  totalTime: number;
  currentQuestion: Question;
}

export function AnsweringView({ timeLeft, totalTime, currentQuestion }: AnsweringViewProps) {
  const progressPercentage = (timeLeft / totalTime) * 100;
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-4">
          <Timer className="w-8 h-8 text-accent" />
          <span className="text-6xl font-bold tabular-nums">{timeLeft}</span>
        </div>
        <Progress value={progressPercentage} className="h-3" />
      </div>

      <QuestionInfo currentQuestion={currentQuestion} />
    </div>
  );
}
