import { AuthUIProvider } from '@daveyplate/better-auth-ui';
import { PostHogProvider } from '@posthog/react';

import { useTranslation } from 'react-i18next';
import {
  BrowserRouter,
  NavLink,
  redirect,
  useNavigate,
} from 'react-router-dom';
import { NetworkStatusNotifier } from '@/components/network-status-notifier';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import QueryProvider from '@/context/api-provider';
import { I18nReadyProvider } from '@/i18n/i18n-ready-provider';
import { LanguageRouter } from '@/i18n/language-router';
import { authClient } from '@/lib/auth-client';
import App from './app';
import { GameThemeProvider } from './context/game-theme-context';
import { env } from './env';
import authAr from './i18n/auth-ar.json';
import '@/i18n/config';
import './index.css';

function ReactRouterLink(props: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <NavLink to={props.href} className={props.className}>
      {props.children}
    </NavLink>
  );
}

function AppProviders() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  return (
    <QueryProvider>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <GameThemeProvider defaultTheme="platform">
          <TooltipProvider>
            <div className="bg-background text-primary min-h-screen">
              <LanguageRouter>
                <AuthUIProvider
                  authClient={authClient}
                  navigate={navigate}
                  replace={href => redirect(href)}
                  Link={ReactRouterLink}
                  localization={i18n.language === 'ar' ? authAr : undefined}
                  basePath=""
                  viewPaths={{
                    SIGN_IN: 'login',
                    SIGN_OUT: 'logout',
                    SIGN_UP: 'register',
                    FORGOT_PASSWORD: 'forgot',
                    RESET_PASSWORD: 'reset',
                    MAGIC_LINK: 'magic',
                  }}
                >
                  <Toaster richColors />
                  <NetworkStatusNotifier />
                  <App />
                </AuthUIProvider>
              </LanguageRouter>
            </div>
          </TooltipProvider>
        </GameThemeProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}

export default function Root() {
  return (
    <PostHogProvider
      apiKey={env.VITE_PUBLIC_POSTHOG_KEY}
      options={{
        api_host: env.VITE_PUBLIC_POSTHOG_HOST,
        defaults: '2025-05-24',
        capture_exceptions: true,
        autocapture: false,
        capture_pageview: true,
        capture_pageleave: true,
        debug: import.meta.env.MODE === 'development',
      }}
    >
      <BrowserRouter>
        <I18nReadyProvider>
          <AppProviders />
        </I18nReadyProvider>
      </BrowserRouter>
    </PostHogProvider>
  );
}
