import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import QueryProvider from '@/context/api-provider'
import { LanguageRouter } from '@/i18n/language-router'
import App from './App'
import '@/i18n/config'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <LanguageRouter>
        <App />
      </LanguageRouter>
    </QueryProvider>
  </StrictMode>,
)
