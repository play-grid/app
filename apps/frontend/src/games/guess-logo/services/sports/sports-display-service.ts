// sports-display-service.ts
// Handles all display logic for sports lists
// Decouples UI concerns from data structures

import type { SupportedLanguage } from '@guess-logo/shared/types';
import type { SportsListId } from '../../types/sports-list-types';
import type { CustomSportList, SportCountry, SportLeague, SportRegion } from './sports-service';

/**
 * Context needed for display operations
 */
export interface SportsDisplayContext {
  regions: SportRegion[];
  leagues: SportLeague[];
  countries: SportCountry[];
  customLists: CustomSportList[];
  language: SupportedLanguage;
}

/**
 * Result of getting display text
 */
export interface DisplayTextResult {
  text: string;
  icon?: string;
}

/**
 * Get display text for a sports list ID
 * All UI logic is centralized here
 */
export function getSportsListDisplayText(
  listId: SportsListId,
  context: SportsDisplayContext,
  fallbackText: string = 'Select a list',
): DisplayTextResult {
  switch (listId.type) {
    case 'region': {
      const region = context.regions.find((r) => {
        // Compare using the region name from the ID structure
        const regionName = r.name[context.language] || r.name.en;
        return regionName.toLowerCase() === listId.regionName.toLowerCase();
      });

      if (!region) {
        return { text: fallbackText };
      }

      const regionName = region.name[context.language] || region.name.en;
      return {
        text: regionName,
        icon: '🌐',
      };
    }

    case 'league': {
      const league = context.leagues.find(l => l.id === listId.leagueId);

      if (!league) {
        return { text: fallbackText };
      }

      const leagueName = league.name[context.language] || league.name.en;
      return {
        text: leagueName,
        icon: '🏆',
      };
    }

    case 'country': {
      const country = context.countries.find(c => c.id === listId.countryId);

      if (!country) {
        return { text: fallbackText };
      }

      const countryName = country.name[context.language] || country.name.en;
      return {
        text: countryName,
        icon: country.flag,
      };
    }

    case 'custom': {
      const customList = context.customLists.find(l => l.slug === listId.listSlug);

      if (!customList) {
        return { text: fallbackText };
      }

      return {
        text: customList.name,
        icon: '⭐',
      };
    }

    default: {
      const _exhaustive: never = listId;
      return { text: fallbackText };
    }
  }
}

/**
 * Get a combined display string with icon
 */
export function getSportsListDisplayString(
  listId: SportsListId,
  context: SportsDisplayContext,
  fallbackText?: string,
): string {
  const { text, icon } = getSportsListDisplayText(listId, context, fallbackText);
  return icon ? `${icon} ${text}` : text;
}

/**
 * Check if a list supports nested navigation (e.g., regions have leagues)
 */
export function supportsNestedNavigation(listId: SportsListId): boolean {
  return listId.type === 'region';
}

/**
 * Get the parent list ID if this is a nested list
 */
export function getParentListId(listId: SportsListId): SportsListId | null {
  if (listId.type === 'league') {
    return { type: 'region', regionName: listId.regionName };
  }
  return null;
}

/**
 * Get breadcrumb trail for a list ID
 */
export function getBreadcrumbs(
  listId: SportsListId,
  context: SportsDisplayContext,
): DisplayTextResult[] {
  const breadcrumbs: DisplayTextResult[] = [];

  if (listId.type === 'league') {
    // Add region breadcrumb
    const regionId: SportsListId = { type: 'region', regionName: listId.regionName };
    breadcrumbs.push(getSportsListDisplayText(regionId, context));
  }

  // Add current item
  breadcrumbs.push(getSportsListDisplayText(listId, context));

  return breadcrumbs;
}
