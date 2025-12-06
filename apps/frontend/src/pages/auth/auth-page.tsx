import { AuthView } from '@daveyplate/better-auth-ui';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authHooks } from '@/hooks/auth-hooks';

export default function AuthPage() {
  const { pathname } = useParams();
  const navigate = useNavigate();
  const { useSession } = authHooks;
  const session = useSession();

  useEffect(() => {
    if (session.data) {
      navigate('/');
    }
  }, [session.data, navigate]);

  return (
    <main className="container mx-auto flex grow flex-col items-center justify-center gap-3 self-center p-4 md:p-6">
      <AuthView pathname={pathname} />
    </main>
  );
}
