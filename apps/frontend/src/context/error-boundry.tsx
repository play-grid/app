import type { FallbackProps } from 'react-error-boundary';
import { Mail, RefreshCw, RotateCcw, TriangleAlert } from 'lucide-react';
import posthog from 'posthog-js';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { logger } from '@/utils/logger';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

function generateErrorId(): string {
  return `ERR-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const { t } = useTranslation();
  const isProduction = import.meta.env.MODE === 'production';
  const errorId = generateErrorId();

  const supportEmail = 'play-grid@mohdalaa.com';
  const handleReportIssue = (): void => {
    const subject = `Error Report - ${errorId}`;
    const body = `Error Code: ${errorId}%0D%0A%0D%0A`;
    const additionalInfo = `%0D%0APlease describe what you were doing when this error occurred:%0D%0A%0D%0AThank you for reporting this issue. We'll investigate and get back to you.`;
    window.location.href = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body + additionalInfo)}`;
  };

  const handleReload = (): void => {
    window.location.reload();
  };

  logger.error({ error, errorId }, 'Uncaught error:');

  if (import.meta.env.PROD) {
    posthog.captureException(error, {
      errorId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    });
  }

  return (
    <div className="flex items-center justify-center min-h-[50vh] w-full bg-background p-4">
      {/* Main Content Container */}
      <div className="flex flex-col items-center w-full max-w-2xl space-y-8">
        {/* Icon Section - Large & Prominent */}
        <div className="flex flex-col items-center space-y-4">
          <div className="rounded-full p-4 bg-secondary ring-1 ring-border">
            <TriangleAlert className="size-16 text-destructive" strokeWidth={1.5} />
          </div>
          <div className="w-24 h-1 bg-border rounded-full" />
        </div>

        {/* Text Content - Centered with breathing room */}
        <div className="flex flex-col items-center space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            {t('errorBoundary.title')}
          </h1>

          <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
            {isProduction ? t('errorBoundary.description') : (error?.message ?? t('errorBoundary.devMessage'))}
          </p>
        </div>

        {/* Error Code - Only in production, more subtle */}
        {isProduction && errorId && (
          <div className="w-full max-w-sm">
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                {t('errorBoundary.errorCode')}
              </p>
              <p className="text-base font-mono font-semibold text-foreground select-all break-all">
                {errorId}
              </p>
            </div>
          </div>
        )}

        {/* Dev Error Details - Styled for development */}
        {!isProduction && error && (
          <div className="w-full max-w-sm">
            <div className="rounded-lg border border-accent bg-accent/30 p-4">
              <p className="text-xs uppercase tracking-wider font-semibold text-accent-foreground mb-2">
                {t('errorBoundary.errorDetails')}
              </p>
              <p className="text-sm text-accent-foreground font-mono wrap-break-word">
                {error.message}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons - Primary + Secondary prominent, report as link */}
        <div className="w-full max-w-sm space-y-4 pt-4">
          {/* Primary and Secondary actions - stacked or side-by-side on larger screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="default"
              size="lg"
              onClick={resetErrorBoundary}
              className="w-full"
            >
              <RefreshCw className="size-4 mr-2" />
              {t('errorBoundary.tryAgain')}
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={handleReload}
              className="w-full"
            >
              <RotateCcw className="size-4 mr-2" />
              {t('errorBoundary.reloadPage')}
            </Button>
          </div>

          <Button
            variant="ghost"
            onClick={handleReportIssue}
            size="lg"
            className="w-full"
          >
            <Mail className="size-4" />
            {t('errorBoundary.reportIssue')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ErrorBoundaryWrapper({ children }: ErrorBoundaryProps) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {children}
    </ErrorBoundary>
  );
}
