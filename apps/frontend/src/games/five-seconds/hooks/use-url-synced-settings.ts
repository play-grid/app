import { difficultySchema } from '@guess-logo/shared/schemas/five-seconds';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { useFiveSecondsStore } from '../stores/game-store';

const phaseSchema = z.enum(['lobby', 'playing', 'results']);

export function useUrlSyncedSettings() {
  const settings = useFiveSecondsStore(s => s.settings);
  const updateSettings = useFiveSecondsStore(s => s.updateSettings);
  const phase = useFiveSecondsStore(s => s.phase);
  const setPhase = useFiveSecondsStore(s => s.setPhase);

  const [searchParams, setSearchParams] = useSearchParams();
  const isInitializedRef = useRef(false);
  const isSyncingRef = useRef(false);

  // 🔹 ONE-TIME: Initialize store from URL on mount
  useEffect(() => {
    if (isInitializedRef.current)
      return;

    const difficulty = searchParams.get('difficulty');
    const categories = searchParams.get('categories');
    const phaseFromUrl = searchParams.get('phase');

    const parsedPhase = phaseSchema.safeParse(phaseFromUrl);
    if (parsedPhase.success && parsedPhase.data === 'lobby') {
      setPhase('lobby');
    }
    else if (phaseFromUrl) {
      // If phase is 'playing' or 'results', reset to lobby
      setPhase('lobby');
    }

    // Update settings from URL
    const settingsUpdate: Partial<typeof settings> = {};

    if (difficulty) {
      const parsedDifficulty = difficultySchema.safeParse(difficulty);
      if (parsedDifficulty.success) {
        settingsUpdate.difficulty = parsedDifficulty.data;
      }
    }

    if (categories) {
      const categoryIds = categories.split(',').filter(Boolean);
      if (categoryIds.length > 0) {
        settingsUpdate.categoryIds = categoryIds;
      }
    }

    if (Object.keys(settingsUpdate).length > 0) {
      updateSettings(settingsUpdate); // ✅ FIX: Use updateSettings
    }

    isInitializedRef.current = true;
  }, []); // Empty deps - only run once

  // 🔹 AFTER INIT: Sync store → URL
  useEffect(() => {
    if (!isInitializedRef.current || isSyncingRef.current)
      return;

    isSyncingRef.current = true;

    setSearchParams(
      {
        phase,
        difficulty: settings.difficulty,
        categories: settings.categoryIds.join(','),
      },
      { replace: true },
    );

    requestAnimationFrame(() => {
      isSyncingRef.current = false;
    });
  }, [phase, settings.difficulty, settings.categoryIds, setSearchParams]);
}
