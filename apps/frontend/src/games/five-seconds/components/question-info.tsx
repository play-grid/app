import type { Question } from '@guess-logo/shared/schemas/five-seconds';
import type { SupportedLanguage } from '@guess-logo/shared/types';
import { Clock, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import { useCategory } from '../hooks/use-category';
import { FeedbackForm } from './feedback-form';

export function QuestionInfo({ currentQuestion }: { currentQuestion: Question }) {
  const firstCategoryId = currentQuestion.categoryId;
  const { t, i18n } = useTranslation();
  const { data: category, isLoading } = useCategory(
    firstCategoryId,
    i18n.language as SupportedLanguage,
  );

  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center gap-2">
        <Badge variant="outline" className="text-sm">
          {isLoading
            ? (
                <Spinner className="inline w-3 h-3" />
              )
            : (
                <>
                  {category?.name ?? firstCategoryId}
                  {' '}
                  •
                  {t(currentQuestion.difficulty)}
                </>
              )}
        </Badge>
        {currentQuestion.estimatedReadingTime && (
          <Badge variant="outline" className="text-sm flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{currentQuestion.estimatedReadingTime}</span>
          </Badge>
        )}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Info />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <FeedbackForm questionId={currentQuestion.id} />
          </PopoverContent>
        </Popover>
      </div>
      <h3 className="text-3xl md:text-4xl font-bold text-balance">
        {t('fiveSecondsGame.gameplay.nameThree')}
        {' '}
        {currentQuestion.question}
      </h3>
    </div>
  );
}
