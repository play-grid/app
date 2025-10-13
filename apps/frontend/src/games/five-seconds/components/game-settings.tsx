import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFiveSecondsStore } from '../store';
import { CATEGORIES, DIFFICULTIES } from '../types';

export function GameSettings() {
  const { t } = useTranslation();
  const settings = useFiveSecondsStore(s => s.settings);
  const updateSettings = useFiveSecondsStore(s => s.updateSettings);

  const handleCategoryChange = (category: string) => {
    const newCategories = settings.categories.includes(category as any)
      ? settings.categories.filter(c => c !== category)
      : [...settings.categories, category as any];
    updateSettings({ categories: newCategories });
  };

  return (
    <Card className="p-4 space-y-4">
      <h3 className="font-semibold">{t('game-settings')}</h3>
      <div className="space-y-2">
        <Label>{t('difficulty')}</Label>
        <Select
          value={settings.difficulty}
          onValueChange={value => updateSettings({ difficulty: value as any })}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('select-difficulty')} />
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
      <div className="space-y-2">
        <Label>{t('categories')}</Label>
        <div className="space-y-1">
          {CATEGORIES.map(cat => (
            <div key={cat} className="flex items-center gap-2">
              <Checkbox
                id={`cat-${cat}`}
                checked={settings.categories.includes(cat)}
                onCheckedChange={() => handleCategoryChange(cat)}
              />
              <Label htmlFor={`cat-${cat}`}>{t(cat)}</Label>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
