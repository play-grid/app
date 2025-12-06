import { AuthUIProvider } from '@daveyplate/better-auth-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';
import { authClient } from '@/lib/auth-client';
import { logger } from '@/utils/logger';
import arAuth from '../../public/auth-ar.json';

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isAr = i18n.language.startsWith('ar');

  return (
    <AuthUIProvider
      authClient={authClient}
      navigate={href => navigate(href)}
      additionalFields={{
        username: {
          label: 'Username',
          required: false,
          type: 'string',
          validate: async (value: string) => {
            try {
              const { data, error } = await authClient.isUsernameAvailable({
                username: value,
              });

              if (error) {
                logger.error(error, 'Error checking username:');
                return false;
              }

              return !!data?.available;
            }
            catch (err) {
              logger.error(err, 'Unexpected error:');
              return false;
            }
          },
        },
      }}
      localization={
        isAr
          ? arAuth
          : {
              SIGN_IN: 'Log in',
              SIGN_IN_DESCRIPTION:
                'Use your email and password to log in.',
              SIGN_UP: 'Create Account',
              FORGOT_PASSWORD: 'Reset Password',
              EMAIL_PLACEHOLDER: 'your-email@example.com',
              PASSWORD_PLACEHOLDER: 'Secret password',
              MAGIC_LINK_EMAIL: 'Check your inbox for your login link!',
              FORGOT_PASSWORD_EMAIL:
                'Check your inbox for the password reset link.',
              RESET_PASSWORD_SUCCESS:
                'You can now sign in with your new password!',
              CHANGE_PASSWORD_SUCCESS:
                'Your password has been successfully updated.',
              DELETE_ACCOUNT_SUCCESS:
                'Your account has been permanently deleted.',
            }
      }
      Link={ReactRouterLink}
    >
      {children}
    </AuthUIProvider>
  );
}
