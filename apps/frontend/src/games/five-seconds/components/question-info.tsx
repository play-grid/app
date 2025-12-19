import type { Question } from '@guess-logo/five-seconds';
import type { SupportedLanguage } from '@guess-logo/shared/types';
import { Info } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import client from '@/lib/hono-client';
import { useCategory } from '../hooks/use-category';
import { FeedbackForm } from './feedback-form';
import { Button } from './ui/button';

const feedbackTypesEndpoint = client.api.games['five-seconds'].questions.feedback.types.$get;

export function QuestionInfo({ currentQuestion }: { currentQuestion: Question }) {
  const categoryId = currentQuestion.categoryId || '';
  const { t, i18n } = useTranslation();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { data: category, isLoading } = useCategory(
    categoryId,
    i18n.language as SupportedLanguage,
  );

  const prefetchFeedbackTypes = async () => {
    // eslint-disable-next-line ts/no-require-imports
    const queryClient = require('@tanstack/react-query').useQueryClient();
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
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <Badge variant="outline" className="text-sm">
          {isLoading
            ? (
                <Spinner className="inline w-3 h-3" />
              )
            : (
                <>
                  {category?.name ?? categoryId ?? 'Unknown'}
                  {' '}
                  •
                  {' '}
                  {t(`difficulty.${currentQuestion.difficulty}`)}
                </>
              )}
        </Badge>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" onMouseOver={prefetchFeedbackTypes}>
              <Info className="w-4 h-4" />
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
        {currentQuestion.text}
      </h3>
    </div>
  );
}
