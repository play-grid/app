import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

export function Footer() {
  const { t } = useTranslation();
  const location = useLocation();
  const lang = location.pathname.split('/')[1] || 'en';

  return (
    <footer className="py-6 md:py-8">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 text-center text-sm text-muted-foreground sm:flex-row">
        <div className="flex gap-x-6 gap-y-2">
          <Link to={`/${lang}/about`} className="hover:underline">
            {t('home.about')}
          </Link>
          {/* <Link to={`/${lang}/legal`} className="hover:underline">
            {t('legal.title')}
          </Link> */}
          <Link to={`/${lang}/privacy`} className="hover:underline">
            {t('privacy.title')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
