import type { SupportedLanguage } from '@guess-logo/shared/types';
import {
  difficultySchema,
  useFiveSecondsActions,
  useFiveSecondsState,
} from '@guess-logo/five-seconds';
import { ClockIcon, TrophyIcon, UploadIcon } from '@guess-logo/ui/icons';
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
import { useCustomQuestionsStore } from '../stores/custom-questions-store';
import { getLocalizedCategoryName } from '../utils/category-utils';
import { BulkImportDialog } from './bulk-import-dialog';
import { CustomQuestionsList } from './custom-questions-list';
import { Button } from './ui/button';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Switch } from './ui/switch';

export function GameSettings() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  const { players, settings } = useFiveSecondsState();
  const { updateSettings } = useFiveSecondsActions();
  const { data: categories } = useCategories();
  const { customCategories } = useCustomQuestionsStore();

  const permissions = useRoomPermissions(players);
  const canEdit = permissions.canEditSettings;

  const language = (i18n.language.startsWith('ar') ? 'ar' : 'en'
  ) as SupportedLanguage;

  const handleServerCategoryChange = async (categoryId: string) => {
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

  const handleCustomCategoryChange = (categoryId: string) => {
    const currentIds = settings.customCategoryIds || [];
    const newCategoryIds = currentIds.includes(categoryId)
      ? currentIds.filter(id => id !== categoryId)
      : [...currentIds, categoryId];

    updateSettings({ customCategoryIds: newCategoryIds });
  };

  useEffect(() => {
    if (!settings.useCustomQuestions) {
      settings.categoryIds?.forEach((id) => {
        queryClient.prefetchQuery({
          queryKey: ['categories', id],
          queryFn: () => getCategoryById({ id }),
          staleTime: 10 * 60 * 1000,
          gcTime: 20 * 60 * 1000,
        });
      });
    }
  }, [settings.categoryIds, settings.useCustomQuestions, queryClient]);

  const content = (
    <div
      className={cn('space-y-6', {
        'opacity-50': !canEdit,
      })}
    >
      {/* Use Custom Questions Toggle */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Switch
            id="use-custom-questions"
            checked={settings.useCustomQuestions || false}
            onCheckedChange={(checked: boolean) => updateSettings({
              useCustomQuestions: checked,
              categoryIds: checked ? [] : settings.categoryIds,
              customCategoryIds: checked ? settings.customCategoryIds : [],
            })}
          />
          <Label htmlFor="use-custom-questions">
            {t('fiveSecondsGame.lobby.useCustomQuestions')}
          </Label>
        </div>
      </div>

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
      {settings.useCustomQuestions
        ? (
            <div className="space-y-2">
              <Label>{t('fiveSecondsGame.lobby.customCategories')}</Label>
              <div className="flex flex-wrap gap-2">
                {customCategories.map(cat => (
                  <Button
                    key={cat}
                    variant={
                      settings.customCategoryIds?.includes(cat) ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => handleCustomCategoryChange(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
              {customCategories.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {t('fiveSecondsGame.lobby.noCustomCategories')}
                </p>
              )}
            </div>
          )
        : (
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
                    onClick={() => handleServerCategoryChange(cat.id)}
                  >
                    {getLocalizedCategoryName(cat, language)}
                  </Button>
                ))}
              </div>
            </div>
          )}

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

      {settings.useCustomQuestions
        ? (
            <>
              {/* Bulk Import */}
              <div className="pt-4 border-t">
                <BulkImportDialog>
                  <Button className="w-full" variant="outline">
                    <UploadIcon className="w-4 h-4 mr-2" />
                    {t('fiveSecondsGame.bulkImport.title')}
                  </Button>
                </BulkImportDialog>
              </div>

              {/* Custom Questions */}
              <CustomQuestionsList />
            </>
          )
        : (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {t('fiveSecondsGame.lobby.customModeDisabled')}
              </p>
            </div>
          )}
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
