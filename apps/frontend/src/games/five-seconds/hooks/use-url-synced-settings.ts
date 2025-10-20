import { difficultySchema } from '@guess-logo/shared/schemas/five-seconds';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFiveSecondsStore } from '../stores/game-store';

export function useUrlSyncedSettingsOnly() {
  const settings = useFiveSecondsStore(s => s.settings);
  const updateSettings = useFiveSecondsStore(s => s.updateSettings);

  const [searchParams, setSearchParams] = useSearchParams();
  const isInitializedRef = useRef(false);
  const isSyncingRef = useRef(false);

  // Initialize from URL
  useEffect(() => {
    if (isInitializedRef.current)
      return;

    const difficulty = searchParams.get('difficulty');
    const categories = searchParams.get('categories');

    const settingsUpdate: Partial<typeof settings> = {};

    if (difficulty) {
      const parsed = difficultySchema.safeParse(difficulty);
      if (parsed.success) {
        settingsUpdate.difficulty = parsed.data;
      }
    }

    if (categories) {
      const categoryIds = categories.split(',').filter(Boolean);
      if (categoryIds.length > 0) {
        settingsUpdate.categoryIds = categoryIds;
      }
    }

    if (Object.keys(settingsUpdate).length > 0) {
      updateSettings(settingsUpdate);
    }

    isInitializedRef.current = true;
  }, []);

  // Sync settings to URL (no phase)
  useEffect(() => {
    if (!isInitializedRef.current || isSyncingRef.current)
      return;

    isSyncingRef.current = true;

    setSearchParams(
      {
        difficulty: settings.difficulty,
        categories: settings.categoryIds.join(','),
      },
      { replace: true },
    );

    requestAnimationFrame(() => {
      isSyncingRef.current = false;
    });
  }, [settings.difficulty, settings.categoryIds, setSearchParams]);
}
