import type { SupportedLanguage } from '@guess-logo/shared/types';
import {
  useFiveSecondsActions,
  useFiveSecondsState,
} from '@guess-logo/five-seconds/hooks';
import { difficultySchema } from '@guess-logo/five-seconds/schema';
import { useQueryClient } from '@tanstack/react-query';
import { Timer, Trophy } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCategories } from '../hooks/use-categories';
import { getCategoryById } from '../services/category.service';

export function GameSettings() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  const { settings } = useFiveSecondsState();
  const { updateSettings } = useFiveSecondsActions();
  const { data: categories } = useCategories({
    language: i18n.language as SupportedLanguage,
  });

  const language = (i18n.language.startsWith('ar') ? 'ar' : 'en') as SupportedLanguage;

  const handleCategoryChange = async (categoryId: string) => {
    if (!settings.categoryIds)
      return;

    const newCategoryIds = settings.categoryIds.includes(categoryId)
      ? settings.categoryIds.filter(id => id !== categoryId)
      : [...settings.categoryIds, categoryId];

    updateSettings({ categoryIds: newCategoryIds });

    try {
      await queryClient.prefetchQuery({
        queryKey: ['categories', categoryId, language],
        queryFn: () => getCategoryById({ id: categoryId, language }),
        staleTime: 10 * 60 * 1000, // same as useCategory
        gcTime: 20 * 60 * 1000,
      });
    }
    catch (err) {
      console.error('Failed to prefetch category', categoryId, err);
    }
  };

  // This ensures the cache is ready if the user had selections from a previous session
  useEffect(() => {
    settings.categoryIds?.forEach((id) => {
      queryClient.prefetchQuery({
        queryKey: ['categories', id, language],
        queryFn: () => getCategoryById({ id, language }),
        staleTime: 10 * 60 * 1000,
        gcTime: 20 * 60 * 1000,
      });
    });
  }, [settings.categoryIds, language, queryClient]);

  return (
    <div className="space-y-6">
      {/* Difficulty */}
      <div className="space-y-2">
        <Label>{t('fiveSecondsGame.lobby.difficulty')}</Label>
        <Select
          value={settings.difficulty}
          onValueChange={value => updateSettings({ difficulty: value as any })}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('fiveSecondsGame.lobby.difficulty')} />
          </SelectTrigger>
          <SelectContent>
            {difficultySchema.options.map(diff => (
              <SelectItem key={diff} value={diff}>
                {t(diff.toLowerCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <Label>{t('fiveSecondsGame.lobby.categories')}</Label>
        <div className="flex flex-wrap gap-2">
          {categories?.map(cat => (
            <Button
              key={cat.id}
              variant={
                settings.categoryIds?.includes(cat.id) ? 'default' : 'outline'
              }
              size="sm"
              onClick={() => handleCategoryChange(cat.id)}
              className="rounded-full"
            >
              {t(cat.name)}
            </Button>
          ))}
        </div>
      </div>

      {/* Time Per Turn */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-muted-foreground">
          {t('fiveSecondsGame.lobby.timePerTurn')}
        </Label>
        <div className="flex items-center gap-4">
          <Timer className="w-5 h-5 text-accent" />
          <div className="flex gap-2 flex-1">
            {[5, 10, 15].map(time => (
              <Button
                key={time}
                variant={settings.timePerTurn === time ? 'default' : 'outline'}
                onClick={() => updateSettings({ timePerTurn: time })}
                className="flex-1"
              >
                {t('fiveSecondsGame.lobby.timeUnit', { time })}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Rounds to Win */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-muted-foreground">
          {t('fiveSecondsGame.lobby.roundsToWin')}
        </Label>
        <div className="flex items-center gap-4">
          <Trophy className="w-5 h-5 text-accent" />
          <div className="flex gap-2 flex-1">
            {[3, 5, 7].map(rounds => (
              <Button
                key={rounds}
                variant={settings.roundsToWin === rounds ? 'default' : 'outline'}
                onClick={() => updateSettings({ roundsToWin: rounds })}
                className="flex-1"
              >
                {t('fiveSecondsGame.lobby.roundsUnit', { rounds })}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
