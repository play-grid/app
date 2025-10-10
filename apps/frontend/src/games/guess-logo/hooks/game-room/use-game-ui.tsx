import type { GameMode } from './use-game-mode-detection';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../stores/game-state-store';

interface GameUIConfig {
  mode: GameMode;
  isLocalLoading: boolean;
  localError: Error | null;
  connectionStatus?: 'connected' | 'disconnected';
}

export function useGameUI({
  mode,
  isLocalLoading,
  localError,
  connectionStatus,
}: GameUIConfig) {
  const { t } = useTranslation();
  const { gameInitialized, playerA, playerB } = useGameStore();

  if (mode === 'invalid') {
    return {
      showError: true,
      errorMessage: t('invalid-game-link'),
      showLoading: false,
      loadingMessage: '',
    };
  }

  if (mode === 'local') {
    if (localError) {
      return {
        showError: true,
        errorMessage: localError.message || t('error-loading-game'),
        showLoading: false,
        loadingMessage: '',
      };
    }

    if (isLocalLoading || !gameInitialized) {
      return {
        showError: false,
        errorMessage: '',
        showLoading: true,
        loadingMessage: `${t('loading-game-for')} ${playerA.name} vs ${playerB.name}`,
      };
    }
  }

  if (mode === 'online') {
    if (!gameInitialized && connectionStatus !== 'connected') {
      return {
        showError: false,
        errorMessage: '',
        showLoading: true,
        loadingMessage: t('connecting-to-room'),
      };
    }

    if (!gameInitialized && connectionStatus === 'connected') {
      return {
        showError: false,
        errorMessage: '',
        showLoading: true,
        loadingMessage: t('waiting-for-game-state'),
      };
    }

    if (gameInitialized && connectionStatus === 'disconnected') {
      return {
        showError: true,
        errorMessage: t('connection-lost'),
        showLoading: false,
        loadingMessage: '',
      };
    }
  }

  return {
    showError: false,
    errorMessage: '',
    showLoading: false,
    loadingMessage: '',
  };
}
