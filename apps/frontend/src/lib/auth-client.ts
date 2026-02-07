import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: '',
  credentials: 'include',
  paths: {
    session: '/api/get-session',
    signup: {
      email: '/api/sign-up/email',
    },
  },
});
