/**
 * Discriminated union for all sports list types
 * This makes it impossible to have invalid states
 */
export type SportsListId
  = | { type: 'region'; regionName: string }
    | { type: 'league'; regionName: string; leagueId: string }
    | { type: 'country'; countryId: string }
    | { type: 'custom'; listSlug: string };

/**
 * Result of parsing a sports list ID string
 */
export type ParsedSportsListId
  = | { success: true; data: SportsListId }
    | { success: false; error: string };

/**
 * Configuration for list ID format
 * Change these constants to update the format everywhere
 */
const SEPARATORS = {
  MAIN: ':',
  LEAGUE_PREFIX: 'league',
} as const;

const PREFIXES = {
  REGION: 'region',
  COUNTRY: 'country',
  CUSTOM: 'custom',
} as const;

/**
 * Parse a sports list ID string into a type-safe structure
 * Returns a Result type to handle errors gracefully
 */
export function parseSportsListId(listId: string): ParsedSportsListId {
  if (!listId || typeof listId !== 'string') {
    return { success: false, error: 'Invalid list ID: empty or not a string' };
  }

  const parts = listId.split(SEPARATORS.MAIN);
  const prefix = parts[0];

  switch (prefix) {
    case PREFIXES.REGION: {
      if (parts.length < 2) {
        return { success: false, error: `Invalid region format: ${listId}` };
      }

      const regionName = parts[1];

      // Check if it's a league within a region
      if (parts.length >= 4 && parts[2] === SEPARATORS.LEAGUE_PREFIX) {
        return {
          success: true,
          data: {
            type: 'league',
            regionName,
            leagueId: parts[3],
          },
        };
      }

      // Just a region
      return {
        success: true,
        data: {
          type: 'region',
          regionName,
        },
      };
    }

    case PREFIXES.COUNTRY: {
      if (parts.length !== 2) {
        return { success: false, error: `Invalid country format: ${listId}` };
      }

      return {
        success: true,
        data: {
          type: 'country',
          countryId: parts[1],
        },
      };
    }

    case PREFIXES.CUSTOM: {
      if (parts.length !== 2) {
        return { success: false, error: `Invalid custom list format: ${listId}` };
      }

      return {
        success: true,
        data: {
          type: 'custom',
          listSlug: parts[1],
        },
      };
    }

    default:
      return { success: false, error: `Unknown list type: ${prefix}` };
  }
}

/**
 * Convert a structured SportsListId back to a string
 * This ensures consistency between parsing and serialization
 */
export function serializeSportsListId(listId: SportsListId): string {
  switch (listId.type) {
    case 'region':
      return `${PREFIXES.REGION}${SEPARATORS.MAIN}${listId.regionName}`;

    case 'league':
      return `${PREFIXES.REGION}${SEPARATORS.MAIN}${listId.regionName}${SEPARATORS.MAIN}${SEPARATORS.LEAGUE_PREFIX}${SEPARATORS.MAIN}${listId.leagueId}`;

    case 'country':
      return `${PREFIXES.COUNTRY}${SEPARATORS.MAIN}${listId.countryId}`;

    case 'custom':
      return `${PREFIXES.CUSTOM}${SEPARATORS.MAIN}${listId.listSlug}`;

    default:
    // TypeScript will catch this if we add a new type and forget to handle it
    { const _exhaustive: never = listId;
      throw new Error(`Unhandled list type: ${JSON.stringify(_exhaustive)}`); }
  }
}

/**
 * Type guard to check if a list ID is a region
 */
export function isRegionList(listId: SportsListId): listId is Extract<SportsListId, { type: 'region' }> {
  return listId.type === 'region';
}

/**
 * Type guard to check if a list ID is a league
 */
export function isLeagueList(listId: SportsListId): listId is Extract<SportsListId, { type: 'league' }> {
  return listId.type === 'league';
}

/**
 * Type guard to check if a list ID is a country
 */
export function isCountryList(listId: SportsListId): listId is Extract<SportsListId, { type: 'country' }> {
  return listId.type === 'country';
}

/**
 * Type guard to check if a list ID is a custom list
 */
export function isCustomList(listId: SportsListId): listId is Extract<SportsListId, { type: 'custom' }> {
  return listId.type === 'custom';
}

/**
 * Helper to safely parse and unwrap a list ID
 * Throws an error if parsing fails
 */
export function parseSportsListIdOrThrow(listId: string): SportsListId {
  const result = parseSportsListId(listId);
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.data;
}

/**
 * Helper to safely parse with a default fallback
 */
export function parseSportsListIdWithDefault(
  listId: string,
  defaultValue: SportsListId,
): SportsListId {
  const result = parseSportsListId(listId);
  return result.success ? result.data : defaultValue;
}

/**
 * Check if a string list ID is a region
 */
export function isRegionListString(listId: string): boolean {
  const parsed = parseSportsListId(listId);
  return parsed.success && parsed.data.type === 'region';
}

/**
 * Check if a string list ID is a league
 */
export function isLeagueListString(listId: string): boolean {
  const parsed = parseSportsListId(listId);
  return parsed.success && parsed.data.type === 'league';
}
