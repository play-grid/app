import type { SupportedLanguage } from '@guess-logo/shared/types';
import { Timer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCategories } from '../hooks/use-categories';
import { useFiveSecondsStore } from '../stores/game-store';
import { DIFFICULTIES } from '../types';

export function GameSettings() {
  const { t, i18n } = useTranslation();
  const settings = useFiveSecondsStore(s => s.settings);
  const updateSettings = useFiveSecondsStore(s => s.updateSettings);
  const { data: categories } = useCategories({ language: i18n.language as SupportedLanguage });

  const handleCategoryChange = (categoryId: string) => {
    if (!settings.categoryIds)
      return;
    const newCategoryIds = settings.categoryIds.includes(categoryId)
      ? settings.categoryIds.filter(id => id !== categoryId)
      : [...settings.categoryIds, categoryId];
    updateSettings({ categoryIds: newCategoryIds });
  };

  return (
    <div className="space-y-6">
      {/* Difficulty */}
      <div className="space-y-2">
        <Label>{t('difficulty')}</Label>
        <Select
          value={settings.difficulty}
          onValueChange={value => updateSettings({ difficulty: value as any })}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('fiveSecondsGame.lobby.difficulty')} />
          </SelectTrigger>
          <SelectContent>
            {DIFFICULTIES.map(diff => (
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
          {categories && categories.map(cat => (
            <Button
              key={cat.id}
              variant={settings.categoryIds?.includes(cat.id) ? 'default' : 'outline'}
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
    </div>
  );
}
