import { useTranslation } from 'react-i18next';
import packageJson from '@/../package.json';
import BackButton from '@/components/back-button';
import { PageContainer } from '@/components/page-container';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// const AUTHOR_X_HANDLE = '_mohdalaa';

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <PageContainer maxWidth="4xl" className="space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <BackButton />
        <h1 className="text-3xl font-bold text-foreground">
          {t('about.app_info_title')}
        </h1>
      </div>

      <Separator className="bg-border" />

      {/* Main Content Grid */}
      <div className="grid gap-6">
        <p>{t('about.p1')}</p>
        <h2 className="mt-8 mb-3 text-2xl font-bold">{t('about.subtitle1')}</h2>
        <li>{t('about.p2')}</li>
        <li>{t('about.p3')}</li>
        <li>{t('about.p4')}</li>
        <h2 className="mt-8 mb-3 text-2xl tracking-wider font-bold">{t('about.subtitle2')}</h2>
        <li>{t('about.p5')}</li>
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-1">
            {t('about.p6')}
          </h2>
          <a
            href="https://r2.playgrid.mohdalaa.com/LICENSES.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            {t('about.p62')}
          </a>
        </div>
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-1">
            {t('about.developer_label')}
          </h2>
          <a
            href="https://mohdalaa.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer"
          >

            <p className="text-xl font-bold text-foreground">
              {t('about.author_name')}
            </p>
          </a>
        </div>
      </div>
      {/* Version Info */}
      <div className={cn(
        'p-4 rounded-lg text-center',
        'bg-muted/50 border border-border',
      )}
      >
        <p className="text-sm text-muted-foreground">
          {t('about.version_info')}
          {' '}
          {packageJson.version}
          {' '}
          🚀
        </p>
      </div>
    </PageContainer>
  );
}
