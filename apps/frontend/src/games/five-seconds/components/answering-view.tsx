import type { Question } from '../lib/questions';
import { Timer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface AnsweringViewProps {
  timeLeft: number;
  timePerTurn: number;
  currentQuestion: Question;
}

export function AnsweringView({ timeLeft, timePerTurn, currentQuestion }: AnsweringViewProps) {
  const progressPercentage = (timeLeft / timePerTurn) * 100;
  return (
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
  );
}
