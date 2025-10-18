import type { Question } from '@guess-logo/shared/schemas/five-seconds';
import type { SupportedLanguage } from '@guess-logo/shared/types';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { useCategory } from '../hooks/use-category';

export function QuestionInfoBadge({ currentQuestion }: { currentQuestion: Question }) {
  const firstCategoryId = currentQuestion.categoryIds[0];
  const { i18n } = useTranslation();
  const { data: category, isLoading } = useCategory(firstCategoryId, i18n.language as SupportedLanguage);

  return (
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
              {currentQuestion.difficulty}
            </>
          )}
    </Badge>
  );
}
