import type { SupportedLanguage } from '@guess-logo/shared/types';
import {
  difficultySchema,
  useFiveSecondsActions,
  useFiveSecondsState,
} from '@guess-logo/five-seconds';
import { ClockIcon, TrophyIcon } from '@guess-logo/ui/icons';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useRoomPermissions } from '@/context/room-permissions';
import { cn } from '@/lib/utils';
import { logger } from '@/utils/logger';

import { useCategories } from '../hooks/use-categories';
import { getCategoryById } from '../services/category.service';
import { getLocalizedCategoryName } from '../utils/category-utils';
import { Button } from './ui/button';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export function GameSettings() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  const { players, settings } = useFiveSecondsState();
  const { updateSettings } = useFiveSecondsActions();
  const { data: categories } = useCategories();

  const permissions = useRoomPermissions(players);
  const canEdit = permissions.canEditSettings;

  const language = (i18n.language.startsWith('ar') ? 'ar' : 'en'
  ) as SupportedLanguage;

  const handleCategoryChange = async (categoryId: string) => {
    if (!settings.categoryIds)
      return;

    const newCategoryIds = settings.categoryIds.includes(categoryId)
      ? settings.categoryIds.filter(id => id !== categoryId)
      : [...settings.categoryIds, categoryId];

    updateSettings({ categoryIds: newCategoryIds });

    try {
      await queryClient.prefetchQuery({
        queryKey: ['categories', categoryId],
        queryFn: () => getCategoryById({ id: categoryId }),
        staleTime: 10 * 60 * 1000,
        gcTime: 20 * 60 * 1000,
      });
    }
    catch (err) {
      logger.error({ categoryId, err }, 'Failed to prefetch category');
    }
  };

  useEffect(() => {
    settings.categoryIds?.forEach((id) => {
      queryClient.prefetchQuery({
        queryKey: ['categories', id],
        queryFn: () => getCategoryById({ id }),
        staleTime: 10 * 60 * 1000,
        gcTime: 20 * 60 * 1000,
      });
    });
  }, [settings.categoryIds, queryClient]);

  const content = (
    <div
      className={cn('space-y-6', {
        'opacity-50': !canEdit,
      })}
    >
      {/* Difficulty */}
      <div className="space-y-2">
        <Label>{t('fiveSecondsGame.lobby.difficulty')}</Label>
        <Select
          value={settings.difficulty}
          onValueChange={value =>
            updateSettings({ difficulty: value as any })}
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
            >
              {getLocalizedCategoryName(cat, language)}
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
          <ClockIcon className="w-5 h-5" />
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
          <TrophyIcon className="w-5 h-5" />
          <div className="flex gap-2 flex-1">
            {[3, 5, 7].map(rounds => (
              <Button
                key={rounds}
                variant={
                  settings.roundsToWin === rounds ? 'default' : 'outline'
                }
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

  if (!canEdit) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative cursor-not-allowed">
            <div className="absolute inset-0 z-10" />
            {content}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('fiveSecondsGame.lobby.settingsDisabled')}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}
