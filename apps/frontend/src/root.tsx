import { BrowserRouter } from 'react-router-dom';
import QueryProvider from '@/context/api-provider';
import { LanguageRouter } from '@/i18n/language-router';
import App from './app';
import '@/i18n/config';
import './index.css';

export default function Root() {
  return (
    <BrowserRouter>
      <QueryProvider>
        <LanguageRouter>
          <App />
        </LanguageRouter>
      </QueryProvider>
    </BrowserRouter>
  );
}
