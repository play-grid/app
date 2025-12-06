import { createAuthClient } from 'better-auth/react';
import { env } from '@/env';

export const authClient = createAuthClient({
  baseURL: env.VITE_API_URL,
  credentials: 'include',
  paths: {
    session: '/api/get-session',
    signup: {
      email: '/api/sign-up/email',
    },
  },
});
