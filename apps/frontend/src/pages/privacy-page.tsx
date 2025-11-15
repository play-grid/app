import { useTranslation } from 'react-i18next';

export default function PrivacyPage() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto max-w-3xl py-8 p-4">
      <h1 className="mb-6 text-3xl font-bold">{t('privacy.title')}</h1>
      <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">

        <p>{t('privacy.p1')}</p>

        <h2 className="mt-8 mb-3 text-2xl font-bold">{t('privacy.subtitle1')}</h2>
        <p className="whitespace-pre-line">{t('privacy.p2')}</p>

        <h2 className="mt-8 mb-3 text-2xl font-bold">{t('privacy.subtitle2')}</h2>
        <p className="whitespace-pre-line">{t('privacy.p3')}</p>

        <h2 className="mt-8 mb-3 text-2xl font-bold">{t('privacy.subtitle3')}</h2>
        <p className="whitespace-pre-line">{t('privacy.p4')}</p>

        <h2 className="mt-8 mb-3 text-2xl font-bold">{t('privacy.subtitle4')}</h2>
        <p>{t('privacy.p5')}</p>

        <h2 className="mt-8 mb-3 text-2xl font-bold">{t('privacy.subtitle5')}</h2>
        <p className="whitespace-pre-line">{t('privacy.p6')}</p>

        <h2 className="mt-8 mb-3 text-2xl font-bold">{t('privacy.subtitle6')}</h2>
        <p>{t('privacy.p7')}</p>

        <h2 className="mt-8 mb-3 text-2xl font-bold">{t('privacy.subtitle7')}</h2>
        <p>{t('privacy.p8')}</p>

        <h2 className="mt-8 mb-3 text-2xl font-bold">{t('privacy.subtitle8')}</h2>
        <p>{t('privacy.p9')}</p>

        <p className="mt-8">{t('privacy.contact')}</p>
        {' '}
        <a href="mailto:info@mohdalaa.com">info@mohdalaa.com</a>
        {' '}
        <p className="text-sm text-muted-foreground">{t('privacy.lastUpdate')}</p>
      </div>
    </div>

  );
}
