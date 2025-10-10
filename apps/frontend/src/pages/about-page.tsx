import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import BackButton from '@/components/back-button';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const AUTHOR_X_HANDLE = '_mohdalaa';

export default function AboutPage() {
  const { t } = useTranslation('about');

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6">
      {/* Header Section */}
      <div className="space-y-2">
        <BackButton />
        <h1 className="text-3xl font-bold text-foreground">
          {t('about.app_info_title')}
        </h1>
        <p className="text-muted-foreground">
          Learn more about this application and its creator
        </p>
      </div>

      <Separator className="bg-border" />

      {/* Main Content Grid */}
      <div className="grid gap-6">
        {/* Developer Card */}
        <Card className="p-6 rounded-lg space-y-4 border border-border">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-secondary/50">
              <Icon
                icon="solar:user-rounded-line-duotone"
                className="w-6 h-6 text-secondary-foreground"
              />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h2 className="text-sm font-medium text-muted-foreground mb-1">
                  {t('about.developer_label')}
                </h2>
                <p className="text-xl font-bold text-foreground">
                  {t('about.author_name')}
                </p>
              </div>

              <a
                href={`https://x.com/${AUTHOR_X_HANDLE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer"
              >
                <Button variant="default">
                  <Icon icon="fa-brands:x-twitter" className="w-4 h-4" />
                  <span>{t('about.follow_on_x', { handle: AUTHOR_X_HANDLE })}</span>
                </Button>
              </a>
            </div>
          </div>
        </Card>

        {/* Fun Fact Card */}
        <Card className="p-6 space-y-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <Icon
                icon="solar:star-bold"
                className="w-5 h-5 text-destructive"
              />
            </div>
            <h2 className="text-lg font-bold text-foreground">
              {t('about.fun_fact_title')}
            </h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {t('about.fun_fact_content')}
          </p>
        </Card>

        {/* Version Info */}
        <div className={cn(
          'p-4 rounded-lg text-center',
          'bg-muted/50 border border-border',
        )}
        >
          <p className="text-sm text-muted-foreground">
            {t('about.version_info')}
            {' '}
            🚀
          </p>
        </div>
      </div>
    </div>
  );
}
