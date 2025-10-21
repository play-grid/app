import { BrowserRouter } from 'react-router-dom';
import { NetworkStatusNotifier } from '@/components/network-status-notifier';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import QueryProvider from '@/context/api-provider';
import { LanguageRouter } from '@/i18n/language-router';
import App from './app';
import '@/i18n/config';
import './index.css';

export default function Root() {
  return (
    <BrowserRouter>
      <QueryProvider>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <TooltipProvider>
            <div className="bg-background text-primary min-h-screen">
              <LanguageRouter>
                <Toaster richColors />
                <NetworkStatusNotifier />
                <App />
              </LanguageRouter>
            </div>
          </TooltipProvider>
        </ThemeProvider>
      </QueryProvider>
    </BrowserRouter>
  );
}
