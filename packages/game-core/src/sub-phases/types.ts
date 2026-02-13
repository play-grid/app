import { z } from 'zod';

/**
 * Definition of a single sub-phase
 */
export interface SubPhaseDefinition<TState> {
  id: string;
  duration: (state: TState) => number;
  onComplete: string;
  canSkip?: (state: TState) => boolean;
}

/**
 * Complete sub-phase configuration for a game
 */
export interface SubPhaseConfig<TState> {
  phases: SubPhaseDefinition<TState>[];
  getCurrentPhase: (state: TState) => string | null;
}

/**
 * Zod schema for validating sub-phase configuration
 */
export function createSubPhaseConfigSchema<TPhase extends string>(
  validPhases: readonly TPhase[],
) {
  return z.object({
    phases: z.array(
      z.object({
        id: z.enum(validPhases as any),
        duration: z.function(),
        onComplete: z.string(),
        canSkip: z.function().optional(),
      }),
    ),
    getCurrentPhase: z.function(),
  });
}

/**
 * Type-safe helper to create sub-phase config
 */
export function createSubPhaseConfig<TState, TPhase extends string>(
  config: SubPhaseConfig<TState>,
  _validPhases: readonly TPhase[],
): SubPhaseConfig<TState> {
  return config;
}
