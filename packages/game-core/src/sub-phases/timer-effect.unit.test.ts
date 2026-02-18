import type { GameEffectContext } from '../contracts/game-effects';
import type { SubPhaseConfig } from './types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSubPhaseTimerEffect } from './timer-effect';

describe('createSubPhaseTimerEffect', () => {
  let mockDispatch: ReturnType<typeof vi.fn>;
  let mockStorage: {
    put: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    setAlarm: ReturnType<typeof vi.fn>;
    deleteAlarm: ReturnType<typeof vi.fn>;
  };
  let clientContext: GameEffectContext;
  let serverContext: GameEffectContext;
  let config: SubPhaseConfig<any>;

  beforeEach(() => {
    vi.useFakeTimers();
    mockDispatch = vi.fn();

    mockStorage = {
      put: vi.fn().mockResolvedValue(undefined),
      get: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
      setAlarm: vi.fn().mockResolvedValue(undefined),
      deleteAlarm: vi.fn().mockResolvedValue(undefined),
    };

    config = {
      phases: [
        {
          id: 'reading',
          duration: () => 2000,
          onComplete: 'START_ANSWERING',
        },
        {
          id: 'answering',
          duration: state => state.settings.duration * 1000,
          onComplete: 'TIMES_UP',
        },
      ],
      getCurrentPhase: state => state.phase,
    };

    clientContext = {
      state: { phase: null, timerEndsAt: null, settings: { duration: 5 } } as any,
      action: { type: 'TEST' },
      apiUrl: 'http://localhost:8787',
      dispatch: mockDispatch as any,
      ctx: {},
    };

    serverContext = {
      state: { phase: null, timerEndsAt: null, settings: { duration: 5 } } as any,
      action: { type: 'TEST' },
      apiUrl: 'http://localhost:8787',
      dispatch: mockDispatch as any,
      ctx: { storage: mockStorage },
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('client Mode (Browser)', () => {
    it('should return null when no phase is active', async () => {
      const effect = createSubPhaseTimerEffect(config);
      const result = await effect(clientContext);

      expect(result).toBeNull();
    });

    it('should start timer when entering a new phase', async () => {
      const effect = createSubPhaseTimerEffect(config);
      (clientContext.state as any).phase = 'reading';

      const result = await effect(clientContext);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('SUB_PHASE_TIMER_STARTED');
      expect((result as any)?.payload.phase).toBe('reading');
      expect((result as any)?.payload.endsAt).toBeGreaterThan(Date.now());
    });

    it('should dispatch onComplete action when timer expires', async () => {
      const effect = createSubPhaseTimerEffect(config);
      (clientContext.state as any).phase = 'reading';

      await effect(clientContext);

      expect(mockDispatch).not.toHaveBeenCalled();

      vi.advanceTimersByTime(2000);

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'START_ANSWERING' });
    });

    it('should not start a new timer for the same phase', async () => {
      const effect = createSubPhaseTimerEffect(config);
      (clientContext.state as any).phase = 'reading';

      const result1 = await effect(clientContext);
      expect(result1).not.toBeNull();

      const result2 = await effect(clientContext);
      expect(result2).toBeNull();
    });

    it('should clear previous timer when phase changes', async () => {
      const effect = createSubPhaseTimerEffect(config);

      (clientContext.state as any).phase = 'reading';
      await effect(clientContext);

      vi.advanceTimersByTime(1000);

      (clientContext.state as any).phase = 'answering';
      await effect(clientContext);

      vi.advanceTimersByTime(1000);

      expect(mockDispatch).not.toHaveBeenCalledWith({ type: 'START_ANSWERING' });
    });

    it('should start new timer when phase changes', async () => {
      const effect = createSubPhaseTimerEffect(config);

      (clientContext.state as any).phase = 'reading';
      await effect(clientContext);

      (clientContext.state as any).phase = 'answering';
      const result = await effect(clientContext);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('SUB_PHASE_TIMER_STARTED');
      expect((result as any)?.payload.phase).toBe('answering');
    });

    it('should handle dynamic duration based on state', async () => {
      (clientContext.state as any).settings.duration = 10;
      (clientContext.state as any).phase = 'answering';

      const effect = createSubPhaseTimerEffect(config);
      const result = await effect(clientContext);

      expect((result as any)?.payload.endsAt - Date.now()).toBe(10000);
    });

    it('should clear timer when phase becomes null', async () => {
      const effect = createSubPhaseTimerEffect(config);

      (clientContext.state as any).phase = 'reading';
      await effect(clientContext);

      (clientContext.state as any).phase = null;
      const result = await effect(clientContext);

      expect(result).toBeNull();

      vi.advanceTimersByTime(5000);
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('should handle multiple rapid phase changes', async () => {
      const effect = createSubPhaseTimerEffect(config);

      (clientContext.state as any).phase = 'reading';
      await effect(clientContext);

      (clientContext.state as any).phase = 'answering';
      await effect(clientContext);

      (clientContext.state as any).phase = 'reading';
      await effect(clientContext);

      vi.advanceTimersByTime(2000);

      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'START_ANSWERING' });
    });
  });

  describe('server Mode (Durable Object)', () => {
    it('should return null when no phase is active', async () => {
      const effect = createSubPhaseTimerEffect(config);
      const result = await effect(serverContext);

      expect(result).toBeNull();
      expect(mockStorage.deleteAlarm).toHaveBeenCalled();
    });

    it('should store action and set alarm when entering a new phase', async () => {
      const effect = createSubPhaseTimerEffect(config);
      (serverContext.state as any).phase = 'reading';

      const result = await effect(serverContext);

      expect(result).not.toBeNull();
      expect(mockStorage.put).toHaveBeenCalledWith('sub_phase_pending_action', 'START_ANSWERING');
      expect(mockStorage.setAlarm).toHaveBeenCalled();
      const alarmTime = mockStorage.setAlarm.mock.calls[0][0];
      expect(alarmTime).toBeGreaterThan(Date.now());
      expect(alarmTime).toBeLessThanOrEqual(Date.now() + 2000 + 100);
    });

    it('should not set alarm for the same phase', async () => {
      const effect = createSubPhaseTimerEffect(config);
      (serverContext.state as any).phase = 'reading';

      await effect(serverContext);
      expect(mockStorage.setAlarm).toHaveBeenCalledTimes(1);

      await effect(serverContext);
      expect(mockStorage.setAlarm).toHaveBeenCalledTimes(1);
    });

    it('should update alarm when phase changes', async () => {
      const effect = createSubPhaseTimerEffect(config);

      (serverContext.state as any).phase = 'reading';
      await effect(serverContext);
      expect(mockStorage.setAlarm).toHaveBeenCalledTimes(1);

      (serverContext.state as any).phase = 'answering';
      await effect(serverContext);
      expect(mockStorage.setAlarm).toHaveBeenCalledTimes(2);
      expect(mockStorage.put).toHaveBeenLastCalledWith('sub_phase_pending_action', 'TIMES_UP');
    });

    it('should delete alarm when phase becomes null', async () => {
      const effect = createSubPhaseTimerEffect(config);

      (serverContext.state as any).phase = 'reading';
      await effect(serverContext);

      (serverContext.state as any).phase = null;
      await effect(serverContext);

      expect(mockStorage.deleteAlarm).toHaveBeenCalled();
    });

    it('should handle unknown phase gracefully', async () => {
      const effect = createSubPhaseTimerEffect(config);
      (serverContext.state as any).phase = 'unknown-phase';

      const result = await effect(serverContext);

      expect(result).toBeNull();
      expect(mockStorage.setAlarm).not.toHaveBeenCalled();
    });

    it('should calculate correct alarm time based on state', async () => {
      (serverContext.state as any).settings.duration = 10;
      (serverContext.state as any).phase = 'answering';

      const effect = createSubPhaseTimerEffect(config);
      await effect(serverContext);

      const alarmTime = mockStorage.setAlarm.mock.calls[0][0];
      const expectedTime = Date.now() + 10000;
      expect(alarmTime).toBeGreaterThanOrEqual(expectedTime - 100);
      expect(alarmTime).toBeLessThanOrEqual(expectedTime + 100);
    });

    it('should persist correct action type for each phase', async () => {
      const effect = createSubPhaseTimerEffect(config);

      (serverContext.state as any).phase = 'reading';
      await effect(serverContext);
      expect(mockStorage.put).toHaveBeenCalledWith('sub_phase_pending_action', 'START_ANSWERING');

      (serverContext.state as any).phase = 'answering';
      await effect(serverContext);
      expect(mockStorage.put).toHaveBeenCalledWith('sub_phase_pending_action', 'TIMES_UP');
    });
  });

  describe('edge Cases', () => {
    it('should handle phase config with canSkip', async () => {
      const configWithSkip: SubPhaseConfig<any> = {
        phases: [
          {
            id: 'reading',
            duration: () => 2000,
            onComplete: 'START_ANSWERING',
            canSkip: state => state.settings.duration === 0,
          },
        ],
        getCurrentPhase: state => state.phase,
      };

      const effect = createSubPhaseTimerEffect(configWithSkip);
      (clientContext.state as any).phase = 'reading';

      const result = await effect(clientContext);
      expect(result).not.toBeNull();
    });

    it('should handle zero duration', async () => {
      const zeroConfig: SubPhaseConfig<any> = {
        phases: [
          {
            id: 'instant',
            duration: () => 0,
            onComplete: 'NEXT_PHASE',
          },
        ],
        getCurrentPhase: state => state.phase,
      };

      const effect = createSubPhaseTimerEffect(zeroConfig);
      (clientContext.state as any).phase = 'instant';

      const result = await effect(clientContext);
      expect((result as any)?.payload.endsAt).toBe(Date.now());
    });

    it('should handle very long duration', async () => {
      const longConfig: SubPhaseConfig<any> = {
        phases: [
          {
            id: 'long',
            duration: () => 24 * 60 * 60 * 1000,
            onComplete: 'NEXT_DAY',
          },
        ],
        getCurrentPhase: state => state.phase,
      };

      const effect = createSubPhaseTimerEffect(longConfig);
      (clientContext.state as any).phase = 'long';

      const result = await effect(clientContext);
      expect((result as any)?.payload.endsAt - Date.now()).toBe(24 * 60 * 60 * 1000);
    });

    it('should handle rapid successive calls', async () => {
      const effect = createSubPhaseTimerEffect(config);

      const results = await Promise.all([
        effect(clientContext),
        effect(clientContext),
        effect(clientContext),
      ]);

      const nonNullResults = results.filter(r => r !== null);
      expect(nonNullResults.length).toBeLessThanOrEqual(1);
    });

    it('should maintain separate state for different effect instances', async () => {
      const effect1 = createSubPhaseTimerEffect(config);
      const effect2 = createSubPhaseTimerEffect(config);

      (clientContext.state as any).phase = 'reading';

      const result1 = await effect1(clientContext);
      const result2 = await effect2(clientContext);

      expect(result1).not.toBeNull();
      expect(result2).not.toBeNull();
    });

    it('should handle missing dispatch gracefully', async () => {
      const effect = createSubPhaseTimerEffect(config);
      (clientContext.state as any).phase = 'reading';
      clientContext.dispatch = undefined;

      await effect(clientContext);

      vi.advanceTimersByTime(2000);
    });

    it('should handle storage errors gracefully', async () => {
      mockStorage.setAlarm.mockRejectedValue(new Error('Storage error'));

      const effect = createSubPhaseTimerEffect(config);
      (serverContext.state as any).phase = 'reading';

      await expect(effect(serverContext)).rejects.toThrow('Storage error');
    });
  });

  describe('cross-Mode Consistency', () => {
    it('should return same action type in both modes', async () => {
      const clientEffect = createSubPhaseTimerEffect(config);
      const serverEffect = createSubPhaseTimerEffect(config);

      (clientContext.state as any).phase = 'reading';
      (serverContext.state as any).phase = 'reading';

      const clientResult = await clientEffect(clientContext);
      const serverResult = await serverEffect(serverContext);

      expect(clientResult?.type).toBe(serverResult?.type);
      expect((clientResult as any)?.payload.phase).toBe((serverResult as any)?.payload.phase);
    });

    it('should calculate same duration in both modes', async () => {
      const clientEffect = createSubPhaseTimerEffect(config);
      const serverEffect = createSubPhaseTimerEffect(config);

      (clientContext.state as any).phase = 'answering';
      (clientContext.state as any).settings.duration = 7;
      (serverContext.state as any).phase = 'answering';
      (serverContext.state as any).settings.duration = 7;

      const beforeTime = Date.now();
      const clientResult = await clientEffect(clientContext);
      const serverResult = await serverEffect(serverContext);

      const clientDuration = ((clientResult as any)?.payload.endsAt || 0) - beforeTime;
      const serverDuration = ((serverResult as any)?.payload.endsAt || 0) - beforeTime;

      expect(clientDuration).toBe(serverDuration);
    });
  });
});
