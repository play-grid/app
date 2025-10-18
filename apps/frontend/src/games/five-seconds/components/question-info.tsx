import type { Question } from '@guess-logo/shared/schemas/five-seconds';
import type { SupportedLanguage } from '@guess-logo/shared/types';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { useCategory } from '../hooks/use-category';

export function QuestionInfo({ currentQuestion }: { currentQuestion: Question }) {
  const firstCategoryId = currentQuestion.categoryIds[0];
  const { t, i18n } = useTranslation();
  const { data: category, isLoading } = useCategory(firstCategoryId, i18n.language as SupportedLanguage);

  return (
    <div className="text-center space-y-4">
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
      <h3 className="text-3xl md:text-4xl font-bold text-balance">
        {t('fiveSecondsGame.gameplay.nameThree')}
        {' '}
        {currentQuestion.question}
      </h3>
    </div>
  );
}
