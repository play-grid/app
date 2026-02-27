import type { Difficulty } from '@guess-logo/stat-clash';
import { useStatClashState } from '@guess-logo/stat-clash';
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

export function Step3Difficulty() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const state = useStatClashState();
  const { updateSettings } = useStatClashActions();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(state.settings.difficulty);

  const difficulties: { value: Difficulty; label: string }[] = [
    { value: 'easy', label: t('statClashGame.lobby.difficultyOptions.easy') },
    { value: 'medium', label: t('statClashGame.lobby.difficultyOptions.medium') },
    { value: 'hard', label: t('statClashGame.lobby.difficultyOptions.hard') },
  ];

  const handleContinue = () => {
    updateSettings({ difficulty: selectedDifficulty });
    navigate('metric-type', { replace: true });
  };

  return (
    <div className="stat-clash-shell px-4 py-6 md:px-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            {t('statClashGame.lobby.steps.back')}
          </Button>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{t('statClashGame.lobby.difficulty')}</h1>
            <p className="text-muted-foreground">{t('statClashGame.lobby.roundSetupDesc')}</p>
          </div>
        </div>

        <Card className="p-6 space-y-4">
          <Select value={selectedDifficulty} onValueChange={value => setSelectedDifficulty(value as Difficulty)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {difficulties.map(difficulty => (
                <SelectItem key={difficulty.value} value={difficulty.value}>
                  {difficulty.label}
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
