import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useLanguageNavigation } from '@/hooks/use-language-navigation';

export function InvalidGame() {
  const { navigate } = useLanguageNavigation();
  const { t } = useTranslation();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <div className="text-center p-8 max-w-md">
        <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-2">{t('invalid-game-title')}</h1>
        <p className="text-muted-foreground mb-8">
          {t('invalid-game-description')}
        </p>
        <Button onClick={handleGoHome} size="lg">
          {t('back-to-home')}
        </Button>
      </div>
    </div>
  );
}
