import { AuthQueryProvider } from '@daveyplate/better-auth-tanstack';
import { AuthUIProviderTanstack } from '@daveyplate/better-auth-ui/tanstack';
import { BrowserRouter, NavLink, redirect, useNavigate } from 'react-router-dom';
import { NetworkStatusNotifier } from '@/components/network-status-notifier';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import QueryProvider from '@/context/api-provider';
import { LanguageRouter } from '@/i18n/language-router';
import { authClient } from '@/lib/auth-client';
import App from './app';
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

  return (
    <QueryProvider>
      <AuthQueryProvider>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <TooltipProvider>
            <div className="bg-background text-primary min-h-screen">
              <LanguageRouter>
                <AuthUIProviderTanstack
                  authClient={authClient}
                  navigate={navigate}
                  replace={href => redirect(href)}
                  Link={ReactRouterLink}
                >
                  <Toaster richColors />
                  <NetworkStatusNotifier />
                  <App />
                </AuthUIProviderTanstack>
              </LanguageRouter>
            </div>
          </TooltipProvider>
        </ThemeProvider>
      </AuthQueryProvider>
    </QueryProvider>
  );
}

export default function Root() {
  return (
    <BrowserRouter>
      <AppProviders />
    </BrowserRouter>
  );
}
