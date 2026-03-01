import type { Question } from '@playgrid/five-seconds';
import { Timer } from 'lucide-react';
import { useEffect } from 'react';
import { useFiveSecondsSounds } from '../hooks/use-five-seconds-sounds';
import { QuestionInfo } from './question-info';
import { Progress } from './ui/progress';

interface AnsweringViewProps {
  timeLeft: number;
  totalTime: number;
  currentQuestion: Question;
}

export function AnsweringView({ timeLeft, totalTime, currentQuestion }: AnsweringViewProps) {
  const { playTick, playBuzzer } = useFiveSecondsSounds();
  const progressPercentage = (timeLeft / totalTime) * 100;

  useEffect(() => {
    if (timeLeft > 0) {
      playTick();
    }
    else if (timeLeft === 0) {
      playBuzzer();
    }
  }, [timeLeft, playTick, playBuzzer]);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-4">
          <Timer className="w-8 h-8 text-foreground" />
          <span className="text-6xl font-bold tabular-nums">{timeLeft}</span>
        </div>
        <Progress value={progressPercentage} className="h-3" />
      </div>

      <QuestionInfo currentQuestion={currentQuestion} />
    </div>
  );
}
