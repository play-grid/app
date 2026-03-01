import { useStatClashState } from '@playgrid/stat-clash';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StatClashGameRoutes, StatClashLobbyRoutes } from './routes';

export default function StatClashPage() {
  const { phase } = useStatClashState();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (phase === 'lobby' && !path.includes('/lobby')) {
      navigate('lobby', { replace: true });
    }
    else if (phase === 'playing' && !path.includes('/gameplay')) {
      navigate('gameplay', { replace: true });
    }
    else if (phase === 'results' && !path.includes('/results')) {
      navigate('results', { replace: true });
    }
  }, [phase, location.pathname, navigate]);

  return (
    <>
      {phase === 'lobby' && <StatClashLobbyRoutes />}
      {(phase === 'playing' || phase === 'results') && <StatClashGameRoutes />}
    </>
  );
}
