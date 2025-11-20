import type { Question } from '@guess-logo/five-seconds/schema';
import type { SupportedLanguage } from '@guess-logo/shared/types';
import { useQueryClient } from '@tanstack/react-query';
import { Clock, Info } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import client from '@/lib/hono-client';
import { useCategory } from '../hooks/use-category';
import { FeedbackForm } from './feedback-form';

const feedbackTypesEndpoint = client.api.games['five-seconds'].questions.feedback.types.$get;

export function QuestionInfo({ currentQuestion }: { currentQuestion: Question }) {
  const firstCategoryId = currentQuestion.categoryId;
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { data: category, isLoading } = useCategory(
    firstCategoryId,
    i18n.language as SupportedLanguage,
  );

  const prefetchFeedbackTypes = async () => {
    await queryClient.prefetchQuery({
      queryKey: ['feedbackTypes'],
      queryFn: async () => {
        const res = await feedbackTypesEndpoint({});
        if (!res.ok) {
          throw new Error(await res.text());
        }
        return res.json();
      },
    });
  };

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
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" onMouseOver={prefetchFeedbackTypes}>
              <Info />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <FeedbackForm
              questionId={currentQuestion.id}
              onSuccess={() => setIsPopoverOpen(false)}
            />
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
