// use-sports-selection.ts
// Custom hook to manage sports list selection state
// Avoids ESLint warnings about setState in useEffect

import type { SportsListId } from '../types/sports-list-types';
import { useCallback, useMemo, useState } from 'react';
import { parseSportsListId, serializeSportsListId } from '../types/sports-list-types';

type SelectionType = 'region' | 'country' | 'custom';

interface SportsSelectionState {
  type: SelectionType;
  regionName: string;
  countryId: string;
  customSlug: string;
  leagueId: string;
}

export function useSportsSelection(selectedListId: string) {
  // Parse the current selection from the prop
  const currentSelection = useMemo(() => {
    const parsed = parseSportsListId(selectedListId);
    return parsed.success ? parsed.data : null;
  }, [selectedListId]);

  // Derive state from the parsed selection
  const derivedState = useMemo((): SportsSelectionState => {
    if (!currentSelection) {
      return {
        type: 'region',
        regionName: '',
        countryId: '',
        customSlug: '',
        leagueId: '',
      };
    }

    switch (currentSelection.type) {
      case 'region':
        return {
          type: 'region',
          regionName: currentSelection.regionName,
          countryId: '',
          customSlug: '',
          leagueId: '',
        };
      case 'league':
        return {
          type: 'region',
          regionName: currentSelection.regionName,
          countryId: '',
          customSlug: '',
          leagueId: currentSelection.leagueId,
        };
      case 'country':
        return {
          type: 'country',
          regionName: '',
          countryId: currentSelection.countryId,
          customSlug: '',
          leagueId: '',
        };
      case 'custom':
        return {
          type: 'custom',
          regionName: '',
          countryId: '',
          customSlug: currentSelection.listSlug,
          leagueId: '',
        };
      default:
        return {
          type: 'region',
          regionName: '',
          countryId: '',
          customSlug: '',
          leagueId: '',
        };
    }
  }, [currentSelection]);

  // Local override state (only used when user makes changes before they're committed)
  const [localOverride, setLocalOverride] = useState<SportsSelectionState | null>(null);

  // Use local override if available, otherwise use derived state
  const state = localOverride ?? derivedState;

  // Helper to create list IDs
  const createListId = useCallback((newState: Partial<SportsSelectionState>): string => {
    const mergedState = { ...state, ...newState };

    let listId: SportsListId;

    switch (mergedState.type) {
      case 'region':
        if (mergedState.leagueId) {
          listId = {
            type: 'league',
            regionName: mergedState.regionName,
            leagueId: mergedState.leagueId,
          };
        }
        else {
          listId = {
            type: 'region',
            regionName: mergedState.regionName,
          };
        }
        break;
      case 'country':
        listId = {
          type: 'country',
          countryId: mergedState.countryId,
        };
        break;
      case 'custom':
        listId = {
          type: 'custom',
          listSlug: mergedState.customSlug,
        };
        break;
      default:
        throw new Error(`Unknown selection type: ${mergedState.type}`);
    }

    return serializeSportsListId(listId);
  }, [state]);

  // Clear local override when selectedListId changes
  // This means the parent has accepted our change
  const clearOverride = useCallback(() => {
    setLocalOverride(null);
  }, []);

  return {
    state,
    currentSelection,
    setLocalOverride,
    clearOverride,
    createListId,
  };
}
