import { useTranslation } from 'react-i18next';
import { useGameStore } from '../stores/game-state-store';

interface GameUIConfig {
  isLocalLoading: boolean;
  error: Error | null;
  connectionStatus?: 'connected' | 'disconnected';
}

export function useGameUI({
  isLocalLoading,
  error,
}: GameUIConfig) {
  const { t } = useTranslation();
  const { playerA, playerB } = useGameStore();

  if (error) {
    return {
      showError: true,
      errorMessage: error.message || t('error-loading-game'),
      showLoading: false,
      loadingMessage: '',
    };
  }

  if (isLocalLoading) {
    return {
      showError: false,
      errorMessage: '',
      showLoading: true,
      loadingMessage: `${t('loading-game-for')} ${playerA.name} vs ${playerB.name}`,
    };
  }

  return {
    showError: false,
    errorMessage: '',
    showLoading: false,
    loadingMessage: '',
  };
}
