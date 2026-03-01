import type { Question } from '@playgrid/five-seconds';
import { Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { QuestionInfo } from './question-info';

interface ReadingViewProps {
  currentQuestion: Question;
}

export function ReadingView({ currentQuestion }: ReadingViewProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center gap-4">
        <Eye className="w-8 h-8 text-foreground" />
        <span className="text-xl text-foreground">{t('fiveSecondsGame.gameplay.readingTime')}</span>
      </div>

      <QuestionInfo currentQuestion={currentQuestion} />
    </div>
  );
}
