import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { useStatClashActions } from '../../hooks/use-stat-clash-actions';

export function Step4MetricType() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { updateSettings } = useStatClashActions();
  const [metricType, setMetricType] = useState('');

  const handleContinue = () => {
    updateSettings({ metricType: metricType.trim() || undefined });
    navigate('review', { replace: true });
  };

  const handleSkip = () => {
    handleContinue();
  };

  return (
    <div className="stat-clash-shell px-4 py-6 md:px-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            {t('statClashGame.lobby.steps.back')}
          </Button>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{t('statClashGame.lobby.optionalMetricType')}</h1>
            <p className="text-muted-foreground">{t('statClashGame.lobby.roundSetupDesc')}</p>
          </div>
        </div>

        <Card className="p-6 space-y-4">
          <Input
            value={metricType}
            onChange={e => setMetricType(e.target.value)}
            placeholder={t('statClashGame.lobby.metricTypePlaceholder')}
            className="text-lg"
          />
          <div className="flex gap-4">
            <Button onClick={handleSkip} variant="outline" size="lg">
              {t('statClashGame.lobby.steps.skip')}
            </Button>
            <Button onClick={handleContinue} size="lg" className="flex-1">
              {t('statClashGame.lobby.steps.next')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
