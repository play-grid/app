import type { Category } from '@playgrid/stat-clash';
import { useStatClashState } from '@playgrid/stat-clash';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { useStatClashActions } from '../../hooks/use-stat-clash-actions';

export function Step2Category() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const state = useStatClashState();
  const { updateSettings } = useStatClashActions();
  const [selectedCategory, setSelectedCategory] = useState<Category>(state.settings.category);

  const categories: { value: Category; label: string }[] = [
    { value: 'mixed', label: t('statClashGame.lobby.categories.mixed') },
    { value: 'football', label: t('statClashGame.lobby.categories.football') },
    { value: 'companies', label: t('statClashGame.lobby.categories.companies') },
    { value: 'countries', label: t('statClashGame.lobby.categories.countries') },
  ];

  const handleContinue = () => {
    updateSettings({ category: selectedCategory });
    navigate('difficulty', { replace: true });
  };

  return (
    <div className="stat-clash-shell px-4 py-6 md:px-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            {t('statClashGame.lobby.steps.back')}
          </Button>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{t('statClashGame.lobby.category')}</h1>
            <p className="text-muted-foreground">{t('statClashGame.lobby.roundSetupDesc')}</p>
          </div>
        </div>

        <Card className="p-6 space-y-4">
          <Select value={selectedCategory} onValueChange={value => setSelectedCategory(value as Category)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleContinue} size="lg" fullWidth>
            {t('statClashGame.lobby.steps.next')}
          </Button>
        </Card>
      </div>
    </div>
  );
}
