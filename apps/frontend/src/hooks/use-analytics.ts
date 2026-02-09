import type {
  AnalyticsEvent,
  GameCompletionProperties,
  GameProperties,
  GameResetProperties,
  GridChangeProperties,
  ListChangeProperties,
  TurnProperties,
  VoteProperties,
} from '@/lib/analytics-types';
import { usePostHog } from '@posthog/react';
import { useCallback } from 'react';

export function useAnalytics() {
  const posthog = usePostHog();

  const capture = useCallback((analyticsEvent: AnalyticsEvent) => {
    posthog.capture(analyticsEvent.event, {
      ...analyticsEvent.properties,
      timestamp: new Date().toISOString(),
    });
  }, [posthog]);

  const trackGameSelected = useCallback((props: GameProperties) => {
    capture({ event: 'game_selected', properties: props });
  }, [capture]);

  const trackGameStart = useCallback((props: GameProperties) => {
    capture({ event: 'game_start', properties: props });
  }, [capture]);

  const trackGameComplete = useCallback((props: GameCompletionProperties) => {
    capture({ event: 'game_complete', properties: props });
  }, [capture]);

  const trackGameReset = useCallback((props: GameResetProperties) => {
    capture({ event: 'game_reset', properties: props });
  }, [capture]);

  const trackGameQuit = useCallback((props: Pick<GameProperties, 'game_id'>) => {
    capture({
      event: 'game_quit',
      properties: { game_id: props.game_id },
    });
  }, [capture]);

  const trackGameModeSelected = useCallback((
    game_id: string,
    mode: 'local' | 'multiplayer',
    properties?: Partial<GameProperties>,
  ) => {
    capture({
      event: 'game_mode_selected',
      properties: {
        game_id,
        game_mode: mode,
        ...properties,
      },
    });
  }, [capture]);

  const trackTurnStart = useCallback((props: TurnProperties) => {
    capture({ event: 'turn_start', properties: props });
  }, [capture]);

  const trackTurnComplete = useCallback((props: TurnProperties) => {
    capture({ event: 'turn_complete', properties: props });
  }, [capture]);

  const trackVoteSubmit = useCallback((props: VoteProperties) => {
    capture({ event: 'vote_submit', properties: props });
  }, [capture]);

  const trackGridSizeChange = useCallback((props: GridChangeProperties) => {
    capture({ event: 'grid_size_change', properties: props });
  }, [capture]);

  const trackListChange = useCallback((props: ListChangeProperties) => {
    capture({ event: 'list_change', properties: props });
  }, [capture]);

  const trackTurnSwitch = useCallback((props: TurnProperties) => {
    capture({ event: 'turn_switch', properties: props });
  }, [capture]);

  return {
    trackGameSelected,
    trackGameStart,
    trackGameComplete,
    trackGameReset,
    trackGameQuit,
    trackGameModeSelected,
    trackTurnStart,
    trackTurnComplete,
    trackVoteSubmit,
    trackGridSizeChange,
    trackListChange,
    trackTurnSwitch,
  };
}
