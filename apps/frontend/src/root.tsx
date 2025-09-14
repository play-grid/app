import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
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
          <div className="bg-background text-primary min-h-screen">
            <LanguageRouter>
              <App />
            </LanguageRouter>
          </div>
        </ThemeProvider>
      </QueryProvider>
    </BrowserRouter>
  );
}
