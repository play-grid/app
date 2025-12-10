import type { LogoContent } from '../base.schema';
import type { GuessLogoAction } from '../logic';
import { useDispatch, useGameActions } from '@guess-logo/game-core';
import { useCallback } from 'react';

export function useGuessLogoActions() {
  const dispatch = useDispatch<GuessLogoAction>();
  const coreActions = useGameActions();

  const loadContent = useCallback(
    async (logos: LogoContent[]) => {
      await dispatch({ type: 'LOAD_CONTENT', payload: { logos } });
    },
    [dispatch],
  );

  const eliminateLogo = useCallback(
    async (playerId: string, logoId: number) => {
      await dispatch({ type: 'ELIMINATE_LOGO', payload: { playerId, logoId } });
    },
    [dispatch],
  );

  const restoreLogo = useCallback(
    async (playerId: string, logoId: number) => {
      await dispatch({ type: 'RESTORE_LOGO', payload: { playerId, logoId } });
    },
    [dispatch],
  );

  const checkWinner = useCallback(
    async (playerId: string) => {
      await dispatch({ type: 'CHECK_WINNER', payload: { playerId } });
    },
    [dispatch],
  );

  const shuffleLogos = useCallback(
    async (logos: LogoContent[]) => {
      await dispatch({ type: 'SHUFFLE_LOGOS', payload: { logos } });
    },
    [dispatch],
  );

  return {
    ...coreActions,
    loadContent,
    eliminateLogo,
    restoreLogo,
    checkWinner,
    shuffleLogos,
  };
}
