import { useTranslation } from 'react-i18next';

export default function LegalPage() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto max-w-3xl py-8 p-4">
      <h1 className="mb-4 text-3xl font-bold">{t('legal.title')}</h1>
      <div className="prose prose-lg dark:prose-invert max-w-none px-4">
        <p>{t('legal.p1')}</p>
        <p>{t('legal.p2')}</p>
        <h2 className="mt-6 mb-2 text-2xl font-bold">{t('legal.subtitle1')}</h2>
        <p>{t('legal.p3')}</p>
        <p>{t('legal.p4')}</p>
      </div>
    </div>
  );
}
