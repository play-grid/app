import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface NotFoundPageProps {
  titleKey?: string;
  messageKey?: string;
  backTo?: string;
  backToTextKey?: string;
}

export default function NotFoundPage({
  titleKey = 'notFound.global.title',
  messageKey = 'notFound.global.message',
  backTo,
  backToTextKey = 'notFound.global.backTo',
}: NotFoundPageProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const lang = location.pathname.split('/')[1] || 'en';

  const finalBackTo = backTo || `/${lang}`;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold">{t(titleKey)}</h1>
      <p className="mt-4 text-lg">{t(messageKey)}</p>
      <Button asChild className="mt-8">
        <Link to={finalBackTo}>{t(backToTextKey)}</Link>
      </Button>
    </div>
  );
}
